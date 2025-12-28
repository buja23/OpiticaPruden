import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('ERRO: Variáveis de ambiente do Supabase não definidas.');
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

serve(async (req) => {
  console.log('Iniciando limpeza de pedidos expirados...');

  try {
    // 1. Calcular a data limite (agora - 12 horas)
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();

    // 2. Buscar pedidos que ainda estão 'pending' e foram criados antes do limite
    const { data: expiredOrders, error: fetchError } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        created_at,
        order_items (
          product_id,
          quantity
        )
      `)
      .eq('status', 'pending')
      .lt('created_at', twelveHoursAgo);

    if (fetchError) throw fetchError;

    if (!expiredOrders || expiredOrders.length === 0) {
      console.log('Nenhum pedido expirado encontrado.');
      return new Response(JSON.stringify({ message: 'Nenhum pedido expirado.' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`Encontrados ${expiredOrders.length} pedidos expirados.`);
    const results = [];

    // 3. Processar cada pedido
    for (const order of expiredOrders as { id: number }[]) {
      // Chama a RPC para cancelar o pedido e devolver o estoque de forma atômica.
      // A RPC já verifica se o status é 'pending', então é seguro chamar.
      const { error: rpcError } = await supabase.rpc('cancel_order_and_restock', {
        order_id_in: order.id,
      });

      if (rpcError) {
        console.error(`Erro ao cancelar pedido #${order.id} via RPC:`, rpcError);
        results.push(`Falha ao processar pedido #${order.id}.`);
      } else {
        console.log(`Pedido #${order.id} cancelado e estoque devolvido com sucesso.`);
        results.push(`Pedido #${order.id} cancelado e estoque devolvido.`);
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na limpeza:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
