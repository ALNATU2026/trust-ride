import React from 'react';
import { MapPin, CheckCircle, ShieldCheck, CreditCard } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Set Your Destination',
      desc: 'Choose your pickup and drop-off anywhere in Freetown, Waterloo, Bo, Kenema or Makeni.',
      icon: MapPin,
    },
    {
      num: '02',
      title: 'Choose Vehicle & Upfront Fare',
      desc: 'Select from Kekeh, Okada, Economy Cab, or 4x4 SUV. Transparent fares with zero surge surprises.',
      icon: CreditCard,
    },
    {
      num: '03',
      title: 'Track Verified Driver & Verify OTP',
      desc: 'Watch your SLRSA certified driver arrive in real time. Provide your 4-digit OTP to start the journey.',
      icon: CheckCircle,
    },
    {
      num: '04',
      title: 'Pay Seamlessly with Mobile Money',
      desc: 'Settle directly using Orange Money SL, Afrimoney, or Trust Ride Wallet balance.',
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
            How Trust Ride Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Four simple steps to secure, verified transportation across Sierra Leone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div key={st.num} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-extrabold font-mono text-blue-600">{st.num}</span>
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{st.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
