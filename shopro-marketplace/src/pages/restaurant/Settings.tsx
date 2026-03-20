"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Bell, 
  Lock, 
  Users, 
  Globe, 
  Moon, 
  Sun, 
  Smartphone,
  Mail,
  Shield,
  CreditCard,
  Settings as SettingsIcon,
  CheckCircle2,
  MoreVertical,
  Plus,
  ArrowRight
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

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

export function Switch({ checked, onChange, label, description }: { checked: boolean, onChange: (v: boolean) => void, label: string, description?: string }) {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
       <div className="flex-1">
          <div className="text-sm font-bold italic text-slate-900 dark:text-white leading-tight">{label}</div>
          {description && <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-tight">{description}</p>}
       </div>
       <button 
        onClick={() => onChange(!checked)}
        className={cn("relative w-11 h-6 rounded-full transition-all duration-300", checked ? "bg-violet-500" : "bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700")}
       >
          <motion.div 
            animate={{ x: checked ? 20 : 2 }} 
            className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-md", checked ? "bg-white" : "bg-slate-400")} 
          />
       </button>
    </div>
  );
}

// ─── PAGE COMPONENT ──────────────────────────────────────────────────────────

const TEAM = [
  { id: "u1", name: "Alex Rivera", role: "Owner", email: "alex@urbanbean.com", image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop" },
  { id: "u2", name: "Monica Chen", role: "Purchasing Manager", email: "monica@urbanbean.com", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
  { id: "u3", name: "Chef Marcus", role: "Kitchen Lead", email: "marcus@urbanbean.com", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("account");
  const [notifs, setNotifs] = useState({ orders: true, delivery: true, pricing: false, security: true });
  const glowRef = useGlowingBorder();

  const TABS = [
    { id: "account", label: "Merchant DNA", icon: User },
    { id: "notifications", label: "Alert Matrix", icon: Bell },
    { id: "security", label: "Vault & Key", icon: Lock },
    { id: "team", label: "Squad Cast", icon: Users },
    { id: "preferences", label: "Nodes & Logic", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50/20 dark:bg-black p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic flex items-center gap-3">
               System <span className="text-violet-500">Core</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic">
               <SettingsIcon className="w-4 h-4 text-violet-500" />
               Granular control over your marketplace presence
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                Version 2.4.0-Stable
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
           {/* Sidebar Navigation */}
           <div className="lg:col-span-3 space-y-2">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("w-full px-6 py-4 rounded-2xl flex items-center gap-4 text-sm font-black italic transition-all group relative overflow-hidden", activeTab === tab.id ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl scale-105" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50")}>
                   <tab.icon className={cn("w-5 h-5 transition-transform", activeTab === tab.id ? "scale-110" : "group-hover:scale-110")} />
                   {tab.label}
                   {activeTab === tab.id && <motion.div layoutId="tab-glow" className="absolute left-0 w-1 h-3/4 bg-violet-500 rounded-full" />}
                </button>
              ))}
              
              <div className="mt-12 p-6 bg-slate-900 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-violet-500/20 rounded-full blur-2xl" />
                 <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 italic tracking-[0.2em]">Live Node Status</h3>
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
                    <span className="text-xs font-bold leading-none">Gateway: Connected</span>
                 </div>
                 <button className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest transition-all">
                    Hard Reset Node
                 </button>
              </div>
           </div>

           {/* Content Area */}
           <div className="lg:col-span-9">
              <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl p-10 overflow-hidden min-h-[600px] group">
                 <GlowingBorder spread={100} borderWidth={1} />
                 
                 <AnimatePresence mode="wait">
                    {activeTab === 'notifications' && (
                      <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={SPRING}>
                         <h2 className="text-2xl font-black italic tracking-tight mb-8">Notification Control</h2>
                         <div className="space-y-2 max-w-2xl">
                            <Switch checked={notifs.orders} onChange={(v) => setNotifs({...notifs, orders: v})} label="Order Thresholds" description="Alert when stocks drop below reorder point" />
                            <Switch checked={notifs.delivery} onChange={(v) => setNotifs({...notifs, delivery: v})} label="Supply Chain Matrix" description="Real-time dispatch and delivery status updates" />
                            <Switch checked={notifs.pricing} onChange={(v) => setNotifs({...notifs, pricing: v})} label="Dynamic Pricing" description="Supplier price hike or markdown alerts via AI" />
                            <Switch checked={notifs.security} onChange={(v) => setNotifs({...notifs, security: v})} label="Node Verification" description="Merchant DNA access and bank record change logs" />
                         </div>
                         <div className="mt-12 p-8 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-3xl flex items-center gap-6 italic group/card overflow-hidden relative">
                            <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center text-white shrink-0 shadow-xl shadow-blue-500/20 group-hover/card:scale-110 transition-transform">
                               <Smartphone className="w-7 h-7" />
                            </div>
                            <div className="flex-1">
                               <h3 className="text-lg font-black italic tracking-tight text-blue-900 dark:text-blue-400">Mobile Push Node</h3>
                               <p className="text-xs text-blue-700/60 dark:text-blue-400/40 font-bold italic">iPhone 15 Pro Max connected. Last ping: 4m ago.</p>
                            </div>
                            <button className="px-6 py-2.5 rounded-xl bg-blue-900 dark:bg-blue-400 text-white dark:text-blue-950 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all italic">Disconnect Device</button>
                         </div>
                      </motion.div>
                    )}

                    {activeTab === 'team' && (
                       <motion.div key="team" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={SPRING}>
                          <div className="flex items-center justify-between mb-8">
                             <h2 className="text-2xl font-black italic tracking-tight">Active Squad</h2>
                             <button className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black italic flex items-center gap-2 hover:scale-[1.05] transition-all shadow-lg">
                                <Plus className="w-4 h-4" />
                                Invite Member
                                <NeonEdges color="violet" />
                             </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {TEAM.map(member => (
                               <div key={member.id} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-transparent hover:border-violet-300 dark:hover:border-violet-800 transition-all group/member flex items-center gap-4 relative overflow-hidden">
                                  <img src={member.image} className="w-14 h-14 rounded-[1.5rem] object-cover ring-2 ring-white dark:ring-slate-900 group-hover/member:scale-105 transition-transform" />
                                  <div className="flex-1">
                                     <div className="text-base font-black italic tracking-tight">{member.name}</div>
                                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">{member.role}</div>
                                     <div className="text-[9px] font-bold text-violet-500 underline flex items-center gap-1">
                                        <Mail className="w-3 h-3" />
                                        {member.email}
                                     </div>
                                  </div>
                                  <button className="p-2 text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                                     <MoreVertical className="w-5 h-5" />
                                  </button>
                                  <div className="absolute top-0 right-0 w-16 h-16 bg-violet-500/5 rounded-full blur-xl group-hover/member:bg-violet-500/10 transition-colors" />
                               </div>
                             ))}
                          </div>
                       </motion.div>
                    )}

                    {activeTab === 'account' && (
                       <motion.div key="account" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={SPRING}>
                          <h2 className="text-2xl font-black italic tracking-tight mb-8">Node Credentials</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-6">
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1 italic">Merchant Handle</label>
                                   <input type="text" defaultValue="@theurbanbean" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-base font-black italic focus:ring-2 focus:ring-violet-500 transition-all shadow-sm" />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1 italic">Network Relay</label>
                                   <input type="text" defaultValue="Dubai-Terminal-Node-A" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-base font-black italic focus:ring-2 focus:ring-violet-500 transition-all shadow-sm" />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1 italic">Merchant ID (Public)</label>
                                   <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-between">
                                      <code className="text-xs font-mono font-bold opacity-60">SHPR-MBR-2024-X-921</code>
                                      <button className="text-[10px] font-black uppercase text-violet-500 underline">Regenerate</button>
                                   </div>
                                </div>
                             </div>
                             
                             <div className="p-8 bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800 rounded-[2rem] flex flex-col justify-between overflow-hidden relative group">
                                <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-violet-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                                <div>
                                   <div className="w-12 h-12 rounded-2xl bg-violet-500 flex items-center justify-center text-white shadow-xl mb-4">
                                      <Shield className="w-6 h-6" />
                                   </div>
                                   <h3 className="text-lg font-black italic tracking-tight mb-2">Merchant Shield</h3>
                                   <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic mb-8">
                                      Your merchant presence is protected by 2FA and node-level encryption. All marketplace orders are cryptographically signed.
                                   </p>
                                </div>
                                <button className="w-full py-4 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-black uppercase italic tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all overflow-hidden shadow-xl">
                                   View Log Summary
                                   <ArrowRight className="w-4 h-4" />
                                   <NeonEdges color="violet" />
                                </button>
                             </div>
                          </div>
                       </motion.div>
                    )}
                 </AnimatePresence>
                 
                 {/* Floating Save Bar (replaces ToastSave pattern for persistence) */}
                 <AnimatePresence>
                    <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="absolute bottom-8 left-10 right-10 p-5 bg-slate-900/95 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-3xl z-20 flex items-center justify-between overflow-hidden group/save">
                        <GlowingBorder spread={50} borderWidth={1} />
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400">
                              <CheckCircle2 className="w-5 h-5 shadow-[0_0_10px_#8b5cf6]" />
                           </div>
                           <div>
                              <div className="text-xs font-black italic text-white tracking-tight leading-none mb-1">Unsaved Parameters</div>
                              <div className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">Your local node has been modified</div>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <button className="px-6 py-2.5 text-xs font-black uppercase text-white/40 hover:text-white transition-colors italic">Discard</button>
                           <button className="px-8 py-2.5 rounded-xl bg-violet-500 text-white text-xs font-black italic tracking-tight hover:scale-[1.05] transition-all shadow-xl overflow-hidden relative group/btn2">
                              Propagate Changes
                              <NeonEdges active color="violet" />
                           </button>
                        </div>
                    </motion.div>
                 </AnimatePresence>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
