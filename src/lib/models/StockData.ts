
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

// Create and export the model if it doesn't already exist
export const StockDataModel = mongoose.models.StockData || mongoose.model('StockData', stockDataSchema);
