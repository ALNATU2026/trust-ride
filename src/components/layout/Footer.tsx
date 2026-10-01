import React from 'react';
import { Car, ShieldCheck, Phone, Mail, MapPin, Heart } from 'lucide-react';

interface FooterProps {
  onSelectNav: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectNav }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Car className="w-4 h-4" />
              </div>
              <span>Trust Ride Sierra Leone</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Your Journey. Our Trust. Connecting Sierra Leone through dependable transportation, emergency SOS safety, express delivery, and inter-city commercial logistics.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-300 font-semibold pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>SLRSA Certified Commercial Partner</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Services</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onSelectNav('ride')} className="hover:text-white transition-colors">
                  Ride Hailing (Kekeh, Okada, Taxi)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectNav('delivery')} className="hover:text-white transition-colors">
                  Trust Ride Express Delivery
                </button>
              </li>
              <li>
                <button onClick={() => onSelectNav('logistics')} className="hover:text-white transition-colors">
                  Commercial Freight Logistics
                </button>
              </li>
              <li>
                <button onClick={() => onSelectNav('hire')} className="hover:text-white transition-colors">
                  Vehicle Rental & Chauffeur Hire
                </button>
              </li>
            </ul>
          </div>

          {/* Supported Cities */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Operating Hubs</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>Greater Freetown & Peninsula</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>Waterloo & Western Rural Hub</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>Bo City & Southern Corridor</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>Kenema & Eastern Hub</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>Makeni & Northern Network</span>
              </li>
            </ul>
          </div>

          {/* Safety & Contacts */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Support & Safety</h4>
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>24/7 Helpline: +232 76 100 200</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>help@trustride.sl</span>
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onSelectNav('safety')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[11px] font-semibold transition-all border border-slate-700"
                >
                  SLRSA Safety Standards
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Trust Ride Sierra Leone. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with integrity for the people of Sierra Leone</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
};
