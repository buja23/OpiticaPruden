import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
// Adicionei CheckCircle e Clock nas importações
import { User, LogOut, Mail, Calendar, Shield, Fingerprint, Users, Package, MapPin, Plus, Trash2, Loader2, Edit, Save, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
    price: number; // Confirmado como 'price'
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

  // Estados para edição do perfil
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editableName, setEditableName] = useState(user?.user_metadata.full_name || '');
  const [editableCpf, setEditableCpf] = useState(user?.user_metadata.cpf || '');

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
            price,
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

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsUpdating(true);
    setErrors({});

    const nameParts = editableName.trim().split(' ').filter(part => part);
    if (nameParts.length < 2) {
      setErrors({ profile: 'Por favor, insira seu nome e sobrenome.' });
      setIsUpdating(false);
      return;
    }

    const cleanCpf = editableCpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      setErrors({ profile: 'CPF inválido. Deve conter 11 números.' });
      setIsUpdating(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          full_name: editableName.trim(),
          cpf: cleanCpf,
        }
      });

      if (error) throw error;

      toast.success('Perfil atualizado com sucesso!');
      setIsEditingInfo(false);
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      setErrors({ profile: 'Erro ao atualizar o perfil. Tente novamente.' });
      toast.error('Não foi possível atualizar seu perfil.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedCpf = value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .substring(0, 14);
    setEditableCpf(formattedCpf);
  };

  const handleDeleteAddress = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este endereço?')) {
      const { error } = await supabase.from('addresses').delete().eq('id', id);
      if (error) {
        console.error('Erro ao excluir:', error);
        toast.error('Não foi possível excluir o endereço.');
      } else {
        toast.success('Endereço excluído!');
        fetchData();
      }
    }
  };

  if (!user) return null;

  const formatCpf = (cpf: string | undefined) => {
    if (!cpf) return 'Não informado';
    const cleanedCpf = cpf.replace(/\D/g, '');
    if (cleanedCpf.length !== 11) return cpf;
    return cleanedCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
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
                  <div>
                    <div className="flex justify-end mb-4">
                      {!isEditingInfo ? (
                        <button onClick={() => setIsEditingInfo(true)} className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"><Edit className="h-4 w-4" /><span>Editar Perfil</span></button>
                      ) : (
                        <div className="flex space-x-2">
                          <button onClick={() => setIsEditingInfo(false)} className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 hover:bg-gray-300 text-gray-800">Cancelar</button>
                          <button onClick={handleUpdateProfile} disabled={isUpdating} className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm disabled:bg-gray-400"><Save className="h-4 w-4" /><span>{isUpdating ? 'Salvando...' : 'Salvar'}</span></button>
                        </div>
                      )}
                    </div>

                    {errors.profile && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{errors.profile}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex items-center space-x-3 mb-2"><User className="h-5 w-5 text-blue-500" /><span className="text-sm font-medium text-gray-500">Nome Completo</span></div>
                        {!isEditingInfo ? (
                          <p className="text-gray-900 font-medium ml-8">{user.user_metadata.full_name || 'Não informado'}</p>
                        ) : (
                          <input type="text" value={editableName} onChange={(e) => setEditableName(e.target.value)} className="w-full p-2 border rounded-md ml-8 -mt-2" />
                        )}
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex items-center space-x-3 mb-2"><Mail className="h-5 w-5 text-blue-500" /><span className="text-sm font-medium text-gray-500">Email</span></div>
                        <p className="text-gray-900 font-medium ml-8">{user.email}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex items-center space-x-3 mb-2"><Fingerprint className="h-5 w-5 text-blue-500" /><span className="text-sm font-medium text-gray-500">CPF</span></div>
                        {!isEditingInfo ? (
                          <p className="text-gray-900 font-medium ml-8">{formatCpf(user.user_metadata.cpf)}</p>
                        ) : (
                          <input type="text" value={editableCpf} onChange={handleCpfChange} maxLength={14} placeholder="000.000.000-00" className="w-full p-2 border rounded-md ml-8 -mt-2" />
                        )}
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex items-center space-x-3 mb-2"><Users className="h-5 w-5 text-blue-500" /><span className="text-sm font-medium text-gray-500">Sexo</span></div>
                        <p className="text-gray-900 font-medium ml-8">{user.user_metadata.sexo || 'Não informado'}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex items-center space-x-3 mb-2"><Shield className="h-5 w-5 text-blue-500" /><span className="text-sm font-medium text-gray-500">ID do Usuário</span></div>
                        <p className="text-gray-900 font-medium text-xs ml-8 font-mono truncate" title={user.id}>{user.id}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex items-center space-x-3 mb-2"><Calendar className="h-5 w-5 text-blue-500" /><span className="text-sm font-medium text-gray-500">Membro desde</span></div>
                        <p className="text-gray-900 font-medium ml-8">{new Date(user.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div className="space-y-6">
                    {orders.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="bg-gray-50 p-6 rounded-full mb-4">
                          <Package className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Nenhum pedido encontrado</h3>
                        <p className="text-gray-500 mt-1">Seus pedidos aparecerão aqui após a compra.</p>
                      </div>
                    ) : (
                      orders.map((order) => {
                        // Configuração Dinâmica do Status (Visual Senior)
                        let statusConfig = {
                          color: 'bg-gray-100 text-gray-800 border-gray-200',
                          icon: <Clock className="w-4 h-4" />,
                          label: 'Desconhecido',
                          message: 'Status não identificado.'
                        };

                        if (order.status === 'paid' || order.status === 'approved') {
                          statusConfig = {
                            color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                            icon: <CheckCircle className="w-5 h-5" />,
                            label: 'Pagamento Aprovado',
                            message: 'Tudo certo! Estamos preparando seu pacote para envio. 📦'
                          };
                        } else if (order.status === 'pending') {
                          statusConfig = {
                            color: 'bg-amber-50 text-amber-700 border-amber-200',
                            icon: <Clock className="w-5 h-5" />,
                            label: 'Aguardando Pagamento',
                            message: 'Pagamento pendente. Finalize para garantirmos seu estoque.'
                          };
                        } else if (order.status === 'cancelled') {
                          statusConfig = {
                            color: 'bg-red-50 text-red-700 border-red-200',
                            icon: <Trash2 className="w-4 h-4" />,
                            label: 'Cancelado',
                            message: 'Este pedido foi cancelado.'
                          };
                        }

                        return (
                          <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                            {/* Cabeçalho do Card */}
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-gray-900 text-lg">Pedido #{order.id}</span>
                                  <span className="text-xs text-gray-500 font-mono bg-gray-200 px-2 py-0.5 rounded">
                                    {new Date(order.created_at).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                                {/* Badge de Status Principal */}
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold border ${statusConfig.color}`}>
                                  {statusConfig.icon}
                                  {statusConfig.label}
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Total do Pedido</p>
                                <p className="text-2xl font-bold text-slate-900">
                                  R$ {(order.total_amount ?? 0).toFixed(2).replace('.', ',')}
                                </p>
                              </div>
                            </div>

                            {/* Barra de Progresso / Mensagem Contextual */}
                            <div className={`px-6 py-3 flex items-center gap-3 text-sm font-medium ${
                              order.status === 'paid' || order.status === 'approved' ? 'bg-emerald-50/50 text-emerald-800' : 'bg-gray-50 text-gray-600'
                            }`}>
                              <div className={`w-2 h-2 rounded-full ${
                                 order.status === 'paid' || order.status === 'approved' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                              }`} />
                              {statusConfig.message}
                            </div>

                            {/* Lista de Itens */}
                            <div className="p-6">
                              <div className="space-y-4">
                                {order.order_items.map((item, index) => (
                                  <div key={index} className="flex items-center gap-4 group">
                                    {/* Imagem com fallback */}
                                    <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                      {item.products?.images?.[0] ? (
                                        <img 
                                          src={item.products.images[0]} 
                                          alt={item.products.name} 
                                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                          <Package className="w-6 h-6" />
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-gray-900 truncate">
                                        {item.products?.name || 'Produto indisponível'}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        Quantidade: <span className="text-gray-900 font-medium">{item.quantity}</span>
                                      </p>
                                    </div>

                                    <div className="text-right">
                                      <p className="font-medium text-gray-900">
                                        R$ {(item.price ?? 0).toFixed(2).replace('.', ',')}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })
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