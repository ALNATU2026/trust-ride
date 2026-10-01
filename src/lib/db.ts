import mongoose from 'mongoose';

export const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://easytrustc_db_user:aYjXIEWUf3UVVKDe@trustride-cluster.0fo5on9.mongodb.net';

export const JWT_SECRET =
  process.env.JWT_SECRET || 'trustride_super_secure_jwt_secret_sierra_leone_2026';

let isConnected = false;
let lastDbError: string | null = null;

export async function connectToDatabase(): Promise<boolean> {
  if (isConnected && mongoose.connection.readyState === 1) {
    return true;
  }

  try {
    mongoose.set('bufferCommands', false);

    // Format URI ensuring database name is specified
    let formattedUri = MONGODB_URI.trim();
    if (!formattedUri.includes('/trustride') && !formattedUri.includes('/?')) {
      const parts = formattedUri.split('?');
      formattedUri = `${parts[0]}/trustride${parts[1] ? '?' + parts[1] : '?retryWrites=true&w=majority'}`;
    }

    console.log('[MongoDB Atlas] Connecting to cluster...');
    await mongoose.connect(formattedUri, {
      dbName: 'trustride',
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 15000,
    });

    isConnected = true;
    lastDbError = null;
    console.log('[MongoDB Atlas] Connected successfully to trustride database.');
    return true;
  } catch (err: any) {
    isConnected = false;
    lastDbError = err.message || 'Database connection error';
    console.warn('[MongoDB Atlas] Notice: Atlas cluster connecting or IP whitelist check in progress.', lastDbError);
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export function getLastDbError(): string | null {
  return lastDbError;
}
