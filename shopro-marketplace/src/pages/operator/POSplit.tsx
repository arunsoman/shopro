"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Gavel, Link2, Plus, Trash2, CheckCircle2, ChevronRight, AlertCircle, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";

/**
 * OP-05 — PO Splitting Workspace
 * Purpose: Group line items and assign fulfillment mode (Direct vs Bid).
 * DNA: Reorderable lists, liquid-style toggles, readiness checklist.
 */

interface LineItem {
  id: number;
  name: string;
  qty: number;
  unit: string;
}

interface SplitGroup {
  id: string;
  name: string;
  items: LineItem[];
  mode: "DIRECT" | "BID";
  supplierId?: string;
}

const INITIAL_ITEMS: LineItem[] = [
  { id: 1, name: "Premium Avocado", qty: 24, unit: "Case" },
  { id: 2, name: "Whole Milk 1L", qty: 120, unit: "Units" },
  { id: 3, name: "Organic Kale", qty: 15, unit: "kg" },
  { id: 4, name: "Basmati Rice 25kg", qty: 4, unit: "Bags" },
];

export default function POSplit() {
  const navigate = useNavigate();
  const { poId } = useParams();
  
  const [unassignedItems, setUnassignedItems] = useState<LineItem[]>(INITIAL_ITEMS);
  const [groups, setGroups] = useState<SplitGroup[]>([
    { id: "group-1", name: "Produce & Fresh", items: [], mode: "BID" }
  ]);
  const [selectingSupplierFor, setSelectingSupplierFor] = useState<string | null>(null);

  const SUPPLIERS = [
    { id: "S1", name: "FarmFresh Global", rating: 4.8, priceMatch: "Exact" },
    { id: "S2", name: "EcoGreen Farms", rating: 4.5, priceMatch: "+2%" },
    { id: "S3", name: "DairyQueen Wholesale", rating: 4.9, priceMatch: "-1%" },
  ];

  const addToGroup = (groupId: string, item: LineItem) => {
    setGroups(groups.map(g => g.id === groupId ? { ...g, items: [...g.items, item] } : g));
    setUnassignedItems(unassignedItems.filter(i => i.id !== item.id));
  };

  const removeFromGroup = (groupId: string, item: LineItem) => {
    setGroups(groups.map(g => g.id === groupId ? { ...g, items: g.items.filter(i => i.id !== item.id) } : g));
    setUnassignedItems([...unassignedItems, item]);
  };

  const toggleMode = (groupId: string) => {
    setGroups(groups.map(g => g.id === groupId ? { ...g, mode: g.mode === "DIRECT" ? "BID" : "DIRECT" } : g));
  };

  const addGroup = () => {
    setGroups([...groups, { id: `group-${groups.length + 1}`, name: `New Group ${groups.length + 1}`, items: [], mode: "DIRECT" }]);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <button 
            onClick={() => navigate(`/operator/po/${poId}`)}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-violet-500 transition-colors uppercase tracking-widest mb-2"
          >
            <ArrowLeft size={14} /> Back to Review
          </button>
          <div className="flex items-center gap-3">
             <h1 className="text-3xl font-bold tracking-tight">Splitting Workspace: {poId}</h1>
             <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 uppercase tracking-widest ring-1 ring-violet-500/20">OPERATOR ACTION</div>
          </div>
        </div>
        
        <button 
          onClick={() => navigate(`/operator/po/${poId}/sub-pos`)}
          className="h-12 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-sm hover:scale-105 transition-all shadow-lg flex items-center gap-2"
        >
          CONFIRM & CREATE SUB-POS <CheckCircle2 size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Unassigned Items Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-[2rem] ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm sticky top-8">
            <h2 className="text-lg font-bold mb-6 flex items-center justify-between">
              Line Items
              <span className="text-xs text-slate-400 font-medium">{unassignedItems.length} unassigned</span>
            </h2>
            
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {unassignedItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl ring-1 ring-slate-100 dark:ring-slate-800 group"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.qty} {item.unit}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {groups.map(g => (
                          <button 
                            key={g.id}
                            onClick={() => addToGroup(g.id, item)}
                            className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 text-slate-400 hover:text-violet-500 hover:ring-violet-500 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                            title={`Move to ${g.name}`}
                          >
                            <Plus size={14} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {unassignedItems.length === 0 && (
                <div className="py-12 text-center space-y-3 opacity-50">
                   <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 text-green-500 flex items-center justify-center mx-auto">
                     <CheckCircle2 size={24} />
                   </div>
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">All items assigned</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Groups Column */}
        <div className="lg:col-span-8 space-y-8">
          <AnimatePresence mode="popLayout">
            {groups.map((group, index) => (
              <motion.div
                key={group.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative"
              >
                <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm group-hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <input 
                          type="text" 
                          defaultValue={group.name}
                          className="text-xl font-bold bg-transparent outline-none border-b-2 border-transparent focus:border-violet-500/50 transition-colors py-1"
                        />
                         <div className={cn(
                           "px-2 py-0.5 rounded-[4px] text-[10px] font-black uppercase tracking-widest",
                           group.mode === "DIRECT" 
                            ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600 ring-1 ring-teal-500/20" 
                            : "bg-violet-50 dark:bg-violet-900/30 text-violet-600 ring-1 ring-violet-500/20"
                         )}>
                           {group.mode}
                         </div>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Group {index + 1} • {group.items.length} line items contained</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex items-center gap-1">
                         <button 
                           onClick={() => toggleMode(group.id)}
                           className={cn(
                             "h-10 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                             group.mode === "BID" ? "bg-white dark:bg-slate-900 text-violet-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                           )}
                         >
                           <Gavel size={14} /> Bid
                         </button>
                         <button 
                           onClick={() => toggleMode(group.id)}
                           className={cn(
                             "h-10 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                             group.mode === "DIRECT" ? "bg-white dark:bg-slate-900 text-teal-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                           )}
                         >
                           <Link2 size={14} /> Direct
                         </button>
                      </div>
                      <button className="p-3 text-slate-400 hover:text-rose-500 transition-colors">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="min-h-[100px] border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl p-6 relative">
                    {group.items.length === 0 ? (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-300 dark:text-slate-700 font-bold text-sm pointer-events-none uppercase tracking-widest">
                        Drop items here
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {group.items.map(item => (
                          <div key={item.id} className="p-4 bg-white dark:bg-slate-900 rounded-2xl ring-1 ring-slate-100 dark:ring-slate-800 flex items-center justify-between group/item shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-violet-500" />
                              <div>
                                <p className="text-sm font-bold truncate max-w-[120px]">{item.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{item.qty} {item.unit}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => removeFromGroup(group.id, item)}
                              className="w-8 h-8 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all flex items-center justify-center"
                            >
                              <Plus size={14} className="rotate-45" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {group.mode === "DIRECT" && group.items.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 rounded-2xl bg-teal-500/5 ring-1 ring-teal-500/20 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <ShoppingCart size={18} className="text-teal-500" />
                        <div>
                          <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest block">Landed Supplier Selection</span>
                          {group.supplierId && (
                            <span className="text-xs font-bold text-slate-900 group-hover:text-violet-500">
                              Assigned to: {SUPPLIERS.find(s => s.id === group.supplierId)?.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectingSupplierFor(group.id)}
                        className="text-[10px] font-black text-teal-600 uppercase tracking-tighter hover:underline flex items-center gap-1"
                      >
                        {group.supplierId ? "Change Supplier" : "Select Supplier"} <ChevronRight size={14} />
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <button 
            onClick={addGroup}
            className="w-full py-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] text-slate-400 hover:text-violet-500 hover:border-violet-500/50 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-all flex flex-col items-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-violet-500 group-hover:text-white transition-all flex items-center justify-center">
              <Plus size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Create New Fulfillment Group</span>
          </button>
        </div>
      </div>

      {/* Supplier Selection Modal */}
      <AnimatePresence>
        {selectingSupplierFor && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectingSupplierFor(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden ring-1 ring-white/10"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold">Assign Supplier</h3>
                <p className="text-sm text-slate-500">Select a verified supplier for this direct order group.</p>
              </div>
              <div className="p-4 space-y-2">
                {SUPPLIERS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setGroups(groups.map(g => g.id === selectingSupplierFor ? { ...g, supplierId: s.id } : g));
                      setSelectingSupplierFor(null);
                    }}
                    className="w-full p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between group"
                  >
                    <div className="text-left">
                      <p className="font-bold text-slate-900 dark:text-white group-hover:text-violet-500 transition-colors">{s.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Rating: {s.rating} • Price: {s.priceMatch}</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ready Checklist DNA */}
      <div className="bg-slate-900 dark:bg-blue-600 p-8 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 animate-pulse">
             <AlertCircle size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Split Readiness Checklist</h3>
            <p className="text-white/60 text-sm">Ensure all groups are assigned and modes confirmed before finalizing sub-POs.</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
           {[
             { label: "All Items Assigned", done: unassignedItems.length === 0 },
             { label: "Modes Defined", done: groups.every(g => g.items.length > 0) },
             { label: "Feasibility Check", done: true },
           ].map((check) => (
             <div key={check.label} className={cn(
               "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all",
               check.done ? "bg-white/20 text-white" : "bg-white/5 text-white/40"
             )}>
               {check.done ? <CheckCircle2 size={14} className="text-green-400" /> : <div className="w-3.5 h-3.5 rounded-full border border-white/20" />}
               {check.label}
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
