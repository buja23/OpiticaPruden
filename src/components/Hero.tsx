import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <div className="relative bg-[#F8F9FA] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-[#F8F9FA] sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 flex flex-col justify-center h-full min-h-[600px]">
          
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              
              {/* Badge de "Nova Coleção" */}
              <span className="inline-block py-1 px-3 rounded bg-[#0A1D56]/10 text-[#0A1D56] text-xs font-bold tracking-widest uppercase mb-4">
                Chegou o Verão 2026
              </span>

              {/* Título com a Fonte de Luxo (Playfair Display) */}
              <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl font-['Playfair_Display']">
                <span className="block xl:inline">Sua visão merece</span>{' '}
                <span className="block text-[#0A1D56] xl:inline">a elegância de um clássico.</span>
              </h1>
              
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 font-light">
                Descubra armações que unem design italiano e conforto premium. 
                Frete grátis e parcelamento em até 12x.
              </p>
              
              <div className="mt-8 sm:mt-12 sm:flex sm:justify-center lg:justify-start gap-4">
                <div className="rounded-md shadow">
                  <Link
                    to="/search?category=sun"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-sm text-white bg-[#0A1D56] hover:bg-[#152C6F] md:py-4 md:text-lg transition-all"
                  >
                    Ver Óculos de Sol
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link
                    to="/search?category=degree"
                    className="w-full flex items-center justify-center px-8 py-3 border border-[#0A1D56] text-base font-medium rounded-sm text-[#0A1D56] bg-transparent hover:bg-blue-50 md:py-4 md:text-lg transition-all"
                  >
                    Armações de Grau
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      
      {/* Imagem Hero (Direita) - Estilo Lifestyle Kessy */}
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1780&auto=format&fit=crop"
          alt="Mulher usando óculos de sol elegantes"
        />
        {/* Gradiente suave para o texto não bater seco na foto */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F8F9FA] via-[#F8F9FA]/60 to-transparent lg:via-[#F8F9FA]/20"></div>
      </div>
    </div>
  );
}