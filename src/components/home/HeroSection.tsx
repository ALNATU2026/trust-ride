import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Car,
  ShieldCheck,
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
  Smartphone,
  Navigation,
} from 'lucide-react';

interface HeroSectionProps {
  onStartBooking: () => void;
  onOpenDriverModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartBooking, onOpenDriverModal }) => {
  const { currentCity, setCurrentCity, cityAvailability } = useApp();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white py-16 sm:py-24">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-blue-600/10 blur-3xl pointer-events-none rounded-full"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & Call to actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-semibold backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Sierra Leone's Most Trusted Ride Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight leading-[1.1]">
              Your Journey. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-300">
                Our Trust.
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              From Freetown streets to inter-district journeys across Waterloo, Bo, Kenema and Makeni. Verified drivers, instant Orange Money & Afrimoney mobile payments, transparent fares, and SLRSA emergency safety monitoring.
            </p>

            {/* City Hub Switcher */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                Select City:
              </span>
              {cityAvailability.map((city) => (
                <button
                  key={city.city}
                  onClick={() => setCurrentCity(city.city)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    currentCity === city.city
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  {city.city}
                </button>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
              <button
                onClick={onStartBooking}
                className="px-7 py-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold rounded-2xl text-sm transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                <span>Book a Ride Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenDriverModal}
                className="px-6 py-4 bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white font-bold rounded-2xl text-sm transition-all border border-white/10 flex items-center justify-center gap-2"
              >
                <Car className="w-4 h-4 text-emerald-400" />
                <span>Drive with Trust Ride</span>
              </button>
            </div>

            {/* Trust Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800">
              <div>
                <p className="text-2xl font-bold font-mono text-white">100%</p>
                <p className="text-[11px] text-slate-400">SLRSA Inspected</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-emerald-400">0%</p>
                <p className="text-[11px] text-slate-400">Hidden Fees</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-blue-400">24/7</p>
                <p className="text-[11px] text-slate-400">Live SOS Support</p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Platform Card */}
          <div className="lg:col-span-5">
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Trust Ride Dispatch</h3>
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>Active in {currentCity}</span>
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-400/20">
                  Instant Dispatch
                </span>
              </div>

              {/* Ride Options Preview */}
              <div className="space-y-2.5">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                      🛺
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Kekeh Tricycle</p>
                      <p className="text-[10px] text-slate-400">Fast urban navigation</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono text-emerald-400">From SLE 15</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                      🚗
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Standard Taxi Cab</p>
                      <p className="text-[10px] text-slate-400">Comfortable city ride</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono text-emerald-400">From SLE 25</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                      🚙
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Executive 4x4 SUV</p>
                      <p className="text-[10px] text-slate-400">Luxury, AC & intercity</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono text-emerald-400">From SLE 80</span>
                </div>
              </div>

              {/* Mobile Money Badges */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
                <span>Integrated Mobile Money:</span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20 text-[10px]">
                    Orange Money
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 font-bold border border-rose-500/20 text-[10px]">
                    Afrimoney
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
