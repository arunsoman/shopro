"use client";

import { motion } from "framer-motion";
import { GlowingBorder } from "@/components/ui/neon-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus, ShoppingCart } from "lucide-react";
import { Activity, CreditCard, ShoppingBag, Zap, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * RD-00 — Restaurant Dashboard
 * Purpose: High-impact landing page for the restaurant buyer.
 * DNA: Glowing stats, activity dots, quick action tiles.
 */

const STATS = [
  { label: "Active POs", value: "12", change: "+2", trend: "up", icon: ShoppingBag, color: "blue" },
  { label: "Fulfilled (MTD)", value: "48", change: "+8", trend: "up", icon: Activity, color: "green" },
  { label: "Inventory Alerts", value: "3", change: "Critical", trend: "down", icon: Zap, color: "amber" },
  { label: "Auto-PO Rules", value: "5", change: "Active", trend: "up", icon: Activity, color: "violet" },
];

const RECENT_ACTIVITY = [
  { id: 1, type: "Order Placed", title: "PO-9921 Fresh Produce", time: "2h ago", status: "captured" },
  { id: 2, type: "Invoice Received", title: "INV-8820 from FreshFarm", time: "5h ago", status: "ready" },
  { id: 3, type: "Delivery Scheduled", title: "Dairy Order from GoldMilk", time: "1d ago", status: "pending" },
];

export default function RestaurantDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, <span className="text-blue-600">John Doe</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Your kitchen inventory is 92% stocked. 3 items need urgent restocking.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="h-11 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all">
            Create Order
          </button>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative"
          >
            <GlowingBorder spread={40} />
            <div className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl p-6 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm hover:shadow-xl transition-all h-32 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <div className={cn(
                  "p-2 rounded-xl",
                  stat.color === "blue" ? "bg-blue-50 text-blue-500" :
                  stat.color === "amber" ? "bg-amber-50 text-amber-500" :
                  stat.color === "violet" ? "bg-violet-50 text-violet-500" :
                  "bg-green-50 text-green-500"
                )}>
                  <stat.icon size={18} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</span>
                <div className="flex items-center gap-1">
                  {stat.trend === "up" ? <ArrowUpRight size={14} className="text-green-500" /> : <ArrowDownRight size={14} className="text-red-500" />}
                  <span className={cn("text-xs font-bold", stat.trend === "up" ? "text-green-500" : "text-red-500")}>{stat.change}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold px-2">Recent Activity</h2>
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl ring-1 ring-slate-200 dark:ring-slate-800 p-6 space-y-6 shadow-sm">
            {RECENT_ACTIVITY.map((item) => (
              <div key={item.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <Activity size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.type} • {item.time}</p>
                  </div>
                </div>
                <StatusBadge status={item.status as any} />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions / Shortcuts */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold px-2">Procurement Shortcuts</h2>
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => window.location.href = '/restaurant/orders/new'}
              className="group relative h-24 overflow-hidden rounded-3xl"
            >
              <div className="absolute inset-0 bg-blue-500 translate-y-24 group-hover:translate-y-0 transition-transform duration-500" />
              <div className="relative z-10 h-full p-6 ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900 flex items-center gap-4 group-hover:bg-transparent transition-colors">
                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-white/20 group-hover:text-white">
                   <Plus size={24} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold group-hover:text-white">New Purchase Order</p>
                  <p className="text-[10px] font-medium text-slate-500 group-hover:text-white/70 uppercase">Direct Fulfillment</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => window.location.href = '/restaurant/orders'}
              className="group relative h-24 overflow-hidden rounded-3xl"
            >
              <div className="absolute inset-0 bg-violet-500 translate-y-24 group-hover:translate-y-0 transition-transform duration-500" />
              <div className="relative z-10 h-full p-6 ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900 flex items-center gap-4 group-hover:bg-transparent transition-colors">
                <div className="p-3 rounded-2xl bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 group-hover:bg-white/20 group-hover:text-white">
                  <ShoppingBag size={24} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold group-hover:text-white">Order History</p>
                  <p className="text-[10px] font-medium text-slate-500 group-hover:text-white/70 uppercase">Track Deliveries</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
