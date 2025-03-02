
import mongoose from 'mongoose';

let connection: typeof mongoose | null = null;

export async function connectToDatabase(): Promise<typeof mongoose> {
  try {
    if (connection) {
      console.log('Using existing database connection');
      return connection;
    }

    console.log('Creating new database connection');
    
    // Get MongoDB URI from environment variable or fallback to a default for development
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://abdullahberakucuk:dJY5Dt1zrYmmsV6Q@makertdata.iinrc.mongodb.net/stock_data?retryWrites=true&w=majority&appName=makertdata';
    
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
