import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Package, Truck, FileText, ChevronDown, ChevronUp, Save, Lock, MapPin, Calendar, DollarSign, Copy, CheckCircle } from 'lucide-react';

interface OrderItem {
  id: number;
  quantity: number;
  unit_price: number;
  products: {
    name: string;
    images: string[];
  } | null;
}

interface Address {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  complement?: string;
}

interface Order {
  id: number;
  created_at: string;
  status: string;
  total_amount: number;
  tracking_code?: string;
  addresses: Address | null;
  order_items: OrderItem[];
}

export default function AdminSales() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  
  // Estados para edição
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [tempTracking, setTempTracking] = useState<string>('');
  const [tempStatus, setTempStatus] = useState<string>('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          addresses (*),
          order_items (
            *,
            products (name, images)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateOrder = async (orderId: number) => {
    setUpdatingId(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: tempStatus,
          tracking_code: tempTracking
        })
        .eq('id', orderId);

      if (error) throw error;
      
      // Atualiza a lista localmente
      setOrders(orders.map(o => 
        o.id === orderId 
          ? { ...o, status: tempStatus, tracking_code: tempTracking }
          : o
      ));
      alert('Pedido atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      alert('Erro ao atualizar pedido.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCopyOrderData = (order: Order) => {
    if (!order.addresses) return;

    const textToCopy = `
DADOS DO CLIENTE:
Endereço: ${order.addresses.street}, ${order.addresses.number} - ${order.addresses.neighborhood}
Cidade/UF: ${order.addresses.city} / ${order.addresses.state}
CEP: ${order.addresses.zip_code}
Complemento: ${order.addresses.complement || 'N/A'}

ITENS DO PEDIDO #${order.id}:
${order.order_items.map(item => `- ${item.products?.name || 'Produto'} (Qtd: ${item.quantity}) - R$ ${item.unit_price.toFixed(2)}`).join('\n')}

TOTAL: R$ ${order.total_amount.toFixed(2)}
    `.trim();

    navigator.clipboard.writeText(textToCopy).then(() => {
      alert('Dados copiados para a área de transferência! Agora cole no seu emissor de notas.');
    }).catch(err => {
      console.error('Erro ao copiar:', err);
    });
  };

  const toggleExpand = (order: Order) => {
    if (expandedOrderId === order.id) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(order.id);
      setTempStatus(order.status);
      setTempTracking(order.tracking_code || '');
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    shipped: 'bg-blue-100 text-blue-800',
    delivered: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pendente',
    approved: 'Aprovado',
    shipped: 'Enviado',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Histórico de Vendas</h1>
            <p className="text-gray-600">Gerencie pedidos, notas fiscais e entregas.</p>
          </div>
          <button onClick={fetchOrders} className="p-2 bg-white border rounded-lg hover:bg-gray-50 text-gray-600">
            Atualizar Lista
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Carregando pedidos...</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Cabeçalho do Pedido (Resumo) */}
                <div 
                  onClick={() => toggleExpand(order)}
                  className="p-6 flex flex-col md:flex-row items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4 mb-4 md:mb-0 w-full md:w-auto">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">Pedido #{order.id}</h3>
                      <div className="flex items-center text-sm text-gray-500 space-x-3">
                        <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
                        <span className="flex items-center"><DollarSign className="h-3 w-3 mr-1" /> R$ {order.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${statusColors[order.status] || 'bg-gray-100'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                    {expandedOrderId === order.id ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                  </div>
                </div>

                {/* Detalhes do Pedido (Expandido) */}
                {expandedOrderId === order.id && (
                  <div className="border-t border-gray-100 bg-gray-50 p-6 animate-fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      
                      {/* Coluna 1: Itens */}
                      <div className="lg:col-span-2 space-y-4">
                        <h4 className="font-bold text-gray-800 flex items-center"><Package className="h-4 w-4 mr-2" /> Itens do Pedido</h4>
                        <div className="bg-white rounded-lg border border-gray-200 divide-y">
                          {order.order_items.map((item) => (
                            <div key={item.id} className="p-4 flex items-center space-x-4">
                              <div className="h-12 w-12 bg-gray-100 rounded-md overflow-hidden">
                                {item.products?.images?.[0] && <img src={item.products.images[0]} alt="" className="h-full w-full object-cover" />}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{item.products?.name || 'Produto removido'}</p>
                                <p className="text-sm text-gray-500">{item.quantity}x R$ {item.unit_price.toFixed(2)}</p>
                              </div>
                              <p className="font-bold text-gray-900">R$ {(item.quantity * item.unit_price).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
                          <h4 className="font-bold text-gray-800 flex items-center mb-2"><MapPin className="h-4 w-4 mr-2" /> Endereço de Entrega</h4>
                          {order.addresses ? (
                            <p className="text-gray-600 text-sm">
                              {order.addresses.street}, {order.addresses.number} {order.addresses.complement && `(${order.addresses.complement})`}<br />
                              {order.addresses.neighborhood} - {order.addresses.city}/{order.addresses.state}<br />
                              CEP: {order.addresses.zip_code}
                            </p>
                          ) : (
                            <p className="text-red-500 text-sm">Endereço não encontrado.</p>
                          )}
                        </div>
                      </div>

                      {/* Coluna 2: Ações e Status */}
                      <div className="space-y-6">
                        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                          <h4 className="font-bold text-gray-800 mb-4 flex items-center"><Truck className="h-4 w-4 mr-2" /> Gestão de Entrega</h4>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Status do Pedido</label>
                              <select 
                                value={tempStatus}
                                onChange={(e) => setTempStatus(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                              >
                                <option value="pending">Pendente</option>
                                <option value="approved">Aprovado (Pago)</option>
                                <option value="shipped">Enviado</option>
                                <option value="delivered">Entregue</option>
                                <option value="cancelled">Cancelado</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Código de Rastreio</label>
                              <input 
                                type="text" 
                                value={tempTracking}
                                onChange={(e) => setTempTracking(e.target.value)}
                                placeholder="Ex: AA123456789BR"
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                              />
                            </div>

                            <button 
                              onClick={() => handleUpdateOrder(order.id)}
                              disabled={updatingId === order.id}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-md text-sm flex items-center justify-center"
                            >
                              {updatingId === order.id ? 'Salvando...' : <><Save className="h-4 w-4 mr-2" /> Salvar Alterações</>}
                            </button>
                          </div>
                        </div>

                        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                          <h4 className="font-bold text-gray-800 mb-4 flex items-center"><FileText className="h-4 w-4 mr-2" /> Documentação</h4>
                          <button 
                            onClick={() => handleCopyOrderData(order)}
                            className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-2 rounded-md text-sm flex items-center justify-center"
                          >
                            <Copy className="h-4 w-4 mr-2" /> Copiar Dados para NF
                          </button>
                          <p className="text-xs text-gray-400 mt-2 text-center">Copia os dados para colar no emissor (Bling/Tiny/Sebrae).</p>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}