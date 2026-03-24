"use client";

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  History, 
  CreditCard, 
  Box, 
  ChevronLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Activity,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  MapPin,
  RefreshCw,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import api from "@/api";
import { StatusBadge } from "@/components/ui/status-badge";
import { SecureOverlay } from "@/components/SecureOverlay";

interface AuditActivity {
  status: string;
  description: string;
  timestamp: string;
  completed: boolean;
  internal: boolean;
}

interface LedgerEntry {
  id: string;
  description: string;
  amount: number;
  type: string;
  status: string;
  date: string;
}

interface AllocationEntry {
  subOrderId: string;
  supplierName: string;
  amount: number;
  status: string;
  routingStrategy: string;
  items: string[];
}

interface OrderAudit {
  id: string;
  referenceNumber: string;
  restaurantName: string;
  status: string;
  displayStatus: string;
  raisedAt: string;
  totalAmount: number;
  activities: AuditActivity[];
  ledger: LedgerEntry[];
  allocations: AllocationEntry[];
}

export default function OrderAuditPage() {
  const { poId } = useParams<{ poId: string }>();
  const navigate = useNavigate();

  const { data: audit, isLoading } = useQuery<OrderAudit>({
    queryKey: ["order-audit", poId],
    queryFn: async () => {
      const resp = await api.get(`operator/orders/${poId}/audit`);
      return resp.data;
    }
  });

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-app">
        <RefreshCw className="w-12 h-12 text-brand-primary animate-spin" />
      </div>
    );
  }

  if (!audit) return null;

  return (
    <SecureOverlay>
    <div className="min-h-screen bg-app text-foreground p-8 space-y-12 animate-in fade-in duration-700">
      {/* Black Box Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-border pb-12">
        <div className="space-y-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-brand-primary transition-colors font-bold text-xs uppercase tracking-widest"
          >
            <ChevronLeft size={16} /> Back to Operations
          </button>
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-3xl bg-brand-primary flex items-center justify-center shadow-2xl shadow-brand-primary/20 rotate-3">
              <ShieldCheck size={40} className="text-slate-950" />
            </div>
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                 Audit <span className="text-brand-primary">Traceability</span>
              </h1>
              <p className="text-muted-foreground font-bold text-sm flex items-center gap-3 mt-2 uppercase tracking-widest">
                Immutable Registry: {audit.referenceNumber} • {audit.restaurantName}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card backdrop-blur-3xl border border-border p-6 rounded-3xl flex items-center gap-12 shadow-2xl">
          <div className="text-right space-y-1">
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Commitment</p>
             <p className="text-3xl font-black text-brand-primary tracking-tighter tabular-nums">₹{audit.totalAmount.toLocaleString()}</p>
          </div>
          <div className="h-12 w-px bg-border" />
          <div className="space-y-2">
             <StatusBadge status={audit.status as any} />
             <p className="text-[10px] font-bold text-muted-foreground tracking-widest italic">{audit.displayStatus}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Lifecycle Timeline */}
        <div className="lg:col-span-4 space-y-8">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-4 uppercase italic">
            <Clock className="text-emerald-500" size={24} /> Lifecycle History
          </h2>
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-linear-to-b before:from-emerald-500 before:via-emerald-500/20 before:to-transparent">
             {audit.activities.length > 0 ? audit.activities.map((step, i) => (
                <div key={i} className="relative flex items-start gap-8 group">
                   <div className={cn(
                     "mt-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-app transition-all shadow-xl z-10",
                     step.completed ? "bg-emerald-500 text-white" : "bg-card text-muted-foreground"
                   )}>
                      {step.completed ? <CheckCircle2 size={24} /> : <Activity size={24} />}
                   </div>
                   <div className="space-y-1">
                      <div className="flex items-center gap-4">
                        <p className={cn("text-lg font-black italic tracking-tight uppercase", step.completed ? "text-foreground" : "text-muted-foreground")}>
                           {step.status}
                        </p>
                        {step.internal && (
                           <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[8px] font-bold uppercase rounded-md tracking-widest">INTERNAL</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                         {step.description}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-wider tabular-nums">
                         {new Date(step.timestamp).toLocaleString()}
                      </p>
                   </div>
                </div>
             )) : (
                <div className="relative z-10 pl-16 py-8">
                  <div className="p-6 rounded-2xl bg-card border border-border border-dashed flex flex-col items-center text-center gap-4">
                     <History size={32} className="text-muted-foreground/40" />
                     <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No activity trails found for this node.</p>
                  </div>
                </div>
             )}
          </div>
        </div>

        {/* Right Column: Ledger & Allocations */}
        <div className="lg:col-span-8 space-y-12">
          {/* Financial Ledger Section */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-4 uppercase italic">
              <CreditCard className="text-emerald-500" size={24} /> Financial Ledger entries
            </h2>
            <div className="bg-card backdrop-blur-3xl rounded-3xl border border-border overflow-hidden shadow-2xl">
              {audit.ledger.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-border">
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Transaction ID</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Amount</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {audit.ledger.map((entry) => (
                    <tr key={entry.id} className="group hover:bg-white/5 transition-colors">
                      <td className="p-4 text-[10px] font-bold text-muted-foreground tabular-nums uppercase">{entry.id.substring(0, 8)}</td>
                      <td className="p-4">
                         <p className="text-xs font-bold">{entry.description}</p>
                         <p className="text-[9px] text-muted-foreground font-bold tabular-nums italic uppercase mt-1">{new Date(entry.date).toLocaleString()}</p>
                      </td>
                      <td className="p-4">
                         <span className={cn(
                           "text-[9px] font-black tracking-widest uppercase",
                           entry.type === 'PAYMENT' ? "text-indigo-400" : "text-emerald-400"
                         )}>{entry.type}</span>
                      </td>
                      <td className="p-4 text-right font-black tabular-nums text-sm text-emerald-500">
                         {entry.type === 'PAYMENT' ? '-' : '+'}₹{entry.amount.toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                         <span className={cn(
                           "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                           entry.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                         )}>{entry.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              ) : (
                <div className="p-12 flex flex-col items-center justify-center gap-4 text-center">
                   <CreditCard size={48} className="text-muted-foreground/30" />
                   <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No transaction records associated with this PO.</p>
                </div>
              )}
            </div>
          </section>

          {/* Allocation Section */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-4 uppercase italic">
              <Box className="text-emerald-500" size={24} /> Orchestration Topology
            </h2>
            {audit.allocations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {audit.allocations.map((alloc) => (
                 <motion.div 
                    key={alloc.subOrderId}
                    whileHover={{ scale: 1.02 }}
                    className="p-6 rounded-3xl bg-card border border-border shadow-xl relative overflow-hidden group"
                 >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                       <MapPin size={64} />
                    </div>
                    <div className="space-y-4 relative z-10">
                       <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Supplier-Node</p>
                            <h3 className="text-lg font-black tracking-tighter uppercase italic">{alloc.supplierName}</h3>
                          </div>
                          <span className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                             <Box size={16} />
                          </span>
                       </div>
                       <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 bg-white/5 text-muted-foreground text-[8px] font-bold uppercase rounded-md tracking-widest">
                             {alloc.routingStrategy.replace(/_/g, ' ')}
                          </span>
                       </div>
                       <div className="space-y-2 pt-4 border-t border-border">
                          {alloc.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                               <div className="w-1 h-1 rounded-full bg-emerald-500" />
                               {item}
                            </div>
                          ))}
                       </div>
                       <div className="flex justify-between items-center pt-4">
                          <p className="text-xs font-black text-emerald-500 tabular-nums">₹{alloc.amount.toLocaleString()}</p>
                          <span className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">{alloc.status}</span>
                       </div>
                    </div>
                 </motion.div>
               ))}
            </div>
            ) : (
              <div className="p-12 rounded-3xl bg-card border border-border border-dashed flex flex-col items-center justify-center gap-4 text-center overflow-hidden relative">
                 <div className="absolute inset-0 bg-emerald-500/10 animate-pulse" />
                 <Box size={48} className="text-emerald-500/30 relative z-10" />
                 <div className="space-y-1 relative z-10">
                   <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">Awaiting MidMind Orchestration</p>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight italic">Consolidation batch pending processing node.</p>
                 </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
    </SecureOverlay>
  );
}
