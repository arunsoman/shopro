"use client";

import React from "react";
import { motion } from "framer-motion";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Filter, Truck, ArrowRight, FileText, Download, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { cn } from "@/lib/utils";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * OP-03-B — PO Outbox (Global)
 * Purpose: Consolidated queue for all outgoing supplier fulfillments.
 * DNA: Fulfillment-velocity Bento cards, supplier-coded table, glassmorphism.
 */

interface SubOrder {
  id: string;
  destination: string;
  status: string;
  sentAt: string;
  amount: number;
}

export default function POOutbox() {
  const navigate = useNavigate();

  const { data: subOrders = [], isLoading } = useQuery<SubOrder[]>({
    queryKey: ["operator-po-outbox"],
    queryFn: async () => {
      const resp = await api.get("operator/sourcing/po-outbox");
      return resp.data;
    }
  });

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <SecureOverlay>
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-(--sp-border) mt-4">
        <div className="space-y-1">
          <h1 className="text-[28px] font-medium tracking-[-0.02em] text-(--sp-text-0)">
             Purchase outbox
          </h1>
          <div className="flex items-center gap-2">
             <Truck className="w-4 h-4 text-emerald-500" />
             <p className="text-[13px] text-(--sp-text-2)">
                Global fulfillment queue and outbound monitoring matrix.
             </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-(--sp-bg-0) px-3 py-1.5 rounded-sm border border-(--sp-border) focus-within:border-emerald-500/30 transition-all">
             <Search size={14} className="text-(--sp-text-2)" />
             <input 
               type="text" 
               placeholder="Query SPO matrix..." 
               className="bg-transparent border-none outline-none text-[13px] w-48 text-(--sp-text-0) placeholder:text-(--sp-text-3)" 
             />
          </div>
          <button className="h-9 px-4 rounded-[6px] bg-(--sp-bg-2) border border-(--sp-border) text-[13px] font-medium text-(--sp-text-1) flex items-center gap-2 hover:bg-(--sp-bg-1)/50 transition-all shadow-sm">
            <Filter size={14} />
            Filter flux
          </button>
        </div>
      </header>

      {/* Active Fulfillment Bento Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
            Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-48 bg-(--sp-bg-2) rounded-md border border-(--sp-border) animate-pulse" />
            ))
        ) : subOrders.slice(0, 3).map((spo, i) => (
          <motion.div
            key={spo.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group cursor-pointer"
          >
            <div className="bg-(--sp-bg-2) rounded-md p-6 border border-(--sp-border) shadow-sm group-hover:border-emerald-500/30 transition-all">
               <div className="flex justify-between items-start mb-6">
                 <div className="flex items-center gap-2 text-emerald-500">
                    <Truck size={16} />
                    <span className="text-[10px] font-medium uppercase tracking-[0.06em]">ETA: T-Minus 24h</span>
                 </div>
                 <div className="px-2 py-0.5 rounded-[4px] bg-emerald-500/10 text-emerald-500 text-[10px] font-medium tracking-[0.06em] border border-emerald-500/20 uppercase">{spo.status}</div>
               </div>
               
               <h3 className="text-[18px] font-medium text-(--sp-text-0) truncate mb-1">{spo.destination}</h3>
               <p className="text-[11px] font-medium text-(--sp-text-3) uppercase tracking-[0.04em] mb-6">{spo.id} • Sent: {formatDate(spo.sentAt)}</p>
               
               <div className="flex items-end justify-between">
                 <div>
                    <p className="text-[10px] text-(--sp-text-3) font-medium uppercase tracking-[0.06em] mb-1">Integrated value</p>
                    <p className="text-[24px] font-light text-emerald-500 tracking-[-0.02em] tabular-nums">₹{spo.amount.toLocaleString()}</p>
                 </div>
                 <div className="h-10 w-10 rounded-sm bg-(--sp-bg-3) text-(--sp-text-1) border border-(--sp-border) group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all flex items-center justify-center">
                    <ArrowRight size={20} />
                 </div>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Outbound Registry Table */}
      <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) overflow-hidden shadow-sm">
        <div className="p-6 border-b border-(--sp-border) bg-(--sp-bg-1)/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-sm bg-(--sp-bg-3) text-emerald-500 flex items-center justify-center border border-(--sp-border)">
                <FileText size={20} />
             </div>
             <h2 className="text-[18px] font-medium text-(--sp-text-0)">Consolidated outbox matrix</h2>
          </div>
          <button className="h-8 w-8 rounded-[4px] bg-(--sp-bg-2) border border-(--sp-border) text-(--sp-text-2) hover:text-(--sp-text-0) transition-all flex items-center justify-center">
             <Download size={14} />
          </button>
        </div>
        
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
               <div className="py-24 flex flex-col items-center justify-center space-y-4 opacity-70">
                  <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                  <p className="text-[13px] text-(--sp-text-2) font-medium uppercase tracking-[0.04em]">Streaming outbound registry nodes...</p>
               </div>
          ) : (
          <table className="w-full text-left tabular-nums">
            <thead>
              <tr className="border-b border-(--sp-border) bg-(--sp-bg-1)/30">
                <th className="py-4 px-6 text-[11px] font-medium uppercase tracking-[0.04em] text-(--sp-text-2)">SPO Node</th>
                <th className="py-4 px-6 text-[11px] font-medium uppercase tracking-[0.04em] text-(--sp-text-2)">Supplier</th>
                <th className="py-4 px-6 text-[11px] font-medium uppercase tracking-[0.04em] text-(--sp-text-2) text-center">Status</th>
                <th className="py-4 px-6 text-[11px] font-medium uppercase tracking-[0.04em] text-(--sp-text-2)">Logistics</th>
                <th className="py-4 px-6 text-[11px] font-medium uppercase tracking-[0.04em] text-(--sp-text-2)">Payload (₹)</th>
                <th className="py-4 px-6 text-[11px] font-medium uppercase tracking-[0.04em] text-(--sp-text-2) text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--sp-border)">
              {subOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-24 text-center text-(--sp-text-3) font-medium tracking-[0.06em] uppercase">Null frequency — no outbound dispatches detected</td>
                  </tr>
              ) : subOrders.map((row) => (
                <tr 
                  key={row.id} 
                  className="group hover:bg-(--sp-bg-1)/50 transition-all cursor-pointer"
                >
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-sm bg-(--sp-bg-3) text-(--sp-text-3) group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition-all flex items-center justify-center border border-(--sp-border)">
                        <FileText size={18} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[14px] font-medium text-(--sp-text-0) group-hover:text-emerald-500 transition-colors">{row.id}</p>
                        <p className="text-[11px] text-(--sp-text-3) uppercase tracking-[0.04em]">Sent: {formatDate(row.sentAt)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <p className="text-[14px] font-medium text-(--sp-text-1)">{row.destination}</p>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <div className={cn(
                       "inline-flex px-2 py-0.5 rounded-[4px] text-[10px] font-medium tracking-[0.06em] uppercase border shadow-sm",
                       row.status === 'Confirmed' ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" : "bg-(--sp-red)/5 text-(--sp-red) border-(--sp-red)/20"
                    )}>
                      {row.status}
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-2">
                       <Truck size={14} className="text-emerald-500" />
                       <span className="text-[13px] text-(--sp-text-1) uppercase tracking-[0.04em]">T-Minus 24h</span>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <p className="text-[16px] font-medium text-(--sp-text-0)">₹{row.amount.toLocaleString()}</p>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <button className="h-8 px-4 rounded-[4px] bg-emerald-500 text-white text-[11px] font-medium hover:opacity-90 transition-all shadow-sm">
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
    </SecureOverlay>
  );
}
