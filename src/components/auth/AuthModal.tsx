import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Lock,
  Phone,
  User,
  Mail,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  Car,
  Truck,
  Key,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { SUPER_ADMIN_ID } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Sign In States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign Up States with Required Specification
  const [signupRole, setSignupRole] = useState<'customer' | 'driver' | 'fleet_owner' | 'logistics_operator'>('customer');
  const [fullName, setFullName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupCity, setSignupCity] = useState('Freetown');
  const [referralCode, setReferralCode] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Driver-specific sign up fields
  const [driverVehicleCategory, setDriverVehicleCategory] = useState('economy');
  const [driverPlateNumber, setDriverPlateNumber] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Sierra Leone telecom operator detection
  const detectOperator = (num: string) => {
    const clean = num.replace(/[^0-9]/g, '');
    if (clean.includes('74') || clean.includes('75') || clean.includes('76') || clean.includes('78') || clean.includes('79')) {
      return { name: 'Orange Money SL', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    }
    if (clean.includes('30') || clean.includes('33') || clean.includes('88')) {
      return { name: 'Afrimoney SL', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    }
    return null;
  };

  const currentOp = detectOperator(mode === 'login' ? loginIdentifier : signupPhone);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier.trim(),
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sign in failed. Please verify your credentials.');
      }

      setSuccessMessage(`Welcome back, ${data.user.name}!`);
      login(data.token, data.user);

      setTimeout(() => {
        setIsLoading(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Unable to connect to Trust Ride authentication server.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!agreeTerms) {
      setErrorMessage('Please accept the Terms of Service & SLRSA Safety Policy.');
      return;
    }

    if (signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      let formattedPhone = signupPhone.trim();
      if (!formattedPhone.startsWith('+232') && !formattedPhone.startsWith('0')) {
        formattedPhone = '+232 ' + formattedPhone;
      } else if (formattedPhone.startsWith('0')) {
        formattedPhone = '+232 ' + formattedPhone.slice(1);
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
          phone: formattedPhone,
          email: signupEmail ? signupEmail.trim().toLowerCase() : undefined,
          password: signupPassword,
          role: signupRole,
          city: signupCity,
          referralCode: referralCode.trim() || undefined,
          driverDetails:
            signupRole === 'driver'
              ? {
                  vehicleCategory: driverVehicleCategory,
                  plateNumber: driverPlateNumber,
                }
              : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed. Please check your information.');
      }

      setSuccessMessage('Account registered successfully! Redirecting to your dashboard...');
      login(data.token, data.user);

      setTimeout(() => {
        setIsLoading(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Error creating account. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg ring-2 ring-white/10">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight font-display">Trust Ride</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Sierra Leone
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                {mode === 'login' ? 'Sign in to access your role-specific dashboard' : 'Create your verified account with role specification'}
              </p>
            </div>
          </div>

          {/* Segmented Switcher */}
          <div className="grid grid-cols-2 p-1 bg-white/10 rounded-2xl mt-4 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'register' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              Register Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-medium">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* SIGN IN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile Phone, Email, or Super Admin ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. +232 76 123 456 or dalabapays@gmail.com"
                    className="w-full text-xs font-medium pl-10 pr-3.5 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-slate-50/60 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full text-xs font-medium pl-10 pr-10 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-slate-50/60 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <span>Verifying credentials...</span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* REGISTRATION FORM WITH ROLE SPECIFICATION */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Account Type Specification */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Select Account Specification
                  </label>
                  <span className="text-[10px] text-blue-600 font-semibold">Strict Role Isolation</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignupRole('customer')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      signupRole === 'customer'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold">Passenger / Rider</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Book rides, deliveries & SLE wallet</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignupRole('driver')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      signupRole === 'driver'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold">Commercial Driver</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Accept dispatches & collect fares</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignupRole('fleet_owner')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      signupRole === 'fleet_owner'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 ring-1 ring-purple-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-bold">Fleet Owner</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Manage rental vehicles & contracts</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignupRole('logistics_operator')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      signupRole === 'logistics_operator'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold">Logistics Operator</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Heavy freight & moving contracts</p>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alie Sesay"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              {/* Phone Number */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Sierra Leone Mobile Phone
                  </label>
                  {currentOp && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${currentOp.color}`}>
                      {currentOp.name}
                    </span>
                  )}
                </div>
                <input
                  type="tel"
                  required
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  placeholder="+232 76 123 456"
                  className="w-full text-xs font-mono p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              {/* Email & City Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="user@example.sl"
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Operating City
                  </label>
                  <select
                    value={signupCity}
                    onChange={(e) => setSignupCity(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                  >
                    <option value="Freetown">Freetown</option>
                    <option value="Waterloo">Waterloo</option>
                    <option value="Bo">Bo</option>
                    <option value="Kenema">Kenema</option>
                    <option value="Makeni">Makeni</option>
                  </select>
                </div>
              </div>

              {/* Driver-specific details */}
              {signupRole === 'driver' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <div>
                    <label className="block text-[10px] font-bold text-emerald-900 mb-1">Vehicle Category</label>
                    <select
                      value={driverVehicleCategory}
                      onChange={(e) => setDriverVehicleCategory(e.target.value)}
                      className="w-full text-xs p-2 border border-emerald-300 rounded-xl bg-white"
                    >
                      <option value="economy">Standard Taxi</option>
                      <option value="kekeh">Kekeh</option>
                      <option value="okada">Okada</option>
                      <option value="comfort">Comfort AC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-emerald-900 mb-1">Plate Number</label>
                    <input
                      type="text"
                      required
                      placeholder="SL 8921 AA"
                      value={driverPlateNumber}
                      onChange={(e) => setDriverPlateNumber(e.target.value)}
                      className="w-full text-xs font-mono uppercase p-2 border border-emerald-300 rounded-xl bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Create Password (Min 6 Characters)
                </label>
                <div className="relative">
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Create secure password"
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
                  >
                    {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600 pt-1">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 mt-0.5"
                />
                <span>I accept the Trust Ride Terms and SLRSA Road Safety Policy.</span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <span>Registering Account in MongoDB...</span>
                ) : (
                  <>
                    <span>Create My Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
