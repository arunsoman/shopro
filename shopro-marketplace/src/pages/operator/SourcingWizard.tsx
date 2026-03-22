"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, TrendingDown, Ship, ArrowRight, BarChart3, ShieldCheck, RefreshCw, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * OP-16 — Sourcing Wizard
 * Purpose: AI-driven optimization (Best price vs Best lead time).
 * DNA: Stepper workspace, scenario comparison, "One-click Source" logic.
 */

export default function SourcingWizard() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedLever, setSelectedLever] = useState(0);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["operator-sourcing-stats"],
    queryFn: async () => {
      const resp = await api.get("/operator/sourcing/sourcing-wizard/stats");
      return resp.data;
    }
  });

  useEffect(() => {
    if (isRunning) {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setIsRunning(false);
            setShowResults(true);
            return 100;
          }
          return prev + 5;
        });
      }, 50);
      return () => clearInterval(timer);
    }
  }, [isRunning]);

  const startRun = () => {
    setIsRunning(true);
    setProgress(0);
    setShowResults(false);
  };

  return (
    <SecureOverlay>
    <div className="max-w-[1280px] mx-auto space-y-8 animate-in fade-in duration-1000 pb-20">
      {/* Refined Sourcing Header */}
      <div className="bg-(--sp-bg-2) rounded-md p-10 border border-(--sp-border) shadow-sm relative overflow-hidden group border-b-4 border-emerald-500/20">
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-(--sp-cyan)/5 blur-[100px] -z-10" />
         
         <div className="max-w-3xl space-y-6">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-(--sp-cyan)/10 rounded-md text-(--sp-cyan) border border-(--sp-cyan)/20 flex items-center justify-center shadow-sm">
                 <IconTooltip label="AI Intelligence Node"><Sparkles size={20} /></IconTooltip>
               </div>
               <span className="text-[11px] font-bold uppercase tracking-wider text-(--sp-text-3) opacity-60">Shopro intelligence</span>
            </div>
            <h1 className="text-[28px] font-medium tracking-tight text-(--sp-text-0)">Optimize your procurement strategy</h1>
            <p className="text-(--sp-text-2) text-[15px] leading-relaxed max-w-xl font-medium">
              Our AI engine analyzed <span className="text-(--sp-text-1) font-semibold">42,000 price shards</span> to find <span className="text-emerald-500 font-bold tracking-tight">₹{stats?.avgSavings || "42,480"}</span> in weekly savings. What scenario should we run today?
            </p>
             <div className="flex items-center gap-4 pt-4">
                <button 
                  onClick={startRun}
                  disabled={isRunning}
                  className="h-9 px-6 bg-(--sp-cyan) text-white rounded-md font-bold text-[11px] uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-2 shadow-sm disabled:opacity-40"
                >
                  {isRunning ? `Optimizing... ${progress}%` : "Start optimization run"} <Zap size={14} className={cn(isRunning && "animate-pulse")} />
                </button>
                <button className="h-9 px-6 bg-(--sp-bg-1) text-(--sp-text-1) rounded-md font-bold text-[11px] uppercase tracking-wider hover:bg-(--sp-bg-0) transition-all border border-(--sp-border) shadow-sm">
                  View savings report
                </button>
             </div>
             
             {isRunning && (
               <div className="mt-8 h-1.5 bg-(--sp-bg-1) rounded-full overflow-hidden shadow-inner border border-(--sp-border)/50">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${progress}%` }}
                   className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                 />
               </div>
             )}
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left: Recommended Scenarios */}
        <div className="xl:col-span-8 space-y-6">
           <h2 className="text-[18px] font-medium flex items-center gap-3 text-(--sp-text-0)">
             <TrendingDown className="text-emerald-500 w-5 h-5" /> Savings opportunities
           </h2>
           
           <div className={cn("space-y-4 transition-all duration-500", !showResults && "opacity-30 pointer-events-none")}>
              {[
                { id: "OPT-01", group: "Produce (Leafy greens)", current: "₹45,000", target: "₹38,200", delta: "15%", risk: "Low" },
                { id: "OPT-02", group: "Premium seafood alpha", current: "₹124,000", target: "₹110,000", delta: "11%", risk: "Medium" },
                { id: "OPT-03", group: "Dairy flux cluster", current: "₹92,000", target: "₹87,500", delta: "05%", risk: "High" },
              ].map((opt) => (
                <div key={opt.id} className="p-8 bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-sm hover:border-emerald-500/30 transition-all group/item">
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                      <div className="space-y-1">
                        <p className="text-[10px] text-(--sp-text-3) font-bold uppercase tracking-wider opacity-40">Target cluster</p>
                        <h3 className="text-[20px] font-semibold text-(--sp-text-0) tracking-tight uppercase">{opt.group}</h3>
                      </div>
                      <div className="md:text-right">
                        <p className="text-[32px] font-bold text-emerald-500 tracking-tighter leading-none tabular-nums">-{opt.delta}</p>
                        <p className="text-[10px] font-bold text-(--sp-text-3) uppercase tracking-wider mt-2 opacity-40">Est. weekly savings</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-(--sp-bg-1) rounded-md border border-(--sp-border) shadow-inner">
                      <div className="space-y-1">
                        <p className="text-[10px] text-(--sp-text-3) font-bold uppercase tracking-wider opacity-40">Current cost</p>
                        <p className="text-[15px] font-semibold text-(--sp-text-2) tabular-nums tracking-tight">{opt.current}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-(--sp-text-3) font-bold uppercase tracking-wider opacity-40 font-bold">AI Target</p>
                        <p className="text-[15px] font-semibold text-(--sp-text-0) tabular-nums tracking-tight">{opt.target}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-(--sp-text-3) font-bold uppercase tracking-wider opacity-40">Risk profile</p>
                        <p className={cn(
                          "text-[10px] font-bold px-3 py-1 rounded border shadow-sm uppercase tracking-wider inline-block mt-1",
                          opt.risk === "Low" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                        )}>{opt.risk}</p>
                      </div>
                   </div>

                   <div className="flex flex-col md:flex-row items-center justify-between mt-8 gap-6 pt-6 border-t border-(--sp-border)/40">
                      <div className="flex items-center gap-3 text-(--sp-text-1) text-[12px] font-medium">
                         <Ship size={16} className="text-(--sp-cyan)" />
                         <span className="opacity-80">Shift to regional hub (4 vendors)</span>
                      </div>
                      <button className="h-9 px-6 rounded-md bg-(--sp-cyan) text-white font-bold text-[11px] uppercase tracking-wider hover:opacity-90 transition-all shadow-sm flex items-center gap-2">
                        Generate RFQ <ArrowRight size={16} />
                      </button>
                   </div>
                </div>
              ))}
           </div>
           
           {!showResults && !isRunning && (
              <div className="py-24 flex flex-col items-center justify-center space-y-4 opacity-40">
                  <Database className="w-12 h-12 text-(--sp-text-3)" />
                  <p className="tracking-wider text-[11px] font-bold uppercase text-(--sp-text-3)">Awaiting AI optimization pulse signal...</p>
              </div>
           )}
        </div>

        {/* Right: Constraints & Strategy */}
        <div className="xl:col-span-4 space-y-8">
           <div className="bg-(--sp-bg-2) rounded-md p-8 border border-(--sp-border) shadow-sm flex flex-col">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-(--sp-text-3) mb-8 opacity-60">Optimization strategy</h3>
              
              <div className="space-y-4">
                 {[
                   { label: "Price aggression", secondary: "Aggressive target matching", icon: TrendingDown },
                   { label: "SLA reliability", secondary: "Priority to SLA > 99.8%", icon: ShieldCheck },
                   { label: "Latency minimizer", secondary: "Max 6h delivery window", icon: Zap },
                 ].map((lever, i) => (
                   <div 
                     key={i} 
                     onClick={() => setSelectedLever(i)}
                     className={cn(
                       "p-6 rounded-md border transition-all cursor-pointer flex items-center gap-4 relative overflow-hidden",
                       selectedLever === i 
                        ? "border-(--sp-cyan) bg-(--sp-cyan)/5 shadow-inner" 
                        : "border-(--sp-border) hover:bg-(--sp-bg-1) shadow-sm"
                     )}
                   >
                      <div className={cn("w-10 h-10 rounded-md flex items-center justify-center transition-all shadow-sm", selectedLever === i ? "bg-(--sp-cyan) text-white" : "bg-(--sp-bg-1) text-(--sp-text-3) border border-(--sp-border)")}>
                        <lever.icon size={20} />
                      </div>
                      <div className="space-y-0.5">
                        <p className={cn("text-[14px] font-semibold tracking-tight", selectedLever === i ? "text-(--sp-text-0)" : "text-(--sp-text-1)")}>{lever.label}</p>
                        <p className="text-[11px] text-(--sp-text-3) font-medium opacity-60">{lever.secondary}</p>
                      </div>
                      {selectedLever === i && <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/5 rounded-full -mr-6 -mt-6" />}
                   </div>
                 ))}
              </div>

              <div className="pt-10 mt-2 border-t border-(--sp-border)/50">
                 <div className="p-6 rounded-md bg-(--sp-bg-1) border border-(--sp-border) space-y-4 relative overflow-hidden group shadow-inner">
                    <div className="flex items-center gap-3 text-(--sp-text-0)">
                      <BarChart3 size={16} className="text-(--sp-cyan)" />
                      <h4 className="text-[10px] font-bold uppercase tracking-wider opacity-60">Active analysis</h4>
                    </div>
                    <p className="text-[13px] text-(--sp-text-1) font-medium leading-relaxed">
                      The sourcing wizard is currently recalculating risk for the <strong className="text-rose-500">Dairy cluster</strong> due to localized price volatility.
                    </p>
                    <div className="w-full bg-(--sp-bg-2) h-1.5 rounded-full overflow-hidden border border-(--sp-border)/50">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: "68%" }}
                         className="h-full bg-emerald-500/40" 
                       />
                    </div>
                 </div>
              </div>
           </div>

           {/* Quick Stats DNA */}
           <div className="bg-slate-900 p-8 rounded-md text-white shadow-xl relative overflow-hidden group border-b-4 border-emerald-500/20">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:scale-150 transition-all duration-1000" />
              <p className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-wider mb-2">Monthly cumulative savings</p>
              <p className="text-[42px] font-semibold tracking-tighter text-emerald-400 leading-none tabular-nums">₹1.88L</p>
              <div className="mt-8 flex items-center justify-between">
                 <p className="text-[10px] font-bold bg-white/10 px-3 py-1 rounded border border-white/10 uppercase tracking-wider opacity-60">ROI Index: 14.8x</p>
                 <Zap className="text-white/20 w-8 h-8 group-hover:scale-110 transition-transform" />
              </div>
           </div>
        </div>
      </div>
    </div>
    </SecureOverlay>
  );
}
