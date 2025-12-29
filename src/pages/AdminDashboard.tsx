import { Plus, Minus, TrendingUp, AlertTriangle, Package } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function AdminDashboard() {
  const { products, updateStock, isLoading } = useStore();

  const handleUpdateStock = (productId: number, amount: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    // Impede que o estoque fique negativo
    if (product.stock + amount < 0) return;
    updateStock(productId, product.stock + amount);
  };

  const lowStockCount = products.filter((p) => p.stock < 3).length;
  const totalValue = products.reduce(
    (sum, p) => sum + (p.price || 0) * p.stock,
    0
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-900">
        Carregando Estoque...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Controle de Estoque
          </h1>
          <p className="text-gray-600">
            Gerencie a quantidade de produtos disponíveis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Total de Produtos</p>
            <p className="text-3xl font-bold text-slate-900">{products.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Alertas de Estoque</p>
            <p className="text-3xl font-bold text-orange-600">{lowStockCount}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Valor em Estoque</p>
            <p className="text-3xl font-bold text-slate-900">
              {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Produto
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Preço
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Estoque
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const isLowStock = product.stock < 3;
                  return (
                    <tr
                      key={product.id}
                      className={`border-b border-gray-200 ${
                        isLowStock ? 'bg-red-50' : 'hover:bg-gray-50'
                      } transition`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <span className="font-medium text-slate-900">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-lg font-bold text-slate-700">
                          R$ {(product.price || 0).toFixed(2).replace('.', ',')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-2xl font-bold text-slate-900">
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isLowStock ? (
                          <span className="inline-flex items-center space-x-1 bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full text-xs">
                            <AlertTriangle className="h-3 w-3" />
                            <span>BAIXO</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full text-xs">
                            OK
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateStock(product.id, 1)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold p-2 rounded-lg flex items-center transition"
                            title="Adicionar 1 ao estoque"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateStock(product.id, -1)}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold p-2 rounded-lg flex items-center transition disabled:bg-gray-400"
                            disabled={product.stock <= 0}
                            title="Remover 1 do estoque"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
