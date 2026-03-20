"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  ShieldCheck, 
  CreditCard, 
  Banknote, 
  CheckCircle2, 
  XCircle,
  Clock,
  ArrowRight,
  MoreVertical,
  Layers,
  FileCheck,
  Zap,
  User,
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

const INITIAL_PAYOUTS = [
  { id: "PAY-110", entity: "Global Foods Co", amount: "$42,450.00", count: 24, status: "Awaiting Approval", level: "L2", date: "Today", riskScore: 12 },
  { id: "PAY-111", entity: "Elite Wholesale", amount: "$89,200.00", count: 12, status: "Flagged (Review)", level: "L3", date: "Today", riskScore: 88, reason: "Rapid volume spike (300% WoW)" },
  { id: "PAY-112", entity: "Farm Fresh Dubai", amount: "$12,050.00", count: 5, status: "Awaiting Approval", level: "L1", date: "Yesterday", riskScore: 5 },
  { id: "PAY-113", entity: "Wagyu Prime", amount: "$5,400.00", count: 2, status: "Awaiting Approval", level: "L1", date: "Yesterday", riskScore: 8 },
];

export default function PayoutApproval() {
  const [payouts, setPayouts] = useState(INITIAL_PAYOUTS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedPayout, setSelectedPayout] = useState<typeof INITIAL_PAYOUTS[0] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filter, setFilter] = useState("all");
  const glowRef = useGlowingBorder();

  const handleStatusChange = (id: string, newStatus: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      setPayouts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      setIsProcessing(false);
    }, 800);
  };

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      setPayouts(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, status: "Approved" } : p));
      setSelectedIds([]);
      setIsProcessing(false);
    }, 1500);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic flex items-center gap-3">
               Payout <span className="text-emerald-500">Vault</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic">
               <ShieldCheck className="w-4 h-4 text-emerald-500" />
               Multi-sig disbursement authorization and risk vetting
            </p>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="text-right">
                <div className="text-xs font-black italic tracking-tight">2 Pending Approvals</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Your Queue (L2)</div>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center relative overflow-hidden group hover:scale-110 transition-all cursor-pointer">
                <User className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                <NeonEdges color="green" />
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Payout Queue */}
           <div className="lg:col-span-8 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden group relative p-10">
                 <GlowingBorder spread={100} borderWidth={1} />
                 
                 <div className="flex items-center justify-between mb-10 relative z-10">
                    <h3 className="text-xl font-black italic flex items-center gap-2 tracking-tight uppercase">
                       <Zap className="w-5 h-5 text-emerald-500 animate-pulse" />
                       Approval Queue
                    </h3>
                     <div className="flex items-center gap-3">
                        <button 
                          disabled={selectedIds.length === 0 || isProcessing}
                          onClick={handleBulkApprove}
                          className="px-5 py-2 rounded-xl bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all italic disabled:opacity-50 disabled:grayscale"
                        >
                          {isProcessing ? "PROCESSING..." : `Approve Selected (${selectedIds.length})`}
                        </button>
                     </div>
                  </div>

                  <div className="space-y-4 relative z-10">
                     {payouts.map(pay => (
                       <div 
                        key={pay.id} 
                        onClick={() => setSelectedPayout(pay)}
                        className={cn(
                          "group/item p-8 bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] border transition-all cursor-pointer relative",
                          selectedIds.includes(pay.id) ? "border-emerald-500 ring-1 ring-emerald-500/20" : "border-transparent hover:border-emerald-200 dark:hover:border-emerald-900/40"
                        )}
                       >
                          {/* Multi-select check */}
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleSelect(pay.id); }}
                            className={cn(
                              "absolute top-8 left-4 w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center",
                              selectedIds.includes(pay.id) ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                            )}
                          >
                            {selectedIds.includes(pay.id) && <CheckCircle2 size={14} />}
                          </button>

                          <div className="flex flex-col md:flex-row gap-8 items-center pl-8">
                            <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-xl relative overflow-hidden shrink-0 group-hover/item:scale-110 transition-transform">
                               <Banknote className="w-10 h-10 text-emerald-500" />
                               <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-500/10 rounded-bl-2xl flex items-center justify-center text-[10px] font-black italic text-emerald-500">{pay.level}</div>
                            </div>
                            
                            <div className="flex-1 space-y-2">
                               <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black italic text-emerald-500 tracking-widest uppercase">{pay.id}</span>
                                  <div className="w-1 h-1 rounded-full bg-slate-200" />
                                  <span className="text-[10px] font-black italic text-slate-400 tracking-widest uppercase">{pay.date}</span>
                               </div>
                               <h4 className="text-xl font-black italic tracking-tight group-hover:text-emerald-500 transition-colors uppercase leading-none">{pay.entity}</h4>
                               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                                  <Layers className="w-3.5 h-3.5" /> Consists of {pay.count} underlying transactions
                               </div>
                            </div>

                            <div className="text-right flex items-center gap-8">
                               <div>
                                  <div className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-none">{pay.amount}</div>
                                  <div className={cn("text-[8px] font-black uppercase mt-1 tracking-widest italic", pay.status.includes('Flagged') ? 'text-rose-500' : 'text-slate-400')}>
                                     {pay.status}
                                  </div>
                               </div>
                               <div className="flex items-center gap-2">
                                  <button 
                                    disabled={isProcessing || pay.status === "Approved"}
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(pay.id, "Rejected"); }}
                                    className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-all disabled:opacity-50"
                                  >
                                     <XCircle className="w-6 h-6" />
                                  </button>
                                  <button 
                                    disabled={isProcessing || pay.status === "Approved"}
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(pay.id, "Approved"); }}
                                    className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 border shadow-lg flex items-center justify-center hover:scale-105 transition-all disabled:opacity-50"
                                  >
                                     <CheckCircle2 className="w-6 h-6" />
                                  </button>
                               </div>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Security & Stats */}
           <div className="lg:col-span-4 space-y-6 font-black italic">
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-3xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-10 tracking-widest">Disbursement Stats</h3>
                 
                 <div className="space-y-12 relative z-10">
                    <div>
                       <div className="text-5xl tracking-tighter mb-2">$1.2M</div>
                       <div className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-4">Total Payout Volume (MTD)</div>
                       <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: "65%" }} className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                       <div>
                          <div className="text-2xl mb-1">2.4h</div>
                          <div className="text-[8px] font-black uppercase text-white/30 tracking-widest">Avg Cycle Time</div>
                       </div>
                       <div>
                          <div className="text-2xl mb-1">0%</div>
                          <div className="text-[8px] font-black uppercase text-white/30 tracking-widest">Disbursement Failures</div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl p-8 group relative overflow-hidden">
                 <GlowingBorder spread={30} borderWidth={1} />
                 <h3 className="text-lg italic mb-6 flex items-center gap-2 uppercase tracking-tighter">
                   <CreditCard className="w-5 h-5 text-emerald-500" />
                   Disbursement Rules
                 </h3>
                 <div className="space-y-4">
                    <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between">
                       <div className="text-[10px] uppercase opacity-60">Over $50k requires L3</div>
                       <div className="w-8 h-4 rounded-full bg-emerald-500/20 relative">
                          <div className="absolute right-1 top-1 w-2 h-2 rounded-full bg-emerald-500" />
                       </div>
                    </div>
                    <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between">
                       <div className="text-[10px] uppercase opacity-60">Risk Score &gt; 80 block</div>
                       <div className="w-8 h-4 rounded-full bg-emerald-500/20 relative">
                          <div className="absolute right-1 top-1 w-2 h-2 rounded-full bg-emerald-500" />
                       </div>
                    </div>
                    <button className="w-full py-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-[9px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                       <FileCheck className="w-4 h-4" /> Manage Policies
                    </button>
                 </div>
              </div>

               <div className="p-8 rounded-[3rem] bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex items-start gap-4 italic group">
                  <AlertTriangle className="w-6 h-6 text-amber-600 mt-1 shrink-0" />
                  <div className="flex-1">
                     <h4 className="text-xs font-black mb-1 uppercase tracking-tight">Risk Report: {selectedPayout?.entity || "Elite Wholesale"}</h4>
                     <p className="text-[9px] text-slate-500 font-bold tracking-tight">
                        {selectedPayout?.reason || "Significant increase in transaction count detected compared to previous cycle baseline."}
                        <br/>
                        <span className="text-rose-500 mt-1 block">Risk Score: {selectedPayout?.riskScore || "88"}/100</span>
                     </p>
                     <div className="mt-4 flex gap-4">
                        <button className="text-[9px] text-amber-600 uppercase tracking-widest border-b border-amber-200">Force Approve</button>
                        <button className="text-[9px] text-amber-600 uppercase tracking-widest border-b border-amber-200" onClick={() => setSelectedPayout(null)}>Dismiss</button>
                     </div>
                  </div>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
}
