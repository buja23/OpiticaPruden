import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, AlertCircle, Mail, Lock, ArrowRight, UserPlus, ArrowLeft, CheckCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);  
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      
      // O redirecionamento será feito automaticamente pelo AuthContext/App.tsx
      // mas podemos forçar por segurança
      navigate('/');
    } catch (error: any) {
      let msg = error.message || 'Erro ao fazer login';
      if (msg.includes('Invalid login credentials')) {
        msg = 'Email ou senha incorretos.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;
      
      navigate('/auth-notification', {
        state: {
          title: 'Link de Recuperação Enviado',
          message: `Enviamos um link para redefinição de senha para o seu e-mail (${email}). Por favor, verifique sua caixa de entrada (e spam).`
        }
      });
    } catch (error: any) {
      setErrorMsg(error.message || 'Erro ao enviar email de recuperação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Lado Esquerdo - Branding e Identidade Visual */}
        <div className="w-full md:w-1/2 bg-blue-600 p-12 flex flex-col justify-between text-white relative overflow-hidden">
          {/* Efeito de fundo sutil */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-500 to-blue-700 opacity-50"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

          <div className="relative z-10">
            <div className="h-16 w-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-inner">
               {/* Espaço para Logo - Usando ícone como placeholder */}
               <LogIn className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 tracking-tight">{isResetting ? 'Recuperação de Conta' : 'Bem-vindo de volta!'}</h1>
            <p className="text-blue-100 text-lg leading-relaxed max-w-sm">
              {isResetting 
                ? 'Não se preocupe, vamos ajudá-lo a recuperar o acesso à sua conta em poucos passos.'
                : 'Acesse sua conta para gerenciar seus pedidos, acompanhar entregas e explorar as novidades da nossa loja.'}
            </p>
          </div>
          
          <div className="relative z-10 mt-12">
             <div className="flex items-center gap-3 text-sm text-blue-100 font-medium">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-400 border-2 border-blue-600"></div>
                  <div className="w-8 h-8 rounded-full bg-blue-300 border-2 border-blue-600"></div>
                  <div className="w-8 h-8 rounded-full bg-blue-200 border-2 border-blue-600"></div>
                </div>
                <span>Junte-se a milhares de clientes satisfeitos</span>
             </div>
          </div>
        </div>
        
        {/* Lado Direito - Formulário de Login */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{isResetting ? 'Esqueceu a senha?' : 'Login'}</h2>
            <p className="text-gray-500">
              {isResetting 
                ? 'Digite seu email para receber um link de redefinição.' 
                : 'Por favor, insira seus dados para continuar.'}
            </p>
          </div>

          
          <form className="space-y-6" onSubmit={isResetting ? handleResetPassword : handleLogin}>
            {errorMsg && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r text-sm flex items-start gap-3 animate-fade-in">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white outline-none"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {!isResetting && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Senha</label>
                  <button type="button" onClick={() => setIsResetting(true)} className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline">Esqueceu a senha?</button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white outline-none"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
            >
              {loading ? 'Processando...' : (
                <>
                  {isResetting ? 'Enviar Link de Recuperação' : 'Entrar'} <ArrowRight size={20} />
                </>
              )}
            </button>

            {isResetting ? (
              <button
                type="button"
                onClick={() => setIsResetting(false)}
                className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 font-medium transition-colors"
              >
                <ArrowLeft size={20} /> Voltar para o Login
              </button>
            ) : (
              <>
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Novo por aqui?</span>
              </div>
            </div>

            <Link 
              to="/register" 
              className="flex items-center justify-center gap-2 w-full px-4 py-3.5 border-2 border-gray-100 rounded-xl text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-200 transition-all group"
            >
              <UserPlus size={20} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
              Criar uma conta
            </Link>
              </>
            )}
          </form>
          
        </div>
      </div>
    </div>
  );
}