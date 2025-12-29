import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    const url = new URL(req.url);
    // O Mercado Pago manda o ID do pagamento na URL (?id=...) ou no corpo (data.id)
    // Vamos ler o corpo primeiro
    const body = await req.json().catch(() => ({}));
    
    // Identifica o ID do pagamento e o Tópico
    const paymentId = body.data?.id || url.searchParams.get("data.id") || url.searchParams.get("id");
    const type = body.type || url.searchParams.get("type");

    // Só nos interessa se for atualização de pagamento
    if (type === "payment" && paymentId) {
      console.log(`🔔 Recebido aviso de pagamento: ${paymentId}`);

      // 1. Consultar a API do Mercado Pago para confirmar o status real
      // (Nunca confie apenas no que vem no body, consulte a fonte oficial)
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          "Authorization": `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        },
      });

      if (!mpResponse.ok) {
        throw new Error("Erro ao consultar Mercado Pago");
      }

      const paymentData = await mpResponse.json();
      
      // 2. Extrair informações cruciais
      const status = paymentData.status; // approved, pending, rejected
      const externalReference = paymentData.external_reference; // AQUI DEVE ESTAR O ID DO SEU PEDIDO (orders.id)

      console.log(`📦 Pedido ID: ${externalReference} | Status MP: ${status}`);

      if (externalReference) {
        // 3. Atualizar o status no Banco de Dados
        let newStatus = 'pending';
        if (status === 'approved') newStatus = 'paid';
        if (status === 'rejected' || status === 'cancelled') newStatus = 'cancelled';
        if (status === 'in_process') newStatus = 'pending';

        const { error } = await supabase
          .from("orders")
          .update({ 
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq("id", externalReference); // Atualiza pelo ID do pedido

        if (error) {
          console.error("❌ Erro ao atualizar pedido no Supabase:", error);
          return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }
        
        console.log("✅ Pedido atualizado com sucesso!");
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (error) {
    console.error("Erro no Webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
});