import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../context/StoreContext';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useStore();
  // Cálculo seguro para evitar divisão por zero.
  const discountPercentage =
    product.priceOriginal > 0
      ? Math.round(((product.priceOriginal - product.priceSale) / product.priceOriginal) * 100)
      : 0;

  const formatCurrency = (value: number) =>
    `R$${value.toFixed(2).replace('.', ',')}`;

  // Handler para o botão de "Adicionar ao Carrinho", que previne a navegação da tag Link pai.
  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Previne a navegação do Link
    e.stopPropagation(); // Para a propagação do evento
    if (product.stock > 0) {
      addToCart(product.id);
    }
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
    >
      <div className="relative overflow-hidden aspect-square">
        {/* Acesso seguro à imagem para evitar erros se não houver imagens */}
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
            Sem imagem
          </div>
        )}
        {/* Botão de Adicionar Rápido - aparece no hover */}
        {product.stock > 0 && (
          <button
            onClick={handleAddToCart}
            aria-label="Adicionar ao carrinho"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm text-slate-900 rounded-full h-12 w-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 focus:opacity-100"
          >
            <ShoppingCart className="h-6 w-6" />
          </button>
        )}
        {discountPercentage > 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white font-bold px-3 py-1 rounded-full text-sm shadow-lg">
            -{discountPercentage}%
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-gray-800 text-white font-bold px-4 py-2 rounded-lg text-center">
              Esgotado
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>

        {/* Seção de preço alinhada na parte inferior */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {formatCurrency(product.priceSale)}
            </span>
            {discountPercentage > 0 && (
              <span className="text-gray-400 text-md line-through">
                {formatCurrency(product.priceOriginal)}
              </span>
            )}
          </div>
          {discountPercentage > 0 && (
            <div className="text-sm font-semibold text-green-600 mt-1">
              Você economiza {formatCurrency(product.priceOriginal - product.priceSale)}!
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
