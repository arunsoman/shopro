"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  CreditCard, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  ArrowUpRight,
  Wallet,
  Building,
  Receipt,
  Star
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

const INVOICES = [
  { id: "INV-2901", supplier: "Global Coffee Traders", date: "Mar 18, 2024", due: "Apr 18, 2024", amount: 12450.0, status: "pending", priority: "high" },
  { id: "INV-2895", supplier: "Fresh Dairy Solutions", date: "Mar 15, 2024", due: "Mar 30, 2024", amount: 2840.5, status: "paid", priority: "low" },
  { id: "INV-2890", supplier: "Essential Pantry Co.", date: "Mar 10, 2024", due: "Mar 25, 2024", amount: 1520.0, status: "overdue", priority: "critical" },
  { id: "INV-2882", supplier: "Global Coffee Traders", date: "Mar 05, 2024", due: "Apr 05, 2024", amount: 8420.0, status: "pending", priority: "medium" },
];

export default function Payments() {
  const [filter, setFilter] = useState("all");
  const glowRef = useGlowingBorder();

  return (
    <div className="min-h-screen bg-white dark:bg-black p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic flex items-center gap-3">
              Marketplace <span className="text-violet-500">Finance</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic">
               <Wallet className="w-4 h-4 text-violet-500" />
               Consolidated billing and invoice management
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="group relative px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold italic flex items-center gap-2 hover:shadow-lg transition-all">
                <FileText className="w-4 h-4" />
                History
                <NeonEdges />
             </button>
             <button className="group relative px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold italic flex items-center gap-2 hover:scale-[1.02] transition-all overflow-hidden shadow-xl">
                <DollarSign className="w-4 h-4" />
                Settle Balance
                <NeonEdges color="violet" />
             </button>
          </div>
        </header>

        {/* Financial Summary Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
           <div className="lg:col-span-8">
              <div className="relative bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl overflow-hidden group">
                 <div className="absolute top-[-30%] right-[-10%] w-80 h-80 bg-violet-500/10 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-1000" />
                 <div className="absolute bottom-[-10%] left-[-5%] w-60 h-60 bg-blue-500/10 rounded-full blur-[80px]" />
                 
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="space-y-4">
                       <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Total Outstanding</h3>
                       <div className="text-6xl font-black italic tracking-tighter">$22,390.00</div>
                       <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-rose-400 font-bold italic text-sm">
                             <AlertCircle className="w-4 h-4" />
                             $1,520 Overdue
                          </div>
                          <div className="w-1 h-1 rounded-full bg-white/20" />
                          <div className="text-white/40 text-xs font-bold uppercase tracking-widest">3 Active Suppliers</div>
                       </div>
                    </div>

                    <div className="flex flex-col gap-3 min-w-[200px]">
                       <div className="p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                          <div className="text-[10px] font-black uppercase text-white/40 mb-1">Upcoming (Next 7 Days)</div>
                          <div className="text-lg font-black italic">$4,820.50</div>
                       </div>
                       <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/10 backdrop-blur-sm">
                          <div className="text-[10px] font-black uppercase text-emerald-400 mb-1">Available Credit</div>
                          <div className="text-lg font-black italic text-emerald-500">$50,000.00</div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-4 grid grid-cols-1 gap-6">
              <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 shadow-xl flex flex-col justify-center gap-1 overflow-hidden group">
                 <GlowingBorder spread={30} borderWidth={1} />
                 <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next Auto-Pay</div>
                 <div className="text-2xl font-black italic mb-2 tracking-tight">Mar 25, 2024</div>
                 <div className="text-xs text-slate-500 font-medium italic">Auto-settling INV-2890</div>
                 <button className="mt-4 text-xs font-black uppercase text-violet-500 hover:translate-x-1 transition-transform flex items-center gap-1 italic">
                    Manage Settings <ArrowUpRight className="w-4 h-4" />
                 </button>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 shadow-xl flex items-center justify-between overflow-hidden group">
                 <GlowingBorder spread={50} borderWidth={1} />
                 <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Loyalty Points</div>
                    <div className="text-2xl font-black italic tracking-tight">12,450 <span className="text-xs uppercase text-violet-500 not-italic">pts</span></div>
                 </div>
                 <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-violet-500">
                    <Star className="w-6 h-6 fill-current" />
                 </div>
              </div>
           </div>
        </div>

        {/* Invoice Management Area */}
        <div className="space-y-6">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
              <div className="flex items-center gap-2">
                 {["All", "Pending", "Overdue", "Paid"].map(t => (
                   <button key={t} onClick={() => setFilter(t.toLowerCase())} className={cn("px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", filter === t.toLowerCase() ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl scale-105" : "text-slate-400 hover:text-slate-900 dark:hover:text-white")}>
                      {t}
                   </button>
                 ))}
              </div>
              <div className="relative group">
                 <input type="text" placeholder="Search invoice ID..." className="pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-xs w-full md:w-64 focus:ring-2 focus:ring-violet-500 transition-all font-medium" />
                 <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden p-2">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                       <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Invoice</th>
                       <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Supplier</th>
                       <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Issue Date</th>
                       <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Due Date</th>
                       <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                       <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
                       <th className="p-5"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {INVOICES.map(inv => (
                      <tr key={inv.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                         <td className="p-5 font-bold italic text-slate-900 dark:text-white">{inv.id}</td>
                         <td className="p-5">
                            <div className="flex items-center gap-2">
                               <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                  <Building className="w-3.5 h-3.5 text-slate-400" />
                               </div>
                               <span className="text-xs font-bold">{inv.supplier}</span>
                            </div>
                         </td>
                         <td className="p-5 text-xs font-bold text-slate-500">{inv.date}</td>
                         <td className="p-5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                               <Clock className={cn("w-3.5 h-3.5", inv.status === 'overdue' ? 'text-rose-500' : '')} />
                               {inv.due}
                            </div>
                         </td>
                         <td className="p-5 text-right font-black italic text-lg">${inv.amount.toLocaleString()}</td>
                         <td className="p-5 text-right">
                            <span className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
                              inv.status === 'paid' ? 'bg-green-50 text-green-600 border-green-200' : inv.status === 'overdue' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                            )}>
                               {inv.status}
                            </span>
                         </td>
                         <td className="p-5 text-right">
                             <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all">
                                   <Download className="w-4 h-4" />
                                </button>
                                {inv.status !== 'paid' && (
                                  <button className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all italic">
                                     Pay
                                  </button>
                                )}
                             </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           <div className="p-8 bg-indigo-50 dark:bg-indigo-950/20 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/30 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative group">
              <div className="absolute top-[-50%] left-[-10%] w-64 h-64 bg-white/40 dark:bg-white/5 rounded-full blur-[100px] pointer-events-none" />
              <div className="flex items-center gap-5 relative z-10">
                 <div className="w-14 h-14 rounded-[1.5rem] bg-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                    <Receipt className="w-7 h-7" />
                 </div>
                 <div>
                    <h3 className="text-lg font-black italic tracking-tight text-indigo-900 dark:text-indigo-400">Automated Tax Filings</h3>
                    <p className="text-xs text-indigo-700/60 dark:text-indigo-400/40 font-bold italic">Generated 14 ready-to-file VAT reports for Q1 2024.</p>
                 </div>
              </div>
              <button className="px-8 py-3 rounded-2xl bg-indigo-900 dark:bg-indigo-400 text-white dark:text-indigo-950 text-xs font-black uppercase tracking-widest hover:scale-105 transition-all relative z-10 italic">
                 Download Audit Pack
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
