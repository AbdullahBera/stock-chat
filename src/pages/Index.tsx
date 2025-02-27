
import { useState } from 'react';
import StockSearch from "@/components/StockSearch";
import StockDetails from "@/components/StockDetails";
import StockChart from "@/components/StockChart";
import SentimentAnalysis from "@/components/SentimentAnalysis";
import NewsCard from "@/components/NewsCard";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from '@/components/ThemeToggle';

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

  const clearSearch = () => {
    setSearchedSymbol("");
    toast({
      title: "Search Cleared",
      description: "Return to main page",
      duration: 2000,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 md:px-6 dark:bg-gradient-to-b dark:from-[#1A1F2C] dark:via-[#221F26] dark:to-[#0D1117] light:from-[#f0f9ff] light:via-[#e0f2fe] light:to-[#dbeafe]">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        
        <div className="text-center mb-8 animate-fadeIn">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Stock Chat</h1>
          <p className="text-foreground/80">Search for a stock to analyze sentiment, news, and performance</p>
        </div>
        
        {!searchedSymbol ? (
          <StockSearch onSearch={handleSearch} isLoading={isLoading} />
        ) : (
          <div className="flex items-center justify-between mb-6 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary">{searchedSymbol}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={clearSearch} 
                className="rounded-full h-6 w-6 bg-secondary/80 hover:bg-secondary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSearchedSymbol("")}
              className="text-xs"
            >
              New Search
            </Button>
          </div>
        )}
        
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
            <h2 className="text-xl font-medium mb-2 text-foreground">Enter a Stock Symbol to Begin</h2>
            <p className="max-w-md mx-auto text-muted-foreground">
              Search for a stock symbol (like AAPL, MSFT, GOOGL) to view detailed information, 
              sentiment analysis, and recent news.
            </p>
          </div>
        )}
        
        <div className="mt-12 text-center text-xs text-muted-foreground/70">
          <p>Note: This is a demo using simulated data for educational purposes only.</p>
          <p>Do not use for actual investment decisions.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
