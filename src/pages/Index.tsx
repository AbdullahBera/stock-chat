
import { useState } from 'react';
import StockSearch from "@/components/StockSearch";
import StockDetails from "@/components/StockDetails";
import StockChart from "@/components/StockChart";
import SentimentAnalysis from "@/components/SentimentAnalysis";
import NewsCard from "@/components/NewsCard";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [searchedSymbol, setSearchedSymbol] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSearch = async (symbol: string) => {
    setIsLoading(true);
    
    try {
      // In a real app, you might validate the symbol against an API here
      setSearchedSymbol(symbol);
      
      toast({
        title: "Stock Found",
        description: `Displaying information for ${symbol}`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error searching for stock:", error);
      toast({
        title: "Error",
        description: "Failed to find stock information",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40 py-8 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 animate-fadeIn">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Stock Chat</h1>
          <p className="text-muted-foreground">Search for a stock to analyze sentiment, news, and performance</p>
        </div>
        
        <StockSearch onSearch={handleSearch} isLoading={isLoading} />
        
        {searchedSymbol && (
          <div className="space-y-6 animate-slideUp">
            <StockDetails symbol={searchedSymbol} />
            
            <StockChart symbol={searchedSymbol} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SentimentAnalysis symbol={searchedSymbol} />
              <NewsCard symbol={searchedSymbol} />
            </div>
          </div>
        )}
        
        {!searchedSymbol && (
          <div className="text-center py-20 text-muted-foreground animate-fadeIn">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-16 w-16 mx-auto mb-4 text-primary/70" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
              />
            </svg>
            <h2 className="text-xl font-medium mb-2">Enter a Stock Symbol to Begin</h2>
            <p className="max-w-md mx-auto">
              Search for a stock symbol (like AAPL, MSFT, GOOGL) to view detailed information, 
              sentiment analysis, and recent news.
            </p>
          </div>
        )}
        
        <div className="mt-12 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>Note: This is a demo using simulated data for educational purposes only.</p>
          <p>Do not use for actual investment decisions.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
