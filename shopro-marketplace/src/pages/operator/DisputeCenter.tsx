"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Plus, 
  AlertCircle, 
  Scale, 
  MessageSquare, 
  Camera, 
  MoreVertical,
  ArrowRight,
  ShieldAlert,
  Gavel,
  CheckCircle2,
  Clock,
  XCircle,
  Undo2,
  User,
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

const DISPUTES = [
  { id: "DSP-401", poId: "PO-8821", merchant: "Al Safadi Resto", supplier: "Global Foods Co.", subject: "Damaged Avocado (12 units)", status: "Pending", priority: "High", date: "2h ago" },
  { id: "DSP-402", poId: "PO-8910", merchant: "Bait Al Mandi", supplier: "Farm Fresh Dubai", subject: "Missing Milk Cartons (4x)", status: "Resolution offered", priority: "Normal", date: "5h ago" },
  { id: "DSP-403", poId: "PO-9011", merchant: "Zou Zou Restaurant", supplier: "Elite Wholesale", subject: "Late delivery surcharge dispute", status: "Escalated", priority: "Urgent", date: "Yesterday" },
  { id: "DSP-404", poId: "PO-9122", merchant: "Nusr-Et Steakhouse", supplier: "Wagyu Prime", subject: "Quality variance (Grade B vs A)", status: "Open", priority: "Critical", date: "2 days ago" },
];

export default function DisputeCenter() {
  const [filter, setFilter] = useState("all");
  const glowRef = useGlowingBorder();

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic flex items-center gap-3">
               Resolution <span className="text-rose-500">Forge</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic">
               <ShieldAlert className="w-4 h-4 text-rose-500" />
               Marketplace conflict management and trust enforcement
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex -space-x-3 italic">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-4 border-white dark:border-black bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                     <User className="w-5 h-5 text-slate-400" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-4 border-white dark:border-black bg-rose-500 text-white flex items-center justify-center text-[10px] font-black italic">
                   +4
                </div>
             </div>
             <div className="text-right">
                <div className="text-xs font-black italic tracking-tight">8 Agents Active</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Global Support</div>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Dispute List */}
           <div className="lg:col-span-8 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden group relative p-10">
                 <GlowingBorder spread={100} borderWidth={1} />
                 
                 <div className="flex items-center justify-between mb-10 relative z-10">
                    <h3 className="text-xl font-black italic flex items-center gap-2 tracking-tight">
                       <Gavel className="w-5 h-5 text-rose-500" />
                       Active Dockets
                    </h3>
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl shadow-inner italic">
                       {["All", "Pending", "Escalated"].map(t => (
                         <button key={t} className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", t === "All" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-400")}>
                            {t}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4 relative z-10">
                    {DISPUTES.map(dispute => (
                      <div key={dispute.id} className="group/item p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] border border-transparent hover:border-rose-200 dark:hover:border-rose-900/40 transition-all cursor-pointer">
                         <div className="flex flex-col md:flex-row gap-6">
                            <div className={cn(
                              "w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 shadow-lg group-hover/item:scale-105 transition-transform",
                              dispute.priority === 'Urgent' || dispute.priority === 'Critical' ? "bg-rose-500 text-white shadow-rose-500/20" : "bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800"
                            )}>
                               <AlertCircle className="w-8 h-8" />
                            </div>
                            
                            <div className="flex-1 space-y-3">
                               <div className="flex items-start justify-between">
                                  <div>
                                     <div className="flex items-center gap-3 mb-1">
                                        <span className="text-[10px] font-black italic text-rose-500 tracking-widest uppercase">{dispute.id}</span>
                                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                                        <span className="text-[10px] font-black italic text-slate-400 tracking-widest uppercase">Ref: {dispute.poId}</span>
                                     </div>
                                     <h4 className="text-lg font-black italic tracking-tight group-hover:text-rose-500 transition-colors">{dispute.subject}</h4>
                                  </div>
                                  <div className="text-right">
                                     <div className="text-[10px] font-black uppercase text-slate-400 italic tracking-widest">{dispute.date}</div>
                                     <div className={cn("text-[9px] font-black uppercase mt-1 tracking-tighter", dispute.priority === 'Critical' ? 'text-rose-600' : 'text-slate-400')}>
                                        {dispute.priority} Priority
                                     </div>
                                  </div>
                               </div>

                               <div className="flex items-center gap-6">
                                  <div className="flex items-center gap-2">
                                     <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                                        <User className="w-3 h-3 text-slate-500" />
                                     </div>
                                     <span className="text-[10px] font-bold italic">{dispute.merchant}</span>
                                  </div>
                                  <ArrowRight className="w-3 h-3 text-slate-300" />
                                  <div className="flex items-center gap-2">
                                     <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                                        <User className="w-3 h-3 text-slate-500" />
                                     </div>
                                     <span className="text-[10px] font-bold italic">{dispute.supplier}</span>
                                  </div>
                               </div>

                               <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/40">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 italic">
                                     <MessageSquare className="w-3.5 h-3.5" /> 8 Messages
                                  </div>
                                  <div className="flex items-center gap-3">
                                     <button className="px-5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[9px] font-black uppercase tracking-widest hover:shadow-lg transition-all italic">Adjudicate</button>
                                     <button className="p-2 text-slate-300 hover:text-slate-900"><MoreVertical className="w-4.5 h-4.5" /></button>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Metrics & Interventions */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-rose-500 rounded-[3rem] p-8 text-white shadow-3xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-[80px]" />
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-8 italic tracking-widest">Resolution Health</h3>
                 
                 <div className="space-y-10 relative z-10">
                    <div>
                       <div className="flex justify-between items-end mb-4">
                          <div className="text-4xl font-black italic tracking-tighter leading-none">4.2h</div>
                          <div className="text-[9px] font-black uppercase flex items-center gap-1 px-2 py-1 bg-white/20 rounded-lg">Target: 6h <Scale className="w-3 h-3" /></div>
                       </div>
                       <div className="text-[10px] font-black uppercase text-white/50 mb-3 italic tracking-widest">Avg Time to Resolution</div>
                       <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: "82%" }} className="h-full bg-white shadow-[0_0_15px_#fff]" />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="p-5 bg-white/10 rounded-[2rem] backdrop-blur-xl border border-white/10">
                          <div className="text-2xl font-black italic leading-none mb-1">94%</div>
                          <div className="text-[9px] font-black uppercase opacity-40">Settlement Success</div>
                       </div>
                       <div className="p-5 bg-white/10 rounded-[2rem] backdrop-blur-xl border border-white/10">
                          <div className="text-2xl font-black italic leading-none mb-1">12%</div>
                          <div className="text-[9px] font-black uppercase opacity-40">Escalation Rate</div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl p-8 group relative overflow-hidden">
                 <GlowingBorder spread={30} borderWidth={1} />
                 <h3 className="text-lg font-black italic mb-6 flex items-center gap-2">
                    <Undo2 className="w-5 h-5 text-rose-500" />
                    Refund Velocity
                 </h3>
                 <div className="space-y-4">
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl">
                       <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Weekly Outflow</span>
                          <span className="text-sm font-black italic text-rose-500">-$24,500</span>
                       </div>
                       <div className="flex gap-1.5 h-12 items-end">
                          {[30, 45, 25, 60, 40, 75, 50].map((h, i) => (
                            <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} className="flex-1 bg-rose-500/20 group-hover:bg-rose-500 transition-colors rounded-t-sm" />
                          ))}
                       </div>
                    </div>
                    
                    <button className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase italic tracking-widest shadow-xl relative overflow-hidden hover:scale-[1.02] transition-all">
                       Audit Credit Notes
                       <NeonEdges color="rose" />
                    </button>
                 </div>
              </div>

              <div className="p-6 rounded-[2.5rem] bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 flex items-start gap-4 italic group hover:shadow-lg transition-all cursor-pointer">
                 <ShieldAlert className="w-6 h-6 text-rose-600 mt-1 shrink-0 group-hover:scale-110 transition-transform" />
                 <div>
                    <h4 className="text-xs font-black mb-1">Supplier Blacklist Warning</h4>
                    <p className="text-[10px] text-slate-500 dark:text-rose-200/40 font-bold tracking-tight">Global Foods Co. has reached 5% dispute threshold in Dubai-Marina region.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
