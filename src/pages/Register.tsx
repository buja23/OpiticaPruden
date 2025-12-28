import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, AlertCircle, Mail, Lock, ArrowRight, User, LogIn, CheckCircle, Fingerprint, Users } from 'lucide-react';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [sexo, setSexo] = useState('');  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);    
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    // Função para validar o CPF (algoritmo de verificação)
    const isValidCpf = (cpfToValidate: string) => {
      const cpf = cpfToValidate.replace(/[^\d]+/g, '');
      if (cpf.length !== 11 || /^(.)\1+$/.test(cpf)) return false;
      let sum = 0;
      let remainder;
      for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
      remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(cpf.substring(9, 10))) return false;
      sum = 0;
      for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
      remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(cpf.substring(10, 11))) return false;
      return true;
    };

    if (!isValidCpf(cpf)) {
      setErrorMsg('O CPF inserido é inválido. Por favor, verifique.');
      setLoading(false);
      return;
    }

    if (!sexo) {
      setErrorMsg('Por favor, selecione uma opção para o campo Sexo.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name,
            // A validação de titularidade do CPF (se pertence à pessoa)
            // requer integração com serviços externos via backend.
            // Aqui, salvamos o CPF após a validação de formato.
            cpf: cpf.replace(/[^\d]+/g, ''), // Salva apenas os números
            sexo: sexo,
          },
        },
      });

      if (error) throw error;
      
      // Redireciona para a página de notificação para o usuário confirmar o e-mail.
      navigate('/auth-notification', {
        state: {
          title: 'Confirmação Necessária',
          message: `Enviamos um link de confirmação para o seu e-mail (${email}). Por favor, verifique sua caixa de entrada (e spam) para ativar sua conta.`
        }
      });
    } catch (error: any) {
      setErrorMsg(error.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Aplica a máscara de CPF: XXX.XXX.XXX-XX
    const formattedCpf = value
      .replace(/\D/g, '') // Remove todos os caracteres não numéricos
      .replace(/(\d{3})(\d)/, '$1.$2') // Adiciona ponto após o 3º dígito
      .replace(/(\d{3})(\d)/, '$1.$2') // Adiciona ponto após o 6º dígito
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2') // Adiciona hífen antes dos últimos 2 dígitos
      .substring(0, 14); // Limita o tamanho
    setCpf(formattedCpf);
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
               <UserPlus className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 tracking-tight">Junte-se a nós!</h1>
            <p className="text-blue-100 text-lg leading-relaxed max-w-sm">
              Crie sua conta hoje mesmo para começar a comprar, salvar seus favoritos e aproveitar ofertas exclusivas.
            </p>
          </div>
          
          <div className="relative z-10 mt-12">
             <div className="flex items-center gap-3 text-sm text-blue-100 font-medium">
                <div className="w-12 h-1 bg-blue-400 rounded-full"></div>
                <span>Rápido, fácil e seguro.</span>
             </div>
          </div>
        </div>
        
        {/* Lado Direito - Formulário de Cadastro */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Criar Conta</h2>
            <p className="text-gray-500">Preencha os dados abaixo para se cadastrar.</p>
          </div>

          <form className="space-y-6" onSubmit={handleRegister}>
            {errorMsg && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r text-sm flex items-start gap-3 animate-fade-in">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white outline-none"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">CPF</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Fingerprint className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white outline-none"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={handleCpfChange}
                    maxLength={14}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sexo</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <select
                    required
                    className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white outline-none appearance-none"
                    value={sexo}
                    onChange={(e) => setSexo(e.target.value)}
                  >
                    <option value="" disabled>Selecione...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Neutro">Neutro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Senha</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white outline-none"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <PasswordStrengthMeter password={password} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmar Senha</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white outline-none"
                    placeholder="Repita a senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
            >
              {loading ? 'Criando conta...' : (
                <>
                  Cadastrar <ArrowRight size={20} />
                </>
              )}
            </button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Já tem uma conta?</span>
              </div>
            </div>

            <Link 
              to="/login" 
              className="flex items-center justify-center gap-2 w-full px-4 py-3.5 border-2 border-gray-100 rounded-xl text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-200 transition-all group"
            >
              <LogIn size={20} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
              Fazer Login
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}