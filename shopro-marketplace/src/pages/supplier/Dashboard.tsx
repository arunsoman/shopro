"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Package, 
  FileCheck, 
  CircleDollarSign, 
  Calendar, 
  MessageSquare, 
  ArrowUpRight, 
  ChevronRight,
  Search,
  Filter,
  MoreVertical,
  Bell,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { VerificationBanner } from "@/components/supplier/VerificationBanner";
import type { VerificationStatus } from "@/components/supplier/VerificationBanner";
import { SupplierKPICards } from "@/components/supplier/SupplierKPICards";
import type { SupplierKPI } from "@/components/supplier/SupplierKPICards";
import { StatusBadge } from "@/components/ui/status-badge";
import { GlowingBorder } from "@/components/ui/neon-button";

/**
 * SD-00 — Supplier Dashboard
 * Purpose: Supplier performance and order overview.
 * DNA: Green accent, growth charts, active bid tiles.
 */

const PERFORMANCE_DATA: SupplierKPI[] = [
  { label: "Revenue (MTD)", value: "$142,500", growth: "8.2%", icon: CircleDollarSign, color: "green", targetRoute: "/supplier/finance" },
  { label: "Active Orders", value: "28", growth: "12%", icon: Package, color: "blue", targetRoute: "/supplier/orders" },
  { label: "Open Bids", value: "12", growth: "4 Closing", icon: FileCheck, color: "violet", targetRoute: "/supplier/bids" },
  { label: "Fulfillment Rate", value: "99.4%", growth: "0.2%", icon: TrendingUp, color: "orange" },
];

const ACTIVE_BIDS = [
  { id: 1, title: "Fresh Produce Q4 - Shopro Marketplace", buyer: "Shopro Marketplace", totalItems: 12, deadline: "2h 15m", status: "high_priority" },
  { id: 2, title: "Organic Dairy Supply - Shopro Marketplace", buyer: "Shopro Marketplace", totalItems: 8, deadline: "Tomorrow", status: "active" },
  { id: 3, title: "Premium Seafood Weekly - Shopro Marketplace", buyer: "Shopro Marketplace", totalItems: 5, deadline: "3 days", status: "active" },
];

export default function SupplierDashboard() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerificationStatus>("PENDING");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    // Simulate a status change after 5 seconds for demo
    const timer = setTimeout(() => {
      // setStatus("VERIFIED"); 
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Search & Alerts Header */}
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search orders, bids, or SKU..."
            className="w-full h-10 pl-10 pr-4 bg-slate-100 dark:bg-slate-900/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 bg-white dark:bg-slate-900 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-green-500/50 transition-all">
            <Bell size={18} className="text-slate-600 dark:text-slate-400" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
          </button>
          <button className="p-2 bg-white dark:bg-slate-900 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800">
            <Filter size={18} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* Verification Status */}
      <VerificationBanner 
        status={status} 
        rejectedDocs={["GST Certificate", "PAN Card"]}
        onRefresh={() => setStatus("PENDING")}
      />

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Welcome, <span className="text-green-600">Global Foods</span>
          </motion.h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-2">
            Region: North America Operations
            <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            ID: SP-772910
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="h-11 px-6 bg-white dark:bg-slate-900 rounded-2xl text-sm font-bold ring-1 ring-slate-200 dark:ring-slate-800 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all shadow-sm">
            <Calendar size={16} />
            Pickups
          </button>
          <button className="h-11 px-6 bg-green-600 text-white rounded-2xl font-bold text-sm hover:bg-green-700 transition-all shadow-lg shadow-green-500/20 flex items-center gap-2">
             <TrendingUp size={16} />
             Reports
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <SupplierKPICards cards={PERFORMANCE_DATA} onCardClick={(route) => route && navigate(route)} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Bids Tiles (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Active Bid Invitations
              <span className="text-xs font-medium px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 rounded-full">
                3 New
              </span>
            </h2>
            <button className="text-sm font-bold text-green-600 hover:text-green-500 transition-colors uppercase tracking-wider">View All</button>
          </div>
          
          <div className="space-y-4">
            {ACTIVE_BIDS.map((bid, i) => (
              <motion.div 
                key={bid.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="group relative overflow-hidden rounded-3xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/0 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white dark:bg-slate-950 p-6 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm flex items-center justify-between gap-6 transition-all group-hover:ring-green-500/30 group-hover:shadow-md">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{bid.title}</h3>
                      {bid.status === "high_priority" && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 text-[10px] font-bold rounded-lg animate-pulse">
                          CLOSING SOON
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-1">
                      <span className="text-xs text-slate-500 font-medium">Buyer: <span className="text-slate-700 dark:text-slate-300">{bid.buyer}</span></span>
                      <span className="text-xs text-slate-500 font-medium">Items: <span className="text-slate-700 dark:text-slate-300">{bid.totalItems} Required</span></span>
                      <span className={cn(
                        "text-xs font-bold flex items-center gap-1.5",
                        bid.status === "high_priority" ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"
                      )}>
                        <Clock size={12} /> Ends {bid.deadline}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button className="px-5 py-2.5 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-800 transition-all">
                      Details
                    </button>
                    <button className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold text-xs ring-1 ring-green-500/20 hover:scale-105 hover:bg-green-700 active:scale-95 transition-all shadow-lg shadow-green-500/10">
                      Submit Bid
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Fulfillment Feed (1/3 width) */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white px-2">Pending Fulfillment</h2>
          <div className="relative overflow-hidden bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl rounded-[2.5rem] ring-1 ring-slate-200 dark:ring-slate-800 p-8 shadow-sm">
            <div className="space-y-8">
              {[
                { id: "PO-9921", time: "10:00 AM", dest: "Shopro Fulfillment (North)", progress: 65, status: "captured" },
                { id: "PO-9924", time: "02:30 PM", dest: "Shopro Fulfillment (Central)", progress: 30, status: "raised" },
                { id: "PO-9928", time: "Tomorrow", dest: "Shopro Fulfillment (Main)", progress: 0, status: "pending" },
              ].map((order, i) => (
                <div key={order.id} className="flex items-start gap-5 group cursor-pointer">
                  <div className="relative mt-1">
                    <div className="w-1.5 h-12 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${order.progress}%` }}
                        transition={{ delay: 0.6 + (i * 0.1), duration: 1 }}
                        className="w-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]" 
                      />
                    </div>
                    {order.progress === 100 && (
                      <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-950" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                       <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-green-600 transition-colors">
                         {order.id} — <span className="text-slate-400 group-hover:text-green-500/50 transition-colors">{order.time}</span>
                       </p>
                       <StatusBadge status={order.status as any} />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">Dest: {order.dest}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-green-500 transition-colors self-center" />
                </div>
              ))}
            </div>

            <button className="w-full mt-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 hover:text-green-600 hover:border-green-500/30 transition-all uppercase tracking-widest">
              Manage Logistics
            </button>

            {/* Identity Isolation Branding */}
            <div className="mt-8 p-5 bg-gradient-to-br from-green-600 to-green-800 rounded-3xl text-white shadow-xl shadow-green-900/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                 <FileCheck size={80} />
               </div>
               <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-80">Identity Isolation Active</p>
                 <p className="text-xs font-medium leading-relaxed opacity-90">
                   You are operating as a <span className="font-bold underline decoration-green-400">Verified Partner</span>. All client endpoints are generalized to Shopro for privacy and security.
                 </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
