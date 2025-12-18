import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Package } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const { allProducts, addToCart, isLoading } = useStore(); // Usar allProducts garante que o produto seja encontrado independente dos filtros.
  const [selectedImage, setSelectedImage] = useState(0);
  const product = allProducts.find((p) => p.id === Number(id));

  // Reseta a imagem selecionada quando o ID do produto muda.
  useEffect(() => {
    setSelectedImage(0);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-900">
        Carregando Produto...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Produto Não Encontrado</h2>
          <Link to="/" className="text-blue-500 hover:text-blue-600">
            Voltar para o Início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-8 transition"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Voltar para os Produtos</span>
        </Link>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            <div className="space-y-4">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                {/* Acesso seguro à imagem para evitar erros se não houver imagens */}
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                    Sem imagem
                  </div>
                )}
              </div>

              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                      selectedImage === index
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-3">
                  {product.name}
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div className="flex items-baseline space-x-3">
                  <span className="text-5xl font-bold text-slate-900">
                    R${product.priceSale.toFixed(2).replace('.', ',')}
                  </span>
                  {product.priceOriginal > product.priceSale && (
                    <span className="text-2xl font-medium text-gray-400 line-through">
                      R${product.priceOriginal.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-b border-gray-200 py-4">
                <div className="flex items-center space-x-3">
                  <Package className="h-6 w-6 text-gray-400" />
                  {product.stock > 0 ? (
                    <div>
                      <span className="text-gray-700 font-medium">
                        {product.stock < 5 ? (
                          <span className="text-orange-600 font-bold">
                            Apenas {product.stock} unidades restantes!
                          </span>
                        ) : (
                          <span className="text-green-600">Em Estoque</span>
                        )}
                      </span>
                    </div>
                  ) : (
                    <span className="text-red-600 font-bold">Fora de Estoque</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => addToCart(product.id)}
                disabled={product.stock === 0}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-5 px-8 rounded-xl flex items-center justify-center space-x-3 transition-all transform hover:scale-105 shadow-xl text-lg"
              >
                <ShoppingCart className="h-6 w-6" />
                <span>{product.stock === 0 ? 'Fora de Estoque' : 'Adicionar ao Carrinho'}</span>
              </button>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-2">
                <h3 className="font-bold text-slate-900">Por que escolher a VisionBlue?</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ Materiais de qualidade premium</li>
                  <li>✓ 1 ano de garantia incluído</li>
                  <li>✓ Frete grátis para todos os pedidos</li>
                  <li>✓ Proteção UV400</li>
                  <li>✓ Política de devolução de 30 dias</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
