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
  Star,
  ThumbsUp,
  User,
  Sparkles,
  FileText,
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
    driverPastRides,
    openFeedbackModal,
  } = useApp();

  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawChannel, setWithdrawChannel] = useState<'orange_money' | 'afrimoney' | 'bank_transfer'>('orange_money');
  const [withdrawAccount, setWithdrawAccount] = useState(currentDriver.phone);
  const [activeTab, setActiveTab] = useState<'console' | 'trips' | 'earnings' | 'documents'>('console');

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

  const totalReviewsCount = driverPastRides.filter((r) => r.riderFeedback).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner / Driver Card */}
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

          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200">
            <div className="flex items-center justify-between text-xs text-amber-900 font-bold">
              <span>Driver Rating</span>
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <p className="text-xl font-bold font-mono text-amber-950">
                ★ {currentDriver.rating ? currentDriver.rating.toFixed(2) : '5.00'}
              </p>
              <span className="text-[10px] text-amber-800">({totalReviewsCount} reviews)</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Total Trips</span>
              <Navigation className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xl font-bold font-mono text-slate-900 mt-1">
              {driverPastRides.length || currentDriver.totalTrips}
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

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-100 text-xs font-bold">
          <button
            onClick={() => setActiveTab('console')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'console'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Dispatch Console
          </button>
          <button
            onClick={() => setActiveTab('trips')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'trips'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Trips & Passenger Reviews ({driverPastRides.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'earnings'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Earnings & Payouts
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'documents'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Compliance Documents
          </button>
        </div>
      </div>

      {/* TAB 1: DISPATCH CONSOLE & MAP */}
      {activeTab === 'console' && (
        <div className="space-y-6">
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

          {/* ACTIVE RIDE CONSOLE */}
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
      )}

      {/* TAB 2: COMPLETED TRIPS & PASSENGER REVIEWS */}
      {activeTab === 'trips' && (
        <div className="space-y-6">
          {/* Driver Reputation Summary Banner */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <h3 className="text-lg font-bold text-slate-900 font-display">
                    Driver Reputation & Feedback Score
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Reviews submitted by passengers following trip completion across Freetown, Bo, Kenema, and Makeni.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl">
                <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                <div>
                  <p className="text-xl font-extrabold font-mono text-amber-950">
                    ★ {currentDriver.rating ? currentDriver.rating.toFixed(2) : '5.00'}
                  </p>
                  <p className="text-[10px] text-amber-800 font-semibold uppercase tracking-wider">
                    {totalReviewsCount} Passenger Ratings
                  </p>
                </div>
              </div>
            </div>

            {/* Top Driver Badges */}
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Safe Driving</p>
                <p className="font-bold text-slate-900 mt-0.5">100% Positive</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Clean Vehicle</p>
                <p className="font-bold text-slate-900 mt-0.5">98% Positive</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Polite & Courteous</p>
                <p className="font-bold text-slate-900 mt-0.5">99% Positive</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Fast Route Navigation</p>
                <p className="font-bold text-slate-900 mt-0.5">97% Positive</p>
              </div>
            </div>
          </div>

          {/* List of Completed Trips & Mutual Reviews */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Completed Dispatches & Review History ({driverPastRides.length})
                </h3>
              </div>
            </div>

            {driverPastRides.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Car className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No Trips Completed Yet</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  When you accept rides and complete fares, each trip along with passenger star ratings and reviews will be tracked here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 space-y-4">
                {driverPastRides.map((ride) => {
                  const hasDriverRated = Boolean(ride.driverFeedback);
                  const isEligibleToRatePassenger = !hasDriverRated && (ride.status === 'TRIP_COMPLETED' || ride.status === 'RATED');

                  return (
                    <div key={`driver_ride_${ride.id}`} className="pt-4 first:pt-0 space-y-3">
                      <div className="flex items-start justify-between text-xs">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 text-sm">
                            {ride.pickup.name} &rarr; {ride.destination.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                            <span>{new Date(ride.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-700">Passenger: {ride.passengerName}</span>
                            <span>•</span>
                            <span className="font-mono">{ride.passengerPhone}</span>
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <p className="font-bold font-mono text-emerald-600 text-sm">
                            SLE {(ride.actualFare || ride.estimatedFare || 35).toFixed(2)}
                          </p>
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              ride.status === 'RATED'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {ride.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Mutual Review Block */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                        {/* Passenger's Review on Driver */}
                        <div className="space-y-1.5 p-3 rounded-xl bg-white border border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Passenger Review on You
                            </span>
                            {ride.riderFeedback ? (
                              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                <span className="font-bold text-amber-900 font-mono">
                                  {ride.riderFeedback.rating}.0
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Pending rider review</span>
                            )}
                          </div>

                          {ride.riderFeedback?.tags && ride.riderFeedback.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {ride.riderFeedback.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md font-medium text-slate-700"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {ride.riderFeedback?.comment ? (
                            <p className="text-xs text-slate-600 italic">
                              "{ride.riderFeedback.comment}"
                            </p>
                          ) : null}
                        </div>

                        {/* Driver's Review on Passenger */}
                        <div className="space-y-1.5 p-3 rounded-xl bg-white border border-slate-100 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                Your Feedback on Passenger
                              </span>
                              {hasDriverRated && ride.driverFeedback ? (
                                <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                  <span className="font-bold text-indigo-900 font-mono">
                                    {ride.driverFeedback.rating}.0
                                  </span>
                                </div>
                              ) : null}
                            </div>

                            {hasDriverRated && ride.driverFeedback?.tags && ride.driverFeedback.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {ride.driverFeedback.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-[10px] bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md font-medium text-indigo-700"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {hasDriverRated && ride.driverFeedback?.comment && (
                              <p className="text-xs text-slate-600 italic mt-1">
                                "{ride.driverFeedback.comment}"
                              </p>
                            )}
                          </div>

                          {isEligibleToRatePassenger && (
                            <div className="pt-2 flex items-center justify-between">
                              <span className="text-[11px] text-slate-500 font-medium">
                                Rate passenger courtesy & readiness
                              </span>
                              <button
                                onClick={() => openFeedbackModal(ride, 'driver')}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
                              >
                                <Star className="w-3.5 h-3.5 fill-white" />
                                <span>Rate Passenger</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: EARNINGS & WITHDRAW */}
      {activeTab === 'earnings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Withdrawal Form */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Request Payout (Mobile Money)
            </h3>
            <p className="text-xs text-slate-500">
              Withdraw your fare earnings directly into your Orange Money or Afrimoney account within seconds.
            </p>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Channel</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawChannel('orange_money')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                      withdrawChannel === 'orange_money'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 ring-1 ring-amber-500'
                        : 'border-slate-200 text-slate-700 bg-white'
                    }`}
                  >
                    Orange Money
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawChannel('afrimoney')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                      withdrawChannel === 'afrimoney'
                        ? 'border-rose-500 bg-rose-50 text-rose-900 ring-1 ring-rose-500'
                        : 'border-slate-200 text-slate-700 bg-white'
                    }`}
                  >
                    Afrimoney
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Amount (SLE)</label>
                <input
                  type="number"
                  required
                  min="10"
                  max={currentDriver.walletBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="e.g. 200"
                  className="w-full text-xs font-mono font-bold p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Money Number</label>
                <input
                  type="tel"
                  required
                  value={withdrawAccount}
                  onChange={(e) => setWithdrawAccount(e.target.value)}
                  className="w-full text-xs font-mono p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <button
                type="submit"
                disabled={!withdrawAmount || parseFloat(withdrawAmount) > currentDriver.walletBalance}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md disabled:opacity-50"
              >
                Submit Instant Withdrawal Request
              </button>
            </form>
          </div>

          {/* Past Withdrawals */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Recent Payout Requests ({withdrawals.length})
            </h3>
            {withdrawals.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No withdrawal requests submitted yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {withdrawals.map((w) => (
                  <div key={w.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">SLE {w.amount.toFixed(2)}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {w.channel.replace(/_/g, ' ').toUpperCase()} • {w.accountNumber}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        w.status === 'PROCESSED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : w.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {w.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: COMPLIANCE DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              SLRSA Driver Compliance & Vehicle Inspection
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Certified compliance documents required by Sierra Leone Road Safety Authority (SLRSA) and the Sierra Leone Police.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            {[
              { name: 'Driving License (Class B/C)', status: 'VERIFIED', date: 'Exp: Nov 2027' },
              { name: 'Vehicle Registration Certificate', status: 'VERIFIED', date: 'Plate: SL 8291 AA' },
              { name: 'Police Clearance Certificate', status: 'VERIFIED', date: 'Issued: Jan 2026' },
              { name: 'SLRSA Roadworthiness Certificate', status: 'VERIFIED', date: 'Valid until Dec 2026' },
              { name: 'Commercial Passenger Insurance', status: 'VERIFIED', date: 'RITCORP Policy #8921' },
            ].map((doc, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {doc.status}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900">{doc.name}</p>
                <p className="text-[10px] text-slate-500 font-mono">{doc.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
