import { MailCheck } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

export default function AuthNotificationPage() {
  const location = useLocation();
  const message = location.state?.message || 'Se precisar de ajuda, entre em contato com o suporte.';
  const title = location.state?.title || 'Verifique seu E-mail';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      <div className="bg-white p-10 rounded-2xl shadow-lg max-w-lg">
        <MailCheck className="text-blue-500 h-20 w-20 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
        <p className="text-gray-600 mb-8">
          {message}
        </p>
        <Link
          to="/login"
          className="inline-block bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-8 rounded-lg transition-all"
        >
          Voltar para o Login
        </Link>
      </div>
    </div>
  );
}
