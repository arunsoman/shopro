"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import api from "@/api";
import { 
  Search, 
  RefreshCw,
  Box,
  AlertCircle
} from "lucide-react";
import { IconTooltip } from "@/components/shared/IconTooltip";
import { Skeleton } from "@/components/ui/Skeleton";

interface Food {
  id: number;
  name: string;
  description: string;
  foodGroup: string;
}

interface CatalogSearchGridProps {
  renderItemAction: (food: Food) => React.ReactNode;
  selectedItems?: any[];
  onRemoveItem?: (id: number) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
}

const GridSkeleton = () => (
  <>
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex justify-between items-start">
          <Skeleton className="w-14 h-14 rounded-2xl" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="pt-4 border-t border-slate-50 dark:border-slate-800 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    ))}
  </>
);

export function CatalogSearchGrid({
  renderItemAction,
  selectedItems = [],
  onRemoveItem,
  searchPlaceholder = "Search marketplace ingredients...",
  emptyMessage = "No items found matching your search.",
  className
}: CatalogSearchGridProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { 
    data, 
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage 
  } = useInfiniteQuery({
    queryKey: ["marketplace-catalog-standalone", searchQuery],
    queryFn: async ({ pageParam = 0 }) => {
      const url = searchQuery ? "/foods/search" : "/foods";
      const params: any = {
        page: pageParam,
        size: 10
      };
      if (searchQuery) params.q = searchQuery;

      const resp = await api.get(url, { params });
      return resp.data; // Return full Page object
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: any) => {
      return (lastPage && !lastPage.last) ? lastPage.number + 1 : undefined;
    }
  });

  const rawItems = data?.pages.flatMap(page => page.content || []) || [];
  
  // Filter out items that are already selected
  const selectedIds = new Set(selectedItems.map(item => Number(item.foodId || item.id)));
  const filteredItems = rawItems.filter(food => !selectedIds.has(food.id));

  // Dynamic Price Fetching for visible items
  const foodIds = filteredItems.map(f => f.id);
  const { data: priceData } = useInfiniteQuery({
    queryKey: ["marketplace-prices", foodIds],
    queryFn: async () => {
      if (foodIds.length === 0) return {};
      const resp = await api.post("/prices/bulk", { 
        items: foodIds.map(id => ({ foodId: id, quantity: 1 }))
      });
      const map: Record<number, number> = {};
      resp.data.forEach((p: any) => {
        if (p.currentPrice) map[p.foodId] = p.currentPrice;
      });
      return map;
    },
    initialPageParam: 0,
    getNextPageParam: () => undefined,
    enabled: foodIds.length > 0
  });

  const prices = priceData?.pages[0] || {};

  console.log("[CatalogSearchGrid] selectedItems:", selectedItems);
  console.log("[CatalogSearchGrid] selectedIds:", Array.from(selectedIds));
  console.log("[CatalogSearchGrid] rawItems count:", rawItems.length);
  console.log("[CatalogSearchGrid] filteredItems count:", filteredItems.length);

  return (
    <div className={cn("space-y-8", className)}>
      {/* ALWAYS VISIBLE DEBUG TEXT */}
      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-mono text-slate-500 border border-slate-200 dark:border-slate-700">
        COMPONENT_LOADED | SELECTED_ITEMS_COUNT: {selectedItems?.length ?? 'undefined'} | ITEMS_TYPE: {Array.isArray(selectedItems) ? 'ARRAY' : typeof selectedItems}
      </div>

      {/* Basket Section - Selected Marketplace Items */}
      {selectedItems.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 p-8 bg-emerald-500/5 dark:bg-emerald-500/10 border-2 border-emerald-500/20 rounded-4xl shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-500 flex items-center gap-2">
              <Box size={14} className="animate-bounce" /> Selected Ingredients ({selectedItems.length})
            </h4>
            <span className="bg-emerald-500/10 text-emerald-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-sm transition-all duration-300">
              {selectedItems.length} {selectedItems.length === 1 ? 'Ingredient' : 'Ingredients'}
            </span>
          </div>
          
          <div className="flex items-center gap-4 overflow-x-auto pb-6 pt-2 no-scrollbar scroll-smooth">
            <AnimatePresence mode="popLayout">
              {selectedItems.map((item) => (
                <motion.div
                  layout
                  key={item.foodId || item.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="shrink-0 w-64 p-5 bg-white dark:bg-slate-900 border-2 border-emerald-500/20 rounded-3xl flex items-center justify-between group hover:border-emerald-500/40 transition-all hover:-translate-y-1 shadow-sm"
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="shrink-0 w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-sm shadow-md group-hover:rotate-6 transition-transform">
                      {(item.foodName || item.name || "?").substring(0, 1).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <h5 className="text-xs font-black text-slate-900 dark:text-white truncate w-32 uppercase italic tracking-tight">
                        {item.foodName || item.name}
                      </h5>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic opacity-80 truncate">
                         {item.foodGroup || "Premium Batch"}
                      </p>
                    </div>
                  </div>
                  {onRemoveItem && (
                    <button 
                      onClick={() => onRemoveItem(item.foodId || item.id)}
                      className="shrink-0 h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all shadow-sm group/undo"
                    >
                      <RefreshCw size={16} className="group-hover/undo:rotate-180 transition-transform duration-500" />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Search Bar - Standalone */}
      <div className="relative flex items-center group">
        <IconTooltip label="Browse marketplace">
          <Search className="absolute left-6 w-6 h-6 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
        </IconTooltip>
        <input 
          type="text" 
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-4xl pl-16 pr-6 py-6 font-bold uppercase tracking-tight text-sm outline-none focus:border-brand-primary transition-all shadow-2xl"
        />
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          <GridSkeleton />
        ) : (
          filteredItems.map((food: Food) => (
            <motion.div 
              layout
              key={food.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-4xl overflow-hidden transition-all shadow-sm hover:border-brand-primary/40 hover:shadow-xl group"
            >
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-4xl font-black text-brand-primary italic group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    {food.name.substring(0, 1).toUpperCase()}
                  </div>
                  {renderItemAction(food)}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Box size={14} className="text-brand-primary" />
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{food.foodGroup}</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight uppercase italic tracking-tighter">
                    {food.name}
                  </h3>
                  <p className="text-[11px] font-bold text-slate-400 line-clamp-2 uppercase italic tracking-widest opacity-80 leading-relaxed">
                    {food.description || "Premium quality ingredient available through the marketplace network."}
                  </p>
                  
                  {/* Price Tag */}
                  <div className="pt-4 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">Starting From</p>
                      <h4 className="text-2xl font-black text-emerald-500 tracking-tighter italic">
                        {prices[food.id] ? `₹${prices[food.id]}` : "—"}
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">/UNIT</span>
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Load More */}
      {hasNextPage && filteredItems.length > 0 && (
        <div className="flex justify-center pt-12">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-16 py-5 bg-slate-950 text-white dark:bg-white dark:text-slate-900 rounded-3xl text-sm font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-4 disabled:opacity-50 italic"
          >
            <RefreshCw className={cn("w-6 h-6 transition-transform", isFetchingNextPage && "animate-spin")} />
            {isFetchingNextPage ? "Synchronizing..." : "Load 10 more results"}
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredItems.length === 0 && (
        <div className="py-24 text-center space-y-8 bg-white dark:bg-slate-900 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[4rem]">
          <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-pulse text-4xl">
            📦
          </div>
          <div className="space-y-4">
            <h3 className="text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{emptyMessage}</h3>
            <p className="max-w-md mx-auto text-xs text-slate-400 font-bold uppercase tracking-[0.3em] opacity-80">All available ingredients are already in your inventory or didn't match.</p>
          </div>
        </div>
      )}
    </div>
  );
}
