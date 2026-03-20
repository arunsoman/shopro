"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Send,
  User,
  Building,
  LifeBuoy,
  FileQuestion,
  BookOpen,
  Paperclip,
  Star,
  ArrowUpRight,
  ShieldCheck
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

const CONTACTS = [
  { id: "s1", name: "Global Coffee Traders", role: "Primary Supplier", online: true, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=100&h=100&fit=crop" },
  { id: "s2", name: "Fresh Dairy Solutions", role: "Primary Supplier", online: false, lastSeen: "2h ago", image: "https://images.unsplash.com/photo-1563636619-e910cf493996?w=100&h=100&fit=crop" },
  { id: "m1", name: "Marketplace Support", role: "System Help", online: true, image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop" },
];

const TICKETS = [
  { id: "#T-8219", subject: "Delayed Delivery @ Sector 4", status: "open", date: "Mar 19" },
  { id: "#T-8192", subject: "Refund for Damaged Oat Milk", status: "resolved", date: "Mar 15" },
];

export default function Support() {
  const [activeChat, setActiveChat] = useState(CONTACTS[0]);
  const glowRef = useGlowingBorder();

  return (
    <div className="min-h-screen bg-slate-50/30 dark:bg-black p-4 sm:p-8">
      <div className="max-w-7xl mx-auto h-[calc(100vh-120px)] flex flex-col">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-4 shrink-0">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter italic flex items-center gap-3">
              Concierge <span className="text-violet-500">Center</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic">
               <LifeBuoy className="w-4 h-4 text-violet-500" />
               Instant support and supplier connectivity
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Search */}
             <div className="relative group hidden md:block">
                <input type="text" placeholder="Search resources..." className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs w-64 focus:ring-2 focus:ring-violet-500 transition-all font-medium" />
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
             </div>
          </div>
        </header>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
           {/* Sidebar: Contacts & Tickets */}
           <div className="lg:col-span-3 space-y-6 overflow-y-auto pr-2 hide-scrollbar">
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-lg p-6 relative overflow-hidden group">
                 <GlowingBorder spread={30} borderWidth={1} />
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 italic">Active Threads</h3>
                 <div className="space-y-4">
                    {CONTACTS.map(c => (
                      <div key={c.id} onClick={() => setActiveChat(c)} className={cn("group/contact flex items-center gap-3 p-2 rounded-2xl cursor-pointer transition-all", activeChat.id === c.id ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl scale-105" : "hover:bg-slate-50 dark:hover:bg-slate-800/50")}>
                         <div className="relative">
                            <img src={c.image} alt="" className="w-10 h-10 rounded-xl object-cover ring-2 ring-transparent group-hover/contact:ring-violet-500 transition-all" />
                            {c.online && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />}
                         </div>
                         <div className="min-w-0">
                            <div className="text-xs font-black truncate">{c.name}</div>
                            <div className={cn("text-[9px] font-bold uppercase tracking-tighter", activeChat.id === c.id ? "opacity-60" : "text-slate-400")}>{c.role}</div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-lg p-6 relative overflow-hidden group">
                 <GlowingBorder spread={30} borderWidth={1} />
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Open Tickets</h3>
                    <div className="w-5 h-5 rounded-lg bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">1</div>
                 </div>
                 <div className="space-y-4">
                    {TICKETS.map(t => (
                      <div key={t.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 group/tkt cursor-pointer hover:border-violet-500 transition-all">
                         <div className="flex justify-between items-start mb-1">
                            <span className="text-[9px] font-black text-violet-500 uppercase">{t.id}</span>
                            <span className="text-[9px] font-bold text-slate-400">{t.date}</span>
                         </div>
                         <div className="text-[10px] font-black text-slate-900 dark:text-white truncate mb-2">{t.subject}</div>
                         <div className={cn(
                           "inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                           t.status === 'open' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-green-50 text-green-600 border-green-200'
                         )}>
                            {t.status}
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Main: Chat View */}
           <div className="lg:col-span-6 flex flex-col bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden group">
              <GlowingBorder spread={100} borderWidth={1} />
              
              {/* Chat Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 relative z-10">
                 <div className="flex items-center gap-4">
                    <img src={activeChat.image} alt="" className="w-12 h-12 rounded-2xl object-cover" />
                    <div>
                       <h2 className="text-lg font-black italic tracking-tight">{activeChat.name}</h2>
                       <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", activeChat.online ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-slate-300")} />
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{activeChat.online ? "Online & Ready" : `Last seen ${activeChat.lastSeen}`}</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <button className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-violet-500 transition-all"><Phone className="w-5 h-5" /></button>
                    <button className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-violet-500 transition-all"><MoreVertical className="w-5 h-5" /></button>
                 </div>
              </div>

              {/* Chat Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar relative z-10">
                 <div className="flex flex-col items-center gap-3 mb-10 opacity-40">
                    <div className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest">Yesterday, Mar 19</div>
                 </div>

                 <div className="flex gap-3 max-w-[80%]">
                    <img src={activeChat.image} alt="" className="w-8 h-8 rounded-lg shrink-0 object-cover mt-1" />
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-[1.5rem] rounded-tl-none">
                       <p className="text-sm font-medium leading-relaxed italic">"Hi Chef! Just a heads up that your Arabica order is currently being roasted and will be dispatched in about an hour."</p>
                       <span className="text-[9px] font-bold text-slate-400 mt-2 block">16:42 PM</span>
                    </div>
                 </div>

                 <div className="flex gap-3 max-w-[80%] self-end flex-row-reverse">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center shrink-0 mt-1">
                       <User className="w-4 h-4 text-white dark:text-slate-900" />
                    </div>
                    <div className="p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] rounded-tr-none shadow-xl">
                       <p className="text-sm font-medium leading-relaxed italic">"Great news. Can you also check if you have any Cascara in stock? We might need 2kg for a new seasonal drink."</p>
                       <span className="text-[9px] font-bold opacity-40 mt-2 block">16:45 PM</span>
                    </div>
                 </div>

                 <div className="flex gap-3 max-w-[80%]">
                    <img src={activeChat.image} alt="" className="w-8 h-8 rounded-lg shrink-0 object-cover mt-1" />
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-[1.5rem] rounded-tl-none relative group">
                       <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-[10px] font-black uppercase italic tracking-tight">System Message</span>
                       </div>
                       <p className="text-sm font-medium leading-relaxed italic">"I'll check the warehouse now. I'll get back to you in 5 mins."</p>
                       <span className="text-[9px] font-bold text-slate-400 mt-2 block">16:48 PM</span>
                    </div>
                 </div>
              </div>

              {/* Chat Input */}
              <div className="p-6 shrink-0 relative z-10">
                 <div className="relative group">
                    <GlowingBorder spread={20} borderWidth={1} />
                    <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-[2rem] border border-transparent group-focus-within:border-violet-500 transition-all">
                       <button className="p-3 rounded-full text-slate-400 hover:text-violet-500 hover:bg-white dark:hover:bg-slate-900 transition-all"><Paperclip className="w-5 h-5" /></button>
                       <input type="text" placeholder="Type a message..." className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium italic p-2" />
                       <button className="w-12 h-12 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-xl hover:scale-105 transition-all">
                          <Send className="w-5 h-5 ml-0.5" />
                       </button>
                    </div>
                 </div>
              </div>
           </div>

           {/* Right Panel: Resources */}
           <div className="lg:col-span-3 space-y-6 overflow-y-auto hide-scrollbar">
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-lg p-8 relative overflow-hidden group">
                 <GlowingBorder spread={30} borderWidth={1} />
                 <div className="flex flex-col items-center text-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-[2rem] bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-violet-500 shadow-xl shadow-violet-500/10">
                       <FileQuestion className="w-8 h-8" />
                    </div>
                    <div>
                       <h3 className="text-lg font-black italic tracking-tight">Need Help?</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Search the knowledge base</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    {[
                      { icon: BookOpen, label: "Platform Tutorial", color: "blue" },
                      { icon: ShieldCheck, label: "Security & Compliance", color: "green" },
                      { icon: AlertCircle, label: "Conflict Resolution", color: "rose" },
                    ].map((item, i) => (
                      <button key={i} className="w-full group/btn p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center gap-3 hover:border-violet-500 transition-all">
                         <item.icon className={cn("w-4 h-4", `text-${item.color}-500`)} />
                         <span className="text-[11px] font-black uppercase tracking-tight text-slate-600 dark:text-slate-400 group-hover/btn:text-slate-900 dark:group-hover/btn:text-white transition-colors">{item.label}</span>
                         <ArrowUpRight className="w-4 h-4 ml-auto opacity-0 group-hover/btn:opacity-100 transition-all text-violet-500" />
                      </button>
                    ))}
                 </div>
              </div>

              <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/20 rounded-full blur-2xl" />
                 <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-4">Supplier Rating</h3>
                 <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-black italic">4.8</span>
                    <div className="flex gap-0.5">
                       {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                    </div>
                 </div>
                 <p className="text-[10px] font-bold text-white/40 leading-relaxed italic">
                    Based on 145 interactions with <span className="text-white">Global Coffee Traders</span>.
                 </p>
                 <button className="w-full mt-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest transition-all">
                    View Full Report
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

