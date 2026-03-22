"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Activity,
  Search,
  Filter,
  ArrowRight,
  CircleDot,
  Globe,
  Award,
  ShieldCheck,
  RefreshCw,
  Clock,
  Zap,
  Box,
  User,
  ShoppingBag
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * RC-12 — Buyer Activity Log
 * Purpose: Full audit trail of all manual and automated actions for buyers.
 */

const LOG_ICONS: Record<string, any> = {
  AUTH: <User size={24} />,
  ORDER: <ShoppingBag size={24} />,
  STOCK: <Box size={24} />,
  SYSTEM: <Zap size={24} />,
};

export default function ActivityLog() {
  return (
    <SecureOverlay>
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-24 text-slate-900 dark:text-white">
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-slate-200 dark:border-slate-800 pb-8 transition-all">
          <div className="space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white italic">
              Activity <span className="text-brand-primary font-extrabold italic">Log</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm flex items-center gap-3">
              <IconTooltip label="Activity Pulse"><Activity size={20} className="text-brand-primary animate-pulse" /></IconTooltip>
              System Audit Trail: Active • Ledger Synchronized
            </p>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative group flex-1 lg:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="text"
                placeholder="Search activity..."
                className="h-10 pl-12 pr-6 w-full lg:w-[300px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-bold italic uppercase tracking-tight text-sm focus:ring-2 focus:ring-brand-primary/10 outline-none shadow-sm"
              />
            </div>
          </div>
        </header>

        {/* Audit Matrix */}
        <div className="bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden italic uppercase">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left tracking-widest border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-6 text-[10px] text-slate-400 font-bold tracking-widest uppercase italic">Time</th>
                  <th className="p-6 text-[10px] text-slate-400 font-bold tracking-widest uppercase italic">Actor</th>
                  <th className="p-6 text-[10px] text-slate-400 font-bold tracking-widest uppercase italic">Event</th>
                  <th className="p-6 text-[10px] text-slate-400 font-bold tracking-widest uppercase text-right italic">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y-4 divide-border">
                {[
                  { time: "20MAR 14:42", actor: "Automation", event: "Order PO-9921 initiated (Threshold check)", type: "ORDER" },
                  { time: "20MAR 10:30", actor: "Admin User", event: "KYC Upload: FSSAI License", type: "AUTH" },
                  { time: "19MAR 18:45", actor: "System", event: "Pricing synchronization complete", type: "SYSTEM" },
                  { time: "19MAR 09:12", actor: "Operations", event: "Inventory: Stock adjustment synced", type: "STOCK" },
                ].map((log, i) => (
                  <tr key={i} className="group hover:bg-slate-50 dark:hover:bg-slate-950/20 transition-all cursor-pointer border-b border-border/50">
                    <td className="p-6 text-lg font-bold tracking-tight text-slate-400 italic uppercase">
                      {log.time}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-6 text-brand-primary italic">
                        <div className="h-10 w-10 bg-brand-primary/10 border border-brand-primary/20 rounded-lg flex items-center justify-center text-brand-primary">
                          {LOG_ICONS[log.type]}
                        </div>
                        <span className="text-lg font-bold italic uppercase">{log.actor}</span>
                      </div>
                    </td>
                    <td className="p-6 text-lg font-bold tracking-tight text-slate-500 italic uppercase truncate">
                      {log.event}
                    </td>
                    <td className="p-6 text-right">
                      <button className="h-10 w-10 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-brand-primary transition-all shadow-md active:scale-95">
                        <IconTooltip label="View Details"><ArrowRight size={20} /></IconTooltip>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-950/20 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <p className="text-[10px] font-bold tracking-widest text-slate-400 italic uppercase">Activity Log Synchronized</p>
            <div className="flex items-center gap-4">
              <RefreshCw size={18} className="text-brand-primary animate-spin-slow" />
              <span className="text-[10px] font-bold tracking-widest text-brand-primary italic uppercase">Real-time updates enabled</span>
            </div>
          </div>
        </div>
      </div>
    </SecureOverlay>
  );
}
