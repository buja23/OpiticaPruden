import { useState } from 'react';
import { Lock, Plus, TrendingUp, AlertTriangle, Package } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function AdminDashboard() {
  const { products, updateStock } = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) {
      setIsAuthenticated(true);
    }
  };

  const handleAddStock = (productId: number, currentStock: number) => {
    updateStock(productId, currentStock + 1);
  };

  const lowStockCount = products.filter((p) => p.stock < 3).length;
  const totalValue = products.reduce(
    (sum, p) => sum + p.price * p.stock,
    0
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="bg-slate-900 p-4 rounded-full">
              <Lock className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
            Admin Access
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Enter password to access inventory management
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition"
            >
              Login
            </button>
          </form>
          <p className="text-xs text-gray-500 text-center mt-4">
            Prototype: Any password will work
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Inventory Management
          </h1>
          <p className="text-gray-600">
            Manage your product stock levels and monitor inventory status
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Total Products</p>
            <p className="text-3xl font-bold text-slate-900">{products.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Low Stock Alerts</p>
            <p className="text-3xl font-bold text-orange-600">{lowStockCount}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Inventory Value</p>
            <p className="text-3xl font-bold text-slate-900">
              ${totalValue.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Product Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Sale Price
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Current Stock
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Actions
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
                            src={product.image_urls[0]}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <span className="font-medium text-slate-900">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-lg font-bold text-red-500">
                          ${product.price.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-2xl font-bold text-slate-900">
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isLowStock ? (
                          <span className="inline-flex items-center space-x-1 bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full text-sm">
                            <AlertTriangle className="h-4 w-4" />
                            <span>LOW STOCK</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full text-sm">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            handleAddStock(product.id, product.stock)
                          }
                          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg flex items-center space-x-2 transition"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Stock</span>
                        </button>
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
