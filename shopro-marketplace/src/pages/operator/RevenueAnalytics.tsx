"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Globe, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Filter, 
  Download,
  Activity,
  Zap,
  Target,
  Users,
  Briefcase,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

// DNA PRIMITIVES removed to align with Shopro design system.

// ─── PAGE COMPONENT ──────────────────────────────────────────────────────────

interface RevenueStats {
  totalGMV: string;
  netRevenue: string;
  activeUsers: number;
  growthRate: string;
}

export default function RevenueAnalytics() {
  const [timeframe, setTimeframe] = useState("30d");

  const { data: stats, isLoading } = useQuery<RevenueStats>({
    queryKey: ["revenue-analytics", timeframe],
    queryFn: async () => {
      const resp = await api.get("/operator/finance/analytics/revenue");
      return resp.data;
    }
  });

  return (
    <SecureOverlay>
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <div>
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-(--sp-border)">
          <div className="space-y-1">
            <h1 className="text-[28px] font-medium tracking-[-0.02em] text-(--sp-text-0)">
               Revenue pulse
            </h1>
            <p className="text-[13px] text-(--sp-text-2) flex items-center gap-2">
               <Activity className="w-4 h-4 text-(--sp-cyan)" />
               Real-time marketplace yield and take-rate dynamics protocol
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex items-center p-1 bg-(--sp-bg-1) rounded-[8px] border border-(--sp-border) shadow-sm">
                {["7d", "30d", "90d", "YTD"].map(t => (
                  <button 
                    key={t} 
                    onClick={() => setTimeframe(t)} 
                    className={cn(
                      "px-4 py-1.5 rounded-[6px] text-[12px] font-medium transition-all", 
                      timeframe === t 
                        ? "bg-(--sp-bg-0) text-(--sp-text-0) shadow-sm border border-(--sp-border)" 
                        : "text-(--sp-text-2) hover:text-(--sp-text-1)"
                    )}
                  >
                     {t}
                  </button>
                ))}
             </div>
             <button className="h-9 w-9 rounded-[6px] bg-(--sp-bg-2) text-(--sp-text-2) hover:text-(--sp-cyan) transition-all flex items-center justify-center border border-(--sp-border) shadow-sm">
                <Download size={18} />
             </button>
          </div>
        </header>

        {isLoading ? (
             <div className="py-24 flex flex-col items-center justify-center space-y-4">
                <RefreshCw className="w-10 h-10 text-(--sp-cyan) animate-spin" />
                <p className="text-(--sp-text-2) text-[11px] font-medium uppercase tracking-[0.06em] animate-pulse">Aggregating transactional data points...</p>
             </div>
        ) : (
        <>
        {/* Dynamic GMV Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="md:col-span-2 bg-(--sp-bg-2) border border-(--sp-border) p-8 rounded-[12px] shadow-sm relative overflow-hidden group">
              <div className="flex justify-between items-start mb-10 relative z-10">
                 <div>
                    <h3 className="text-[11px] font-medium uppercase text-(--sp-text-2) tracking-[0.06em] mb-4">Marketplace GMV Spectrum</h3>
                    <div className="text-[48px] tracking-tight font-light text-(--sp-text-0) leading-none tabular-nums">{stats?.totalGMV}</div>
                    <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[11px] font-medium border border-emerald-500/20 w-fit">
                       <TrendingUp size={14} /> {stats?.growthRate} acceleration
                    </div>
                 </div>
                 <div className="text-right">
                    <h3 className="text-[11px] font-medium uppercase text-(--sp-text-2) tracking-[0.06em] mb-4">Target yield</h3>
                    <div className="text-[24px] text-(--sp-text-0) font-medium tracking-tight tabular-nums">$5.0M</div>
                 </div>
              </div>

              <div className="h-64 flex items-end gap-3 relative z-10">
                 {[40, 55, 30, 70, 45, 90, 60, 85, 50, 75, 95, 80].map((h, i) => (
                   <div key={i} className="flex-1 group/bar relative">
                      <motion.div 
                        initial={{ height: 0 }} 
                        animate={{ height: `${h}%` }} 
                        transition={{ delay: i * 0.05 }}
                        className={cn(
                          "w-full bg-(--sp-bg-3) rounded-t-[4px] group-hover:bg-(--sp-cyan) transition-all duration-300", 
                          i === 10 ? "bg-(--sp-cyan)" : ""
                        )} 
                      />
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-medium text-(--sp-text-2) uppercase tracking-[0.06em] opacity-60">W{i+1}</div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="space-y-6">
              <div className="bg-(--sp-bg-2) rounded-[12px] p-8 border border-(--sp-border) shadow-sm relative overflow-hidden group flex flex-col justify-between h-72">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-(--sp-cyan) opacity-5 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                 <div className="relative z-10">
                    <h3 className="text-[11px] font-medium uppercase tracking-[0.06em] mb-8 text-(--sp-text-2) leading-none">Avg. system take rate</h3>
                    <div className="text-[64px] font-light tracking-[-0.03em] leading-none mb-4 tabular-nums text-(--sp-text-0)">3.8<span className="text-[24px] opacity-40 font-medium tracking-tight leading-none">%</span></div>
                    <p className="text-[11px] text-(--sp-text-2) leading-relaxed tracking-tight">Dynamic optimization engine current target yield: 4.2%</p>
                 </div>
                 <button className="w-full h-10 rounded-[6px] bg-(--sp-bg-3) text-(--sp-text-1) hover:text-(--sp-text-0) text-[12px] font-medium border border-(--sp-border) transition-all shadow-sm relative z-10">Adjust yield strategy</button>
              </div>

              <div className="bg-(--sp-bg-2) rounded-[12px] p-8 text-(--sp-text-0) shadow-sm relative overflow-hidden group flex flex-col justify-between h-72 border border-(--sp-border)">
                 <div className="absolute -bottom-20 -right-20 w-32 h-32 bg-(--sp-cyan) opacity-5 rounded-full blur-[60px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                 <div className="relative z-10">
                    <h3 className="text-[11px] font-medium uppercase tracking-[0.06em] mb-8 text-(--sp-text-2) leading-none">Net platform revenue</h3>
                    <div className="text-[40px] font-light tracking-[-0.02em] leading-none mb-6 tabular-nums text-(--sp-text-0)">{stats?.netRevenue}</div>
                    <div className="space-y-3">
                       <div className="flex justify-between items-center text-[11px] font-medium text-(--sp-text-2) uppercase tracking-[0.06em] leading-none">
                          <span>SaaS node fees</span>
                          <span className="text-(--sp-text-1)">$42k</span>
                       </div>
                       <div className="w-full h-1.5 bg-(--sp-bg-1) rounded-full overflow-hidden shadow-inner">
                          <div className="w-1/3 h-full bg-(--sp-cyan) shadow-sm" />
                       </div>
                    </div>
                 </div>
                 <div className="text-[11px] font-medium uppercase tracking-[0.06em] flex items-center gap-2 text-(--sp-text-2) relative z-10 leading-none">
                    <Target className="w-4 h-4 text-(--sp-cyan) animate-pulse" /> 92% of target
                 </div>
              </div>
           </div>
        </div>

        {/* Regional Pulse */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           <div className="lg:col-span-12">
              <div className="bg-(--sp-bg-2) border border-(--sp-border) p-8 rounded-[12px] shadow-sm relative overflow-hidden group">
                 <div className="flex items-center justify-between mb-8 relative z-10">
                    <h3 className="text-[20px] font-medium tracking-tight flex items-center gap-3 text-(--sp-text-0)">
                       <Globe size={24} className="text-(--sp-cyan) animate-spin-slow" />
                       Regional performance matrix
                    </h3>
                    <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-(--sp-text-2) flex items-center gap-2 border border-(--sp-border) px-3 py-1.5 rounded-[6px] bg-(--sp-bg-1) shadow-sm">
                       <Zap className="w-4 h-4 text-(--sp-cyan)" /> AI insights active
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                    {[
                      { city: "Dubai Marina", gmv: "$1.8M", orders: 4200, status: "Peak" },
                      { city: "Business Bay", gmv: "$1.2M", orders: 3100, status: "Growing" },
                      { city: "JLT Cluster", gmv: "$0.9M", orders: 2500, status: "Stabilizing" },
                      { city: "Sharjah Central", gmv: "$0.4M", orders: 1200, status: "New Node" },
                    ].map((region, i) => (
                      <div key={i} className="p-6 bg-(--sp-bg-1)/30 rounded-[10px] border border-transparent hover:border-(--sp-border) transition-all cursor-pointer group/card shadow-sm hover:shadow-md">
                         <div className="text-[11px] text-(--sp-text-2) uppercase tracking-[0.06em] mb-4">{region.city} Node</div>
                         <div className="text-[32px] font-light tracking-[-0.03em] border-b border-(--sp-border) pb-6 mb-6 group-hover:text-(--sp-cyan) transition-colors tabular-nums text-(--sp-text-0)">{region.gmv}</div>
                         <div className="space-y-4">
                            <div className="flex justify-between items-center text-[11px] font-medium uppercase text-(--sp-text-2) tracking-[0.06em]">
                               <span>Volume flux</span>
                               <span className="text-(--sp-text-1)">{region.orders}</span>
                            </div>
                            <div className={cn(
                              "h-8 rounded-[4px] text-[10px] uppercase tracking-[0.06em] font-medium flex items-center justify-center border shadow-sm", 
                              i === 0 
                                ? "bg-(--sp-cyan-dim) text-(--sp-cyan) border-(--sp-cyan-border)" 
                                : "bg-(--sp-bg-1) text-(--sp-text-2) border-(--sp-border)"
                            )}>
                               {region.status}
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
        </>
        )}
      </div>
    </div>
    </SecureOverlay>
  );
}
