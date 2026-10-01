import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Key, CheckCircle2, ShieldCheck } from 'lucide-react';

interface VehicleHireModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VehicleHireModal: React.FC<VehicleHireModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, vehiclesForHire, bookVehicleHire, currentCity } = useApp();

  const [selectedVehicle, setSelectedVehicle] = useState(vehiclesForHire[0] || null);
  const [durationDays, setDurationDays] = useState('2');
  const [withChauffeur, setWithChauffeur] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !selectedVehicle) return null;

  const total = selectedVehicle.dailyRate * (parseInt(durationDays) || 1);

  const handleBooking = async () => {
    setIsSubmitting(true);
    try {
      await bookVehicleHire({
        userId: currentUser.id || 'guest_renter',
        vehicleId: selectedVehicle.id,
        category: selectedVehicle.category,
        make: selectedVehicle.make,
        model: selectedVehicle.model,
        startDate: new Date().toISOString().split('T')[0],
        durationDays: parseInt(durationDays) || 1,
        withChauffeur,
        city: currentCity,
        totalPrice: total,
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsSubmitting(false);
        onClose();
      }, 1500);
    } catch (e) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-sm">Vehicle Rental & Chauffeur Hire</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-base font-bold text-slate-900">Rental Reserved Successfully!</h4>
            <p className="text-xs text-slate-500">Your vehicle hire confirmation has been dispatched.</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Select Fleet Vehicle
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {vehiclesForHire.map((vh) => (
                  <div
                    key={vh.id}
                    onClick={() => setSelectedVehicle(vh)}
                    className={`p-3 rounded-2xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                      selectedVehicle.id === vh.id
                        ? 'border-purple-600 bg-purple-50 text-purple-950 ring-1 ring-purple-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-bold">{vh.make} {vh.model} ({vh.year})</p>
                      <p className="text-[10px] text-slate-500">{vh.plateNumber} • {vh.seats} Seats</p>
                    </div>
                    <span className="font-mono font-bold text-purple-700">SLE {vh.dailyRate}/day</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rental Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="w-full text-xs font-mono p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={withChauffeur}
                    onChange={(e) => setWithChauffeur(e.target.checked)}
                    className="rounded border-slate-300 text-purple-600"
                  />
                  <span>Include SLRSA Chauffeur</span>
                </label>
              </div>
            </div>

            <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-800">Total Rental Rate</span>
                <p className="text-xl font-bold font-mono text-purple-950">SLE {total.toFixed(2)}</p>
              </div>
              <span className="text-xs font-bold text-purple-700">{durationDays} Days Duration</span>
            </div>

            <button
              onClick={handleBooking}
              disabled={isSubmitting}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-all shadow-md disabled:opacity-60"
            >
              Confirm Vehicle Reservation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
