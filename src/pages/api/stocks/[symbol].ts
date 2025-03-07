import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'stock_data';

let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  if (!MONGODB_URI) {
    console.error('MongoDB URI is not defined');
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  try {
    const client = await MongoClient.connect(MONGODB_URI);
    cachedClient = client;
    return client;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export default async function handler(
  req: { method: string; query: { symbol: string }; body: any },
  res: { status: (code: number) => { json: (data: any) => void } }
) {
  try {
    const client = await connectToDatabase();
    const db = client.db(MONGODB_DB);
    const collection = db.collection('stocks');

    if (req.method === 'GET') {
      const { symbol } = req.query;
      console.log('Fetching stock data for symbol:', symbol);
      // Get stock data
      const stockData = await collection.findOne({ symbol });
      if (!stockData) {
        console.log('No stock data found for symbol:', symbol);
        return res.status(404).json({ error: 'Stock not found' });
      }
      console.log('Found stock data:', stockData);
      return res.status(200).json(stockData);
    }

    if (req.method === 'POST') {
      // Save or update stock data
      const data = req.body;
      console.log('Saving stock data:', data);
      await collection.updateOne(
        { symbol: data.symbol },
        { $set: data },
        { upsert: true }
      );
      return res.status(200).json({ message: 'Stock data saved' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error', details: error instanceof Error ? error.message : String(error) });
  }
} 