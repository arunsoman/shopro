"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Clock, 
  Calendar, 
  Settings, 
  Trash2, 
  Plus, 
  Play, 
  Pause, 
  RefreshCw, 
  Database, 
  Activity, 
  ShieldCheck, 
  Search,
  ChevronRight,
  Timer,
  FileCode,
  Zap,
  MoreVertical,
  History
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

const SCHEDULES = [
  { id: "JOB-402", name: "Daily Settlement Cleave", cron: "00 00 * * *", lastRun: "12h ago", nextRun: "11h from now", target: "TreasuryEngine", status: "Active" },
  { id: "JOB-118", name: "Low Performance Pruning", cron: "0 0 * * 0", lastRun: "6d ago", nextRun: "1d from now", target: "SupplierNexus", status: "Active" },
  { id: "JOB-882", name: "Hourly Catalog Sync", cron: "0 * * * *", lastRun: "45m ago", nextRun: "15m from now", target: "UnifiedSku", status: "Active" },
  { id: "JOB-045", name: "Audit Ledger Backup", cron: "30 02 * * *", lastRun: "22h ago", nextRun: "2h from now", target: "ForensicDrive", status: "Active" },
];

export default function WorkflowSchedules() {
  const glowRef = useGlowingBorder();

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-8 font-black italic">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4 font-black italic uppercase">
          <div className="space-y-1 text-slate-900 dark:text-white">
            <h1 className="text-4xl md:text-5xl tracking-tighter flex items-center gap-3 italic">
               Temporal <span className="text-indigo-500">Registry</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic leading-none">
               <Timer className="w-4 h-4 text-indigo-500" />
               Scheduled micro-tasks and periodic system resonance
            </p>
          </div>
          
          <button className="group relative px-10 py-5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all overflow-hidden shadow-xl">
             Schedule Job
             <NeonEdges color="violet" />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           {/* Job Register */}
           <div className="lg:col-span-12">
              <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-xl p-12 group relative overflow-hidden font-black italic">
                 <GlowingBorder spread={80} borderWidth={1} />
                 
                 <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 relative z-10 gap-6">
                    <h3 className="text-3xl tracking-tighter uppercase leading-none italic">Recurring Operations</h3>
                    <div className="flex gap-4 p-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800">
                       <div className="flex items-center gap-2 px-6 py-2 bg-white dark:bg-slate-900 rounded-xl text-[10px] uppercase tracking-widest text-indigo-500">
                          <Activity className="w-4 h-4" /> 24h Cycles
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    {SCHEDULES.map(job => (
                      <div key={job.id} className="p-10 bg-slate-50 dark:bg-slate-800/40 rounded-[3.5rem] border border-transparent hover:border-indigo-200 dark:hover:border-indigo-900/40 transition-all group/row cursor-pointer shadow-sm">
                         <div className="flex flex-col gap-10">
                            <div className="flex items-start justify-between">
                               <div className="space-y-4">
                                  <div className="flex items-center gap-2 text-[9px] text-indigo-500 font-bold uppercase tracking-[0.3em]">{job.id}</div>
                                  <h4 className="text-3xl tracking-tighter uppercase leading-none italic">{job.name}</h4>
                                  <div className="flex items-center gap-3 text-slate-400">
                                     <FileCode className="w-5 h-5 opacity-40" />
                                     <span className="text-sm font-mono tracking-tighter lowercase">{job.cron}</span>
                                  </div>
                               </div>
                               <button className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-50 dark:border-slate-800 hover:scale-110 transition-transform">
                                  <Pause className="w-5 h-5 text-indigo-500" />
                               </button>
                            </div>

                            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-100 dark:border-slate-800/40">
                               <div>
                                  <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-3 opacity-60">Last Execution</div>
                                  <div className="text-xl italic leading-none">{job.lastRun}</div>
                               </div>
                               <div>
                                  <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-3 opacity-60">Next Cycle</div>
                                  <div className="text-xl italic leading-none text-indigo-500">{job.nextRun}</div>
                               </div>
                            </div>

                            <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-widest italic pt-6">
                               <div className="flex items-center gap-2">
                                  <Database className="w-4 h-4 text-slate-300" />
                                  Target: <span className="text-slate-500">{job.target}</span>
                               </div>
                               <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                  Active
                               </div>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Metrics Grid */}
           <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-3xl relative overflow-hidden group font-black italic uppercase">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
                 <h3 className="text-[10px] tracking-[0.2em] opacity-40 mb-10 leading-none">Cluster Concurrency</h3>
                 <div className="text-7xl tracking-tighter mb-4 italic">64</div>
                 <div className="flex items-center gap-2 text-[10px] opacity-40 tracking-widest">
                    <Zap className="w-4 h-4 text-indigo-500" /> Parallel Job capacity
                 </div>
              </div>

              <div className="md:col-span-2 bg-indigo-600 rounded-[3rem] p-12 text-white shadow-3xl relative overflow-hidden group font-black italic uppercase">
                 <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[80px]" />
                 <h3 className="text-[10px] tracking-[0.2em] opacity-40 mb-12 leading-none">Job Resonance (24h)</h3>
                 <div className="flex items-end justify-between h-32 gap-3">
                    {[12, 18, 45, 30, 85, 40, 60, 95, 30, 45, 20, 15, 60, 55, 30, 10].map((h, i) => (
                      <div key={i} className="flex-1 bg-white/20 rounded-t-sm group-hover:bg-white/40 transition-colors" style={{ height: `${h}%` }} />
                    ))}
                 </div>
                 <div className="flex justify-between mt-6 text-[9px] opacity-40 tracking-widest">
                    <span>00:00</span>
                    <span>Synchronous Peaks</span>
                    <span>23:59</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
