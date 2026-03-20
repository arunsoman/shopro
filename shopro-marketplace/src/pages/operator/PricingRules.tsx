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
  DollarSign, 
  Percent, 
  Tag, 
  MoreVertical,
  ArrowRight,
  TrendingUp,
  Scale,
  Calculator,
  Gavel,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  ShieldCheck,
  Settings2,
  Database
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
  { id: "PR-001", name: "Standard Marketplace Markup", type: "Base", value: "8.5%", target: "All Categories", status: "active", priority: 1, lastModified: "2h ago" },
  { id: "PR-002", name: "Premium Coffee Surcharge", type: "Category", value: "+2.5%", target: "Beverages > Coffee", status: "active", priority: 5, lastModified: "Yesterday" },
  { id: "PR-003", name: "Corporate Franchise Discount", type: "Merchant", value: "-3.0%", target: "Level 4 Merchants", status: "inactive", priority: 10, lastModified: "3 days ago" },
  { id: "PR-004", name: "Logistic Surge (Dairy)", type: "Seasonal", value: "+1.2%", target: "Dairy", status: "active", priority: 3, lastModified: "12h ago" },
];

export default function PricingRules() {
  const [filter, setFilter] = useState("all");
  const glowRef = useGlowingBorder();

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic flex items-center gap-3">
               Pricing <span className="text-violet-500">Engine</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic">
               <Scale className="w-4 h-4 text-violet-500" />
               Algorithmic yield management and strategy forge
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="group relative px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold italic flex items-center gap-2 hover:shadow-lg transition-all">
                <Calculator className="w-4 h-4" />
                Price Simulator
                <NeonEdges />
             </button>
             <button className="group relative px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold italic flex items-center gap-2 hover:scale-[1.02] transition-all overflow-hidden shadow-xl">
                <Plus className="w-4 h-4" />
                New Strategy Rule
                <NeonEdges color="violet" />
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Active Rules Inventory */}
           <div className="lg:col-span-8 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden group relative p-10">
                 <GlowingBorder spread={100} borderWidth={1} />
                 
                 <div className="flex items-center justify-between mb-10 relative z-10">
                    <h3 className="text-xl font-black italic flex items-center gap-2 tracking-tight">
                       <Gavel className="w-5 h-5 text-violet-500" />
                       Strategy Pipeline
                    </h3>
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
                       {["Active", "Archived"].map(t => (
                         <button key={t} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", t === "Active" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-400")}>
                            {t}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4 relative z-10">
                    {RULES.map(rule => (
                      <div key={rule.id} className="group/rule p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border border-transparent hover:border-violet-200 dark:hover:border-violet-900/40 transition-all cursor-pointer">
                         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                               <div className={cn(
                                 "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover/rule:scale-110",
                                 rule.status === 'active' ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-300"
                               )}>
                                  {rule.type === 'Base' ? <Database className="w-6 h-6" /> : 
                                   rule.type === 'Category' ? <Tag className="w-6 h-6" /> : 
                                   <TrendingUp className="w-6 h-6" />}
                               </div>
                               <div>
                                  <h4 className="text-lg font-black italic tracking-tight mb-1">{rule.name}</h4>
                                  <div className="flex items-center gap-3">
                                     <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{rule.target}</span>
                                     <div className="w-1 h-1 rounded-full bg-slate-200" />
                                     <span className="text-[10px] font-black uppercase text-violet-500 tracking-widest italic">Priority {rule.priority}</span>
                                  </div>
                               </div>
                            </div>
                            
                            <div className="flex items-center justify-between md:justify-end gap-10">
                               <div className="text-right">
                                  <div className={cn("text-2xl font-black italic leading-none mb-1", rule.value.startsWith('+') ? 'text-rose-500' : rule.value.startsWith('-') ? 'text-emerald-500' : 'text-slate-900 dark:text-white')}>
                                     {rule.value}
                                  </div>
                                  <div className="text-[9px] font-black uppercase opacity-40">Modifier Value</div>
                               </div>
                               <div className="flex items-center gap-2">
                                  <button className="p-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-100 dark:border-slate-800 shadow-sm"><Settings2 className="w-4.5 h-4.5" /></button>
                                  <button className="p-2.5 rounded-xl text-slate-300 hover:text-rose-500 transition-all"><MoreVertical className="w-4.5 h-4.5" /></button>
                               </div>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Live Preview & Analytics Sidebar */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-3xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 rounded-full blur-[100px]" />
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-6 italic tracking-widest">Pricing Pulse</h3>
                 
                 <div className="space-y-8 relative z-10">
                    <div>
                       <div className="flex justify-between items-end mb-4">
                          <div className="text-3xl font-black italic tracking-tighter">18.4%</div>
                          <div className="text-emerald-400 text-[10px] font-black uppercase flex items-center gap-1">Optimal <ShieldCheck className="w-3 h-3" /></div>
                       </div>
                       <div className="text-[10px] font-black uppercase text-white/40 mb-3 italic tracking-widest">Mean Weighted Margin</div>
                       <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: "74%" }} className="h-full bg-violet-500 shadow-[0_0_15px_#8b5cf6]" />
                       </div>
                    </div>

                    <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                       <h4 className="text-[11px] font-black uppercase italic tracking-widest mb-4 opacity-60">Revenue Impact (Est)</h4>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <div className="text-lg font-black italic">+$12.4k</div>
                             <div className="text-[9px] font-black uppercase opacity-30 mt-1">Daily Uplift</div>
                          </div>
                          <div>
                             <div className="text-lg font-black italic">96.4%</div>
                             <div className="text-[9px] font-black uppercase opacity-30 mt-1">Capture Rate</div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl p-8 group relative overflow-hidden">
                 <GlowingBorder spread={30} borderWidth={1} />
                 <h3 className="text-lg font-black italic mb-6 flex items-center gap-2">
                    <Zap className="w-4.5 h-4.5 text-amber-500" />
                    Surge Alerts
                 </h3>
                 <div className="space-y-4">
                    <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                       <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                       <div>
                          <p className="text-[11px] font-black italic text-slate-800 dark:text-slate-200">Competitor Undercut</p>
                          <p className="text-[10px] text-slate-400 font-medium italic mt-1 leading-relaxed">Meat prices in Region UAE-W are 4% lower than your current base.</p>
                       </div>
                    </div>
                    <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                       <Clock className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
                       <div>
                          <p className="text-[11px] font-black italic text-slate-800 dark:text-slate-200">Rule Expiry</p>
                          <p className="text-[10px] text-slate-400 font-medium italic mt-1 leading-relaxed">Seasonal Dairy Surge (PR-004) expires in 48 hours.</p>
                       </div>
                    </div>
                 </div>
                 <button className="w-full mt-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase italic tracking-widest hover:scale-[1.02] transition-all shadow-lg relative">
                    Optimize Strategy
                    <NeonEdges color="violet" />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
