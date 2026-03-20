"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Lock,
  ExternalLink,
  CreditCard,
  UserCheck,
  Globe,
  MapPin,
  Clock,
  Briefcase,
  ArrowUpRight
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

const DOCUMENTS = [
  { id: "d1", title: "Commercial Registration", type: "CR-920-X", status: "verified", date: "Jan 12, 2024" },
  { id: "d2", title: "Tax Identification Certificate", type: "VAT-G-110", status: "verified", date: "Jan 14, 2024" },
  { id: "d3", title: "Health & Safety License", type: "HS-882", status: "expiring_soon", date: "Dec 05, 2023", expiry: "Mar 30, 2024" },
  { id: "d4", title: "Operator Agreement", type: "MLA-2024", status: "verified", date: "Feb 01, 2024" },
];

export default function KYC() {
  const glowRef = useGlowingBorder();

  return (
    <div className="min-h-screen bg-slate-50/20 dark:bg-black p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic flex items-center gap-3">
               Merchant <span className="text-violet-500">Identity</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic">
               <ShieldCheck className="w-4 h-4 text-green-500" />
               Level 2 Verified · Trust Score: High
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-4 group relative overflow-hidden">
                <GlowingBorder spread={20} borderWidth={1} />
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-violet-500">
                   <Lock className="w-5 h-5" />
                </div>
                <div>
                   <div className="text-[10px] font-black uppercase text-slate-400">Security Status</div>
                   <div className="text-xs font-black italic">End-to-End Encrypted</div>
                </div>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Left: Profile & Basic Info */}
           <div className="lg:col-span-4 space-y-6">
              <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden group">
                 <GlowingBorder spread={100} borderWidth={1} />
                 <div className="h-24 bg-gradient-to-r from-violet-500 to-indigo-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />
                 </div>
                 <div className="px-8 pb-8 pt-0 relative z-10">
                    <div className="relative -mt-10 mb-6">
                       <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop" className="w-20 h-20 rounded-[2rem] object-cover ring-4 ring-white dark:ring-slate-900 shadow-2xl" />
                       <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                       </div>
                    </div>
                    
                    <h2 className="text-2xl font-black italic tracking-tight mb-2">The Urban Bean</h2>
                    <div className="flex flex-col gap-3">
                       <div className="flex items-center gap-3 text-slate-500">
                          <Building2 className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-tight">Main City Terminal, Dubai</span>
                       </div>
                       <div className="flex items-center gap-3 text-slate-500">
                          <MapPin className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-tight">Zone 4-A, Business Bay</span>
                       </div>
                       <div className="flex items-center gap-3 text-slate-500">
                          <Briefcase className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-tight">Registered since Jan 2024</span>
                       </div>
                    </div>

                    <button className="w-full mt-8 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black italic text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-all overflow-hidden shadow-xl group/btn">
                       Edit Merchant Profile
                       <ExternalLink className="w-4 h-4 group-hover/btn:rotate-45 transition-transform" />
                       <NeonEdges color="violet" />
                    </button>
                 </div>
              </div>

              <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-emerald-500/20 rounded-full blur-[80px]" />
                 <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-6 italic tracking-[0.2em]">Banking Node</h3>
                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-[1.5rem] bg-white/5 flex items-center justify-center border border-white/10">
                          <CreditCard className="w-6 h-6 text-emerald-400" />
                       </div>
                       <div>
                          <div className="text-sm font-black italic">International Bank of Dubai</div>
                          <div className="text-[10px] font-bold opacity-40">•••• 0291 (Settlement Account)</div>
                       </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 italic text-[11px] leading-relaxed opacity-60">
                       Automated marketplace settlements are processed every Monday at 08:00 GST.
                    </div>
                    <button className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest transition-all">
                       Update Bank Records
                    </button>
                 </div>
              </div>
           </div>

           {/* Right: Documents & Compliance */}
           <div className="lg:col-span-8 space-y-6">
              <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl p-8 overflow-hidden group">
                 <GlowingBorder spread={100} borderWidth={1} />
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black italic tracking-tight flex items-center gap-2">
                       <FileText className="w-5 h-5 text-violet-500" />
                       Compliance Vault
                    </h2>
                    <button className="text-[10px] font-black uppercase text-violet-500 hover:underline italic flex items-center gap-2">
                       Request Review <ArrowUpRight className="w-4 h-4" />
                    </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {DOCUMENTS.map(doc => (
                      <div key={doc.id} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-transparent hover:border-violet-300 dark:hover:border-violet-800 transition-all group/doc cursor-pointer flex flex-col justify-between h-48 relative overflow-hidden">
                         <div className="flex justify-between items-start relative z-10">
                            <div className={cn("p-3 rounded-2xl", doc.status === 'verified' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600')}>
                               <FileText className="w-5 h-5" />
                            </div>
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-sm",
                              doc.status === 'verified' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                            )}>
                               {doc.status.replace('_', ' ')}
                            </span>
                         </div>
                         
                         <div className="relative z-10">
                            <div className="font-black italic text-sm text-slate-900 dark:text-white mb-0.5">{doc.title}</div>
                            <div className="text-[10px] font-bold text-slate-400">{doc.type} · Validated {doc.date}</div>
                         </div>
                         
                         {doc.expiry && (
                           <div className="mt-2 text-[9px] font-black text-rose-500 uppercase flex items-center gap-1.5 relative z-10">
                              <Clock className="w-3 h-3" />
                              Expires in 12 days
                           </div>
                         )}
                         
                         <div className="absolute bottom-[-20%] right-[-10%] opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-700">
                            <ShieldCheck className="w-32 h-32" />
                         </div>
                      </div>
                    ))}
                    
                    <div className="p-5 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] flex flex-col items-center justify-center text-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-all cursor-pointer group/add">
                       <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-300 group-hover/add:text-violet-500 transition-colors">
                          <Upload className="w-6 h-6" />
                       </div>
                       <div>
                          <div className="text-[10px] font-black uppercase text-slate-500">Add New Document</div>
                          <div className="text-[9px] font-bold text-slate-400">PDF, JPG up to 10MB</div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-8 bg-green-50 dark:bg-green-950/20 rounded-[2.5rem] border border-green-100 dark:border-green-900/30 flex items-center gap-6 overflow-hidden group">
                 <div className="w-16 h-16 rounded-3xl bg-green-500 flex items-center justify-center text-white shrink-0 shadow-xl shadow-green-500/20">
                    <UserCheck className="w-8 h-8" />
                 </div>
                 <div className="flex-1">
                    <h3 className="text-xl font-black italic tracking-tight text-green-900 dark:text-green-400">Merchant DNA Verified</h3>
                    <p className="text-sm font-medium italic text-green-600 dark:text-green-500 leading-relaxed max-w-xl">
                       Your restaurant has undergone a comprehensive identity audit. This badge is displayed on your portal, signaling trust to and enabling priority fulfillment with all marketplace suppliers.
                    </p>
                 </div>
                 <div className="hidden md:flex items-center gap-2">
                    <button className="p-3 rounded-2xl bg-white dark:bg-slate-900 shadow-lg text-slate-400 hover:text-green-500 transition-all">
                       <Globe className="w-5 h-5" />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
