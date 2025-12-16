import { X, ShoppingBag, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, products, removeFromCart, getCartTotal } = useStore();

  const handleCheckout = () => {
    alert('Redirecting to Mercado Pago...');
  };

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
            <h2 className="text-xl font-bold">Your Cart</h2>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-slate-800 p-2 rounded-lg transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingBag className="h-16 w-16 mb-4" />
              <p className="text-lg">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => {
                const product = products.find((p) => p.id === item.productId);
                if (!product) return null;

                return (
                  <div
                    key={item.productId}
                    className="flex space-x-4 bg-gray-50 p-4 rounded-lg"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-lg font-bold text-red-500">
                        ${product.priceSale * item.quantity}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition h-fit"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-700">Total:</span>
              <span className="text-3xl font-bold text-red-500">
                ${getCartTotal()}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
