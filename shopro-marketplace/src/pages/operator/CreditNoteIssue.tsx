"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  History, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare, 
  Package,
  RefreshCw,
  Database,
  ArrowRight,
  Gavel,
  ShieldCheck,
  Search,
  Zap,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * OP-26 — Credit Note Issuance
 * Purpose: Handling returns, shortages, and quality claims.
 * DNA: Item-by-item deduction, justification flags, auto-approval thresholds.
 */

interface CreditClaim {
  id: string;
  orderId: string;
  supplier: string;
  reason: string;
  amount: number;
  status: string;
  date: string;
}

export default function CreditNoteIssue() {
  const { data: claims = [], isLoading } = useQuery<CreditClaim[]>({
    queryKey: ["operator-credit-claims"],
    queryFn: async () => {
      // Mocking for now since we don't have a specific endpoint for credit claims yet
      return [
        { id: "CLAIM-882", orderId: "PO-9002", date: "1h ago", supplier: "Golden Harvest", reason: "Shortage", amount: 1200, status: "PENDING" },
        { id: "CLAIM-880", orderId: "PO-8841", date: "3h ago", supplier: "Fresh Express", reason: "Quality Issue", amount: 4500, status: "REVIEW_NEEDED" },
        { id: "CLAIM-875", orderId: "PO-9105", date: "1d ago", supplier: "Imperial Grains", reason: "Expired Item", amount: 800, status: "APPROVED" },
      ];
    }
  });

  return (
    <SecureOverlay>
      <div className="space-y-8 animate-in fade-in duration-700 pb-12">
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-(--sp-border) mt-4">
          <div className="space-y-1">
            <h1 className="text-[28px] font-medium tracking-[-0.02em] text-(--sp-text-0)">
               Credit memorandums
            </h1>
            <div className="flex items-center gap-2">
               <AlertTriangle className="w-4 h-4 text-(--sp-red)" />
               <p className="text-[13px] text-(--sp-text-2)">
                  Issuing and reviewing vendor credit adjustments for order discrepancies.
               </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="h-9 px-4 rounded-[6px] bg-(--sp-bg-2) border border-(--sp-border) text-[13px] font-medium hover:bg-(--sp-bg-1)/50 transition-all flex items-center gap-2 text-(--sp-text-1)">
              <History size={14} /> Claim history
            </button>
            <button className="h-9 px-4 rounded-[6px] bg-(--sp-red) text-white text-[13px] font-medium hover:opacity-90 transition-all shadow-sm flex items-center gap-2">
              <Plus size={16} /> Issue credit note
            </button>
          </div>
        </header>

        {/* Grid: Claim Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-64 rounded-md bg-(--sp-bg-2) border border-(--sp-border) animate-pulse" />
              ))
          ) : claims.map((claim: CreditClaim, i: number) => (
            <motion.div 
              key={claim.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-(--sp-bg-2) rounded-md p-6 border border-(--sp-border) group hover:border-(--sp-red)/20 transition-all relative overflow-hidden shadow-sm"
            >
               <div className="flex justify-between items-start mb-6">
                 <div className="w-10 h-10 rounded-sm bg-(--sp-red)/10 text-(--sp-red) flex items-center justify-center border border-(--sp-red)/20 group-hover:scale-105 transition-all">
                    <AlertTriangle size={18} />
                 </div>
                 <div className={cn(
                    "px-2 py-0.5 rounded-[4px] text-[10px] font-medium uppercase tracking-[0.06em] border shadow-sm",
                    claim.status === 'APPROVED' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-(--sp-red)/10 text-(--sp-red) border-(--sp-red)/20"
                 )}>
                    {claim.status.replace('_', ' ')}
                 </div>
               </div>
 
               <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-[18px] font-medium text-(--sp-text-0) group-hover:text-(--sp-red) transition-colors truncate">{claim.supplier}</h3>
                    <div className="flex items-center gap-2 text-[11px] font-medium text-(--sp-text-2) uppercase tracking-[0.04em]">
                      <span className="text-emerald-500">{claim.id}</span>
                      <span className="opacity-40">•</span>
                      <span>{claim.date}</span>
                    </div>
                  </div>
 
                  <div className="p-4 rounded-sm bg-(--sp-bg-3) border border-(--sp-border) group-hover:border-(--sp-red)/10 transition-all">
                     <p className="text-[10px] text-(--sp-text-3) font-medium uppercase tracking-[0.06em] mb-1">Reason for credit</p>
                     <p className="text-[14px] font-medium text-(--sp-text-1)">{claim.reason}</p>
                  </div>
 
                  <div className="flex items-center justify-between pt-2">
                     <p className="text-[24px] font-light text-(--sp-text-0) tracking-[-0.02em] tabular-nums">₹{claim.amount.toLocaleString()}</p>
                     <div className="flex items-center gap-2">
                        <button className="h-8 px-4 rounded-[4px] bg-emerald-500 text-white text-[11px] font-medium hover:opacity-90 transition-all shadow-sm">
                           Authorize
                        </button>
                        <button className="w-8 h-8 rounded-[4px] bg-(--sp-bg-2) border border-(--sp-border) flex items-center justify-center text-(--sp-text-2) hover:text-(--sp-text-0) transition-all opacity-0 group-hover:opacity-100">
                           <MessageSquare size={14} />
                        </button>
                     </div>
                  </div>
               </div>
            </motion.div>
          ))}
        </div>

        {/* Manual Entry Workspace */}
        <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-sm overflow-hidden">
           <div className="p-8 border-b border-(--sp-border) flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-(--sp-bg-1)/30">
              <h2 className="text-[18px] font-medium text-(--sp-text-0)">Active adjustment workspace</h2>
              <div className="flex items-center gap-6 text-[11px] font-medium text-(--sp-text-2) uppercase tracking-[0.06em]">
                 <span className="flex items-center gap-2"><Package size={16} className="text-(--sp-cyan)" /> Reference: 12 items</span>
                 <span className="flex items-center gap-2 text-(--sp-red)"><AlertTriangle size={16} /> Impact: -₹18,480 delta</span>
              </div>
           </div>
 
           <div className="p-8 space-y-8">
              <p className="text-[15px] text-(--sp-text-1) max-w-4xl leading-relaxed">
                Deducting per-unit charges based on <span className="text-(--sp-red) font-medium">shortage reported</span>. System will automatically generate a PDF memorandum and reconcile against the next statement of account.
              </p>
              
              <div className="flex items-center gap-4">
                 <button className="h-10 px-8 rounded-[6px] bg-(--sp-red) text-white text-[13px] font-medium hover:opacity-90 transition-all shadow-sm">
                    Authorize & broadcast
                 </button>
                 <button className="h-10 px-8 rounded-[6px] bg-(--sp-bg-2) border border-(--sp-border) text-(--sp-text-1) text-[13px] font-medium hover:bg-(--sp-bg-1)/50 transition-all">
                    Save for audit
                 </button>
              </div>
           </div>
        </div>
      </div>
    </SecureOverlay>
  );
}
