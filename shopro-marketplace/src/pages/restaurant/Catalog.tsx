"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Plus, 
  Info, 
  Check, 
  Package, 
  Leaf, 
  Flame, 
  Zap,
  ShoppingBag,
  Activity,
  RefreshCw,
  ChevronRight,
  TrendingUp,
  Box,
  Globe,
  Award,
  ArrowRight,
  X,
  PlusCircle
} from 'lucide-react';
import { useCart } from '@/lib/store/cart-store';
import { useNavigate } from 'react-router-dom';
import { SecureOverlay } from "@/components/SecureOverlay";

/**
 * RC-01 — Buyer Catalog
 * Purpose: Discover fresh ingredients and supplies for restaurant buyers.
 */

interface Category {
  id: string;
  name: string;
  icon: string;
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
  productId?: string;
}

const ICON_MAP: Record<string, any> = {
  ShoppingBag: <ShoppingBag className="w-5 h-5" />,
  Activity: <Activity className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  Package: <Package className="w-5 h-5" />,
};

export default function Catalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { getItemCount, addItem } = useCart();
  const navigate = useNavigate();
  
  const { data: foodInventory, isLoading: foodLoading } = useQuery<InventoryItem[]>({
    queryKey: ["buyer-food-inventory"],
    queryFn: async () => {
      const resp = await api.get("/buyer/inventory/foods");
      return resp.data;
    }
  });

  const foodIds = useMemo(() => foodInventory?.map(i => i.foodId) || [], [foodInventory]);

  const { data: prices } = useQuery<any[]>({
    queryKey: ["food-prices", foodIds],
    queryFn: async () => {
      if (foodIds.length === 0) return [];
      const resp = await api.post("/prices/bulk", { foodIds });
      return resp.data;
    },
    enabled: foodIds.length > 0
  });

  const priceMap = useMemo(() => {
    const map: Record<number, number> = {};
    prices?.forEach(p => {
        if (p.currentPrice) map[p.foodId] = p.currentPrice;
    });
    return map;
  }, [prices]);

  const filteredItems = useMemo(() => {
    if (!foodInventory) return [];
    return foodInventory.filter(item => {
      const matchesSearch = item.foodName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.foodGroup === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, foodInventory]);

  const categories = useMemo(() => {
    const groups = new Set<string>();
    foodInventory?.forEach(i => groups.add(i.foodGroup));
    return Array.from(groups).map(g => ({ id: g, name: g, icon: 'Package' }));
  }, [foodInventory]);

  return (
    <SecureOverlay>
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-24 text-slate-900 dark:text-white">
      {/* Header Section */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-slate-200 dark:border-slate-800 pb-8 transition-all">
        <div className="space-y-3">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white uppercase italic">
             Restaurant <span className="text-brand-primary font-extrabold">Catalog</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm flex items-center gap-3">
             <Globe className="w-5 h-5 text-brand-primary animate-bounce" />
             Replenishment Catalog • Linked to On-Site Inventory
          </p>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative group flex-1 lg:flex-none">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
             <input 
                type="text"
                placeholder="Search inventory items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-12 pr-4 w-full lg:w-[320px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-sm focus:ring-4 focus:ring-brand-primary/20 outline-none transition-all shadow-sm"
             />
          </div>
          <button className="h-12 w-12 bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center border border-brand-primary/30 shadow-lg hover:rotate-12 transition-all">
             <Filter size={20} />
          </button>
        </div>
      </header>

      {/* Category Pills */}
      <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide no-scrollbar custom-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={cn(
            "flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-bold transition-all border-2 tracking-widest uppercase shadow-sm",
            selectedCategory === 'all'
              ? "bg-brand-primary text-slate-950 shadow-lg border-brand-primary scale-105"
              : "bg-white dark:bg-slate-950 text-slate-400 border-slate-100 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <Box size={16} /> All Inventory
        </button>
        {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-bold transition-all border-2 tracking-widest uppercase shadow-sm whitespace-nowrap",
                selectedCategory === cat.id
                  ? "bg-brand-primary text-slate-950 shadow-lg border-brand-primary scale-105"
                  : "bg-white dark:bg-slate-950 text-slate-400 border-slate-100 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {ICON_MAP[cat.icon] || <Package size={16} />}
              {cat.name}
            </button>
        ))}
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {foodLoading ? (
            [1,2,3,4,5,6].map(i => (
                <div key={i} className="h-96 bg-white/50 dark:bg-slate-900/50 rounded-[3rem] border-4 border-slate-100 dark:border-slate-800 animate-pulse" />
            ))
        ) : filteredItems.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, i) => {
              const price = priceMap[item.foodId] || 0;
              const isLowStock = item.status === 'LOW_STOCK' || item.quantity <= item.alertLevel;
              
              return (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border-2 border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between transition-all hover:border-brand-primary overflow-hidden"
                >
                  <div className="absolute inset-0 bg-brand-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />

                  <div className="space-y-6 relative z-10">
                    <div className="flex justify-between items-start">
                        <div className="h-14 w-14 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-2xl shadow-xl group-hover:rotate-6 transition-transform font-black text-brand-primary italic">
                           {item.foodName.charAt(0)}
                        </div>
                        <div className={cn(
                          "text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl border shadow-sm",
                          !isLowStock 
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse"
                        )}>
                          {!isLowStock ? 'Nominal Stock' : 'Urgent Replenish'}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic leading-none truncate">
                           {item.foodName}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <Activity size={12} className="text-brand-primary" /> 
                           {item.foodGroup} • {item.foodSubgroup}
                        </p>
                    </div>

                    {/* Stock Meter */}
                    <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-widest text-slate-400">
                           <span>Current: {item.quantity} {item.unit}</span>
                           <span className="opacity-60 italic">Threshold: {item.alertLevel}</span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${Math.min(100, (item.quantity / (item.alertLevel * 2)) * 100)}%` }}
                             className={cn(
                                "h-full rounded-full transition-all",
                                isLowStock ? "bg-rose-500" : "bg-brand-primary"
                             )}
                           />
                        </div>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between relative z-10 pt-6 border-t-2 border-slate-100 dark:border-slate-800/60">
                     <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase opacity-60">Estimated Unit Price</p>
                        <h4 className="text-3xl font-black text-brand-primary tracking-tighter italic">
                           ₹{price}<span className="text-xs text-slate-400 font-bold uppercase tracking-widest ml-1">/{item.unit}</span>
                        </h4>
                     </div>
                     <button
                        onClick={() => {
                          addItem({
                            itemId: item.id.toString(),
                            productName: item.foodName,
                            unit: item.unit,
                            quantity: 1,
                            foodId: item.foodId,
                            supplierName: "Marketplace Fulfillment",
                            image: item.foodName.charAt(0)
                          });
                        }}
                        className={cn(
                           "h-14 w-14 rounded-2xl flex items-center justify-center border shadow-2xl hover:scale-110 active:scale-90 transition-all group/btn",
                           "bg-slate-950 dark:bg-white text-white dark:text-slate-900 border-brand-primary/50 hover:bg-brand-primary" 
                        )}
                     >
                        <Plus size={28} className="group-hover/btn:rotate-90 transition-transform" />
                     </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          <div className="col-span-full py-24 flex flex-col items-center justify-center space-y-8 bg-white/50 dark:bg-slate-900/50 rounded-[4rem] border-4 border-dashed border-slate-200 dark:border-slate-800 shadow-2xl">
              <div className="h-32 w-32 bg-slate-100 dark:bg-slate-950 rounded-full flex items-center justify-center text-6xl shadow-inner animate-pulse">
                📦
              </div>
              <div className="text-center space-y-4">
                <h3 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">Inventory Empty</h3>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.3em] opacity-80">Sync your stock to see replenishment items.</p>
              </div>
              <button 
                onClick={() => navigate('/restaurant/inventory')}
                className="h-14 px-12 bg-brand-primary text-slate-950 font-black rounded-3xl text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(251,191,36,0.4)] hover:scale-105 active:scale-95 transition-all italic"
              >
                Go to Inventory
              </button>
          </div>
        )}
      </div>

      {/* Unified Cart FAB */}
      <AnimatePresence>
        {getItemCount() > 0 && (
          <motion.div 
            initial={{ y: 200, scale: 0.5 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 200, scale: 0.5 }}
            className="fixed bottom-12 right-12 z-150"
          >
            <button 
              onClick={() => navigate('/restaurant/orders/new')}
              className="h-20 px-8 bg-slate-950 text-white rounded-4xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] border-2 border-brand-primary hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-6 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-brand-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <div className="relative z-10 flex items-center gap-6">
                <div className="relative h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                    <ShoppingCart size={28} />
                    <span className="absolute -top-3 -right-3 bg-rose-500 text-white text-[10px] font-black w-8 h-8 rounded-full flex items-center justify-center border-4 border-slate-950 shadow-2xl animate-bounce">
                      {getItemCount()}
                    </span>
                </div>
                <div className="text-left space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 group-hover:text-slate-950 transition-colors">Review Order</p>
                    <p className="text-2xl font-black group-hover:text-slate-950 transition-colors tracking-tighter italic uppercase">{getItemCount()} Items ready</p>
                </div>
                <ArrowRight size={28} className="text-brand-primary group-hover:text-slate-950 group-hover:translate-x-3 transition-all" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </SecureOverlay>
  );
}
