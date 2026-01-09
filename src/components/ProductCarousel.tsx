import { useRef, useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ChevronLeft, ChevronRight, Star, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ProductCarousel() {
  const { products, addToCart } = useStore();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // 1. Pegamos os produtos base (primeiros 8)
  const baseProducts = products.slice(0, 8);
  
  // 2. MEGA BUFFER: Repetimos a lista 12 vezes.
  // Isso cria uma lista tão grande que o usuário nunca chega no final,
  // eliminando a necessidade de resetar a posição (que causava o travamento).
  const carouselProducts = Array(12).fill(baseProducts).flat();

  const handleAddToCart = (productId: number) => {
    addToCart(productId);
    toast.success('Adicionado à sacola! 👜');
  };

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 300; // Tamanho aproximado do card
      sliderRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // 3. Centralizar no início:
  // Assim que a tela carrega, jogamos o scroll para o "meio" da lista gigante.
  useEffect(() => {
    if (sliderRef.current) {
      const scrollWidth = sliderRef.current.scrollWidth;
      const clientWidth = sliderRef.current.clientWidth;
      
      // Coloca o scroll exatamente no meio da lista gigante
      sliderRef.current.scrollLeft = (scrollWidth - clientWidth) / 2;
    }
  }, [baseProducts]);

  return (
    <section className="bg-white py-16 border-t border-gray-100 relative">
      
      {/* CSS para esconder a barra de rolagem e suavizar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-end mb-8 sm:mb-12">
          <div>
            <span className="text-[#0A1D56] font-bold tracking-widest text-xs uppercase mb-2 block">
              Oportunidade
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 font-['Playfair_Display']">
              Destaques da Semana
            </h2>
          </div>
          
          {/* Setas Desktop */}
          <div className="hidden md:flex gap-2">
            <button 
              onClick={() => scroll('left')}
              className="p-2 rounded-full border border-gray-200 hover:bg-[#0A1D56] hover:text-white hover:border-[#0A1D56] transition-all text-slate-600"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-2 rounded-full border border-gray-200 hover:bg-[#0A1D56] hover:text-white hover:border-[#0A1D56] transition-all text-slate-600"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Área do Slider */}
        <div 
          className="relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          
          <div 
            ref={sliderRef}
            // Removi o 'onScroll' que causava o travamento.
            // Agora confiamos no tamanho gigante da lista.
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-8 px-1 snap-x snap-mandatory"
          >
            {carouselProducts.map((product, index) => (
              <div 
                // Usamos um key único composto para evitar avisos do React
                key={`${product.id}-loop-${index}`} 
                className="flex-shrink-0 w-[240px] sm:w-[280px] snap-center bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group/card"
              >
                {/* Imagem */}
                <div className="relative aspect-[4/5] overflow-hidden rounded-t-xl bg-gray-100">
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-[#0A1D56] text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase">
                      Destaque
                    </span>
                  </div>
                  
                  <Link to={`/product/${product.id}`}>
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  <button
                    onClick={() => handleAddToCart(product.id)}
                    className="absolute bottom-3 right-3 p-2 bg-white text-[#0A1D56] rounded-full shadow-lg opacity-0 translate-y-2 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-300 hover:bg-[#0A1D56] hover:text-white"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-4 text-center">
                  <div className="flex justify-center gap-0.5 text-amber-400 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>

                  <h3 className="font-['Playfair_Display'] text-lg text-slate-900 mb-1">
                    Exclusivo
                  </h3>
                  <p className="text-xs text-gray-500 mb-3 truncate">
                    {product.name}
                  </p>

                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold text-[#0A1D56]">
                      R$ {product.priceSale.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      12x de R$ {(product.priceSale / 12).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Setas Mobile (Aparecem no Hover) */}
          <button 
            onClick={() => scroll('left')}
            className={`md:hidden absolute top-[40%] left-0 -translate-y-1/2 p-2 bg-white/90 backdrop-blur shadow-lg rounded-full text-[#0A1D56] transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button 
            onClick={() => scroll('right')}
            className={`md:hidden absolute top-[40%] right-0 -translate-y-1/2 p-2 bg-white/90 backdrop-blur shadow-lg rounded-full text-[#0A1D56] transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>

        </div>

        <div className="text-center mt-4">
             <Link to="/search" className="text-sm font-bold text-[#0A1D56] border-b border-[#0A1D56] pb-0.5 hover:text-blue-800 transition-colors uppercase tracking-wider">
                Ver todos os destaques
             </Link>
        </div>

      </div>
    </section>
  );
}