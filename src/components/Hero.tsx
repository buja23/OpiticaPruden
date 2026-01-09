export default function Hero() {
  return (
    // Container Principal: Flex no Mobile, Grid no Desktop
    <div className="relative bg-[#F8F9FA] min-h-[600px] flex items-center lg:grid lg:grid-cols-2 overflow-hidden">
      
      {/* 1. BLOCO DA IMAGEM */}
      {/* Mobile: Absolute (Fundo Total) | Desktop: Relative (Lado Direito Inteiro) */}
      <div className="absolute inset-0 lg:relative lg:order-2 lg:h-full lg:w-full">
        <img
          className="h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1780&auto=format&fit=crop"
          alt="Modelo VisionBlue"
        />
        {/* Máscara Escura (APENAS NO MOBILE) para o texto branco ler bem */}
        <div className="absolute inset-0 bg-black/40 lg:hidden"></div>
        {/* Gradiente Suave (APENAS NO DESKTOP) para transição invisível entre branco e foto */}
        <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-[#F8F9FA] via-transparent to-transparent"></div>
      </div>

      {/* 2. CONTEÚDO DE TEXTO */}
      {/* Mobile: Por cima da imagem (z-10) | Desktop: Lado Esquerdo (Fundo Claro) */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-16 lg:py-20 lg:order-1 flex flex-col justify-center h-full">
        <div className="text-center lg:text-left max-w-xl mx-auto lg:mx-0">
          
          {/* Badge Minimalista */}
          <span className="inline-block py-1 px-3 rounded text-xs font-bold tracking-[0.2em] uppercase mb-6
            bg-white/20 text-white border border-white/20 backdrop-blur-md
            lg:bg-transparent lg:text-[#0A1D56] lg:border-l-2 lg:border-[#0A1D56] lg:rounded-none lg:pl-3 lg:px-0">
            Coleção Verão 2026
          </span>

          {/* Título Principal */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-['Playfair_Display'] mb-6 leading-tight
            text-white drop-shadow-md
            lg:text-slate-900 lg:drop-shadow-none">
            Sua visão merece <br />
            <span className="text-blue-100 lg:text-[#0A1D56]">a elegância clássica.</span>
          </h1>
          
          {/* Descrição */}
          <p className="text-lg font-light max-w-md mx-auto lg:mx-0 leading-relaxed
            text-gray-100
            lg:text-gray-500">
            Design italiano, proteção premium e o conforto que você procura. 
            Frete grátis para todo o Brasil.
          </p>
          
          {/* Botões removidos para visual Clean */}

        </div>
      </div>
    </div>
  );
}