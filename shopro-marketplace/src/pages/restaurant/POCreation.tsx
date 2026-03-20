"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Check, 
  Plus,
  Minus,
  Store,
  Truck,
  FileText,
  ShoppingBag,
  Search,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/lib/store/cart-store";

// ─── DNA PRIMITIVES ──────────────────────────────────────────────────────────
const SPRING = { type: "spring" as const, stiffness: 500, damping: 30, mass: 1 };
const GLOW_GRADIENT = `radial-gradient(circle, #dd7bbb 10%, #dd7bbb00 20%), radial-gradient(circle at 40% 40%, #d79f1e 5%, #d79f1e00 15%), radial-gradient(circle at 60% 60%, #5a922c 10%, #5a922c00 20%), radial-gradient(circle at 40% 60%, #4c7894 10%, #4c789400 20%), repeating-conic-gradient(from 236.84deg at 50% 50%, #dd7bbb 0%, #d79f1e calc(25% / 5), #5a922c calc(50% / 5), #4c7894 calc(75% / 5), #dd7bbb calc(100% / 5))`;

function useGlowingBorder(disabled = false) {
  const containerRef = useRef<HTMLElement>(null);
  const lastPosition = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const handleMove = useCallback((e?: MouseEvent | { x: number; y: number }) => {
    if (!containerRef.current || disabled) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = containerRef.current; if (!el) return;
      const { left, top, width, height } = el.getBoundingClientRect();
      const mx = e?.x ?? lastPosition.current.x;
      const my = e?.y ?? lastPosition.current.y;
      if (e) lastPosition.current = { x: mx, y: my };
      const center = [left + width * 0.5, top + height * 0.5];
      const dist = Math.hypot(mx - center[0], my - center[1]);
      if (dist < 0.5 * Math.min(width, height) * 0.01) { el.style.setProperty("--active", "0"); return; }
      const isActive = mx > left && mx < left + width && my > top && my < top + height;
      el.style.setProperty("--active", isActive ? "1" : "0");
      if (!isActive) return;
      const cur = parseFloat(el.style.getPropertyValue("--start")) || 0;
      const target = (180 * Math.atan2(my - center[1], mx - center[0])) / Math.PI + 90;
      const diff = ((target - cur + 180) % 360) - 180;
      animate(cur, cur + diff, { duration: 2, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => el.style.setProperty("--start", String(v)) });
    });
  }, [disabled]);
  useEffect(() => {
    if (disabled) return;
    const onScroll = () => handleMove();
    const onMove = (e: PointerEvent) => handleMove(e);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.body.addEventListener("pointermove", onMove, { passive: true });
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); window.removeEventListener("scroll", onScroll); document.body.removeEventListener("pointermove", onMove); };
  }, [handleMove, disabled]);
  return containerRef;
}

function GlowingBorder({ spread = 30, borderWidth = 1 }: { spread?: number; borderWidth?: number }) {
  return (
    <div style={{ "--spread": spread, "--start": "0", "--active": "0", "--glowingeffect-border-width": `${borderWidth}px`, "--repeating-conic-gradient-times": "5", "--gradient": GLOW_GRADIENT } as React.CSSProperties}
      className="pointer-events-none absolute inset-0 rounded-[inherit]">
      <div className={cn("glow rounded-[inherit]", 'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]', "after:[border:var(--glowingeffect-border-width)_solid_transparent]", "after:[background:var(--gradient)] after:[background-attachment:fixed]", "after:opacity-[var(--active)] after:transition-opacity after:duration-300", "after:[mask-clip:padding-box,border-box] after:[mask-composite:intersect]", "after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]")} />
    </div>
  );
}

function NeonEdges({ active = false, color = "blue" }: { active?: boolean; color?: "blue" | "violet" | "green" }) {
  const via = color === "violet" ? "via-violet-500" : color === "green" ? "via-green-400" : "via-blue-500";
  return (<>
    <span className={cn("pointer-events-none absolute h-px inset-x-0 top-0 bg-gradient-to-r w-3/4 mx-auto from-transparent to-transparent transition-all duration-500 ease-in-out", via, active ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100")} />
    <span className={cn("pointer-events-none absolute inset-x-0 h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent to-transparent transition-opacity duration-500 ease-in-out", via, active ? "opacity-30" : "opacity-0 group-hover:opacity-30 group-focus-within:opacity-30")} />
  </>);
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function Wizard({ steps, onComplete, onStepChange, className }: { steps: any[], onComplete?: () => void, onStepChange?: (index: number) => void, className?: string }) {
  const [current, setCurrent] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [validating, setValidating] = useState(false);

  const goNext = async () => {
    const step = steps[current];
    if (step.validate) {
      setValidating(true);
      const ok = await step.validate();
      setValidating(false);
      if (!ok) return;
    }
    setCompleted((s) => new Set(s).add(current));
    if (current < steps.length - 1) {
      const next = current + 1;
      setCurrent(next);
      onStepChange?.(next);
    } else {
      onComplete?.();
    }
  };

  const goPrev = () => {
    if (current > 0) { const prev = current - 1; setCurrent(prev); onStepChange?.(prev); }
  };

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      <div className="flex items-center gap-0 max-w-2xl mx-auto w-full">
        {steps.map((step, i) => {
          const isDone = completed.has(i);
          const isActive = i === current;
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => i < current && setCurrent(i)}>
                <div className={cn(
                  "relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500",
                  isActive ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-110" : isDone ? "bg-green-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                )}>
                  {isActive && <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute inset-[-4px] rounded-full border-2 border-dashed border-slate-900/20 dark:border-white/20" />}
                  {isDone ? <Check className="w-5 h-5" strokeWidth={3} /> : <span>{i + 1}</span>}
                </div>
                <span className={cn("text-[11px] font-bold uppercase tracking-wider", isActive ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-600")}>{step.title}</span>
              </div>
              {i < steps.length - 1 && <div className={cn("flex-1 h-[2px] mx-4 mb-6 transition-all duration-700", completed.has(i) ? "bg-green-500" : "bg-slate-200 dark:bg-slate-800")} />}
            </React.Fragment>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
          {steps[current].content}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
        <button onClick={goPrev} disabled={current === 0} className="group relative px-6 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-30 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
          <NeonEdges />
          Back
        </button>
        <button onClick={goNext} disabled={validating || (current === 0 && steps[0].isEmpty)} className="group relative px-8 py-2 rounded-xl text-sm font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden shadow-xl">
          <NeonEdges color="violet" />
          {validating ? "Validating..." : current === steps.length - 1 ? "Submit Order" : "Continue"}
        </button>
      </div>
    </div>
  );
}

function ShoproNumberField({ value, onChange, label, min = 1 }: { value: number; onChange: (v: number) => void, label?: string, min?: number }) {
  const glowRef = useGlowingBorder();
  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight">{label}</span>}
      <div ref={glowRef as any} className="group relative flex items-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden h-10">
        <GlowingBorder spread={20} borderWidth={1} />
        <button onClick={() => onChange(Math.max(min, value - 1))} className="w-10 h-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"><Minus className="w-4 h-4" /></button>
        <input type="number" value={value} onChange={(e) => onChange(parseInt(e.target.value) || min)} className="w-12 text-center bg-transparent text-sm font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
        <button onClick={() => onChange(value + 1)} className="w-10 h-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"><Plus className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

// ─── PAGE COMPONENT ──────────────────────────────────────────────────────────

export default function POCreation() {
  const { items, updateQuantity, clearCart } = useCart();
  const [deliveryDate, setDeliveryDate] = useState("2024-03-25");
  const navigate = useNavigate();

  const primarySupplier = items.length > 0 ? items[0].supplierName : "N/A";

  const steps = [
    {
      id: "items",
      title: "Selection",
      isEmpty: items.length === 0,
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold flex items-center gap-2 italic">
                <ShoppingBag className="w-5 h-5 text-violet-500" />
                Review Your Selection
              </h2>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {items.length > 0 ? items.map(item => (
                <div key={item.productId} className="group relative flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
                  <GlowingBorder spread={30} borderWidth={1} />
                  <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl">
                    {item.image || '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate">{item.productName}</h3>
                    <p className="text-sm text-slate-500">Unit: {item.unit}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold mt-1">{item.supplierName}</p>
                  </div>
                  <ShoproNumberField 
                    value={item.quantity} 
                    onChange={(v) => updateQuantity(item.productId, v)}
                    min={0}
                  />
                </div>
              )) : (
                <div className="py-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-slate-500">Your order list is empty.</p>
                  <button onClick={() => navigate('/restaurant/catalog')} className="text-violet-500 font-bold mt-2 hover:underline">Go to Catalog</button>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="p-6 bg-slate-900 dark:bg-white rounded-3xl text-white dark:text-slate-900 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-violet-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Procurement Method</h3>
              <div className="text-4xl font-black mb-6 tracking-tight italic">Direct PO</div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="opacity-60">Fulfillment</span>
                  <span className="font-bold">Standard Delivery</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-60">Status</span>
                  <span className="font-bold text-green-400 dark:text-green-600">PRE-APPROVED</span>
                </div>
              </div>
              
              <div className="p-4 bg-white/10 dark:bg-black/5 rounded-2xl border border-white/10 dark:border-black/5 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center shadow-lg">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase opacity-60 tracking-tighter">Shopro Secure</div>
                    <div className="text-sm font-bold truncate">Mediation Guaranteed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "logistics",
      title: "Logistics",
      content: (
        <div className="w-full max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black italic tracking-tight">When should it arrive?</h2>
            <p className="text-slate-500">Pick a delivery window that works for your kitchen staff.</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm relative overflow-hidden">
               <GlowingBorder spread={50} borderWidth={1} />
               <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
                    <CalendarIcon className="w-6 h-6" />
                 </div>
                 <div>
                    <div className="text-sm font-bold">Delivery Date</div>
                    <div className="text-xs text-slate-500">Next available: Tomorrow</div>
                 </div>
               </div>
               <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl p-4 text-lg font-bold focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {["Morning (8AM - 11AM)", "Afternoon (1PM - 4PM)"].map(slot => (
                <div key={slot} className="group relative cursor-pointer p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl hover:border-violet-500 transition-all text-center">
                  <input type="radio" name="slot" className="hidden" defaultChecked={slot.startsWith("Morning")} />
                  <div className="text-sm font-bold mb-1 opacity-80 group-hover:opacity-100 transition-opacity">{slot}</div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-violet-500 transition-colors">Select Slot</div>
                  <GlowingBorder spread={30} borderWidth={1} />
                </div>
              ))}
            </div>

            <div className="p-6 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 rounded-3xl flex gap-4 italic items-center">
               <Truck className="w-10 h-10 text-green-500 shrink-0" />
               <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                 Your suppliers have a 98% on-time delivery rate for this slot.
               </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "review",
      title: "Confirm",
      content: (
        <div className="w-full max-w-3xl mx-auto space-y-6">
           <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-black italic tracking-tight">Review Your Order</h2>
            <p className="text-slate-500">One last check before we send this to Shopro.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl relative">
            <GlowingBorder spread={100} borderWidth={1} />
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 shadow-xl">
                    <Store className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic">Shopro Marketplace</h3>
                    <p className="text-sm text-slate-500">Direct Fulfillment Hub</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Delivery On</div>
                  <div className="text-lg font-black italic">{new Date(deliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
              </div>

              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.productId} className="flex justify-between items-center group">
                    <div className="flex gap-3 items-center">
                       <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">x{item.quantity}</div>
                       <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:translate-x-1 transition-transform">{item.productName}</span>
                    </div>
                    <span className="text-sm text-slate-500">{item.unit}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t-2 border-dashed border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-end">
                   <div>
                     <div className="text-xs font-bold text-slate-400 uppercase mb-1">Item Volumes</div>
                     <div className="text-sm text-slate-500 mb-[-4px] tracking-tight">Direct Procurement Request</div>
                     <div className="text-4xl font-black italic tracking-tighter text-violet-500">{items.length} Products</div>
                   </div>
                   <div className="text-right space-y-1">
                      <div className="text-[10px] text-slate-400 font-medium">Terms: Net 30 Days</div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 p-4 bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800 rounded-2xl">
             <FileText className="w-6 h-6 text-violet-500 shrink-0 mt-1" />
             <p className="text-xs text-violet-700 dark:text-violet-400 leading-relaxed font-medium">
                By submitting, you agree to the <span className="underline">Marketplace Standard Terms</span>. A Purchase Order will be generated and sent to the suppliers via Shopro for immediate fulfillment.
             </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">
              <span>Home</span>
              <ChevronRight className="w-3 h-3" />
              <span>Orders</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-violet-500">New Purchase Order</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic flex items-center gap-3">
              Restock <span className="text-violet-500">Inventory</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-800 shadow-sm">
                <Store className="w-6 h-6" />
             </div>
          </div>
        </header>

        <div className="group relative">
           <Wizard steps={steps} onComplete={() => {
             alert("PO Created Successfully!");
             clearCart();
             navigate('/restaurant/orders');
           }} />
        </div>
      </div>
    </div>
  );
}
