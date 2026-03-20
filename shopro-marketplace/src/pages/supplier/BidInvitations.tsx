"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Clock, 
  ArrowRight, 
  Info, 
  Search, 
  Filter, 
  ChevronRight,
  TrendingUp,
  Package
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowingBorder, NeonEdges } from "@/components/ui/neon-button";
import { StatusBadge } from "@/components/ui/status-badge";
import QuoteSubmissionModal from "@/components/supplier/QuoteSubmissionModal";

const ACTIVE_INVITATIONS = [
  { 
    id: "B-2201", 
    title: "Organic Winter Greens Selection", 
    category: "Fresh Produce", 
    deadline: "4h 20m", 
    items: [
      { id: "1", name: "Baby Spinach", requestedQty: "50", unit: "kg" },
      { id: "2", name: "Kale (Curly)", requestedQty: "30", unit: "kg" },
      { id: "3", name: "Arugula", requestedQty: "20", unit: "kg" },
    ], 
    urgency: "HIGH",
    shoproTag: "Shopro Marketplace"
  },
  { 
    id: "B-2205", 
    title: "Weekly Dairy Prime Bundle", 
    category: "Dairy & Eggs", 
    deadline: "1d 2h", 
    items: [
      { id: "4", name: "Whole Milk 1L", requestedQty: "200", unit: "units" },
      { id: "5", name: "Unsalted Butter 500g", requestedQty: "50", unit: "units" },
    ], 
    urgency: "NORMAL",
    shoproTag: "Shopro Marketplace"
  },
];

export default function BidInvitations() {
  const [selectedBid, setSelectedBid] = React.useState<any>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleOpenBid = (bid: any) => {
    setSelectedBid(bid);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Bid Invitations</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Open opportunities from the Shopro Marketplace.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <GlowingBorder spread={20} />
            <input 
               type="text" 
               placeholder="Search invitations..." 
               className="h-11 w-64 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all relative z-10"
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 z-20" />
          </div>
          <button className="h-11 px-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {ACTIVE_INVITATIONS.map((invitation, i) => (
          <motion.div
            key={invitation.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative bg-white dark:bg-slate-950/50 backdrop-blur-xl rounded-[2rem] p-6 ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-blue-500/50 transition-all cursor-pointer shadow-sm overflow-hidden flex flex-col justify-between"
          >
            <GlowingBorder spread={50} />
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{invitation.id}</p>
                    <p className="text-[10px] font-bold text-blue-500 uppercase">{invitation.category}</p>
                  </div>
                </div>
                <StatusBadge 
                  status={invitation.urgency === "HIGH" ? "RAISED" : "PENDING"} 
                  label={invitation.urgency === "HIGH" ? "URGENT" : "OPEN"} 
                />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors leading-tight">
                  {invitation.title}
                </h3>
                <div className="flex items-center gap-4 mt-2">
                   <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Package className="w-3.5 h-3.5" /> {invitation.items.length} line items
                   </div>
                   <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                      <Clock className="w-3.5 h-3.5" /> Closes in {invitation.deadline}
                   </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center text-[8px] font-bold text-white dark:text-slate-900">S</div>
                   <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{invitation.shoproTag}</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleOpenBid(invitation); }}
                  className="relative px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold flex items-center gap-2 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg active:scale-95 overflow-hidden"
                >
                   <NeonEdges color="blue" />
                   Review & Bid <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/30 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
         <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-blue-500 shrink-0 relative z-10">
            <TrendingUp className="w-8 h-8" />
         </div>
         <div className="flex-1 text-center md:text-left relative z-10">
            <h4 className="text-xl font-bold text-blue-900 dark:text-blue-100">Market Intelligence Dashboard</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1 max-w-2xl">
              Understand supply gaps and demand trends in your categories. Awarded bids increased by 15% for suppliers using intelligence tools.
            </p>
         </div>
         <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all active:scale-95 relative z-10">
            View Analysis
         </button>
      </div>

      <QuoteSubmissionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bidData={selectedBid}
      />
    </div>
  );
}
