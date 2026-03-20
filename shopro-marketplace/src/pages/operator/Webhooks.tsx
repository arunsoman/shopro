"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Zap, 
  Link2, 
  Plus, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Settings, 
  Clock, 
  FileJson, 
  Globe, 
  RefreshCw,
  Eye,
  Trash2,
  ChevronRight,
  Database,
  Search,
  AlertTriangle
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

const WEBHOOKS = [
  { id: "WH-221", url: "https://oms.fleet.ae/webhooks/shopro", events: ["order.created", "order.shipment_ready"], status: "Healthy", success: "99.8%", lastSent: "12s ago" },
  { id: "WH-504", url: "https://erp.wholesale.ae/api/v2/hooks", events: ["catalog.sku_updated", "catalog.stock_low"], status: "Failing", success: "12.4%", lastSent: "2m ago" },
  { id: "WH-102", url: "https://hooks.slack.com/services/...", events: ["dispute.opened", "payout.initiated"], status: "Healthy", success: "100%", lastSent: "1h ago" },
];

export default function Webhooks() {
  const glowRef = useGlowingBorder();

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-8 font-black italic">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl tracking-tighter uppercase flex items-center gap-3">
               Event <span className="text-blue-500">Flux</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic">
               <Zap className="w-4 h-4 text-blue-500 animate-pulse" />
               Real-time event propagation and endpoint resonance
            </p>
          </div>
          
          <button className="group relative px-10 py-5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all overflow-hidden shadow-xl">
             Relay Endpoint
             <NeonEdges color="blue" />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Webhook Grid */}
           <div className="lg:col-span-8 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl p-10 group relative overflow-hidden">
                 <GlowingBorder spread={80} borderWidth={1} />
                 
                 <div className="flex items-center justify-between mb-10 relative z-10 font-black italic">
                    <h3 className="text-2xl tracking-tight uppercase leading-none">Registered Relays</h3>
                    <div className="flex bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                       {["Live", "Debug"].map(m => (
                         <button key={m} className={cn("px-4 py-1.5 rounded-lg text-[8px] uppercase tracking-widest transition-all", m === "Live" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white" : "text-slate-400 opacity-60")}>
                            {m}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-6 relative z-10">
                    {WEBHOOKS.map(hook => (
                      <div key={hook.id} className="p-10 bg-slate-50 dark:bg-slate-800/40 rounded-[3rem] border border-transparent hover:border-blue-200 dark:hover:border-blue-900/40 transition-all group/row">
                         <div className="flex flex-col gap-8">
                            <div className="flex items-start justify-between">
                               <div className="space-y-3 flex-1 overflow-hidden">
                                  <div className="flex items-center gap-2 text-[9px] text-blue-500 uppercase tracking-widest">{hook.id}</div>
                                  <div className="flex items-center gap-3">
                                     <Link2 className="w-8 h-8 text-slate-300" />
                                     <h4 className="text-2xl tracking-tight truncate uppercase leading-none">{hook.url}</h4>
                                  </div>
                               </div>
                               <div className="text-right shrink-0">
                                  <div className={cn("px-4 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-black italic", 
                                    hook.status === 'Healthy' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                                  )}>
                                     {hook.status}
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-2 uppercase tracking-tight">Last Sent {hook.lastSent}</div>
                               </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8 border-t border-slate-100 dark:border-slate-800/40">
                               <div className="md:col-span-2">
                                  <div className="text-[8px] text-slate-400 uppercase tracking-widest mb-4">Listening Events</div>
                                  <div className="flex flex-wrap gap-2">
                                     {hook.events.map(ev => (
                                       <span key={ev} className="px-3 py-1 bg-white dark:bg-slate-900 rounded-lg text-[9px] border border-slate-100 dark:border-slate-800 tracking-tight">{ev}</span>
                                     ))}
                                  </div>
                               </div>
                               <div className="text-center md:text-right md:ml-auto">
                                  <div className="text-[8px] text-slate-400 uppercase tracking-widest mb-2">Delivery Rate</div>
                                  <div className={cn("text-3xl tracking-tighter", hook.status === 'Healthy' ? 'text-emerald-500' : 'text-rose-500')}>{hook.success}</div>
                               </div>
                               <div className="flex items-center justify-center md:justify-end gap-3">
                                  <button className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:scale-110 transition-transform"><FileJson className="w-5 h-5 text-slate-400" /></button>
                                  <button className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:scale-110 transition-transform"><Trash2 className="w-5 h-5 text-rose-500" /></button>
                               </div>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Relay Sentinel */}
           <div className="lg:col-span-4 space-y-6 font-black italic">
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-3xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-10 tracking-widest leading-none">Active Relays</h3>
                 
                 <div className="space-y-12">
                    <div>
                       <div className="text-7xl tracking-tighter leading-none mb-2">1.2M</div>
                       <div className="text-[10px] uppercase text-white/50 tracking-widest">Global Pings (24h)</div>
                    </div>

                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                       <h4 className="text-[9px] uppercase tracking-widest opacity-40 mb-4">Traffic Resonance</h4>
                       <div className="flex gap-1 h-12 items-end justify-between">
                          {[40, 60, 30, 85, 45, 90, 60, 30, 55, 75].map((h, i) => (
                            <div key={i} className="flex-1 bg-blue-500/20 rounded-t-sm" style={{ height: `${h}%` }} />
                          ))}
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl p-10 group relative overflow-hidden">
                 <GlowingBorder spread={30} borderWidth={1} />
                 <h3 className="text-xl italic mb-8 flex items-center gap-3 uppercase tracking-tighter leading-none">
                   <Globe className="w-6 h-6 text-blue-500" />
                   Retry Logic
                 </h3>
                 <div className="space-y-6">
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl">
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] uppercase tracking-tight">Exponential Backoff</span>
                          <span className="text-emerald-500 px-2 py-0.5 bg-emerald-500/10 rounded text-[8px]">Active</span>
                       </div>
                       <div className="text-[9px] opacity-40 leading-none tracking-tight">Max 12 attempts over 24 hours</div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800/40">
                       <div className="text-[8px] text-slate-400 uppercase tracking-widest mb-4">Integration Stats</div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                             <div className="text-lg">8ms</div>
                             <div className="text-[8px] opacity-40 uppercase">Queue Delay</div>
                          </div>
                          <div className="text-center border-l border-slate-100 dark:border-slate-800/40">
                             <div className="text-lg">0</div>
                             <div className="text-[8px] opacity-40 uppercase">Dead Letter</div>
                          </div>
                       </div>
                    </div>
                    
                    <button className="w-full py-5 mt-6 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] uppercase tracking-widest italic shadow-xl relative overflow-hidden group/btn">
                       Flux Documentation
                       <NeonEdges color="blue" />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
