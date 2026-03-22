"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBadge } from "@/components/ui/status-badge";
import { ArrowLeft, CheckCircle2, XCircle, Info, MessageSquare, ExternalLink, Calendar, Calculator, Package, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * OP-04 — PO Review & Action
 * Purpose: Detailed review of incoming PO. Accept, Reject, or Clarify.
 * DNA: Action floating bar, line items matrix, clarification thread.
 */

interface OrderItem {
  sku: string;
  name: string;
  qty: number;
  price: number;
}

interface PurchaseOrder {
  id: string;
  restaurant: string;
  items: OrderItem[];
  total: number;
  status: string;
}

export default function POReview() {
  const navigate = useNavigate();
  const { poId } = useParams();
  const [activeTab, setActiveTab] = useState<"items" | "clarification">("items");

  const { data: po, isLoading } = useQuery<PurchaseOrder>({
    queryKey: ["operator-po-review", poId],
    queryFn: async () => {
      const resp = await api.get(`/operator/sourcing/po-review/${poId}`);
      return resp.data;
    },
    enabled: !!poId
  });

  return (
    <SecureOverlay>
    <div className="space-y-8 animate-in fade-in duration-700 pb-24">
      {/* Detail Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-(--sp-border) mt-4">
        <div className="space-y-4">
          <button 
            onClick={() => navigate("/operator/po-inbox")}
            className="flex items-center gap-2 text-[11px] font-medium text-(--sp-text-2) hover:text-emerald-500 transition-all uppercase tracking-[0.04em]"
          >
            <ArrowLeft size={14} /> Back to inbox
          </button>
          
          {isLoading ? (
             <div className="h-10 w-48 bg-(--sp-bg-2) animate-pulse rounded-[8px] border border-(--sp-border)" />
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-4">
                <h1 className="text-[32px] font-medium tracking-[-0.02em] text-(--sp-text-0)">{po?.id}</h1>
                <div className="px-2 py-0.5 rounded-[4px] bg-emerald-500/10 text-emerald-500 text-[10px] font-medium tracking-[0.06em] border border-emerald-500/20 uppercase">{po?.status}</div>
              </div>
              <p className="text-[14px] text-(--sp-text-2)">
                 Fulfillment request from <span className="font-medium text-(--sp-text-0)">{po?.restaurant}</span>
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right">
             <p className="text-[10px] text-(--sp-text-3) font-medium uppercase tracking-[0.06em] mb-1">Total payload</p>
             <p className="text-[28px] font-light text-emerald-500 tracking-[-0.02em] tabular-nums">₹{po?.total.toLocaleString()}</p>
          </div>
          <div className="h-10 w-px bg-(--sp-border)" />
          <button className="h-9 w-9 rounded-[6px] bg-(--sp-bg-2) border border-(--sp-border) text-(--sp-text-2) hover:text-(--sp-text-0) transition-all flex items-center justify-center shadow-sm">
             <ExternalLink size={16} />
          </button>
        </div>
      </header>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Node items", value: `${po?.items.length || 0} SKU`, icon: Package },
          { label: "Sub-PO split", value: "DEFERRED", icon: Calculator },
          { label: "Delivery target", value: "T-MINUS 24H", icon: Calendar },
          { label: "Source protocol", value: "AUTO_NODE", icon: Info },
        ].map((stat) => (
          <div key={stat.label} className="bg-(--sp-bg-2) p-5 rounded-[12px] border border-(--sp-border) shadow-sm group">
            <div className="w-10 h-10 rounded-[8px] bg-(--sp-bg-3) text-emerald-500 flex items-center justify-center border border-(--sp-border) mb-4 group-hover:border-emerald-500/30 transition-all">
              <stat.icon size={18} />
            </div>
            <p className="text-[10px] text-(--sp-text-3) font-medium uppercase tracking-[0.06em] mb-1">{stat.label}</p>
            <p className="text-[18px] font-medium text-(--sp-text-0) truncate">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Content Tabs */}
      <div className="space-y-6">
        <div className="flex items-center gap-8 border-b border-(--sp-border)">
          <button 
            onClick={() => setActiveTab("items")}
            className={cn(
              "pb-4 text-[12px] font-medium tracking-[0.02em] transition-all relative uppercase",
              activeTab === "items" ? "text-emerald-500" : "text-(--sp-text-2) hover:text-(--sp-text-0)"
            )}
          >
            Line item matrix
            {activeTab === "items" && <motion.div layoutId="tab-underline" className="absolute -bottom-px left-0 right-0 h-0.5 bg-emerald-500" />}
          </button>
          <button 
            onClick={() => setActiveTab("clarification")}
            className={cn(
              "pb-4 text-[12px] font-medium tracking-[0.02em] transition-all relative uppercase",
              activeTab === "clarification" ? "text-emerald-500" : "text-(--sp-text-2) hover:text-(--sp-text-0)"
            )}
          >
            Handshake thread
            {activeTab === "clarification" && <motion.div layoutId="tab-underline" className="absolute -bottom-px left-0 right-0 h-0.5 bg-emerald-500" />}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "items" ? (
            <motion.div 
              key="items"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-(--sp-bg-2) rounded-[12px] border border-(--sp-border) overflow-hidden shadow-sm"
            >
              <table className="w-full text-left tabular-nums">
                <thead>
                  <tr className="bg-(--sp-bg-1)/30 border-b border-(--sp-border)">
                    <th className="py-4 px-6 text-[11px] font-medium uppercase tracking-[0.04em] text-(--sp-text-2)">Merchandise Node</th>
                    <th className="py-4 px-6 text-[11px] font-medium uppercase tracking-[0.04em] text-(--sp-text-2)">Origin</th>
                    <th className="py-4 px-6 text-[11px] font-medium uppercase tracking-[0.04em] text-(--sp-text-2) text-center">Qty</th>
                    <th className="py-4 px-6 text-[11px] font-medium uppercase tracking-[0.04em] text-(--sp-text-2)">Unit Cost</th>
                    <th className="py-4 px-6 text-[11px] font-medium uppercase tracking-[0.04em] text-(--sp-text-2) text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--sp-border)">
                  {isLoading ? (
                      <tr>
                        <td colSpan={5} className="py-24 text-center opacity-70">
                            <RefreshCw className="w-8 h-8 mx-auto mb-4 text-emerald-500 animate-spin" />
                            <p className="text-[13px] text-(--sp-text-2) font-medium uppercase tracking-[0.04em]">Syncing matrix entries...</p>
                        </td>
                      </tr>
                  ) : (
                   po?.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-(--sp-bg-1)/50 transition-all group">
                      <td className="py-5 px-6">
                        <div className="space-y-1">
                          <p className="text-[14px] font-medium text-(--sp-text-0) group-hover:text-emerald-500 transition-colors">{item.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-[0.06em] bg-emerald-500/5 px-2 py-0.5 rounded-[4px] border border-emerald-500/10">SKU: {item.sku}</span>
                            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-[0.06em] bg-amber-500/5 px-2 py-0.5 rounded-[4px] border border-amber-500/10">LOCKED_NODE</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-(--sp-text-2) bg-(--sp-bg-3) px-3 py-1 rounded-[6px] border border-(--sp-border)">
                           DEFERRED_SPO
                        </span>
                      </td>
                      <td className="py-5 px-6 text-center">
                         <p className="text-[14px] font-medium text-(--sp-text-0)">{item.qty} UNITS</p>
                      </td>
                      <td className="py-5 px-6">
                        <p className="text-[14px] font-medium text-(--sp-text-1)">₹{item.price.toLocaleString()}</p>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <p className="text-[16px] font-medium text-(--sp-text-0)">₹{(item.qty * item.price).toLocaleString()}</p>
                      </td>
                    </tr>
                  )))}
                </tbody>
                <tfoot className="bg-(--sp-bg-1)/30 border-t border-(--sp-border)">
                  <tr>
                    <td colSpan={4} className="py-6 px-6 text-right text-[11px] font-medium text-(--sp-text-2) uppercase tracking-[0.04em]">Total integrated value</td>
                    <td className="py-6 px-6 text-right text-[24px] font-light text-emerald-500 tracking-[-0.02em]">₹{po?.total.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </motion.div>
          ) : (
             <motion.div 
               key="chat"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 10 }}
               className="bg-(--sp-bg-2) rounded-[12px] p-12 border border-(--sp-border) shadow-sm"
             >
               <div className="flex flex-col items-center justify-center text-center space-y-6">
                 <div className="w-16 h-16 rounded-[12px] bg-(--sp-bg-3) text-(--sp-text-3) flex items-center justify-center border border-(--sp-border)">
                   <MessageSquare size={32} />
                 </div>
                 <div className="space-y-2">
                   <h3 className="text-[20px] font-medium text-(--sp-text-0)">Radio silence</h3>
                   <p className="text-[13px] text-(--sp-text-2) max-w-sm mx-auto">
                     No active frequency detected for PO signal. Broadcast a clarification request to initiated asynchronous handshake protocol.
                   </p>
                 </div>
                 <button className="h-9 px-6 rounded-[6px] bg-emerald-500 text-white text-[13px] font-medium hover:opacity-90 transition-all shadow-sm">
                    Broadcast signal
                 </button>
               </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Bar DNA */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-50">
        <div className="bg-(--sp-bg-2)/90 backdrop-blur-md px-8 py-4 rounded-[12px] shadow-2xl border border-(--sp-border) flex items-center justify-between gap-6">
          <div className="flex gap-4">
            <button className="flex flex-col items-center gap-1 group">
               <div className="w-10 h-10 rounded-[8px] bg-(--sp-red)/5 text-(--sp-red) flex items-center justify-center group-hover:bg-(--sp-red) group-hover:text-white transition-all border border-(--sp-red)/10">
                 <XCircle size={20} />
               </div>
               <span className="text-[10px] font-medium text-(--sp-text-2) group-hover:text-(--sp-red) uppercase tracking-[0.06em]">Reject</span>
            </button>
            <button className="flex flex-col items-center gap-1 group">
               <div className="w-10 h-10 rounded-[8px] bg-(--sp-bg-3) text-(--sp-text-1) flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all border border-(--sp-border)">
                 <MessageSquare size={20} />
               </div>
               <span className="text-[10px] font-medium text-(--sp-text-2) group-hover:text-emerald-500 uppercase tracking-[0.06em]">Clarify</span>
            </button>
          </div>
          
          <div className="h-10 w-px bg-(--sp-border)" />
          
          <button 
            onClick={() => navigate(`/operator/po-split`)}
            className="flex-1 h-12 bg-emerald-500 text-white rounded-[8px] font-medium text-[14px] hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            Accept & split force <CheckCircle2 size={18} />
          </button>
        </div>
      </div>
    </div>
    </SecureOverlay>
  );
}
