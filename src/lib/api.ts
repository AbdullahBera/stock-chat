// This file integrates both mock data and real API/database calls
// We'll use real data when available and fall back to mock data

import { connectToDatabase } from './mongodb';
import getStockNewsModel from './models/StockNews';

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
  banner_image?: string;
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

// Alpha Vantage API key - replace with your own
const ALPHA_VANTAGE_API_KEY = 'demo'; // Replace with your actual API key

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

// Fetch real news from MongoDB or Alpha Vantage API
export async function fetchNewsForStock(symbol: string): Promise<NewsItem[]> {
  try {
    console.log(`Fetching news for ${symbol}...`);
    
    // Try to get data from MongoDB first
    try {
      await connectToDatabase();
      const StockNews = getStockNewsModel();
      
      // Query for news related to this ticker symbol
      const dbNews = await StockNews.find({ 
        'ticker_sentiment.ticker': { $regex: new RegExp(symbol, 'i') } 
      }).sort({ time_published: -1 }).limit(10);
      
      if (dbNews && dbNews.length > 0) {
        console.log(`Found ${dbNews.length} news items in database for ${symbol}`);
        
        // Map database news to our NewsItem interface
        return dbNews.map(item => {
          // Determine sentiment based on sentiment score
          let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
          if (item.overall_sentiment_score) {
            if (item.overall_sentiment_score > 0.25) sentiment = 'positive';
            else if (item.overall_sentiment_score < -0.25) sentiment = 'negative';
          }
          
          // Format date as YYYY-MM-DD
          const date = item.time_published 
            ? new Date(item.time_published).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];
          
          return {
            id: item._id,
            title: item.title,
            source: item.source,
            date,
            snippet: item.summary,
            url: item.url,
            sentiment,
            banner_image: item.banner_image
          };
        });
      }
    } catch (dbError) {
      console.error('Error fetching news from MongoDB:', dbError);
      // Continue to try Alpha Vantage API
    }
    
    // If no data in MongoDB, try Alpha Vantage API
    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Alpha Vantage API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.feed && data.feed.length > 0) {
        console.log(`Fetched ${data.feed.length} news items from Alpha Vantage for ${symbol}`);
        
        // Map Alpha Vantage news to our NewsItem interface
        return data.feed.map((item: any) => {
          // Find relevant ticker sentiment
          const tickerSentiment = item.ticker_sentiment?.find(
            (t: any) => t.ticker.toUpperCase() === symbol.toUpperCase()
          );
          
          // Determine sentiment
          let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
          if (tickerSentiment?.ticker_sentiment_score) {
            const score = parseFloat(tickerSentiment.ticker_sentiment_score);
            if (score > 0.25) sentiment = 'positive';
            else if (score < -0.25) sentiment = 'negative';
          } else if (item.overall_sentiment_score) {
            const score = parseFloat(item.overall_sentiment_score);
            if (score > 0.25) sentiment = 'positive';
            else if (score < -0.25) sentiment = 'negative';
          }
          
          return {
            id: `av-${item.title.substring(0, 20)}`,
            title: item.title,
            source: item.source,
            date: item.time_published ? item.time_published.substring(0, 10) : new Date().toISOString().substring(0, 10),
            snippet: item.summary,
            url: item.url,
            sentiment,
            banner_image: item.banner_image
          };
        });
      }
    } catch (apiError) {
      console.error('Error fetching news from Alpha Vantage:', apiError);
      // Continue to fallback data
    }
    
    // If all else fails, use mock data
    console.log('Falling back to mock news data');
    return generateNewsItems(symbol, 10);
    
  } catch (error) {
    console.error('Error in fetchNewsForStock:', error);
    // Simulate API delay and return mock data as fallback
    await new Promise(resolve => setTimeout(resolve, 800));
    return generateNewsItems(symbol, 10);
  }
}

// Fetch real sentiment data or generate mock data
export async function fetchSentimentAnalysis(symbol: string): Promise<SentimentData> {
  try {
    console.log(`Fetching sentiment analysis for ${symbol}...`);
    
    // Try to get sentiment data from MongoDB
    try {
      await connectToDatabase();
      const StockNews = getStockNewsModel();
      
      // Get recent news to analyze sentiment
      const recentNews = await StockNews.find({ 
        'ticker_sentiment.ticker': { $regex: new RegExp(symbol, 'i') } 
      }).sort({ time_published: -1 }).limit(20);
      
      if (recentNews && recentNews.length > 0) {
        console.log(`Found ${recentNews.length} news items for sentiment analysis of ${symbol}`);
        
        // Count sentiment categories
        let positiveCount = 0;
        let negativeCount = 0;
        let neutralCount = 0;
        
        // Track keywords and their sentiment
        const keywordMap = new Map<string, { total: number, score: number, occurrences: number }>();
        
        // Process each news item
        recentNews.forEach(item => {
          // Determine sentiment
          if (item.overall_sentiment_score) {
            if (item.overall_sentiment_score > 0.25) positiveCount++;
            else if (item.overall_sentiment_score < -0.25) negativeCount++;
            else neutralCount++;
          } else {
            neutralCount++;
          }
          
          // Process ticker-specific sentiment if available
          const tickerSentiment = item.ticker_sentiment?.find(
            (t: any) => t.ticker.toUpperCase() === symbol.toUpperCase()
          );
          
          // Extract topics/keywords
          if (item.topics && item.topics.length > 0) {
            item.topics.forEach((topic: any) => {
              if (topic.topic) {
                // Clean up the topic
                const topicName = topic.topic.replace(/_/g, ' ').toLowerCase();
                
                const existing = keywordMap.get(topicName) || { total: 0, score: 0, occurrences: 0 };
                existing.total += 1;
                existing.score += (item.overall_sentiment_score || 0);
                existing.occurrences += 1;
                keywordMap.set(topicName, existing);
              }
            });
          }
        });
        
        // Calculate overall score
        const totalItems = positiveCount + negativeCount + neutralCount;
        const sentimentScore = ((positiveCount - negativeCount) / totalItems) * 100;
        
        // Determine overall label
        let overallLabel: 'positive' | 'negative' | 'neutral' = 'neutral';
        if (sentimentScore > 20) overallLabel = 'positive';
        if (sentimentScore < -20) overallLabel = 'negative';
        
        // Create keywords array for the top occurring topics
        const keywords = Array.from(keywordMap.entries())
          .map(([word, data]) => ({
            word,
            score: data.score / data.total * 100, // Scale to range similar to mock data
            occurrences: data.occurrences
          }))
          .sort((a, b) => b.occurrences - a.occurrences)
          .slice(0, 8); // Limit to top 8 keywords
        
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
          keywords
        };
      }
    } catch (dbError) {
      console.error('Error fetching sentiment from MongoDB:', dbError);
      // Continue to try Alpha Vantage API
    }
    
    // If no data in MongoDB, try to build sentiment from Alpha Vantage API news
    try {
      const news = await fetchNewsForStock(symbol);
      
      if (news && news.length > 0) {
        // Count sentiment
        const positiveCount = news.filter(item => item.sentiment === 'positive').length;
        const negativeCount = news.filter(item => item.sentiment === 'negative').length;
        const neutralCount = news.filter(item => item.sentiment === 'neutral').length;
        
        // Total items
        const totalItems = news.length;
        
        // Calculate sentiment score (-100 to 100)
        const sentimentScore = ((positiveCount - negativeCount) / totalItems) * 100;
        
        // Determine overall label
        let overallLabel: 'positive' | 'negative' | 'neutral' = 'neutral';
        if (sentimentScore > 20) overallLabel = 'positive';
        if (sentimentScore < -20) overallLabel = 'negative';
        
        // Generate keywords (in a real implementation, you might extract from titles or summaries)
        const keywords = [
          { word: symbol.toLowerCase(), score: sentimentScore, occurrences: totalItems },
          { word: 'market', score: Math.random() * 100 - 50, occurrences: Math.floor(Math.random() * 10) + 1 },
          { word: 'finance', score: Math.random() * 100 - 50, occurrences: Math.floor(Math.random() * 10) + 1 },
          { word: 'stock', score: Math.random() * 100 - 50, occurrences: Math.floor(Math.random() * 10) + 1 },
          { word: 'investment', score: Math.random() * 100 - 50, occurrences: Math.floor(Math.random() * 10) + 1 },
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
          keywords
        };
      }
    } catch (apiError) {
      console.error('Error building sentiment from news data:', apiError);
      // Fall back to mock data
    }
    
    // If all else fails, use mock data
    console.log('Falling back to mock sentiment data');
    const mockNews = generateNewsItems(symbol, 20);
    return generateSentimentData(mockNews);
    
  } catch (error) {
    console.error('Error in fetchSentimentAnalysis:', error);
    // Simulate API delay and return mock data as fallback
    await new Promise(resolve => setTimeout(resolve, 1500));
    const mockNews = generateNewsItems(symbol, 20);
    return generateSentimentData(mockNews);
  }
}

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
