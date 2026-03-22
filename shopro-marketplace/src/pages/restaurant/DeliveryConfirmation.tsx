"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Truck, 
  Star, 
  MessageSquare, 
  ShieldCheck,
  Zap,
  Globe,
  Award,
  CircleDot,
  ArrowRight,
  RefreshCw,
  Box,
  AlertCircle
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * RC-04 — Delivery Confirmation
 * Purpose: Confirm receipt of goods and rate the experience for buyers.
 */

export default function DeliveryConfirmation() {
  const { poId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const { data: po, isLoading } = useQuery({
    queryKey: ["buyer-po-detail", poId],
    queryFn: async () => {
      const resp = await api.get(`buyer/orders/${poId}`);
      return resp.data;
    }
  });

  const confirmMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.post(`/api/buyer/fulfillment/${poId}/confirm`, payload);
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
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white italic">
                Confirm <span className="text-brand-success font-extrabold italic">Delivery</span>
            </h1>
          </div>
          <p className="text-slate-500 font-medium text-sm flex items-center gap-3">
             <IconTooltip label="Node Protocol"><CircleDot className="w-5 h-5 text-brand-success animate-pulse" /></IconTooltip>
             Goods Receipt Portal • Order ID: {poId}
          </p>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-8">
            <section className="bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-4">
                    <IconTooltip label="Inventory Scan"><Box size={24} className="text-brand-success" /></IconTooltip> 
                    Verify Items
                </h2>
                
                <div className="space-y-6">
                   {po?.items.map((item: any, i: number) => (
                        <div key={item.id} className="group relative bg-slate-100/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-all hover:bg-white dark:hover:bg-slate-950 hover:border-brand-success">
                          <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-lg font-bold italic text-brand-success shadow-sm group-hover:rotate-6 transition-transform">
                                    {i + 1}
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase italic">{item.name}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Quantity: {item.qty} {item.unit}</p>
                                </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <div className="h-10 px-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-600 font-bold italic text-[10px] tracking-widest uppercase shadow-sm">
                                Verified
                             </div>
                          </div>
                       </div>
                   ))}
                </div>
            </section>

            <section className="bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-4 text-amber-500 uppercase italic">
                    <IconTooltip label="Supplier Rank"><Star size={24} fill="currentColor" /></IconTooltip> 
                    Rate Supplier
                </h2>
                <div className="flex justify-center gap-4 py-4">
                    {[1,2,3,4,5].map(star => (
                        <button 
                            key={star}
                            onClick={() => setRating(star)}
                            className={cn(
                                "h-12 w-12 rounded-xl border flex items-center justify-center shadow-md transition-all hover:scale-110 active:scale-95",
                                star <= rating ? "bg-amber-500 border-amber-400 text-white rotate-6" : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400"
                            )}
                        >
                            <Star size={24} fill={star <= rating ? "currentColor" : "none"} />
                        </button>
                    ))}
                </div>
                <div className="space-y-4">
                    <h3 className="text-sm font-bold tracking-tight flex items-center gap-4 uppercase opacity-60 italic">Your Feedback</h3>
                    <textarea 
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Describe your experience with this delivery..."
                        className="h-24 w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-sm font-medium text-slate-900 dark:text-white focus:ring-4 focus:ring-amber-500/20 outline-none shadow-sm transition-all"
                    />
                </div>
            </section>
        </div>

        <aside className="lg:col-span-4 space-y-6">
            <div className="bg-brand-success p-6 rounded-2xl border border-brand-success/50 shadow-lg space-y-6 relative overflow-hidden group text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] pointer-events-none" />
                <h3 className="text-lg font-bold tracking-tight uppercase relative z-10 flex items-center gap-3 italic">
                    <IconTooltip label="Verified Receipt"><CheckCircle2 size={20} /></IconTooltip> 
                    Confirm Receipt
                </h3>
                
                <div className="space-y-4 relative z-10">
                    <p className="text-[10px] font-bold tracking-widest opacity-80 uppercase">Agreement</p>
                    <div className="p-4 bg-white/10 rounded-lg border border-white/20">
                        <p className="text-xs font-bold leading-relaxed uppercase italic">
                            By confirming, you acknowledge that all items have been received in good condition. Payment will be processed.
                        </p>
                    </div>
                </div>

                <div className="space-y-4 pt-4 relative z-10">
                    <button 
                        onClick={() => confirmMutation.mutate({ rating, comment })}
                        className="h-12 w-full bg-white text-emerald-700 rounded-xl border border-white/10 font-bold text-sm tracking-tight shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-4 uppercase italic"
                    >
                        {confirmMutation.isPending ? "Processing..." : "Confirm Receipt"}
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

            <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-2xl shadow-md space-y-4">
                <div className="flex items-center gap-4 text-rose-600">
                   <div className="h-12 w-12 bg-rose-500 rounded-lg flex items-center justify-center text-white shadow-md animate-pulse">
                      <AlertCircle size={24} />
                   </div>
                   <h4 className="text-lg font-bold tracking-tight uppercase italic">Issues?</h4>
                </div>
                <button className="h-12 w-full bg-rose-500 text-white rounded-lg border border-rose-400 font-bold text-[10px] tracking-widest hover:scale-[1.02] transition-all uppercase italic shadow-sm">
                   Report a Problem
                </button>
            </div>
        </aside>
      </main>
    </div>
    </SecureOverlay>
  );
}
