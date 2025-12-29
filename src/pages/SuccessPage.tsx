import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { supabase } from '../lib/supabase';

export default function SuccessPage() {
  const { clearCart, fetchProducts } = useStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Pegamos o ID do pedido na URL (external_reference)
  const orderId = searchParams.get('external_reference');
  const paymentId = searchParams.get('payment_id');
  
  // Estado para guardar o status REAL vindo do banco
  const [realStatus, setRealStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const effectRan = useRef(false);

  useEffect(() => {
    async function checkRealStatus() {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        // 1. Pergunta ao Supabase como está o pedido AGORA
        const { data, error } = await supabase
          .from('orders')
          .select('status')
          .eq('id', orderId)
          .single();

        if (data) {
          console.log("Status REAL no banco:", data.status);
          setRealStatus(data.status);
          
          // 2. Se o banco disser que está pago, limpamos o carrinho
          if (data.status === 'paid' || data.status === 'approved') {
            if (!effectRan.current) {
              await clearCart();
              await fetchProducts();
              effectRan.current = true;
            }
          }
        }
      } catch (err) {
        console.error("Erro ao verificar status:", err);
      } finally {
        setLoading(false);
      }
    }

    checkRealStatus();
  }, [orderId, clearCart, fetchProducts]);

  // Se não tiver ID, manda pra home
  if (!paymentId && !orderId) {
     return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <p>Redirecionando...</p>
            {setTimeout(() => navigate('/'), 1000) && null}
        </div>
     );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Verificando pagamento...</p>
      </div>
    );
  }

  // Define se é sucesso baseando-se no STATUS DO BANCO, não da URL
  const isApproved = realStatus === 'paid' || realStatus === 'approved';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      <div className="bg-white p-10 rounded-2xl shadow-lg max-w-lg w-full">
        
        {isApproved ? (
            <CheckCircle className="text-green-500 h-20 w-20 mx-auto mb-6" />
        ) : (
            <AlertCircle className="text-yellow-500 h-20 w-20 mx-auto mb-6" />
        )}

        <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {isApproved ? 'Pagamento Aprovado!' : 'Aguardando Pagamento'}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {isApproved
            ? 'Tudo certo! Recebemos seu pagamento e seu pedido já está sendo preparado.' 
            : 'Se você já pagou via PIX, aguarde alguns segundos e atualize a página.'}
        </p>

        <div className="bg-gray-100 text-sm text-gray-700 rounded-lg p-4 mb-8 space-y-1 text-left">
            <p><strong>Status do Pedido:</strong> {isApproved ? 'Pago (Confirmado)' : 'Pendente'}</p>
            <p><strong>Nº do Pedido:</strong> #{orderId}</p>
            <p><strong>ID da Transação:</strong> {paymentId}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/"
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-6 rounded-lg transition-all"
          >
            Voltar para a Loja
          </Link>
          <Link
            to="/profile?tab=orders"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
          >
            Ver Meus Pedidos
          </Link>
        </div>
      </div>
    </div>
  );
}