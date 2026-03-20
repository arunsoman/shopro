"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlowingBorder } from "@/components/ui/neon-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ArrowLeft, CheckCircle2, XCircle, Info, MessageSquare, ExternalLink, Calendar, Calculator, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";

/**
 * OP-04 — PO Review & Action
 * Purpose: Detailed review of incoming PO. Accept, Reject, or Clarify.
 * DNA: Action floating bar, line items matrix, clarification thread.
 */

const INITIAL_LINE_ITEMS = [
  { id: 1, name: "Premium Avocado", category: "Produce", qty: 24, unit: "Case", estPrice: 850, total: 20400, suggestion: "FarmFresh Global" },
  { id: 2, name: "Whole Milk 1L", category: "Dairy", qty: 120, unit: "Units", estPrice: 65, total: 7800, suggestion: "DairyQueen Wholesale" },
  { id: 3, name: "Organic Kale", category: "Produce", qty: 15, unit: "kg", estPrice: 220, total: 3300, suggestion: "EcoGreen Farms" },
  { id: 4, name: "Basmati Rice 25kg", category: "Dry Goods", qty: 4, unit: "Bags", estPrice: 2750, total: 11000, suggestion: "Global Grains Ltd" },
];

export default function POReview() {
  const navigate = useNavigate();
  const { poId } = useParams();
  const [activeTab, setActiveTab] = useState<"items" | "clarification">("items");
  const [items, setItems] = useState(INITIAL_LINE_ITEMS);
  const [editingId, setEditingId] = useState<number | null>(null);

  const updateItem = (id: number, field: string, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newItem = { ...item, [field]: value };
        if (field === "qty" || field === "estPrice") {
          newItem.total = Number(newItem.qty) * Number(newItem.estPrice);
        }
        return newItem;
      }
      return item;
    }));
  };

  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Detail Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
        <div className="space-y-4">
          <button 
            onClick={() => navigate("/operator/po/inbox")}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-violet-500 transition-colors uppercase tracking-widest"
          >
            <ArrowLeft size={14} /> Back to Inbox
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-4xl font-bold tracking-tight">{poId}</h1>
              <StatusBadge status="RAISED" />
            </div>
            <p className="text-slate-500 font-medium">Fulfillment Request from <span className="text-slate-900 dark:text-white font-bold underline decoration-violet-500/30">Mama’s Italian Bistro</span></p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Est. Revenue</p>
             <p className="text-3xl font-mono font-bold text-violet-500">₹42,500</p>
          </div>
          <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-800" />
          <button className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-violet-500 transition-colors shadow-sm">
            <ExternalLink size={20} />
          </button>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Items", value: "24 SKU", icon: Package, color: "blue" },
          { label: "Weight", value: "142 kg", icon: Calculator, color: "violet" },
          { label: "Delivery By", value: "Mar 21", icon: Calendar, color: "amber" },
          { label: "Margin", value: "12.4%", icon: Info, color: "green" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl ring-1 ring-slate-100 dark:ring-slate-800">
            <stat.icon size={16} className={cn("mb-3", 
              stat.color === "blue" ? "text-blue-500" :
              stat.color === "violet" ? "text-violet-500" :
              stat.color === "amber" ? "text-amber-500" : "text-green-500"
            )} />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">{stat.label}</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Content Tabs */}
      <div className="space-y-6">
        <div className="flex items-center gap-8 border-b border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => setActiveTab("items")}
            className={cn(
              "pb-4 text-sm font-bold transition-all relative",
              activeTab === "items" ? "text-violet-600 dark:text-violet-400" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Line Items
            {activeTab === "items" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-violet-600 rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab("clarification")}
            className={cn(
              "pb-4 text-sm font-bold transition-all relative",
              activeTab === "clarification" ? "text-violet-600 dark:text-violet-400" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Clarification Thread
            {activeTab === "clarification" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-violet-600 rounded-full" />}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "items" ? (
            <motion.div 
              key="items"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden shadow-sm"
            >
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Product</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Category</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Request</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Base Cost</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-white dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="p-4">
                        <div className="flex flex-col">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded">Suggested</span>
                            <span className="text-[10px] text-slate-500 font-bold">{item.suggestion}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{item.category}</span>
                      </td>
                      <td className="p-4">
                        {editingId === item.id ? (
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              value={item.qty}
                              onChange={(e) => updateItem(item.id, "qty", e.target.value)}
                              className="w-16 h-8 bg-white dark:bg-slate-900 ring-1 ring-violet-500 rounded-lg text-xs px-2 focus:outline-none"
                              autoFocus
                            />
                            <input 
                              type="text" 
                              value={item.unit}
                              onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                              className="w-16 h-8 bg-white dark:bg-slate-900 ring-1 ring-violet-500 rounded-lg text-xs px-2 focus:outline-none"
                            />
                            <button onClick={() => setEditingId(null)} className="text-violet-500 font-bold text-[10px] uppercase">Save</button>
                          </div>
                        ) : (
                          <div 
                            className="flex items-center gap-2 cursor-pointer group/qty"
                            onClick={() => setEditingId(item.id)}
                          >
                            <p className="text-sm font-mono text-slate-700 dark:text-slate-300 ml-1">{item.qty} {item.unit}</p>
                            <span className="text-[10px] text-violet-500 opacity-0 group-hover/qty:opacity-100 transition-opacity font-bold uppercase">Edit</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-mono text-slate-500">₹{item.estPrice}</p>
                      </td>
                      <td className="p-4 text-right">
                        <p className="text-sm font-mono font-bold text-slate-900 dark:text-white">₹{item.total.toLocaleString()}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50/30 dark:bg-slate-900">
                    <td colSpan={4} className="p-6 text-right text-sm font-bold text-slate-500 uppercase">Grand Total</td>
                    <td className="p-6 text-right text-2xl font-mono font-black text-violet-500">₹{grandTotal.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </motion.div>
          ) : (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-50 dark:bg-slate-950 rounded-3xl p-8 ring-1 ring-slate-100 dark:ring-slate-900"
            >
              <div className="flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400">
                  <MessageSquare size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">No Active Conversations</h3>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto">Click "Request Clarification" below to start a thread with the merchant regarding this PO.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Bar DNA */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-50">
        <div className="relative group">
          <GlowingBorder spread={80} />
          <div className="relative z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl px-8 py-5 rounded-[2.5rem] shadow-2xl shadow-violet-500/10 ring-1 ring-slate-200 dark:ring-slate-800 flex items-center justify-between gap-4">
            <button className="flex flex-col items-center gap-1 group/btn px-4 transition-all hover:scale-105">
               <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-500 flex items-center justify-center group-hover/btn:bg-rose-500 group-hover/btn:text-white transition-all">
                 <XCircle size={20} />
               </div>
               <span className="text-[10px] font-bold text-slate-500 group-hover/btn:text-rose-500 uppercase tracking-tighter">Reject</span>
            </button>
            <button className="flex flex-col items-center gap-1 group/btn px-4 transition-all hover:scale-105">
               <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center group-hover/btn:bg-amber-500 group-hover/btn:text-white transition-all">
                 <MessageSquare size={20} />
               </div>
               <span className="text-[10px] font-bold text-slate-500 group-hover/btn:text-amber-500 uppercase tracking-tighter">Clarify</span>
            </button>
            
            <div className="h-12 w-[1px] bg-slate-200 dark:bg-slate-800 flex-shrink-0 mx-2" />
            
            <button 
              onClick={() => navigate(`/operator/po/${poId}/split`)}
              className="flex-1 h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/20 dark:shadow-white/10"
            >
              ACCEPT & SPLIT <CheckCircle2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
