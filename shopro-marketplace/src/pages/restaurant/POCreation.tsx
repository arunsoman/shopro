"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  ChevronRight, 
  ArrowLeft, 
  ShoppingBag, 
  Truck, 
  Check, 
  Plus, 
  Minus, 
  Store, 
  FileText,
  ShieldCheck,
  Zap,
  Globe,
  Award,
  ArrowRight,
  CircleDot,
  ShieldAlert
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/lib/store/cart-store";
import api from "@/api";
import { useMutation } from "@tanstack/react-query";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * RC-02 — Purchase Order Creation
 * Purpose: Finalize selection and generate PO for buyers.
 */

const StepIndicator = ({ current, steps, completed }: { current: number; steps: string[]; completed: Set<number> }) => (
  <div className="flex items-center gap-4 max-w-4xl mx-auto w-full mb-12">
    {steps.map((step, i) => (
      <React.Fragment key={i}>
        <div className="flex flex-col items-center gap-4 group cursor-pointer" onClick={() => i < current && window.history.back()}>
          <div className={cn(
            "relative w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold transition-all border-2 shadow-sm",
            i === current ? "bg-indigo-600 border-indigo-400 text-white scale-105" : completed.has(i) ? "bg-emerald-500 border-emerald-400 text-white" : "bg-white dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-800"
          )}>
            {completed.has(i) ? <IconTooltip label="Step Complete"><Check size={24} strokeWidth={3} /></IconTooltip> : <span>{i + 1}</span>}
          </div>
          <span className={cn("text-[10px] font-bold uppercase tracking-wider", i === current ? "text-indigo-600" : "text-slate-400 opacity-60")}>{step}</span>
        </div>
        {i < steps.length - 1 && <div className={cn("flex-1 h-2 rounded-full transition-all duration-700", completed.has(i) ? "bg-emerald-500" : "bg-border")} />}
      </React.Fragment>
    ))}
  </div>
);

export default function POCreation() {
  const { items, updateQuantity, clearCart } = useCart();
  const [step, setStep] = useState(0);
  const [deliveryDate, setDeliveryDate] = useState("2024-03-25");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const navigate = useNavigate();
  const [completedSteps] = useState(new Set<number>());

  // Price States
  const [prices, setPrices] = useState<Record<string, { price: number; effectiveFrom: string; notFound?: boolean }>>({});
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);
  const [isFetchingPrices, setIsFetchingPrices] = useState(false);

  useEffect(() => {
    if (items.length > 0 && items.some(item => !item.foodId)) {
      console.warn("Clearing stale cart items missing foodId");
      clearCart();
    }
  }, [items, clearCart]);

  const fetchPrices = async () => {
    setIsFetchingPrices(true);
    try {
      const payload = {
        items: items.map(item => ({
          foodId: item.foodId,
          quantity: item.quantity
        }))
      };
      const resp = await api.post("/prices/bulk", payload);
      const priceMap: Record<string, any> = {};
      resp.data.forEach((p: any) => {
        priceMap[p.foodId.toString()] = { 
          price: p.currentPrice, 
          effectiveFrom: p.effectiveFrom, 
          notFound: p.priceNotFound 
        };
      });
      setPrices(priceMap);
      setLastFetchTime(Date.now());
    } catch (err) {
      console.error("Failed to fetch prices", err);
    } finally {
      setIsFetchingPrices(false);
    }
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      const orderItems = items.map(item => ({
        ...item,
        unitPrice: item.foodId && prices[item.foodId] ? prices[item.foodId].price : 0
      }));
      return api.post("buyer/orders", { 
        items: orderItems, 
        deliveryDate,
        deliveryAddress,
        specialInstructions,
        internalNotes
      });
    },
    onSuccess: () => {
      clearCart();
      navigate('/restaurant/orders');
    }
  });

  const subtotal = items.reduce((acc, item) => {
    const p = (item.foodId && prices[item.foodId]?.price) || 0;
    return acc + (p * item.quantity);
  }, 0);

  const hasMissingPrices = items.some(item => !item.foodId || !prices[item.foodId] || prices[item.foodId]?.notFound);
  const isStale = lastFetchTime && (Date.now() - lastFetchTime) > 30 * 60 * 1000;

  const formatCurrency = (val: number) => `₹${val.toFixed(2)}`;

  if (items.length === 0) {
      return (
          <SecureOverlay>
              <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-12 font-bold italic uppercase">
                  <div className="h-40 w-40 bg-muted/20 rounded-3xl flex items-center justify-center text-7xl shadow-xl animate-pulse">
                      🛒
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white uppercase italic">Your basket is empty</h2>
                  <button 
                      onClick={() => navigate('/restaurant/catalog')}
                      className="h-14 px-8 bg-indigo-600 text-white font-bold rounded-xl text-sm uppercase tracking-widest shadow-lg border border-indigo-400 hover:scale-[1.02] transition-all"
                  >
                      Browse Catalog
                  </button>
              </div>
          </SecureOverlay>
      );
  }

  return (
    <SecureOverlay>
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-24 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-slate-200 dark:border-slate-800 pb-8 transition-all">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <button 
                onClick={() => navigate(-1)}
                className="h-12 w-12 bg-white dark:bg-slate-950 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 hover:scale-105 transition-all shadow-sm"
            >
                <IconTooltip label="Abort Flow"><ArrowLeft size={20} /></IconTooltip>
            </button>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Create New <span className="text-brand-primary font-extrabold italic">Purchase Order</span>
            </h1>
          </div>
          <p className="text-slate-500 font-medium text-sm flex items-center gap-3">
             <IconTooltip label="Flow Staged"><CircleDot className="w-5 h-5 text-brand-success animate-pulse" /></IconTooltip>
             Order Checkout • Step {step + 1} of 3
          </p>
        </div>
      </header>

      <StepIndicator current={step} steps={["Review", "Logistics", "Confirm"]} completed={completedSteps} />

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-12">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="selection" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-2xl font-bold tracking-tight flex items-center gap-4">
                    <IconTooltip label="Payload Data"><ShoppingBag size={28} className="text-indigo-600" /></IconTooltip> 
                    Review Order Items
                  </h2>
                  
                  {items.length > 0 && (
                    <button 
                      onClick={fetchPrices}
                      disabled={isFetchingPrices}
                      className={cn(
                        "h-12 px-6 rounded-xl font-bold text-sm flex items-center gap-3 transition-all border shadow-sm",
                        isFetchingPrices ? "bg-muted animate-pulse" : 
                        lastFetchTime ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-indigo-600 text-white border-indigo-400 hover:scale-[1.02]"
                      )}
                    >
                      {isFetchingPrices ? (
                        <>
                          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                          Fetching Prices...
                        </>
                      ) : (
                        <>
                          <Zap size={18} />
                          {lastFetchTime ? "Refresh Prices" : "Get Current Price"}
                        </>
                      )}
                    </button>
                  )}
                </div>

                {isStale && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-700 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                    <IconTooltip label="Stale Data"><CircleDot className="w-4 h-4 shrink-0" /></IconTooltip>
                    Prices may be outdated — consider refreshing (fetched {new Date(lastFetchTime!).toLocaleTimeString()})
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6">
                  {items.map(item => {
                    const priceInfo = item.foodId ? prices[item.foodId.toString()] : undefined;
                    const isMissing = !priceInfo || priceInfo.notFound;

                    return (
                      <div key={item.itemId} className={cn(
                        "group relative bg-card/50 backdrop-blur-3xl p-6 rounded-2xl border-2 shadow-lg flex flex-col md:flex-row md:items-center justify-between transition-all",
                        isMissing ? "border-amber-400 bg-amber-50/10" : "border-border hover:border-brand-primary"
                      )}>
                          <div className="flex items-center gap-6">
                              <div className={cn(
                                "h-12 w-12 rounded-lg border flex items-center justify-center text-lg font-bold italic shadow-sm",
                                isMissing ? "bg-amber-100 border-amber-300 text-amber-600" : "bg-brand-primary text-slate-950 border-brand-primary/50"
                              )}>
                                  {item.productName.charAt(0)}
                              </div>
                              <div className="space-y-1">
                                  <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase italic">{item.productName}</h3>
                                    {isMissing && (
                                      <IconTooltip label="No price on record for this item">
                                        <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-[10px] font-black rounded-full uppercase tracking-tighter">No Price</span>
                                      </IconTooltip>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-400 font-semibold tracking-wide flex items-center gap-2">
                                    {item.supplierName}
                                    {priceInfo?.effectiveFrom && (
                                      <span className="text-[10px] opacity-70">
                                        • Price as of {new Date(priceInfo.effectiveFrom).toLocaleString()}
                                      </span>
                                    )}
                                  </p>
                              </div>
                          </div>
                          
                          <div className="flex items-center gap-8 mt-4 md:mt-0">
                              <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unit Price</p>
                                <p className={cn("text-lg font-bold italic transition-all", isMissing ? "text-amber-600 animate-pulse" : "text-slate-950 dark:text-white")}>
                                  {priceInfo?.price ? formatCurrency(priceInfo.price) : "₹--.--"}
                                </p>
                              </div>

                              <div className="flex items-center gap-4 bg-muted/20 p-1.5 rounded-xl border border-border">
                                  <button onClick={() => updateQuantity(item.itemId, Math.max(0, item.quantity - 1))} className="h-10 w-10 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-colors shadow-sm">
                                      <IconTooltip label="Decrease Quantity"><Minus size={18} /></IconTooltip>
                                  </button>
                                  <span className="text-2xl font-bold tracking-tight w-10 text-center text-indigo-600">{item.quantity}</span>
                                  <button onClick={() => updateQuantity(item.itemId, item.quantity + 1)} className="h-10 w-10 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-colors shadow-sm">
                                      <IconTooltip label="Increase Quantity"><Plus size={18} /></IconTooltip>
                                  </button>
                              </div>
                          </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="logistics" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="space-y-8">
                 <h2 className="text-2xl font-bold tracking-tight flex items-center gap-4">
                   <IconTooltip label="Logistics Schedule"><Truck size={28} className="text-indigo-600" /></IconTooltip> 
                   Delivery Schedule
                 </h2>
                 <div className="p-6 bg-card/50 rounded-2xl border-2 border-border space-y-8 shadow-lg">
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest italic">Delivery Date</label>
                        <input 
                            type="date" 
                            value={deliveryDate} 
                            onChange={(e) => setDeliveryDate(e.target.value)} 
                            className="h-12 w-full bg-slate-100 dark:bg-slate-950 border border-border rounded-lg px-4 text-lg font-bold italic tracking-tighter text-brand-primary focus:ring-2 focus:ring-brand-primary/10 outline-none shadow-sm"
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest italic">Delivery Address</label>
                        <textarea 
                            value={deliveryAddress} 
                            onChange={(e) => setDeliveryAddress(e.target.value)} 
                            placeholder="Enter full delivery address..."
                            rows={3}
                            className="w-full bg-slate-100 dark:bg-slate-950 border border-border rounded-lg px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/10 outline-none shadow-sm resize-none"
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest italic">Special Instructions</label>
                        <textarea 
                            value={specialInstructions} 
                            onChange={(e) => setSpecialInstructions(e.target.value)} 
                            placeholder="Any notes for the supplier (e.g. gate code, timing)..."
                            rows={2}
                            className="w-full bg-slate-100 dark:bg-slate-950 border border-border rounded-lg px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/10 outline-none shadow-sm resize-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {["MORNING_SHIFT", "EVENING_SHIFT"].map(slot => (
                            <button key={slot} className="h-12 rounded-lg border border-border hover:border-brand-primary bg-card/40 text-sm font-bold italic tracking-wider shadow-sm transition-all hover:scale-[1.02] active:scale-95 text-slate-400 hover:text-brand-primary uppercase">
                                {slot.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                 </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="confirm" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="space-y-8">
                 <h2 className="text-2xl font-bold tracking-tight flex items-center gap-4">
                   <IconTooltip label="Seal Selection"><Award size={28} className="text-indigo-600" /></IconTooltip> 
                   Final Review
                 </h2>
                 <div className="p-6 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-2xl border-2 border-slate-200 dark:border-brand-primary/50 space-y-6 shadow-lg relative overflow-hidden transition-all">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] pointer-events-none" />
                           <div className="space-y-6 relative z-10">
                        <div className="flex justify-between items-end border-b border-white/10 pb-6">
                            <div>
                                <p className="text-[10px] font-bold tracking-widest opacity-60 uppercase text-slate-500 dark:text-slate-400">Order Summary</p>
                                 <h3 className="text-2xl font-bold italic tracking-tight mt-1">{items.length} Items</h3>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold tracking-widest opacity-60 text-indigo-600 dark:text-indigo-400 uppercase">Total Price</p>
                                 <h3 className="text-2xl font-bold italic tracking-tight mt-1 text-brand-primary">₹{subtotal.toFixed(2)}</h3>
                            </div>
                        </div>

                        {subtotal > 5000 && (
                          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-4 text-rose-400 animate-in zoom-in duration-300">
                             <ShieldAlert className="shrink-0" size={24} />
                             <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-widest">Approval Required</p>
                                <p className="text-[10px] font-medium opacity-80 leading-relaxed uppercase">
                                  This order exceeds the ₹5,000 threshold and will be queued for Manager Approval.
                                </p>
                             </div>
                          </div>
                        )}

                        <div className="space-y-4 pt-2">
                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest italic">Internal Notes (Optional)</label>
                            <textarea 
                                value={internalNotes} 
                                onChange={(e) => setInternalNotes(e.target.value)} 
                                placeholder="Private notes for your records..."
                                rows={2}
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/30 outline-none shadow-sm resize-none transition-all"
                            />
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="flex items-center gap-4 py-4 px-6 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 transition-all">
                                <IconTooltip label="Security Protocol"><ShieldCheck className="text-indigo-600 dark:text-indigo-400" size={24} /></IconTooltip>
                                <p className="text-xs font-bold tracking-wide opacity-80 uppercase leading-relaxed text-slate-600 dark:text-slate-300">
                                    Purchase Terms: Net 30 Days. Dispute mediation active. Secure payment enabled.
                                </p>
                            </div>
                        </div>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside className="lg:col-span-4 space-y-12">
           <div className="bg-card/50 backdrop-blur-3xl p-6 rounded-2xl border-2 border-border shadow-lg space-y-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-emerald-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
              <h3 className="text-xl font-bold tracking-tight uppercase flex items-center gap-3 relative z-10">
                <IconTooltip label="Order Summary"><Zap size={20} className="text-indigo-600" /></IconTooltip> 
                Order Summary
              </h3>
              
              <div className="space-y-4 relative z-10">
                 {[
                     { label: "Subtotal", val: `₹${subtotal.toFixed(2)}` },
                     { label: "Estimated Logistics", val: "₹0.00 (Standard)", highlight: true },
                     { label: "Tax", val: "₹0.00" },
                 ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                        <span className="text-slate-400 opacity-60">{row.label}</span>
                        <span className={cn(row.highlight ? "text-indigo-600" : "text-slate-900 dark:text-white")}>{row.val}</span>
                    </div>
                 ))}
                 <div className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-6 flex justify-between items-center text-slate-900 dark:text-white">
                    <span className="text-sm font-extrabold tracking-wider text-indigo-600 uppercase">Grand Total</span>
                    <span className="text-xl font-extrabold tracking-tight">₹{subtotal.toFixed(2)}</span>
                 </div>
              </div>

              <div className="space-y-4 pt-8 relative z-10">
                  {step === 0 && hasMissingPrices && lastFetchTime && (
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest text-center animate-pulse">
                      Please resolve missing prices before proceeding
                    </p>
                  )}
                  
                  <button 
                   onClick={() => {
                       if (step < 2) setStep(step + 1);
                       else submitMutation.mutate();
                   }}
                   disabled={submitMutation.isPending || (step === 0 && hasMissingPrices)}
                   className={cn(
                     "h-12 w-full rounded-xl border font-bold text-md tracking-tight shadow-md transition-all flex items-center justify-center gap-3 group/btn uppercase italic",
                     (step === 0 && hasMissingPrices) ? "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed" : "bg-slate-950 dark:bg-white text-white dark:text-slate-900 border-brand-primary/50 hover:scale-[1.02] active:scale-95"
                   )}
                  >
                     {submitMutation.isPending ? "Processing..." : step === 2 ? "Submit Order" : "Next Step"}
                     <IconTooltip label="Next"><ArrowRight className="group-hover/btn:translate-x-2 transition-transform" size={20} /></IconTooltip>
                  </button>
                 <button 
                    onClick={() => { if (step > 0) setStep(step - 1); }}
                    className="h-12 w-full bg-white dark:bg-slate-950 text-slate-400 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-[10px] tracking-widest shadow-sm hover:text-slate-900 dark:hover:text-white transition-all uppercase"
                 >
                    Go Back
                 </button>
              </div>
           </div>
        </aside>
      </main>
    </div>
    </SecureOverlay>
  );
}
