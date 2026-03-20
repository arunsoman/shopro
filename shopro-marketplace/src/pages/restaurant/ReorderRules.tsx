"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Zap, 
  TrendingUp, 
  Target, 
  ShieldCheck, 
  Settings2,
  AlertCircle,
  Clock,
  ArrowRight,
  Plus,
  Trash2,
  Info,
  BarChart3,
  Bot
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

const RULES = [
  { id: "r1", item: "Premium Arabica Beans", current: 20, suggested: 35, confidence: 98, status: "active", reason: "Increased weekend demand forecast (Eid Al-Fitr)" },
  { id: "r2", item: "Whole Milk", current: 40, suggested: 60, confidence: 94, status: "active", reason: "Supplier lead time increased by 8h" },
  { id: "r3", item: "Oat Milk - Barista", current: 30, suggested: 30, confidence: 85, status: "paused", reason: "Stable consumption pattern" },
];

export default function ReorderRules() {
  const glowRef = useGlowingBorder();

  return (
    <div className="min-h-screen bg-white dark:bg-black p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic flex items-center gap-3">
               Predictive <span className="text-violet-500">Logistics</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic">
               <Sparkles className="w-4 h-4 text-violet-500" />
               AI-optimized reorder thresholds and supply rules
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="group relative px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold italic flex items-center gap-2 hover:shadow-lg transition-all">
                <Settings2 className="w-4 h-4" />
                Global Params
                <NeonEdges />
             </button>
             <button className="group relative px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold italic flex items-center gap-2 hover:scale-[1.02] transition-all overflow-hidden shadow-xl">
                <Plus className="w-4 h-4" />
                Create New Rule
                <NeonEdges color="violet" />
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* AI Insight Header */}
           <div className="lg:col-span-12">
              <div className="relative bg-slate-900 rounded-[3rem] p-10 text-white shadow-3xl overflow-hidden group">
                 <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px] group-hover:scale-110 transition-transform duration-[2000ms]" />
                 <div className="absolute bottom-[-20%] left-[-5%] w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]" />
                 
                 <div className="flex flex-col lg:flex-row lg:items-center gap-10 relative z-10">
                    <div className="flex-1 space-y-6">
                       <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-[10px] font-black uppercase tracking-widest text-violet-400">
                          <Zap className="w-3 h-3 fill-current" />
                          Neural Optimizer Active
                       </div>
                       <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter leading-none">
                          Save up to <span className="text-violet-500">$2,450</span> monthly by optimizing thresholds.
                       </h2>
                       <p className="text-white/40 text-sm font-bold italic max-w-xl leading-relaxed">
                          Our models suggest increasing safety stock for <span className="text-white">Dairy imports</span> due to upcoming logistics congestion at Jebel Ali Port.
                       </p>
                    </div>
                    
                    <div className="flex shrink-0 gap-6">
                       <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 backdrop-blur-xl flex flex-col items-center">
                          <BarChart3 className="w-8 h-8 text-violet-500 mb-2" />
                          <div className="text-2xl font-black italic">+12%</div>
                          <div className="text-[10px] font-black uppercase opacity-40">Efficiency</div>
                       </div>
                       <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 backdrop-blur-xl flex flex-col items-center">
                          <ShieldCheck className="w-8 h-8 text-green-500 mb-2" />
                          <div className="text-2xl font-black italic">99.8%</div>
                          <div className="text-[10px] font-black uppercase opacity-40">Reliability</div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Active Rules List */}
           <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between px-2">
                 <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Active Threshold Rules</h3>
                 <div className="text-[10px] font-bold text-slate-500">3 Rules Managed by AI</div>
              </div>

              <div className="space-y-4">
                 {RULES.map(rule => (
                   <div key={rule.id} className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl p-8 group overflow-hidden transition-all duration-500 hover:-translate-y-1">
                      <GlowingBorder spread={50} borderWidth={1} />
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                         <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                               <div className={cn("w-2 h-2 rounded-full", rule.status === 'active' ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-slate-300")} />
                               <h4 className="text-xl font-black italic tracking-tight truncate">{rule.item}</h4>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                               <span className="flex items-center gap-1.5"><Bot className="w-3.5 h-3.5 text-violet-500" /> AI Suggested</span>
                               <span className="w-1 h-1 rounded-full bg-slate-200" />
                               <span>ID: AUTO-{rule.id.toUpperCase()}</span>
                            </div>
                         </div>

                         <div className="flex items-center gap-8 shrink-0">
                            <div className="text-center">
                               <div className="text-[10px] font-black uppercase text-slate-400 mb-1">Threshold</div>
                               <div className="flex items-center gap-2">
                                  <span className="text-lg font-black italic opacity-40 line-through">{rule.current}</span>
                                  <ArrowRight className="w-4 h-4 text-violet-500" />
                                  <span className="text-2xl font-black italic text-violet-500">{rule.suggested}</span>
                               </div>
                            </div>
                            <div className="text-center">
                               <div className="text-[10px] font-black uppercase text-slate-400 mb-1">Confidence</div>
                               <div className="text-xl font-black italic">{rule.confidence}%</div>
                            </div>
                            <div className="flex flex-col gap-2">
                               <button className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 className="w-4.5 h-4.5" /></button>
                               <button className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-violet-500 transition-colors"><Settings2 className="w-4.5 h-4.5" /></button>
                            </div>
                         </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-start gap-3">
                         <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                         <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic">
                            "{rule.reason}"
                         </p>
                      </div>

                      {rule.status === 'paused' && (
                        <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                           <button className="px-8 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-black italic shadow-2xl hover:scale-105 transition-all">
                              Resume Optimization
                           </button>
                        </div>
                      )}
                   </div>
                 ))}
              </div>
           </div>

           {/* Dashboard Sidebar */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-xl relative overflow-hidden group">
                 <GlowingBorder spread={40} borderWidth={1} />
                 <h3 className="text-sm font-black italic mb-8 flex items-center gap-2">
                    <Target className="w-4 h-4 text-violet-500" />
                    Automation Policy
                 </h3>
                 <div className="space-y-6">
                    <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-transparent hover:border-violet-300 transition-all cursor-pointer">
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black italic">Auto-PO Generation</span>
                          <div className="w-10 h-6 bg-violet-500 rounded-full flex items-center justify-end p-1">
                             <div className="w-4 h-4 bg-white rounded-full" />
                          </div>
                       </div>
                       <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-tighter">
                          System will automatically send POs when thresholds are hit.
                       </p>
                    </div>

                    <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-transparent hover:border-violet-300 transition-all cursor-pointer">
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black italic">Supplier Routing</span>
                          <div className="w-10 h-6 bg-slate-200 rounded-full flex items-center justify-start p-1">
                             <div className="w-4 h-4 bg-slate-400 rounded-full" />
                          </div>
                       </div>
                       <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-tighter">
                          AI picks cheapest supplier automatically.
                       </p>
                    </div>
                 </div>
              </div>

              <div className="bg-violet-600 rounded-[2.5rem] p-8 text-white shadow-3xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                 <TrendingUp className="w-10 h-10 mb-6 opacity-60" />
                 <h3 className="text-xl font-black italic tracking-tight mb-2 leading-tight">Demand Heatmap</h3>
                 <p className="text-white/60 text-xs font-medium mb-6 leading-relaxed italic">
                    Forecast shows a 15% spike in coffee beverage demand for next week.
                 </p>
                 <div className="flex items-end gap-1 h-12 mb-6">
                    {[3, 5, 4, 7, 8, 6, 9].map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h * 10}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="flex-1 bg-white/20 rounded-t-sm"
                      />
                    ))}
                 </div>
                 <button className="w-full py-3 rounded-xl bg-white text-violet-600 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.05]">
                    View Detailed Forecast
                 </button>
              </div>

              <div className="p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-800 rounded-3xl flex items-start gap-4 italic group">
                 <Clock className="w-8 h-8 text-amber-500 shrink-0 group-hover:rotate-12 transition-transform" />
                 <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold leading-relaxed">
                    AI updates thresholds every 6 hours based on point-of-sale data and supplier lead times.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
