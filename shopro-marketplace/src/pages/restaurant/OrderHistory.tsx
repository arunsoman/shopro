"use client";

import { GlowingBorder } from "@/components/ui/neon-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Filter, FileText, Truck, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";

/**
 * RD-03 — Order History & Tracking
 * Purpose: Track all POs and their fulfillment status.
 * DNA: Status-colored milestones, searchable table, active tracking.
 */

const ORDERS = [
  { id: "PO-9921", date: "2026-03-19", supplier: "Fresh Farms", items: 12, total: 1240.00, status: "captured", tracking: "In Transit" },
  { id: "PO-9902", date: "2026-03-18", supplier: "Dairy Gold", items: 5, total: 340.50, status: "ready", tracking: "Delivered" },
  { id: "PO-9885", date: "2026-03-15", supplier: "Meat Masters", items: 3, total: 850.00, status: "disbursed", tracking: "Paid" },
  { id: "PO-9870", date: "2026-03-12", supplier: "Global Foods", items: 20, total: 2100.00, status: "ready", tracking: "Delivered" },
  { id: "PO-9855", date: "2026-03-10", supplier: "EcoPack", items: 1, total: 55.00, status: "ready", tracking: "Delivered" },
];

export default function OrderHistory() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Order History</h1>
          <p className="text-sm text-slate-500">Track and manage your marketplace procurement</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search PO #..." 
              className="h-10 pl-9 pr-4 bg-white dark:bg-slate-900 rounded-xl text-xs ring-1 ring-slate-200 dark:ring-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all w-48"
            />
          </div>
          <button className="h-10 px-4 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold ring-1 ring-slate-200 dark:ring-slate-800 flex items-center gap-2 hover:bg-slate-50 transition-colors">
            <Filter size={14} />
            Filters
          </button>
        </div>
      </div>

      {/* Active Tracking Bar DNA */}
      <div className="relative group overflow-hidden rounded-3xl">
        <GlowingBorder spread={60} />
        <div className="relative z-10 bg-blue-600 dark:bg-blue-600/20 p-6 flex flex-col md:flex-row items-center justify-between gap-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
              <Truck size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider opacity-80">Active Shipment</p>
              <p className="text-lg font-bold">PO-9921 — Arriving between 10 AM - 12 PM</p>
            </div>
          </div>
          <button className="px-6 py-2.5 bg-white text-blue-600 rounded-full font-bold text-sm shadow-xl shadow-blue-900/20 hover:scale-105 transition-transform active:scale-95">
            Track Live
          </button>
        </div>
      </div>

      {/* Order Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <th className="p-4 text-xs font-bold uppercase text-slate-500">Order Details</th>
              <th className="p-4 text-xs font-bold uppercase text-slate-500">Supplier</th>
              <th className="p-4 text-xs font-bold uppercase text-slate-500">Status</th>
              <th className="p-4 text-xs font-bold uppercase text-slate-500">Total</th>
              <th className="p-4 text-xs font-bold uppercase text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {ORDERS.map((order) => (
              <tr key={order.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{order.id}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{order.date} • {order.items} Items</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                  {order.supplier}
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <StatusBadge status={order.status as any} />
                    <span className="text-[10px] text-slate-400 ml-1 flex items-center gap-1">
                      {order.tracking === "Delivered" ? <CheckCircle2 size={10} className="text-green-500" /> : <AlertCircle size={10} className="text-amber-500" />}
                      {order.tracking}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-sm font-bold text-slate-900 dark:text-white">
                  ${order.total.toFixed(2)}
                </td>
                <td className="p-4 text-right">
                  <button className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-400 hover:text-blue-500">
                    <ExternalLink size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="p-4 bg-slate-50/30 dark:bg-slate-800/30 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">Showing 5 of 128 orders</p>
          <div className="flex items-center gap-2">
            <button className="p-1 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-50" disabled>Prev</button>
            <button className="p-1 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-white dark:hover:bg-slate-800 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
