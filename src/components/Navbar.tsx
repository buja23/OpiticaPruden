import { ShoppingCart, Glasses, Lock, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onCartClick: () => void;
}

export default function Navbar({ onCartClick }: NavbarProps) {
  const { cartItemCount } = useStore();
  const { user } = useAuth();

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition">
            <Glasses className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-bold">VisionBlue</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              to="/admin/inventory"
              className="flex items-center space-x-1 text-sm hover:text-blue-400 transition"
            >
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>

            {user && (
              <Link
                to="/profile"
                className="flex items-center space-x-1 text-sm hover:text-blue-400 transition"
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:inline font-medium">
                  {user.user_metadata.full_name?.split(' ')[0] || 'Perfil'}
                </span>
              </Link>
            )}

            <button
              onClick={onCartClick}
              className="relative flex items-center space-x-2 hover:text-blue-400 transition"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
