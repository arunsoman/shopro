"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { 
  Terminal, 
  Activity, 
  Search, 
  Filter, 
  Trash2, 
  ChevronRight, 
  Clock, 
  Database, 
  ShieldCheck, 
  Cpu,
  Brain,
  Zap,
  Info,
  AlertTriangle,
  History,
  GitBranch,
  RefreshCw
} from "lucide-react";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

interface AutomationLogEntry {
  id: string;
  timestamp: string;
  event: string;
  source: string;
  status: string;
  impact?: string;
  reason?: string;
}

export default function AutomationLog() {
  const { data: logs = [], isLoading } = useQuery<AutomationLogEntry[]>({
    queryKey: ["automation-logs"],
    queryFn: async () => {
      const resp = await api.get("/operator/automation/logs");
      return resp.data?.map((log: any) => ({
        id: log?.id || "---",
        timestamp: log?.timestamp || "No Timestamp",
        event: log?.event || "Unknown Event",
        source: log?.source || "Unknown Source",
        status: log?.status || "Success"
      })) || [];
    }
  });

  return (
    <SecureOverlay>
    <div className="max-w-[1280px] mx-auto space-y-8 animate-in fade-in duration-1000 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-(--sp-border) pb-8">
        <div className="space-y-2">
          <h1 className="text-[28px] font-medium tracking-tight text-(--sp-text-0)">
             Action <span className="text-emerald-500 font-semibold">ledger</span>
          </h1>
          <div className="flex items-center gap-3">
             <History className="w-5 h-5 text-emerald-500" />
             <p className="text-(--sp-text-3) text-[13px] font-medium">
                Immutable trace of autonomous platform decisions.
             </p>
          </div>
        </div>
        
        <div className="flex bg-(--sp-bg-1) p-1 rounded-md border border-(--sp-border) shadow-sm">
           <button className="px-4 py-1.5 bg-white shadow-sm rounded-md text-[11px] font-bold uppercase tracking-wider text-emerald-600">
              Live feed
           </button>
           <button className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-(--sp-text-3) hover:text-(--sp-text-1)">
              Historical
           </button>
        </div>
      </header>

      {isLoading ? (
           <div className="py-20 flex flex-col items-center justify-center space-y-4 opacity-40">
              <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
              <p className="tracking-wider text-[11px] font-bold uppercase text-(--sp-text-3)">Querying action registry...</p>
           </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Event Stream */}
         <div className="lg:col-span-8 space-y-6">
            <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-sm p-8">
               <div className="flex items-center justify-between mb-8 gap-4">
                  <div className="flex items-center gap-3 bg-(--sp-bg-1) px-4 py-1.5 rounded-md border border-(--sp-border) flex-1 shadow-inner">
                     <Search size={14} className="text-emerald-500" />
                     <input type="text" placeholder="Search trace ID..." className="bg-transparent border-none outline-none text-[13px] w-full text-(--sp-text-1) placeholder:text-(--sp-text-3)/50" />
                  </div>
                  <button className="h-9 w-9 bg-(--sp-bg-1) border border-(--sp-border) text-(--sp-text-3) rounded-md hover:text-(--sp-text-1) transition-all flex items-center justify-center shadow-sm">
                     <Filter size={16} />
                  </button>
               </div>

               <div className="space-y-4">
                  {logs?.map(event => (
                    <div key={event?.id} className="p-6 bg-(--sp-bg-1) rounded-md border border-(--sp-border) hover:border-emerald-500/30 transition-all group/row cursor-pointer shadow-sm">
                       <div className="flex flex-col gap-6">
                          <div className="flex items-start justify-between">
                             <div className="flex items-center gap-4">
                                <div className={cn("w-10 h-10 rounded-md flex items-center justify-center border shadow-sm transition-all", 
                                  event?.status === 'Warning' ? 'bg-amber-500 text-white border-amber-400' : 
                                  event?.status === 'Info' ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-(--sp-bg-2) text-emerald-500 border-(--sp-border)'
                                )}>
                                   {event?.status === 'Warning' ? <AlertTriangle size={20} /> : event?.status === 'Info' ? <Info size={20} /> : <ShieldCheck size={20} />}
                                </div>
                                <div className="space-y-1">
                                   <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-bold tracking-wider uppercase opacity-60">
                                     {event?.id} • {event?.source}
                                   </div>
                                   <h4 className="text-[16px] font-semibold text-(--sp-text-1) group-hover:text-emerald-500 transition-colors leading-tight uppercase tracking-tight">{event?.event}</h4>
                                </div>
                             </div>
                             <div className="text-right space-y-2">
                                <div className="text-[14px] font-semibold text-(--sp-text-0) tabular-nums">{event?.timestamp?.split(',')[1]}</div>
                                <div className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shadow-sm", 
                                  event?.status === 'Success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                  event?.status === 'Warning' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                )}>
                                   {event?.status}
                                </div>
                             </div>
                          </div>
                          
                          <div className="p-4 bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-inner">
                             <p className="text-[13px] text-(--sp-text-3) leading-relaxed">Algorithmic residue: {event?.event} propagated via {event?.source} engine cluster. Signal ID: {event?.id}.</p>
                          </div>

                           <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-(--sp-text-3) opacity-60">
                              <div className="flex items-center gap-2">
                                 <ShieldCheck size={14} className="text-emerald-500" /> Autonomic strict v4
                              </div>
                              <button className="text-emerald-600 hover:text-emerald-500 transition-all flex items-center gap-1">
                                 Review logic <ChevronRight size={14} />
                               </button>
                           </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Stats Sentinel */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 rounded-md p-8 text-white shadow-md relative overflow-hidden group border-b-4 border-emerald-500/20">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
               <h3 className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-8 opacity-60">Decision ROI alpha</h3>
               <div className="text-[48px] font-semibold tracking-tighter mb-4 text-emerald-400 tabular-nums leading-none">92%</div>
               <p className="text-[11px] text-white/40 mb-8 font-medium">Platform autonomy index delta</p>
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-md border border-white/10 text-center shadow-inner">
                     <div className="text-[18px] font-semibold tabular-nums">0.4s</div>
                     <div className="text-[10px] font-bold opacity-40 uppercase tracking-wider mt-1">Latency</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-md border border-white/10 text-center shadow-inner">
                     <div className="text-[18px] font-semibold tabular-nums text-emerald-400">+12%</div>
                     <div className="text-[10px] font-bold opacity-40 uppercase tracking-wider mt-1">Efficiency</div>
                  </div>
               </div>
            </div>

            <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-sm p-8 group relative overflow-hidden flex flex-col">
               <h3 className="text-[18px] font-medium mb-8 flex items-center gap-3 text-(--sp-text-0)">
                  <AlertTriangle size={20} className="text-rose-500" />
                  Recent halts
               </h3>
               <div className="space-y-6 relative z-10">
                  <div className="p-6 bg-rose-50 rounded-md border border-rose-100 shadow-inner dark:bg-rose-950/20 dark:border-rose-500/20">
                     <div className="text-[10px] font-bold text-rose-600 mb-4 tracking-wider uppercase">WH-RELAY-FAILURE AL-901</div>
                     <p className="text-[14px] font-medium text-rose-900 dark:text-rose-400 mb-6">Circuit breaker tripped for logic node: wholesale.ae.latency(crit)</p>
                     
                     <div className="flex items-center gap-3">
                        <button className="flex-1 h-9 bg-rose-600 text-white rounded-md text-[11px] font-bold uppercase tracking-wider shadow-sm hover:bg-rose-700 transition-all">Manual override</button>
                        <button className="w-9 h-9 bg-white dark:bg-rose-900/40 rounded-md border border-rose-200 dark:border-rose-500/20 flex items-center justify-center text-rose-600 hover:text-rose-700 transition-all">
                           <Info size={18} />
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
      )}
    </div>
    </SecureOverlay>
  );
}
