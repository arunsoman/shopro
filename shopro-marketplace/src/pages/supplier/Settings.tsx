"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api";
import { 
  Settings as SettingsIcon, 
  CreditCard, 
  Users, 
  Bell, 
  Shield, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  MoreVertical,
  UserPlus,
  RefreshCw,
  Lock,
  Zap,
  Globe,
  Trash2,
  Fingerprint,
  ChevronRight
} from "lucide-react";
import { SecureOverlay } from "@/components/SecureOverlay";

/**
 * S-11 — Portal Settings
 * Purpose: Manage company's payout preferences, team access, and notifications for suppliers.
 */

export default function Settings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'payout' | 'team' | 'notif'>('payout');
  const [showAccount, setShowAccount] = useState(false);

  const { data: settings, isLoading } = useQuery<any>({
    queryKey: ["supplier-settings"],
    queryFn: async () => {
      const resp = await api.get("/api/supplier/settings");
      return resp.data;
    }
  });

  const payoutMutation = useMutation({
    mutationFn: async (details: any) => {
      await api.patch("/api/supplier/settings/payout", details);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-settings"] });
    }
  });

  const triggerHold = () => {
    payoutMutation.mutate({ bank: "HDFC_SYNC_X", account: "9021223398441021", ifsc: "HDFC0001004" });
  };

  return (
    <SecureOverlay>
    <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-1000 font-black italic uppercase leading-none pb-24 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 border-b-8 border-slate-100 dark:border-slate-800 pb-12 font-black italic leading-none shadow-inner">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter italic uppercase leading-none shadow-text mt-4">
             Terminal <span className="text-indigo-500">Settings.X</span>
          </h1>
          <p className="text-slate-500 font-black italic text-xl tracking-wide opacity-60 leading-none flex items-center gap-4">
             <SettingsIcon className="w-8 h-8 text-indigo-500 animate-pulse" />
             Manage company security, liquidity, and team access trajectories alpha.
          </p>
        </div>
        
        <div className="flex items-center gap-6 font-black italic uppercase tracking-[0.4em] leading-none">
          <div className="flex items-center gap-6 bg-white dark:bg-slate-950 px-8 py-5 rounded-[1.5rem] border-4 border-slate-50 dark:border-slate-800 shadow-xl shadow-inner text-emerald-500">
             <Shield size={24} />
             <span className="text-[11px] tracking-[0.3em] font-black italic uppercase">SECURE_ALPHA_V3.CORE</span>
          </div>
          <button className="h-20 w-20 bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] flex items-center justify-center border-4 border-slate-50 dark:border-slate-800 hover:scale-110 transition-all shadow-4xl shadow-inner">
             <Fingerprint size={32} />
          </button>
        </div>
      </header>

      {/* Tabs Menu */}
      <div className="flex bg-white/50 dark:bg-slate-950/50 backdrop-blur-3xl p-4 rounded-[2.5rem] border-4 border-slate-100 dark:border-slate-800 shadow-4xl shadow-inner w-fit font-black italic uppercase italic leading-none gap-6 overflow-x-auto custom-scrollbar no-scrollbar scrollbar-hide">
        {[
          { id: 'payout', label: 'PAYOUT_DETAILS.X', icon: <CreditCard size={24} /> },
          { id: 'team', label: 'TEAM_ACCESS.NODE', icon: <Users size={24} /> },
          { id: 'notif', label: 'NOTIFICATION_ALPHA', icon: <Bell size={24} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-4 px-10 py-5 rounded-[1.5rem] text-xs font-black transition-all border-4 italic tracking-widest uppercase",
              activeTab === tab.id 
                ? "bg-indigo-600 text-white shadow-4xl border-indigo-400 scale-105" 
                : "text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'payout' && (
          <motion.div
            key="payout"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-12"
          >
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl rounded-[4rem] border-4 border-slate-100 dark:border-slate-800 shadow-4xl shadow-inner overflow-hidden font-black italic uppercase italic leading-none">
               <div className="p-12 border-b-4 border-slate-100 dark:border-slate-800/60 flex justify-between items-start bg-slate-50/50 dark:bg-slate-950/20">
                  <div className="space-y-4">
                    <h3 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase shadow-text">Settlement Node.SIG</h3>
                    <p className="text-xl text-slate-400 font-black italic opacity-60 tracking-tight">Funds from Shopro Marketplace injected to this node alpha.</p>
                  </div>
                  <div className="flex items-center gap-4 px-6 py-3 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase rounded-2xl border-4 border-emerald-500/20 shadow-4xl">
                    <Shield size={16} /> VERIFIED.ALPHA
                  </div>
               </div>
               
               <div className="p-12 space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 tracking-[0.4em] italic opacity-60">ACCOUNT_ENTRY_ID</label>
                        <div className="flex items-center justify-between p-8 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border-4 border-slate-100 dark:border-slate-800 shadow-inner group">
                           <span className="font-mono text-3xl tracking-widest dark:text-white group-hover:text-indigo-500 transition-colors shadow-text">
                              {showAccount ? settings?.payoutDetails.account : "•••• •••• •••• 1021"}
                           </span>
                           <button 
                            onClick={() => setShowAccount(!showAccount)}
                            className="text-slate-300 hover:text-indigo-500 transition-all hover:scale-125"
                           >
                              {showAccount ? <EyeOff size={32} /> : <Eye size={32} />}
                           </button>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 tracking-[0.4em] italic opacity-60">HUB_IDENTITY_ALPHA</label>
                        <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border-4 border-slate-100 dark:border-slate-800 shadow-inner group transition-all">
                           <p className="font-black italic text-3xl dark:text-white group-hover:text-indigo-500 transition-colors shadow-text uppercase tracking-tighter">{settings?.payoutDetails.bank || "SYNCING..."}</p>
                           <p className="text-xs text-slate-400 mt-2 font-black tracking-widest italic opacity-60">IFSC:_HDFC0001004.SIG</p>
                        </div>
                     </div>
                  </div>

                  {settings?.securityHold.active ? (
                    <div className="p-10 bg-amber-500 border-b-[1.5rem] border-amber-300 rounded-[3rem] text-white shadow-4xl flex items-center justify-between animate-pulse shadow-inner relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] pointer-events-none group-hover:scale-125 transition-transform duration-[4000ms]" />
                        <div className="flex items-center gap-8 relative z-10">
                           <div className="h-20 w-20 bg-white/20 rounded-[1.5rem] border-4 border-white/10 flex items-center justify-center shadow-4xl">
                              <Clock size={40} className="shadow-text" />
                           </div>
                           <div className="space-y-3">
                              <p className="text-lg font-black italic tracking-[0.3em] uppercase leading-none shadow-text text-amber-100">Security Hold Active.X</p>
                              <p className="text-2xl font-black italic tracking-wide uppercase leading-none shadow-text mt-2">Payout detail changes pending verification nodes. Next cycle in 23h 59m alpha.</p>
                           </div>
                        </div>
                        <button className="h-16 px-8 bg-slate-950 text-white font-black rounded-xl text-[10px] tracking-[0.3em] border-4 border-amber-300 italic transition-all hover:scale-110 active:scale-95 z-20">ABORT_UPDATE.FORCE</button>
                    </div>
                  ) : (
                    <div className="p-10 bg-white/5 dark:bg-slate-900/40 rounded-[3.5rem] border-4 border-slate-100 dark:border-slate-800 shadow-inner group">
                        <div className="flex gap-10 items-start">
                           <AlertTriangle className="text-amber-500 h-10 w-10 mt-2 shadow-text animate-pulse" />
                           <div className="space-y-8 flex-1">
                              <div className="space-y-4">
                                 <p className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white shadow-text uppercase">Update Node.SIG</p>
                                 <p className="text-xl text-slate-400 font-black italic opacity-70 leading-relaxed uppercase tracking-wide">
                                    Changing liquidity nodes will place a **24-hour security hold** on all pending payouts as a fraud prevention trajectory alpha.
                                 </p>
                              </div>
                              <button 
                                onClick={triggerHold}
                                className="h-20 px-12 bg-slate-950 dark:bg-white text-white dark:text-slate-900 font-black rounded-[1.5rem] text-[12px] tracking-[0.4em] transition-all hover:scale-110 active:scale-95 shadow-4xl italic border-4 border-indigo-500 overflow-hidden relative group/btn"
                              >
                                <div className="absolute inset-0 bg-indigo-600/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                                <span className="relative z-10 font-black">CHANGE_LIQUIDITY_PATH.FORCE</span>
                              </button>
                           </div>
                        </div>
                    </div>
                  )}
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'team' && (
          <motion.div
            key="team"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-12"
          >
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl rounded-[4rem] border-4 border-slate-100 dark:border-slate-800 shadow-4xl shadow-inner overflow-hidden font-black italic uppercase italic leading-none">
               <div className="p-12 border-b-4 border-slate-100 dark:border-slate-800/60 flex flex-col lg:flex-row lg:items-center justify-between gap-12 bg-slate-50/50 dark:bg-slate-950/20">
                  <div className="space-y-4">
                    <h3 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase shadow-text">Authorization Hub.NODE</h3>
                    <p className="text-xl text-slate-400 font-black italic opacity-60 tracking-tight">Manage merchant users who have access to this terminal alpha.</p>
                  </div>
                  <button className="h-20 px-10 bg-indigo-600 border-4 border-indigo-400 text-white rounded-[1.5rem] text-[10px] tracking-[0.4em] font-black italic shadow-4xl hover:scale-110 active:scale-95 transition-all flex items-center gap-4">
                    <UserPlus size={24} /> INVITE_OPERATOR.FORCE
                  </button>
               </div>
               
               <div className="divide-y-4 divide-slate-100 dark:divide-slate-800/60 p-12 space-y-8">
                  {[
                    { name: 'Sameer K.', email: 'SAMEER@NOURISH.IN', role: 'GRID_OWNER', status: 'ACTIVE.X' },
                    { name: 'Anita R.', email: 'ANITA@NOURISH.IN', role: 'SUPPORT_ALPHA', status: 'ACTIVE.X' },
                    { name: 'Rajesh M.', email: 'RAJESH@NOURISH.IN', role: 'MONETARY_SIG', status: 'OFFLINE_CORE' },
                  ].map((user) => (
                    <div key={user.email} className="p-10 bg-white/50 dark:bg-slate-950/50 rounded-[3rem] border-4 border-slate-100 dark:border-slate-800 hover:border-indigo-500 transition-all group/user flex flex-col md:flex-row items-center justify-between gap-8 shadow-inner">
                       <div className="flex items-center gap-8">
                          <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-black text-3xl text-slate-300 group-hover/user:text-indigo-500 transition-colors shadow-4xl group-hover/user:scale-110 italic">
                             {user.name.charAt(0)}
                          </div>
                          <div className="space-y-2">
                             <p className="text-2xl font-black italic dark:text-white uppercase shadow-text">{user.name}</p>
                             <p className="text-[10px] text-slate-400 font-black tracking-widest italic opacity-60">{user.email}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-12 font-black italic uppercase italic leading-none">
                          <div className="text-right space-y-2">
                             <p className="text-xs font-black tracking-[0.2em] text-slate-900 dark:text-white shadow-text italic">{user.role}</p>
                             <p className={cn(
                               "text-[9px] font-black tracking-[0.3em] uppercase",
                               user.status === 'ACTIVE.X' ? "text-emerald-500" : "text-rose-500 animate-pulse"
                             )}>{user.status}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <button className="h-14 w-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all hover:scale-110 shadow-xl border-2 border-slate-200 dark:border-slate-700">
                               <Trash2 size={24} />
                            </button>
                            <button className="h-14 w-14 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center text-slate-300 hover:text-indigo-500 transition-all hover:scale-110 shadow-xl border-4 border-slate-100 dark:border-slate-800">
                               <MoreVertical size={24} />
                            </button>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'notif' && (
          <motion.div
            key="notif"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-12"
          >
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl rounded-[4rem] border-4 border-slate-100 dark:border-slate-800 shadow-4xl shadow-inner p-12 space-y-12 font-black italic uppercase italic leading-none">
               <div className="space-y-4">
                  <h3 className="text-5xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase shadow-text">Signal Routing.X</h3>
                  <p className="text-2xl text-slate-400 font-black italic opacity-60 tracking-tight">Configure alpha notification trajectories for your terminal nodes.</p>
               </div>

               <div className="space-y-12 bg-slate-50/50 dark:bg-slate-950/20 p-12 rounded-[3.5rem] border-4 border-slate-100 dark:border-slate-800/60 shadow-inner">
                  {[
                    { title: "NEW_BID_INVITATIONS.NODE", desc: "Sync when Shopro restock events trigger in your region alpha.", channel: ["EMAIL", "HUB"] },
                    { title: "ORDER_STATUS_SYNC.X", desc: "Alerts when PO_SPLIT or DISPATCHED status changes on the grid alpha.", channel: ["PUSH", "EMAIL"] },
                    { title: "MONETARY_SETTLEMENTS.SIG", desc: "Finalized bank trajectory confirmation for every payout node.", channel: ["PUSH", "SMS"] },
                    { title: "SECURITY_OVERRIDE_ALERTS", desc: "Critical bank detail changes or new user login telemetry alpha.", channel: ["SMS", "EMAIL", "PUSH"] }
                  ].map((item, idx) => (
                    <div key={item.title} className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 pb-12 border-b-4 border-slate-100 dark:border-slate-800 last:border-b-0 last:pb-0 group/notif">
                       <div className="max-w-2xl space-y-4">
                          <p className="text-2xl font-black italic dark:text-white group-hover/notif:text-indigo-500 transition-colors shadow-text tracking-tighter uppercase">{item.title}</p>
                          <p className="text-xs text-slate-400 font-black italic tracking-[0.1em] opacity-60 uppercase leading-relaxed">{item.desc}</p>
                       </div>
                       <div className="flex flex-wrap gap-8 items-center bg-white/50 dark:bg-slate-950/50 px-8 py-5 rounded-[2rem] border-4 border-slate-100 dark:border-slate-800 shadow-xl shadow-inner">
                          {item.channel.map(ch => (
                             <label key={ch} className="inline-flex items-center cursor-pointer group/toggle">
                                <span className="mr-4 text-[9px] font-black text-slate-400 group-hover/toggle:text-indigo-500 transition-colors uppercase italic tracking-widest">{ch}</span>
                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                <div className="w-16 h-8 bg-slate-100 peer-focus:outline-none dark:bg-slate-900 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-100 after:border-4 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600 rounded-full relative border-4 border-slate-200 dark:border-slate-800 shadow-4xl"></div>
                             </label>
                          ))}
                       </div>
                    </div>
                  ))}
               </div>

               <button className="h-24 w-full bg-slate-950 dark:bg-white text-white dark:text-slate-900 font-black rounded-3xl text-[12px] tracking-[0.6em] transition-all hover:scale-105 active:scale-95 shadow-4xl border-4 border-indigo-500 italic shadow-inner">
                  SYNCHRONIZE_CONFIG.ALPHA
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </SecureOverlay>
  );
}
