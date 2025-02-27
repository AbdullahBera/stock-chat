
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface StockSearchProps {
  onSearch: (symbol: string) => void;
  isLoading: boolean;
}

const popularStocks = [
  { symbol: "AAPL", name: "Apple" },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "GOOGL", name: "Google" },
  { symbol: "AMZN", name: "Amazon" },
  { symbol: "TSLA", name: "Tesla" },
  { symbol: "META", name: "Meta" },
];

const StockSearch: React.FC<StockSearchProps> = ({ onSearch, isLoading }) => {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = popularStocks.filter(stock => 
    stock.symbol.toLowerCase().includes(input.toLowerCase()) || 
    stock.name.toLowerCase().includes(input.toLowerCase())
  );

  const handleSearch = () => {
    if (input.trim().length === 0) {
      toast({
        description: "Please enter a stock symbol",
        variant: "destructive",
      });
      return;
    }
    
    onSearch(input.toUpperCase());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (symbol: string) => {
    setInput(symbol);
    onSearch(symbol);
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto mb-6 relative animate-fadeIn">
      <div className="flex items-center space-x-2">
        <div className="relative w-full">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Enter stock symbol (e.g., AAPL)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            className="rounded-full h-12 pl-4 pr-12 shadow-sm border-gray-600 dark:border-gray-800 bg-gray-800/50 backdrop-blur-md text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          {input.length > 0 && (
            <button 
              onClick={() => setInput("")}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        <Button 
          onClick={handleSearch}
          disabled={isLoading} 
          className="h-12 px-6 bg-primary hover:bg-primary/90 text-white rounded-full shadow-md transition-all"
        >
          {isLoading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Searching</span>
            </div>
          ) : (
            <span>Search</span>
          )}
        </Button>
      </div>
      
      {showSuggestions && input.length > 0 && filteredSuggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-10 mt-1 w-full bg-gray-800 shadow-lg rounded-md overflow-hidden animate-fadeIn border border-gray-700"
        >
          <ul className="py-1">
            {filteredSuggestions.map(stock => (
              <li 
                key={stock.symbol}
                onClick={() => handleSuggestionClick(stock.symbol)}
                className="px-4 py-2 hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white">{stock.symbol}</span>
                  <span className="text-sm text-gray-400">{stock.name}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="mt-4">
        <p className="text-sm text-center text-gray-400">
          Popular stocks:
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {popularStocks.map(stock => (
            <button
              key={stock.symbol}
              onClick={() => handleSuggestionClick(stock.symbol)}
              className="px-3 py-1 text-xs rounded-full bg-gray-800/70 hover:bg-gray-700 text-gray-300 transition-colors border border-gray-700"
            >
              {stock.symbol}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StockSearch;
