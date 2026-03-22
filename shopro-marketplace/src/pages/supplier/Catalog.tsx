"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { 
  Package, 
  Search, 
  Plus, 
  Filter, 
  Download, 
  ExternalLink, 
  MoreVertical,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Box,
  Layers,
  Tag,
  Eye,
  Edit2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { SecureOverlay } from "@/components/SecureOverlay";

/**
 * S-02 — Catalog Management
 * Purpose: Manage product catalog, prices, and availability for suppliers.
 */

interface SupplierProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
}

export default function Catalog() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products = [], isLoading } = useQuery<SupplierProduct[]>({
    queryKey: ["supplier-catalog-products"],
    queryFn: async () => {
      const resp = await api.get("/api/supplier/catalog/products");
      return resp.data;
    }
  });

  const { data: stats } = useQuery({
    queryKey: ["supplier-catalog-stats"],
    queryFn: async () => {
      const resp = await api.get("/api/supplier/catalog/stats");
      return resp.data;
    }
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SecureOverlay>
    <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-1000 font-black italic uppercase leading-none pb-24">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 border-b-8 border-slate-100 dark:border-slate-800 pb-12 font-black italic leading-none shadow-inner">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter italic uppercase leading-none shadow-text mt-4 text-slate-900 dark:text-white">
             Inventory <span className="text-indigo-500">Core.X</span>
          </h1>
          <p className="text-slate-500 font-black italic text-xl tracking-wide opacity-60 leading-none flex items-center gap-4">
             <Box className="w-8 h-8 text-indigo-500 animate-pulse" />
             Manage your product catalog, prices, and availability alpha.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6 font-black italic uppercase tracking-[0.4em] leading-none">
          <button className="h-20 px-10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-[2rem] text-[11px] font-black flex items-center gap-4 border-4 border-slate-50 dark:border-slate-800 hover:shadow-4xl hover:scale-105 active:scale-95 transition-all shadow-xl italic uppercase">
            <Download size={20} className="text-indigo-500" /> EXPORT_CSV.NODE
          </button>
          <button className="h-20 px-10 bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] text-[11px] font-black flex items-center gap-4 hover:scale-110 active:scale-95 transition-all shadow-4xl border-4 border-indigo-500 tracking-[0.5em] italic uppercase">
            <Plus size={24} /> ADD_SKU.FORCE
          </button>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 font-black italic uppercase leading-none">
         {[
           { label: "Total_SKUs.X", val: stats?.totalSKUs || 0, icon: Layers, color: "indigo" },
           { label: "Active_Listings.SIGN", val: stats?.activeListings || 0, icon: CheckCircle2, color: "emerald" },
           { label: "Out_of_Stock.FORCE", val: stats?.outOfStock || 0, icon: AlertCircle, color: "rose" },
           { label: "Low_Stock.NODE", val: stats?.lowStock || 0, icon: Tag, color: "amber" },
         ].map((s, i) => (
           <div key={i} className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl rounded-[3rem] border-4 border-slate-100 dark:border-slate-800 p-10 shadow-4xl flex items-center justify-between group relative overflow-hidden shadow-inner">
              <div className="space-y-4">
                 <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 opacity-60 italic leading-none">{s.label}</div>
                 <div className="text-5xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-none shadow-text tabular-nums">{s.val}</div>
              </div>
              <div className={cn("w-20 h-20 rounded-[1.5rem] flex items-center justify-center border-4 transition-all group-hover:scale-110 shadow-4xl", 
                 s.color === 'indigo' ? 'bg-indigo-600 border-indigo-400 text-white shadow-indigo-500/20' : 
                 s.color === 'emerald' ? 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/20' : 
                 s.color === 'rose' ? 'bg-rose-600 border-rose-400 text-white shadow-rose-500/20' : 
                 'bg-amber-500 border-amber-300 text-white shadow-amber-500/20')}>
                 <s.icon size={32} />
              </div>
           </div>
         ))}
      </div>

      {/* Main Catalog View */}
      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl rounded-[4rem] border-4 border-slate-100 dark:border-slate-800 shadow-4xl p-12 shadow-inner font-black italic uppercase italic leading-none">
         <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 relative z-10 gap-8 bg-slate-50/30 dark:bg-slate-950/20 p-6 rounded-[2rem] border-4 border-slate-100 dark:border-slate-800/60 shadow-text">
            <h3 className="text-3xl font-black italic flex items-center gap-6 tracking-tight">
               <Package className="w-10 h-10 text-indigo-500 animate-bounce" />
               Master Product Registry.X
            </h3>
            
            <div className="flex items-center gap-6 flex-1 max-w-2xl bg-white dark:bg-slate-950 px-8 py-5 rounded-[1.5rem] border-4 border-slate-100 dark:border-slate-800 shadow-inner">
               <Search size={24} className="text-slate-400 group-focus-within:text-indigo-500 transition-all" />
               <input 
                 type="text" 
                 placeholder="SEARCH_SKU_REGISTRY.X..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="bg-transparent border-none outline-none text-[11px] w-full tracking-[0.4em] font-black italic uppercase text-slate-900 dark:text-white" 
               />
               <button className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-900 transition-all border-4 border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                  <Filter size={20} />
               </button>
            </div>
         </div>

         <div className="overflow-x-auto relative z-10 min-h-[500px]">
            {isLoading ? (
                <div className="p-40 text-center flex flex-col items-center justify-center space-y-12 opacity-40">
                    <RefreshCw className="w-20 h-20 text-indigo-500 animate-spin" />
                    <p className="tracking-[0.6em] text-[12px] font-black italic uppercase">SYNCHRONIZING_CATALOG_NODES.X...</p>
                </div>
            ) : (
              <table className="w-full">
                  <thead>
                      <tr className="border-b-8 border-slate-50 dark:border-slate-800/60 uppercase">
                        <th className="text-left py-8 px-6 text-[10px] font-black text-slate-400 tracking-[0.5em] italic opacity-60">SKU_ID.NODE</th>
                        <th className="text-left py-8 px-6 text-[10px] font-black text-slate-400 tracking-[0.5em] italic opacity-60">PRODUCT_IDENTITY.X</th>
                        <th className="text-left py-8 px-6 text-[10px] font-black text-slate-400 tracking-[0.5em] italic opacity-60">UNIT_PRICE.SIGN</th>
                        <th className="text-left py-8 px-6 text-[10px] font-black text-slate-400 tracking-[0.5em] italic opacity-60">STOCK_QUOTA.FLUX</th>
                        <th className="text-right py-8 px-6 text-[10px] font-black text-slate-400 tracking-[0.5em] italic opacity-60">ACTIONS.FORCE</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                      {filteredProducts.map(p => (
                      <tr key={p.id} className="group/row hover:bg-white dark:hover:bg-slate-950/50 transition-all cursor-crosshair">
                          <td className="py-8 px-6 text-[11px] font-black text-slate-500 dark:text-slate-400 italic tabular-nums tracking-widest">{p.id}</td>
                          <td className="py-8 px-6">
                              <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[1.2rem] bg-indigo-600 text-white flex items-center justify-center font-black italic text-sm shadow-4xl border-4 border-indigo-400 transition-all group-hover/row:scale-110">
                                    {p.name.substring(0, 1).toUpperCase()}
                                </div>
                                <div className="space-y-2">
                                    <div className="text-xl font-black italic uppercase shadow-text text-slate-900 dark:text-white group-hover/row:text-indigo-500 transition-colors tracking-tight">{p.name}</div>
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1 border-2 border-slate-100 dark:border-slate-800 px-2 py-0.5 rounded-lg w-fit italic opacity-60 shadow-inner">{p.category}</div>
                                </div>
                              </div>
                          </td>
                          <td className="py-8 px-6 text-2xl font-black italic tracking-tighter tabular-nums shadow-text text-slate-900 dark:text-white uppercase leading-none">₹{p.price.toLocaleString()}</td>
                          <td className="py-8 px-6">
                              <div className="space-y-4 w-40">
                                 <div className="flex justify-between text-[9px] font-black italic opacity-60 tracking-widest">
                                    <span>{p.stock}_UNITS</span>
                                    <span>{p.status}</span>
                                 </div>
                                 <div className="h-4 w-full bg-slate-100 dark:bg-slate-950 rounded-full border-2 border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${Math.min((p.stock / 500) * 100, 100)}%` }}
                                      className={cn("h-full shadow-4xl", 
                                         p.status === 'IN_STOCK' ? 'bg-emerald-500' : 
                                         p.status === 'LOW_STOCK' ? 'bg-amber-500' : 'bg-rose-600')}
                                    />
                                 </div>
                              </div>
                          </td>
                          <td className="py-8 px-6">
                              <div className="flex justify-end gap-4 font-black italic uppercase leading-none opacity-0 group-hover/row:opacity-100 transition-opacity">
                                <button className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-xl border-4 border-slate-50 dark:border-slate-700 flex items-center justify-center active:scale-95"><Eye size={24} /></button>
                                <button className="w-14 h-14 rounded-2xl bg-slate-950 dark:bg-white text-white dark:text-slate-900 transition-all shadow-4xl border-4 border-indigo-500 flex items-center justify-center hover:scale-110 active:scale-95"><Edit2 size={24} /></button>
                              </div>
                          </td>
                      </tr>
                      ))}
                  </tbody>
              </table>
            )}
         </div>

         <div className="mt-12 pt-12 border-t-8 border-slate-100 dark:border-slate-800/60 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10 leading-none font-black italic italic uppercase">
            <div className="text-[11px] text-slate-400 font-black tracking-[0.4em] uppercase italic opacity-60">SHOWING_{filteredProducts.length}_OF_{products.length}_ENTRIES.X</div>
            <div className="flex items-center gap-4">
               <button className="w-14 h-14 rounded-2xl border-4 border-slate-100 dark:border-slate-800 text-slate-300 hover:text-slate-900 transition-all flex items-center justify-center active:scale-95 shadow-xl"><ChevronLeft size={24} /></button>
               <div className="flex items-center gap-4">
                  {[1].map(p => (
                    <button key={p} className={cn("w-14 h-14 rounded-2xl text-xs font-black italic transition-all border-4 shadow-4xl", p === 1 ? "bg-slate-950 text-white border-indigo-500 shadow-indigo-500/20 dark:bg-white dark:text-slate-900" : "text-slate-400 hover:text-slate-900 border-transparent")}>{p}</button>
                  ))}
               </div>
               <button className="w-14 h-14 rounded-2xl border-4 border-slate-100 dark:border-slate-800 text-slate-300 hover:text-slate-900 transition-all flex items-center justify-center active:scale-95 shadow-xl"><ChevronRight size={24} /></button>
            </div>
         </div>
      </div>
    </div>
    </SecureOverlay>
  );
}
