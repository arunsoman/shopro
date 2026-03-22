"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Sparkles, 
  Zap, 
  TrendingUp, 
  Target, 
  ShieldCheck, 
  Settings2,
  Clock,
  ArrowRight,
  Plus, 
  Trash2, 
  Info, 
  BarChart3, 
  Bot 
} from "lucide-react";
import { NeonButton, GlowingBorder, NeonEdges } from "@/components/ui/neon-button";
import { IconTooltip } from "@/components/shared/IconTooltip";
import { SecureOverlay } from "@/components/SecureOverlay";

/**
 * RC-08 — Predictive Logistics & Reorder Rules
 * Purpose: AI-optimized supply chain management.
 */

const RULES = [
  { id: "r1", item: "Premium Arabica Beans", current: 20, suggested: 35, confidence: 98, status: "active", reason: "Increased weekend demand forecast (Eid Al-Fitr)" },
  { id: "r2", item: "Whole Milk", current: 40, suggested: 60, confidence: 94, status: "active", reason: "Supplier lead time increased by 8h" },
  { id: "r3", item: "Oat Milk - Barista", current: 30, suggested: 30, confidence: 85, status: "paused", reason: "Stable consumption pattern" },
];

export default function ReorderRules() {
  return (
    <SecureOverlay>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20 p-4 lg:p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
          <div className="space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white italic">
               Reorder <span className="text-brand-primary font-extrabold italic">Strategy</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm flex items-center gap-3">
               <Sparkles className="w-5 h-5 text-brand-primary" />
               AI-optimized stock thresholds and reorder logic
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <button className="h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all shadow-sm italic">
                <Settings2 className="w-3.5 h-3.5" />
                Global Settings
             </button>
             <button className="h-10 px-6 bg-brand-primary text-slate-950 rounded-lg border border-brand-primary/50 font-bold text-[10px] tracking-widest uppercase shadow-md hover:scale-[1.02] transition-all flex items-center gap-2 italic">
                <Plus className="w-3.5 h-3.5" />
                New Rule
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* AI Insight Header */}
           <div className="lg:col-span-12">
              <div className="relative bg-zinc-950 rounded-2xl p-6 text-white shadow-2xl overflow-hidden group border border-white/5">
                 <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] group-hover:scale-110 transition-transform duration-[2000ms]" />
                 <div className="absolute bottom-[-20%] left-[-5%] w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]" />
                 
                 <div className="flex flex-col lg:flex-row lg:items-center gap-10 relative z-10">
                    <div className="flex-1 space-y-4">
                       <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/20 border border-brand-primary/30 text-[10px] font-bold uppercase tracking-widest text-brand-primary">
                          <Zap className="w-3 h-3 fill-current" />
                          Neural Optimizer Active
                       </div>
                       <h2 className="text-2xl font-extrabold tracking-tight leading-tight">
                          Save up to <span className="text-brand-primary">$2,450</span> monthly by optimizing thresholds.
                       </h2>
                       <p className="text-zinc-400 text-sm font-medium max-w-xl leading-relaxed">
                          Our models suggest increasing safety stock for <span className="text-white">Dairy imports</span> due to upcoming logistics congestion at Jebel Ali Port.
                       </p>
                    </div>
                    
                    <div className="flex shrink-0 gap-6">
                       <div className="p-6 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-xl flex flex-col items-center">
                          <BarChart3 className="w-8 h-8 text-brand-primary mb-2" />
                          <div className="text-2xl font-extrabold">+12%</div>
                          <div className="text-[10px] font-bold uppercase opacity-40">Efficiency</div>
                       </div>
                       <div className="p-6 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-xl flex flex-col items-center">
                          <ShieldCheck className="w-8 h-8 text-brand-success mb-2" />
                          <div className="text-2xl font-extrabold">99.8%</div>
                          <div className="text-[10px] font-bold uppercase opacity-40">Reliability</div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Active Rules List */}
           <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between px-2">
                 <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Active Threshold Rules</h3>
                 <div className="text-[10px] font-bold text-muted-foreground/60">3 Rules Managed by AI</div>
              </div>

              <div className="space-y-4">
                 {RULES.map(rule => (
                   <div key={rule.id} className="relative bg-card rounded-xl border border-border/50 shadow-sm p-6 group overflow-hidden transition-all duration-300 hover:border-brand-primary/30">
                      <GlowingBorder spread={40} />
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                         <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                               <div className={cn("w-2 h-2 rounded-full", rule.status === 'active' ? "bg-brand-success shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-muted-foreground/30")} />
                               <h4 className="text-lg font-bold tracking-tight truncate">{rule.item}</h4>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                               <span className="flex items-center gap-1.5"><Bot className="w-3.5 h-3.5 text-brand-primary" /> AI Suggested</span>
                               <span className="w-1 h-1 rounded-full bg-border" />
                               <span>ID: AUTO-{rule.id.toUpperCase()}</span>
                            </div>
                         </div>

                         <div className="flex items-center gap-10 shrink-0">
                            <div className="text-center">
                               <div className="text-[10px] font-bold uppercase text-muted-foreground opacity-60 mb-1">Threshold</div>
                               <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold opacity-30 line-through">{rule.current}</span>
                                  <ArrowRight className="w-4 h-4 text-brand-primary" />
                                  <span className="text-xl font-black text-brand-primary">{rule.suggested}</span>
                                </div>
                            </div>
                            <div className="text-center">
                               <div className="text-[10px] font-bold uppercase text-muted-foreground opacity-60 mb-1">Confidence</div>
                               <div className="text-xl font-bold">{rule.confidence}%</div>
                            </div>
                            <div className="flex flex-col gap-2">
                               <button className="p-2 rounded-lg bg-muted/50 text-muted-foreground hover:text-brand-destructive transition-colors"><IconTooltip label="Delete Rule"><Trash2 className="w-4" /></IconTooltip></button>
                               <button className="p-2 rounded-lg bg-muted/50 text-muted-foreground hover:text-brand-primary transition-colors"><IconTooltip label="Configure"><Settings2 className="w-4" /></IconTooltip></button>
                            </div>
                         </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-border/30 flex items-start gap-3 relative z-10">
                         <span className="mt-0.5"><IconTooltip label="Condition Details"><Info className="w-4 h-4 text-muted-foreground opacity-50 shrink-0" /></IconTooltip></span>
                         <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">
                            "{rule.reason}"
                         </p>
                      </div>

                      {rule.status === 'paused' && (
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center z-20">
                           <button className="px-6 py-2 rounded-xl bg-foreground text-background text-xs font-bold shadow-xl transition-all hover:scale-105 active:scale-95">
                               Resume Optimization
                           </button>
                        </div>
                      )}
                   </div>
                 ))}
              </div>
           </div>

           {/* Dashboard Sidebar */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-card rounded-xl border border-border shadow-sm p-6 relative overflow-hidden group">
                 <GlowingBorder spread={40} />
                 <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-8 flex items-center gap-2 relative z-10">
                    <Target className="w-4 h-4 text-brand-primary" />
                    Automation Policy
                 </h3>
                 <div className="space-y-4 relative z-10">
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-primary transition-all cursor-pointer group/item">
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold uppercase italic text-brand-primary">Automatic Orders</span>
                          <div className="w-8 h-4 bg-brand-primary rounded-full flex items-center justify-end p-0.5">
                             <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                          </div>
                       </div>
                       <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight italic">
                          Automatically create and send purchase orders when stock hits the threshold.
                       </p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-600 transition-all cursor-pointer group/item">
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold uppercase italic text-slate-400">Supplier Optimization</span>
                          <div className="w-8 h-4 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-start p-0.5">
                             <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                          </div>
                       </div>
                       <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight italic">
                          AI selects the optimal supplier based on cost and lead time.
                       </p>
                    </div>
                 </div>
              </div>

              <div className="bg-brand-primary rounded-xl p-6 text-slate-950 shadow-xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                 <TrendingUp className="w-8 h-8 mb-4 opacity-60" />
                 <h3 className="text-lg font-bold tracking-tight mb-2 leading-tight">Demand Heatmap</h3>
                 <p className="text-white/60 text-xs font-medium mb-6 leading-relaxed italic">
                    Forecast shows a 15% spike in coffee beverage demand for next week.
                 </p>
                 <div className="flex items-end gap-1 h-12 mb-6">
                    {[3, 5, 4, 7, 8, 6, 9].map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h * 10}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="flex-1 bg-white/20 rounded-sm"
                      />
                    ))}
                 </div>
                 <button className="w-full py-2.5 rounded-xl bg-white text-brand-primary text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-[1.05] active:scale-95">
                    View Detailed Forecast
                 </button>
              </div>

              <div className="p-5 bg-brand-warning/5 border border-brand-warning/10 rounded-2xl flex items-start gap-4 italic group">
                 <Clock className="w-6 h-6 text-brand-warning shrink-0 group-hover:rotate-12 transition-transform" />
                 <p className="text-[10px] text-brand-warning font-bold leading-relaxed uppercase tracking-tight">
                    AI updates thresholds every 6 hours based on point-of-sale data and supplier lead times.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </SecureOverlay>
  );
}
