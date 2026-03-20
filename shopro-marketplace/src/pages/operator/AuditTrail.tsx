"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Search, 
  Filter, 
  Download, 
  Shield, 
  History, 
  User, 
  Eye, 
  Database, 
  Settings, 
  Cloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Lock,
  Smartphone,
  Globe
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
  { id: "LOG-50021", user: "omar.h@shopro.ae", action: "Approved Payout PAY-110", module: "Finance", level: "Low", date: "2m ago", device: "MacBook Pro (Dubai)" },
  { id: "LOG-50022", user: "sarah.m@shopro.ae", action: "Changed Tax Rule (Dubai-Marina)", module: "Taxonomy", level: "Med", date: "15m ago", device: "Admin Portal" },
  { id: "LOG-50023", user: "system_bot", action: "Automated SKU Match (Elite Wholesale)", module: "Catalog", level: "Info", date: "45m ago", device: "Cloud Task" },
  { id: "LOG-50024", user: "admin@shopro.ae", action: "Deleted User role: Seasonal Support", module: "Identity", level: "High", date: "2h ago", device: "Chrome (Windows)" },
];

export default function AuditTrail() {
  const [filter, setFilter] = useState("all");
  const glowRef = useGlowingBorder();

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic flex items-center gap-3 uppercase">
               System <span className="text-blue-500">Oracle</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic">
               <History className="w-4 h-4 text-blue-500" />
               Immutable event ledger and identity forensic monitoring
            </p>
          </div>
          
          <div className="flex items-center gap-3 italic">
             <div className="text-right">
                <div className="text-xs font-black italic tracking-tight uppercase">Ledger Integrity</div>
                <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest leading-none">Cryptographically Verified</div>
             </div>
             <button className="p-3.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl hover:scale-110 transition-all flex items-center justify-center">
                <Download className="w-5 h-5" />
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Log List */}
           <div className="lg:col-span-8 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden group relative p-10">
                 <GlowingBorder spread={100} borderWidth={1} />
                 
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10 font-black italic">
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 flex-1 max-w-md">
                       <Search className="w-4 h-4 text-slate-400" />
                       <input type="text" placeholder="Search actor or action..." className="bg-transparent border-none outline-none text-xs w-full" />
                    </div>
                    <div className="flex items-center gap-2">
                       {["All", "High Risk", "Auth"].map(t => (
                         <button key={t} className={cn("px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border", t === "All" ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white" : "text-slate-400 border-slate-100 dark:border-slate-800 hover:border-blue-500/40")}>
                            {t}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4 relative z-10">
                    {LOGS.map(log => (
                      <div key={log.id} className="group/row p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border border-transparent hover:border-blue-200 dark:hover:border-blue-900/40 transition-all cursor-pointer">
                         <div className="flex flex-col md:flex-row gap-6">
                            <div className="shrink-0 pt-1">
                               <div className={cn("w-2 h-2 rounded-full", 
                                 log.level === 'High' ? 'bg-rose-500' :
                                 log.level === 'Med' ? 'bg-amber-500' :
                                 'bg-slate-300'
                               )} />
                            </div>
                            
                            <div className="flex-1 space-y-3 font-black italic">
                               <div className="flex items-start justify-between">
                                  <div>
                                     <div className="text-[9px] font-black text-blue-500 tracking-widest uppercase mb-1">{log.id}</div>
                                     <h4 className="text-lg tracking-tight group-hover:text-blue-500 transition-colors uppercase leading-none mb-1">{log.action}</h4>
                                     <div className="flex items-center gap-3 text-[10px] text-slate-400 uppercase tracking-widest">
                                        <User className="w-3.5 h-3.5" /> {log.user}
                                     </div>
                                  </div>
                                  <div className="text-right">
                                     <div className="text-[10px] text-slate-400 uppercase tracking-widest">{log.date}</div>
                                     <div className="text-[9px] text-slate-300 uppercase mt-1 flex items-center gap-1 justify-end">
                                        <Smartphone className="w-2.5 h-2.5" /> {log.device}
                                     </div>
                                  </div>
                               </div>

                               <div className="flex items-center gap-6 pt-3 border-t border-slate-100 dark:border-slate-800/40">
                                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg text-[9px] uppercase">
                                     <Database className="w-3.5 h-3.5 text-blue-500" /> {log.module}
                                  </div>
                                  <button className="text-[9px] text-slate-400 hover:text-slate-900 uppercase flex items-center gap-1">
                                     View Manifest <ExternalLink className="w-3 h-3" />
                                  </button>
                               </div>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Event Distribution */}
           <div className="lg:col-span-4 space-y-6 font-black italic">
              <div className="bg-blue-600 rounded-[3rem] p-10 text-white shadow-3xl relative overflow-hidden group">
                 <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/20 rounded-full blur-[60px]" />
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-10 tracking-widest leading-none">Security Profile</h3>
                 
                 <div className="space-y-12 relative z-10">
                    <div>
                       <div className="flex justify-between items-end mb-4">
                          <div className="text-4xl tracking-tighter">0.02%</div>
                          <div className="text-[9px] font-black uppercase flex items-center gap-1 px-2 py-1 bg-white/20 rounded-lg">Anomalies <AlertCircle className="w-3 h-3" /></div>
                       </div>
                       <div className="text-[10px] uppercase text-white/50 mb-3 tracking-widest">Global Risk Score</div>
                       <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: "2%" }} className="h-full bg-white shadow-[0_0_15px_#fff]" />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                       <div className="p-6 bg-white/10 rounded-[2rem] border border-white/10">
                          <div className="text-2xl mb-1 flex items-center gap-2 leading-none uppercase tracking-tighter">8.2k</div>
                          <div className="text-[8px] font-black uppercase opacity-40 tracking-widest">Events (24h)</div>
                       </div>
                       <div className="p-6 bg-white/10 rounded-[2rem] border border-white/10">
                          <div className="text-2xl mb-1 flex items-center gap-2 leading-none uppercase tracking-tighter">1.4s</div>
                          <div className="text-[8px] font-black uppercase opacity-40 tracking-widest">Index Latency</div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl p-10 group relative overflow-hidden">
                 <GlowingBorder spread={30} borderWidth={1} />
                 <h3 className="text-xl italic mb-8 flex items-center gap-3 uppercase tracking-tighter leading-none">
                   <Shield className="w-6 h-6 text-blue-500" />
                   Observability
                 </h3>
                 <div className="space-y-6">
                    {[
                      { label: "Catalog Mutate", count: "142", trend: "+12%" },
                      { label: "Identity Access", count: "892", trend: "+2%" },
                      { label: "Financial Clearance", count: "42", trend: "-5%" },
                      { label: "Dispute Activity", count: "12", trend: "+45%" },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between">
                         <span className="text-[10px] uppercase opacity-60 tracking-tight">{s.label}</span>
                         <div className="text-right">
                            <div className="text-xs">{s.count}</div>
                            <div className="text-[8px] text-emerald-500">{s.trend}</div>
                         </div>
                      </div>
                    ))}
                    
                    <button className="w-full py-5 mt-6 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-black uppercase italic tracking-widest shadow-xl relative overflow-hidden group/btn">
                       Configure Webhooks
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
