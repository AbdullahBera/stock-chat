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

// Add Alpha Vantage API key
// You should store this in an environment variable (.env file)
const ALPHA_VANTAGE_API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || 'ZQ3AVATA3RR7QGNQ';

// API mock functions
export async function fetchStockData(symbol: string): Promise<StockData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return generateMockStockData(symbol);
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
  try {
    // Call Alpha Vantage NEWS_SENTIMENT endpoint
    const response = await fetch(
      `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Handle case where API returns an error message or no feed
    if (!data.feed || data.feed.length === 0) {
      console.warn('No news available from Alpha Vantage for', symbol);
      return [];
    }
    
    // Map Alpha Vantage response to our NewsItem interface
    return data.feed.map((item: any, index: number) => {
      // Determine sentiment based on available data
      let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
      
      // If ticker sentiment data is available for this symbol
      const tickerSentiment = item.ticker_sentiment?.find(
        (t: any) => t.ticker.toUpperCase() === symbol.toUpperCase()
      );
      
      if (tickerSentiment) {
        const score = parseFloat(tickerSentiment.ticker_sentiment_score);
        if (score > 0.25) sentiment = 'positive';
        else if (score < -0.25) sentiment = 'negative';
      } else if (item.overall_sentiment_score) {
        // Fallback to overall sentiment if ticker-specific not available
        const score = parseFloat(item.overall_sentiment_score);
        if (score > 0.25) sentiment = 'positive';
        else if (score < -0.25) sentiment = 'negative';
      }
      
      return {
        id: `news-${index}-${Date.now()}`,
        title: item.title,
        source: item.source,
        date: item.time_published.substring(0, 10), // Format: YYYYMMDDTHHMMSS -> YYYY-MM-DD
        snippet: item.summary,
        url: item.url,
        sentiment
      };
    });
  } catch (error) {
    console.error('Error fetching news from Alpha Vantage:', error);
    // Return empty array or throw error based on your error handling strategy
    // For now, we'll return empty array to match current behavior
    return [];
  }
}

export async function fetchSentimentAnalysis(symbol: string): Promise<SentimentData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  const news = generateNewsItems(symbol, 20);
  return generateSentimentData(news);
}
