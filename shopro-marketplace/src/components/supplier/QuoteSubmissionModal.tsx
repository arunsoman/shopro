"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ChevronRight, 
  Package, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  Truck,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowingBorder, NeonEdges } from "@/components/ui/neon-button";
import { ShoproInput } from "@/components/ui/shopro-input";

interface QuoteSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bidData: {
    id: string;
    title: string;
    category: string;
    items: { id: string; name: string; requestedQty: string; unit: string }[];
  } | null;
}

export default function QuoteSubmissionModal({ isOpen, onClose, bidData }: QuoteSubmissionModalProps) {
  const [step, setStep] = useState(1);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [leadTimes, setLeadTimes] = useState<Record<string, string>>({});

  if (!bidData) return null;

  const totalValue = Object.values(prices).reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);

  const handleSubmit = () => {
    // Logic for submitting the bid
    setStep(3);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-blue-500/10 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800"
          >
            <div className="absolute top-0 right-0 p-6 z-20">
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row h-full min-h-[600px]">
              {/* Left Bar: Info */}
              <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-950/30 p-8 border-r border-slate-100 dark:border-slate-800 space-y-8">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">{bidData.id}</span>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{bidData.title}</h2>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{bidData.category}</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Line Items</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{bidData.items.length} Products</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                      <Clock className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Deadline</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">4h 20m Remaining</p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
                  <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase">Blind Bid Protocol</span>
                    </div>
                    <p className="text-[10px] text-blue-700 dark:text-blue-400 leading-relaxed font-medium">
                      Your pricing remains anonymous until the bid event closes. Shopro ensures a fair marketplace for all suppliers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Content: Form */}
              <div className="flex-1 flex flex-col relative">
                <div className="p-8 flex-1 overflow-y-auto max-h-[600px]">
                  {step === 1 && (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Step 1: Item Pricing
                      </h3>
                      
                      <div className="space-y-4">
                        {bidData.items.map((item) => (
                          <div key={item.id} className="p-5 bg-white dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 group hover:ring-2 hover:ring-blue-500/20 transition-all">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</p>
                                <p className="text-xs text-slate-500 mt-0.5">Requested: {item.requestedQty} {item.unit}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="w-32">
                                  <ShoproInput
                                    placeholder="Price"
                                    type="number"
                                    value={prices[item.id] || ""}
                                    onChange={(e) => setPrices({ ...prices, [item.id]: e.target.value })}
                                    leftIcon={<DollarSign className="w-4 h-4" />}
                                  />
                                </div>
                                <div className="w-32">
                                  <ShoproInput
                                    placeholder="Days"
                                    type="number"
                                    value={leadTimes[item.id] || ""}
                                    onChange={(e) => setLeadTimes({ ...leadTimes, [item.id]: e.target.value })}
                                    leftIcon={<Truck className="w-4 h-4" />}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-8"
                    >
                       <div className="text-center space-y-2">
                         <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 mx-auto flex items-center justify-center">
                            <ShieldCheck className="w-8 h-8" />
                         </div>
                         <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Review & Confirm</h3>
                         <p className="text-slate-500 text-sm">Please verify your total quote value before submission.</p>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-6 bg-slate-50 dark:bg-slate-950/30 rounded-3xl border border-slate-100 dark:border-slate-800 text-center">
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Quote Value</p>
                             <p className="text-3xl font-black text-slate-900 dark:text-white">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                          </div>
                          <div className="p-6 bg-slate-50 dark:bg-slate-950/30 rounded-3xl border border-slate-100 dark:border-slate-800 text-center">
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Weighted Lead Time</p>
                             <p className="text-3xl font-black text-slate-900 dark:text-white">2.4 Days</p>
                          </div>
                       </div>

                       <div className="p-5 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex items-start gap-4">
                          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-800 dark:text-amber-400 font-medium leading-relaxed">
                            Bids cannot be withdrawn or modified after the deadline passes. Ensure all prices are accurate as per your current stock levels.
                          </p>
                       </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div 
                      key="step3"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="h-full flex flex-col items-center justify-center text-center space-y-6"
                    >
                       <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center relative">
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="absolute inset-0 rounded-full bg-green-500/20"
                          />
                          <ShieldCheck className="w-10 h-10" />
                       </div>
                       <div>
                          <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Bid Submitted</h3>
                          <p className="text-slate-500 mt-2">Your quote has been encrypted and stored in the Shopro Vault.</p>
                       </div>
                       <div className="px-6 py-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction ID: </span>
                          <span className="text-[10px] font-bold text-slate-900 dark:text-white mono">SH-BID-9921-X8Z</span>
                       </div>
                       <button 
                         onClick={onClose}
                         className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                       >
                         Continue to Dashboard <ChevronRight className="w-5 h-5" />
                       </button>
                    </motion.div>
                  )}
                </div>

                {/* Footer Buttons */}
                {step < 3 && (
                  <div className="p-8 pt-0 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 relative z-10">
                    <button 
                      onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                      className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      {step === 1 ? "Cancel" : "Back"}
                    </button>
                    <button 
                      onClick={() => step === 1 ? setStep(2) : handleSubmit()}
                      className="relative h-12 px-8 bg-blue-600 text-white rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-blue-500 transition-all active:scale-95 shadow-xl shadow-blue-500/20 overflow-hidden"
                    >
                      <NeonEdges color="blue" />
                      {step === 1 ? "Review Quote" : "Vault Quote"} <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
