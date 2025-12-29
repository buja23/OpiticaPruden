import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const mpAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!;
const siteUrl = Deno.env.get('SITE_URL');

serve(async (req) => {
  // Lida com a requisição CORS preflight. O navegador envia uma requisição OPTIONS
  // antes da requisição POST para verificar se o servidor permite a conexão.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  // Validação movida para dentro do handler para garantir que o preflight sempre funcione.
  if (!siteUrl) {
    return new Response(JSON.stringify({ error: "Configuração do servidor incompleta: A variável de ambiente SITE_URL está ausente." }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const { items, metadata } = await req.json();

    if (!items || items.length === 0) {
      throw new Error("A lista de itens não pode estar vazia.");
    }
    if (!metadata?.user_id || !metadata?.address_id || !metadata?.payer) {
      throw new Error("Metadados do usuário ou endereço ausentes.");
    }

    // Ordena os itens para garantir um hash consistente
    const sortedItems = [...items].sort((a, b) => a.id.localeCompare(b.id));
    // Cria um hash simples do carrinho (ID e quantidade) para detectar mudanças
    const cartHash = JSON.stringify(sortedItems.map(item => ({ id: item.id, q: item.quantity })));

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Chamar a nova RPC que decide se cria um novo pedido ou reutiliza um existente
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_or_create_checkout_session', {
        user_id_in: metadata.user_id,
        address_id_in: metadata.address_id,
        items_in: items.map((item: any) => ({
          id: parseInt(item.id, 10),
          quantity: item.quantity
        })),
        cart_hash_in: cartHash
      });

    if (rpcError) {
      throw new Error(`Falha ao processar o pedido: ${rpcError.message}`);
    }

    // 2. Verifica a resposta da RPC
    // 2a. Se um 'preference_id' foi retornado, um pedido idêntico já existia. Reutilize-o.
    if (rpcData.preference_id) {
      console.log(`Reutilizando sessão de checkout para a preferência: ${rpcData.preference_id}`);
      // Busca a preferência existente para obter a URL de pagamento (init_point)
      const prefResponse = await fetch(`https://api.mercadopago.com/checkout/preferences/${rpcData.preference_id}`, {
        headers: { 'Authorization': `Bearer ${mpAccessToken}` },
      });
      if (!prefResponse.ok) throw new Error('Não foi possível recuperar a sessão de pagamento anterior.');
      const existingPreference = await prefResponse.json();
      return new Response(JSON.stringify({ init_point: existingPreference.init_point }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // 2b. Se não, um novo pedido foi criado. Prossiga para criar uma nova preferência no MP.
    const { order_id, mp_items } = rpcData;
    if (!order_id || !mp_items) {
      throw new Error("A resposta da criação do pedido foi inválida.");
    }

    // 3. Criar a preferência de pagamento no Mercado Pago
    const preferenceResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mpAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: mp_items,
        payer: metadata.payer,
        external_reference: order_id.toString(),
        back_urls: {
          success: `${siteUrl}/success`,
          failure: `${siteUrl}/failure`,
        },
        auto_return: 'approved',
        // Habilita todos os métodos de pagamento disponíveis para a sua conta.
        payment_methods: {
          excluded_payment_types: [], // Array vazio significa que nada é excluído.
          installments: 12, // Permite parcelamento em até 12x
        },
        notification_url: `${supabaseUrl}/functions/v1/mercado-pago-webhook`,
      }),
    });

    if (!preferenceResponse.ok) {
      const errorBody = await preferenceResponse.text();
      console.error('Erro ao criar preferência no Mercado Pago:', errorBody);
      // Se a criação da preferência falhar, cancela o pedido recém-criado.
      await supabase.rpc('cancel_order_and_restock', { order_id_in: order_id });
      throw new Error('Falha ao comunicar com o Mercado Pago.');
    }

    const preference = await preferenceResponse.json();
    const newPreferenceId = preference.id;
    const initPoint = preference.init_point;

    // 4. CRUCIAL: Salva o novo ID da preferência no pedido recém-criado
    const { error: updateError } = await supabase
      .from('orders')
      .update({ mp_preference_id: newPreferenceId })
      .eq('id', order_id);

    if (updateError) {
      // Isso é um estado inconsistente. O pagamento foi criado, mas não conseguimos associá-lo.
      // O webhook ainda deve funcionar, mas é bom logar isso.
      console.error(`CRÍTICO: Falha ao salvar preference_id '${newPreferenceId}' no pedido '${order_id}'. Erro: ${updateError.message}`);
    }

    // 5. Retornar a URL de checkout para o cliente
    return new Response(JSON.stringify({ init_point: initPoint }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Erro na função create-preference:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});