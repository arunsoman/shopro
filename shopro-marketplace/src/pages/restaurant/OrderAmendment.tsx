"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  Save, 
  Trash2, 
  Plus, 
  Minus, 
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle,
  X,
  TrendingUp,
  FileText
} from "lucide-react";

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

function NeonEdges({ active = false, color = "blue" }: { active?: boolean; color?: "blue" | "violet" | "green" | "rose" | "amber" }) {
  const via = color === "violet" ? "via-violet-500" : color === "green" ? "via-green-400" : color === "rose" ? "via-rose-500" : color === "amber" ? "via-amber-500" : "via-blue-500";
  return (<>
    <span className={cn("pointer-events-none absolute h-px inset-x-0 top-0 bg-gradient-to-r w-3/4 mx-auto from-transparent to-transparent transition-all duration-500 ease-in-out", via, active ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100")} />
    <span className={cn("pointer-events-none absolute inset-x-0 h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent to-transparent transition-opacity duration-500 ease-in-out", via, active ? "opacity-30" : "opacity-0 group-hover:opacity-30 group-focus-within:opacity-30")} />
  </>);
}

// ─── PAGE COMPONENT ──────────────────────────────────────────────────────────

const INITIAL_ITEMS = [
  { id: "1", name: "Premium Arabica Beans", price: 45.0, qty: 10, unit: "kg" },
  { id: "2", name: "Whole Milk - Case of 12", price: 28.5, qty: 4, unit: "case" },
  { id: "3", name: "Oat Milk - Barista Edition", price: 34.0, qty: 2, unit: "case" },
];

export default function OrderAmendment() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [reason, setReason] = useState("");
  const glowRef = useGlowingBorder();

  const handleQtyChange = (id: string, delta: number) => {
    setItems(curr => curr.map(item => item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item));
  };

  const originalTotal = INITIAL_ITEMS.reduce((acc, i) => acc + i.price * i.qty, 0);
  const currentTotal = items.reduce((acc, i) => acc + i.price * i.qty, 0);
  const diff = currentTotal - originalTotal;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-black p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4">
          <div className="space-y-1">
            <button className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-violet-500 transition-colors uppercase tracking-widest mb-2">
              <ChevronLeft className="w-3 h-3" />
              Discard & Exit
            </button>
            <h1 className="text-4xl font-black tracking-tighter italic flex items-center gap-3">
              Amend <span className="text-violet-500">PO-82921-X</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={cn("px-4 py-2 rounded-2xl border flex flex-col items-end", diff !== 0 ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800" : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800")}>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Balance Diff</div>
              <div className={cn("text-lg font-black italic", diff > 0 ? "text-rose-500" : diff < 0 ? "text-green-500" : "text-slate-900 dark:text-white")}>
                {diff > 0 ? "+" : ""}${diff.toFixed(2)}
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden p-8">
              <GlowingBorder spread={100} borderWidth={1} />
              
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black italic tracking-tight flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-violet-500" />
                  Adjust Quantities
                </h2>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Live Sync Active
                </div>
              </div>

              <div className="space-y-2">
                {items.map((item, i) => {
                  const originalItem = INITIAL_ITEMS.find(oi => oi.id === item.id);
                  const isChanged = originalItem?.qty !== item.qty;
                  
                  return (
                    <div key={item.id} className={cn("group relative flex items-center gap-4 p-4 rounded-[1.5rem] transition-all duration-500 border", isChanged ? "bg-violet-50/30 border-violet-200/50 dark:bg-violet-950/10 dark:border-violet-800/30 shadow-sm" : "border-transparent")}>
                      {isChanged && <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-8 bg-violet-500 rounded-full blur-[2px]" />}
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-[10px] font-black uppercase text-slate-400">Original: {originalItem?.qty}</span>
                           {isChanged && (
                             <span className={cn("text-[10px] font-black uppercase px-2 py-0.5 rounded-full", item.qty > originalItem!.qty ? "bg-rose-100 text-rose-600" : "bg-green-100 text-green-600")}>
                               {item.qty > originalItem!.qty ? "Increase" : "Decrease"}
                             </span>
                           )}
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 shrink-0">
                          <button onClick={() => handleQtyChange(item.id, -1)} className="w-10 h-10 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"><Minus className="w-4 h-4" /></button>
                          <div className="w-12 text-center font-black italic text-lg">{item.qty}</div>
                          <button onClick={() => handleQtyChange(item.id, 1)} className="w-10 h-10 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"><Plus className="w-4 h-4" /></button>
                        </div>
                        <div className="w-20 text-right">
                          <div className="text-sm font-black italic">${(item.price * item.qty).toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button className="w-full mt-8 py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-sm font-bold flex items-center justify-center gap-2 hover:border-violet-300 hover:text-violet-500 hover:bg-violet-50/30 transition-all group">
                <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" />
                Add More Items to this Order
              </button>
            </div>

            <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden p-8">
               <GlowingBorder spread={50} borderWidth={1} />
               <h3 className="text-xl font-black italic tracking-tight mb-4 flex items-center gap-2">
                 <FileText className="w-5 h-5 text-violet-500" />
                 Reason for Amendment
               </h3>
               <textarea 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Inventory miscount during morning shift / Surge in customer demand for weekend..."
                className="w-full h-32 bg-slate-50 dark:bg-slate-950 border-none rounded-[1.5rem] p-4 text-sm focus:ring-2 focus:ring-violet-500 transition-all font-medium italic"
               />
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 dark:bg-white rounded-[2rem] p-8 text-white dark:text-slate-900 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-violet-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
               <h3 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Updated Total</h3>
               <div className="text-5xl font-black italic tracking-tighter mb-8">${currentTotal.toFixed(2)}</div>
               
               <div className="space-y-4 mb-8">
                 <div className="flex justify-between items-center text-xs font-bold">
                    <span className="opacity-60 uppercase">Previous Total</span>
                    <span className="opacity-80">${originalTotal.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs font-bold">
                    <span className="opacity-60 uppercase">Adjustment</span>
                    <span className={cn(diff >= 0 ? "text-rose-400" : "text-green-400")}>{diff >= 0 ? "+" : ""}${diff.toFixed(2)}</span>
                 </div>
                 <div className="h-px bg-white/10 dark:bg-slate-900/10 w-full" />
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-violet-400">New Grand Total</span>
                    <span className="text-xl font-black italic">${currentTotal.toFixed(2)}</span>
                 </div>
               </div>

               <button className="group relative w-full py-4 rounded-2xl bg-violet-500 text-white font-black italic tracking-tight text-base flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden shadow-xl">
                  Submit Amendment
                  <NeonEdges color="violet" active />
                  <Save className="w-5 h-5" />
               </button>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-500 border border-amber-100 dark:border-amber-900/30">
                     <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-black italic">Important Rules</h4>
               </div>
               
               <div className="space-y-4">
                  <div className="flex gap-3">
                     <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                     <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                        Suppliers have <span className="text-slate-900 dark:text-white underline">2 hours</span> to accept or reject this amendment request.
                     </p>
                  </div>
                  <div className="flex gap-3">
                     <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                     <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                        Delivery slots may shift if new items significantly increase cargo volume.
                     </p>
                  </div>
                  <div className="flex gap-3">
                     <TrendingUp className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                     <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                        Price matching is locked to the original PO timestamp. No surcharges applied.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
