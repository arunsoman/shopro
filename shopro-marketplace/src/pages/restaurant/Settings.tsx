"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, 
  Settings as SettingsIcon, 
  Bell, 
  User, 
  CreditCard, 
  Shield, 
  Globe,
  CircleDot,
  ArrowRight,
  Zap,
  Lock,
  ChevronRight,
  RefreshCw,
  Award
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * RC-06 — Buyer Settings
 * Purpose: Manage account preferences for restaurant buyers.
 */

const TabButton = ({ id, label, icon, active, onClick }: { id: string; label: string; icon: any; active: boolean; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
        "flex h-12 items-center gap-3 px-6 rounded-lg border transition-all duration-300 font-bold italic uppercase shadow-sm",
        active 
          ? "bg-brand-primary border-brand-primary/50 text-slate-950 shadow-md scale-[1.02]" 
          : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-brand-primary"
    )}
  >
    <IconTooltip label={label}>{icon}</IconTooltip>
    <span className="text-sm tracking-tight uppercase italic">{label}</span>
  </button>
);

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <SecureOverlay>
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-24 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-slate-200 dark:border-slate-800 pb-8 transition-all">
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <button 
                onClick={() => navigate(-1)}
                className="h-12 w-12 bg-white dark:bg-slate-950 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 hover:scale-[1.05] active:scale-95 transition-all shadow-md group"
            >
                <IconTooltip label="Back"><ArrowLeft size={20} className="text-slate-400 group-hover:text-indigo-600 transition-colors" /></IconTooltip>
            </button>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white italic">
                Account <span className="text-brand-primary font-extrabold italic">Settings</span>
            </h1>
          </div>
          <p className="text-slate-500 font-medium text-sm flex items-center gap-3">
             <IconTooltip label="System Pulse"><SettingsIcon size={20} className="text-brand-primary animate-spin-slow" /></IconTooltip>
             User Preferences • System Optimization: Active
          </p>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="flex items-center gap-8 overflow-x-auto pb-6 custom-scrollbar no-scrollbar">
         {[
            { id: "profile", label: "Profile", icon: <User size={20} /> },
            { id: "notifications", label: "Notifications", icon: <Bell size={20} /> },
            { id: "payment", label: "Payments", icon: <CreditCard size={20} /> },
            { id: "security", label: "Security", icon: <Shield size={20} /> },
         ].map(tab => (
            <TabButton key={tab.id} {...tab} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
         ))}
      </div>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-12">
            <AnimatePresence mode="wait">
                <motion.section 
                    key={activeTab}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-lg space-y-6"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight text-brand-primary italic uppercase">
                            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings
                        </h2>
                        <IconTooltip label="Syncing Parameters"><RefreshCw className="text-slate-400 animate-spin-slow" size={24} /></IconTooltip>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="group relative bg-slate-50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-all hover:bg-white dark:hover:bg-slate-950 hover:border-brand-primary">
                               <div className="space-y-4">
                                 <p className="text-[10px] font-bold tracking-widest text-slate-400 italic uppercase">Preference Option 0{i}</p>
                                 <h3 className="text-lg font-bold tracking-tight text-brand-primary italic uppercase">Enable Option</h3>
                               </div>
                                <div className="mt-6 flex items-center justify-end">
                                   <div className="h-6 w-12 bg-slate-200 dark:bg-slate-800 rounded-full relative cursor-pointer overflow-hidden p-1 shadow-inner">
                                      <div className="h-4 w-4 bg-brand-primary rounded-full shadow-md translate-x-6 transition-transform" />
                                   </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.section>
            </AnimatePresence>
        </div>

        <aside className="lg:col-span-4 space-y-12">
            <div className="bg-brand-primary p-6 rounded-2xl border border-brand-primary/50 shadow-lg space-y-6 relative overflow-hidden group text-slate-950">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] pointer-events-none" />
               <h3 className="text-lg font-bold tracking-tight uppercase italic relative z-10 flex items-center gap-3">
                 <IconTooltip label="Account Blueprint"><Award size={24} /></IconTooltip> 
                 Account Profile
               </h3>
               
               <div className="space-y-6 relative z-10">
                   <div className="p-4 bg-white/10 rounded-lg border border-white/20 flex items-center gap-4">
                       <div className="h-12 w-12 bg-white text-brand-primary rounded-lg border border-white/20 flex items-center justify-center text-lg font-bold italic shadow-lg rotate-12">
                           M
                       </div>
                       <div className="space-y-1 leading-none italic uppercase">
                           <h4 className="text-xl font-bold tracking-tight">The Market Bistro</h4>
                          <p className="text-[10px] font-bold tracking-widest opacity-60 italic">Member Since 2023</p>
                      </div>
                  </div>
               </div>

                <button className="h-12 w-full bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-xl border border-brand-primary/20 font-bold text-sm tracking-widest shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 relative z-10 italic uppercase">
                    Save Changes
                    <ArrowRight size={20} />
                </button>
            </div>
        </aside>
      </main>
    </div>
    </SecureOverlay>
  );
}
