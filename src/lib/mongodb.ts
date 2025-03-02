
import mongoose from 'mongoose';

let connection: typeof mongoose | null = null;

export async function connectToDatabase(): Promise<typeof mongoose> {
  try {
    if (connection) {
      console.log('Using existing database connection');
      return connection;
    }

    console.log('Creating new database connection');
    
    // Replace with your actual MongoDB connection string
    const mongoUri = 'mongodb+srv://makerdata.iinrc.mongodb.net/stock_data';
    
    // Configure mongoose connection
    connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('Database connection established');
    return connection;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export default mongoose;
