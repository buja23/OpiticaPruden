import { ShoppingBag, User, Search, Menu } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { cart } = useStore();
  const { user } = useAuth();

  return (
    <nav className="relative w-full z-50 bg-white shadow-sm">
      {/* 1. Faixa de Topo (igual Kessy/Triton) - Aviso de Frete/Promoção */}
      <div className="bg-slate-100 text-slate-600 text-xs py-2 text-center font-medium tracking-wide">
        FRETE GRÁTIS PARA TODO BRASIL NAS COMPRAS ACIMA DE R$ 299,00
      </div>

      {/* 2. O Cabeçalho Principal - Azul Royal Profundo (Baseado na Logo) */}
      <div className="bg-[#0A1D56] text-white shadow-lg"> {/* Cor extraída da logo */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Menu Mobile */}
            <div className="flex items-center md:hidden">
              <button className="text-white hover:text-gray-200">
                <Menu className="h-6 w-6" />
              </button>
            </div>

            {/* Logo Centralizada ou Esquerda */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              {/* Se você tiver a imagem da logo em .png sem fundo, coloque aqui. 
                  Por enquanto, vou recriar o texto com a fonte nova para simular. */}
              <div className="flex flex-col items-start">
                <span className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold tracking-wider leading-none">
                  PRUDENVISION
                </span>
                <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-blue-200 font-light ml-1">
                  Ótica & Acessórios
                </span>
              </div>
            </Link>

            {/* Barra de Busca (Estilo Triton - Escondida no mobile ou expandida) */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full group">
                <input
                  type="text"
                  placeholder="O que você procura?"
                  className="w-full bg-white/10 border border-white/20 rounded-full py-2 px-4 pl-10 text-sm text-white placeholder-blue-200 focus:outline-none focus:bg-white focus:text-slate-900 focus:placeholder-gray-400 transition-all duration-300"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-200 group-focus-within:text-slate-500" />
              </div>
            </div>

            {/* Ícones da Direita */}
            <div className="flex items-center space-x-6">
              <Link to={user ? "/profile" : "/login"} className="flex flex-col items-center group">
                <User className="h-6 w-6 group-hover:text-blue-200 transition-colors" />
                <span className="hidden md:block text-[10px] mt-1 font-medium group-hover:text-blue-200">
                  {user ? 'Minha Conta' : 'Entrar'}
                </span>
              </Link>

              <div className="relative group cursor-pointer">
                 {/* Carrinho com contador estilo "bolinha vermelha" igual da foto que você mandou */}
                <Link to="/cart">
                  <ShoppingBag className="h-6 w-6 group-hover:text-blue-200 transition-colors" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-[#0A1D56]">
                      {cart.length}
                    </span>
                  )}
                  <span className="hidden md:block text-[10px] mt-1 font-medium text-center group-hover:text-blue-200">
                    Sacola
                  </span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* 3. Menu de Categorias (Abaixo do Header, fundo branco igual Triton/Kessy) */}
      <div className="hidden md:block bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center space-x-8 py-3 text-sm font-medium text-slate-700">
            <a href="#" className="hover:text-[#0A1D56] transition-colors">ÓCULOS DE SOL</a>
            <a href="#" className="hover:text-[#0A1D56] transition-colors">ÓCULOS DE GRAU</a>
            <a href="#" className="hover:text-[#0A1D56] transition-colors">LENTES</a>
            <a href="#" className="text-red-600 hover:text-red-700 transition-colors font-bold">PROMOÇÕES</a>
          </div>
        </div>
      </div>
    </nav>
  );
}