"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBadge } from "@/components/ui/status-badge";
import { ArrowLeft, ExternalLink, Info, Truck, AlertTriangle, BarChart3, MessageSquare, RefreshCw, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * OP-06 — Sub-PO Management
 * Purpose: Track all individual supplier fulfillments under a parent PO.
 * DNA: Progress skyline, timeline flow, supplier performance micro-badges.
 */

interface SubOrder {
  id: string;
  parentPO: string;
  supplier: string;
  status: string;
  amount: number;
}

const STATUS_FLOW = ["PENDING", "ACCEPTED", "PREPARING", "DISPATCHED", "DELIVERED"];

export default function SubPOManagement() {
  const navigate = useNavigate();
  const { poId } = useParams();
  const queryClient = useQueryClient();

  const { data: subPos = [], isLoading } = useQuery<SubOrder[]>({
    queryKey: ["operator-sub-pos", poId],
    queryFn: async () => {
      const resp = await api.get(`/operator/sourcing/sub-pos`);
      return resp.data;
    }
  });

  const getProgress = (status: string) => {
    const s = status.toUpperCase();
    if (s === "DELIVERED") return 100;
    if (s === "DISPATCHED") return 80;
    if (s === "PREPARING") return 60;
    if (s === "ACCEPTED") return 40;
    return 20;
  };

  const avgProgress = subPos.length > 0 
    ? Math.round(subPos.reduce((acc, s) => acc + getProgress(s.status), 0) / subPos.length)
    : 0;

  return (
    <SecureOverlay>
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
       {/* Header */}
       <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-(--sp-border) mt-4">
         <div className="space-y-4">
           <button 
             onClick={() => navigate(`/operator/po-inbox`)}
             className="flex items-center gap-2 text-[11px] font-medium text-(--sp-text-2) hover:text-emerald-500 transition-all uppercase tracking-[0.04em]"
           >
             <ArrowLeft size={14} /> Back to Audit Matrix
           </button>
          
          {isLoading ? (
              <div className="h-10 w-48 bg-(--sp-bg-2) animate-pulse rounded-md" />
           ) : (
             <div className="space-y-1">
               <div className="flex items-center gap-4">
                 <h1 className="text-[32px] font-medium tracking-[-0.02em] text-(--sp-text-0)">Fulfillment Matrix</h1>
                 <div className="px-2 py-0.5 rounded-[4px] bg-emerald-500/10 text-emerald-500 text-[10px] font-medium uppercase tracking-[0.06em] border border-emerald-500/20">{subPos.length} Nodes Propagated</div>
               </div>
               <p className="text-(--sp-text-2) text-[14px]">
                  Monitoring real-time supplier orchestration for parent trace node <span className="font-medium text-(--sp-text-0)">PO-7721</span>
               </p>
             </div>
           )}
        </div>

         <div className="flex items-center gap-4">
           <button className="h-9 px-6 bg-(--sp-bg-2) text-(--sp-text-1) rounded-sm text-[13px] font-medium border border-(--sp-border) flex items-center gap-2 hover:bg-(--sp-bg-3) transition-all shadow-sm uppercase tracking-[0.04em]">
             <BarChart3 size={16} /> Manifest_gen.x
           </button>
           <button className="h-9 px-6 bg-(--sp-red) text-white rounded-sm text-[13px] font-medium flex items-center gap-2 hover:opacity-90 transition-all shadow-sm uppercase tracking-[0.04em]">
             <AlertTriangle size={16} /> Escalate_force
           </button>
         </div>
       </div>

       <div className="bg-emerald-500 p-10 rounded-md relative overflow-hidden shadow-lg">
         <div className="relative z-10 grid grid-cols-1 xl:grid-cols-4 gap-8 items-center text-white">
           <div className="xl:col-span-1 space-y-4">
             <p className="text-[10px] text-white/60 font-medium uppercase tracking-[0.06em]">Parent status matrix alpha</p>
             <p className="text-[48px] font-light tracking-[-0.04em] leading-none mb-2">{avgProgress}% <span className="text-[10px] font-medium text-white/40 uppercase tracking-[0.06em] ml-2">Aggregate Flux</span></p>
             <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden border border-white/5">
                <motion.div initial={{ width: 0 }} animate={{ width: `${avgProgress}%` }} className="h-full bg-white/40" />
             </div>
           </div>
           
           <div className="xl:col-span-3 flex flex-wrap gap-12">
             {[
               { label: "Nodes_active", value: `${subPos.length}/${subPos.length}`, color: "text-white" },
               { label: "Latency_delta", value: "1.2ms", color: "text-white/80" },
               { label: "Velocity", value: "STABLE", color: "text-white/80" },
               { label: "Target_eta", value: "T-MINUS 24H", color: "text-white/80" },
             ].map((stat) => (
               <div key={stat.label} className="space-y-1">
                 <p className="text-[10px] text-white/40 font-medium uppercase tracking-[0.06em]">{stat.label}</p>
                 <p className={cn("text-[20px] font-medium tracking-tight uppercase", stat.color)}>{stat.value}</p>
               </div>
             ))}
           </div>
         </div>
       </div>

       {/* Sub-PO Cards */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-(--sp-bg-2) animate-pulse rounded-md border border-(--sp-border)" />
          ))
        ) : (
          subPos.map((spo, i) => (
            <motion.div
              key={spo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group"
            >
              <div className="bg-(--sp-bg-2) rounded-md p-6 border border-(--sp-border) shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-2">
                    <div className="px-2 py-0.5 rounded-[4px] bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-[0.06em] border border-emerald-500/20">
                      {spo.status}
                    </div>
                    <p className="text-[11px] font-medium text-(--sp-text-3) uppercase tracking-[0.04em]">
                      {spo.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-sm bg-(--sp-bg-3) text-(--sp-text-3) hover:text-emerald-500 transition-all flex items-center justify-center border border-(--sp-border) shadow-sm">
                      <MessageSquare size={16} />
                    </button>
                    <button className="w-8 h-8 rounded-sm bg-(--sp-bg-3) text-(--sp-text-3) hover:text-emerald-500 transition-all flex items-center justify-center border border-(--sp-border) shadow-sm">
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-6 mb-8 flex-1">
                  <div className="space-y-1">
                    <h3 className="text-[20px] font-medium text-(--sp-text-0) transition-colors cursor-pointer group-hover:text-emerald-500 uppercase">
                      {spo.supplier}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-emerald-500/5 text-emerald-600 border border-emerald-500/10 uppercase">
                        Secure_node
                      </span>
                      <span className="text-[11px] text-(--sp-text-3) font-medium uppercase tracking-[0.04em]">
                        Regional hub alpha
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-medium uppercase tracking-[0.04em]">
                      <span className="text-(--sp-text-2)">Velocity Matrix Flux</span>
                      <span className={cn(
                        "transition-colors",
                        spo.status === "DELIVERED" ? "text-emerald-500" : "text-(--sp-text-0)"
                      )}>
                        {getProgress(spo.status)}% Completion
                      </span>
                    </div>
                    <div className="h-2 w-full bg-(--sp-bg-3) rounded-full overflow-hidden border border-(--sp-border)/40">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${getProgress(spo.status)}%` }} 
                        className={cn(
                          "h-full transition-all duration-1000",
                          spo.status === "DELIVERED" ? "bg-emerald-500" : 
                          spo.status === "DISPATCHED" ? "bg-blue-500" : "bg-emerald-500/60"
                        )} 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-(--sp-border) flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-3">
                    <Truck size={18} className="text-emerald-500" />
                    <span className="text-[11px] font-medium text-(--sp-text-2) uppercase tracking-[0.04em]">
                      ETA: T-Minus 24H
                    </span>
                  </div>
                  <p className="text-[20px] font-medium text-(--sp-text-0) tabular-nums">
                    ₹{spo.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
        
        {/* Support Card */}
        <div className="bg-(--sp-bg-3) border-2 border-dashed border-(--sp-border) rounded-md p-8 flex flex-col items-center justify-center text-center space-y-6 opacity-60 hover:opacity-100 transition-all shadow-sm group/support">
          <div className="w-12 h-12 rounded-sm bg-(--sp-bg-2) text-(--sp-text-3) group-hover/support:text-emerald-500 transition-all flex items-center justify-center border border-(--sp-border)">
            <Database size={24} />
          </div>
          <div className="space-y-1">
            <h4 className="text-[18px] font-medium text-(--sp-text-0) group-hover/support:text-emerald-500 transition-colors uppercase">
              Intervention Node
            </h4>
            <p className="text-[11px] text-(--sp-text-2) mt-2 max-w-[240px] font-medium uppercase tracking-[0.04em] opacity-80">
              Our fulfillment specialists are available 24/7 for supplier handshake intervention protocol alpha.
            </p>
          </div>
          <button className="h-8 px-6 rounded-sm bg-emerald-500 text-white text-[11px] font-medium uppercase tracking-[0.04em] hover:opacity-90 transition-all shadow-sm">
            Signal.ops_support
          </button>
        </div>
       </div>
     </div>
     </SecureOverlay>
  );
}
