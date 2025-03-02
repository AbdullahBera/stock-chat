
import mongoose from 'mongoose';

// Define the schema based on your MongoDB collection structure
export interface StockNewsItem {
  _id: string;
  title: string;
  url: string;
  time_published: string;
  authors: string[];
  summary: string;
  banner_image?: string;
  source: string;
  category_within_source?: string;
  source_domain: string;
  topics?: any[];
  overall_sentiment_score?: number;
  overall_sentiment_label?: string;
  ticker_sentiment?: any[];
  stored_at: Date;
}

// Create schema with the fields that match your data
const stockNewsSchema = new mongoose.Schema<StockNewsItem>({
  title: String,
  url: String,
  time_published: String,
  authors: [String],
  summary: String,
  banner_image: String,
  source: String,
  category_within_source: String,
  source_domain: String,
  topics: Array,
  overall_sentiment_score: Number,
  overall_sentiment_label: String,
  ticker_sentiment: Array,
  stored_at: Date
});

// Get the model or create it if it doesn't exist
export function getStockNewsModel() {
  // Check if the model is already defined
  return mongoose.models.StockNews || 
    mongoose.model<StockNewsItem>('StockNews', stockNewsSchema, 'stock_news_master');
}

export default getStockNewsModel;
