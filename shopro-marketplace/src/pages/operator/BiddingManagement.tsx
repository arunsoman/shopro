"use client";

import { motion } from "framer-motion";
import { 
  History, 
  Plus, 
  ArrowRight, 
  Filter, 
  Search, 
  MoreVertical,
  Calendar,
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { GlowingBorder } from "@/components/ui/neon-button";
import { IconTooltip } from "@/components/shared/IconTooltip";
import { cn } from "@/lib/utils";
import React from "react";

/**
 * BM-01 — Bidding Management Console
 * Purpose: Centralized list of all reverse-auctions (current & historical).
 * DNA: High-density data grid, status-driven color coding, micro-analytics.
 */

interface BidEvent {
  id: string;
  title: string;
  status: "OPEN" | "CLOSED" | "AWARDED";
  operationMode: "AUTOMATIC" | "SEMI_AUTOMATIC" | "MANUAL";
  repeatFrequency: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY";
  deadline: string;
  nextRunDate?: string;
  itemCount: number;
  quoteCount: number;
}

export default function BiddingManagement() {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState("");

  const { data: bids, isLoading } = useQuery<BidEvent[]>({
    queryKey: ["operator-bids"],
    queryFn: async () => {
      const resp = await api.get("/operator/bids");
      return resp.data;
    }
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "OPEN": return { color: "text-(--sp-teal)", bg: "bg-(--sp-teal-dim)", icon: Clock };
      case "AWARDED": return { color: "text-(--sp-cyan)", bg: "bg-(--sp-cyan-dim)", icon: CheckCircle2 };
      case "CLOSED": return { color: "text-(--sp-text-2)", bg: "bg-(--sp-bg-3)", icon: History };
      default: return { color: "text-(--sp-amber)", bg: "bg-(--sp-amber-dim)", icon: AlertCircle };
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case "AUTOMATIC": return { label: "Fully Auto", icon: Zap, color: "text-violet-500" };
      case "SEMI_AUTOMATIC": return { label: "Semi-Auto", icon: Zap, color: "text-(--sp-cyan)" };
      default: return { label: "Manual", icon: History, color: "text-(--sp-text-2)" };
    }
  };

  const filteredBids = (bids || []).filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-[28px] font-medium tracking-[-0.02em] text-(--sp-text-0) flex items-center gap-3">
            <span className="font-(family-name:--font-geist-mono) opacity-50 text-[20px] tracking-tighter">BM-01</span> Bidding management
          </h1>
          <p className="text-[13px] text-(--sp-text-2) mt-1">
            Orchestrate reverse-auctions and monitor automated procurement cycles
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-(--sp-text-2) group-focus-within:text-(--sp-cyan) transition-colors" size={16} />
            <input 
              type="text"
              placeholder="Filter by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 h-10 pl-10 pr-4 bg-(--sp-bg-1) border border-(--sp-border) rounded-[10px] text-[13px] focus:outline-none focus:ring-1 focus:ring-(--sp-cyan) transition-all"
            />
          </div>
          
          <button 
            onClick={() => navigate("/operator/bids/new")}
            className="h-10 px-5 bg-linear-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-[10px] text-[13px] font-medium flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Plus size={18} />
            Launch Reverse-Auction
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      {isLoading ? (
        <div className="h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-(--sp-cyan) border-t-transparent rounded-full animate-spin" />
                <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-(--sp-text-2)">Syncing Bidding Ledger...</p>
            </div>
        </div>
      ) : filteredBids.length === 0 ? (
        <div className="h-[400px] flex flex-col items-center justify-center border border-dashed border-(--sp-border) rounded-[14px] bg-(--sp-bg-1)/50">
            <History size={48} className="text-(--sp-text-3) mb-4" />
            <h3 className="text-lg font-medium text-(--sp-text-1)">No bidding instances found</h3>
            <p className="text-sm text-(--sp-text-2) mt-1 text-center max-w-sm">
                No reverse-auctions have been recorded yet. Launch a new bid to see it appear here.
            </p>
            <button 
                onClick={() => navigate("/operator/bids/new")}
                className="mt-6 text-(--sp-cyan) text-sm font-medium hover:underline flex items-center gap-1"
            >
                Create your first bid <ArrowRight size={14} />
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBids.map((bid, i) => {
            const status = getStatusConfig(bid.status);
            const mode = getModeLabel(bid.operationMode);
            return (
              <motion.div
                key={bid.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative"
              >
                <div className="relative z-10 bg-(--sp-bg-2) hover:bg-(--sp-bg-3) border border-(--sp-border) hover:border-(--sp-border-hover) rounded-[14px] p-5 transition-all duration-200 shadow-sm flex items-center justify-between gap-6 cursor-pointer"
                  onClick={() => navigate(`/operator/bids/${bid.id}`)}
                >
                  <div className="flex items-center gap-6 flex-1 min-w-0">
                    <div className={cn("p-3 rounded-full shrink-0", status.bg, status.color)}>
                      <status.icon size={24} />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-[17px] font-medium text-(--sp-text-0) truncate group-hover:text-(--sp-cyan) transition-colors">{bid.title}</h3>
                        <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full", status.bg, status.color)}>
                          {bid.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-[12px] text-(--sp-text-2)">
                        <div className="flex items-center gap-1.5">
                            <mode.icon size={14} className={mode.color} />
                            <span>{mode.label}</span>
                        </div>
                        <span className="w-1 h-1 rounded-full bg-(--sp-border)" />
                        <div className="flex items-center gap-1.5 uppercase font-(family-name:--font-geist-mono) tracking-tighter">
                            {bid.repeatFrequency !== 'NONE' ? (
                                <>
                                    <Clock size={14} className="text-(--sp-amber)" />
                                    <span>RECURRING: {bid.repeatFrequency}</span>
                                </>
                            ) : (
                                <span>ON-DEMAND</span>
                            )}
                        </div>
                        <span className="w-1 h-1 rounded-full bg-(--sp-border)" />
                        <div className="flex items-center gap-1.5 truncate">
                            <Calendar size={14} />
                            <span>Deadline: {new Date(bid.deadline).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 pr-4 border-l border-(--sp-border) pl-8">
                    <div className="text-center">
                        <p className="text-[18px] font-medium text-(--sp-text-0)">{bid.quoteCount}</p>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-(--sp-text-2)">Quotes Received</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[18px] font-medium text-(--sp-text-0)">{bid.itemCount}</p>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-(--sp-text-2)">Line Items</p>
                    </div>
                    
                    <IconTooltip label="View Evaluation Dashboard">
                        <button className="p-2.5 rounded-full bg-(--sp-bg-1) border border-(--sp-border) hover:border-(--sp-cyan-border) hover:text-(--sp-cyan) transition-all">
                            <ArrowRight size={18} />
                        </button>
                    </IconTooltip>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
