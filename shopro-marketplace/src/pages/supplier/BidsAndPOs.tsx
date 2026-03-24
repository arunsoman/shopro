"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api";
import { 
  Bell, 
  Zap, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  ArrowRight,
  TrendingUp,
  FileText,
  ChevronRight,
  ZapOff,
  LayoutGrid
} from "lucide-react";
import { IconTooltip } from "@/components/shared/IconTooltip";
import { SecureOverlay } from "@/components/SecureOverlay";

interface Bid {
  id: string;
  title: string;
  category: string;
  status: string;
  deadline: string;
  isAuto: boolean;
}

interface Order {
  id: string;
  reference: string;
  restaurant: string;
  amount: number;
  status: string;
  isAuto: boolean;
  routingStrategy?: string;
}

export default function BidsAndPOs() {
  const queryClient = useQueryClient();

  // Queries
  const { data: bids = [] } = useQuery<Bid[]>({
    queryKey: ["supplier-bids-all"],
    queryFn: async () => {
      const resp = await api.get("/supplier/bids/all");
      return resp.data;
    }
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["supplier-orders-all"],
    queryFn: async () => {
      const resp = await api.get("/supplier/orders/all");
      // Map routingStrategy to isAuto for the UI
      return resp.data.map((o: any) => ({
        ...o,
        isAuto: o.isAuto || !!o.routingStrategy
      }));
    }
  });

  const { data: stats } = useQuery({
    queryKey: ["supplier-dashboard-stats"],
    queryFn: async () => {
      const resp = await api.get("/supplier/dashboard/stats");
      return resp.data;
    }
  });

  const needsAttentionBids = bids.filter(b => !b.isAuto && b.status === "OPEN");
  const needsAttentionOrders = orders.filter(o => !o.isAuto && o.status === "ACK_PENDING");
  const autoHandledBids = bids.filter(b => b.isAuto);
  const autoHandledOrders = orders.filter(o => o.isAuto);

  return (
    <SecureOverlay>
      <div className="flex flex-col lg:flex-row gap-8 pb-20 animate-in fade-in duration-700">
        {/* Main Content */}
        <div className="flex-1 space-y-12">
          {/* Header */}
          <header className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <Zap className="w-10 h-10 text-amber-500 fill-amber-500" />
              Bids & <span className="text-amber-500">Orders</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
               Monitor active bids, new opportunities, and automated orders.
            </p>
          </header>

          {/* Section: Action Required */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Pending Actions</h2>
              <span className="bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-500/20 uppercase tracking-wider">
                {needsAttentionBids.length + needsAttentionOrders.length} Required
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {needsAttentionBids.map(bid => (
                <div key={bid.id} className="relative overflow-hidden p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 group hover:border-amber-500 transition-all flex items-center justify-between">
                   <div className="flex items-center gap-6">
                      <IconTooltip label="Open Invitation">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 ring-4 ring-amber-500/5 group-hover:ring-amber-500/20 transition-all">
                           <FileText size={28} />
                        </div>
                      </IconTooltip>
                      <div>
                        <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider leading-none mb-1">New Opportunity</p>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{bid.title}</h3>
                        <p className="text-xs text-slate-400 mt-1  uppercase tracking-wide opacity-60">ID: {bid.id} &bull; Expiring in 14 hours</p>
                      </div>
                   </div>
                   <button className="h-12 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
                      Send Quote <ArrowRight size={16} />
                   </button>
                </div>
              ))}

              {needsAttentionOrders.map(order => (
                <div key={order.id} className="bg-white dark:bg-slate-900 border-l-8 border-amber-500 rounded-2xl p-6 shadow-sm border-y border-r border-slate-200 dark:border-slate-800 flex items-center justify-between group">
                   <div className="flex items-center gap-6">
                      <IconTooltip label="Order award pending">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                           <CheckCircle2 size={24} />
                        </div>
                      </IconTooltip>
                      <div>
                        <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider leading-none mb-1">Order Awaiting Receipt</p>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{order.reference} &bull; {order.restaurant}</h3>
                        <p className="text-xs text-slate-400 mt-1  uppercase tracking-wide opacity-60">Value: ₹{order.amount.toLocaleString()} &bull; Acceptance Required</p>
                      </div>
                   </div>
                   <button className="h-12 px-6 bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95">
                      Accept Order
                   </button>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Automating Results */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Automation History</h2>
            </div>

            <div className="bg-slate-50 dark:bg-black/20 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8">
               <div className="space-y-4">
                  {[...autoHandledBids, ...autoHandledOrders].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-4 border-b border-slate-200 dark:border-slate-800 last:border-0 opacity-80 hover:opacity-100 transition-opacity">
                       <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                             <Zap size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{(item as any).title || (item as any).reference}</p>
                            <p className="text-[10px] text-slate-500  uppercase">Auto-calculated quote of ₹{(item as any).amount || '45,200'} submitted 5m ago</p>
                          </div>
                       </div>
                       <StatusBadge status="ACCEPTED" label="COMPLETED" />
                    </div>
                  ))}
               </div>
            </div>
          </section>
        </div>

        {/* Sidebar: Stats & Diagram */}
        <div className="w-full lg:w-80 space-y-8">
           {/* Stats Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm space-y-8 h-fit">
               <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Activity Overview</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider opacity-60">System Status: Operational</p>
               </div>

              <div className="space-y-6">
                 {[
                   { label: "Quotes Sent", val: stats?.quotesSent ?? "0", icon: MessageSquare, color: "indigo" },
                   { label: "Ack's Sent", val: stats?.acksSent ?? "0", icon: CheckCircle2, color: "emerald" },
                   { label: "Manual Pending", val: (needsAttentionBids.length + needsAttentionOrders.length).toString(), icon: Clock, color: "amber" },
                 ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <IconTooltip label={stat.label}>
                            <stat.icon className={cn("w-4 h-4", stat.color === "indigo" ? "text-indigo-500" : stat.color === "emerald" ? "text-emerald-500" : "text-amber-500")} />
                          </IconTooltip>
                          <span className="text-xs font-bold text-slate-500">{stat.label}</span>
                       </div>
                       <span className="text-lg font-bold  text-slate-900 dark:text-white tabular-nums tracking-tighter">{stat.val}</span>
                    </div>
                 ))}
              </div>

              <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                 <div className="p-6 bg-slate-50 dark:bg-black/20 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <p className="text-[10px] font-bold  uppercase text-slate-400 tracking-widest text-center">Process Flow</p>
                    
                    {/* Visual Flow Diagram (CSS-based) */}
                    <div className="relative flex flex-col items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg relative z-10"><Bell size={24} /></div>
                       <div className="w-0.5 h-6 bg-slate-200 dark:bg-slate-800" />
                       <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg relative z-10"><Zap size={24} /></div>
                       <div className="w-0.5 h-6 bg-slate-200 dark:bg-slate-800" />
                       <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 flex items-center justify-center shadow-lg relative z-10"><CheckCircle2 size={24} /></div>
                       
                       <div className="absolute top-1/2 left-full ml-4 w-12 h-px bg-slate-200 dark:bg-slate-800" />
                       <div className="absolute top-1/2 left-full ml-16 text-[8px] font-medium text-slate-400 w-24">Encrypted audit log entry created.</div>
                    </div>
                 </div>
              </div>

              <button className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-xs font-bold  uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all">
                  Manage Automation
               </button>
            </div>

           {/* Market Pulse Link */}
           <div className="p-8 bg-indigo-600 rounded-[2rem] text-white space-y-4 shadow-lg group cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-all" />
              <TrendingUp className="w-8 h-8 relative z-10" />
              <div className="relative z-10">
                <h4 className="font-bold text-xl tracking-tight">Market Demand</h4>
                <p className="text-[10px] font-bold text-indigo-100 opacity-80 mt-1 uppercase tracking-wider">Current demand in your categories</p>
              </div>
           </div>
        </div>
      </div>
    </SecureOverlay>
  );
}

function StatusBadge({ status, label }: { status: string, label: string }) {
  return (
    <span className={cn(
      "text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider",
      status === "ACCEPTED" ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" : 
      "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
    )}>
      {label}
    </span>
  );
}
