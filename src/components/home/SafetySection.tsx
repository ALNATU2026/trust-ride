import React from 'react';
import { ShieldCheck, AlertCircle, Phone, Lock, HeartHandshake, Eye } from 'lucide-react';

interface SafetySectionProps {
  onOpenSafetyModal: () => void;
}

export const SafetySection: React.FC<SafetySectionProps> = ({ onOpenSafetyModal }) => {
  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <span>SLRSA Safety & Emergency Protocol</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight">
              Safety Built Into Every Single Trip
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Every driver undergoes Sierra Leone Police clearance and SLRSA commercial roadworthiness verification. Our live emergency SOS beacon alerts family members and law enforcement with exact GPS coordinates.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">4-Digit Security OTP</h4>
                  <p className="text-[11px] text-slate-400">Driver cannot initiate trip without passenger verification.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Instant 24/7 SOS Beacon</h4>
                  <p className="text-[11px] text-slate-400">One-touch emergency dispatch to Sierra Leone emergency services.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={onOpenSafetyModal}
                className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl text-xs transition-all shadow-lg flex items-center gap-2"
              >
                <span>Read SLRSA Safety Guidelines & Report Incident</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
