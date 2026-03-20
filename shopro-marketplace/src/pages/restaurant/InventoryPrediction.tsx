"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Clock, Package, ChevronRight, Info, Search, ArrowRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const INITIAL_INVENTORY = [
  { id: "INV-01", item: "Premium Avocado", stock: 12, risk: "HIGH", daysLeft: 2, velocity: "UP" },
  { id: "INV-02", item: "Organic Kale", stock: 45, risk: "MEDIUM", daysLeft: 5, velocity: "DOWN" },
  { id: "INV-03", item: "Whole Milk (1L)", stock: 82, risk: "LOW", daysLeft: 12, velocity: "STABLE" },
];

export default function InventoryPrediction() {
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [isRestocking, setIsRestocking] = useState<string | null>(null);

  const handleRestock = (id: string) => {
    setIsRestocking(id);
    setTimeout(() => {
      setInventory(prev => prev.filter(item => item.id !== id));
      setIsRestocking(null);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Inventory Risk Engine</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Analyzing your restaurant's demand velocity and fulfillment lead times.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="h-10 px-4 bg-white dark:bg-slate-900 text-slate-600 dark:text-white rounded-xl text-xs font-black flex items-center gap-2 ring-1 ring-slate-200 dark:ring-slate-800 hover:bg-slate-50 transition-all shadow-sm">
            <Package size={14} /> RE-RUN ANALYSIS
          </button>
          <button className="h-10 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black flex items-center gap-2 hover:scale-105 transition-all shadow-lg">
            <AlertTriangle size={14} /> VIEW ALL RISKS
          </button>
        </div>
      </div>

      {/* Network Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-rose-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-rose-500/20 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 text-rose-400 opacity-20 transform translate-x-4 -translate-y-4">
             <AlertTriangle size={120} />
           </div>
           <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Stockout Risks</p>
           <p className="text-4xl font-black mt-1">{inventory.filter(item => item.risk === "HIGH").length} SKUs</p>
           <p className="text-[10px] font-bold mt-4 uppercase tracking-[0.2em] flex items-center gap-2">
             <Clock size={14} /> Est. Revenue Loss: ₹45,200
           </p>
        </div>

        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] ring-1 ring-slate-100 dark:ring-slate-800 shadow-sm border-l-4 border-blue-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Fulfillment SLA</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">92.4%</p>
          <p className="text-[9px] font-bold text-slate-400 mt-4 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp size={12} className="text-green-500" /> +2.4% vs Previous Week
          </p>
        </div>

        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] ring-1 ring-slate-100 dark:ring-slate-800 shadow-sm border-l-4 border-violet-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Safety Stock level</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">Optimal</p>
          <p className="text-[9px] font-bold text-slate-400 mt-4 uppercase tracking-widest">Cross 482 Product Lines</p>
        </div>
      </div>

      {/* Risk List */}
      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
           <h2 className="text-lg font-bold uppercase tracking-tighter text-slate-900 dark:text-white">Replenishment Priority</h2>
           <div className="flex items-center gap-3">
             <div className="relative">
               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input type="text" placeholder="Search SKU..." className="h-8 pl-8 pr-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-[10px] font-bold outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-violet-500 transition-all" />
             </div>
             <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
               <Info size={18} />
             </button>
           </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {inventory.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, x: 50 }}
                className="p-8 bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] ring-1 ring-slate-100 dark:ring-slate-800 shadow-sm group hover:ring-violet-500/50 transition-all flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-2xl",
                      item.risk === "HIGH" ? "bg-rose-500/10 text-rose-500" : 
                      item.risk === "MEDIUM" ? "bg-amber-500/10 text-amber-500" :
                      "bg-green-500/10 text-green-500"
                    )}>
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.item}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.id}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Current Stock</span>
                    <span className="font-bold text-slate-900 dark:text-white">{item.stock} Units</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Predicted Stockout</span>
                    <span className={cn("font-bold", item.daysLeft < 3 ? "text-rose-500" : "text-amber-500")}>In {item.daysLeft} days</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleRestock(item.id)}
                  disabled={isRestocking === item.id}
                  className="mt-6 w-full h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isRestocking === item.id ? (
                    <>RE-STOCKING... <Clock className="animate-spin" size={14} /></>
                  ) : (
                    <>AUTO-RESTOCK <ArrowRight size={14} /></>
                  )}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
