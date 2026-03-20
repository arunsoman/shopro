"use client";

import { motion } from "framer-motion";
import { GlowingBorder } from "@/components/ui/neon-button";
import { BarChart3, Users, Landmark, Activity, Zap, ShieldAlert, Globe, Server, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import React from "react";

/**
 * OD-00 — Operator Dashboard (Control Center)
 * Purpose: Global platform health and transaction overview.
 * DNA: Matrix-style stat grid, system health indicators, live audit feed.
 */

const KPIs = [
  { label: "Active Marketplace Volume", value: "$4.2M", change: "+12.5%", icon: BarChart3, color: "violet", target: "/operator/revenue" },
  { label: "Total Restaurants", value: "842", change: "+48", icon: Globe, color: "blue", target: "/operator/restaurants" },
  { label: "Verified Suppliers", value: "156", change: "+3", icon: Users, color: "green", target: "/operator/suppliers" },
  { label: "Pending Payouts", value: "14", change: "Critical", icon: Landmark, color: "amber", target: "/operator/finance/payout-queue" },
];

const SYSTEM_HEALTH = [
  { name: "Order Engine", status: "Optimal", color: "green" },
  { name: "Bid Matching", status: "Optimal", color: "green" },
  { name: "Payment Gateway", status: "Optimal", color: "green" },
  { name: "Logistics Sync", status: "High Latency", color: "amber" },
];

const AUDIT_LOG = [
  { id: 1, action: "Order #9921 Route Modified", user: "Admin (Sarah)", target: "Logistics", time: "2m ago", severity: "low" },
  { id: 2, action: "Supplier #402 Payout Delayed", user: "System", target: "Finance", time: "15m ago", severity: "high" },
  { id: 3, action: "New Bid Template Published", user: "Ops (Mike)", target: "Marketplace", time: "1h ago", severity: "low" },
  { id: 4, action: "Category 'Bio-Packaging' Added", user: "Content Admin", target: "Catalog", time: "3h ago", severity: "low" },
];

export default function OperatorDashboard() {
  const navigate = useNavigate();
  const [period, setPeriod] = React.useState("This Month");

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Platform Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
             <span className="font-mono opacity-50 text-xl tracking-tighter">OD-00</span> Control Center
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Global Marketplace Operations & System Resilience
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* [NEW] Period selector */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            {["This Week", "This Month", "Quarter"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                  period === p 
                    ? "bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm shadow-slate-200/50" 
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Region: APAC-South</span>
          </div>
          <button className="p-2 bg-white dark:bg-slate-900 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm text-slate-500 hover:text-violet-500 transition-colors">
            <Zap size={20} />
          </button>
        </div>
      </div>

      {/* KPI Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {KPIs.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="group relative h-36 cursor-pointer"
            onClick={() => navigate(kpi.target)}
          >
            <GlowingBorder spread={50} />
            <div className="relative z-10 h-full bg-white dark:bg-slate-950 rounded-3xl p-6 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all flex flex-col justify-between overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{kpi.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{kpi.label}</p>
                </div>
                <div className={cn(
                  "p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 transition-colors group-hover:bg-violet-50 dark:group-hover:bg-violet-900/20",
                  kpi.color === "violet" ? "text-violet-500" : kpi.color === "green" ? "text-green-500" : "text-blue-500"
                )}>
                  <kpi.icon size={20} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full",
                  kpi.change === "Critical" ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300" : "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300"
                )}>
                  {kpi.change}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Last 24h</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Audit Log / Event Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity size={18} className="text-violet-500" /> System Audit Trail
            </h2>
            <button 
              onClick={() => navigate("/operator/audit-trail")}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Full Logs
            </button>
          </div>
          
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none">
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {AUDIT_LOG.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      log.severity === "high" ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-slate-300 dark:bg-slate-700"
                    )} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{log.action}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{log.user}</span>
                         <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                         <span className="text-[10px] font-bold text-violet-500 uppercase tracking-tighter">{log.target}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap tabular-nums">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Health Area */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 px-2">
             <Server size={18} className="text-blue-500" /> Infrastructure
          </h2>
          <div className="bg-slate-900 dark:bg-slate-950 rounded-3xl p-6 ring-1 ring-white/10 shadow-2xl space-y-6">
            <div className="space-y-4">
              {SYSTEM_HEALTH.map((sys) => (
                <div key={sys.name} className="flex items-center justify-between group">
                  <span className="text-xs font-medium text-slate-400 group-hover:text-white transition-colors">{sys.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] font-bold uppercase",
                      sys.color === "green" ? "text-green-500" : "text-amber-500"
                    )}>{sys.status}</span>
                    <div className={cn("w-1.5 h-1.5 rounded-full", sys.color === "green" ? "bg-green-500" : "bg-amber-500")} />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-white/5 space-y-4">
               <div className="flex items-center gap-3">
                 <ShieldAlert size={16} className="text-amber-500" />
                 <p className="text-[10px] text-slate-400 leading-tight">
                   Integrity check completed 3m ago. All encryption keys are rotated and secure.
                 </p>
               </div>
               <button 
                onClick={() => navigate("/operator/system-health")}
                className="w-full h-10 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-all transition-colors"
               >
                 Infrastructure Details
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
