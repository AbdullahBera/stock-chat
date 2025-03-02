
import mongoose from 'mongoose';

// Define the schema for our stock data
const stockDataSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
  },
  open: Number,
  high: Number,
  low: Number,
  close: Number,
  volume: Number,
  adj_high: Number,
  adj_low: Number,
  adj_close: Number,
  adj_open: Number,
  adj_volume: Number,
  split_factor: Number,
  dividend: Number,
  exchange: String,
  date: Date,
  // Additional fields for our app
  name: String,
  price: Number,
  change: Number,
  changePercent: Number,
  marketCap: Number,
  pe: Number,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Create an index on the symbol field for faster queries
stockDataSchema.index({ symbol: 1 });

// Create and export the model with the correct collection name
// Use a variable to work around potential mongoose model compilation issues
const StockData = mongoose.models.market_prices_master || 
  mongoose.model('market_prices_master', stockDataSchema, 'market_prices_master');

export const StockDataModel = StockData;

// Add a model for the news collection
const stockNewsSchema = new mongoose.Schema({
  symbol: String,
  title: String,
  url: String,
  time_published: String,
  authors: Array,
  summary: String,
  banner_image: String,
  source: String,
  category_within_source: String,
  source_domain: String,
  topics: Array,
  overall_sentiment_score: Number,
  overall_sentiment_label: String,
  ticker_sentiment: Array,
  stored_at: Date,
  // Additional fields we need
  date: Date,
  snippet: String,
  sentiment: String,
});

const StockNews = mongoose.models.stock_news_master || 
  mongoose.model('stock_news_master', stockNewsSchema, 'stock_news_master');

export const StockNewsModel = StockNews;
