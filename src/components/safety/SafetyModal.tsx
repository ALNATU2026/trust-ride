import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ShieldCheck, AlertCircle, Phone, CheckCircle2 } from 'lucide-react';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({ isOpen, onClose }) => {
  const { createSupportTicket, currentUser } = useApp();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'SAFETY_REPORT' | 'DRIVER_BEHAVIOR' | 'RIDE_DISPUTE' | 'WALLET_PAYMENT'>('SAFETY_REPORT');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY'>('HIGH');
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSupportTicket({
      userId: currentUser.id || 'passenger',
      userName: currentUser.name || 'Passenger',
      userPhone: currentUser.phone || '+232 76 000 000',
      subject,
      description,
      category,
      priority,
    });
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-sm">SLRSA Road Safety Center & Incident Report</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSent ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-base font-bold text-slate-900">Incident Report Dispatched</h4>
            <p className="text-xs text-slate-500">
              Our Sierra Leone safety response desk has received your ticket and will follow up immediately.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-700 text-xs font-bold">
                <Phone className="w-4 h-4" />
                <span>Emergency Police Hotline: 112 / +232 76 100 200</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Incident Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
              >
                <option value="SAFETY_REPORT">Safety Hazard or Immediate Danger</option>
                <option value="DRIVER_BEHAVIOR">Driver Misconduct or Reckless Driving</option>
                <option value="RIDE_DISPUTE">Fare Dispute or Route Deviation</option>
                <option value="WALLET_PAYMENT">Payment Overcharge or Transaction Issue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                required
                placeholder="Brief summary of what happened"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Description</label>
              <textarea
                required
                rows={3}
                placeholder="Provide location, driver vehicle plate, time, and incident details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all shadow-md"
            >
              Submit Official Incident Report
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
