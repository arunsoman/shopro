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
  Package, 
  Tag, 
  MoreVertical,
  ArrowRight,
  Database,
  Download,
  Upload,
  Layers,
  CheckCircle2,
  AlertCircle,
  Eye,
  BarChart3,
  Box,
  Truck,
  Filter
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

const PRODUCTS = [
  { id: "P-0421", name: "Premium Arabica Beans", sku: "COF-BRA-001", category: "Coffee", suppliers: 12, price: "$24.50", status: "active", stock: 1240, image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&h=100&fit=crop" },
  { id: "P-1102", name: "Organic Oat Milk", sku: "DAI-OAT-004", category: "Dairy", suppliers: 8, price: "$3.20", status: "active", stock: 8500, image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&h=100&fit=crop" },
  { id: "P-0924", name: "Artisanal Sourdough", sku: "BAK-SOU-102", category: "Bakery", suppliers: 4, price: "$4.10", status: "draft", stock: 0, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&h=100&fit=crop" },
  { id: "P-0223", name: "Aged Cheddar", sku: "DAI-CHE-093", category: "Dairy", suppliers: 15, price: "$18.40", status: "active", stock: 450, image: "https://images.unsplash.com/photo-1485962391945-420003351d1f?w=100&h=100&fit=crop" },
];

export default function ProductMaster() {
  const [filter, setFilter] = useState("all");
  const glowRef = useGlowingBorder();

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic flex items-center gap-3">
               Universal <span className="text-violet-500">Catalog</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium italic">
               <Box className="w-4 h-4 text-violet-500" />
               Master record of all marketplace merchandise
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="group relative px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold italic flex items-center gap-2 hover:shadow-lg transition-all">
                <Upload className="w-4 h-4" />
                Bulk Import
                <NeonEdges />
             </button>
             <button className="group relative px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold italic flex items-center gap-2 hover:scale-[1.02] transition-all overflow-hidden shadow-xl">
                <Plus className="w-4 h-4" />
                Create Master SKU
                <NeonEdges color="violet" />
             </button>
          </div>
        </header>

        {/* Catalog Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
           {[
             { label: "Active SKUs", val: "12,402", change: "+124 this week", icon: Package, color: "blue" },
             { label: "Suppliers Hooked", val: "482", change: "Global Connect", icon: Truck, color: "violet" },
             { label: "Avg Markup", val: "18.4%", change: "Target: 20%", icon: BarChart3, color: "emerald" },
             { label: "Out of Stock", val: "14", change: "Action Needed", icon: AlertCircle, color: "rose" },
           ].map((stat, i) => (
             <div key={i} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 shadow-xl flex items-center justify-between overflow-hidden group relative">
                <GlowingBorder spread={30} borderWidth={1} />
                <div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</div>
                   <div className="text-3xl font-black italic tracking-tight">{stat.val}</div>
                   <div className={cn("text-[10px] font-black uppercase mt-1", stat.color === 'rose' ? 'text-rose-500' : 'text-slate-400')}>{stat.change}</div>
                </div>
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg", `bg-${stat.color}-500/10 text-${stat.color}-500`)}>
                   <stat.icon className="w-6 h-6" />
                </div>
             </div>
           ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 px-2 relative z-20">
           <div className="flex items-center gap-3">
              <div className="relative group/search max-w-xs w-full">
                 <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 group-focus-within/search:text-violet-500 transition-colors" />
                 <input type="text" placeholder="Search Master SKU or name..." className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold italic focus:ring-1 focus:ring-violet-500 transition-all shadow-sm w-[300px]" />
              </div>
              <button className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                 <Filter className="w-4 h-4" />
              </button>
           </div>
           
           <div className="flex items-center gap-1 bg-slate-100/50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl">
              {["Visual Grid", "Data Table"].map(m => (
                <button key={m} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", m === "Data Table" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md active:scale-95" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300")}>
                   {m}
                </button>
              ))}
           </div>
        </div>

        {/* Master Data Grid */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden p-2 group relative">
           <GlowingBorder spread={150} borderWidth={1} />
           <table className="w-full text-left border-collapse relative z-10">
              <thead>
                 <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Merchandise Node</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Taxonomy</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Vendors</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Network Stock</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Base Unit</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
                    <th className="p-6"></th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                 {PRODUCTS.map(prod => (
                   <tr key={prod.id} className="group/tr hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all cursor-pointer">
                      <td className="p-6">
                         <div className="flex items-center gap-4">
                            <div className="relative">
                               <img src={prod.image} className="w-14 h-14 rounded-2xl object-cover shadow-2xl group-hover/tr:rotate-3 transition-transform" />
                               <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center border-2 border-white dark:border-slate-900">
                                  <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
                                     <Layers className="w-3 h-3" />
                                  </motion.div>
                               </div>
                            </div>
                            <div>
                               <div className="text-base font-black italic tracking-tight">{prod.name}</div>
                               <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">{prod.sku}</div>
                            </div>
                         </div>
                      </td>
                      <td className="p-6">
                         <span className="text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5 text-violet-500" />
                            {prod.category}
                         </span>
                      </td>
                      <td className="p-6">
                         <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                               {[1, 2, 3].map(i => (
                                 <div key={i} className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[7px] font-black text-slate-400 uppercase">
                                    V
                                 </div>
                               ))}
                            </div>
                            <span className="text-[10px] font-black italic">+{prod.suppliers}</span>
                         </div>
                      </td>
                      <td className="p-6 text-sm font-black italic text-slate-600 dark:text-slate-400">
                         {prod.stock > 0 ? prod.stock.toLocaleString() : <span className="text-rose-500 opacity-60">Depleted</span>}
                      </td>
                      <td className="p-6 text-base font-black italic">{prod.price}</td>
                      <td className="p-6 text-right">
                         <span className={cn(
                           "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors",
                           prod.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/50' : 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700/50'
                         )}>
                            {prod.status}
                         </span>
                      </td>
                      <td className="p-6 text-right">
                         <div className="flex items-center justify-end gap-2 opacity-0 group-hover/tr:opacity-100 transition-all translate-x-4 group-hover/tr:translate-x-0">
                            <button className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"><Eye className="w-4.5 h-4.5" /></button>
                            <button className="relative px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase italic shadow-xl hover:scale-[1.05] transition-all">
                               Manage SKU
                               <NeonEdges color="violet" />
                            </button>
                         </div>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>

           <div className="p-8 flex items-center justify-between relative z-10">
              <div className="text-[10px] font-black uppercase text-slate-400 italic">Showing 1-4 of 12,402 Master Nodes</div>
              <div className="flex items-center gap-2">
                 <button className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"><ChevronLeft className="w-4 h-4" /></button>
                 {[1, 2, 3, "...", 24].map((p, i) => (
                   <button key={i} className={cn("w-10 h-10 rounded-xl text-xs font-black italic transition-all", p === 1 ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg" : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800")}>
                      {p}
                   </button>
                 ))}
                 <button className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"><ChevronRight className="w-4 h-4" /></button>
              </div>
           </div>
        </div>

        {/* Global Catalog Alert */}
        <div className="mt-12 p-8 bg-slate-100 dark:bg-slate-900 rounded-[3rem] border border-slate-200/50 dark:border-slate-800/50 shadow-xl relative overflow-hidden group">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex items-start gap-6">
                 <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center text-amber-500">
                    <Database className="w-8 h-8" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black italic mb-2">Sync Engine: Latency Spike</h3>
                    <p className="text-slate-400 text-xs font-medium max-w-lg italic leading-relaxed">
                       Global SKU synchronization with Regional Hub (UAE-01) is experiencing 240ms latency. High-volume pricing updates may be delayed by up to 2 minutes.
                    </p>
                 </div>
              </div>
              <button className="px-8 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase italic tracking-widest shadow-2xl hover:scale-[1.02] transition-all">
                 Re-index Global Nodes
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
