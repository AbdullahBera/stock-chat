
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

// Check if the model already exists to prevent model overwriting errors
export const StockDataModel = mongoose.models.market_prices_master || 
  mongoose.model('market_prices_master', stockDataSchema, 'market_prices_master');

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

// Check if the model already exists to prevent model overwriting errors
export const StockNewsModel = mongoose.models.stock_news_master || 
  mongoose.model('stock_news_master', stockNewsSchema, 'stock_news_master');
