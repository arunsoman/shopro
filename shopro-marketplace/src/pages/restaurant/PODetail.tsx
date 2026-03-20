"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  MessageSquare,
  ArrowUpRight,
  MoreVertical,
  Download,
  Printer,
  Edit3,
  Undo2,
  Calendar
} from "lucide-react";

// ─── DNA PRIMITIVES ──────────────────────────────────────────────────────────
const SPRING = { type: "spring" as const, stiffness: 500, damping: 30, mass: 1 };
const EASE_OUT_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";
const GLOW_GRADIENT = `radial-gradient(circle, #dd7bbb 10%, #dd7bbb00 20%), radial-gradient(circle at 40% 40%, #d79f1e 5%, #d79f1e00 15%), radial-gradient(circle at 60% 60%, #5a922c 10%, #5a922c00 20%), radial-gradient(circle at 40% 60%, #4c7894 10%, #4c789400 20%), repeating-conic-gradient(from 236.84deg at 50% 50%, #dd7bbb 0%, #d79f1e calc(25% / 5), #5a922c calc(50% / 5), #4c7894 calc(75% / 5), #dd7bbb calc(100% / 5))`;

const STATUS_COLORS = {
  pending_approval: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
  in_transit: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800",
  delivered: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800",
};

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

function NeonEdges({ active = false, color = "blue" }: { active?: boolean; color?: "blue" | "violet" | "green" | "rose" }) {
  const via = color === "violet" ? "via-violet-500" : color === "green" ? "via-green-400" : color === "rose" ? "via-rose-500" : "via-blue-500";
  return (<>
    <span className={cn("pointer-events-none absolute h-px inset-x-0 top-0 bg-gradient-to-r w-3/4 mx-auto from-transparent to-transparent transition-all duration-500 ease-in-out", via, active ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100")} />
    <span className={cn("pointer-events-none absolute inset-x-0 h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent to-transparent transition-opacity duration-500 ease-in-out", via, active ? "opacity-30" : "opacity-0 group-hover:opacity-30 group-focus-within:opacity-30")} />
  </>);
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

export function OrderTimeline({ steps }: { steps: any[] }) {
  return (
    <div className="flex flex-col gap-0">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-4 group">
          <div className="flex flex-col items-center">
            <div className={cn(
              "relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 z-10",
              step.completed ? "bg-green-500 text-white" : step.current ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 ring-2 ring-violet-500 ring-offset-2" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
            )}>
               {step.completed ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
               {step.current && <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-full bg-violet-500/30" />}
            </div>
            {i < steps.length - 1 && (
              <div className={cn("w-[2px] h-12 my-1 transition-all duration-1000", step.completed ? "bg-green-500" : "bg-slate-200 dark:bg-slate-800")} />
            )}
          </div>
          <div className="pb-8 pt-0.5">
            <div className={cn("text-sm font-bold tracking-tight transition-colors", step.completed || step.current ? "text-slate-900 dark:text-white" : "text-slate-400")}>{step.title}</div>
            <div className="text-xs text-slate-500 mt-0.5">{step.description}</div>
            {step.timestamp && <div className="text-[10px] uppercase font-bold text-slate-400 mt-2 tracking-widest">{step.timestamp}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── PAGE COMPONENT ──────────────────────────────────────────────────────────

const PO_DATA = {
  id: "PO-82921-X",
  status: "in_transit",
  supplier: {
    name: "Global Coffee Traders",
    contact: "Sarah Jenkins",
    phone: "+1 (555) 012-3456",
    address: "822 Industrial Way, Portland, OR",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=100&h=100&fit=crop"
  },
  dates: {
    placed: "Mar 20, 2024 · 09:42 AM",
    expected: "Mar 22, 2024",
    slot: "Morning (08:00 - 11:00)"
  },
  items: [
    { id: "1", name: "Premium Arabica Beans", price: 45.0, qty: 10, unit: "kg" },
    { id: "2", name: "Whole Milk - Case of 12", price: 28.5, qty: 4, unit: "case" },
    { id: "3", name: "Oat Milk - Barista Edition", price: 34.0, qty: 2, unit: "case" },
  ],
  log: [
    { title: "Order Placed", description: "PO-82921-X was generated and sent.", timestamp: "20 Mar · 09:42", completed: true },
    { title: "Confirmed by Supplier", description: "Sarah Jenkins accepted the order.", timestamp: "20 Mar · 11:15", completed: true },
    { title: "Dispatched", description: "Package is with our logistics partner.", timestamp: "21 Mar · 08:30", completed: true, current: true },
    { title: "Delivery", description: "Estimated arrival Tomorrow.", timestamp: "22 Mar · AM Slot", completed: false },
  ]
};

export default function PODetail() {
  const glowRef = useGlowingBorder();
  const subtotal = PO_DATA.items.reduce((acc, i) => acc + i.price * i.qty, 0);

  return (
    <div className="min-h-screen bg-slate-50/30 dark:bg-black p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-2">
          <div className="space-y-1">
            <button className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-violet-500 transition-colors uppercase tracking-widest mb-2">
              <ChevronLeft className="w-3 h-3" />
              Back to Orders
            </button>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-black tracking-tighter italic">{PO_DATA.id}</h1>
              <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm", STATUS_COLORS[PO_DATA.status as keyof typeof STATUS_COLORS])}>
                In Transit
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="group relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg transition-all">
              <Printer className="w-4 h-4 text-slate-600" />
              <NeonEdges />
            </button>
            <button className="group relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg transition-all">
              <Download className="w-4 h-4 text-slate-600" />
              <NeonEdges />
            </button>
            <button className="group relative px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold italic flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden shadow-xl">
              <Edit3 className="w-4 h-4" />
              Request Amendment
              <NeonEdges color="violet" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Items Card */}
            <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden group">
              <GlowingBorder spread={100} borderWidth={1} />
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black italic tracking-tight flex items-center gap-2">
                    <Package className="w-5 h-5 text-violet-500" />
                    Itemized Breakdown
                  </h2>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                    {PO_DATA.items.length} Unique SKUs
                  </div>
                </div>

                <div className="space-y-1">
                  {PO_DATA.items.map((item, i) => (
                    <div key={item.id} className="group/row flex items-center gap-4 py-4 px-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black italic text-slate-400 group-hover/row:text-violet-500 transition-colors">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-900 dark:text-white leading-tight">{item.name}</div>
                        <div className="text-xs text-slate-500 uppercase font-black tracking-tighter mt-0.5">${item.price.toFixed(2)} per {item.unit}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black italic text-slate-900 dark:text-white">x{item.qty}</div>
                        <div className="text-xs font-bold text-violet-500">${(item.price * item.qty).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t-2 border-dashed border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-end">
                    <div className="space-y-4 flex-1">
                       <div className="flex items-center gap-6">
                          <div>
                            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Subtotal</div>
                            <div className="text-xl font-black italic">${subtotal.toFixed(2)}</div>
                          </div>
                          <div className="text-green-500">
                            <div className="text-[10px] font-black uppercase tracking-widest mb-1">Tax (0%)</div>
                            <div className="text-lg font-black italic">VAT Exempt</div>
                          </div>
                       </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Grand Total</div>
                      <div className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white">${subtotal.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attachments & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all group relative">
                 <GlowingBorder spread={30} borderWidth={1} />
                 <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 italic">Attachments</h3>
                 <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 group/file cursor-pointer">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">PO-INV-82921.pdf</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Tax Invoice · 1.2 MB</div>
                    </div>
                    <Download className="w-4 h-4 text-slate-300 group-hover/file:text-slate-900 transition-colors" />
                 </div>
               </div>
               <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all group relative">
                 <GlowingBorder spread={30} borderWidth={1} />
                 <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 italic">Internal Note</h3>
                 <p className="text-sm text-slate-600 dark:text-slate-400 font-medium italic italic leading-relaxed">
                   "Please ensure unloading is done at B-Sector loading dock. Regular morning staff will be available for inspection."
                 </p>
               </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-6">
            {/* Status Tracking */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 shadow-xl relative overflow-hidden">
              <GlowingBorder spread={100} borderWidth={1} />
              <h2 className="text-xl font-black italic tracking-tight mb-8">Live Status</h2>
              <OrderTimeline steps={PO_DATA.log} />
              <button className="w-full mt-4 group relative py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all overflow-hidden italic">
                Track Shipment Details
                <ArrowUpRight className="w-4 h-4" />
                <NeonEdges color="blue" />
              </button>
            </div>

            {/* Supplier Quick Card */}
            <div className="bg-slate-900 rounded-[2rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
               <div className="flex gap-4 items-center mb-8">
                  <img src={PO_DATA.supplier.image} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/10" />
                  <div>
                    <h3 className="text-white font-black italic text-lg leading-tight">{PO_DATA.supplier.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                       <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                       <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Always On Time</span>
                    </div>
                  </div>
               </div>
               
               <div className="space-y-5 mb-8">
                  <div className="flex items-center gap-3 text-white/60">
                     <Truck className="w-4 h-4" />
                     <span className="text-xs font-semibold truncate">{PO_DATA.supplier.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/60">
                     <Calendar className="w-4 h-4" />
                     <span className="text-xs font-semibold">{PO_DATA.dates.slot}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/60">
                     <MessageSquare className="w-4 h-4" />
                     <span className="text-xs font-semibold">Sarah: "Loading now, will arrive early."</span>
                  </div>
               </div>

               <button className="group relative w-full py-4 rounded-2xl bg-white text-slate-900 font-black italic tracking-tight text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-all overflow-hidden shadow-xl">
                  Message Supplier
                  <NeonEdges color="violet" />
               </button>
            </div>

            {/* Danger Zone / Cancel */}
            <div className="p-4 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 rounded-3xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <AlertCircle className="w-5 h-5 text-rose-500" />
                 <div className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-tight">Requires Attention?</div>
              </div>
              <button className="text-[11px] font-black text-rose-600 hover:underline uppercase tracking-widest">Cancel PO</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
