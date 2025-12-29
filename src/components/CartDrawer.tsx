import { useState, useEffect } from 'react';
import { X, ShoppingBag, Trash2, Loader2, MapPin } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Address {
  id: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, cartItems, removeFromCart, cartTotal } = useStore();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para seleção de endereço
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Busca os endereços do usuário quando o carrinho é aberto
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) {
        setAddresses([]);
        return;
      }
      setLoadingAddresses(true);
      try {
        const { data, error } = await supabase
          .from('addresses')
          .select('id, street, number, neighborhood, city, state')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setAddresses(data || []);
        
        // Pré-seleciona o primeiro endereço se houver apenas um
        if (data && data.length === 1) {
          setSelectedAddressId(data[0].id);
        }
      } catch (err) {
        console.error("Erro ao buscar endereços:", err);
        setAddresses([]);
      } finally {
        setLoadingAddresses(false);
      }
    };

    if (isOpen) {
      fetchAddresses();
    } else {
      // Limpa a seleção ao fechar para garantir dados frescos na reabertura
      setSelectedAddressId(null);
    }
  }, [isOpen, user]);

  // Lida com a criação da preferência de pagamento e atualiza os estados de UI.
  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (cartItems.length === 0) {
        throw new Error("O carrinho está vazio.");
      }
      
      if (!user) {
        throw new Error("Você precisa estar logado para finalizar a compra.");
      }

      if (!selectedAddressId) {
        throw new Error("Por favor, selecione um endereço de entrega.");
      }

      // Validação de dados do usuário para o pagamento
      const fullName = user.user_metadata?.full_name || '';
      const cpf = user.user_metadata?.cpf || '';

      if (!cpf || !fullName) {
        throw new Error("Para continuar, por favor, complete seu Nome Completo e CPF na página de perfil.");
      }

      // Prepara os dados do pagador de forma segura
      const nameParts = fullName.trim().split(' ').filter(part => part);
      const firstName = nameParts.shift() || '';
      const lastName = nameParts.join(' ') || '';
      const cleanCpf = cpf.replace(/\D/g, '');

      if (!firstName || !lastName) {
        throw new Error("Seu nome completo deve conter pelo menos um nome e um sobrenome. Por favor, atualize seu perfil.");
      }

      // Validação para garantir que todos os itens têm um preço válido antes de prosseguir
      const invalidItem = cartItems.find(item => typeof item.priceSale !== 'number');
      if (invalidItem) {
        throw new Error(`O item "${invalidItem.name}" está com o preço inválido. Por favor, remova-o do carrinho e tente adicionar novamente.`);
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
          })),
          metadata: {
            user_id: user.id,
            address_id: selectedAddressId, // Passa o ID do endereço como texto (UUID)
            // Informações do pagador, essenciais para habilitar métodos como PIX.
            payer: {
              first_name: firstName,
              last_name: lastName,
              email: user.email,
              identification: {
                type: 'CPF',
                number: cleanCpf, // Envia apenas os números do CPF
              },
            },
          }
        }
      });
      
      if (error) throw error;
      if (!data?.init_point) throw new Error("Não foi possível obter o link de pagamento.");
      
      // Redireciona o usuário para a página de pagamento do Mercado Pago
      window.location.href = data.init_point;
    } catch (err) {
      console.error('Erro detalhado ao criar preferência de pagamento:', err);
      let displayError = 'Não foi possível iniciar o pagamento. Tente novamente.';
      if (err instanceof Error) {
        if (err.message.includes('Estoque insuficiente')) {
          displayError = 'Ops! Um item no seu carrinho ficou sem estoque. Por favor, revise seu carrinho.';
        } else {
          displayError = err.message;
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
                    {typeof item.priceSale === 'number' ? (
                      <p className="text-lg font-bold text-slate-800">
                        {formatCurrency(item.priceSale * item.quantity)}
                      </p>
                    ) : (
                      <p className="text-sm font-bold text-red-500">
                        Preço indisponível
                      </p>
                    )}
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
            {/* Seção de Seleção de Endereço e Checkout */}
            {(
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800">Endereço de Entrega</h3>
                
                {!user ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                    Você precisa <Link to="/login" onClick={onClose} className="font-bold underline">fazer login</Link> para selecionar um endereço e finalizar a compra.
                  </div>
                ) : loadingAddresses ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                    Você não tem endereços cadastrados. <Link to="/profile" onClick={onClose} className="font-bold underline">Adicionar endereço no perfil</Link>.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {addresses.map((addr) => (
                      <label 
                        key={addr.id} 
                        className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedAddressId === addr.id 
                            ? 'bg-blue-50 border-blue-500' 
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={addr.id}
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center text-gray-900 font-medium text-sm">
                            <MapPin className="h-3 w-3 mr-1 text-gray-500" />
                            {addr.street}, {addr.number}
                          </div>
                          <div className="text-xs text-gray-500 ml-4">
                            {addr.neighborhood} - {addr.city}/{addr.state}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-semibold text-gray-700">Total:</span>
                  {typeof cartTotal === 'number' && !isNaN(cartTotal) ? (
                    <span className="text-3xl font-bold text-slate-900">{formatCurrency(cartTotal)}</span>
                  ) : (
                    <span className="text-xl font-bold text-red-500">Inválido</span>
                  )}
                </div>
                
                <button
                  onClick={handleCheckout}
                  disabled={isLoading || !user || !selectedAddressId}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                  {isLoading ? 'Processando...' : 'Finalizar Compra'}
                </button>
                {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
