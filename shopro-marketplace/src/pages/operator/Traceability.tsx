"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "@/api";
import { 
  Search, 
  ShieldCheck, 
  Clock, 
  History, 
  ChevronRight,
  RefreshCw,
  Box,
  LayoutGrid,
  List
} from "lucide-react";
import { SecureOverlay } from "@/components/SecureOverlay";
import { StatusBadge } from "@/components/ui/status-badge";

/**
 * OP-30 — Global Traceability
 * Purpose: High-level overview of order provenance and audit status.
 */

interface TraceableOrder {
  id: string;
  referenceNumber: string;
  restaurantName: string;
  totalAmount: number;
  status: string;
  deliveryDate: string;
  auditTrailCount?: number;
  fulfillmentScore: number;
}

interface TraceabilityStats {
  totalLogs: number;
  activeNodes: number;
  integrityScore: string;
}

export default function Traceability() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery<TraceabilityStats>({
    queryKey: ["traceability-stats"],
    queryFn: async () => {
      const resp = await api.get("operator/orders/traceability/stats");
      return resp.data;
    }
  });

  const { data: orders = [], isLoading } = useQuery<TraceableOrder[]>({
    queryKey: ["traceable-orders"],
    queryFn: async () => {
      const resp = await api.get("operator/orders");
      return resp.data;
    }
  });

  const filteredOrders = useMemo(() => {
    return orders.filter(order => 
      order.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.restaurantName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [orders, searchQuery]);

  return (
    <SecureOverlay>
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-(--sp-border) mt-4">
        <div className="space-y-1">
          <h1 className="text-[28px] font-medium tracking-[-0.02em] text-(--sp-text-0)">
             Audit <span className="text-emerald-500 font-semibold">Traceability</span>
          </h1>
          <div className="flex items-center gap-2">
             <ShieldCheck className="w-4 h-4 text-emerald-500" />
             <p className="text-[13px] text-(--sp-text-2) font-medium italic uppercase tracking-wider">
                Immutable Registry: Global Order Provenance & Node Ledger
             </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-(--sp-bg-2) p-1 rounded-md border border-(--sp-border)">
             <button 
               onClick={() => setViewMode("list")}
               className={cn(
                 "p-1.5 rounded transition-all",
                 viewMode === "list" ? "bg-(--sp-bg-0) text-emerald-500 shadow-sm" : "text-(--sp-text-3) hover:text-(--sp-text-1)"
               )}
             >
                <List size={16} />
             </button>
             <button 
               onClick={() => setViewMode("grid")}
               className={cn(
                 "p-1.5 rounded transition-all",
                 viewMode === "grid" ? "bg-(--sp-bg-0) text-emerald-500 shadow-sm" : "text-(--sp-text-3) hover:text-(--sp-text-1)"
               )}
             >
                <LayoutGrid size={16} />
             </button>
          </div>
          <div className="flex items-center gap-3 bg-(--sp-bg-0) px-3 py-1.5 rounded-sm border border-(--sp-border) w-full md:w-64 focus-within:border-emerald-500/30 transition-all">
             <Search size={14} className="text-(--sp-text-2)" />
             <input 
               type="text" 
               placeholder="Trace node..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="bg-transparent border-none outline-none text-[13px] w-full text-(--sp-text-0) placeholder:text-(--sp-text-3)" 
             />
          </div>
        </div>
      </header>

      {/* Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 flex items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
               <History size={24} />
            </div>
            <div>
               <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Total Logs Synced</p>
               <p className="text-2xl font-black text-slate-900 dark:text-white leading-none tabular-nums">
                  {statsLoading ? "..." : stats?.totalLogs?.toLocaleString()}
               </p>
            </div>
         </div>
         <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 flex items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
               <Box size={24} />
            </div>
            <div>
               <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Active Split Nodes</p>
               <p className="text-2xl font-black text-slate-900 dark:text-white leading-none tabular-nums">
                  {statsLoading ? "..." : stats?.activeNodes}
               </p>
            </div>
         </div>
         <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6 flex items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
               <ShieldCheck size={24} />
            </div>
            <div>
               <p className="text-[11px] font-black text-indigo-600 uppercase tracking-widest leading-none mb-1">Integrity Score</p>
               <p className="text-2xl font-black text-slate-900 dark:text-white leading-none tabular-nums">
                  {statsLoading ? "..." : stats?.integrityScore}
               </p>
            </div>
         </div>
      </div>

      {/* Main Registry */}
      <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-sm overflow-hidden">
         <div className="overflow-x-auto min-h-[400px]">
            {isLoading ? (
                <div className="py-24 text-center flex flex-col items-center justify-center space-y-4 opacity-70">
                    <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                    <p className="text-[13px] text-(--sp-text-2) font-medium">Reconstructing audit trails...</p>
                </div>
            ) : (
              <table className="w-full">
                  <thead>
                      <tr className="border-b border-(--sp-border) bg-(--sp-bg-1)/30 text-[11px] font-black uppercase tracking-widest text-slate-400">
                        <th className="text-left py-4 px-6">Reference Node</th>
                        <th className="text-left py-4 px-6">Stakeholders</th>
                        <th className="text-left py-4 px-6">Fulfillment Score</th>
                        <th className="text-left py-4 px-6">Audit Status</th>
                        <th className="text-right py-4 px-6">Sequence</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-(--sp-border)">
                      {filteredOrders.map(order => (
                      <tr key={order.id} className="group/row hover:bg-emerald-500/2 transition-all cursor-pointer" onClick={() => navigate(`/operator/po/${order.id}/audit`)}>
                          <td className="py-5 px-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-(--sp-bg-3) text-emerald-500 flex items-center justify-center font-black text-[10px] border border-(--sp-border) group-hover/row:border-emerald-500/30 transition-all rotate-3 group-hover/row:rotate-0">
                                    {order.referenceNumber.slice(-3).toUpperCase()}
                                </div>
                                <div className="space-y-0.5">
                                    <div className="text-[14px] font-black text-(--sp-text-0) tracking-tight group-hover/row:text-emerald-500 transition-colors italic uppercase">{order.referenceNumber}</div>
                                    <div className="text-[10px] text-(--sp-text-2) font-bold uppercase tracking-widest">{order.deliveryDate}</div>
                                </div>
                              </div>
                          </td>
                          <td className="py-5 px-6">
                              <div className="space-y-1">
                                <div className="text-[13px] font-bold text-(--sp-text-1) flex items-center gap-2 uppercase tracking-tight">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    {order.restaurantName}
                                </div>
                                <div className="text-[9px] text-(--sp-text-3) font-black uppercase tracking-widest italic">Consolidated Node Trace</div>
                              </div>
                          </td>
                          <td className="py-5 px-6">
                             <div className="w-full max-w-[120px] h-1.5 bg-(--sp-bg-3) rounded-full overflow-hidden border border-(--sp-border)">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${order.fulfillmentScore}%` }}
                                  className="h-full bg-linear-to-r from-emerald-500 to-emerald-400" 
                                />
                             </div>
                             <p className="text-[9px] font-black text-emerald-500 mt-1.5 uppercase tracking-widest">{order.fulfillmentScore}% Verified</p>
                          </td>
                          <td className="py-5 px-6">
                              <StatusBadge status={order.status as any} />
                          </td>
                          <td className="py-5 px-6">
                              <div className="flex justify-end">
                                <button className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all">
                                   Trace <ChevronRight size={12} strokeWidth={3} />
                                </button>
                              </div>
                          </td>
                      </tr>
                      ))}
                  </tbody>
              </table>
            )}
         </div>

         <div className="p-6 border-t border-(--sp-border) bg-(--sp-bg-1)/30 flex justify-between items-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Immutable Registry v1.02</p>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Sync Active</span>
            </div>
         </div>
      </div>
    </div>
    </SecureOverlay>
  );
}
