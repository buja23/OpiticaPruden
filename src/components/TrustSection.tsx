import { Truck, Shield, CreditCard } from 'lucide-react';

export default function TrustSection() {
  return (
    <div className="bg-slate-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="bg-blue-500 p-4 rounded-full">
              <Truck className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Fast Delivery</h3>
            <p className="text-gray-300">
              Free shipping on all orders. Get your glasses delivered within 3-5 business days.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="bg-blue-500 p-4 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">1 Year Warranty</h3>
            <p className="text-gray-300">
              All our frames come with a comprehensive 1-year warranty for your peace of mind.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="bg-blue-500 p-4 rounded-full">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Secure Payment</h3>
            <p className="text-gray-300">
              Your payment information is encrypted and secure with industry-standard protection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
