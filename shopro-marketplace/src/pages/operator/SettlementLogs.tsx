"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  FileText, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download, 
  MoreVertical,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Receipt,
  Landmark,
  Layers,
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

const INITIAL_SETTLEMENTS = [
  { id: "STL-9901", date: "Mar 20, 2024", entity: "Global Foods Co", type: "Supplier Payout", amount: "$42,450.00", status: "Processed", bank: "HSBC Dubai (**** 8821)" },
  { id: "STL-9902", date: "Mar 19, 2024", entity: "Al Safadi Resto", type: "Tax Credit", amount: "$1,120.50", status: "Pending", bank: "ADCB (**** 1010)" },
  { id: "STL-9903", date: "Mar 18, 2024", entity: "Elite Wholesale", type: "Settlement", amount: "$89,200.00", status: "Flagged", bank: "Emirates NBD (**** 4421)" },
  { id: "STL-9904", date: "Mar 18, 2024", entity: "Farm Fresh Dubai", type: "Supplier Payout", amount: "$12,050.00", status: "Processed", bank: "HSBC Dubai (**** 8821)" },
];

export default function SettlementLogs() {
  const [settlements, setSettlements] = useState(INITIAL_SETTLEMENTS);
  const [isClearing, setIsClearing] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const glowRef = useGlowingBorder();

  const handleBatchClear = () => {
    setIsClearing(true);
    setTimeout(() => {
      setSettlements(prev => prev.map(s => s.status === "Pending" ? { ...s, status: "Processed" } : s));
      setIsClearing(false);
    }, 1500);
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = {
      id: `STL-${Math.floor(1000 + Math.random() * 9000)}`,
      date: "Today",
      entity: "Manual Adjustment",
      type: "Settlement",
      amount: "$500.00",
      status: "Processed",
      bank: "Manual Entry"
    };
    setSettlements([newEntry, ...settlements]);
    setShowManualModal(false);
  };

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic flex items-center gap-3">
               Settlement <span className="text-violet-500">Logs</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic">
               <Receipt className="w-4 h-4 text-violet-500" />
               Auditable financial clearing and entity payout tracking
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="group relative px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold italic flex items-center gap-2 hover:shadow-lg transition-all">
                <Download className="w-4 h-4" />
                Audit Pack (PDF)
                <NeonEdges />
             </button>
             <button 
                onClick={() => setShowManualModal(true)}
                className="group relative px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold italic flex items-center gap-2 hover:scale-[1.02] transition-all overflow-hidden shadow-xl"
              >
                <Landmark className="w-4 h-4" />
                Manual Clearing
                <NeonEdges color="violet" />
             </button>
          </div>
        </header>

        {/* Financial Summary Overlay */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
           {[
             { label: "Gross Clearing", val: "$420.5k", sub: "Last 7 days", trend: "up", icon: Layers },
             { label: "Supplier Payouts", val: "$380.2k", sub: "85 Entities", trend: "up", icon: DollarSign },
             { label: "Commission Earned", val: "$32.4k", sub: "Net ROI", trend: "up", icon: CheckCircle2 },
             { label: "Awaiting Clearance", val: "$12.8k", sub: "3 Flagged", trend: "neutral", icon: Clock },
           ].map((stat, i) => (
             <div key={i} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 shadow-xl relative overflow-hidden group">
                <GlowingBorder spread={30} borderWidth={1} />
                <div className="flex justify-between items-start mb-4 relative z-10">
                   <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-violet-500 transition-colors">
                      <stat.icon className="w-5 h-5" />
                   </div>
                   <div className="text-[10px] font-black uppercase text-emerald-500 italic flex items-center gap-1">
                      {stat.trend === 'up' && <ArrowUpRight className="w-3 h-3" />} Stable
                   </div>
                </div>
                <div className="relative z-10">
                   <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</div>
                   <div className="text-3xl font-black italic tracking-tighter mb-1">{stat.val}</div>
                   <div className="text-[9px] font-bold text-slate-300 uppercase italic tracking-widest">{stat.sub}</div>
                </div>
             </div>
           ))}
        </div>

        {/* Clearing Registry */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden group relative p-10">
           <GlowingBorder spread={100} borderWidth={1} />
           
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
              <h3 className="text-xl font-black italic flex items-center gap-2 tracking-tight">
                 <FileText className="w-5 h-5 text-violet-500" />
                 Transaction Snapshot
              </h3>
              
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl italic">
                 {["Month", "Week", "Day"].map(t => (
                   <button key={t} className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", t === "Month" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-lg" : "text-slate-400 hover:text-slate-900")}>
                      {t}
                   </button>
                 ))}
              </div>
           </div>

           <div className="space-y-4 relative z-10">
              {settlements.map(stl => (
                <div key={stl.id} className="group/row p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] border border-transparent hover:border-violet-200 dark:hover:border-violet-900/40 transition-all cursor-pointer">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div className="flex items-center gap-6 flex-1">
                         <div className={cn(
                           "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover/row:scale-110 transition-transform",
                           stl.status === 'Processed' ? "bg-emerald-500 text-white shadow-emerald-500/20" : 
                           stl.status === 'Flagged' ? "bg-rose-500 text-white shadow-rose-500/20" : 
                           "bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800"
                         )}>
                            {stl.type.includes('Payout') ? <ArrowUpRight className="w-7 h-7" /> : <ArrowDownLeft className="w-7 h-7" />}
                         </div>
                         <div>
                            <div className="flex items-center gap-3 mb-1">
                               <span className="text-[10px] font-black italic text-violet-500 tracking-widest uppercase">{stl.id}</span>
                               <div className="w-1 h-1 rounded-full bg-slate-200" />
                               <span className="text-[10px] font-black italic text-slate-400 tracking-widest uppercase">{stl.date}</span>
                            </div>
                            <h4 className="text-lg font-black italic tracking-tight mb-1 group-hover:text-violet-500 transition-colors uppercase">{stl.entity}</h4>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                               <Landmark className="w-3.5 h-3.5" /> {stl.bank}
                            </div>
                         </div>
                      </div>
                      
                      <div className="flex items-center justify-between md:justify-end gap-12 font-black italic">
                         <div className="text-right">
                            <div className="text-2xl tracking-tighter mb-1">{stl.amount}</div>
                            <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{stl.type}</div>
                         </div>
                         <div className="flex items-center gap-4">
                            <div className={cn(
                              "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                              stl.status === 'Processed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                              stl.status === 'Flagged' ? "bg-rose-50 text-rose-600 border-rose-100" : 
                              "bg-slate-100 text-slate-400 border-slate-200"
                            )}>
                               {stl.status}
                            </div>
                            <button className="p-2 text-slate-300 hover:text-slate-900"><MoreVertical className="w-5 h-5" /></button>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
           </div>

           <div className="mt-8 flex justify-center relative z-10">
              <button className="px-8 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase italic tracking-widest shadow-xl hover:scale-[1.02] transition-all relative overflow-hidden group/btn">
                 Load Full Ledger History
                 <NeonEdges color="violet" />
              </button>
           </div>
        </div>

        {/* Global Controls Overlay */}
        <div className="mt-12 flex flex-col md:flex-row gap-6">
           <div className="flex-1 p-8 bg-slate-900 rounded-[3rem] text-white shadow-3xl flex items-center justify-between border border-white/5 group">
              <div className="flex items-start gap-6">
                 <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-all">
                    <ShieldCheck className="w-8 h-8" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black italic tracking-tight mb-2 uppercase">Bulk Verification</h3>
                    <p className="text-white/40 text-xs font-medium italic">Execute clearing for all 14 pending supplier payouts scheduled for EOD.</p>
                 </div>
              </div>
               <button 
                disabled={isClearing}
                onClick={handleBatchClear}
                className="px-10 py-4 rounded-2xl bg-white text-slate-900 text-[10px] font-black uppercase italic tracking-widest hover:scale-[1.05] transition-all shadow-xl disabled:opacity-50"
              >
                {isClearing ? "CLEARING..." : "Batch Clear"}
              </button>
           </div>
        </div>

        {/* Modal for Manual Entry */}
        <AnimatePresence>
          {showManualModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-3xl w-[500px] max-w-[90vw] relative overflow-hidden font-black italic flex flex-col"
              >
                <GlowingBorder spread={100} borderWidth={1} />
                <h3 className="text-2xl tracking-tighter uppercase mb-6 flex items-center gap-3">
                  <Landmark className="text-violet-500" /> Manual Entry
                </h3>
                <form onSubmit={handleAddManual} className="space-y-6 relative z-10">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase opacity-40">Entity Name</label>
                    <input type="text" placeholder="e.g. Ad-hoc adjustment" className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border-none outline-none text-xs tracking-widest" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase opacity-40">Amount</label>
                    <input type="text" placeholder="$0.00" className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border-none outline-none text-xs tracking-widest" required />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setShowManualModal(false)} className="flex-1 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-[10px] uppercase tracking-widest">Cancel</button>
                    <button type="submit" className="flex-1 py-4 rounded-2xl bg-violet-500 text-white text-[10px] uppercase tracking-widest shadow-lg shadow-violet-500/20">Create Entry</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
