"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { 
  Zap, 
  Link2, 
  Plus, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Settings, 
  Clock, 
  FileJson, 
  Globe, 
  RefreshCw,
  Eye,
  Trash2,
  ChevronRight,
  Database,
  Search,
  AlertTriangle
} from "lucide-react";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: string;
  success: string;
  lastSent: string;
}

export default function Webhooks() {
  const { data: webhooks = [], isLoading, refetch } = useQuery<Webhook[]>({
    queryKey: ["webhooks"],
    queryFn: async () => {
      const resp = await api.get("/operator/system/webhooks");
      return resp.data;
    }
  });

  return (
    <SecureOverlay>
    <div className="max-w-[1280px] mx-auto space-y-8 animate-in fade-in duration-1000 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-(--sp-border) pb-8">
        <div className="space-y-2">
          <h1 className="text-[28px] font-medium tracking-tight text-(--sp-text-0)">
             Event <span className="text-emerald-500 font-semibold">flux</span>
          </h1>
          <div className="flex items-center gap-3">
             <Zap className="w-5 h-5 text-emerald-500" />
             <p className="text-(--sp-text-3) text-[13px] font-medium">
                Real-time event propagation and endpoint nodal resonance.
             </p>
          </div>
        </div>
        
        <button className="h-9 px-4 bg-(--sp-cyan) text-white rounded-md text-[11px] font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-sm uppercase tracking-wider">
           <Plus size={16} /> Relay endpoint
        </button>
      </header>

      {isLoading ? (
           <div className="py-20 flex flex-col items-center justify-center space-y-4 opacity-40">
              <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
              <p className="tracking-wider text-[11px] font-bold uppercase text-(--sp-text-3)">Synchronizing event relays...</p>
           </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Webhook Grid */}
         <div className="lg:col-span-8 space-y-6">
            <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-sm overflow-hidden">
               <div className="p-6 border-b border-(--sp-border) flex items-center justify-between">
                  <h3 className="text-[18px] font-medium text-(--sp-text-0)">Registered flux relays</h3>
                  <div className="flex bg-(--sp-bg-1) p-1 rounded-md border border-(--sp-border) shadow-sm">
                     {["Live", "Debug"].map(m => (
                        <button key={m} className={cn("px-4 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all", m === "Live" ? "bg-white text-(--sp-cyan) shadow-sm" : "text-(--sp-text-3) hover:text-(--sp-text-1)")}>
                           {m}
                        </button>
                     ))}
                  </div>
               </div>
               <div className="p-6 space-y-6">
                  {webhooks.map(hook => (
                    <div key={hook?.id} className="p-8 bg-(--sp-bg-1) rounded-md border border-(--sp-border) hover:border-emerald-500/30 transition-all group/row shadow-sm">
                       <div className="flex flex-col gap-8">
                          <div className="flex items-start justify-between">
                             <div className="flex items-center gap-4 overflow-hidden">
                                <div className="w-12 h-12 rounded-md bg-(--sp-bg-2) border border-(--sp-border) flex items-center justify-center shadow-sm shrink-0 group-hover/row:border-emerald-500/20 transition-all">
                                   <Link2 className="w-6 h-6 text-(--sp-text-3) group-hover/row:text-emerald-500 transition-all" />
                                </div>
                                <div className="min-w-0">
                                   <div className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider mb-1 opacity-60">{hook?.id}</div>
                                   <h4 className="text-[18px] font-semibold text-(--sp-text-1) tracking-tight truncate uppercase leading-none">{hook?.url}</h4>
                                </div>
                             </div>
                             <div className="text-right shrink-0">
                                <div className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shadow-sm", 
                                  hook?.status === 'Healthy' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                )}>
                                   {hook?.status}
                                </div>
                                <div className="text-[10px] font-bold text-(--sp-text-3) mt-2 uppercase tracking-wider opacity-40">Last sent {hook?.lastSent}</div>
                             </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-6 border-t border-(--sp-border)/50">
                             <div className="md:col-span-2">
                                <div className="text-[10px] font-bold text-(--sp-text-3) uppercase tracking-wider mb-4 opacity-40">Listening nodal events</div>
                                <div className="flex flex-wrap gap-2">
                                   {hook?.events?.map(ev => (
                                     <span key={ev} className="px-2 py-0.5 bg-(--sp-bg-2) rounded border border-(--sp-border) text-[10px] font-medium text-(--sp-text-2) lowercase transition-all hover:bg-(--sp-bg-0)">{ev}</span>
                                   ))}
                                </div>
                             </div>
                             <div className="text-left md:text-right md:ml-auto">
                                <div className="text-[10px] font-bold text-(--sp-text-3) uppercase tracking-wider mb-2 opacity-40">Delivery quotient</div>
                                <div className={cn("text-[28px] font-semibold tracking-tight tabular-nums", hook?.status === 'Healthy' ? 'text-emerald-500' : 'text-rose-600')}>{hook?.success}</div>
                             </div>
                             <div className="flex items-center gap-2 md:justify-end">
                                <button className="h-8 w-8 rounded-md bg-(--sp-bg-2) border border-(--sp-border) shadow-sm flex items-center justify-center text-(--sp-text-3) hover:text-(--sp-cyan) transition-all">
                                   <FileJson size={16} />
                                </button>
                                <button className="h-8 w-8 rounded-md bg-(--sp-bg-2) border border-(--sp-border) shadow-sm flex items-center justify-center text-(--sp-text-3) hover:text-rose-500 transition-all">
                                   <Trash2 size={16} />
                                </button>
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Relay Sentinel */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 rounded-md p-8 text-white shadow-md relative overflow-hidden group border-b-4 border-emerald-500/20">
               <h3 className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-8 opacity-60">Global active relays</h3>
               
               <div className="space-y-8 relative z-10">
                  <div>
                     <div className="text-[48px] font-semibold tracking-tighter leading-none text-emerald-400">1.2M</div>
                     <div className="text-[10px] font-bold uppercase text-white/40 tracking-wider mt-4">Pings (24h)</div>
                  </div>

                  <div className="p-6 bg-white/5 rounded-md border border-white/5 shadow-inner">
                     <h4 className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-6">Traffic resonance</h4>
                     <div className="flex gap-1.5 h-12 items-end justify-between">
                        {[40, 60, 30, 85, 45, 90, 60, 30, 55, 75].map((h, i) => (
                          <div key={i} className="flex-1 bg-emerald-500/20 rounded-t-sm transition-all group-hover:bg-emerald-500/40" style={{ height: `${h}%` }} />
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-sm p-8 group relative overflow-hidden">
               <h3 className="text-[18px] font-medium mb-8 flex items-center gap-3 text-(--sp-text-0)">
                  <Globe className="w-5 h-5 text-emerald-500" />
                  Retry logic node
               </h3>
               <div className="space-y-6 relative z-10">
                  <div className="p-5 bg-(--sp-bg-1) rounded-md border border-(--sp-border) shadow-sm">
                     <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-(--sp-text-3)">Backoff algorithm</span>
                        <span className="text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded text-[10px] font-bold uppercase border border-emerald-100">Live</span>
                     </div>
                     <p className="text-[12px] text-(--sp-text-3) leading-relaxed font-medium lowercase">Max 12 sequential attempts over a 24-hour temporal window.</p>
                  </div>

                  <div className="pt-6 border-t border-(--sp-border)">
                     <div className="text-[10px] font-bold text-(--sp-text-3) uppercase tracking-wider mb-6 opacity-40">Integration quotient</div>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="text-left">
                           <div className="text-[20px] font-semibold tracking-tight text-(--sp-text-0) tabular-nums">8ms</div>
                           <div className="text-[9px] font-bold opacity-40 uppercase tracking-wider mt-1 text-(--sp-text-3)">Queue latency</div>
                        </div>
                        <div className="text-left border-l border-(--sp-border) pl-6">
                           <div className="text-[20px] font-semibold tracking-tight text-(--sp-text-0) tabular-nums">0</div>
                           <div className="text-[9px] font-bold opacity-40 uppercase tracking-wider mt-1 text-(--sp-text-3)">Dead letters</div>
                        </div>
                     </div>
                  </div>
                  
                  <button className="h-9 w-full mt-4 rounded-md bg-(--sp-bg-1) border border-(--sp-border) text-(--sp-text-1) text-[11px] font-bold uppercase tracking-wider hover:bg-(--sp-bg-0) hover:text-emerald-600 transition-all shadow-sm">
                     Flux documentation
                  </button>
               </div>
            </div>
         </div>
      </div>
      )}
    </div>
    </SecureOverlay>
  );
}
