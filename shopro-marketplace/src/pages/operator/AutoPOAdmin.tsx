"use client";

import React from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Cpu, RotateCcw, Search, AlertCircle, Play, History, Loader2, Info, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * AUTO-OP-01 — Auto-PO Admin View
 * Purpose: Oversight of automated PO triggers.
 * DNA: System health metrics, trigger logs, manual retry pulse.
 */

interface AutoPORule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  status: string;
}

export default function AutoPOAdmin() {
  const { data: rules = [], isLoading } = useQuery<AutoPORule[]>({
    queryKey: ["autopo-rules"],
    queryFn: async () => {
      const resp = await api.get("/operator/automation/autopo/rules");
      return resp.data?.map((rule: any) => ({
        id: rule?.id || "---",
        name: rule?.name || "Unknown Rule",
        trigger: rule?.trigger || "No Trigger",
        action: rule?.action || "No Action",
        status: rule?.status || "Inactive"
      })) || [];
    }
  });

  return (
    <SecureOverlay>
    <div className="max-w-[1280px] mx-auto space-y-8 animate-in fade-in duration-1000 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-(--sp-border) pb-8">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-md bg-violet-500/10 text-violet-600 flex items-center justify-center border border-violet-500/20 shadow-sm">
             <Cpu size={28} />
           </div>
           <div className="space-y-1">
             <h1 className="text-[28px] font-medium tracking-tight text-(--sp-text-0)">Auto-PO controller</h1>
             <p className="text-(--sp-text-3) text-[13px] font-medium">
                Real-time monitoring of automated procurement triggers and health protocols.
             </p>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--sp-text-3) group-focus-within:text-violet-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search trace ID..." 
              className="h-9 pl-9 pr-4 bg-(--sp-bg-1) rounded-md text-[13px] outline-none border border-(--sp-border) focus:border-violet-500/50 transition-all w-48 text-(--sp-text-1)"
            />
          </div>
          <button className="h-9 px-4 bg-violet-600 text-white rounded-md text-[11px] font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-sm flex items-center gap-2">
            <Play size={16} /> Reboot engine
          </button>
        </div>
      </header>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Triggers (24h)", value: "1,245", color: "text-(--sp-cyan)", trend: "+12%" },
          { label: "Success rate", value: "98.4%", color: "text-emerald-500", trend: "Stable" },
          { label: "Active workers", value: "48 / 64", color: "text-violet-600", trend: "High Load" },
          { label: "Failures (MTD)", value: "14", color: "text-rose-500", trend: "-5%" },
        ].map((stat) => (
          <div key={stat.label} className="bg-(--sp-bg-2) p-6 rounded-md border border-(--sp-border) shadow-sm hover:border-violet-500/30 transition-all">
            <div className="flex justify-between items-start mb-6">
               <p className="text-[11px] text-(--sp-text-3) font-bold uppercase tracking-wider">{stat.label}</p>
               <span className={cn(
                 "text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase border",
                 stat.trend.includes("+") ? "bg-emerald-50 text-emerald-600 border-emerald-100" : stat.trend.includes("-") ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-(--sp-bg-1) text-(--sp-text-3) border-(--sp-border)"
               )}>{stat.trend}</span>
            </div>
            <p className={cn("text-[24px] font-semibold tracking-tight tabular-nums leading-none", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Trigger Logs Table */}
      <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) overflow-hidden shadow-sm">
        <div className="p-6 border-b border-(--sp-border) flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History size={20} className="text-violet-600" />
            <h2 className="text-[18px] font-medium text-(--sp-text-0)">Trigger event stream</h2>
          </div>
          <button className="h-8 px-4 bg-(--sp-bg-1) rounded-md border border-(--sp-border) text-[11px] font-bold text-(--sp-text-3) hover:text-(--sp-text-1) transition-all uppercase tracking-wider">
            Download audit
          </button>
        </div>
        
        {isLoading ? (
             <div className="py-20 flex flex-col items-center justify-center space-y-4 opacity-40">
                <RefreshCw className="w-10 h-10 text-violet-600 animate-spin" />
                <p className="text-(--sp-text-3) tracking-wider text-[11px] font-bold uppercase">Parsing trigger registry...</p>
             </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
               <tr className="bg-(--sp-bg-1)/50 text-(--sp-text-3) border-b border-(--sp-border)">
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-center w-24">ID</th>
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider">Rule identifier</th>
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider">Trigger node</th>
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-center">Status</th>
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--sp-border)">
              {rules?.map((log) => (
                <tr key={log?.id} className="group hover:bg-(--sp-bg-1)/50 transition-colors">
                  <td className="px-8 py-6 text-center">
                    <div className="text-[13px] font-medium text-(--sp-text-3) tabular-nums">{log?.id}</div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-[15px] font-semibold text-(--sp-text-1)">{log?.name}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-(--sp-bg-1) text-[11px] font-medium text-(--sp-text-3) border border-(--sp-border)">
                      <AlertCircle size={14} className="text-amber-500" />
                      {log?.trigger}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                     <div className={cn(
                       "inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border",
                       log?.status === 'Active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                     )}>
                       {log?.status}
                     </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="h-8 px-4 rounded-md bg-violet-600 text-white font-bold text-[11px] uppercase tracking-wider hover:opacity-90 transition-all shadow-sm">
                         {log?.action}
                      </button>
                      <button className="w-8 h-8 rounded-md border border-(--sp-border) text-(--sp-text-3) hover:text-violet-600 transition-all flex items-center justify-center bg-(--sp-bg-2)">
                         <Info size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
      
      {/* Troubleshooting Alert */}
      <div className="p-6 rounded-md bg-amber-50 border border-amber-200 flex flex-col md:flex-row items-center justify-between gap-6 dark:bg-amber-950/20 dark:border-amber-500/20">
         <div className="flex items-center gap-4 text-amber-700 dark:text-amber-500">
            <div className="w-12 h-12 rounded-md bg-white dark:bg-amber-900/20 flex items-center justify-center border border-amber-200 dark:border-amber-500/20 shadow-sm">
               <AlertCircle size={24} className="animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-[10px] font-bold uppercase tracking-wider opacity-60 text-(--sp-text-3)">System alert</h3>
              <p className="text-[14px] font-medium text-amber-900 dark:text-amber-400">ElasticSearch worker cluster "ASIA-SOUTH-1" latency spike detected.</p>
            </div>
         </div>
         <button className="h-9 px-6 rounded-md bg-amber-600 text-white text-[11px] font-bold uppercase tracking-wider hover:bg-amber-700 transition-all shadow-sm">
           Scale cluster protocol
         </button>
      </div>
    </div>
    </SecureOverlay>
  );
}
