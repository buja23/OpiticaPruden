import { useEffect, useRef } from 'react'; // Adicionei useRef
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function SuccessPage() {
  const { clearCart, fetchProducts } = useStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Ref para garantir que o efeito rode apenas uma vez (React 18 Strict Mode)
  const effectRan = useRef(false);

  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const orderId = searchParams.get('external_reference');

  useEffect(() => {
    if (effectRan.current === true) return; // Evita rodar duas vezes

    const performPostSuccessActions = async () => {
      // SÓ LIMPA SE O STATUS FOR APROVADO
      if (status === 'approved') {
        await clearCart();
        await fetchProducts(); // Atualiza o estoque visual na loja
        effectRan.current = true;
      }
    };

    performPostSuccessActions();
  }, [status, clearCart, fetchProducts]);

  // Se alguém tentar acessar essa página sem parâmetros, manda para home
  if (!paymentId && !status) {
     return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <p>Redirecionando...</p>
            {setTimeout(() => navigate('/'), 1000) && null}
        </div>
     );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      <div className="bg-white p-10 rounded-2xl shadow-lg max-w-lg">
        
        {/* Ícone muda se estiver pendente (caso raro, mas possível) */}
        {status === 'approved' ? (
            <CheckCircle className="text-green-500 h-20 w-20 mx-auto mb-6" />
        ) : (
            <AlertCircle className="text-yellow-500 h-20 w-20 mx-auto mb-6" />
        )}

        <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {status === 'approved' ? 'Pagamento Aprovado!' : 'Processando Pagamento'}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {status === 'approved' 
            ? 'Obrigado pela sua compra! Seu pedido foi confirmado.' 
            : 'Seu pagamento está sendo processado. Você será notificado em breve.'}
        </p>

        {paymentId && (
          <div className="bg-gray-100 text-sm text-gray-700 rounded-lg p-4 mb-8 space-y-1 text-left">
            <p><strong>Status:</strong> {status === 'approved' ? 'Aprovado' : status}</p>
            <p><strong>ID do Pagamento:</strong> {paymentId}</p>
            {orderId && <p><strong>Nº do Pedido:</strong> #{orderId}</p>}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/"
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-6 rounded-lg transition-all"
          >
            Voltar para a Loja
          </Link>
          <Link
            to="/profile" // Ajustei para ir para o perfil geral, caso a tab não exista
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
          >
            Ver Meus Pedidos
          </Link>
        </div>
      </div>
    </div>
  );
}