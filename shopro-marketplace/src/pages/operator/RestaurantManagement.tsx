"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Plus, 
  Building2, 
  ShieldCheck, 
  AlertCircle,
  MoreVertical,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Clock,
  ExternalLink,
  Users,
  CheckCircle2
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

const RESTAURANTS = [
  { id: "R-001", name: "The Urban Bean", category: "Cafe", volume: "$240.5k", status: "active", trust: 98, city: "Dubai", members: 4, image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&h=100&fit=crop" },
  { id: "R-002", name: "Salt Waterfront", category: "Casual Dining", volume: "$512.2k", status: "active", trust: 92, city: "Dubai", members: 12, image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=100&h=100&fit=crop" },
  { id: "R-003", name: "Fire & Ice Grill", category: "Fine Dining", volume: "$1.2M", status: "suspended", trust: 64, city: "Abu Dhabi", members: 24, image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=100&h=100&fit=crop" },
  { id: "R-004", name: "Pops & Hops", category: "Bistro", volume: "$82.1k", status: "pending", trust: 0, city: "Sharjah", members: 2, image: "https://images.unsplash.com/photo-1485182708500-e8f1f318ba72?w=100&h=100&fit=crop" },
];

export default function RestaurantManagement() {
  const [filter, setFilter] = useState("all");
  const glowRef = useGlowingBorder();

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic flex items-center gap-3">
               Merchant <span className="text-violet-500">Fleet</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic">
               <Building2 className="w-4 h-4 text-violet-500" />
               Global directory and ecosystem control
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="group relative px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold italic flex items-center gap-2 hover:shadow-lg transition-all">
                <Filter className="w-4 h-4" />
                Advanced Search
                <NeonEdges />
             </button>
             <button className="group relative px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold italic flex items-center gap-2 hover:scale-[1.02] transition-all overflow-hidden shadow-xl">
                <Plus className="w-4 h-4" />
                Register Merchant
                <NeonEdges color="violet" />
             </button>
          </div>
        </header>

        {/* Fleet Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
           {[
             { label: "Total Merchants", val: "1,240", change: "+12%", icon: Building2, color: "blue" },
             { label: "Active Nodes", val: "942", change: "92%", icon: CheckCircle2, color: "green" },
             { label: "Aggregated GMV", val: "$12.4M", change: "+8.4k", icon: TrendingUp, color: "violet" },
             { label: "KYC Pending", val: "24", change: "Urgent", icon: AlertCircle, color: "rose" },
           ].map((stat, i) => (
             <div key={i} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 shadow-xl flex items-center justify-between overflow-hidden group relative">
                <GlowingBorder spread={30} borderWidth={1} />
                <div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</div>
                   <div className="text-3xl font-black italic tracking-tight">{stat.val}</div>
                   <div className={cn("text-[10px] font-black uppercase mt-1", stat.color === 'rose' ? 'text-rose-500' : 'text-slate-400')}>{stat.change}</div>
                </div>
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", `bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-500`)}>
                   <stat.icon className="w-6 h-6" />
                </div>
             </div>
           ))}
        </div>

        {/* Search & Bulk Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 px-2">
           <div className="flex items-center gap-2">
              {["All", "Active", "Pending", "Suspended"].map(t => (
                <button key={t} onClick={() => setFilter(t.toLowerCase())} className={cn("px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", filter === t.toLowerCase() ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl scale-105" : "text-slate-400 hover:text-slate-900 dark:hover:text-white")}>
                   {t}
                </button>
              ))}
           </div>
           <div className="relative group max-w-sm w-full">
              <input type="text" placeholder="Search by name, ID, or owner..." className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-xs font-medium italic focus:ring-2 focus:ring-violet-500 transition-all shadow-sm" />
              <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
           </div>
        </div>

        {/* Merchant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {RESTAURANTS.map(res => (
             <div key={res.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden group hover:-translate-y-1 transition-all duration-500">
                <div className="p-8 pb-4">
                   <div className="flex justify-between items-start mb-6">
                      <div className="relative">
                         <img src={res.image} className="w-16 h-16 rounded-[1.5rem] object-cover shadow-2xl" />
                         <div className={cn("absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center", res.status === 'active' ? "bg-green-500" : res.status === 'suspended' ? "bg-rose-500" : "bg-amber-500")}>
                            {res.status === 'active' && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                         </div>
                      </div>
                      <button className="p-2 text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors">
                         <MoreVertical className="w-5 h-5" />
                      </button>
                   </div>
                   
                   <div className="mb-6">
                      <h3 className="text-xl font-black italic tracking-tight truncate mb-1">{res.name}</h3>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                         <MapPin className="w-3 h-3" /> {res.city} · {res.category}
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                         <div className="text-[8px] font-black uppercase text-slate-400 mb-0.5 tracking-tighter">Trade Volume</div>
                         <div className="text-sm font-black italic">{res.volume}</div>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                         <div className="text-[8px] font-black uppercase text-slate-400 mb-0.5 tracking-tighter">Trust Score</div>
                         <div className="text-sm font-black italic flex items-center gap-1">
                            {res.trust}% <ShieldCheck className={cn("w-3 h-3", res.trust > 80 ? "text-green-500" : "text-amber-500")} />
                         </div>
                      </div>
                   </div>
                </div>

                <div className="px-8 pb-8 flex items-center justify-between relative overflow-hidden group/btn-area">
                   <div className="flex -space-x-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-black uppercase text-slate-400">
                           USR
                        </div>
                      ))}
                      <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-black text-white dark:text-slate-900">
                         +{res.members}
                      </div>
                   </div>
                   
                   <button className="relative px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase italic italic flex items-center gap-2 hover:scale-[1.05] transition-all shadow-lg">
                      Manage Portal
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <NeonEdges color="violet" />
                   </button>
                </div>
             </div>
           ))}
           
           <div className="border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer group/add">
              <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-300 group-hover/add:text-violet-500 group-hover/add:scale-110 transition-all shadow-xl">
                 <Plus className="w-8 h-8" />
              </div>
              <div>
                 <div className="text-sm font-black italic mb-1">Onboard New Hub</div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">System supports multi-outlet franchise registration.</p>
              </div>
           </div>
        </div>

        {/* Global Activity Snap */}
        <div className="mt-12 p-8 bg-slate-900 rounded-[3rem] text-white shadow-3xl overflow-hidden relative group flex flex-col md:flex-row md:items-center justify-between gap-8">
           <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
           <div className="flex items-start gap-6 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-violet-400">
                 <Clock className="w-8 h-8" />
              </div>
              <div>
                 <h3 className="text-xl font-black italic tracking-tight mb-2">Fleet Pulse</h3>
                 <p className="text-white/40 text-xs font-medium max-w-md italic leading-relaxed">
                    Detected anomalous ordering pattern from <span className="text-white">Fire & Ice Grill</span>. Node suspended automatically for fraud verification.
                 </p>
              </div>
           </div>
           <div className="flex items-center gap-4 relative z-10">
              <button className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest transition-all">Dismiss</button>
              <button className="px-8 py-3 rounded-xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.05] shadow-xl shadow-violet-600/20">Investigate Hub</button>
           </div>
        </div>
      </div>
    </div>
  );
}
