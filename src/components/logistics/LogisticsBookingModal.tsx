import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Truck, ArrowRight } from 'lucide-react';

interface LogisticsBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogisticsBookingModal: React.FC<LogisticsBookingModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, createLogisticsBooking } = useApp();

  const [cargoType, setCargoType] = useState('Construction Materials');
  const [weightTons, setWeightTons] = useState('3.5');
  const [truckType, setTruckType] = useState<'van' | 'box_truck' | 'flatbed' | 'tipper_truck'>('box_truck');
  const [originCity, setOriginCity] = useState('Freetown');
  const [destinationCity, setDestinationCity] = useState('Bo');
  const [pickupDate, setPickupDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const estimatedPrice = 850.0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createLogisticsBooking({
        customerId: currentUser.id || 'guest_client',
        customerName: currentUser.name || 'Commercial Client',
        customerPhone: currentUser.phone || '+232 76 000 000',
        cargoType,
        weightTons: parseFloat(weightTons) || 1,
        truckType,
        originCity,
        destinationCity,
        pickupDate,
        totalPrice: estimatedPrice,
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
            <Truck className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm">Commercial Freight & Cargo</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Cargo Type</label>
            <input
              type="text"
              required
              value={cargoType}
              onChange={(e) => setCargoType(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Weight (Tons)</label>
              <input
                type="number"
                step="0.5"
                required
                value={weightTons}
                onChange={(e) => setWeightTons(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Truck Requirement</label>
              <select
                value={truckType}
                onChange={(e) => setTruckType(e.target.value as any)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
              >
                <option value="box_truck">Box Cargo Truck</option>
                <option value="van">Freight Delivery Van</option>
                <option value="flatbed">Flatbed Hauler</option>
                <option value="tipper_truck">Tipper Truck</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Origin City</label>
              <select
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
              >
                <option value="Freetown">Freetown</option>
                <option value="Waterloo">Waterloo</option>
                <option value="Bo">Bo</option>
                <option value="Kenema">Kenema</option>
                <option value="Makeni">Makeni</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Destination City</label>
              <select
                value={destinationCity}
                onChange={(e) => setDestinationCity(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
              >
                <option value="Bo">Bo</option>
                <option value="Kenema">Kenema</option>
                <option value="Makeni">Makeni</option>
                <option value="Freetown">Freetown</option>
                <option value="Waterloo">Waterloo</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-800">Estimated Freight Cost</span>
              <p className="text-xl font-bold font-mono text-indigo-950">SLE {estimatedPrice.toFixed(2)}</p>
            </div>
            <span className="text-xs font-bold text-indigo-700">Inter-District</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <span>Book Commercial Freight</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
