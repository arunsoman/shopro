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
  Folder, 
  Hash, 
  Layers, 
  Tag, 
  MoreVertical,
  ArrowRight,
  Settings2,
  Trash2,
  Edit2,
  PlusSquare,
  Package,
  GanttChartSquare,
  CheckCircle2,
  ChevronDown,
  LayoutGrid
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

const TAXONOMY = [
  { id: "c1", name: "Beverages", items: 450, sub: [
    { id: "sc1", name: "Coffee", items: 120, attributes: ["Roast Level", "Origin", "Process"] },
    { id: "sc2", name: "Spirits", items: 85, attributes: ["ABV", "Region", "Age"] },
    { id: "sc3", name: "Soft Drinks", items: 245, attributes: ["Sugar Content", "Packaging"] },
  ]},
  { id: "c2", name: "Dairy & Eggs", items: 124, sub: [
    { id: "sc4", name: "Milk", items: 42, attributes: ["Fat Content", "Pasteurization"] },
    { id: "sc5", name: "Cheese", items: 56, attributes: ["Type", "Hardness", "Aging"] },
  ]},
  { id: "c3", name: "Bakery", items: 82, sub: [] },
  { id: "c4", name: "Provisions", items: 340, sub: [] },
];

export default function CategoryManagement() {
  const [selected, setSelected] = useState("c1");
  const glowRef = useGlowingBorder();

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic flex items-center gap-3">
               Taxonomy <span className="text-violet-500">Forge</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic">
               <Layers className="w-4 h-4 text-violet-500" />
               Architecting the marketplace product hierarchy
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="group relative px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold italic flex items-center gap-2 hover:scale-[1.02] transition-all overflow-hidden shadow-xl">
                <PlusSquare className="w-4 h-4" />
                Root Category
                <NeonEdges color="violet" />
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
           {/* Category Tree Sidebar */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl p-8 group relative overflow-hidden h-[calc(100vh-250px)] flex flex-col">
                 <GlowingBorder spread={50} borderWidth={1} />
                 
                 <div className="relative mb-8 group/search">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within/search:text-violet-500 transition-colors" />
                    <input type="text" placeholder="Filter taxonomy..." className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold italic focus:ring-1 focus:ring-violet-500 transition-all font-medium" />
                 </div>

                 <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-hide">
                    {TAXONOMY.map(cat => (
                      <div key={cat.id} className="space-y-1">
                         <button onClick={() => setSelected(cat.id)} className={cn("w-full px-5 py-3 rounded-2xl flex items-center justify-between transition-all group/cat", selected === cat.id ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl scale-105" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50")}>
                            <div className="flex items-center gap-3">
                               <Folder className={cn("w-4 h-4 transition-transform", selected === cat.id ? "scale-110" : "group-hover/cat:scale-110")} />
                               <span className="text-xs font-black italic">{cat.name}</span>
                            </div>
                            <span className="text-[9px] font-black opacity-40 italic">{cat.items}</span>
                         </button>
                         {cat.sub.length > 0 && selected === cat.id && (
                           <div className="pl-8 space-y-1 mt-1">
                              {cat.sub.map(sub => (
                                <button key={sub.id} className="w-full px-4 py-2 rounded-xl flex items-center justify-between text-[10px] font-black italic text-slate-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-all group/sub">
                                   <div className="flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover/sub:bg-violet-500 transition-colors" />
                                      {sub.name}
                                   </div>
                                   <span className="opacity-40">{sub.items}</span>
                                </button>
                              ))}
                           </div>
                         )}
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Category Detail & Attributes Editor */}
           <div className="lg:col-span-8 space-y-6 overflow-y-auto hide-scrollbar h-[calc(100vh-250px)]">
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-3xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 rounded-full blur-[100px]" />
                 
                 <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
                    <div>
                       <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-4 italic tracking-widest">Active Selector Index</div>
                       <h2 className="text-5xl font-black italic tracking-tighter leading-none mb-4">Beverages <span className="text-violet-500">Node</span></h2>
                       <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[9px] font-black uppercase italic tracking-widest">
                             <CheckCircle2 className="w-3 h-3 text-emerald-400" /> System Root
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[9px] font-black uppercase italic tracking-widest">
                             <Package className="w-3 h-3 text-violet-400" /> 3 Sub-Nodes
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                       <button className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase italic tracking-widest transition-all">Archival</button>
                       <button className="px-8 py-3 rounded-xl bg-violet-600 text-white text-[10px] font-black uppercase italic tracking-widest transition-all hover:scale-[1.05] shadow-xl">Edit Header</button>
                    </div>
                 </div>
              </div>

              <div className="relative bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl p-10 overflow-hidden group">
                 <GlowingBorder spread={100} borderWidth={1} />
                 
                 <div className="flex items-center justify-between mb-10">
                    <h3 className="text-xl font-black italic flex items-center gap-2 racking-tight">
                       <Tag className="w-5 h-5 text-violet-500" />
                       Attribute Template
                    </h3>
                    <button className="text-[10px] font-black uppercase text-violet-500 flex items-center gap-2 hover:underline italic">
                       Apply Schema <ArrowRight className="w-4 h-4" />
                    </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {["Packaging Type", "Storage Required", "Brand Reference", "Unit Volume", "Tax Classification"].map((attr, i) => (
                      <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-transparent hover:border-violet-300 transition-all group/attr relative flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800 group-hover/attr:scale-105 transition-transform">
                               <Hash className="w-4 h-4 text-slate-400" />
                            </div>
                            <div>
                               <div className="text-xs font-black italic">{attr}</div>
                               <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">System Required</div>
                            </div>
                         </div>
                         <div className="flex items-center gap-2 opacity-0 group-hover/attr:opacity-100 transition-all">
                            <button className="p-2 text-slate-400 hover:text-violet-500"><Edit2 className="w-4 h-4" /></button>
                            <button className="p-2 text-slate-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                         </div>
                      </div>
                    ))}
                    
                    <button className="p-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl flex items-center justify-center gap-3 text-slate-400 hover:bg-slate-50 transition-all group/plus">
                       <PlusSquare className="w-5 h-5 group-hover/plus:text-violet-500 transition-colors" />
                       <span className="text-[10px] font-black uppercase italic tracking-widest">Append Definition</span>
                    </button>
                 </div>

                 <div className="mt-12 p-8 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-800 rounded-3xl flex items-start gap-6 relative overflow-hidden group/warn">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover/warn:scale-150 transition-transform" />
                    <Settings2 className="w-10 h-10 text-amber-500 shrink-0 mt-1" />
                    <div className="flex-1">
                       <h4 className="text-base font-black italic text-amber-900 dark:text-amber-400 mb-1">Tax Schema Alert</h4>
                       <p className="text-[11px] font-medium text-amber-700/60 dark:text-amber-500/50 leading-relaxed italic max-w-lg">
                          Modified attributes in the <span className="text-amber-950 font-black">Beverages</span> root will cascade to all sub-nodes. Ensure CSV exports are updated accordingly to avoid data ingestion errors in the Supplier Portal.
                       </p>
                    </div>
                    <button className="px-6 py-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-xl text-[10px] font-black uppercase italic text-amber-600 transition-all hover:scale-[1.05]">Fix Cascade</button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl flex items-center gap-6 group">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                       <LayoutGrid className="w-7 h-7" />
                    </div>
                    <div>
                       <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Catalog Depth</div>
                       <div className="text-2xl font-black italic">Level 4 Node</div>
                    </div>
                 </div>
                 <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl flex items-center gap-6 group">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                       <GanttChartSquare className="w-7 h-7" />
                    </div>
                    <div>
                       <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Mapping Status</div>
                       <div className="text-2xl font-black italic text-emerald-500">Unified</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
