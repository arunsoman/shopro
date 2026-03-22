"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  FileText, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download, 
  MoreVertical,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Receipt,
  Landmark,
  Layers,
  Settings2,
  RefreshCw
} from "lucide-react";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

// ─── PAGE COMPONENT ──────────────────────────────────────────────────────────

// ─── PAGE COMPONENT ──────────────────────────────────────────────────────────

interface Settlement {
  id: string;
  date: string;
  entity: string;
  type: string;
  amount: string;
  status: string;
  bank: string;
}

export default function SettlementLogs() {
  const { data: settlements = [], isLoading } = useQuery<Settlement[]>({
    queryKey: ["settlements"],
    queryFn: async () => {
      const resp = await api.get("/operator/finance/settlements");
      return resp.data;
    }
  });

  const [isClearing, setIsClearing] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  return (
    <SecureOverlay>
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-(--sp-border) mt-4">
          <div className="space-y-1">
            <h1 className="text-[28px] font-medium tracking-[-0.02em] text-(--sp-text-0)">
               Settlement logs
            </h1>
            <div className="flex items-center gap-2">
               <Receipt className="w-4 h-4 text-emerald-500" />
               <p className="text-[13px] text-(--sp-text-2)">
                  Auditable financial clearing and entity payout tracking.
               </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="h-9 px-4 rounded-[6px] bg-(--sp-bg-2) border border-(--sp-border) text-[13px] font-medium hover:bg-(--sp-bg-1)/50 transition-all flex items-center gap-2 text-(--sp-text-1)">
                <Download size={14} /> Audit pack
             </button>
             <button 
                onClick={() => setShowManualModal(true)}
                className="h-9 px-4 rounded-[6px] bg-emerald-500 text-white text-[13px] font-medium hover:opacity-90 transition-all shadow-sm flex items-center gap-2"
              >
                <Landmark size={14} /> Manual clearing
             </button>
          </div>
        </header>

        {/* Financial Summary Overlay */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           {[
             { label: "Gross clearing", val: "$420.5k", sub: "Last 7 days", trend: "up", icon: Layers },
             { label: "Supplier payouts", val: "$380.2k", sub: "85 Entities", trend: "up", icon: DollarSign },
             { label: "Commission yield", val: "$32.4k", sub: "Net ROI", trend: "up", icon: CheckCircle2 },
             { label: "Awaiting clearance", val: "$12.8k", sub: "3 Flagged entries", trend: "neutral", icon: Clock },
           ].map((stat, i) => (
             <div key={i} className="bg-(--sp-bg-2) rounded-[12px] border border-(--sp-border) p-5 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                   <div className="w-8 h-8 rounded-[8px] bg-(--sp-bg-3) flex items-center justify-center text-(--sp-text-2) border border-(--sp-border)">
                      <stat.icon size={16} />
                   </div>
                   <div className="text-[10px] font-medium text-emerald-500 uppercase tracking-[0.06em] px-2 py-0.5 bg-emerald-500/5 rounded-full border border-emerald-500/20">
                      Stable
                   </div>
                </div>
                <div>
                   <div className="text-[11px] font-medium text-(--sp-text-2) uppercase tracking-[0.04em] mb-1">{stat.label}</div>
                   <div className="text-[24px] font-light text-(--sp-text-0) tracking-[-0.01em] mb-1 tabular-nums">{stat.val}</div>
                   <div className="text-[11px] text-(--sp-text-3)">{stat.sub}</div>
                </div>
             </div>
           ))}
        </div>

        {/* Clearing Registry */}
        <div className="bg-(--sp-bg-2) rounded-[12px] border border-(--sp-border) shadow-sm overflow-hidden">
           <div className="p-6 border-b border-(--sp-border) bg-(--sp-bg-1)/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="text-[16px] font-medium text-(--sp-text-0)">Transaction nodal snapshot</h3>
              
              <div className="flex items-center gap-1 bg-(--sp-bg-0) p-1 rounded-[8px] border border-(--sp-border)">
                 {["Month", "Week", "Day"].map(t => (
                   <button key={t} className={cn("px-4 py-1 rounded-[6px] text-[11px] font-medium uppercase tracking-[0.04em] transition-all", t === "Month" ? "bg-(--sp-bg-2) text-(--sp-text-0) shadow-sm border border-(--sp-border)" : "text-(--sp-text-2) hover:text-(--sp-text-1)")}>
                      {t}
                   </button>
                 ))}
              </div>
           </div>

           {isLoading ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-4">
                    <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                    <p className="text-[13px] text-(--sp-text-2) font-medium">Parsing clearing registry...</p>
                </div>
           ) : (
           <div className="divide-y divide-(--sp-border)">
              {settlements.map(stl => (
                 <div key={stl.id} className="group/row p-6 hover:bg-(--sp-bg-1)/30 transition-colors cursor-pointer">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                       <div className="flex items-center gap-6 flex-1">
                          <div className={cn(
                            stl.status === 'Processed' ? "bg-emerald-500 text-white" : 
                            stl.status === 'Flagged' ? "bg-rose-500 text-white" : 
                            "bg-card text-muted-foreground"
                          )}>
                             {stl.type.includes('Payout') ? <ArrowUpRight className="w-10 h-10" /> : <ArrowDownLeft className="w-10 h-10" />}
                          </div>
                          <div>
                             <div className="flex items-center gap-4 mb-2 font-bold italic">
                                <span className="text-2xs font-bold italic text-primary tracking-widest uppercase">{stl.id}</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-border" />
                                <span className="text-2xs font-bold italic text-secondary tracking-widest uppercase opacity-60">{stl.date}</span>
                             </div>
                             <h4 className="text-2xl font-bold italic tracking-tighter mb-2 group-hover:text-primary transition-colors uppercase leading-none text-primary">{stl.entity}</h4>
                             <div className="flex items-center gap-3 text-2xs font-bold text-secondary uppercase tracking-widest italic opacity-60">
                                <IconTooltip label="Settlement Bank"><Landmark size={14} className="text-primary" /></IconTooltip> {stl.bank}
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center justify-between lg:justify-end gap-12 font-bold italic uppercase leading-none">
                          <div className="text-right">
                             <div className="text-4xl tracking-tighter mb-2 tabular-nums text-primary font-bold">{stl.amount}</div>
                             <div className="text-2xs font-bold uppercase text-secondary tracking-widest italic leading-none opacity-60">{stl.type}</div>
                          </div>
                          <div className="flex items-center gap-6">
                             <div className={cn(
                               "px-6 py-2 rounded-lg text-2xs font-bold uppercase tracking-widest italic border shadow-sm font-bold",
                               stl.status === 'Processed' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : 
                               stl.status === 'Flagged' ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : 
                               "bg-muted text-secondary border-border"
                             )}>
                                {stl.status}
                             </div>
                             <button className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-secondary hover:text-primary transition-all shadow-lg font-bold">
                                <MoreVertical size={20} />
                             </button>
                          </div>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
           )}

           <div className="p-6 border-t border-(--sp-border) bg-(--sp-bg-1)/30 flex justify-center">
              <button className="h-9 px-6 rounded-[6px] border border-(--sp-border) text-[12px] font-medium text-(--sp-text-1) hover:bg-(--sp-bg-1)/50 transition-all shadow-sm">
                 Load full ledger registry
              </button>
           </div>
        </div>

        {/* Global Controls Overlay */}
        <div className="mt-16 flex flex-col lg:flex-row gap-8 font-bold italic uppercase">
        <div className="bg-(--sp-bg-2) rounded-[12px] border border-(--sp-border) p-8 shadow-sm relative overflow-hidden group">
           <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
              <div className="flex items-start gap-6">
                 <div className="w-12 h-12 rounded-[8px] bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <ShieldCheck className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="text-[18px] font-medium text-(--sp-text-0) mb-1">Bulk verification node</h3>
                    <p className="text-[13px] text-(--sp-text-2) max-w-lg leading-relaxed">Execute synchronous clearing for all 14 pending supplier payouts currently scheduled for end-of-day reconciliation.</p>
                 </div>
              </div>
               <button 
                disabled={isClearing}
                className="h-10 px-8 rounded-[6px] bg-emerald-500 text-white text-[13px] font-medium hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
              >
                {isClearing ? "Clearing..." : "Batch clear protocol"}
              </button>
           </div>
        </div>
        </div>

        {/* Modal for Manual Entry */}
        <AnimatePresence>
          {showManualModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-(--sp-bg-2) p-8 rounded-[16px] border border-(--sp-border) shadow-2xl w-[480px] max-w-full relative overflow-hidden"
              >
                <h3 className="text-[20px] font-medium tracking-[-0.01em] mb-8 flex items-center gap-3 text-(--sp-text-0)">
                   <Landmark size={24} className="text-emerald-500" /> Manual clearing entry
                </h3>
                <form className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium uppercase tracking-[0.04em] text-(--sp-text-2) ml-1">Entity identification</label>
                    <input type="text" placeholder="e.g. Ad-hoc adjustment protocol" className="w-full h-11 bg-(--sp-bg-0) px-4 rounded-[8px] border border-(--sp-border) focus:border-emerald-500/30 outline-none text-[13px] text-(--sp-text-0) transition-all" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium uppercase tracking-[0.04em] text-(--sp-text-2) ml-1">Quantum amount</label>
                    <input type="text" placeholder="$0.00" className="w-full h-11 bg-(--sp-bg-0) px-4 rounded-[8px] border border-(--sp-border) focus:border-emerald-500/30 outline-none text-[13px] text-(--sp-text-0) transition-all" required />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setShowManualModal(false)} className="flex-1 h-10 rounded-[6px] border border-(--sp-border) text-[13px] font-medium text-(--sp-text-1) hover:bg-(--sp-bg-1)/50 transition-all">Cancel</button>
                    <button type="submit" className="flex-1 h-10 rounded-[6px] bg-emerald-500 text-white text-[13px] font-medium transition-all shadow-sm">Create audit entry</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </SecureOverlay>
  );
}
