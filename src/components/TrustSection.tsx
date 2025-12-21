import { Truck, Shield, CreditCard } from 'lucide-react';

export default function TrustSection() {
  return (
    <div className="bg-blue-950 py-16 border-t border-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="bg-blue-600 p-4 rounded-full shadow-lg shadow-blue-900/50">
              <Truck className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-white">Entrega Rápida</h3>
            <p className="text-blue-100">
              Frete grátis em todos os pedidos. Receba seus óculos em 3-5 dias úteis.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="bg-blue-600 p-4 rounded-full shadow-lg shadow-blue-900/50">
              <Shield className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-white">1 Ano de Garantia</h3>
            <p className="text-blue-100">
              Todas as nossas armações vêm com uma garantia completa de 1 ano para sua tranquilidade.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="bg-blue-600 p-4 rounded-full shadow-lg shadow-blue-900/50">
              <CreditCard className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-white">Pagamento Seguro</h3>
            <p className="text-blue-100">
              Suas informações de pagamento são criptografadas e seguras com proteção padrão da indústria.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
