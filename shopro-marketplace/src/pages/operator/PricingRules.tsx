"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Plus, 
  DollarSign, 
  Percent, 
  Tag, 
  MoreVertical,
  ArrowRight,
  TrendingUp,
  Scale,
  Calculator,
  Gavel,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  ShieldCheck,
  Settings2,
  Database,
  RefreshCw,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * OP-20 — Pricing Rules Engine
 * Purpose: Algorithmic yield management and strategy forge.
 */

interface PricingRule {
  id: string;
  name: string;
  type: string;
  discount?: string;
  adjustment?: string;
  status: string;
}

export default function PricingRules() {
  const { data: rules = [], isLoading } = useQuery<PricingRule[]>({
    queryKey: ["operator-pricing-rules"],
    queryFn: async () => {
      const resp = await api.get("operator/catalog/pricing-rules");
      return resp.data;
    }
  });

  return (
    <SecureOverlay>
    <div className="max-w-[1280px] mx-auto space-y-8 animate-in fade-in duration-1000 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-(--sp-border) pb-8">
        <div className="space-y-2">
          <h1 className="text-[28px] font-medium tracking-tight text-(--sp-text-0)">
             Pricing <span className="text-(--sp-cyan) font-semibold">engine</span>
          </h1>
          <div className="flex items-center gap-3">
             <Scale className="w-5 h-5 text-(--sp-cyan)" />
             <p className="text-(--sp-text-3) text-[13px] font-medium">
                Algorithmic yield management and strategy forge.
             </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="h-9 px-4 bg-(--sp-bg-1) border border-(--sp-border) text-(--sp-text-1) rounded-md text-[11px] font-bold uppercase tracking-wider hover:bg-(--sp-bg-0) transition-all shadow-sm flex items-center gap-2">
              <Calculator size={16} /> Simulator
           </button>
           <button className="h-9 px-4 bg-(--sp-cyan) text-white rounded-md text-[11px] font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-sm uppercase tracking-wider">
              <Plus size={16} /> New strategy
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Active Rules Inventory */}
         <div className="lg:col-span-8 space-y-6">
            <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-sm overflow-hidden">
               <div className="p-6 border-b border-(--sp-border) flex items-center justify-between">
                  <h3 className="text-[18px] font-medium text-(--sp-text-0) flex items-center gap-3">
                     <Gavel className="w-5 h-5 text-(--sp-cyan)" />
                     Strategy pipeline
                  </h3>
                  <div className="flex bg-(--sp-bg-1) p-1 rounded-md border border-(--sp-border) shadow-sm">
                     {["ACTIVE", "ARCHIVED"].map(t => (
                       <button key={t} className={cn("px-4 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all", t === "ACTIVE" ? "bg-white text-(--sp-cyan) shadow-sm" : "text-(--sp-text-3) hover:text-(--sp-text-1)")}>
                          {t}
                       </button>
                     ))}
                  </div>
               </div>

               <div className="p-6 space-y-4">
                   {isLoading ? (
                       <div className="py-20 text-center flex flex-col items-center justify-center space-y-4 opacity-40">
                           <RefreshCw className="w-10 h-10 text-(--sp-cyan) animate-spin" />
                           <p className="tracking-wider text-[11px] font-bold uppercase">Forging matrix...</p>
                       </div>
                   ) : rules.map(rule => (
                    <div key={rule.id} className="group/card bg-(--sp-bg-1) border border-(--sp-border) p-6 rounded-md shadow-sm transition-all hover:border-(--sp-cyan)/30 relative overflow-hidden">
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                          <div className="flex items-center gap-4">
                             <div className={cn(
                               "w-10 h-10 rounded-md flex items-center justify-center border shadow-sm transition-all",
                               rule.status === 'Active' ? "bg-(--sp-cyan) text-white border-(--sp-cyan)/50" : "bg-(--sp-bg-2) text-(--sp-text-3) border-(--sp-border)"
                             )}>
                                {rule.type === 'Base' ? <Database size={20} /> : 
                                 rule.type === 'Surcharge' ? <TrendingUp size={20} /> : 
                                 <Percent size={20} />}
                             </div>
                             <div className="space-y-1">
                                <h4 className="text-[16px] font-semibold text-(--sp-text-1) uppercase tracking-tight">{rule.name}</h4>
                                <div className="flex items-center gap-3">
                                   <span className="text-[10px] font-bold uppercase text-(--sp-text-3) tracking-wider">Target: {rule.type}</span>
                                   <div className="w-1 h-1 rounded-full bg-(--sp-border)" />
                                   <span className="text-[10px] font-bold uppercase text-(--sp-text-3) tracking-wider">ID: {rule.id}</span>
                                </div>
                             </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-8">
                             <div className="text-right">
                                <div className={cn("text-[24px] font-semibold tracking-tight tabular-nums leading-none", rule.adjustment?.startsWith('+') ? 'text-rose-500' : 'text-emerald-500')}>
                                   {rule.discount || rule.adjustment}
                                </div>
                                <div className="text-[10px] font-bold uppercase opacity-40 tracking-wider text-(--sp-text-3) mt-1">Variance</div>
                             </div>
                             <div className="flex items-center gap-2">
                                <button className="w-8 h-8 rounded-md bg-(--sp-bg-2) text-(--sp-text-3) hover:text-(--sp-cyan) transition-all border border-(--sp-border) shadow-sm flex items-center justify-center opacity-0 group-hover/card:opacity-100"><Settings2 size={16} /></button>
                                <button className="w-8 h-8 rounded-md text-(--sp-text-3) hover:text-rose-500 transition-all flex items-center justify-center opacity-0 group-hover/card:opacity-100"><MoreVertical size={16} /></button>
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Live Preview & Analytics Sidebar */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 rounded-md p-8 text-white shadow-md relative overflow-hidden group border-b-4 border-emerald-500/20">
               <h3 className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-8 opacity-60">Pricing pulse</h3>
               
               <div className="space-y-8 relative z-10">
                  <div>
                     <div className="flex justify-between items-end mb-4">
                        <div className="text-[48px] font-semibold tracking-tighter leading-none">18.4%</div>
                        <div className="text-emerald-400 text-[10px] font-bold uppercase flex items-center gap-2 border border-emerald-500/20 px-3 py-1 rounded bg-emerald-500/10 tracking-wider">Optimal <ShieldCheck size={14} /></div>
                     </div>
                     <div className="text-[11px] font-bold uppercase text-white/40 mb-4 tracking-wider">Weighted margin</div>
                     <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: "74%" }} className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                     </div>
                  </div>

                  <div className="p-6 bg-white/5 rounded-md border border-white/10 shadow-inner group/stat">
                     <h4 className="text-[10px] font-bold uppercase tracking-wider mb-6 opacity-40 group-hover/stat:opacity-100 transition-opacity">Est revenue impact</h4>
                     <div className="grid grid-cols-1 gap-6 tabular-nums">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                           <div className="text-[20px] font-semibold text-emerald-400">+$12.4K</div>
                           <div className="text-[9px] font-bold uppercase opacity-40 tracking-wider">Daily uplift</div>
                        </div>
                        <div className="flex items-center justify-between">
                           <div className="text-[20px] font-semibold text-emerald-400">96.4%</div>
                           <div className="text-[9px] font-bold uppercase opacity-40 tracking-wider">Capture rate</div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) border-t-4 border-rose-500 shadow-sm p-8 group relative overflow-hidden">
               <h3 className="text-[18px] font-medium mb-8 flex items-center gap-3 text-(--sp-text-0)">
                  <Zap className="w-5 h-5 text-amber-500" />
                  Surge alerts
               </h3>
               <div className="space-y-6">
                  <div className="flex gap-4 p-4 rounded-md bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-500/20">
                     <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                     <div className="space-y-1">
                        <p className="text-[14px] font-semibold text-rose-600">Undercut signal</p>
                        <p className="text-[12px] text-(--sp-text-2) leading-relaxed">
                           Prices in Region UAE-W are 4% lower than current base point.
                        </p>
                     </div>
                  </div>
                  <div className="flex gap-4 p-4 rounded-md bg-(--sp-bg-1) border border-(--sp-border)">
                     <Clock className="w-5 h-5 text-(--sp-cyan) shrink-0" />
                     <div className="space-y-1">
                        <p className="text-[14px] font-semibold text-(--sp-text-1)">Expiry threshold</p>
                        <p className="text-[12px] text-(--sp-text-2) leading-relaxed">
                           Seasonal Dairy Surge expires in 48 hours. Node reconciliation required.
                        </p>
                     </div>
                  </div>
               </div>
               <button className="w-full mt-8 h-9 rounded-md bg-(--sp-cyan) text-white text-[11px] font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-sm">
                  Optimize strategy
               </button>
            </div>
         </div>
      </div>
    </div>
    </SecureOverlay>
  );
}
