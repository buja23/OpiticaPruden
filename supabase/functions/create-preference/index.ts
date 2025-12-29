import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const mpAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!;
const siteUrl = Deno.env.get('SITE_URL');

serve(async (req) => {
  // 1. Preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // 2. Validação de Configuração
  if (!siteUrl) {
    console.error("Erro CRÍTICO: SITE_URL não definida nos Secrets.");
    return new Response(JSON.stringify({
      error: "Configuração do servidor incompleta. Avise o administrador."
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const { items, metadata } = await req.json();

    if (!items || items.length === 0) {
      throw new Error("Carrinho vazio.");
    }
    if (!metadata?.user_id || !metadata?.address_id) {
      throw new Error("Dados do usuário incompletos.");
    }

    // 3. Cria Hash para evitar duplicidade
    const sortedItems = [...items].sort((a: any, b: any) => a.id.localeCompare(b.id));
    const cartHash = JSON.stringify(sortedItems.map((item: any) => ({ id: item.id, q: item.quantity })));

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 4. DATABASE: Cria Pedido e BAIXA ESTOQUE (Reserva)
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
      // Se der erro aqui (ex: "Estoque insuficiente"), devolvemos o erro para o frontend
      throw new Error(rpcError.message);
    }

    // 5. Verifica se recuperou um link antigo
    if (rpcData.preference_id) {
      console.log(`♻️ Recuperando sessão existente: ${rpcData.preference_id}`);
      const prefResponse = await fetch(`https://api.mercadopago.com/checkout/preferences/${rpcData.preference_id}`, {
        headers: { 'Authorization': `Bearer ${mpAccessToken}` },
      });

      if (prefResponse.ok) {
        const existingPreference = await prefResponse.json();
        return new Response(JSON.stringify({ init_point: existingPreference.init_point }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      // Se falhar ao buscar a antiga, continua para criar uma nova...
    }

    const { order_id, mp_items } = rpcData;

    // 6. MERCADO PAGO: Cria a Preferência
    // Usamos o external_reference para ligar o Pagamento ao Pedido
    console.log('🔗 URL de Retorno configurada:', `${siteUrl}/success`);

    const preferenceResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mpAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: mp_items,
        payer: metadata.payer,
        external_reference: order_id.toString(), // <--- VITAL PARA O WEBHOOK
        back_urls: {
          success: `${siteUrl}/success`,
          failure: `${siteUrl}/failure`,
          pending: `${siteUrl}/success` // Pendente enviamos para sucesso com aviso
        },
        auto_return: 'approved',
        payment_methods: {
          // 1. Não excluímos nada (lista vazia), aceitando Boleto, Cartão, Pix, etc.
          excluded_payment_methods: [],
          excluded_payment_types: [],

          // 2. Permitimos parcelamento em até 12x (padrão do mercado)
          installments: 12,

          // 3. Define que, se ninguém escolher nada, o parcelamento padrão é à vista (1x)
          default_payment_method_id: "pix",
        },
        notification_url: `${supabaseUrl}/functions/v1/mercado-pago-webhook`,
      }),
    });

    // 7. TRATAMENTO DE ERRO CRÍTICO (Rollback)
    if (!preferenceResponse.ok) {
      const errorBody = await preferenceResponse.text();
      console.error('❌ Erro no Mercado Pago:', errorBody);

      // IMPORTANTE: Como já reservamos o estoque no passo 4,
      // se o MP falhar, temos que DEVOLVER o estoque imediatamente.
      await supabase.rpc('cancel_order_and_restock', { order_id_in: order_id });

      throw new Error('Erro ao comunicar com o gateway de pagamento.');
    }

    const preference = await preferenceResponse.json();

    // 8. Salva o ID da preferência no banco (para evitar duplicidade futura)
    await supabase
      .from('orders')
      .update({ mp_preference_id: preference.id })
      .eq('id', order_id);

    // 9. Sucesso!
    return new Response(JSON.stringify({ init_point: preference.init_point }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('🚨 Erro Geral:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400, // Bad Request
    });
  }
});