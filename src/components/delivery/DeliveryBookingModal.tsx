import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Package, ArrowRight, ShieldCheck } from 'lucide-react';
import { PaymentMethod } from '../../types';

interface DeliveryBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeliveryBookingModal: React.FC<DeliveryBookingModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, createDeliveryOrder, currentCity } = useApp();

  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [packageDescription, setPackageDescription] = useState('');
  const [packageType, setPackageType] = useState<'documents' | 'food' | 'electronics' | 'parcel' | 'fragile'>('documents');
  const [pickupAddress, setPickupAddress] = useState('Wilkinson Road, Freetown');
  const [deliveryAddress, setDeliveryAddress] = useState('Lumley Beach Road, Aberdeen');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('orange_money');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOtp, setCreatedOtp] = useState<string | null>(null);

  if (!isOpen) return null;

  const deliveryFee = 25.0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const order = await createDeliveryOrder({
        senderId: currentUser.id || 'guest_sender',
        senderName: currentUser.name || 'Sender',
        senderPhone: currentUser.phone || '+232 76 000 000',
        recipientName,
        recipientPhone,
        packageDescription,
        packageType,
        weightKg: 2,
        pickupAddress,
        deliveryAddress,
        city: currentCity,
        deliveryFee,
        paymentMethod,
      });

      setCreatedOtp(order.recipientOtp);
      setTimeout(() => {
        setIsSubmitting(false);
        setCreatedOtp(null);
        onClose();
      }, 2000);
    } catch (e) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">Trust Ride Parcel Dispatch</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdOtp ? (
          <div className="p-8 text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-base font-bold text-slate-900">Parcel Order Dispatched!</h4>
            <p className="text-xs text-slate-500">
              Recipient Verification OTP:{' '}
              <strong className="text-slate-900 font-mono text-sm bg-slate-100 px-2 py-0.5 rounded">
                {createdOtp}
              </strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fatu Koroma"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Phone (+232)</label>
                <input
                  type="tel"
                  required
                  placeholder="+232 78 456 789"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full text-xs font-mono p-2.5 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Package Description</label>
              <input
                type="text"
                required
                placeholder="e.g. Legal documents & office envelope"
                value={packageDescription}
                onChange={(e) => setPackageDescription(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pickup Address</label>
                <input
                  type="text"
                  required
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Address</label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800">Fixed Dispatch Fee</span>
                <p className="text-xl font-bold font-mono text-emerald-950">SLE {deliveryFee.toFixed(2)}</p>
              </div>
              <span className="text-xs font-bold text-emerald-700">Doorstep Delivery</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span>Confirm & Dispatch Parcel</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
