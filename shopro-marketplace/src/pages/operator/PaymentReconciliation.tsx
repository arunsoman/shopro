"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  ArrowRightLeft, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Search, 
  Filter, 
  Download, 
  DollarSign, 
  Link2, 
  Database, 
  ShieldCheck, 
  Clock, 
  ChevronRight,
  Zap,
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

const INITIAL_ITEMS = [
  { id: "REC-901", orderRef: "ORD-9982", amount: "AED 1,250.00", channel: "Stripe", date: "Oct 25, 14:20", status: "Matched" },
  { id: "REC-822", orderRef: "ORD-9975", amount: "AED 450.00", channel: "Bank", date: "Oct 25, 11:15", status: "Unmatched" },
  { id: "REC-704", orderRef: "ORD-9960", amount: "AED 3,120.00", channel: "Stripe", date: "Oct 24, 09:30", status: "Review" },
  { id: "REC-661", orderRef: "ORD-9952", amount: "AED 780.00", channel: "Bank", date: "Oct 24, 18:45", status: "Matched" },
];

export default function PaymentReconciliation() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const glowRef = useGlowingBorder();

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.orderRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.amount.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const runEngine = () => {
    setIsRunning(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setItems(prevItems => prevItems.map(item => ({ ...item, status: "Matched" })));
          setTimeout(() => setIsRunning(false), 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-8 font-black italic">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4 font-black italic uppercase text-slate-900 dark:text-white">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl tracking-tighter flex items-center gap-3 italic">
               Flow <span className="text-indigo-500">Sync</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic leading-none">
               <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin-slow" />
               Automated payment matching and treasury reconciliation resonance
            </p>
          </div>
          
          <button 
            disabled={isRunning}
            onClick={runEngine}
            className="group relative px-10 py-5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all overflow-hidden shadow-xl disabled:opacity-50"
          >
             {isRunning ? `Syncing... ${progress}%` : "Run Recon Engine"}
             <NeonEdges color="violet" />
             {isRunning && (
               <motion.div 
                className="absolute bottom-0 left-0 h-1 bg-indigo-500" 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
               />
             )}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           {/* Recon Stream */}
           <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-xl p-10 group relative overflow-hidden font-black italic uppercase">
                 <GlowingBorder spread={80} borderWidth={1} />
                 
                 <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 relative z-10 gap-6">
                    <h3 className="text-2xl tracking-tighter uppercase leading-none italic">Transaction Matching</h3>
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 px-6 py-4 rounded-3xl border border-slate-100 dark:border-slate-800 flex-1">
                       <Search className="w-5 h-5 text-slate-400" />
                       <input 
                        type="text" 
                        placeholder="Trace amount, order ID or source..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-xs w-full tracking-widest italic" 
                       />
                    </div>
                 </div>

                  <div className="space-y-6 relative z-10">
                    {filteredItems.map(item => (
                      <div key={item.id} className="p-10 bg-slate-50 dark:bg-slate-800/40 rounded-[3rem] border border-transparent hover:border-indigo-200 dark:hover:border-indigo-900/40 transition-all group/row cursor-pointer shadow-sm">
                         <div className="flex flex-col gap-8">
                            <div className="flex items-start justify-between">
                               <div className="flex items-center gap-6">
                                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg", 
                                    item.status === 'Matched' ? 'bg-emerald-500 text-white' : 
                                    item.status === 'Unmatched' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                                  )}>
                                     {item.status === 'Matched' ? <CheckCircle2 className="w-8 h-8" /> : 
                                      item.status === 'Unmatched' ? <XCircle className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                                  </div>
                                  <div>
                                     <div className="flex items-center gap-2 text-[9px] text-indigo-500 font-bold tracking-[0.3em] mb-1 leading-none">{item.id} • {item.channel}</div>
                                     <h4 className="text-2xl tracking-tighter uppercase leading-none italic">{item.amount}</h4>
                                  </div>
                               </div>
                               <div className="text-right">
                                  <div className="text-xl italic leading-none mb-2">{item.date}</div>
                                  <div className="text-[10px] text-slate-400 tracking-widest font-black leading-none">Order: {item.orderRef}</div>
                               </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800/40 opacity-40 text-[9px] tracking-widest font-black">
                               <div className="flex items-center gap-2 italic">
                                  <Database className="w-4 h-4" /> Bank Trace: TX-B-8827-142
                               </div>
                               <button className="text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
                                  Manual Link <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Flux Sentinel */}
           <div className="lg:col-span-4 space-y-8 font-black italic uppercase">
              <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-3xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
                 <h3 className="text-[10px] tracking-[0.2em] opacity-40 mb-10 leading-none">Resonance Index</h3>
                 <div className="text-7xl tracking-tighter mb-4 italic text-emerald-500">98.4%</div>
                 <div className="text-[10px] opacity-40 tracking-widest leading-none italic">Batch Success Rate</div>
                 
                 <div className="mt-12 space-y-8 relative z-10">
                    <div className="flex items-center gap-4">
                       <ShieldCheck className="w-10 h-10 text-white/40" />
                       <div>
                          <div className="text-2xl tracking-tighter italic">Secured</div>
                          <div className="text-[8px] opacity-40">No drift detected in last 24h</div>
                       </div>
                    </div>

                    <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 space-y-4">
                       <div className="flex justify-between text-[10px] italic">
                          <span>Auto-Matched</span>
                          <span className="text-emerald-500">+1.2k</span>
                       </div>
                       <div className="flex justify-between text-[10px] italic">
                          <span>Manual Drift</span>
                          <span className="text-rose-500">2</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl p-10 group relative overflow-hidden">
                 <GlowingBorder spread={30} borderWidth={1} />
                 <h3 className="text-xl mb-10 flex items-center gap-3 tracking-tighter leading-none italic">
                   <Link2 className="w-7 h-7 text-indigo-500" />
                   Channel Integrity
                 </h3>
                 <div className="space-y-6 relative z-10">
                    {[
                      { label: "Stripe Flux", status: "Healthy", ping: "8ms" },
                      { label: "Swift Gateway", status: "Degraded", ping: "450ms" },
                      { label: "Local Vault", status: "Healthy", ping: "2ms" },
                    ].map((ch, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                         <div>
                            <div className="text-xs italic">{ch.label}</div>
                            <div className="text-[8px] text-slate-400 tracking-widest">{ch.status}</div>
                         </div>
                         <div className="text-[10px] font-black">{ch.ping}</div>
                      </div>
                    ))}
                    
                    <button className="w-full py-5 mt-4 rounded-3xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] tracking-widest font-black italic shadow-xl relative overflow-hidden group/btn">
                       Treasury Logs
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
