"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  ArrowLeft, 
  TrendingDown, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Package, 
  BarChart3, 
  ExternalLink,
  ChevronRight,
  Filter,
  RefreshCw,
  Star,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";
import { cn } from "@/lib/utils";

/**
 * OP-18 — Price Comparison Hub
 * Purpose: Manual comparison of vendor offers for a specific merchandise node.
 * DNA: High-signal matrix, trust vs price toggles, deep-link to sourcing.
 */

interface FoodOffer {
  supplierId: string;
  supplierName: string;
  trustScore: number;
  fulfillmentRate: number;
  price: number;
  stockQty: number;
}

interface FoodItem {
  id: string;
  name: string;
  foodGroup: string;
}

export default function PriceComparison() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  // 1. Fetch Food Items for Autocomplete
  const { data: foodList, isLoading: isSearchLoading } = useQuery<FoodItem[]>({
    queryKey: ["operator-food-briefs"],
    queryFn: async () => {
      const resp = await api.get("/operator/catalog/foods/brief");
      return resp.data;
    }
  });

  // 2. Fetch Offers for Selected Food
  const { data: offers, isLoading: isOffersLoading, refetch: refetchOffers } = useQuery<FoodOffer[]>({
    queryKey: ["operator-price-comparison", selectedFood?.id],
    queryFn: async () => {
      if (!selectedFood) return [];
      const resp = await api.get(`/operator/catalog/foods/${selectedFood.id}/offers`);
      return resp.data;
    },
    enabled: !!selectedFood
  });

  const filteredItems = useMemo(() => {
    if (!searchTerm || selectedFood) return [];
    return foodList?.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5) || [];
  }, [foodList, searchTerm, selectedFood]);

  const cheapest = useMemo(() => {
    if (!offers || offers.length === 0) return null;
    return [...offers].sort((a, b) => a.price - b.price)[0];
  }, [offers]);

  const mostTrusted = useMemo(() => {
    if (!offers || offers.length === 0) return null;
    return [...offers].sort((a, b) => b.trustScore - a.trustScore)[0];
  }, [offers]);

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setSearchTerm(food.name);
  };

  const clearSearch = () => {
    setSelectedFood(null);
    setSearchTerm("");
  };

  return (
    <SecureOverlay>
      <div className="max-w-[1280px] mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-(--sp-border) mt-4">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-(--sp-cyan)/10 rounded-md text-(--sp-cyan) border border-(--sp-cyan)/20 flex items-center justify-center shadow-sm">
                  <BarChart3 size={20} />
                </div>
                <div className="space-y-0.5">
                   <h1 className="text-[24px] font-medium tracking-tight text-(--sp-text-0)">Price Comparison Hub</h1>
                   <p className="text-[12px] text-(--sp-text-3) font-bold uppercase tracking-widest opacity-60">Manual Sourcing & Benchmarking</p>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="relative w-full lg:w-[400px] group">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--sp-text-3) transition-colors group-focus-within:text-(--sp-cyan)" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (selectedFood) setSelectedFood(null);
                  }}
                  placeholder="Input food name to compare vendors..."
                  className="w-full h-10 pl-10 pr-4 bg-(--sp-bg-1) border border-(--sp-border) rounded-md text-[14px] text-(--sp-text-0) placeholder:text-(--sp-text-3) focus:ring-1 focus:ring-(--sp-cyan) outline-none transition-all"
                />
                
                <AnimatePresence>
                  {filteredItems.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-12 left-0 right-0 bg-(--sp-bg-2) border border-(--sp-border) rounded-md shadow-2xl z-50 overflow-hidden"
                    >
                       {filteredItems.map(item => (
                         <button 
                           key={item.id}
                           onClick={() => handleSelectFood(item)}
                           className="w-full px-4 py-3 text-left hover:bg-(--sp-bg-3) transition-all flex items-center justify-between group"
                         >
                            <span className="text-[14px] font-medium text-(--sp-text-1) group-hover:text-(--sp-text-0)">{item.name}</span>
                            <ChevronRight size={14} className="text-(--sp-text-3) opacity-0 group-hover:opacity-100 transition-all" />
                         </button>
                       ))}
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
             {selectedFood && (
               <button onClick={clearSearch} className="h-10 px-4 bg-(--sp-bg-3) text-(--sp-text-2) hover:text-rose-500 rounded-md text-[12px] font-bold uppercase tracking-wider border border-(--sp-border) transition-all">
                 Reset
               </button>
             )}
          </div>
        </header>

        {!selectedFood ? (
          <div className="py-40 flex flex-col items-center justify-center space-y-6 opacity-30 select-none">
             <div className="w-20 h-20 bg-(--sp-bg-2) rounded-lg flex items-center justify-center border border-(--sp-border) shadow-inner">
                <Search size={40} />
             </div>
             <p className="text-[14px] font-bold uppercase tracking-[0.2em] text-center">Search for a merit node to begin verification</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
             {/* Stats Preview */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-sm space-y-4">
                   <div className="flex items-center gap-3 text-emerald-500">
                      <TrendingDown size={20} />
                      <span className="text-[11px] font-bold uppercase tracking-widest">Financial Optimum</span>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[32px] font-bold tabular-nums tracking-tighter">₹{cheapest?.price.toLocaleString() || "---"}</p>
                      <p className="text-[12px] text-(--sp-text-3) font-medium italic">{cheapest?.supplierName || "No offers found"}</p>
                   </div>
                </div>
                
                <div className="p-6 bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-sm space-y-4">
                   <div className="flex items-center gap-3 text-violet-500">
                      <ShieldCheck size={20} />
                      <span className="text-[11px] font-bold uppercase tracking-widest">Trust Integrity</span>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[32px] font-bold tabular-nums tracking-tighter">{mostTrusted?.trustScore || "0"}%</p>
                      <p className="text-[12px] text-(--sp-text-3) font-medium italic">{mostTrusted?.supplierName || "---"}</p>
                   </div>
                </div>

                <div className="p-6 bg-slate-900 rounded-md shadow-xl border-l border-emerald-500 flex flex-col justify-center gap-1">
                   <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Market Status</p>
                   <p className="text-[20px] font-semibold text-white tracking-tight">
                     {offers?.length || 0} active signals captured
                   </p>
                   {isOffersLoading && <RefreshCw className="w-4 h-4 text-white/40 animate-spin mt-2" />}
                </div>
             </div>

             {/* Main Matrix */}
             <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-md overflow-hidden">
                <div className="p-6 border-b border-(--sp-border) bg-(--sp-bg-1)/30 flex items-center justify-between">
                   <h2 className="text-[14px] font-bold uppercase tracking-wider text-(--sp-text-0)">Supplier Comparison Matrix</h2>
                   <button onClick={() => refetchOffers()} className="p-2 text-(--sp-text-3) hover:text-(--sp-cyan) transition-all">
                      <RefreshCw size={16} className={cn(isOffersLoading && "animate-spin")} />
                   </button>
                </div>
                
                {isOffersLoading ? (
                  <div className="py-40 flex flex-col items-center justify-center space-y-4 opacity-40">
                     <RefreshCw className="w-10 h-10 text-(--sp-cyan) animate-spin" />
                     <p className="text-[11px] font-bold uppercase tracking-widest">Collecting vendor telemetry...</p>
                  </div>
                ) : offers?.length === 0 ? (
                  <div className="py-40 flex flex-col items-center justify-center space-y-4 text-rose-500 opacity-60">
                     <AlertCircle size={40} />
                     <p className="text-[11px] font-bold uppercase tracking-widest">No active offers available for this node</p>
                  </div>
                ) : (
                  <table className="w-full text-left tabular-nums">
                    <thead>
                      <tr className="border-b border-(--sp-border) text-[10px] font-bold text-(--sp-text-3) uppercase tracking-widest">
                        <th className="px-8 py-4">Vendor Node</th>
                        <th className="px-8 py-4">Integrity Score</th>
                        <th className="px-8 py-4">Fulfillment rate</th>
                        <th className="px-8 py-4">Quote (Unit)</th>
                        <th className="px-8 py-4">Stock Avail.</th>
                        <th className="px-8 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-(--sp-border)/50">
                      {offers?.map(offer => (
                        <tr key={offer.supplierId} className="group hover:bg-(--sp-bg-3)/50 transition-all">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded bg-(--sp-bg-1) border border-(--sp-border) flex items-center justify-center font-bold text-(--sp-cyan) uppercase">
                                  {offer.supplierName.charAt(0)}
                               </div>
                               <div>
                                 <p className="text-[14px] font-bold text-(--sp-text-0) tracking-tight uppercase">{offer.supplierName}</p>
                                 <p className="text-[10px] text-(--sp-text-3) font-semibold uppercase tracking-widest">Cluster Signal Alpha</p>
                               </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2">
                                <Star size={14} className="text-amber-500 fill-amber-500" />
                                <span className={cn(
                                  "text-[14px] font-bold",
                                  offer.trustScore >= 90 ? "text-emerald-500" : offer.trustScore >= 70 ? "text-amber-500" : "text-rose-500"
                                )}>{offer.trustScore}%</span>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-[13px] font-medium text-(--sp-text-1)">
                             {offer.fulfillmentRate}%
                          </td>
                          <td className="px-8 py-6">
                             <div className="space-y-0.5">
                                <p className="text-[16px] font-bold text-(--sp-text-0)">₹{offer.price.toLocaleString()}</p>
                                {offer.price === cheapest?.price && (
                                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Lowest Market Price</span>
                                )}
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className={cn(
                               "text-[11px] font-bold px-3 py-1 rounded border shadow-sm uppercase tracking-wider",
                               offer.stockQty > 100 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                             )}>
                               {offer.stockQty > 100 ? "High Stock" : `${offer.stockQty} Units`}
                             </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <button className="h-8 px-4 bg-slate-900 text-white rounded-[4px] text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md opacity-0 group-hover:opacity-100">
                                Initiate Source
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
             </div>
          </div>
        )}
      </div>
    </SecureOverlay>
  );
}
