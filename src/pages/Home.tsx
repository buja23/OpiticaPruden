import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import ProductFilters from '../components/ProductFilters';
import TrustSection from '../components/TrustSection';
import { useStore } from '../context/StoreContext';

export default function Home() {
  const { products, isLoading } = useStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-900">
        Carregando Produtos...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Hero />

      <div id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Nossa Coleção Premium
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubra nossa seleção exclusiva de óculos de grife a preços imbatíveis.
            Estoque limitado.
          </p>
        </div>

        <ProductFilters />

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-2xl font-bold text-slate-800">Nenhum produto encontrado</h3>
            <p className="text-gray-600 mt-2">
              Tente ajustar seus filtros para encontrar o que você procura.
            </p>
          </div>
        )}
      </div>

      <TrustSection />
    </div>
  );
}
