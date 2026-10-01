import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LocationPoint, VehicleCategory, PaymentMethod } from '../../types';
import { POPULAR_LOCATIONS } from '../../data/seedData';
import { X, MapPin, Car, ArrowRight, ShieldCheck, Check } from 'lucide-react';

interface RideBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: VehicleCategory;
  initialPickup?: LocationPoint | null;
  initialDestination?: LocationPoint | null;
}

export const RideBookingModal: React.FC<RideBookingModalProps> = ({
  isOpen,
  onClose,
  initialCategory = 'economy',
  initialPickup,
  initialDestination,
}) => {
  const { currentUser, requestRide, currentCity, pricingEngine, mapService } = useApp();

  const [pickup, setPickup] = useState<LocationPoint>(initialPickup || POPULAR_LOCATIONS[0]);
  const [destination, setDestination] = useState<LocationPoint>(initialDestination || POPULAR_LOCATIONS[1]);
  const [category, setCategory] = useState<VehicleCategory>(initialCategory);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('orange_money');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const distanceKm = mapService.calculateDistance(pickup, destination);
  const durationMinutes = mapService.calculateDurationMinutes(distanceKm, currentCity);
  const estimate = pricingEngine.calculateEstimate(category, distanceKm, durationMinutes);

  const handleConfirmRide = async () => {
    setIsSubmitting(true);
    try {
      await requestRide({
        passengerId: currentUser.id || 'guest_passenger',
        passengerName: currentUser.name || 'Passenger',
        passengerPhone: currentUser.phone || '+232 76 000 000',
        pickup,
        destination,
        category,
        estimatedFare: estimate.estimatedFare,
        distanceKm,
        durationMinutes,
        paymentMethod,
      });

      setIsSubmitting(false);
      onClose();
    } catch (e) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm">Interactive Ride Booking</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Pickup & Destination */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Pickup Location
              </label>
              <select
                value={pickup.name}
                onChange={(e) => {
                  const found = POPULAR_LOCATIONS.find((l) => l.name === e.target.value);
                  if (found) setPickup(found);
                }}
                className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-xl bg-white"
              >
                {POPULAR_LOCATIONS.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name} ({loc.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Destination
              </label>
              <select
                value={destination.name}
                onChange={(e) => {
                  const found = POPULAR_LOCATIONS.find((l) => l.name === e.target.value);
                  if (found) setDestination(found);
                }}
                className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-xl bg-white"
              >
                {POPULAR_LOCATIONS.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name} ({loc.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vehicle Category Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wider">
              Select Vehicle Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'kekeh', label: 'Kekeh', icon: '🛺' },
                { id: 'okada', label: 'Okada', icon: '🏍️' },
                { id: 'economy', label: 'Taxi', icon: '🚗' },
                { id: 'suv', label: '4x4 SUV', icon: '🚙' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id as VehicleCategory)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    category === cat.id
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                  }`}
                >
                  <span className="text-lg block">{cat.icon}</span>
                  <span className="text-[10px] block mt-0.5">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Fare Summary */}
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Estimated Upfront Fare</p>
              <p className="text-2xl font-bold font-mono text-blue-950 mt-0.5">
                SLE {estimate.estimatedFare.toFixed(2)}
              </p>
              <p className="text-[10px] text-blue-700">
                {distanceKm} km • Approx. {durationMinutes} mins
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Payment Method</span>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="text-xs font-semibold p-1.5 border border-slate-300 rounded-lg bg-white"
              >
                <option value="orange_money">Orange Money SL</option>
                <option value="afrimoney">Afrimoney SL</option>
                <option value="wallet">Trust Ride Wallet</option>
                <option value="cash">Cash to Driver</option>
              </select>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirmRide}
            disabled={isSubmitting}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <span>Dispatching Nearest SLRSA Driver...</span>
            ) : (
              <>
                <span>Confirm & Dispatch Driver</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
