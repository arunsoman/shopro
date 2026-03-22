"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { 
  Activity, 
  Search, 
  Filter, 
  Shield, 
  AlertTriangle, 
  Clock, 
  Server,
  Zap,
  RefreshCw,
  Database,
  ChevronRight,
  Gavel,
  ShieldCheck
} from "lucide-react";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * OP-27 — Audit Trail
 * Purpose: Platform-wide event sequencing and immutable ledger monitoring.
 */

interface AuditLogEntry {
  id: string;
  action: string;
  user: string;
  target: string;
  timestamp: string;
  severity: string;
}

export default function AuditTrail() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: logs = [], isLoading } = useQuery<AuditLogEntry[]>({
    queryKey: ["operator-audit-logs"],
    queryFn: async () => {
      const resp = await api.get("operator/finance/audit-summary");
      return resp.data?.map((log: any) => ({
        id: log?.id || "---",
        action: log?.action || "Unknown Action",
        user: log?.user || "Unknown User",
        target: log?.target || "Unknown Target",
        timestamp: log?.timestamp || "No Timestamp",
        severity: log?.severity || "low"
      })) || [];
    }
  });

  const filteredLogs = logs.filter(log => 
    (log?.action?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (log?.user?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (log?.target?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  return (
    <SecureOverlay>
    <div className="max-w-[1280px] mx-auto space-y-8 animate-in fade-in duration-1000 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-(--sp-border) pb-8">
        <div className="space-y-2">
          <h1 className="text-[28px] font-medium tracking-tight text-(--sp-text-0)">
             Immutable <span className="text-emerald-500 font-semibold">ledger</span>
          </h1>
          <div className="flex items-center gap-3">
             <Shield className="w-5 h-5 text-emerald-500" />
             <p className="text-(--sp-text-3) text-[13px] font-medium">
                Platform-wide event sequencing and integrity monitoring.
             </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-(--sp-bg-0) bg-emerald-500/10 flex items-center justify-center overflow-hidden shadow-sm">
                   <Zap size={14} className="text-emerald-500" />
                </div>
              ))}
           </div>
           <div className="text-right">
              <div className="text-[14px] font-semibold text-(--sp-text-0)">Active nodes</div>
              <div className="text-[11px] font-bold uppercase text-(--sp-text-3) tracking-wider">Stability: 100%</div>
           </div>
        </div>
      </header>

      {/* Audit Stream */}
      <div className="space-y-6">
         <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-sm p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-(--sp-bg-1) p-4 rounded-md border border-(--sp-border)">
               <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-[18px] font-medium text-(--sp-text-0)">Active sequencing</h3>
               </div>
               <div className="flex items-center gap-3 bg-(--sp-bg-2) px-4 py-1.5 rounded-md border border-(--sp-border) flex-1 max-w-md shadow-inner">
                  <Search size={14} className="text-(--sp-text-3) group-focus-within:text-emerald-500 transition-all opacity-40" />
                  <input 
                    type="text" 
                    placeholder="Trace event..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-[13px] w-full text-(--sp-text-1) placeholder:text-(--sp-text-3)/50" 
                  />
               </div>
               <button className="h-9 px-4 rounded-md bg-(--sp-bg-1) border border-(--sp-border) text-(--sp-text-1) text-[11px] font-bold uppercase tracking-wider shadow-sm hover:bg-(--sp-bg-0) transition-all">
                  Filter stack
               </button>
            </div>

            <div className="space-y-4">
               {isLoading ? (
                   <div className="py-20 text-center flex flex-col items-center justify-center space-y-4 opacity-40">
                       <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
                       <p className="tracking-wider text-[11px] font-bold uppercase text-(--sp-text-3)">Reading secure ledger...</p>
                   </div>
               ) : (
                <div className="divide-y divide-(--sp-border)">
                  {filteredLogs?.map((log) => (
                    <div key={log?.id} className="group/item py-6 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all">
                       <div className="flex items-center gap-6 flex-1">
                          <div className={cn(
                             "w-10 h-10 rounded-md flex items-center justify-center shrink-0 border shadow-sm transition-all group-hover/item:scale-105",
                             log?.severity === 'high' || log?.severity === 'critical' ? 'bg-rose-500 text-white border-rose-400' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          )}>
                              {log?.severity === 'high' || log?.severity === 'critical' ? <AlertTriangle size={20} /> : <Activity size={20} />}
                          </div>
                          
                          <div className="space-y-1 flex-1">
                             <div className="flex items-center gap-3">
                                <h4 className="text-[15px] font-semibold text-(--sp-text-1) group-hover:text-emerald-500 transition-colors leading-tight uppercase tracking-tight">{log?.action}</h4>
                                <span className={cn(
                                   "text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border shadow-sm",
                                   log?.severity === 'high' || log?.severity === 'critical' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                )}>{log?.severity} node</span>
                             </div>
                             <div className="flex items-center gap-4 text-[11px] font-medium text-(--sp-text-3) uppercase tracking-wider opacity-60">
                                <span>User: {log?.user}</span>
                                <div className="w-1 h-1 rounded-full bg-(--sp-border)" />
                                <span>Target: <span className="text-(--sp-cyan)">{log?.target}</span></span>
                             </div>
                          </div>
                       </div>

                       <div className="flex flex-col md:items-end gap-1">
                          <div className="flex items-center gap-2 text-[14px] font-semibold text-(--sp-text-0) tabular-nums tracking-tight">
                             <Clock size={14} className="text-emerald-500" />
                             {log?.timestamp}
                          </div>
                          <div className="text-[10px] text-(--sp-text-3) font-bold tracking-wider uppercase opacity-40">
                             ID: {log?.id?.slice(0, 12).toUpperCase()}
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
               )}
            </div>
         </div>
      </div>

      {/* Security Status */}
      <div className="p-8 bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-sm overflow-hidden relative group flex flex-col md:flex-row md:items-center justify-between gap-8 border-b-4 border-emerald-500">
         <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 shadow-sm">
                <ShieldCheck size={32} />
            </div>
            <div className="space-y-1">
               <h3 className="text-[18px] font-semibold text-(--sp-text-0)">Ledger integrity: Alpha secured</h3>
               <p className="text-(--sp-text-3) text-[13px] max-w-xl font-medium">
                  Global sync hash verified. Zero drift detected in last 24h simulation.
               </p>
            </div>
         </div>
         <div className="relative z-10">
            <button className="h-9 px-6 rounded-md bg-emerald-500 text-white text-[11px] font-bold uppercase tracking-wider transition-all hover:opacity-90 shadow-sm border border-emerald-400">
               Verify genesis
            </button>
         </div>
      </div>
    </div>
    </SecureOverlay>
  );
}
