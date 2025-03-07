import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fetch from 'node-fetch';

// Initialize dotenv
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'stock_data';
const POLYGON_API_KEY = process.env.VITE_POLYGON_API_KEY;

console.log('MongoDB URI:', MONGODB_URI ? 'Set' : 'Not set');
console.log('MongoDB DB:', MONGODB_DB);
console.log('Polygon API Key:', POLYGON_API_KEY ? 'Set' : 'Not set');

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  try {
    console.log('Connecting to MongoDB...');
    const client = await MongoClient.connect(MONGODB_URI);
    cachedClient = client;
    console.log('Connected to MongoDB successfully');
    return client;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// API Routes
app.get('/api/stocks/:symbol', async (req, res) => {
  try {
    console.log('GET /api/stocks/:symbol - Fetching stock:', req.params.symbol);
    const client = await connectToDatabase();
    const db = client.db(MONGODB_DB);
    const collection = db.collection('stocks');
    
    const stockData = await collection.findOne({ symbol: req.params.symbol });
    if (!stockData) {
      console.log('Stock not found in database:', req.params.symbol);
      return res.status(404).json({ error: 'Stock not found' });
    }
    
    console.log('Found stock data:', stockData);
    res.json(stockData);
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

app.post('/api/stocks', async (req, res) => {
  try {
    console.log('POST /api/stocks - Saving stock data:', req.body.symbol);
    const client = await connectToDatabase();
    const db = client.db(MONGODB_DB);
    const collection = db.collection('stocks');
    
    await collection.updateOne(
      { symbol: req.body.symbol },
      { $set: req.body },
      { upsert: true }
    );
    
    console.log('Stock data saved successfully');
    res.json({ message: 'Stock data saved' });
  } catch (error) {
    console.error('Error saving stock:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

app.get('/api/stocks/fetch/:symbol', async (req, res) => {
  console.log('GET /api/stocks/fetch/:symbol - Fetching from Polygon API:', req.params.symbol);
  
  if (!POLYGON_API_KEY) {
    console.error('Polygon API key not configured');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const symbol = req.params.symbol;
    const BASE_URL = 'https://api.polygon.io/v2';

    // Get previous close data
    console.log('Fetching price data from Polygon API...');
    const priceUrl = `${BASE_URL}/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${POLYGON_API_KEY}`;
    const priceResponse = await fetch(priceUrl);
    const priceData = await priceResponse.json();
    console.log('Price data response:', priceData);
    
    // Get ticker details
    console.log('Fetching ticker details from Polygon API...');
    const detailsUrl = `${BASE_URL}/snapshot/locale/us/markets/stocks/tickers/${symbol}?apiKey=${POLYGON_API_KEY}`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();
    console.log('Details data response:', detailsData);

    if (!priceData.results?.[0]) {
      console.error('No price data found for symbol:', symbol);
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
    
    console.log('Stock data saved and returning response');
    res.json(stockData);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch stock data',
      details: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 