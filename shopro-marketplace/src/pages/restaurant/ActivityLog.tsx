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
  Download, 
  Clock, 
  Zap, 
  User, 
  Shield, 
  History,
  Info,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ArrowRight,
  Database,
  Building,
  HardDrive
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

const LOGS = [
  { id: "e1", type: "order", system: false, title: "Purchase Order Created", actor: "Monica Chen", detail: "PO-2901 for Global Coffee Traders", time: "2m ago", severity: "info" },
  { id: "e2", type: "automation", system: true, title: "Threshold Optimized", actor: "AI Node", detail: "Premium Arabica adjusted to 45kg", time: "15m ago", severity: "success" },
  { id: "e4", type: "payment", system: false, title: "Balance Settled", actor: "Alex Rivera", detail: "Paid $12,450 to Fresh Dairy", time: "1h ago", severity: "success" },
  { id: "e5", type: "security", system: true, title: "Node Hardened", actor: "System Agent", detail: "Applied new encryption keys", time: "4h ago", severity: "info" },
  { id: "e6", type: "order", system: false, title: "Order Amendment Requested", actor: "Monica Chen", detail: "Qty change for Whole Milk", time: "Yesterday", severity: "warning" },
  { id: "e7", type: "inventory", system: true, title: "Low Stock Alert", actor: "Bot Node", detail: "Oat Milk below 5L threshold", time: "Yesterday", severity: "warning" },
];

export default function ActivityLog() {
  const [filter, setFilter] = useState("all");
  const glowRef = useGlowingBorder();

  return (
    <div className="min-h-screen bg-slate-50/20 dark:bg-black p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic flex items-center gap-3">
               Event <span className="text-violet-500">Chronicle</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic">
               <History className="w-4 h-4 text-violet-500" />
               Immutable audit trail of marketplace intelligence
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="group relative px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold italic flex items-center gap-2 hover:shadow-lg transition-all">
                <Download className="w-4 h-4" />
                Export Audit Pack
                <NeonEdges />
             </button>
             <button className="group relative px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold italic flex items-center gap-2 hover:scale-[1.02] transition-all overflow-hidden shadow-xl">
                <Shield className="w-4 h-4" />
                Verify Logs
                <NeonEdges color="violet" />
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
           {/* Filters Sidebar */}
           <div className="lg:col-span-3 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-xl relative overflow-hidden group">
                 <GlowingBorder spread={30} borderWidth={1} />
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 italic">Filters</h3>
                 <div className="space-y-2">
                    {["All Activity", "Human Actions", "AI Automation", "Security", "Financial"].map(f => (
                      <button key={f} onClick={() => setFilter(f.toLowerCase())} className={cn("w-full px-4 py-3 rounded-xl text-left text-xs font-black italic transition-all", filter === f.toLowerCase() ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-105" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50")}>
                         {f}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
                 <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-6 italic tracking-[0.2em]">Compliance Engine</h3>
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                       <span className="text-[10px] font-black uppercase italic">Tamper Proof Active</span>
                    </div>
                    <div className="flex items-center gap-3 opacity-60">
                       <Database className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase italic">Daily Backups: Synced</span>
                    </div>
                 </div>
              </div>

              <div className="relative group p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:bg-white dark:hover:bg-slate-900 transition-all">
                  <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                     <HardDrive className="w-5 h-5" />
                  </div>
                  <div className="text-[9px] font-black uppercase text-slate-500 leading-tight">Storage: 2.1GB / 10GB</div>
              </div>
           </div>

           {/* Event Stream */}
           <div className="lg:col-span-9">
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl p-10 overflow-hidden min-h-[700px] group relative">
                 <GlowingBorder spread={100} borderWidth={1} />
                 
                 <div className="flex items-center justify-between mb-10 relative z-10">
                    <div className="relative flex-1 max-w-lg group/search">
                       <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within/search:text-violet-500 transition-colors" />
                       <input type="text" placeholder="Search events, PO IDs, or actors..." className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium italic focus:ring-2 focus:ring-violet-500 transition-all" />
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-[10px] font-black uppercase text-slate-400 italic">
                       Synced 12s ago <Clock className="w-3.5 h-3.5" />
                    </div>
                 </div>

                 <div className="space-y-8 relative z-10">
                    {LOGS.map((log, i) => (
                      <div key={log.id} className="relative group/log pl-10">
                         {/* Connecting Line */}
                         {i !== LOGS.length - 1 && <div className="absolute left-[19px] top-10 bottom-[-32px] w-px bg-slate-100 dark:bg-slate-800" />}
                         
                         {/* Status Icon */}
                         <div className={cn(
                           "absolute left-0 top-1 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover/log:scale-110",
                           log.system ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
                         )}>
                            {log.type === 'order' ? <Package className="w-5 h-5" /> : 
                             log.type === 'automation' ? <Zap className="w-5 h-5 text-violet-500" /> : 
                             log.type === 'payment' ? <CreditCard className="w-5 h-5 text-emerald-500" /> :
                             log.type === 'security' ? <Shield className="w-5 h-5 text-blue-500" /> : 
                             <Info className="w-5 h-5" />}
                         </div>

                         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2rem] border border-transparent hover:border-violet-100 dark:hover:border-violet-900/40 transition-all cursor-pointer">
                            <div className="flex-1">
                               <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-lg font-black italic tracking-tight">{log.title}</h4>
                                  <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                                    log.severity === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                                  )}>
                                     {log.severity}
                                  </span>
                               </div>
                               <div className="text-sm font-medium text-slate-600 dark:text-slate-400 italic mb-2">{log.detail}</div>
                               <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-500 tracking-widest">
                                     <User className="w-3 h-3" />
                                     {log.actor}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                     <Clock className="w-3 h-3" />
                                     {log.time}
                                  </div>
                               </div>
                            </div>
                            <div className="flex items-center gap-2">
                               <button className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-[10px] font-black uppercase italic shadow-sm hover:scale-105 transition-all">Details</button>
                               <button className="p-2.5 rounded-xl text-slate-300 hover:text-slate-900 dark:hover:text-white"><MoreVertical className="w-5 h-5" /></button>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>

                 <div className="mt-12 flex justify-center relative z-10">
                    <button className="px-8 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-violet-500 hover:text-white transition-all italic">
                       Load Legacy Records (2023)
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function Package({ className }: { className?: string }) { return <path d="M12 2 3.5 6.5v11L12 22l8.5-4.5v-11L12 2Z" className={className} />; }
function CreditCard({ className }: { className?: string }) { return <rect x="2" y="5" width="20" height="14" rx="2" className={className} />; }
