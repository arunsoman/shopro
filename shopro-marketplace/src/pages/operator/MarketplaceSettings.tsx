"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Settings, 
  Globe, 
  DollarSign, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Lock, 
  Layout, 
  Flag, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Bell,
  Cpu,
  Layers,
  Save,
  Rocket,
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

export default function MarketplaceSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const glowRef = useGlowingBorder();

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-8 font-black italic">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl tracking-tighter uppercase flex items-center gap-3">
               Control <span className="text-rose-500">Tower</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic">
               <Cpu className="w-4 h-4 text-rose-500" />
               Global marketplace governance and operational constraints
            </p>
          </div>
          
          <button className="group relative px-10 py-5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all overflow-hidden shadow-xl">
             Commit Changes
             <NeonEdges color="rose" />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           {/* Sidebar Navigation */}
           <div className="lg:col-span-3 space-y-3">
              {[
                { id: "general", label: "General Config", icon: Globe },
                { id: "payouts", label: "Commission & Payouts", icon: DollarSign },
                { id: "onboarding", label: "Onboarding Policy", icon: ShieldCheck },
                { id: "modules", label: "Module Matrix", icon: Layers },
                { id: "notifications", label: "Platform Alerts", icon: Bell },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={cn("w-full p-6 rounded-[2rem] flex items-center gap-4 transition-all border font-black uppercase tracking-tight", 
                    activeTab === tab.id ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xl" : "bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-400")}>
                   <tab.icon className={cn("w-6 h-6", activeTab === tab.id ? "text-rose-500" : "text-slate-300")} />
                   {tab.label}
                   {activeTab === tab.id && <ChevronRight className="ml-auto w-5 h-5" />}
                </button>
              ))}
           </div>

           {/* Config Panel */}
           <div className="lg:col-span-9">
              <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 p-16 shadow-2xl relative overflow-hidden group">
                 <GlowingBorder spread={120} borderWidth={1} />
                 
                 <AnimatePresence mode="wait">
                    {activeTab === 'general' && (
                      <motion.div key="general" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12 relative z-10">
                         <div className="space-y-4">
                            <h3 className="text-3xl uppercase tracking-tighter leading-none mb-8">Platform Identity</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               <div className="space-y-2">
                                  <label className="text-[10px] uppercase tracking-widest text-slate-400">Default Currency</label>
                                  <select className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm outline-none">
                                     <option>AED - UAE Dirham</option>
                                     <option>USD - US Dollar</option>
                                  </select>
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] uppercase tracking-widest text-slate-400">Primary Timezone</label>
                                  <select className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm outline-none">
                                     <option>(GMT+04:00) Abu Dhabi, Muscat</option>
                                     <option>(GMT+00:00) London, UTC</option>
                                  </select>
                               </div>
                            </div>
                         </div>

                         <div className="p-10 bg-rose-50 dark:bg-rose-500/5 rounded-[2.5rem] border border-rose-100 dark:border-rose-500/10">
                            <div className="flex items-start gap-4 mb-6">
                               <AlertTriangle className="w-8 h-8 text-rose-500 shrink-0" />
                               <div>
                                  <h4 className="text-xl uppercase tracking-tight mb-2">Strict Mode Active</h4>
                                  <p className="text-[10px] text-slate-500 uppercase leading-none italic">All inventory changes must be cryptographically signed by an auditor role.</p>
                               </div>
                               <div className="ml-auto w-12 h-6 bg-rose-500 rounded-full flex items-center px-1">
                                  <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                               </div>
                            </div>
                         </div>

                         <div className="space-y-8 pt-8 border-t border-slate-100 dark:border-slate-800/40">
                            <h4 className="text-sm uppercase tracking-widest text-slate-400">Marketplace Branding</h4>
                            <div className="flex items-center gap-8">
                               <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                                  <RefreshCw className="w-6 h-6 text-slate-400" />
                               </div>
                               <div className="space-y-2">
                                  <div className="text-xs">Main Logotype</div>
                                  <div className="text-[9px] text-slate-400 uppercase tracking-widest">SVG, PNG, JPG (Max 2MB)</div>
                                  <button className="text-[9px] text-rose-500 hover:text-rose-600 uppercase border-b border-rose-500/20">Upload New</button>
                               </div>
                            </div>
                         </div>
                      </motion.div>
                    )}
                    
                    {activeTab === 'modules' && (
                      <motion.div key="modules" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10 relative z-10">
                         <h3 className="text-3xl uppercase tracking-tighter leading-none mb-8 italic">Feature Matrix</h3>
                         <div className="grid gap-6">
                            {[
                              { label: "AI Sourcing Wizard", desc: "Algorithmic supplier recommendations", active: true },
                              { label: "Auto-Settlement", desc: "Programmatic clearing at midnight UTC", active: true },
                              { label: "Dispute Arbitration", desc: "Manual intervention workflow", active: false },
                              { label: "Multi-Sig Payouts", desc: "Two-factor disbursement approval", active: true },
                            ].map((mod, i) => (
                              <div key={i} className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] flex items-center justify-between group/mod hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                 <div>
                                    <div className="text-lg uppercase mb-1">{mod.label}</div>
                                    <div className="text-[9px] text-slate-400 uppercase tracking-widest">{mod.desc}</div>
                                 </div>
                                 <div className={cn("w-14 h-7 rounded-full flex items-center px-1 transition-colors", mod.active ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700")}>
                                    <div className={cn("w-5 h-5 bg-white rounded-full shadow-lg transition-transform", mod.active && "translate-x-7")} />
                                 </div>
                              </div>
                            ))}
                         </div>
                      </motion.div>
                    )}
                 </AnimatePresence>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
