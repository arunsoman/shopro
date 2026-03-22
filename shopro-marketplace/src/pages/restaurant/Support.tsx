"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  MessageSquare, 
  LifeBuoy, 
  Search, 
  Filter, 
  Plus, 
  ShieldCheck, 
  Globe, 
  Award, 
  CircleDot, 
  ArrowRight, 
  RefreshCw,
  AlertCircle,
  Clock,
  Send,
  User
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";
import { NeonButton } from "@/components/ui/neon-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { OrbitalLoader } from "@/components/ui/orbital-loader";

/**
 * RC-11 — Buyer Support & Helpdesk
 * Purpose: Resolve procurement disputes and system issues for buyers.
 */

export default function Support() {
  const [activeView, setActiveView] = useState("tickets");
  const [subject, setSubject] = useState("");

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["buyer-tickets"],
    queryFn: async () => {
      const resp = await api.get("buyer/finance/tickets");
      return resp.data;
    }
  });

  const ticketMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.post("buyer/finance/tickets", payload);
    }
  });

  return (
    <SecureOverlay>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-border pb-8">
          <div className="space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white italic">
              Help & <span className="text-brand-primary font-extrabold italic">Support</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm flex items-center gap-3">
              <IconTooltip label="Support Pulse"><LifeBuoy size={20} className="text-brand-destructive animate-pulse" /></IconTooltip>
              Support Status: Active • Priority Support Enabled
            </p>
          </div>

          <button className="h-10 px-6 bg-brand-primary text-slate-950 rounded-lg border border-brand-primary/50 font-bold text-[10px] tracking-widest uppercase shadow-md hover:scale-[1.02] transition-all flex items-center gap-2 italic">
            <Plus size={16} />
            New Ticket
          </button>
        </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-8">
            <section className="bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-4 italic uppercase">
                    <IconTooltip label="Tickets"><MessageSquare size={24} className="text-brand-primary" /></IconTooltip> 
                    Open Tickets
                </h2>
                
                <div className="space-y-4">
                   {isLoading ? (
                       <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                         <OrbitalLoader message="Syncing transmissions..." />
                       </div>
                   ) : tickets?.map((ticket: any) => (
                        <div key={ticket.id} className="group relative bg-slate-50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-200 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-950 hover:border-brand-primary/50 flex flex-col md:flex-row items-center justify-between gap-6">
                           <div className="flex items-center gap-6 w-full md:w-auto">
                                  <div className={cn(
                                      "h-12 w-12 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-lg font-bold transition-transform shadow-md",
                                      ticket.status === 'OPEN' ? "bg-brand-primary text-slate-950" : "bg-white dark:bg-slate-900 text-slate-400"
                                  )}>
                                      {ticket.id.charAt(0)}
                                  </div>
                                  <div className="space-y-1">
                                      <h3 className="text-lg font-bold tracking-tight text-brand-primary italic uppercase">{ticket.subject}</h3>
                                      <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase italic">ID: {ticket.id} • Priority: {ticket.priority}</p>
                                  </div>
                            </div>
                            <div className="flex items-center gap-4">
                               <StatusBadge 
                                  status={ticket.status === 'OPEN' ? 'active' : 'ready'} 
                                  label={ticket.status} 
                               />
                               <button className="h-10 w-10 bg-white dark:bg-slate-900 text-slate-400 hover:text-brand-primary rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-md transition-all hover:scale-110 active:scale-95">
                                  <IconTooltip label="View Ticket"><ArrowRight size={18} /></IconTooltip>
                               </button>
                            </div>
                         </div>
                    ))}
                 </div>
             </section>
        </div>

        <aside className="lg:col-span-4 space-y-8">
            <div className="bg-brand-destructive/5 border border-brand-destructive/10 rounded-2xl p-6 space-y-6 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-destructive/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
                <h3 className="text-lg font-bold tracking-tight text-brand-destructive relative z-10 flex items-center gap-3 uppercase italic">
                    <IconTooltip label="Critical Alert"><AlertCircle size={20} /></IconTooltip> 
                    Priority Escalation
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed relative z-10 italic">
                    Immediate escalation for critical procurement failures or broken automation.
                </p>
                <button className="h-10 w-full bg-brand-destructive text-white rounded-lg border border-brand-destructive/40 font-bold text-[10px] tracking-widest shadow-md relative z-10 uppercase italic transition-transform active:scale-95">
                    Escalate to Admin
                </button>
            </div>

            <div className="bg-brand-primary p-6 rounded-2xl border border-brand-primary/50 shadow-lg space-y-6 relative overflow-hidden group text-slate-950">
                <h3 className="text-lg font-bold tracking-tight relative z-10 flex items-center gap-3 uppercase italic">
                    <IconTooltip label="Velocity Monitor"><Clock size={20} /></IconTooltip> 
                    Response ETA
                </h3>
                <div className="space-y-1 relative z-10">
                    <p className="text-3xl font-extrabold tracking-tighter italic shadow-sm">~14m</p>
                    <p className="text-[10px] font-bold tracking-widest uppercase opacity-60 italic">Average Response Time</p>
                </div>
            </div>
        </aside>
      </main>
    </div>
    </SecureOverlay>
  );
}
