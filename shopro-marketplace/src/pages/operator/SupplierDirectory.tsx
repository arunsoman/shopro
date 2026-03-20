"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Plus, Star, MapPin, Truck, ShieldCheck, MoreHorizontal, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

/**
 * OP-11 — Supplier Directory
 * Purpose: Global list of verified vendors.
 * DNA: Performance-weighted cards, category filters, quick-stats.
 */

const SUPPLIERS = [
  { id: "SUP-001", name: "Golden Harvest", category: "Produce", rating: 4.8, orders: 1245, sla: "99.2%", status: "ACTIVE", location: "Bangalore" },
  { id: "SUP-002", name: "Fresh Express", category: "Produce", rating: 4.2, orders: 850, sla: "94.5%", status: "ACTIVE", location: "Mumbai" },
  { id: "SUP-003", name: "Imperial Grains", category: "Grains", rating: 4.9, orders: 2100, sla: "98.8%", status: "ACTIVE", location: "Delhi" },
  { id: "SUP-004", name: "Supreme Spices", category: "Spices", rating: 4.5, orders: 320, sla: "96.0%", status: "ONBOARDING", location: "Chennai" },
  { id: "SUP-005", name: "Coastal Catch", category: "Seafood", rating: 3.8, orders: 150, sla: "88.2%", status: "ON_WATCH", location: "Goa" },
];

export default function SupplierDirectory() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [suppliers] = useState(SUPPLIERS);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(sup => {
      const matchesCategory = activeCategory === "All Categories" || sup.category === activeCategory;
      const matchesSearch = sup.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           sup.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [suppliers, activeCategory, searchQuery]);

  const getPerformanceTier = (sla: string, rating: number) => {
    const slaVal = parseFloat(sla);
    if (slaVal >= 98 && rating >= 4.5) return { label: "GOLD", color: "text-amber-500 bg-amber-500/10" };
    if (slaVal >= 95 && rating >= 4.0) return { label: "SILVER", color: "text-blue-500 bg-blue-500/10" };
    return { label: "BRONZE", color: "text-slate-500 bg-slate-500/10" };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Supplier Ecosystem</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Directory of {suppliers.length} verified fulfillment partners across India.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search Suppliers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-9 pr-4 bg-white dark:bg-slate-900 rounded-xl text-xs ring-1 ring-slate-200 dark:ring-slate-800 outline-none focus:ring-2 focus:ring-violet-500 transition-all w-64 shadow-sm"
            />
          </div>
          <button className="h-10 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black flex items-center gap-2 hover:scale-105 transition-all shadow-lg">
            <Plus size={14} /> NEW PARTNER
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {["All Categories", "Produce", "Dairy", "Grains", "Seafood", "Meat", "Spices", "Packaging"].map((cat) => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border",
              activeCategory === cat
                ? "bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-500/20" 
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-violet-500/50 hover:text-violet-500"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((sup, i) => {
          const tier = getPerformanceTier(sup.sla, sup.rating);
          return (
            <motion.div
              key={sup.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/operator/suppliers/${sup.id}`)}
              className="group bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2rem] p-6 ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/10 transition-all cursor-pointer relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 blur-[50px] group-hover:bg-violet-500/10 transition-all" />
              
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-violet-500 transition-colors shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
                  <Truck size={24} />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={sup.status as any} />
                  <span className={cn("px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase", tier.color)}>
                    {tier.label} TIER
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-violet-500 transition-colors">{sup.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                       <Star size={12} fill="currentColor" /> {sup.rating}
                     </span>
                     <span className="text-slate-300">•</span>
                     <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{sup.category}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 dark:border-slate-800">
                   <div>
                     <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Total Orders</p>
                     <p className="text-sm font-black text-slate-900 dark:text-white">{sup.orders.toLocaleString()}</p>
                   </div>
                   <div>
                     <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">SLA Score</p>
                     <p className={cn(
                       "text-sm font-black",
                       parseFloat(sup.sla) > 95 ? "text-green-500" : "text-amber-500"
                     )}>{sup.sla}</p>
                   </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                   <div className="flex items-center gap-2 text-slate-400">
                     <MapPin size={12} />
                     <span className="text-[10px] font-bold uppercase tracking-wider">{sup.location}</span>
                   </div>
                   <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-300 hover:text-slate-600 transition-all">
                     <MoreHorizontal size={18} />
                   </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Insight Section DNA */}
      <div className="bg-slate-900 dark:bg-white p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 text-white dark:text-slate-900">
         <div className="flex items-center gap-6">
           <div className="w-16 h-16 rounded-3xl bg-violet-500/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
             <BarChart3 size={32} />
           </div>
           <div className="space-y-1">
             <h3 className="text-xl font-bold">Smart Sourcing Insights</h3>
             <p className="text-slate-400 dark:text-slate-500 text-sm max-w-md">Our engine suggests migrating 12% of high-volume produce orders to Mumbai cluster for 4% margin gain.</p>
           </div>
         </div>
         <button className="h-12 px-8 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2">
           AUTO-ALLOCATE <ShieldCheck size={16} />
         </button>
      </div>
    </div>
  );
}
