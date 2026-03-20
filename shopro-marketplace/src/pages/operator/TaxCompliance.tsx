"use client";

import { StatusBadge } from "@/components/ui/status-badge";
import { Search, ShieldCheck, Download, Calculator, Landmark, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * OP-15 — Tax Compliance Dashboard
 * Purpose: GST, TCS, and TDS oversight.
 * DNA: Calculation cards, due-date counters, export-ready data grids.
 */

const TAX_RECORDS = [
  { id: "TX-GST-88", month: "March 2024", type: "GST (Output)", amount: 485000, status: "PENDING", dueDate: "Apr 20" },
  { id: "TX-TDS-45", month: "February 2024", type: "TDS (Section 194Q)", amount: 12400, status: "FILED", dueDate: "Mar 07" },
  { id: "TX-TCS-21", month: "February 2024", type: "TCS (Vendor)", amount: 5500, status: "FILED", dueDate: "Mar 15" },
];

export default function TaxCompliance() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Tax & Compliance</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Centralized oversight for statutory filings across the marketplace.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="h-10 px-4 bg-white dark:bg-slate-900 text-slate-600 dark:text-white rounded-xl text-xs font-black flex items-center gap-2 ring-1 ring-slate-200 dark:ring-slate-800 hover:bg-slate-50 transition-all shadow-sm">
            <PieChart size={14} /> FILING HISTORY
          </button>
          <button className="h-10 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black flex items-center gap-2 hover:scale-105 transition-all shadow-lg">
            <Calculator size={14} /> RUN TAX CALC
          </button>
        </div>
      </div>

      {/* Grid: Tax Stats DNA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "GST Payable", value: "₹4.85L", icon: Landmark, color: "blue", due: "12 Days" },
          { label: "TDS Withheld", value: "₹12.4K", icon: ShieldCheck, color: "violet", due: "Filed" },
          { label: "Tax Liability", value: "₹5.12L", icon: Calculator, color: "rose", due: "Total" },
          { label: "Compliance Score", value: "99.8%", icon: PieChart, color: "green", due: "High" },
        ].map((stat) => (
          <div key={stat.label} className="group bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-[2rem] ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm hover:shadow-xl transition-all relative overflow-hidden">
             <div className="flex justify-between items-center mb-4">
               <div className={cn("p-2.5 rounded-xl", 
                 stat.color === "blue" ? "bg-blue-500/10 text-blue-500" :
                 stat.color === "violet" ? "bg-violet-500/10 text-violet-500" :
                 stat.color === "rose" ? "bg-rose-500/10 text-rose-500" :
                 "bg-green-500/10 text-green-500"
               )}>
                 <stat.icon size={18} />
               </div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.due}</span>
             </div>
             <p className="text-2xl font-black text-slate-900 dark:text-white mb-1">{stat.value}</p>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Table Section DNA */}
      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
           <h2 className="text-lg font-bold uppercase tracking-tighter text-slate-900 dark:text-white">Tax Liability Log</h2>
           <div className="flex items-center gap-3">
             <div className="relative group">
               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
               <input type="text" placeholder="Filter filing..." className="h-8 pl-8 pr-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-[10px] font-bold outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-violet-500 transition-all w-32" />
             </div>
             <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
               <Download size={18} />
             </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                <th className="p-6">Filing Period</th>
                <th className="p-6">Tax Component</th>
                <th className="p-6">Liability Amount</th>
                <th className="p-6">Due Date</th>
                <th className="p-6">Filing Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
              {TAX_RECORDS.map((rec) => (
                <tr key={rec.id} className="group hover:bg-white dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-6 font-black text-sm text-slate-700 dark:text-slate-200">
                    {rec.month}
                    <p className="text-[9px] text-slate-400 uppercase tracking-tighter font-bold mt-0.5">{rec.id}</p>
                  </td>
                  <td className="p-6">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">{rec.type}</span>
                  </td>
                  <td className="p-6 text-sm font-black text-slate-900 dark:text-white">₹{rec.amount.toLocaleString()}</td>
                  <td className="p-6 text-sm text-slate-500 font-medium">{rec.dueDate}</td>
                  <td className="p-6">
                    <StatusBadge status={rec.status as any} />
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2.5 rounded-xl bg-violet-600 text-white font-black text-[9px] uppercase tracking-widest hover:scale-105 transition-all">
                         FILE NOW
                      </button>
                      <button className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-900 transition-all">
                         <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
