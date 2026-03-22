"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Zap, 
  Plus, 
  Search, 
  Filter, 
  Settings2, 
  CircleDot, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw,
  Award,
  Globe,
  Trash2,
  Edit3
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * RC-07 — Auto-PO Rules
 * Purpose: Define automation logic for reordering inventory.
 */

export default function AutoPORules() {
  const { data: rules, isLoading } = useQuery({
    queryKey: ["buyer-auto-po-rules"],
    queryFn: async () => {
      const resp = await api.get("buyer/inventory/rules");
      return resp.data;
    }
  });

  return (
    <SecureOverlay>
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-24 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-slate-200 dark:border-slate-800 pb-8 transition-all">
          <div className="space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white italic">
               Automation <span className="text-brand-primary font-extrabold italic">Rules</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm flex items-center gap-3">
               <IconTooltip label="Automation Pulse"><Zap className="w-5 h-5 text-brand-primary animate-pulse" /></IconTooltip>
               Logic Engine: Active • Auto-Reorder Protocol
            </p>
          </div>

        <button className="h-10 px-6 bg-brand-primary text-slate-950 rounded-lg border border-brand-primary/50 flex items-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-95">
             <Plus size={18} />
             <span className="text-sm font-bold uppercase tracking-tight">New Rule</span>
        </button>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-12">
            <div className="grid grid-cols-1 gap-8">
               {isLoading ? (
                   [1,2,3].map(i => <div key={i} className="h-48 bg-muted/10 animate-pulse rounded-3xl" />)
               ) : rules?.map((rule: any) => (
                   <div key={rule.id} className="group relative bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:border-brand-primary overflow-hidden">
                       <div className="absolute inset-0 bg-indigo-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                       
                       <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
                           <div className={cn(
                               "h-12 w-12 rounded-xl border flex items-center justify-center text-2xl shadow-md group-hover:rotate-6 transition-transform",
                               rule.active ? "bg-brand-primary text-slate-950 border-brand-primary/50" : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400"
                           )}>
                               <IconTooltip label="Rule Logic"><Settings2 size={24} /></IconTooltip>
                           </div>
                           <div className="space-y-2">
                               <h3 className="text-xl font-bold italic tracking-tight text-brand-primary uppercase">{rule.product}</h3>
                               <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase italic">
                                   Trigger: Below {rule.threshold} units • Reorder: {rule.qty} units
                               </p>
                           </div>
                       </div>

                       <div className="flex items-center gap-4 relative z-10 w-full md:w-auto justify-end">
                           <div className={cn(
                               "h-8 px-6 rounded-lg border font-bold italic text-[10px] tracking-widest uppercase shadow-sm flex items-center",
                               rule.active ? "bg-brand-success/10 border-brand-success/20 text-brand-success" : "bg-slate-200/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-400"
                           )}>
                               {rule.active ? "Active" : "Disabled"}
                           </div>
                           <button className="h-10 w-10 bg-white dark:bg-slate-950 text-slate-400 hover:text-brand-primary rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm transition-all hover:scale-110">
                               <IconTooltip label="Edit Rule"><Edit3 size={18} /></IconTooltip>
                           </button>
                           <button className="h-10 w-10 bg-white dark:bg-slate-950 text-slate-400 hover:text-brand-destructive rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm transition-all hover:scale-110">
                               <IconTooltip label="Delete Rule"><Trash2 size={18} /></IconTooltip>
                           </button>
                       </div>
                   </div>
               ))}
            </div>
        </div>

        <aside className="lg:col-span-4 space-y-12">
            <div className="bg-brand-primary p-6 rounded-2xl border border-brand-primary/50 shadow-lg space-y-6 relative overflow-hidden group text-slate-950">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] pointer-events-none" />
                <h3 className="text-lg font-bold tracking-tight uppercase relative z-10 flex items-center gap-3 italic">
                    <IconTooltip label="Verification"><ShieldCheck size={20} /></IconTooltip> 
                    System Status
                </h3>
                
                <div className="space-y-4 relative z-10">
                    <div className="p-4 bg-white/10 rounded-lg border border-white/20 italic">
                        <p className="text-[10px] font-bold leading-relaxed uppercase">
                            Automation requires high inventory accuracy. Rules are only triggered when inventory data is synchronized and verified.
                        </p>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-950/10 flex items-center gap-4 relative z-10">
                   <IconTooltip label="System Pulse"><RefreshCw size={20} className="animate-spin-slow" /></IconTooltip>
                   <div>
                       <p className="text-[10px] font-bold tracking-widest opacity-60 uppercase">Last Ping</p>
                       <p className="text-lg font-bold italic tracking-tight uppercase">0.4ms (Healthy)</p>
                   </div>
                </div>
            </div>
        </aside>
      </main>
    </div>
    </SecureOverlay>
  );
}
