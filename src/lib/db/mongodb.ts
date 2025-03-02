
import mongoose from 'mongoose';
import { toast } from '@/components/ui/use-toast';

// MongoDB connection string - replace with your actual connection string
const MONGODB_URI = 'mongodb+srv://username:password@cluster0.mongodb.net/stockapp?retryWrites=true&w=majority';

// Global variable to track connection state
let isConnected = false;

export const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI);
    isConnected = !!db.connections[0].readyState;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    toast({
      title: "Database Connection Error",
      description: "Could not connect to the database. Using fallback data.",
      variant: "destructive",
    });
  }
};
