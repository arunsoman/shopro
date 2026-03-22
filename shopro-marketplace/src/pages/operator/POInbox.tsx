"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Filter, Clock, ArrowRight, FileText, Download, ChevronDown, ChevronUp, Calendar, Info, RefreshCw, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * OP-03 — PO Inbox (Global)
 * Purpose: Central queue for all restaurant orders.
 * DNA: Urgency-based Bento cards, status-coded table, glassmorphism.
 */

interface PurchaseOrder {
  id: string;
  restaurant: string;
  amount: number;
  items: number;
  status: string;
  priority: string;
}

export default function POInbox() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data: pos = [], isLoading } = useQuery<PurchaseOrder[]>({
    queryKey: ["operator-po-inbox"],
    queryFn: async () => {
      const resp = await api.get("/operator/sourcing/po-inbox");
      return resp.data;
    }
  });

  const filteredPOs = useMemo(() => {
    return pos.filter(po => {
      const matchesSearch = po.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           po.restaurant.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || po.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [pos, searchQuery, statusFilter]);

  return (
    <SecureOverlay>
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-(--sp-border) mt-4">
        <div className="space-y-1">
          <h1 className="text-[28px] font-medium tracking-[-0.02em] text-(--sp-text-0)">
             Purchase orders
          </h1>
          <div className="flex items-center gap-2">
             <Database className="w-4 h-4 text-emerald-500" />
             <p className="text-[13px] text-(--sp-text-2)">
                Global procurement queue and prioritization matrix.
             </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-(--sp-bg-0) px-3 py-1.5 rounded-sm border border-(--sp-border) focus-within:border-emerald-500/30 transition-all">
             <Search size={14} className="text-(--sp-text-2)" />
             <input 
               type="text" 
               placeholder="Search trace ID..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="bg-transparent border-none outline-none text-[13px] w-48 text-(--sp-text-0) placeholder:text-(--sp-text-3)" 
             />
          </div>
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={cn(
               "h-9 px-4 rounded-[6px] text-[13px] font-medium transition-all flex items-center gap-2 border shadow-sm",
               showAdvanced 
                 ? "bg-emerald-500 text-white border-emerald-500" 
                 : "bg-(--sp-bg-2) text-(--sp-text-1) border-(--sp-border) hover:bg-(--sp-bg-1)/50"
            )}
          >
            <Filter size={14} />
            Filter flux
            {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {showAdvanced && (
           <motion.div 
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
             className="p-4 bg-(--sp-bg-2) rounded-sm border border-(--sp-border) shadow-sm"
           >
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-medium text-(--sp-text-2) uppercase tracking-[0.04em]">Status flux:</span>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-(--sp-bg-3) border border-(--sp-border) rounded-[4px] px-2 py-1 text-[12px] font-medium text-(--sp-text-1) focus:outline-none focus:border-emerald-500/30 transition-all"
                >
                  <option value="ALL">ALL NODES</option>
                  <option value="Pending Review">PENDING_REVIEW</option>
                  <option value="Unassigned">UNASSIGNED</option>
                </select>
              </div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Urgent Bento Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? [...Array(3)].map((_, i) => (
             <div key={i} className="h-48 rounded-md bg-(--sp-bg-2) border border-(--sp-border) animate-pulse" />
        )) : pos.slice(0, 3).map((po, i) => (
          <motion.div
            key={po.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group cursor-pointer"
            onClick={() => navigate(`/operator/po-review/${po.id}`)}
          >
            <div className="bg-(--sp-bg-2) rounded-md p-6 border border-(--sp-border) shadow-sm group-hover:border-emerald-500/30 transition-all">
               <div className="flex justify-between items-start mb-6">
                 <div className="flex items-center gap-2 text-emerald-500">
                    <Clock size={16} />
                    <span className="text-[10px] font-medium uppercase tracking-[0.06em]">{po.priority} Priority</span>
                 </div>
                 <div className="px-2 py-0.5 rounded-[4px] bg-emerald-500/10 text-emerald-500 text-[10px] font-medium tracking-[0.06em] border border-emerald-500/20 uppercase">{po.status}</div>
               </div>
               
               <h3 className="text-[18px] font-medium text-(--sp-text-0) truncate mb-1">{po.restaurant}</h3>
               <p className="text-[11px] font-medium text-(--sp-text-3) uppercase tracking-[0.04em] mb-6">{po.id} • {po.items} items</p>
               
               <div className="flex items-end justify-between">
                 <div>
                    <p className="text-[10px] text-(--sp-text-3) font-medium uppercase tracking-[0.06em] mb-1">Payload value</p>
                    <p className="text-[24px] font-light text-emerald-500 tracking-[-0.02em] tabular-nums">₹{po.amount.toLocaleString()}</p>
                 </div>
                 <div className="h-10 w-10 rounded-sm bg-(--sp-bg-3) text-(--sp-text-1) border border-(--sp-border) group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all flex items-center justify-center">
                    <ArrowRight size={20} />
                 </div>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) overflow-hidden shadow-sm">
        <div className="p-6 border-b border-(--sp-border) bg-(--sp-bg-1)/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-sm bg-(--sp-bg-3) text-emerald-500 flex items-center justify-center border border-(--sp-border)">
                <Database size={20} />
             </div>
             <h2 className="text-[18px] font-medium text-(--sp-text-0)">Consolidated queue</h2>
          </div>
          <button className="h-8 w-8 rounded-[4px] bg-(--sp-bg-2) border border-(--sp-border) text-(--sp-text-2) hover:text-(--sp-text-0) transition-all flex items-center justify-center">
             <Download size={14} />
          </button>
        </div>
        
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
               <div className="py-24 flex flex-col items-center justify-center space-y-4 opacity-70">
                  <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                  <p className="text-[13px] text-(--sp-text-2) font-medium uppercase tracking-[0.04em]">Syncing global PO matrix...</p>
               </div>
          ) : (
          <table className="w-full text-left tabular-nums">
            <thead>
              <tr className="border-b border-(--sp-border) bg-(--sp-bg-1)/30">
                <th className="py-4 px-6 text-[11px] font-medium uppercase tracking-[0.04em] text-(--sp-text-2)">Order Node</th>
                <th className="py-4 px-6 text-[11px] font-medium uppercase tracking-[0.04em] text-(--sp-text-2)">Merchant</th>
                <th className="py-4 px-6 text-[11px] font-medium uppercase tracking-[0.04em] text-(--sp-text-2) text-center">Status</th>
                <th className="py-4 px-6 text-[11px] font-medium uppercase tracking-[0.04em] text-(--sp-text-2)">Priority</th>
                <th className="py-4 px-6 text-[11px] font-medium uppercase tracking-[0.04em] text-(--sp-text-2)">Value (₹)</th>
                <th className="py-4 px-6 text-[11px] font-medium uppercase tracking-[0.04em] text-(--sp-text-2) text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--sp-border)">
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center text-(--sp-text-3) font-medium tracking-[0.06em] uppercase">
                    No active PO nodes found in cluster.
                  </td>
                </tr>
              ) : (
                filteredPOs.map((row) => (
                  <tr 
                    key={row.id} 
                    className="group hover:bg-(--sp-bg-1)/50 transition-all cursor-pointer"
                    onClick={() => navigate(`/operator/po-review/${row.id}`)}
                  >
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-sm bg-(--sp-bg-3) text-(--sp-text-3) group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition-all flex items-center justify-center border border-(--sp-border)">
                          <FileText size={18} />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[14px] font-medium text-(--sp-text-0) group-hover:text-emerald-500 transition-colors">{row.id}</p>
                          <p className="text-[11px] text-(--sp-text-3) uppercase tracking-[0.04em]">Propagated 10m ago</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <p className="text-[14px] font-medium text-(--sp-text-1)">{row.restaurant}</p>
                    </td>
                    <td className="py-5 px-6 text-center">
                       <div className={cn(
                         "inline-flex px-2 py-0.5 rounded-[4px] text-[10px] font-medium tracking-[0.06em] uppercase border shadow-sm",
                         row.status === 'Pending Review' ? "bg-amber-500/5 text-amber-500 border-amber-500/20" : "bg-(--sp-red)/5 text-(--sp-red) border-(--sp-red)/20"
                       )}>
                         {row.status}
                       </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-2">
                         <div className={cn("w-1.5 h-1.5 rounded-full", row.priority === 'High' ? "bg-(--sp-red)" : "bg-amber-500")} />
                         <span className="text-[13px] text-(--sp-text-1)">{row.priority}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <p className="text-[16px] font-medium text-(--sp-text-0)">₹{row.amount.toLocaleString()}</p>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                        <Info size={16} className="text-(--sp-text-3) hover:text-emerald-500 transition-colors" />
                        <button className="h-8 px-4 rounded-[4px] bg-emerald-500 text-white text-[11px] font-medium hover:opacity-90 transition-all shadow-sm">
                          Process
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
    </SecureOverlay>
  );
}
