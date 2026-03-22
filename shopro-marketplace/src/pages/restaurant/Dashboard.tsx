"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { 
  Activity, 
  ShoppingBag, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  ChevronRight,
  RefreshCw,
  Box,
  Truck,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  Package
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { SecureOverlay } from "@/components/SecureOverlay";

/**
 * RD-00 — Restaurant Dashboard
 * Purpose: High-impact landing page for the restaurant buyer (Buyer Node Alpha).
 */

export default function RestaurantDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["buyer-stats"],
    queryFn: async () => {
      const resp = await api.get("buyer/dashboard/stats");
      return resp.data;
    }
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ["buyer-activity"],
    queryFn: async () => {
      const resp = await api.get("buyer/dashboard/activity");
      return resp.data;
    }
  });

  const STAT_CONFIG = [
    { label: "Active Orders", value: stats?.activePos, change: "+2", trend: "up", icon: ShoppingBag, color: "blue" },
    { label: "Monthly Fulfillment", value: stats?.fulfilledMtd, change: "+12%", trend: "up", icon: Activity, color: "green" },
    { label: "Inventory Alerts", value: stats?.inventoryAlerts, change: "CRITICAL", trend: "down", icon: Box, color: "rose" },
    { label: "Auto-PO Rules", value: stats?.autoPoRules, change: "SYNCED", trend: "up", icon: Zap, color: "violet" },
  ];

  return (
    <SecureOverlay>
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-24 text-slate-900 dark:text-white">
      {/* Welcome Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-slate-200 dark:border-slate-800 pb-8 transition-all">
        <div className="space-y-3">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
             Merchant <span className="text-brand-primary font-extrabold italic">Hub</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm flex items-center gap-3">
             <ShieldCheck className="w-5 h-5 text-brand-primary animate-pulse" />
             Inventory: 92% Sync • 3 Critical Discrepancies
          </p>
        </div>
        
        <div className="flex items-center gap-6">
            <button 
                onClick={() => window.location.href = '/restaurant/orders/new'}
                className="h-14 px-8 bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border border-indigo-500/50 group"
            >
                <Plus size={24} className="group-hover:rotate-90 transition-transform" />
                New Procurement
            </button>
        </div>
      </header>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STAT_CONFIG.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 50, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: i * 0.1, duration: 0.8, ease: "circOut" }}
            className={cn(
                "group relative bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-xl shadow-inner h-48 flex flex-col justify-between transition-all hover:scale-105 hover:-rotate-1 hover:border-brand-primary overflow-hidden",
                stat.color === 'rose' && "border-rose-500 shadow-rose-500/10"
            )}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
            
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">{stat.label}</p>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                    {statsLoading ? "..." : stat.value}
                </h3>
              </div>
              <div className={cn(
                "h-12 w-12 rounded-2xl flex items-center justify-center border-2 shadow-xl group-hover:scale-110 transition-transform",
                stat.color === "blue" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                stat.color === "rose" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                stat.color === "violet" ? "bg-violet-500/10 text-violet-500 border-violet-500/20" :
                "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              )}>
                <stat.icon size={20} className="shadow-text" />
              </div>
            </div>

            <div className="flex items-center justify-between relative z-10 border-t-2 border-slate-100 dark:border-slate-800 pt-6 mt-6">
                <div className="flex items-center gap-4 text-xs font-bold italic tracking-widest uppercase">
                    {stat.trend === "up" ? <ArrowUpRight size={20} className="text-emerald-500" /> : <ArrowDownRight size={20} className="text-rose-500" />}
                    <span className={cn(stat.trend === "up" ? "text-emerald-500" : "text-rose-500")}>{stat.change}</span>
                </div>
                <TrendingUp size={24} className="text-slate-200 dark:text-slate-800" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Activity Feed */}
        <div className="lg:col-span-8 space-y-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-4 uppercase">
            <Activity className="text-indigo-500" size={32} /> Activity Feed
          </h2>
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-xl shadow-inner p-6 space-y-6">
            {activityLoading ? (
               <div className="h-64 flex items-center justify-center">
                  <RefreshCw className="w-16 h-16 text-indigo-500 animate-spin" />
               </div>
            ) : (
                activity?.map((item: any, i: number) => (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/30 border-2 border-slate-100 dark:border-slate-800/60 hover:bg-white dark:hover:bg-slate-950 transition-all group/activity cursor-pointer shadow-inner"
                    >
                        <div className="flex items-center gap-6">
                            <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover/activity:bg-brand-primary group-hover/activity:text-slate-900 transition-all shadow-xl">
                                <Package size={24} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-bold dark:text-white tracking-tight text-slate-900 group-hover/activity:text-brand-primary transition-colors">{item.title}</p>
                                <p className="text-[10px] text-slate-400 font-bold tracking-widest italic opacity-60 flex items-center gap-4">
                                    {item.type} • {item.time}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-8">
                            <StatusBadge status={item.status as any} />
                            <ChevronRight size={24} className="text-slate-200 dark:text-slate-800 group-hover/activity:text-indigo-500 group-hover/activity:translate-x-2 transition-all" />
                        </div>
                    </motion.div>
                ))
            )}
            <button className="w-full h-12 bg-slate-950 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-sm tracking-wide hover:scale-[1.02] active:scale-95 transition-all shadow-lg border border-indigo-500/30">
                View All Activity
            </button>
          </div>
        </div>

        {/* Shortcuts / Quick Actions */}
        <div className="lg:col-span-4 space-y-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-4 uppercase">
            <Zap className="text-indigo-500" size={32} /> Quick Actions
          </h2>
          <div className="flex flex-col gap-6">
            {[
                { label: "Direct Procurement", sub: "Manually enter a purchase order", icon: <Plus size={28} />, color: "indigo", path: "/restaurant/orders/new" },
                { label: "Logistics Tracking", sub: "Monitor active shipments", icon: <Truck size={28} />, color: "emerald", path: "/restaurant/orders" },
                { label: "Finance Hub", sub: "Reconciliation & Payments", icon: <CreditCard size={28} />, color: "violet", path: "/restaurant/payments" },
            ].map((action, i) => (
                <button 
                    key={i}
                    onClick={() => window.location.href = action.path}
                    className="group relative h-24 overflow-hidden rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-xl shadow-inner bg-white dark:bg-slate-950 transition-all hover:scale-[1.02] active:scale-95"
                >
                    <div className={cn(
                        "absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500",
                        action.color === 'indigo' ? "bg-brand-primary" :
                        action.color === 'emerald' ? "bg-brand-secondary" :
                        "bg-brand-accent"
                    )} />
                    <div className="relative z-10 h-full p-4 flex items-center gap-6 group-hover:bg-transparent transition-colors">
                        <div className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:bg-white/20 group-hover:rotate-12 transition-all",
                            action.color === 'indigo' ? "bg-brand-primary" :
                            action.color === 'emerald' ? "bg-brand-secondary" :
                            "bg-brand-accent"
                        )}>
                            {action.icon}
                        </div>
                        <div className="text-left space-y-0.5">
                            <p className="text-lg font-bold tracking-tight group-hover:text-slate-950 transition-colors">{action.label}</p>
                            <p className="text-[10px] font-medium text-slate-500 group-hover:text-slate-950/70 transition-colors">{action.sub}</p>
                        </div>
                    </div>
                </button>
            ))}
          </div>
        </div>
      </div>
    </div>
    </SecureOverlay>
  );
}
