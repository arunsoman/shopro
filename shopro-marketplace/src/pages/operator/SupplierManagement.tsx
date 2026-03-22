"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Plus, Truck, ShieldCheck, AlertCircle, ArrowUpRight, Star, ExternalLink, Briefcase, AlertTriangle, RefreshCw, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * OP-11 — Supplier Management
 * Purpose: Advanced vendor lifecycle management.
 * DNA: Performance-weighted cards, category filters, quick-stats.
 */

interface Supplier {
  id: string;
  name: string;
  category: string;
  rating: number;
  status: string;
}

export default function SupplierManagement() {
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: suppliers = [], isLoading } = useQuery<Supplier[]>({
    queryKey: ["operator-suppliers-management"],
    queryFn: async () => {
      const resp = await api.get("/operator/relationships/suppliers");
      return resp.data;
    }
  });

  const filteredSuppliers = suppliers.filter(sup => {
      if (filter === 'all') return true;
      return sup.category.toLowerCase().includes(filter.toLowerCase());
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return api.patch(`/operator/suppliers/${id}/status?status=${status}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operator-suppliers-management"] });
    }
  });

  return (
    <SecureOverlay>
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-(--sp-border)">
        <div className="space-y-1">
          <h1 className="text-[28px] font-medium tracking-[-0.02em] text-(--sp-text-0)">Supply nodes</h1>
          <p className="text-[13px] text-(--sp-text-2) flex items-center gap-2">
             <Truck className="w-4 h-4 text-(--sp-cyan)" />
             Vendor ecosystem management and performance audits.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] text-[13px] font-medium bg-(--sp-bg-2) text-(--sp-text-1) border border-(--sp-border) hover:border-(--sp-border-hover) hover:bg-(--sp-bg-3) transition-all duration-150 shadow-sm active:scale-[0.97]">
              <ShieldCheck className="w-4 h-4 text-(--sp-teal)" />
              Compliance matrix
           </button>
           <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] text-[13px] font-medium bg-(--sp-cyan) text-(--sp-bg-0) border border-(--sp-cyan) hover:opacity-90 active:scale-[0.97] transition-all duration-150 shadow-sm">
              <Plus size={18} /> Onboard node
           </button>
        </div>
      </header>

      {/* Supplier Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
         {[
           { label: "Active vendors", val: "102", change: "+4 nodes", icon: Truck, color: "text-(--sp-cyan)" },
           { label: "Avg fulfillment", val: "98.2%", change: "Hub aggregate", icon: Star, color: "text-(--sp-amber)" },
           { label: "Total volume", val: "₹1.4M", change: "Current cycle", icon: Briefcase, color: "text-(--sp-cyan)" },
           { label: "Alerts point", val: "12", change: "Unresolved X", icon: AlertCircle, color: "text-(--sp-coral)" },
         ].map((stat, i) => (
           <div key={i} className="bg-(--sp-bg-2) border border-(--sp-border) rounded-[10px] p-5 relative overflow-hidden hover:border-(--sp-border-hover) hover:bg-(--sp-bg-3) transition-colors duration-150 shadow-sm group">
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-current opacity-70 transition-colors" style={{ color: `var(--sp-${stat.color.includes('cyan') ? 'cyan' : stat.color.includes('amber') ? 'amber' : 'coral'})` }} />
              <div className="flex flex-col">
                 <div className="text-[11px] font-bold tracking-wider text-(--sp-text-3) mb-2.5">{stat.label}</div>
                 <div className="text-[32px] font-light tracking-[-0.03em] text-(--sp-text-0) tabular-nums leading-none mb-1.5">{stat.val}</div>
                 <div className={cn("text-[11px] font-[family-name:var(--font-geist-mono)]", stat.color.replace('text-', 'text-'))}>{stat.change}</div>
              </div>
           </div>
         ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
         <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {["All", "Fruits & Veggies", "Dairy", "Meat", "Grains", "Seafood"].map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={cn(
                  "px-4 py-2 rounded-[6px] text-[12px] font-medium transition-all shadow-sm border",
                  filter === t
                    ? "bg-(--sp-cyan-dim) text-(--sp-cyan) border-(--sp-cyan-border)"
                    : "bg-(--sp-bg-2) text-(--sp-text-1) border-(--sp-border) hover:text-(--sp-text-0)"
                )}
              >
                 {t}
              </button>
            ))}
         </div>
         <div className="relative group w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--sp-text-2) group-focus-within:text-(--sp-cyan) transition-colors" />
            <input
              type="text"
              placeholder="Search vendors..."
              className="w-full pl-10 pr-4 h-10 bg-(--sp-bg-1) border border-(--sp-border) rounded-[6px] text-[13px] text-(--sp-text-0) placeholder:text-(--sp-text-2) focus:border-(--sp-cyan-border) outline-none transition-all shadow-sm"
            />
         </div>
      </div>

      {/* Vendor Table */}
      <div className="bg-(--sp-bg-2) border border-(--sp-border) rounded-[10px] overflow-hidden shadow-sm">
         {isLoading ? (
             <div className="flex flex-col items-center justify-center py-40 space-y-4 opacity-40">
                 <RefreshCw className="w-10 h-10 text-(--sp-cyan) animate-spin" />
                 <p className="text-(--sp-text-2) tracking-[0.06em] text-[11px] font-medium uppercase">Analyzing supply nodes...</p>
             </div>
         ) : (
           <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="border-b border-(--sp-border) bg-(--sp-bg-1)/50">
                  <th className="px-6 py-4 text-[11px] font-bold text-(--sp-text-3) uppercase tracking-wider">Vendor node</th>
                    <th className="px-6 py-4 text-[11px] font-medium uppercase tracking-[0.06em] text-(--sp-text-2)">Category</th>
                    <th className="px-6 py-4 text-[11px] font-medium uppercase tracking-[0.06em] text-(--sp-text-2)">Fulfillment alpha</th>
                    <th className="px-6 py-4 text-[11px] font-medium uppercase tracking-[0.06em] text-(--sp-text-2)">Trust matrix</th>
                    <th className="px-6 py-4 text-[11px] font-medium uppercase tracking-[0.06em] text-(--sp-text-2) text-right">Status</th>
                    <th className="px-6 py-4"></th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-(--sp-border)">
                  {filteredSuppliers.map(sup => (
                   <tr key={sup.id} className="group/tr hover:bg-(--sp-bg-1)/50 transition-all cursor-pointer">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-[6px] bg-(--sp-bg-1) flex items-center justify-center text-(--sp-cyan) font-medium text-[16px] border border-(--sp-border)">
                               {sup.name.substring(0, 1)}
                            </div>
                            <div className="flex flex-col">
                               <div className="text-[14px] font-medium text-(--sp-text-0)">{sup.name}</div>
                               <div className="text-[11px] text-(--sp-text-2) font-[family-name:var(--font-geist-mono)]">{sup.id.split('-')[0]}</div>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className="text-[12px] text-(--sp-text-1) px-2.5 py-1 bg-(--sp-bg-1) rounded-[6px] border border-(--sp-border)">{sup.category}</span>
                      </td>
                      <td className="px-6 py-4">
                         <div className="space-y-1.5 w-32">
                            <div className="flex justify-between text-[11px] font-medium">
                               <span className="text-(--sp-text-3)">Payload</span>
                               <span className="text-(--sp-text-0)">98%</span>
                            </div>
                            <div className="h-1.5 bg-(--sp-bg-1) rounded-full overflow-hidden border border-(--sp-border)">
                               <motion.div initial={{ width: 0 }} animate={{ width: `98%` }} className="h-full bg-(--sp-cyan) rounded-full shadow-[0_0_8px_rgba(34,211,238,0.3)]" />
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                            <div className={cn("text-[16px] font-medium tabular-nums", sup.rating > 4 ? "text-(--sp-teal)" : "text-(--sp-amber)")}>{sup.rating * 20}%</div>
                            <ShieldCheck className={cn("w-4 h-4", sup.rating > 4 ? "text-(--sp-teal)" : "text-(--sp-amber)")} />
                         </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <StatusBadge status={sup.status === 'Verified' ? 'VERIFIED' : 'PENDING'} />
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end gap-2 opacity-0 group-hover/tr:opacity-100 transition-all">
                            <button className="p-2 rounded-[6px] bg-(--sp-bg-1) text-(--sp-text-2) hover:text-(--sp-text-0) transition-all border border-(--sp-border) shadow-sm">
                               <ExternalLink size={16} />
                            </button>
                            <button className="px-3 py-1.5 rounded-[6px] bg-(--sp-coral-dim) text-(--sp-coral) border border-(--sp-coral-border) text-[11px] font-medium uppercase tracking-[0.06em] shadow-sm hover:bg-(--sp-coral-dim)/80 transition-all">
                                Suspend
                            </button>
                         </div>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
           </div>
          )}
      </div>

      {/* Global Action Banner */}
      <div className="bg-(--sp-bg-4) border border-(--sp-border) rounded-[10px] px-8 py-10 flex items-center gap-8 shadow-sm overflow-hidden relative group">
         <div className="absolute top-[-50%] right-[-10%] w-[400px] h-[400px] bg-(--sp-cyan) opacity-5 rounded-full blur-[80px] pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
         <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-8 relative z-10">
            <div className="flex-1 space-y-1">
               <h3 className="text-[15px] font-medium text-(--sp-text-0)">Integrity pattern audit: active signal</h3>
               <p className="text-[12px] text-(--sp-text-2) max-w-2xl leading-relaxed">
                  AI is currently auditing fulfillment patterns across all regional hub nodes alpha. merchants with less than 90% accuracy index will be throttled.
               </p>
            </div>
            <button className="shrink-0 px-4 py-2 rounded-[6px] bg-(--sp-cyan) text-(--sp-bg-0) text-[11px] font-medium uppercase tracking-[0.06em] shadow-md hover:opacity-90 active:scale-95 transition-all border border-(--sp-cyan)">
               Generate global manifest
            </button>
         </div>
      </div>
    </div>
    </SecureOverlay>
  );
}
