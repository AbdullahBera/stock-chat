
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
      
      try {
        const historicalData = await fetchHistoricalData(symbol, period);
        setData(historicalData);
      } catch (err) {
        console.error('Error fetching historical data:', err);
        setError('Failed to load chart data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [symbol, period]);

  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    
    if (period === '1d') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    if (period === '1w' || period === '1m') {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
  };

  const formatTooltipDate = (value: string) => {
    const date = new Date(value);
    
    if (period === '1d') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Calculate if trend is positive or negative
  const isPositiveTrend = data.length > 1 && data[data.length - 1].close > data[0].close;
  const gradientColor = isPositiveTrend ? '#10b981' : '#ef4444';
  const lineColor = isPositiveTrend ? '#10b981' : '#ef4444';

  // Only show every nth tick to avoid crowding
  const tickInterval = Math.max(1, Math.ceil(data.length / 6));
  const ticks = data.map((item, index) => index % tickInterval === 0 ? item.date : '').filter(Boolean);

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
        ) : (
          <div className="flex-1 transition-all duration-500 ease-in-out">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
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
                  ticks={ticks}
                  axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                  tickLine={false}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis 
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${value}`}
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
