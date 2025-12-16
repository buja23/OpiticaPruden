import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import UpdatePassword from './pages/UpdatePassword';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Componente para proteger rotas privadas
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Componente para redirecionar quem já está logado
function PublicRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <AuthProvider>
      <StoreProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-100">
            <Routes>
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              
              {/* Rotas Protegidas */}
              <Route path="/" element={<ProtectedRoute><><Navbar onCartClick={() => setIsCartOpen(true)} /><Home /></></ProtectedRoute>} />
              <Route path="/product/:id" element={<ProtectedRoute><><Navbar onCartClick={() => setIsCartOpen(true)} /><ProductDetails /></></ProtectedRoute>} />
              <Route path="/admin/inventory" element={<ProtectedRoute><><Navbar onCartClick={() => setIsCartOpen(true)} /><AdminDashboard /></></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><><Navbar onCartClick={() => setIsCartOpen(true)} /><Profile /></></ProtectedRoute>} />
              <Route path="/update-password" element={<ProtectedRoute><UpdatePassword /></ProtectedRoute>} />
            </Routes>
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
          </div>
        </BrowserRouter>
      </StoreProvider>
    </AuthProvider>
  );
}

export default App;
