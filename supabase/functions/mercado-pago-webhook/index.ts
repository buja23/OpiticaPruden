import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Cliente Supabase com permissões de admin (Service Role) para poder escrever nas tabelas
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    const url = new URL(req.url);
    // O Mercado Pago envia o ID e o tópico na query string ou no corpo
    // Ex: ?id=12345&topic=payment
    const topic = url.searchParams.get('topic') || url.searchParams.get('type');
    const id = url.searchParams.get('id') || url.searchParams.get('data.id');

    console.log(`Webhook recebido: Tópico=${topic}, ID=${id}`);

    if (topic === 'payment' && id) {
      // 1. Buscar detalhes do pagamento no Mercado Pago
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!mpResponse.ok) {
        throw new Error('Falha ao buscar dados do pagamento no Mercado Pago');
      }

      const paymentData = await mpResponse.json();
      console.log('Status do pagamento:', paymentData.status);

      // 2. Se o pagamento foi aprovado, salvar no banco
      if (paymentData.status === 'approved') {
        const metadata = paymentData.metadata;
        
        // Verifica se já existe esse pedido para evitar duplicidade
        const { data: existingOrder } = await supabase
          .from('orders')
          .select('id')
          .eq('mercado_pago_payment_id', id)
          .single();

        if (existingOrder) {
          console.log('Pedido já registrado anteriormente.');
          return new Response(JSON.stringify({ message: 'Already processed' }), { status: 200 });
        }

        // Inserir Pedido
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: metadata.user_id, // Vem do metadata que configuramos no create-preference
            address_id: metadata.address_id,
            status: 'approved',
            total_amount: paymentData.transaction_amount,
            mercado_pago_payment_id: id
          })
          .select()
          .single();

        if (orderError) throw orderError;

        console.log('Pedido criado com sucesso:', order.id);

        // Inserir Itens do Pedido
        // O Mercado Pago retorna os itens em `additional_info.items`
        const items = paymentData.additional_info?.items || [];
        
        if (items.length > 0) {
          const orderItems = items.map((item: any) => ({
            order_id: order.id,
            product_id: parseInt(item.id), // Assumindo que o ID do produto foi passado como string
            quantity: parseInt(item.quantity),
            unit_price: parseFloat(item.unit_price)
          }));

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

          if (itemsError) throw itemsError;
          console.log('Itens do pedido salvos com sucesso.');
        }
      }
    }

    return new Response(JSON.stringify({ message: 'Webhook received' }), { status: 200 });
  } catch (error) {
    console.error('Erro no Webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
