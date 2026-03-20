"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Cpu, 
  Zap, 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  Settings, 
  Activity, 
  ShieldCheck, 
  Globe, 
  Database,
  Search,
  ChevronRight,
  Code2,
  GitBranch,
  Layers,
  Sparkles,
  MoreVertical
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
  { id: "RL-101", name: "Dynamic Payout Threshold", type: "Financial", trigger: "order.settled", action: "adjust_commission", status: "Running" },
  { id: "RL-204", name: "Smart Inventory Routing", type: "Logistics", trigger: "stock.low", action: "reorder_optimal", status: "Running" },
  { id: "RL-085", name: "Dispute Auto-Escalation", type: "Support", trigger: "dispute.unresolved", action: "alert_auditor", status: "Paused" },
  { id: "RL-332", name: "Catalog Alignment Engine", type: "Catalog", trigger: "sku.ingress", action: "map_taxonomy", status: "Running" },
];

export default function AutomationLogic() {
  const glowRef = useGlowingBorder();

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-8 font-black italic">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4 font-black italic">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl tracking-tighter uppercase flex items-center gap-3 italic">
               Ghost <span className="text-amber-500">Orchestra</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic leading-none">
               <Sparkles className="w-4 h-4 text-amber-500" />
               Algorithmic decision engines and autonomous workflow resonance
            </p>
          </div>
          
          <button className="group relative px-10 py-5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all overflow-hidden shadow-xl">
             Forge Rule
             <NeonEdges color="amber" />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Logic Builder */}
           <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl p-10 group relative overflow-hidden">
                 <GlowingBorder spread={80} borderWidth={1} />
                 
                 <div className="flex items-center justify-between mb-10 relative z-10 font-black italic">
                    <h3 className="text-2xl tracking-tight uppercase leading-none">Active Algorithms</h3>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                       <Activity className="w-4 h-4 text-emerald-500" /> 12 rules active
                    </div>
                 </div>

                 <div className="space-y-4 relative z-10">
                    {RULES.map(rule => (
                      <div key={rule.id} className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] border border-transparent hover:border-amber-200 dark:hover:border-amber-900/40 transition-all group/row">
                         <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                            <div className="shrink-0 flex items-center justify-center w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl shadow-lg">
                               <GitBranch className="w-6 h-6 text-amber-500" />
                            </div>
                            
                            <div className="flex-1 space-y-4 w-full">
                               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  <div>
                                     <h4 className="text-xl uppercase tracking-tighter mb-1 italic">{rule.name}</h4>
                                     <div className="flex items-center gap-2 text-[8px] text-slate-400 uppercase tracking-widest font-black leading-none">
                                        <Code2 className="w-3.5 h-3.5" /> ID: {rule.id} • {rule.type}
                                     </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                     <div className={cn("px-4 py-1.5 rounded-full text-[8px] uppercase tracking-widest font-black italic", 
                                       rule.status === 'Running' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                                     )}>
                                        {rule.status}
                                     </div>
                                     <button className="p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm hover:scale-110 transition-transform"><MoreVertical className="w-4 h-4" /></button>
                                  </div>
                               </div>

                               <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-slate-900 px-6 py-4 rounded-3xl border border-slate-100 dark:border-slate-800 text-[10px] font-mono tracking-tighter flex-1 w-full justify-between">
                                  <div className="flex items-center gap-3">
                                     <span className="opacity-40 uppercase tracking-widest font-black italic">If</span>
                                     <span className="text-amber-500">{rule.trigger}</span>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-slate-300 hidden md:block" />
                                  <div className="flex items-center gap-3">
                                     <span className="opacity-40 uppercase tracking-widest font-black italic">Then</span>
                                     <span className="text-blue-500">{rule.action}</span>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Advanced Mapping Card */}
              <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-3xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-amber-500/10 rounded-full blur-[120px]" />
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-10 leading-none">Strategic Routing</h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                    <div className="space-y-6">
                       <h4 className="text-3xl tracking-tighter italic">Weighted Sourcing Algorithm</h4>
                       <p className="text-sm opacity-60 leading-relaxed font-medium">Automatic supplier allocation based on historical reliability, current peak performance, and geographical resonance.</p>
                       <div className="flex gap-4">
                          {["Price (40%)", "Speed (30%)", "Trust (30%)"].map(t => (
                            <span key={t} className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-[9px] uppercase tracking-widest">{t}</span>
                          ))}
                       </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5">
                       <div className="text-[8px] uppercase tracking-widest opacity-40 mb-6">Real-time Optimization</div>
                       <div className="space-y-4">
                          {[
                            { label: "CPU Cycles Saver", active: true },
                            { label: "Memory Flush", active: true },
                            { label: "Network Banding", active: false }
                          ].map((s, i) => (
                            <div key={i} className="flex items-center justify-between text-[10px] uppercase">
                               <span>{s.label}</span>
                               <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_8px]", s.active ? "bg-emerald-500 shadow-emerald-500/50" : "bg-white/20")} />
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Performance Sentinel */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl p-10 group relative overflow-hidden">
                 <GlowingBorder spread={30} borderWidth={1} />
                 <h3 className="text-xl italic mb-8 flex items-center gap-3 uppercase tracking-tighter">
                   <Activity className="w-6 h-6 text-amber-500" />
                   Decision Flow
                 </h3>
                 <div className="space-y-8 relative z-10">
                    <div>
                       <div className="text-6xl tracking-tighter leading-none mb-2 italic">14.2k</div>
                       <div className="text-[10px] uppercase text-slate-400 tracking-widest leading-none">Decisions (1h)</div>
                    </div>

                    <div className="space-y-6">
                       <div className="text-[8px] text-slate-400 uppercase tracking-widest font-black leading-none">Logic Latency</div>
                       <div className="flex items-center gap-4">
                          <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                             <div className="h-full bg-amber-500 w-[78%]" />
                          </div>
                          <span className="text-[10px] font-black italic">14ms</span>
                       </div>
                    </div>

                    <div className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] border border-transparent">
                       <h4 className="text-[9px] uppercase tracking-widest font-black leading-none mb-6">Impact Analysis</h4>
                       <div className="space-y-4">
                          <div className="flex items-center justify-between text-[10px] uppercase italic">
                             <span>Labor Saved</span>
                             <span className="text-emerald-500">+82h</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] uppercase italic">
                             <span>Error Reduction</span>
                             <span className="text-emerald-500">-14%</span>
                          </div>
                       </div>
                    </div>
                    
                    <button className="w-full py-5 mt-4 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] uppercase tracking-widest italic shadow-xl relative overflow-hidden group/btn font-black">
                       System Sandbox
                       <NeonEdges color="amber" />
                    </button>
                 </div>
              </div>

              <div className="bg-emerald-600 rounded-[3rem] p-10 text-white shadow-3xl relative overflow-hidden group font-black italic uppercase">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-[60px]" />
                 <h3 className="text-[10px] tracking-[0.2em] opacity-40 mb-10 leading-none">Orchestrator Integrity</h3>
                 
                 <div className="space-y-8 relative z-10">
                    <div className="flex items-center gap-4">
                       <ShieldCheck className="w-10 h-10 text-white/40" />
                       <div>
                          <div className="text-2xl tracking-tighter">Verified</div>
                          <div className="text-[8px] opacity-40">No race conditions detected</div>
                       </div>
                    </div>
                    
                    <div className="pt-6 border-t border-white/10 space-y-4">
                       <div className="flex justify-between text-[8px] opacity-60">
                          <span>Last Health Check</span>
                          <span>2m Ago</span>
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
