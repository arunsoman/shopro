"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  Trash2, 
  MoreVertical, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Edit3,
  Globe,
  Plus,
  ArrowUpRight,
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

const TEAM = [
  { id: "OP-001", name: "Amara Okoro", email: "amara@shopro.ae", role: "Super Admin", status: "Active", lastActive: "Just now", avatar: "AO" },
  { id: "OP-012", name: "Chen Wei", email: "chen.w@shopro.ae", role: "Financial Auditor", status: "Active", lastActive: "2h ago", avatar: "CW" },
  { id: "OP-045", name: "Sarah Jenkins", email: "s.jenkins@shopro.ae", role: "Catalog Manager", status: "Active", lastActive: "1d ago", avatar: "SJ" },
  { id: "OP-089", name: "Marco Rossi", email: "marco@shopro.ae", role: "Support Lead", status: "Inactive", lastActive: "5d ago", avatar: "MR" },
];

export default function UserManagement() {
  const glowRef = useGlowingBorder();

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-8 font-black italic">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4 font-black italic uppercase">
          <div className="space-y-1 text-slate-900 dark:text-white">
            <h1 className="text-4xl md:text-5xl tracking-tighter flex items-center gap-3 italic">
               Team <span className="text-emerald-500">Nexus</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic leading-none">
               <Fingerprint className="w-4 h-4 text-emerald-500" />
               Platform identity management and operator team resonance
            </p>
          </div>
          
          <button className="group relative px-10 py-5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all overflow-hidden shadow-xl">
             Enlist Operator
             <NeonEdges color="green" />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           {/* Team Roster */}
           <div className="lg:col-span-8 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-xl p-10 group relative overflow-hidden font-black italic uppercase">
                 <GlowingBorder spread={80} borderWidth={1} />
                 
                 <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 relative z-10 gap-6">
                    <h3 className="text-2xl tracking-tighter uppercase leading-none italic">Active Operators</h3>
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 px-6 py-4 rounded-3xl border border-slate-100 dark:border-slate-800 flex-1">
                       <Search className="w-5 h-5 text-slate-400" />
                       <input type="text" placeholder="Find operator by name or role..." className="bg-transparent border-none outline-none text-xs w-full tracking-widest italic" />
                    </div>
                 </div>

                 <div className="space-y-6 relative z-10">
                    {TEAM.map(member => (
                      <div key={member.id} className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-[3rem] border border-transparent hover:border-emerald-200 dark:hover:border-emerald-900/40 transition-all group/row cursor-pointer">
                         <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="w-20 h-20 rounded-[2rem] bg-slate-900 text-white dark:bg-emerald-500 flex items-center justify-center text-2xl tracking-tighter shadow-xl italic font-black">
                               {member.avatar}
                            </div>
                            
                            <div className="flex-1 space-y-4 w-full">
                               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  <div>
                                     <h4 className="text-2xl tracking-tighter uppercase leading-none italic">{member.name}</h4>
                                     <div className="text-[9px] text-slate-400 font-black tracking-widest mt-1 opacity-60 leading-none">{member.email}</div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                     <div className={cn("px-4 py-1.5 rounded-full text-[8px] font-black italic tracking-widest leading-none", 
                                       member.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                                     )}>
                                        {member.status}
                                     </div>
                                     <button className="p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm hover:scale-110 transition-transform"><MoreVertical className="w-4 h-4 text-slate-400" /></button>
                                  </div>
                               </div>

                               <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800/40">
                                  <div>
                                     <div className="text-[8px] text-slate-400 uppercase tracking-widest mb-2 opacity-60">Permissions</div>
                                     <div className="flex items-center gap-2 text-[10px] font-black italic leading-none">
                                        <Shield className="w-3.5 h-3.5 text-emerald-500" /> {member.role}
                                     </div>
                                  </div>
                                  <div>
                                     <div className="text-[8px] text-slate-400 uppercase tracking-widest mb-2 opacity-60">Last Presence</div>
                                     <div className="text-[10px] font-black italic leading-none">{member.lastActive}</div>
                                  </div>
                                  <div className="hidden md:block text-right">
                                     <button className="text-[9px] text-emerald-500 font-black italic tracking-widest uppercase hover:underline">Revoke Access</button>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Security Sentinel */}
           <div className="lg:col-span-4 space-y-8 font-black italic uppercase">
              <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-3xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
                 <h3 className="text-[10px] tracking-[0.2em] opacity-40 mb-10 leading-none">Access Topology</h3>
                 <div className="text-7xl tracking-tighter mb-4 italic">12</div>
                 <div className="text-[10px] opacity-40 tracking-widest leading-none italic">Total Team Capacity</div>
                 
                 <div className="mt-12 space-y-6">
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                       <h4 className="text-[8px] uppercase tracking-widest opacity-40 mb-4">MFA Adoption</h4>
                       <div className="flex items-center gap-3">
                          <div className="flex-1 bg-white/10 h-2 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-500 w-[100%]" />
                          </div>
                          <span className="text-[10px]">100%</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl p-10 group relative overflow-hidden">
                 <GlowingBorder spread={30} borderWidth={1} />
                 <h3 className="text-xl mb-10 flex items-center gap-3 tracking-tighter leading-none italic">
                   <Lock className="w-7 h-7 text-emerald-500" />
                   Security Hardening
                 </h3>
                 <div className="space-y-6 relative z-10">
                    <div className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-3xl space-y-6">
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] tracking-widest opacity-40">Session Timeout</span>
                          <span className="text-[10px]">30 Min</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] tracking-widest opacity-40">Global IP Pinning</span>
                          <span className="text-emerald-500 text-[10px]">Active</span>
                       </div>
                    </div>
                    
                    <button className="w-full py-5 mt-4 rounded-3xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] tracking-widest font-black italic shadow-xl relative overflow-hidden group/btn">
                       Identity Policy
                       <NeonEdges color="green" />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
