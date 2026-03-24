"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import api from "@/api";
import { 
  Package, 
  Search, 
  Plus, 
  Check,
  Zap,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Box,
  Layers,
  Tag,
  RefreshCw,
  Filter,
  DollarSign
} from "lucide-react";
import { IconTooltip } from "@/components/shared/IconTooltip";
import { SecureOverlay } from "@/components/SecureOverlay";
import { Skeleton } from "@/components/ui/Skeleton";
import { CatalogSearchGrid } from "@/components/shared/CatalogSearchGrid";

interface Food {
  id: number;
  name: string;
  description: string;
  foodGroup: string;
}

interface SupplyListItem {
  foodId: number;
  name: string;
  description: string;
  price: number;
  offerCount: number;
  isAvailable: boolean;
  stockQty: number;
  autoResponseMode: boolean;
}

// GridSkeleton is now in CatalogSearchGrid.tsx

export default function InventoryManagement() {
  const [activeTab, setActiveTab] = useState<"catalogue" | "my-list">("my-list");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Queries
  const { data: mySupplyList = [], isLoading: isLoadingMy } = useQuery<SupplyListItem[]>({
    queryKey: ["my-supply-list"],
    queryFn: async () => {
      const resp = await api.get("/supplier/supply-list");
      return resp.data;
    }
  });

  // Mutations
  const addMutation = useMutation({
    mutationFn: (foodId: number) => api.post("/supplier/supply-list/add", foodId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-supply-list"] })
  });

  const removeMutation = useMutation({
    mutationFn: (foodId: number) => api.delete(`/supplier/supply-list/${foodId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-supply-list"] })
  });

  const updateMutation = useMutation({
    mutationFn: ({ foodId, data }: { foodId: number, data: Partial<SupplyListItem> }) => 
      api.patch(`/supplier/supply-list/${foodId}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-supply-list"] })
  });

  const isInList = (foodId: number) => mySupplyList.some(item => item.foodId === foodId);

  const filteredMyList = mySupplyList.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <SecureOverlay>
      <div className="max-w-[1400px] mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <Package className="w-10 h-10 text-emerald-500" />
              Catalog & <span className="text-emerald-500">Inventory</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">
              Control your product availability, dynamic pricing, and automated fulfillment rules.
            </p>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setActiveTab("catalogue")}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                activeTab === "catalogue" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Master Catalog
            </button>
            <button 
              onClick={() => setActiveTab("my-list")}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 relative",
                activeTab === "my-list" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Your Inventory
              {mySupplyList.length > 0 && (
                <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                  {mySupplyList.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Search & Stats - Only show global search for 'Your Inventory' tab */}
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative flex items-center group">
              {activeTab === "my-list" ? (
                <>
                  <IconTooltip label="Search your inventory">
                    <Search className="absolute left-4 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  </IconTooltip>
                  <input 
                    type="text" 
                    placeholder="Search your stock..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:border-emerald-500 transition-all shadow-sm"
                  />
                </>
              ) : (
                <div className="flex items-center gap-3 px-6 py-4 bg-emerald-500/5 border-2 border-dashed border-emerald-500/20 rounded-2xl w-full">
                  <Box className="text-emerald-500" size={20} />
                  <p className="text-sm font-bold text-emerald-600 italic">Master Catalog Mode: Browse the global marketplace below.</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-3 flex items-center gap-4 shadow-sm">
                   <IconTooltip label="Smart pricing active">
                     <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Zap size={20} />
                     </div>
                   </IconTooltip>
                   <div>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Smart Pricing</p>
                     <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">
                       {mySupplyList.filter(i => i.autoResponseMode).length} Active
                     </p>
                   </div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-3 flex items-center gap-4 shadow-sm text-amber-500">
                   <IconTooltip label="Low stock signals detected">
                     <AlertCircle size={20} />
                   </IconTooltip>
                   <p className="text-sm font-bold">4 Stock Alerts</p>
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="w-full">
          {activeTab === "catalogue" ? (
            <CatalogSearchGrid 
              selectedItems={mySupplyList}
              onRemoveItem={(id) => removeMutation.mutate(id)}
              renderItemAction={(food) => {
                const inList = isInList(food.id);
                return (
                  <IconTooltip label={inList ? "Remove from list" : "Add to list"}>
                    <button 
                      onClick={() => inList ? removeMutation.mutate(food.id) : addMutation.mutate(food.id)}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                        inList ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200"
                      )}
                    >
                      {inList ? <Check size={20} /> : <Plus size={20} />}
                    </button>
                  </IconTooltip>
                );
              }}
            />
          ) : (
            <>
              {isLoadingMy ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm animate-pulse">
                      <Skeleton className="w-14 h-14 rounded-2xl" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              ) : filteredMyList.length === 0 ? (
                <div className="py-40 text-center space-y-6 bg-white dark:bg-slate-900 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem]">
                  <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Search className="w-12 h-12 text-slate-300" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white italic uppercase tracking-tight">No items in your inventory</h3>
                  <p className="text-slate-500 font-bold italic tracking-wide">Browse the Master Catalog to add products.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMyList.map((item) => {
                    const foodId = item.foodId;
                    const isExpanded = expandedId === foodId;

                    return (
                      <motion.div 
                        layout
                        key={foodId}
                        className="bg-white dark:bg-slate-900 border-2 border-emerald-500/30 rounded-3xl overflow-hidden transition-all shadow-sm"
                      >
                        <div className="p-6 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl font-bold text-emerald-500">
                              {item.name.substring(0, 1).toUpperCase()}
                            </div>
                            <IconTooltip label="Remove from inventory">
                              <button 
                                onClick={() => removeMutation.mutate(foodId)}
                                className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center transition-all hover:bg-emerald-600"
                              >
                                <Check size={20} />
                              </button>
                            </IconTooltip>
                          </div>

                          <div>
                            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                              {item.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                              {item.description || "A premium quality ingredient sourced from certified vendors."}
                            </p>
                          </div>

                          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-bold text-slate-900 dark:text-white">₹{item.price || '--'}</span>
                              <span className={cn(
                                "text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest",
                                item.autoResponseMode ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                              )}>
                                {item.autoResponseMode ? "SMART" : "MANUAL"}
                              </span>
                            </div>
                            
                            <button 
                              onClick={() => setExpandedId(isExpanded ? null : foodId)}
                              className="w-full py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs font-bold text-slate-500 flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors"
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />} 
                              {isExpanded ? "Hide Settings" : "Inventory & Rules"}
                            </button>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="space-y-4 overflow-hidden"
                                >
                                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price (₹)</label>
                                      <input 
                                        type="number" 
                                        defaultValue={item.price}
                                        onBlur={(e) => updateMutation.mutate({ foodId, data: { price: parseFloat(e.target.value) } })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-xl px-4 py-2 text-xs font-bold outline-none transition-all"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stock Qty</label>
                                      <input 
                                        type="number" 
                                        defaultValue={item.stockQty}
                                        onBlur={(e) => updateMutation.mutate({ foodId, data: { stockQty: parseInt(e.target.value) } })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-xl px-4 py-2 text-xs font-bold outline-none transition-all"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                      <IconTooltip label="Automatically respond to matching bid invitations">
                                        <div className={cn(
                                          "w-8 h-8 rounded-lg flex items-center justify-center",
                                          item.autoResponseMode ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                                        )}>
                                          <Zap size={16} />
                                        </div>
                                      </IconTooltip>
                                      <div>
                                        <p className="text-[10px] font-bold leading-none">Autopilot</p>
                                        <p className="text-[10px] text-slate-400 italic">Auto-quote & Acknowledge</p>
                                      </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                      <input 
                                        type="checkbox" 
                                        checked={item.autoResponseMode} 
                                        onChange={(e) => updateMutation.mutate({ foodId, data: { autoResponseMode: e.target.checked } })}
                                        className="sr-only peer" 
                                      />
                                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                                    </label>
                                  </div>

                                  {item.autoResponseMode && (
                                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-3">
                                      <AlertCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                      <p className="text-[9px] text-emerald-600 font-medium italic leading-normal">
                                        Autopilot is active. Bids matching this item will be quoted at ₹{item.price} automatically.
                                      </p>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </SecureOverlay>
  );
}
