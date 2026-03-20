"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlowingBorder } from "@/components/ui/neon-button";
import { ArrowLeft, Gavel, Users, Settings, Package, ChevronRight, Info, Plus, Trash2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

/**
 * OP-07 — Bid Event Creation
 * Purpose: Launch an RFQ wizard.
 * DNA: Stepper-based wizard, product tag cloud, supplier invitation list.
 */

const STEPS = [
  { id: 1, title: "Items & Specs", icon: Package },
  { id: 2, title: "Bid Settings", icon: Settings },
  { id: 3, title: "Invite Suppliers", icon: Users },
];

const MOCK_PRODUCT_MASTER = [
  { id: "P-001", name: "Premium Avocado", category: "Produce", unit: "Case" },
  { id: "P-002", name: "Organic Kale", category: "Produce", unit: "kg" },
  { id: "P-003", name: "Whole Milk (1L)", category: "Dairy", unit: "Pack" },
  { id: "P-004", name: "Imperial Basmati", category: "Grains", unit: "5kg Bag" },
  { id: "P-005", name: "Fresh Salmon Fillet", category: "Seafood", unit: "kg" },
];

export default function BidCreation() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedItems, setSelectedItems] = useState([
    { id: "P-001", name: "Premium Avocado", qty: 24, unit: "Case" },
    { id: "P-002", name: "Organic Kale", qty: 15, unit: "kg" },
  ]);
  const [deadline, setDeadline] = useState("");
  const [isLaunching, setIsLaunching] = useState(false);

  const addItem = (product: typeof MOCK_PRODUCT_MASTER[0]) => {
    if (selectedItems.find(item => item.id === product.id)) return;
    setSelectedItems([...selectedItems, { ...product, qty: 10 }]);
  };

  const removeItem = (id: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  const handleLaunch = () => {
    setIsLaunching(true);
    setTimeout(() => {
      navigate("/operator/bids/BID-9901");
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <button 
            onClick={() => navigate("/operator/po/inbox")}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-violet-500 transition-colors uppercase tracking-widest mb-2"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold tracking-tight">Launch Bid Event</h1>
          <p className="text-slate-500 text-sm">Create a competitive RFQ for marketplace fulfillment.</p>
        </div>
        
        {/* Step Indicator DNA */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl">
          {STEPS.map((step) => (
            <div 
              key={step.id}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                currentStep === step.id 
                  ? "bg-violet-600 text-white shadow-lg" 
                  : currentStep > step.id 
                    ? "bg-green-500/20 text-green-500" 
                    : "text-slate-400"
              )}
            >
              <step.icon size={18} />
            </div>
          ))}
        </div>
      </div>

      {/* Wizard Content Container */}
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm p-8 min-h-[500px] flex flex-col">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 flex-1"
            >
              <div className="space-y-4">
                <h2 className="text-xl font-bold">What are we bidding for?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {selectedItems.map((item, i) => (
                     <motion.div 
                       layout
                       key={item.id} 
                       className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl ring-1 ring-slate-100 dark:ring-slate-700 flex items-center justify-between group"
                     >
                       <div>
                         <p className="text-sm font-bold">{item.name}</p>
                         <div className="flex items-center gap-2 mt-1">
                            <input 
                              type="number" 
                              value={item.qty} 
                              onChange={(e) => {
                                const newItems = [...selectedItems];
                                newItems[i].qty = parseInt(e.target.value) || 0;
                                setSelectedItems(newItems);
                              }}
                              className="w-12 bg-transparent text-[10px] font-black text-violet-500 outline-none"
                            />
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.unit}</p>
                         </div>
                       </div>
                       <button 
                         onClick={() => removeItem(item.id)}
                         className="text-slate-300 hover:text-rose-500 transition-colors"
                        >
                         <Trash2 size={16} />
                       </button>
                     </motion.div>
                   ))}
                   
                   <div className="relative group/add">
                      <button className="w-full p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-violet-500 hover:border-violet-500/50 transition-all flex items-center justify-center gap-2">
                          <Plus size={16} className="group-hover/add:scale-110 transition-transform" />
                          <span className="text-xs font-bold uppercase tracking-widest">Add Item</span>
                      </button>
                      
                      {/* Quick Add Dropdown DNA */}
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 p-2 z-50 opacity-0 pointer-events-none group-hover/add:opacity-100 group-hover/add:pointer-events-auto transition-all scale-95 group-hover/add:scale-100">
                        {MOCK_PRODUCT_MASTER.filter(p => !selectedItems.find(si => si.id === p.id)).map(product => (
                          <button 
                            key={product.id}
                            onClick={() => addItem(product)}
                            className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl flex items-center justify-between"
                          >
                            <span className="text-[10px] font-bold uppercase tracking-tight">{product.name}</span>
                            <Plus size={10} className="text-slate-400" />
                          </button>
                        ))}
                      </div>
                   </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-violet-50 dark:bg-violet-900/20 ring-1 ring-violet-500/20 space-y-3">
                 <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                    <Info size={18} />
                    <h3 className="text-sm font-bold uppercase tracking-widest">Quality Specs</h3>
                 </div>
                 <textarea 
                   placeholder="Describe quality requirements, certifications, and delivery constraints..."
                   className="w-full h-32 bg-transparent outline-none text-sm placeholder:text-violet-500/30 text-slate-700 dark:text-slate-300"
                 />
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 flex-1"
            >
              <h2 className="text-xl font-bold">Configure Bidding Rules</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Bid Deadline</label>
                  <div className="flex gap-2">
                    <input 
                      type="datetime-local" 
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="flex-1 h-12 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-violet-500 transition-all text-sm font-bold" 
                    />
                    <button 
                      onClick={() => {
                        const date = new Date();
                        date.setDate(date.getDate() + 3);
                        setDeadline(date.toISOString().slice(0, 16));
                      }}
                      className="px-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black hover:bg-violet-500 hover:text-white transition-all uppercase tracking-widest"
                    >
                      +3D
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Price Transparency</label>
                  <select className="w-full h-12 px-4 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none ring-1 ring-slate-200 dark:ring-slate-700 font-bold text-sm">
                    <option>Blind Bidding (Highly Recommended)</option>
                    <option>Open Bidding (Visible Ranks)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                 <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Auto-Award Logic</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {[
                     { label: "Lowest Price", desc: "Select absolute cheapest" },
                     { label: "Balanced", desc: "Cheapest with 4.5+ star rating" },
                     { label: "Manual", desc: "Operator reviews all quotes" },
                   ].map((logic) => (
                     <div key={logic.label} className="p-4 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-violet-500 transition-all cursor-pointer group">
                        <p className="text-sm font-bold group-hover:text-violet-500 transition-colors">{logic.label}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{logic.desc}</p>
                     </div>
                   ))}
                 </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 flex-1"
            >
              <h2 className="text-xl font-bold">Select Candidates</h2>
              <div className="space-y-3">
                {[
                  { name: "Golden Harvest", rating: 4.8, category: "Produce", location: "Bangalore" },
                  { name: "Fresh Express", rating: 4.2, category: "Produce", location: "Mysore" },
                  { name: "Nature's Basket B2B", rating: 4.9, category: "Premium", location: "Bangalore" },
                ].map((s) => (
                  <div key={s.name} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl ring-1 ring-slate-100 dark:ring-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold">
                         {s.name[0]}
                       </div>
                       <div>
                         <p className="text-sm font-bold">{s.name}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{s.rating} ★ • {s.location}</p>
                       </div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-violet-500" />
                  </div>
                ))}
              </div>
              
              <button className="w-full h-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-violet-500 transition-colors">
                Broadcast to all Premium Produce Suppliers
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Bar */}
        <div className="mt-auto pt-8 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
            disabled={currentStep === 1}
            className="h-12 px-6 rounded-2xl font-bold text-xs text-slate-500 hover:text-slate-900 transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            PREVIOUS STEP
          </button>
          
          {currentStep < 3 ? (
            <button 
              onClick={() => setCurrentStep(currentStep + 1)}
              className="h-12 px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-xs flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
            >
              NEXT STEP <ChevronRight size={16} />
            </button>
          ) : (
            <div className="relative group">
              <GlowingBorder spread={40} />
              <button 
                onClick={handleLaunch}
                disabled={isLaunching}
                className="relative z-10 h-12 px-8 bg-violet-600 text-white rounded-2xl font-black text-xs flex items-center gap-2 hover:scale-105 transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {isLaunching ? (
                  <>LAUNCHING CRYPTOGRAPHIC BID... <RefreshCw className="animate-spin" size={18} /></>
                ) : (
                  <>LAUNCH BID EVENT <Gavel size={18} /></>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
