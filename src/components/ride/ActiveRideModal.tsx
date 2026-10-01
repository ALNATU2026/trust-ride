import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, ShieldAlert, Phone, MessageSquare, Car, MapPin, CheckCircle, Star } from 'lucide-react';

interface ActiveRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChat: () => void;
}

export const ActiveRideModal: React.FC<ActiveRideModalProps> = ({ isOpen, onClose, onOpenChat }) => {
  const { activeRide, cancelRide, triggerEmergencySos, openFeedbackModal } = useApp();

  if (!isOpen || !activeRide) return null;

  const isCompleted = activeRide.status === 'TRIP_COMPLETED' || activeRide.status === 'RATED';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-emerald-400 animate-ping'}`}></span>
            <h3 className="font-bold text-sm">
              {isCompleted ? 'Trip Summary' : 'Live Trip Tracking'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-center py-2 space-y-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              isCompleted
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-blue-50 text-blue-600 border-blue-100'
            }`}>
              {activeRide.status.replace(/_/g, ' ')}
            </span>
            <h4 className="text-base font-bold text-slate-900">
              {activeRide.pickup.name} &rarr; {activeRide.destination.name}
            </h4>
          </div>

          {isCompleted ? (
            /* Completed Trip Summary & Post-Ride Feedback Prompt */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h5 className="font-bold text-sm text-emerald-950">You Have Arrived at Your Destination!</h5>
                <p className="text-xs text-emerald-800">
                  Total Fare: <strong className="font-mono text-emerald-950 text-sm">SLE {(activeRide.actualFare || activeRide.estimatedFare || 35).toFixed(2)}</strong>
                </p>
              </div>

              {activeRide.riderFeedback ? (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1 text-amber-900 font-bold text-xs">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>You Rated This Trip {activeRide.riderFeedback.rating}.0 Stars</span>
                  </div>
                  {activeRide.riderFeedback.comment && (
                    <p className="text-xs text-amber-800 italic">"{activeRide.riderFeedback.comment}"</p>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    openFeedbackModal(activeRide, 'rider');
                  }}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Star className="w-4 h-4 fill-white" />
                  <span>Rate Your Driver & Submit Review</span>
                </button>
              )}
            </div>
          ) : (
            /* Ongoing OTP Box */
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-1">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                Your 4-Digit Security OTP
              </span>
              <p className="text-3xl font-extrabold font-mono text-amber-950 tracking-widest">
                {activeRide.otp}
              </p>
              <p className="text-[10px] text-amber-700">Give this OTP to your driver upon entering the vehicle.</p>
            </div>
          )}

          {/* Driver Info */}
          {activeRide.driver && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{activeRide.driver.name}</p>
                  <p className="text-[10px] font-mono text-slate-500">
                    {activeRide.driver.vehicle.make} • {activeRide.driver.vehicle.plateNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenChat}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                  title="Chat with Driver"
                >
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                </button>
              </div>
            </div>
          )}

          {/* Emergency SOS & Cancel (only for active rides) */}
          {!isCompleted && (
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => triggerEmergencySos(`Active trip #${activeRide.id} emergency SOS beacon.`)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Emergency SOS</span>
              </button>
              <button
                onClick={() => cancelRide(activeRide.id, 'Cancelled by passenger')}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
