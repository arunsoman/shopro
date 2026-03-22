"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { 
  Key, 
  Shield, 
  Plus, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff, 
  Clock, 
  Zap, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Terminal,
  Code2,
  RefreshCw,
  MoreVertical,
  Fingerprint
} from "lucide-react";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";
import { StatusBadge } from "@/components/ui/status-badge";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  scope: string;
  created: string;
  lastUsed: string;
  status: string;
}

export default function APIKeys() {
  const { data: keys = [], isLoading, refetch } = useQuery<ApiKey[]>({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const resp = await api.get("/operator/system/keys");
      return resp.data?.map((k: any) => ({
        id: k?.id || "---",
        name: k?.name || "Unknown Token",
        key: k?.key || "sk_live_****************",
        scope: k?.scope || "Read-only",
        created: k?.created || "---",
        lastUsed: k?.lastUsed || "Never",
        status: k?.status || "Active"
      })) || [];
    }
  });

  return (
    <SecureOverlay>
    <div className="max-w-[1280px] mx-auto space-y-8 animate-in fade-in duration-1000 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-(--sp-border) pb-8">
        <div className="space-y-2">
          <h1 className="text-[28px] font-medium tracking-tight text-(--sp-text-0)">
             Cypher <span className="text-(--sp-cyan) font-semibold">vault</span>
          </h1>
          <div className="flex items-center gap-3">
             <Fingerprint className="w-5 h-5 text-(--sp-cyan)" />
             <p className="text-(--sp-text-3) text-[13px] font-medium">
                Secure integration tokens and programmatic access gates.
             </p>
          </div>
        </div>
        
        <button className="h-9 px-6 bg-(--sp-cyan) text-white rounded-md text-[11px] font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-md flex items-center gap-2 border border-cyan-400">
           <Plus size={16} /> Generate token
        </button>
      </header>

      {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4 opacity-40">
              <RefreshCw className="w-10 h-10 text-(--sp-cyan) animate-spin" />
              <p className="tracking-wider text-[11px] font-bold uppercase text-(--sp-text-3)">Decrypting key register...</p>
          </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Key List */}
         <div className="lg:col-span-8 space-y-6">
            <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-sm p-8 flex flex-col min-h-[500px]">
               <div className="flex items-center justify-between mb-10 bg-(--sp-bg-1) p-4 rounded-md border border-(--sp-border) shadow-inner">
                  <h3 className="text-[18px] font-medium text-(--sp-text-0) tracking-tight">Active probes</h3>
                  <div className="text-[10px] font-bold text-(--sp-text-3) uppercase tracking-wider flex items-center gap-2 opacity-60">
                     <Zap className="w-4 h-4 text-(--sp-cyan)" />
                     {keys.filter(k => k?.status === 'Active')?.length} Active sessions
                  </div>
               </div>

               <div className="space-y-4 flex-1">
                  {keys?.map(key => (
                    <div key={key?.id} className="p-8 bg-(--sp-bg-1) rounded-md border border-(--sp-border) hover:border-(--sp-cyan)/30 transition-all group/row shadow-sm relative overflow-hidden">
                       <div className="flex flex-col md:flex-row gap-8 relative z-10">
                          <div className="shrink-0 flex items-center justify-center w-14 h-14 bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-inner text-(--sp-text-3) group-hover/row:text-(--sp-cyan) transition-all group-hover/row:scale-105">
                             <Terminal size={28} />
                          </div>
                          
                          <div className="flex-1 space-y-8">
                             <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                   <h4 className="text-[16px] font-bold text-(--sp-text-0) uppercase tracking-tight">{key?.name}</h4>
                                    <div className="flex items-center gap-4 text-[10px] font-bold text-(--sp-text-3) uppercase tracking-wider opacity-60">
                                      <Code2 size={12} className="text-(--sp-cyan)" /> <span>Scope: {key?.scope}</span>
                                   </div>
                                </div>
                                <div className="flex items-center gap-3">
                                   <div className={cn(
                                     "inline-flex px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border shadow-sm",
                                     key?.status === 'Active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-(--sp-bg-2) text-(--sp-text-3) border-(--sp-border)"
                                   )}>
                                     {key?.status}
                                   </div>
                                   <button className="w-8 h-8 flex items-center justify-center text-(--sp-text-3) hover:text-(--sp-cyan) rounded-md transition-all border border-(--sp-border) bg-(--sp-bg-2) shadow-sm opacity-0 group-hover/row:opacity-100">
                                      <MoreVertical size={14} />
                                   </button>
                                </div>
                             </div>

                             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-8 border-t border-(--sp-border)/40">
                                <div className="flex items-center gap-4 bg-slate-900 border border-white/5 px-6 py-3 rounded-md text-[13px] font-mono flex-1 shadow-inner group/key relative overflow-hidden">
                                   <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl" />
                                   <span className="text-white/40 uppercase text-[9px] font-bold tracking-widest relative z-10">TOKEN:</span> 
                                   <span className="font-medium text-emerald-400 tracking-tight relative z-10">{key?.key}</span>
                                   <button className="ml-auto p-2 hover:bg-white/10 rounded-md transition-all text-white/40 hover:text-white group-hover/key:scale-110 relative z-10">
                                      <Copy size={16} />
                                   </button>
                                </div>
                                
                                <div className="flex items-center gap-6 text-[10px] font-bold text-(--sp-text-3) uppercase tracking-wider shrink-0 opacity-60">
                                   <span className="flex items-center gap-1.5">
                                      <Clock size={14} className="text-(--sp-cyan)" />
                                      {key?.lastUsed}
                                   </span>
                                   <div className="w-px h-4 bg-(--sp-border)" />
                                   <button className="w-9 h-9 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-md transition-all border border-transparent hover:border-rose-100 shadow-sm">
                                      <Trash2 size={18} />
                                   </button>
                                </div>
                             </div>
                          </div>
                       </div>
                       <div className="absolute top-0 right-0 w-32 h-32 bg-(--sp-cyan)/5 rounded-full -mr-16 -mt-16 group-hover/row:scale-150 transition-transform duration-500" />
                    </div>
                  ))}
               </div>
            </div>
         </div>

         {/* SDK Reference */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 rounded-md p-8 text-white shadow-xl relative overflow-hidden group border-b-4 border-(--sp-cyan)/20">
               <div className="absolute top-0 right-0 w-32 h-32 bg-(--sp-cyan)/10 rounded-full blur-3xl pointer-events-none" />
               <h3 className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-8">Quick implementation</h3>
               
               <div className="space-y-8 relative z-10">
                  <div className="bg-black/40 rounded-md p-6 border border-white/5 font-mono text-[11px] leading-relaxed tracking-tight shadow-inner relative group/code">
                     <div className="text-(--sp-cyan) mb-3 uppercase text-[9px] font-bold tracking-widest opacity-60">// REST API v3 auth</div>
                     <div className="text-white/80 whitespace-pre overflow-x-auto selection:bg-cyan-500/30">
                        curl -X <span className="text-emerald-400 font-bold">GET</span> "https://api.shopro.ae/v3/nodes" \<br />
                        -H "Authorization: Bearer <span className="text-amber-400 font-semibold">YOUR_CYPHER</span>"
                     </div>
                     <button className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded transition-all opacity-0 group-hover/code:opacity-100">
                        <Copy size={12} className="text-white/40" />
                     </button>
                  </div>

                  <div className="p-8 bg-white/5 rounded-md border border-white/5 shadow-inner">
                     <h4 className="text-[10px] font-bold mb-6 uppercase tracking-wider text-white/30">Library status</h4>
                     <div className="space-y-4">
                        {["Flutter Core v3.2", "React Nexus Provider", "Node Transport L4"].map((sdk, i) => (
                           <div key={i} className="flex items-center justify-between text-[13px] font-semibold text-white/80">
                              <span className="uppercase tracking-tight">{sdk}</span>
                              <span className="text-emerald-400 uppercase text-[9px] font-bold px-2 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20 shadow-sm">Stable</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-sm p-10 group relative overflow-hidden border-t-4 border-(--sp-cyan)">
               <h3 className="text-[18px] font-bold mb-10 flex items-center gap-3 text-(--sp-text-0) tracking-tight">
                  <Shield size={24} className="text-(--sp-cyan)" />
                  Security protocol
               </h3>
               <div className="space-y-8 relative z-10">
                  <div className="p-6 bg-(--sp-bg-1) rounded-md border border-(--sp-border) shadow-inner space-y-6">
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-(--sp-text-3) opacity-60">Node revocation</span>
                        <div className="w-9 h-5 bg-emerald-500 rounded-full flex items-center px-1 shadow-inner cursor-pointer">
                           <div className="w-3.5 h-3.5 bg-white rounded-full ml-auto shadow-sm" />
                        </div>
                     </div>
                     <p className="text-[13px] text-(--sp-text-1) font-medium leading-relaxed">Strict IP pinning enforced for high-yield treasury keys in this zone.</p>
                  </div>

                  <div className="p-6 bg-(--sp-bg-1) rounded-md border border-(--sp-border) shadow-inner">
                     <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-(--sp-text-3) opacity-60">Token rotation</span>
                        <span className="text-(--sp-cyan) font-bold">90 Days cycle</span>
                     </div>
                  </div>
                  
                  <button className="h-10 w-full bg-(--sp-bg-0) text-(--sp-text-0) border border-(--sp-border) rounded-md text-[11px] font-bold uppercase tracking-wider shadow-sm hover:bg-(--sp-bg-1) transition-all">
                     Developer sandbox
                  </button>
               </div>
            </div>
         </div>
      </div>
      )}
    </div>
    </SecureOverlay>
  );
}
