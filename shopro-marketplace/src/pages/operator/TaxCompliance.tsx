"use client";

import React from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, ShieldCheck, Download, Calculator, Landmark, PieChart, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * OP-15 — Tax Compliance Dashboard
 * Purpose: GST, TCS, and TDS oversight.
 * DNA: Calculation cards, due-date counters, export-ready data grids.
 */

interface TaxRule {
  id: string;
  name: string;
  rate: string;
  status: string;
}

export default function TaxCompliance() {
  const { data: taxRules = [], isLoading } = useQuery<TaxRule[]>({
    queryKey: ["tax-rules"],
    queryFn: async () => {
      const resp = await api.get("/operator/finance/tax/rules");
      return resp.data?.map((rule: any) => ({
        id: rule?.id || "---",
        name: rule?.name || "Unknown Component",
        rate: rule?.rate || "0%",
        status: rule?.status || "Inactive"
      })) || [];
    }
  });

  const { data: stats, isLoading: statsLoading } = useQuery({

    queryKey: ["tax-stats"],
    queryFn: async () => {
      const resp = await api.get("/operator/reports/tax-stats");
      return resp.data;
    }
  });

  const statCards = [
    { 
      label: "GST payable", 
      value: stats?.gstPayable != null ? `₹${(stats.gstPayable / 100000).toFixed(2)}L` : "₹0.00L", 
      icon: Landmark, 
      color: "text-(--sp-cyan)", 
      due: stats?.dueInDays != null ? `${stats.dueInDays} Days` : "--" 
    },
    { 
      label: "TDS withheld", 
      value: stats?.tdsWithheld != null ? `₹${(stats.tdsWithheld / 1000).toFixed(1)}K` : "₹0.0K", 
      icon: ShieldCheck, 
      color: "text-(--sp-text-3)", 
      due: "Filed" 
    },
    { 
      label: "Tax liability", 
      value: stats?.totalLiability != null ? `₹${(stats.totalLiability / 100000).toFixed(2)}L` : "₹0.00L", 
      icon: Calculator, 
      color: "text-rose-500", 
      due: "Total" 
    },
    { 
      label: "Compliance score", 
      value: stats?.complianceScore != null ? `${stats.complianceScore}%` : "100%", 
      icon: PieChart, 
      color: "text-emerald-500", 
      due: "High" 
    },
  ];

  return (
    <SecureOverlay>
    <div className="max-w-[1280px] mx-auto space-y-8 animate-in fade-in duration-1000 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-(--sp-border) pb-8">
        <div className="space-y-2">
          <h1 className="text-[28px] font-medium tracking-tight text-(--sp-text-0)">
             Tax & <span className="text-(--sp-cyan) font-semibold">compliance</span>
          </h1>
          <p className="text-(--sp-text-3) text-[13px] font-medium">
             Centralized oversight for statutory filings across the marketplace protocol.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="h-9 px-4 bg-(--sp-bg-1) text-(--sp-text-1) rounded-md text-[11px] font-bold flex items-center gap-2 border border-(--sp-border) hover:bg-(--sp-bg-0) transition-all shadow-sm uppercase tracking-wider">
            <PieChart size={16} /> Filing history
          </button>
          <button className="h-9 px-4 bg-(--sp-cyan) text-white rounded-md text-[11px] font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-sm uppercase tracking-wider">
            <Calculator size={16} /> Run tax calc
          </button>
        </div>
      </header>

      {/* Grid: Tax Stats */}
      <div className={cn("grid grid-cols-1 md:grid-cols-4 gap-6", statsLoading && "opacity-50 pointer-events-none")}>
        {statCards.map((stat) => (
          <div key={stat.label} className="group bg-(--sp-bg-2) p-6 rounded-md border border-(--sp-border) shadow-sm hover:border-(--sp-cyan)/30 transition-all relative overflow-hidden">
             <div className="flex justify-between items-center mb-6">
                <div className={cn("w-10 h-10 rounded-md flex items-center justify-center border border-(--sp-border) bg-(--sp-bg-1) shadow-sm", stat.color)}>
                  <stat.icon size={20} />
                </div>
                <span className="text-[10px] font-bold text-(--sp-text-3) uppercase tracking-wider border border-(--sp-border) px-2 py-0.5 rounded bg-(--sp-bg-1) shadow-sm">{stat.due}</span>
             </div>
             <p className="text-[24px] font-semibold text-(--sp-text-0) mb-1 tracking-tight tabular-nums leading-none">{stat.value}</p>
             <p className="text-[11px] text-(--sp-text-3) font-bold uppercase tracking-wider opacity-60">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) overflow-hidden shadow-sm">
        <div className="p-6 border-b border-(--sp-border) flex flex-col md:flex-row md:items-center justify-between gap-6">
           <h2 className="text-[18px] font-medium text-(--sp-text-0)">Tax liability registry</h2>
           <div className="flex items-center gap-3">
             <div className="relative group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--sp-text-3) group-focus-within:text-(--sp-cyan) transition-colors opacity-40" />
                <input type="text" placeholder="Filter protocols..." className="h-9 pl-9 pr-4 bg-(--sp-bg-1) rounded-md text-[13px] outline-none border border-(--sp-border) focus:border-(--sp-cyan)/50 transition-all w-48 text-(--sp-text-1) placeholder:text-(--sp-text-3)/50" />
             </div>
             <button className="w-9 h-9 rounded-md bg-(--sp-bg-1) border border-(--sp-border) flex items-center justify-center text-(--sp-text-3) hover:text-(--sp-cyan) transition-all shadow-sm">
                <Download size={16} />
             </button>
           </div>
        </div>
        
        {isLoading ? (
             <div className="py-20 flex flex-col items-center justify-center space-y-4 opacity-40">
                <RefreshCw className="w-10 h-10 text-(--sp-cyan) animate-spin" />
                <p className="text-(--sp-text-3) tracking-wider text-[11px] font-bold uppercase">Scanning compliance nodes...</p>
             </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
               <tr className="bg-(--sp-bg-1)/50 text-(--sp-text-3) border-b border-(--sp-border)">
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider">Compliance period</th>
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider">Tax component</th>
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider">Rate alpha</th>
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider">Filing status</th>
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--sp-border)">
              {taxRules?.map((rec) => (
                <tr key={rec?.id} className="group hover:bg-(--sp-bg-1)/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="text-[15px] font-semibold text-(--sp-text-1) tracking-tight uppercase">{rec?.name}</div>
                    <p className="text-[11px] text-(--sp-text-3) font-bold uppercase tracking-wider opacity-40 mt-1">ID: {rec?.id}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[11px] text-(--sp-text-3) font-bold uppercase tracking-wider opacity-60">Statutory protocol</span>
                  </td>
                  <td className="px-8 py-6 text-[18px] font-semibold text-(--sp-text-0) tabular-nums tracking-tight">{rec?.rate}</td>
                  <td className="px-8 py-6">
                     <div className={cn(
                       "inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border shadow-sm",
                       rec?.status === 'Active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-(--sp-bg-1) text-(--sp-text-3) border-(--sp-border)"
                     )}>
                       {rec?.status}
                     </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 transition-all opacity-0 group-hover:opacity-100">
                      <button className="h-8 px-4 rounded-md bg-(--sp-cyan) text-white font-bold text-[11px] uppercase tracking-wider hover:opacity-90 transition-all shadow-sm">
                         File now
                      </button>
                      <button className="w-8 h-8 rounded-md border border-(--sp-border) text-(--sp-text-3) hover:text-(--sp-cyan) transition-all flex items-center justify-center bg-(--sp-bg-2) shadow-sm">
                         <Download size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
    </SecureOverlay>
  );
}
