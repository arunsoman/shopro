"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Clock, BarChart3, LineChart, PieChart, Info, Download, Filter, RefreshCw, Calendar, Zap, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * OP-19 — Demand Forecasting
 * Purpose: Seasonal and event-driven trend analysis.
 * DNA: Interactive charts, "What-if" toggle, peak-demand heatmaps.
 */

const TRENDS = [
  { region: "North Bangalore", category: "Produce", growth: "+18%", volume: "High", confidence: "94%" },
  { region: "Whitefield", category: "Dairy", growth: "-2%", volume: "Stable", confidence: "88%" },
  { region: "Indiranagar", category: "Meat/Poultry", growth: "+24%", volume: "Very High", confidence: "91%" },
  { region: "Koramangala", category: "Grains", growth: "+5%", volume: "Stable", confidence: "96%" },
];

import { useState } from "react";

export default function DemandForecasting() {
  const [region, setRegion] = useState("All Regions");
  const [category, setCategory] = useState("All Categories");
  const [isRecalibrating, setIsRecalibrating] = useState(false);
  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Demand Intelligence</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Analyzing consumption patterns to predict future procurement requirements.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="h-10 px-4 bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 rounded-xl flex items-center gap-2 text-xs font-black text-slate-600 dark:text-slate-300 shadow-sm">
            <Calendar size={14} /> APR 2024 - JUN 2024 (Q2)
          </div>
          <button className="h-10 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black flex items-center gap-2 hover:scale-105 transition-all shadow-lg">
            <Download size={14} /> EXPORT INSIGHTS
          </button>
        </div>
      </div>

      {/* Forecasting DNA: The "What-If" Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
           {/* Chart Placeholder DNA */}
           <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[3rem] p-10 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center gap-3">
                   <div className="w-2 h-8 bg-violet-500 rounded-full" />
                   <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Aggregate Demand Projection</h2>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-violet-500" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base Forecast</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Election Peak (Projected)</span>
                    </div>
                 </div>
              </div>

              {/* Visualizing the "Growth Curve" via motion */}
              <div className="h-64 flex items-end gap-2 px-4 relative">
                 <div className="absolute inset-x-0 bottom-0 h-[1px] bg-slate-100 dark:bg-slate-800" />
                 {[40, 55, 48, 72, 95, 88, 120, 110, 135, 150, 142, 168].map((h, i) => (
                   <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar cursor-help">
                      <div className="w-full relative">
                         <motion.div 
                           initial={{ height: 0 }}
                           animate={{ height: `${h}%` }}
                           className={cn(
                             "w-full rounded-t-lg transition-all",
                             i > 7 ? "bg-rose-500/80 group-hover/bar:bg-rose-400" : "bg-violet-500/80 group-hover/bar:bg-violet-400"
                           )}
                         />
                         <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">
                           {h}k Units
                         </div>
                      </div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">W{i+1}</span>
                   </div>
                 ))}
              </div>

              <div className="mt-10 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <Zap className="text-amber-500" size={20} />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      <strong>Election Impact:</strong> We predict a 22% surge in poultry and dairy demand across Central Bangalore between Week 9 - Week 12.
                    </p>
                 </div>
                 <button className="text-xs font-black text-violet-500 uppercase tracking-widest border-b-2 border-violet-500 pb-0.5">
                    RECALIBRATE SAFETY STOCK
                 </button>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TRENDS.map((trend) => (
                <div key={trend.region} className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] ring-1 ring-slate-100 dark:ring-slate-800 flex items-center justify-between group hover:ring-violet-500 transition-all">
                   <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-violet-500">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tighter">{trend.region}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{trend.category}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className={cn("text-lg font-black", trend.growth.includes("+") ? "text-green-500" : "text-rose-500")}>{trend.growth}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{trend.confidence} Conf.</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Right: Insights & Controls */}
        <div className="space-y-8">
           <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl space-y-8 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 text-white/5 opacity-40">
                <BarChart3 size={120} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Market Drivers</h3>
              
              <div className="space-y-6">
                 {[
                   { label: "Seasonality", impact: "High", icon: TrendingUp },
                   { label: "Regional Events", impact: "Medium", icon: Zap },
                   { label: "Price Fluctuations", impact: "Low", icon: TrendingDown },
                 ].map((driver, i) => (
                   <div key={i} className="flex items-center justify-between group/item">
                      <div className="flex items-center gap-3">
                         <driver.icon size={16} className="text-violet-400" />
                         <span className="text-[11px] font-bold uppercase tracking-widest">{driver.label}</span>
                      </div>
                      <span className={cn(
                        "text-[9px] font-black px-2 py-0.5 rounded-full ring-1",
                        driver.impact === "High" ? "bg-rose-500/10 text-rose-500 ring-rose-500/20" :
                        "bg-blue-500/10 text-blue-500 ring-blue-500/20"
                      )}>{driver.impact} Impact</span>
                   </div>
                 ))}
              </div>
              
              <div className="flex gap-4">
              <select 
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="h-10 px-4 bg-white/10 border border-white/20 rounded-xl text-xs font-bold outline-none cursor-pointer hover:bg-white/20 transition-all font-sans"
              >
                <option className="text-slate-900">All Regions</option>
                <option className="text-slate-900">North zone</option>
                <option className="text-slate-900">South zone</option>
              </select>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 px-4 bg-white/10 border border-white/20 rounded-xl text-xs font-bold outline-none cursor-pointer hover:bg-white/20 transition-all font-sans"
              >
                <option className="text-slate-900">All Categories</option>
                <option className="text-slate-900">Produce</option>
                <option className="text-slate-900">Dairy</option>
              </select>
            </div>
            <button 
              onClick={() => {
                setIsRecalibrating(true);
                setTimeout(() => setIsRecalibrating(false), 2000);
              }}
              disabled={isRecalibrating}
              className="px-6 py-2 bg-white text-violet-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              {isRecalibrating ? "RECALIBRATING..." : "RECALIBRATE SAFETY STOCK"} <RefreshCw className={cn(isRecalibrating && "animate-spin")} size={14} />
            </button>
              <div className="pt-4">
                 <button className="w-full h-12 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
                    GENERATE DEMAND RFQ
                 </button>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] ring-1 ring-slate-100 dark:ring-slate-800 shadow-sm border-t-4 border-violet-500">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <Search size={14} className="text-violet-500" /> Confidence Audit
              </h3>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed uppercase tracking-tighter">
                Forecast remains stable for 94% of SKUs. Anomalies detected in Fresh Seafood due to logistics strikes. Verification depth: 12 months historical.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
