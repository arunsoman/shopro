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
  Package,
  Activity,
  Box,
  Globe,
  ArrowRight,
  X,
  PlusCircle,
  Settings,
  Check
} from 'lucide-react';
import { useCart } from '@/lib/store/cart-store';
import { useNavigate } from 'react-router-dom';
import { SecureOverlay } from "@/components/SecureOverlay";
import { InventoryConfigModal } from '@/components/restaurant/InventoryConfigModal';
import { toast } from 'sonner';
import { CatalogSearchGrid } from '@/components/shared/CatalogSearchGrid';

/**
 * RC-01 — Buyer Catalog
 * Purpose: Discover fresh ingredients and supplies for restaurant buyers.
 */

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
  ShoppingBag: <Package className="w-5 h-5" />,
  Activity: <Activity className="w-5 h-5" />,
  Package: <Package className="w-5 h-5" />,
};

export default function Catalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const { getItemCount, addItem } = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedItemConfig, setSelectedItemConfig] = useState<InventoryItem | null>(null);

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

  const updateConfigMutation = useMutation({
    mutationFn: async (vars: { id: string, data: any }) => {
      const resp = await api.put(`/buyer/inventory/foods/${vars.id}`, vars.data);
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyer-food-inventory"] });
      toast.success("Inventory configuration updated");
      setIsConfigOpen(false);
    }
  });

  const addToInventoryMutation = useMutation({
    mutationFn: async (foodId: number) => {
      return api.post("/buyer/inventory/foods", { foodId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyer-food-inventory"] });
      toast.success("Added to inventory", {
        description: "You can now configure reorder rules for this item."
      });
    }
  });

  const removeFromInventoryMutation = useMutation({
    mutationFn: async (inventoryId: string) => {
      return api.delete(`/buyer/inventory/foods/${inventoryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyer-food-inventory"] });
      toast.success("Removed from inventory");
    }
  });

  const isAlreadyInInventory = (foodId: number) => {
    return foodInventory?.some(item => item.foodId === foodId);
  };

  const handleOpenConfig = (e: React.MouseEvent, item: InventoryItem) => {
    e.stopPropagation();
    setSelectedItemConfig(item);
    setIsConfigOpen(true);
  };

  const handleSaveConfig = (data: any) => {
    if (selectedItemConfig) {
      updateConfigMutation.mutate({
        id: selectedItemConfig.id,
        data
      });
    }
  };

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
            [1, 2, 3, 4, 5, 6].map(i => (
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
                        <button
                          onClick={(e) => handleOpenConfig(e, item)}
                          className="h-10 w-10 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-brand-primary hover:border-brand-primary transition-all group scale-90 hover:scale-100"
                        >
                          <Settings size={18} className="group-hover:rotate-90 transition-transform" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic leading-none truncate">
                          {item.foodName}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Activity size={12} className="text-brand-primary" />
                          {item.foodGroup} • {item.foodSubgroup} • <span className="text-brand-primary">{item.leadTime}D Lead</span>
                        </p>
                      </div>

                      {/* Stock Meter */}
                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          <span>Current: {item.quantity} {item.unit}</span>
                          <span className="opacity-60 italic">Threshold: {item.alertLevel} / Reorder: {item.reorderCount}</span>
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
                          "h-14 w-14 rounded-2xl flex items-center justify-center border shadow-2xl hover:scale-110 active:scale-95 transition-all group/btn",
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
                onClick={() => setIsExploreOpen(true)}
                className="h-12 px-6 bg-brand-primary text-slate-950 rounded-xl border border-brand-primary/50 flex items-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-95 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <Globe size={18} className="relative z-10" />
                <span className="text-sm font-bold uppercase tracking-tight relative z-10">Explore Catalog</span>
              </button>
            </div>
          )}
        </div>

        {/* Explore Food Catalog Modal */}
        <AnimatePresence>
          {isExploreOpen && (
            <div className="fixed inset-0 z-200 flex items-center justify-center p-6">
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
                className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black tracking-tighter text-brand-primary uppercase italic">Global Marketplace</h3>
                    <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Add premium ingredients to your restaurant stock</p>
                  </div>
                  <button onClick={() => setIsExploreOpen(false)} className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
                    <X size={24} />
                  </button>
                </header>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  <CatalogSearchGrid 
                    selectedItems={foodInventory}
                    onRemoveItem={(id) => {
                      const item = foodInventory?.find(i => i.foodId === id);
                      if (item) removeFromInventoryMutation.mutate(item.id);
                    }}
                    renderItemAction={(food) => {
                      const inInventory = isAlreadyInInventory(food.id);
                      return (
                        <button 
                          disabled={inInventory || addToInventoryMutation.isPending}
                          onClick={() => addToInventoryMutation.mutate(food.id)}
                          className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center transition-all shadow-sm",
                            inInventory 
                              ? "bg-emerald-500 text-white cursor-default" 
                              : "bg-brand-primary text-slate-950 hover:scale-110 active:scale-95"
                          )}
                        >
                          {inInventory ? <Check size={20} /> : <PlusCircle size={20} />}
                        </button>
                      );
                    }}
                  />
                </div>

                <footer className="p-8 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex justify-end items-center shrink-0">
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

        <InventoryConfigModal
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          onSave={handleSaveConfig}
          isLoading={updateConfigMutation.isPending}
          initialData={selectedItemConfig ? {
            foodName: selectedItemConfig.foodName,
            leadTime: selectedItemConfig.leadTime,
            alertLevel: selectedItemConfig.alertLevel,
            reorderCount: selectedItemConfig.reorderCount,
            unit: selectedItemConfig.unit
          } : undefined}
        />
      </div>
    </SecureOverlay>
  );
}
