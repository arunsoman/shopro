"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GlowingBorder } from "@/components/ui/neon-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Filter, Clock, ArrowRight, FileText, Download, ChevronDown, ChevronUp, Calendar, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { TooltipIconButton } from "@/components/ui/tooltip-icon-button";

/**
 * OP-03 — PO Inbox (Global)
 * Purpose: Central queue for all restaurant orders.
 * DNA: Urgency-based Bento cards, status-coded table, glassmorphism.
 */

const URGENT_POS = [
  { id: "PO-9921", restaurant: "Mama’s Italian", items: 24, value: 42500, deadline: "2h remaining", status: "RAISED" },
  { id: "PO-9925", restaurant: "Zen Sushi", items: 12, value: 18200, deadline: "4h remaining", status: "RAISED" },
  { id: "PO-9930", restaurant: "The Burger Lab", items: 45, value: 89000, deadline: "6h remaining", status: "CLARIFICATION_REQUESTED" },
];

const ALL_POS = [
  { id: "PO-9921", restaurant: "Mama’s Italian", items: 24, value: 42500, status: "RAISED", delivery: "2026-03-21", source: "MANUAL", raised: "10m ago" },
  { id: "PO-9925", restaurant: "Zen Sushi", items: 12, value: 18200, status: "RAISED", delivery: "2026-03-21", source: "AUTO", raised: "45m ago" },
  { id: "PO-9930", restaurant: "The Burger Lab", items: 45, value: 89000, status: "CLARIFICATION_REQUESTED", delivery: "2026-03-22", source: "MANUAL", raised: "2h ago" },
  { id: "PO-9918", restaurant: "Green Leaf", items: 8, value: 5400, status: "ACCEPTED", delivery: "2026-03-20", source: "AUTO", raised: "5h ago" },
  { id: "PO-9905", restaurant: "Ocean Grill", items: 33, value: 67000, status: "SPLITTING", delivery: "2026-03-23", source: "MANUAL", raised: "1d ago" },
];

export default function POInbox() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");

  const filteredPOs = useMemo(() => {
    return ALL_POS.filter(po => {
      const matchesSearch = po.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           po.restaurant.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || po.status === statusFilter;
      const matchesSource = sourceFilter === "ALL" || po.source === sourceFilter;
      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [searchQuery, statusFilter, sourceFilter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">PO Inbox</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Global procurement queue — prioritization via delivery urgency.
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search PO ID or Restaurant..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-9 pr-4 bg-white dark:bg-slate-900 rounded-xl text-xs ring-1 ring-slate-200 dark:ring-slate-800 outline-none focus:ring-2 focus:ring-violet-500 transition-all w-64"
              />
            </div>
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={cn(
                "h-10 px-4 rounded-xl text-xs font-bold ring-1 transition-all flex items-center gap-2",
                showAdvanced 
                  ? "bg-violet-500 text-white ring-violet-500 shadow-lg shadow-violet-500/20" 
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 ring-slate-200 dark:ring-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <Filter size={14} />
              Advanced Filters
              {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 p-2 bg-white dark:bg-slate-900 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-xl z-20 mt-2"
              >
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent text-[10px] font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="RAISED">Raised</option>
                    <option value="CLARIFICATION_REQUESTED">Clarification</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="SPLITTING">Splitting</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Source:</span>
                  <select 
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="bg-transparent text-[10px] font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Sources</option>
                    <option value="MANUAL">Manual</option>
                    <option value="AUTO">Auto-PO</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Urgent Bento Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {URGENT_POS.map((po, i) => (
          <motion.div
            key={po.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="group relative cursor-pointer"
            onClick={() => navigate(`/operator/po/${po.id}`)}
          >
            <GlowingBorder spread={50} />
            <div className="relative z-10 bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl p-6 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all">
               <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-2 text-rose-500 animate-pulse">
                   <Clock size={16} />
                   <span className="text-[10px] font-bold uppercase tracking-wider">{po.deadline}</span>
                 </div>
                 <StatusBadge status={po.status as any} />
               </div>
               
               <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{po.restaurant}</h3>
               <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter mb-4">{po.id} • {po.items} Items</p>
               
               <div className="flex items-end justify-between">
                 <div>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Value</p>
                   <p className="text-lg font-bold text-violet-500">₹{po.value.toLocaleString()}</p>
                 </div>
                 <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 group-hover:translate-x-1 transition-transform">
                   <ArrowRight size={18} />
                 </div>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold">Consolidated Queue</h2>
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
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Order Information</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Merchant</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Fulfillment</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Total (₹)</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    No purchase orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredPOs.map((row) => (
                  <tr 
                    key={row.id} 
                    className="group hover:bg-white dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/operator/po/${row.id}`)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-violet-500 transition-colors">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{row.id}</p>
                          <p className="text-[10px] text-slate-400 font-medium tracking-tight">Raised {row.raised} via {row.source}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{row.restaurant}</p>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={row.status as any} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                         <Clock size={14} className="text-slate-400" />
                         <span className="text-xs text-slate-600 dark:text-slate-300 tabular-nums">{row.delivery}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-mono font-bold text-slate-900 dark:text-white tabular-nums">₹{row.value.toLocaleString()}</p>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <TooltipIconButton tooltip={`${row.restaurant} · Due ${row.delivery}`} side="left">
                          <Info size={14} />
                        </TooltipIconButton>
                        <button className="h-8 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold hover:bg-violet-500 hover:text-white transition-all">
                          PROCESS
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
