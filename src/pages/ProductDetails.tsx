import { useParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useState, useEffect } from 'react';
import { ShoppingBag, Truck, ShieldCheck, ArrowLeft, Star, Heart, Share2, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetails() {
  const { id } = useParams();
  const { products, addToCart } = useStore();
  
  // Estado para a imagem selecionada
  const [selectedImage, setSelectedImage] = useState<string>('');
  
  const product = products.find((p) => p.id === Number(id));

  useEffect(() => {
    if (product && product.images.length > 0) {
      setSelectedImage(product.images[0]);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-slate-800">
        <h2 className="text-2xl font-['Playfair_Display'] font-bold mb-4">Produto não encontrado</h2>
        <Link to="/" className="text-[#0A1D56] underline hover:text-blue-800">Voltar para a loja</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product.id);
    toast.success('Adicionado à sacola com sucesso! 👜');
  };

  const installmentValue = (product.priceSale / 12).toFixed(2).replace('.', ',');

  return (
    <div className="bg-white min-h-screen pb-20">
      
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 hidden lg:block">
        <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-[#0A1D56] transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para a coleção
        </Link>
      </div>

      <div className="max-w-7xl mx-auto lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          
          {/* --- COLUNA ESQUERDA: Galeria de Imagens --- */}
          <div className="product-gallery flex flex-col-reverse lg:flex-row gap-4">
            
            {/* 1. Lista de Miniaturas (Voltou!) */}
            {/* Mobile: Horizontal embaixo | Desktop: Vertical na esquerda */}
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:w-24 lg:h-[600px] py-4 px-4 lg:py-0 lg:px-0 scrollbar-hide">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === img ? 'border-[#0A1D56] ring-2 ring-[#0A1D56]/20' : 'border-transparent border-gray-100'
                  }`}
                >
                  <img src={img} alt={`Vista ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* 2. Imagem Principal Grande */}
            {/* AQUI ESTÁ O AJUSTE: h-[500px] no mobile (antes era aspect-ratio que ficava enorme) */}
            <div className="flex-1 bg-gray-100 relative h-[500px] lg:h-[600px] lg:rounded-2xl overflow-hidden">
              <img
                src={selectedImage || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              
              {/* Botão Voltar (Mobile) */}
              <Link to="/" className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm lg:hidden">
                <ArrowLeft className="w-5 h-5 text-slate-700" />
              </Link>

              {/* Botão Favoritar */}
              <button className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur rounded-full shadow-sm hover:text-red-500 transition-colors group">
                <Heart className="w-5 h-5 group-hover:fill-red-500 transition-all" />
              </button>
            </div>
          </div>

          {/* --- COLUNA DIREITA: Informações --- */}
          <div className="px-4 pt-2 lg:pt-0 lg:px-0 mt-4 lg:mt-0 lg:sticky lg:top-24 h-fit">
            
            {/* Cabeçalho */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#0A1D56] font-bold text-xs tracking-widest uppercase bg-blue-50 px-2 py-1 rounded">
                  Lançamento 2026
                </span>
                <div className="flex items-center gap-1">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400 ml-1">(42)</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 font-['Playfair_Display'] leading-tight mb-2">
                {product.name}
              </h1>
              <p className="text-gray-500 text-sm">Cód: {product.id}REF2026</p>
            </div>

            {/* Preço e Parcelamento */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-8">
              <div className="flex items-end gap-3 mb-2">
                <p className="text-4xl font-bold text-[#0A1D56]">
                  R$ {product.priceSale.toFixed(2).replace('.', ',')}
                </p>
                {product.priceOriginal > product.priceSale && (
                  <p className="text-lg text-gray-400 line-through mb-1">
                    R$ {product.priceOriginal.toFixed(2).replace('.', ',')}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <CreditCard className="w-4 h-4 text-[#0A1D56]" />
                <span>
                  em até <strong className="text-slate-900">12x de R$ {installmentValue}</strong> sem juros
                </span>
              </div>
              
              <button
                onClick={handleAddToCart}
                className="w-full bg-[#0A1D56] text-white py-4 rounded-lg text-lg font-bold hover:bg-[#152C6F] transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                <ShoppingBag className="w-5 h-5" />
                ADICIONAR À SACOLA
              </button>

              <div className="mt-4 text-center">
                <p className="text-xs text-green-600 font-medium flex items-center justify-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Estoque disponível - Envio Imediato
                </p>
              </div>
            </div>

            {/* Descrição e Ícones */}
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 mb-2 font-['Playfair_Display'] text-lg">Sobre o Produto</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {product.description || 
                    "Este modelo exclusivo combina design italiano com materiais de alta durabilidade. As lentes possuem proteção UV400 certificada. A armação em acetato premium oferece leveza e ajuste perfeito."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-full text-[#0A1D56]">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Frete Grátis</h4>
                    <p className="text-xs text-gray-500">Brasil todo</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-full text-[#0A1D56]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Garantia</h4>
                    <p className="text-xs text-gray-500">3 Meses</p>
                  </div>
                </div>
              </div>
            </div>

            <button className="mt-8 flex items-center gap-2 text-sm text-gray-400 hover:text-[#0A1D56] transition-colors mx-auto lg:mx-0 w-full justify-center lg:justify-start">
              <Share2 className="w-4 h-4" />
              Compartilhar este produto
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}