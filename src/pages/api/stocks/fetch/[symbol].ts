import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'stock_data';
const POLYGON_API_KEY = process.env.VITE_POLYGON_API_KEY;
const BASE_URL = 'https://api.polygon.io/v2';

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
  req: { method: string; query: { symbol: string } },
  res: { status: (code: number) => { json: (data: any) => void } }
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { symbol } = req.query;
  console.log('Fetching data for symbol:', symbol);
  
  if (!POLYGON_API_KEY) {
    console.error('No Polygon API key found');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    // Get previous close data
    console.log('Fetching price data from Polygon API...');
    const priceUrl = `${BASE_URL}/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${POLYGON_API_KEY}`;
    const priceResponse = await fetch(priceUrl);
    const priceData = await priceResponse.json();
    
    // Get ticker details
    console.log('Fetching ticker details from Polygon API...');
    const detailsUrl = `${BASE_URL}/snapshot/locale/us/markets/stocks/tickers/${symbol}?apiKey=${POLYGON_API_KEY}`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    if (!priceData.results?.[0]) {
      console.error('No price data found:', priceData);
      return res.status(404).json({ error: 'Stock data not found' });
    }

    const quote = priceData.results[0];
    const details = detailsData.ticker;
    
    const stockData = {
      symbol: symbol,
      name: details?.name || `${symbol} Corporation`,
      price: quote.c,
      change: quote.c - quote.o,
      changePercent: ((quote.c - quote.o) / quote.o) * 100,
      open: quote.o,
      high: quote.h,
      low: quote.l,
      volume: quote.v,
      marketCap: details?.market_cap || 0,
      pe: details?.pe_ratio || 0,
      dividend: details?.dividend_yield || 0,
      timestamp: Date.now()
    };

    // Save to database
    console.log('Saving stock data to MongoDB:', stockData);
    const client = await connectToDatabase();
    const db = client.db(MONGODB_DB);
    const collection = db.collection('stocks');
    
    await collection.updateOne(
      { symbol: stockData.symbol },
      { $set: stockData },
      { upsert: true }
    );
    
    return res.status(200).json(stockData);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch stock data', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
}