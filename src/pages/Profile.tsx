import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User, LogOut, Mail, Calendar, Shield, Fingerprint, Users, Package, MapPin, Plus, Trash2, Loader2 } from 'lucide-react';

interface Address {
  id: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
}

interface Order {
  id: number;
  status: string;
  total_amount: number;
  created_at: string;
  mercado_pago_payment_id: string;
  order_items: {
    quantity: number;
    unit_price: number;
    products: {
      name: string;
      images: string[];
    } | null;
  }[];
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'addresses'>(searchParams.get('tab') as any || 'info');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estado do formulário de endereço
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: ''
  });

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Buscar endereços
      const { data: addressData } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (addressData) setAddresses(addressData);

      // Buscar pedidos
      const { data: orderData } = await supabase
        .from('orders')
        .select(`
          id, status, total_amount, created_at, mercado_pago_payment_id,
          order_items (
            quantity,
            unit_price,
            products (
              name, images
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (orderData) setOrders(orderData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const currentErrors: Record<string, string> = {};

    // Validações
    const cepClean = newAddress.zip_code.replace(/\D/g, '');
    if (cepClean.length !== 8) currentErrors.zip_code = 'CEP inválido. Deve conter 8 números.';
    
    const uf = newAddress.state.trim().toUpperCase();
    if (uf.length !== 2 || !/^[A-Z]{2}$/.test(uf)) currentErrors.state = 'Estado inválido (ex: SP).';
    
    if (newAddress.city.trim().length < 3 || /^\d+$/.test(newAddress.city)) currentErrors.city = 'Nome da cidade inválido.';
    if (newAddress.street.trim().length < 3 || /^\d+$/.test(newAddress.street)) currentErrors.street = 'Nome da rua inválido.';
    if (newAddress.neighborhood.trim().length < 2) currentErrors.neighborhood = 'Bairro inválido.';

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return;
    }

    try {
      const { error } = await supabase.from('addresses').insert({
        user_id: user.id,
        ...newAddress,
        state: uf,
        zip_code: cepClean.replace(/^(\d{5})(\d{3})$/, '$1-$2')
      });

      if (error) throw error;

      setShowAddressForm(false);
      setNewAddress({ street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zip_code: '' });
      setErrors({});
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar endereço:', error);
      setErrors({ submit: 'Erro ao salvar endereço. Verifique os dados.' });
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este endereço?')) return;
    const { error } = await supabase.from('addresses').delete().eq('id', id);
    if (error) console.error('Erro ao excluir:', error); else fetchData();
  };

  if (!user) return null;

  const formatCpf = (cpf: string | undefined) => {
    if (!cpf) return 'Não informado';
    // Garante que estamos formatando uma string de 11 dígitos
    const cleanedCpf = cpf.replace(/\D/g, '');
    if (cleanedCpf.length !== 11) return cpf; // Retorna o original ou limpo se não tiver 11 dígitos
    return cleanedCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const statusMap: Record<string, string> = {
    pending: 'Pendente',
    approved: 'Aprovado',
    in_process: 'Em análise',
    rejected: 'Recusado',
    shipped: 'Enviado',
    delivered: 'Entregue'
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Cabeçalho do Perfil */}
          <div className="bg-slate-900 px-6 py-8 text-white flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-slate-800">
                {user.user_metadata.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.user_metadata.full_name || 'Usuário'}</h2>
                <p className="text-blue-200">Cliente VisionBlue</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-md"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </button>
          </div>

          {/* Navegação de Abas */}
          <div className="flex border-b border-gray-200">
            <button onClick={() => setActiveTab('info')} className={`flex-1 py-4 text-center font-medium transition ${activeTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Minhas Informações</button>
            <button onClick={() => setActiveTab('orders')} className={`flex-1 py-4 text-center font-medium transition ${activeTab === 'orders' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Meus Pedidos</button>
            <button onClick={() => setActiveTab('addresses')} className={`flex-1 py-4 text-center font-medium transition ${activeTab === 'addresses' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Meus Endereços</button>
          </div>

          {/* Conteúdo das Abas */}
          <div className="p-6 md:p-8">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                {activeTab === 'info' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                      <div className="flex items-center space-x-3 mb-2"><User className="h-5 w-5 text-blue-500" /><span className="text-sm font-medium text-gray-500">Nome Completo</span></div>
                      <p className="text-gray-900 font-medium ml-8">{user.user_metadata.full_name || 'Não informado'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                      <div className="flex items-center space-x-3 mb-2"><Mail className="h-5 w-5 text-blue-500" /><span className="text-sm font-medium text-gray-500">Email</span></div>
                      <p className="text-gray-900 font-medium ml-8">{user.email}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                      <div className="flex items-center space-x-3 mb-2"><Fingerprint className="h-5 w-5 text-blue-500" /><span className="text-sm font-medium text-gray-500">CPF</span></div>
                      <p className="text-gray-900 font-medium ml-8">{formatCpf(user.user_metadata.cpf)}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                      <div className="flex items-center space-x-3 mb-2"><Users className="h-5 w-5 text-blue-500" /><span className="text-sm font-medium text-gray-500">Sexo</span></div>
                      <p className="text-gray-900 font-medium ml-8">{user.user_metadata.sexo || 'Não informado'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                      <div className="flex items-center space-x-3 mb-2"><Shield className="h-5 w-5 text-blue-500" /><span className="text-sm font-medium text-gray-500">ID do Usuário</span></div>
                      <p className="text-gray-900 font-medium text-xs ml-8 font-mono truncate" title={user.id}>{user.id}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                      <div className="flex items-center space-x-3 mb-2"><Calendar className="h-5 w-5 text-blue-500" /><span className="text-sm font-medium text-gray-500">Membro desde</span></div>
                      <p className="text-gray-900 font-medium ml-8">{new Date(user.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div className="space-y-4">
                    {orders.length === 0 ? (
                      <div className="text-center py-12 text-gray-500"><Package className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>Você ainda não fez nenhum pedido.</p></div>
                    ) : (
                      orders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <span className="text-sm text-gray-500">Pedido #{order.id}</span>
                              <p className="font-bold text-lg">R$ {(order.total_amount || 0).toFixed(2).replace('.', ',')}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{statusMap[order.status] || order.status}</span>
                          </div>
                          <div className="space-y-3 border-t border-gray-100 pt-3">
                            {order.order_items.map((item, index) => (
                              <div key={index} className="flex items-center space-x-3 text-sm">
                                <img src={item.products?.images[0]} alt={item.products?.name} className="w-10 h-10 rounded-md object-cover bg-gray-100" />
                                <div className="flex-1">
                                  <p className="font-medium text-gray-800">{item.products?.name || 'Produto indisponível'}</p>
                                  <p className="text-gray-500">{item.quantity} x R$ {(item.unit_price || 0).toFixed(2).replace('.', ',')}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="border-t border-gray-100 mt-3 pt-2">
                            <p className="text-xs text-gray-400 text-right">
                              {new Date(order.created_at).toLocaleDateString('pt-BR')} às {new Date(order.created_at).toLocaleTimeString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'addresses' && (
                  <div>
                    {!showAddressForm ? (
                      <>
                        <button onClick={() => setShowAddressForm(true)} className="w-full mb-6 flex items-center justify-center space-x-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-blue-500 hover:text-blue-500 transition"><Plus className="h-5 w-5" /><span>Adicionar Novo Endereço</span></button>
                        <div className="grid gap-4 md:grid-cols-2">
                          {addresses.map((addr) => (
                            <div key={addr.id} className="border border-gray-200 rounded-lg p-4 relative group">
                              <div className="flex items-start space-x-3">
                                <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                                <div>
                                  <p className="font-bold text-gray-900">{addr.street}, {addr.number}</p>
                                  <p className="text-sm text-gray-600">{addr.neighborhood} - {addr.city}/{addr.state}</p>
                                  <p className="text-sm text-gray-500">{addr.zip_code}</p>
                                </div>
                              </div>
                              <button onClick={() => handleDeleteAddress(addr.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <form onSubmit={handleAddAddress} className="max-w-lg mx-auto space-y-4">
                        <h3 className="text-lg font-bold mb-4">Novo Endereço</h3>
                        {errors.submit && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">{errors.submit}</div>}
                        <div className="grid grid-cols-2 gap-4">
                          <div><input required placeholder="CEP" className={`p-2 border rounded w-full ${errors.zip_code ? 'border-red-500' : ''}`} value={newAddress.zip_code} onChange={e => { setNewAddress({...newAddress, zip_code: e.target.value}); if (errors.zip_code) setErrors({...errors, zip_code: ''}); }} />{errors.zip_code && <p className="text-red-500 text-xs mt-1">{errors.zip_code}</p>}</div>
                          <div><input required placeholder="Estado (UF)" className={`p-2 border rounded w-full ${errors.state ? 'border-red-500' : ''}`} value={newAddress.state} onChange={e => { setNewAddress({...newAddress, state: e.target.value}); if (errors.state) setErrors({...errors, state: ''}); }} />{errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}</div>
                        </div>
                        <div><input required placeholder="Cidade" className={`p-2 border rounded w-full ${errors.city ? 'border-red-500' : ''}`} value={newAddress.city} onChange={e => { setNewAddress({...newAddress, city: e.target.value}); if (errors.city) setErrors({...errors, city: ''}); }} />{errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}</div>
                        <div><input required placeholder="Bairro" className={`p-2 border rounded w-full ${errors.neighborhood ? 'border-red-500' : ''}`} value={newAddress.neighborhood} onChange={e => { setNewAddress({...newAddress, neighborhood: e.target.value}); if (errors.neighborhood) setErrors({...errors, neighborhood: ''}); }} />{errors.neighborhood && <p className="text-red-500 text-xs mt-1">{errors.neighborhood}</p>}</div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-2"><input required placeholder="Rua" className={`p-2 border rounded w-full ${errors.street ? 'border-red-500' : ''}`} value={newAddress.street} onChange={e => { setNewAddress({...newAddress, street: e.target.value}); if (errors.street) setErrors({...errors, street: ''}); }} />{errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}</div>
                          <div><input required placeholder="Número" className="p-2 border rounded w-full" value={newAddress.number} onChange={e => setNewAddress({...newAddress, number: e.target.value})} /></div>
                        </div>
                        <input placeholder="Complemento (Opcional)" className="p-2 border rounded w-full" value={newAddress.complement} onChange={e => setNewAddress({...newAddress, complement: e.target.value})} />
                        <div className="flex space-x-3 pt-4">
                          <button type="button" onClick={() => { setShowAddressForm(false); setErrors({}); }} className="flex-1 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Cancelar</button>
                          <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Salvar Endereço</button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
