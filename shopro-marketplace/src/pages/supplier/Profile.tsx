"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api";
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Edit3, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  ShoppingBag,
  History,
  Info,
  ArrowRight,
  Plus,
  X,
  RefreshCw,
  Globe,
  Award,
  Box,
  ChevronRight
} from "lucide-react";
import { SecureOverlay } from "@/components/SecureOverlay";

/**
 * S-10 — Supplier Profile
 * Purpose: Manage business information and supply categories for suppliers.
 */

interface SupplierProfile {
  id: string;
  name: string;
  organization: string;
  category: string;
  status: string;
  rating: number;
  regions: string[];
}

export default function Profile() {
  const queryClient = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const { data: profile, isLoading } = useQuery<SupplierProfile>({
    queryKey: ["supplier-profile"],
    queryFn: async () => {
      const resp = await api.get("/api/supplier/profile");
      return resp.data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      await api.patch("/api/supplier/profile", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-profile"] });
      setRequestSent(true);
      setTimeout(() => {
        setShowEditModal(false);
        setRequestSent(false);
      }, 2000);
    }
  });

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ reason: "Business address update node alpha" });
  };

  return (
    <SecureOverlay>
    <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-1000 font-black italic uppercase leading-none pb-24 text-slate-900 dark:text-white">
      {/* Profile Header & Badge */}
      <div className="relative group perspective-1000">
         <div className="h-64 w-full bg-slate-950 rounded-[4rem] border-b-[2rem] border-indigo-600 shadow-4xl relative overflow-hidden shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent animate-gradient-x" />
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px] pointer-events-none group-hover:scale-125 transition-transform duration-[5000ms]" />
         </div>
         <div className="absolute -bottom-16 left-16 flex items-end gap-12 z-10">
            <motion.div 
               initial={{ rotateY: -30, rotateX: 10 }}
               whileHover={{ rotateY: 0, rotateX: 0 }}
               className="h-48 w-48 rounded-[3rem] bg-white dark:bg-slate-950 border-8 border-slate-50 dark:border-slate-800 p-10 shadow-4xl flex items-center justify-center shadow-inner relative"
            >
               <Building2 className="h-24 w-24 text-indigo-500 shadow-text" />
               <div className="absolute -top-4 -right-4 w-12 h-12 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-950 flex items-center justify-center shadow-4xl">
                  <ShieldCheck size={24} className="text-white" />
               </div>
            </motion.div>
            <div className="mb-12 space-y-4">
               <div className="flex items-center gap-6">
                  <h1 className="text-5xl md:text-8xl font-black tracking-tighter italic uppercase leading-none shadow-text text-white drop-shadow-2xl">
                    {profile?.name || "LOADING_NODE.X"}
                  </h1>
               </div>
               <div className="flex items-center gap-6 text-xl text-indigo-200 font-black italic tracking-wide opacity-80 uppercase">
                  <MapPin size={24} className="animate-bounce" /> {profile?.regions.join(', ') || "PLANETARY_NODE"} • MEMBER_SINCE_2023.SIG
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-24">
        {/* Left Column - Business Details */}
        <div className="lg:col-span-8 space-y-12">
           <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl rounded-[4rem] border-4 border-slate-100 dark:border-slate-800 shadow-4xl shadow-inner overflow-hidden font-black uppercase leading-none">
              <div className="p-12 border-b-4 border-slate-100 dark:border-slate-800/60 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                 <h2 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white flex items-center gap-6 uppercase shadow-text">
                    <Info className="text-indigo-500" size={40} /> Business Intel.X
                 </h2>
                 <button 
                  onClick={() => setShowEditModal(true)}
                  className="h-16 px-8 bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] flex items-center gap-4 border-4 border-slate-100 dark:border-slate-800 hover:scale-110 transition-all shadow-xl italic text-[10px] tracking-[0.3em] font-black"
                 >
                    <Edit3 size={24} /> REQUEST_EDIT.FORCE
                 </button>
              </div>
              <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                 {[
                    { label: "REGISTRATION_NAME.NODE", value: profile?.name + " PRIVATE LIMITED" },
                    { label: "ENTITY_TYPE.SIG", value: "PRIVATE_LIMITED_ALPHA" },
                    { label: "CIN_NODE_ID", value: profile?.organization || "N/A" },
                    { label: "GSTIN_STATUS.X", value: "27AAACN1234P1Z5 (VERIFIED)", status: 'success' },
                    { label: "SYNC_EMAIL.CORE", value: "OPS@" + (profile?.name.replace(/\s/g, '').toLowerCase() || "node") + ".IN" },
                    { label: "GEO_ADDRESS.NODE", value: "FLOOR_4, MITTAL_TOWERS, NARIMAN_POINT, MUMBAI_400021" },
                 ].map((item) => (
                    <div key={item.label} className="space-y-4 group/item">
                       <p className="text-[10px] font-black text-slate-400 tracking-[0.4em] italic opacity-60 uppercase leading-none">{item.label}</p>
                       <p className={cn(
                          "text-xl font-black italic tracking-tight shadow-text uppercase leading-none break-all",
                          item.status === 'success' ? "text-emerald-500" : "text-slate-900 dark:text-white group-hover/item:text-indigo-500 transition-colors"
                       )}>{isLoading ? "FETCHING..." : item.value}</p>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl rounded-[4rem] border-4 border-slate-100 dark:border-slate-800 shadow-4xl shadow-inner p-12 space-y-10 font-black italic uppercase leading-none">
              <h2 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white flex items-center gap-6 uppercase shadow-text">
                 <ShoppingBag className="text-indigo-500" size={40} /> Supply Categories.NODE
              </h2>
              <div className="flex flex-wrap gap-6">
                 {["FRESH_PRODUCE.X", "DAIRY_EGGS.FLUX", "BEVERAGES.SIG", "SPICES_HERBS.CORE"].map((cat) => (
                    <div key={cat} className="px-8 py-4 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border-4 border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:border-indigo-500 hover:shadow-4xl transition-all cursor-default group shadow-inner">
                       <CheckCircle2 size={24} className="text-emerald-500 group-hover:scale-125 transition-transform" />
                       <span className="text-sm font-black italic tracking-[0.2em] text-slate-900 dark:text-white shadow-text">{cat}</span>
                    </div>
                 ))}
                 <button className="px-8 py-4 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] flex items-center gap-4 text-slate-400 hover:text-indigo-500 hover:border-indigo-500 transition-all group/btn shadow-inner">
                    <Plus size={24} className="group-hover/btn:rotate-90 transition-transform" />
                    <span className="text-sm font-black italic tracking-[0.2em]">ADD_CATEGORY.FORCE</span>
                 </button>
              </div>
           </div>
        </div>

        {/* Right Column - Status & Stats */}
        <div className="lg:col-span-4 space-y-12 font-black italic uppercase leading-none">
           <div className="p-16 rounded-[4rem] bg-emerald-500 text-white shadow-4xl relative overflow-hidden group shadow-inner border-b-[1.5rem] border-emerald-300">
              <div className="relative z-10 space-y-10">
                 <div className="flex justify-between items-start">
                    <div className="h-20 w-20 bg-white/20 rounded-[2rem] flex items-center justify-center border-4 border-white/10 shadow-4xl">
                       <Award size={40} className="shadow-text" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] bg-white/20 px-4 py-2 rounded-xl italic">ACTIVE.NODE</span>
                 </div>
                 <div className="space-y-4">
                    <h3 className="text-4xl font-black italic tracking-tighter uppercase shadow-text">Trust_Score: 98%</h3>
                    <p className="text-2xl text-emerald-100 font-black italic opacity-80 leading-relaxed tracking-wide">
                       Merchant node in critical standing alpha. Eligible for Priority Bidding network alpha.
                    </p>
                 </div>
                 <div className="h-4 w-full bg-white/20 rounded-full border-2 border-white/10 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "98%" }}
                      transition={{ duration: 1 }}
                      className="h-full bg-white shadow-4xl"
                    />
                 </div>
              </div>
              <ShieldCheck size={280} className="absolute -right-24 -bottom-24 opacity-10 group-hover:opacity-20 transition-opacity rotate-12" />
           </div>

           <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl rounded-[4rem] border-4 border-slate-100 dark:border-slate-800 shadow-4xl shadow-inner p-12 space-y-10">
              <h3 className="text-3xl font-black italic text-slate-900 dark:text-white flex items-center gap-6 tracking-tight shadow-text uppercase">
                 <History className="text-indigo-500" size={32} /> Compliance.SIG
              </h3>
              <div className="space-y-8">
                 {[
                    { name: "TRADE_LICENSE.NODE", year: "EXPIRES_DEC_2024.X" },
                    { name: "FSSAI_CERT.FLUX", year: "EXPIRES_OCT_2025.SIG" },
                    { name: "BANK_VERIF_NODE", year: "VERIFIED_AUG_2023.SIG" }
                 ].map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50/50 dark:bg-slate-950/30 border-4 border-slate-100 dark:border-slate-800/60 hover:bg-white dark:hover:bg-slate-950 transition-all group/doc cursor-pointer shadow-inner">
                       <div className="flex items-center gap-6">
                          <div className="h-14 w-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 group-hover/doc:text-indigo-500 transition-colors shadow-4xl">
                             <ExternalLink size={24} />
                          </div>
                          <div className="space-y-2">
                             <p className="text-xs font-black italic dark:text-white tracking-widest text-slate-900">{doc.name}</p>
                             <p className="text-[8px] font-black text-slate-400 tracking-[0.2em] opacity-60 italic">{doc.year}</p>
                          </div>
                       </div>
                       <ChevronRight size={20} className="text-slate-200 dark:text-slate-800 group-hover/doc:text-indigo-500 group-hover/doc:translate-x-2 transition-all" />
                    </div>
                 ))}
              </div>
              <button className="w-full h-16 bg-slate-950 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl text-[9px] tracking-[0.4em] italic hover:scale-110 active:scale-95 transition-all shadow-4xl border-4 border-indigo-500 shadow-inner">
                 VAULT_ACCESS.FORCE
              </button>
           </div>
        </div>
      </div>

      {/* Request Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-black italic uppercase leading-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-3xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 3 }}
              className="relative w-[700px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-[5rem] border-8 border-slate-100 dark:border-slate-800 shadow-4xl overflow-hidden mx-auto shadow-inner"
            >
              {!requestSent ? (
                <div className="p-16 space-y-12">
                  <div className="flex justify-between items-start">
                    <div className="space-y-4">
                      <h2 className="text-5xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase shadow-text">Request Override.X</h2>
                      <p className="text-2xl text-slate-400 font-black italic opacity-60 tracking-tight">Changes to core business telemetry require Shopro approval.</p>
                    </div>
                    <button onClick={() => setShowEditModal(false)} className="w-20 h-20 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950 flex items-center justify-center border-4 border-slate-100 dark:border-slate-800 hover:text-rose-500 transition-all shadow-4xl">
                      <X size={40} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleRequestSubmit} className="space-y-10">
                    <div className="p-8 bg-amber-500/10 rounded-[3rem] border-4 border-amber-500/20 flex gap-8 items-start shadow-inner">
                       <AlertCircle className="text-amber-500 h-10 w-10 shrink-0 shadow-text animate-pulse" />
                       <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed font-black tracking-widest italic opacity-80 uppercase">
                         Updates to GSTIN, registration name, or address will undergo a 48-hour manual verification cycle. High Trust Score accounts are prioritized alpha.
                       </p>
                    </div>

                    <div className="space-y-6">
                       <label className="text-[12px] font-black tracking-[0.5em] text-slate-400 italic opacity-60">FIELDS_FOR_OVERRIDE.X</label>
                       <div className="grid grid-cols-2 gap-6">
                          {["BUSINESS_NAME.NODE", "GSTIN_SIGNAL.X", "CIN_IDENTIFIER", "OFFICIAL_GEO_ADDR"].map(f => (
                             <label key={f} className="flex items-center gap-4 p-6 bg-slate-50 dark:bg-slate-950 rounded-[1.5rem] border-4 border-slate-100 dark:border-slate-800 text-[10px] font-black dark:text-slate-400 cursor-pointer hover:border-indigo-500 hover:text-indigo-500 transition-all shadow-inner group">
                                <input type="checkbox" className="w-5 h-5 rounded-md border-2 border-slate-200 dark:border-slate-800 text-indigo-500 focus:ring-4 focus:ring-indigo-500/20" /> 
                                <span className="tracking-widest italic group-hover:scale-105 transition-transform">{f}</span>
                             </label>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-6">
                       <label className="text-[12px] font-black tracking-[0.5em] text-slate-400 italic opacity-60">RATIONALE.SIG</label>
                       <textarea 
                          placeholder="Provide details about the discrepancy node..."
                          className="w-full bg-slate-50 dark:bg-slate-950 border-8 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 text-sm h-40 focus:ring-8 focus:ring-indigo-500/20 outline-none shadow-text text-indigo-500 italic font-black uppercase tracking-widest" 
                       />
                    </div>

                    <button type="submit" className="h-24 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-[1.5rem] shadow-4xl border-4 border-indigo-400 italic text-[12px] uppercase tracking-[0.5em] hover:scale-105 active:scale-95 transition-all">
                       SUBMIT_OVERRIDE_REQUEST.FORCE
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-20 text-center space-y-12 shadow-inner">
                  <div className="h-32 w-32 bg-emerald-500/10 rounded-[3rem] border-4 border-emerald-500/20 flex items-center justify-center mx-auto shadow-4xl group">
                     <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-bounce shadow-text" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-5xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase shadow-text">Request Injected.X</h2>
                    <p className="text-2xl text-slate-400 font-black italic opacity-60 leading-relaxed tracking-wide">Signal #SR-9021-ALPHA synchronized. We'll update your node within 48 cycles alpha.</p>
                  </div>
                  <button 
                    onClick={() => setShowEditModal(false)}
                    className="h-20 px-12 bg-slate-950 dark:bg-white text-white dark:text-slate-900 font-black rounded-[1.5rem] italic text-[10px] tracking-[0.4em] shadow-4xl border-4 border-indigo-500 transition-all hover:scale-110 active:scale-95"
                  >
                    CLOSE_NODE.X
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </SecureOverlay>
  );
}
