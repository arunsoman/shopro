"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
   ChevronLeft,
   ChevronRight,
   Search,
   Plus,
   Ticket,
   Tag,
   Calendar,
   Users,
   BarChart3,
   MoreVertical,
   ArrowRight,
   Gift,
   Zap,
   CheckCircle2,
   Clock,
   AlertCircle,
   Copy,
   Settings2,
   RefreshCw,
   Database,
   ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * OP-21 — Discount & Promotion Management
 * Purpose: Strategic incentive architecture and loyalty controls.
 */

interface Promotion {
   id: string;
   name: string;
   code?: string;
   type: string;
   value: string;
   target: string;
   status: string;
   usage: number;
   ends: string;
}

export default function DiscountManagement() {
   const [filter, setFilter] = useState("all");

   const { data: promos = [], isLoading } = useQuery<Promotion[]>({
      queryKey: ["operator-promotions"],
      queryFn: async () => {
         return [
            { id: "DSC-901", code: "COFFEE24", name: "Q1 Coffee Surplus Rebate", type: "Promo Code", value: "15%", target: "Beans & Grounds", status: "active", usage: 1240, ends: "12d remaining" },
            { id: "DSC-002", name: "First Order Fuel", type: "Automatic", value: "$50 Off", target: "New Merchants", status: "active", usage: 45, ends: "Ongoing" },
            { id: "DSC-113", code: "DAIRYFAST", name: "Express Fulfillment Discount", type: "B2B Special", value: "5%", target: "Milk & Cream", status: "scheduled", usage: 0, ends: "Starts Apr 1" },
            { id: "DSC-882", name: "High Volume Seasonal", type: "Bulk", value: "10%", target: "Franchise Group A", status: "expired", usage: 8900, ends: "Ended Mar 15" },
         ];
      }
   });

   const filteredPromos = promos.filter(p =>
      filter === "all" || p.status?.toLowerCase() === filter.toLowerCase()
   );

   return (
      <SecureOverlay>
         <div className="max-w-[1280px] mx-auto space-y-8 animate-in fade-in duration-1000 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-(--sp-border) pb-8">
               <div className="space-y-2">
                  <h1 className="text-[28px] font-medium tracking-tight text-(--sp-text-0)">
                     Promo <span className="text-violet-600 font-semibold">vault</span>
                  </h1>
                  <div className="flex items-center gap-3">
                     <Ticket className="w-5 h-5 text-violet-500" />
                     <p className="text-(--sp-text-3) text-[13px] font-medium">
                        Strategic incentive architecture and loyalty controls.
                     </p>
                  </div>
               </div>

               <div className="flex items-center gap-3">
                  <button className="h-9 px-4 bg-(--sp-bg-1) border border-(--sp-border) text-(--sp-text-1) rounded-md text-[11px] font-bold uppercase tracking-wider hover:bg-(--sp-bg-0) transition-all shadow-sm flex items-center gap-2">
                     <BarChart3 size={16} /> Yield report
                  </button>
                  <button className="h-9 px-4 bg-(--sp-cyan) text-white rounded-md text-[11px] font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-sm uppercase tracking-wider">
                     <Plus size={16} /> Forge campaign
                  </button>
               </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                  { label: "Active Promos", val: "12", change: "4 scheduled", icon: Gift, color: "text-rose-500" },
                  { label: "Total Redemptions", val: "42.1k", change: "+852 flux", icon: Users, color: "text-blue-500" },
                  { label: "Revenue Impact", val: "$124k", change: "within roi", icon: Zap, color: "text-amber-500" },
                  { label: "Avg Lift", val: "+24%", change: "stable", icon: BarChart3, color: "text-emerald-500" },
               ].map((stat, i) => (
                  <div key={i} className="bg-(--sp-bg-2) p-6 rounded-md border border-(--sp-border) shadow-sm hover:border-violet-500/30 transition-all">
                     <div className="flex justify-between items-start mb-6">
                        <div className="space-y-4">
                           <div className="text-[11px] font-bold uppercase tracking-wider text-(--sp-text-3)">{stat.label}</div>
                           <div className="text-[24px] font-semibold tracking-tight text-(--sp-text-0) tabular-nums leading-none">{stat.val}</div>
                           <div className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-(--sp-bg-1) text-(--sp-text-3) border border-(--sp-border) inline-block">
                              {stat.change}
                           </div>
                        </div>
                        <div className={cn("w-10 h-10 rounded-md flex items-center justify-center border shadow-sm bg-(--sp-bg-1)", stat.color)}>
                           <stat.icon size={20} />
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="flex bg-(--sp-bg-1) p-1 rounded-md border border-(--sp-border) shadow-sm overflow-x-auto no-scrollbar">
                  {["All", "Active", "Scheduled", "Draft", "Expired"].map(t => (
                     <button key={t} onClick={() => setFilter(t === "All" ? "all" : t.toLowerCase())} className={cn("px-4 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all", filter === (t === "All" ? "all" : t.toLowerCase()) ? "bg-white text-violet-600 shadow-sm" : "text-(--sp-text-3) hover:text-(--sp-text-1)")}>
                        {t}
                     </button>
                  ))}
               </div>
               <div className="relative group w-full md:max-w-xs">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--sp-text-3) group-focus-within:text-violet-500 transition-all" />
                  <input
                     type="text"
                     placeholder="Search campaigns..."
                     className="w-full pl-9 pr-4 h-9 bg-(--sp-bg-1) border border-(--sp-border) rounded-md text-[13px] outline-none focus:border-violet-500 transition-all text-(--sp-text-1) placeholder:text-(--sp-text-3)/50"
                  />
               </div>
            </div>

            {/* Promo Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                     <div key={i} className="h-64 rounded-md bg-(--sp-bg-2) border border-(--sp-border) animate-pulse shadow-sm" />
                  ))
               ) : filteredPromos.map(promo => (
                  <div key={promo.id} className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-sm overflow-hidden group hover:border-violet-500/30 transition-all flex flex-col">
                     <div className="p-6 space-y-6 flex-1">
                        <div className="flex justify-between items-start">
                           <div className={cn(
                              "w-10 h-10 rounded-md flex items-center justify-center border shadow-sm transition-all",
                              promo.status === 'active' ? "bg-violet-600 text-white border-violet-500" : "bg-(--sp-bg-1) text-(--sp-text-3) border-(--sp-border)"
                           )}>
                              <Ticket size={20} />
                           </div>
                           <div className="flex flex-col items-end gap-2">
                              <span className={cn(
                                 "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shadow-sm",
                                 promo.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : promo.status === 'scheduled' ? "bg-violet-50 text-violet-600 border-violet-100" : "bg-(--sp-bg-1) text-(--sp-text-3) border-(--sp-border)"
                              )}>
                                 {promo.status}
                              </span>
                              {promo.code && (
                                 <div className="flex items-center gap-1 px-2 py-0.5 bg-violet-50 text-violet-600 rounded border border-violet-200 text-[10px] font-bold cursor-pointer hover:bg-violet-100 transition-all">
                                    {promo.code} <Copy size={10} />
                                 </div>
                              )}
                           </div>
                        </div>

                        <div className="space-y-1">
                           <h3 className="text-[16px] font-semibold text-(--sp-text-1) uppercase tracking-tight">{promo.name}</h3>
                           <div className="flex items-center gap-2 text-[11px] font-medium text-(--sp-text-3)">
                              <Tag size={14} className="opacity-60" /> {promo.target}
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-4 bg-violet-600 text-white rounded-md border border-violet-500 shadow-sm">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">Value</div>
                              <div className="text-[20px] font-semibold leading-none">{promo.value}</div>
                           </div>
                           <div className="p-4 bg-(--sp-bg-1) rounded-md border border-(--sp-border) shadow-sm">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-(--sp-text-3) mb-1">Usage</div>
                              <div className="text-[20px] font-semibold text-(--sp-text-1) leading-none">{promo.usage === 0 ? '—' : promo.usage.toLocaleString()}</div>
                           </div>
                        </div>
                     </div>

                     <div className="p-4 bg-(--sp-bg-1)/50 border-t border-(--sp-border) flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[11px] font-medium text-(--sp-text-3)">
                           <Clock size={14} /> {promo.ends}
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                           <button className="h-8 w-8 rounded-md bg-(--sp-bg-2) text-(--sp-text-3) hover:text-violet-600 transition-all border border-(--sp-border) shadow-sm flex items-center justify-center">
                              <Settings2 size={16} />
                           </button>
                           <button className="h-8 px-4 bg-violet-600 text-white text-[11px] font-bold uppercase tracking-wider rounded-md hover:bg-violet-700 transition-all shadow-sm">
                              Audit
                           </button>
                        </div>
                     </div>
                  </div>
               ))}

               <div className="border border-dashed border-(--sp-border) rounded-md flex flex-col items-center justify-center p-8 text-center gap-4 hover:bg-(--sp-bg-1)/50 transition-all cursor-pointer group/add shadow-inner min-h-[250px]">
                  <div className="w-12 h-12 rounded-full bg-violet-500/10 text-violet-600 flex items-center justify-center border border-violet-500/20 group-hover/add:scale-110 transition-all">
                     <Plus size={24} />
                  </div>
                  <div className="space-y-1">
                     <div className="text-[16px] font-semibold text-(--sp-text-1) uppercase">Forge campaign</div>
                     <p className="text-[11px] text-(--sp-text-3) leading-relaxed">Incentivize bulk purchasing or merchant retention.</p>
                  </div>
               </div>
            </div>

            {/* Action Banner */}
            <div className="p-8 bg-slate-900 rounded-md text-white shadow-md relative overflow-hidden group flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b-4 border-emerald-500/20">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
               <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                  <div className="w-12 h-12 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                     <Zap size={24} />
                  </div>
                  <div className="space-y-1">
                     <h3 className="text-[18px] font-medium tracking-tight">Recommendation engine</h3>
                     <p className="text-white/40 text-[12px] max-w-xl font-medium">
                        AI suggests a 12% discount on <span className="text-emerald-400 underline decoration-emerald-400/30 underline-offset-4">Summer produce</span> to capture 45% more market share.
                     </p>
                  </div>
               </div>
               <div className="flex items-center gap-4 relative z-10">
                  <button className="h-9 px-6 bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider rounded-md border border-white/10 transition-all">Simulate ROI</button>
                  <button className="h-9 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold uppercase tracking-wider rounded-md shadow-sm transition-all">Apply</button>
               </div>
            </div>
         </div>
      </SecureOverlay>
   );
}
