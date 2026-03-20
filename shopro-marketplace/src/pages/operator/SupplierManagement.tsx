"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Plus, 
  Truck, 
  ShieldCheck, 
  AlertCircle,
  MoreVertical,
  ArrowUpRight,
  Package,
  Star,
  Clock,
  ExternalLink,
  Briefcase,
  CheckCircle2
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

const SUPPLIERS = [
  { id: "S-001", name: "Global Coffee Traders", category: "Beverages", volume: "$1.4M", status: "active", trust: 99, fulfillment: 99.8, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=100&h=100&fit=crop" },
  { id: "S-002", name: "Fresh Dairy Solutions", category: "Dairy", volume: "$840.5k", status: "active", trust: 94, fulfillment: 96.2, image: "https://images.unsplash.com/photo-1563636619-e910cf493996?w=100&h=100&fit=crop" },
  { id: "S-003", name: "Prime Meat Co.", category: "Provisions", volume: "$320.1k", status: "pending", trust: 0, fulfillment: 0, image: "https://images.unsplash.com/photo-1551028150-64b9f398f678?w=100&h=100&fit=crop" },
  { id: "S-004", name: "Baker's Secret", category: "Pantry", volume: "$120.4k", status: "active", trust: 88, fulfillment: 84.5, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&h=100&fit=crop" },
];

export default function SupplierManagement() {
  const [filter, setFilter] = useState("all");
  const glowRef = useGlowingBorder();

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic flex items-center gap-3">
               Supply <span className="text-violet-500">Nodes</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic">
               <Truck className="w-4 h-4 text-violet-500" />
               Vendor ecosystem management and performance audits
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="group relative px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold italic flex items-center gap-2 hover:shadow-lg transition-all">
                <ShieldCheck className="w-4 h-4" />
                Compliance
                <NeonEdges />
             </button>
             <button className="group relative px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold italic flex items-center gap-2 hover:scale-[1.02] transition-all overflow-hidden shadow-xl">
                <Plus className="w-4 h-4" />
                Onboard Vendor
                <NeonEdges color="violet" />
             </button>
          </div>
        </header>

        {/* Supplier Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
           {[
             { label: "Active Vendors", val: "482", change: "+4 New", icon: Truck, color: "blue" },
             { label: "Avg Fulfillment", val: "94.8%", change: "Industry High", icon: Star, color: "amber" },
             { label: "Total Payable", val: "$4.1M", change: "Current Cycle", icon: Briefcase, color: "violet" },
             { label: "Alerts", val: "12", change: "Unresolved", icon: AlertCircle, color: "rose" },
           ].map((stat, i) => (
             <div key={i} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 shadow-xl flex items-center justify-between overflow-hidden group relative">
                <GlowingBorder spread={30} borderWidth={1} />
                <div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</div>
                   <div className="text-3xl font-black italic tracking-tight">{stat.val}</div>
                   <div className={cn("text-[10px] font-black uppercase mt-1", stat.color === 'rose' ? 'text-rose-500' : 'text-slate-400')}>{stat.change}</div>
                </div>
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", `bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-500`)}>
                   <stat.icon className="w-6 h-6" />
                </div>
             </div>
           ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 px-2">
           <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {["All", "Beverages", "Dairy", "Meat", "Produce", "Pantry"].map(t => (
                <button key={t} onClick={() => setFilter(t.toLowerCase())} className={cn("px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap", filter === t.toLowerCase() ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl scale-105" : "text-slate-400 hover:text-slate-900 dark:hover:text-white")}>
                   {t}
                </button>
              ))}
           </div>
           <div className="relative group max-w-sm w-full">
              <input type="text" placeholder="Search vendor name, SKU, or ID..." className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-xs font-medium italic focus:ring-2 focus:ring-violet-500 transition-all shadow-sm" />
              <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
           </div>
        </div>

        {/* Vendor Table */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden p-2 group relative">
           <GlowingBorder spread={100} borderWidth={1} />
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Vendor Node</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Fulfillment</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Trust Score</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Volume (YTD)</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
                    <th className="p-6"></th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 relative z-10">
                 {SUPPLIERS.map(sup => (
                   <tr key={sup.id} className="group/tr hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all cursor-pointer">
                      <td className="p-6">
                         <div className="flex items-center gap-4">
                            <img src={sup.image} className="w-12 h-12 rounded-2xl object-cover shadow-lg group-hover/tr:scale-105 transition-transform" />
                            <div>
                               <div className="text-sm font-black italic">{sup.name}</div>
                               <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">{sup.id}</div>
                            </div>
                         </div>
                      </td>
                      <td className="p-6">
                         <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">{sup.category}</span>
                      </td>
                      <td className="p-6">
                         <div className="space-y-1.5 w-32">
                            <div className="flex justify-between text-[8px] font-black uppercase">
                               <span className="text-slate-400">Accuracy</span>
                               <span className="text-violet-500">{sup.fulfillment}%</span>
                            </div>
                            <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                               <motion.div initial={{ width: 0 }} animate={{ width: `${sup.fulfillment}%` }} className="h-full bg-violet-500 rounded-full shadow-[0_0_8px_#8b5cf6]" />
                            </div>
                         </div>
                      </td>
                      <td className="p-6">
                         <div className="flex items-center gap-1.5">
                            <div className={cn("text-sm font-black italic", sup.trust > 90 ? "text-green-500" : "text-amber-500")}>{sup.trust}%</div>
                            <ShieldCheck className={cn("w-3.5 h-3.5", sup.trust > 90 ? "text-green-500" : "text-amber-500")} />
                         </div>
                      </td>
                      <td className="p-6 text-right font-black italic text-lg">{sup.volume}</td>
                      <td className="p-6 text-right">
                         <span className={cn(
                           "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                           sup.status === 'active' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                         )}>
                            {sup.status}
                         </span>
                      </td>
                      <td className="p-6 text-right">
                         <div className="flex items-center justify-end gap-2 opacity-0 group-hover/tr:opacity-100 transition-opacity">
                            <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"><ExternalLink className="w-4 h-4" /></button>
                            <button className="relative px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase italic shadow-lg hover:scale-[1.05] transition-all">
                               Audit
                               <NeonEdges color="violet" />
                            </button>
                         </div>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>

        {/* Global Action Banner */}
        <div className="mt-12 p-10 bg-gradient-to-r from-violet-600 to-indigo-700 rounded-[3rem] text-white shadow-3xl overflow-hidden relative group">
           <div className="absolute top-[-50%] left-[-10%] w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] pointer-events-none" />
           <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
              <div className="flex-1">
                 <h3 className="text-3xl font-black italic tracking-tighter mb-4 leading-none">Automated Vendor Reliability Index</h3>
                 <p className="text-white/60 text-sm font-medium max-w-2xl italic leading-relaxed">
                    AI is currently auditing fulfillment patterns across the meat sector. Merchants with less than 90% accuracy will be throttled from the smart-matching algorithm.
                 </p>
              </div>
              <button className="shrink-0 px-10 py-4 rounded-2xl bg-white text-slate-900 font-black italic uppercase tracking-widest hover:scale-[1.05] transition-all shadow-2xl flex items-center gap-3">
                 Generate Global Report
                 <ArrowUpRight className="w-5 h-5" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
