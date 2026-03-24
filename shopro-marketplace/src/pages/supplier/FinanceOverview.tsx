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

export default function FinanceOverview() {
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const { data: stats, isLoading: isStatsLoading } = useQuery<FinanceStats>({
    queryKey: ["supplier-finance-stats"],
    queryFn: async () => {
      const resp = await api.get("/supplier/finance/stats");
      return resp.data;
    }
  });

  const { data: transactions = [], isLoading: isTxnsLoading } = useQuery<Transaction[]>({
    queryKey: ["supplier-transactions"],
    queryFn: async () => {
      const resp = await api.get("/supplier/finance/transactions");
      return resp.data;
    }
  });

  const handleDownload = (id: string) => {
    setIsDownloading(id);
    setTimeout(() => setIsDownloading(null), 1500);
  };

  return (
    <SecureOverlay>
    <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-1000 pb-24 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 border-b border-slate-100 dark:border-slate-800 pb-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
             Financial <span className="text-indigo-500">Overview</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg tracking-wide leading-relaxed flex items-center gap-3">
             <Wallet className="w-6 h-6 text-indigo-500" />
             Track your earnings, manage payouts, and view transaction history.
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-500/10 px-6 py-3 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
             <Zap size={18} />
             <span className="text-xs font-bold tracking-wider uppercase">Automatic Payouts Active</span>
          </div>
          <button className="h-14 w-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl flex items-center justify-center hover:scale-105 transition-all shadow-lg active:scale-95">
             <Download size={24} />
          </button>
        </div>
      </header>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: "Total Revenue", value: stats?.totalRevenue, icon: <TrendingUp className="text-emerald-500" />, sub: "Lifetime Earnings", color: "text-emerald-500" },
          { label: "Pending Payout", value: stats?.pendingPayout, icon: <Clock className="text-amber-500" />, sub: "Next Cycle: Mar 22", color: "text-amber-500" },
          { label: "Available Balance", value: stats?.currentBalance, icon: <Wallet className="text-indigo-500" />, sub: "Ready for withdrawal", color: "text-indigo-500" },
          { label: "Estimated Taxes / Fees", value: (stats?.totalRevenue || 0) * 0.18, icon: <ShieldCheck className="text-slate-400" />, sub: "Reserved for platform", color: "text-slate-400" }
        ].map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[220px]"
          >
             <div className="flex justify-between items-start">
               <div className="space-y-2">
                 <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">{card.label}</p>
                 <h3 className={cn("text-3xl font-extrabold tracking-tight", card.color)}>
                   {isStatsLoading ? "..." : `₹${card.value?.toLocaleString()}`}
                 </h3>
               </div>
               <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                 {card.icon}
               </div>
             </div>
             <div className="pt-4 border-t border-slate-50 dark:border-slate-800/60 flex items-center">
               <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase opacity-80">{card.sub}</span>
             </div>
          </motion.div>
        ))}
      </div>

      {/* Payment Ledger Section */}
      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-100 dark:border-slate-800/60 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-4">
              <History size={32} className="text-indigo-500" /> Transaction History
            </h2>
            <p className="text-lg text-slate-500 font-medium">Detailed history of all your settlements and payouts.</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-4 bg-white dark:bg-slate-900 px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <Search size={20} className="text-slate-400" />
                <input 
                  placeholder="Search transactions..." 
                  className="bg-transparent border-none outline-none text-sm w-64 font-medium text-slate-900 dark:text-white placeholder:text-slate-400" 
                />
             </div>
             <button className="h-14 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center font-bold text-sm hover:scale-105 transition-all">
                <Filter size={18} className="mr-3" /> Filters
             </button>
          </div>
        </div>

        <div className="overflow-x-auto p-12 custom-scrollbar">
          <table className="w-full text-left border-separate border-spacing-y-6">
            <thead>
              <tr className="text-[10px] font-bold tracking-widest text-slate-400 uppercase opacity-80">
                <th className="px-10 pb-6">Reference</th>
                <th className="px-10 pb-6">Amount</th>
                <th className="px-10 pb-6">Date</th>
                <th className="px-10 pb-6">Status</th>
                <th className="px-10 pb-6 text-right">Action</th>
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
                  <td className="px-10 py-6 text-right">
                    <button 
                      onClick={() => handleDownload(txn.id)}
                      disabled={isDownloading === txn.id}
                      className={cn(
                        "h-10 px-6 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold rounded-lg hover:text-indigo-500 hover:border-indigo-500 transition-all text-[10px] tracking-wider uppercase",
                        isDownloading === txn.id && "opacity-50 animate-pulse"
                      )}
                    >
                      {isDownloading === txn.id ? "Downloading..." : "View Receipt"}
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
        <div className="p-12 rounded-[3.5rem] bg-slate-900 dark:bg-slate-950 text-white shadow-xl border-b-8 border-indigo-600">
           <div className="space-y-8">
              <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 text-indigo-500">
                 <ShieldCheck size={40} className="animate-pulse" />
              </div>
              <div className="space-y-4">
                 <h3 className="text-3xl font-bold tracking-tight uppercase">Secure Payouts</h3>
                 <p className="text-lg text-slate-400 font-medium leading-relaxed">
                   All payouts are processed via Shopro's secure escrow. Your financial data is encrypted using <span className="text-white">industry-standard encryption</span> and remains confidential.
                 </p>
              </div>
              <button className="h-14 px-8 bg-white text-slate-900 font-bold rounded-xl text-[10px] tracking-widest uppercase hover:scale-105 transition-all">
                 Our Security Policy
              </button>
           </div>
        </div>

        <div className="p-12 rounded-[3.5rem] bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
           <div className="space-y-4">
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-4">
                 <Info size={32} className="text-indigo-500" /> Help & Support
              </h3>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                 Settlement issues? Our dedicated merchant support team is here to help. Most inquiries are resolved within 48-72 hours.
              </p>
           </div>
           <div className="mt-10 space-y-4">
              <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                 <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase opacity-80">Next Settlement</span>
                 <span className="text-sm font-bold dark:text-white tabular-nums">Mar 22, 2024</span>
              </div>
              <button className="w-full h-14 text-center text-indigo-500 font-bold text-sm hover:scale-102 transition-all border border-indigo-200 dark:border-indigo-900/50 rounded-2xl bg-white dark:bg-slate-900/50 shadow-sm">
                 Contact Financial Support →
              </button>
           </div>
        </div>
      </div>
    </div>
    </SecureOverlay>
  );
}
