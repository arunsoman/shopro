"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Globe, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Filter, 
  Download,
  Activity,
  Zap,
  Target,
  Users,
  Briefcase,
  ChevronRight
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

export default function RevenueAnalytics() {
  const [timeframe, setTimeframe] = useState("30d");
  const glowRef = useGlowingBorder();

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic flex items-center gap-3">
               Revenue <span className="text-amber-500">Pulse</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic">
               <Activity className="w-4 h-4 text-amber-500" />
               Real-time marketplace yield and take-rate dynamics
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1 rounded-2xl border border-slate-100 dark:border-slate-800 italic">
                {["7d", "30d", "90d", "YTD"].map(t => (
                  <button key={t} className={cn("px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", timeframe === t ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg" : "text-slate-400 hover:text-slate-600")}>
                     {t}
                  </button>
                ))}
             </div>
             <button className="p-3.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl hover:scale-110 transition-all flex items-center justify-center">
                <Download className="w-5 h-5" />
             </button>
          </div>
        </header>

        {/* Dynamic GMV Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
           <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 p-12 shadow-2xl relative overflow-hidden group">
              <GlowingBorder spread={120} borderWidth={1} />
              
              <div className="flex justify-between items-start mb-12 relative z-10 font-black italic">
                 <div>
                    <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest mb-2">Marketplace GMV</h3>
                    <div className="text-6xl tracking-tighter">$4.82M</div>
                    <div className="mt-3 flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] w-fit italic">
                       <TrendingUp className="w-3 h-3" /> +12.4% vs last period
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Target Yield</div>
                    <div className="text-2xl text-amber-500">$5.0M</div>
                 </div>
              </div>

              <div className="h-64 flex items-end gap-3 relative z-10">
                 {[40, 55, 30, 70, 45, 90, 60, 85, 50, 75, 95, 80].map((h, i) => (
                   <div key={i} className="flex-1 group/bar relative">
                      <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.05 }}
                        className={cn("w-full bg-slate-100 dark:bg-slate-800 rounded-t-xl group-hover/bar:bg-amber-500 transition-colors", i === 10 ? "bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]" : "")} />
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-400 uppercase italic tracking-tighter">W{i+1}</div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="space-y-8">
              <div className="bg-amber-500 rounded-[3rem] p-10 text-white shadow-3xl relative overflow-hidden group flex flex-col justify-between h-[20rem]">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-[60px]" />
                 <div>
                    <h3 className="text-xs font-black uppercase tracking-widest mb-8 italic opacity-60">Avg. Take Rate</h3>
                    <div className="text-7xl font-black italic tracking-tighter leading-none mb-4">3.8<span className="text-4xl opacity-50">%</span></div>
                    <p className="text-xs font-medium italic opacity-80 leading-relaxed">Dynamic optimization engine current target: 4.0%</p>
                 </div>
                 <button className="w-full py-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase italic tracking-widest hover:bg-white/30 transition-all">Adjust Strategy</button>
              </div>

              <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-3xl relative overflow-hidden group flex flex-col justify-between h-[20rem]">
                 <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-violet-500/20 rounded-full blur-[60px]" />
                 <div>
                    <h3 className="text-xs font-black uppercase tracking-widest mb-8 italic opacity-60">Commission Revenue</h3>
                    <div className="text-5xl font-black italic tracking-tighter leading-none mb-4">$182.4k</div>
                    <div className="space-y-3">
                       <div className="flex justify-between items-center text-[10px] font-bold italic opacity-60 uppercase">
                          <span>SaaS Fees</span>
                          <span>$42k</span>
                       </div>
                       <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="w-1/3 h-full bg-amber-500" />
                       </div>
                    </div>
                 </div>
                 <div className="text-[9px] font-black uppercase tracking-widest italic flex items-center gap-2 text-amber-500">
                    <Target className="w-3.5 h-3.5" /> 92% of Monthly Goal
                 </div>
              </div>
           </div>
        </div>

        {/* Regional Pulse */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-12">
              <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 p-12 shadow-xl relative overflow-hidden group">
                 <GlowingBorder spread={60} borderWidth={1} />
                 
                 <div className="flex items-center justify-between mb-12 relative z-10">
                    <h3 className="text-2xl font-black italic tracking-tight flex items-center gap-3">
                       <Globe className="w-7 h-7 text-amber-500" />
                       Regional Performance Matrix
                    </h3>
                    <div className="text-[10px] font-black uppercase text-slate-400 italic flex items-center gap-2">
                       <Zap className="w-4 h-4 text-amber-500" /> AI Insights Active
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10 font-black italic">
                    {[
                      { city: "Dubai Marina", gmv: "$1.8M", orders: 4200, status: "Peak" },
                      { city: "Business Bay", gmv: "$1.2M", orders: 3100, status: "Growing" },
                      { city: "JLT Cluster", gmv: "$0.9M", orders: 2500, status: "Stabilizing" },
                      { city: "Sharjah Central", gmv: "$0.4M", orders: 1200, status: "New" },
                    ].map((region, i) => (
                      <div key={i} className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-transparent hover:border-amber-200 dark:hover:border-amber-900/40 transition-all cursor-pointer group/card">
                         <div className="text-xs text-slate-400 uppercase tracking-widest mb-6">{region.city}</div>
                         <div className="text-4xl tracking-tighter border-b border-slate-200 dark:border-slate-700 pb-4 mb-6 group-hover/card:text-amber-500 transition-colors">{region.gmv}</div>
                         <div className="space-y-4">
                            <div className="flex justify-between items-center text-[10px] uppercase opacity-60">
                               <span>Volume</span>
                               <span>{region.orders}</span>
                            </div>
                            <div className={cn("px-4 py-1.5 rounded-full text-[9px] uppercase tracking-widest text-center", i === 0 ? "bg-amber-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500")}>
                               {region.status}
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
