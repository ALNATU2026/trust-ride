import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  Driver,
  RideRequest,
  RideFeedback,
  DeliveryOrder,
  LogisticsOrder,
  VehicleHireBooking,
  AirportTransferBooking,
  WalletTransaction,
  WithdrawalRequest,
  SupportTicket,
  ChatMessage,
  PricingRule,
  CityServiceAvailability,
  VehicleCategory,
  AuditLog,
  PaymentMethod,
  SUPER_ADMIN_ID,
  isSuperAdminUser,
} from '../types';
import {
  SEED_VEHICLES_FOR_HIRE,
  SEED_PROMO_CODES,
  SEED_CITY_AVAILABILITY,
  POPULAR_LOCATIONS,
} from '../data/seedData';
import { DEFAULT_PRICING_RULES, PricingEngine } from '../services/pricingService';
import { MapService } from '../services/mapService';
import { PaymentService, PaymentIntent } from '../services/paymentService';
import { RealtimeService } from '../services/realtimeService';

export const GUEST_USER: User = {
  id: '',
  name: 'Guest Passenger',
  email: '',
  phone: '',
  role: 'customer',
  rating: 5.0,
  tripsCount: 0,
  walletBalance: 0,
  referralCode: '',
  createdAt: '',
};

export const INITIAL_DRIVER: Driver = {
  id: 'drv_init_01',
  name: 'Mohamed Kamara',
  phone: '+232 76 892341',
  email: 'mohamed.kamara@trustride.sl',
  city: 'Freetown',
  status: 'APPROVED',
  isOnline: true,
  rating: 4.95,
  totalTrips: 182,
  walletBalance: 1450.0,
  currentLocation: { lat: 8.4844, lng: -13.2344, heading: 45 },
  vehicle: {
    make: 'Toyota',
    model: 'Corolla',
    year: 2022,
    color: 'Silver',
    plateNumber: 'SL 8291 AA',
    category: 'economy',
  },
  documents: [],
};

export const SEED_PAST_RIDES: RideRequest[] = [
  {
    id: 'ride_sl_901',
    passengerId: 'usr_guest',
    passengerName: 'Mariama Sesay',
    passengerPhone: '+232 76 892 110',
    driverId: 'drv_1',
    driver: INITIAL_DRIVER,
    pickup: {
      name: 'Lumley Beach Road',
      address: 'Near Atlantic Lumley Hotel, Aberdeen, Freetown',
      city: 'Freetown',
      lat: 8.4844,
      lng: -13.2844,
    },
    destination: {
      name: 'Cotton Tree, Central Freetown',
      address: 'Siaka Stevens Street, Central Freetown',
      city: 'Freetown',
      lat: 8.484,
      lng: -13.2344,
    },
    category: 'economy',
    status: 'RATED',
    estimatedFare: 45.0,
    actualFare: 45.0,
    distanceKm: 7.2,
    durationMinutes: 18,
    otp: '7821',
    paymentMethod: 'orange_money',
    paymentStatus: 'PAID',
    rating: 5,
    riderFeedback: {
      rating: 5,
      tags: ['🛡️ Safe Driving', '✨ Clean Vehicle', '😊 Polite & Respectful', '❄️ Comfortable AC'],
      comment: 'Mohamed drove very smoothly along Wilkinson Road and avoided the heavy junction traffic. Car was pristine!',
      createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    },
    driverFeedback: {
      rating: 5,
      tags: ['⏱️ Ready at Pickup', '🤝 Respectful & Friendly', '💵 Prompt Payment'],
      comment: 'Mariama was already waiting at the gate and paid immediately upon arrival. Outstanding 5-star passenger!',
      createdAt: new Date(Date.now() - 3600 * 1000 * 23).toISOString(),
    },
    createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
  },
  {
    id: 'ride_sl_902',
    passengerId: 'usr_guest',
    passengerName: 'Alie Sesay',
    passengerPhone: '+232 78 543 210',
    driverId: 'drv_1',
    driver: INITIAL_DRIVER,
    pickup: {
      name: 'Congo Cross Roundabout',
      address: 'Main Motor Road, Congo Cross, Freetown',
      city: 'Freetown',
      lat: 8.475,
      lng: -13.255,
    },
    destination: {
      name: 'Wilkinson Road Junction',
      address: 'Wilkinson Road, Freetown',
      city: 'Freetown',
      lat: 8.48,
      lng: -13.265,
    },
    category: 'economy',
    status: 'TRIP_COMPLETED',
    estimatedFare: 28.0,
    actualFare: 28.0,
    distanceKm: 3.5,
    durationMinutes: 11,
    otp: '4192',
    paymentMethod: 'wallet',
    paymentStatus: 'PAID',
    createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
  },
];

interface AppContextType {
  currentUser: User;
  isAuthenticated: boolean;
  authToken: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  switchRole: (role: User['role']) => void;

  currentDriver: Driver;
  setCurrentDriver: React.Dispatch<React.SetStateAction<Driver>>;
  toggleDriverOnline: () => void;
  drivers: Driver[];
  currentCity: string;
  setCurrentCity: (city: string) => void;

  activeRide: RideRequest | null;
  setActiveRide: React.Dispatch<React.SetStateAction<RideRequest | null>>;
  incomingDriverRequest: RideRequest | null;
  pastRides: RideRequest[];
  driverPastRides: RideRequest[];
  loadDriverRides: (driverId: string) => Promise<void>;
  requestRide: (ride: Omit<RideRequest, 'id' | 'status' | 'createdAt' | 'otp' | 'paymentStatus'>) => Promise<RideRequest>;
  acceptRideDriver: (rideId: string) => void;
  declineRideDriver: (rideId: string) => void;
  driverArrived: (rideId: string) => void;
  startTrip: (rideId: string, otp: string) => boolean;
  completeTrip: (rideId: string, actualFare?: number) => void;
  rateTrip: (rideId: string, rating: number, comment?: string) => void;
  submitRideFeedback: (
    rideId: string,
    role: 'rider' | 'driver',
    rating: number,
    tags: string[],
    comment?: string
  ) => Promise<boolean>;
  feedbackModalRide: RideRequest | null;
  feedbackModalRole: 'rider' | 'driver';
  openFeedbackModal: (ride: RideRequest, role: 'rider' | 'driver') => void;
  closeFeedbackModal: () => void;
  cancelRide: (rideId: string, reason: string) => void;

  deliveries: DeliveryOrder[];
  createDeliveryOrder: (order: Omit<DeliveryOrder, 'id' | 'status' | 'createdAt' | 'recipientOtp'>) => Promise<DeliveryOrder>;

  logisticsOrders: LogisticsOrder[];
  createLogisticsBooking: (booking: Omit<LogisticsOrder, 'id' | 'status' | 'createdAt'>) => Promise<LogisticsOrder>;

  vehiclesForHire: typeof SEED_VEHICLES_FOR_HIRE;
  hireBookings: VehicleHireBooking[];
  bookVehicleHire: (booking: Omit<VehicleHireBooking, 'id' | 'status' | 'createdAt'>) => Promise<VehicleHireBooking>;

  airportTransfers: AirportTransferBooking[];
  bookAirportTransfer: (booking: Omit<AirportTransferBooking, 'id' | 'status' | 'createdAt'>) => Promise<AirportTransferBooking>;

  walletTransactions: WalletTransaction[];
  depositToWallet: (amount: number, channel: PaymentMethod, phoneNumber: string) => Promise<PaymentIntent>;
  withdrawals: WithdrawalRequest[];
  requestWithdrawal: (amount: number, channel: 'orange_money' | 'afrimoney' | 'bank_transfer', accountNumber: string) => Promise<boolean>;

  chatMessages: ChatMessage[];
  sendChatMessage: (rideId: string, message: string) => void;

  isEmergencyTriggered: boolean;
  triggerEmergencySos: (alertDetails?: string) => void;
  resolveEmergencySos: () => void;

  pricingRules: Record<VehicleCategory, PricingRule>;
  pricingEngine: PricingEngine;
  mapService: MapService;
  paymentService: PaymentService;
  realtimeService: RealtimeService;
  cityAvailability: CityServiceAvailability[];
  promoCodes: typeof SEED_PROMO_CODES;

  auditLogs: AuditLog[];
  addAuditLog: (action: string, target: string, details: string) => void;

  activeTab: string;
  setActiveTab: (tab: string) => void;

  users: any[];
  supportTickets: SupportTicket[];
  createSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  resolveSupportTicket: (ticketId: string, response: string) => Promise<void>;
  refreshAdminData: () => Promise<void>;
  isRealtimeConnected: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('trustride_token'));
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('trustride_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return GUEST_USER;
      }
    }
    return GUEST_USER;
  });

  const isAuthenticated = Boolean(authToken && currentUser.id);

  const [currentCity, setCurrentCity] = useState<string>('Freetown');
  const [currentDriver, setCurrentDriver] = useState<Driver>(INITIAL_DRIVER);
  const [drivers, setDrivers] = useState<Driver[]>([INITIAL_DRIVER]);
  const [users, setUsers] = useState<any[]>([]);

  // Rides & Dispatch
  const [activeRide, setActiveRide] = useState<RideRequest | null>(null);
  const [incomingDriverRequest, setIncomingDriverRequest] = useState<RideRequest | null>(null);
  const [pastRides, setPastRides] = useState<RideRequest[]>(SEED_PAST_RIDES);
  const [driverPastRides, setDriverPastRides] = useState<RideRequest[]>(SEED_PAST_RIDES);

  // Post-Ride Feedback Modal State
  const [feedbackModalRide, setFeedbackModalRide] = useState<RideRequest | null>(null);
  const [feedbackModalRole, setFeedbackModalRole] = useState<'rider' | 'driver'>('rider');

  const openFeedbackModal = (ride: RideRequest, role: 'rider' | 'driver') => {
    setFeedbackModalRide(ride);
    setFeedbackModalRole(role);
  };

  const closeFeedbackModal = () => {
    setFeedbackModalRide(null);
  };

  const loadDriverRides = useCallback(async (driverId: string) => {
    try {
      const res = await fetch(`/api/rides/driver/${driverId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((r: any) => ({ ...r, id: r._id || r.id }));
          setDriverPastRides((prev) => {
            const existingIds = new Set(formatted.map((f: any) => f.id));
            const remaining = prev.filter((p) => !existingIds.has(p.id));
            return [...formatted, ...remaining];
          });
        }
      }
    } catch (e) {
      console.warn('Notice loading driver rides:', e);
    }
  }, []);

  // Delivery & Logistics
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
  const [logisticsOrders, setLogisticsOrders] = useState<LogisticsOrder[]>([]);

  // Hire & Airport
  const [vehiclesForHire] = useState(SEED_VEHICLES_FOR_HIRE);
  const [hireBookings, setHireBookings] = useState<VehicleHireBooking[]>([]);
  const [airportTransfers, setAirportTransfers] = useState<AirportTransferBooking[]>([]);

  // Financials & System
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isEmergencyTriggered, setIsEmergencyTriggered] = useState(false);
  const [pricingRules, setPricingRules] = useState<Record<VehicleCategory, PricingRule>>(DEFAULT_PRICING_RULES);
  const [cityAvailability, setCityAvailability] = useState<CityServiceAvailability[]>(SEED_CITY_AVAILABILITY);
  const [promoCodes] = useState(SEED_PROMO_CODES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(true);

  const pricingEngine = new PricingEngine();
  const mapService = MapService.getInstance();
  const paymentService = PaymentService.getInstance();
  const realtimeService = RealtimeService.getInstance();

  // Load database records for Admin (Strictly authorized)
  const refreshAdminData = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem('trustride_token');
      const authHeaders: Record<string, string> = storedToken
        ? { Authorization: `Bearer ${storedToken}` }
        : {};

      const [uRes, rRes, wRes, tRes, lRes] = await Promise.all([
        fetch('/api/admin/users', { headers: authHeaders }).then((r) => r.json()).catch(() => []),
        fetch('/api/admin/rides', { headers: authHeaders }).then((r) => r.json()).catch(() => []),
        fetch('/api/admin/withdrawals', { headers: authHeaders }).then((r) => r.json()).catch(() => []),
        fetch('/api/support/tickets', { headers: authHeaders }).then((r) => r.json()).catch(() => []),
        fetch('/api/admin/audit-logs', { headers: authHeaders }).then((r) => r.json()).catch(() => []),
      ]);

      if (Array.isArray(uRes)) {
        setUsers(uRes.map((u: any) => ({ ...u, id: u._id || u.id })));
      }
      if (Array.isArray(rRes)) {
        setPastRides(rRes.map((r: any) => ({ ...r, id: r._id || r.id })));
      }
      if (Array.isArray(wRes)) {
        setWithdrawals(wRes.map((w: any) => ({ ...w, id: w._id || w.id })));
      }
      if (Array.isArray(tRes)) {
        setSupportTickets(tRes.map((t: any) => ({ ...t, id: t._id || t.id })));
      }
      if (Array.isArray(lRes)) {
        setAuditLogs(lRes.map((l: any) => ({ ...l, id: l._id || l.id })));
      }
    } catch (e) {
      console.warn('Notice loading admin data:', e);
    }
  }, []);

  // Real-Time Event Bus Subscription
  useEffect(() => {
    const handleRideRequested = (newRide: RideRequest) => {
      if (currentDriver.isOnline) {
        setIncomingDriverRequest(newRide);
      }
      setPastRides((prev) => [newRide, ...prev.filter((r) => r.id !== newRide.id)]);
    };

    const handleRideStatusChanged = (data: { rideId: string; status: string; driver?: Driver; actualFare?: number }) => {
      setActiveRide((prev) => {
        if (prev && prev.id === data.rideId) {
          const updated = {
            ...prev,
            status: data.status as any,
            ...(data.driver ? { driverId: data.driver.id, driver: data.driver } : {}),
            ...(data.actualFare ? { actualFare: data.actualFare } : {}),
          };

          // If trip completed, auto-prompt post-ride rating modal for rider
          if (data.status === 'TRIP_COMPLETED') {
            const role = currentUser.role === 'driver' ? 'driver' : 'rider';
            setFeedbackModalRide(updated);
            setFeedbackModalRole(role);
          }

          return updated;
        }
        return prev;
      });

      setPastRides((prev) =>
        prev.map((r) => (r.id === data.rideId ? { ...r, status: data.status as any, actualFare: data.actualFare || r.actualFare } : r))
      );
      setDriverPastRides((prev) =>
        prev.map((r) => (r.id === data.rideId ? { ...r, status: data.status as any, actualFare: data.actualFare || r.actualFare } : r))
      );
    };

    const handleRideRated = (data: {
      rideId: string;
      role: 'rider' | 'driver';
      feedback: any;
      updatedDriverRating?: number;
      updatedPassengerRating?: number;
      ride?: any;
    }) => {
      setPastRides((prev) =>
        prev.map((r) => {
          if (r.id === data.rideId) {
            const updated = { ...r, status: 'RATED' as const };
            if (data.role === 'driver') {
              updated.driverFeedback = data.feedback;
            } else {
              updated.riderFeedback = data.feedback;
              updated.rating = data.feedback.rating;
            }
            return updated;
          }
          return r;
        })
      );

      setDriverPastRides((prev) =>
        prev.map((r) => {
          if (r.id === data.rideId) {
            const updated = { ...r, status: 'RATED' as const };
            if (data.role === 'driver') {
              updated.driverFeedback = data.feedback;
            } else {
              updated.riderFeedback = data.feedback;
              updated.rating = data.feedback.rating;
            }
            return updated;
          }
          return r;
        })
      );

      if (data.updatedDriverRating) {
        setCurrentDriver((d) => ({ ...d, rating: data.updatedDriverRating! }));
        setDrivers((prev) =>
          prev.map((d) => (d.id === currentDriver.id ? { ...d, rating: data.updatedDriverRating! } : d))
        );
      }
      if (data.updatedPassengerRating && currentUser.id) {
        setCurrentUser((u) => {
          const updated = { ...u, rating: data.updatedPassengerRating! };
          localStorage.setItem('trustride_user', JSON.stringify(updated));
          return updated;
        });
      }
    };

    const handleDriverLocation = (data: { driverId: string; location: any }) => {
      setActiveRide((prev) => {
        if (prev && prev.driverId === data.driverId) {
          return { ...prev, driverLocation: data.location };
        }
        return prev;
      });
    };

    const handleDriverStatus = (data: { driverId: string; isOnline: boolean }) => {
      setDrivers((prev) =>
        prev.map((d) => (d.id === data.driverId ? { ...d, isOnline: data.isOnline } : d))
      );
    };

    const handleWalletDeposit = (data: { userId: string; newBalance: number; amount: number }) => {
      if (currentUser.id === data.userId) {
        setCurrentUser((u) => {
          const updated = { ...u, walletBalance: data.newBalance };
          localStorage.setItem('trustride_user', JSON.stringify(updated));
          return updated;
        });
      }
    };

    const handleChatMessage = (msg: ChatMessage) => {
      setChatMessages((prev) => [...prev, msg]);
    };

    const handleSosTriggered = (alert: any) => {
      setIsEmergencyTriggered(true);
      addAuditLog('EMERGENCY_SOS', `Alert ID: ${alert.id || 'N/A'}`, `Live emergency beacon from user.`);
    };

    const handleWithdrawalApproved = (data: { withdrawalId: string }) => {
      setWithdrawals((prev) =>
        prev.map((w) => (w.id === data.withdrawalId ? { ...w, status: 'PROCESSED' } : w))
      );
    };

    const handleTicketCreated = (tkt: SupportTicket) => {
      setSupportTickets((prev) => [tkt, ...prev]);
    };

    const handleTicketResolved = (data: { ticketId: string; response: string }) => {
      setSupportTickets((prev) =>
        prev.map((t) => (t.id === data.ticketId ? { ...t, status: 'RESOLVED', adminResponse: data.response } : t))
      );
    };

    realtimeService.on('ride:requested', handleRideRequested);
    realtimeService.on('ride:status_changed', handleRideStatusChanged);
    realtimeService.on('ride:rated', handleRideRated);
    realtimeService.on('driver:location', handleDriverLocation);
    realtimeService.on('driver:status', handleDriverStatus);
    realtimeService.on('wallet:deposit', handleWalletDeposit);
    realtimeService.on('chat:message', handleChatMessage);
    realtimeService.on('sos:triggered', handleSosTriggered);
    realtimeService.on('withdrawal:approved', handleWithdrawalApproved);
    realtimeService.on('ticket:created', handleTicketCreated);
    realtimeService.on('ticket:resolved', handleTicketResolved);

    return () => {
      realtimeService.off('ride:requested', handleRideRequested);
      realtimeService.off('ride:status_changed', handleRideStatusChanged);
      realtimeService.off('ride:rated', handleRideRated);
      realtimeService.off('driver:location', handleDriverLocation);
      realtimeService.off('driver:status', handleDriverStatus);
      realtimeService.off('wallet:deposit', handleWalletDeposit);
      realtimeService.off('chat:message', handleChatMessage);
      realtimeService.off('sos:triggered', handleSosTriggered);
      realtimeService.off('withdrawal:approved', handleWithdrawalApproved);
      realtimeService.off('ticket:created', handleTicketCreated);
      realtimeService.off('ticket:resolved', handleTicketResolved);
    };
  }, [currentDriver.isOnline, currentUser.id]);

  // Initial Drivers & Auth Check
  useEffect(() => {
    fetch('/api/drivers')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((d: any) => ({ ...d, id: d._id || d.id }));
          setDrivers(formatted);
          const approved = formatted.find((d: Driver) => d.status === 'APPROVED');
          if (approved) setCurrentDriver(approved);
        }
      })
      .catch((err) => console.log('Notice loading drivers from server:', err));

    if (authToken) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Session expired');
        })
        .then((data) => {
          if (data.user) {
            const verifiedUser: User = {
              id: data.user._id || data.user.id,
              name: data.user.name,
              email: data.user.email || '',
              phone: data.user.phone,
              role: data.user.role || 'customer',
              avatar: data.user.avatar,
              rating: data.user.rating || 5.0,
              tripsCount: data.user.tripsCount || 0,
              walletBalance: data.user.walletBalance || 0,
              referralCode: data.user.referralCode || '',
              createdAt: data.user.createdAt || '',
            };
            setCurrentUser(verifiedUser);
            localStorage.setItem('trustride_user', JSON.stringify(verifiedUser));

            fetch(`/api/rides/user/${verifiedUser.id}`)
              .then((r) => r.json())
              .then((rides) => {
                if (Array.isArray(rides)) {
                  setPastRides(rides.map((r: any) => ({ ...r, id: r._id || r.id })));
                }
              })
              .catch(() => {});

            fetch(`/api/deliveries/user/${verifiedUser.id}`)
              .then((r) => r.json())
              .then((dels) => {
                if (Array.isArray(dels)) {
                  setDeliveries(dels.map((d: any) => ({ ...d, id: d._id || d.id })));
                }
              })
              .catch(() => {});
          }
        })
        .catch(() => {
          logout();
        });
    }

    refreshAdminData();
  }, [authToken, refreshAdminData]);

  // Auth Handlers
  const login = (token: string, user: User) => {
    setAuthToken(token);
    setCurrentUser(user);
    localStorage.setItem('trustride_token', token);
    localStorage.setItem('trustride_user', JSON.stringify(user));
    addAuditLog('USER_LOGIN', `User: ${user.name}`, `Logged in with phone ${user.phone}`);

    // Direct dashboard routing based on user specification
    if (isSuperAdminUser(user) || user.role === 'admin') {
      setActiveTab('admin');
      refreshAdminData();
    } else if (user.role === 'driver') {
      setActiveTab('driver');
    } else if (user.role === 'fleet_owner') {
      setActiveTab('fleet-dashboard');
    } else if (user.role === 'logistics_operator') {
      setActiveTab('logistics');
    } else {
      setActiveTab('rider-dashboard');
    }

    if (user.role === 'driver') {
      setCurrentDriver((prev) => ({
        ...prev,
        userId: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
      }));
    }

    if (user.id) {
      fetch(`/api/rides/user/${user.id}`)
        .then((r) => r.json())
        .then((rides) => {
          if (Array.isArray(rides)) {
            setPastRides(rides.map((r: any) => ({ ...r, id: r._id || r.id })));
          }
        })
        .catch(() => {});

      fetch(`/api/deliveries/user/${user.id}`)
        .then((r) => r.json())
        .then((dels) => {
          if (Array.isArray(dels)) {
            setDeliveries(dels.map((d: any) => ({ ...d, id: d._id || d.id })));
          }
        })
        .catch(() => {});
    }
  };

  const logout = () => {
    setAuthToken(null);
    setCurrentUser(GUEST_USER);
    localStorage.removeItem('trustride_token');
    localStorage.removeItem('trustride_user');
    setActiveTab('home');
  };

  const addAuditLog = (action: string, target: string, details: string) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      actorId: currentUser.id || 'system',
      actorName: currentUser.name || 'System',
      action,
      target,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    fetch('/api/admin/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog),
    }).catch(() => {});
  };

  const switchRole = (role: User['role']) => {
    // Security check: Only designated Super Admin can access Operations Admin
    if (role === 'admin' && !isSuperAdminUser(currentUser)) {
      console.warn('Unauthorized role switch attempt blocked. Admin is reserved for Super Admin.');
      return;
    }

    setCurrentUser((prev) => {
      const updated = { ...prev, role };
      localStorage.setItem('trustride_user', JSON.stringify(updated));
      return updated;
    });

    if (role === 'admin') {
      refreshAdminData();
      setActiveTab('admin');
    } else if (role === 'driver') {
      setActiveTab('driver');
    } else if (role === 'fleet_owner') {
      setActiveTab('fleet-dashboard');
    } else if (role === 'logistics_operator') {
      setActiveTab('logistics');
    } else {
      setActiveTab('rider-dashboard');
    }
  };

  const toggleDriverOnline = async () => {
    const nextState = !currentDriver.isOnline;
    setCurrentDriver((prev) => ({ ...prev, isOnline: nextState }));
    setDrivers((all) => all.map((d) => (d.id === currentDriver.id ? { ...d, isOnline: nextState } : d)));

    try {
      await fetch(`/api/drivers/${currentDriver.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: nextState }),
      });
    } catch (e) {
      console.log('Notice updating driver status:', e);
    }
  };

  // Ride lifecycle
  const requestRide = async (rideData: Omit<RideRequest, 'id' | 'status' | 'createdAt' | 'otp' | 'paymentStatus'>): Promise<RideRequest> => {
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const response = await fetch('/api/rides/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...rideData,
        otp: generatedOtp,
      }),
    });

    const data = await response.json();
    const newRide: RideRequest = data.ride || {
      ...rideData,
      id: `ride_${Date.now()}`,
      status: 'SEARCHING_FOR_DRIVER',
      createdAt: new Date().toISOString(),
      otp: generatedOtp,
      paymentStatus: 'PENDING',
    };

    setActiveRide(newRide);
    setPastRides((prev) => [newRide, ...prev]);

    return newRide;
  };

  const acceptRideDriver = async (rideId: string) => {
    setActiveRide((prev) => (prev ? { ...prev, status: 'DRIVER_ACCEPTED', driverId: currentDriver.id, driver: currentDriver } : prev));
    setIncomingDriverRequest(null);

    await fetch(`/api/rides/${rideId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'DRIVER_ACCEPTED', driver: currentDriver }),
    }).catch(() => {});
  };

  const declineRideDriver = (rideId: string) => {
    setIncomingDriverRequest(null);
  };

  const driverArrived = async (rideId: string) => {
    setActiveRide((prev) => (prev ? { ...prev, status: 'DRIVER_ARRIVED' } : prev));
    await fetch(`/api/rides/${rideId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'DRIVER_ARRIVED' }),
    }).catch(() => {});
  };

  const startTrip = (rideId: string, otp: string): boolean => {
    if (activeRide && activeRide.otp !== otp) {
      return false;
    }

    setActiveRide((prev) => (prev ? { ...prev, status: 'TRIP_STARTED' } : prev));

    fetch(`/api/rides/${rideId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'TRIP_STARTED' }),
    }).catch(() => {});

    return true;
  };

  const completeTrip = async (rideId: string, actualFare?: number) => {
    const fare = actualFare || (activeRide ? activeRide.estimatedFare : 35);
    const completedRide: RideRequest | null = activeRide
      ? { ...activeRide, status: 'TRIP_COMPLETED' as const, actualFare: fare }
      : null;

    setActiveRide(completedRide);

    if (completedRide) {
      setPastRides((prev) => [completedRide, ...prev.filter((r) => r.id !== rideId)]);
      setDriverPastRides((prev) => [completedRide, ...prev.filter((r) => r.id !== rideId)]);

      // Auto-open feedback modal for driver to rate rider
      setFeedbackModalRide(completedRide);
      setFeedbackModalRole('driver');
    }

    await fetch(`/api/rides/${rideId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'TRIP_COMPLETED', actualFare: fare }),
    }).catch(() => {});

    refreshAdminData();
  };

  const submitRideFeedback = async (
    rideId: string,
    role: 'rider' | 'driver',
    rating: number,
    tags: string[],
    comment?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/rides/${rideId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, rating, tags, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit feedback');

      const feedbackObj: RideFeedback = {
        rating,
        tags,
        comment,
        createdAt: new Date().toISOString(),
      };

      setPastRides((prev) =>
        prev.map((r) => {
          if (r.id === rideId) {
            return {
              ...r,
              status: 'RATED',
              ...(role === 'driver' ? { driverFeedback: feedbackObj } : { riderFeedback: feedbackObj, rating }),
            };
          }
          return r;
        })
      );

      setDriverPastRides((prev) =>
        prev.map((r) => {
          if (r.id === rideId) {
            return {
              ...r,
              status: 'RATED',
              ...(role === 'driver' ? { driverFeedback: feedbackObj } : { riderFeedback: feedbackObj, rating }),
            };
          }
          return r;
        })
      );

      setActiveRide((prev) => {
        if (prev && prev.id === rideId) {
          return {
            ...prev,
            status: 'RATED',
            ...(role === 'driver' ? { driverFeedback: feedbackObj } : { riderFeedback: feedbackObj, rating }),
          };
        }
        return prev;
      });

      if (data.updatedDriverRating) {
        setCurrentDriver((d) => ({ ...d, rating: data.updatedDriverRating }));
      }
      if (data.updatedPassengerRating && currentUser.id) {
        setCurrentUser((u) => {
          const updated = { ...u, rating: data.updatedPassengerRating };
          localStorage.setItem('trustride_user', JSON.stringify(updated));
          return updated;
        });
      }

      addAuditLog(
        'RIDE_RATED',
        `Ride #${rideId}`,
        `${role === 'driver' ? 'Driver' : 'Rider'} gave ${rating} stars: "${comment || 'No comment'}"`
      );

      return true;
    } catch (err: any) {
      console.error('Feedback submit error:', err);
      return false;
    }
  };

  const rateTrip = (rideId: string, rating: number, comment?: string) => {
    submitRideFeedback(rideId, 'rider', rating, ['✨ Clean Vehicle', '🛡️ Safe Driving'], comment);
  };

  const cancelRide = async (rideId: string, reason: string) => {
    setActiveRide(null);
    await fetch(`/api/rides/${rideId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CANCELLED', reason }),
    }).catch(() => {});
  };

  const createDeliveryOrder = async (order: Omit<DeliveryOrder, 'id' | 'status' | 'createdAt' | 'recipientOtp'>): Promise<DeliveryOrder> => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const res = await fetch('/api/deliveries/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...order, recipientOtp: otp }),
    });
    const data = await res.json();
    const newDelivery = data.delivery || {
      ...order,
      id: `del_${Date.now()}`,
      status: 'ORDER_PLACED',
      createdAt: new Date().toISOString(),
      recipientOtp: otp,
    };
    setDeliveries((prev) => [newDelivery, ...prev]);
    return newDelivery;
  };

  const createLogisticsBooking = async (booking: Omit<LogisticsOrder, 'id' | 'status' | 'createdAt'>): Promise<LogisticsOrder> => {
    const res = await fetch('/api/logistics/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking),
    });
    const data = await res.json();
    const newOrder = data.order || {
      ...booking,
      id: `log_${Date.now()}`,
      status: 'BOOKED',
      createdAt: new Date().toISOString(),
    };
    setLogisticsOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const bookVehicleHire = async (booking: Omit<VehicleHireBooking, 'id' | 'status' | 'createdAt'>): Promise<VehicleHireBooking> => {
    const newBooking: VehicleHireBooking = {
      ...booking,
      id: `hire_${Date.now()}`,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };
    setHireBookings((prev) => [newBooking, ...prev]);
    return newBooking;
  };

  const bookAirportTransfer = async (booking: Omit<AirportTransferBooking, 'id' | 'status' | 'createdAt'>): Promise<AirportTransferBooking> => {
    const newBooking: AirportTransferBooking = {
      ...booking,
      id: `apt_${Date.now()}`,
      status: 'BOOKED',
      createdAt: new Date().toISOString(),
    };
    setAirportTransfers((prev) => [newBooking, ...prev]);
    return newBooking;
  };

  const depositToWallet = async (amount: number, channel: PaymentMethod, phoneNumber: string): Promise<PaymentIntent> => {
    const intent = await paymentService.initiateMobileMoneyPayment(
      amount,
      channel,
      phoneNumber,
      'Trust Ride Sierra Leone Wallet Deposit'
    );

    const res = await fetch('/api/wallet/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        amount,
        channel,
        phoneNumber,
        reference: intent.reference,
      }),
    });

    const data = await res.json();
    if (data.newBalance !== undefined) {
      setCurrentUser((u) => {
        const updated = { ...u, walletBalance: data.newBalance };
        localStorage.setItem('trustride_user', JSON.stringify(updated));
        return updated;
      });
    }

    return intent;
  };

  const requestWithdrawal = async (amount: number, channel: 'orange_money' | 'afrimoney' | 'bank_transfer', accountNumber: string): Promise<boolean> => {
    const res = await fetch('/api/withdrawals/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        driverId: currentDriver.id,
        driverName: currentDriver.name,
        phone: currentDriver.phone,
        amount,
        channel,
        accountNumber,
      }),
    });
    return res.ok;
  };

  const sendChatMessage = (rideId: string, message: string) => {
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      rideId,
      senderId: currentUser.id || 'passenger',
      senderName: currentUser.name || 'Passenger',
      senderRole: 'rider',
      message,
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, newMsg]);

    fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg),
    }).catch(() => {});
  };

  const triggerEmergencySos = (alertDetails?: string) => {
    setIsEmergencyTriggered(true);
    fetch('/api/sos/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        userName: currentUser.name,
        phone: currentUser.phone,
        city: currentCity,
        details: alertDetails,
        location: activeRide ? activeRide.pickup : POPULAR_LOCATIONS[0],
      }),
    }).catch(() => {});
  };

  const resolveEmergencySos = () => {
    setIsEmergencyTriggered(false);
  };

  const createSupportTicket = async (ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt'>) => {
    await fetch('/api/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticket),
    });
  };

  const resolveSupportTicket = async (ticketId: string, response: string) => {
    await fetch(`/api/support/tickets/${ticketId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response }),
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        authToken,
        login,
        logout,
        switchRole,
        currentDriver,
        setCurrentDriver,
        toggleDriverOnline,
        drivers,
        currentCity,
        setCurrentCity,
        activeRide,
        setActiveRide,
        incomingDriverRequest,
        pastRides,
        driverPastRides,
        loadDriverRides,
        requestRide,
        acceptRideDriver,
        declineRideDriver,
        driverArrived,
        startTrip,
        completeTrip,
        rateTrip,
        submitRideFeedback,
        feedbackModalRide,
        feedbackModalRole,
        openFeedbackModal,
        closeFeedbackModal,
        cancelRide,
        deliveries,
        createDeliveryOrder,
        logisticsOrders,
        createLogisticsBooking,
        vehiclesForHire,
        hireBookings,
        bookVehicleHire,
        airportTransfers,
        bookAirportTransfer,
        walletTransactions,
        depositToWallet,
        withdrawals,
        requestWithdrawal,
        chatMessages,
        sendChatMessage,
        isEmergencyTriggered,
        triggerEmergencySos,
        resolveEmergencySos,
        pricingRules,
        pricingEngine,
        mapService,
        paymentService,
        realtimeService,
        cityAvailability,
        promoCodes,
        auditLogs,
        addAuditLog,
        activeTab,
        setActiveTab,
        users,
        supportTickets,
        createSupportTicket,
        resolveSupportTicket,
        refreshAdminData,
        isRealtimeConnected,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
