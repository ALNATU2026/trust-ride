import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/home/HeroSection';
import { ServicesSection } from './components/home/ServicesSection';
import { HowItWorksSection } from './components/home/HowItWorksSection';
import { SafetySection } from './components/home/SafetySection';
import { RiderDashboard } from './components/rider/RiderDashboard';
import { DriverDashboard } from './components/driver/DriverDashboard';
import { FleetOwnerDashboard } from './components/hire/FleetOwnerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { RideBookingModal } from './components/booking/RideBookingModal';
import { ActiveRideModal } from './components/ride/ActiveRideModal';
import { DeliveryBookingModal } from './components/delivery/DeliveryBookingModal';
import { LogisticsBookingModal } from './components/logistics/LogisticsBookingModal';
import { VehicleHireModal } from './components/hire/VehicleHireModal';
import { AirportTransferModal } from './components/airport/AirportTransferModal';
import { ChatModal } from './components/chat/ChatModal';
import { SafetyModal } from './components/safety/SafetyModal';
import { DriverRegistrationModal } from './components/driver/DriverRegistrationModal';
import { AuthModal } from './components/auth/AuthModal';
import { ArrowRight, ShieldCheck, Car, Key, Truck, Package } from 'lucide-react';
import { VehicleCategory } from './types';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, activeRide, currentUser } = useApp();

  // Modal States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [activeRideModalOpen, setActiveRideModalOpen] = useState(false);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [logisticsModalOpen, setLogisticsModalOpen] = useState(false);
  const [hireModalOpen, setHireModalOpen] = useState(false);
  const [airportModalOpen, setAirportModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  const [driverRegistrationOpen, setDriverRegistrationOpen] = useState(false);

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleStartBooking = () => {
    setBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Top Global Navigation Bar */}
      <Navbar
        onOpenBooking={() => setBookingModalOpen(true)}
        onOpenDriverModal={() => setDriverRegistrationOpen(true)}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {/* HOME VIEW */}
        {activeTab === 'home' && (
          <div className="space-y-0">
            <HeroSection
              onStartBooking={handleStartBooking}
              onOpenDriverModal={() => setDriverRegistrationOpen(true)}
            />
            <ServicesSection
              onSelectService={(serviceId) => {
                if (serviceId === 'ride') setBookingModalOpen(true);
                else if (serviceId === 'delivery') setDeliveryModalOpen(true);
                else if (serviceId === 'logistics') setLogisticsModalOpen(true);
                else if (serviceId === 'hire') setHireModalOpen(true);
                else if (serviceId === 'airport') setAirportModalOpen(true);
                else if (serviceId === 'safety') setSafetyModalOpen(true);
                else setActiveTab(serviceId);
              }}
            />
            <HowItWorksSection />
            <SafetySection onOpenSafetyModal={() => setSafetyModalOpen(true)} />
          </div>
        )}

        {/* RIDE BOOKING LAUNCHPAD */}
        {activeTab === 'ride' && (
          <div className="py-12">
            <div className="max-w-4xl mx-auto px-4 text-center py-12 space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
                <Car className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-extrabold font-display text-slate-900">
                Book Verified Kekeh, Okada, or Taxi
              </h2>
              <p className="text-slate-600 text-sm max-w-xl mx-auto">
                Real-time upfront fares, verified SLRSA commercial drivers, 4-digit security OTP verification, and instant Mobile Money payment.
              </p>
              <button
                onClick={() => setBookingModalOpen(true)}
                className="px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md inline-flex items-center gap-2"
              >
                <span>Launch Interactive Ride Booking</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* PARCEL DELIVERY LAUNCHPAD */}
        {activeTab === 'delivery' && (
          <div className="py-12">
            <div className="max-w-4xl mx-auto px-4 text-center py-12 space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <Package className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-extrabold font-display text-slate-900">
                Trust Ride Express Doorstep Delivery
              </h2>
              <p className="text-slate-600 text-sm max-w-xl mx-auto">
                Secure doorstep dispatch for documents, packages, groceries and goods across Sierra Leone with 4-digit recipient OTP delivery proof.
              </p>
              <button
                onClick={() => setDeliveryModalOpen(true)}
                className="px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md inline-flex items-center gap-2"
              >
                <span>Dispatch Parcel Order</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* LOGISTICS LAUNCHPAD */}
        {activeTab === 'logistics' && (
          <div className="py-12">
            <div className="max-w-4xl mx-auto px-4 text-center py-12 space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
                <Truck className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-extrabold font-display text-slate-900">
                Commercial Freight & Cargo Logistics
              </h2>
              <p className="text-slate-600 text-sm max-w-xl mx-auto">
                Commercial trucks, freight vans, building materials and countrywide moving services between Freetown, Waterloo, Bo, Kenema and Makeni.
              </p>
              <button
                onClick={() => setLogisticsModalOpen(true)}
                className="px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md inline-flex items-center gap-2"
              >
                <span>Book Commercial Freight Hauler</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* HIRE LAUNCHPAD */}
        {activeTab === 'hire' && (
          <div className="py-12">
            <div className="max-w-4xl mx-auto px-4 text-center py-12 space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto shadow-sm">
                <Key className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-extrabold font-display text-slate-900">
                Fleet Hire & Premium Vehicle Rental
              </h2>
              <p className="text-slate-600 text-sm max-w-xl mx-auto">
                Rent 4x4 SUVs, luxury executive sedans, and passenger minibuses hourly or daily. Available with certified chauffeurs or self-drive.
              </p>
              <button
                onClick={() => setHireModalOpen(true)}
                className="px-7 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md inline-flex items-center gap-2"
              >
                <span>Browse Available Fleet Vehicles</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* DRIVER TERMINAL DASHBOARD */}
        {activeTab === 'driver' && <DriverDashboard onOpenChat={() => setChatModalOpen(true)} />}

        {/* FLEET OWNER DASHBOARD */}
        {activeTab === 'fleet-dashboard' && <FleetOwnerDashboard />}

        {/* CUSTOMER / RIDER DASHBOARD */}
        {activeTab === 'rider-dashboard' && (
          <RiderDashboard
            onOpenBooking={() => setBookingModalOpen(true)}
            onOpenDelivery={() => setDeliveryModalOpen(true)}
            onOpenLogistics={() => setLogisticsModalOpen(true)}
            onOpenHire={() => setHireModalOpen(true)}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {/* OPERATIONS SUPER ADMIN DASHBOARD */}
        {activeTab === 'admin' && <AdminDashboard />}

        {/* SAFETY PAGE */}
        {activeTab === 'safety' && (
          <div className="py-8">
            <SafetySection onOpenSafetyModal={() => setSafetyModalOpen(true)} />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer onSelectNav={(tab) => setActiveTab(tab)} />

      {/* Floating Active Trip Pill (Quick access if ride is active) */}
      {activeRide && (
        <button
          onClick={() => setActiveRideModalOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 border-2 border-white animate-pulse"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span className="text-xs font-bold font-mono">Track Active Trip</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}

      {/* Global Interactive Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      <RideBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
      />

      <ActiveRideModal
        isOpen={activeRideModalOpen}
        onClose={() => setActiveRideModalOpen(false)}
        onOpenChat={() => {
          setActiveRideModalOpen(false);
          setChatModalOpen(true);
        }}
      />

      <DeliveryBookingModal
        isOpen={deliveryModalOpen}
        onClose={() => setDeliveryModalOpen(false)}
      />

      <LogisticsBookingModal
        isOpen={logisticsModalOpen}
        onClose={() => setLogisticsModalOpen(false)}
      />

      <VehicleHireModal
        isOpen={hireModalOpen}
        onClose={() => setHireModalOpen(false)}
      />

      <AirportTransferModal
        isOpen={airportModalOpen}
        onClose={() => setAirportModalOpen(false)}
      />

      <ChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
      />

      <SafetyModal
        isOpen={safetyModalOpen}
        onClose={() => setSafetyModalOpen(false)}
      />

      <DriverRegistrationModal
        isOpen={driverRegistrationOpen}
        onClose={() => setDriverRegistrationOpen(false)}
        onSuccess={() => setActiveTab('driver')}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
