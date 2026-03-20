"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  History, 
  Search, 
  Filter, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowingBorder } from "@/components/ui/neon-button";
import { StatusBadge } from "@/components/ui/status-badge";

const MOCK_HISTORY = [
  { 
    id: "BID-8812", 
    title: "Fresh Produce Q3 - Shopro Marketplace", 
    date: "2024-03-15", 
    value: "$12,450", 
    status: "awarded", 
    items: 45 
  },
  { 
    id: "BID-8750", 
    title: "Organic Dairy - Shopro Marketplace", 
    date: "2024-03-10", 
    value: "$8,200", 
    status: "rejected", 
    items: 12 
  },
  { 
    id: "BID-8690", 
    title: "Monthly Seafood Supply", 
    date: "2024-03-05", 
    value: "$34,000", 
    status: "expired", 
    items: 8 
  },
];

export default function BidHistory() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Bid History</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review your past submissions and awards.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <GlowingBorder spread={20} />
            <input 
               type="text" 
               placeholder="Search bids..." 
               className="h-11 w-64 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all relative z-10"
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 z-20" />
          </div>
          <button className="h-11 px-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {MOCK_HISTORY.map((bid, i) => (
          <motion.div
            key={bid.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group relative bg-white dark:bg-slate-950/50 backdrop-blur-xl rounded-2xl p-5 ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-blue-500/50 transition-all cursor-pointer shadow-sm overflow-hidden"
          >
            <GlowingBorder spread={40} />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex gap-4 items-center">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                  bid.status === "awarded" ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" :
                  bid.status === "rejected" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                  "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                )}>
                   {bid.status === "awarded" ? <CheckCircle2 className="w-6 h-6" /> :
                    bid.status === "rejected" ? <XCircle className="w-6 h-6" /> :
                    <Clock className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{bid.id}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <span className="text-[10px] font-bold text-slate-500">{bid.date}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">{bid.title}</h3>
                </div>
              </div>

              <div className="flex items-center gap-8 px-4 md:px-0">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{bid.value}</p>
                  <p className="text-[10px] text-slate-500 font-medium uppercase">{bid.items} items</p>
                </div>
                <StatusBadge 
                  status={bid.status === "awarded" ? "captured" : bid.status === "rejected" ? "REJECTED" : "PENDING"} 
                  label={bid.status.toUpperCase()}
                />
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-all translate-x-0 group-hover:translate-x-1" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-center pt-8">
        <button className="text-sm font-bold text-blue-500 hover:text-blue-600 flex items-center gap-2">
          Load More History <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
