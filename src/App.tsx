import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import UpdatePassword from './pages/UpdatePassword';
import { useAuth } from './context/AuthContext';
import ProtectedLayout from './components/ProtectedLayout';
import SuccessPage from './pages/SuccessPage';
import FailurePage from './pages/FailurePage';

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
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        {/* Rotas de Autenticação (só para usuários não logados) */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Rotas Públicas Principais com Layout */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
        </Route>

        {/* Rotas de Retorno de Pagamento (públicas) */}
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/failure" element={<FailurePage />} />
        
        {/* Rotas Protegidas que exigem login */}
        <Route element={<ProtectedRoute><ProtectedLayout /></ProtectedRoute>}>
          <Route path="/admin/inventory" element={<AdminDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/update-password" element={<UpdatePassword />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
