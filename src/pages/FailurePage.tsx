import { Link, useSearchParams } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export default function FailurePage() {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('payment_id');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      <div className="bg-white p-10 rounded-2xl shadow-lg max-w-lg">
        <XCircle className="text-red-500 h-20 w-20 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Pagamento Recusado</h1>
        <p className="text-gray-600 mb-6">
          Houve um problema ao processar seu pagamento. Nenhum valor foi cobrado. Por favor, tente novamente.
        </p>
        {paymentId && (
          <div className="bg-red-50 text-sm text-red-700 rounded-lg p-4 mb-6">
            <p>Seu pagamento com ID <strong>{paymentId}</strong> não foi aprovado.</p>
          </div>
        )}
        <Link
          to="/" // Ou de volta para o carrinho, se preferir
          className="inline-block bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-8 rounded-lg transition-all"
        >
          Tentar Novamente
        </Link>
      </div>
    </div>
  );
}