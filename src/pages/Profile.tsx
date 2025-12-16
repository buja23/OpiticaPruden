// c:\Users\joojs\Desktop\project-bolt-sb1-hmyoyfk5\project\src\pages\Profile.tsx
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Mail, Calendar, Shield } from 'lucide-react';

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Cabeçalho do Perfil */}
          <div className="bg-slate-900 px-6 py-8 text-white flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-slate-800">
                {user.user_metadata.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.user_metadata.full_name || 'Usuário'}</h2>
                <p className="text-blue-200">Cliente VisionBlue</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-md"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </button>
          </div>

          {/* Conteúdo do Perfil */}
          <div className="px-6 py-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Informações Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  <User className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-500">Nome Completo</span>
                </div>
                <p className="text-gray-900 font-medium ml-8">{user.user_metadata.full_name || 'Não informado'}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-500">Email</span>
                </div>
                <p className="text-gray-900 font-medium ml-8">{user.email}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-500">ID do Usuário</span>
                </div>
                <p className="text-gray-900 font-medium text-xs ml-8 font-mono truncate" title={user.id}>{user.id}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-500">Membro desde</span>
                </div>
                <p className="text-gray-900 font-medium ml-8">
                  {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
