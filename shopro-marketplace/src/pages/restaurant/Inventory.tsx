"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Package, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  Search, 
  Filter, 
  Plus, 
  RefreshCw,
  Box,
  Globe,
  Award,
  CircleDot,
  ArrowRight,
  ShieldCheck,
  Zap,
  ChevronRight,
  X,
  PlusCircle,
  ShoppingCart,
  Check
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "@/api";
import { useCart } from "@/lib/store/cart-store";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * RD-05 — Inventory Management
 * Purpose: Track on-site inventory and trigger reorders for buyers.
 */

interface StockItem {
  id: string;
  name: string;
  current: number;
  min: number;
  unit: string;
  health: string;
}

interface FoodItem {
  id: number;
  name: string;
  description: string;
  foodGroup: string;
  foodSubgroup: string;
}

interface InventoryItem {
  id: string;
  restaurantId: string;
  foodId: number;
  foodName: string;
  foodGroup: string;
  foodSubgroup: string;
  quantity: number;
  unit: string;
  leadTime: number;
  alertLevel: number;
  reorderCount: number;
  status: string;
}

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [foodSearch, setFoodSearch] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addItem } = useCart();

  const { data: stock, isLoading: stockLoading } = useQuery<StockItem[]>({
    queryKey: ["buyer-inventory"],
    queryFn: async () => {
      const resp = await api.get("/buyer/inventory");
      return resp.data;
    }
  });

  const { data: foodInventory, isLoading: foodLoading } = useQuery<InventoryItem[]>({
    queryKey: ["buyer-food-inventory"],
    queryFn: async () => {
      const resp = await api.get("/buyer/inventory/foods");
      return resp.data;
    }
  });

  const { data: foodCatalog, isLoading: catalogLoading } = useQuery<{ content: FoodItem[] }>({
    queryKey: ["food-catalog", foodSearch],
    queryFn: async () => {
      const url = foodSearch ? `/foods/search?q=${foodSearch}` : '/foods';
      const resp = await api.get(url);
      return resp.data;
    },
    enabled: isExploreOpen
  });

  const addToInventoryMutation = useMutation({
    mutationFn: async (foodId: number) => {
      return api.post("/buyer/inventory/foods", { foodId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyer-food-inventory"] });
    }
  });


  const filteredStock = useMemo(() => {
    const s = stock?.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
    const f = foodInventory?.filter(item => 
      item.foodName.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(item => ({
        id: item.id,
        name: item.foodName,
        current: item.quantity,
        min: item.alertLevel || 10,
        unit: item.unit,
        health: item.status === 'AVAILABLE' ? 'NOMINAL' : 'LOW_STOCK'
    })) || [];
    return [...s, ...f];
  }, [searchQuery, stock, foodInventory]);

  const isAlreadyInInventory = (foodId: number) => {
      return foodInventory?.some(item => item.foodId === foodId);
  };

  return (
    <SecureOverlay>
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-24 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-slate-200 dark:border-slate-800 pb-8 transition-all">
        <div className="space-y-4">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white italic">
             Inventory <span className="text-brand-primary font-extrabold">& Stock</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm flex items-center gap-3">
             <IconTooltip label="Activity Stream"><Box className="w-5 h-5 text-brand-primary animate-pulse" /></IconTooltip>
             Stock Monitoring: Active • Tracking {filteredStock.length} Items
          </p>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative group flex-1 lg:flex-none">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
             <input 
               type="text"
               placeholder="Search inventory..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="h-12 pl-12 pr-6 w-full lg:w-[280px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-sm focus:ring-4 focus:ring-brand-primary/10 outline-none shadow-sm transition-all"
             />
          </div>
          <button 
            onClick={() => setIsExploreOpen(true)}
            className="h-12 px-6 bg-brand-primary text-slate-950 rounded-xl border border-brand-primary/50 flex items-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-95 group overflow-hidden relative"
          >
             <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
             <Globe size={18} className="relative z-10" />
             <span className="text-sm font-bold uppercase tracking-tight relative z-10">Explore Catalog</span>
          </button>
        </div>
      </header>

      {/* Critical Alerts Banner (Only if any item is low stock) */}
      {filteredStock.some(i => i.health !== 'NOMINAL') && (
          <div className="bg-brand-destructive/10 border border-brand-destructive/20 rounded-2xl p-6 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-lg relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-64 h-64 bg-brand-destructive/10 rounded-full -translate-y-1/2 -translate-x-1/2 blur-[80px] pointer-events-none" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="h-14 w-14 rounded-xl bg-brand-destructive flex items-center justify-center text-white shadow-lg animate-pulse">
                   <IconTooltip label="Critical Stockout Risk"><AlertTriangle size={28} /></IconTooltip>
                </div>
                <div className="space-y-2">
                   <p className="text-[10px] font-bold tracking-[0.3em] text-brand-destructive uppercase">Critical Stock Alert</p>
                   <h2 className="text-xl md:text-2xl font-bold tracking-tight italic uppercase">
                       {filteredStock.find(i => i.health !== 'NOMINAL')?.name} is below threshold
                   </h2>
                </div>
             </div>
              <button 
                onClick={() => navigate('/restaurant/catalog')}
                className="h-12 px-8 bg-brand-destructive text-white rounded-lg border border-brand-destructive/40 font-bold text-sm tracking-widest shadow-md hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-3 relative z-10 italic uppercase"
              >
                 Reorder Now
                 <ArrowRight size={20} />
              </button>
          </div>
      )}

      {/* Stock Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stockLoading || foodLoading ? (
            [1,2,3,4,5,6].map(i => (
                <div key={i} className="h-96 bg-muted/20 animate-pulse rounded-3xl border-2 border-slate-100 dark:border-slate-800" />
            ))
        ) : filteredStock?.map((item) => (
            <div key={item.id} className="group relative bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-6 transition-all hover:border-brand-primary overflow-hidden">
                <div className="absolute inset-0 bg-brand-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                
                <div className="flex justify-between items-start relative z-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Box size={14} className="text-brand-primary" />
                            <p className="text-[10px] font-bold tracking-widest text-slate-400 italic uppercase">Item ID: {item.id.substring(0,8)}</p>
                        </div>
                        <h3 className="text-xl font-bold italic tracking-tight uppercase text-slate-900 dark:text-white leading-tight min-h-14 flex items-center">{item.name}</h3>
                    </div>
                    <div className={cn(
                        "h-8 px-4 rounded-lg border font-bold italic text-[10px] tracking-widest uppercase shadow-sm flex items-center",
                        item.health === 'NOMINAL' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-rose-500/10 border-rose-500/20 text-rose-500 animate-pulse"
                    )}>
                        {item.health === 'NOMINAL' ? 'In Stock' : 'Low Stock'}
                    </div>
                </div>

                <div className="space-y-6 pt-4 relative z-10">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold tracking-widest text-slate-400 opacity-60 uppercase">Current Stock</p>
                            <p className="text-3xl font-extrabold tracking-tighter text-brand-primary">{item.current} <span className="text-sm opacity-60 font-medium text-slate-400">{item.unit}</span></p>
                        </div>
                        <div className="text-right space-y-1">
                             <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Min Thresh</p>
                             <p className="text-lg font-bold tracking-tight opacity-40 italic">{item.min} {item.unit}</p>
                        </div>
                    </div>

                    <div className="h-3 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden shadow-inner flex border border-slate-200 dark:border-slate-800">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (item.current / item.min) * 50)}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={cn(
                                "h-full rounded-full transition-all shadow-xl",
                                item.current <= item.min ? "bg-rose-500" : "bg-brand-primary"
                            )}
                        />
                    </div>
                </div>

                <button className="h-12 w-full bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-xl border border-slate-800 dark:border-slate-200 font-bold uppercase text-xs tracking-widest shadow-lg mt-4 relative z-10 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 italic">
                    Adjust Stock
                    <IconTooltip label="Recalibrate stock"><RefreshCw size={18} /></IconTooltip>
                </button>
            </div>
        ))}
      </div>

      {/* Explore Food Catalog Modal */}
      <AnimatePresence>
        {isExploreOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExploreOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black tracking-tighter text-brand-primary uppercase italic">Food Catalog</h3>
                  <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Browse global ingredients for your inventory</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                        <input 
                            type="text"
                            placeholder="Search catalog..."
                            value={foodSearch}
                            onChange={(e) => setFoodSearch(e.target.value)}
                            className="h-12 pl-12 pr-6 w-[300px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all"
                        />
                    </div>
                    <button onClick={() => setIsExploreOpen(false)} className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
                        <X size={24} />
                    </button>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {catalogLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} className="h-40 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {foodCatalog?.content.map(food => {
                      const inInventory = isAlreadyInInventory(food.id);
                      return (
                        <div 
                          key={food.id}
                          className={cn(
                            "p-6 rounded-[2rem] border-2 transition-all flex flex-col justify-between gap-6 group relative overflow-hidden",
                            inInventory
                              ? "bg-brand-primary/5 border-brand-primary/40"
                              : "bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 hover:border-brand-primary/40 hover:bg-white dark:hover:bg-slate-900"
                          )}
                        >
                          <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-start">
                                <div className="h-12 w-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xl font-bold text-brand-primary shadow-md group-hover:rotate-6 transition-transform">
                                    {food.name.charAt(0)}
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">{food.foodGroup}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60">{food.foodSubgroup}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase italic">{food.name}</h4>
                                <p className="text-xs text-slate-400 font-medium line-clamp-2 italic">{food.description || "Fresh master-grade ingredient for culinary excellence."}</p>
                            </div>
                          </div>

                          <div className="flex gap-3 relative z-10">
                            {inInventory ? (
                                <div className="h-12 w-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest italic text-[10px]">
                                    <Check size={18} />
                                    Already In Inventory
                                </div>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => addToInventoryMutation.mutate(food.id)}
                                        disabled={addToInventoryMutation.isPending}
                                        className="w-full h-12 bg-brand-primary text-slate-950 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <PlusCircle size={16} /> Add to Stock
                                    </button>
                                </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <footer className="p-8 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">
                    Showing {foodCatalog?.content.length || 0} Ingredients from Marketplace Catalog
                 </p>
                 <button 
                  onClick={() => setIsExploreOpen(false)}
                  className="h-14 px-12 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-4xl font-bold uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-all shadow-md"
                 >
                   Done
                 </button>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </SecureOverlay>
  );
}
