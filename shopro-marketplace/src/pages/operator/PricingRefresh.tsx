"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Plus, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Calculator,
  Database,
  Tag,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  X,
  PlusCircle,
  Zap,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * OP-21 — Pricing Refresh Console
 * Purpose: Merchandise payload matrix for mass price updates and yield management.
 */

interface MatrixItem {
  foodId: number;
  name: string;
  foodGroup: string;
  currentPrice: number | null;
  markupAmount: number | null;
  lastUpdated: string | null;
}

export default function PricingRefresh() {
  const [searchTerm, setSearchTerm] = useState("");
  const [markup, setMarkup] = useState("0.15");
  const [isAdding, setIsAdding] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const queryClient = useQueryClient();

  const { data: matrix = [], isLoading } = useQuery<MatrixItem[]>({
    queryKey: ["pricing-matrix"],
    queryFn: async () => {
      const resp = await api.get("/api/pricing/matrix");
      return resp.data;
    }
  });

  const reloadMutation = useMutation({
    mutationFn: async (m: string) => {
      await api.post(`/api/pricing/reload?markup=${m}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-matrix"] });
    }
  });

  const filteredMatrix = matrix.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.foodGroup && item.foodGroup.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <SecureOverlay>
      <div className="space-y-8 animate-in fade-in duration-700 pb-20">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-(--sp-border) mt-4">
          <div className="space-y-1">
            <h1 className="text-[24px] font-medium tracking-tight text-(--sp-text-0)">
               Merchandise Payload <span className="text-emerald-500 font-semibold tracking-tighter">Matrix</span>
            </h1>
            <p className="text-[13px] text-(--sp-text-2) flex items-center gap-2">
               <Database className="w-4 h-4 text-emerald-500" />
               Yield management console for mass price reconciliation.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
             <div className="flex items-center bg-(--sp-bg-2) border border-(--sp-border) rounded-sm px-3 h-9 gap-2">
                <span className="text-[11px] font-bold text-(--sp-text-3) uppercase">Markup</span>
                <input 
                  type="number" 
                  step="0.01"
                  value={markup}
                  onChange={(e) => setMarkup(e.target.value)}
                  className="w-16 bg-transparent border-none text-[13px] text-emerald-500 font-bold focus:outline-none text-center"
                />
             </div>
             <button 
                onClick={() => reloadMutation.mutate(markup)}
                disabled={reloadMutation.isPending}
                className="h-9 px-4 bg-emerald-500 text-white rounded-sm text-[13px] font-medium flex items-center gap-2 hover:opacity-90 active:scale-[0.97] transition-all shadow-sm disabled:opacity-50"
             >
                {reloadMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw size={16} />}
                Refresh Matrix
             </button>
          </div>
        </header>

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-(--sp-bg-2) border border-(--sp-border) p-6 rounded-md shadow-sm flex items-center justify-between hover:bg-(--sp-bg-3) transition-all group">
              <div className="space-y-1">
                 <div className="text-[10px] font-bold uppercase tracking-widest text-(--sp-text-3)">Active Nodes</div>
                 <div className="text-[28px] font-medium tracking-tighter text-(--sp-text-0) leading-none tabular-nums">
                    {matrix.filter(m => m.currentPrice !== null).length}
                 </div>
              </div>
              <div className="w-12 h-12 rounded-sm bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                 <Tag size={24} />
              </div>
           </div>
           
           <div className="bg-(--sp-bg-2) border border-(--sp-border) p-6 rounded-md shadow-sm flex items-center justify-between hover:bg-(--sp-bg-3) transition-all group">
              <div className="space-y-1">
                 <div className="text-[10px] font-bold uppercase tracking-widest text-(--sp-text-3)">Yield Average</div>
                 <div className="text-[28px] font-medium tracking-tighter text-emerald-500 leading-none tabular-nums">
                    {markup.startsWith('0') ? `${(parseFloat(markup) * 100).toFixed(0)}%` : `₹${markup}`}
                 </div>
              </div>
              <div className="w-12 h-12 rounded-sm bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                 <TrendingUp size={24} />
              </div>
           </div>

           <div className="bg-(--sp-bg-2) border border-(--sp-border) p-6 rounded-md shadow-sm flex items-center justify-between hover:bg-(--sp-bg-3) transition-all group">
              <div className="space-y-1">
                 <div className="text-[10px] font-bold uppercase tracking-widest text-(--sp-text-3)">Unpriced SKUs</div>
                 <div className="text-[28px] font-medium tracking-tighter text-rose-500 leading-none tabular-nums">
                    {matrix.filter(m => m.currentPrice === null).length}
                 </div>
              </div>
              <div className="w-12 h-12 rounded-sm bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                 <AlertCircle size={24} className="animate-pulse" />
              </div>
           </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="relative group w-full max-w-lg">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--sp-text-3) group-focus-within:text-emerald-500 transition-all font-bold" />
              <input 
                 type="text" 
                 placeholder="Search merchandise or group..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-9 pr-4 h-9 bg-(--sp-bg-2) border border-(--sp-border) rounded-sm text-[13px] text-(--sp-text-0) placeholder:text-(--sp-text-3) focus:border-emerald-500/50 outline-none transition-all shadow-sm" 
              />
           </div>
           
           <button 
              onClick={() => setIsAdding(true)}
              className="h-9 px-4 bg-(--sp-bg-3) text-(--sp-text-1) rounded-sm text-[12px] font-bold flex items-center gap-2 hover:bg-(--sp-bg-4) transition-all border border-(--sp-border) uppercase tracking-wider"
           >
              <PlusCircle size={16} /> Add Merchandise
           </button>
        </div>

        {/* Matrix Table */}
        <div className="bg-(--sp-bg-2) border border-(--sp-border) rounded-md shadow-sm overflow-hidden flex flex-col min-h-[500px]">
           {isLoading ? (
               <div className="flex flex-col items-center justify-center py-40 space-y-4 opacity-40">
                   <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
                   <p className="tracking-[0.08em] text-[11px] font-bold uppercase">Syncing Matrix...</p>
               </div>
           ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-(--sp-bg-1)/30 border-b border-(--sp-border)">
                    <th className="px-6 py-3 w-10">
                       <input 
                         type="checkbox" 
                         className="rounded-sm border-(--sp-border) bg-(--sp-bg-3) text-emerald-500" 
                         checked={selectedIds.length === filteredMatrix.length && filteredMatrix.length > 0}
                         onChange={(e) => {
                            if (e.target.checked) setSelectedIds(filteredMatrix.map(m => m.foodId));
                            else setSelectedIds([]);
                         }}
                       />
                    </th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-(--sp-text-3)">Merchandise</th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-(--sp-text-3)">Taxonomy</th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-(--sp-text-3)">Yield Config</th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-(--sp-text-3)">Active Price</th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-(--sp-text-3)">Recency</th>
                    <th className="px-6 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--sp-border)">
                  {filteredMatrix.map(item => (
                    <tr 
                      key={item.foodId} 
                      onClick={() => {
                        if (selectedIds.includes(item.foodId)) setSelectedIds(selectedIds.filter(id => id !== item.foodId));
                        else setSelectedIds([...selectedIds, item.foodId]);
                      }}
                      className={cn(
                        "group hover:bg-(--sp-bg-3)/50 transition-all border-l-2 cursor-pointer",
                        selectedIds.includes(item.foodId) ? "border-emerald-500 bg-emerald-500/5" : "border-transparent"
                      )}
                    >
                      <td className="px-6 py-4">
                         <input 
                           type="checkbox" 
                           checked={selectedIds.includes(item.foodId)}
                           onChange={(e) => {
                              e.stopPropagation();
                              if (e.target.checked) setSelectedIds([...selectedIds, item.foodId]);
                              else setSelectedIds(selectedIds.filter(id => id !== item.foodId));
                           }}
                           className="rounded-sm border-(--sp-border) bg-(--sp-bg-3) text-emerald-500" 
                         />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-[14px] font-medium text-(--sp-text-0)">{item.name}</div>
                          <div className="text-[10px] font-bold text-(--sp-text-3) uppercase tracking-widest font-mono">ID: #{item.foodId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-(--sp-bg-3) rounded-sm border border-(--sp-border) text-(--sp-text-3)">
                          {item.foodGroup || "DEFAULT"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp size={14} className="text-emerald-500/50" />
                          <span className="text-[13px] font-medium text-(--sp-text-1) tabular-nums">
                            {item.markupAmount ? `₹${item.markupAmount.toFixed(2)}` : "--"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={cn(
                          "text-[15px] font-bold tabular-nums tracking-tight",
                          item.currentPrice ? "text-(--sp-text-0)" : "text-rose-500 opacity-60"
                        )}>
                          {item.currentPrice ? `₹${item.currentPrice.toFixed(2)}` : "UNPRICED"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[12px] text-(--sp-text-3) tabular-nums font-medium">
                        {item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : "NEVER"}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button className="h-7 px-3 rounded-sm bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all">
                               Sync Node
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
              <div className="mt-auto px-6 py-3 border-t border-(--sp-border) bg-(--sp-bg-1)/30 flex items-center justify-between">
                 <div className="text-[11px] font-bold uppercase text-(--sp-text-3) tracking-widest flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    Propagating {filteredMatrix.length} Pricing Nodes
                 </div>
                 <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-sm border border-(--sp-border) text-(--sp-text-3) hover:text-emerald-500 transition-all flex items-center justify-center bg-(--sp-bg-2) shadow-sm"><ChevronLeft size={16} /></button>
                    <button className="h-8 px-4 rounded-sm bg-emerald-500 text-white text-[12px] font-bold shadow-sm">1</button>
                    <button className="w-8 h-8 rounded-sm border border-(--sp-border) text-(--sp-text-3) hover:text-emerald-500 transition-all flex items-center justify-center bg-(--sp-bg-2) shadow-sm"><ChevronRight size={16} /></button>
                 </div>
              </div>
           )}
        </div>

        {/* Global Matrix Alert */}
        <div className="p-6 bg-slate-900 rounded-md text-white shadow-xl overflow-hidden relative group border-l-4 border-emerald-500">
           <div className="absolute top-[-50%] right-[-10%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
           <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="flex-1 text-left space-y-2">
                 <h3 className="text-lg font-bold tracking-tight uppercase flex items-center gap-3">
                    <Zap className="text-emerald-500 animate-pulse" />
                    Yield Strategy Sync
                 </h3>
                 <p className="text-white/50 text-[13px] font-medium max-w-4xl tracking-wide">
                    Mass refresh operations will re-calculate final prices across the entire merchandise catalog based on the lowest current supplier cost and your chosen markup threshold. This operation is non-blocking.
                 </p>
              </div>
              <button 
                onClick={() => reloadMutation.mutate(markup)}
                className="shrink-0 h-9 px-6 rounded-sm bg-emerald-500 text-white font-bold uppercase tracking-[0.06em] hover:opacity-90 active:scale-[0.97] transition-all shadow-sm flex items-center gap-3 text-[12px]"
              >
                 Push Matrix Updates
              </button>
           </div>
        </div>

        {/* Simplified Add Merchandise Modal */}
        <AnimatePresence>
          {isAdding && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm">
               <motion.div 
                 initial={{ scale: 0.95, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 exit={{ scale: 0.95, opacity: 0 }}
                 className="w-full max-w-md bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-2xl overflow-hidden p-8 space-y-6"
               >
                  <div className="flex justify-between items-center border-b border-(--sp-border) pb-4">
                     <h2 className="text-[20px] font-semibold text-(--sp-text-0) uppercase tracking-tighter">Add Merchandise</h2>
                     <button onClick={() => setIsAdding(false)} className="p-1 hover:bg-(--sp-bg-1) rounded-sm transition-all text-(--sp-text-3)">
                        <X size={20} />
                     </button>
                  </div>
                  
                  <div className="space-y-4">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-(--sp-text-3)">Reference Node (Price Point)</label>
                        <select className="w-full h-10 bg-(--sp-bg-3) border border-(--sp-border) rounded-sm px-3 text-[14px] text-(--sp-text-0) outline-none focus:border-emerald-500/50">
                           <option>Select target from master catalog...</option>
                           {matrix.filter(m => m.currentPrice === null).slice(0, 10).map(m => (
                             <option key={m.foodId} value={m.foodId}>{m.name}</option>
                           ))}
                        </select>
                     </div>

                     <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-sm">
                        <p className="text-[12px] text-emerald-500/80 font-medium italic">
                           This will initialize a new entry in the marketplace price-point table for the selected master catalog item.
                        </p>
                     </div>
                  </div>

                   <div className="flex gap-4 pt-4">
                     <button 
                        onClick={() => setIsAdding(false)}
                        className="flex-1 h-10 bg-(--sp-bg-3) text-(--sp-text-1) rounded-sm text-[12px] font-bold uppercase tracking-widest hover:text-(--sp-text-0) transition-all border border-(--sp-border)"
                     >Cancel</button>
                     <button 
                        onClick={() => setIsAdding(false)}
                        className="flex-1 h-10 bg-emerald-500 text-white rounded-sm text-[12px] font-bold uppercase tracking-widest hover:opacity-90 active:scale-[0.97] transition-all shadow-md"
                     >Initialize</button>
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </SecureOverlay>
  );
}
