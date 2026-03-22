"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Clock, BarChart3, LineChart, PieChart, Info, Download, Filter, RefreshCw, Calendar, Zap, MapPin, Search, Database, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * OP-19 — Demand Forecasting
 * Purpose: Seasonal and event-driven trend analysis.
 * DNA: Interactive charts, "What-if" toggle, peak-demand heatmaps.
 */

interface ForecastData {
  summary: {
    period: string;
    confidence: number;
    totalProjected: number;
  };
  categories: {
    name: string;
    forecast: string;
    risk: string;
  }[];
  insights: string[];
}

export default function DemandForecasting() {
  const [isRecalibrating, setIsRecalibrating] = useState(false);

  const { data: forecast, isLoading } = useQuery<ForecastData>({
    queryKey: ["operator-demand-forecast"],
    queryFn: async () => {
      const resp = await api.get("operator/bidding/forecast");
      return {
        summary: {
          period: resp.data?.summary?.period || "Next 12 weeks",
          confidence: resp.data?.summary?.confidence || 0,
          totalProjected: resp.data?.summary?.totalProjected || 0,
        },
        categories: resp.data?.categories?.map((cat: any) => ({
          name: cat?.name || "Unknown Sector",
          forecast: cat?.forecast || "---",
          risk: cat?.risk || "Unknown"
        })) || [],
        insights: resp.data?.insights || []
      };
    }
  });

  return (
    <SecureOverlay>
      <div className="max-w-[1280px] mx-auto space-y-8 animate-in fade-in duration-1000 pb-20">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-(--sp-border) pb-8">
          <div className="space-y-2">
            <h1 className="text-[28px] font-medium tracking-tight text-(--sp-text-0)">
               Demand <span className="text-violet-500 font-semibold">intelligence</span>
            </h1>
            <div className="flex items-center gap-3">
               <BarChart3 className="w-5 h-5 text-violet-500" />
               <p className="text-(--sp-text-3) text-[13px] font-medium">
                  Analyzing consumption patterns to predict future requirements.
               </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="h-9 px-4 bg-(--sp-bg-1) border border-(--sp-border) rounded-md flex items-center gap-2 text-[11px] font-bold text-(--sp-text-1) shadow-sm uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-violet-500 opacity-60" /> {forecast?.summary?.period}
            </div>
            <button className="h-9 px-4 bg-(--sp-cyan) text-white rounded-md text-[11px] font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-sm uppercase tracking-wider">
              <Download size={16} /> Export data
            </button>
          </div>
        </header>

        {/* Forecasting Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
             {/* Chart Area */}
             <div className="bg-(--sp-bg-2) rounded-md p-10 border border-(--sp-border) shadow-sm flex flex-col min-h-[500px]">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                   <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-violet-600 rounded-full shadow-sm" />
                      <h2 className="text-[18px] font-medium text-(--sp-text-0) tracking-tight">Aggregate demand projection</h2>
                   </div>
                   <div className="flex items-center gap-8 bg-(--sp-bg-1) p-2 px-4 rounded-md border border-(--sp-border) shadow-inner">
                      <div className="flex items-center gap-2.5">
                        <div className="w-3 h-3 rounded bg-violet-500 shadow-sm" />
                        <span className="text-[10px] font-bold text-(--sp-text-3) uppercase tracking-wider opacity-60">Base</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-3 h-3 rounded bg-rose-500 shadow-sm" />
                        <span className="text-[10px] font-bold text-(--sp-text-3) uppercase tracking-wider opacity-60">Peak</span>
                      </div>
                   </div>
                </div>

                <div className="flex-1 flex flex-col justify-end">
                  {isLoading ? (
                      <div className="h-64 flex flex-col items-center justify-center space-y-4 opacity-40">
                          <RefreshCw className="w-10 h-10 text-violet-500 animate-spin" />
                          <p className="text-(--sp-text-3) tracking-wider text-[11px] font-bold uppercase">Synthesizing data matrix...</p>
                      </div>
                  ) : (
                    <div className="h-72 flex items-end gap-2.5 px-2 relative mb-2">
                       <div className="absolute inset-x-0 bottom-0 h-px bg-(--sp-border)/50" />
                       {[40, 55, 48, 72, 95, 88, 120, 110, 135, 150, 142, 168].map((h, i) => (
                         <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar cursor-help">
                            <div className="w-full relative">
                               <motion.div 
                                  initial={{ height: 0 }}
                                  animate={{ height: `${(h/180)*100}%` }}
                                  className={cn(
                                    "w-full rounded-t-sm transition-all shadow-sm relative overflow-hidden",
                                    i > 7 ? "bg-rose-500/80 hover:bg-rose-500" : "bg-violet-500/80 hover:bg-violet-500"
                                  )}
                               >
                                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                               </motion.div>
                               <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1.5 rounded opacity-0 group-hover/bar:opacity-100 transition-all whitespace-nowrap z-20 shadow-xl border border-white/10 uppercase tracking-tight">
                                  {h}K units
                               </div>
                            </div>
                            <span className="text-[10px] font-bold text-(--sp-text-3) uppercase tracking-wider opacity-40">W{i+1}</span>
                         </div>
                       ))}
                    </div>
                  )}
                </div>

                <div className="mt-10 p-8 bg-(--sp-bg-1) rounded-md border border-(--sp-border) flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-inner">
                   <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-sm">
                         <Zap className="w-6 h-6" />
                      </div>
                      <p className="text-[13px] font-semibold text-(--sp-text-1) max-w-xl leading-relaxed uppercase tracking-tight">
                        {forecast?.insights?.[0] || "Neural pattern extraction ongoing..."}
                      </p>
                   </div>
                   <button className="h-9 px-6 bg-(--sp-bg-2) text-(--sp-text-1) rounded-md text-[11px] font-bold uppercase tracking-wider hover:bg-(--sp-bg-1) transition-all border border-(--sp-border) shadow-sm">
                      Recalibrate
                   </button>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {forecast?.categories?.map((cat) => (
                  <div key={cat?.name} className="p-8 bg-(--sp-bg-2) rounded-md border border-(--sp-border) flex items-center justify-between group hover:border-violet-500/30 transition-all shadow-sm relative overflow-hidden">
                     <div className="flex items-center gap-5 relative z-10">
                        <div className="w-12 h-12 rounded-md bg-(--sp-bg-1) text-(--sp-text-3) group-hover:text-violet-500 transition-all flex items-center justify-center border border-(--sp-border) shadow-inner">
                          <MapPin size={24} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[16px] font-bold text-(--sp-text-0) tracking-tight uppercase">{cat?.name}</p>
                          <p className="text-[10px] text-(--sp-text-3) font-bold uppercase tracking-wider opacity-40">Demand sector</p>
                        </div>
                     </div>
                     <div className="text-right relative z-10">
                        <p className={cn("text-[24px] font-bold tracking-tighter tabular-nums leading-none", cat?.forecast?.includes("+") ? "text-emerald-500" : "text-rose-600")}>{cat?.forecast}</p>
                        <p className="text-[10px] font-bold text-(--sp-text-3) uppercase tracking-wider mt-2 opacity-60">{cat?.risk?.toUpperCase() || "UNKNOWN"} risk</p>
                     </div>
                     <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
                  </div>
                ))}
             </div>
          </div>

          {/* Right: Insights & Controls */}
          <div className="lg:col-span-4 space-y-8">
             <div className="bg-slate-900 rounded-md p-8 text-white shadow-xl relative overflow-hidden group border-b-4 border-violet-600/30">
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl" />
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-violet-400 mb-10 opacity-60">Market drive matrix</h3>
                
                <div className="space-y-8 relative z-10">
                   {[
                     { label: "Seasonality flux", impact: "High", icon: TrendingUp },
                     { label: "Regional event", impact: "Medium", icon: Zap },
                     { label: "Financial Delta", impact: "Low", icon: TrendingDown },
                   ].map((driver, i) => (
                     <div key={i} className="flex items-center justify-between group/item">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-md bg-white/5 flex items-center justify-center border border-white/5 group-hover/item:border-violet-500/50 transition-all shadow-sm">
                              <driver.icon size={18} className="text-violet-400" />
                           </div>
                           <span className="text-[14px] font-bold text-white/80 uppercase tracking-tight">{driver?.label}</span>
                        </div>
                        <span className={cn(
                          "text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider shadow-sm",
                          driver?.impact === "High" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                          "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        )}>{driver?.impact}</span>
                     </div>
                   ))}
                </div>
                
                <div className="flex flex-col gap-3 relative z-10 pt-10 mt-10 border-t border-white/5">
                   <button 
                    onClick={() => {
                      setIsRecalibrating(true);
                      setTimeout(() => setIsRecalibrating(false), 2000);
                    }}
                    disabled={isRecalibrating}
                    className="h-10 px-6 bg-white/5 text-white/80 rounded-md text-[11px] font-bold uppercase tracking-wider hover:bg-white/10 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 border border-white/5"
                  >
                    {isRecalibrating ? "Recalibrating..." : "Neural calibration"} <RefreshCw className={cn(isRecalibrating && "animate-spin")} size={16} />
                  </button>
                  <button className="h-10 px-6 bg-(--sp-cyan) text-white rounded-md font-bold text-[11px] uppercase tracking-wider hover:opacity-90 transition-all shadow-md border border-cyan-400">
                     Generate RFQ
                  </button>
                </div>
             </div>

             <div className="bg-(--sp-bg-2) p-10 rounded-md border border-(--sp-border) shadow-sm flex flex-col items-center text-center border-t-4 border-violet-600">
                <div className="w-16 h-16 rounded-md bg-violet-500/10 text-violet-500 border border-violet-500/20 flex items-center justify-center shadow-sm mb-8">
                   <Search size={32} />
                </div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-(--sp-text-3) mb-4 opacity-60">Confidence level</h3>
                <p className="text-[15px] font-semibold text-(--sp-text-1) leading-relaxed uppercase tracking-tight">
                  {forecast?.insights?.[1] || "Pattern matching in progress..."}
                </p>
                
                <div className="w-full mt-10 pt-10 border-t border-(--sp-border)/50">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-(--sp-text-3) opacity-40">Audit depth</span>
                      <span className="text-[13px] font-bold text-(--sp-text-1) uppercase tracking-tighter tabular-nums">12 month scan</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </SecureOverlay>
  );
}
