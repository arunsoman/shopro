"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Shield, 
  Lock, 
  Users, 
  Key, 
  CheckCircle2, 
  XCircle, 
  MoreVertical,
  Plus,
  Search,
  Zap,
  Eye,
  Edit3,
  Trash2,
  ShieldCheck,
  ShieldAlert,
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

const ROLES = [
  { id: "ROL-01", name: "Super Admin", users: 3, permissions: "All Access", level: "L4", color: "rose" },
  { id: "ROL-02", name: "Regional Manager", users: 12, permissions: "Operations, CRM, Disputes", level: "L3", color: "violet" },
  { id: "ROL-03", name: "Financial Auditor", users: 5, permissions: "Ledger, Payouts, Tax", level: "L3", color: "emerald" },
  { id: "ROL-04", name: "Support Agent", users: 45, permissions: "Disputes (Read/Edit), PO Views", level: "L1", color: "blue" },
];

export default function UserRoles() {
  const [filter, setFilter] = useState("all");
  const glowRef = useGlowingBorder();

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic flex items-center gap-3 uppercase">
               Guard <span className="text-emerald-500">Post</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic">
               <ShieldCheck className="w-4 h-4 text-emerald-500" />
               Granular identity management and permission forging
            </p>
          </div>
          
          <button className="group relative px-10 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase italic tracking-widest hover:scale-[1.02] transition-all overflow-hidden shadow-xl">
             Create New Role
             <NeonEdges color="green" />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Role Grid */}
           <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 font-black italic">
                 {ROLES.map(role => (
                   <div key={role.id} className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-10 shadow-xl group relative overflow-hidden cursor-pointer hover:border-emerald-200 transition-all">
                      <GlowingBorder spread={40} borderWidth={1} />
                      <div className="flex justify-between items-start mb-8">
                         <div className={cn("w-16 h-16 rounded-[2rem] flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform", 
                           role.color === 'rose' ? 'bg-rose-500 shadow-rose-500/20' : 
                           role.color === 'violet' ? 'bg-violet-500 shadow-violet-500/20' :
                           role.color === 'emerald' ? 'bg-emerald-500 shadow-emerald-500/20' :
                           'bg-blue-500 shadow-blue-500/20'
                         )}>
                            <Shield className="w-8 h-8" />
                         </div>
                         <div className="text-right">
                            <div className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">{role.id}</div>
                            <div className="text-xs font-black uppercase text-emerald-500">{role.level} Access</div>
                         </div>
                      </div>
                      
                      <h3 className="text-2xl tracking-tighter mb-4 uppercase leading-none">{role.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold mb-8 opacity-60 line-clamp-2 italic">{role.permissions}</p>
                      
                      <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-slate-800/40">
                         <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-300" />
                            <span className="text-sm">{role.users} Users</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <button className="p-2 text-slate-300 hover:text-slate-900"><Edit3 className="w-4.5 h-4.5" /></button>
                            <button className="p-2 text-slate-300 hover:text-rose-500"><Trash2 className="w-4.5 h-4.5" /></button>
                         </div>
                      </div>
                   </div>
                 ))}
                 
                 <div className="bg-slate-50 dark:bg-slate-800/20 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-12 group cursor-pointer hover:border-emerald-500/40 transition-all">
                    <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                       <Plus className="w-6 h-6 text-slate-400 group-hover:text-emerald-500" />
                    </div>
                    <div className="text-[10px] font-black uppercase text-slate-400 group-hover:text-slate-900 transition-colors">Custom Policy Forge</div>
                 </div>
              </div>
           </div>

           {/* Security Sentinel */}
           <div className="lg:col-span-4 space-y-6 font-black italic">
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-3xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-10 tracking-widest leading-none">Identity Health</h3>
                 
                 <div className="space-y-10 relative z-10">
                    <div className="flex items-start gap-6">
                       <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                          <Fingerprint className="w-8 h-8" />
                       </div>
                       <div>
                          <div className="text-2xl tracking-tighter mb-1 uppercase">100% MFA</div>
                          <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-none">Security Compliance</div>
                       </div>
                    </div>

                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                       <div className="flex justify-between items-center mb-4 text-[10px] uppercase tracking-widest opacity-60">
                          <span>Suspicious Logins</span>
                          <span className="text-rose-500">0 High Risk</span>
                       </div>
                       <div className="flex gap-1 h-8 items-end">
                          {[20, 35, 15, 60, 25, 10, 5].map((h, i) => (
                            <div key={i} className="flex-1 bg-white/10 rounded-t-sm" />
                          ))}
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl p-10 group relative overflow-hidden">
                 <GlowingBorder spread={30} borderWidth={1} />
                 <h3 className="text-xl italic mb-8 flex items-center gap-3 uppercase tracking-tighter leading-none">
                   <Lock className="w-6 h-6 text-emerald-500" />
                   Permissions
                 </h3>
                 <div className="space-y-6">
                    {[
                      { label: "Withdraw Funds", level: "L4 Only" },
                      { label: "Delete Supplier", level: "L4 + Admin" },
                      { label: "Adjust Pricing", level: "L3 Ops" },
                      { label: "Resolve Dispute", level: "L2 Support" },
                    ].map((p, i) => (
                      <div key={i} className="flex items-center justify-between">
                         <span className="text-[10px] uppercase opacity-60 tracking-tight">{p.label}</span>
                         <span className={cn("px-3 py-1 rounded-lg text-[8px] uppercase tracking-widest border font-black", 
                           p.level.includes('L4') ? 'border-amber-200 text-amber-600 bg-amber-50' : 'border-slate-100 text-slate-400 bg-slate-50'
                         )}>
                            {p.level}
                         </span>
                      </div>
                    ))}
                    
                    <button className="w-full py-4 mt-6 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] uppercase tracking-widest italic shadow-xl relative overflow-hidden group/btn">
                       Access Audit Log
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
