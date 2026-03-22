"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Plus, Star, MapPin, Truck, ShieldCheck, MoreHorizontal, BarChart3, RefreshCw, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * OP-11 — Supplier Directory
 * Purpose: Global list of verified vendors.
 * DNA: Performance-weighted cards, category filters, quick-stats.
 */

interface Supplier {
  id: string;
  name: string;
  category: string;
  rating: number;
  status: string;
}

export default function SupplierDirectory() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: suppliers = [], isLoading } = useQuery<Supplier[]>({
    queryKey: ["operator-suppliers-directory"],
    queryFn: async () => {
      const resp = await api.get("/operator/relationships/suppliers");
      return resp.data;
    }
  });

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(sup => {
      const matchesCategory = activeCategory === "All Categories" || sup.category === activeCategory;
      const matchesSearch = sup.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           sup.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [suppliers, activeCategory, searchQuery]);

  return (
    <SecureOverlay>
    <div className="max-w-[1280px] mx-auto space-y-8 animate-in fade-in duration-1000 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-(--sp-border) pb-8">
        <div className="space-y-2">
          <h1 className="text-[28px] font-medium tracking-tight text-(--sp-text-0)">Supplier ecosystem</h1>
          <p className="text-(--sp-text-2) font-medium text-[13px]">
            Directory of {suppliers.length} verified fulfillment partners across Regional Hub Matrix.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-(--sp-text-3) group-focus-within:text-(--sp-cyan) transition-colors" />
            <input 
              type="text" 
              placeholder="Search partners..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-10 pr-4 bg-(--sp-bg-1) rounded-md text-[13px] border border-(--sp-border) outline-none focus:border-(--sp-cyan)/50 transition-all w-64 text-(--sp-text-1)"
            />
          </div>
          <button className="h-9 px-4 bg-(--sp-cyan) text-white rounded-md font-bold text-[11px] tracking-wider flex items-center gap-2 hover:opacity-90 transition-all shadow-sm uppercase">
            <Plus size={16} /> New partner
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {["All Categories", "Fruits & Veggies", "Seafood", "Meat", "Grains", "Dairy", "Packaging"].map((cat) => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "h-8 px-4 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border",
              activeCategory === cat
                ? "bg-(--sp-cyan) border-(--sp-cyan) text-white shadow-sm" 
                : "bg-(--sp-bg-1) border-(--sp-border) text-(--sp-text-3) hover:border-(--sp-cyan)/50 hover:text-(--sp-cyan)"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
            Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-64 bg-(--sp-bg-1) animate-pulse rounded-md border border-(--sp-border)" />
            ))
        ) : filteredSuppliers.map((sup, i) => (
          <motion.div
            key={sup.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(`/operator/suppliers/${sup.id}`)}
            className="group bg-(--sp-bg-2) rounded-md p-6 border border-(--sp-border) hover:border-(--sp-cyan)/30 hover:shadow-md transition-all duration-300 cursor-pointer relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-(--sp-cyan)/5 blur-3xl group-hover:bg-(--sp-cyan)/10 transition-all" />
            
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-md bg-(--sp-bg-1) flex items-center justify-center text-(--sp-text-3) group-hover:text-(--sp-cyan) transition-colors border border-(--sp-border)">
                <Truck size={24} />
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={sup.status as any} />
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  Gold tier
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-[18px] font-semibold text-(--sp-text-0) group-hover:text-(--sp-cyan) transition-colors tracking-tight">{sup.name}</h3>
                <div className="flex items-center gap-3">
                   <span className="flex items-center gap-1 text-[12px] font-bold text-amber-500">
                     <Star size={14} fill="currentColor" /> {sup.rating}
                   </span>
                   <span className="text-(--sp-border) opacity-40">•</span>
                   <span className="text-[12px] text-(--sp-text-3) font-medium">{sup.category} node</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-(--sp-border)">
                 <div className="space-y-1">
                   <p className="text-[10px] text-(--sp-text-3) font-bold uppercase tracking-wider">Total Nodes</p>
                   <p className="text-[16px] font-semibold text-(--sp-text-1) tabular-nums">1,245</p>
                 </div>
                 <div className="space-y-1">
                   <p className="text-[10px] text-(--sp-text-3) font-bold uppercase tracking-wider">SLA Score</p>
                   <p className="text-[16px] font-semibold text-emerald-500 tabular-nums">99.2%</p>
                 </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                 <div className="flex items-center gap-2 text-(--sp-text-3)">
                   <MapPin size={14} className="text-(--sp-cyan)" />
                   <span className="text-[12px] font-medium">Mumbai Cluster Alpha</span>
                 </div>
                 <button className="w-8 h-8 rounded-md bg-(--sp-bg-1) text-(--sp-text-3) hover:bg-(--sp-cyan) hover:text-white transition-all border border-(--sp-border) flex items-center justify-center group/btn">
                   <MoreHorizontal size={14} />
                 </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Insight Section */}
      <div className="bg-(--sp-cyan) rounded-md p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-lg relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
         <div className="flex items-center gap-6 relative z-10">
           <div className="w-16 h-16 rounded-md bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
             <BarChart3 size={32} className="text-white" />
           </div>
           <div className="space-y-2">
             <h3 className="text-[24px] font-medium text-white tracking-tight">Smart sourcing insights</h3>
             <p className="text-white/70 text-[14px] max-w-xl leading-relaxed">Our engine suggests migrating 12% of high-volume produce orders to Mumbai cluster alpha for 4% cumulative margin gain. Initiate protocol?</p>
           </div>
         </div>
         <button className="h-10 px-8 rounded-md bg-white text-(--sp-cyan) font-bold text-[12px] tracking-wider hover:opacity-90 transition-all shadow-sm flex items-center gap-2 relative z-10 uppercase">
            Auto-allocate <ShieldCheck size={18} className="text-emerald-500" />
         </button>
      </div>
    </div>
    </SecureOverlay>
  );
}
