import { useStore } from '../context/StoreContext';
import { ShoppingBag, Star, Eye, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function FeaturedProducts() {
  const { products, addToCart } = useStore();

  // Pegamos apenas os primeiros 8 produtos para a Home
  const displayedProducts = products.slice(0, 8);

  const handleAddToCart = (productId: number) => {
    addToCart(productId);
    toast.success('Produto adicionado à sacola! 👜');
  };

  return (
    <section className="bg-[#F8F9FA] py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho da Seção */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[#0A1D56] font-medium tracking-widest text-xs uppercase mb-2 block">
            Coleção Exclusiva
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-['Playfair_Display'] mb-4">
            Os Favoritos da Temporada
          </h2>
          <div className="w-24 h-1 bg-[#0A1D56] mx-auto rounded-full"></div>
        </div>

        {/* Grid de Produtos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6 xl:gap-x-8">
          {displayedProducts.map((product) => (
            <div key={product.id} className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
              
              {/* Área da Imagem */}
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-100 xl:aspect-w-7 xl:aspect-h-8 relative h-80">
                <div className="absolute top-3 left-3 z-10">
                   <span className="bg-[#0A1D56] text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wide">
                     Lançamento
                   </span>
                </div>

                <Link to={`/product/${product.id}`} className="block h-full w-full">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <Package className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                  {/* Overlay ao passar o mouse */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>

                {/* Botões de Ação Rápida */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 px-4">
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    className="flex-1 bg-[#0A1D56] text-white py-3 rounded-sm flex items-center justify-center gap-2 text-sm font-medium hover:bg-[#152C6F] shadow-lg transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Adicionar
                  </button>
                  <Link 
                    to={`/product/${product.id}`}
                    className="bg-white text-slate-900 p-3 rounded-sm hover:bg-gray-100 shadow-lg border border-gray-200 transition-colors"
                    title="Ver Detalhes"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Informações do Produto */}
              <div className="p-5 text-center">
                <div className="flex justify-center gap-0.5 text-amber-400 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>

                <h3 className="text-lg font-medium text-slate-900 mb-1 font-['Playfair_Display'] truncate">
                  <Link to={`/product/${product.id}`}>
                    <span aria-hidden="true" className="absolute inset-0" />
                    {product.name}
                  </Link>
                </h3>
                
                {/* Usando description como categoria temporária se não houver campo category */}
                <p className="text-sm text-gray-500 mb-3 truncate px-4">
                  {product.description || 'Óculos Premium'}
                </p>
                
                <div className="flex flex-col items-center justify-center">
                  <p className="text-xl font-bold text-[#0A1D56]">
                    R$ {(product.priceSale ?? 0).toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 font-medium">
                    até 12x de R$ {((product.priceSale ?? 0) / 12).toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/" 
            className="inline-block border-b-2 border-[#0A1D56] text-[#0A1D56] pb-1 font-bold tracking-widest hover:text-[#152C6F] hover:border-[#152C6F] transition-colors uppercase text-sm"
          >
            Ver Coleção Completa
          </Link>
        </div>

      </div>
    </section>
  );
}