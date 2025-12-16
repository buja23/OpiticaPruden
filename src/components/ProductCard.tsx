import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../data';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useStore();
  const discountPercentage = Math.round(
    ((product.priceOriginal - product.priceSale) / product.priceOriginal) * 100
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock > 0) {
      addToCart(product.id);
    }
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <div className="relative overflow-hidden aspect-square">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {discountPercentage > 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white font-bold px-3 py-1 rounded-full text-sm shadow-lg">
            -{discountPercentage}%
          </div>
        )}
        {product.stock < 5 && product.stock > 0 && (
          <div className="absolute top-3 left-3 bg-orange-500 text-white font-semibold px-3 py-1 rounded-full text-xs">
            Only {product.stock} left!
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-gray-800 text-white font-bold px-4 py-2 rounded-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm line-through">
              ${product.priceOriginal}
            </span>
            <span className="text-3xl font-bold text-red-500">
              ${product.priceSale}
            </span>
          </div>
          <div className="text-right text-sm text-gray-500">
            Save ${product.priceOriginal - product.priceSale}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all transform hover:scale-105"
        >
          <ShoppingCart className="h-5 w-5" />
          <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
        </button>
      </div>
    </Link>
  );
}
