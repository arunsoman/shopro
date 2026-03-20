import React, { useState } from "react";
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
  UserPlus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'payout' | 'team' | 'notif'>('payout');
  const [showAccount, setShowAccount] = useState(false);
  const [holdTimer, setHoldTimer] = useState<string | null>(null);

  const triggerHold = () => {
    setHoldTimer('23h 59m');
    setTimeout(() => setHoldTimer(null), 5000); // Demo auto-clear
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <SettingsIcon className="text-indigo-500" />
            Portal Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your company's payout preferences, team access, and notifications.
          </p>
        </div>
      </div>

      <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm w-fit">
        {[
          { id: 'payout', label: 'Payout Details', icon: <CreditCard size={16} /> },
          { id: 'team', label: 'Team access', icon: <Users size={16} /> },
          { id: 'notif', label: 'Notifications', icon: <Bell size={16} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === tab.id 
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
               <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold dark:text-white">Active Settlement Account</h3>
                    <p className="text-sm text-slate-500 mt-1">Funds from Shopro Marketplace are deposited here.</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase rounded-full border border-emerald-200/50">
                    <Shield size={12} /> Verified
                  </div>
               </div>
               
               <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Number</label>
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                           <span className="font-mono text-lg tracking-wider dark:text-white">
                              {showAccount ? "9021223398441021" : "•••• •••• •••• 1021"}
                           </span>
                           <button 
                            onClick={() => setShowAccount(!showAccount)}
                            className="text-slate-400 hover:text-indigo-500 transition-colors"
                           >
                              {showAccount ? <EyeOff size={20} /> : <Eye size={20} />}
                           </button>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bank Name & IFSC</label>
                        <div className="p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl border border-transparent">
                           <p className="font-bold dark:text-white text-lg">HDFC BANK LTD</p>
                           <p className="text-xs text-slate-500">IFSC: HDFC0001004</p>
                        </div>
                     </div>
                  </div>

                  {holdTimer ? (
                    <div className="p-6 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-100 dark:border-amber-500/20 flex items-center justify-between animate-pulse">
                        <div className="flex items-center gap-4">
                           <Clock className="text-amber-600 h-8 w-8" />
                           <div>
                              <p className="text-sm font-bold text-amber-900 dark:text-amber-400 uppercase tracking-widest">Security Hold Active</p>
                              <p className="text-xs text-amber-700 dark:text-amber-500">Recent payout detail changes are pending verification. Next payout in {holdTimer}.</p>
                           </div>
                        </div>
                        <button className="text-xs font-bold text-amber-700 bg-white dark:bg-amber-900/50 px-4 py-2 rounded-xl">Cancel Update</button>
                    </div>
                  ) : (
                    <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                        <div className="flex gap-4 items-start">
                           <AlertTriangle className="text-amber-500 shrink-0 h-5 w-5 mt-1" />
                           <div className="space-y-4">
                              <div>
                                 <p className="text-sm font-bold dark:text-white">Update Payout Details</p>
                                 <p className="text-xs text-slate-500 leading-relaxed mt-1">
                                    Changing bank details will place a **24-hour security hold** on all pending payouts as a fraud prevention measure.
                                 </p>
                              </div>
                              <button 
                                onClick={triggerHold}
                                className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-sm transition-all hover:scale-105 active:scale-95 shadow-lg"
                              >
                                Change Settlement Account
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
               <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold dark:text-white">Team Members</h3>
                    <p className="text-sm text-slate-500 mt-1">Manage users who have access to this portal.</p>
                  </div>
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-all">
                    <UserPlus size={18} /> Invite User
                  </button>
               </div>
               
               <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    { name: 'Sameer K.', email: 'sameer@nourishwholesale.in', role: 'Owner', status: 'Active' },
                    { name: 'Anita R.', email: 'anita@nourishwholesale.in', role: 'Support Agent', status: 'Active' },
                    { name: 'Rajesh M.', email: 'rajesh@nourishwholesale.in', role: 'Accounts', status: 'Offline' },
                  ].map((user) => (
                    <div key={user.email} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors group">
                       <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-400 group-hover:text-indigo-500 transition-colors">
                             {user.name.charAt(0)}
                          </div>
                          <div>
                             <p className="font-bold dark:text-white">{user.name}</p>
                             <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-8">
                          <div className="text-right">
                             <p className="text-xs font-bold dark:text-slate-300">{user.role}</p>
                             <p className={cn(
                               "text-[10px] font-bold uppercase",
                               user.status === 'Active' ? "text-emerald-500" : "text-slate-400"
                             )}>{user.status}</p>
                          </div>
                          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                             <MoreVertical size={20} />
                          </button>
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
               <h3 className="text-xl font-bold dark:text-white mb-8">Notification Preferences</h3>
               <div className="space-y-8">
                  {[
                    { title: "New Bid Invitations", desc: "Get notified when Shopro invites you to a restock event.", channel: ["Email", "Portal"] },
                    { title: "Order Status Updates", desc: "Alerts when a PO is SPLIT or DISPATCHED status changes.", channel: ["Push", "Email"] },
                    { title: "Payment Settlements", desc: "Notification for every successful bank payout.", channel: ["Push", "SMS"] },
                    { title: "Security Alerts", desc: "Bank detail changes or new user login notifications.", channel: ["SMS", "Email", "Push"] }
                  ].map((item) => (
                    <div key={item.title} className="flex items-center justify-between">
                       <div className="max-w-md">
                          <p className="font-bold dark:text-white">{item.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                       </div>
                       <div className="flex gap-4">
                          {item.channel.map(ch => (
                             <label key={ch} className="inline-flex items-center cursor-pointer group">
                                <span className="mr-2 text-[10px] font-bold text-slate-400 group-hover:text-indigo-500 transition-colors uppercase">{ch}</span>
                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500 rounded-full relative"></div>
                             </label>
                          ))}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
