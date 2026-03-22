"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  CircleDot,
  ArrowRight,
  Globe,
  Award,
  Zap,
  Lock,
  Clock
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * RC-05 — Buyer KYC & Verification
 * Purpose: Manage business verification for restaurant buyers.
 */

interface Document {
  id: string;
  type: string;
  status: string;
  expiry: string;
}

interface VerificationStatus {
  overall: string;
  documents: Document[];
}

export default function KYC() {
  const navigate = useNavigate();

  const { data: status, isLoading } = useQuery<VerificationStatus>({
    queryKey: ["buyer-compliance-status"],
    queryFn: async () => {
      const resp = await api.get("buyer/compliance/status");
      return resp.data;
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.post("buyer/compliance/documents", payload);
    }
  });

  if (isLoading) return <div className="p-24 animate-pulse bg-muted/10 rounded-3xl" />;

  return (
    <SecureOverlay>
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 pb-24 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-slate-200 dark:border-slate-800 pb-8 transition-all">
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <button 
                onClick={() => navigate(-1)}
                className="h-12 w-12 bg-white dark:bg-slate-950 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 hover:scale-[1.05] active:scale-95 transition-all shadow-md group"
            >
                <IconTooltip label="Back to Dashboard"><ArrowLeft size={20} className="text-slate-400 group-hover:text-indigo-600 transition-colors" /></IconTooltip>
            </button>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white italic">
               Business <span className="text-indigo-600 font-extrabold italic">Verification</span>
            </h1>
          </div>
          <p className="text-slate-500 font-medium text-lg flex items-center gap-3">
             <IconTooltip label="Verification Status"><ShieldCheck size={24} className="text-indigo-600 animate-pulse" /></IconTooltip>
             Verification Status: {status?.overall} • Compliance: Active
          </p>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
            {/* Document Matrix */}
            <section className="bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-4 italic uppercase">
                    <IconTooltip label="Document Tracker"><FileText size={28} className="text-indigo-600" /></IconTooltip> 
                    Required Documents
                </h2>
                
                <div className="space-y-6">
                   {status?.documents.map((doc, i) => (
                       <div key={doc.id} className="group relative bg-slate-50 dark:bg-slate-950/20 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-all hover:bg-white dark:hover:bg-slate-950 hover:border-indigo-500">
                          <div className="flex items-center gap-6">
                                <div className="h-14 w-14 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xl font-bold italic text-indigo-600 group-hover:rotate-6 transition-transform shadow-md">
                                    {i + 1}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold tracking-tight text-indigo-600 uppercase italic">{doc.type.replace(/_/g, ' ')}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase italic">Expiry: {doc.expiry}</p>
                                </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <div className={cn(
                                "h-8 px-6 rounded-lg border flex items-center justify-center font-bold italic text-[10px] tracking-widest uppercase shadow-sm",
                                doc.status === 'ACTIVE' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-amber-500/10 border-amber-500/20 text-amber-500 animate-pulse"
                             )}>
                                {doc.status === 'ACTIVE' ? 'Verified' : 'In Review'}
                             </div>
                          </div>
                       </div>
                   ))}
                </div>
            </section>

            {/* Upload Zone */}
            <section className="p-8 bg-indigo-600 text-white rounded-3xl border border-indigo-500/50 shadow-xl space-y-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                <div className="flex items-center justify-between relative z-10">
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-4 italic uppercase">
                        <IconTooltip label="Upload Node"><Upload size={28} /></IconTooltip> 
                        Upload Documents
                    </h2>
                </div>
                <div className="h-48 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center space-y-4 relative z-10 group-hover:border-white transition-colors cursor-pointer">
                    <CircleDot size={48} className="text-white/40 animate-pulse" />
                    <p className="text-sm font-bold tracking-widest opacity-60 uppercase italic">Drag and drop or click to upload files</p>
                </div>
            </section>
        </div>

        <aside className="lg:col-span-4 space-y-12">
            {/* Trust Metrics */}
            <div className="bg-indigo-600 p-8 rounded-3xl border border-indigo-500/50 shadow-xl space-y-8 relative overflow-hidden group text-white">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] pointer-events-none" />
               <h3 className="text-xl font-bold tracking-tight uppercase relative z-10 flex items-center gap-3 italic">
                    <IconTooltip label="Security Lock"><Lock size={24} /></IconTooltip> 
                    Security Status
               </h3>
                              <div className="space-y-4 relative z-10">
                  {[
                      { label: "Identity Sync", val: "Active", icon: <CircleDot size={18} className="text-white" /> },
                      { label: "Ledger Integrity", val: "Verified", icon: <CheckCircle2 size={18} className="text-emerald-400" /> },
                      { label: "Compliance Protocol", val: "Active", icon: <Zap size={18} className="text-amber-400" /> },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center bg-white/10 p-4 rounded-xl border border-white/20 shadow-inner">
                        <div className="flex items-center gap-3">
                            {row.icon}
                            <span className="text-[10px] font-bold tracking-widest opacity-60 uppercase italic">{row.label}</span>
                        </div>
                        <span className="text-xl font-bold italic tracking-tight uppercase">{row.val}</span>
                    </div>
                  ))}
               </div>

               <div className="pt-6 border-t border-white/10 relative z-10">
                   <div className="flex items-center gap-4">
                      <Clock size={24} className="text-white" />
                      <div>
                        <p className="text-[10px] font-bold tracking-widest opacity-60 uppercase italic">Next Audit</p>
                        <p className="text-xl font-bold tracking-tight uppercase italic">Q3 2024</p>
                      </div>
                   </div>
               </div>
            </div>
        </aside>
      </main>
    </div>
    </SecureOverlay>
  );
}
