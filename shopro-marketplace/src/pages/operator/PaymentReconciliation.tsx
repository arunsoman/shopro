"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRightLeft, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Search, 
  Filter, 
  Download, 
  DollarSign, 
  Link2, 
  Database, 
  ShieldCheck, 
  Clock, 
  ChevronRight,
  Zap,
  Fingerprint
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * OP-24 — Payment Reconciliation
 * Purpose: Automated payment matching and treasury reconciliation resonance.
 */

interface ReconciliationItem {
  id: string;
  period: string;
  totalAmount: string;
  status: string;
  itemsCount: number;
}

export default function PaymentReconciliation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const { data: items = [], isLoading, refetch } = useQuery<ReconciliationItem[]>({
    queryKey: ["operator-reconciliations"],
    queryFn: async () => {
      const resp = await api.get("/operator/finance/reconciliations");
      return resp.data?.map((item: any) => ({
        id: item?.id || "---",
        period: item?.period || "Unknown Period",
        totalAmount: item?.totalAmount || "0.00",
        status: item?.status || "Pending",
        itemsCount: item?.itemsCount || 0
      })) || [];
    }
  });

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      (item?.period?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (item?.id?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (item?.totalAmount?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const runEngine = () => {
    setIsRunning(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsRunning(false);
            refetch(); // Refresh data after "simulation"
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  return (
    <SecureOverlay>
    <div className="max-w-[1280px] mx-auto space-y-8 animate-in fade-in duration-1000 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-(--sp-border) pb-8">
        <div className="space-y-2">
          <h1 className="text-[28px] font-medium tracking-tight text-(--sp-text-0)">
             Payment <span className="text-emerald-500 font-semibold">reconciliation</span>
          </h1>
          <div className="flex items-center gap-3">
             <RefreshCw className="w-5 h-5 text-emerald-500" />
             <p className="text-(--sp-text-3) text-[13px] font-medium">
                Automated payment matching and treasury synchronization.
             </p>
          </div>
        </div>
        
        <button 
          disabled={isRunning || isLoading}
          onClick={runEngine}
          className="h-9 px-6 bg-(--sp-bg-1) border border-(--sp-border) text-(--sp-text-1) rounded-md text-[11px] font-bold uppercase tracking-wider hover:bg-(--sp-bg-0) transition-all shadow-sm disabled:opacity-50 relative overflow-hidden flex items-center gap-2"
        >
           <span className="relative z-10">{isRunning ? `Syncing... ${progress}%` : "Run reconciliation engine"}</span>
           {isRunning && (
             <motion.div 
              className="absolute bottom-0 left-0 h-full bg-emerald-500/10" 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
             />
           )}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 space-y-6">
            <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-sm overflow-hidden flex flex-col">
               <div className="p-6 border-b border-(--sp-border) flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-[18px] font-medium text-(--sp-text-0)">Transaction matching</h3>
                  <div className="flex items-center gap-3 bg-(--sp-bg-1) px-4 py-1.5 rounded-md border border-(--sp-border) w-full md:w-64 focus-within:border-emerald-500/30 transition-all shadow-inner">
                     <Search size={14} className="text-(--sp-text-3) opacity-40" />
                     <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent border-none outline-none text-[13px] w-full text-(--sp-text-0) placeholder:text-(--sp-text-3)/50"
                     />
                  </div>
               </div>

               <div className="divide-y divide-(--sp-border)">
                  {isLoading ? (
                      <div className="py-20 text-center flex flex-col items-center justify-center space-y-4 opacity-40">
                          <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
                          <p className="tracking-wider text-[11px] font-bold uppercase text-(--sp-text-3)">Calibrating nodes...</p>
                      </div>
                  ) : (
                   <div className="divide-y divide-(--sp-border)">
                    {filteredItems?.map(item => (
                      <div key={item?.id} className="p-8 hover:bg-(--sp-bg-1)/50 transition-all cursor-pointer group/row flex flex-col gap-6">
                         <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                               <div className={cn("w-12 h-12 rounded-md flex items-center justify-center border shadow-sm transition-all",
                                 item?.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                 'bg-(--sp-bg-1) text-emerald-500 border-(--sp-border)'
                               )}>
                                  {item?.status === 'Completed' ? <CheckCircle2 size={24} /> : <RefreshCw size={24} className="animate-spin" />}
                               </div>
                               <div className="min-w-0">
                                  <div className="flex items-center gap-3 mb-1">
                                     <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider opacity-60">ID: {item?.id}</span>
                                     <span className="text-[11px] text-(--sp-text-3) uppercase tracking-wider font-bold opacity-40">{item?.period}</span>
                                  </div>
                                  <h4 className="text-[20px] font-semibold text-(--sp-text-0) tracking-tight">{item?.totalAmount}</h4>
                               </div>
                            </div>
                            <div className="text-right">
                               <div className="px-2 py-0.5 bg-(--sp-bg-1) text-(--sp-text-3) rounded border border-(--sp-border) text-[10px] font-bold uppercase tracking-wider shadow-sm">Nodes: {item?.itemsCount}</div>
                            </div>
                         </div>

                         <div className="flex items-center justify-between pt-6 border-t border-(--sp-border)/50">
                            <div className="flex items-center gap-2 text-[11px] text-(--sp-text-3) font-medium uppercase tracking-wider opacity-60">
                               <Database size={14} /> Bank trace: <span className="text-(--sp-text-1)">TX-B-8827-142</span>
                            </div>
                            <button className="text-emerald-600 hover:text-emerald-500 text-[11px] font-bold flex items-center gap-1 transition-all uppercase tracking-wider">
                               Manual link <ChevronRight size={14} />
                             </button>
                         </div>
                      </div>
                    ))}
                   </div>
                  )}
               </div>
            </div>
         </div>

         {/* Flux Sentinel */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 rounded-md p-8 text-white shadow-md relative overflow-hidden group border-b-4 border-emerald-500/20">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
               <h3 className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-8 opacity-60">Resonance index</h3>
               <div className="text-[48px] font-semibold text-emerald-400 tracking-tighter leading-none tabular-nums mb-2">98.4%</div>
               <div className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-10">Batch success rate</div>

               <div className="space-y-8 relative z-10">
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-md border border-white/5 shadow-inner">
                     <ShieldCheck size={24} className="text-emerald-500" />
                     <div className="space-y-1">
                        <div className="text-[14px] font-semibold">Secured node</div>
                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-30">No drift detected</div>
                     </div>
                  </div>

                  <div className="p-6 bg-white/5 rounded-md border border-white/5 space-y-6">
                     <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider opacity-40">
                        <span>Auto matched</span>
                        <span className="text-emerald-400 font-bold">+1.2k</span>
                     </div>
                     <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                         <motion.div initial={{ width: 0 }} animate={{ width: "95%" }} className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                     </div>
                     <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider opacity-40">
                        <span>Manual drift</span>
                        <span className="text-rose-400 font-bold">2 units</span>
                     </div>
                  </div>
               </div>
            </div>
            </div>

            <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) p-8 shadow-sm flex flex-col">
               <h3 className="text-[18px] font-medium mb-8 flex items-center gap-3 text-(--sp-text-0)">
                  <Link2 className="w-5 h-5 text-emerald-500" />
                  Channel integrity
               </h3>
               <div className="space-y-4 relative z-10">
                  {[
                    { label: "Stripe flux", status: "Healthy", ping: "8ms", color: "emerald" },
                    { label: "Swift gateway", status: "Degraded", ping: "450ms", color: "rose" },
                    { label: "Local vault", status: "Healthy", ping: "2ms", color: "emerald" },
                  ].map((ch, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-(--sp-bg-1) rounded-md border border-(--sp-border) hover:border-emerald-500/30 transition-all shadow-sm group">
                       <div className="space-y-1">
                          <div className="text-[13px] font-semibold text-(--sp-text-1) uppercase tracking-tight">{ch.label}</div>
                          <div className={cn("text-[10px] font-bold uppercase tracking-wider", 
                            ch.color === 'emerald' ? 'text-emerald-600' : 'text-rose-600'
                          )}>{ch.status}</div>
                       </div>
                       <div className="text-[13px] font-bold tabular-nums text-(--sp-text-3) opacity-60">{ch.ping}</div>
                    </div>
                  ))}
                  

                  <button className="h-9 w-full mt-4 rounded-md bg-(--sp-bg-1) border border-(--sp-border) text-(--sp-text-1) text-[11px] font-bold uppercase tracking-wider hover:bg-(--sp-bg-0) transition-all shadow-sm">
                     Treasury logs
                  </button>
                </div>
          </div>
       </div>
    </div>
  </SecureOverlay>
  );
}
