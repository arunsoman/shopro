"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Zap, 
  Database, 
  Cloud, 
  Globe, 
  AlertTriangle, 
  ShieldCheck, 
  Server,
  Network,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  Waves
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

const SERVICES = [
  { name: "API Gateway", status: "Healthy", latency: "14ms", uptime: "99.99%", color: "emerald" },
  { name: "PostgreSQL Master", status: "Healthy", latency: "2ms", uptime: "100%", color: "emerald" },
  { name: "Redis Cache", status: "Healthy", latency: "1ms", uptime: "99.98%", color: "emerald" },
  { name: "Image Processor", status: "Degraded", latency: "450ms", uptime: "98.5%", color: "amber" },
  { name: "Auth Service", status: "Healthy", latency: "22ms", uptime: "99.99%", color: "emerald" },
  { name: "Payment Engine", status: "Healthy", latency: "85ms", uptime: "99.95%", color: "emerald" },
];

export default function SystemHealth() {
  const [refreshing, setRefreshing] = useState(false);
  const glowRef = useGlowingBorder();

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4 font-black italic">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl tracking-tighter uppercase flex items-center gap-3">
               Fleet <span className="text-emerald-500">Nexus</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic">
               <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
               Real-time infrastructure pulse and service resonance
            </p>
          </div>
          
          <button onClick={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 2000); }} 
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] uppercase tracking-widest shadow-xl relative overflow-hidden group">
             <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
             Syncing Nodes
             <NeonEdges color="green" />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Global State Card */}
           <div className="lg:col-span-12">
              <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-3xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-emerald-500/10 rounded-full blur-[120px]" />
                 <div className="absolute -bottom-20 -left-20 w-[30rem] h-[30rem] bg-blue-500/5 rounded-full blur-[100px]" />
                 
                 <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10 font-black italic">
                    <div className="text-center md:text-left">
                       <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-6">Service Level Objective</div>
                       <div className="text-9xl tracking-tighter leading-none mb-4">99.98<span className="text-4xl opacity-30">%</span></div>
                       <div className="flex items-center gap-3 opacity-60 text-sm">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" /> All core systems strictly operational
                       </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full md:w-auto">
                       {[
                         { icon: Cpu, label: "Core Load", value: "12%" },
                         { icon: Database, label: "DB Latency", value: "2.1ms" },
                         { icon: Network, label: "Traffic", value: "4.2k/s" },
                         { icon: Waves, label: "Error Rate", value: "0.01%" },
                       ].map((stat, i) => (
                         <div key={i} className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 text-center">
                            <stat.icon className="w-8 h-8 text-emerald-400 mx-auto mb-4" />
                            <div className="text-2xl mb-1 tracking-tighter">{stat.value}</div>
                            <div className="text-[8px] uppercase tracking-widest opacity-40">{stat.label}</div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>

           {/* Service Grid */}
           <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 font-black italic">
              {SERVICES.map((service, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-10 shadow-xl group relative overflow-hidden hover:border-emerald-200 transition-all cursor-pointer">
                   <GlowingBorder spread={60} borderWidth={1} />
                   <div className="flex justify-between items-start mb-8 relative z-10">
                      <div>
                         <h3 className="text-2xl tracking-tight uppercase leading-none mb-2">{service.name}</h3>
                         <div className={cn("px-3 py-1 rounded-full text-[8px] uppercase tracking-widest w-fit", 
                           service.color === 'emerald' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                         )}>
                            {service.status}
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">Response</div>
                         <div className="text-xl text-emerald-500">{service.latency}</div>
                      </div>
                   </div>

                   <div className="h-12 flex items-end gap-1 mb-8 relative z-10">
                      {[...Array(20)].map((_, j) => (
                        <div key={j} className={cn("flex-1 rounded-t-sm", service.color === 'emerald' ? 'bg-emerald-500/10 group-hover:bg-emerald-500/20' : 'bg-amber-500/10 group-hover:bg-amber-500/20')} style={{ height: `${20 + Math.random() * 80}%` }} />
                      ))}
                   </div>

                   <div className="flex justify-between items-center text-[9px] uppercase tracking-widest text-slate-400 pt-6 border-t border-slate-100 dark:border-slate-800/40 relative z-10">
                      <span>Uptime (30d)</span>
                      <span className="text-slate-900 dark:text-white">{service.uptime}</span>
                   </div>
                </div>
              ))}
           </div>

           {/* Alert Sentinel */}
           <div className="lg:col-span-4 space-y-6 font-black italic">
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-10 shadow-xl group relative overflow-hidden">
                 <GlowingBorder spread={30} borderWidth={1} />
                 <h3 className="text-xl italic mb-8 flex items-center gap-3 uppercase tracking-tighter">
                   <AlertTriangle className="w-6 h-6 text-amber-500" />
                   Priority Events
                 </h3>
                 <div className="space-y-6">
                    {[
                      { msg: "Redis Cluster re-balancing", time: "2h ago", type: "system" },
                      { msg: "Storage bucket threshold hit", time: "5h ago", type: "warning" },
                      { msg: "SSL Certificate auto-renewed", time: "1d ago", type: "success" },
                    ].map((alert, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                         <div className={cn("w-1.5 rounded-full shrink-0", 
                           alert.type === 'warning' ? 'bg-amber-500' : 
                           alert.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                         )} />
                         <div>
                            <div className="text-[10px] leading-tight mb-1 uppercase tracking-tight">{alert.msg}</div>
                            <div className="text-[8px] text-slate-400 uppercase tracking-widest">{alert.time}</div>
                         </div>
                      </div>
                    ))}
                    
                    <button className="w-full py-5 mt-6 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-black uppercase italic tracking-widest shadow-xl relative overflow-hidden group/btn">
                       Incident Dashboard
                       <NeonEdges color="amber" />
                    </button>
                 </div>
              </div>

              <div className="bg-emerald-600 rounded-[3rem] p-10 text-white shadow-3xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-[60px]" />
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-10 tracking-widest leading-none">Global Coverage</h3>
                 
                 <div className="space-y-8 relative z-10">
                    <div>
                       <div className="text-6xl tracking-tighter mb-2">42</div>
                       <div className="text-[9px] font-black uppercase opacity-60 tracking-widest">Active Edge Nodes</div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                       <div className="p-4 bg-white/10 rounded-2xl border border-white/10 flex-1 text-center">
                          <div className="text-lg">DUB-1</div>
                          <div className="text-[8px] opacity-40 uppercase">Primary</div>
                       </div>
                       <div className="p-4 bg-white/10 rounded-2xl border border-white/10 flex-1 text-center">
                          <div className="text-lg">AMS-2</div>
                          <div className="text-[8px] opacity-40 uppercase">Secondary</div>
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
