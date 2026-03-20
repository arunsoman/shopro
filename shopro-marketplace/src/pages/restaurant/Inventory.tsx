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
  Minus, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle,
  Package,
  Boxes,
  Activity,
  Filter,
  MoreVertical,
  History,
  TrendingDown,
  RefreshCw,
  AlertCircle
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

export function CircularProgress({ value, max, label, color = "violet" }: { value: number; max: number; label: string; color?: string }) {
  const percentage = (value / max) * 100;
  const stroke = color === "violet" ? "#8b5cf6" : color === "green" ? "#10b981" : "#f59e0b";
  
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90">
          <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-800" />
          <motion.circle 
            cx="48" cy="48" r="40" 
            stroke={stroke} strokeWidth="8" 
            fill="transparent" 
            strokeDasharray="251.2"
            initial={{ strokeDashoffset: 251.2 }}
            animate={{ strokeDashoffset: 251.2 - (251.2 * percentage) / 100 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-black italic">{Math.round(percentage)}%</span>
        </div>
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
    </div>
  );
}

// ─── PAGE COMPONENT ──────────────────────────────────────────────────────────

const STOCK_ITEMS = [
  { id: "1", name: "Premium Arabica Beans", current: 12, min: 20, max: 100, unit: "kg", category: "Coffee", status: "low" },
  { id: "2", name: "Whole Milk", current: 85, min: 40, max: 200, unit: "L", category: "Dairy", status: "ok" },
  { id: "3", name: "Brown Sugar", current: 4, min: 10, max: 50, unit: "kg", category: "Pantry", status: "critical" },
  { id: "4", name: "Oat Milk (Barista)", current: 120, min: 60, max: 300, unit: "L", category: "Dairy", status: "ok" },
  { id: "5", name: "Vanilla Syrup", current: 18, min: 5, max: 40, unit: "bot", category: "Syrups", status: "ok" },
];

export default function Inventory() {
  const [filter, setFilter] = useState("all");
  const glowRef = useGlowingBorder();

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-black p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic flex items-center gap-3">
              Stock <span className="text-violet-500">Intelligence</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic">
               <Activity className="w-4 h-4 text-green-500" />
               Real-time inventory levels for Main Kitchen
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="group relative px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold italic flex items-center gap-2 hover:shadow-lg transition-all">
                <History className="w-4 h-4" />
                Audit Logs
                <NeonEdges />
             </button>
             <button className="group relative px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold italic flex items-center gap-2 hover:scale-[1.02] transition-all overflow-hidden shadow-xl">
                <Plus className="w-4 h-4" />
                Manual Adjustment
                <NeonEdges color="violet" />
             </button>
          </div>
        </header>

        {/* Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           {[
             { label: "Total Asset Value", value: "$45,820", trend: "+12.4%", icon: Boxes, color: "violet" },
             { label: "Low Stock Items", value: "3", trend: "-2", icon: AlertTriangle, color: "amber" },
             { label: "Out of Stock", value: "0", trend: "0", icon: Package, color: "green" },
             { label: "Daily Consumption", value: "$1,240", trend: "+$240", icon: TrendingDown, color: "blue" },
           ].map((stat, i) => (
             <div key={i} className="relative bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 shadow-xl overflow-hidden group">
                <GlowingBorder spread={30} borderWidth={1} />
                <div className="flex justify-between items-start mb-4">
                   <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", `bg-${stat.color}-50 text-${stat.color}-500 dark:bg-${stat.color}-900/20`)}>
                      <stat.icon className="w-5 h-5" />
                   </div>
                   <div className={cn("text-[10px] font-black uppercase px-2 py-1 rounded-lg", stat.trend.startsWith('+') ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-600")}>
                      {stat.trend}
                   </div>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</div>
                <div className="text-2xl font-black italic tracking-tight">{stat.value}</div>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Alerts & Suggestions */}
           <div className="lg:col-span-4 space-y-6">
              <div className="relative bg-rose-500 rounded-[2.5rem] p-8 text-white shadow-2xl overflow-hidden group">
                 <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                 <AlertCircle className="w-10 h-10 mb-6 opacity-60" />
                 <h2 className="text-2xl font-black italic tracking-tight mb-2 leading-tight">Critical Depletion</h2>
                 <p className="text-white/60 text-xs font-medium mb-8 leading-relaxed italic">
                    <span className="text-white font-bold">Brown Sugar</span> has reached its minimum safety threshold (4kg).
                 </p>
                 <button className="w-full py-4 rounded-2xl bg-white text-rose-500 font-black italic text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
                    Restock Now
                    <ArrowUpRight className="w-4 h-4" />
                 </button>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 shadow-xl relative overflow-hidden">
                 <GlowingBorder spread={50} borderWidth={1} />
                 <h3 className="text-sm font-black italic mb-8 flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-violet-500" />
                    Storage Capacity
                 </h3>
                 <div className="grid grid-cols-2 gap-4">
                    <CircularProgress value={75} max={100} label="Dry Storage" color="violet" />
                    <CircularProgress value={42} max={100} label="Cold Room" color="green" />
                 </div>
                 <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 italic">
                    <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                       Dry storage is approaching 80%. Consider delaying bulk purchases of non-perishables.
                    </p>
                 </div>
              </div>
           </div>

           {/* Main Inventory Table */}
           <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 px-2">
                 <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                    {["All", "Coffee", "Dairy", "Pantry", "Syrups"].map(cat => (
                      <button key={cat} onClick={() => setFilter(cat.toLowerCase())} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all truncate", filter === cat.toLowerCase() ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-lg" : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400")}>
                        {cat}
                      </button>
                    ))}
                 </div>
                 <div className="relative group">
                    <input type="text" placeholder="Filter items..." className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs w-full md:w-64 focus:ring-2 focus:ring-violet-500 transition-all font-medium" />
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden p-2">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="border-b border-slate-100 dark:border-slate-800">
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Item Name</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Stock Level</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
                          <th className="p-4"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                       {STOCK_ITEMS.map(item => (
                         <tr key={item.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                            <td className="p-4">
                               <div className="font-bold text-slate-900 dark:text-white leading-tight">{item.name}</div>
                               <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">ID: SKU-{item.id}00X</div>
                            </td>
                            <td className="p-4">
                               <span className="text-[10px] font-black uppercase text-violet-500 bg-violet-50 dark:bg-violet-900/20 px-2 py-1 rounded-lg">{item.category}</span>
                            </td>
                            <td className="p-4">
                               <div className="flex flex-col items-center gap-1.5 min-w-[120px]">
                                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                                     <motion.div 
                                       initial={{ width: 0 }}
                                       animate={{ width: `${(item.current / item.max) * 100}%` }}
                                       transition={{ duration: 1, delay: 0.2 }}
                                       className={cn("h-full rounded-full transition-colors", item.status === 'critical' ? 'bg-rose-500' : item.status === 'low' ? 'bg-amber-500' : 'bg-green-500')}
                                     />
                                  </div>
                                  <div className="text-[10px] font-bold italic">{item.current} / {item.max} {item.unit}</div>
                               </div>
                            </td>
                            <td className="p-4 text-right">
                               <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", item.status === 'critical' ? 'bg-rose-50 text-rose-600 border-rose-200' : item.status === 'low' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-green-50 text-green-600 border-green-200')}>
                                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                  {item.status.replace('_', ' ')}
                               </span>
                            </td>
                            <td className="p-4 text-right">
                               <button className="p-2 text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                                  <MoreVertical className="w-4 h-4" />
                               </button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>

                 <div className="p-6 text-center border-t border-slate-50 dark:border-slate-800">
                    <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-violet-500 transition-colors flex items-center gap-2 mx-auto italic">
                       Load More Inventory Items
                       <RefreshCw className="w-3 h-3" />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
