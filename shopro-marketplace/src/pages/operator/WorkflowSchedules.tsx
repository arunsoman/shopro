"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { 
  Clock, 
  Calendar, 
  Settings, 
  Trash2, 
  Plus, 
  Play, 
  Pause, 
  RefreshCw, 
  Database, 
  Activity, 
  ShieldCheck, 
  Search,
  ChevronRight,
  Timer,
  FileCode,
  Zap,
  MoreVertical,
  History
} from "lucide-react";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

interface Schedule {
  id: string;
  task: string;
  schedule: string;
  lastRun: string;
  nextRun: string;
  status: string;
  target?: string;
}

export default function WorkflowSchedules() {
  const { data: schedules = [], isLoading } = useQuery<Schedule[]>({
    queryKey: ["workflow-schedules"],
    queryFn: async () => {
      const resp = await api.get("/operator/automation/schedules");
      return resp.data;
    }
  });

  return (
    <SecureOverlay>
    <div className="max-w-[1280px] mx-auto space-y-8 animate-in fade-in duration-1000 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-(--sp-border) pb-8">
        <div className="space-y-2">
          <h1 className="text-[28px] font-medium tracking-tight text-(--sp-text-0)">
             Temporal <span className="text-emerald-500 font-semibold">registry</span>
          </h1>
          <div className="flex items-center gap-3">
             <Timer className="w-5 h-5 text-emerald-500" />
             <p className="text-(--sp-text-3) text-[13px] font-medium">
                Scheduled micro-tasks and periodic system resonance protocol.
             </p>
          </div>
        </div>
        
        <button className="h-9 px-4 bg-(--sp-cyan) text-white rounded-md text-[11px] font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-sm uppercase tracking-wider">
           <Plus size={16} /> Schedule job node
        </button>
      </header>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4 opacity-40">
          <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="tracking-wider text-[11px] font-bold uppercase text-(--sp-text-3)">Syncing temporal nodes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Job Register */}
          <div className="lg:col-span-12">
            <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-sm overflow-hidden">
               <div className="p-6 border-b border-(--sp-border) flex items-center justify-between">
                  <h3 className="text-[18px] font-medium text-(--sp-text-0)">Recurring operations</h3>
                  <div className="flex items-center gap-2 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 text-emerald-600 text-[10px] font-bold uppercase">
                     <Activity size={12} className="animate-pulse" /> 24h resonance
                  </div>
               </div>

               <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                 {schedules.map(job => (
                   <div key={job?.id} className="p-8 bg-(--sp-bg-1) rounded-md border border-(--sp-border) hover:border-emerald-500/30 transition-all group/row shadow-sm flex flex-col gap-8">
                     <div className="flex items-start justify-between">
                       <div className="space-y-4 overflow-hidden">
                         <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider opacity-60">{job?.id} Protocol</div>
                         <h4 className="text-[20px] font-semibold tracking-tight text-(--sp-text-0) uppercase truncate">{job?.task}</h4>
                         <div className="flex items-center gap-2 text-(--sp-text-3)">
                           <FileCode size={16} className="text-emerald-500 opacity-60" />
                           <span className="text-[12px] font-medium tracking-wider uppercase tabular-nums">{job?.schedule}</span>
                         </div>
                       </div>
                       <button className="h-10 w-10 bg-white rounded-md shadow-sm border border-(--sp-border) hover:border-emerald-500/30 transition-all flex items-center justify-center text-emerald-600">
                         <Pause size={20} />
                       </button>
                     </div>

                     <div className="grid grid-cols-2 gap-6 pt-6 border-t border-(--sp-border)/50">
                       <div>
                         <div className="text-[10px] text-(--sp-text-3) uppercase tracking-wider mb-2 opacity-40">Last execution</div>
                         <div className="text-[18px] font-semibold tabular-nums text-(--sp-text-1)">{job?.lastRun}</div>
                       </div>
                       <div>
                         <div className="text-[10px] text-(--sp-text-3) uppercase tracking-wider mb-2 opacity-40">Next cycle</div>
                         <div className="text-[18px] font-semibold tabular-nums text-emerald-600">{job?.nextRun}</div>
                       </div>
                     </div>

                     <div className="flex items-center justify-between pt-6 mt-auto">
                       <div className="flex items-center gap-2 opacity-60">
                         <Database size={14} className="text-(--sp-text-3)" />
                         <span className="text-[11px] text-(--sp-text-2) font-medium">Target: {job?.target || "SYSTEM_KERN"}</span>
                       </div>
                       <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold uppercase shadow-sm">
                         <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-sm" />
                         Active flux
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900 rounded-md p-8 text-white shadow-md relative overflow-hidden group border-b-4 border-emerald-500/20">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
               <h3 className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-10 leading-none">Cluster concurrency alpha</h3>
               <div className="text-[72px] font-semibold tracking-tighter mb-4 tabular-nums text-emerald-400">64</div>
               <div className="flex items-center gap-2 text-[10px] font-bold opacity-40 tracking-wider uppercase">
                  <Zap size={14} className="text-emerald-400 animate-pulse" /> Parallel job capacity
               </div>
            </div>

            <div className="md:col-span-2 bg-(--sp-bg-2) rounded-md border border-(--sp-border) p-8 shadow-sm group relative overflow-hidden flex flex-col">
               <h3 className="text-[11px] font-bold uppercase tracking-wider text-(--sp-text-3) mb-10 opacity-60">Job resonance index (24h)</h3>
               <div className="flex items-end justify-between h-32 gap-1.5">
                 {[12, 18, 45, 30, 85, 40, 60, 95, 30, 45, 20, 15, 60, 55, 30, 10].map((h, i) => (
                   <div key={i} className="flex-1 bg-(--sp-bg-1) rounded-t-sm group-hover:bg-emerald-500/20 transition-all duration-700 shadow-sm" style={{ height: `${h}%` }} />
                 ))}
               </div>
               <div className="flex justify-between mt-8 text-[9px] font-bold uppercase text-(--sp-text-3) tracking-wider opacity-40">
                 <span>00:00 START</span>
                 <span className="text-(--sp-text-1) opacity-80 decoration-emerald-500/30 underline underline-offset-4 decoration-2">Synchronous peaks detected</span>
                 <span>23:59 EOD</span>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </SecureOverlay>
  );
}
