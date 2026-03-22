"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Search, 
  Filter, 
  FileText, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Box,
  Globe,
  Award,
  CircleDot,
  ArrowRight,
  RefreshCw,
  Plus
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";

/**
 * RD-03 — Order History & Tracking
 * Purpose: Track all POs and their fulfillment status for restaurant buyers.
 */

interface OrderSummary {
  id: string;
  date: string;
  items: number;
  total: number;
  status: string;
  tracking: string;
}

const STATUS_MAP: Record<string, { label: string, color: string }> = {
  DRAFT: { label: "Draft", color: "text-slate-400 bg-slate-400/10 border-slate-400/20" },
  SUBMITTED: { label: "Submitted", color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" },
  PENDING_SPLIT: { label: "Processing", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  SPLIT_COMPLETE: { label: "Processed", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  IN_FULFILLMENT: { label: "In Fulfillment", color: "text-indigo-600 bg-indigo-600/10 border-indigo-600/20" },
  COMPLETED: { label: "Completed", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  CANCELLED: { label: "Cancelled", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
};

export default function OrderHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { data: orders, isLoading } = useQuery<OrderSummary[]>({
    queryKey: ["buyer-orders"],
    queryFn: async () => {
      const resp = await api.get("buyer/orders");
      return resp.data;
    }
  });

  const filteredOrders = orders?.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SecureOverlay>
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-24 text-slate-900 dark:text-white">
      {/* Header Section */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-slate-200 dark:border-slate-800 pb-8 transition-all">
        <div className="space-y-3">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
             Order <span className="text-brand-primary font-extrabold italic">History</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm flex items-center gap-3">
             <Globe className="w-5 h-5 text-brand-primary animate-pulse" />
             Track and audit all marketplace procurement cycles.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative group flex-1 lg:flex-none">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
             <input 
               type="text"
               placeholder="Search POs..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="h-10 pl-11 pr-4 w-full lg:w-[240px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-bold text-xs focus:ring-2 focus:ring-brand-primary/10 outline-none transition-all shadow-sm"
             />
          </div>
          <button className="h-10 w-10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-primary transition-all">
             <Filter size={18} />
          </button>
          <button 
            onClick={() => navigate('/restaurant/catalog')}
            className="h-10 px-6 bg-brand-primary text-slate-950 rounded-lg border border-brand-primary/50 font-bold text-xs tracking-tight shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
          >
             <Plus size={18} />
             Raise PO
          </button>
        </div>
      </header>

      {/* Active Tracking Status DNA */}
      <div className="relative group overflow-hidden rounded-3xl border-4 border-brand-primary shadow-2xl shadow-inner">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px] pointer-events-none" />
        <div className="relative z-10 bg-slate-950 dark:bg-slate-900/40 backdrop-blur-3xl p-8 flex flex-col lg:flex-row items-center justify-between gap-8 text-white">
           <div className="flex items-center gap-8">
              <div className="h-16 w-16 rounded-2xl bg-indigo-600 border border-indigo-400 flex items-center justify-center shadow-lg animate-pulse">
                 <Truck size={32} />
              </div>
              <div className="space-y-1">
                  <p className="text-[10px] font-bold tracking-widest text-brand-primary uppercase">Active Shipment</p>
                  <h2 className="text-xl md:text-2xl font-extrabold tracking-tight leading-none uppercase italic">PO-9921 — ETA 10:42 AM</h2>
              </div>
           </div>
           <button 
            onClick={() => navigate('/restaurant/orders/PO-9921')}
            className="h-14 px-8 bg-white text-slate-950 rounded-xl border border-indigo-500 font-bold text-sm tracking-wide shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-4 uppercase"
           >
              Track Order
              <ArrowRight size={20} className="text-indigo-500" />
           </button>
        </div>
      </div>

      {/* Order Table Matrix */}
      <div className="bg-card/50 backdrop-blur-xl rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left font-medium border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="p-4 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Order Details</th>
                  <th className="p-4 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fulfillment</th>
                  <th className="p-4 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Amount</th>
                  <th className="p-4 text-[10px] uppercase font-bold text-slate-400 tracking-wider text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                    [1,2,3,4,5].map(i => (
                        <tr key={i} className="animate-pulse">
                            <td colSpan={5} className="p-8"><div className="h-10 bg-muted rounded-lg w-full" /></td>
                        </tr>
                    ))
                ) : filteredOrders?.map((order) => {
                    const status = STATUS_MAP[order.status] || { label: "UNKNOWN", color: "text-slate-400" };
                    return (
                        <tr 
                            key={order.id} 
                            onClick={() => navigate(`/restaurant/orders/${order.id}`)}
                            className="group hover:bg-muted/30 transition-all cursor-pointer"
                        >
                            <td className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-slate-100 dark:bg-slate-950 rounded-lg border border-border flex items-center justify-center text-brand-primary shadow-sm group-hover:rotate-6 transition-transform">
                                        <FileText size={18} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase italic">{order.id}</p>
                                        <p className="text-[10px] text-slate-400 font-bold tracking-wider">{order.date} • {order.items} Items</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="space-y-1">
                                    <div className={cn("inline-flex px-3 py-0.5 rounded-lg border font-bold text-[9px] tracking-wide uppercase shadow-sm", status.color)}>
                                        {status.label}
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 flex items-center gap-2">
                                        {order.tracking === "DELIVERED" ? <CheckCircle2 size={10} className="text-brand-success" /> : <RefreshCw size={10} className="text-brand-primary animate-spin" />}
                                        {order.tracking.replace(/_/g, ' ')}
                                    </p>
                                </div>
                            </td>
                             <td className="p-4">
                                  <p className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">₹{order.total.toFixed(2)}</p>
                             </td>
                            <td className="p-4 text-right">
                                <div className="flex justify-end">
                                    <button className="h-9 w-9 bg-slate-100 dark:bg-slate-950 rounded-lg border border-border flex items-center justify-center text-slate-400 hover:text-brand-primary transition-all shadow-sm group-hover:scale-110">
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    );
                })}
              </tbody>
            </table>
        </div>
        
        <div className="p-4 bg-muted/30 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase opacity-60">Total: {filteredOrders?.length} Orders</p>
            <div className="flex items-center gap-4">
                <button className="h-8 px-4 bg-white dark:bg-slate-950 border border-border rounded-lg font-bold text-[10px] tracking-widest uppercase text-slate-400 shadow-sm hover:text-slate-900 dark:hover:text-white transition-all disabled:opacity-30" disabled>Previous</button>
                <button className="h-8 px-4 bg-white dark:bg-slate-950 border border-border rounded-lg font-bold text-[10px] tracking-widest uppercase text-slate-400 shadow-sm hover:text-slate-900 dark:hover:text-white transition-all">Next</button>
            </div>
        </div>
      </div>
    </div>
    </SecureOverlay>
  );
}
