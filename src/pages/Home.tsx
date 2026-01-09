import Hero from '../components/Hero';
import FeaturedProducts from '../components/FeaturedProducts';
import ProductCarousel from '../components/ProductCarousel';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">

      {/* Capa Nova (Clean com Modelo) */}
      <Hero />

      {/* Nova Vitrine de Produtos (Estilo Boutique) */}
      <FeaturedProducts />

      {/* TrustSection foi removida daqui para limpar o visual */}
      <ProductCarousel />
    </div>
  );
}