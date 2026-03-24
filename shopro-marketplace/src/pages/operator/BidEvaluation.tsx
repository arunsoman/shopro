"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, TrendingDown, ShieldCheck, BarChart3, TableIcon, Info, CheckCircle2, ChevronRight, Gavel, Star, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * OP-08 — Bid Evaluation & Award
 * Purpose: Compare results and award the winner.
 */

interface BidItem {
  productName: string;
  quantity: number;
  unit: string;
  bidPrice: number;
}

interface Bid {
  id: string;
  supplierName: string;
  supplierRating: number;
  bidResponseRate: number; // New: % of bids responded to
  fulfillmentQuality: number; // New: 1-5 quality score
  reliabilityScore: number; // New: Weighted average %
  totalAmount: number;
  deliveryDate: string;
  leadTime: number; // New: Fulfillment lead time
  status: string;
  items: BidItem[];
  submittedAt: string;
}

interface BidEvent {
  id: string;
  title: string;
  description: string;
  status: string;
  deadline: string;
  urgency: string;
  operationMode: string; // New: AUTO|SEMI|MANUAL
  repeatFrequency: string; // New
  items: BidItem[];
  bids: Bid[];
}

export default function BidEvaluation() {
  const navigate = useNavigate();
  const { eventId } = useParams();

  const [selectedBidId, setSelectedBidId] = useState<string | null>(null);

  const { data: event, isLoading: isLoadingEvent } = useQuery<BidEvent>({
    queryKey: ["operator-bid-evaluation", eventId],
    queryFn: async () => {
      const resp = await api.get(`/operator/bidding/events/${eventId}`);
      return {
        id: resp.data?.id || "---",
        title: resp.data?.title || "Unknown Bid Event",
        description: resp.data?.description || "",
        status: resp.data?.status || "PENDING",
        deadline: resp.data?.deadline || new Date().toISOString(),
        urgency: resp.data?.urgency || "NORMAL",
        operationMode: resp.data?.operationMode || "MANUAL",
        repeatFrequency: resp.data?.repeatFrequency || "NONE",
        items: resp.data?.items || [],
        bids: resp.data?.bids?.map((bid: any) => ({
          id: bid?.id || "---",
          supplierName: bid?.supplierName || "Unknown Supplier",
          supplierRating: bid?.supplierRating || 0,
          bidResponseRate: bid?.bidResponseRate || 95, // MOCK
          fulfillmentQuality: bid?.fulfillmentQuality || 4.5, // MOCK
          reliabilityScore: bid?.reliabilityScore || 92, // MOCK
          totalAmount: bid?.totalAmount || 0,
          deliveryDate: bid?.deliveryDate || "",
          leadTime: bid?.leadTime || 0,
          status: bid?.status || "SUBMITTED",
          items: bid?.items || [],
          submittedAt: bid?.submittedAt || new Date().toISOString()
        })) || []
      };
    },
    enabled: !!eventId
  });

  const bids = event?.bids || [];

  const awardMutation = useMutation({
    mutationFn: async (bidIdToAward: string) => {
      return api.post(`/operator/bidding/events/${eventId}/award/${bidIdToAward}`);
    },
    onSuccess: () => {
      navigate("/operator/po/inbox");
    }
  });

  const handleAward = (bid: Bid) => {
    awardMutation.mutate(bid.id);
  };

  const cheapest = [...bids].sort((a, b) => (a?.totalAmount || 0) - (b?.totalAmount || 0))[0];
  const mostTrusted = [...bids].sort((a, b) => (b?.supplierRating || 0) - (a?.supplierRating || 0))[0];

  return (
    <SecureOverlay>
      <div className="max-w-[1280px] mx-auto space-y-8 animate-in fade-in duration-1000 pb-20">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-(--sp-border) pb-8">
          <div className="space-y-2">
            <button
              onClick={() => navigate("/operator/po/inbox")}
              className="flex items-center gap-2 text-[11px] font-bold text-(--sp-text-3) hover:text-(--sp-cyan) transition-all uppercase tracking-wider opacity-60"
            >
              <ArrowLeft size={14} />
              Back to hub matrix
            </button>
            {isLoadingEvent ? (
              <div className="h-8 w-64 bg-(--sp-bg-1) animate-pulse rounded-md" />
            ) : (
              <div className="flex items-center gap-4">
                <h1 className="text-[28px] font-medium tracking-tight text-(--sp-text-0) uppercase">{event?.title}</h1>
                <span className={cn(
                  "px-3 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shadow-sm",
                  event?.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-(--sp-bg-1) text-(--sp-text-3) border-(--sp-border)"
                )}>
                  {event?.status || "PENDING"}
                </span>
              </div>
            )}
            <p className="text-(--sp-text-3) font-semibold text-[13px] flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-(--sp-cyan)" />
              Comparing {bids.length} fulfillment signals for {event?.operationMode || "MANUAL"} orchestration.
            </p>
          </div>

          {!isLoadingEvent && event && (
            <div className="bg-(--sp-bg-2) p-4 px-6 rounded-md border border-(--sp-border) shadow-sm text-right space-y-1">
              <p className="text-[10px] font-bold text-(--sp-text-3) uppercase tracking-wider opacity-60">Termination deadline</p>
              <p className="text-[16px] font-bold text-(--sp-text-1) tabular-nums tracking-tight">
                {event?.deadline ? new Date(event.deadline).toLocaleDateString() : "---"} @ {event?.deadline ? new Date(event.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "---"}
              </p>
            </div>
          )}
        </header>

        {/* Comparison Logic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cheapest Card */}
          <div className="bg-slate-900 rounded-md p-10 shadow-md relative overflow-hidden group border-b-4 border-(--sp-cyan)/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-(--sp-cyan)/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-md bg-(--sp-cyan)/10 flex items-center justify-center border border-(--sp-cyan)/20 shadow-sm">
                  <TrendingDown className="text-(--sp-cyan)" size={24} />
                </div>
                <h3 className="text-[11px] font-bold text-(--sp-cyan) uppercase tracking-wider opacity-60">Financial optimum</h3>
              </div>

              {isLoadingEvent ? (
                <div className="h-24 w-full bg-white/5 animate-pulse rounded-md" />
              ) : cheapest ? (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <p className="text-[48px] font-semibold text-white tracking-tighter tabular-nums leading-none">₹{(cheapest?.totalAmount || 0).toLocaleString()}</p>
                    <p className="text-[12px] text-white/40 font-bold uppercase tracking-wider">{cheapest?.supplierName} • {cheapest?.supplierRating}% Hub rating</p>
                  </div>
                  <button
                    onClick={() => handleAward(cheapest)}
                    disabled={awardMutation.isPending || event?.status === "AWARDED"}
                    className="h-10 px-8 bg-(--sp-cyan) text-white rounded-md font-bold text-[11px] hover:opacity-90 transition-all shadow-md tracking-wider uppercase disabled:opacity-50 border border-cyan-400"
                  >
                    Select economic node
                  </button>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center opacity-40 text-white space-y-3">
                   <TrendingDown size={32} />
                   <p className="text-[11px] font-bold uppercase tracking-wider">No signals captured yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Most Trusted Card */}
          <div className="bg-slate-900 rounded-md p-10 shadow-md relative overflow-hidden group border-b-4 border-violet-500/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-md bg-violet-500/10 flex items-center justify-center border border-violet-500/20 shadow-sm">
                  <ShieldCheck className="text-violet-400" size={24} />
                </div>
                <h3 className="text-[11px] font-bold text-violet-400 uppercase tracking-wider opacity-60">Trust integrity leader</h3>
              </div>

              {isLoadingEvent ? (
                <div className="h-24 w-full bg-white/5 animate-pulse rounded-md" />
              ) : mostTrusted ? (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <p className="text-[48px] font-semibold text-white tracking-tighter tabular-nums leading-none">{mostTrusted?.reliabilityScore || 0}%</p>
                    <p className="text-[12px] text-white/40 font-bold uppercase tracking-wider">{mostTrusted?.supplierName} • {mostTrusted?.fulfillmentQuality}★ Quality • {mostTrusted?.leadTime}h speed</p>
                  </div>
                  <button
                    onClick={() => handleAward(mostTrusted)}
                    disabled={awardMutation.isPending || event?.status === "AWARDED"}
                    className="h-10 px-8 bg-violet-600 text-white rounded-md font-bold text-[11px] hover:bg-violet-700 transition-all shadow-md tracking-wider uppercase disabled:opacity-50 border border-violet-500"
                  >
                    Select reliability node
                  </button>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center opacity-40 text-white space-y-3">
                   <ShieldCheck size={32} />
                   <p className="text-[11px] font-bold uppercase tracking-wider">No signals captured yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full Signals Table */}
        <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-sm overflow-hidden">
          <div className="p-8 border-b border-(--sp-border)/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="text-(--sp-cyan) w-5 h-5" />
              <h2 className="text-[18px] font-semibold text-(--sp-text-0) tracking-tight">Signal matrix grid</h2>
            </div>
            <div className="flex items-center gap-3">
              <button className="w-9 h-9 rounded-md bg-(--sp-bg-1) text-(--sp-text-3) hover:bg-(--sp-bg-2) transition-all flex items-center justify-center border border-(--sp-border) shadow-sm">
                <TableIcon size={16} />
              </button>
              <button className="w-9 h-9 rounded-md bg-(--sp-bg-1) text-(--sp-text-3) hover:bg-(--sp-bg-2) transition-all flex items-center justify-center border border-(--sp-border) shadow-sm">
                <Info size={16} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-(--sp-bg-1)/50 border-b border-(--sp-border)/50 text-(--sp-text-3)">
                  <th className="py-4 px-8 text-[11px] font-bold uppercase tracking-wider">Candidate hub</th>
                  <th className="py-4 px-8 text-[11px] font-bold uppercase tracking-wider">Reliability node</th>
                  <th className="py-4 px-8 text-[11px] font-bold uppercase tracking-wider">Total bid</th>
                  <th className="py-4 px-8 text-[11px] font-bold uppercase tracking-wider">Speed</th>
                  <th className="py-4 px-8 text-[11px] font-bold uppercase tracking-wider">Received</th>
                  <th className="text-right py-4 px-8 text-[11px] font-bold uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--sp-border)/50">
                {isLoadingEvent ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="py-8 px-8">
                        <div className="h-10 bg-(--sp-bg-1) rounded-md shadow-inner" />
                      </td>
                    </tr>
                  ))
                ) : bids.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <p className="text-(--sp-text-3) tracking-wider text-[11px] font-bold uppercase opacity-40">Waiting for supplier signals...</p>
                    </td>
                  </tr>
                ) : bids.map((bid) => (
                  <tr key={bid?.id} className="group hover:bg-(--sp-bg-1)/50 transition-all">
                    <td className="py-6 px-8">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-md bg-(--sp-bg-1) text-(--sp-cyan) border border-(--sp-border) flex items-center justify-center text-[18px] font-bold shadow-sm uppercase">{bid?.supplierName ? bid.supplierName[0] : "?"}</div>
                          <div>
                              <p className="text-[14px] font-bold text-(--sp-text-0) uppercase tracking-tight">{bid?.supplierName}</p>
                              <p className="text-[11px] text-(--sp-text-3) font-semibold opacity-60 uppercase tracking-wider">Direct hub fulfillment</p>
                          </div>
                       </div>
                    </td>
                    <td className="py-6 px-8">
                       <div className="space-y-2.5 w-40">
                          <div className="flex justify-between text-[10px] font-bold text-(--sp-text-3) uppercase tracking-wider opacity-60">
                             <span>Consolidated Score</span>
                             <span className="text-(--sp-text-1)">{bid?.reliabilityScore || 0}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-(--sp-bg-1) rounded-full overflow-hidden border border-(--sp-border)/50 shadow-inner">
                             <motion.div initial={{ width: 0 }} animate={{ width: `${bid?.reliabilityScore || 0}%` }} className={cn(
                                "h-full shadow-[0_0_8px_rgba(16,185,129,0.3)]",
                                (bid?.reliabilityScore || 0) >= 90 ? "bg-emerald-500" : (bid?.reliabilityScore || 0) >= 80 ? "bg-amber-500" : "bg-rose-500"
                             )} />
                          </div>
                       </div>
                    </td>
                    <td className="py-6 px-8">
                       <p className="text-[18px] font-bold text-(--sp-text-0) tabular-nums tracking-tighter">₹{(bid?.totalAmount || 0).toLocaleString()}</p>
                    </td>
                    <td className="py-6 px-8">
                       <p className="text-[14px] font-bold text-(--sp-text-1) tabular-nums tracking-tighter">{bid?.leadTime || 0}h</p>
                    </td>
                    <td className="py-6 px-8">
                       <p className="text-[11px] font-bold text-(--sp-text-3) uppercase tracking-wider opacity-60 tabular-nums">{bid?.submittedAt ? new Date(bid.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "---"}</p>
                    </td>
                    <td className="py-6 px-8 text-right">
                       <div className="flex items-center justify-end gap-3 transition-all opacity-0 group-hover:opacity-100">
                          <button className="h-8 w-8 rounded-md bg-(--sp-bg-1) text-(--sp-text-3) border border-(--sp-border) hover:text-(--sp-cyan) hover:border-(--sp-cyan)/30 transition-all flex items-center justify-center shadow-sm">
                             <MessageSquare size={16} />
                          </button>
                          <button 
                             onClick={() => handleAward(bid)}
                             disabled={awardMutation.isPending || event?.status === "AWARDED"}
                             className="h-8 px-5 bg-slate-900 text-white rounded-md font-bold text-[10px] uppercase tracking-wider hover:bg-slate-800 transition-all disabled:opacity-30 shadow-md"
                          >
                             Award bid
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
    </SecureOverlay>
  );
}
