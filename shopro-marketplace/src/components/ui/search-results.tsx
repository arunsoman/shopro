import React from "react";
import { cn } from "@/lib/utils";
import { type SearchResult } from "@/services/search-service";
import { 
  ShoppingBag, 
  Store, 
  User, 
  Navigation, 
  Settings, 
  ArrowRight,
  TrendingUp,
  History
} from "lucide-react";

interface SearchResultsProps {
  results: {
    contextual: SearchResult[];
    global: SearchResult[];
  };
  selectedIndex: number;
  onSelect: (result: SearchResult) => void;
  isLoading?: boolean;
  isRecent?: boolean;
}

const CATEGORY_ICONS: Record<string, any> = {
  ORDER: ShoppingBag,
  STORE: Store,
  USER: User,
  NAV: Navigation,
  SETTING: Settings,
};

export function SearchResults({ results, selectedIndex, onSelect, isLoading, isRecent }: SearchResultsProps) {
  const hasResults = results.contextual.length > 0 || results.global.length > 0;

  if (isLoading) {
    return (
      <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-500">Searching platform archives...</p>
        </div>
      </div>
    );
  }

  if (!hasResults) return null;

  const flatResults = [...results.contextual, ...results.global];

  return (
    <div className="absolute top-full left-0 w-[450px] mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
      <div className="p-2 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
        
        {results.contextual.length > 0 && (
          <div>
            <div className="px-3 py-2 flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-violet-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-violet-500">Contextual Matches</span>
            </div>
            <div className="space-y-1">
              {results.contextual.map((item, idx) => (
                <ResultItem 
                  key={item.id} 
                  item={item} 
                  isSelected={idx === selectedIndex}
                  onClick={() => onSelect(item)}
                />
              ))}
            </div>
          </div>
        )}

        {results.global.length > 0 && (
          <div>
            <div className="px-3 py-2 flex items-center gap-2">
              <History className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {isRecent ? "Recent Searches" : "Global Search"}
              </span>
            </div>
            <div className="space-y-1">
              {results.global.map((item, idx) => (
                <ResultItem 
                  key={item.id} 
                  item={item} 
                  isSelected={(idx + results.contextual.length) === selectedIndex}
                  onClick={() => onSelect(item)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-sans">↑↓</kbd> Navigate
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-sans">Enter</kbd> Select
          </span>
        </div>
        <span className="text-[10px] text-slate-400 italic">ESC to close</span>
      </div>
    </div>
  );
}

function ResultItem({ item, isSelected, onClick }: { item: SearchResult; isSelected: boolean; onClick: () => void }) {
  const Icon = CATEGORY_ICONS[item.category] || Navigation;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-left group",
        isSelected 
          ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20" 
          : "hover:bg-slate-100 dark:hover:bg-slate-800"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-md flex items-center justify-center transition-colors",
        isSelected ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700"
      )}>
        <Icon className={cn("w-4 h-4", isSelected ? "text-white" : "text-slate-500 dark:text-slate-400")} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold truncate">{item.title}</p>
          <span className={cn(
            "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter",
            isSelected ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
          )}>
            {item.category}
          </span>
        </div>
        {item.subtitle && (
          <p className={cn(
            "text-xs truncate transition-colors",
            isSelected ? "text-white/80" : "text-slate-500"
          )}>
            {item.subtitle}
          </p>
        )}
      </div>

      <ArrowRight className={cn(
        "w-4 h-4 transition-all",
        isSelected ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
      )} />
    </button>
  );
}
