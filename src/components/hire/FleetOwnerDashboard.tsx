import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Car,
  Key,
  DollarSign,
  TrendingUp,
  Plus,
  ShieldCheck,
  Calendar,
  Clock,
  X,
} from 'lucide-react';
import { VehicleCategory } from '../../types';

export const FleetOwnerDashboard: React.FC = () => {
  const { currentUser, vehiclesForHire, hireBookings, currentCity } = useApp();

  const [fleetVehicles, setFleetVehicles] = useState(vehiclesForHire);
  const [activeTab, setActiveTab] = useState<'vehicles' | 'rentals' | 'earnings'>('vehicles');
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);

  // New vehicle form state
  const [newMake, setNewMake] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newYear, setNewYear] = useState('2023');
  const [newCategory, setNewCategory] = useState<VehicleCategory>('suv');
  const [newPlate, setNewPlate] = useState('');
  const [newDailyRate, setNewDailyRate] = useState('1200');
  const [withChauffeur, setWithChauffeur] = useState(true);

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMake || !newModel || !newPlate) return;

    const newVehicle = {
      id: `vh_${Date.now()}`,
      category: newCategory,
      make: newMake,
      model: newModel,
      year: parseInt(newYear) || 2023,
      plateNumber: newPlate.toUpperCase(),
      dailyRate: parseFloat(newDailyRate) || 1000,
      hourlyRate: Math.round((parseFloat(newDailyRate) || 1000) / 8),
      available: true,
      withChauffeur,
      fuelType: 'Diesel',
      transmission: 'Automatic' as const,
      seats: newCategory === 'minibus' ? 14 : 5,
      features: ['Air Conditioning', 'SLRSA GPS Tracking', 'Comprehensive Insurance', 'Chauffeur Option'],
      rating: 5.0,
      totalTrips: 0,
    };

    setFleetVehicles([newVehicle, ...fleetVehicles]);
    setShowAddVehicleModal(false);
    setNewMake('');
    setNewModel('');
    setNewPlate('');
  };

  const toggleVehicleAvailability = (vehicleId: string) => {
    setFleetVehicles((prev) =>
      prev.map((v) => (v.id === vehicleId ? { ...v, available: !v.available } : v))
    );
  };

  const totalEarnings = hireBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0) + 4800;
  const activeRentalsCount = hireBookings.filter((b) => b.status === 'ACTIVE' || b.status === 'CONFIRMED').length;
  const availableCount = fleetVehicles.filter((v) => v.available).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                <Key className="w-3 h-3 text-indigo-400" />
                Fleet Owner Console
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                SLRSA Verified Partner
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
              {currentUser.name || 'Commercial Fleet Owner'}
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Manage your commercial vehicle rentals, monitor dispatch contracts, and track rental earnings across Sierra Leone.
            </p>
          </div>

          <button
            onClick={() => setShowAddVehicleModal(true)}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold rounded-2xl text-xs transition-all shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle to Fleet</span>
          </button>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Total Fleet</span>
              <Car className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-white mt-2">{fleetVehicles.length}</p>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <span>{availableCount} available for hire</span>
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Active Hires</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-white mt-2">{activeRentalsCount}</p>
            <p className="text-[11px] text-slate-400 mt-1">Live customer contracts</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Fleet Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-white mt-2">SLE {totalEarnings.toFixed(2)}</p>
            <p className="text-[11px] text-emerald-400 mt-1">Settled to mobile money</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>City Hub</span>
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2 truncate">{currentCity || 'Freetown'}</p>
            <p className="text-[11px] text-slate-400 mt-1">SLRSA Hub Network</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'vehicles'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Vehicle Fleet ({fleetVehicles.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('rentals')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'rentals'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Rental Contracts ({hireBookings.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('earnings')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'earnings'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Payouts & Financials</span>
        </button>
      </div>

      {/* Tab 1: Vehicles */}
      {activeTab === 'vehicles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Registered Commercial Fleet</h2>
            <button
              onClick={() => setShowAddVehicleModal(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Vehicle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fleetVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      {vehicle.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {vehicle.make} {vehicle.model} ({vehicle.year})
                    </h3>
                    <p className="text-xs font-mono font-semibold text-slate-500">{vehicle.plateNumber}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      vehicle.available
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {vehicle.available ? 'Ready for Hire' : 'On Active Hire'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Daily Rate</span>
                    <span className="font-bold font-mono text-slate-800">SLE {vehicle.dailyRate.toFixed(2)}/day</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Chauffeur Option</span>
                    <span className="font-bold text-slate-800">{vehicle.withChauffeur ? 'Included' : 'Self-Drive'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => toggleVehicleAvailability(vehicle.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      vehicle.available
                        ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {vehicle.available ? 'Set Maintenance' : 'Set Available'}
                  </button>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {vehicle.seats} Seats • {vehicle.fuelType || 'Diesel'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Rental Contracts */}
      {activeTab === 'rentals' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Live & Past Rental Contracts</h2>
          {hireBookings.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No Active Rental Contracts</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Customer bookings for executive SUVs, chauffeur services, and minibuses will stream here in real time.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {hireBookings.map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Booking #{b.id.slice(-6)}</p>
                    <p className="text-[11px] text-slate-500">{b.durationDays} Days Rental • {b.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold font-mono text-slate-900">SLE {b.totalPrice.toFixed(2)}</p>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Earnings */}
      {activeTab === 'earnings' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Fleet Rental Settlement Account</h2>
              <p className="text-xs text-slate-500">Automated mobile money settlement for commercial fleet partners.</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Available Balance</span>
              <span className="text-2xl font-bold font-mono text-emerald-600">SLE {totalEarnings.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-700">Settlement Provider</span>
              <p className="text-xs text-slate-600">Orange Money / Afrimoney Direct Settlement</p>
              <p className="text-[11px] text-slate-400 font-mono">Linked Number: {currentUser.phone}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-700">Fleet Commission</span>
              <p className="text-xs text-slate-600">Trust Ride SL Standard Rate: 10% platform fee</p>
              <p className="text-[11px] text-emerald-600 font-semibold">90% net payout to fleet owner</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Vehicle */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm">Register New Vehicle to Fleet</h3>
              </div>
              <button
                onClick={() => setShowAddVehicleModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Make</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Toyota"
                    value={newMake}
                    onChange={(e) => setNewMake(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Model</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Land Cruiser"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as VehicleCategory)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                  >
                    <option value="suv">4x4 Luxury SUV</option>
                    <option value="comfort">Executive Sedan</option>
                    <option value="minibus">Passenger Minibus</option>
                    <option value="economy">Compact Economy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Plate Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SL 7289 BB"
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Daily Rate (SLE)</label>
                  <input
                    type="number"
                    required
                    value={newDailyRate}
                    onChange={(e) => setNewDailyRate(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 pt-1">
                <input
                  type="checkbox"
                  checked={withChauffeur}
                  onChange={(e) => setWithChauffeur(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600"
                />
                <span>Includes certified chauffeur option</span>
              </label>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-md mt-2"
              >
                Add Vehicle to Live Fleet
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
