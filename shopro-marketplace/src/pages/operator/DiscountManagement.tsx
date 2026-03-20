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
  Ticket, 
  Tag, 
  Calendar, 
  Users, 
  BarChart3,
  MoreVertical,
  ArrowRight,
  Gift,
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  ToggleLeft as Toggle,
  Settings2
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

const PROMOS = [
  { id: "DSC-901", code: "COFFEE24", name: "Q1 Coffee Surplus Rebate", type: "Promo Code", value: "15%", target: "Beans & Grounds", status: "active", usage: 1240, ends: "12d remaining" },
  { id: "DSC-002", name: "First Order Fuel", type: "Automatic", value: "$50 Off", target: "New Merchants", status: "active", usage: 45, ends: "Ongoing" },
  { id: "DSC-113", code: "DAIRYFAST", name: "Express Fulfillment Discount", type: "B2B Special", value: "5%", target: "Milk & Cream", status: "scheduled", usage: 0, ends: "Starts Apr 1" },
  { id: "DSC-882", name: "High Volume Seasonal", type: "Bulk", value: "10%", target: "Franchise Group A", status: "expired", usage: 8900, ends: "Ended Mar 15" },
];

export default function DiscountManagement() {
  const [filter, setFilter] = useState("all");
  const glowRef = useGlowingBorder();

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic flex items-center gap-3">
               Promo <span className="text-violet-500">Vault</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic">
               <Ticket className="w-4 h-4 text-violet-500" />
               Strategic incentive architecture and loyalty controls
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="group relative px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold italic flex items-center gap-2 hover:shadow-lg transition-all">
                <BarChart3 className="w-4 h-4" />
                Yield Report
                <NeonEdges />
             </button>
             <button className="group relative px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold italic flex items-center gap-2 hover:scale-[1.02] transition-all overflow-hidden shadow-xl">
                <Plus className="w-4 h-4" />
                Forge Campaign
                <NeonEdges color="violet" />
             </button>
          </div>
        </header>

        {/* Campaign Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
           {[
             { label: "Active Promos", val: "12", change: "4 Scheduled", icon: Gift, color: "rose" },
             { label: "Total Redemptions", val: "42.1k", change: "+852 today", icon: Users, color: "blue" },
             { label: "Revenue Sacrificed", val: "$124,050", change: "Within ROI", icon: Zap, color: "amber" },
             { label: "Avg Lift", val: "+24%", change: "Conversion High", icon: BarChart3, color: "emerald" },
           ].map((stat, i) => (
             <div key={i} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 shadow-xl flex items-center justify-between overflow-hidden group relative">
                <GlowingBorder spread={30} borderWidth={1} />
                <div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</div>
                   <div className="text-3xl font-black italic tracking-tight">{stat.val}</div>
                   <div className="text-[10px] font-black uppercase mt-1 text-slate-400">{stat.change}</div>
                </div>
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110", `bg-${stat.color}-500/10 text-${stat.color}-500`)}>
                   <stat.icon className="w-6 h-6" />
                </div>
             </div>
           ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 px-2">
           <div className="flex items-center gap-2">
              {["All", "Active", "Scheduled", "Draft", "Expired"].map(t => (
                <button key={t} onClick={() => setFilter(t.toLowerCase())} className={cn("px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", filter === t.toLowerCase() ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl scale-105" : "text-slate-400 hover:text-slate-900 dark:hover:text-white")}>
                   {t}
                </button>
              ))}
           </div>
           <div className="relative group max-w-sm w-full">
              <input type="text" placeholder="Search campaign name or code..." className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-xs font-medium italic focus:ring-2 focus:ring-violet-500 transition-all shadow-sm" />
              <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
           </div>
        </div>

        {/* Promo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {PROMOS.map(promo => (
             <div key={promo.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden group hover:-translate-y-1 transition-all duration-500 relative">
                <div className="p-8 pb-4">
                   <div className="flex justify-between items-start mb-6">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                        promo.status === 'active' ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "bg-slate-50 dark:bg-slate-800 text-slate-300"
                      )}>
                         <Ticket className="w-7 h-7" />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                         <span className={cn(
                           "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                           promo.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : promo.status === 'scheduled' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-slate-50 text-slate-400 border-slate-100"
                         )}>
                            {promo.status}
                         </span>
                         {promo.code && (
                           <div className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-lg text-[9px] font-black italic cursor-pointer hover:bg-violet-100 transition-colors">
                              {promo.code} <Copy className="w-3 h-3" />
                           </div>
                         )}
                      </div>
                   </div>
                   
                   <div className="mb-6 h-20">
                      <h3 className="text-xl font-black italic tracking-tight mb-2 leading-tight group-hover:text-violet-500 transition-colors">{promo.name}</h3>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                         <Tag className="w-3.5 h-3.5" /> {promo.target}
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-transparent group-hover:border-violet-100 dark:group-hover:border-violet-900 transition-all">
                         <div className="text-[8px] font-black uppercase text-slate-400 mb-0.5 tracking-tighter">Value</div>
                         <div className="text-2xl font-black italic text-violet-600">{promo.value}</div>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-transparent group-hover:border-violet-100 dark:group-hover:border-violet-900 transition-all">
                         <div className="text-[8px] font-black uppercase text-slate-400 mb-0.5 tracking-tighter">Usage</div>
                         <div className="text-2xl font-black italic">{promo.usage === 0 ? '—' : promo.usage.toLocaleString()}</div>
                      </div>
                   </div>
                </div>

                <div className="px-8 pb-8 flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-4">
                   <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                      <Clock className="w-3.5 h-3.5" /> {promo.ends}
                   </div>
                   
                   <div className="flex items-center gap-2">
                      <button className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"><Settings2 className="w-4.5 h-4.5" /></button>
                      <button className="relative px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase italic shadow-lg hover:scale-[1.05] transition-all">
                         Audit
                         <NeonEdges color="violet" />
                      </button>
                   </div>
                </div>
             </div>
           ))}
           
           <div className="border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer group/add">
              <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-300 group-hover/add:text-violet-500 group-hover/add:scale-110 transition-all shadow-xl">
                 <Plus className="w-8 h-8" />
              </div>
              <div>
                 <div className="text-sm font-black italic mb-1">Create Strategy</div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Incentivize bulk purchasing or merchant retention.</p>
              </div>
           </div>
        </div>

        {/* Action Banner */}
        <div className="mt-12 p-8 bg-slate-900 rounded-[3rem] text-white shadow-3xl overflow-hidden relative group flex flex-col md:flex-row md:items-center justify-between gap-8 border border-white/5">
           <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />
           <div className="flex items-start gap-6 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400">
                 <Zap className="w-8 h-8" />
              </div>
              <div>
                 <h3 className="text-xl font-black italic tracking-tight mb-2">Smart Recommendation Engine</h3>
                 <p className="text-white/40 text-xs font-medium max-w-md italic leading-relaxed">
                    AI suggests a 12% discount on <span className="text-white">Summer Produce</span> to capture 45% more market share from competing wholesale portals.
                 </p>
              </div>
           </div>
           <div className="flex items-center gap-4 relative z-10">
              <button className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest transition-all">Simulate ROI</button>
              <button className="px-8 py-3 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.05] shadow-xl">Auto-Forge Rule</button>
           </div>
        </div>
      </div>
    </div>
  );
}
