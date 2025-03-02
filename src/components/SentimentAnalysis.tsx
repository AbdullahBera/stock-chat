
import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SentimentData, fetchSentimentAnalysis } from '../lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SentimentAnalysisProps {
  symbol: string;
}

const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ symbol }) => {
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSentimentData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await fetchSentimentAnalysis(symbol);
        setSentimentData(data);
      } catch (err) {
        console.error('Error fetching sentiment data:', err);
        setError('Failed to load sentiment analysis. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSentimentData();
  }, [symbol]);

  if (isLoading) {
    return (
      <Card className="glass-card rounded-2xl animate-pulse">
        <CardContent className="p-6">
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-md w-full mb-6"></div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
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

  if (!sentimentData) return null;

  // Prepare data for pie chart
  const chartData = [
    { name: 'Positive', value: sentimentData.breakdown.positive },
    { name: 'Negative', value: sentimentData.breakdown.negative },
    { name: 'Neutral', value: sentimentData.breakdown.neutral },
  ];

  const COLORS = ['#10b981', '#ef4444', '#9ca3af'];

  // Get sentiment class
  const getSentimentClass = (label: 'positive' | 'negative' | 'neutral') => {
    switch(label) {
      case 'positive': return 'sentiment-positive';
      case 'negative': return 'sentiment-negative';
      case 'neutral': return 'sentiment-neutral';
    }
  };

  // Get sentiment score display
  const getSentimentDisplay = () => {
    const { score, label } = sentimentData.overall;
    
    let displayText = 'Neutral';
    if (label === 'positive') {
      displayText = score > 60 ? 'Very Positive' : 'Positive';
    } else if (label === 'negative') {
      displayText = score < -60 ? 'Very Negative' : 'Negative';
    }
    
    return (
      <span className={getSentimentClass(label)}>
        {displayText}
      </span>
    );
  };

  return (
    <Card className="glass-card rounded-2xl animate-fadeIn">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Sentiment Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-6">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Overall Sentiment</div>
              <div className="text-2xl font-bold">
                {getSentimentDisplay()}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                  (Score: {sentimentData.overall.score.toFixed(1)})
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium sentiment-positive">Positive</span>
                  <span className="text-sm font-medium">{sentimentData.breakdown.positive.toFixed(1)}%</span>
                </div>
                <Progress value={sentimentData.breakdown.positive} className="h-2 bg-gray-200 dark:bg-gray-700">
                  <div className="h-full bg-green-500 rounded-full"></div>
                </Progress>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium sentiment-negative">Negative</span>
                  <span className="text-sm font-medium">{sentimentData.breakdown.negative.toFixed(1)}%</span>
                </div>
                <Progress value={sentimentData.breakdown.negative} className="h-2 bg-gray-200 dark:bg-gray-700">
                  <div className="h-full bg-red-500 rounded-full"></div>
                </Progress>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium sentiment-neutral">Neutral</span>
                  <span className="text-sm font-medium">{sentimentData.breakdown.neutral.toFixed(1)}%</span>
                </div>
                <Progress value={sentimentData.breakdown.neutral} className="h-2 bg-gray-200 dark:bg-gray-700">
                  <div className="h-full bg-gray-500 rounded-full"></div>
                </Progress>
              </div>
            </div>
          </div>
          
          <div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    animationDuration={1000}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Sentiment']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-3">Key Sentiment Indicators</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {sentimentData.keywords.map((keyword, index) => (
              <div 
                key={index} 
                className={`text-sm px-3 py-2 rounded-lg ${keyword.score > 0 ? 'bg-green-50 dark:bg-green-900/20 sentiment-positive' : 
                  keyword.score < 0 ? 'bg-red-50 dark:bg-red-900/20 sentiment-negative' : 
                  'bg-gray-50 dark:bg-gray-800/50 sentiment-neutral'}`}
              >
                {keyword.word}
                <span className="text-xs ml-1">({keyword.occurrences})</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SentimentAnalysis;
