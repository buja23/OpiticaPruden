import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function SuccessPage() {
  const { clearCart } = useStore();
  const [searchParams] = useSearchParams();

  // Limpa o carrinho assim que o usuário chega na página de sucesso.
  // O useEffect com array de dependências vazio garante que isso rode apenas uma vez.
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      <div className="bg-white p-10 rounded-2xl shadow-lg max-w-lg">
        <CheckCircle className="text-green-500 h-20 w-20 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Pagamento Aprovado!</h1>
        <p className="text-gray-600 mb-6">
          Obrigado pela sua compra! Seu pedido foi recebido e está sendo processado.
        </p>
        {paymentId && (
          <div className="bg-gray-100 text-sm text-gray-700 rounded-lg p-4 mb-6">
            <p><strong>ID do Pagamento:</strong> {paymentId}</p>
            <p><strong>Status:</strong> {status}</p>
          </div>
        )}
        <Link
          to="/"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-md"
        >
          Voltar para a Loja
        </Link>
      </div>
    </div>
  );
}