"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, 
  Edit3, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  History,
  Info,
  ChevronRight,
  RefreshCw,
  Plus,
  Minus,
  CircleDot,
  ArrowRight
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * RC-03 — Purchase Order Amendment
 * Purpose: Request changes to an active PO.
 */

export default function OrderAmendment() {
  const { poId } = useParams();
  const navigate = useNavigate();
  const [reason, setReason] = useState("");

  const { data: po, isLoading } = useQuery({
    queryKey: ["buyer-po-detail", poId],
    queryFn: async () => {
      const resp = await api.get(`buyer/orders/${poId}`);
      return resp.data;
    }
  });

  const amendMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.post(`/api/buyer/fulfillment/${poId}/amend`, payload);
    },
    onSuccess: () => {
      navigate(`/restaurant/orders/${poId}`);
    }
  });

  if (isLoading) return <div className="p-24 animate-pulse bg-muted/10 rounded-3xl" />;

  return (
    <SecureOverlay>
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-24 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-slate-200 dark:border-slate-800 pb-8 transition-all">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <button 
                onClick={() => navigate(-1)}
                className="h-12 w-12 bg-white dark:bg-slate-950 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 hover:scale-105 transition-all shadow-sm"
            >
                <IconTooltip label="Back"><ArrowLeft size={20} /></IconTooltip>
            </button>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Amend <span className="text-brand-primary font-extrabold italic">Order</span>
            </h1>
          </div>
          <p className="text-slate-500 font-medium text-sm flex items-center gap-3">
             <IconTooltip label="Status Pulse"><CircleDot className="w-5 h-5 text-brand-primary animate-pulse" /></IconTooltip>
             Modify Active Order • Order ID: {poId}
          </p>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-8">
            <section className="bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-4">
                    <IconTooltip label="Edit Mode"><Edit3 size={24} className="text-brand-primary" /></IconTooltip> 
                    Adjust Quantities
                </h2>
                
                <div className="space-y-6">
                   {po?.items.map((item: any, i: number) => (
                        <div key={item.id} className="group relative bg-slate-100/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-all hover:bg-white dark:hover:bg-slate-950 hover:border-brand-primary">
                          <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-lg font-bold italic text-brand-primary shadow-sm group-hover:rotate-6 transition-transform">
                                    {i + 1}
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase italic">{item.name}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Original: {item.qty} {item.unit}</p>
                                </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <button className="h-9 w-9 bg-white dark:bg-slate-950 rounded-lg border border-border flex items-center justify-center text-slate-400 hover:text-brand-primary transition-colors shadow-sm">
                                <Minus size={16} />
                            </button>
                            <span className="text-xl font-bold tracking-tight w-10 text-center text-brand-primary">{item.qty}</span>
                            <button className="h-9 w-9 bg-white dark:bg-slate-950 rounded-lg border border-border flex items-center justify-center text-slate-400 hover:text-brand-primary transition-colors shadow-sm">
                                <Plus size={16} />
                            </button>
                          </div>
                       </div>
                   ))}
                </div>
            </section>

            <section className="bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-4">
                    <IconTooltip label="Amendment Reason"><MessageSquare size={24} className="text-brand-primary" /></IconTooltip> 
                    Reason for Amendment
                </h2>
                <textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter the reason for this amendment..."
                    className="h-24 w-full bg-white dark:bg-slate-950 border border-border rounded-lg p-4 text-sm font-medium text-slate-900 dark:text-white focus:ring-4 focus:ring-brand-primary/10 outline-none shadow-sm transition-all"
                />
            </section>
        </div>

        <aside className="lg:col-span-4 space-y-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-brand-primary/50 shadow-lg space-y-6 relative overflow-hidden group text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] pointer-events-none" />
                <h3 className="text-lg font-bold tracking-tight uppercase relative z-10 flex items-center gap-3 italic">
                    <IconTooltip label="Processing"><RefreshCw size={20} className="animate-spin text-brand-primary" /></IconTooltip> 
                    Submit Request
                </h3>
                
                <div className="space-y-4 relative z-10">
                    <p className="text-[10px] font-bold tracking-widest opacity-60 uppercase">Important Information</p>
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-xs font-bold leading-relaxed uppercase italic text-brand-primary">
                            The supplier must re-validate inventory levels. Delivery dates may be delayed by up to 24 hours.
                        </p>
                    </div>
                </div>

                <div className="space-y-4 pt-4 relative z-10">
                    <button 
                        onClick={() => amendMutation.mutate({ reason })}
                        className="h-12 w-full bg-white text-slate-900 rounded-xl border border-white/10 font-bold text-sm tracking-tight shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-4 uppercase italic"
                    >
                        {amendMutation.isPending ? "Processing..." : "Submit Amendment"}
                        <ArrowRight size={20} />
                    </button>
                    <button 
                        onClick={() => navigate(-1)}
                        className="h-10 w-full bg-white/10 text-white rounded-lg border border-white/20 font-bold text-[10px] tracking-widest shadow-sm hover:bg-white/20 transition-all uppercase"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </aside>
      </main>
    </div>
    </SecureOverlay>
  );
}
