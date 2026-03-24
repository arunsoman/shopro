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
      const resp = await api.get("/supplier/dashboard/stats");
      return resp.data;
    }
  });

  const { data: activity = [], isLoading: isActivityLoading } = useQuery({
    queryKey: ["supplier-dashboard-activity"],
    queryFn: async () => {
      const resp = await api.get("/supplier/dashboard/activity");
      return resp.data;
    }
  });

  const { data: performance } = useQuery({
    queryKey: ["supplier-dashboard-performance"],
    queryFn: async () => {
      const resp = await api.get("/supplier/dashboard/performance");
      return resp.data;
    }
  });

  return (
    <SecureOverlay>
    <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-1000 leading-none pb-24">
      {/* Platform Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b-4 border-slate-100 dark:border-slate-800 pb-10 shadow-sm">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
             Supplier <span className="text-indigo-500">Control Center</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg tracking-normal opacity-80 leading-relaxed flex items-center gap-3">
             <Target className="w-6 h-6 text-indigo-500" />
             A comprehensive overview of your supply chain performance and marketplace metrics.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white dark:bg-slate-950 px-6 py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-sm">
             <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
             <span className="text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase">System Online</span>
          </div>
          <button className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg active:scale-95">
             <Zap size={24} />
          </button>
        </div>
      </header>

      {/* KPI Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: "Monthly Revenue", val: stats?.monthlyRevenue ? `₹${(stats.monthlyRevenue / 100000).toFixed(1)}L` : "₹0.0L", icon: TrendingUp, color: "indigo" },
           { label: "Active Orders", val: stats?.activeOrders || 0, icon: Package, color: "emerald" },
           { label: "Fulfillment Rate", val: `${stats?.fulfillmentRate || 0}%`, icon: Zap, color: "amber" },
           { label: "Pending Quotations", val: stats?.pendingQuotations || 0, icon: Clock, color: "rose" },
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
         <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-6 bg-slate-50/50 dark:bg-slate-950/20 py-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm">
               <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-4 tracking-tight">
                  <Activity size={24} className="text-indigo-500" /> Recent Activity
               </h2>
               <button className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 tracking-wider uppercase transition-all flex items-center gap-2">
                  View Full History <ChevronRight size={18} />
               </button>
            </div>
            
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 p-1 shadow-sm min-h-[500px] overflow-hidden">
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
                                 <p className="text-lg font-bold text-slate-900 dark:text-white uppercase leading-none group-hover/row:text-indigo-600 transition-colors">{log.event}</p>
                                 <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 uppercase tracking-widest opacity-80 leading-none">
                                    <Clock size={12} className="text-indigo-500" /> {log.time} • {log.type.toLowerCase()} update
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
         <div className="lg:col-span-4 space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-4 px-6 tracking-tight">
               <BarChart3 size={24} className="text-indigo-500" /> Performance Metrics
            </h2>
            <div className="bg-slate-900 dark:bg-slate-950 rounded-[2rem] p-8 border-b-8 border-indigo-600 shadow-xl space-y-10 relative overflow-hidden group">
               <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-150 transition-transform duration-[4000ms]" />
               
               <div className="relative z-10 space-y-8">
                  {[
                     { name: "Fulfillment Accuracy", val: performance?.fulfillment || 0, color: "indigo" },
                     { name: "On-Time Delivery", val: performance?.onTimeDelivery || 0, color: "emerald" },
                     { name: "Quality Score", val: performance?.qualityIndex || 0, color: "rose" },
                  ].map((sys) => (
                     <div key={sys.name} className="space-y-4 group/stat">
                        <div className="flex items-center justify-between">
                           <span className="text-[11px] font-bold text-slate-400 tracking-wider group-hover/stat:text-white transition-colors uppercase leading-none">{sys.name}</span>
                           <span className={cn("text-xl font-black italic tracking-tight tabular-nums leading-none", 
                               sys.color === 'indigo' ? 'text-indigo-500' : sys.color === 'emerald' ? 'text-emerald-500' : 'text-rose-500')}>{sys.val}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden flex items-center">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${sys.val}%` }}
                             className={cn("h-full rounded-full", 
                                sys.color === 'indigo' ? 'bg-indigo-600' : 
                                sys.color === 'emerald' ? 'bg-emerald-500' : 'bg-rose-600')}
                           />
                        </div>
                     </div>
                  ))}
               </div>

               <div className="pt-8 border-t border-white/5 space-y-6 relative z-10">
                  <div className="flex items-start gap-4">
                    <ShieldCheck size={24} className="text-amber-500 shrink-0" />
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed opacity-80">
                      Standard system check completed 3m ago. Your account data and transaction logs are fully secured.
                    </p>
                  </div>
                  <button className="w-full h-14 bg-white/5 hover:bg-white/10 border-2 border-white/5 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-sm">
                    View Performance Details
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
    </SecureOverlay>
  );
}
