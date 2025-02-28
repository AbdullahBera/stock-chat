
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-[#F97316] to-[#8B5CF6] bg-clip-text text-transparent">stockchat</h1>
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
          <div className="text-center py-16 animate-fadeIn relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#8B5CF6]/5 to-transparent pointer-events-none"></div>
            
            <div className="relative">
              <div className="w-24 h-24 mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-[#F1E9FF] rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g transform="translate(15, 15)">
                      {/* First bar */}
                      <rect x="0" y="25" width="10" height="15" rx="5" fill="#8B5CF6" />
                      
                      {/* Second bar */}
                      <rect x="15" y="15" width="10" height="25" rx="5" fill="#8B5CF6" />
                      
                      {/* Third bar */}
                      <rect x="30" y="5" width="10" height="35" rx="5" fill="#8B5CF6" />
                      
                      {/* Plus icon circle */}
                      <circle cx="40" cy="5" r="12" fill="#F97316" />
                      
                      {/* Plus icon */}
                      <path d="M40 0V10M35 5H45" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </g>
                  </svg>
                </div>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground bg-gradient-to-r from-[#F97316]/90 to-[#8B5CF6]/90 bg-clip-text text-transparent">Enter a Stock Symbol to Begin</h2>
              
              <div className="max-w-md mx-auto p-6 glass-card rounded-2xl mb-8">
                <p className="text-lg text-foreground/90 leading-relaxed">
                  Search for a stock symbol (like <span className="font-semibold text-[#F97316]">AAPL</span>, <span className="font-semibold text-[#8B5CF6]">MSFT</span>, <span className="font-semibold text-[#F97316]">GOOGL</span>) to view detailed information, 
                  sentiment analysis, and recent news.
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <div className="flex items-center gap-2 p-3 bg-[#F97316]/10 dark:bg-[#F97316]/20 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#F97316]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Stock Performance</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-[#8B5CF6]/10 dark:bg-[#8B5CF6]/20 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#8B5CF6]" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Latest News</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-[#F97316]/10 dark:bg-[#F97316]/20 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#F97316]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Sentiment Analysis</span>
                </div>
              </div>
            </div>
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
