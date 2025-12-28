import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function FailurePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentId = searchParams.get('payment_id');
  const orderId = searchParams.get('external_reference');

  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelAndRetry = async () => {
    if (!orderId) {
      navigate('/');
      return;
    }
    setIsCancelling(true);
    try {
      const { error } = await supabase.rpc('cancel_order_and_restock', {
        order_id_in: parseInt(orderId),
      });
      if (error) throw error;
      alert('Pedido cancelado. Os itens foram devolvidos ao estoque. Você será redirecionado para a loja.');
      navigate('/');
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error);
      alert('Não foi possível cancelar o pedido. Tente novamente mais tarde.');
      setIsCancelling(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      <div className="bg-white p-10 rounded-2xl shadow-lg max-w-lg">
        <XCircle className="text-red-500 h-20 w-20 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Pagamento Recusado</h1>
        <p className="text-gray-600 mb-6">
          Houve um problema ao processar seu pagamento. Nenhum valor foi cobrado.
        </p>
        {paymentId && (
          <div className="bg-red-50 text-sm text-red-700 rounded-lg p-4 mb-6">
            <p>Seu pagamento (ID: <strong>{paymentId}</strong>) não foi aprovado.</p>
          </div>
        )}
        <button
          onClick={handleCancelAndRetry}
          disabled={isCancelling}
          className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-8 rounded-lg transition-all disabled:bg-gray-400"
        >
          {isCancelling ? 'Cancelando...' : 'Tentar Novamente'}
        </button>
      </div>
    </div>
  );
}