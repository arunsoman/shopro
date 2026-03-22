"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { 
  Zap, 
  Search, 
  Filter, 
  ArrowUpRight, 
  MapPin, 
  Clock, 
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Target,
  Box,
  ChevronRight
} from "lucide-react";
import { SecureOverlay } from "@/components/SecureOverlay";
import { StatusBadge } from "@/components/ui/status-badge";

/**
 * S-04 — Market Lead Response
 * Purpose: View and respond to market leads for suppliers.
 */

interface MarketLead {
  id: string;
  requirement: string;
  category: string;
  volume: string;
  proximity: string;
  urgency: string;
}

export default function LeadResponse() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const { data: leads = [], isLoading } = useQuery<MarketLead[]>({
    queryKey: ["supplier-market-leads"],
    queryFn: async () => {
      const resp = await api.get("/api/supplier/leads");
      return resp.data;
    }
  });

  const filteredLeads = leads.filter(l => 
    l.requirement.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SecureOverlay>
    <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-1000 font-black italic uppercase leading-none pb-24 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 border-b-8 border-slate-100 dark:border-slate-800 pb-12 font-black italic leading-none shadow-inner">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter italic uppercase leading-none shadow-text mt-4">
             Lead <span className="text-indigo-500">Pulse.X</span>
          </h1>
          <p className="text-slate-500 font-black italic text-xl tracking-wide opacity-60 leading-none flex items-center gap-4">
             <Zap className="w-8 h-8 text-indigo-500 animate-bounce" />
             Real-time market requirement nodes and lead signals alpha.
          </p>
        </div>
        
        <div className="flex items-center gap-6 font-black italic uppercase tracking-[0.4em] leading-none">
          <div className="flex items-center gap-6 bg-white dark:bg-slate-950 px-8 py-5 rounded-[1.5rem] border-4 border-slate-50 dark:border-slate-800 shadow-xl shadow-inner">
             <Search size={24} className="text-slate-400" />
             <input 
               type="text" 
               placeholder="SCAN_LEAD_SIGNALS.NODE..." 
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

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 font-black italic uppercase leading-none">
        {isLoading ? (
          <div className="md:col-span-2 p-40 flex flex-col items-center justify-center space-y-12 opacity-40">
              <RefreshCw className="w-20 h-20 text-indigo-500 animate-spin" />
              <p className="text-[12px] tracking-[0.6em] font-black italic">FETCHING_SIGNAL_STREAM.X...</p>
          </div>
        ) : filteredLeads.map((lead, i) => (
          <motion.div
            key={lead.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="group relative bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl rounded-[3rem] p-10 border-4 border-slate-100 dark:border-slate-800 hover:border-indigo-500 transition-all cursor-crosshair shadow-4xl overflow-hidden shadow-inner flex flex-col justify-between"
          >
             <div className="absolute top-0 right-0 p-8">
                <StatusBadge 
                  status={lead.urgency === "IMMEDIATE" ? "RAISED" : "PENDING"} 
                  label={lead.urgency} 
                />
             </div>

             <div className="space-y-8 relative z-10">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 rounded-[1.25rem] bg-slate-950 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-4xl border-4 border-indigo-500 transition-all group-hover:scale-110">
                      <Target size={32} />
                   </div>
                   <div className="space-y-2">
                       <div className="text-[10px] font-black tracking-[0.4em] text-slate-400 opacity-60 leading-none">{lead.id}</div>
                       <div className="text-[10px] font-black text-indigo-500 tracking-[0.3em] leading-none">{lead.category}</div>
                   </div>
                </div>

                <div className="space-y-6">
                   <h3 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors shadow-text leading-tight">
                      {lead.requirement}
                   </h3>
                   
                   <div className="grid grid-cols-2 gap-6 p-8 bg-slate-50/50 dark:bg-slate-950/30 rounded-[2rem] border-4 border-slate-100 dark:border-slate-800/60 shadow-inner">
                      {[
                        { label: "VOLUME.X", val: lead.volume, icon: Box },
                        { label: "PROXIMITY.NODE", val: lead.proximity, icon: MapPin },
                      ].map((attr, idx) => (
                        <div key={idx} className="space-y-3">
                           <div className="text-[9px] font-black text-slate-400 tracking-[0.3em] italic opacity-60 flex items-center gap-2">
                              <attr.icon size={12} className="text-indigo-500" /> {attr.label}
                           </div>
                           <div className="text-xl font-black italic text-slate-900 dark:text-white">{attr.val}</div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             <div className="mt-10 pt-8 border-t-8 border-slate-100 dark:border-slate-800/60 flex items-center justify-between relative z-10 transition-all">
                <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 italic tracking-[0.2em] opacity-60">
                   <Clock size={16} className="text-indigo-500" /> SIGNAL_STRENGTH_94%
                </div>
                <button className="h-16 px-10 bg-indigo-600 text-white rounded-[1.25rem] text-[10px] font-black flex items-center gap-4 hover:shadow-4xl hover:scale-110 active:scale-95 transition-all shadow-xl group/btn border-4 border-indigo-400 italic">
                   RESPOND_TO_SIGNAL.FORCE <ArrowUpRight className="w-5 h-5 group-hover/btn:translate-x-2 group-hover/btn:-translate-y-2 transition-transform" />
                </button>
             </div>
          </motion.div>
        ))}
      </div>

      {/* Intelligence Banner */}
      <div className="p-12 bg-slate-950 rounded-[4rem] border-b-[1.5rem] border-indigo-600 shadow-4xl flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden group shadow-inner">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px] pointer-events-none group-hover:scale-125 transition-transform duration-[5000ms]" />
         <div className="w-24 h-24 rounded-[2rem] bg-white/5 border-4 border-white/5 shadow-4xl flex items-center justify-center text-white shrink-0 relative z-10">
            <TrendingUp size={48} className="text-indigo-500 animate-pulse" />
         </div>
         <div className="flex-1 text-center lg:text-left relative z-10 space-y-4">
            <h4 className="text-4xl font-black italic tracking-tighter text-white uppercase shadow-text">Velocity Analytics.CORE</h4>
            <p className="text-xl text-slate-400 font-black italic opacity-80 leading-relaxed uppercase tracking-wide">
              Lead conversion is 3x higher for responses within 30 minutes of signal detection node alpha.
            </p>
         </div>
         <button className="h-20 px-12 bg-white text-slate-900 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.5em] shadow-4xl transition-all hover:scale-110 active:scale-95 relative z-10 border-4 border-indigo-500 italic">
            VIEW_CONVERSION_MAP.FORCE
         </button>
      </div>
    </div>
    </SecureOverlay>
  );
}
