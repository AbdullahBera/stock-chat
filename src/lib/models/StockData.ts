
import mongoose, { Document, Schema, Model } from 'mongoose';

// Define interfaces for our models
export interface IStockData extends Document {
  symbol: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  adj_high?: number;
  adj_low?: number;
  adj_close?: number;
  adj_open?: number;
  adj_volume?: number;
  split_factor?: number;
  dividend?: number;
  exchange?: string;
  date?: Date;
  // Additional fields for our app
  name?: string;
  price?: number;
  change?: number;
  changePercent?: number;
  marketCap?: number;
  pe?: number;
  lastUpdated: Date;
}

export interface IStockNews extends Document {
  symbol: string;
  title?: string;
  url?: string;
  time_published?: string;
  authors?: any[];
  summary?: string;
  banner_image?: string;
  source?: string;
  category_within_source?: string;
  source_domain?: string;
  topics?: any[];
  overall_sentiment_score?: number;
  overall_sentiment_label?: string;
  ticker_sentiment?: any[];
  stored_at?: Date;
  // Additional fields we need
  date?: Date;
  snippet?: string;
  sentiment?: string;
}

// Define the schema for our stock data
const stockDataSchema = new Schema<IStockData>({
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

// Define stock news schema
const stockNewsSchema = new Schema<IStockNews>({
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

// Function to create or retrieve models safely
function getModel<T extends Document>(
  modelName: string, 
  schema: Schema, 
  collectionName: string
): Model<T> {
  // Important: We need to check if mongoose is defined first
  if (mongoose.connection.readyState === 1) {
    // Connected, safe to check models
    return mongoose.models[modelName] 
      ? (mongoose.models[modelName] as Model<T>) 
      : mongoose.model<T>(modelName, schema, collectionName);
  } else {
    // Not connected yet, just create the model (connection will be established later)
    return mongoose.model<T>(modelName, schema, collectionName);
  }
}

// Export models using the safe getter function
export const StockDataModel = getModel<IStockData>('market_prices_master', stockDataSchema, 'market_prices_master');
export const StockNewsModel = getModel<IStockNews>('stock_news_master', stockNewsSchema, 'stock_news_master');
