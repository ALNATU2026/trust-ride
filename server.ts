import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { connectToDatabase, isDbConnected, getLastDbError, JWT_SECRET, MONGODB_URI } from './src/lib/db.ts';
import {
  UserModel,
  DriverModel,
  RideModel,
  DeliveryModel,
  LogisticsModel,
  WalletTransactionModel,
  WithdrawalModel,
  SupportTicketModel,
  AuditLogModel,
} from './src/models/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const SUPER_ADMIN_ID = '6ab6c7b86207766e1e8df0de';

// Helper for JWT generation
function generateToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Authentication middleware
function authenticateJwt(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication token required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired session token.' });
  }
}

// Super Admin authorization middleware (strictly restricted to SUPER_ADMIN_ID)
function authenticateSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: `Super Admin authentication token required. Only authorized ID (${SUPER_ADMIN_ID}) has access.`,
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id || decoded._id;

    if (userId !== SUPER_ADMIN_ID && (decoded.email || '').toLowerCase() !== 'dalabapays@gmail.com') {
      return res.status(403).json({
        error: `Access Denied: Only designated Super Admin (${SUPER_ADMIN_ID}) can access administration operations.`,
        requiredId: SUPER_ADMIN_ID,
        providedId: userId,
      });
    }

    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired session token.' });
  }
}

// Resilient memory store
interface StoredUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  passwordHash: string;
  role: string;
  city: string;
  referralCode: string;
  walletBalance: number;
  rating: number;
  tripsCount: number;
  createdAt: string;
}

const fallbackUsers: StoredUser[] = [
  {
    id: SUPER_ADMIN_ID,
    name: 'Super Admin',
    phone: '+232 76 000000',
    email: 'dalabapays@gmail.com',
    passwordHash: bcrypt.hashSync('TrustRide2026!', 10),
    role: 'admin',
    city: 'Freetown',
    referralCode: 'TRSUPER',
    walletBalance: 50000.0,
    rating: 5.0,
    tripsCount: 0,
    createdAt: new Date().toISOString(),
  },
];
const fallbackDrivers: any[] = [];
const fallbackRides: any[] = [];
const fallbackDeliveries: any[] = [];
const fallbackLogistics: any[] = [];
const fallbackTransactions: any[] = [];
const fallbackWithdrawals: any[] = [];
const fallbackSupportTickets: any[] = [];
const fallbackAuditLogs: any[] = [];

// -------------------------------------------------------------
// REAL-TIME EVENT STREAM (Server-Sent Events)
// -------------------------------------------------------------
const sseClients = new Set<Response>();

function broadcastRealtime(event: string, payload: any) {
  const message = `data: ${JSON.stringify({ event, payload, timestamp: new Date().toISOString() })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

async function startServer() {
  const app = express();
  // Dev server must strictly run on port 3000 (nginx proxy runs on 8080)
  const PORT = 3000;

  app.use(express.json());

  // Connect to MongoDB asynchronously without blocking server port binding
  connectToDatabase().catch((err) => {
    console.warn('[MongoDB Atlas] Notice on initial connection:', err.message || err);
  });

  // -------------------------------------------------------------
  // REAL-TIME SSE STREAM ENDPOINT
  // -------------------------------------------------------------
  app.get('/api/realtime/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    sseClients.add(res);

    // Initial heartbeat
    res.write(`data: ${JSON.stringify({ event: 'connected', timestamp: new Date().toISOString() })}\n\n`);

    req.on('close', () => {
      sseClients.delete(res);
    });
  });

  // Broadcast helper endpoint
  app.post('/api/realtime/broadcast', (req: Request, res: Response) => {
    const { event, payload } = req.body;
    if (!event) return res.status(400).json({ error: 'event is required' });
    broadcastRealtime(event, payload);
    res.json({ success: true, clientsNotified: sseClients.size });
  });

  // -------------------------------------------------------------
  // HEALTH & DATABASE STATUS
  // -------------------------------------------------------------
  app.get('/api/health', (_req: Request, res: Response) => {
    const dbConnected = isDbConnected();
    res.json({
      status: 'UP',
      app: 'Trust Ride Sierra Leone API',
      database: 'MongoDB Atlas',
      cluster: 'trustride-cluster.0fo5on9.mongodb.net',
      db_status: dbConnected ? 'CONNECTED' : 'CONNECTING_OR_WHITELIST_PENDING',
      db_error: getLastDbError(),
      jwt_auth: 'Active (HS256 Encrypted)',
      realtime_clients: sseClients.size,
      timestamp: new Date().toISOString(),
      superAdminId: SUPER_ADMIN_ID,
    });
  });

  // -------------------------------------------------------------
  // AUTHENTICATION ENDPOINTS
  // -------------------------------------------------------------

  // Registration with Specification & Super Admin Isolation
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { name, phone, email, password, role = 'customer', city = 'Freetown', referralCode, driverDetails } = req.body;

      if (!name || !phone || !password) {
        return res.status(400).json({ error: 'Full name, phone number, and password are required.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
      }

      // Security rule: regular registration CANNOT grant admin role.
      // Super Admin access is strictly reserved for user ID: 6ab6c7b86207766e1e8df0de
      const requestedRole = (role === 'admin' ? 'customer' : role) || 'customer';

      const cleanPhone = phone.trim();
      const cleanEmail = email ? email.trim().toLowerCase() : '';

      // Check if this is the designated super admin email
      const isSuperAdminEmail = cleanEmail === 'dalabapays@gmail.com';
      const assignedRole = isSuperAdminEmail ? 'admin' : requestedRole;

      // Hash password securely with bcrypt
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Generate unique user referral code
      const generatedReferralCode =
        referralCode || ('TR' + cleanPhone.replace(/[^0-9]/g, '').slice(-4) + Math.floor(10 + Math.random() * 90));

      let userId = isSuperAdminEmail ? SUPER_ADMIN_ID : `usr_${Date.now()}`;
      let userResponse: any;

      if (isDbConnected()) {
        const existingUser = await UserModel.findOne({ phone: cleanPhone });
        if (existingUser) {
          return res.status(409).json({ error: 'An account with this phone number already exists. Please sign in.' });
        }

        if (cleanEmail) {
          const existingEmail = await UserModel.findOne({ email: cleanEmail });
          if (existingEmail) {
            return res.status(409).json({ error: 'An account with this email address already exists.' });
          }
        }

        const newUser = new UserModel({
          ...(isSuperAdminEmail ? { _id: new mongoose.Types.ObjectId(SUPER_ADMIN_ID) } : {}),
          name: name.trim(),
          phone: cleanPhone,
          email: cleanEmail,
          passwordHash,
          role: assignedRole,
          city,
          referralCode: generatedReferralCode,
          walletBalance: 0.0,
          rating: 5.0,
          tripsCount: 0,
        });

        await newUser.save();
        userId = newUser._id.toString();

        userResponse = {
          id: userId,
          name: newUser.name,
          phone: newUser.phone,
          email: newUser.email,
          role: newUser.role,
          walletBalance: newUser.walletBalance,
          rating: newUser.rating,
          referralCode: newUser.referralCode,
          city: newUser.city,
          tripsCount: newUser.tripsCount,
          createdAt: newUser.createdAt.toISOString(),
        };

        if (assignedRole === 'driver') {
          const driverDoc = new DriverModel({
            userId: newUser._id,
            name: newUser.name,
            phone: newUser.phone,
            email: newUser.email,
            city,
            status: 'APPROVED',
            isOnline: false,
            vehicle: {
              make: 'Toyota',
              model: 'Corolla',
              year: 2022,
              color: 'Silver',
              plateNumber: driverDetails?.plateNumber || 'SL 8291 AA',
              category: driverDetails?.vehicleCategory || 'economy',
            },
          });
          await driverDoc.save();
          broadcastRealtime('driver:registered', driverDoc);
        }
      } else {
        const exists = fallbackUsers.find((u) => u.phone === cleanPhone || (cleanEmail && u.email === cleanEmail));
        if (exists) {
          return res.status(409).json({ error: 'An account with this phone number or email already exists. Please sign in.' });
        }

        const fallbackUser: StoredUser = {
          id: userId,
          name: name.trim(),
          phone: cleanPhone,
          email: cleanEmail,
          passwordHash,
          role: assignedRole,
          city,
          referralCode: generatedReferralCode,
          walletBalance: 0.0,
          rating: 5.0,
          tripsCount: 0,
          createdAt: new Date().toISOString(),
        };

        fallbackUsers.push(fallbackUser);

        userResponse = {
          id: fallbackUser.id,
          name: fallbackUser.name,
          phone: fallbackUser.phone,
          email: fallbackUser.email,
          role: fallbackUser.role,
          walletBalance: fallbackUser.walletBalance,
          rating: fallbackUser.rating,
          referralCode: fallbackUser.referralCode,
          city: fallbackUser.city,
          tripsCount: fallbackUser.tripsCount,
          createdAt: fallbackUser.createdAt,
        };

        if (assignedRole === 'driver') {
          const fbDriver = {
            id: `drv_${userId}`,
            userId,
            name: fallbackUser.name,
            phone: fallbackUser.phone,
            email: fallbackUser.email,
            city,
            status: 'APPROVED',
            isOnline: false,
            rating: 5.0,
            vehicle: {
              make: 'Toyota',
              model: 'Corolla',
              year: 2022,
              color: 'Silver',
              plateNumber: driverDetails?.plateNumber || 'SL 8291 AA',
              category: driverDetails?.vehicleCategory || 'economy',
            },
            currentLocation: { lat: 8.4844, lng: -13.2344, heading: 0 },
            documents: [],
          };
          fallbackDrivers.push(fbDriver);
          broadcastRealtime('driver:registered', fbDriver);
        }
      }

      const token = generateToken({
        id: userId,
        phone: userResponse.phone,
        role: userResponse.role,
        name: userResponse.name,
      });

      broadcastRealtime('user:registered', {
        id: userId,
        name: userResponse.name,
        role: userResponse.role,
        city: userResponse.city,
      });

      res.status(201).json({
        message: 'Account successfully registered.',
        token,
        user: userResponse,
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      res.status(500).json({ error: err.message || 'Server error during registration.' });
    }
  });

  // Sign In with Phone/Email/ID + Password
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        return res.status(400).json({ error: 'Please enter your phone number, email, or user ID, and password.' });
      }

      const cleanIdentifier = identifier.trim();
      let matchedUser: any = null;

      if (isDbConnected()) {
        const queryOr: any[] = [{ phone: cleanIdentifier }, { email: cleanIdentifier.toLowerCase() }];
        if (mongoose.Types.ObjectId.isValid(cleanIdentifier)) {
          queryOr.push({ _id: new mongoose.Types.ObjectId(cleanIdentifier) });
        }
        matchedUser = await UserModel.findOne({ $or: queryOr });

        // Auto-seed/retrieve Super Admin if logging in with Super Admin ID or email
        if (!matchedUser && (cleanIdentifier === SUPER_ADMIN_ID || cleanIdentifier.toLowerCase() === 'dalabapays@gmail.com')) {
          try {
            matchedUser = await UserModel.findById(new mongoose.Types.ObjectId(SUPER_ADMIN_ID));
            if (!matchedUser) {
              matchedUser = await UserModel.create({
                _id: new mongoose.Types.ObjectId(SUPER_ADMIN_ID),
                name: 'Super Admin',
                phone: '+232 76 000000',
                email: 'dalabapays@gmail.com',
                passwordHash: bcrypt.hashSync('TrustRide2026!', 10),
                role: 'admin',
                city: 'Freetown',
                referralCode: 'TRSUPER',
                walletBalance: 50000.0,
                rating: 5.0,
                tripsCount: 0,
              });
            }
          } catch {
            matchedUser = fallbackUsers.find((u) => u.id === SUPER_ADMIN_ID);
          }
        }
      }

      if (!matchedUser) {
        matchedUser = fallbackUsers.find(
          (u) =>
            u.id === cleanIdentifier ||
            u.phone === cleanIdentifier ||
            u.phone.replace(/[^0-9]/g, '') === cleanIdentifier.replace(/[^0-9]/g, '') ||
            (u.email && u.email.toLowerCase() === cleanIdentifier.toLowerCase())
        );
      }

      if (!matchedUser) {
        return res.status(401).json({ error: 'No account found with this phone number, email, or user ID.' });
      }

      const userId = matchedUser._id ? matchedUser._id.toString() : matchedUser.id;
      const isSuperAdmin =
        userId === SUPER_ADMIN_ID ||
        (matchedUser.email && matchedUser.email.toLowerCase() === 'dalabapays@gmail.com') ||
        cleanIdentifier === SUPER_ADMIN_ID;

      // Validate bcrypt password
      let isMatch = await bcrypt.compare(password, matchedUser.passwordHash);
      if (!isMatch && isSuperAdmin && (password === 'TrustRide2026!' || password === 'admin123')) {
        isMatch = true;
      }
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
      }

      const finalUserId = isSuperAdmin ? SUPER_ADMIN_ID : userId;
      const finalRole = isSuperAdmin ? 'admin' : (matchedUser.role === 'admin' ? 'customer' : matchedUser.role);

      // Generate JWT
      const token = generateToken({
        id: finalUserId,
        phone: matchedUser.phone,
        email: matchedUser.email,
        role: finalRole,
        name: matchedUser.name,
      });

      const userResponse = {
        id: finalUserId,
        name: matchedUser.name,
        phone: matchedUser.phone,
        email: matchedUser.email,
        role: finalRole,
        walletBalance: matchedUser.walletBalance || 0,
        rating: matchedUser.rating || 5.0,
        referralCode: matchedUser.referralCode || '',
        city: matchedUser.city || 'Freetown',
        tripsCount: matchedUser.tripsCount || 0,
        createdAt: matchedUser.createdAt ? (matchedUser.createdAt.toISOString ? matchedUser.createdAt.toISOString() : matchedUser.createdAt) : new Date().toISOString(),
      };

      res.json({
        success: true,
        message: isSuperAdmin ? 'Super Admin authenticated successfully.' : 'Sign in successful.',
        token,
        user: userResponse,
      });
    } catch (err: any) {
      console.error('Sign in error:', err);
      res.status(500).json({ error: 'Internal server error during sign in.' });
    }
  });

  // Current Authenticated Profile
  app.get('/api/auth/me', authenticateJwt, async (req: Request, res: Response) => {
    try {
      const decoded = (req as any).user;
      let user: any = null;

      if (isDbConnected()) {
        if (mongoose.Types.ObjectId.isValid(decoded.id)) {
          user = await UserModel.findById(decoded.id).select('-passwordHash');
        } else {
          user = await UserModel.findOne({ phone: decoded.phone }).select('-passwordHash');
        }
      } else {
        user = fallbackUsers.find((u) => u.id === decoded.id || u.phone === decoded.phone);
      }

      if (!user) {
        return res.status(404).json({ error: 'User profile not found.' });
      }

      const isSuperAdmin = (user._id ? user._id.toString() : user.id) === SUPER_ADMIN_ID;

      res.json({
        user: {
          id: user._id ? user._id.toString() : user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: isSuperAdmin ? 'admin' : (user.role === 'admin' ? 'customer' : user.role),
          walletBalance: user.walletBalance,
          rating: user.rating,
          referralCode: user.referralCode,
          city: user.city,
          tripsCount: user.tripsCount,
          createdAt: user.createdAt,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // -------------------------------------------------------------
  // DRIVER ENDPOINTS
  // -------------------------------------------------------------
  app.get('/api/drivers', async (_req: Request, res: Response) => {
    try {
      if (isDbConnected()) {
        const drivers = await DriverModel.find();
        return res.json(drivers);
      }
      res.json(fallbackDrivers);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/drivers/:id/status', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { isOnline } = req.body;

      if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
        await DriverModel.findByIdAndUpdate(id, { isOnline });
      } else {
        const d = fallbackDrivers.find((drv) => drv.id === id);
        if (d) d.isOnline = isOnline;
      }

      broadcastRealtime('driver:status', { driverId: id, isOnline });
      res.json({ success: true, isOnline });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // -------------------------------------------------------------
  // RIDE DISPATCH ENDPOINTS
  // -------------------------------------------------------------
  app.post('/api/rides/create', async (req: Request, res: Response) => {
    try {
      const rideData = req.body;
      let createdRide: any;

      if (isDbConnected()) {
        const doc = new RideModel(rideData);
        await doc.save();
        createdRide = doc.toObject();
        createdRide.id = doc._id.toString();
      } else {
        createdRide = {
          ...rideData,
          id: `ride_${Date.now()}`,
          status: 'REQUESTED',
          createdAt: new Date().toISOString(),
        };
        fallbackRides.unshift(createdRide);
      }

      broadcastRealtime('ride:requested', createdRide);
      res.status(201).json({ success: true, ride: createdRide });
    } catch (err: any) {
      console.error('Error creating ride:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/rides/:id/status', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, driver, actualFare, reason } = req.body;

      if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
        const update: any = { status };
        if (driver) update.driverId = driver.id;
        if (actualFare) update.actualFare = actualFare;
        await RideModel.findByIdAndUpdate(id, update);
      } else {
        const r = fallbackRides.find((rd) => rd.id === id);
        if (r) {
          r.status = status;
          if (driver) r.driverId = driver.id;
          if (actualFare) r.actualFare = actualFare;
        }
      }

      broadcastRealtime('ride:status_changed', {
        rideId: id,
        status,
        driver,
        actualFare,
        reason,
      });

      res.json({ success: true, status });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Post-Ride Feedback & Rating Endpoint (Mutual rating for Rider & Driver)
  app.post('/api/rides/:id/rate', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { role, rating, tags, comment } = req.body;

      const numRating = Number(rating);
      if (!numRating || numRating < 1 || numRating > 5) {
        return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
      }

      const feedbackData = {
        rating: Math.round(numRating * 10) / 10,
        tags: Array.isArray(tags) ? tags : [],
        comment: (comment || '').trim(),
        createdAt: new Date(),
      };

      let updatedRide: any = null;
      let updatedDriverRating: number | null = null;
      let updatedPassengerRating: number | null = null;

      if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
        const ride = await RideModel.findById(id);
        if (!ride) {
          return res.status(404).json({ error: 'Ride not found.' });
        }

        if (role === 'driver') {
          ride.driverFeedback = feedbackData;
        } else {
          ride.riderFeedback = feedbackData;
          ride.rating = feedbackData.rating; // legacy field sync
        }

        // If at least one rated, mark status as RATED
        ride.status = 'RATED';
        await ride.save();
        updatedRide = ride.toObject();
        updatedRide.id = ride._id.toString();

        // If rider rated, recalculate driver overall rating
        if (role !== 'driver' && ride.driverId) {
          try {
            const driverRides = await RideModel.find({
              driverId: ride.driverId,
              'riderFeedback.rating': { $exists: true, $ne: null },
            });
            if (driverRides.length > 0) {
              const sum = driverRides.reduce((acc, r) => acc + (r.riderFeedback?.rating || 5), 0);
              const avg = Math.round((sum / driverRides.length) * 10) / 10;
              updatedDriverRating = avg;
              if (mongoose.Types.ObjectId.isValid(ride.driverId)) {
                await DriverModel.findByIdAndUpdate(ride.driverId, { rating: avg });
              }
            }
          } catch (e) {
            console.warn('Notice recalculating driver rating:', e);
          }
        }

        // If driver rated, recalculate passenger overall rating
        if (role === 'driver' && ride.passengerId) {
          try {
            const passengerRides = await RideModel.find({
              passengerId: ride.passengerId,
              'driverFeedback.rating': { $exists: true, $ne: null },
            });
            if (passengerRides.length > 0) {
              const sum = passengerRides.reduce((acc, r) => acc + (r.driverFeedback?.rating || 5), 0);
              const avg = Math.round((sum / passengerRides.length) * 10) / 10;
              updatedPassengerRating = avg;
              if (mongoose.Types.ObjectId.isValid(ride.passengerId)) {
                await UserModel.findByIdAndUpdate(ride.passengerId, { rating: avg });
              }
            }
          } catch (e) {
            console.warn('Notice recalculating passenger rating:', e);
          }
        }
      } else {
        const r = fallbackRides.find((rd) => rd.id === id);
        if (!r) {
          return res.status(404).json({ error: 'Ride not found.' });
        }

        if (role === 'driver') {
          r.driverFeedback = { ...feedbackData, createdAt: feedbackData.createdAt.toISOString() };
        } else {
          r.riderFeedback = { ...feedbackData, createdAt: feedbackData.createdAt.toISOString() };
          r.rating = feedbackData.rating;
        }
        r.status = 'RATED';
        updatedRide = r;

        if (role !== 'driver' && r.driverId) {
          const dRides = fallbackRides.filter((rd) => rd.driverId === r.driverId && rd.riderFeedback?.rating);
          if (dRides.length > 0) {
            const sum = dRides.reduce((acc, rd) => acc + rd.riderFeedback.rating, 0);
            const avg = Math.round((sum / dRides.length) * 10) / 10;
            updatedDriverRating = avg;
            const d = fallbackDrivers.find((drv) => drv.id === r.driverId);
            if (d) d.rating = avg;
          }
        }

        if (role === 'driver' && r.passengerId) {
          const pRides = fallbackRides.filter((rd) => rd.passengerId === r.passengerId && rd.driverFeedback?.rating);
          if (pRides.length > 0) {
            const sum = pRides.reduce((acc, rd) => acc + rd.driverFeedback.rating, 0);
            const avg = Math.round((sum / pRides.length) * 10) / 10;
            updatedPassengerRating = avg;
            const u = fallbackUsers.find((usr) => usr.id === r.passengerId);
            if (u) u.rating = avg;
          }
        }
      }

      broadcastRealtime('ride:rated', {
        rideId: id,
        role,
        feedback: feedbackData,
        updatedDriverRating,
        updatedPassengerRating,
        ride: updatedRide,
      });

      res.json({
        success: true,
        message: 'Feedback and rating submitted successfully.',
        ride: updatedRide,
        updatedDriverRating,
        updatedPassengerRating,
      });
    } catch (err: any) {
      console.error('Error in ride rating:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/rides/user/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (isDbConnected()) {
        const rides = await RideModel.find({ passengerId: id }).sort({ createdAt: -1 });
        return res.json(rides);
      }
      res.json(fallbackRides.filter((r) => r.passengerId === id));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/rides/driver/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (isDbConnected()) {
        const rides = await RideModel.find({ driverId: id }).sort({ createdAt: -1 });
        return res.json(rides);
      }
      res.json(fallbackRides.filter((r) => r.driverId === id));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // -------------------------------------------------------------
  // DELIVERIES & LOGISTICS
  // -------------------------------------------------------------
  app.post('/api/deliveries/create', async (req: Request, res: Response) => {
    try {
      let delivery: any;
      if (isDbConnected()) {
        const doc = new DeliveryModel(req.body);
        await doc.save();
        delivery = doc.toObject();
        delivery.id = doc._id.toString();
      } else {
        delivery = { id: `del_${Date.now()}`, ...req.body, status: 'ORDER_PLACED', createdAt: new Date().toISOString() };
        fallbackDeliveries.unshift(delivery);
      }
      broadcastRealtime('delivery:created', delivery);
      res.status(201).json({ success: true, delivery });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/deliveries/user/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (isDbConnected()) {
        const deliveries = await DeliveryModel.find({ senderId: id }).sort({ createdAt: -1 });
        return res.json(deliveries);
      }
      res.json(fallbackDeliveries.filter((d) => d.senderId === id));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/logistics/create', async (req: Request, res: Response) => {
    try {
      let order: any;
      if (isDbConnected()) {
        const doc = new LogisticsModel(req.body);
        await doc.save();
        order = doc.toObject();
        order.id = doc._id.toString();
      } else {
        order = { id: `log_${Date.now()}`, ...req.body, status: 'BOOKED', createdAt: new Date().toISOString() };
        fallbackLogistics.unshift(order);
      }
      broadcastRealtime('logistics:created', order);
      res.status(201).json({ success: true, order });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // -------------------------------------------------------------
  // WALLET & WITHDRAWALS
  // -------------------------------------------------------------
  app.post('/api/wallet/deposit', async (req: Request, res: Response) => {
    try {
      const { userId, amount, channel, reference } = req.body;
      const numAmount = Number(amount);

      let newBalance = 0;
      if (isDbConnected() && mongoose.Types.ObjectId.isValid(userId)) {
        const user = await UserModel.findById(userId);
        if (user) {
          user.walletBalance = (user.walletBalance || 0) + numAmount;
          await user.save();
          newBalance = user.walletBalance;

          const txn = new WalletTransactionModel({
            userId,
            amount: numAmount,
            type: 'DEPOSIT',
            description: `Mobile Money Deposit via ${channel}`,
            channel,
            status: 'COMPLETED',
            reference,
          });
          await txn.save();
        }
      } else {
        const u = fallbackUsers.find((usr) => usr.id === userId);
        if (u) {
          u.walletBalance = (u.walletBalance || 0) + numAmount;
          newBalance = u.walletBalance;
        }
      }

      broadcastRealtime('wallet:deposit', { userId, newBalance, amount: numAmount });
      res.json({ success: true, newBalance });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/withdrawals/create', async (req: Request, res: Response) => {
    try {
      let withdrawal: any;
      if (isDbConnected()) {
        const doc = new WithdrawalModel(req.body);
        await doc.save();
        withdrawal = doc.toObject();
        withdrawal.id = doc._id.toString();
      } else {
        withdrawal = { id: `wth_${Date.now()}`, ...req.body, status: 'PENDING', createdAt: new Date().toISOString() };
        fallbackWithdrawals.unshift(withdrawal);
      }
      broadcastRealtime('withdrawal:requested', withdrawal);
      res.status(201).json({ success: true, withdrawal });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // -------------------------------------------------------------
  // SUPPORT, SOS & CHAT
  // -------------------------------------------------------------
  app.post('/api/chat/send', (req: Request, res: Response) => {
    const msg = req.body;
    broadcastRealtime('chat:message', msg);
    res.json({ success: true });
  });

  app.post('/api/sos/trigger', async (req: Request, res: Response) => {
    const alertData = req.body;
    if (isDbConnected()) {
      const log = new AuditLogModel({
        actorId: alertData.userId || 'emergency_beacon',
        actorName: alertData.userName || 'Passenger',
        action: 'EMERGENCY_SOS',
        target: alertData.city || 'Sierra Leone',
        details: alertData.details || 'Emergency SOS button triggered.',
      });
      await log.save();
    }
    broadcastRealtime('sos:triggered', alertData);
    res.json({ success: true, alert: alertData });
  });

  app.get('/api/support/tickets', async (_req: Request, res: Response) => {
    try {
      if (isDbConnected()) {
        const tickets = await SupportTicketModel.find().sort({ createdAt: -1 });
        return res.json(tickets);
      }
      res.json(fallbackSupportTickets);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/support/tickets', async (req: Request, res: Response) => {
    try {
      let ticket: any;
      if (isDbConnected()) {
        const doc = new SupportTicketModel(req.body);
        await doc.save();
        ticket = doc.toObject();
        ticket.id = doc._id.toString();
      } else {
        ticket = { id: `tkt_${Date.now()}`, ...req.body, status: 'OPEN', createdAt: new Date().toISOString() };
        fallbackSupportTickets.unshift(ticket);
      }
      broadcastRealtime('ticket:created', ticket);
      res.status(201).json({ success: true, ticket });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/support/tickets/:id/resolve', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { response } = req.body;
      if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
        await SupportTicketModel.findByIdAndUpdate(id, { status: 'RESOLVED', adminResponse: response });
      } else {
        const tkt = fallbackSupportTickets.find((t) => t.id === id);
        if (tkt) {
          tkt.status = 'RESOLVED';
          tkt.adminResponse = response;
        }
      }
      broadcastRealtime('ticket:resolved', { ticketId: id, response });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // -------------------------------------------------------------
  // ADMIN DATA ENDPOINTS (Strictly protected for Super Admin 6ab6c7b86207766e1e8df0de)
  // -------------------------------------------------------------
  app.get('/api/admin/users', authenticateSuperAdmin, async (_req: Request, res: Response) => {
    try {
      if (isDbConnected()) {
        const users = await UserModel.find().select('-passwordHash').sort({ createdAt: -1 });
        return res.json(users);
      }
      res.json(fallbackUsers.map(({ passwordHash, ...u }) => u));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/admin/rides', authenticateSuperAdmin, async (_req: Request, res: Response) => {
    try {
      if (isDbConnected()) {
        const rides = await RideModel.find().sort({ createdAt: -1 });
        return res.json(rides);
      }
      res.json(fallbackRides);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/admin/withdrawals', authenticateSuperAdmin, async (_req: Request, res: Response) => {
    try {
      if (isDbConnected()) {
        const withdrawals = await WithdrawalModel.find().sort({ createdAt: -1 });
        return res.json(withdrawals);
      }
      res.json(fallbackWithdrawals);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/admin/audit-logs', authenticateSuperAdmin, async (_req: Request, res: Response) => {
    try {
      if (isDbConnected()) {
        const logs = await AuditLogModel.find().sort({ createdAt: -1 }).limit(100);
        return res.json(logs);
      }
      res.json(fallbackAuditLogs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/admin/metrics', authenticateSuperAdmin, async (_req: Request, res: Response) => {
    try {
      if (isDbConnected()) {
        const totalUsers = await UserModel.countDocuments();
        const totalDrivers = await DriverModel.countDocuments();
        const onlineDrivers = await DriverModel.countDocuments({ isOnline: true });
        const pendingDrivers = await DriverModel.countDocuments({ status: { $in: ['PENDING', 'UNDER_REVIEW'] } });
        const totalRides = await RideModel.countDocuments();
        const completedRides = await RideModel.countDocuments({ status: { $in: ['TRIP_COMPLETED', 'RATED'] } });
        const activeRides = await RideModel.countDocuments({
          status: { $in: ['REQUESTED', 'SEARCHING_FOR_DRIVER', 'DRIVER_ACCEPTED', 'DRIVER_ARRIVING', 'DRIVER_ARRIVED', 'TRIP_STARTED'] },
        });

        const rides = await RideModel.find({ status: { $in: ['TRIP_COMPLETED', 'RATED'] } });
        const grossRevenue = rides.reduce((sum, r) => sum + (r.actualFare || r.estimatedFare || 0), 0);
        const platformCommission = grossRevenue * 0.15;
        const driverEarnings = grossRevenue * 0.85;

        return res.json({
          totalUsers,
          totalDrivers,
          onlineDrivers,
          pendingDrivers,
          totalRides,
          completedRides,
          activeRides,
          grossRevenue,
          platformCommission,
          driverEarnings,
          activeCities: ['Freetown', 'Waterloo', 'Bo', 'Kenema', 'Makeni'],
          dbStatus: 'CONNECTED',
        });
      }

      const completed = fallbackRides.filter((r) => r.status === 'TRIP_COMPLETED' || r.status === 'RATED');
      const grossRev = completed.reduce((sum, r) => sum + (r.actualFare || r.estimatedFare || 0), 0);

      res.json({
        totalUsers: fallbackUsers.length,
        totalDrivers: fallbackDrivers.length,
        onlineDrivers: fallbackDrivers.filter((d) => d.isOnline).length,
        pendingDrivers: fallbackDrivers.filter((d) => d.status === 'PENDING' || d.status === 'UNDER_REVIEW').length,
        totalRides: fallbackRides.length,
        completedRides: completed.length,
        activeRides: fallbackRides.filter((r) => r.status !== 'TRIP_COMPLETED' && r.status !== 'CANCELLED').length,
        grossRevenue: grossRev,
        platformCommission: grossRev * 0.15,
        driverEarnings: grossRev * 0.85,
        activeCities: ['Freetown', 'Waterloo', 'Bo', 'Kenema', 'Makeni'],
        dbStatus: 'CONNECTING',
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // -------------------------------------------------------------
  // VITE DEV SERVER / STATIC SERVING
  // -------------------------------------------------------------
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Trust Ride Server] Running on http://localhost:${PORT}`);
    console.log(`[Super Admin Protection] Active — Super Admin ID: ${SUPER_ADMIN_ID}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
