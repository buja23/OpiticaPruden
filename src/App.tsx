import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import AdminDashboard from './pages/AdminDashboard';
import AdminSales from './pages/AdminSales';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import UpdatePassword from './pages/UpdatePassword';
import { useAuth } from './context/AuthContext';
import ProtectedLayout from './components/ProtectedLayout';
import SuccessPage from './pages/SuccessPage';
import FailurePage from './pages/FailurePage';
import AuthNotificationPage from './pages/AuthNotificationPage';
import { Toaster } from 'react-hot-toast';

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

// Componente para proteger rotas de Admin
function AdminRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!user || user.user_metadata?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* Rotas sem o layout principal (ex: login, register, páginas de status) */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/auth-notification" element={<AuthNotificationPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/failure" element={<FailurePage />} />
        
        {/* Rotas que compartilham o layout principal (cabeçalho, rodapé, etc.) */}
        <Route element={<ProtectedLayout />}>
          {/* Rotas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          
          {/* Rotas que exigem login */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/update-password" element={<ProtectedRoute><UpdatePassword /></ProtectedRoute>} />
          
          {/* Rotas que exigem ser admin */}
          <Route path="/admin/inventory" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/sales" element={<AdminRoute><AdminSales /></AdminRoute>} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
