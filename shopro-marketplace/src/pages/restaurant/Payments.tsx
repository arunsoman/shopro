"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Search, 
  Filter, 
  ChevronRight,
  Zap,
  Globe,
  Award,
  CircleDot,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  Wallet
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * RC-10 — Buyer Payments & Ledger
 * Purpose: Track all financial outlays and platform credits for buyers.
 */

export default function Payments() {
  const { data: txs, isLoading: isLoadingTxs } = useQuery({
    queryKey: ["buyer-transactions"],
    queryFn: async () => {
      const resp = await api.get("buyer/finance/transactions");
      return resp.data;
    }
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["buyer-stats"],
    queryFn: async () => {
      const resp = await api.get("buyer/finance/stats");
      return resp.data;
    }
  });

  const isLoading = isLoadingTxs || isLoadingStats;

  return (
    <SecureOverlay>
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-24 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-slate-200 dark:border-slate-800 pb-8 transition-all">
        <div className="space-y-4">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white italic">
             Financial <span className="text-brand-primary font-extrabold italic">Ledger</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm flex items-center gap-3">
             <IconTooltip label="Financial Pulse"><Wallet size={20} className="text-brand-primary animate-pulse" /></IconTooltip>
             Ledger Status: Synchronized • Disbursement Window Open
          </p>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <button className="h-10 px-6 bg-brand-primary text-slate-950 rounded-lg border border-brand-primary/50 flex items-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-95">
             <Download size={18} />
             <span className="text-sm font-bold uppercase tracking-tight">Export Ledger</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
            { label: "Outstanding Commitment", val: `₹${(stats?.outstandingCommitment || 0).toLocaleString()}`, icon: <TrendingDown size={20} className="text-brand-destructive" />, sub: "Net 30 Days" },
            { label: "Available Rebates", val: `₹${(stats?.availableRebates || 0).toLocaleString()}`, icon: <TrendingUp size={20} className="text-brand-success" />, sub: "Tax Eligible" },
            { label: "Platform Credits", val: `₹${(stats?.platformCredits || 0).toLocaleString()}`, icon: <Zap size={20} className="text-brand-primary" />, sub: "Active" },
        ].map((stat, i) => (
            <div key={i} className="bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-4 group relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                <div className="flex justify-between items-center relative z-10">
                    <p className="text-[10px] font-bold tracking-widest text-slate-400 italic uppercase">{stat.label}</p>
                    {stat.icon}
                </div>
                <h3 className="text-2xl font-bold tracking-tight relative z-10 italic uppercase">{stat.val}</h3>
                <p className="text-[10px] font-bold tracking-widest text-brand-primary relative z-10 uppercase italic">{stat.sub}</p>
            </div>
        ))}
      </div>

      {/* Transaction Table */}
      <div className="bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden italic uppercase italic">
        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left tracking-widest border-collapse">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-800">
                        <th className="p-6 text-[10px] text-slate-400 font-bold tracking-widest uppercase italic">Transaction ID</th>
                        <th className="p-6 text-[10px] text-slate-400 font-bold tracking-widest uppercase italic">Description</th>
                        <th className="p-6 text-[10px] text-slate-400 font-bold tracking-widest uppercase italic">Amount</th>
                        <th className="p-6 text-[10px] text-slate-400 font-bold tracking-widest uppercase text-right italic">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y-4 divide-border">
                    {isLoading ? (
                        [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan={4} className="p-12"><div className="h-12 bg-muted/20 rounded-2xl w-full" /></td></tr>)
                    ) : txs?.map((tx: any, i: number) => (
                        <tr key={i} className="group hover:bg-card transition-all cursor-pointer border-b border-border/50">
                            <td className="p-6">
                                <div className="space-y-1">
                                    <p className="text-xl font-bold tracking-tight text-brand-primary italic uppercase">{tx.id}</p>
                                    <p className="text-[10px] text-slate-400 font-bold tracking-widest italic uppercase">{tx.date}</p>
                                </div>
                            </td>
                            <td className="p-6 text-lg tracking-tight text-slate-400 italic">
                                {tx.description}
                            </td>
                            <td className={cn(
                                "p-6 text-xl font-bold tracking-tight italic uppercase",
                                tx.amount < 0 ? "text-brand-primary" : "text-brand-success"
                            )}>
                                {tx.amount < 0 ? "-" : "+"}₹{Math.abs(tx.amount).toFixed(2)}
                            </td>
                             <td className="p-6 text-right">
                                <div className={cn(
                                    "inline-flex h-8 px-5 items-center rounded-lg border font-bold italic text-[10px] tracking-widest uppercase shadow-sm",
                                    tx.status === 'SUCCESS' || tx.status === 'COMPLETED' ? "bg-brand-success/10 border-brand-success/20 text-brand-success" : "bg-brand-primary/10 border-brand-primary/20 text-brand-primary"
                                )}>
                                    {tx.status}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
    </SecureOverlay>
  );
}
