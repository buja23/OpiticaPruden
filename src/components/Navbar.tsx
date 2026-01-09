import { ShoppingCart, Search, User, Menu, X, Phone, Mail, MessageCircle, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const { cart } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* 1. Top Bar (Faixa Azul) - Some ao rolar */}
      <div className="bg-[#0A1D56] text-white text-[10px] sm:text-xs py-2 text-center font-medium tracking-widest uppercase relative z-50">
        Frete Grátis para todo Brasil nas compras acima de R$ 299,00
      </div>

      {/* 2. Navbar Principal (Logo e Ícones) - Fica FIXA (Sticky) */}
      <nav 
        className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
          isScrolled ? 'shadow-md py-2' : 'border-b border-gray-100 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">

            {/* ESQUERDA: Botão Mobile (Hambúrguer) */}
            {/* No Desktop, esse lado fica vazio para equilibrar o layout e manter a logo no centro */}
            <div className="flex-1 flex items-center justify-start">
              <button 
                className="lg:hidden p-2 -ml-2 text-[#0A1D56]"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            {/* CENTRO: Logo da Marca */}
            <div className="flex-shrink-0 flex justify-center">
              <Link to="/" className="flex flex-col items-center group">
                <span className="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold text-[#0A1D56] tracking-tight group-hover:opacity-80 transition-opacity whitespace-nowrap">
                  PRUDENVISION
                </span>
                <span className="text-[8px] sm:text-[10px] tracking-[0.3em] text-gray-400 uppercase hidden sm:block whitespace-nowrap">
                  Ótica & Acessórios
                </span>
              </Link>
            </div>

            {/* DIREITA: Ícones (Busca, Conta, Carrinho) */}
            <div className="flex-1 flex items-center justify-end gap-2 sm:gap-4">
              <button className="p-2 text-gray-600 hover:text-[#0A1D56] transition-colors">
                <Search className="h-5 w-5" />
              </button>
              <Link to="/login" className="hidden sm:block p-2 text-gray-600 hover:text-[#0A1D56] transition-colors">
                <User className="h-5 w-5" />
              </Link>
              <button 
                className="p-2 text-[#0A1D56] hover:bg-blue-50 rounded-full transition-colors relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* 3. MENU DE CATEGORIAS (Apenas Desktop) - Fica EM BAIXO da Navbar */}
      {/* Como NÃO tem 'sticky', ele vai rolar junto com a página e sumir quando descer */}
      <div className="hidden lg:block bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-12 space-x-8">
            <Link to="/search?category=sun" className="text-xs font-bold text-gray-600 hover:text-[#0A1D56] transition-colors uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
              Óculos de Sol
            </Link>
            <Link to="/search?category=degree" className="text-xs font-bold text-gray-600 hover:text-[#0A1D56] transition-colors uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
              Armações de Grau
            </Link>
            <Link to="/search?category=lenses" className="text-xs font-bold text-gray-600 hover:text-[#0A1D56] transition-colors uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
              Lentes de Contato
            </Link>
            
            {/* Dropdown Atendimento */}
            <div className="relative group h-full flex items-center z-40">
              <button className="text-xs font-bold text-gray-600 hover:text-[#0A1D56] transition-colors uppercase tracking-widest flex items-center gap-1 outline-none hover:underline decoration-2 underline-offset-4">
                Atendimento <ChevronDown className="w-3 h-3" />
              </button>
              
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-56 bg-white shadow-xl rounded-b-lg py-2 border-x border-b border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <div className="px-4 py-2 border-b border-gray-50 mb-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fale Conosco</span>
                </div>
                <a href="https://wa.me/5518999999999" target="_blank" className="flex items-center px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-[#0A1D56] transition-colors gap-3">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
                <a href="tel:+5518999999999" className="flex items-center px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-[#0A1D56] transition-colors gap-3">
                  <Phone className="w-4 h-4" /> Ligar para Loja
                </a>
                <a href="mailto:contato@prudenvision.com.br" className="flex items-center px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-[#0A1D56] transition-colors gap-3">
                  <Mail className="w-4 h-4" /> Enviar E-mail
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Mobile (MANTIDO O MESMO) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-4/5 max-w-xs bg-white shadow-xl flex flex-col">
            <div className="px-5 pt-6 pb-4 flex justify-between items-center border-b border-gray-100">
              <span className="font-['Playfair_Display'] text-xl font-bold text-[#0A1D56]">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-base font-medium text-slate-800 hover:bg-gray-50 rounded-lg">Início</Link>
              <Link to="/search?category=sun" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-base font-medium text-slate-800 hover:bg-gray-50 rounded-lg">Óculos de Sol</Link>
              <Link to="/search?category=degree" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-base font-medium text-slate-800 hover:bg-gray-50 rounded-lg">Armações de Grau</Link>
              
              <div className="border-t border-gray-100 my-4 pt-4 px-4">
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Minha Conta</p>
                 <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-sm text-gray-600 hover:text-[#0A1D56]">
                  <User className="h-4 w-4" /> Entrar / Cadastrar
                </Link>
              </div>

              <div className="border-t border-gray-100 my-4 pt-4 px-4 bg-gray-50 rounded-lg mx-2">
                <p className="text-xs font-bold text-[#0A1D56] uppercase tracking-wider mb-3">Central de Atendimento</p>
                <a href="https://wa.me/5518999999999" className="flex items-center gap-3 py-2.5 text-sm text-gray-600 hover:text-green-600">
                  <MessageCircle className="h-4 w-4" /> Enviar WhatsApp
                </a>
                <a href="tel:+5518999999999" className="flex items-center gap-3 py-2.5 text-sm text-gray-600 hover:text-blue-600">
                  <Phone className="h-4 w-4" /> Ligar Agora
                </a>
                <a href="mailto:contato@prudenvision.com.br" className="flex items-center gap-3 py-2.5 text-sm text-gray-600 hover:text-red-600">
                  <Mail className="h-4 w-4" /> Enviar E-mail
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}