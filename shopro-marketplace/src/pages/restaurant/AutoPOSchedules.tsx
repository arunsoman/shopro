"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  CircleDot, 
  ArrowRight, 
  Zap,
  Globe,
  Award,
  ShieldCheck,
  RefreshCw,
  Box,
  Layers
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * RC-08 — Auto-PO Schedules
 * Purpose: Plan reorder cycles based on temporal parameters.
 */

export default function AutoPOSchedules() {
  const navigate = useNavigate();

  return (
    <SecureOverlay>
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-24 text-slate-900 dark:text-white">
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-slate-200 dark:border-slate-800 pb-8 transition-all">
          <div className="space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white italic">
               Automation <span className="text-brand-primary font-extrabold italic">Schedules</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm flex items-center gap-3">
               <IconTooltip label="Temporal Sync"><Calendar className="w-5 h-5 text-brand-primary animate-pulse" /></IconTooltip>
               Scheduler Sync: Active • Automation Enabled
            </p>
          </div>

        <button className="h-10 px-6 bg-brand-primary text-slate-950 rounded-lg border border-brand-primary/50 flex items-center gap-3 shadow-md transition-all hover:scale-[1.02] active:scale-95">
             <Plus size={18} />
             <span className="text-sm font-bold uppercase tracking-tight">New Schedule</span>
        </button>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-8">
            <div className="p-6 bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] pointer-events-none" />
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-4 relative z-10 italic uppercase">
                    <IconTooltip label="Batch Cycles"><Layers size={24} className="text-brand-primary" /></IconTooltip> 
                    Recurring Cycles
                </h2>
                
                <div className="grid grid-cols-1 gap-6 relative z-10">
                    {[
                        { title: "Weekly Dairy Sync", time: "Mon 08:00 AM", interval: "Every 7 days", active: true },
                        { title: "Produce Restock", time: "Daily 06:00 AM", interval: "Every 24 hours", active: true },
                        { title: "Dry Goods Monthly", time: "1st of Month", interval: "Monthly", active: false },
                    ].map((sched, i) => (
                        <div key={i} className="group/item relative bg-slate-100/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:bg-white dark:hover:bg-slate-950 hover:border-brand-primary">
                           <div className="flex items-center gap-6 w-full md:w-auto">
                               <div className={cn(
                                  "h-12 w-12 rounded-lg border flex items-center justify-center text-slate-400 shadow-md group-hover/item:rotate-6 transition-transform",
                                  sched.active ? "bg-brand-primary text-slate-950 border-brand-primary/50" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                               )}>
                                 <Clock size={20} />
                              </div>
                              <div className="space-y-1">
                                  <h3 className="text-lg font-bold tracking-tight text-brand-primary uppercase leading-none italic">{sched.title}</h3>
                                  <p className="text-[10px] text-slate-400 font-bold tracking-widest leading-none uppercase italic">{sched.interval} • Next Run: {sched.time}</p>
                              </div>
                           </div>
                           <div className={cn(
                               "h-8 px-6 rounded-lg border font-bold italic text-[10px] tracking-widest uppercase shadow-sm flex items-center",
                               sched.active ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-slate-200/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-400"
                           )}>
                               {sched.active ? "Active" : "Paused"}
                           </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <aside className="lg:col-span-4 space-y-6">
            <div className="bg-brand-primary p-6 rounded-2xl border border-brand-primary/50 shadow-lg space-y-6 relative overflow-hidden group text-slate-950">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] pointer-events-none" />
               <h3 className="text-lg font-bold tracking-tight uppercase relative z-10 flex items-center gap-3 italic">
                    <IconTooltip label="Global Sync"><Globe size={20} /></IconTooltip> 
                    System Clock
               </h3>
               
               <div className="space-y-6 relative z-10">
                    <div className="text-5xl font-extrabold tracking-tight">14:42</div>
                    <div className="space-y-4">
                        <p className="text-[10px] font-bold tracking-widest opacity-60 uppercase italic">System Time (UTC)</p>
                        <div className="p-4 bg-white/10 rounded-xl border border-white/20 italic">
                            <p className="text-xs font-bold leading-relaxed uppercase">
                                Schedules are optimized for supplier delivery windows. Daily data reconciliation occurs at 11:59 PM.
                            </p>
                        </div>
                    </div>
               </div>
            </div>
        </aside>
      </main>
    </div>
    </SecureOverlay>
  );
}
