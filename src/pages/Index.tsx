
import { useState, useEffect } from 'react';
import StockSearch from "@/components/StockSearch";
import StockDetails from "@/components/StockDetails";
import StockChart from "@/components/StockChart";
import SentimentAnalysis from "@/components/SentimentAnalysis";
import NewsCard from "@/components/NewsCard";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from '@/components/ThemeToggle';

const Index = () => {
  const [searchedSymbol, setSearchedSymbol] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Add history state management for back and forward gesture support
  useEffect(() => {
    // Push state to history when a symbol is searched
    if (searchedSymbol) {
      window.history.pushState({ symbol: searchedSymbol }, "", `?symbol=${searchedSymbol}`);
      
      // Update our local history tracking
      if (historyIndex < searchHistory.length - 1) {
        // If we're not at the end of history, truncate the future history
        const newHistory = searchHistory.slice(0, historyIndex + 1);
        setSearchHistory([...newHistory, searchedSymbol]);
        setHistoryIndex(historyIndex + 1);
      } else {
        // Add to the end of history
        setSearchHistory([...searchHistory, searchedSymbol]);
        setHistoryIndex(searchHistory.length);
      }
    }

    // Handle back/forward button or gesture
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.symbol) {
        setSearchedSymbol(event.state.symbol);
      } else {
        setSearchedSymbol("");
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [searchedSymbol, searchHistory, historyIndex]);

  const handleSearch = async (symbol: string) => {
    setIsLoading(true);
    
    try {
      // In a real app, you might validate the symbol against an API here
      setSearchedSymbol(symbol);
    } catch (error) {
      console.error("Error searching for stock:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchedSymbol("");
    
    // Go back in history to handle back button properly
    window.history.back();
  };

  const goForward = () => {
    // This will trigger the forward gesture behavior
    window.history.forward();
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-2 px-3 md:py-4 md:px-6 dark:bg-gradient-to-b dark:from-[#1A1F2C] dark:via-[#221F26] dark:to-[#0D1117] light:from-[#f0f9ff] light:via-[#e0f2fe] light:to-[#dbeafe]">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end mb-2">
          <ThemeToggle />
        </div>
        
        <div className="text-center mb-3 md:mb-4 animate-fadeIn">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 text-[#B86A87]">stockchat</h1>
          <p className="text-foreground/80 text-xs sm:text-sm">Search for a stock to analyze sentiment, news, and performance</p>
        </div>
        
        {!searchedSymbol ? (
          <StockSearch onSearch={handleSearch} isLoading={isLoading} />
        ) : (
          <div className="flex items-center justify-between mb-3 animate-fadeIn">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-lg sm:text-xl font-bold text-[#9747FF]">{searchedSymbol}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={clearSearch} 
                className="rounded-full h-5 w-5 sm:h-6 sm:w-6 bg-secondary/80 hover:bg-secondary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setSearchedSymbol("");
                window.history.back();
              }}
              className="text-xs px-2 py-1 h-auto"
            >
              New Search
            </Button>
          </div>
        )}
        
        {searchedSymbol && (
          <div className="space-y-3 md:space-y-4 animate-slideUp">
            <StockDetails symbol={searchedSymbol} />
            
            <StockChart symbol={searchedSymbol} />
            
            <div className="grid grid-cols-1 gap-3 md:gap-4">
              <SentimentAnalysis symbol={searchedSymbol} />
              <NewsCard symbol={searchedSymbol} />
            </div>
          </div>
        )}
        
        {!searchedSymbol && (
          <div className="text-center pt-2 pb-4 animate-fadeIn relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#9747FF]/5 to-transparent pointer-events-none"></div>
            
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 relative">
                <div className="absolute inset-0 bg-[#F4EAFF] rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="60" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-[70px] sm:h-[70px]">
                    <g transform="translate(15, 15)">
                      {/* First bar */}
                      <rect x="0" y="25" width="10" height="15" rx="5" fill="#9747FF" />
                      
                      {/* Second bar */}
                      <rect x="15" y="15" width="10" height="25" rx="5" fill="#9747FF" />
                      
                      {/* Third bar */}
                      <rect x="30" y="5" width="10" height="35" rx="5" fill="#9747FF" />
                      
                      {/* Plus icon circle */}
                      <circle cx="40" cy="5" r="12" fill="#B86A87" />
                      
                      {/* Plus icon */}
                      <path d="M40 0V10M35 5H45" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </g>
                  </svg>
                </div>
              </div>
              
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-[#B86A87]">Enter a Stock Symbol to Begin</h2>
              
              <div className="max-w-md mx-auto p-3 sm:p-4 glass-card rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
                <p className="text-sm text-foreground/90 leading-relaxed">
                  Search for a stock symbol (like <span className="font-semibold text-[#B86A87]">AAPL</span>, <span className="font-semibold text-[#9747FF]">MSFT</span>, <span className="font-semibold text-[#B86A87]">GOOGL</span>) to view detailed information, 
                  sentiment analysis, and recent news.
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mt-2 sm:mt-3">
                <div className="flex items-center gap-1 p-1.5 sm:p-2 bg-[#B86A87]/10 dark:bg-[#B86A87]/20 rounded-lg text-xs sm:text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 text-[#B86A87]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Stock Performance</span>
                </div>
                <div className="flex items-center gap-1 p-1.5 sm:p-2 bg-[#9747FF]/10 dark:bg-[#9747FF]/20 rounded-lg text-xs sm:text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 text-[#9747FF]" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Latest News</span>
                </div>
                <div className="flex items-center gap-1 p-1.5 sm:p-2 bg-[#B86A87]/10 dark:bg-[#B86A87]/20 rounded-lg text-xs sm:text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 text-[#B86A87]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Sentiment Analysis</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-4 text-center text-[8px] sm:text-[10px] text-muted-foreground/70">
          <p>Note: This is a demo using simulated data for educational purposes only. Do not use for actual investment decisions.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
