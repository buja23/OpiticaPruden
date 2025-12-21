import { useState, useEffect, useMemo, useCallback } from 'react';
import { X, ShoppingBag, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { supabase } from '../lib/supabase';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cartItems, removeFromCart, cartTotal } = useStore();
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoiza as configurações do Mercado Pago para evitar que o componente seja recriado (pisque) em cada renderização
  const initialization = useMemo(() => ({ preferenceId: preferenceId! }), [preferenceId]);
  const customization = useMemo(() => ({ texts: { valueProp: 'smart_option' } }), []);

  // Callbacks memoizados para evitar re-renderizações desnecessárias do iframe
  const handleOnReady = useCallback(() => console.log('Carteira do Mercado Pago carregada e pronta.'), []);
  const handleOnError = useCallback((error: any) => console.error('Erro interno no componente Wallet:', error), []);

  // Inicializa o SDK do Mercado Pago com a chave pública
  useEffect(() => {
    const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
    if (publicKey) {
      initMercadoPago(publicKey, { locale: 'pt-BR' });
    } else {
      console.error('VITE_MERCADOPAGO_PUBLIC_KEY não definida no .env');
    }
  }, []);

  // Reseta a preferência de pagamento se o carrinho for alterado.
  // Isso garante que o usuário sempre pague o valor correto.
  useEffect(() => {
    setPreferenceId(null);
  }, [cartItems]);

  // Lida com a criação da preferência de pagamento e atualiza os estados de UI.
  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (cartItems.length === 0) {
        throw new Error("O carrinho está vazio.");
      }

      // Invoca a Edge Function segura do Supabase, passando os itens do carrinho
      const { data, error } = await supabase.functions.invoke('create-preference', {
        body: {
          items: cartItems.map(item => ({
            id: item.id.toString(),
            title: item.name,
            description: item.description || 'Produto sem descrição',
            picture_url: item.images[0] || '',
            quantity: item.quantity,
            unit_price: item.priceSale,
          }))
        }
      });
      
      if (error) throw error;
      if (!data?.id) throw new Error("Não foi possível obter o ID de pagamento.");
      
      setPreferenceId(data.id);
    } catch (err) {
      let displayError = 'Não foi possível iniciar o pagamento. Tente novamente.';
      console.error('Erro detalhado ao criar preferência de pagamento:', err);
      
      // Tenta extrair a mensagem de erro detalhada vinda da Edge Function.
      if (err && typeof err === 'object' && 'context' in err) {
        const context = err.context as any;
        if (context && context.json && context.json.details) {
          displayError = `Erro do servidor: ${context.json.details}`;
        }
      }
      setError(displayError);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    `R$${value.toFixed(2).replace('.', ',')}`;

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6" />
            <h2 className="text-xl font-bold">Seu Carrinho</h2>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-slate-800 p-2 rounded-lg transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingBag className="h-16 w-16 mb-4" />
              <p className="text-lg">Seu carrinho está vazio</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex space-x-4 bg-gray-50 p-4 rounded-lg"
                >
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Quantidade: {item.quantity}
                    </p>
                    <p className="text-lg font-bold text-slate-800">
                      {formatCurrency(item.priceSale * item.quantity)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition h-fit self-start"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-gray-50 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-700">Total:</span>
              <span className="text-3xl font-bold text-slate-900">
                {formatCurrency(cartTotal)}
              </span>
            </div>
            {preferenceId ? (
              <Wallet 
                key={preferenceId} // Força o componente a recarregar completamente se o ID mudar
                initialization={initialization} 
                customization={customization}
                onReady={handleOnReady}
                onError={handleOnError}
              />
            ) : (
              <>
                <button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processando...' : 'Finalizar Compra'}
                </button>
                {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
