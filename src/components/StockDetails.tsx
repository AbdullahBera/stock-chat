
import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { StockData, fetchStockData } from '../lib/api';

interface StockDetailsProps {
  symbol: string;
}

const StockDetails: React.FC<StockDetailsProps> = ({ symbol }) => {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStockData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await fetchStockData(symbol);
        setStockData(data);
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError('Failed to load stock details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStockData();
  }, [symbol]);

  // Format numbers with commas for thousands
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Format market cap in a human-readable way
  const formatMarketCap = (marketCap: number): string => {
    if (marketCap >= 1_000_000_000_000) {
      return `$${(marketCap / 1_000_000_000_000).toFixed(2)}T`;
    } else if (marketCap >= 1_000_000_000) {
      return `$${(marketCap / 1_000_000_000).toFixed(2)}B`;
    } else if (marketCap >= 1_000_000) {
      return `$${(marketCap / 1_000_000).toFixed(2)}M`;
    } else {
      return `$${formatNumber(marketCap)}`;
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-card rounded-2xl animate-pulse">
        <CardContent className="p-6">
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3 mb-4"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-2/3 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-card rounded-2xl">
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-32 text-destructive">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stockData) return null;

  return (
    <Card className="glass-card rounded-2xl animate-fadeIn">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-4">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{symbol}</div>
            <h2 className="text-2xl md:text-3xl font-bold">{stockData.name}</h2>
          </div>
          <div className="mt-4 md:mt-0 flex items-baseline">
            <span className="text-2xl md:text-3xl font-bold">${stockData.price.toFixed(2)}</span>
            <span className={`ml-2 text-lg font-medium ${stockData.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)} ({stockData.change >= 0 ? '+' : ''}{stockData.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Open</div>
            <div className="text-lg font-medium">${stockData.open.toFixed(2)}</div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">High</div>
            <div className="text-lg font-medium">${stockData.high.toFixed(2)}</div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Low</div>
            <div className="text-lg font-medium">${stockData.low.toFixed(2)}</div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Volume</div>
            <div className="text-lg font-medium">{formatNumber(stockData.volume)}</div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Market Cap</div>
            <div className="text-lg font-medium">{formatMarketCap(stockData.marketCap)}</div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">P/E Ratio</div>
            <div className="text-lg font-medium">{stockData.pe.toFixed(2)}</div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Dividend Yield</div>
            <div className="text-lg font-medium">{stockData.dividend.toFixed(2)}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockDetails;
