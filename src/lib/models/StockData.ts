
import mongoose from 'mongoose';

// Define the schema for our stock data
const stockDataSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  price: Number,
  change: Number,
  changePercent: Number,
  open: Number,
  high: Number,
  low: Number,
  volume: Number,
  marketCap: Number,
  pe: Number,
  dividend: Number,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Create an index on the symbol field for faster queries
stockDataSchema.index({ symbol: 1 });

// Create and export the model with the correct collection name
export const StockDataModel = mongoose.models.market_prices_master || 
  mongoose.model('market_prices_master', stockDataSchema, 'market_prices_master');

// Add a model for the news collection
const stockNewsSchema = new mongoose.Schema({
  symbol: String,
  title: String,
  source: String,
  date: Date,
  snippet: String,
  url: String,
  sentiment: String,
});

export const StockNewsModel = mongoose.models.stock_news_master || 
  mongoose.model('stock_news_master', stockNewsSchema, 'stock_news_master');
