"use client";

import { StatusBadge } from "@/components/ui/status-badge";
import { Cpu, RotateCcw, Search, AlertCircle, Play, History, Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AUTO-OP-01 — Auto-PO Admin View
 * Purpose: Oversight of automated PO triggers.
 * DNA: System health metrics, trigger logs, manual retry pulse.
 */

const TRIGGER_LOGS = [
  { id: "ATR-902", time: "10m ago", restaurant: "Mama’s Italian", type: "LOW_STOCK", items: 4, status: "PO_CREATED", result: "PO-9925" },
  { id: "ATR-905", time: "2h ago", restaurant: "Zen Sushi", type: "RECURRING", items: 12, status: "FAILED", result: "Invalid SKU mapping" },
  { id: "ATR-901", time: "4h ago", restaurant: "Green Leaf", type: "LOW_STOCK", items: 1, status: "PO_SKIPPED", result: "Below Min Threshold" },
  { id: "ATR-898", time: "1d ago", restaurant: "Ocean Grill", type: "PAR_LEVEL", items: 45, status: "PO_CREATED", result: "PO-9901" },
];

export default function AutoPOAdmin() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-violet-500/10 text-violet-500">
               <Cpu size={24} />
             </div>
             <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Auto-PO Controller</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Real-time monitoring of automated procurement triggers and background worker health.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search Request ID..." 
              className="h-10 pl-9 pr-4 bg-white dark:bg-slate-900 rounded-xl text-xs ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-violet-500 outline-none transition-all"
            />
          </div>
          <button className="h-10 px-4 bg-violet-600 text-white rounded-xl text-xs font-black flex items-center gap-2 hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/20">
            <Play size={14} /> Refresh Engine
          </button>
        </div>
      </div>

      {/* System Health DNA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Triggers (24h)", value: "1,245", color: "blue", trend: "+12%" },
          { label: "Success Rate", value: "98.4%", color: "green", trend: "Stable" },
          { label: "Active Workers", value: "48 / 64", color: "violet", trend: "High Load" },
          { label: "Failures (MTD)", value: "14", color: "rose", trend: "-5%" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl ring-1 ring-slate-100 dark:ring-slate-800">
            <div className="flex justify-between items-start mb-2">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{stat.label}</p>
               <span className={cn(
                 "text-[8px] font-black px-1.5 py-0.5 rounded tracking-tighter",
                 stat.trend.includes("+") ? "bg-green-100 text-green-600" : stat.trend.includes("-") ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"
               )}>{stat.trend}</span>
            </div>
            <p className={cn(
              "text-2xl font-black",
              stat.color === "blue" ? "text-blue-500" : stat.color === "green" ? "text-green-500" : stat.color === "rose" ? "text-rose-500" : "text-violet-500"
            )}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Trigger Logs Table */}
      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <History size={20} className="text-slate-400" />
             <h2 className="text-lg font-bold uppercase tracking-tighter">Trigger Event Stream</h2>
          </div>
          <button className="h-8 px-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-colors">
            DOWNLOAD SYSTEM AUDIT
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                <th className="p-6">Timestamp & ID</th>
                <th className="p-6">Origin Restaurant</th>
                <th className="p-6">Trigger Type</th>
                <th className="p-6">Status</th>
                <th className="p-6">Result/Payload</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {TRIGGER_LOGS.map((log) => (
                <tr key={log.id} className="group hover:bg-white dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-6">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{log.id}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{log.time}</p>
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{log.restaurant}</p>
                  </td>
                  <td className="p-6">
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500">
                      {log.type === "LOW_STOCK" && <AlertCircle size={10} className="text-amber-500" />}
                      {log.type === "RECURRING" && <Loader2 size={10} className="text-blue-500 animate-spin" />}
                      {log.type}
                    </div>
                  </td>
                  <td className="p-6">
                    <StatusBadge status={log.status as any} />
                  </td>
                  <td className="p-6">
                    <p className={cn(
                      "text-xs font-bold",
                      log.status === "FAILED" ? "text-rose-500" : "text-violet-500 underline underline-offset-4 decoration-violet-500/30"
                    )}>{log.result}</p>
                  </td>
                  <td className="p-6 text-right">
                    {log.status === "FAILED" ? (
                      <button className="h-8 px-3 rounded-lg bg-rose-500 text-white text-[10px] font-black hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/10 flex items-center gap-1 mx-auto ml-auto">
                        <RotateCcw size={12} /> RETRY
                      </button>
                    ) : (
                      <button className="h-8 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-violet-500 transition-colors">
                        <Info size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Troubleshooting Alert DNA */}
      <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-900/10 border border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-4 text-amber-600 dark:text-amber-500">
           <AlertCircle size={32} className="animate-pulse" />
           <div className="space-y-1">
             <h3 className="text-sm font-bold uppercase tracking-widest">Active System Alert</h3>
             <p className="text-xs">ElasticSearch worker cluster "ASIA-SOUTH-1" is experiencing 12% higher latency than baseline.</p>
           </div>
         </div>
         <button className="h-10 px-6 rounded-xl bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all shadow-xl shadow-amber-600/10">
           Scale Cluster
         </button>
      </div>
    </div>
  );
}
