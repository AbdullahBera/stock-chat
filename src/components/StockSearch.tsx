
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
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto mb-6 relative animate-fadeIn">
      <div 
        className={`flex items-center space-x-2 ${isFocused ? 'scale-[1.02]' : ''} transition-all duration-300`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative w-full">
          <div className={`absolute inset-0 ${isHovered ? 'bg-gradient-to-r from-purple-500/30 to-teal-500/30' : 'bg-primary/20 dark:bg-primary/30'} rounded-full blur-xl transition-all duration-500 ${isFocused ? 'opacity-70' : isHovered ? 'opacity-50' : 'opacity-0'}`}></div>
          <Input
            ref={inputRef}
            type="text"
            placeholder="Enter stock symbol (e.g., AAPL)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setShowSuggestions(true);
              setIsFocused(true);
            }}
            className={`rounded-full h-12 pl-4 pr-12 shadow-md ${isHovered ? 'border-accent/70 dark:border-accent/70' : 'border-purple-400 dark:border-purple-700'} bg-white/10 dark:bg-[#20133A]/80 backdrop-blur-md text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${isFocused ? 'shadow-lg shadow-primary/20 dark:shadow-primary/30' : ''}`}
          />
          {input.length > 0 && (
            <button 
              onClick={() => setInput("")}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-accent transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          <div className={`absolute -bottom-1 left-[10%] right-[10%] h-0.5 ${isHovered ? 'bg-gradient-to-r from-accent via-primary to-accent' : 'bg-gradient-to-r from-primary via-accent to-primary'} rounded-full transform scale-x-0 transition-all duration-500 origin-left ${isFocused || isHovered ? 'scale-x-100' : ''}`}></div>
        </div>
        <Button 
          onClick={handleSearch}
          disabled={isLoading} 
          className={`h-12 px-6 ${isHovered ? 'bg-gradient-to-r from-accent to-primary' : 'bg-gradient-to-r from-primary to-accent'} hover:opacity-90 text-white rounded-full shadow-lg transition-all duration-500 ${isFocused ? 'scale-105' : ''}`}
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
          className="absolute z-10 mt-1 w-full bg-white/80 dark:bg-gray-800/90 backdrop-blur-md shadow-lg rounded-md overflow-hidden animate-fadeIn border border-purple-200 dark:border-purple-800"
        >
          <ul className="py-1">
            {filteredSuggestions.map(stock => (
              <li 
                key={stock.symbol}
                onClick={() => handleSuggestionClick(stock.symbol)}
                className="px-4 py-2 hover:bg-primary/10 dark:hover:bg-primary/20 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-foreground">{stock.symbol}</span>
                  <span className="text-sm text-muted-foreground">{stock.name}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="mt-4">
        <p className="text-sm text-center text-muted-foreground/80">
          Popular stocks:
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {popularStocks.map(stock => (
            <button
              key={stock.symbol}
              onClick={() => handleSuggestionClick(stock.symbol)}
              className="px-3 py-1 text-xs rounded-full bg-white/5 dark:bg-[#20133A]/50 hover:bg-primary/20 dark:hover:bg-primary/30 text-foreground transition-all border border-purple-200/30 dark:border-purple-700/50 shadow-sm hover:scale-105"
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
