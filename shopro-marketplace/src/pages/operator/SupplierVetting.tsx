"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, FileText, ShieldCheck, Mail, Phone, MapPin, Globe, RefreshCw, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * OP-10 — Supplier Vetting Detail
 * Purpose: Deep-dive into a supplier's credentials before approval.
 * DNA: Document preview, verification status tracker, "APPROVE" button ritual.
 */

interface SupplierVetting {
  id: string;
  name: string;
  step: string;
  priority: string;
}

export default function SupplierVetting() {
  const navigate = useNavigate();
  const { supplierId } = useParams();
  const queryClient = useQueryClient();

  const { data: vettingData, isLoading } = useQuery<SupplierVetting[]>({
    queryKey: ["operator-supplier-vetting-list"],
    queryFn: async () => {
      const resp = await api.get("/operator/relationships/suppliers/vetting");
      return resp.data?.map((v: any) => ({
        id: v?.id || "---",
        name: v?.name || "Unknown Supplier",
        step: v?.step || "Initial",
        priority: v?.priority || "Low"
      })) || [];
    }
  });

  const vetting = vettingData?.find(v => v?.id === supplierId) || vettingData?.[0];

  const mutation = useMutation({
    mutationFn: async (status: string) => {
      return api.patch(`/operator/suppliers/${supplierId}/status?status=${status}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operator-suppliers-management"] });
      navigate("/operator/suppliers");
    }
  });

  return (
    <SecureOverlay>
    <div className="max-w-[1280px] mx-auto space-y-8 animate-in fade-in duration-1000 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-(--sp-border) pb-8">
        <div className="space-y-4">
          <button 
            onClick={() => navigate("/operator/suppliers")}
            className="flex items-center gap-2 text-[11px] font-bold text-(--sp-text-3) hover:text-(--sp-cyan) transition-all uppercase tracking-wider"
          >
            <ArrowLeft size={14} /> Back to directory
          </button>
          
          {isLoading ? (
              <div className="h-10 w-64 bg-(--sp-bg-1) animate-pulse rounded-md" />
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-4">
                <h1 className="text-[28px] font-medium tracking-tight text-(--sp-text-0)">Vetting node: {vetting?.name}</h1>
                <div className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shadow-sm",
                    vetting?.priority === "High" ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-amber-50 text-amber-600 border-amber-100"
                )}>
                    Priority: {vetting?.priority}
                </div>
              </div>
              <p className="text-(--sp-text-3) font-medium text-[13px]">
                 Registry entry protocol initialized. Currently at step: <span className="text-(--sp-cyan) font-bold uppercase tracking-wider">{vetting?.step}</span>
              </p>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Business Details */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-(--sp-bg-2) rounded-md p-8 border border-(--sp-border) shadow-sm space-y-10">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                   <h3 className="text-[11px] font-bold text-(--sp-text-3) uppercase tracking-wider opacity-60 flex items-center gap-2">
                     <ShieldCheck size={16} className="text-(--sp-cyan)" /> Administrative core
                   </h3>
                    <div className="space-y-4">
                       <div className="flex items-center gap-4 p-4 bg-(--sp-bg-1) rounded-md border border-(--sp-border) shadow-inner">
                          <div className="w-10 h-10 rounded-md bg-(--sp-bg-2) flex items-center justify-center text-(--sp-text-3) border border-(--sp-border) shadow-sm">
                             <Mail size={18} />
                          </div>
                          <div className="space-y-0.5">
                             <p className="text-[10px] font-bold text-(--sp-text-3) uppercase tracking-wider opacity-40">Email signal</p>
                             <p className="text-[14px] font-medium text-(--sp-text-1)">vendor.node@shopro.hub</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4 p-4 bg-(--sp-bg-1) rounded-md border border-(--sp-border) shadow-inner">
                          <div className="w-10 h-10 rounded-md bg-(--sp-bg-2) flex items-center justify-center text-(--sp-text-3) border border-(--sp-border) shadow-sm">
                             <Phone size={18} />
                          </div>
                          <div className="space-y-0.5">
                             <p className="text-[10px] font-bold text-(--sp-text-3) uppercase tracking-wider opacity-40">Phone signal</p>
                             <p className="text-[14px] font-medium text-(--sp-text-1)">+91 9901 000 000</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <h3 className="text-[11px] font-bold text-(--sp-text-3) uppercase tracking-wider opacity-60 flex items-center gap-2">
                      <MapPin size={16} className="text-(--sp-cyan)" /> Logistics endpoint
                    </h3>
                    <div className="space-y-4">
                       <div className="flex items-start gap-4 p-4 bg-(--sp-bg-1) rounded-md border border-(--sp-border) shadow-inner">
                          <div className="w-10 h-10 rounded-md bg-(--sp-bg-2) flex items-center justify-center text-(--sp-text-3) border border-(--sp-border) shadow-sm mt-1">
                             <MapPin size={18} />
                          </div>
                          <div className="space-y-1">
                             <p className="text-[10px] font-bold text-(--sp-text-3) uppercase tracking-wider opacity-40">Base repository</p>
                             <p className="text-[14px] font-medium text-(--sp-text-1) leading-relaxed">Regional Hub Alpha, Cluster X-779, Bangalore</p>
                          </div>
                       </div>
                    </div>
                </div>
             </div>

              <div className="pt-10 border-t border-(--sp-border)/50">
                <h3 className="text-[11px] font-bold text-(--sp-text-3) uppercase tracking-wider opacity-60 flex items-center gap-2 mb-8">
                  <FileText size={16} className="text-(--sp-cyan)" /> Document audit matrix
                </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "GST certificate", status: "VERIFIED", icon: Globe },
                    { label: "FSSAI license", status: "VERIFIED", icon: ShieldCheck },
                    { label: "Bank account matrix", status: "AUDIT_REQD", icon: FileText },
                    { label: "Business PAN node", status: "VERIFIED", icon: ShieldCheck },
                  ].map((doc) => (
                    <div key={doc.label} className="p-4 bg-(--sp-bg-1) rounded-md border border-(--sp-border) flex items-center justify-between group hover:border-(--sp-cyan)/30 transition-all shadow-sm">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-(--sp-bg-2) flex items-center justify-center text-(--sp-text-3) group-hover:bg-(--sp-cyan) group-hover:text-white transition-all border border-(--sp-border) shadow-sm uppercase">
                             <doc.icon size={18} />
                          </div>
                          <p className="text-[13px] font-semibold text-(--sp-text-1) uppercase tracking-tight">{doc.label}</p>
                       </div>
                       <span className={cn(
                         "text-[10px] font-bold px-2 py-0.5 rounded border shadow-sm",
                         doc.status === "VERIFIED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                       )}>{doc.status}</span>
                    </div>
                  ))}
               </div>
             </div>
          </div>
        </div>

        {/* Right Column: Decisive Actions */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-900 rounded-md p-8 shadow-md relative overflow-hidden group border-b-4 border-emerald-500/20">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
             
             <div className="relative z-10 space-y-10 text-center">
                <div className="space-y-4">
                   <p className="text-[10px] font-bold text-emerald-400/60 tracking-wider uppercase">Hub integrity score</p>
                   <p className="text-[64px] font-semibold text-white tracking-tighter tabular-nums leading-none">94%</p>
                   <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-6">
                      <motion.div initial={{ width: 0 }} animate={{ width: `94%` }} className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                   </div>
                   <p className="text-[11px] font-medium text-white/30 mt-2">Risk signature: Low integrity path</p>
                </div>

                <div className="space-y-4 pt-10 border-t border-white/5">
                   <button 
                      onClick={() => mutation.mutate("VERIFIED")}
                      disabled={mutation.isPending}
                      className="w-full h-10 bg-emerald-500 text-white rounded-md font-bold text-[11px] flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-sm disabled:opacity-50 uppercase tracking-wider border border-emerald-400"
                   >
                      {mutation.isPending ? "Propagating signal..." : "Authorize hub point"} <CheckCircle2 size={16} />
                   </button>
                   
                   <button 
                      onClick={() => mutation.mutate("REJECTED")}
                      disabled={mutation.isPending}
                      className="w-full h-10 bg-rose-600 text-white rounded-md font-bold text-[11px] flex items-center justify-center gap-2 hover:bg-rose-700 transition-all tracking-wider disabled:opacity-50 uppercase shadow-sm border border-rose-500"
                   >
                      Reject integrity <XCircle size={16} />
                   </button>
                </div>
             </div>
          </div>

          <div className="p-8 rounded-md bg-(--sp-bg-2) border border-(--sp-border) space-y-6 shadow-sm flex flex-col items-center text-center">
             <div className="w-16 h-16 rounded-md bg-(--sp-cyan)/10 text-(--sp-cyan) flex items-center justify-center border border-(--sp-cyan)/20 shadow-sm">
                 <ShieldCheck size={32} />
             </div>
             <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-(--sp-text-3) tracking-wider uppercase opacity-60">Automated compliance</h4>
                <p className="text-[13px] text-(--sp-text-1) font-medium leading-relaxed">This supplier has been pre-screened for tax compliance. Cross-referencing against regional nodal datasets completed successfully.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
    </SecureOverlay>
  );
}
