"use client";

import { StatusBadge } from "@/components/ui/status-badge";
import { Plus, History, AlertTriangle, CheckCircle2, MessageSquare, Package } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * OP-14 — Credit Note Issuance
 * Purpose: Handling returns, shortages, and quality claims.
 * DNA: Item-by-item deduction, justification flags, auto-approval thresholds.
 */

const PENDING_CLAIMS = [
  { id: "CLAIM-882", date: "1h ago", supplier: "Golden Harvest", reason: "Shortage", amount: 1200, status: "PENDING" },
  { id: "CLAIM-880", date: "3h ago", supplier: "Fresh Express", reason: "Quality Issue", amount: 4500, status: "REVIEW_NEEDED" },
  { id: "CLAIM-875", date: "1d ago", supplier: "Imperial Grains", reason: "Expired Item", amount: 800, status: "APPROVED" },
];

export default function CreditNoteIssue() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Credit Memorandums</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Issuing and reviewing vendor credit adjustments for order discrepancies.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="h-10 px-4 bg-white dark:bg-slate-900 text-slate-600 dark:text-white rounded-xl text-xs font-black flex items-center gap-2 ring-1 ring-slate-200 dark:ring-slate-800 hover:bg-slate-50 transition-all shadow-sm">
            <History size={14} /> CLAIM HISTORY
          </button>
          <button className="h-10 px-4 bg-rose-600 text-white rounded-xl text-xs font-black flex items-center gap-2 hover:scale-105 transition-all shadow-lg">
            <Plus size={14} /> ISSUE CREDIT NOTE
          </button>
        </div>
      </div>

      {/* Grid: Claim Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PENDING_CLAIMS.map((claim) => (
          <div key={claim.id} className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-8 ring-1 ring-slate-200 dark:ring-slate-800 group hover:ring-rose-500/50 transition-all relative overflow-hidden">
             <div className="flex justify-between items-start mb-6">
               <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
                 <AlertTriangle size={24} />
               </div>
               <StatusBadge status={claim.status as any} />
             </div>

             <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{claim.supplier}</h3>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    <span>ID: {claim.id}</span>
                    <span>•</span>
                    <span>{claim.date}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Reason for Credit</p>
                   <p className="text-sm font-black text-slate-700 dark:text-slate-200 underline decoration-rose-500/30 decoration-2 underline-offset-4">{claim.reason}</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                   <p className="text-2xl font-black text-slate-900 dark:text-white">₹{claim.amount.toLocaleString()}</p>
                   <div className="flex items-center gap-1">
                      <button className="p-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-110 transition-all shadow-lg">
                         <CheckCircle2 size={18} />
                      </button>
                      <button className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-900 transition-all border border-slate-100 dark:border-slate-700">
                         <MessageSquare size={18} />
                      </button>
                   </div>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Manual Entry Workspace DNA */}
      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden shadow-sm">
         <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <h2 className="text-lg font-bold uppercase tracking-tighter text-slate-900 dark:text-white">Active Adjustment Workspace</h2>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
               <span className="flex items-center gap-1.5"><Package size={14} /> Reference: 12 items</span>
               <span className="flex items-center gap-1.5 text-rose-500"><AlertTriangle size={14} /> Impact: -₹18,480</span>
            </div>
         </div>

         <div className="p-8 space-y-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Deducting per-unit charges based on <strong>Shortage</strong> reported at Bangalore Hub. System will automatically generate a PDF Memorandum and reconcile against the next Statement of Account for Golden Harvest.
            </p>
            
            <div className="flex items-center gap-3">
               <button className="h-11 px-8 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                  AUTHORIZE & BROADCAST MEMO
               </button>
               <button className="h-11 px-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
                  SAVE FOR AUDIT
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
