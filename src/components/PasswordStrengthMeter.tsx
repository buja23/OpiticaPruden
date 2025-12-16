import { useMemo } from 'react';

interface Props {
  password?: string;
}

export default function PasswordStrengthMeter({ password = '' }: Props) {
  const { score, label, color } = useMemo(() => {
    let score = 0;
    if (!password) return { score: 0, label: '', color: 'bg-gray-200' };

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    let label = 'Muito Fraca';
    let color = 'bg-red-500';

    if (score > 2) {
      label = 'Fraca';
      color = 'bg-orange-500';
    }
    if (score > 3) {
      label = 'Média';
      color = 'bg-yellow-500';
    }
    if (score > 4) {
      label = 'Forte';
      color = 'bg-green-500';
    }

    return { score, label, color };
  }, [password]);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="grid grid-cols-5 gap-1.5">
        {Array.from(Array(5).keys()).map((i) => (
          <div key={i} className={`h-1.5 rounded-full transition-colors ${i < score ? color : 'bg-gray-200'}`}></div>
        ))}
      </div>
      <p className={`text-xs font-medium ${score > 2 ? 'text-gray-600' : 'text-red-600'}`}>
        Força da senha: {label}
      </p>
    </div>
  );
}