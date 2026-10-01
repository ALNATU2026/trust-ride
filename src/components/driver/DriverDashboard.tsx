import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { InteractiveMap } from '../common/InteractiveMap';
import {
  Power,
  DollarSign,
  TrendingUp,
  Award,
  Navigation,
  CheckCircle,
  Phone,
  MessageSquare,
  AlertCircle,
  Upload,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Car,
} from 'lucide-react';

interface DriverDashboardProps {
  onOpenChat: () => void;
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({ onOpenChat }) => {
  const {
    currentDriver,
    toggleDriverOnline,
    incomingDriverRequest,
    acceptRideDriver,
    declineRideDriver,
    activeRide,
    driverArrived,
    startTrip,
    completeTrip,
    withdrawals,
    requestWithdrawal,
  } = useApp();

  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawChannel, setWithdrawChannel] = useState<'orange_money' | 'afrimoney' | 'bank_transfer'>('orange_money');
  const [withdrawAccount, setWithdrawAccount] = useState(currentDriver.phone);
  const [activeTab, setActiveTab] = useState<'console' | 'earnings' | 'documents'>('console');

  // Countdown timer for incoming request
  useEffect(() => {
    if (!incomingDriverRequest) {
      setCountdown(15);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          declineRideDriver(incomingDriverRequest.id);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [incomingDriverRequest, declineRideDriver]);

  const handleStartTripSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRide) return;
    const success = startTrip(activeRide.id, enteredOtp.trim());
    if (!success) {
      setOtpError(true);
    } else {
      setOtpError(false);
      setEnteredOtp('');
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) return;
    await requestWithdrawal(amt, withdrawChannel, withdrawAccount);
    setWithdrawAmount('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner / Online Switcher */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                Driver Terminal
              </span>
              <span className="text-xs text-slate-500 font-mono">{currentDriver.phone}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
              {currentDriver.name}
            </h1>
            <p className="text-xs text-slate-500">
              Vehicle: {currentDriver.vehicle.make} {currentDriver.vehicle.model} ({currentDriver.vehicle.plateNumber}) • {currentDriver.city}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleDriverOnline}
              className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
                currentDriver.isOnline
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{currentDriver.isOnline ? 'Online (Accepting Rides)' : 'Offline (Tap to Go Online)'}</span>
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Driver Wallet</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl font-bold font-mono text-slate-900 mt-1">
              SLE {currentDriver.walletBalance.toFixed(2)}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Driver Rating</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-xl font-bold font-mono text-slate-900 mt-1">
              ★ {currentDriver.rating.toFixed(2)}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Total Trips</span>
              <Navigation className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xl font-bold font-mono text-slate-900 mt-1">
              {currentDriver.totalTrips}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Verification</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xs font-bold text-emerald-700 mt-1">
              SLRSA Verified
            </p>
          </div>
        </div>
      </div>

      {/* INCOMING RIDE POPUP / DISPATCH ALERT */}
      {incomingDriverRequest && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-3xl p-6 shadow-2xl animate-bounce space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>
              <h3 className="text-base font-extrabold uppercase tracking-wider">
                Incoming Ride Dispatch ({countdown}s)
              </h3>
            </div>
            <span className="text-2xl font-bold font-mono">
              SLE {incomingDriverRequest.estimatedFare.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-black/15 p-4 rounded-2xl">
            <div>
              <span className="opacity-80 block text-[10px]">Pickup:</span>
              <span className="font-bold">{incomingDriverRequest.pickup.name}</span>
            </div>
            <div>
              <span className="opacity-80 block text-[10px]">Destination:</span>
              <span className="font-bold">{incomingDriverRequest.destination.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => acceptRideDriver(incomingDriverRequest.id)}
              className="flex-1 py-3 bg-white text-amber-700 font-extrabold rounded-xl text-xs shadow-md hover:bg-slate-50"
            >
              Accept Ride
            </button>
            <button
              onClick={() => declineRideDriver(incomingDriverRequest.id)}
              className="px-6 py-3 bg-black/25 text-white font-bold rounded-xl text-xs hover:bg-black/35"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE RIDE CONSOLE (If driver has accepted an active ride) */}
      {activeRide && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Active Job</span>
              <h3 className="text-base font-bold text-slate-900">
                Passenger: {activeRide.passengerName} ({activeRide.passengerPhone})
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
              {activeRide.status.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-bold">Pickup</span>
              <span className="font-semibold text-slate-800">{activeRide.pickup.name}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-bold">Destination</span>
              <span className="font-semibold text-slate-800">{activeRide.destination.name}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-bold">Estimated Fare</span>
              <span className="font-mono font-bold text-emerald-600">
                SLE {activeRide.estimatedFare.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action buttons based on status */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {activeRide.status === 'DRIVER_ACCEPTED' && (
              <button
                onClick={() => driverArrived(activeRide.id)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Mark Arrived at Pickup
              </button>
            )}

            {activeRide.status === 'DRIVER_ARRIVED' && (
              <form onSubmit={handleStartTripSubmit} className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  required
                  maxLength={4}
                  placeholder="Enter Passenger OTP"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  className="text-xs font-mono font-bold px-3 py-2 border border-slate-300 rounded-xl w-44"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  Verify OTP & Start Trip
                </button>
                {otpError && <span className="text-xs text-rose-600 font-bold">Invalid OTP</span>}
              </form>
            )}

            {activeRide.status === 'TRIP_STARTED' && (
              <button
                onClick={() => completeTrip(activeRide.id, activeRide.estimatedFare)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Complete Trip & Collect Fare
              </button>
            )}

            <button
              onClick={onOpenChat}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat with Passenger</span>
            </button>
          </div>
        </div>
      )}

      {/* Live Map Representation */}
      <InteractiveMap
        pickup={activeRide?.pickup}
        destination={activeRide?.destination}
        drivers={[currentDriver]}
        centerCity={currentDriver.city}
      />
    </div>
  );
};
