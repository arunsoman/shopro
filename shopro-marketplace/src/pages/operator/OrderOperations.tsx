"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Plus, 
  Package, 
  Filter, 
  Download, 
  ExternalLink, 
  MoreVertical,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertCircle,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Settings2
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

const ORDERS = [
  { id: "PO-2401", merchant: "Al Safadi Resto", supplier: "Global Foods Co.", value: "$12,450", status: "Processing", date: "2m ago", priority: "High" },
  { id: "PO-2402", merchant: "Bait Al Mandi", supplier: "Farm Fresh Dubai", value: "$4,120", status: "Shipped", date: "15m ago", priority: "Normal" },
  { id: "PO-2403", merchant: "Operation Falafel", supplier: "Elite Wholesale", value: "$8,900", status: "Pending", date: "1h ago", priority: "Urgent" },
  { id: "PO-2404", merchant: "Zou Zou Restaurant", supplier: "Prime Cuts", value: "$21,050", status: "Delivered", date: "3h ago", priority: "Normal" },
  { id: "PO-2405", merchant: "Nusr-Et Steakhouse", supplier: "Wagyu Prime", value: "$45,200", status: "Verification", date: "5h ago", priority: "Urgent" },
];

export default function OrderOperations() {
  const [filter, setFilter] = useState("all");
  const glowRef = useGlowingBorder();

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic flex items-center gap-3">
               Order <span className="text-violet-500">Flux</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic">
               <ShoppingBag className="w-4 h-4 text-violet-500" />
               Global marketplace transaction oversight and fulfillment auditing
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="group relative px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold italic flex items-center gap-2 hover:shadow-lg transition-all">
                <Download className="w-4 h-4" />
                Export Ledger
                <NeonEdges />
             </button>
             <button className="group relative px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold italic flex items-center gap-2 hover:scale-[1.02] transition-all overflow-hidden shadow-xl">
                <ShieldCheck className="w-4 h-4" />
                Intervene
                <NeonEdges color="violet" />
             </button>
          </div>
        </header>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
           <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 rounded-full blur-[100px]" />
              <div className="relative z-10">
                 <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 italic">Active Volume</div>
                 <div className="text-5xl font-black italic tracking-tighter mb-4">$1.24M</div>
                 <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase italic">
                    <TrendingUp className="w-4 h-4" /> +14.2% from last cycle
                 </div>
              </div>
           </div>
           
           <div className="md:col-span-2 grid grid-cols-2 gap-6">
              {[
                { label: "Transit Fleet", val: "42", icon: Truck, color: "blue" },
                { label: "Pending Review", val: "18", icon: Clock, color: "amber" },
                { label: "Issues Flagged", val: "3", icon: AlertCircle, color: "rose" },
                { label: "Fulfilled (24h)", val: "156", icon: CheckCircle2, color: "emerald" },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-xl flex items-center justify-between group relative overflow-hidden">
                   <GlowingBorder spread={30} borderWidth={1} />
                   <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</div>
                      <div className="text-3xl font-black italic tracking-tight">{stat.val}</div>
                   </div>
                   <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110", `bg-${stat.color}-500/10 text-${stat.color}-500`)}>
                      <stat.icon className="w-6 h-6" />
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Global Registry */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden group relative p-10">
           <GlowingBorder spread={100} borderWidth={1} />
           
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
              <h3 className="text-xl font-black italic flex items-center gap-2 tracking-tight">
                 <Package className="w-5 h-5 text-violet-500" />
                 Master Order Registry
              </h3>
              
              <div className="flex items-center gap-4">
                 <div className="relative">
                    <input type="text" placeholder="Search POs..." className="pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[10px] font-bold italic focus:ring-2 focus:ring-violet-500 w-64 shadow-sm" />
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                 </div>
                 <button className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200">
                    <Filter className="w-4.5 h-4.5" />
                 </button>
              </div>
           </div>

           <div className="overflow-x-auto relative z-10">
              <table className="w-full">
                 <thead>
                    <tr className="border-b border-slate-50 dark:border-slate-800">
                       <th className="text-left py-6 px-4 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] italic">PO Reference</th>
                       <th className="text-left py-6 px-4 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] italic">Stakeholders</th>
                       <th className="text-left py-6 px-4 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] italic">Gross Value</th>
                       <th className="text-left py-6 px-4 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] italic">Lifecycle</th>
                       <th className="text-left py-6 px-4 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] italic">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {ORDERS.map(order => (
                      <tr key={order.id} className="group/row hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                         <td className="py-6 px-4">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-violet-600 dark:text-violet-400 font-black italic text-xs">
                                  {order.id.slice(3)}
                               </div>
                               <div>
                                  <div className="text-xs font-black italic">{order.id}</div>
                                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{order.date}</div>
                               </div>
                            </div>
                         </td>
                         <td className="py-6 px-4">
                            <div className="flex flex-col gap-1">
                               <div className="text-xs font-bold flex items-center gap-1.5 italic">
                                  <div className="w-1 h-1 rounded-full bg-slate-900 dark:bg-white" />
                                  {order.merchant}
                               </div>
                               <div className="text-[9px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1.5 italic">
                                  <div className="w-1 h-1 rounded-full bg-slate-300" />
                                  Supplier: {order.supplier}
                               </div>
                            </div>
                         </td>
                         <td className="py-6 px-4 text-xs font-black italic tracking-tight">{order.value}</td>
                         <td className="py-6 px-4">
                            <div className="flex items-center gap-3">
                               <div className={cn(
                                 "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                 order.status === 'Delivered' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                                 order.status === 'Processing' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                 "bg-amber-50 text-amber-600 border-amber-100"
                               )}>
                                  {order.status}
                               </div>
                               <span className={cn(
                                 "text-[9px] font-black italic",
                                 order.priority === 'Urgent' ? 'text-rose-500 underline underline-offset-4 decoration-rose-200' : 'text-slate-300'
                               )}>
                                  {order.priority}
                               </span>
                            </div>
                         </td>
                         <td className="py-6 px-4">
                            <div className="flex items-center gap-2">
                               <button className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all text-slate-300 hover:text-slate-900 dark:hover:text-white"><ExternalLink className="w-4 h-4" /></button>
                               <button className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all text-slate-300 hover:text-slate-900 dark:hover:text-white"><Settings2 className="w-4 h-4" /></button>
                            </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between relative z-10">
              <div className="text-[10px] font-bold text-slate-400 italic">Showing 5 of 1,240 marketplace entries</div>
              <div className="flex items-center gap-2">
                 <button className="p-2 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-300 hover:text-slate-900 transition-all"><ChevronLeft className="w-4 h-4" /></button>
                 <div className="flex items-center gap-1">
                    {[1, 2, 3].map(p => (
                      <button key={p} className={cn("w-8 h-8 rounded-xl text-[10px] font-black italic transition-all", p === 1 ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg" : "text-slate-400 hover:text-slate-900")}>{p}</button>
                    ))}
                 </div>
                 <button className="p-2 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-300 hover:text-slate-900 transition-all"><ChevronRight className="w-4 h-4" /></button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
