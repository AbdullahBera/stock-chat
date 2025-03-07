console.log('All env variables:', import.meta.env);
console.log('Polygon API Key:', import.meta.env.VITE_POLYGON_API_KEY);

// This is a mock API service for demonstration purposes
// In a real app, you would integrate with actual financial APIs
export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  marketCap: number;
  pe: number;
  dividend: number;
}

export interface HistoricalDataPoint {
  date: string;
  close: number;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  snippet: string;
  url: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface SentimentData {
  overall: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
  };
  breakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
  keywords: Array<{
    word: string;
    score: number;
    occurrences: number;
  }>;
}

// Mock data generator functions
function generateMockStockData(symbol: string): StockData {
  const stockNames: Record<string, string> = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com, Inc.',
    'TSLA': 'Tesla, Inc.',
    'META': 'Meta Platforms, Inc.',
    'NFLX': 'Netflix, Inc.',
    'NVDA': 'NVIDIA Corporation',
  };
  
  const name = stockNames[symbol] || `${symbol} Corporation`;
  const basePrice = Math.random() * 1000 + 50;
  const change = (Math.random() * 20) - 10;
  const changePercent = (change / basePrice) * 100;
  
  return {
    symbol,
    name,
    price: parseFloat(basePrice.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    open: parseFloat((basePrice - Math.random() * 5).toFixed(2)),
    high: parseFloat((basePrice + Math.random() * 10).toFixed(2)),
    low: parseFloat((basePrice - Math.random() * 10).toFixed(2)),
    volume: Math.floor(Math.random() * 10000000) + 1000000,
    marketCap: Math.floor(Math.random() * 1000000000000) + 10000000000,
    pe: parseFloat((Math.random() * 50 + 10).toFixed(2)),
    dividend: parseFloat((Math.random() * 3).toFixed(2)),
  };
}

function generateHistoricalData(periods: number, trend: 'up' | 'down' | 'volatile'): HistoricalDataPoint[] {
  const data: HistoricalDataPoint[] = [];
  const today = new Date();
  let price = Math.random() * 200 + 100;
  
  for (let i = periods; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    if (trend === 'up') {
      price += (Math.random() * 5) - 1;
    } else if (trend === 'down') {
      price += (Math.random() * 5) - 4;
    } else {
      price += (Math.random() * 10) - 5;
    }
    
    // Ensure price doesn't go below 10
    price = Math.max(price, 10);
    
    data.push({
      date: date.toISOString().split('T')[0],
      close: parseFloat(price.toFixed(2))
    });
  }
  
  return data;
}

function generateNewsItems(symbol: string, count: number): NewsItem[] {
  const sources = ['Bloomberg', 'CNBC', 'Reuters', 'Wall Street Journal', 'Financial Times', 'MarketWatch'];
  const sentiments: Array<'positive' | 'negative' | 'neutral'> = ['positive', 'negative', 'neutral'];
  const news: NewsItem[] = [];
  
  const positiveHeadlines = [
    `${symbol} Exceeds Quarterly Expectations`,
    `${symbol} Announces New Product Line`,
    `${symbol} Stock Surges After Analyst Upgrade`,
    `${symbol} Reports Record Revenue`,
    `${symbol} Expands Into New Markets`
  ];
  
  const negativeHeadlines = [
    `${symbol} Faces Regulatory Scrutiny`,
    `${symbol} Misses Earnings Targets`,
    `${symbol} Shares Drop on Weak Guidance`,
    `${symbol} Announces Layoffs`,
    `${symbol} Recalls Product Due to Defects`
  ];
  
  const neutralHeadlines = [
    `${symbol} Appoints New CEO`,
    `${symbol} Announces Board Reshuffle`,
    `${symbol} To Present at Industry Conference`,
    `${symbol} Updates Corporate Strategy`,
    `${symbol} Releases Sustainability Report`
  ];
  
  for (let i = 0; i < count; i++) {
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    let title;
    
    if (sentiment === 'positive') {
      title = positiveHeadlines[Math.floor(Math.random() * positiveHeadlines.length)];
    } else if (sentiment === 'negative') {
      title = negativeHeadlines[Math.floor(Math.random() * negativeHeadlines.length)];
    } else {
      title = neutralHeadlines[Math.floor(Math.random() * neutralHeadlines.length)];
    }
    
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - Math.floor(Math.random() * 7));
    
    news.push({
      id: `news-${i}`,
      title,
      source: sources[Math.floor(Math.random() * sources.length)],
      date: pastDate.toISOString().split('T')[0],
      snippet: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
      url: '#',
      sentiment
    });
  }
  
  return news;
}

function generateSentimentData(newsItems: NewsItem[]): SentimentData {
  // Count sentiments
  const positiveCount = newsItems.filter(item => item.sentiment === 'positive').length;
  const negativeCount = newsItems.filter(item => item.sentiment === 'negative').length;
  const neutralCount = newsItems.filter(item => item.sentiment === 'neutral').length;
  
  // Calculate overall score (-100 to 100)
  const totalItems = newsItems.length;
  const sentimentScore = ((positiveCount - negativeCount) / totalItems) * 100;
  
  // Determine overall label
  let overallLabel: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (sentimentScore > 20) overallLabel = 'positive';
  if (sentimentScore < -20) overallLabel = 'negative';
  
  // Generate keywords with sentiment scores
  const keywords = [
    { word: 'growth', score: Math.random() * 100 - 50, occurrences: Math.floor(Math.random() * 10) + 1 },
    { word: 'revenue', score: Math.random() * 100 - 50, occurrences: Math.floor(Math.random() * 10) + 1 },
    { word: 'profit', score: Math.random() * 100 - 50, occurrences: Math.floor(Math.random() * 10) + 1 },
    { word: 'expansion', score: Math.random() * 100 - 50, occurrences: Math.floor(Math.random() * 10) + 1 },
    { word: 'decline', score: Math.random() * 100 - 50, occurrences: Math.floor(Math.random() * 10) + 1 },
    { word: 'innovation', score: Math.random() * 100 - 50, occurrences: Math.floor(Math.random() * 10) + 1 },
    { word: 'competition', score: Math.random() * 100 - 50, occurrences: Math.floor(Math.random() * 10) + 1 },
    { word: 'market', score: Math.random() * 100 - 50, occurrences: Math.floor(Math.random() * 10) + 1 },
  ];
  
  return {
    overall: {
      score: parseFloat(sentimentScore.toFixed(2)),
      label: overallLabel
    },
    breakdown: {
      positive: parseFloat(((positiveCount / totalItems) * 100).toFixed(2)),
      negative: parseFloat(((negativeCount / totalItems) * 100).toFixed(2)),
      neutral: parseFloat(((neutralCount / totalItems) * 100).toFixed(2))
    },
    keywords: keywords.sort((a, b) => b.occurrences - a.occurrences)
  };
}

const BASE_URL = 'https://api.polygon.io/v2';
const POLYGON_API_KEY = import.meta.env.VITE_POLYGON_API_KEY;
const MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface CachedStockData extends StockData {
  timestamp: number;
}

// Function to get stock data from MongoDB
async function getStockFromDB(symbol: string): Promise<CachedStockData | null> {
  try {
    const response = await fetch(`/api/stocks/${symbol}`);
    if (!response.ok) return null;
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching from database:', error);
    return null;
  }
}

// Function to save stock data to MongoDB
async function saveStockToDB(data: StockData): Promise<void> {
  try {
    const stockData: CachedStockData = {
      ...data,
      timestamp: Date.now()
    };
    
    await fetch('/api/stocks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stockData),
    });
  } catch (error) {
    console.error('Error saving to database:', error);
  }
}

// Function to check if data is stale and needs refreshing
function isDataStale(data: CachedStockData): boolean {
  return Date.now() - data.timestamp > MAX_CACHE_AGE;
}

export async function fetchStockData(symbol: string): Promise<StockData> {
  try {
    console.log('Fetching stock data for:', symbol);
    
    // First try to get from database
    const dbData = await getStockFromDB(symbol);
    console.log('Database data:', dbData);
    
    if (dbData) {
      // If we have data in the database
      if (isDataStale(dbData)) {
        // If data is stale, trigger a background refresh but still return cached data
        console.log('Data is stale, triggering background refresh:', symbol);
        refreshStockData(symbol, dbData.timestamp).catch(console.error);
      } else {
        console.log('Using fresh data from database:', symbol);
      }
      return dbData;
    }
    
    // If no data in DB, fetch from API
    console.log('No data in database, fetching from API:', symbol);
    const response = await fetch(`/api/stocks/fetch/${symbol}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch stock data: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('API response:', data);
    
    // Save the data to MongoDB
    await saveStockToDB(data);
    
    return data;
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw error;
  }
}

// Function to refresh stock data in the background
async function refreshStockData(symbol: string, lastUpdate: number): Promise<void> {
  try {
    const response = await fetch(`/api/stocks/fetch/${symbol}`);
    if (!response.ok) {
      throw new Error('Failed to fetch stock data');
    }
    const freshData = await response.json();
    await saveStockToDB(freshData);
    console.log('Background refresh completed for:', symbol);
  } catch (error) {
    console.error('Background refresh failed:', error);
  }
}

// Function to fetch data from Polygon API
async function fetchFromAPI(symbol: string): Promise<StockData> {
  if (!POLYGON_API_KEY) {
    throw new Error('API key not found. Please set VITE_POLYGON_API_KEY in your .env file');
  }

  try {
    // Get previous close data
    const priceUrl = `${BASE_URL}/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${POLYGON_API_KEY}`;
    const priceResponse = await fetch(priceUrl);
    const priceData = await priceResponse.json();
    
    // Get ticker details
    const detailsUrl = `${BASE_URL}/snapshot/locale/us/markets/stocks/tickers/${symbol}?apiKey=${POLYGON_API_KEY}`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    if (!priceData.results?.[0]) {
      throw new Error('Invalid price data from Polygon API');
    }

    const quote = priceData.results[0];
    const details = detailsData.ticker;
    
    const stockData: StockData = {
      symbol: symbol,
      name: details?.name || symbol,
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
    };

    // Save to database
    await saveStockToDB(stockData);
    
    return stockData;
  } catch (error) {
    console.error('Error fetching stock data from API:', error);
    throw error;
  }
}

export async function fetchHistoricalData(symbol: string, period: '1d' | '1w' | '1m' | '3m' | '1y' | '5y'): Promise<HistoricalDataPoint[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  let dataPoints = 0;
  let trend: 'up' | 'down' | 'volatile' = 'volatile';
  
  // Random trend with a bias
  const randomValue = Math.random();
  if (randomValue > 0.6) trend = 'up';
  else if (randomValue > 0.3) trend = 'down';
  
  switch (period) {
    case '1d':
      dataPoints = 24; // Hourly data for a day
      break;
    case '1w':
      dataPoints = 7;
      break;
    case '1m':
      dataPoints = 30;
      break;
    case '3m':
      dataPoints = 90;
      break;
    case '1y':
      dataPoints = 365;
      break;
    case '5y':
      dataPoints = 60; // Monthly data for 5 years
      break;
    default:
      dataPoints = 30;
  }
  
  return generateHistoricalData(dataPoints, trend);
}

export async function fetchNewsForStock(symbol: string): Promise<NewsItem[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  return generateNewsItems(symbol, 10);
}

export async function fetchSentimentAnalysis(symbol: string): Promise<SentimentData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  const news = generateNewsItems(symbol, 20);
  return generateSentimentData(news);
}
