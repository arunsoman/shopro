"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { 
  FileText, 
  Clock, 
  ArrowRight, 
  Search, 
  Filter, 
  ChevronRight,
  TrendingUp,
  Package,
  Zap,
  RefreshCw,
  Target
} from "lucide-react";
import { SecureOverlay } from "@/components/SecureOverlay";
import { StatusBadge } from "@/components/ui/status-badge";
import QuoteSubmissionModal from "@/components/supplier/QuoteSubmissionModal";

/**
 * S-04 — Bid Invitations
 * Purpose: Open opportunities from the Shopro Marketplace for suppliers.
 */

interface BidInvitation {
  id: string;
  title: string;
  category: string;
  deadline: string;
  status: string;
  targetVolume: number;
}

export default function BidInvitations() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedBid, setSelectedBid] = React.useState<any>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const { data: invitations = [], isLoading } = useQuery<BidInvitation[]>({
    queryKey: ["supplier-bid-invitations"],
    queryFn: async () => {
      const resp = await api.get("/api/supplier/bids/invitations");
      return resp.data;
    }
  });

  const filteredBids = invitations.filter(inv => 
    inv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenBid = (bid: any) => {
    setSelectedBid(bid);
    setIsModalOpen(true);
  };

  return (
    <SecureOverlay>
    <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-1000 font-black italic uppercase leading-none pb-24 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 border-b-8 border-slate-100 dark:border-slate-800 pb-12 font-black italic leading-none shadow-inner">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter italic uppercase leading-none shadow-text mt-4">
             Bidding <span className="text-indigo-500">Nexus.X</span>
          </h1>
          <p className="text-slate-500 font-black italic text-xl tracking-wide opacity-60 leading-none flex items-center gap-4">
             <Target className="w-8 h-8 text-indigo-500 animate-pulse" />
             Open restock invitations from the Shopro Marketplace nodes.
          </p>
        </div>
        
        <div className="flex items-center gap-6 font-black italic uppercase tracking-[0.4em] leading-none">
          <div className="flex items-center gap-6 bg-white dark:bg-slate-950 px-8 py-5 rounded-[1.5rem] border-4 border-slate-50 dark:border-slate-800 shadow-xl shadow-inner">
             <Search size={24} className="text-slate-400" />
             <input 
               type="text" 
               placeholder="SEARCH_BIDS.NODE..." 
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

      {/* Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 font-black italic uppercase leading-none">
        {isLoading ? (
            <div className="lg:col-span-2 p-40 flex flex-col items-center justify-center space-y-12 opacity-40">
                <RefreshCw className="w-20 h-20 text-indigo-500 animate-spin" />
                <p className="text-[12px] tracking-[0.6em] font-black italic">SCANNING_MARKET_FLUX.X...</p>
            </div>
        ) : filteredBids.map((bid, i) => (
          <motion.div
            key={bid.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl rounded-[3rem] p-10 border-4 border-slate-100 dark:border-slate-800 hover:border-indigo-500 transition-all cursor-crosshair shadow-4xl overflow-hidden shadow-inner"
          >
            <div className="relative z-10 space-y-8">
               <div className="flex items-start justify-between">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 rounded-[1.25rem] bg-indigo-600 text-white flex items-center justify-center shadow-4xl border-4 border-indigo-400 transition-all group-hover:scale-110">
                        <FileText size={32} />
                     </div>
                     <div className="space-y-2">
                        <div className="text-[10px] font-black tracking-[0.4em] text-slate-400 opacity-60 leading-none">{bid.id}</div>
                        <div className="text-[10px] font-black text-indigo-500 tracking-[0.3em] leading-none">{bid.category}</div>
                     </div>
                  </div>
                  <StatusBadge 
                    status={bid.status === "CLOSING_SOON" ? "RAISED" : "PENDING"} 
                    label={bid.status} 
                  />
               </div>

               <div className="space-y-4">
                  <h3 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors shadow-text">
                     {bid.title}
                  </h3>
                  <div className="flex items-center gap-8 py-4 border-y-4 border-slate-50 dark:border-slate-800 shadow-inner">
                     <div className="flex items-center gap-3 text-xs font-black tracking-widest text-slate-500">
                        <Package size={18} className="text-indigo-500" /> {bid.targetVolume.toLocaleString()} UNIT_FLUX
                     </div>
                     <div className="flex items-center gap-3 text-xs font-black tracking-widest text-amber-500 bg-amber-500/5 px-4 py-2 rounded-xl">
                        <Clock size={18} /> CLOSES_{bid.deadline.split('T')[0]}
                     </div>
                  </div>
               </div>

               <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-4">
                     <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center text-[10px] font-black text-white dark:text-slate-900 shadow-4xl italic">S</div>
                     <span className="text-[10px] font-black text-slate-400 tracking-[0.3em] italic opacity-60">SHOPRO_MARKETPLACE.NODE</span>
                  </div>
                  <button 
                    onClick={() => handleOpenBid(bid)}
                    className="h-16 px-8 bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-[1.25rem] text-[10px] font-black flex items-center gap-4 hover:shadow-4xl hover:scale-110 active:scale-95 transition-all shadow-xl group/btn border-4 border-indigo-500 italic"
                  >
                     REVIEW_&_BID.FORCE <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                  </button>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Market Intelligence Alert */}
      <div className="p-12 bg-indigo-600 rounded-[4rem] border-b-[1.5rem] border-indigo-800 shadow-4xl flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden group shadow-inner">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px] pointer-events-none group-hover:scale-125 transition-transform duration-[5000ms]" />
         <div className="w-24 h-24 rounded-[2rem] bg-white/10 backdrop-blur-3xl border-4 border-white/10 shadow-4xl flex items-center justify-center text-white shrink-0 relative z-10 transition-all group-hover:rotate-12">
            <TrendingUp size={48} />
         </div>
         <div className="flex-1 text-center lg:text-left relative z-10 space-y-4">
            <h4 className="text-4xl font-black italic tracking-tighter text-white uppercase shadow-text">Market Intelligence.CORE</h4>
            <p className="text-xl text-indigo-100 font-black italic opacity-80 leading-relaxed uppercase tracking-wide">
              Understand supply gaps and demand trends in your categories. Awarded bids increased by 15% for suppliers using intelligence tools alpha.
            </p>
         </div>
         <button className="h-20 px-12 bg-white text-slate-900 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.5em] shadow-4xl transition-all hover:scale-110 active:scale-95 relative z-10 border-4 border-indigo-400 italic">
            LAUNCH_ANALYSIS.FORCE
         </button>
      </div>

      <QuoteSubmissionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bidData={selectedBid}
      />
    </div>
    </SecureOverlay>
  );
}
