"use client";

import { motion } from "framer-motion";
import { GlowingBorder } from "@/components/ui/neon-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Filter, Truck, ArrowRight, FileText, Download, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * OP-03-B — PO Outbox (Global)
 * Purpose: Consolidated queue for all outgoing supplier fulfillments.
 * DNA: Fulfillment-velocity Bento cards, supplier-coded table, glassmorphism.
 */

const FULFILLMENT_STATS = [
  { id: "SPO-9921", supplier: "Fresh Farms Ltd", items: 8, value: 23700, status: "DISPATCHED", eta: "2h remaining" },
  { id: "SPO-9925", supplier: "Dairy Dynamics", items: 12, value: 7800, status: "ACCEPTED", eta: "5h remaining" },
  { id: "SPO-9930", supplier: "Imperial Grains", items: 45, value: 89000, status: "RAISED", eta: "1d remaining" },
];

const ALL_SUB_POS = [
  { id: "SPO-9921", supplier: "Fresh Farms Ltd", parent: "PO-2024", items: 8, value: 23700, status: "DISPATCHED", delivery: "Today, 4PM", type: "BID" },
  { id: "SPO-9925", supplier: "Dairy Dynamics", parent: "PO-2024", items: 12, value: 7800, status: "ACCEPTED", delivery: "Tomorrow, 9AM", type: "DIRECT" },
  { id: "SPO-9930", supplier: "Imperial Grains", parent: "PO-2025", items: 45, value: 89000, status: "RAISED", delivery: "Mar 22", type: "DIRECT" },
  { id: "SPO-9918", supplier: "Ocean Grill", parent: "PO-2021", items: 8, value: 5400, status: "DELIVERED", delivery: "Yesterday", type: "BID" },
];

export default function POOutbox() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">PO Outbox</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Global fulfillment queue — monitoring outbound supplier performance.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search SPO ID or Supplier..." 
              className="h-10 pl-9 pr-4 bg-white dark:bg-slate-900 rounded-xl text-xs ring-1 ring-slate-200 dark:ring-slate-800 outline-none focus:ring-2 focus:ring-violet-500 transition-all w-64"
            />
          </div>
          <button className="h-10 px-4 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold ring-1 ring-slate-200 dark:ring-slate-800 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Filter size={14} />
            Filters
          </button>
        </div>
      </div>

      {/* Active Fulfillment Bento Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FULFILLMENT_STATS.map((spo, i) => (
          <motion.div
            key={spo.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="group relative cursor-pointer"
          >
            <GlowingBorder spread={50} />
            <div className="relative z-10 bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl p-6 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm group-hover:shadow-xl transition-all">
               <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-2 text-indigo-500">
                   <Truck size={16} />
                   <span className="text-[10px] font-bold uppercase tracking-wider">{spo.eta}</span>
                 </div>
                 <StatusBadge status={spo.status as any} />
               </div>
               
               <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{spo.supplier}</h3>
               <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter mb-4">{spo.id} • {spo.items} Items</p>
               
               <div className="flex items-end justify-between">
                 <div>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">SPO Value</p>
                   <p className="text-lg font-bold text-indigo-500">₹{spo.value.toLocaleString()}</p>
                 </div>
                 <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                   <ArrowRight size={18} />
                 </div>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Outbound Registry Table */}
      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold">Consolidated Outbox</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400">
              <Download size={18} />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">SPO Reference</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Supplier</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">ETA / Window</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Total (₹)</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {ALL_SUB_POS.map((row) => (
                <tr 
                  key={row.id} 
                  className="group hover:bg-white dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-indigo-500 transition-colors">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{row.id}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Parent: {row.parent} • via {row.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{row.supplier}</p>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={row.status as any} />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       <Truck size={14} className="text-slate-400" />
                       <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{row.delivery}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-mono font-bold text-slate-900 dark:text-white">₹{row.value.toLocaleString()}</p>
                  </td>
                  <td className="p-4 text-right">
                    <button className="h-8 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold hover:bg-indigo-500 hover:text-white transition-all">
                      TRACK
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
