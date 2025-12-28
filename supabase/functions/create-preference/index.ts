import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const mpAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!;

serve(async (req) => {
  // Trata a requisição CORS preflight
  if (req.method !== 'POST') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { items, metadata } = await req.json();

    if (!items || items.length === 0) {
      throw new Error("A lista de itens não pode estar vazia.");
    }
    if (!metadata?.user_id || !metadata?.address_id) {
      throw new Error("Metadados do usuário ou endereço ausentes.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Chamar a RPC para criar o pedido e decrementar o estoque de forma segura
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('create_order_and_decrement_stock', {
        user_id_in: metadata.user_id,
        address_id_in: metadata.address_id,
        // Passamos apenas ID e quantidade para a RPC, que buscará o preço no DB
        items_in: items.map((item: any) => ({
          id: item.id,
          quantity: item.quantity
        }))
      });

    if (rpcError) {
      // Se a RPC falhar (ex: estoque insuficiente), o erro será lançado aqui
      throw new Error(`Falha ao criar o pedido: ${rpcError.message}`);
    }

    const { order_id, mp_items } = rpcData;
    if (!order_id || !mp_items) {
      throw new Error("A resposta da criação do pedido foi inválida.");
    }

    // 2. Criar a preferência de pagamento no Mercado Pago
    const preferenceResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mpAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Usando o payload de itens seguro retornado pela função do banco de dados
        items: mp_items,
        external_reference: order_id.toString(), // Usar o ID do pedido do nosso banco
        back_urls: {
          success: `${Deno.env.get('SITE_URL') || 'http://localhost:5173'}/success`,
          failure: `${Deno.env.get('SITE_URL') || 'http://localhost:5173'}/failure`,
        },
        auto_return: 'approved',
        // A URL do webhook é configurada no painel do MP, mas é bom ter aqui como fallback
        notification_url: `${supabaseUrl}/functions/v1/mercado-pago-webhook`,
      }),
    });

    if (!preferenceResponse.ok) {
      const errorBody = await preferenceResponse.text();
      console.error('Erro ao criar preferência no Mercado Pago:', errorBody);
      // Se a criação da preferência falhar, precisamos reverter o pedido e o estoque.
      await supabase.rpc('cancel_order_and_restock', { order_id_in: order_id });
      throw new Error('Falha ao comunicar com o Mercado Pago.');
    }

    const preference = await preferenceResponse.json();

    // 3. Retornar o ID da preferência para o cliente
    return new Response(JSON.stringify({ id: preference.id }), {
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