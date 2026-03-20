"use client";

import { motion } from "framer-motion";
import { GlowingBorder } from "@/components/ui/neon-button";
import { Info, ArrowLeft, Star, Clock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * RD-02 — Supplier Bid Comparison
 * Purpose: Compare results of a bid invitation.
 * DNA: Comparison matrix, "Winner" glow, price delta indicators.
 */

const BIDS = [
  { 
    id: 1, 
    supplier: "Fresh Farms", 
    total: 1240.00, 
    delivery: "Next Day", 
    rating: 4.8, 
    itemsMatched: "12/12", 
    isWinner: true,
    DNA: "Fastest & Reliable"
  },
  { 
    id: 2, 
    supplier: "Global Foods", 
    total: 1180.00, 
    delivery: "2-3 Days", 
    rating: 4.2, 
    itemsMatched: "12/12", 
    isWinner: false,
    DNA: "Lowest Price"
  },
  { 
    id: 3, 
    supplier: "Eco Produce", 
    total: 1350.00, 
    delivery: "Next Day", 
    rating: 4.9, 
    itemsMatched: "11/12", 
    isWinner: false,
    DNA: "Organic Premium"
  },
];

export default function BidComparison() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Compare Bids: Fresh Produce Q4</h1>
          <p className="text-sm text-slate-500">3 Suppliers responded to your invitation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {BIDS.map((bid, i) => (
          <motion.div
            key={bid.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative"
          >
            {bid.isWinner && <GlowingBorder spread={50} />}
            <div className={cn(
              "relative z-10 h-full bg-white dark:bg-slate-900 rounded-3xl p-6 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm transition-all",
              bid.isWinner && "ring-blue-500/50 dark:ring-blue-500/30"
            )}>
              {bid.isWinner && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-lg shadow-blue-500/20">
                  Recommended
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{bid.supplier}</h3>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{bid.rating}</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Total Quote</span>
                  <span className="font-bold text-slate-900 dark:text-white">${bid.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Delivery</span>
                  <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <Clock size={14} />
                    {bid.delivery}
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Inventory Match</span>
                  <span className="font-bold text-blue-500">{bid.itemsMatched}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-2">Supplier DNA</p>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-green-500" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{bid.DNA}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button className={cn(
                  "w-full h-12 rounded-xl font-bold text-sm transition-all shadow-sm",
                  bid.isWinner 
                    ? "bg-blue-500 text-white hover:bg-blue-600 shadow-blue-500/20" 
                    : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90"
                )}>
                  Accept & Order
                </button>
                <button className="w-full h-12 rounded-xl text-slate-500 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  View Full Details
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Comparison Table Stub */}
      <div className="mt-12 overflow-hidden rounded-3xl ring-1 ring-slate-200 dark:ring-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold">Detailed Comparison</h2>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info size={14} />
            Prices exclude taxes and shipping logistics
          </div>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/50">
              <th className="p-4 text-xs font-bold uppercase text-slate-500">Product</th>
              {BIDS.map(b => <th key={b.id} className="p-4 text-xs font-bold uppercase text-center">{b.supplier}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <tr>
              <td className="p-4 text-sm font-medium">Avocado (Case)</td>
              <td className="p-4 text-sm text-center font-bold text-green-500">$42.00</td>
              <td className="p-4 text-sm text-center">$44.50</td>
              <td className="p-4 text-sm text-center">$48.00</td>
            </tr>
            <tr>
              <td className="p-4 text-sm font-medium">Milk 1L (x12)</td>
              <td className="p-4 text-sm text-center">$19.00</td>
              <td className="p-4 text-sm text-center font-bold text-green-500">$18.20</td>
              <td className="p-4 text-sm text-center">$21.00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
