import React, { useState } from 'react';
import { LocationPoint, Driver } from '../../types';
import { Navigation, MapPin, Compass, Shield, Car } from 'lucide-react';

interface InteractiveMapProps {
  pickup?: LocationPoint | null;
  destination?: LocationPoint | null;
  drivers?: Driver[];
  selectedDriver?: Driver | null;
  onSelectLocation?: (location: LocationPoint) => void;
  className?: string;
  zoomLevel?: number;
  centerCity?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  pickup,
  destination,
  drivers = [],
  selectedDriver,
  className = 'h-96',
  centerCity = 'Freetown',
}) => {
  const [trafficActive, setTrafficActive] = useState(true);

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl ${className}`}>
      {/* Sierra Leone Visual Vector Map Representation */}
      <svg className="w-full h-full object-cover opacity-80" viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Ocean Coastline & Estuary */}
        <path d="M 0 0 L 250 0 C 230 120 180 200 240 280 C 280 340 220 420 190 500 L 0 500 Z" fill="#0f172a" />
        <path d="M 250 0 C 230 120 180 200 240 280 C 280 340 220 420 190 500 L 800 500 L 800 0 Z" fill="#1e293b" />

        {/* Sierra Leone Major Arteries */}
        {/* Bai Bureh Road / Regent-Grafton / Wilkinson Road */}
        <path d="M 220 140 Q 320 180 440 190 T 700 220" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
        <path d="M 240 280 Q 380 290 520 340 T 780 410" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
        <path d="M 310 110 L 320 380" stroke="#334155" strokeWidth="5" />
        <path d="M 440 190 L 520 340" stroke="#334155" strokeWidth="5" />

        {/* Live Traffic Glow */}
        {trafficActive && (
          <>
            <path d="M 220 140 Q 320 180 440 190" stroke="#3b82f6" strokeWidth="3" strokeDasharray="6 6" className="animate-pulse" />
            <path d="M 440 190 T 700 220" stroke="#10b981" strokeWidth="3" />
            <path d="M 240 280 Q 380 290 520 340" stroke="#f59e0b" strokeWidth="3" />
          </>
        )}

        {/* Urban Zones */}
        <circle cx="280" cy="160" r="45" fill="#3b82f6" fillOpacity="0.08" />
        <circle cx="500" cy="300" r="35" fill="#10b981" fillOpacity="0.08" />

        {/* Labels */}
        <text x="235" y="150" fill="#94a3b8" fontSize="11" fontFamily="sans-serif" fontWeight="bold">Central Freetown</text>
        <text x="450" y="180" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">Waterloo Hub</text>
        <text x="530" y="335" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">Bo Corridor</text>
        <text x="50" y="220" fill="#38bdf8" fontSize="11" fontFamily="sans-serif" fontWeight="bold" opacity="0.6">Atlantic Ocean</text>
      </svg>

      {/* Floating Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={() => setTrafficActive(!trafficActive)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all flex items-center gap-1.5 ${
            trafficActive
              ? 'bg-blue-600/90 text-white border-blue-400/30 shadow-lg'
              : 'bg-slate-900/80 text-slate-300 border-slate-700'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Live Traffic {trafficActive ? 'ON' : 'OFF'}</span>
        </button>

        <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-[11px] font-mono border border-slate-700/80 backdrop-blur-md flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>SLRSA GPS Sync</span>
        </div>
      </div>

      {/* City Hub Indicator */}
      <div className="absolute top-4 left-4 z-10">
        <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-semibold border border-slate-700/80 backdrop-blur-md flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-blue-400" />
          <span>{centerCity} • Sierra Leone Hub</span>
        </div>
      </div>

      {/* Driver Pins & Markers */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {pickup && (
          <div className="absolute transform -translate-x-1/2 -translate-y-1/2 left-[38%] top-[40%] flex flex-col items-center">
            <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold shadow-md mb-1 whitespace-nowrap">
              Pickup: {pickup.name}
            </span>
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
              <MapPin className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {destination && (
          <div className="absolute transform -translate-x-1/2 -translate-y-1/2 left-[62%] top-[48%] flex flex-col items-center">
            <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold shadow-md mb-1 whitespace-nowrap">
              Dropoff: {destination.name}
            </span>
            <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg border-2 border-white">
              <MapPin className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Live Active Drivers */}
        {drivers.slice(0, 3).map((driver, index) => {
          const positions = [
            { left: '44%', top: '35%' },
            { left: '52%', top: '55%' },
            { left: '32%', top: '50%' },
          ];
          const pos = positions[index] || { left: '50%', top: '50%' };
          return (
            <div
              key={driver.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000"
              style={{ left: pos.left, top: pos.top }}
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-blue-500/20">
                <Car className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Info Bar */}
      <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          <span>Real-time GPS vehicle tracking verified by Sierra Leone Road Safety Authority (SLRSA).</span>
        </div>
        <div className="font-mono text-slate-300 hidden sm:block">
          SLE / Orange Money / Afrimoney Live
        </div>
      </div>
    </div>
  );
};
