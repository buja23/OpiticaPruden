import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import TrustSection from '../components/TrustSection';
import { useStore } from '../context/StoreContext';

export default function Home() {
  const { products } = useStore();

  return (
    <div className="min-h-screen bg-gray-100">
      <Hero />

      <div id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Our Premium Collection
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of designer eyewear at unbeatable prices.
            Limited stock available.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      <TrustSection />
    </div>
  );
}
