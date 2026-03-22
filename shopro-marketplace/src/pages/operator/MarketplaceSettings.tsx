"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { 
  Settings, 
  Globe, 
  DollarSign, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Lock, 
  Layout, 
  Flag, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Bell,
  Cpu,
  Layers,
  Save,
  Rocket,
  ChevronRight,
  Database,
  Fingerprint
} from "lucide-react";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * OP-28 — Marketplace Settings
 * Purpose: Global marketplace governance and operational constraints.
 */

export default function MarketplaceSettings() {
  const [activeTab, setActiveTab] = useState("general");

  const { data: settings, isLoading } = useQuery({
    queryKey: ["marketplace-settings"],
    queryFn: async () => {
      const resp = await api.get("operator/system/settings");
      return resp.data;
    }
  });

  return (
    <SecureOverlay>
    <div className="max-w-[1280px] mx-auto space-y-8 animate-in fade-in duration-1000 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-(--sp-border) pb-8">
        <div className="space-y-2">
          <h1 className="text-[28px] font-medium tracking-tight text-(--sp-text-0)">
             Control <span className="text-rose-600 font-semibold">tower</span>
          </h1>
          <div className="flex items-center gap-3">
             <Cpu className="w-5 h-5 text-rose-500" />
             <p className="text-(--sp-text-3) text-[13px] font-medium">
                Global marketplace governance and operational constraints.
             </p>
          </div>
        </div>
        
        <button className="h-9 px-6 bg-(--sp-cyan) text-white rounded-md text-[11px] font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-sm">
           Commit changes
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Sidebar Navigation */}
         <div className="lg:col-span-3 space-y-2">
            {[
              { id: "general", label: "General", icon: Globe },
              { id: "payouts", label: "Commission", icon: DollarSign },
              { id: "onboarding", label: "Policy", icon: ShieldCheck },
              { id: "modules", label: "Feature matrix", icon: Layers },
              { id: "notifications", label: "Alerts", icon: Bell },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn("w-full h-11 px-6 rounded-md flex items-center gap-4 transition-all border text-[13px] font-medium tracking-tight group", 
                  activeTab === tab.id ? "bg-(--sp-bg-1) text-rose-600 border-rose-500/30 shadow-sm" : "bg-transparent text-(--sp-text-3) border-transparent hover:text-(--sp-text-1) hover:bg-(--sp-bg-1)/50")}>
                 <tab.icon size={18} className={cn("transition-all", activeTab === tab.id ? "text-rose-600" : "text-(--sp-text-3)")} />
                 <span>{tab.label}</span>
                 {activeTab === tab.id && <ChevronRight className="ml-auto w-4 h-4 text-rose-500/50" />}
              </button>
            ))}
         </div>

         {/* Config Panel */}
         <div className="lg:col-span-9">
            <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) p-8 shadow-sm min-h-[600px] flex flex-col">
               {isLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-40">
                      <RefreshCw className="w-10 h-10 text-rose-500 animate-spin" />
                      <p className="tracking-wider text-[11px] font-bold uppercase text-(--sp-text-3)">Decrypting settings...</p>
                  </div>
               ) : (
               <AnimatePresence mode="wait">
                  {activeTab === 'general' && (
                    <motion.div key="general" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 flex-1">
                       <div className="space-y-6">
                          <h3 className="text-[18px] font-semibold text-(--sp-text-0) uppercase">Platform identity</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-(--sp-text-3)">Currency</label>
                                <select className="w-full h-10 px-4 rounded-md bg-(--sp-bg-1) border border-(--sp-border) text-[13px] font-medium outline-none focus:border-rose-500/50 transition-all text-(--sp-text-1)">
                                   <option>INR - Indian Rupee</option>
                                   <option>AED - UAE Dirham</option>
                                   <option>USD - US Dollar</option>
                                </select>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-(--sp-text-3)">Timezone</label>
                                <select className="w-full h-10 px-4 rounded-md bg-(--sp-bg-1) border border-(--sp-border) text-[13px] font-medium outline-none focus:border-rose-500/50 transition-all text-(--sp-text-1)">
                                   <option>(GMT+05:30) Asia/Kolkata</option>
                                   <option>(GMT+04:00) Dubai, Muscat</option>
                                   <option>(GMT+00:00) London, UTC</option>
                                </select>
                             </div>
                          </div>
                       </div>

                       <div className="p-6 bg-rose-50 border border-rose-100 rounded-md shadow-sm relative overflow-hidden group/alert">
                          <div className="flex items-center gap-4 relative z-10">
                             <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center text-rose-600 shadow-sm border border-rose-200">
                                <AlertTriangle size={20} className="animate-pulse" />
                             </div>
                             <div className="flex-1 space-y-1">
                                <h4 className="text-[14px] font-semibold text-rose-600">Governance protocol</h4>
                                <p className="text-[12px] text-rose-600/70 font-medium leading-relaxed">
                                  All inventory nodes must be cryptographically signed by an auditor identity.
                                </p>
                             </div>
                             <button className="w-10 h-5 bg-rose-200 rounded-full flex items-center px-1 transition-all relative">
                                <span className="w-3 h-3 bg-white rounded-full shadow-sm ml-auto" />
                             </button>
                          </div>
                       </div>

                       <div className="space-y-6 pt-8 border-t border-(--sp-border)">
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-(--sp-text-3)">Visual assets</h4>
                          <div className="flex flex-col md:flex-row items-center gap-8">
                             <div className="w-32 h-32 bg-(--sp-bg-1) rounded-md flex items-center justify-center border border-dashed border-(--sp-border) shadow-inner group/upload cursor-pointer hover:border-rose-500 transition-all">
                                <RefreshCw className="w-6 h-6 text-(--sp-text-3) group-hover/upload:text-rose-500 transition-all opacity-40" />
                             </div>
                             <div className="space-y-4 text-center md:text-left">
                                <div className="space-y-1">
                                   <div className="text-[16px] font-semibold text-(--sp-text-1) uppercase">Main platform logotype</div>
                                   <div className="text-[11px] text-(--sp-text-3) font-medium opacity-60">SVG, PNG, JPG (Max 2MB)</div>
                                </div>
                                <button className="h-9 px-6 bg-(--sp-bg-1) border border-(--sp-border) text-(--sp-text-1) rounded-md text-[11px] font-bold uppercase tracking-wider hover:bg-(--sp-bg-0) transition-all shadow-sm">Upload asset</button>
                             </div>
                          </div>
                       </div>
                    </motion.div>
                  )}

                  {activeTab === 'modules' && (
                    <motion.div key="modules" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 flex-1">
                       <h3 className="text-[18px] font-semibold text-(--sp-text-0) uppercase">Feature matrix</h3>
                       <div className="grid gap-4">
                          {[
                             { label: "AI Sourcing Wizard", desc: "Algorithmic supplier recommendations.", active: true },
                             { label: "Auto-Settlement", desc: "Programmatic clearing sequence.", active: true },
                             { label: "Dispute Arbitration", desc: "Manual intervention workflow.", active: false },
                             { label: "Multi-Sig Payout", desc: "Two-factor disbursement approval.", active: true },
                          ].map((mod, i) => (
                            <div key={i} className="p-6 bg-(--sp-bg-1) rounded-md border border-(--sp-border) hover:border-rose-500/20 transition-all shadow-sm flex items-center justify-between gap-6 group/mod cursor-pointer">
                               <div className="space-y-1">
                                  <div className="text-[16px] font-semibold text-(--sp-text-1) group-hover/mod:text-rose-600 transition-colors uppercase">{mod.label}</div>
                                  <div className="text-[12px] text-(--sp-text-3) font-medium opacity-60">{mod.desc}</div>
                               </div>
                               <button className={cn("w-10 h-5 rounded-full flex items-center px-1 transition-all relative border", mod.active ? "bg-emerald-500 border-emerald-400" : "bg-(--sp-bg-3) border-(--sp-border)")}>
                                  <span className={cn("w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300", mod.active && "ml-auto")} />
                                </button>
                            </div>
                          ))}
                       </div>
                    </motion.div>
                  )}
               </AnimatePresence>
               )}
            </div>
         </div>
      </div>
    </div>
    </SecureOverlay>
  );
}
