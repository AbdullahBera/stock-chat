import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fetch from 'node-fetch';
import cors from 'cors';

// Initialize dotenv (only in development)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();
const port = process.env.PORT || 3000;

// API Constants
const BASE_URL = 'https://api.polygon.io/v2';
const POLYGON_API_KEY = process.env.VITE_POLYGON_API_KEY;
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'stock_data';
const MAX_CACHE_AGE = 48 * 60 * 60 * 1000; // 48 hours in milliseconds

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'VITE_POLYGON_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || 'https://your-frontend-url.com']
    : ['http://localhost:8080', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

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

    // Get previous close data
    console.log('Fetching price data from Polygon API...');
    const priceUrl = `${BASE_URL}/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${POLYGON_API_KEY}`;
    const priceResponse = await fetch(priceUrl);
    const priceData = await priceResponse.json();
    console.log('Price data response:', priceData);
    
    // Get ticker details using v3 endpoint for more detailed data
    console.log('Fetching ticker details from Polygon API...');
    const detailsUrl = `https://api.polygon.io/v3/reference/tickers/${symbol}?apiKey=${POLYGON_API_KEY}`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();
    console.log('Details data response:', detailsData);

    // Get current quote data for market cap
    const quoteUrl = `${BASE_URL}/snapshot/locale/us/markets/stocks/tickers/${symbol}?apiKey=${POLYGON_API_KEY}`;
    const quoteResponse = await fetch(quoteUrl);
    const quoteData = await quoteResponse.json();
    console.log('Quote data response:', quoteData);

    if (!priceData.results?.[0]) {
      console.error('No price data found for symbol:', symbol);
      return res.status(404).json({ error: 'Stock data not found' });
    }

    const quote = priceData.results[0];
    const details = detailsData.results;
    const marketData = quoteData.ticker;
    
    const stockData = {
      symbol: symbol,
      name: details?.name || marketData?.name || `${symbol} Corporation`,
      price: quote.c,
      change: quote.c - quote.o,
      changePercent: ((quote.c - quote.o) / quote.o) * 100,
      open: quote.o,
      high: quote.h,
      low: quote.l,
      volume: quote.v,
      marketCap: marketData?.market_cap || details?.market_cap || 0,
      pe: marketData?.pe_ratio || details?.pe_ratio || 0,
      dividend: details?.dividend_yield || marketData?.dividend_yield || 0,
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

// Helper function to get time range based on period
function getTimeRange(period) {
  const now = new Date();
  const from = new Date();
  
  switch (period) {
    case '1d':
      from.setDate(now.getDate() - 1);
      break;
    case '1w':
      from.setDate(now.getDate() - 7);
      break;
    case '1m':
      from.setMonth(now.getMonth() - 1);
      break;
    case '3m':
      from.setMonth(now.getMonth() - 3);
      break;
    case '1y':
      from.setFullYear(now.getFullYear() - 1);
      break;
    case '5y':
      from.setFullYear(now.getFullYear() - 5);
      break;
    default:
      from.setMonth(now.getMonth() - 1);
  }

  // Ensure 'to' date is not in the future
  const to = new Date(Math.min(now.getTime(), Date.now()));

  // Get the timespan and multiplier based on period
  let timespan = 'day';
  let multiplier = 1;

  switch (period) {
    case '1d':
      timespan = 'minute';
      multiplier = 5;
      break;
    case '1w':
      timespan = 'hour';
      break;
    case '5y':
      timespan = 'week';
      break;
  }

  return { from, to, multiplier, timespan };
}

// Add this new endpoint before the server.listen() call
app.get('/api/stocks/:symbol/history/:period', async (req, res) => {
  console.log('GET /api/stocks/:symbol/history/:period - Fetching historical data:', req.params);
  
  if (!POLYGON_API_KEY) {
    console.error('Polygon API key not configured');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { symbol, period } = req.params;
    const { from, to, multiplier, timespan } = getTimeRange(period);
    
    // Format dates for Polygon API
    const fromDate = from.toISOString().split('T')[0];
    const toDate = to.toISOString().split('T')[0];
    
    console.log('Fetching historical data with params:', { symbol, fromDate, toDate, multiplier, timespan });
    
    const url = `${BASE_URL}/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${fromDate}/${toDate}?adjusted=true&sort=asc&limit=50000&apiKey=${POLYGON_API_KEY}`;
    
    console.log('Fetching from URL:', url);
    const response = await fetch(url);
    const data = await response.json();
    
    // Log the raw response for debugging
    console.log('Raw API response:', data);

    if (data.status === 'ERROR') {
      console.error('Polygon API error:', data);
      return res.status(500).json({ error: data.error || 'API error' });
    }
    
    if (!data.results || !Array.isArray(data.results)) {
      console.error('Invalid or empty response from Polygon API:', data);
      return res.status(404).json({ error: 'Historical data not found' });
    }
    
    // Transform the data into the format expected by the frontend
    const historicalData = data.results.map(item => ({
      date: new Date(item.t).toISOString(),
      close: parseFloat(item.c.toFixed(2))  // Ensure price is properly formatted
    }));
    
    if (historicalData.length === 0) {
      console.log('No historical data points found');
      return res.status(404).json({ error: 'No historical data available for this period' });
    }
    
    console.log(`Returning ${historicalData.length} historical data points. First point:`, historicalData[0], 'Last point:', historicalData[historicalData.length - 1]);
    res.json(historicalData);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch historical data',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Add this new endpoint for historical data from MongoDB
app.get('/api/stocks/:symbol/history-cached/:period', async (req, res) => {
  console.log('GET /api/stocks/:symbol/history-cached/:period - Fetching cached historical data:', req.params);

  try {
    const { symbol, period } = req.params;
    const client = await connectToDatabase();
    const db = client.db(MONGODB_DB);
    const collection = db.collection('historical_data');

    // Find the most recent historical data for this symbol and period
    const historicalData = await collection.findOne(
      { 
        symbol, 
        period,
        timestamp: { 
          $gt: new Date(Date.now() - MAX_CACHE_AGE) 
        }
      },
      { sort: { timestamp: -1 } }
    );

    if (historicalData && historicalData.data) {
      console.log(`Found cached historical data for ${symbol} (${period}) with ${historicalData.data.length} points`);
      return res.json(historicalData.data);
    }

    // If no cached data found or it's too old, fetch from Polygon API
    console.log('No recent cached data found, fetching from API...');
    const { from, to, multiplier, timespan } = getTimeRange(period);
    
    // Format dates for Polygon API
    const fromDate = from.toISOString().split('T')[0];
    const toDate = to.toISOString().split('T')[0];
    
    const url = `${BASE_URL}/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${fromDate}/${toDate}?adjusted=true&sort=asc&limit=50000&apiKey=${POLYGON_API_KEY}`;
    
    console.log(`Fetching from Polygon API for ${symbol} from ${fromDate} to ${toDate}`);
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'ERROR') {
      console.error('Polygon API error:', data);
      return res.status(500).json({ error: data.error || 'API error' });
    }

    if (!data.results || !Array.isArray(data.results)) {
      console.error('Invalid or empty response from Polygon API:', data);
      return res.status(404).json({ error: 'Historical data not found' });
    }
    
    // Transform and format the data
    const formattedData = data.results.map(item => ({
      date: new Date(item.t).toISOString(),
      close: parseFloat(item.c.toFixed(2))
    }));

    console.log(`Formatted ${formattedData.length} data points for ${symbol}`);

    // Save to MongoDB
    await collection.updateOne(
      { symbol, period },
      { 
        $set: {
          symbol,
          period,
          data: formattedData,
          timestamp: new Date()
        }
      },
      { upsert: true }
    );

    console.log(`Saved historical data to MongoDB for ${symbol} (${period})`);
    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch historical data',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
}); 