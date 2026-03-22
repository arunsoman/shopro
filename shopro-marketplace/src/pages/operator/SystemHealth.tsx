"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Zap, 
  Database, 
  Cloud, 
  Globe, 
  AlertTriangle, 
  ShieldCheck, 
  Server,
  Network,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  Waves
} from "lucide-react";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

export default function SystemHealth() {
  const { data: health, isLoading, refetch } = useQuery({
    queryKey: ["system-health"],
    queryFn: async () => {
      const resp = await api.get("/operator/system/health");
      return resp.data;
    }
  });

  const getIcon = (name: string) => {
      switch(name?.toLowerCase()) {
          case 'cpu': return Cpu;
          case 'database': return Database;
          case 'network': return Network;
          case 'waves': return Waves;
          default: return Activity;
      }
  };

  return (
    <SecureOverlay>
    <div className="max-w-[1280px] mx-auto space-y-8 animate-in fade-in duration-1000 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-(--sp-border) pb-8">
        <div className="space-y-2">
          <h1 className="text-[28px] font-medium tracking-tight text-(--sp-text-0)">
             Fleet <span className="text-(--sp-cyan) font-semibold">nexus</span>
          </h1>
          <div className="flex items-center gap-3">
             <Activity className="w-5 h-5 text-(--sp-cyan)" />
             <p className="text-(--sp-text-3) text-[13px] font-medium">
                Real-time infrastructure pulse and service nodal resonance.
             </p>
          </div>
        </div>
        
        <button onClick={() => refetch()} 
          className="h-9 px-4 bg-(--sp-bg-1) border border-(--sp-border) text-(--sp-text-1) rounded-md text-[11px] font-bold uppercase tracking-wider hover:bg-(--sp-bg-0) transition-all shadow-sm flex items-center gap-2">
           <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
           Syncing nodes
        </button>
      </header>

      {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4 opacity-40">
              <RefreshCw className="w-10 h-10 text-(--sp-cyan) animate-spin" />
              <p className="tracking-wider text-[11px] font-bold uppercase text-(--sp-text-3)">Probing infrastructure lattice...</p>
          </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Global State Card */}
         <div className="lg:col-span-12">
            <div className="bg-slate-900 rounded-md p-8 text-white shadow-md relative overflow-hidden group border-b-4 border-emerald-500/20">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
               
               <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
                  <div className="text-center lg:text-left">
                     <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-6 opacity-60">Service level objective</div>
                     <div className="text-[72px] font-semibold tracking-tighter leading-none mb-4 tabular-nums">{health?.slo}<span className="text-[24px] opacity-30">%</span></div>
                     <div className="flex items-center gap-2 opacity-60 text-[11px] font-medium uppercase tracking-wider justify-center lg:justify-start">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> All core systems strictly operational
                     </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto">
                     {health?.metrics?.map((stat: any, i: number) => {
                       const Icon = getIcon(stat.icon);
                       return (
                        <div key={i} className="p-6 bg-white/5 rounded-md border border-white/5 text-center shadow-sm group/stat hover:bg-white/10 transition-all min-w-[140px]">
                           <Icon className="w-8 h-8 text-emerald-400 mx-auto mb-4 group-hover/stat:scale-110 transition-all" />
                           <div className="text-[20px] font-semibold tracking-tight tabular-nums mb-1 uppercase">{stat.value}</div>
                           <div className="text-[9px] font-bold uppercase tracking-wider opacity-40">{stat.label}</div>
                        </div>
                       );
                     })}
                  </div>
               </div>
            </div>
         </div>

         {/* Service Grid */}
         <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {health?.services?.map((service: any, i: number) => (
              <div key={i} className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) p-8 shadow-sm group relative overflow-hidden hover:border-violet-500/30 transition-all cursor-pointer flex flex-col">
                 <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                       <h3 className="text-[18px] font-semibold tracking-tight uppercase leading-none mb-3 text-(--sp-text-0)">{service.name}</h3>
                       <div className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shadow-sm", 
                         service.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                       )}>
                          {service.status}
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="text-[9px] font-bold text-(--sp-text-3) uppercase tracking-wider mb-1 opacity-60">Response</div>
                       <div className="text-[20px] font-semibold text-(--sp-text-1) tabular-nums tracking-tight">{service.latency}</div>
                    </div>
                 </div>

                 <div className="h-12 flex items-end gap-1 mb-8 relative z-10">
                    {[...Array(20)].map((_, j) => (
                      <div key={j} className={cn("flex-1 rounded-t-sm transition-all shadow-sm", service.color === 'emerald' ? 'bg-emerald-500/10 group-hover:bg-emerald-500/30' : 'bg-amber-500/10 group-hover:bg-amber-500/30')} style={{ height: `${20 + Math.random() * 80}%` }} />
                    ))}
                 </div>

                 <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-(--sp-text-3) pt-6 border-t border-(--sp-border) relative z-10 mt-auto opacity-60">
                    <span>Uptime index (30d)</span>
                    <span className="text-(--sp-text-1) tabular-nums">{service.uptime}</span>
                 </div>
              </div>
            ))}
         </div>

         {/* Alert Sentinel */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) p-8 shadow-sm group relative overflow-hidden">
               <h3 className="text-[18px] font-medium mb-8 flex items-center gap-3 text-(--sp-text-0)">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Nodal priority events
               </h3>
               <div className="space-y-6 relative z-10">
                  {[
                    { msg: "Redis cluster re-balancing sequence", time: "2h ago", type: "system" },
                    { msg: "Storage bucket threshold hit (85%)", time: "5h ago", type: "warning" },
                    { msg: "SSL certificate auto-renewed successfully", time: "1d ago", type: "success" },
                  ].map((alert, i) => (
                    <div key={i} className="flex gap-4 p-4 bg-(--sp-bg-1)/50 rounded-md border border-(--sp-border) shadow-sm hover:bg-(--sp-bg-1) transition-all group/alert">
                       <div className={cn("w-1 rounded-full shrink-0", 
                         alert.type === 'warning' ? 'bg-amber-500 shadow-sm' : 
                         alert.type === 'success' ? 'bg-emerald-500 shadow-sm' : 'bg-blue-500 shadow-sm'
                       )} />
                        <div className="space-y-1">
                           <div className="text-[12px] font-medium leading-tight text-(--sp-text-1)">{alert.msg}</div>
                           <div className="text-[9px] font-bold text-(--sp-text-3) uppercase tracking-wider opacity-40">{alert.time}</div>
                        </div>
                     </div>
                  ))}
                  
                  <button className="h-9 w-full mt-4 rounded-md bg-(--sp-bg-1) border border-(--sp-border) text-(--sp-text-1) text-[11px] font-bold uppercase tracking-wider hover:bg-(--sp-bg-0) hover:text-amber-600 transition-all shadow-sm">
                     Incident dashboard
                  </button>
               </div>
            </div>

            <div className="bg-slate-900 rounded-md p-8 text-white shadow-md relative overflow-hidden group border-b-4 border-(--sp-cyan)/20">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
               <h3 className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-10 leading-none">Global coverage node</h3>
               
               <div className="space-y-8 relative z-10">
                  <div>
                     <div className="text-[48px] font-semibold tracking-tighter mb-2 tabular-nums">42</div>
                     <div className="text-[10px] font-bold uppercase opacity-40 tracking-wider">Active network edge nodes</div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                     <div className="p-4 bg-white/5 rounded-md border border-white/5 flex-1 text-center backdrop-blur-md shadow-sm">
                        <div className="text-[16px] font-semibold tracking-tight">DUB-1</div>
                        <div className="text-[8px] font-bold uppercase opacity-30 tracking-wider mt-1">Primary</div>
                     </div>
                     <div className="p-4 bg-white/5 rounded-md border border-white/5 flex-1 text-center backdrop-blur-md shadow-sm">
                        <div className="text-[16px] font-semibold tracking-tight">AMS-2</div>
                        <div className="text-[8px] font-bold uppercase opacity-30 tracking-wider mt-1">Secondary</div>
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
