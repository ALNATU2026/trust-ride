import mongoose, { Schema, Document, Model } from 'mongoose';

// -------------------------------------------------------------
// USER MODEL
// -------------------------------------------------------------
export interface IUserModel extends Document {
  name: string;
  email?: string;
  phone: string;
  passwordHash: string;
  role: 'customer' | 'driver' | 'fleet_owner' | 'logistics_operator' | 'admin' | 'support_agent';
  avatar?: string;
  rating: number;
  tripsCount: number;
  walletBalance: number;
  referralCode: string;
  city: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserModel>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: '' },
    phone: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['customer', 'driver', 'fleet_owner', 'logistics_operator', 'admin', 'support_agent'],
      default: 'customer',
    },
    avatar: { type: String, default: '' },
    rating: { type: Number, default: 5.0 },
    tripsCount: { type: Number, default: 0 },
    walletBalance: { type: Number, default: 0.0 },
    referralCode: { type: String, required: true, uppercase: true },
    city: { type: String, default: 'Freetown' },
    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relationship: { type: String, default: '' },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const UserModel: Model<any> = (mongoose.models.User as any) || mongoose.model('User', UserSchema);

// -------------------------------------------------------------
// DRIVER MODEL
// -------------------------------------------------------------
export interface IDriverModel extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email: string;
  city: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  isOnline: boolean;
  rating: number;
  totalTrips: number;
  walletBalance: number;
  vehicle: {
    make: string;
    model: string;
    year: number;
    color: string;
    plateNumber: string;
    category: string;
  };
  currentLocation: {
    lat: number;
    lng: number;
    heading: number;
  };
  documents: Array<{
    type: string;
    url: string;
    status: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema = new Schema<IDriverModel>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    city: { type: String, default: 'Freetown' },
    status: {
      type: String,
      enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED'],
      default: 'PENDING',
    },
    isOnline: { type: Boolean, default: false },
    rating: { type: Number, default: 5.0 },
    totalTrips: { type: Number, default: 0 },
    walletBalance: { type: Number, default: 0.0 },
    vehicle: {
      make: { type: String, default: 'Toyota' },
      model: { type: String, default: 'Corolla' },
      year: { type: Number, default: 2022 },
      color: { type: String, default: 'Silver' },
      plateNumber: { type: String, default: '' },
      category: { type: String, default: 'economy' },
    },
    currentLocation: {
      lat: { type: Number, default: 8.4844 },
      lng: { type: Number, default: -13.2344 },
      heading: { type: Number, default: 0 },
    },
    documents: [
      {
        type: { type: String },
        url: { type: String },
        status: { type: String, default: 'VERIFIED' },
      },
    ],
  },
  { timestamps: true }
);

export const DriverModel: Model<any> = (mongoose.models.Driver as any) || mongoose.model('Driver', DriverSchema);

// -------------------------------------------------------------
// RIDE MODEL
// -------------------------------------------------------------
export interface IRideModel extends Document {
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  driverId?: string;
  pickup: {
    name: string;
    address: string;
    city: string;
    lat: number;
    lng: number;
  };
  destination: {
    name: string;
    address: string;
    city: string;
    lat: number;
    lng: number;
  };
  category: string;
  status: string;
  estimatedFare: number;
  actualFare?: number;
  distanceKm: number;
  durationMinutes: number;
  otp: string;
  paymentMethod: string;
  paymentStatus: string;
  rating?: number;
  riderFeedback?: {
    rating: number;
    tags: string[];
    comment?: string;
    createdAt: Date;
  };
  driverFeedback?: {
    rating: number;
    tags: string[];
    comment?: string;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const RideSchema = new Schema<IRideModel>(
  {
    passengerId: { type: String, required: true },
    passengerName: { type: String, required: true },
    passengerPhone: { type: String, required: true },
    driverId: { type: String },
    pickup: {
      name: { type: String, required: true },
      address: { type: String, default: '' },
      city: { type: String, default: 'Freetown' },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    destination: {
      name: { type: String, required: true },
      address: { type: String, default: '' },
      city: { type: String, default: 'Freetown' },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    category: { type: String, default: 'economy' },
    status: {
      type: String,
      default: 'REQUESTED',
    },
    estimatedFare: { type: Number, required: true },
    actualFare: { type: Number },
    distanceKm: { type: Number, default: 5 },
    durationMinutes: { type: Number, default: 15 },
    otp: { type: String, default: '1234' },
    paymentMethod: { type: String, default: 'orange_money' },
    paymentStatus: { type: String, default: 'PENDING' },
    rating: { type: Number },
    riderFeedback: {
      rating: { type: Number },
      tags: [{ type: String }],
      comment: { type: String, default: '' },
      createdAt: { type: Date, default: Date.now },
    },
    driverFeedback: {
      rating: { type: Number },
      tags: [{ type: String }],
      comment: { type: String, default: '' },
      createdAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

export const RideModel: Model<any> = (mongoose.models.Ride as any) || mongoose.model('Ride', RideSchema);

// -------------------------------------------------------------
// DELIVERY MODEL
// -------------------------------------------------------------
const DeliverySchema = new Schema(
  {
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderPhone: { type: String, required: true },
    recipientName: { type: String, required: true },
    recipientPhone: { type: String, required: true },
    packageDescription: { type: String, required: true },
    packageType: { type: String, default: 'documents' },
    weightKg: { type: Number, default: 1 },
    pickupAddress: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    city: { type: String, default: 'Freetown' },
    status: { type: String, default: 'ORDER_PLACED' },
    deliveryFee: { type: Number, required: true },
    paymentMethod: { type: String, default: 'orange_money' },
    recipientOtp: { type: String, default: '4321' },
    driverId: { type: String },
  },
  { timestamps: true }
);

export const DeliveryModel: Model<any> = (mongoose.models.Delivery as any) || mongoose.model('Delivery', DeliverySchema);

// -------------------------------------------------------------
// LOGISTICS FREIGHT MODEL
// -------------------------------------------------------------
const LogisticsSchema = new Schema(
  {
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    cargoType: { type: String, required: true },
    weightTons: { type: Number, required: true },
    truckType: { type: String, required: true },
    originCity: { type: String, required: true },
    destinationCity: { type: String, required: true },
    status: { type: String, default: 'BOOKED' },
    totalPrice: { type: Number, required: true },
  },
  { timestamps: true }
);

export const LogisticsModel: Model<any> = (mongoose.models.Logistics as any) || mongoose.model('Logistics', LogisticsSchema);

// -------------------------------------------------------------
// WALLET TRANSACTION MODEL
// -------------------------------------------------------------
const WalletTransactionSchema = new Schema(
  {
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['DEPOSIT', 'PAYMENT', 'EARNING', 'WITHDRAWAL', 'REFUND'], required: true },
    description: { type: String, required: true },
    channel: { type: String, default: 'orange_money' },
    status: { type: String, default: 'COMPLETED' },
    reference: { type: String, required: true },
  },
  { timestamps: true }
);

export const WalletTransactionModel: Model<any> =
  (mongoose.models.WalletTransaction as any) || mongoose.model('WalletTransaction', WalletTransactionSchema);

// -------------------------------------------------------------
// WITHDRAWAL REQUEST MODEL
// -------------------------------------------------------------
const WithdrawalSchema = new Schema(
  {
    driverId: { type: String, required: true },
    driverName: { type: String, required: true },
    phone: { type: String, required: true },
    amount: { type: Number, required: true },
    channel: { type: String, default: 'orange_money' },
    status: { type: String, enum: ['PENDING', 'PROCESSED', 'REJECTED'], default: 'PENDING' },
    accountNumber: { type: String, required: true },
  },
  { timestamps: true }
);

export const WithdrawalModel: Model<any> =
  (mongoose.models.Withdrawal as any) || mongoose.model('Withdrawal', WithdrawalSchema);

// -------------------------------------------------------------
// SUPPORT TICKET MODEL
// -------------------------------------------------------------
const SupportTicketSchema = new Schema(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userPhone: { type: String, required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: 'GENERAL' },
    priority: { type: String, default: 'MEDIUM' },
    status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED'], default: 'OPEN' },
    adminResponse: { type: String },
  },
  { timestamps: true }
);

export const SupportTicketModel: Model<any> =
  (mongoose.models.SupportTicket as any) || mongoose.model('SupportTicket', SupportTicketSchema);

// -------------------------------------------------------------
// AUDIT LOG MODEL
// -------------------------------------------------------------
const AuditLogSchema = new Schema(
  {
    actorId: { type: String, required: true },
    actorName: { type: String, required: true },
    action: { type: String, required: true },
    target: { type: String, required: true },
    details: { type: String, required: true },
  },
  { timestamps: true }
);

export const AuditLogModel: Model<any> = (mongoose.models.AuditLog as any) || mongoose.model('AuditLog', AuditLogSchema);
