"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Package, 
  Truck, 
  Camera, 
  FileText, 
  AlertCircle,
  XCircle,
  ShieldCheck,
  Star,
  User,
  Signature
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

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

export function FileUpload({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-48 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex flex-col items-center justify-center gap-3 overflow-hidden group hover:border-violet-300 transition-all", className)}>
        <GlowingBorder spread={50} borderWidth={1} />
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
           <Camera className="w-6 h-6 text-slate-400 group-hover:text-violet-500" />
        </div>
        <div className="text-center">
           <div className="text-xs font-black uppercase text-slate-900 dark:text-white mb-1">Upload Inspection Photos</div>
           <div className="text-[10px] font-bold text-slate-400 tracking-tight">Tap to capture or drag images here</div>
        </div>
    </div>
  );
}

// ─── PAGE COMPONENT ──────────────────────────────────────────────────────────

const ITEMS = [
  { id: "1", name: "Premium Arabica Beans", price: 45.0, qty: 10, unit: "kg" },
  { id: "2", name: "Whole Milk - Case of 12", price: 28.5, qty: 4, unit: "case" },
  { id: "3", name: "Oat Milk - Barista Edition", price: 34.0, qty: 2, unit: "case" },
];

export default function DeliveryConfirmation() {
  const [verified, setVerified] = useState<Set<string>>(new Set());
  const [rating, setRating] = useState(0);
  const glowRef = useGlowingBorder();

  const toggleVerify = (id: string) => {
    setVerified(curr => {
      const next = new Set(curr);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allVerified = verified.size === ITEMS.length;

  return (
    <div className="min-h-screen bg-white dark:bg-black p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">
              <span>Orders</span>
              <ChevronRight className="w-3 h-3" />
              <span>PO-82921-X</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-violet-500">Confirm Receipt</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic flex items-center gap-3">
              Confirm <span className="text-violet-500">Delivery</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="text-right">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Driver</div>
                <div className="flex items-center gap-2 font-black italic">
                   <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600">
                      <User className="w-4 h-4" />
                   </div>
                   Mike Wheeler
                </div>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
             <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl p-8 overflow-hidden group">
                <GlowingBorder spread={100} borderWidth={1} />
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-xl font-black italic tracking-tight flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      Verify Items
                   </h2>
                   <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {verified.size}/{ITEMS.length} Checked
                   </div>
                </div>

                <div className="space-y-3">
                   {ITEMS.map(item => (
                     <div key={item.id} onClick={() => toggleVerify(item.id)} className={cn("group/item relative flex items-center gap-4 p-4 rounded-3xl border cursor-pointer transition-all duration-300", verified.has(item.id) ? "bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-800" : "bg-slate-50 border-transparent dark:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700")}>
                        <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all", verified.has(item.id) ? "bg-green-500 border-green-500 scale-110 shadow-lg" : "border-slate-300 dark:border-slate-700")}>
                           {verified.has(item.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex-1">
                           <div className={cn("font-black tracking-tight transition-all", verified.has(item.id) ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400")}>{item.name}</div>
                        </div>
                        <div className="font-black italic text-lg px-4 border-l border-slate-200 dark:border-slate-800">x{item.qty}</div>
                        <button className="p-2 opacity-0 group-hover/item:opacity-100 transition-opacity text-rose-500 hover:scale-110">
                           <XCircle className="w-5 h-5" />
                        </button>
                     </div>
                   ))}
                </div>

                <button className="w-full mt-6 py-4 rounded-2xl border-2 border-dashed border-rose-200 dark:border-rose-900 text-rose-500 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all italic">
                   Something is Missing / Damaged
                   <AlertCircle className="w-4 h-4" />
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUpload />
                <div className="relative p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col justify-between overflow-hidden group">
                   <GlowingBorder spread={30} borderWidth={1} />
                   <div className="flex flex-col gap-1">
                      <h3 className="text-xs font-black uppercase text-slate-400 italic">Digital Signature</h3>
                      <p className="text-[10px] font-bold text-slate-500 mb-4">Staff on duty must sign below</p>
                   </div>
                   <div className="flex-1 h-24 border-b border-slate-200 dark:border-slate-800 relative flex items-center justify-center">
                      <Signature className="w-16 h-16 text-slate-100 dark:text-slate-800 absolute" />
                      <div className="text-[10px] font-black italic text-slate-300 dark:text-slate-700 uppercase tracking-widest pointer-events-none">Sign Here</div>
                   </div>
                   <div className="flex justify-between items-center mt-4">
                      <div className="text-[10px] font-black italic">ID: 0291-KITCHEN</div>
                      <button className="text-[10px] font-black uppercase text-violet-500 underline">Clear</button>
                   </div>
                </div>
             </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
             <div className="p-8 bg-slate-900 dark:bg-white rounded-[2.5rem] text-white dark:text-slate-900 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-green-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-12 h-12 rounded-2xl bg-white/10 dark:bg-slate-900/10 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-green-400 dark:text-green-600" />
                   </div>
                   <h2 className="text-2xl font-black italic tracking-tight">Final Step</h2>
                </div>

                <div className="space-y-6 mb-8">
                   <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-3">Rate the Supplier</h3>
                      <div className="flex gap-2">
                         {[1, 2, 3, 4, 5].map(s => (
                           <button key={s} onClick={() => setRating(s)} className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", s <= rating ? "bg-amber-400 text-slate-900 shadow-lg scale-110" : "bg-white/5 dark:bg-black/5")}>
                              <Star className={cn("w-5 h-5", s <= rating ? "fill-current" : "")} />
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="p-4 bg-white/5 dark:bg-black/5 rounded-2xl border border-white/10 dark:border-black/5 italic text-sm opacity-80 leading-relaxed">
                      "Driver was punctual and handled the fragile milk cases with extreme care. Inventory matched PO exactly."
                   </div>
                </div>

                <button disabled={!allVerified} className={cn("group relative w-full py-5 rounded-2xl font-black italic tracking-tight text-lg flex items-center justify-center gap-2 transition-all overflow-hidden shadow-2xl", allVerified ? "bg-green-500 text-white hover:scale-[1.02] active:scale-[0.98]" : "bg-white/10 dark:bg-black/10 text-white/30 cursor-not-allowed")}>
                   Confirm Receipt & Close PO
                   <NeonEdges color="green" active={allVerified} />
                   <CheckCircle2 className="w-6 h-6" />
                </button>
                {!allVerified && <p className="text-[10px] text-center mt-3 font-bold uppercase tracking-widest opacity-40">Verify all items to proceed</p>}
             </div>

             <div className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 group relative">
                <GlowingBorder spread={30} borderWidth={1} />
                <h3 className="text-sm font-black italic mb-4 flex items-center gap-2">
                   <Truck className="w-5 h-5 text-blue-500" />
                   Delivery Details
                </h3>
                <div className="space-y-4">
                   <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Arrived At</span>
                      <span className="text-xs font-black italic">10:45 AM (15m Early)</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Vehicle</span>
                      <span className="text-xs font-black italic">White Sprinter · #OR-821</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Temperature Check</span>
                      <span className="text-xs font-black italic text-green-500">4.2°C (PASS)</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
