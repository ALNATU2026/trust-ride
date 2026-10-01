import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wallet,
  Car,
  Package,
  Truck,
  Key,
  ShieldAlert,
  ArrowRight,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  Copy,
  Check,
  PlusCircle,
  Phone,
  User,
  LogIn,
} from 'lucide-react';

interface RiderDashboardProps {
  onOpenBooking: () => void;
  onOpenDelivery: () => void;
  onOpenLogistics: () => void;
  onOpenHire: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const RiderDashboard: React.FC<RiderDashboardProps> = ({
  onOpenBooking,
  onOpenDelivery,
  onOpenLogistics,
  onOpenHire,
  onOpenAuth,
}) => {
  const {
    currentUser,
    isAuthenticated,
    pastRides,
    activeRide,
    depositToWallet,
    triggerEmergencySos,
    deliveries,
  } = useApp();

  const [depositAmount, setDepositAmount] = useState('50');
  const [depositChannel, setDepositChannel] = useState<'orange_money' | 'afrimoney'>('orange_money');
  const [depositPhone, setDepositPhone] = useState(currentUser.phone || '');
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositNotice, setDepositNotice] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // If user is not authenticated, show sign-in prompt
  if (!isAuthenticated || !currentUser.id) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
            Sign In to Access Customer Dashboard
          </h2>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            Manage your SLE wallet, view real-time trip history, track ongoing deliveries, and access your personal referral perks.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => onOpenAuth('login')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Trust Ride</span>
          </button>
          <button
            onClick={() => onOpenAuth('register')}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl text-xs transition-all border border-slate-200"
          >
            Create New Account
          </button>
        </div>
      </div>
    );
  }

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) return;

    setIsDepositing(true);
    setDepositNotice(null);
    try {
      const intent = await depositToWallet(amt, depositChannel, depositPhone || currentUser.phone);
      setDepositNotice(intent.instructions);
    } catch (err: any) {
      setDepositNotice(err.message || 'Deposit failed. Please check mobile connection.');
    } finally {
      setIsDepositing(false);
    }
  };

  const copyReferral = () => {
    if (currentUser.referralCode) {
      navigator.clipboard.writeText(currentUser.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Active Trip Tracker Card (Conditionally shown if active ride exists) */}
      {activeRide && (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-blue-800 animate-in fade-in duration-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
                Active Trip in Progress
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/20">
              Status: {activeRide.status.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Pickup Location</p>
              <p className="text-xs font-bold text-white mt-0.5">{activeRide.pickup.name}</p>
              <p className="text-[11px] text-slate-300">{activeRide.pickup.address}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Destination</p>
              <p className="text-xs font-bold text-white mt-0.5">{activeRide.destination.name}</p>
              <p className="text-[11px] text-slate-300">{activeRide.destination.address}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Fare & Security OTP</p>
              <p className="text-xs font-bold font-mono text-emerald-400 mt-0.5">
                SLE {activeRide.estimatedFare.toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-300 font-mono">
                Verification OTP: <strong className="text-white bg-blue-600 px-1.5 py-0.5 rounded">{activeRide.otp}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profile & Wallet Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                Customer Account
              </span>
              <span className="text-xs text-slate-500 font-mono">{currentUser.phone}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
              Welcome back, {currentUser.name}!
            </h1>
            <p className="text-xs text-slate-500">
              Manage your personal Trust Ride wallet, track parcel dispatches, and book trips.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerEmergencySos('Customer Emergency SOS Beacon')}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-2xl text-xs transition-all border border-rose-200 flex items-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Emergency SOS</span>
            </button>
          </div>
        </div>

        {/* Financials & Referral Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {/* Wallet Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold opacity-90">Trust Ride Wallet Balance</span>
              <Wallet className="w-4 h-4 opacity-80" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono">
              SLE {currentUser.walletBalance.toFixed(2)}
            </p>
            <p className="text-[10px] opacity-80">Instant fare deduction with zero cash needed</p>
          </div>

          {/* Completed Trips */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs text-slate-500 font-medium">Completed Trips</span>
            <p className="text-2xl font-bold font-mono text-slate-900">{pastRides.length}</p>
            <p className="text-[10px] text-slate-400">All trips verified with 4-digit SLRSA OTP</p>
          </div>

          {/* Referral Code */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs text-slate-500 font-medium">Your Referral Code</span>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-lg font-bold font-mono text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                {currentUser.referralCode || 'TRSL2026'}
              </span>
              <button
                onClick={copyReferral}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Copy referral code"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400">Share with friends to earn SLE 15 wallet credit</p>
          </div>
        </div>
      </div>

      {/* Quick Services Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onOpenBooking}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-left flex items-center justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
              <Car className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900 block">Book Ride</span>
            <span className="text-[10px] text-slate-500">Kekeh, Okada, Taxi</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={onOpenDelivery}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all text-left flex items-center justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
              <Package className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900 block">Send Parcel</span>
            <span className="text-[10px] text-slate-500">Express doorstep</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={onOpenLogistics}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all text-left flex items-center justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2">
              <Truck className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900 block">Heavy Cargo</span>
            <span className="text-[10px] text-slate-500">Inter-district trucks</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={onOpenHire}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all text-left flex items-center justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-2">
              <Key className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900 block">Vehicle Hire</span>
            <span className="text-[10px] text-slate-500">4x4 SUVs & Minibuses</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Main Grid: Wallet Deposit & Trip History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Deposit Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Top Up Wallet (Mobile Money)
            </h3>
          </div>

          <form onSubmit={handleDepositSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Mobile Money Operator
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDepositChannel('orange_money')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                    depositChannel === 'orange_money'
                      ? 'border-amber-500 bg-amber-50 text-amber-900 ring-1 ring-amber-500'
                      : 'border-slate-200 text-slate-700 bg-white'
                  }`}
                >
                  Orange Money SL
                </button>
                <button
                  type="button"
                  onClick={() => setDepositChannel('afrimoney')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                    depositChannel === 'afrimoney'
                      ? 'border-rose-500 bg-rose-50 text-rose-900 ring-1 ring-rose-500'
                      : 'border-slate-200 text-slate-700 bg-white'
                  }`}
                >
                  Afrimoney SL
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Deposit Amount (SLE)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center font-bold font-mono text-xs text-slate-400">
                  SLE
                </span>
                <input
                  type="number"
                  required
                  min="5"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full text-xs font-mono font-bold pl-12 pr-3 py-2.5 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Money Phone Number</label>
              <input
                type="tel"
                required
                value={depositPhone}
                onChange={(e) => setDepositPhone(e.target.value)}
                placeholder="+232 76 123 456"
                className="w-full text-xs font-mono pl-3 py-2.5 border border-slate-200 rounded-xl"
              />
            </div>

            {depositNotice && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                <p className="font-bold">USSD Instructions:</p>
                <p>{depositNotice}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isDepositing}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isDepositing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Connecting to Mobile Money Gateway...</span>
                </>
              ) : (
                <span>Confirm Instant Deposit</span>
              )}
            </button>
          </form>
        </div>

        {/* Trip History Table */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                My Trip History ({pastRides.length})
              </h3>
            </div>
          </div>

          {pastRides.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Car className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">No Past Trips Yet</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Your rides across Freetown, Bo, Kenema, and Makeni will be permanently stored in MongoDB and tracked here in real time.
              </p>
              <button
                onClick={onOpenBooking}
                className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Book Your First Trip
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pastRides.map((ride) => (
                <div key={ride.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">
                      {ride.pickup.name} &rarr; {ride.destination.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {new Date(ride.createdAt).toLocaleDateString()} • {ride.category.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold font-mono text-slate-900">
                      SLE {(ride.actualFare || ride.estimatedFare).toFixed(2)}
                    </p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      {ride.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
