"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap, TrendingDown, Ship, ArrowRight, BarChart3, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * OP-16 — Sourcing Wizard
 * Purpose: AI-driven optimization (Best price vs Best lead time).
 * DNA: Stepper workspace, scenario comparison, "One-click Source" logic.
 */

const OPPORTUNITIES = [
  { id: "OPT-01", group: "Produce (Leafy Greens)", currentCost: 45000, optimizedCost: 38200, saving: "15%", difficulty: "LOW" },
  { id: "OPT-02", group: "Premium Seafood", currentCost: 124000, optimizedCost: 110000, saving: "11%", difficulty: "MEDIUM" },
  { id: "OPT-03", group: "Dairy (Milk/Butter)", currentCost: 92000, optimizedCost: 87500, saving: "5%", difficulty: "HIGH" },
];

import { useState, useEffect } from "react";

export default function SourcingWizard() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedLever, setSelectedLever] = useState(0);

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
          return prev + 2;
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
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* AI Header DNA */}
      <div className="bg-slate-900 text-white p-10 rounded-[3rem] relative overflow-hidden group border border-slate-800 shadow-2xl">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/20 blur-[120px] -z-10 group-hover:bg-violet-600/30 transition-all duration-1000" />
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-[80px] -z-10" />
         
         <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-violet-500/20 rounded-xl text-violet-400 border border-violet-500/30">
                 <Sparkles size={24} />
               </div>
               <span className="text-xs font-black uppercase tracking-[0.3em] text-violet-400">Shopro Intelligence</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight leading-tight">Optimize Your Procurement Strategy</h1>
            <p className="text-slate-400 font-medium text-lg leading-relaxed">
              Our AI engine analyzed 42,000 price shards to find ₹42,480 in weekly savings. What scenario should we run today?
            </p>
             <div className="flex items-center gap-4 pt-4">
                <button 
                  onClick={startRun}
                  disabled={isRunning}
                  className="h-12 px-8 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-xl disabled:opacity-50"
                >
                  {isRunning ? `OPTIMIZING... ${progress}%` : "START OPTIMIZATION RUN"} <Zap size={16} className={cn(isRunning && "animate-pulse")} />
                </button>
                <button className="h-12 px-6 bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all">
                  VIEW SAVINGS REPORT
                </button>
             </div>
             
             {isRunning && (
               <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${progress}%` }}
                   className="h-full bg-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.5)]"
                 />
               </div>
             )}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recommended Scenarios */}
        <div className="lg:col-span-2 space-y-6">
           <h2 className="text-xl font-bold px-4 flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-tighter">
             <TrendingDown className="text-green-500" size={20} /> Savings Opportunities
           </h2>
           
           <div className={cn("space-y-4 transition-all duration-700", !showResults && "opacity-20 blur-sm grayscale pointer-events-none")}>
              {OPPORTUNITIES.map((opt) => (
                <div key={opt.id} className="p-8 bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] ring-1 ring-slate-200 dark:ring-slate-800 group hover:ring-violet-500/50 transition-all shadow-sm">
                   <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Target Group</p>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">{opt.group}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-green-500">-{opt.saving}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Est. Weekly Saving</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-3 gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Current Cost</p>
                        <p className="text-sm font-black text-slate-500">₹{opt.currentCost.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">AI Target</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white">₹{opt.optimizedCost.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Difficulty</p>
                        <p className={cn(
                          "text-[9px] font-black px-2 py-0.5 rounded-full inline-block mt-1",
                          opt.difficulty === "LOW" ? "bg-green-500/10 text-green-500 ring-1 ring-green-500/20" :
                          opt.difficulty === "MEDIUM" ? "bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20" :
                          "bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/20"
                        )}>{opt.difficulty}</p>
                      </div>
                   </div>

                   <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Ship size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Shift to Mumbai Cluster (4 Vendors)</span>
                      </div>
                      <button className="h-10 px-6 rounded-xl bg-violet-600 text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg flex items-center gap-2">
                        GENERATE RFQ <ArrowRight size={14} />
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Right: Constraints & Strategy */}
        <div className="space-y-8">
           <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm space-y-8">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Optimization Levers</h3>
              
              <div className="space-y-6">
                 {[
                   { label: "Price Focus", secondary: "Aggressive target matching", icon: TrendingDown },
                   { label: "Reliability Focus", secondary: "Priority to SLA > 98%", icon: ShieldCheck },
                   { label: "Lead Time Focus", secondary: "Max 12h delivery window", icon: Zap },
                 ].map((lever, i) => (
                   <div 
                     key={i} 
                     onClick={() => setSelectedLever(i)}
                     className={cn(
                       "p-5 rounded-3xl ring-1 transition-all cursor-pointer group flex items-start gap-4",
                       selectedLever === i ? "ring-violet-500 bg-violet-50 dark:bg-violet-900/10" : "ring-slate-100 dark:ring-slate-800 hover:ring-violet-500/30"
                     )}
                   >
                      <div className={cn("p-2 rounded-xl", selectedLever === i ? "bg-violet-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-violet-500")}>
                        <lever.icon size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tighter">{lever.label}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{lever.secondary}</p>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                 <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
                    <div className="flex items-center gap-2 text-violet-400">
                      <BarChart3 size={18} />
                      <h4 className="text-[10px] font-black uppercase tracking-widest">Active Analysis</h4>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase">
                      The sourcing wizard is currently recalculating risk for the <strong>Dairy Cluster</strong> due to a 14% price surge in Pune.
                    </p>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: "65%" }}
                         className="h-full bg-violet-500" 
                       />
                    </div>
                 </div>
              </div>
           </div>

           {/* Quick Stats DNA */}
           <div className="bg-green-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-green-500/20 group overflow-hidden relative">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700" />
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Monthly Saved</p>
              <p className="text-4xl font-black mt-1">₹1.8L</p>
              <p className="text-[9px] font-bold mt-4 bg-white/20 px-2 py-1 rounded inline-block uppercase tracking-widest">ROI: 14.2x</p>
           </div>
        </div>
      </div>
    </div>
  );
}
