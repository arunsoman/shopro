"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Key, 
  Shield, 
  Plus, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff, 
  Clock, 
  Zap, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Terminal,
  Code2,
  RefreshCw,
  MoreVertical,
  Fingerprint
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

const KEYS = [
  { id: "AK-992", name: "Shopro Flutter App", key: "sp_live_••••••••39ac", scope: "Universal", created: "Oct 12, 2025", lastUsed: "4m ago", status: "Active" },
  { id: "AK-104", name: "Elite Inventory Sync", key: "sp_live_••••••••128d", scope: "Catalog-Write", created: "Nov 01, 2025", lastUsed: "1h ago", status: "Active" },
  { id: "AK-082", name: "Zendesk Integration", key: "sp_live_••••••••90fe", scope: "Support-Read", created: "Dec 15, 2025", lastUsed: "2d ago", status: "Active" },
  { id: "AK-045", name: "Legacy ERP Probe", key: "sp_live_••••••••55bc", scope: "Read-Only", created: "Jan 20, 2026", lastUsed: "1w ago", status: "Inactive" },
];

export default function APIKeys() {
  const [showKey, setShowKey] = useState<string | null>(null);
  const glowRef = useGlowingBorder();

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-8 font-black italic">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl tracking-tighter uppercase flex items-center gap-3">
               Cypher <span className="text-violet-500">Vault</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic">
               <Fingerprint className="w-4 h-4 text-violet-500" />
               Secure integration tokens and programmatic access gates
            </p>
          </div>
          
          <button className="group relative px-10 py-5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all overflow-hidden shadow-xl">
             Generate Access Token
             <NeonEdges color="violet" />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Key List */}
           <div className="lg:col-span-8 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl p-10 group relative overflow-hidden">
                 <GlowingBorder spread={80} borderWidth={1} />
                 
                 <div className="flex items-center justify-between mb-10 relative z-10">
                    <h3 className="text-2xl tracking-tight uppercase leading-none">Active Probes</h3>
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Zap className="w-4 h-4 text-violet-500" /> 4 Active Sessions
                    </div>
                 </div>

                 <div className="space-y-4 relative z-10">
                    {KEYS.map(key => (
                      <div key={key.id} className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] border border-transparent hover:border-violet-200 dark:hover:border-violet-900/40 transition-all group/row">
                         <div className="flex flex-col md:flex-row gap-8">
                            <div className="shrink-0 flex items-center justify-center w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl shadow-lg">
                               <Terminal className="w-6 h-6 text-violet-500" />
                            </div>
                            
                            <div className="flex-1">
                               <div className="flex items-start justify-between mb-4">
                                  <div>
                                     <h4 className="text-xl uppercase tracking-tight mb-1">{key.name}</h4>
                                     <div className="flex items-center gap-2 text-[9px] text-slate-400 uppercase tracking-widest">
                                        <Code2 className="w-3.5 h-3.5" /> Scope: {key.scope}
                                     </div>
                                  </div>
                                  <div className="text-right">
                                     <div className={cn("px-3 py-1 rounded-full text-[8px] uppercase tracking-widest", 
                                       key.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 italic' : 'bg-slate-200 text-slate-400'
                                     )}>
                                        {key.status}
                                     </div>
                                  </div>
                               </div>

                               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6 border-t border-slate-100 dark:border-slate-800/40">
                                  <div className="flex items-center gap-4 bg-white dark:bg-slate-900 px-5 py-3 rounded-xl border border-slate-100 dark:border-slate-800 text-[10px] font-mono tracking-tighter flex-1">
                                     <span className="opacity-40 tracking-widest">API_KEY:</span> {key.key}
                                     <button className="ml-auto p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><Copy className="w-3.5 h-3.5" /></button>
                                  </div>
                                  
                                  <div className="flex items-center gap-4 text-[9px] text-slate-400 uppercase tracking-widest shrink-0">
                                     <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Used {key.lastUsed}</span>
                                     <button className="p-2 text-rose-500 hover:scale-110 transition-transform"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* SDK Reference */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-3xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px]" />
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-10 tracking-widest leading-none">Quick Implementation</h3>
                 
                 <div className="space-y-6 relative z-10">
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5 font-mono text-[9px] leading-relaxed tracking-tighter italic">
                       <div className="text-violet-400 mb-2">// REST API v3 Auth</div>
                       <div>curl -X <span className="text-emerald-400">GET</span> "https://api.shopro.ae/v3/orders" \</div>
                       <div className="pl-4">-H "Authorization: Bearer <span className="text-amber-400">YOUR_TOKEN</span>"</div>
                    </div>

                    <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5">
                       <h4 className="text-xs mb-4 uppercase tracking-widest opacity-60">Library Status</h4>
                       <div className="space-y-4">
                          {["Flutter SDK v2.1.0", "React Hook Pack", "Node Transport"].map((sdk, i) => (
                            <div key={i} className="flex items-center justify-between text-[10px] uppercase">
                               <span>{sdk}</span>
                               <span className="text-emerald-500">Live</span>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl p-10 group relative overflow-hidden">
                 <GlowingBorder spread={30} borderWidth={1} />
                 <h3 className="text-xl mb-8 flex items-center gap-3 uppercase tracking-tighter leading-none">
                   <Shield className="w-6 h-6 text-violet-500" />
                   Security Policy
                 </h3>
                 <div className="space-y-6">
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-transparent">
                       <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] uppercase tracking-tight">Access Revocation</span>
                          <div className="w-10 h-5 bg-emerald-500 rounded-full flex items-center px-1">
                             <div className="w-3 h-3 bg-white rounded-full ml-auto" />
                          </div>
                       </div>
                       <p className="text-[9px] opacity-40 leading-none tracking-tight">Strict IP pinning enforced for high-yield keys</p>
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-transparent">
                       <div className="flex items-center justify-between mb-2 text-[10px] uppercase tracking-tight">
                          <span>Token Rotation</span>
                          <span className="text-violet-500">90 Days</span>
                       </div>
                    </div>
                    
                    <button className="w-full py-5 mt-6 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] uppercase tracking-widest italic shadow-xl relative overflow-hidden group/btn">
                       Developer Sandbox
                       <NeonEdges color="violet" />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
