"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Terminal, 
  Activity, 
  Search, 
  Filter, 
  Trash2, 
  ChevronRight, 
  Clock, 
  Database, 
  ShieldCheck, 
  Cpu,
  Brain,
  Zap,
  Info,
  AlertTriangle,
  History,
  GitBranch,
  RefreshCw
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

const EVENTS = [
  { id: "LOG-01", origin: "AI-Nexus", action: "Dynamic Re-sourcing", impact: "High", time: "12s ago", reason: "Supplier AMS-02 latency threshold exceed (450ms)", icon: Brain, status: "Success" },
  { id: "LOG-02", origin: "Cron-Auth", action: "Identity Flush", impact: "Low", time: "14m ago", reason: "Scheduled cleanup of expired session fragments", icon: RefreshCw, status: "Success" },
  { id: "LOG-03", origin: "Logic-Gate", action: "Commission Hedge", impact: "Med", time: "1h ago", reason: "Yield stability algorithm triggered for Tier-2 restaurants", icon: GitBranch, status: "Success" },
  { id: "LOG-04", origin: "Web-Relay", action: "Endpoint Retraction", impact: "Crit", time: "2h ago", reason: "Success rate dropped below 5% for wholesale.ae", icon: Zap, status: "Halted" },
];

export default function AutomationLog() {
  const glowRef = useGlowingBorder();

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-8 font-black italic">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4 font-black italic uppercase text-slate-900 dark:text-white">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl tracking-tighter flex items-center gap-3 italic">
               Action <span className="text-emerald-500">Ledger</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic leading-none">
               <History className="w-4 h-4 text-emerald-500" />
               Immutable trace of autonomous platform decisions
            </p>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
             <div className="px-6 py-3 bg-white dark:bg-slate-800 rounded-xl text-[10px] uppercase tracking-widest text-emerald-500 shadow-sm border border-slate-50 dark:border-slate-700/40">
                Live Feed
             </div>
             <div className="px-6 py-3 text-[10px] uppercase tracking-widest text-slate-400 opacity-60">
                Historical
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           {/* Event Stream */}
           <div className="lg:col-span-8 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-xl p-10 group relative overflow-hidden font-black italic uppercase">
                 <GlowingBorder spread={80} borderWidth={1} />
                 
                 <div className="flex items-center justify-between mb-10 relative z-10 gap-6">
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 px-6 py-4 rounded-3xl border border-slate-100 dark:border-slate-800 flex-1">
                       <Search className="w-5 h-5 text-slate-400" />
                       <input type="text" placeholder="Search Trace ID or Origin..." className="bg-transparent border-none outline-none text-xs w-full tracking-widest italic" />
                    </div>
                    <button className="p-4 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl hover:scale-105 transition-transform"><Filter className="w-5 h-5" /></button>
                 </div>

                 <div className="space-y-6 relative z-10">
                    {EVENTS.map(event => (
                      <div key={event.id} className="p-10 bg-slate-50 dark:bg-slate-800/40 rounded-[3rem] border border-transparent hover:border-emerald-200 dark:hover:border-emerald-900/40 transition-all group/row cursor-pointer">
                         <div className="flex flex-col gap-8">
                            <div className="flex items-start justify-between">
                               <div className="flex items-center gap-4">
                                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg", 
                                    event.impact === 'Crit' ? 'bg-rose-500 text-white' : 
                                    event.impact === 'High' ? 'bg-amber-500 text-white' : 'bg-white dark:bg-slate-900 text-emerald-500'
                                  )}>
                                     <event.icon className="w-8 h-8" />
                                  </div>
                                  <div>
                                     <div className="flex items-center gap-2 text-[9px] text-emerald-500 font-bold tracking-[0.3em] mb-1 leading-none">{event.id} • {event.origin}</div>
                                     <h4 className="text-2xl tracking-tighter uppercase leading-none italic">{event.action}</h4>
                                  </div>
                               </div>
                               <div className="text-right">
                                  <div className="text-xl italic leading-none mb-2">{event.time}</div>
                                  <div className={cn("px-4 py-1.5 rounded-full text-[9px] font-black italic tracking-widest leading-none", 
                                    event.status === 'Success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                                  )}>
                                     {event.status}
                                  </div>
                               </div>
                            </div>
                            
                            <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/40">
                               <div className="text-[8px] text-slate-400 font-black tracking-widest mb-4 opacity-60">Decision Context</div>
                               <p className="text-xs text-slate-500 font-medium leading-relaxed italic">{event.reason}</p>
                            </div>

                            <div className="flex items-center justify-between text-[10px] tracking-widest pt-4 opacity-40">
                               <div className="flex items-center gap-2">
                                  <ShieldCheck className="w-4 h-4" /> Policy: Autonomic-Strict-v4
                               </div>
                               <button className="text-emerald-500 hover:text-emerald-600 transition-colors flex items-center gap-1 font-black">
                                  Review Logic <ChevronRight className="w-4 h-4" />
                               </button>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Stats Sentinel */}
           <div className="lg:col-span-4 space-y-8 font-black italic uppercase">
              <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-3xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
                 <h3 className="text-[10px] tracking-[0.2em] opacity-40 mb-10 leading-none">Decision ROI</h3>
                 <div className="text-7xl tracking-tighter mb-4 italic text-emerald-500">92%</div>
                 <div className="text-[10px] opacity-40 tracking-widest leading-none mb-10 italic">Platform Autonomy Index</div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-white/5 rounded-2xl border border-white/5 text-center">
                       <div className="text-lg">0.4s</div>
                       <div className="text-[8px] opacity-40">Decision Latency</div>
                    </div>
                    <div className="p-5 bg-white/5 rounded-2xl border border-white/5 text-center">
                       <div className="text-lg text-emerald-500">+12%</div>
                       <div className="text-[8px] opacity-40">Efficiency Delta</div>
                    </div>
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl p-10 group relative overflow-hidden">
                 <GlowingBorder spread={30} borderWidth={1} />
                 <h3 className="text-xl mb-10 flex items-center gap-3 tracking-tighter leading-none italic">
                   <AlertTriangle className="w-7 h-7 text-rose-500" />
                   Recent Halts
                 </h3>
                 <div className="space-y-6 relative z-10">
                    <div className="p-8 bg-rose-50 dark:bg-rose-500/5 rounded-3xl border border-rose-100 dark:border-rose-500/10">
                       <div className="text-[9px] text-rose-500 mb-2">WH-RELAY-FAILURE</div>
                       <div className="text-sm italic leading-tight">Circuit breaker tripped for domain: wholesale.ae</div>
                       <div className="flex items-center gap-4 mt-8">
                          <button className="flex-1 py-4 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-[9px] tracking-widest font-black italic">Override</button>
                          <button className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl"><Info className="w-5 h-5 text-slate-400" /></button>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
