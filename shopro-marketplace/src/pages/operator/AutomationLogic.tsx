"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { 
  Plus, 
  Settings, 
  Activity, 
  GitBranch, 
  ChevronRight, 
  Trash2, 
  Play, 
  Pause, 
  Cpu, 
  Code2, 
  MoreVertical,
  ShieldCheck,
  Zap,
  Clock,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

interface LogicBlock {
  id: string;
  name: string;
  type: string;
  condition: string;
  action: string;
  executions: number;
  lastRun: string;
  active: boolean;
}

export default function AutomationLogic() {
  const { data: logicBlocks = [], isLoading } = useQuery<LogicBlock[]>({
    queryKey: ["logic-blocks"],
    queryFn: async () => {
      const resp = await api.get("/operator/automation/logic/blocks");
      return resp.data.map((block: any) => ({
        id: block?.id || Math.random().toString(36).substr(2, 9),
        name: block?.name || "Unnamed Sentinel",
        type: block?.type || "Neural Node",
        condition: block?.condition || "IF_DATA_STREAM_ANOMALY_DETECTED",
        action: block?.action || "INITIATE_QUARANTINE_PROTOCOL",
        executions: block?.executions || 0,
        lastRun: block?.lastRun || "Never",
        active: block?.active ?? false,
      }));
    }
  });

  return (
    <SecureOverlay>
    <div className="max-w-[1280px] mx-auto space-y-8 animate-in fade-in duration-1000 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-(--sp-border) pb-8">
        <div className="space-y-2">
          <h1 className="text-[28px] font-medium tracking-tight text-(--sp-text-0)">
             Logic <span className="text-emerald-500 font-semibold">sentinels</span>
          </h1>
          <div className="flex items-center gap-3">
             <Sparkles className="w-5 h-5 text-emerald-500" />
             <p className="text-(--sp-text-3) text-[13px] font-medium">
                Recursive rule execution and decision-tree orchestration.
             </p>
          </div>
        </div>
        
        <button className="h-9 px-4 bg-(--sp-cyan) text-white rounded-md text-[11px] font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-sm uppercase tracking-wider">
           <Plus size={16} /> New sentinel
        </button>
      </header>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4 opacity-40">
          <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="tracking-wider text-[11px] font-bold uppercase text-(--sp-text-3)">Synchronizing decision context...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Logic Deck */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-[14px] font-bold tracking-wider text-(--sp-text-3) flex items-center gap-3 uppercase">
                  <GitBranch className="w-4 h-4 text-emerald-500" />
                  Active sentinels node
               </h3>
               <div className="text-[10px] font-bold text-(--sp-text-3) opacity-40 tracking-widest">Stability: 100%</div>
            </div>

            <div className="space-y-6">
              {logicBlocks?.map((rule) => (
                <div key={rule?.id} className="group bg-(--sp-bg-2) rounded-md border border-(--sp-border) p-8 hover:border-emerald-500/30 transition-all shadow-sm relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10 mb-8">
                     <div className="flex items-center gap-4">
                        <div className={cn(
                           "w-12 h-12 rounded-md flex items-center justify-center border shadow-sm transition-all",
                           rule?.active ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-(--sp-bg-1) text-(--sp-text-3) border-(--sp-border)'
                        )}>
                           <ShieldCheck size={24} className={cn(rule?.active && "animate-pulse")} />
                        </div>
                        <div className="space-y-1">
                           <div className="text-[10px] font-bold tracking-wider text-emerald-600 uppercase opacity-60">ID: {rule?.id}</div>
                           <h4 className="text-[18px] font-semibold text-(--sp-text-0) uppercase tracking-tight">{rule?.name}</h4>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-4">
                        <div className="px-2 py-0.5 rounded bg-violet-50 border border-violet-100 text-violet-600 text-[10px] font-bold uppercase tracking-wider">
                           {rule?.type}
                        </div>
                        <button className="p-2 rounded-md bg-(--sp-bg-1) border border-(--sp-border) text-(--sp-text-3) hover:text-emerald-500 transition-all shadow-sm">
                           <MoreVertical size={16} />
                        </button>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 mb-8">
                     <div className="p-6 bg-(--sp-bg-1) rounded-md border border-(--sp-border) shadow-inner flex flex-col gap-4">
                        <div className="flex items-center gap-2 opacity-40">
                           <Code2 size={16} className="text-emerald-500" />
                           <span className="text-[10px] font-bold uppercase tracking-wider">Condition strategy</span>
                        </div>
                        <p className="text-[12px] font-medium text-(--sp-text-1) leading-relaxed uppercase">{rule?.condition}</p>
                     </div>
                     <div className="p-6 bg-(--sp-bg-1) rounded-md border border-(--sp-border) shadow-inner flex flex-col gap-4">
                        <div className="flex items-center gap-2 opacity-40">
                           <Zap size={16} className="text-amber-500" />
                           <span className="text-[10px] font-bold uppercase tracking-wider">Action output</span>
                        </div>
                        <p className="text-[12px] font-medium text-(--sp-text-1) leading-relaxed uppercase">{rule?.action}</p>
                     </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-(--sp-border) relative z-10">
                     <div className="flex items-center gap-6 text-[11px] font-medium text-(--sp-text-3)">
                        <div className="flex items-center gap-2">
                           <Activity size={14} />
                           {rule?.executions} RUNS
                        </div>
                        <div className="flex items-center gap-2">
                           <Clock size={14} />
                           {rule?.lastRun}
                        </div>
                     </div>
                     <button className="text-emerald-600 hover:text-emerald-500 transition-all font-bold text-[11px] flex items-center gap-2 uppercase tracking-wider">
                        Trace sentinel <ChevronRight size={14} />
                     </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monitor Sentinel */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 rounded-md p-8 text-white shadow-md relative overflow-hidden group border-b-4 border-emerald-500/20">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
               <div className="flex items-center gap-6 relative z-10 mb-10">
                  <div className="w-16 h-16 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-sm">
                     <Cpu size={32} className="animate-pulse" />
                  </div>
                  <div className="space-y-1">
                     <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 opacity-60">Processor health</div>
                     <div className="text-[24px] font-semibold tracking-tight">STABLE.X</div>
                  </div>
               </div>
               
               <div className="space-y-8 relative z-10">
                  <div className="p-6 bg-white/5 rounded-md border border-white/5 shadow-inner">
                     <div className="flex justify-between items-center mb-4 text-[11px] font-bold uppercase tracking-wider opacity-60">
                        <span>Propagation delta</span>
                        <span className="text-emerald-400">99.8%</span>
                     </div>
                     <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[99.8%] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-6 bg-white/5 rounded-md border border-white/5 text-center shadow-inner">
                        <div className="text-[20px] font-semibold tracking-tight tabular-nums">1.2ms</div>
                        <div className="text-[9px] font-bold opacity-40 uppercase tracking-wider mt-1">Latency</div>
                     </div>
                     <div className="p-6 bg-white/5 rounded-md border border-white/10 text-center shadow-inner">
                        <div className="text-[20px] font-semibold tracking-tight tabular-nums">482k</div>
                        <div className="text-[9px] font-bold opacity-40 uppercase tracking-wider mt-1">Ops/cycle</div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) p-8 shadow-sm group relative overflow-hidden flex flex-col">
               <h3 className="text-[11px] font-bold uppercase tracking-wider text-(--sp-text-3) mb-10 opacity-60">Orchestrator integrity alpha</h3>
               
               <div className="space-y-8 relative z-10">
                  <div className="flex items-center gap-4">
                     <ShieldCheck size={32} className="text-emerald-500" />
                     <div className="space-y-1">
                        <div className="text-[20px] font-semibold tracking-tight text-(--sp-text-0)">VERIFIED</div>
                        <div className="text-[10px] font-bold opacity-40 uppercase tracking-wider text-(--sp-text-3)">No race conditions detected</div>
                     </div>
                  </div>
                  
                  <div className="pt-6 border-t border-(--sp-border) space-y-4">
                     <div className="flex justify-between text-[11px] font-medium">
                        <span className="text-(--sp-text-3)">Last health audit</span>
                        <span className="text-(--sp-text-1) tabular-nums tracking-tighter uppercase font-bold">04:22:11.X</span>
                     </div>
                     <div className="flex justify-between text-[11px] font-medium">
                        <span className="text-(--sp-text-3)">Security protocol</span>
                        <span className="text-emerald-600 font-bold uppercase tracking-wider">AES256</span>
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
