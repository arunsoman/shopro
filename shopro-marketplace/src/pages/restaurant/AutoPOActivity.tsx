"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  History, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight,
  CircleDot,
  Globe,
  Award,
  ShieldCheck,
  Activity,
  Box,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SecureOverlay } from "@/components/SecureOverlay";
import { StatusBadge } from "@/components/ui/status-badge";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * RC-09 — Auto-PO Activity Log
 * Purpose: Audit trail for automated procurement cycles.
 */

export default function AutoPOActivity() {
  const navigate = useNavigate();

  return (
    <SecureOverlay>
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-border pb-8">
        <div className="space-y-4">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white italic">
             Automation <span className="text-brand-primary font-extrabold italic">Activity</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm flex items-center gap-3">
             <Activity size={20} className="text-brand-primary animate-pulse" />
             Activity Log: Active • Tracking Automation History
          </p>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative group flex-1 lg:flex-none">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
             <input 
               type="text"
               placeholder="Search activity..."
               className="h-10 pl-12 pr-4 w-full lg:w-[300px] bg-card border border-border rounded-lg font-bold text-sm focus:ring-2 focus:ring-brand-primary/10 transition-all shadow-sm"
             />
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <div className="bg-card/50 backdrop-blur-xl rounded-xl border border-border shadow-sm overflow-hidden whitespace-nowrap">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/50 border-b border-border">
                            <th className="p-4 text-[10px] text-slate-400 font-bold tracking-widest uppercase italic">Time</th>
                            <th className="p-4 text-[10px] text-slate-400 font-bold tracking-widest uppercase italic">Event</th>
                            <th className="p-4 text-[10px] text-slate-400 font-bold tracking-widest uppercase italic">Item / System</th>
                            <th className="p-4 text-[10px] text-slate-400 font-bold tracking-widest uppercase italic">Status</th>
                            <th className="p-4 text-[10px] text-slate-400 font-bold tracking-widest uppercase text-right italic">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {[
                            { time: "20MAR 14:42", type: "Order Initialized", node: "Whole Milk", status: "Success", id: "PO-9921" },
                            { time: "20MAR 11:15", type: "Threshold Reached", node: "Dairy Category", status: "Triggered", id: "LOG-01" },
                            { time: "19MAR 08:30", type: "Order Initialized", node: "Arabica Beans", status: "Success", id: "PO-9902" },
                            { time: "18MAR 23:59", type: "Daily Reconciliation", node: "System", status: "Completed", id: "SYS-REC" },
                        ].map((log, i) => (
                            <tr key={i} className="group hover:bg-muted/20 transition-all cursor-pointer border-b border-border/50">
                                <td className="p-4 text-xs font-medium text-muted-foreground group-hover:text-brand-primary transition-colors">
                                    {log.time}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-brand-primary/10 border border-brand-primary/20 rounded-md flex items-center justify-center text-brand-primary">
                                            <Zap size={14} />
                                        </div>
                                        <span className="text-xs font-bold tracking-tight uppercase italic">{log.type}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-xs text-foreground">
                                    {log.node}
                                </td>
                                <td className="p-4">
                                    <StatusBadge 
                                        status={log.status === 'Success' || log.status === 'Completed' ? 'active' : 'cooking'} 
                                        label={log.status} 
                                    />
                                </td>
                                <td className="p-4 text-right">
                                    <button className="h-8 w-8 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-brand-primary transition-all shadow-sm active:scale-90 group-hover:scale-110">
                                        <IconTooltip label="Explore"><ArrowRight size={16} /></IconTooltip>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="p-4 bg-muted/30 border-t border-border flex items-center justify-between">
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase opacity-60 italic">System Ready</p>
                <div className="h-1.5 w-64 bg-border rounded-full overflow-hidden shadow-inner">
                    <motion.div animate={{ x: [-256, 256] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="h-full w-1/4 bg-brand-primary shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                </div>
            </div>
        </div>
      </main>
    </div>
    </SecureOverlay>
  );
}
