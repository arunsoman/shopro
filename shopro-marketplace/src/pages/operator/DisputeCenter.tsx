"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  AlertCircle, 
  Scale, 
  MessageSquare, 
  MoreVertical,
  ArrowRight,
  ShieldAlert,
  Gavel,
  Clock,
  User,
  Settings2,
  RefreshCw,
  Database,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * OP-23 — Dispute Center
 * Purpose: Marketplace conflict management and trust enforcement.
 */

interface Dispute {
  id: string;
  orderId: string;
  restaurant: string;
  supplier: string;
  reason: string;
  status: string;
  openedAt: string;
}

export default function DisputeCenter() {
  const [filter, setFilter] = useState("all");

  const { data: disputes = [], isLoading } = useQuery<Dispute[]>({
    queryKey: ["operator-disputes"],
    queryFn: async () => {
      const resp = await api.get("operator/finance/disputes");
      return resp.data?.map((dispute: any) => ({
        id: dispute?.id || "---",
        orderId: dispute?.orderId || "---",
        restaurant: dispute?.restaurant || "Unknown Restaurant",
        supplier: dispute?.supplier || "Unknown Supplier",
        reason: dispute?.reason || "No Reason Provided",
        status: dispute?.status || "Open",
        openedAt: dispute?.openedAt || new Date().toISOString()
      })) || [];
    }
  });

  const filteredDisputes = disputes.filter(d => 
    filter === "all" || (d?.status?.toLowerCase() || "") === filter.toLowerCase()
  );

  return (
    <SecureOverlay>
    <div className="max-w-[1280px] mx-auto space-y-8 animate-in fade-in duration-1000 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-(--sp-border) pb-8">
        <div className="space-y-2">
          <h1 className="text-[28px] font-medium tracking-tight text-(--sp-text-0)">
             Resolution <span className="text-rose-500 font-semibold">forge</span>
          </h1>
          <div className="flex items-center gap-3">
             <ShieldAlert className="w-5 h-5 text-rose-500" />
             <p className="text-(--sp-text-3) text-[13px] font-medium">
                Marketplace conflict management and trust enforcement.
             </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-(--sp-bg-0) bg-(--sp-bg-1) flex items-center justify-center overflow-hidden shadow-sm">
                   <User size={16} className="text-(--sp-text-3) opacity-40" />
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-(--sp-bg-0) bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                 +4
              </div>
           </div>
           <div className="text-right">
              <div className="text-[14px] font-semibold text-(--sp-text-0)">8 agents active</div>
              <div className="text-[11px] font-bold uppercase text-(--sp-text-3) tracking-wider opacity-60">Global support</div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Dispute List */}
         <div className="lg:col-span-8 space-y-6">
            <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-sm overflow-hidden p-8 flex flex-col min-h-[600px]">
               <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-(--sp-bg-1) p-4 rounded-md border border-(--sp-border) shadow-inner">
                  <h3 className="text-[18px] font-medium flex items-center gap-3 text-(--sp-text-0)">
                     <Gavel className="w-5 h-5 text-rose-500" />
                     Active dockets
                  </h3>
                  <div className="flex items-center gap-1.5 bg-(--sp-bg-2) p-1 rounded-md border border-(--sp-border) shadow-sm">
                     {["All", "Pending", "Escalated"].map(t => (
                       <button key={t} onClick={() => setFilter(t === "All" ? "all" : t.toLowerCase())} className={cn("px-4 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all", filter === (t === "All" ? "all" : t.toLowerCase()) ? "bg-rose-500 text-white shadow-sm" : "text-(--sp-text-3) hover:text-rose-500")}>
                          {t}
                       </button>
                     ))}
                  </div>
               </div>

               <div className="space-y-4 flex-1">
                  {isLoading ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-40">
                          <RefreshCw className="w-10 h-10 text-rose-500 animate-spin" />
                          <p className="tracking-wider text-[11px] font-bold uppercase text-(--sp-text-3)">Fetching dispute logs...</p>
                      </div>
                  ) : (
                   <div className="space-y-4">
                    {filteredDisputes?.map(dispute => (
                      <div key={dispute?.id} className="group/item p-8 bg-(--sp-bg-1) rounded-md border border-(--sp-border) hover:border-rose-500/30 transition-all cursor-pointer shadow-sm relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 group-hover/item:scale-150 transition-transform duration-500" />
                         <div className="flex flex-col lg:flex-row gap-8 relative z-10">
                            <div className={cn(
                              "w-12 h-12 rounded-md flex items-center justify-center shrink-0 shadow-sm transition-all group-hover/item:scale-105 border",
                              dispute?.status === 'Open' || dispute?.status === 'Pending' ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-(--sp-bg-2) text-(--sp-text-3) border-(--sp-border)"
                            )}>
                               <AlertCircle size={24} />
                            </div>
                            
                            <div className="flex-1 space-y-6">
                               <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                                  <div className="space-y-2">
                                     <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-bold text-rose-600 tracking-wider uppercase border border-rose-500/20 px-1.5 py-0.5 rounded bg-rose-500/5 shadow-sm">ID: {dispute?.id}</span>
                                        <span className="text-[10px] font-bold text-(--sp-text-3) tracking-wider uppercase opacity-40">REF: {dispute?.orderId}</span>
                                     </div>
                                     <h4 className="text-[18px] font-semibold text-(--sp-text-0) group-hover:text-rose-500 transition-colors leading-tight uppercase tracking-tight">{dispute?.reason}</h4>
                                  </div>
                                  <div className="lg:text-right space-y-2">
                                     <div className="text-[11px] font-bold text-(--sp-text-3) flex items-center lg:justify-end gap-1.5 uppercase tracking-wider opacity-60"><Clock size={12} /> {dispute?.openedAt ? new Date(dispute.openedAt).toLocaleDateString() : "Unknown"}</div>
                                     <div className={cn("text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded inline-block shadow-sm", dispute?.status === 'Open' || dispute?.status === 'Pending' ? 'text-rose-600 border-rose-500/20 bg-rose-50' : 'text-(--sp-text-3) border-(--sp-border) bg-(--sp-bg-2)')}>
                                        {dispute?.status}
                                     </div>
                                  </div>
                               </div>

                               <div className="flex flex-col md:flex-row items-center gap-6 py-4 border-y border-(--sp-border)/50 bg-(--sp-bg-2)/30 rounded-md px-6">
                                  <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-full bg-(--sp-cyan)/10 text-(--sp-cyan) flex items-center justify-center text-[10px] font-bold border border-(--sp-cyan)/20 shadow-sm">
                                        <User size={14} />
                                     </div>
                                     <span className="text-[13px] font-semibold text-(--sp-text-1)">{dispute?.restaurant}</span>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-(--sp-text-3) hidden md:block opacity-40" />
                                  <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-full bg-(--sp-bg-3) text-(--sp-text-3) flex items-center justify-center border border-(--sp-border) shadow-sm">
                                        <User size={14} />
                                     </div>
                                     <span className="text-[13px] font-semibold text-(--sp-text-1)">{dispute?.supplier}</span>
                                  </div>
                               </div>

                               <div className="pt-2 flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-[11px] text-(--sp-text-3) font-bold uppercase tracking-wider opacity-60">
                                     <MessageSquare size={14} /> 8 Messages
                                  </div>
                                  <div className="flex items-center gap-3">
                                     <button className="h-8 px-4 rounded-md bg-(--sp-cyan) text-white text-[11px] font-bold uppercase shadow-sm hover:opacity-90 transition-all tracking-wider">
                                        Adjudicate
                                     </button>
                                     <button className="w-8 h-8 rounded-md bg-(--sp-bg-2) text-(--sp-text-3) hover:text-rose-500 transition-all flex items-center justify-center border border-(--sp-border) shadow-sm opacity-0 group-hover/item:opacity-100"><MoreVertical size={16} /></button>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                    ))}
                   </div>
                  )}
               </div>
            </div>
         </div>

         {/* Metrics & Interventions */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 rounded-md p-8 text-white shadow-md relative overflow-hidden group border-b-4 border-rose-500/20">
               <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl" />
               <h3 className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-8 opacity-60">Resolution health</h3>
               
               <div className="space-y-10 relative z-10">
                  <div>
                     <div className="flex justify-between items-end mb-4">
                        <div className="text-[48px] font-semibold tracking-tighter leading-none tabular-nums text-white">4.2h</div>
                        <div className="text-[10px] font-bold uppercase flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded border border-white/10 shadow-sm opacity-60">Target: 6h <Scale size={14} /></div>
                     </div>
                     <p className="text-[11px] font-medium text-white/40 mb-4">Avg time to resolve</p>
                     <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: "82%" }} className="h-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-white/5 rounded-md border border-white/5 shadow-inner group/stat hover:bg-white/10 transition-all">
                        <div className="text-[20px] font-semibold text-emerald-400 leading-none mb-1">94%</div>
                        <div className="text-[10px] font-bold uppercase opacity-40 tracking-wider">Settlement</div>
                     </div>
                     <div className="p-4 bg-white/5 rounded-md border border-white/5 shadow-inner group/stat hover:bg-white/10 transition-all">
                        <div className="text-[20px] font-semibold text-rose-400 leading-none mb-1">12%</div>
                        <div className="text-[10px] font-bold uppercase opacity-40 tracking-wider">Escalation</div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-sm p-8 group relative overflow-hidden flex flex-col border-t-4 border-rose-500">
               <h3 className="text-[18px] font-medium mb-8 flex items-center gap-3 text-(--sp-text-0)">
                  <Database className="w-5 h-5 text-rose-500" />
                  Refund velocity
               </h3>
               <div className="space-y-6 relative z-10">
                  <div className="p-6 bg-slate-900 rounded-md shadow-inner relative overflow-hidden border border-white/5">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
                     <div className="flex justify-between items-center mb-6 relative z-10">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Weekly outflow</span>
                        <span className="text-[18px] font-bold text-rose-400 tabular-nums">-$24,500</span>
                     </div>
                     <div className="flex gap-1.5 h-12 items-end relative z-10">
                        {[30, 45, 25, 60, 40, 75, 50].map((h, i) => (
                          <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} className="flex-1 bg-white/10 group-hover:bg-rose-500/40 transition-all rounded-t-sm" />
                        ))}
                     </div>
                  </div>
                  
                  <button className="h-9 w-full rounded-md bg-(--sp-bg-1) border border-(--sp-border) text-(--sp-text-1) text-[11px] font-bold uppercase tracking-wider shadow-sm hover:bg-(--sp-bg-0) transition-all">
                     Audit credit notes
                  </button>
               </div>
            </div>

            <div className="p-8 rounded-md bg-rose-50 border border-rose-100 flex flex-col items-center gap-6 text-center group hover:bg-rose-100 transition-all dark:bg-rose-950/20 dark:border-rose-500/20 shadow-sm">
               <div className="w-14 h-14 rounded-md bg-white dark:bg-rose-900/40 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center text-rose-500 shadow-sm relative overflow-hidden">
                  <ShieldAlert size={28} className="animate-pulse relative z-10" />
                  <div className="absolute inset-0 bg-rose-500/5 animate-pulse" />
               </div>
               <div className="space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Supplier blacklist warning</h4>
                  <p className="text-[13px] text-rose-900 dark:text-rose-400 font-medium leading-relaxed">Global Foods Co. has reached 5% dispute threshold in Dubai-Marina region.</p>
               </div>
               <button className="h-8 px-6 rounded-md bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm hover:bg-rose-700 transition-all">Review supplier</button>
            </div>
         </div>
      </div>
    </div>
    </SecureOverlay>
  );
}
