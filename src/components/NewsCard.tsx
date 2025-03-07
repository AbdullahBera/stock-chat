import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { NewsItem, fetchNewsForStock } from '../lib/api';

interface NewsCardProps {
  symbol: string;
}

const NewsCard: React.FC<NewsCardProps> = ({ symbol }) => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleItems, setVisibleItems] = useState<number>(5);

  useEffect(() => {
    const loadNews = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const news = await fetchNewsForStock(symbol);
        setNewsItems(news);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadNews();
  }, [symbol]);

  const loadMore = () => {
    setVisibleItems(prev => prev + 5);
  };

  const getSentimentBadge = (sentiment: 'positive' | 'negative' | 'neutral') => {
    const classes = {
      positive: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      negative: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    };
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${classes[sentiment]}`}>
        {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <Card className="glass-card rounded-2xl animate-pulse">
        <CardContent className="p-6">
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3 mb-6"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-4 last:border-0">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/4 mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4"></div>
            </div>
          ))}
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

  return (
    <Card className="glass-card rounded-2xl animate-fadeIn">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Recent News</h3>
        
        {newsItems.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            No recent news available for {symbol}.
          </div>
        ) : (
          <div>
            {newsItems.slice(0, visibleItems).map((item, index) => (
              <div 
                key={item.id}
                className={`news-card p-4 rounded-xl mb-3 ${item.sentiment === 'positive' ? 'bg-green-50/50 dark:bg-green-900/10' : 
                  item.sentiment === 'negative' ? 'bg-red-50/50 dark:bg-red-900/10' : 
                  'bg-gray-50/50 dark:bg-gray-800/30'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-base font-medium">{item.title}</h4>
                  {getSentimentBadge(item.sentiment)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {item.source} • {item.date}
                </div>
                <p className="text-sm mb-2">{item.snippet}</p>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-primary hover:underline inline-flex items-center"
                  onClick={(e) => {
                    if (item.url === '#') {
                      e.preventDefault();
                      alert('Article link not available');
                    }
                  }}
                >
                  Read more
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-3 w-3 ml-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            ))}
            
            {visibleItems < newsItems.length && (
              <div className="text-center mt-4">
                <button 
                  onClick={loadMore} 
                  className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                >
                  Load More News
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsCard;
