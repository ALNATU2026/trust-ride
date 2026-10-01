import React from 'react';
import { Car, Package, Truck, Key, Plane, ShieldCheck, ArrowRight } from 'lucide-react';

interface ServicesSectionProps {
  onSelectService: (serviceId: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  const services = [
    {
      id: 'ride',
      title: 'Ride Hailing',
      description: 'Book verified Kekeh, Okada, and Taxi rides across Freetown, Waterloo, Bo, Kenema and Makeni.',
      icon: Car,
      tag: 'Instant Dispatch',
      color: 'bg-blue-600 text-white',
    },
    {
      id: 'delivery',
      title: 'Trust Ride Parcel Delivery',
      description: 'Secure doorstep dispatch for documents, packages, groceries and goods with 4-digit recipient OTP proof.',
      icon: Package,
      tag: 'Same Day',
      color: 'bg-emerald-600 text-white',
    },
    {
      id: 'logistics',
      title: 'Commercial Cargo Logistics',
      description: 'Heavy freight, container moving, building materials and inter-city commercial trucks.',
      icon: Truck,
      tag: 'Countrywide',
      color: 'bg-indigo-600 text-white',
    },
    {
      id: 'hire',
      title: 'Vehicle Hire & Chauffeur',
      description: 'Rent 4x4 SUVs, executive luxury sedans, and passenger minibuses hourly or daily with certified chauffeurs.',
      icon: Key,
      tag: 'Daily / Hourly',
      color: 'bg-purple-600 text-white',
    },
    {
      id: 'airport',
      title: 'Airport Transfers (Lungi)',
      description: 'Coordinated transfers between Freetown, Aberdeen Sea Coach, Kissy Ferry and Freetown International Airport.',
      icon: Plane,
      tag: 'Sea & Road',
      color: 'bg-amber-600 text-white',
    },
    {
      id: 'safety',
      title: 'SLRSA Road Safety Center',
      description: 'Emergency SOS beacon, driver background inspections, and full compliance with Sierra Leone transport laws.',
      icon: ShieldCheck,
      tag: '24/7 Monitored',
      color: 'bg-rose-600 text-white',
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Comprehensive Transportation
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight">
            Services Built for Sierra Leone
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Whether commuting through Freetown traffic, sending parcels across districts, or moving commercial freight countrywide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc) => {
            const Icon = svc.icon;
            return (
              <div
                key={svc.id}
                onClick={() => onSelectService(svc.id)}
                className="group p-6 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${svc.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {svc.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {svc.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {svc.description}
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-blue-600">
                  <span>Open Service</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
