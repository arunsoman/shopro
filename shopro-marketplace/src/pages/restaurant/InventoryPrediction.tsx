"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  TrendingUp, 
  Brain, 
  ChevronRight, 
  Zap, 
  Globe, 
  Award, 
  CircleDot, 
  ArrowRight,
  ShieldCheck,
  Activity,
  BarChart3,
  Calendar,
  Layers,
  Sparkles
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";

/**
 * RD-06 — Inventory Prediction
 * Purpose: AI-driven stock movement analysis for buyers.
 */

export default function InventoryPrediction() {
  const navigate = useNavigate();

  const { data: predictions, isLoading } = useQuery({
    queryKey: ["buyer-inventory-predictions"],
    queryFn: async () => {
      const resp = await api.get("buyer/inventory/predictions");
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
             Stock <span className="text-brand-primary font-extrabold italic">Prediction</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm flex items-center gap-3">
             <Brain className="w-5 h-5 text-brand-primary animate-pulse" />
             AI Analysis: Active • Predictive Reordering Sync
          </p>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-8">
            {/* Predictive Chart Mockup */}
            <div className="relative bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 overflow-hidden group">
               <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] pointer-events-none" />
               <div className="flex items-center justify-between relative z-10">
                   <h2 className="text-xl font-bold tracking-tight flex items-center gap-4 italic uppercase"><Activity size={24} className="text-brand-primary" /> Consumption Forecast</h2>
                   <div className="flex gap-2">
                        {["7D", "30D", "90D"].map(d => (
                            <button key={d} className="h-8 px-4 rounded-lg border border-slate-200 dark:border-slate-800 font-bold text-[10px] tracking-widest uppercase hover:border-indigo-500 transition-all italic">
                                {d}
                            </button>
                        ))}
                   </div>
               </div>

               <div className="h-[300px] w-full flex items-end justify-between gap-3 relative z-10 px-4">
                  {[40, 60, 45, 80, 50, 90, 70, 85, 65, 95, 75, 100].map((h, i) => (
                    <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 1, delay: i * 0.05 }}
                        className={cn(
                            "flex-1 rounded-t-lg transition-all shadow-md",
                            i > 8 ? "bg-brand-primary/40 shadow-brand-primary/20 border-dashed border-2 border-brand-primary" : "bg-slate-900 dark:bg-white"
                        )}
                    />
                  ))}
                  <div className="absolute top-1/2 left-0 right-0 h-px border-t border-dashed border-rose-500/30 pointer-events-none" />
               </div>

               <div className="flex justify-between items-center pt-6 text-sm font-bold tracking-widest opacity-40 relative z-10 uppercase italic">
                  <span>Historical Data</span>
                  <span className="text-indigo-600 opacity-100">AI Projection</span>
               </div>
            </div>

            {/* Reorder Recommendation */}
            <section className="bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
               <h2 className="text-xl font-bold tracking-tight flex items-center gap-4 italic uppercase"><Sparkles size={24} className="text-brand-primary" /> Recommended Reorders</h2>
               
               <div className="space-y-4">
                    {predictions?.recommendedReorder.map((name: string, i: number) => (
                        <div key={i} className="group relative bg-brand-primary p-6 rounded-2xl border border-brand-primary/50 shadow-lg flex items-center justify-between transition-all hover:scale-[1.02] text-slate-950 overflow-hidden">
                           <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                           <div className="flex items-center gap-6 relative z-10">
                                 <div className="h-12 w-12 bg-white/20 rounded-xl border border-white/40 flex items-center justify-center text-xl font-bold italic shadow-md">
                                     <TrendingUp size={24} />
                                 </div>
                                 <div className="space-y-1">
                                     <h3 className="text-xl font-bold italic tracking-tight uppercase shadow-sm">{name}</h3>
                                     <p className="text-[10px] font-bold tracking-widest opacity-80 italic uppercase">Predicted Demand Spike</p>
                                 </div>
                           </div>
                           <button className="h-10 px-6 bg-slate-950 text-white rounded-lg border border-slate-800 font-bold italic text-[10px] tracking-widest shadow-md hover:scale-110 active:scale-95 transition-all flex items-center gap-3 uppercase relative z-10">
                                 Reorder Now
                                 <ArrowRight size={14} />
                           </button>
                        </div>
                    ))}
               </div>
            </section>
        </div>

        <aside className="lg:col-span-4 space-y-6">
            {/* Insights Module */}
            <div className="bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 group overflow-hidden">
                <h3 className="text-lg font-bold tracking-tight uppercase flex items-center gap-3 text-brand-primary italic"><BarChart3 size={20} /> Prediction Insights</h3>
                
                <div className="space-y-6">
                   {[
                       { label: "Confidence Score", val: "94.2%", color: "text-emerald-500" },
                       { label: "Anomaly Detection", val: "None Detected", color: "text-indigo-600" },
                       { label: "Data Points Analyzed", val: "1.2M", color: "text-slate-900 dark:text-white" },
                   ].map((row, i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold tracking-widest opacity-60 uppercase italic">
                            <span>{row.label}</span>
                        </div>
                         <div className={cn("text-lg font-bold tracking-tight uppercase italic", row.color)}>
                            {row.val}
                        </div>
                    </div>
                   ))}
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                    <p className="text-[10px] font-bold tracking-widest text-slate-400 leading-relaxed uppercase italic">
                        Projections are based on supplier velocity and local demand trends. A 24-hour error margin may apply.
                    </p>
                    <button className="h-10 w-full bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-lg border border-brand-primary/50 font-bold uppercase text-[10px] tracking-widest shadow-sm transition-all hover:bg-brand-primary hover:text-slate-900">
                        View Detailed Analysis
                    </button>
                </div>
            </div>
        </aside>
      </main>
    </div>
    </SecureOverlay>
  );
}
