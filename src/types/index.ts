export const SUPER_ADMIN_ID = '6ab6c7b86207766e1e8df0de';

export type UserRole = 'customer' | 'driver' | 'fleet_owner' | 'logistics_operator' | 'admin' | 'support_agent';

export const isSuperAdminUser = (user?: { id?: string; _id?: string; email?: string } | null): boolean => {
  if (!user) return false;
  const userId = user.id || (user as any)._id;
  const userEmail = (user.email || '').toLowerCase().trim();
  return userId === SUPER_ADMIN_ID || userEmail === 'dalabapays@gmail.com';
};

export interface LocationPoint {
  lat: number;
  lng: number;
  name: string;
  address: string;
  city: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  rating: number;
  tripsCount: number;
  walletBalance: number;
  referralCode: string;
  city?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: string;
}

export type DriverStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface DriverDocument {
  id: string;
  type: 'DRIVING_LICENSE' | 'VEHICLE_REGISTRATION' | 'POLICE_CLEARANCE' | 'FITNESS_CERTIFICATE' | 'INSURANCE';
  name: string;
  fileUrl: string;
  uploadedAt: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface Vehicle {
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  category: VehicleCategory;
}

export interface Driver {
  id: string;
  userId?: string;
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  city: string;
  status: DriverStatus;
  isOnline: boolean;
  rating: number;
  totalTrips: number;
  walletBalance: number;
  currentLocation: {
    lat: number;
    lng: number;
    heading: number;
  };
  vehicle: Vehicle;
  documents: DriverDocument[];
}

export type VehicleCategory = 'kekeh' | 'okada' | 'economy' | 'comfort' | 'suv' | 'minibus' | 'cargo';

export type RideStatus =
  | 'REQUESTED'
  | 'SEARCHING_FOR_DRIVER'
  | 'DRIVER_ACCEPTED'
  | 'DRIVER_ARRIVING'
  | 'DRIVER_ARRIVED'
  | 'TRIP_STARTED'
  | 'TRIP_COMPLETED'
  | 'CANCELLED'
  | 'RATED';

export type PaymentMethod = 'orange_money' | 'afrimoney' | 'cash' | 'wallet' | 'card';

export interface RideFeedback {
  rating: number; // 1 to 5 stars
  tags: string[];
  comment?: string;
  createdAt: string;
}

export interface RideRequest {
  id: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  driverId?: string;
  driver?: Driver;
  pickup: LocationPoint;
  destination: LocationPoint;
  category: VehicleCategory;
  status: RideStatus;
  estimatedFare: number;
  actualFare?: number;
  distanceKm: number;
  durationMinutes: number;
  otp: string;
  paymentMethod: PaymentMethod;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  driverLocation?: { lat: number; lng: number };
  rating?: number;
  riderFeedback?: RideFeedback;
  driverFeedback?: RideFeedback;
  createdAt: string;
}

export interface DeliveryOrder {
  id: string;
  senderId: string;
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  packageDescription: string;
  packageType: 'documents' | 'food' | 'electronics' | 'parcel' | 'fragile';
  weightKg: number;
  pickupAddress: string;
  deliveryAddress: string;
  city: string;
  status: 'ORDER_PLACED' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED';
  deliveryFee: number;
  paymentMethod: PaymentMethod;
  recipientOtp: string;
  driverId?: string;
  createdAt: string;
}

export interface LogisticsOrder {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  cargoType: string;
  weightTons: number;
  truckType: 'van' | 'box_truck' | 'flatbed' | 'tipper_truck';
  originCity: string;
  destinationCity: string;
  pickupDate: string;
  status: 'BOOKED' | 'ASSIGNED' | 'IN_TRANSIT' | 'COMPLETED';
  totalPrice: number;
  createdAt: string;
}

export interface VehicleHireBooking {
  id: string;
  userId: string;
  vehicleId: string;
  category: VehicleCategory;
  make: string;
  model: string;
  startDate: string;
  durationDays: number;
  withChauffeur: boolean;
  city: string;
  totalPrice: number;
  status: 'CONFIRMED' | 'ACTIVE' | 'RETURNED';
  createdAt: string;
}

export interface AirportTransferBooking {
  id: string;
  userId: string;
  flightNumber: string;
  flightTime: string;
  passengerCount: number;
  transferType: 'water_taxi_speed' | 'vehicle_sea_coach' | 'private_executive_suv';
  originOrDestination: string;
  totalFare: number;
  status: 'BOOKED' | 'DISPATCHED' | 'COMPLETED';
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'DEPOSIT' | 'PAYMENT' | 'EARNING' | 'WITHDRAWAL' | 'REFUND';
  description: string;
  channel: PaymentMethod;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  reference: string;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  driverId: string;
  driverName: string;
  phone: string;
  amount: number;
  channel: 'orange_money' | 'afrimoney' | 'bank_transfer';
  status: 'PENDING' | 'PROCESSED' | 'REJECTED';
  accountNumber: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  subject: string;
  description: string;
  category: 'RIDE_DISPUTE' | 'WALLET_PAYMENT' | 'SAFETY_REPORT' | 'DRIVER_BEHAVIOR' | 'GENERAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  adminResponse?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  rideId: string;
  senderId: string;
  senderName: string;
  senderRole: 'rider' | 'driver' | 'support';
  message: string;
  timestamp: string;
}

export interface PricingRule {
  category: VehicleCategory;
  name: string;
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  minimumFare: number;
  surgeMultiplier: number;
}

export interface CityServiceAvailability {
  city: string;
  services: {
    rides: boolean;
    kekeh: boolean;
    okada: boolean;
    delivery: boolean;
    logistics: boolean;
    hire: boolean;
  };
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}
