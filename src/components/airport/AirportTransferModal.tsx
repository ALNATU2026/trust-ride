import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Plane, ArrowRight, ShieldCheck } from 'lucide-react';

interface AirportTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AirportTransferModal: React.FC<AirportTransferModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, bookAirportTransfer } = useApp();

  const [flightNumber, setFlightNumber] = useState('KP 041');
  const [passengerCount, setPassengerCount] = useState('2');
  const [transferType, setTransferType] = useState<'water_taxi_speed' | 'vehicle_sea_coach' | 'private_executive_suv'>('water_taxi_speed');
  const [originOrDestination, setOriginOrDestination] = useState('Aberdeen Sea Coach Terminal &rarr; Lungi Airport');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const totalFare = transferType === 'private_executive_suv' ? 450 : 180;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await bookAirportTransfer({
        userId: currentUser.id || 'guest_traveler',
        flightNumber,
        flightTime: '14:30 GMT',
        passengerCount: parseInt(passengerCount) || 1,
        transferType,
        originOrDestination,
        totalFare,
      });

      setIsSubmitting(false);
      onClose();
    } catch (e) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm">Freetown International Airport (Lungi) Transfer</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Flight Number</label>
              <input
                type="text"
                required
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                placeholder="e.g. SN 241"
                className="w-full text-xs font-mono p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Passengers</label>
              <input
                type="number"
                min="1"
                max="8"
                value={passengerCount}
                onChange={(e) => setPassengerCount(e.target.value)}
                className="w-full text-xs font-mono p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Transfer Connection Type</label>
            <select
              value={transferType}
              onChange={(e) => setTransferType(e.target.value as any)}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
            >
              <option value="water_taxi_speed">Sea Coach / Water Taxi Speed Ferry</option>
              <option value="vehicle_sea_coach">Vehicle & Sea Coach Integrated Combo</option>
              <option value="private_executive_suv">Private Executive VIP 4x4 Chauffeur</option>
            </select>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-800">Fixed Transfer Fare</span>
              <p className="text-xl font-bold font-mono text-amber-950">SLE {totalFare.toFixed(2)}</p>
            </div>
            <span className="text-xs font-bold text-amber-700">Flight Tracked</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <span>Book Airport Transfer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
