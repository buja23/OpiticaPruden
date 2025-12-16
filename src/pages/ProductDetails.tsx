import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Package } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const { products, addToCart } = useStore();
  const product = products.find((p) => p.id === Number(id));
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <Link to="/" className="text-blue-500 hover:text-blue-600">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-8 transition"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Products</span>
        </Link>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            <div className="space-y-4">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={product.image_urls[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                {product.image_urls.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                      selectedImage === index
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-3">
                  {product.name}
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div className="flex items-baseline space-x-3">
                  <span className="text-5xl font-bold text-red-500">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="border-t border-b border-gray-200 py-4">
                <div className="flex items-center space-x-3">
                  <Package className="h-6 w-6 text-gray-400" />
                  {product.stock > 0 ? (
                    <div>
                      <span className="text-gray-700 font-medium">
                        {product.stock < 5 ? (
                          <span className="text-orange-600 font-bold">
                            Only {product.stock} units left!
                          </span>
                        ) : (
                          <span className="text-green-600">In Stock</span>
                        )}
                      </span>
                    </div>
                  ) : (
                    <span className="text-red-600 font-bold">Out of Stock</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => addToCart(product.id)}
                disabled={product.stock === 0}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-5 px-8 rounded-xl flex items-center justify-center space-x-3 transition-all transform hover:scale-105 shadow-xl text-lg"
              >
                <ShoppingCart className="h-6 w-6" />
                <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
              </button>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-2">
                <h3 className="font-bold text-slate-900">Why Choose VisionBlue?</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ Premium quality materials</li>
                  <li>✓ 1-year warranty included</li>
                  <li>✓ Free shipping on all orders</li>
                  <li>✓ UV400 protection</li>
                  <li>✓ 30-day return policy</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
