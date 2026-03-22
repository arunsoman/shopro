"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, Shield, Mail, Trash2, MoreVertical, Search, Filter, CheckCircle2, Clock, Lock, Edit3, Globe, Plus, ArrowUpRight, Fingerprint, RefreshCw, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * OP-16 — User & Team Management
 * Purpose: Platform identity management and operator team resonance.
 */

interface OperatorUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive: string;
}

export default function UserManagement() {
  const { data: team = [], isLoading } = useQuery<OperatorUser[]>({
    queryKey: ["operator-team-management"],
    queryFn: async () => {
      const resp = await api.get("/operator/relationships/users");
      // Map data safely to avoid undefined properties
      return resp.data?.map((user: any) => ({
        id: user?.id || Math.random().toString(36).substr(2, 9),
        name: user?.name || "Unknown Operator",
        email: user?.email || "",
        role: user?.role || "Operator",
        status: user?.status || "inactive",
        lastActive: user?.lastActive || "Never"
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
             Operator team <span className="text-(--sp-cyan) font-semibold">registry</span>
          </h1>
          <div className="flex items-center gap-3">
             <Fingerprint className="w-5 h-5 text-(--sp-cyan)" />
             <p className="text-(--sp-text-3) text-[13px] font-medium">
                Platform identity management and operator team governance.
             </p>
          </div>
        </div>
        
        <button className="h-9 px-6 bg-(--sp-cyan) text-white rounded-md text-[11px] font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-sm">
           Invite new operator
        </button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
         {/* Team Roster */}
         <div className="xl:col-span-8 space-y-6">
            <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-sm p-8 min-h-[600px] flex flex-col">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                  <h3 className="text-[18px] font-medium text-(--sp-text-0)">Active operators</h3>
                  <div className="flex items-center gap-3 bg-(--sp-bg-1) px-4 py-1.5 rounded-md border border-(--sp-border) w-full sm:max-w-xs focus-within:border-(--sp-cyan)/50 transition-all shadow-inner">
                     <Search className="w-4 h-4 text-(--sp-text-3)" />
                     <input type="text" placeholder="Search operators..." className="bg-transparent border-none outline-none text-[13px] text-(--sp-text-1) w-full placeholder:text-(--sp-text-3)/50" />
                  </div>
               </div>

               <div className="space-y-4 flex-1">
                   {isLoading ? (
                       <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-40">
                           <RefreshCw className="w-10 h-10 text-(--sp-cyan) animate-spin" />
                           <p className="tracking-wider text-[11px] font-bold uppercase text-(--sp-text-3)">Synchronizing identity ledger...</p>
                       </div>
                   ) : team && team.length > 0 ? (
                    <div className="space-y-4">
                      {team.map(member => (
                        <div key={member?.id} className="p-6 bg-(--sp-bg-1) rounded-md border border-(--sp-border) transition-all hover:bg-(--sp-bg-1)/80 group/row shadow-sm">
                           <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                              <div className="w-12 h-12 rounded-md bg-(--sp-cyan)/10 text-(--sp-cyan) flex items-center justify-center text-[16px] font-semibold border border-(--sp-cyan)/20 shadow-sm shrink-0 uppercase">
                                  {(member?.name || "??").substring(0, 2).toUpperCase()}
                              </div>
                              
                              <div className="flex-1 space-y-6 w-full">
                                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                       <h4 className="text-[16px] font-semibold text-(--sp-text-1) tracking-tight">{member?.name}</h4>
                                       <div className="text-[12px] text-(--sp-text-3) lowercase font-medium">{member?.email || "no-email-provided"}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                       <div className={cn("px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border shadow-sm", 
                                        (member?.status || "").toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-(--sp-bg-2) text-(--sp-text-3) border-(--sp-border)'
                                       )}>
                                          {member?.status?.toUpperCase() || "UNKNOWN"}
                                       </div>
                                       <button className="w-8 h-8 rounded-md bg-(--sp-bg-2) border border-(--sp-border) flex items-center justify-center text-(--sp-text-3) hover:text-(--sp-cyan) transition-all shadow-sm">
                                          <MoreVertical size={16} />
                                       </button>
                                    </div>
                                 </div>
                                 <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-(--sp-border)/50">
                                    <div className="space-y-1">
                                       <div className="text-[10px] text-(--sp-text-3) uppercase font-bold tracking-wider opacity-40">Access level</div>
                                       <div className="flex items-center gap-2 text-[13px] text-(--sp-text-1) font-medium">
                                          <Shield size={14} className="text-(--sp-cyan)" /> {member?.role?.toUpperCase() || "USER"}
                                       </div>
                                    </div>
                                    <div className="space-y-1">
                                       <div className="text-[10px] text-(--sp-text-3) uppercase font-bold tracking-wider opacity-40">Last presence</div>
                                       <div className="text-[13px] text-(--sp-text-1) font-medium tabular-nums">{member?.lastActive || "Never"}</div>
                                    </div>
                                    <div className="hidden lg:flex flex-col justify-center items-end">
                                       <button className="text-[11px] text-rose-600 font-bold tracking-wider uppercase hover:text-rose-500 transition-colors">Revoke access</button>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                   ) : (
                    <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-40">
                        <Users className="w-10 h-10 text-(--sp-text-3)" />
                        <p className="tracking-wider text-[11px] font-bold uppercase text-(--sp-text-3)">No operators found in registry</p>
                    </div>
                   )}
               </div>
            </div>
         </div>

         {/* Security Sentinel */}
         <div className="xl:col-span-4 space-y-8">
            <div className="bg-slate-900 rounded-md p-8 text-white shadow-md relative overflow-hidden group border-b-4 border-emerald-500/20">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
               <h3 className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase mb-8 opacity-60">Identity topology</h3>
               <div className="text-[48px] font-semibold tracking-tighter text-white leading-none mb-2 tabular-nums">{team?.length || 0}</div>
               <div className="text-[11px] text-white/40 font-medium">Total team instance capacity.</div>
               
               <div className="mt-10 space-y-8 relative z-10">
                  <div className="p-6 bg-white/5 rounded-md border border-white/5 shadow-inner">
                     <h4 className="text-[10px] uppercase tracking-wider font-bold text-white opacity-40 mb-4">MFA enforcement</h4>
                     <div className="flex items-center gap-4">
                        <div className="flex-1 bg-white/10 h-1.5 rounded-full overflow-hidden">
                           <motion.div initial={{ width: 0 }} animate={{ width: `100%` }} className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        </div>
                        <span className="text-[11px] font-bold text-emerald-400">100%</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-sm p-8 group relative overflow-hidden flex flex-col">
               <h3 className="text-[18px] font-medium mb-8 flex items-center gap-3 text-(--sp-text-0)">
                  <Lock className="w-5 h-5 text-(--sp-cyan)" />
                  Global security hardening
               </h3>
               <div className="space-y-6 relative z-10">
                  <div className="p-6 bg-(--sp-bg-1) rounded-md border border-(--sp-border) shadow-inner space-y-4">
                     <div className="flex items-center justify-between text-[11px] font-medium">
                        <span className="text-(--sp-text-3) uppercase font-bold tracking-wider opacity-60">Session timeout</span>
                        <span className="text-(--sp-text-1) font-bold">30 min</span>
                     </div>
                     <div className="flex items-center justify-between pt-4 border-t border-(--sp-border)/50 text-[11px] font-medium">
                        <span className="text-(--sp-text-3) uppercase font-bold tracking-wider opacity-60">IP restricting</span>
                        <span className="text-emerald-600 font-bold uppercase tracking-wider">Active</span>
                     </div>
                  </div>
                  
                  <button className="w-full h-9 rounded-md bg-(--sp-bg-1) hover:bg-(--sp-bg-0) border border-(--sp-border) text-(--sp-text-1) text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm">
                     View identity policy
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
    </SecureOverlay>
  );
}
