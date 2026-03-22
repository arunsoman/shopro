"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  RotateCcw, 
  SkipForward, 
  Pause, 
  Play, 
  Plus, 
  Package,
  ArrowRight,
  ClipboardList,
  Edit3,
  CalendarDays
} from "lucide-react";
import { NeonButton, GlowingBorder, NeonEdges } from "@/components/ui/neon-button";
import { IconTooltip } from "@/components/shared/IconTooltip";
import { SecureOverlay } from "@/components/SecureOverlay";

/**
 * RC-09 — Cyclic Flow & Recurring Schedules
 * Purpose: Automated recurring procurement cycles.
 */

const SCHEDULES = [
  { id: "S-102", name: "Daily Fresh Dairy", frequency: "Every Day", time: "05:00 AM", items: 8, status: "active", next: "Tomorrow, 05:00 AM", color: "blue" },
  { id: "S-105", name: "Weekly Pantry Stock", frequency: "Every Monday", time: "08:00 AM", items: 24, status: "active", next: "Mar 25, 08:00 AM", color: "violet" },
  { id: "S-109", name: "Bi-Weekly Specialty Coffee", frequency: "Every 2nd Tuesday", time: "09:30 AM", items: 4, status: "paused", next: "Apr 02, 09:30 AM", color: "amber" },
];

export default function Schedules() {
  return (
    <SecureOverlay>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20 p-4 lg:p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
          <div className="space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white italic">
               Order <span className="text-brand-primary font-extrabold italic">Schedules</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm flex items-center gap-3">
               <RotateCcw className="w-5 h-5 text-brand-primary" />
               Manage recurring procurement cycles and automated orders.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <button className="h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all shadow-sm italic">
                <CalendarDays size={16} />
                Calendar View
             </button>
             <button className="h-10 px-6 bg-brand-primary text-slate-950 rounded-lg border border-brand-primary/50 font-bold text-[10px] tracking-widest uppercase shadow-md hover:scale-[1.02] transition-all flex items-center gap-2 italic">
                <Plus size={16} />
                New Schedule
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Schedule List Area */}
           <div className="lg:col-span-8 space-y-6">
              <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden p-6 group relative">
                 <GlowingBorder spread={100} />
                 <div className="flex items-center justify-between mb-8 relative z-10">
                    <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                       <ClipboardList className="w-4 h-4 text-brand-primary" />
                       Active Protocols
                    </h2>
                    <div className="flex items-center gap-2">
                       {["Live", "Paused", "Archived"].map(t => (
                         <button key={t} className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all">{t}</button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4 relative z-10">
                    {SCHEDULES.map(s => (
                      <div key={s.id} className="p-4 bg-muted/20 rounded-xl border border-border/50 hover:border-brand-primary/30 transition-all group/item flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden">
                         <div className={cn(
                           "w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover/item:scale-110",
                           s.color === 'blue' ? 'bg-blue-500 text-white shadow-blue-500/20' : s.color === 'violet' ? 'bg-violet-500 text-white shadow-violet-500/20' : 'bg-brand-warning text-white shadow-brand-warning/20'
                         )}>
                            <CalendarIcon className="w-6 h-6" />
                         </div>

                         <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                               <h3 className="text-md font-bold tracking-tight">{s.name}</h3>
                               <span className="text-[9px] font-bold text-muted-foreground px-2 py-0.5 bg-muted rounded-full">ID: {s.id}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                               <span className="flex items-center gap-1.5"><RotateCcw className="w-3 h-3 text-brand-primary" /> {s.frequency}</span>
                               <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-brand-primary" /> {s.time}</span>
                               <span className="flex items-center gap-1.5"><Package className="w-3 h-3 text-brand-primary" /> {s.items} Items</span>
                            </div>
                         </div>

                         <div className="flex items-center gap-6">
                            <div className="text-right">
                               <div className="text-[9px] font-bold uppercase text-muted-foreground mb-0.5 opacity-60">Next Run</div>
                               <div className="text-xs font-bold text-foreground">{s.next}</div>
                            </div>
                             <div className="flex items-center gap-2">
                               <button className="p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-brand-destructive transition-all shadow-sm">
                                  <IconTooltip label="Skip Next Run"><SkipForward className="w-4 h-4" /></IconTooltip>
                               </button>
                               <button className="p-2 rounded-lg bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-lg hover:scale-105 transition-all">
                                  <IconTooltip label={s.status === 'active' ? "Pause" : "Resume"}>
                                    {s.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                                  </IconTooltip>
                               </button>
                               <button className="p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-brand-primary transition-all shadow-sm">
                                  <IconTooltip label="Edit Schedule"><Edit3 className="w-4 h-4" /></IconTooltip>
                               </button>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

               <div className="p-6 bg-zinc-950 rounded-2xl text-white shadow-3xl overflow-hidden relative group border border-white/5">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none" />
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="flex-1 space-y-6">
                       <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Upcoming Cycle Volume</h3>
                       <div className="flex items-end gap-2.5 h-20">
                          {[40, 70, 45, 90, 65, 30, 80].map((v, i) => (
                            <div key={i} className="flex-1 bg-white/5 rounded-t-lg group/bar relative overflow-hidden h-full">
                               <motion.div 
                                 initial={{ height: 0 }} 
                                 animate={{ height: `${v}%` }} 
                                 transition={{ duration: 1.5, delay: i * 0.1 }} 
                                 className="absolute bottom-0 inset-x-0 bg-brand-primary rounded-t-lg shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.3)]" 
                               />
                            </div>
                          ))}
                       </div>
                       <div className="flex justify-between text-[9px] font-bold uppercase text-zinc-600 tracking-tighter">
                          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                       </div>
                    </div>
                     <div className="max-w-[280px] space-y-5">
                        <div className="text-2xl font-extrabold tracking-tight leading-tight">High Volume Peak: <span className="text-brand-primary">Thursday</span></div>
                       <p className="text-zinc-400 text-xs font-medium leading-relaxed">System expects 12 POs across 5 suppliers. Ensure staff is ready for intake.</p>
                       <button className="text-[10px] font-bold uppercase text-brand-primary flex items-center gap-2 tracking-widest hover:gap-3 transition-all transition-colors">
                          View Capacity Logic <ArrowRight className="w-3.5 h-3.5" />
                       </button>
                    </div>
                 </div>
              </div>
           </div>

            {/* Quick Setup Sidebar */}
            <div className="lg:col-span-4 space-y-6">
               <div className="bg-card rounded-2xl border border-border p-6 shadow-lg relative overflow-hidden group">
                 <GlowingBorder spread={30} />
                 <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-8">Scheduling Presets</h3>
                  <div className="space-y-3 relative z-10">
                     {[
                       { label: "Fresh Daily (Bread/Milk)", items: "8 Items" },
                       { label: "Dry Stock (Weekly)", items: "45 Items" },
                       { label: "Monthly Maintenance", items: "12 Items" },
                     ].map((p, i) => (
                       <button key={i} className="w-full p-3 bg-muted/30 rounded-xl border border-transparent hover:border-brand-primary/30 transition-all text-left flex items-center justify-between group/p">
                         <div>
                            <div className="text-sm font-bold">{p.label}</div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{p.items}</div>
                         </div>
                         <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center group-hover/p:bg-brand-primary group-hover/p:text-white transition-colors shadow-sm">
                            <ArrowRight className="w-4 h-4" />
                         </div>
                       </button>
                    ))}
                 </div>
                 <button className="w-full mt-6 py-4 rounded-xl bg-muted/50 text-muted-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-muted transition-all border border-border/50 flex items-center justify-center gap-2 relative z-10">
                    <Plus className="w-4 h-4" />
                    Custom Interval
                 </button>
              </div>

               <div className="p-6 bg-brand-warning/5 border border-brand-warning/10 rounded-2xl flex flex-col gap-6 group overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-brand-warning/10 rounded-full blur-xl pointer-events-none" />
                 <div className="w-14 h-14 rounded-2xl bg-brand-warning/20 border border-brand-warning/30 flex items-center justify-center text-brand-warning shadow-xl shadow-brand-warning/10 group-hover:rotate-6 transition-transform">
                    <RotateCcw className="w-7 h-7" />
                 </div>
                  <div>
                     <h4 className="text-lg font-extrabold tracking-tight text-brand-warning mb-2 leading-none uppercase">Holiday Alert</h4>
                    <p className="text-brand-warning/70 text-xs font-semibold leading-relaxed italic">
                       Multiple suppliers have "Blackout Dates" coming up for the next lunar holiday. Check your Monday schedules.
                    </p>
                 </div>
                 <button className="w-full py-3.5 rounded-xl bg-brand-warning text-white text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-warning/20">
                    Manage Exclusions
                 </button>
              </div>
           </div>
        </div>
      </div>
    </SecureOverlay>
  );
}
