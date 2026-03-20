import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Filter, FileCheck, Check, X, ShieldCheck, Download, Info, Eye, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * OP-09 — Supplier Vetting Queue
 * Purpose: Manage new supplier applications.
 * DNA: Progress steps, document status highlights, approval actions.
 */

const VETTING_QUEUE = [
  { id: "VET-771", name: "Supreme Spices", category: "Dry Goods", applied: "2h ago", docs: "4/5", status: "UNDER_REVIEW", risk: "Low" },
  { id: "VET-768", name: "Coastal Catch", category: "Seafood", applied: "5h ago", docs: "5/5", status: "PENDING", risk: "Medium" },
  { id: "VET-765", name: "Dairy Delights", category: "Dairy", applied: "1d ago", docs: "3/5", status: "CONDITIONAL", risk: "Low" },
  { id: "VET-760", name: "Green Valley", category: "Produce", applied: "2d ago", docs: "5/5", status: "PENDING", risk: "Low" },
];

export default function SupplierVetting() {
  const [queue, setQueue] = useState(VETTING_QUEUE);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewingApp, setViewingApp] = useState<any | null>(null);
  const [pennyDropStatus, setPennyDropStatus] = useState<"IDLE" | "PENDING" | "SUCCESS">("IDLE");

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const approveApp = (id: string) => {
    setQueue(prev => prev.map(a => a.id === id ? { ...a, status: "APPROVED" } : a));
    if (viewingApp?.id === id) setViewingApp(null);
  };

  const rejectApp = (id: string) => {
    setQueue(prev => prev.map(a => a.id === id ? { ...a, status: "REJECTED" } : a));
    if (viewingApp?.id === id) setViewingApp(null);
  };

  const triggerPennyDrop = () => {
    setPennyDropStatus("PENDING");
    setTimeout(() => setPennyDropStatus("SUCCESS"), 2000);
  };
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500 border border-teal-500/20">
               <ShieldCheck size={24} />
             </div>
             <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Vetting Queue</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            Reviewing {VETTING_QUEUE.length} supplier applications for marketplace onboarding.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 focus-within:text-teal-500" />
            <input 
              type="text" 
              placeholder="Search Application ID..." 
              className="h-10 pl-9 pr-4 bg-white dark:bg-slate-900 rounded-xl text-xs ring-1 ring-slate-200 dark:ring-slate-800 outline-none focus:ring-2 focus:ring-teal-500 transition-all w-64 shadow-sm"
            />
          </div>
          <button className="h-10 px-4 bg-white dark:bg-slate-900 rounded-xl text-xs font-black ring-1 ring-slate-200 dark:ring-slate-800 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Download size={14} /> EXPORT QUEUE
          </button>
        </div>
      </div>

      {/* Queue Stats DNA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Pending Review", value: "12", color: "blue" },
          { label: "Under Review", value: "4", color: "violet" },
          { label: "Conditional", value: "2", color: "amber" },
          { label: "Rejected (30d)", value: "5", color: "rose" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl ring-1 ring-slate-100 dark:ring-slate-800 border-b-4 border-slate-100 dark:border-slate-800">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Table */}
      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
           <h2 className="text-lg font-bold">Onboarding Applications</h2>
           <div className="flex items-center gap-2">
             <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
               <Filter size={18} />
             </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                <th className="p-6">Application</th>
                <th className="p-6">Category</th>
                <th className="p-6">Progress</th>
                <th className="p-6">Status</th>
                <th className="p-6">Risk Profile</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {queue.map((app) => (
                <tr 
                  key={app.id} 
                  className={cn(
                    "group transition-colors",
                    selectedIds.includes(app.id) ? "bg-teal-50/50 dark:bg-teal-900/10" : "hover:bg-white dark:hover:bg-slate-800/50"
                  )}
                >
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(app.id)}
                        onChange={() => toggleSelect(app.id)}
                        className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{app.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">APP: {app.id} • {app.applied}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{app.category}</span>
                  </td>
                  <td className="p-6 text-xs text-slate-600 dark:text-slate-300 font-bold">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className={cn(
                            "w-2.5 h-2.5 rounded-full border border-white dark:border-slate-900",
                            i <= parseInt(app.docs[0]) ? "bg-teal-500" : "bg-slate-200 dark:bg-slate-700"
                          )} />
                        ))}
                      </div>
                      <span className="text-[10px] tracking-widest ml-1">{app.docs} DOCS</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <StatusBadge status={app.status as any} />
                  </td>
                  <td className="p-6">
                     <div className={cn(
                       "inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter",
                       app.risk === "Low" ? "text-green-500" : "text-amber-500"
                     )}>
                       <Info size={12} /> {app.risk} Risk
                     </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => approveApp(app.id)}
                        className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-teal-600 hover:bg-teal-500 hover:text-white transition-all"
                      >
                        <Check size={16} />
                      </button>
                      <button 
                        onClick={() => rejectApp(app.id)}
                        className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 hover:bg-rose-500 hover:text-white transition-all"
                      >
                        <X size={16} />
                      </button>
                      <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800 mx-2" />
                      <button 
                        onClick={() => setViewingApp(app)}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-violet-500 transition-all"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Action DNA */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xl px-6 z-50 pointer-events-none">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative pointer-events-auto group"
        >
          <div className="absolute inset-0 bg-teal-500 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity" />
          <div className="relative bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-5 rounded-[2.5rem] shadow-2xl flex items-center justify-between gap-8 border border-white/10 dark:border-slate-900/10">
             <div className="flex items-center gap-4">
               <FileCheck size={20} className="text-teal-400" />
               <p className="text-xs font-bold uppercase tracking-widest text-white/60 dark:text-slate-500">Selection: <span className="text-white dark:text-slate-900">{selectedIds.length} Items</span></p>
             </div>
             <button 
              disabled={selectedIds.length === 0}
              onClick={() => {
                setQueue(prev => prev.map(a => selectedIds.includes(a.id) ? { ...a, status: "APPROVED" } : a));
                setSelectedIds([]);
              }}
              className="h-10 px-6 rounded-xl bg-teal-500 text-white font-black text-[10px] uppercase tracking-widest disabled:opacity-30 disabled:grayscale transition-all"
             >
               APPROVE SELECTED
             </button>
          </div>
        </motion.div>
      </div>

      {/* Application Detail Modal */}
      <AnimatePresence>
        {viewingApp && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setViewingApp(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden ring-1 ring-white/10"
            >
              <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black">{viewingApp.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">Onboarding Application Details</p>
                </div>
                <StatusBadge status={viewingApp.status as any} />
              </div>

              <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Status</p>
                    <div className="space-y-3">
                      {["GST Registration", "FSSAI License", "Trade License", "PAN Card", "ID Proof"].map((doc, idx) => (
                        <div key={doc} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{doc}</span>
                          {idx < parseInt(viewingApp.docs[0]) ? <Check size={14} className="text-teal-500" /> : <X size={14} className="text-slate-400" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">KYC & Financials</p>
                    <div className="p-6 rounded-2xl ring-1 ring-slate-100 dark:ring-slate-800 space-y-6">
                       <div className="flex items-center justify-between">
                         <span className="text-xs font-bold text-slate-500">Penny Drop Verification</span>
                         {pennyDropStatus === "SUCCESS" ? (
                           <span className="text-[10px] font-black text-teal-500 uppercase tracking-tighter">Verified</span>
                         ) : (
                           <button 
                            disabled={pennyDropStatus === "PENDING"}
                            onClick={triggerPennyDrop}
                            className={cn(
                              "text-[10px] font-black uppercase tracking-tighter transition-all",
                              pennyDropStatus === "PENDING" ? "text-amber-500" : "text-violet-500 hover:underline"
                            )}
                           >
                             {pennyDropStatus === "PENDING" ? "Verifying..." : "Trigger Penny Drop"}
                           </button>
                         )}
                       </div>
                       <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Escalation History</p>
                         <p className="text-xs italic text-slate-400">No flags raised during initial risk profiling.</p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button 
                  onClick={() => rejectApp(viewingApp.id)}
                  className="px-6 h-12 rounded-2xl font-black text-xs text-rose-600 tracking-widest uppercase hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                >
                  Reject Application
                </button>
                <button 
                  onClick={() => approveApp(viewingApp.id)}
                  className="px-8 h-12 rounded-2xl bg-teal-500 text-white font-black text-xs tracking-widest uppercase shadow-lg shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Final Approval
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
