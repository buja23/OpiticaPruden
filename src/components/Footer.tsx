import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#0A1D56] text-white pt-16 pb-8 border-t border-blue-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Grid Principal - 4 Colunas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Coluna 1: Marca e Sobre */}
          <div className="space-y-4">
            <h3 className="font-['Playfair_Display'] text-2xl font-bold tracking-wider">
              PRUDENVISION
            </h3>
            <p className="text-blue-100 text-sm leading-relaxed max-w-xs">
              Sua ótica premium online. Unimos tecnologia óptica de ponta com as últimas tendências da moda internacional.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-blue-200 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-blue-200 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-blue-200 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Coluna 2: Links Rápidos */}
          <div>
            <h4 className="font-['Playfair_Display'] text-lg font-semibold mb-6 text-blue-50">Navegação</h4>
            <ul className="space-y-3 text-sm text-blue-200">
              <li><Link to="/" className="hover:text-white transition-colors">Início</Link></li>
              <li><Link to="/search?category=sun" className="hover:text-white transition-colors">Óculos de Sol</Link></li>
              <li><Link to="/search?category=degree" className="hover:text-white transition-colors">Óculos de Grau</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">Minha Conta</Link></li>
            </ul>
          </div>

          {/* Coluna 3: Contato */}
          <div>
            <h4 className="font-['Playfair_Display'] text-lg font-semibold mb-6 text-blue-50">Atendimento</h4>
            <ul className="space-y-3 text-sm text-blue-200">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> (18) 99999-9999
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> contato@prudenvision.com.br
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" /> 
                <span>Presidente Prudente, SP<br/>Centro - Rua Principal, 123</span>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Newsletter e Pagamento */}
          <div>
            <h4 className="font-['Playfair_Display'] text-lg font-semibold mb-6 text-blue-50">Novidades</h4>
            <p className="text-blue-200 text-sm mb-4">Receba ofertas exclusivas.</p>
            <div className="flex flex-col gap-2 mb-6">
              <input 
                type="email" 
                placeholder="Seu e-mail" 
                className="bg-blue-900/50 border border-blue-700 rounded px-4 py-2 text-sm text-white placeholder-blue-400 focus:outline-none focus:border-blue-400"
              />
              <button className="bg-white text-[#0A1D56] font-bold py-2 px-4 rounded hover:bg-blue-50 transition-colors text-sm">
                INSCREVER
              </button>
            </div>
            
            <div className="pt-2">
              <span className="text-xs text-blue-300 block mb-2">Aceitamos</span>
              <div className="flex gap-2 opacity-90">
                <div className="bg-white px-2 py-1 rounded text-[#0A1D56] text-[10px] font-bold border border-gray-200">PIX</div>
                <div className="bg-white px-2 py-1 rounded text-[#0A1D56] text-[10px] font-bold border border-gray-200">BOLETO</div>
                <div className="bg-white px-2 py-1 rounded text-[#0A1D56] flex items-center border border-gray-200"><CreditCard className="h-4 w-4"/></div>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-blue-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-blue-300">
          <p>© 2026 PrudenVision Ótica. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-white">Privacidade</Link>
            <Link to="#" className="hover:text-white">Termos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}