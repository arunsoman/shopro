"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { 
  History, 
  Search, 
  Filter, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  RefreshCw,
  TrendingUp,
  ArrowUpRight,
  ChevronLeft
} from "lucide-react";
import { SecureOverlay } from "@/components/SecureOverlay";
import { StatusBadge } from "@/components/ui/status-badge";

/**
 * S-05 — Bid History
 * Purpose: Review past submissions and awards for suppliers.
 */

interface BidHistory {
  id: string;
  title: string;
  quotedAmount: number;
  status: string;
  date: string;
}

export default function BidHistory() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const { data: history = [], isLoading } = useQuery<BidHistory[]>({
    queryKey: ["supplier-bid-history"],
    queryFn: async () => {
      const resp = await api.get("/api/supplier/bids/history");
      return resp.data;
    }
  });

  const filteredHistory = history.filter(bid => 
    bid.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bid.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SecureOverlay>
    <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-1000 font-black italic uppercase leading-none pb-24 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 border-b-8 border-slate-100 dark:border-slate-800 pb-12 font-black italic leading-none shadow-inner">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter italic uppercase leading-none shadow-text mt-4">
             Legacy <span className="text-indigo-500">Arch.X</span>
          </h1>
          <p className="text-slate-500 font-black italic text-xl tracking-wide opacity-60 leading-none flex items-center gap-4">
             <History className="w-8 h-8 text-indigo-500 animate-pulse" />
             Review your past submissions and awarded project nodes.
          </p>
        </div>
        
        <div className="flex items-center gap-6 font-black italic uppercase tracking-[0.4em] leading-none">
          <div className="flex items-center gap-6 bg-white dark:bg-slate-950 px-8 py-5 rounded-[1.5rem] border-4 border-slate-50 dark:border-slate-800 shadow-xl shadow-inner">
             <Search size={24} className="text-slate-400" />
             <input 
               type="text" 
               placeholder="SEARCH_HISTORY.NODE..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="bg-transparent border-none outline-none text-[11px] w-64 tracking-[0.4em] font-black italic uppercase" 
             />
          </div>
          <button className="h-20 w-20 bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] flex items-center justify-center border-4 border-slate-50 dark:border-slate-800 hover:scale-110 transition-all shadow-4xl shadow-inner">
             <Filter size={32} />
          </button>
        </div>
      </header>

      {/* History List */}
      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl rounded-[4rem] border-4 border-slate-100 dark:border-slate-800 shadow-4xl p-1 shadow-inner min-h-[500px] overflow-hidden">
        {isLoading ? (
          <div className="p-40 flex flex-col items-center justify-center space-y-12 opacity-40">
              <RefreshCw className="w-20 h-20 text-indigo-500 animate-spin" />
              <p className="text-[12px] tracking-[0.6em] font-black italic uppercase">READING_LEDGER_ENTRIES.X...</p>
          </div>
        ) : (
          <div className="divide-y-8 divide-slate-100 dark:divide-slate-800/60">
            {filteredHistory.map((bid, i) => (
              <motion.div
                key={bid.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-10 hover:bg-white dark:hover:bg-slate-950/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-12 group/row cursor-crosshair"
              >
                <div className="flex items-center gap-10 min-w-0">
                  <div className={cn("w-20 h-20 rounded-[1.5rem] flex items-center justify-center border-4 transition-all group-hover/row:scale-110 shadow-4xl shadow-inner", 
                    bid.status === "WON" ? "bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20" :
                    bid.status === "LOST" ? "bg-rose-600 text-white border-rose-400 shadow-rose-500/20" :
                    "bg-slate-950 text-white dark:bg-white dark:text-slate-900 border-slate-700 dark:border-slate-200"
                  )}>
                    {bid.status === "WON" ? <CheckCircle2 size={36} /> :
                     bid.status === "LOST" ? <XCircle size={36} /> :
                     <Clock size={36} />}
                  </div>
                  <div className="min-w-0 space-y-4">
                    <div className="flex items-center gap-6 text-[11px] font-black tracking-[0.3em] italic opacity-60">
                       <span className="text-indigo-500">{bid.id}</span>
                       <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                       <span>{bid.date.replace(/-/g, '.')}</span>
                    </div>
                    <h3 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white group-hover/row:text-indigo-500 transition-colors shadow-text">
                       {bid.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-16 px-6 md:px-0">
                  <div className="text-right space-y-2">
                    <p className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white shadow-text tabular-nums">₹{bid.quotedAmount.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 font-black tracking-[0.3em] uppercase italic opacity-60 leading-none">QUOTED_VOLUME.SIGN</p>
                  </div>
                  <StatusBadge 
                    status={bid.status === "WON" ? "captured" : bid.status === "LOST" ? "REJECTED" : "PENDING"} 
                    label={bid.status}
                  />
                  <button className="w-16 h-16 rounded-[1.25rem] bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover/row:text-indigo-500 group-hover/row:bg-white dark:group-hover/row:bg-slate-950 transition-all border-4 border-transparent group-hover/row:border-indigo-500 flex items-center justify-center shadow-inner group-hover/row:shadow-4xl">
                     <ArrowUpRight size={32} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-12 pt-12 border-t-8 border-slate-100 dark:border-slate-800/60 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10 leading-none font-black italic uppercase italic">
          <div className="text-[11px] text-slate-400 font-black tracking-[0.4em] uppercase italic opacity-60">SHOWING_{filteredHistory.length}_LEGACY_NODES.X</div>
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
    </SecureOverlay>
  );
}
