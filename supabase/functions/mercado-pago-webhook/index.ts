import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const mpAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const notification = await req.json();
    console.log('Webhook do Mercado Pago recebido:', notification);

    if (notification.type === 'payment' && notification.data?.id) {
      const paymentId = notification.data.id;
      console.log(`Processando notificação para o pagamento ID: ${paymentId}`);

      // Busca os detalhes do pagamento na API do Mercado Pago
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${mpAccessToken}`,
        },
      });

      if (!mpResponse.ok) {
        throw new Error(`Erro ao buscar dados do pagamento no MP: ${mpResponse.statusText}`);
      }

      const payment = await mpResponse.json();
      const orderId = payment.external_reference;
      const paymentStatus = payment.status; // ex: "approved", "rejected"

      if (!orderId) {
        throw new Error(`ID do pedido (external_reference) não encontrado no pagamento ${paymentId}`);
      }

      if (paymentStatus === 'approved') {
        console.log(`Atualizando pedido #${orderId} para o status: ${paymentStatus}`);
        // Apenas atualiza o status e adiciona o ID do pagamento do MP
        const { error } = await supabase
          .from('orders')
          .update({ status: paymentStatus, mercado_pago_payment_id: paymentId.toString() })
          .eq('id', parseInt(orderId));
        if (error) throw new Error(`Erro ao ATUALIZAR o pedido #${orderId}: ${error.message}`);
      } else if (['rejected', 'cancelled', 'refunded'].includes(paymentStatus)) {
        console.log(`Pagamento para o pedido #${orderId} foi ${paymentStatus}. Cancelando e devolvendo estoque.`);
        // Se o pagamento falhou ou foi cancelado, chama a RPC para cancelar o pedido e devolver o estoque
        const { error: rpcError } = await supabase.rpc('cancel_order_and_restock', { order_id_in: parseInt(orderId) });
        if (rpcError) throw new Error(`Erro ao CANCELAR o pedido #${orderId} via RPC: ${rpcError.message}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error('Erro no webhook do Mercado Pago:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
