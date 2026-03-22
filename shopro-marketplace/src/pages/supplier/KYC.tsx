"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api";
import { 
  ShieldCheck, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Plus, 
  X, 
  Search, 
  RefreshCw,
  Zap,
  Lock,
  ChevronRight,
  MoreVertical,
  Fingerprint
} from "lucide-react";
import { SecureOverlay } from "@/components/SecureOverlay";

/**
 * S-09 — Supplier KYC & Compliance
 * Purpose: Manage business verification documents and compliance status for suppliers.
 */

interface ComplianceDoc {
  name: string;
  status: string;
  expiryDate: string;
}

interface ComplianceStatus {
  status: string;
  documents: ComplianceDoc[];
}

export default function KYC() {
  const queryClient = useQueryClient();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { data: compliance, isLoading } = useQuery<ComplianceStatus>({
    queryKey: ["supplier-compliance"],
    queryFn: async () => {
      const resp = await api.get("/api/supplier/compliance/status");
      return resp.data;
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (doc: any) => {
      await api.post("/api/supplier/compliance/documents", doc);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-compliance"] });
      setShowUploadModal(false);
      setIsUploading(false);
    }
  });

  const handleFileUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      uploadMutation.mutate({ name: "NEW_DOCUMENT_NODE", status: "PENDING" });
    }, 2000);
  };

  return (
    <SecureOverlay>
    <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-1000 font-black italic uppercase leading-none pb-24 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 border-b-8 border-slate-100 dark:border-slate-800 pb-12 font-black italic leading-none shadow-inner">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter italic uppercase leading-none shadow-text mt-4">
             Compliance <span className="text-indigo-500">Shield.X</span>
          </h1>
          <p className="text-slate-500 font-black italic text-xl tracking-wide opacity-60 leading-none flex items-center gap-4">
             <Fingerprint className="w-8 h-8 text-indigo-500 animate-pulse" />
             Manage business verification documents and compliance nodes alpha.
          </p>
        </div>
        
        <div className="flex items-center gap-6 font-black italic uppercase tracking-[0.4em] leading-none">
          <div className={cn(
            "flex items-center gap-6 bg-white dark:bg-slate-950 px-8 py-5 rounded-[1.5rem] border-4 border-slate-50 dark:border-slate-800 shadow-xl shadow-inner",
            compliance?.status === 'VERIFIED' ? "text-emerald-500" : "text-amber-500 animate-pulse"
          )}>
             <ShieldCheck size={24} />
             <span className="text-[11px] tracking-[0.3em] font-black italic uppercase">{compliance?.status}_STATUS.NODE</span>
          </div>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="h-20 px-8 bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] flex items-center justify-center border-4 border-slate-50 dark:border-slate-800 hover:scale-110 transition-all shadow-4xl shadow-inner italic text-[10px] tracking-[0.4em]"
          >
             <Plus size={24} className="mr-4" /> UPLOAD_DOC.FORCE
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Verification Status Cards */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="p-12 rounded-[3.5rem] bg-indigo-600 border-b-[1.5rem] border-indigo-400 text-white shadow-4xl relative overflow-hidden group shadow-inner">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] pointer-events-none group-hover:scale-125 transition-transform duration-[4000ms]" />
              <div className="relative z-10 space-y-8">
                 <div className="w-20 h-20 bg-white/10 rounded-[2rem] border-4 border-white/5 flex items-center justify-center shadow-inner">
                    <ShieldCheck size={40} className="shadow-text" />
                 </div>
                 <h3 className="text-4xl font-black italic tracking-tighter uppercase shadow-text">Alpha Verification</h3>
                 <p className="text-xl text-indigo-100 font-black italic opacity-80 leading-relaxed uppercase tracking-wide">
                    Your profile is currently {compliance?.status || 'PENDING'}. All synchronized nodes and fulfillment channels are active.
                 </p>
                 <div className="h-4 w-full bg-white/10 rounded-full border-2 border-white/5 shadow-inner">
                    <div className="h-full bg-white shadow-4xl w-full rounded-full" />
                 </div>
                 <p className="text-[10px] text-white/60 font-black tracking-[0.4em] italic mb-4">CONFIDENCE_SCORE_100.X</p>
              </div>
           </div>

           <div className="p-12 rounded-[3.5rem] bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl border-4 border-slate-100 dark:border-slate-800 shadow-4xl flex flex-col justify-between shadow-inner group">
              <div className="space-y-6 relative z-10">
                 <div className="flex items-center justify-between">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950 rounded-[1.25rem] border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center text-indigo-500 shadow-4xl group-hover:scale-110 transition-transform">
                       <Lock size={32} />
                    </div>
                    <Zap size={24} className="text-indigo-500 animate-pulse" />
                 </div>
                 <h4 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase shadow-text">Data Encryption.CORE</h4>
                 <p className="text-xl text-slate-400 font-black italic opacity-70 leading-relaxed tracking-wide">
                    Documents are encrypted via AES_256 nodes and stored in secure merchant vaults alpha.
                 </p>
              </div>
              <button className="h-16 w-full border-4 border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-[9px] font-black tracking-[0.4em] text-slate-400 italic hover:text-indigo-500 hover:border-indigo-500 transition-all uppercase mt-8">
                 VIEW_VAULT_METRICS.FORCE
              </button>
           </div>

           <div className="p-12 rounded-[3.5rem] bg-slate-950 text-white shadow-4xl flex flex-col justify-between shadow-inner relative overflow-hidden group border-b-[1.5rem] border-emerald-500">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] pointer-events-none group-hover:scale-125 transition-transform duration-[4000ms]" />
              <div className="space-y-6 relative z-10">
                 <div className="w-16 h-16 bg-white/5 rounded-[1.25rem] border-4 border-white/5 flex items-center justify-center text-emerald-500 shadow-4xl">
                    <CheckCircle2 size={32} className="shadow-text" />
                 </div>
                 <h4 className="text-3xl font-black italic tracking-tighter uppercase shadow-text">Compliance Audit.SIG</h4>
                 <p className="text-xl text-slate-400 font-black italic opacity-70 leading-relaxed tracking-wide">
                    Next periodic compliance audit node scheduled for JAN_2025. Ensure all documents are updated nodes.
                 </p>
              </div>
              <div className="pt-8 border-t-4 border-white/5 relative z-10 flex items-center justify-between text-[9px] font-black italic text-emerald-500 tracking-[0.3em]">
                 <span>AUDIT_NODE_ID:_AUD-990-X</span>
                 <ChevronRight size={16} />
              </div>
           </div>
        </div>

        {/* Document List */}
        <div className="lg:col-span-12 space-y-8 font-black italic uppercase leading-none mt-12">
           <div className="flex items-center justify-between px-10 bg-slate-50/50 dark:bg-slate-950/20 py-8 rounded-[3rem] border-4 border-slate-100 dark:border-slate-800/60 shadow-inner">
              <h2 className="text-4xl font-black italic text-slate-900 dark:text-white flex items-center gap-8 uppercase tracking-tighter shadow-text">
                 <FileText size={40} className="text-indigo-500" /> Compliance Vault.NODE
              </h2>
              <div className="flex items-center gap-6 text-[11px] font-black text-slate-400 tracking-[0.4em] italic opacity-60">
                 DOCUMENTS_SYNCED_256KB_ALPHA
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {isLoading ? (
                 <div className="lg:col-span-3 p-40 flex flex-col items-center justify-center space-y-12 opacity-40">
                    <RefreshCw className="w-20 h-20 text-indigo-500 animate-spin" />
                    <p className="text-[14px] tracking-[1em] font-black italic">SCANNING_VAULT_NODES.FLUX...</p>
                 </div>
              ) : compliance?.documents.map((doc, i) => (
                <motion.div
                  key={doc.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl rounded-[3rem] p-10 border-4 border-slate-100 dark:border-slate-800 hover:border-indigo-500 transition-all shadow-4xl group relative overflow-hidden shadow-inner flex flex-col justify-between h-[350px]"
                >
                   <div className="flex justify-between items-start relative z-10">
                      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-[1.5rem] border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors shadow-4xl">
                         <FileText size={40} />
                      </div>
                      <div className={cn(
                        "px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border-2 italic",
                        doc.status === 'APPROVED' ? "bg-emerald-500 border-emerald-300 text-white shadow-emerald-500/20" :
                        "bg-amber-500 border-amber-300 text-white shadow-amber-500/20 animate-pulse"
                      )}>
                        {doc.status}
                      </div>
                   </div>

                   <div className="space-y-4 relative z-10 pt-8">
                      <h4 className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none shadow-text truncate">{doc.name}</h4>
                      <p className="text-[10px] text-slate-400 font-black italic tracking-[0.3em] opacity-60 uppercase">EXPIRY_SYNC:_{doc.expiryDate.replace(/-/g, '.X')}</p>
                   </div>

                   <div className="flex gap-4 pt-8 border-t-4 border-slate-50 dark:border-slate-800/60 relative z-10">
                      <button className="h-14 flex-1 bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black italic text-[8px] tracking-[0.2em] hover:scale-105 transition-all shadow-xl shadow-inner uppercase">VIEW_SIG</button>
                      <button className="h-14 w-14 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center border-4 border-slate-100 dark:border-slate-800 hover:text-indigo-500 transition-all shadow-xl text-slate-400">
                         <MoreVertical size={24} />
                      </button>
                   </div>
                   <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-slate-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] pointer-events-none group-hover:scale-150 transition-transform duration-[4000ms]" />
                </motion.div>
              ))}
           </div>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-black italic uppercase leading-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUploadModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-3xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              className="relative w-[700px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-[4rem] border-8 border-slate-100 dark:border-slate-800 shadow-4xl overflow-hidden mx-auto"
            >
              <div className="p-16 space-y-12 shadow-inner">
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <h3 className="text-5xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase shadow-text">Push Document.NODE</h3>
                    <p className="text-2xl text-slate-400 font-black italic opacity-60 tracking-tight">Sync new business verification signals to the vault alpha.</p>
                  </div>
                  <button onClick={() => setShowUploadModal(false)} className="w-20 h-20 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950 flex items-center justify-center border-4 border-slate-100 dark:border-slate-800 hover:text-rose-500 transition-all shadow-4xl">
                    <X size={40} />
                  </button>
                </div>

                <div className="space-y-10">
                   <div className="space-y-4">
                      <p className="text-[12px] font-black tracking-[0.5em] text-slate-400 italic opacity-60">SELECT_SIGNAL_TYPE.X</p>
                      <select className="w-full bg-slate-50 dark:bg-slate-950 border-8 border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 text-xl font-black italic uppercase tracking-[0.2em] focus:ring-8 focus:ring-indigo-500/20 outline-none shadow-text text-indigo-500">
                         <option>GST_CERTIFICATE.NODE</option>
                         <option>FOOD_SAFETY_L-FLUX</option>
                         <option>TAX_COMPLIANCE_ALPHA</option>
                         <option>PAN_CARD_VAULT</option>
                      </select>
                   </div>

                   <div 
                      onClick={handleFileUpload}
                      className={cn(
                        "w-full border-4 border-dashed rounded-[3rem] p-20 transition-all cursor-pointer flex flex-col items-center gap-10 shadow-inner group/upload",
                        isUploading 
                          ? "border-indigo-500 bg-white/50 dark:bg-slate-950/50" 
                          : "border-slate-100 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50"
                      )}
                   >
                     {isUploading ? (
                       <div className="flex flex-col items-center gap-10 w-full font-black italic">
                          <div className="h-6 w-80 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border-4 border-slate-200 dark:border-slate-700 shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 2 }}
                              className="h-full bg-indigo-600 shadow-4xl shadow-indigo-500/30"
                            />
                          </div>
                          <span className="text-xl font-black tracking-[0.5em] text-indigo-500 animate-pulse uppercase">SYNCHRONIZING_VAULT...</span>
                       </div>
                     ) : (
                       <>
                          <Upload size={80} className="text-slate-200 dark:text-slate-800 group-hover/upload:text-indigo-500 transition-colors shadow-text animate-bounce" />
                          <div className="space-y-4 text-center">
                             <p className="text-3xl font-black italic text-slate-900 dark:text-white shadow-text uppercase tracking-tighter">INJECT_PAYLOAD.X</p>
                             <p className="text-[12px] text-slate-400 font-black tracking-[0.4em] uppercase opacity-60">PDF, JPG, PNG (MAX_PAYLOAD_10MB_SIG)</p>
                          </div>
                       </>
                     )}
                   </div>
                </div>

                <div className="flex gap-10">
                   <button 
                     onClick={handleFileUpload}
                     className="h-24 flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-[1.5rem] shadow-4xl border-4 border-indigo-400 italic text-xs uppercase tracking-[0.5em] hover:scale-105 transition-all"
                   >
                     UPLOAD_NODE.FORCE
                   </button>
                   <button 
                     onClick={() => setShowUploadModal(false)}
                     className="h-24 px-12 border-8 border-slate-100 dark:border-slate-800 text-slate-400 font-black rounded-[1.5rem] hover:bg-white dark:hover:bg-slate-950 transition-all italic text-xs uppercase tracking-[0.5em]"
                   >
                     ABORT.X
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </SecureOverlay>
  );
}
