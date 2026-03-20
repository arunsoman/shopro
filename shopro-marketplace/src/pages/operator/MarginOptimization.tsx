"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, Target, Zap, ChevronRight, Info, Settings, RefreshCw, Filter, ShieldCheck, Search, Percent, BarChart3, LineChart, PieChart, Download } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * OP-20 — Margin Optimization
 * Purpose: Profitability levers (Logistics cost vs Unit price).
 * DNA: Scissor-chart logic (Revenue vs Cost), "Surgical" price overrides.
 */

const MARGIN_KPIs = [
  { label: "Net Margin", value: "14.2%", trend: "+2.1%", status: "UP" },
  { label: "Sourcing Cost", value: "₹42.4L", trend: "-1.2%", status: "DOWN" },
  { label: "Logistics Leakage", value: "₹2.1L", trend: "+0.4%", status: "UP" },
];

import { useState } from "react";

export default function MarginOptimization() {
  const [multiplier, setMultiplier] = useState(1.2);
  const [surcharge, setSurcharge] = useState(45);
  const [isCommitting, setIsCommitting] = useState(false);
  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Margin Control Center</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Analyzing price sensitivity and logistics overhead to maximize platform profitability.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="h-10 px-4 bg-white dark:bg-slate-900 text-slate-600 dark:text-white rounded-xl text-xs font-black flex items-center gap-2 ring-1 ring-slate-200 dark:ring-slate-800 hover:bg-slate-50 transition-all shadow-sm">
            <Filter size={14} /> SIMULATION MODE
          </button>
          <button className="h-10 px-4 bg-violet-600 text-white rounded-xl text-xs font-black flex items-center gap-2 hover:scale-105 transition-all shadow-lg">
            <Zap size={14} /> EXECUTE PRICE OVERRIDE
          </button>
        </div>
      </div>

      {/* KPI Grid DNA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MARGIN_KPIs.map((kpi) => (
          <div key={kpi.label} className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-[3rem] ring-1 ring-slate-100 dark:ring-slate-800 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 text-slate-100 dark:text-slate-800 -z-10 transform scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-700">
               <DollarSign size={80} />
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</p>
             <p className="text-4xl font-black text-slate-900 dark:text-white mt-1">{kpi.value}</p>
             <div className={cn(
               "flex items-center gap-1.5 text-[10px] font-black mt-4 uppercase tracking-widest",
               kpi.status === "UP" ? "text-green-500" : "text-rose-500"
             )}>
               {kpi.status === "UP" ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {kpi.trend} vs M-1
             </div>
          </div>
        ))}
      </div>

      {/* Scissor Chart Analysis DNA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group border border-slate-800">
              <div className="flex items-center justify-between mb-10">
                 <div className="space-y-1">
                    <h3 className="text-xl font-black uppercase tracking-tighter">Profitability Scissors</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Revenue (Green) vs COGS (Violet)</p>
                 </div>
                 <div className="p-3 bg-violet-500/20 rounded-2xl border border-violet-500/30 text-violet-400">
                   <Target size={24} />
                 </div>
              </div>

              {/* Scissor visualization logic */}
              <div className="h-64 relative flex items-center justify-center">
                 <svg className="w-full h-full overflow-visible" viewBox="0 0 400 200">
                    {/* Cost Line */}
                    <motion.path 
                      initial={{ pathLength: 0 }}
                      animate={{ 
                        pathLength: 1,
                        d: `M0 150 Q 100 ${130 + (multiplier - 1) * 20}, 200 100 T 400 ${40 - (multiplier - 1) * 20}`
                      }}
                      transition={{ duration: 0.5 }}
                      fill="none" 
                      stroke="#8b5cf6" 
                      strokeWidth="6" 
                      strokeLinecap="round" 
                    />
                    {/* Revenue Line */}
                    <motion.path 
                      initial={{ pathLength: 0 }}
                      animate={{ 
                        pathLength: 1,
                        d: `M0 180 Q 100 140, 200 ${90 - (multiplier - 1) * 30} T 400 ${20 - (multiplier - 1) * 40}`
                      }}
                      transition={{ duration: 0.5 }}
                      fill="none" 
                      stroke="#22c55e" 
                      strokeWidth="6" 
                      strokeLinecap="round" 
                    />
                    {/* Intersection pulse */}
                    <motion.circle 
                      cx="200" cy={90 - (multiplier - 1) * 30} r="8" fill="#fff"
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                 </svg>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-10 bg-white text-slate-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                   Optimum Yield: {multiplier.toFixed(1)}x
                 </div>
              </div>

              <div className="mt-8 flex items-center gap-6">
                 <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Volume Threshold</p>
                    <p className="text-sm font-black mt-1">8,200 Units/Day</p>
                 </div>
                 <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Logistics Cap</p>
                    <p className="text-sm font-black mt-1">₹4.20 / KM</p>
                 </div>
              </div>
           </div>

           <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-8 ring-1 ring-slate-100 dark:ring-slate-800 shadow-sm border-l-4 border-green-500">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                <ShieldCheck size={18} className="text-green-500" /> Margin Safeguards
              </h3>
              <div className="space-y-4">
                 {[
                   { label: "Minimum Item Margin", value: "8%", active: true },
                   { label: "Bulk Discount Cap", value: "14%", active: true },
                   { label: "Free Logistics Radius", value: "5 KM", active: false },
                 ].map((rule, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 group hover:ring-1 hover:ring-green-500/30 transition-all">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{rule.label}</span>
                      <div className="flex items-center gap-4">
                         <span className="text-sm font-black text-slate-900 dark:text-white">{rule.value}</span>
                         <div className={cn("w-8 h-4 rounded-full relative transition-colors", rule.active ? "bg-green-500" : "bg-slate-300")}>
                           <div className={cn("absolute top-1 w-2 h-2 rounded-full bg-white transition-all", rule.active ? "right-1" : "left-1")} />
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right: Manual Overrides & Audit */}
        <div className="space-y-8">
           <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] ring-1 ring-slate-100 dark:ring-slate-800 shadow-sm space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Surgical Price Levers</h3>
                            <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2">Global Margin Multiplier</label>
                     <div className="flex items-center gap-3">
                        <input 
                          type="range" 
                          min="1" max="2" step="0.1" 
                          value={multiplier} 
                          onChange={(e) => setMultiplier(parseFloat(e.target.value))}
                          className="flex-1 accent-violet-500" 
                        />
                        <span className="text-xs font-black text-violet-500">{multiplier}x</span>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2">Delivery Surcharge Peak</label>
                     <div className="flex items-center gap-3">
                        <input 
                          type="range" 
                          min="0" max="100" 
                          value={surcharge} 
                          onChange={(e) => setSurcharge(parseInt(e.target.value))}
                          className="flex-1 accent-violet-500" 
                        />
                        <span className="text-xs font-black text-violet-500">₹{surcharge}</span>
                     </div>
                  </div>
               </div>

               <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => {
                      setIsCommitting(true);
                      setTimeout(() => setIsCommitting(false), 2000);
                    }}
                    disabled={isCommitting}
                    className="w-full h-11 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isCommitting ? (
                      <>APPLYING OVERRIDES... <RefreshCw className="animate-spin" size={12} /></>
                    ) : (
                      "COMMIT CHANGES (7 SKUs)"
                    )}
                  </button>
               </div>
           </div>

           <div className="bg-violet-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-violet-500/20">
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Efficiency Wins</p>
              <p className="text-3xl font-black mt-1">+₹52.8k</p>
              <p className="text-[10px] font-bold mt-4 leading-relaxed uppercase tracking-tighter">
                Gained via Route Optimization and Dynamic Surcharge application this week.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
