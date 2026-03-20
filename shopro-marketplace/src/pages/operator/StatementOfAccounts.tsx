"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  FileText, 
  Search, 
  Download, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownLeft, 
  DollarSign, 
  Calendar, 
  Filter, 
  MoreVertical, 
  ShieldCheck, 
  Activity, 
  Clock, 
  Globe,
  Plus,
  ArrowRightLeft
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

const INITIAL_STATEMENTS = [
  { id: "SOA-992", entity: "The Burger Club", type: "Restaurant", balance: "AED 12,450.00", cycle: "Oct 2025", status: "Balanced" },
  { id: "SOA-881", entity: "Elite Fresh Produce", type: "Supplier", balance: "AED -45,000.00", cycle: "Oct 2025", status: "Debit" },
  { id: "SOA-772", entity: "Sushi Zen", type: "Restaurant", balance: "AED 8,120.50", cycle: "Oct 2025", status: "Balanced" },
  { id: "SOA-665", entity: "Global Meats LLC", type: "Supplier", balance: "AED -2,100.00", cycle: "Oct 2025", status: "Pending" },
];

export default function StatementOfAccounts() {
  const [statements, setStatements] = useState(INITIAL_STATEMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const glowRef = useGlowingBorder();

  const filteredStatements = useMemo(() => {
    return statements.filter(soa => 
      soa.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      soa.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [statements, searchQuery]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsGenerating(false), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-8 font-black italic">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4 font-black italic uppercase text-slate-900 dark:text-white">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl tracking-tighter flex items-center gap-3 italic">
               Ledger <span className="text-amber-500">Vault</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic leading-none">
               <ArrowRightLeft className="w-4 h-4 text-amber-500" />
               Consolidated entity balances and financial statement resonance
            </p>
          </div>
          
          <button 
            disabled={isGenerating}
            onClick={handleGenerate}
            className="group relative px-10 py-5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all overflow-hidden shadow-xl disabled:opacity-50"
          >
             {isGenerating ? `GENERATING... ${progress}%` : "Generate Batch Statement"}
             <NeonEdges color="amber" />
             {isGenerating && (
               <motion.div 
                className="absolute bottom-0 left-0 h-1 bg-amber-500" 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
               />
             )}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           {/* Summary Cards */}
           <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { label: "Total Platform Float", value: "AED 4.2M", icon: DollarSign, color: "amber" },
                { label: "Pending Payouts", value: "AED 1.1M", icon: ArrowUpRight, color: "rose" },
                { label: "Accounts Receivable", value: "AED 890k", icon: ArrowDownLeft, color: "emerald" },
                { label: "Settlement Accuracy", value: "99.98%", icon: ShieldCheck, color: "indigo" },
              ].map((stat, i) => (
                <div key={i} className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden group border border-white/5">
                   <div className={cn("absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-[40px] bg-", stat.color === 'amber' ? 'amber-500' : stat.color === 'rose' ? 'rose-500' : stat.color === 'emerald' ? 'emerald-500' : 'indigo-500')} />
                   <stat.icon className={cn("w-8 h-8 mb-6", stat.color === 'amber' ? 'text-amber-500' : stat.color === 'rose' ? 'text-rose-500' : stat.color === 'emerald' ? 'text-emerald-500' : 'text-indigo-500')} />
                   <div className="text-4xl tracking-tighter mb-2 italic">{stat.value}</div>
                   <div className="text-[10px] opacity-40 tracking-widest leading-none font-bold uppercase">{stat.label}</div>
                </div>
              ))}
           </div>

           {/* Statements Table */}
           <div className="lg:col-span-12">
              <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-xl p-12 group relative overflow-hidden font-black italic uppercase">
                 <GlowingBorder spread={80} borderWidth={1} />
                 
                 <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 relative z-10 gap-6">
                    <h3 className="text-3xl tracking-tighter uppercase leading-none italic">Entity Ledgers</h3>
                     <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 px-6 py-4 rounded-3xl border border-slate-100 dark:border-slate-800 flex-1 max-w-md">
                        <Search className="w-5 h-5 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Search account..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-transparent border-none outline-none text-xs w-full tracking-widest italic" 
                        />
                     </div>
                 </div>

                 <div className="space-y-4 relative z-10">
                    <div className="grid grid-cols-12 px-10 py-4 text-[9px] text-slate-400 tracking-[0.2em] font-bold">
                       <div className="col-span-4">Entity / ID</div>
                       <div className="col-span-2">Type</div>
                       <div className="col-span-2">Statement Cycle</div>
                       <div className="col-span-2">Current Balance</div>
                       <div className="col-span-2 text-right">Actions</div>
                    </div>

                     {filteredStatements.map(soa => (
                       <div key={soa.id} className="grid grid-cols-12 items-center p-10 bg-slate-50 dark:bg-slate-800/40 rounded-[3rem] border border-transparent hover:border-amber-200 dark:hover:border-amber-900/40 transition-all group/row cursor-pointer shadow-sm">
                         <div className="col-span-4 flex items-center gap-6">
                            <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
                               <FileText className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                               <div className="text-xl tracking-tighter leading-none italic">{soa.entity}</div>
                               <div className="text-[9px] text-slate-400 tracking-widest mt-1">{soa.id}</div>
                            </div>
                         </div>
                         <div className="col-span-2">
                            <span className="px-4 py-1.5 bg-white dark:bg-slate-900 rounded-full text-[9px] border border-slate-100 dark:border-slate-800">{soa.type}</span>
                         </div>
                         <div className="col-span-2">
                            <div className="text-sm italic">{soa.cycle}</div>
                         </div>
                         <div className="col-span-2">
                            <div className={cn("text-lg italic tracking-tighter", soa.balance.includes('-') ? 'text-rose-500' : 'text-emerald-500')}>{soa.balance}</div>
                         </div>
                         <div className="col-span-2 flex justify-end gap-3">
                            <button className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:scale-110 transition-transform"><Download className="w-5 h-5 text-slate-400" /></button>
                            <button className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:scale-110 transition-transform"><ChevronRight className="w-5 h-5 text-amber-500" /></button>
                         </div>
                      </div>
                    ))}
                 </div>

                 <div className="mt-12 pt-10 border-t border-slate-100 dark:border-slate-800/40 flex justify-between items-center relative z-10">
                    <div className="text-[10px] text-slate-400 font-bold tracking-widest leading-none">Showing 4 of 212 Statements</div>
                    <div className="flex gap-4">
                       {[1, 2, 3].map(p => (
                         <button key={p} className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black transition-all", p === 1 ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-400 hover:bg-slate-50 dar k:hover:bg-slate-800')}>{p}</button>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
