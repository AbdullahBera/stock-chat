
import mongoose from 'mongoose';
import { toast } from '@/components/ui/use-toast';

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://abdullahberakucuk:dJY5Dt1zrYmmsV6Q@makertdata.iinrc.mongodb.net/stock_data?retryWrites=true&w=majority&appName=makertdata';

// Global variable to track connection state
let isConnected = false;

export const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  try {
    // Set strict query mode to false to avoid warnings
    mongoose.set('strictQuery', false);
    
    const db = await mongoose.connect(MONGODB_URI);
    isConnected = !!db.connections[0].readyState;
    console.log('MongoDB connected successfully to stock_data database');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    toast({
      title: "Database Connection Error",
      description: "Could not connect to the database. Using fallback data.",
      variant: "destructive",
    });
  }
};
