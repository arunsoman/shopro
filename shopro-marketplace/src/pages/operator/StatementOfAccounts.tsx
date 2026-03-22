"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Search, 
  Download, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownLeft, 
  DollarSign, 
  Calendar, 
  Filter, 
  MoreVertical, 
  ShieldCheck, 
  Activity, 
  Clock, 
  Globe,
  Plus,
  ArrowRightLeft,
  RefreshCw,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * OP-25 — Statement of Accounts
 * Purpose: Consolidated entity balances and financial statement resonance.
 */

interface Statement {
  id: string;
  entityName: string;
  entityType: string;
  balance: string;
  lastActivity: string;
}

export default function StatementOfAccounts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const { data: statements = [], isLoading, refetch } = useQuery<Statement[]>({
    queryKey: ["operator-statements"],
    queryFn: async () => {
      const resp = await api.get("operator/finance/statements");
      return resp.data;
    }
  });

  const filteredStatements = useMemo(() => {
    return statements.filter(soa => 
      soa.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      soa.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [statements, searchQuery]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsGenerating(false);
            refetch();
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };  return (
    <SecureOverlay>
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-(--sp-border)">
        <div className="space-y-1">
          <h1 className="text-[28px] font-medium tracking-[-0.02em] text-(--sp-text-0)">
             Ledger vault
          </h1>
          <div className="flex items-center gap-2">
             <ArrowRightLeft className="w-4 h-4 text-(--sp-amber)" />
             <p className="text-[13px] text-(--sp-text-2)">
                Consolidated entity balances and financial statement synchronization.
             </p>
          </div>
        </div>
        <button 
          disabled={isGenerating || isLoading}
          onClick={handleGenerate}
          className="h-9 px-4 rounded-[6px] bg-(--sp-bg-2) text-(--sp-text-1) text-[12px] font-medium flex items-center gap-2 border border-(--sp-border) hover:text-(--sp-text-0) transition-all shadow-sm disabled:opacity-50 relative overflow-hidden"
        >
           <span className="relative z-10">{isGenerating ? `Generating... ${progress}%` : "Generate batch statement"}</span>
           {isGenerating && (
             <motion.div 
              className="absolute bottom-0 left-0 h-full bg-(--sp-amber) opacity-10" 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
             />
           )}
        </button>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Platform Float", value: "₹4.2M", icon: DollarSign, color: "amber" },
            { label: "Pending Payouts", value: "₹1.1M", icon: ArrowUpRight, color: "rose" },
            { label: "Accounts Receivable", value: "₹890K", icon: ArrowDownLeft, color: "emerald" },
            { label: "Settlement Accuracy", value: "99.98%", icon: ShieldCheck, color: "cyan" },
          ].map((stat, i) => (
            <div key={i} className="bg-(--sp-bg-2) p-6 rounded-[12px] border border-(--sp-border) shadow-sm relative overflow-hidden group">
               <div className="flex items-center justify-between mb-4">
                 <p className="text-[11px] font-medium text-(--sp-text-2) uppercase tracking-[0.06em]">{stat.label}</p>
                 <stat.icon size={16} className={cn(
                   stat.color === 'amber' ? 'text-(--sp-amber)' : 
                   stat.color === 'rose' ? 'text-red-500' : 
                   stat.color === 'emerald' ? 'text-emerald-500' : 'text-(--sp-cyan)'
                 )} />
               </div>
               <div className="text-[32px] font-light text-(--sp-text-0) tracking-[-0.02em] leading-none tabular-nums">{stat.value}</div>
            </div>
          ))}
      </div>

      {/* Table Section */}
      <div className="bg-(--sp-bg-2) rounded-[12px] border border-(--sp-border) shadow-sm overflow-hidden">
         <div className="flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-(--sp-border) bg-(--sp-bg-1)/30 gap-6">
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-(--sp-amber)" />
              <h3 className="text-[16px] font-medium text-(--sp-text-0)">Entity ledgers</h3>
            </div>
            <div className="flex items-center gap-3 bg-(--sp-bg-0) px-3 py-2 rounded-[6px] border border-(--sp-border) flex-1 max-w-sm shadow-inner group">
               <Search size={14} className="text-(--sp-text-2) group-focus-within:text-(--sp-amber) transition-all" />
               <input 
                 type="text" 
                 placeholder="Search account node..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="bg-transparent border-none outline-none text-[13px] w-full text-(--sp-text-1) placeholder:text-(--sp-text-2)/50" 
               />
            </div>
         </div>

         <div className="overflow-x-auto">
           <div className="min-w-[800px]">
              <div className="grid grid-cols-12 px-6 py-3 border-b border-(--sp-border) bg-(--sp-bg-1)/50 text-[11px] text-(--sp-text-2) font-medium uppercase tracking-[0.06em]">
                 <div className="col-span-4 uppercase">Entity node / ID</div>
                 <div className="col-span-2 uppercase">Type</div>
                 <div className="col-span-2 uppercase">Ledger cycle</div>
                 <div className="col-span-2 uppercase">Balance</div>
                 <div className="col-span-2 text-right uppercase">Actions</div>
              </div>

             {isLoading ? (
                <div className="py-24 text-center flex flex-col items-center justify-center space-y-4">
                    <RefreshCw className="w-8 h-8 text-(--sp-amber) animate-spin" />
                    <p className="text-[13px] text-(--sp-text-2) font-medium">Forging financial ledgers...</p>
                </div>
             ) : filteredStatements.map(soa => (
               <div key={soa.id} className="grid grid-cols-12 items-center px-6 py-4 border-b border-(--sp-border) hover:bg-(--sp-bg-1)/50 transition-all group/row">
                  <div className="col-span-4 flex items-center gap-4">
                     <div className="w-8 h-8 bg-(--sp-bg-3) text-(--sp-text-1) rounded-[6px] flex items-center justify-center border border-(--sp-border) group-hover/row:border-(--sp-amber)/50 transition-all">
                        <FileText size={16} />
                     </div>
                     <div>
                        <div className="text-[14px] font-medium text-(--sp-text-0)">{soa.entityName}</div>
                        <div className="text-[11px] text-(--sp-text-2) tabular-nums">ID: {soa.id}</div>
                     </div>
                  </div>
                  <div className="col-span-2">
                     <span className="px-2 py-0.5 bg-(--sp-bg-3) text-(--sp-text-1) rounded-[4px] text-[11px] border border-(--sp-border) font-medium">{soa.entityType}</span>
                  </div>
                  <div className="col-span-2">
                     <div className="text-[13px] text-(--sp-text-1)">{soa.lastActivity}</div>
                  </div>
                  <div className="col-span-2">
                     <div className={cn("text-[14px] font-medium tabular-nums", soa.balance.startsWith('-') ? 'text-red-500' : 'text-emerald-500')}>
                        {soa.balance}
                     </div>
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                     <button className="w-8 h-8 bg-(--sp-bg-2) rounded-[6px] border border-(--sp-border) flex items-center justify-center text-(--sp-text-2) hover:text-(--sp-text-0) transition-all">
                        <Download size={14} />
                     </button>
                     <button className="w-8 h-8 bg-(--sp-bg-2) rounded-[6px] border border-(--sp-border) flex items-center justify-center text-(--sp-text-2) hover:text-(--sp-text-0) transition-all">
                        <ChevronRight size={14} />
                     </button>
                  </div>
               </div>
             ))}
           </div>
         </div>

          <div className="p-6 bg-(--sp-bg-1)/30 border-t border-(--sp-border) flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="text-[11px] text-(--sp-text-2) font-medium uppercase tracking-[0.06em]">Showing {filteredStatements.length} of 212 statements</div>
             <div className="flex gap-1.5">
                {[1, 2, 3].map(p => (
                  <button key={p} className={cn("w-8 h-8 rounded-[6px] flex items-center justify-center text-[12px] font-medium transition-all border", p === 1 ? 'bg-(--sp-bg-3) text-(--sp-text-0) border-(--sp-border) shadow-sm' : 'text-(--sp-text-2) hover:bg-(--sp-bg-2) border-transparent')}>{p}</button>
                ))}
             </div>
          </div>
      </div>

      {/* Audit Banner */}
      <div className="p-8 bg-(--sp-amber-dim) border border-(--sp-amber-border) rounded-[12px] flex flex-col lg:flex-row lg:items-center justify-between gap-8">
         <div className="flex items-start gap-5">
            <div className="w-10 h-10 rounded-[8px] bg-(--sp-amber) text-white flex items-center justify-center shadow-sm">
               <Activity size={20} />
            </div>
            <div className="space-y-1">
               <h3 className="text-[18px] font-medium text-(--sp-amber)">System integrity audit</h3>
               <p className="text-(--sp-amber) text-[13px] opacity-80 max-w-xl">
                 All platform statements are synchronized with real-time bank feeds. Drift tolerance at 0.0002%.
               </p>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <button className="h-9 px-4 rounded-[6px] bg-(--sp-bg-2) text-(--sp-text-1) text-[12px] font-medium border border-(--sp-border) hover:text-(--sp-text-0) transition-all shadow-sm">View logs</button>
            <button className="h-9 px-4 rounded-[6px] bg-(--sp-amber) text-white text-[12px] font-medium transition-all hover:opacity-90 shadow-sm">Certify ledger</button>
         </div>
      </div>
    </div>
    </SecureOverlay>
  );
}
