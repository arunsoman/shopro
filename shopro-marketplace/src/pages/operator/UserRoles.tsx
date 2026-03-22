"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { 
  Shield, 
  Lock, 
  Users, 
  Key, 
  CheckCircle2, 
  XCircle, 
  MoreVertical,
  Plus,
  Search,
  Zap,
  Eye,
  Edit3,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
  RefreshCw
} from "lucide-react";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

interface Role {
  id: string;
  name: string;
  users: number;
  permissions: string;
  level: string;
  color: string;
}

export default function UserRoles() {
  const { data: roles = [], isLoading } = useQuery<Role[]>({
    queryKey: ["user-roles"],
    queryFn: async () => {
      const resp = await api.get("/operator/system/roles");
      return resp.data;
    }
  });

  return (
    <SecureOverlay>
    <div className="max-w-[1280px] mx-auto space-y-8 animate-in fade-in duration-1000 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-(--sp-border) pb-8">
        <div className="space-y-2">
          <h1 className="text-[28px] font-medium tracking-tight text-(--sp-text-0)">
             Guard <span className="text-emerald-500 font-semibold">post</span>
          </h1>
          <div className="flex items-center gap-3">
             <ShieldCheck className="w-5 h-5 text-emerald-500" />
             <p className="text-(--sp-text-3) text-[13px] font-medium">
                Granular identity management and protocol permission forging.
             </p>
          </div>
        </div>
        
        <button className="h-9 px-4 bg-(--sp-cyan) text-white rounded-md text-[11px] font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-sm uppercase tracking-wider">
           <Plus size={16} /> New role
        </button>
      </header>

      {isLoading ? (
           <div className="py-20 flex flex-col items-center justify-center space-y-4 opacity-40">
              <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
              <p className="tracking-wider text-[11px] font-bold uppercase text-(--sp-text-3)">Calibrating identity matrix...</p>
           </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Role Grid */}
         <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
               {(Array.isArray(roles) ? roles : []).map(role => (
                  <div key={role?.id} className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) p-8 shadow-sm group relative overflow-hidden cursor-pointer hover:border-emerald-500/30 transition-all">
                     <div className="flex justify-between items-start mb-8">
                        <div className={cn("w-12 h-12 rounded-md flex items-center justify-center text-white shadow-sm border border-white/20", 
                          role?.color === 'rose' ? 'bg-rose-500' : 
                          role?.color === 'violet' ? 'bg-violet-600' :
                          role?.color === 'emerald' ? 'bg-emerald-500' :
                          'bg-(--sp-cyan)'
                        )}>
                           <Shield className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                           <div className="text-[10px] font-bold uppercase text-(--sp-text-3) mb-1 tracking-wider opacity-60">{role?.id}</div>
                           <div className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider border border-emerald-500/20 px-2 py-0.5 rounded bg-emerald-50">{role?.level} access</div>
                        </div>
                     </div>
                     
                     <h3 className="text-[20px] font-semibold tracking-tight mb-2 text-(--sp-text-0) uppercase">{role?.name}</h3>
                     <p className="text-[12px] text-(--sp-text-3) mb-8 line-clamp-2 font-medium">{role?.permissions}</p>
                     
                     <div className="flex items-center justify-between pt-6 border-t border-(--sp-border)">
                        <div className="flex items-center gap-2">
                           <Users className="w-4 h-4 text-(--sp-text-3)" />
                           <span className="text-[13px] font-medium text-(--sp-text-1) tabular-nums">{role?.users} Members</span>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                           <button className="w-8 h-8 rounded-md bg-(--sp-bg-1) border border-(--sp-border) flex items-center justify-center text-(--sp-text-3) hover:text-(--sp-cyan) transition-all">
                              <Edit3 size={16} />
                           </button>
                           <button className="w-8 h-8 rounded-md bg-(--sp-bg-1) border border-(--sp-border) flex items-center justify-center text-(--sp-text-3) hover:text-rose-500 transition-all">
                              <Trash2 size={16} />
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
               
               <div className="border border-dashed border-(--sp-border) rounded-md flex flex-col items-center justify-center p-8 text-center gap-4 hover:bg-(--sp-bg-1)/50 transition-all cursor-pointer group/add shadow-inner min-h-[250px]">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 group-hover/add:scale-110 transition-all">
                     <Plus size={24} />
                  </div>
                  <div className="space-y-1">
                     <div className="text-[16px] font-semibold text-(--sp-text-1) uppercase">Forge role</div>
                     <p className="text-[11px] text-(--sp-text-3) leading-relaxed">Create new identity policy node.</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Security Sentinel */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 rounded-md p-8 text-white shadow-md relative overflow-hidden group border-b-4 border-emerald-500/20">
               <h3 className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-8 opacity-60">Identity Workspace index</h3>
               
               <div className="space-y-8 relative z-10">
                  <div className="flex items-start gap-4">
                     <div className="w-12 h-12 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/20">
                        <Fingerprint className="w-6 h-6" />
                     </div>
                     <div>
                        <div className="text-[32px] font-semibold tracking-tighter leading-none">100% MFA</div>
                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mt-2">Compliance index</div>
                     </div>
                  </div>

                  <div className="p-6 bg-white/5 rounded-md border border-white/5 shadow-inner">
                     <div className="flex justify-between items-center mb-4 text-[11px] font-bold uppercase tracking-wider opacity-60">
                        <span>Suspicious logins</span>
                        <span className="text-emerald-400">0 High risk</span>
                     </div>
                     <div className="flex gap-1.5 h-12 items-end">
                        {[20, 35, 15, 60, 25, 10, 5].map((h, j) => (
                          <div key={j} className="flex-1 bg-white/10 rounded-t-sm transition-all group-hover:bg-emerald-500/30" style={{ height: `${h}%` }} />
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-sm p-8 group relative overflow-hidden">
               <h3 className="text-[18px] font-medium mb-8 flex items-center gap-3 text-(--sp-text-0)">
                  <Lock className="w-5 h-5 text-emerald-500" />
                  Nodal permissions
               </h3>
               <div className="space-y-6 relative z-10">
                  {[
                    { label: "Withdraw treasury funds", level: "L4 ONLY" },
                    { label: "Terminate supplier hook", level: "L4 + ADMIN" },
                    { label: "Adjust global pricing", level: "L3 OPS" },
                    { label: "Mediate flux dispute", level: "L2 SUPPORT" },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center justify-between group/perm">
                       <span className="text-[12px] font-medium text-(--sp-text-2) group-hover/perm:text-(--sp-text-0) transition-all">{p.label}</span>
                       <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shadow-sm", 
                         p.level.includes('L4') ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-(--sp-bg-1) text-(--sp-text-3) border-(--sp-border)'
                       )}>
                          {p.level}
                       </span>
                    </div>
                  ))}
                  
                  <button className="h-9 w-full mt-4 rounded-md bg-(--sp-bg-1) border border-(--sp-border) text-(--sp-text-1) text-[11px] font-bold uppercase tracking-wider hover:bg-(--sp-bg-0) hover:text-emerald-600 transition-all shadow-sm">
                     Audit identity log
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
