export default function Hero() {
  const scrollToProducts = () => {
    const productsSection = document.getElementById('products');
    productsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative h-[500px] md:h-[600px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=1600&q=80)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/80 to-blue-900/40"></div>
      </div>

      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Veja o Mundo com Clareza
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-2">
            Coleção de Óculos Premium
          </p>
          
          <button
            onClick={scrollToProducts}
            className="bg-white text-blue-900 hover:bg-blue-50 font-bold py-4 px-8 rounded-lg text-lg transition-all transform hover:scale-105 shadow-xl"
          >
            Comprar Agora
          </button>
        </div>
      </div>
    </div>
  );
}
