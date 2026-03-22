"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, Target, Zap, ChevronRight, Info, Settings, RefreshCw, Filter, ShieldCheck, Search, Percent, BarChart3, LineChart, PieChart, Download, ArrowUpRight, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * OP-22 — Margin Optimization
 * Purpose: Profitability levers (Logistics cost vs Unit price).
 * DNA: Scissor-chart logic (Revenue vs Cost), "Surgical" price overrides.
 */

interface OptimizationStats {
  avgMargin: number;
  marginLeakage: number;
  priceCompetitiveness: number;
  activePromotions: number;
}

export default function MarginOptimization() {
  const [multiplier, setMultiplier] = useState(1.2);
  const [surcharge, setSurcharge] = useState(45);
  const [isCommitting, setIsCommitting] = useState(false);

  const { data: stats, isLoading } = useQuery<OptimizationStats>({
    queryKey: ["operator-optimization-stats"],
    queryFn: async () => {
      const resp = await api.get("/operator/catalog/optimization-stats");
      return resp.data;
    }
  });
  return (
    <SecureOverlay>
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-emerald-500">
        <div className="space-y-1">
          <h1 className="text-[28px] font-medium tracking-[-0.02em] text-(--sp-text-0)">
             Margin control
          </h1>
          <div className="flex items-center gap-2">
             <BarChart3 className="w-4 h-4 text-(--sp-cyan)" />
             <p className="text-[13px] text-(--sp-text-2)">
                Analyzing price sensitivity and logistics overhead.
             </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button className="bg-sp-bg-2 text-sp-text-1 h-9 px-4 rounded-md text-[12px] font-medium flex items-center gap-2 border border-emerald-500 hover:text-sp-text-0 transition-all shadow-sm">
            <Filter size={14} className="text-sp-cyan" /> Sim mode
          </button>
          <button className="bg-sp-cyan text-white h-9 px-4 rounded-md text-[12px] font-medium flex items-center gap-2 hover:opacity-90 transition-all shadow-sm">
            <Zap size={15} /> Price override
          </button>
        </div>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Net margin", value: stats ? `${stats.avgMargin}%` : "14.2%", trend: "+2.1%", status: "UP", color: "emerald" },
          { label: "Leakage", value: stats ? `${stats.marginLeakage}%` : "2.4%", trend: "-1.2%", status: "DOWN", color: "rose" },
          { label: "Competitiveness", value: stats ? `${stats.priceCompetitiveness}%` : "92%", trend: "+0.4%", status: "UP", color: "cyan" },
        ].map((kpi, i) => (
          <div key={i} className="bg-(--sp-bg-2) p-6 rounded-md border border-emerald-500 shadow-sm relative overflow-hidden group">
             <p className="text-[11px] font-medium text-(--sp-text-2) uppercase tracking-[0.06em] mb-4">{kpi.label}</p>
             <p className="text-[32px] font-light text-(--sp-text-0) tracking-[-0.02em] leading-none tabular-nums">{kpi.value}</p>
             <div className={cn(
               "flex items-center gap-1.5 text-[11px] font-medium mt-6 uppercase tracking-[0.06em] border rounded-full px-2.5 py-1 w-fit",
               kpi.status === "UP" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
             )}>
               {kpi.status === "UP" ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {kpi.trend}
             </div>
          </div>
        ))}
      </div>

      {/* Scissor Chart Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
           <div className="bg-(--sp-bg-2) text-(--sp-text-0) rounded-md p-8 shadow-sm relative overflow-hidden group border border-emerald-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 relative z-10">
                 <div className="space-y-1">
                    <h3 className="text-[20px] font-medium tracking-tight">Profitability scissors</h3>
                    <p className="text-[11px] text-(--sp-text-2) font-medium uppercase tracking-[0.06em]">Revenue vs COGS</p>
                 </div>
                 <div className="w-10 h-10 bg-(--sp-bg-3) rounded-sm border border-emerald-500 text-(--sp-text-2) flex items-center justify-center shadow-sm">
                    <Target size={18} className="text-(--sp-cyan)" />
                 </div>
              </div>

              {/* Scissor visualization */}
              <div className="h-48 relative flex items-center justify-center">
                 <svg className="w-full h-full overflow-visible" viewBox="0 0 400 200">
                    <motion.path 
                       initial={{ pathLength: 0 }}
                       animate={{ 
                         pathLength: 1,
                         d: `M0 150 Q 100 ${130 + (multiplier - 1) * 20}, 200 100 T 400 ${40 - (multiplier - 1) * 20}`
                       }}
                       transition={{ duration: 1 }}
                       fill="none" 
                       stroke="var(--sp-border)" 
                       strokeWidth="4" 
                       strokeLinecap="round" 
                    />
                    <motion.path 
                       initial={{ pathLength: 0 }}
                       animate={{ 
                         pathLength: 1,
                         d: `M0 180 Q 100 140, 200 ${90 - (multiplier - 1) * 30} T 400 ${20 - (multiplier - 1) * 40}`
                       }}
                       transition={{ duration: 1 }}
                       fill="none" 
                       stroke="var(--sp-cyan)" 
                       strokeWidth="4" 
                       strokeLinecap="round" 
                    />
                    <motion.circle 
                       cx="200" cy={90 - (multiplier - 1) * 30} r="6" fill="var(--sp-text-0)"
                       initial={{ scale: 0 }}
                       animate={{ scale: [1, 1.2, 1] }}
                       transition={{ repeat: Infinity, duration: 2 }}
                    />
                 </svg>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-8 bg-(--sp-bg-0) text-(--sp-text-0) px-4 py-1.5 rounded-full text-[11px] font-medium border border-emerald-500 shadow-md">
                    Optimum: {multiplier.toFixed(1)}x
                 </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 relative z-10 tabular-nums">
                 <div className="p-4 bg-(--sp-bg-1)/50 rounded-sm border border-emerald-500 shadow-inner group/stat transition-all">
                    <p className="text-[10px] font-medium text-(--sp-text-2) uppercase tracking-[0.06em] mb-1">Volume threshold</p>
                    <p className="text-[18px] font-medium text-(--sp-text-0)">8,200 units</p>
                 </div>
                 <div className="p-4 bg-(--sp-bg-1)/50 rounded-sm border border-emerald-500 shadow-inner group/stat transition-all">
                    <p className="text-[10px] font-medium text-(--sp-text-2) uppercase tracking-[0.06em] mb-1">Logistics cap</p>
                    <p className="text-[18px] font-medium text-(--sp-text-0)">₹4.20 / KM</p>
                 </div>
              </div>
           </div>

           <div className="bg-(--sp-bg-2) rounded-md p-8 border border-emerald-500/30 shadow-sm border-l-4 border-emerald-500">
              <h3 className="text-[18px] font-medium tracking-tight mb-6 flex items-center gap-3 text-(--sp-text-0)">
                <ShieldCheck size={20} className="text-emerald-500" /> 
                Margin safeguards
              </h3>
              <div className="space-y-3">
                 {[
                   { label: "Minimum item margin", value: "8%", active: true },
                   { label: "Bulk discount cap", value: "14%", active: true },
                   { label: "Free logistics radius", value: "5 KM", active: false },
                 ].map((rule, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-sm bg-(--sp-bg-1)/50 hover:bg-(--sp-bg-1) transition-all cursor-pointer border border-emerald-500 shadow-sm">
                      <span className="text-[13px] font-medium text-(--sp-text-1)">{rule.label}</span>
                      <div className="flex items-center gap-4">
                         <span className="text-[15px] font-medium text-(--sp-text-0) tabular-nums">{rule.value}</span>
                         <div className={cn("w-8 h-4.5 rounded-full relative transition-all border", rule.active ? "bg-emerald-500 border-emerald-400" : "bg-(--sp-bg-3) border-emerald-500")}>
                           <div className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all", rule.active ? "right-1" : "left-1")} />
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-(--sp-bg-2) p-8 rounded-md border border-emerald-500 shadow-sm space-y-8">
              <h3 className="text-[11px] font-medium uppercase tracking-[0.06em] text-(--sp-text-2) mb-6">Price levers</h3>
              <div className="space-y-8">
                  <div className="space-y-3">
                     <label className="text-[11px] font-medium text-(--sp-text-2) uppercase tracking-[0.06em] px-1">Global multiplier</label>
                     <div className="flex flex-col gap-4">
                        <input 
                          type="range" 
                          min="1" max="2" step="0.1" 
                          value={multiplier} 
                          onChange={(e) => setMultiplier(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-(--sp-bg-3) rounded-full appearance-none cursor-pointer accent-(--sp-cyan) border border-emerald-500 shadow-inner" 
                        />
                        <span className="text-[32px] font-light text-(--sp-cyan) tracking-[-0.03em] tabular-nums">{multiplier}x</span>
                     </div>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[11px] font-medium text-(--sp-text-2) uppercase tracking-[0.06em] px-1">Peak surcharge</label>
                     <div className="flex flex-col gap-4">
                        <input 
                          type="range" 
                          min="0" max="100" 
                          value={surcharge} 
                          onChange={(e) => setSurcharge(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-(--sp-bg-3) rounded-full appearance-none cursor-pointer accent-(--sp-cyan) border border-emerald-500 shadow-inner" 
                        />
                        <span className="text-[32px] font-light text-(--sp-cyan) tracking-[-0.03em] tabular-nums">₹{surcharge}</span>
                     </div>
                  </div>
               </div>

               <div className="pt-8 border-t border-emerald-500">
                  <button 
                    onClick={() => {
                      setIsCommitting(true);
                      setTimeout(() => setIsCommitting(false), 2000);
                    }}
                    disabled={isCommitting}
                    className="w-full h-10 bg-(--sp-cyan) text-white rounded-[6px] font-medium text-[12px] uppercase tracking-[0.06em] shadow-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isCommitting ? (
                      <>Applying... <RefreshCw className="animate-spin" size={14} /></>
                    ) : (
                      "Commit changes"
                    )}
                  </button>
               </div>
           </div>

           <div className="bg-(--sp-teal-dim) p-8 rounded-md text-(--sp-teal) border border-(--sp-teal-border) shadow-sm group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-(--sp-teal) opacity-5 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
              <p className="text-[11px] font-medium uppercase tracking-[0.06em] mb-4">Efficiency wins</p>
              <p className="text-[40px] font-light tracking-[-0.02em] leading-none mb-6">+₹52.8K</p>
              <p className="text-[11px] font-medium leading-relaxed tracking-tight text-(--sp-teal) opacity-80">
                Gained via route optimization and dynamic surcharge application.
              </p>
              <div className="mt-6 h-1.5 bg-white/20 rounded-full overflow-hidden">
                 <motion.div initial={{ width: 0 }} animate={{ width: "88%" }} className="h-full bg-(--sp-teal) shadow-sm" />
              </div>
           </div>
        </div>
      </div>
    </div>
    </SecureOverlay>
  );
}
