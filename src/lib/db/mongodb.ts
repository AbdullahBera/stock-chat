
import mongoose from 'mongoose';
import { toast } from '@/components/ui/use-toast';

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://abdullahberakucuk:dJY5Dt1zrYmmsV6Q@makertdata.iinrc.mongodb.net/stock_data?retryWrites=true&w=majority&appName=makertdata';

// Global variable to track connection state
let isConnected = false;
let connectionPromise: Promise<typeof mongoose> | null = null;

export const connectToDatabase = async () => {
  if (isConnected) {
    console.log('Already connected to MongoDB');
    return Promise.resolve(mongoose);
  }
  
  if (connectionPromise) {
    // If a connection attempt is already in progress, return that promise
    return connectionPromise;
  }

  // Set strict query mode to false to avoid warnings
  mongoose.set('strictQuery', false);
  
  // Create a new connection promise
  connectionPromise = new Promise(async (resolve, reject) => {
    try {
      console.log('Connecting to MongoDB...');
      
      // Connect to MongoDB
      const connection = await mongoose.connect(MONGODB_URI);
      
      // Update connection status
      isConnected = !!mongoose.connection.readyState;
      
      console.log('MongoDB connected successfully to stock_data database');
      resolve(connection);
    } catch (error) {
      console.error('MongoDB connection error:', error);
      toast({
        title: "Database Connection Error",
        description: "Could not connect to the database. Using fallback data.",
        variant: "destructive",
      });
      reject(error);
    } finally {
      // Reset the connection promise to allow retries on future calls
      connectionPromise = null;
    }
  });
  
  return connectionPromise;
};

export const getMongooseInstance = () => {
  return mongoose;
};
