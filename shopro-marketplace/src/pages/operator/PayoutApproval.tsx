"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  ShieldCheck, 
  CreditCard, 
  Banknote, 
  CheckCircle2, 
  XCircle,
  Clock,
  ArrowRight,
  MoreVertical,
  Layers,
  FileCheck,
  Zap,
  User,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

// ─── PAGE COMPONENT ──────────────────────────────────────────────────────────

// ─── PAGE COMPONENT ──────────────────────────────────────────────────────────

interface Payout {
  id: string;
  entity: string;
  amount: string;
  count?: number;
  status: string;
  level?: string;
  dueDate: string;
  riskScore?: number;
  reason?: string;
}

export default function PayoutApproval() {
  const { data: payouts = [], isLoading, refetch } = useQuery<Payout[]>({
    queryKey: ["pending-payouts"],
    queryFn: async () => {
      const resp = await api.get("/operator/finance/payouts/pending");
      return resp.data;
    }
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setIsProcessing(true);
    // Mocking success
    await new Promise(r => setTimeout(r, 800));
    setIsProcessing(false);
    refetch();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const totalPending = payouts.length;

  return (
    <SecureOverlay>
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-(--sp-border) mt-4">
          <div className="space-y-1">
            <h1 className="text-[28px] font-medium tracking-[-0.02em] text-(--sp-text-0)">
               Payout vault
            </h1>
            <div className="flex items-center gap-2">
               <ShieldCheck className="w-4 h-4 text-emerald-500" />
               <p className="text-[13px] text-(--sp-text-2)">
                  Multi-sig disbursement authorization protocol.
               </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="text-right">
                <div className="text-[13px] font-medium text-(--sp-text-1)">{totalPending} Pending authorauthorizations</div>
                <div className="text-[11px] text-emerald-500 uppercase tracking-[0.06em]">Auditor queue</div>
             </div>
             <div className="w-10 h-10 rounded-[8px] bg-(--sp-bg-2) border border-(--sp-border) flex items-center justify-center transition-all shadow-sm">
                <User size={20} className="text-(--sp-text-2)" />
             </div>
          </div>
        </header>

        {isLoading ? (
             <div className="py-24 flex flex-col items-center justify-center space-y-4">
                <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                <RefreshCw className="w-8 h-8 text-(--sp-cyan) animate-spin" />
                <p className="text-[13px] text-(--sp-text-2) font-medium">Decrypting vault...</p>
             </div>
        ) : (
           <div className="grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-6">
                 <div className="bg-(--sp-bg-2) rounded-[12px] border border-(--sp-border) shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-(--sp-border) bg-(--sp-bg-1)/30">
                       <h3 className="text-[16px] font-medium flex items-center gap-2 text-(--sp-text-0)">
                          <Zap className="w-4 h-4 text-(--sp-cyan)" />
                          Approval queue
                       </h3>
                     </div>

                     <div className="divide-y divide-(--sp-border)">
                        {payouts.map(pay => (
                          <div 
                           key={pay.id} 
                           onClick={() => setSelectedPayout(pay)}
                           className={cn(
                             "p-6 hover:bg-(--sp-bg-1)/50 transition-all cursor-pointer group/item flex items-center gap-6",
                             selectedIds.includes(pay.id) && "bg-(--sp-cyan)/5"
                           )}
                          >
                             <div 
                               onClick={(e) => { e.stopPropagation(); toggleSelect(pay.id); }}
                               className={cn(
                                 "w-5 h-5 rounded-[4px] border transition-all flex items-center justify-center shadow-sm shrink-0",
                                 selectedIds.includes(pay.id) ? "bg-(--sp-cyan) border-(--sp-cyan) text-white" : "border-(--sp-border) bg-(--sp-bg-0) hover:border-(--sp-cyan)"
                               )}
                             >
                               {selectedIds.includes(pay.id) && <CheckCircle2 size={12} />}
                             </div>

                             <div className="w-10 h-10 rounded-[8px] bg-(--sp-bg-3) flex items-center justify-center border border-(--sp-border) shrink-0 group-hover/item:border-(--sp-cyan)/30 transition-all">
                                <Banknote className="w-5 h-5 text-(--sp-cyan)" />
                             </div>
                             
                             <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                   <span className="text-[11px] font-medium text-(--sp-cyan) tracking-[0.06em]">{pay.id}</span>
                                   <span className="text-[11px] text-(--sp-text-2) tabular-nums">Due {pay.dueDate}</span>
                                   <span className="px-1.5 py-0.5 bg-(--sp-bg-3) text-(--sp-text-2) rounded-[4px] text-[10px] border border-(--sp-border) font-medium">{pay.level || "L2"}</span>
                                </div>
                                <h4 className="text-[15px] font-medium text-(--sp-text-0) truncate">{pay.entity}</h4>
                             </div>

                             <div className="text-right flex items-center gap-8">
                                <div>
                                    <div className="text-[18px] font-medium text-(--sp-text-0) tabular-nums tracking-[-0.01em]">{pay.amount}</div>
                                    <div className={cn("text-[11px] font-medium mt-0.5 uppercase tracking-[0.06em]", pay.status.includes('Flagged') ? 'text-(--sp-red)' : 'text-(--sp-text-2)')}>
                                       {pay.status}
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <button 
                                      disabled={isProcessing}
                                      className="w-8 h-8 rounded-[6px] bg-(--sp-bg-2) border border-(--sp-border) flex items-center justify-center text-(--sp-red) hover:bg-(--sp-red)/5 transition-all shadow-sm disabled:opacity-50"
                                    >
                                       <XCircle size={16} />
                                    </button>
                                    <button 
                                      disabled={isProcessing}
                                      className="w-8 h-8 rounded-[6px] bg-(--sp-cyan) text-white border-none shadow-sm flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-50"
                                    >
                                       <CheckCircle2 size={16} />
                                    </button>
                                 </div>
                              </div>
                          </div>
                        ))}
                     </div>
                 </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                 <div className="bg-(--sp-bg-2) rounded-[12px] border border-(--sp-border) p-6 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-6">
                       <p className="text-[11px] font-medium text-(--sp-text-2) uppercase tracking-[0.06em]">Disbursement index</p>
                       <ArrowRight size={14} className="text-(--sp-text-2)" />
                    </div>
                    
                    <div className="space-y-6">
                       <div>
                          <div className="text-[32px] font-light text-(--sp-cyan) tracking-[-0.02em] leading-none tabular-nums mb-2">$1.2M</div>
                          <div className="text-[11px] text-(--sp-text-2) mb-4">Total payout volume (MTD)</div>
                          <div className="h-1.5 bg-(--sp-bg-3) rounded-full overflow-hidden">
                             <motion.div initial={{ width: 0 }} animate={{ width: "65%" }} className="h-full bg-(--sp-cyan)" />
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-(--sp-bg-1)/30 border border-(--sp-border) rounded-[8px]">
                             <div className="text-[18px] font-medium text-(--sp-text-1) tabular-nums">2.4h</div>
                             <div className="text-[10px] text-(--sp-text-2) uppercase tracking-[0.04em] mt-1">Latency</div>
                          </div>
                          <div className="p-4 bg-(--sp-bg-1)/30 border border-(--sp-border) rounded-[8px]">
                             <div className="text-[18px] font-medium text-(--sp-text-1) tabular-nums">0%</div>
                             <div className="text-[10px] text-(--sp-text-2) uppercase tracking-[0.04em] mt-1">Failures</div>
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="bg-(--sp-bg-2) rounded-[12px] border border-(--sp-border) p-6 shadow-sm">
                   <h3 className="text-[14px] font-medium mb-6 flex items-center gap-2 text-(--sp-text-0)">
                     <CreditCard className="w-4 h-4 text-(--sp-cyan)" />
                     Disbursement protocols
                   </h3>
                   <div className="space-y-3">
                     <div className="p-4 bg-(--sp-bg-1)/30 rounded-[8px] flex items-center justify-between border border-(--sp-border)">
                        <div className="text-[12px] text-(--sp-text-1)">Over $50k requires L3 SIG</div>
                        <div className="w-8 h-4 rounded-full bg-(--sp-cyan)/20 relative cursor-pointer shrink-0">
                           <div className="absolute right-1 top-1 w-2 h-2 rounded-full bg-(--sp-cyan)" />
                        </div>
                     </div>
                     <div className="p-4 bg-(--sp-bg-1)/30 rounded-[8px] flex items-center justify-between border border-(--sp-border)">
                        <div className="text-[12px] text-(--sp-text-1)">Risk index &gt; 80 block</div>
                        <div className="w-8 h-4 rounded-full bg-(--sp-cyan)/20 relative cursor-pointer shrink-0">
                           <div className="absolute right-1 top-1 w-2 h-2 rounded-full bg-(--sp-cyan)" />
                        </div>
                     </div>
                     <button className="h-9 w-full rounded-[6px] border border-(--sp-border) text-[12px] font-medium shadow-sm hover:bg-(--sp-bg-1)/50 transition-all flex items-center justify-center gap-2 text-(--sp-text-1)">
                        <FileCheck size={14} className="text-(--sp-cyan)" /> Authorization policies
                     </button>
                   </div>
                </div>
                <div className="p-6 rounded-[12px] bg-(--sp-gold-dim) border border-(--sp-gold-border) flex flex-col gap-4 shadow-sm relative overflow-hidden">
                   <div className="flex items-center gap-4 relative z-10">
                     <div className="w-10 h-10 rounded-[8px] bg-(--sp-bg-2) flex items-center justify-center text-(--sp-gold) border border-(--sp-gold-border)/30">
                         <AlertTriangle size={20} />
                     </div>
                     <div>
                         <h4 className="text-[15px] font-medium text-(--sp-gold)">Risk spectrum</h4>
                         <div className="text-[11px] text-(--sp-gold) opacity-80">{selectedPayout?.entity || "Vault wide scan"}</div>
                     </div>
                   </div>
                   <div className="relative z-10 space-y-4">
                      <p className="text-[12px] text-(--sp-gold) opacity-70 leading-relaxed">
                         {selectedPayout?.reason || "Synchronous anomaly detected in transaction propagation sequence."}
                      </p>
                      
                      <div className="p-3 bg-white/40 rounded-[8px] border border-(--sp-gold-border)/20">
                         <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[11px] font-medium text-(--sp-gold)">Risk index</span>
                            <span className="text-(--sp-red) text-[14px] tabular-nums font-medium">{selectedPayout?.riskScore || "88"}/100</span>
                         </div>
                         <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-(--sp-red)" style={{ width: `${selectedPayout?.riskScore || 88}%` }} />
                         </div>
                      </div>

                      <div className="flex gap-2">
                         <button className="flex-1 h-9 rounded-[6px] text-[12px] font-medium text-(--sp-red) border border-(--sp-red)/20 hover:bg-(--sp-red)/5 transition-all">Override & sign</button>
                         <button className="flex-1 h-9 rounded-[6px] text-[12px] font-medium text-(--sp-gold) border border-(--sp-gold-border)/30 transition-all" onClick={() => setSelectedPayout(null)}>Dismiss</button>
                      </div>
                   </div>
                </div>
              </div>
           </div>
        )}
      </div>
    </div>
    </SecureOverlay>
  );
}
