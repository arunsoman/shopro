"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { 
  BarChart3, 
  ShoppingBag, 
  Activity, 
  TrendingUp, 
  Clock, 
  Zap, 
  ArrowUpRight, 
  Package, 
  Bell,
  RefreshCw,
  Target,
  Truck,
  ShieldCheck,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { SecureOverlay } from "@/components/SecureOverlay";

/**
 * S-03 — Supplier Dashboard
 * Purpose: Global metrics and performance overview for suppliers.
 */

export default function SupplierDashboard() {
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["supplier-dashboard-stats"],
    queryFn: async () => {
      const resp = await api.get("/api/supplier/dashboard/stats");
      return resp.data;
    }
  });

  const { data: activity = [], isLoading: isActivityLoading } = useQuery({
    queryKey: ["supplier-dashboard-activity"],
    queryFn: async () => {
      const resp = await api.get("/api/supplier/dashboard/activity");
      return resp.data;
    }
  });

  const { data: performance } = useQuery({
    queryKey: ["supplier-dashboard-performance"],
    queryFn: async () => {
      const resp = await api.get("/api/supplier/dashboard/performance");
      return resp.data;
    }
  });

  return (
    <SecureOverlay>
    <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-1000 font-black italic uppercase leading-none pb-24">
      {/* Platform Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 border-b-8 border-slate-100 dark:border-slate-800 pb-12 font-black italic leading-none shadow-inner">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter italic uppercase leading-none shadow-text mt-4 text-slate-900 dark:text-white">
             Nexus <span className="text-indigo-500">Command.X</span>
          </h1>
          <p className="text-slate-500 font-black italic text-xl tracking-wide opacity-60 leading-none flex items-center gap-4">
             <Target className="w-8 h-8 text-indigo-500 animate-pulse" />
             Global supply chain metrics and performance overview alpha.
          </p>
        </div>
        
        <div className="flex items-center gap-6 font-black italic uppercase tracking-[0.4em] leading-none">
          <div className="flex items-center gap-4 bg-white dark:bg-slate-950 px-8 py-5 rounded-[1.5rem] border-4 border-slate-50 dark:border-slate-800 shadow-xl shadow-inner">
             <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-4xl shadow-emerald-500/20" />
             <span className="text-[10px] font-black tracking-[0.2em] italic text-slate-900 dark:text-white">NODE_ACTIVE.SIGN</span>
          </div>
          <button className="w-20 h-20 rounded-[1.5rem] bg-slate-950 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center border-4 border-slate-50 dark:border-slate-800 hover:scale-110 transition-all shadow-4xl shadow-inner">
             <Zap size={32} />
          </button>
        </div>
      </header>

      {/* KPI Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 font-black italic uppercase leading-none">
         {[
           { label: "Monthly_Revenue.X", val: stats?.monthlyRevenue ? `₹${(stats.monthlyRevenue / 100000).toFixed(1)}L` : "₹0.0L", icon: TrendingUp, color: "indigo" },
           { label: "Active_Orders.SIGN", val: stats?.activeOrders || 0, icon: Package, color: "emerald" },
           { label: "Fulfillment_Rate.FORCE", val: `${stats?.fulfillmentRate || 0}%`, icon: Zap, color: "amber" },
           { label: "Quotations_Pending.X", val: stats?.pendingQuotations || 0, icon: Clock, color: "rose" },
         ].map((kpi, i) => (
           <div key={i} className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl rounded-[3rem] border-4 border-slate-100 dark:border-slate-800 p-10 shadow-4xl flex items-center justify-between group relative overflow-hidden shadow-inner">
              <div className="space-y-4">
                 <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 opacity-60 italic leading-none">{kpi.label}</div>
                 <div className="text-5xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-none shadow-text tabular-nums">{kpi.val}</div>
              </div>
              <div className={cn("w-20 h-20 rounded-[1.5rem] flex items-center justify-center border-4 transition-all group-hover:scale-110 shadow-4xl", 
                 kpi.color === 'indigo' ? 'bg-indigo-600 border-indigo-400 text-white shadow-indigo-500/20' : 
                 kpi.color === 'emerald' ? 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/20' : 
                 kpi.color === 'rose' ? 'bg-rose-600 border-rose-400 text-white shadow-rose-500/20' : 
                 'bg-amber-500 border-amber-300 text-white shadow-amber-500/20')}>
                 <kpi.icon size={32} />
              </div>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 font-black italic uppercase leading-none">
         {/* Live Ledger / Audit Log */}
         <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between px-8 bg-slate-50/50 dark:bg-slate-950/20 py-6 rounded-[2rem] border-4 border-slate-100 dark:border-slate-800/60 shadow-text">
               <h2 className="text-3xl font-black italic text-slate-900 dark:text-white flex items-center gap-6 tracking-tight">
                  <Activity size={32} className="text-indigo-500 animate-pulse" /> Live System Audit.X
               </h2>
               <button className="text-[11px] font-black text-indigo-500 hover:text-indigo-600 tracking-[0.4em] italic uppercase transition-all flex items-center gap-4">
                  FULL_LEDGER.FORCE <ChevronRight size={20} />
               </button>
            </div>
            
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl rounded-[4rem] border-4 border-slate-100 dark:border-slate-800 p-1 shadow-4xl shadow-inner min-h-[500px] overflow-hidden">
               {isActivityLoading ? (
                  <div className="p-40 flex flex-col items-center justify-center space-y-12 opacity-40">
                      <RefreshCw className="w-20 h-20 text-indigo-500 animate-spin" />
                      <p className="text-[12px] tracking-[0.6em] font-black uppercase italic italic">SYNCING_WITH_REGISTRY.X...</p>
                  </div>
               ) : (
                  <div className="divide-y-8 divide-slate-100 dark:divide-slate-800/60">
                     {activity.map((log: any) => (
                        <div key={log.id} className="p-10 hover:bg-white dark:hover:bg-slate-950/50 transition-all flex items-center justify-between gap-12 group/row cursor-crosshair">
                           <div className="flex items-center gap-8 min-w-0">
                              <div className={cn("w-16 h-16 rounded-[1.25rem] flex items-center justify-center shadow-4xl border-4 transition-all group-hover/row:scale-110", 
                                 log.type === 'ORDER' ? 'bg-indigo-600 text-white border-indigo-400 shadow-indigo-500/20' : 
                                 log.type === 'BID' ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20' : 
                                 log.type === 'FINANCE' ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-900 border-slate-700 dark:border-slate-300 shadow-4xl' : 
                                 'bg-rose-600 text-white border-rose-400 shadow-rose-500/20')}>
                                 {log.type === 'ORDER' ? <ShoppingBag size={28} /> : log.type === 'BID' ? <Zap size={28} /> : log.type === 'FINANCE' ? <ShieldCheck size={28} /> : <AlertCircle size={28} />}
                              </div>
                              <div className="min-w-0 space-y-2">
                                 <p className="text-2xl font-black italic tracking-tight text-slate-900 dark:text-white uppercase leading-none shadow-text group-hover/row:text-indigo-500 transition-colors">{log.event}</p>
                                 <div className="flex items-center gap-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic opacity-60 leading-none">
                                    <Clock size={14} className="text-indigo-500" /> {log.time} • {log.type}_NODE.X
                                 </div>
                              </div>
                           </div>
                           <ArrowUpRight size={32} className="text-slate-200 dark:text-slate-800 group-hover/row:text-indigo-500 transition-all group-hover/row:translate-x-2 group-hover/row:-translate-y-2 shrink-0 shadow-text" />
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>

         {/* Efficiency & Compliance */}
         <div className="lg:col-span-4 space-y-8">
            <h2 className="text-3xl font-black italic text-slate-900 dark:text-white flex items-center gap-6 px-10 tracking-tight shadow-text">
               <BarChart3 size={32} className="text-indigo-500" /> Performance.X
            </h2>
            <div className="bg-slate-950 rounded-[4rem] p-12 border-b-[1.5rem] border-indigo-600 shadow-4xl shadow-inner space-y-12 relative overflow-hidden group">
               <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-150 transition-transform duration-[4000ms]" />
               
               <div className="relative z-10 space-y-10">
                  {[
                     { name: "Fulfillment_Accuracy.SIGN", val: performance?.fulfillment || 0, color: "indigo" },
                     { name: "On-Time_Dispatch.NODE", val: performance?.onTimeDelivery || 0, color: "emerald" },
                     { name: "Quality_Index.FLUX", val: performance?.qualityIndex || 0, color: "rose" },
                  ].map((sys) => (
                     <div key={sys.name} className="space-y-5 group/stat">
                        <div className="flex items-center justify-between uppercase">
                           <span className="text-[11px] font-black text-slate-400 tracking-[0.4em] group-hover/stat:text-white transition-colors italic leading-none">{sys.name}</span>
                           <span className={cn("text-2xl font-black italic tracking-tighter tabular-nums leading-none shadow-text", 
                              sys.color === 'indigo' ? 'text-indigo-500' : sys.color === 'emerald' ? 'text-emerald-500' : 'text-rose-500')}>{sys.val}%</span>
                        </div>
                        <div className="h-4 w-full bg-white/5 rounded-full border-2 border-white/5 overflow-hidden shadow-inner flex items-center p-1">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${sys.val}%` }}
                             className={cn("h-full rounded-full shadow-4xl", 
                                sys.color === 'indigo' ? 'bg-indigo-600 shadow-indigo-500/30' : 
                                sys.color === 'emerald' ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-rose-600 shadow-rose-500/30')}
                           />
                        </div>
                     </div>
                  ))}
               </div>

               <div className="pt-12 border-t-4 border-white/5 space-y-8 relative z-10 font-black italic shadow-inner">
                  <div className="flex items-start gap-6 font-black italic">
                    <ShieldCheck size={32} className="text-amber-500 animate-pulse shrink-0 shadow-text" />
                    <p className="text-[11px] text-slate-400 font-black tracking-[0.2em] leading-relaxed italic uppercase opacity-60">
                      Integrity check completed 3m ago. All encryption keys are rotated and secure delta.
                    </p>
                  </div>
                  <button className="w-full h-20 bg-white/5 hover:bg-white/10 border-4 border-white/5 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.5em] transition-all hover:scale-105 active:scale-95 italic shadow-4xl">
                    INFRASTRUCTURE_DETAILS.FORCE
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
    </SecureOverlay>
  );
}
