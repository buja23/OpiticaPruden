import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';

export default function ProtectedLayout() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      {/* Navbar Normal (vai empurrar o conteúdo para baixo naturalmente) */}
      <Navbar /> 
      
      {/* Conteúdo Principal (Sem padding-top extra) */}
      <main className="flex-grow">
        <Outlet />
      </main>
      
      {/* Footer no Final */}
      <Footer />

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}