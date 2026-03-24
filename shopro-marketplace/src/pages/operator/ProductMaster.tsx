"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Package, Tag, Layers, CheckCircle2, AlertCircle, Eye, Box, Truck, Filter, Upload, RefreshCw, ChevronLeft, ChevronRight, ArrowUpRight, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * OP-18 — Product Master Detail/Management
 * Purpose: Master record of all marketplace merchandise and SKU nodes.
 */

interface FoodMasterItem {
  id: string;
  name: string;
  scientificName: string;
  foodGroup: string;
  foodSubgroup: string;
  description: string;
}

export default function ProductMaster() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 15;

  const { data, isLoading } = useQuery({
    queryKey: ["operator-food-master", page, searchTerm],
    queryFn: async () => {
      const resp = await api.get(`operator/catalog/foods?page=${page}&size=${pageSize}${searchTerm ? `&search=${searchTerm}` : ""}`);
      return resp.data;
    }
  });

  const foods = (data?.content as FoodMasterItem[]) || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentPage = data?.currentPage || 0;

  // Search is now server-side, but we keep this for map-safety
  const filteredFoods = foods;

  return (
    <SecureOverlay>
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-(--sp-border) mt-4">
        <div className="space-y-1">
          <h1 className="text-[24px] font-medium tracking-tight text-(--sp-text-0)">
             Master Material Registry
          </h1>
          <p className="text-[13px] text-(--sp-text-2) flex items-center gap-2">
             <Box className="w-4 h-4 text-emerald-500" />
             Master record of all food materials and master SKU nodes.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
           <button className="h-9 px-4 bg-(--sp-bg-3) text-(--sp-text-1) rounded-sm text-[13px] font-medium flex items-center gap-2 hover:text-(--sp-text-0) transition-all border border-(--sp-border) shadow-sm uppercase tracking-[0.04em]">
            <Upload size={16} /> Bulk Inject
           </button>
           <button className="h-9 px-4 bg-emerald-500 text-white rounded-sm text-[13px] font-medium flex items-center gap-2 hover:opacity-90 active:scale-[0.97] transition-all shadow-sm">
            <Plus size={16} /> Master Sync
           </button>
        </div>
      </header>

      {/* Catalog Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {[
           { label: "Active Nodes", val: String(totalElements), change: "+12 Flux", icon: Package, color: "emerald" },
           { label: "Taxonomy Groups", val: String(new Set(foods.map((f: FoodMasterItem) => f.foodGroup)).size), change: "Global Hierarchy", icon: Layers, color: "blue" },
           { label: "Incomplete Docs", val: String(foods.filter((f: FoodMasterItem) => !f.description).length), change: "Action Required", icon: AlertCircle, color: "rose" },
           { label: "Indexing Health", val: "100%", change: "Sync Valid", icon: CheckCircle2, color: "emerald" },
         ].map((stat, i) => (
           <div key={i} className="bg-(--sp-bg-2) border border-(--sp-border) p-4 rounded-md flex items-center justify-between shadow-sm hover:border-emerald-500/20 hover:bg-(--sp-bg-3) transition-all">
              <div className="space-y-1">
                 <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-(--sp-text-3)">{stat.label}</div>
                 <div className="text-[24px] font-medium tracking-tight text-(--sp-text-0) tabular-nums leading-none">{stat.val}</div>
                 <div className={cn("text-[9px] font-bold uppercase mt-2 tracking-[0.06em] border rounded-[4px] px-2 py-0.5 inline-block", stat.color === 'rose' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20')}>
                   {stat.change}
                 </div>
              </div>
              <div className={cn("w-10 h-10 rounded-sm flex items-center justify-center border transition-all", 
                 stat.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 
                 stat.color === 'rose' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 
                 'bg-blue-500/10 border-blue-500/20 text-blue-500'
              )}>
                 <stat.icon size={20} />
              </div>
           </div>
         ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="relative group w-full max-w-2xl">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--sp-text-3) group-focus-within:text-emerald-500 transition-all font-bold" />
            <input 
               type="text" 
               placeholder="Search SKU or label..." 
               value={searchTerm}
               onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
               className="w-full pl-9 pr-4 h-9 bg-(--sp-bg-2) border border-(--sp-border) rounded-sm text-[13px] text-(--sp-text-0) placeholder:text-(--sp-text-3) focus:border-emerald-500/50 transition-all shadow-sm outline-none" 
            />
         </div>
         
         <div className="bg-(--sp-bg-2) p-1 rounded-sm border border-(--sp-border) shadow-sm flex items-center gap-1">
            {["GRID", "TABLE"].map(m => (
              <button key={m} className={cn("h-7 px-4 rounded-[4px] text-[11px] font-bold uppercase tracking-[0.06em] transition-all", m === "TABLE" ? "bg-emerald-500 text-white shadow-sm" : "text-(--sp-text-3) hover:text-(--sp-text-0)")}>
                 {m}
              </button>
            ))}
         </div>
      </div>

      {/* Master Data Grid */}
      <div className="bg-(--sp-bg-2) border border-(--sp-border) rounded-md shadow-sm overflow-hidden flex flex-col min-h-[600px]">
         {isLoading ? (
             <div className="flex flex-col items-center justify-center py-40 space-y-4 opacity-40">
                 <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
                 <p className="tracking-[0.08em] text-[11px] font-bold uppercase">Synchronizing Repository...</p>
             </div>
         ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead>
                <tr className="bg-(--sp-bg-1)/30 border-b border-(--sp-border)">
                   <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-(--sp-text-3)">Material</th>
                   <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-(--sp-text-3)">Group</th>
                   <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-(--sp-text-3)">Sub Group Type</th>
                   <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-(--sp-text-3)">Validation</th>
                   <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-(--sp-text-3) text-right">Integrity</th>
                   <th className="px-6 py-3"></th>
                </tr>
             </thead>
             <tbody className="divide-y divide-(--sp-border)">
                {filteredFoods.map((food: FoodMasterItem) => (
                  <tr key={food.id} className="group hover:bg-(--sp-bg-3) transition-all cursor-pointer">
                     <td className="px-6 py-3">
                        <div className="flex items-center gap-4">
                           <div className="relative">
                              <div className="w-10 h-10 rounded-sm bg-emerald-500 text-white flex items-center justify-center font-bold text-xl shadow-sm overflow-hidden group-hover:scale-105 transition-all">
                                  {food.name.substring(0, 1)}
                              </div>
                           </div>
                           <div className="flex flex-col">
                              <div className="text-[14px] font-medium text-(--sp-text-0)">{food.name}</div>
                              <div className="text-[10px] font-medium text-(--sp-text-3) uppercase tracking-widest font-mono">{food.scientificName || "NO-GENUS"}</div>
                           </div>
                        </div>
                     </td>
                     <td className="px-6 py-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-emerald-500/5 rounded-[4px] border border-emerald-500/10 flex items-center gap-1.5 w-fit text-emerald-500">
                           <Tag size={12} />
                           {food.foodGroup}
                        </span>
                     </td>
                     <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-bold text-emerald-500 tracking-wider uppercase">{food.foodSubgroup || "Root Node"}</span>
                        </div>
                     </td>
                     <td className="px-6 py-3">
                        <div className="text-[12px] font-medium text-(--sp-text-2) max-w-[200px] truncate">
                           {food.description || <span className="text-(--sp-red) opacity-60 italic">NO-METADATA</span>}
                        </div>
                     </td>
                     <td className="px-6 py-3 text-right">
                        <div className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-[0.06em] border shadow-sm leading-none",
                          'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        )}>
                           Synchronized
                        </div>
                     </td>
                     <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                           <button className="w-8 h-8 rounded-sm bg-(--sp-bg-3) text-(--sp-text-3) hover:text-emerald-500 transition-all flex items-center justify-center shadow-sm border border-(--sp-border)"><IconTooltip label="Preview Node"><Eye size={14} /></IconTooltip></button>
                           <button className="h-8 px-4 rounded-sm bg-emerald-500 text-white text-[11px] font-bold uppercase tracking-[0.04em] shadow-sm hover:opacity-90 active:scale-95 transition-all">
                                Manage Node
                           </button>
                        </div>
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
          </div>
         )}

          {!isLoading && (
             <div className="px-6 py-3 flex flex-col md:flex-row md:items-center justify-between border-t border-(--sp-border) bg-(--sp-bg-1)/30">
                <div className="text-[11px] font-bold uppercase text-(--sp-text-3) tracking-widest">
                   Displaying {foods.length} of {totalElements} Metadata Nodes
                </div>
                <div className="flex items-center gap-2">
                   <button 
                     onClick={() => setPage(Math.max(0, page - 1))}
                     disabled={page === 0}
                     className="w-8 h-8 rounded-sm border border-(--sp-border) text-(--sp-text-3) hover:text-emerald-500 disabled:opacity-30 disabled:hover:text-(--sp-text-3) transition-all flex items-center justify-center bg-(--sp-bg-2) shadow-sm"
                   >
                     <ChevronLeft size={16} />
                   </button>
                   <div className="h-8 px-4 rounded-sm bg-emerald-500 text-white text-[12px] font-bold shadow-sm flex items-center justify-center">
                     {page + 1} / {totalPages || 1}
                   </div>
                   <button 
                     onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                     disabled={page >= totalPages - 1}
                     className="w-8 h-8 rounded-sm border border-(--sp-border) text-(--sp-text-3) hover:text-emerald-500 disabled:opacity-30 disabled:hover:text-(--sp-text-3) transition-all flex items-center justify-center bg-(--sp-bg-2) shadow-sm"
                   >
                     <ChevronRight size={16} />
                   </button>
                </div>
             </div>
          )}
      </div>

      {/* Global Catalog Alert */}
      <div className="p-6 bg-emerald-500 rounded-md text-white shadow-xl overflow-hidden relative group">
         <div className="absolute top-[-50%] right-[-10%] w-[400px] h-[400px] bg-white/5 rounded-full blur-[80px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="flex-1 text-left space-y-2">
               <h3 className="text-xl font-bold tracking-tight uppercase">Registry Node: UAE-01 Delay</h3>
               <p className="text-white/70 text-[13px] font-medium max-w-4xl tracking-wide">
                  Global SKU synchronization with Regional Hub (UAE-01) is experiencing latency. High-volume pricing updates may be delayed until reconciliation is complete.
               </p>
            </div>
            <button className="shrink-0 h-9 px-6 rounded-sm bg-white text-emerald-500 font-bold uppercase tracking-[0.06em] hover:opacity-90 active:scale-[0.97] transition-all shadow-sm flex items-center gap-3 text-[12px]">
               Re-Index Global Nodes
            </button>
         </div>
      </div>
    </div>
    </SecureOverlay>
  );
}
