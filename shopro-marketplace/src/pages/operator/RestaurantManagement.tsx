"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Building2, ShieldCheck, AlertCircle, ArrowUpRight, TrendingUp, MapPin, Clock, CheckCircle2, RefreshCw, AlertTriangle, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { OnboardingWidget } from "./components/OnboardingWidget";

/**
 * OP-15 — Restaurant Management
 * Purpose: Global directory and ecosystem nodal control for merchant fleet.
 */

interface Restaurant {
  id: string;
  name: string;
  category: string;
  volume: number;
  status: string;
  trustScore: number;
  city: string;
  membersCount: number;
  imageUrl: string;
}

export default function RestaurantManagement() {
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: restaurants = [], isLoading } = useQuery<Restaurant[]>({
    queryKey: ["operator-restaurants-management"],
    queryFn: async () => {
      const resp = await api.get("/operator/restaurants");
      return resp.data;
    }
  });

  const filteredRestaurants = restaurants.filter(res => {
      if (filter === 'all') return true;
      return res.status?.toLowerCase() === filter.toLowerCase();
  });

  const aggregateVolume = restaurants.reduce((sum, r) => sum + r.volume, 0);

  return (
    <SecureOverlay>
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-(--sp-border)">
        <div className="space-y-1">
          <h1 className="text-[28px] font-medium tracking-[-0.02em] text-(--sp-text-0)">Merchant fleet</h1>
          <p className="text-[13px] text-(--sp-text-2) flex items-center gap-2">
             <Building2 className="w-4 h-4 text-(--sp-cyan)" />
             Global directory and ecosystem nodal control.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] text-[13px] font-medium bg-(--sp-bg-2) text-(--sp-text-1) border border-(--sp-border) hover:border-(--sp-border-hover) hover:bg-(--sp-bg-3) transition-all duration-150 shadow-sm active:scale-[0.97]">
              <Search className="w-4 h-4" />
              Advanced probe
           </button>
           <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] text-[13px] font-medium bg-(--sp-cyan) text-(--sp-bg-0) border border-(--sp-cyan) hover:opacity-90 active:scale-[0.97] transition-all duration-150 shadow-sm">
              <Plus size={18} /> Register hub
           </button>
        </div>
      </header>

      {/* Fleet Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
         {[
           { label: "Total merchants", val: String(restaurants.length), change: "+12 nodes", icon: Building2, color: "text-(--sp-cyan)" },
           { label: "Active nodes", val: String(restaurants.filter(r => r.status === 'VERIFIED').length), change: "Systems optimal", icon: CheckCircle2, color: "text-(--sp-teal)" },
           { label: "Aggregate GMV", val: `₹${(aggregateVolume / 1000).toFixed(1)}K`, change: "+8.4K volume", icon: TrendingUp, color: "text-(--sp-cyan)" },
           { label: "KYC pending", val: String(restaurants.filter(r => r.status === 'PENDING').length), change: "Urgent audit", icon: AlertCircle, color: "text-(--sp-coral)" },
         ].map((stat, i) => (
           <div key={i} className="bg-(--sp-bg-2) border border-(--sp-border) rounded-[10px] p-5 relative overflow-hidden hover:border-(--sp-border-hover) hover:bg-(--sp-bg-3) transition-colors duration-150 shadow-sm group">
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-current opacity-70 transition-colors" style={{ color: `var(--sp-${stat.color.includes('cyan') ? 'cyan' : stat.color.includes('teal') ? 'teal' : 'coral'})` }} />
              <div className="flex flex-col">
                 <div className="text-[11px] font-bold tracking-wider text-(--sp-text-3) mb-2.5">{stat.label}</div>
                 <div className="text-[32px] font-light tracking-[-0.03em] text-(--sp-text-0) tabular-nums leading-none mb-1.5">{stat.val}</div>
                 <div className={cn("text-[11px] font-[family-name:var(--font-geist-mono)]", stat.color.replace('text-', 'text-'))}>{stat.change}</div>
              </div>
           </div>
         ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
         <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {["All", "Verified", "Pending", "Suspended"].map(t => (
              <button
                key={t}
                onClick={() => setFilter(t.toLowerCase())}
                className={cn(
                  "px-4 py-2 rounded-[6px] text-[12px] font-medium transition-all shadow-sm border",
                  filter === t.toLowerCase()
                    ? "bg-(--sp-cyan-dim) text-(--sp-cyan) border-(--sp-cyan-border)"
                    : "bg-(--sp-bg-2) text-(--sp-text-1) border-(--sp-border) hover:text-(--sp-text-0)"
                )}
              >
                 {t}
              </button>
            ))}
         </div>
         <div className="relative group w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--sp-text-2) group-focus-within:text-(--sp-cyan) transition-colors" />
            <input
              type="text"
              placeholder="Search hub..."
              className="w-full pl-10 pr-4 h-10 bg-(--sp-bg-1) border border-(--sp-border) rounded-[6px] text-[13px] text-(--sp-text-0) placeholder:text-(--sp-text-2) focus:border-(--sp-cyan-border) outline-none transition-all shadow-sm"
            />
         </div>
      </div>
      
      {/* Merchant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
         {isLoading ? (
             <div className="col-span-full py-40 flex flex-col items-center justify-center space-y-4 opacity-40">
                 <RefreshCw className="w-10 h-10 text-(--sp-cyan) animate-spin" />
                 <p className="text-(--sp-text-2) tracking-[0.06em] text-[11px] font-medium uppercase">Syncing with registry...</p>
             </div>
         ) : (
           <>
             {filteredRestaurants.map(res => (
                <OnboardingWidget key={res.id} restaurant={res} />
             ))}
             {/* Add New Hub Action */}
             <OnboardingWidget />
           </>
         )}
      </div>

      {/* Global Activity Snap */}
      <div className="bg-(--sp-cyan-dim) border border-(--sp-cyan-border) rounded-[10px] px-8 py-10 flex items-center gap-6 shadow-sm overflow-hidden relative group">
         <div className="absolute top-[-50%] right-[-10%] w-[400px] h-[400px] bg-(--sp-cyan) opacity-5 rounded-full blur-[80px] pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
         <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-8 relative z-10">
            <div className="flex items-start gap-4">
               <div className="w-12 h-12 rounded-[10px] bg-(--sp-cyan-dim) flex items-center justify-center text-(--sp-cyan) border border-(--sp-cyan-border) shadow-inner flex-shrink-0">
                  <Clock size={24} />
               </div>
               <div className="space-y-1">
                  <h3 className="text-[15px] font-medium text-(--sp-cyan)">Merchant momentum pulse: anomaly detection</h3>
                  <p className="text-[12px] text-(--sp-text-2) max-w-2xl leading-relaxed">
                     Anomalous ordering patterns detected. Operational node suspended automatically for fraud sequence verification.
                  </p>
               </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
               <button className="px-4 py-2 rounded-[6px] text-[11px] font-medium uppercase tracking-[0.06em] text-(--sp-text-2) hover:text-(--sp-text-1) transition-colors">Dismiss</button>
               <button className="px-4 py-2 rounded-[6px] bg-(--sp-cyan) text-(--sp-bg-0) text-[11px] font-medium uppercase tracking-[0.06em] shadow-md hover:opacity-90 active:scale-95 transition-all">Investigate hub</button>
            </div>
         </div>
      </div>
    </div>
    </SecureOverlay>
  );
}
