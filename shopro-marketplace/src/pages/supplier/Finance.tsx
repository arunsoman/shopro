"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  ChevronRight,
  MoreHorizontal,
  Info,
  ShieldCheck,
  History,
  FileText,
  XCircle,
  Upload,
  RefreshCw,
  Wallet,
  Zap,
  TrendingUp
} from "lucide-react";
import { SecureOverlay } from "@/components/SecureOverlay";

/**
 * S-08 — Finance & Settlements
 * Purpose: Manage revenue, payouts, and transaction history for suppliers.
 */

interface FinanceStats {
  totalRevenue: number;
  pendingPayout: number;
  lifetimeEarnings: number;
  currentBalance: number;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: string;
}

export default function Finance() {
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const { data: stats, isLoading: isStatsLoading } = useQuery<FinanceStats>({
    queryKey: ["supplier-finance-stats"],
    queryFn: async () => {
      const resp = await api.get("/api/supplier/finance/stats");
      return resp.data;
    }
  });

  const { data: transactions = [], isLoading: isTxnsLoading } = useQuery<Transaction[]>({
    queryKey: ["supplier-transactions"],
    queryFn: async () => {
      const resp = await api.get("/api/supplier/finance/transactions");
      return resp.data;
    }
  });

  const handleDownload = (id: string) => {
    setIsDownloading(id);
    setTimeout(() => setIsDownloading(null), 1500);
  };

  return (
    <SecureOverlay>
    <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-1000 font-black italic uppercase leading-none pb-24 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 border-b-8 border-slate-100 dark:border-slate-800 pb-12 font-black italic leading-none shadow-inner">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter italic uppercase leading-none shadow-text mt-4">
             Finance <span className="text-indigo-500">Vault.X</span>
          </h1>
          <p className="text-slate-500 font-black italic text-xl tracking-wide opacity-60 leading-none flex items-center gap-4">
             <Wallet className="w-8 h-8 text-indigo-500 animate-pulse" />
             Manage revenue, payouts, and settlement trajectories nodes alpha.
          </p>
        </div>
        
        <div className="flex items-center gap-6 font-black italic uppercase tracking-[0.4em] leading-none">
          <div className="flex items-center gap-6 bg-white dark:bg-slate-950 px-8 py-5 rounded-[1.5rem] border-4 border-slate-50 dark:border-slate-800 shadow-xl shadow-inner text-indigo-500">
             <Zap size={24} />
             <span className="text-[11px] tracking-[0.3em] font-black italic uppercase">Auto-Sweep_Enabled.FLUX</span>
          </div>
          <button className="h-20 w-20 bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] flex items-center justify-center border-4 border-slate-50 dark:border-slate-800 hover:scale-110 transition-all shadow-4xl shadow-inner">
             <Download size={32} />
          </button>
        </div>
      </header>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: "TOTAL_REVENUE.X", value: stats?.totalRevenue, icon: <TrendingUp className="text-emerald-500" />, sub: "LIFETIME_SYNCED", color: "text-emerald-500" },
          { label: "PENDING_PAYOUT.NODE", value: stats?.pendingPayout, icon: <Clock className="text-amber-500" />, sub: "NEXT_CYCLE_MAR_22", color: "text-amber-500" },
          { label: "CURRENT_BALANCE.FLUX", value: stats?.currentBalance, icon: <Wallet className="text-indigo-500" />, sub: "WITHDRAWABLE_ALPHA", color: "text-indigo-500" },
          { label: "ESTIMATED_VAT.SIG", value: (stats?.totalRevenue || 0) * 0.18, icon: <ShieldCheck className="text-slate-400" />, sub: "AUTO_RESERVED.X", color: "text-slate-400" }
        ].map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-10 rounded-[3rem] bg-white dark:bg-slate-950 border-4 border-slate-100 dark:border-slate-800 shadow-4xl relative overflow-hidden group hover:shadow-inner transition-all flex flex-col justify-between h-[250px]"
          >
             <div className="flex justify-between items-start relative z-10">
               <div className="space-y-3">
                 <p className="text-[10px] font-black text-slate-400 tracking-[0.4em] opacity-60 leading-none">{card.label}</p>
                 <h3 className={cn("text-4xl font-black italic tracking-tighter shadow-text uppercase leading-none", card.color)}>
                   {isStatsLoading ? "..." : `₹${card.value?.toLocaleString()}`}
                 </h3>
               </div>
               <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-[1.25rem] border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                 {card.icon}
               </div>
             </div>
             <div className="ps-0 pt-6 border-t-4 border-slate-50 dark:border-slate-900/40 relative z-10 flex items-center gap-3">
               <span className="text-[9px] font-black tracking-[0.2em] text-slate-400 italic opacity-60">{card.sub}</span>
             </div>
             <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-slate-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] pointer-events-none group-hover:scale-150 transition-transform duration-[4000ms]" />
          </motion.div>
        ))}
      </div>

      {/* Payment Ledger Section */}
      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl rounded-[4rem] border-4 border-slate-100 dark:border-slate-800 shadow-4xl shadow-inner overflow-hidden font-black italic uppercase leading-none">
        <div className="p-12 border-b-4 border-slate-100 dark:border-slate-800/60 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white flex items-center gap-6 uppercase shadow-text">
              <History size={40} className="text-indigo-500" /> Settlement Ledger.X
            </h2>
            <p className="text-xl text-slate-400 font-black italic tracking-wide opacity-60">Detailed history of all your settlements and payouts alpha.</p>
          </div>
          <div className="flex items-center gap-6 font-black italic uppercase tracking-[0.3em] leading-none">
             <div className="flex items-center gap-6 bg-white dark:bg-slate-950 px-8 py-5 rounded-[1.5rem] border-4 border-slate-50 dark:border-slate-800 shadow-xl shadow-inner">
                <Search size={24} className="text-slate-400" />
                <input 
                  placeholder="FILTER_TRANSACTIONS.NODE..." 
                  className="bg-transparent border-none outline-none text-[11px] w-64 tracking-[0.3em] font-black italic uppercase text-indigo-500" 
                />
             </div>
             <button className="h-20 px-8 bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] flex items-center justify-center border-4 border-slate-50 dark:border-slate-800 hover:scale-110 transition-all shadow-4xl italic text-[10px] tracking-widest">
                <Filter size={24} className="mr-4" /> FILTERS.SIG
             </button>
          </div>
        </div>

        <div className="overflow-x-auto p-12 custom-scrollbar">
          <table className="w-full text-left border-separate border-spacing-y-6">
            <thead>
              <tr className="text-[10px] font-black tracking-[0.4em] text-slate-400 italic opacity-60 uppercase">
                <th className="px-10 pb-4">REFERENCE.X</th>
                <th className="px-10 pb-4">AMOUNT.NODE</th>
                <th className="px-10 pb-4">TIMESTAMP.SIG</th>
                <th className="px-10 pb-4">STATUS.CORE</th>
                <th className="px-10 pb-4 text-right">ACTION.FORCE</th>
              </tr>
            </thead>
            <tbody>
              {isTxnsLoading ? (
                 <tr>
                   <td colSpan={5} className="py-20 text-center opacity-40 italic font-black uppercase tracking-[0.6em]">SYNCING_LEDGER.FLUX...</td>
                 </tr>
              ) : transactions.map((txn, idx) => (
                <motion.tr 
                  key={txn.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-white dark:bg-slate-950/50 rounded-[2rem] border-4 border-slate-100 dark:border-slate-800/40 hover:border-indigo-500 transition-all shadow-xl hover:shadow-inner cursor-pointer"
                >
                  <td className="px-10 py-8 first:rounded-l-[2rem]">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 border-2 border-indigo-100 dark:border-indigo-500/20 shadow-4xl">
                        <CreditCard size={28} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xl font-black dark:text-white uppercase tracking-tighter shadow-text">{txn.id}</p>
                        <p className="text-[9px] text-slate-400 font-black italic opacity-60 tracking-widest">{txn.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={cn("text-2xl font-black italic tracking-tighter shadow-text", txn.amount > 0 ? "text-emerald-500" : "text-rose-500")}>
                      {txn.amount > 0 ? "+" : ""} ₹{Math.abs(txn.amount).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400 tracking-widest italic">
                      {txn.date.replace(/-/g, '.')}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className={cn(
                      "inline-flex items-center gap-3 px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border-2 italic",
                      txn.status === 'COMPLETED' ? "bg-emerald-500 border-emerald-300 text-white shadow-emerald-500/20" :
                      "bg-amber-500 border-amber-300 text-white shadow-amber-500/20"
                    )}>
                      {txn.status === 'COMPLETED' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {txn.status}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right last:rounded-r-[2rem]">
                    <button 
                      onClick={() => handleDownload(txn.id)}
                      disabled={isDownloading === txn.id}
                      className={cn(
                        "h-14 w-40 bg-slate-50 dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-800 text-slate-400 font-black rounded-xl hover:text-indigo-500 hover:border-indigo-500 transition-all text-[8px] tracking-[0.3em] italic",
                        isDownloading === txn.id && "opacity-50 animate-pulse"
                      )}
                    >
                      {isDownloading === txn.id ? "SYNCING..." : "FETCH_RECEIPT.X"}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safety & Compliance Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="p-16 rounded-[4rem] bg-slate-950 text-white shadow-4xl relative overflow-hidden group shadow-inner border-b-[1.5rem] border-indigo-600">
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px] pointer-events-none group-hover:scale-125 transition-transform duration-[5000ms]" />
           <div className="relative z-10 space-y-10">
              <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center border-4 border-white/5 shadow-inner">
                 <ShieldCheck size={48} className="text-indigo-500 shadow-text animate-pulse" />
              </div>
              <div className="space-y-6">
                 <h3 className="text-5xl font-black italic tracking-tighter uppercase shadow-text">Financial Security.NODE</h3>
                 <p className="text-2xl text-slate-400 font-black italic opacity-80 leading-relaxed uppercase tracking-wide">
                   All payouts are processed via Shopro's secure escrow nodes. Your financial telemetry is encrypted via ALPHA_AES_256 and never shared.
                 </p>
              </div>
              <button className="h-20 px-12 bg-white text-slate-900 font-black rounded-[1.5rem] text-[10px] tracking-[0.5em] shadow-4xl hover:scale-110 transition-transform italic border-4 border-indigo-500">
                 VIEW_SECURITY_TELEMETRY.FORCE
              </button>
           </div>
        </div>

        <div className="p-16 rounded-[4rem] bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl border-4 border-slate-100 dark:border-slate-800 shadow-4xl flex flex-col justify-between shadow-inner font-black italic uppercase italic leading-none">
           <div className="space-y-8">
              <h3 className="text-4xl font-black italic text-slate-900 dark:text-white flex items-center gap-6 tracking-tight shadow-text uppercase">
                 <Info className="text-indigo-500" /> Merchant Help.X
              </h3>
              <p className="text-xl text-slate-400 font-black italic opacity-70 leading-relaxed tracking-wide">
                 Settlement issues are handled by our dedicated merchant support nodes. Most disputes are synchronized within 5-7 business cycles alpha.
              </p>
           </div>
           <div className="mt-12 space-y-6">
              <div className="flex items-center justify-between p-8 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border-4 border-slate-100 dark:border-slate-800 shadow-inner">
                 <span className="text-xs font-black text-slate-400 tracking-[0.3em] italic opacity-60">NEXT_EXPECTED_SYNC</span>
                 <span className="text-xs font-black dark:text-white tabular-nums">22 MAR 2024, 10:00 AM</span>
              </div>
              <button className="w-full h-20 text-center text-indigo-500 font-black text-[12px] tracking-[0.4em] hover:scale-105 transition-transform italic border-4 border-slate-100 dark:border-slate-800 rounded-[2rem] bg-white dark:bg-slate-950 shadow-xl">
                 CONNECT_TO_MONETARY_SUPPORT.FORCE →
              </button>
           </div>
        </div>
      </div>
    </div>
    </SecureOverlay>
  );
}
