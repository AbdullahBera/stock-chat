import { MongoClient } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next';

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB = process.env.MONGODB_DB || 'stockchat';

let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = await MongoClient.connect(MONGODB_URI);
  cachedClient = client;
  return client;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(MONGODB_DB);
    const collection = db.collection('stocks');

    // Save stock data
    const data = req.body;
    await collection.updateOne(
      { symbol: data.symbol },
      { $set: data },
      { upsert: true }
    );
    
    return res.status(200).json({ message: 'Stock data saved' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
} 