"use client";

import { motion } from "framer-motion";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Filter, Plus, MoreHorizontal, CreditCard, User, MapPin, ExternalLink, Download, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * OP-02 — Restaurant Management
 * Purpose: Directory of merchants, credit limits, and performance.
 * DNA: High-density data grid, status tags, floating management actions.
 */

const RESTAURANTS = [
  { id: "RES-001", name: "Mama’s Italian Bistro", city: "Bangalore", status: "APPROVED", creditLimit: 500000, outstanding: 42500, manager: "Arun S.", joined: "Mar 2024" },
  { id: "RES-002", name: "Zen Sushi", city: "Mumbai", status: "APPROVED", creditLimit: 250000, outstanding: 12000, manager: "Priya K.", joined: "Feb 2024" },
  { id: "RES-003", name: "The Burger Lab", city: "Delhi", status: "PENDING", creditLimit: 0, outstanding: 0, manager: "Unassigned", joined: "Today" },
  { id: "RES-004", name: "Green Leaf", city: "Bangalore", status: "SUSPENDED", creditLimit: 100000, outstanding: 15400, manager: "Arun S.", joined: "Jan 2024" },
  { id: "RES-005", name: "Ocean Grill", city: "Goa", status: "APPROVED", creditLimit: 300000, outstanding: 89000, manager: "Sanjay M.", joined: "Dec 2023" },
];

export default function RestaurantMgt() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Restaurant Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Managing {RESTAURANTS.length} active merchants and their credit utilization.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 focus-within:text-violet-500" />
            <input 
              type="text" 
              placeholder="Search Business Name..." 
              className="h-10 pl-9 pr-4 bg-white dark:bg-slate-900 rounded-xl text-xs ring-1 ring-slate-200 dark:ring-slate-800 outline-none focus:ring-2 focus:ring-violet-500 transition-all w-64 shadow-sm"
            />
          </div>
          <button className="h-10 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black flex items-center gap-2 hover:scale-105 transition-all shadow-lg">
            <Plus size={14} /> ADD RESTAURANT
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Exposure", value: "₹1.4 Cr", sub: "92% within limits", color: "blue" },
          { label: "Pending Approvals", value: "3", sub: "Avg: 4.2 hours", color: "amber" },
          { label: "Default Risk", value: "0.2%", sub: "-0.4% this month", color: "green" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl ring-1 ring-slate-100 dark:ring-slate-800">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{stat.label}</p>
            <div className="flex items-baseline gap-2 mt-1">
               <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
               <p className="text-[10px] text-slate-400 font-bold">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table View */}
      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
           <div className="flex items-center gap-6">
             <button className="text-sm font-bold text-violet-500 border-b-2 border-violet-500 pb-1">All Merchants</button>
             <button className="text-sm font-bold text-slate-400 hover:text-slate-600 pb-1 transition-colors">By Manager</button>
             <button className="text-sm font-bold text-slate-400 hover:text-slate-600 pb-1 transition-colors">Risk Flagged</button>
           </div>
           <div className="flex items-center gap-2">
             <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
               <Filter size={18} />
             </button>
             <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
               <Download size={18} />
             </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                <th className="p-6">Business Entity</th>
                <th className="p-6">Region</th>
                <th className="p-6">Status</th>
                <th className="p-6">Credit Utilization</th>
                <th className="p-6">Account Owner</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {RESTAURANTS.map((res) => (
                <tr key={res.id} className="group hover:bg-white dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-violet-500 transition-colors shadow-sm">
                        <ArrowUpRight size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{res.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {res.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <MapPin size={14} className="text-slate-400" />
                      <span className="text-xs font-medium">{res.city}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <StatusBadge status={res.status as any} />
                  </td>
                  <td className="p-6">
                    <div className="space-y-1.5 w-32">
                       <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter">
                         <span className="text-slate-400">Used: ₹{res.outstanding.toLocaleString()}</span>
                         <span className="text-slate-900 dark:text-white">Limit: ₹{res.creditLimit.toLocaleString()}</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: res.creditLimit > 0 ? `${(res.outstanding / res.creditLimit) * 100}%` : "0%" }}
                            className={cn(
                              "h-full",
                              (res.outstanding / res.creditLimit) > 0.8 ? "bg-rose-500" : "bg-violet-500"
                            )}
                          />
                       </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                       <User size={14} className="text-slate-400" />
                       <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{res.manager}</span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="h-8 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold hover:bg-violet-500 hover:text-white transition-all shadow-sm">
                        VIEW FILE
                      </button>
                      <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Support Alert DNA */}
      <div className="p-8 rounded-[2.5rem] bg-violet-600 dark:bg-violet-700 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-violet-500/20">
         <div className="flex items-center gap-6">
           <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
             <CreditCard size={32} />
           </div>
           <div className="space-y-1">
             <h3 className="text-xl font-bold">Credit Limit Bulk Review</h3>
             <p className="text-white/60 text-sm max-w-md">Upcoming quarterly review for 12 merchants in the Bangalore cluster. Estimated exposure increase: ₹25 Lakhs.</p>
           </div>
         </div>
         <button className="h-12 px-8 rounded-2xl bg-white text-violet-600 font-black text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2">
           BEGIN REVIEW <ExternalLink size={16} />
         </button>
      </div>
    </div>
  );
}
