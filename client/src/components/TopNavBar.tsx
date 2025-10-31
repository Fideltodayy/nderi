import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookPlus, CornerDownLeft, Moon, Sun } from "lucide-react";
import { useState } from "react";

interface TopNavBarProps {
  onSearch?: (query: string) => void;
  onCheckOut?: () => void;
  onReturn?: () => void;
}

export default function TopNavBar({ onSearch, onCheckOut, onReturn }: TopNavBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(false);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="border-b bg-background">
      <div className="flex items-center justify-between p-4 gap-4">
        <div className="flex items-center gap-6 flex-1">
          <h1 className="text-xl font-semibold whitespace-nowrap">Library Management</h1>
          
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="search"
              placeholder="Search books, students..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              data-testid="input-global-search"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="default" 
            onClick={() => {
              console.log('Check Out Book clicked');
              onCheckOut?.();
            }}
            data-testid="button-checkout"
          >
            <BookPlus className="w-4 h-4 mr-2" />
            Check Out
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => {
              console.log('Return Book clicked');
              onReturn?.();
            }}
            data-testid="button-return"
          >
            <CornerDownLeft className="w-4 h-4 mr-2" />
            Return
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
