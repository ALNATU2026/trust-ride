import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wallet,
  User,
  Menu,
  X,
  Car,
  LogOut,
  LogIn,
  UserPlus,
  ShieldCheck,
  Key,
  Truck,
} from 'lucide-react';
import { UserRole, SUPER_ADMIN_ID, isSuperAdminUser } from '../../types';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenDriverModal: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBooking, onOpenDriverModal, onOpenAuth }) => {
  const { currentUser, isAuthenticated, logout, switchRole, activeTab, setActiveTab } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const isSuperAdmin = isSuperAdminUser(currentUser);

  // Dynamic role-specific navigation specifications
  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { id: 'home', label: 'Home' },
        { id: 'ride', label: 'Ride' },
        { id: 'delivery', label: 'Delivery' },
        { id: 'logistics', label: 'Logistics' },
        { id: 'hire', label: 'Vehicle Hire' },
        { id: 'safety', label: 'Safety' },
      ];
    }

    if (isSuperAdmin) {
      return [
        { id: 'admin', label: 'Operations Admin' },
        { id: 'rider-dashboard', label: 'Passenger View' },
        { id: 'driver', label: 'Driver View' },
        { id: 'fleet-dashboard', label: 'Fleet View' },
        { id: 'safety', label: 'Safety' },
      ];
    }

    if (currentUser.role === 'customer') {
      return [
        { id: 'rider-dashboard', label: 'Customer Dashboard' },
        { id: 'ride', label: 'Book Ride' },
        { id: 'delivery', label: 'Parcel Delivery' },
        { id: 'safety', label: 'Safety' },
      ];
    }

    if (currentUser.role === 'driver') {
      return [
        { id: 'driver', label: 'Driver Console' },
        { id: 'safety', label: 'Safety Guidelines' },
      ];
    }

    if (currentUser.role === 'fleet_owner') {
      return [
        { id: 'fleet-dashboard', label: 'Fleet Dashboard' },
        { id: 'hire', label: 'Vehicle Hire' },
        { id: 'safety', label: 'Safety' },
      ];
    }

    if (currentUser.role === 'logistics_operator') {
      return [
        { id: 'logistics', label: 'Cargo & Freight' },
        { id: 'safety', label: 'Safety' },
      ];
    }

    return [
      { id: 'home', label: 'Home' },
      { id: 'rider-dashboard', label: 'My Dashboard' },
      { id: 'safety', label: 'Safety' },
    ];
  };

  const navLinks = getNavLinks();

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const handleRoleChange = (role: UserRole) => {
    if (role === 'admin' && !isSuperAdmin) {
      return;
    }
    switchRole(role);
    setRoleDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Wordmark */}
          <button
            onClick={() => {
              if (isSuperAdmin) setActiveTab('admin');
              else if (currentUser.role === 'driver') setActiveTab('driver');
              else if (currentUser.role === 'fleet_owner') setActiveTab('fleet-dashboard');
              else if (isAuthenticated) setActiveTab('rider-dashboard');
              else setActiveTab('home');
            }}
            className="text-xl font-bold tracking-tight text-slate-900 font-display flex items-center gap-2.5 text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-blue-100">
              <Car className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="leading-tight">Trust Ride</span>
                {isSuperAdmin && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                    SUPER ADMIN
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-normal tracking-wide">Sierra Leone</span>
            </div>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`transition-colors py-1 ${
                  activeTab === link.id
                    ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
                    : 'hover:text-slate-900'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Actions & User Status */}
          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <>
                {/* Wallet pill for customers */}
                {currentUser.role === 'customer' && (
                  <button
                    onClick={() => setActiveTab('rider-dashboard')}
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-xs font-semibold text-slate-800 border border-slate-200"
                    title="Trust Ride Wallet"
                  >
                    <Wallet className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-mono">SLE {currentUser.walletBalance.toFixed(2)}</span>
                  </button>
                )}

                {/* User & Role Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-medium text-slate-700 bg-white shadow-2xs"
                    title="Account Profile & Settings"
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        isSuperAdmin ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="max-w-[90px] truncate font-semibold text-slate-900">{currentUser.name}</span>
                    <span className="text-[10px] text-slate-400 capitalize hidden lg:inline">
                      ({isSuperAdmin ? 'Super Admin' : currentUser.role})
                    </span>
                  </button>

                  {roleDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                          {isSuperAdmin ? (
                            <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300">
                              SUPER ADMIN
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-500 capitalize">
                              {currentUser.role}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">{currentUser.phone}</p>
                        {isSuperAdmin && (
                          <p className="text-[10px] text-amber-700 font-mono mt-1 bg-amber-50 px-1.5 py-0.5 rounded">
                            ID: {SUPER_ADMIN_ID}
                          </p>
                        )}
                      </div>

                      {/* Super Admin Privileged Switcher */}
                      {isSuperAdmin ? (
                        <>
                          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Super Admin Controls
                          </div>
                          <button
                            onClick={() => {
                              setRoleDropdownOpen(false);
                              setActiveTab('admin');
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between ${
                              activeTab === 'admin' ? 'font-semibold text-amber-600 bg-amber-50/50' : 'text-slate-700'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                              <span>Operations Admin Console</span>
                            </span>
                            {activeTab === 'admin' && <span className="text-amber-600">✓</span>}
                          </button>

                          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                            Administrative Views
                          </div>
                          <button
                            onClick={() => {
                              handleRoleChange('customer');
                              setActiveTab('rider-dashboard');
                            }}
                            className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between text-slate-700"
                          >
                            <span>Passenger View</span>
                          </button>
                          <button
                            onClick={() => {
                              handleRoleChange('driver');
                              setActiveTab('driver');
                            }}
                            className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between text-slate-700"
                          >
                            <span>Driver View</span>
                          </button>
                          <button
                            onClick={() => {
                              handleRoleChange('fleet_owner');
                              setActiveTab('fleet-dashboard');
                            }}
                            className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between text-slate-700"
                          >
                            <span>Fleet Owner View</span>
                          </button>
                        </>
                      ) : (
                        /* Regular User: Single Dashboard link strictly tied to their role */
                        <div className="py-1">
                          {currentUser.role === 'customer' && (
                            <button
                              onClick={() => {
                                setRoleDropdownOpen(false);
                                setActiveTab('rider-dashboard');
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-blue-600 font-semibold hover:bg-blue-50 flex items-center gap-2"
                            >
                              <User className="w-3.5 h-3.5" />
                              <span>My Customer Dashboard</span>
                            </button>
                          )}
                          {currentUser.role === 'driver' && (
                            <button
                              onClick={() => {
                                setRoleDropdownOpen(false);
                                setActiveTab('driver');
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-emerald-600 font-semibold hover:bg-emerald-50 flex items-center gap-2"
                            >
                              <Car className="w-3.5 h-3.5" />
                              <span>My Driver Console</span>
                            </button>
                          )}
                          {currentUser.role === 'fleet_owner' && (
                            <button
                              onClick={() => {
                                setRoleDropdownOpen(false);
                                setActiveTab('fleet-dashboard');
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-indigo-600 font-semibold hover:bg-indigo-50 flex items-center gap-2"
                            >
                              <Key className="w-3.5 h-3.5" />
                              <span>My Fleet Dashboard</span>
                            </button>
                          )}
                          {currentUser.role === 'logistics_operator' && (
                            <button
                              onClick={() => {
                                setRoleDropdownOpen(false);
                                setActiveTab('logistics');
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-indigo-600 font-semibold hover:bg-indigo-50 flex items-center gap-2"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Logistics Console</span>
                            </button>
                          )}
                        </div>
                      )}

                      <div className="border-t border-slate-100 my-1"></div>
                      <button
                        onClick={() => {
                          setRoleDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-xl transition-all flex items-center gap-1.5 bg-white"
                >
                  <LogIn className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="hidden sm:flex px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 space-y-2 animate-in fade-in duration-150">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${
                  activeTab === link.id ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              {!isAuthenticated ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('login');
                    }}
                    className="w-full py-2 text-center text-xs font-bold text-slate-700 bg-slate-100 rounded-xl"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('register');
                    }}
                    className="w-full py-2 text-center text-xs font-bold text-white bg-blue-600 rounded-xl"
                  >
                    Sign Up
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl">
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {isSuperAdmin ? 'Super Admin' : currentUser.role}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="text-xs text-rose-600 font-bold px-2 py-1 rounded-lg hover:bg-rose-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
