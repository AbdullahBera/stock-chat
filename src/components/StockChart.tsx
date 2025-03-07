import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HistoricalDataPoint, fetchHistoricalData } from '../lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from '@/components/ui/card';

interface StockChartProps {
  symbol: string;
}

type Period = '1d' | '1w' | '1m' | '3m' | '1y' | '5y';

const StockChart: React.FC<StockChartProps> = ({ symbol }) => {
  const [period, setPeriod] = useState<Period>('1m');
  const [data, setData] = useState<HistoricalDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      setData([]); // Clear previous data
      
      try {
        console.log(`Fetching historical data for ${symbol} with period ${period}`);
        const historicalData = await fetchHistoricalData(symbol, period);
        console.log('Received historical data:', historicalData);
        
        if (!Array.isArray(historicalData)) {
          throw new Error('Invalid data format received');
        }
        
        if (historicalData.length === 0) {
          setError('No historical data available for this period');
          return;
        }
        
        // Validate data format
        const validData = historicalData.every(point => 
          point.date && typeof point.close === 'number'
        );
        
        if (!validData) {
          throw new Error('Invalid data format in historical data');
        }
        
        setData(historicalData);
      } catch (err) {
        console.error('Error fetching historical data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load chart data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [symbol, period]);

  const formatXAxis = (tickItem: string) => {
    try {
      const date = new Date(tickItem);
      
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', tickItem);
        return '';
      }
      
      if (period === '1d') {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      if (period === '1w' || period === '1m') {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
      
      return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
    } catch (error) {
      console.error('Error formatting X axis:', error);
      return '';
    }
  };

  const formatTooltipDate = (value: string) => {
    try {
      const date = new Date(value);
      
      if (isNaN(date.getTime())) {
        return value;
      }
      
      if (period === '1d') {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      return date.toLocaleDateString([], { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (error) {
      console.error('Error formatting tooltip date:', error);
      return value;
    }
  };

  // Calculate if trend is positive or negative
  const isPositiveTrend = data.length > 1 && data[data.length - 1].close > data[0].close;
  const gradientColor = isPositiveTrend ? '#10b981' : '#ef4444';
  const lineColor = isPositiveTrend ? '#10b981' : '#ef4444';

  // Calculate Y-axis domain
  const minPrice = Math.min(...data.map(d => d.close));
  const maxPrice = Math.max(...data.map(d => d.close));
  const padding = (maxPrice - minPrice) * 0.05; // 5% padding

  return (
    <Card className="p-4 md:p-6 glass-card rounded-2xl h-[400px] md:h-[500px] animate-fadeIn">
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Price History</h3>
          <Tabs defaultValue={period} onValueChange={(value) => setPeriod(value as Period)} className="h-9">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="1d" className="text-xs">1D</TabsTrigger>
              <TabsTrigger value="1w" className="text-xs">1W</TabsTrigger>
              <TabsTrigger value="1m" className="text-xs">1M</TabsTrigger>
              <TabsTrigger value="3m" className="text-xs">3M</TabsTrigger>
              <TabsTrigger value="1y" className="text-xs">1Y</TabsTrigger>
              <TabsTrigger value="5y" className="text-xs">5Y</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-destructive">
            {error}
          </div>
        ) : data.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            No historical data available
          </div>
        ) : (
          <div className="flex-1 transition-all duration-500 ease-in-out">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={gradientColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={gradientColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }} 
                  tickFormatter={formatXAxis}
                  interval="preserveStartEnd"
                  minTickGap={50}
                  axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                  tickLine={false}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis 
                  domain={[minPrice - padding, maxPrice + padding]}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                  width={60}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                  labelFormatter={formatTooltipDate}
                />
                <Area 
                  type="monotone" 
                  dataKey="close" 
                  stroke={lineColor} 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                  isAnimationActive={true}
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StockChart;
