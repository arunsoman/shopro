"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  RotateCcw, 
  SkipForward, 
  Pause, 
  Play, 
  Plus, 
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Package,
  ArrowRight,
  ClipboardList,
  Edit3,
  CalendarDays
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
  { id: "S-102", name: "Daily Fresh Dairy", frequency: "Every Day", time: "05:00 AM", items: 8, status: "active", next: "Tomorrow, 05:00 AM", color: "blue" },
  { id: "S-105", name: "Weekly Pantry Stock", frequency: "Every Monday", time: "08:00 AM", items: 24, status: "active", next: "Mar 25, 08:00 AM", color: "violet" },
  { id: "S-109", name: "Bi-Weekly Specialty Coffee", frequency: "Every 2nd Tuesday", time: "09:30 AM", items: 4, status: "paused", next: "Apr 02, 09:30 AM", color: "amber" },
];

export default function Schedules() {
  const glowRef = useGlowingBorder();

  return (
    <div className="min-h-screen bg-slate-50/20 dark:bg-black p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic flex items-center gap-3">
               Cyclic <span className="text-violet-500">Flow</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic">
               <RotateCcw className="w-4 h-4 text-violet-500" />
               Automated recurring procurement cycles
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="group relative px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold italic flex items-center gap-2 hover:shadow-lg transition-all">
                <CalendarDays className="w-4 h-4" />
                Master Calendar
                <NeonEdges />
             </button>
             <button className="group relative px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold italic flex items-center gap-2 hover:scale-[1.02] transition-all overflow-hidden shadow-xl">
                <Plus className="w-4 h-4" />
                Schedule Order
                <NeonEdges color="violet" />
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Schedule List Area */}
           <div className="lg:col-span-8 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden p-8 group relative">
                 <GlowingBorder spread={100} borderWidth={1} />
                 <div className="flex items-center justify-between mb-8 relative z-10">
                    <h2 className="text-xl font-black italic tracking-tight flex items-center gap-2">
                       <ClipboardList className="w-5 h-5 text-violet-500" />
                       Active Protocols
                    </h2>
                    <div className="flex items-center gap-2">
                       {["Live", "Paused", "Archived"].map(t => (
                         <button key={t} className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">{t}</button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4 relative z-10">
                    {SCHEDULES.map(s => (
                      <div key={s.id} className="p-6 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-transparent hover:border-violet-300 dark:hover:border-violet-800 transition-all group/item flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden">
                         <div className={cn(
                           "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-lg",
                           s.color === 'blue' ? 'bg-blue-500 text-white shadow-blue-500/20' : s.color === 'violet' ? 'bg-violet-500 text-white shadow-violet-500/20' : 'bg-amber-500 text-white shadow-amber-500/20'
                         )}>
                            <CalendarIcon className="w-8 h-8" />
                         </div>

                         <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                               <h3 className="text-lg font-black italic tracking-tight">{s.name}</h3>
                               <span className="text-[9px] font-bold text-slate-400 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">{s.id}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                               <span className="flex items-center gap-1.5"><RotateCcw className="w-3 h-3" /> {s.frequency}</span>
                               <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {s.time}</span>
                               <span className="flex items-center gap-1.5"><Package className="w-3 h-3" /> {s.items} Items</span>
                            </div>
                         </div>

                         <div className="flex items-center gap-6 pr-4">
                            <div className="text-right">
                               <div className="text-[9px] font-black uppercase text-slate-400 mb-0.5 italic">Next Run</div>
                               <div className="text-xs font-black italic text-slate-900 dark:text-white">{s.next}</div>
                            </div>
                            <div className="flex items-center gap-2">
                               <button className="p-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition-all shadow-sm"><SkipForward className="w-5 h-5" /></button>
                               <button className="p-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl hover:scale-105 transition-all">
                                  {s.status === 'active' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                               </button>
                               <button className="p-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-400 hover:text-violet-500 transition-all shadow-sm"><Edit3 className="w-5 h-5" /></button>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="p-8 bg-slate-900 rounded-[3rem] text-white shadow-3xl overflow-hidden relative group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="space-y-4">
                       <h3 className="text-sm font-black italic tracking-widest opacity-40 uppercase">Upcoming Cycle Volume</h3>
                       <div className="flex items-end gap-3 h-20">
                          {[40, 70, 45, 90, 65, 30, 80].map((v, i) => (
                            <div key={i} className="flex-1 bg-white/10 rounded-t-xl group/bar relative overflow-hidden">
                               <motion.div initial={{ height: 0 }} animate={{ height: `${v}%` }} transition={{ duration: 1.5, delay: i * 0.1 }} className="absolute bottom-0 inset-x-0 bg-violet-500 rounded-t-xl" />
                            </div>
                          ))}
                       </div>
                       <div className="flex justify-between text-[10px] font-black uppercase text-white/40 italic">
                          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                       </div>
                    </div>
                    <div className="max-w-[240px] space-y-4 text-right md:text-left">
                       <div className="text-3xl font-black italic tracking-tighter leading-none">High Volume Peak: <span className="text-violet-400">Thursday</span></div>
                       <p className="text-[11px] font-medium text-white/40 italic leading-relaxed">System expects 12 POs across 5 suppliers. Ensure staff is ready for intake.</p>
                       <button className="text-xs font-black uppercase text-violet-400 flex items-center gap-2 ml-auto md:ml-0 italic">View Capacity Logic <ArrowRight className="w-4 h-4" /></button>
                    </div>
                 </div>
              </div>
           </div>

           {/* Quick Setup Sidebar */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-xl relative overflow-hidden group">
                 <GlowingBorder spread={30} borderWidth={1} />
                 <h3 className="text-lg font-black italic tracking-tight mb-8">Scheduling Presets</h3>
                 <div className="space-y-4">
                    {[
                      { icon: CheckCircle2, label: "Fresh Daily (Bread/Milk)", items: "8 Items" },
                      { icon: CheckCircle2, label: "Dry Stock (Weekly)", items: "45 Items" },
                      { icon: CheckCircle2, label: "Monthly Maintenance", items: "12 Items" },
                    ].map((p, i) => (
                      <button key={i} className="w-full p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-transparent hover:border-violet-300 transition-all text-left flex items-center justify-between group/p">
                         <div>
                            <div className="text-xs font-black italic">{p.label}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{p.items}</div>
                         </div>
                         <ArrowRight className="w-4 h-4 text-slate-300 group-hover/p:translate-x-1 group-hover/p:text-violet-500 transition-all" />
                      </button>
                    ))}
                 </div>
                 <button className="w-full mt-8 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all italic border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    Custom Interval
                 </button>
              </div>

              <div className="p-8 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-800 rounded-[2.5rem] flex flex-col gap-6 group overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl" />
                 <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
                    <AlertCircle className="w-7 h-7" />
                 </div>
                 <div>
                    <h4 className="text-lg font-black italic tracking-tight text-amber-900 dark:text-amber-400 mb-1 leading-none">Holiday Alert</h4>
                    <p className="text-[11px] font-medium text-amber-700/60 dark:text-amber-500/50 leading-relaxed italic">
                       Multiple suppliers have "Blackout Dates" coming up for the next lunar holiday. Check your Monday schedules.
                    </p>
                 </div>
                 <button className="w-full py-3 rounded-xl bg-amber-900 dark:bg-amber-500/20 text-white dark:text-amber-400 text-[10px] font-black uppercase tracking-widest transition-all italic">Manage Exclusions</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
