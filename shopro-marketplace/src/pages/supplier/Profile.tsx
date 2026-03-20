import React, { useState } from "react";
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
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const MOCK_CATEGORIES = ["Fresh Produce", "Dairy & Eggs", "Beverages", "Spices & Herbs"];

export default function Profile() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSent(true);
    setTimeout(() => {
      setShowEditModal(false);
      setRequestSent(false);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Profile Header & Badge */}
      <div className="relative group">
         <div className="h-48 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl opacity-90 group-hover:opacity-100 transition-opacity" />
         <div className="absolute -bottom-12 left-10 flex items-end gap-6">
            <div className="h-32 w-32 rounded-3xl bg-white dark:bg-slate-900 border-4 border-slate-50 dark:border-slate-950 p-6 shadow-xl flex items-center justify-center">
               <Building2 className="h-16 w-16 text-indigo-500" />
            </div>
            <div className="mb-4">
               <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-white drop-shadow-md">Nourish Wholesale Ltd</h1>
                  <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full flex items-center gap-1.5 border border-white/30">
                     <ShieldCheck size={14} className="text-white" />
                     <span className="text-[10px] font-bold text-white uppercase tracking-wider">Shopro Certified</span>
                  </div>
               </div>
               <p className="text-white/80 flex items-center gap-2 mt-1">
                  <MapPin size={14} /> Mumbai, Maharashtra • Member since 2023
               </p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-12">
        {/* Left Column - Business Details */}
        <div className="md:col-span-8 space-y-8">
           <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                 <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                    <Info className="text-indigo-500" /> Business Information
                 </h2>
                 <button 
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 transition-all"
                 >
                    <Edit3 size={16} /> Request Edit
                 </button>
              </div>
              <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                 {[
                    { label: "Business Registration Name", value: "Nourish Wholesale Private Limited" },
                    { label: "Entity Type", value: "Private Limited Company" },
                    { label: "Registration No / CIN", value: "U51909MH2023PTC123456" },
                    { label: "GSTIN Status", value: "27AAACN1234P1Z5 (Verified)", status: 'success' },
                    { label: "Primary Business Email", value: "ops@nourishwholesale.in" },
                    { label: "Registered Address", value: "Floor 4, Mittal Towers, Nariman Point, Mumbai 400021" },
                 ].map((item) => (
                    <div key={item.label} className="space-y-1">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                       <p className={cn(
                          "text-sm font-medium dark:text-slate-200",
                          item.status === 'success' ? "text-emerald-600 dark:text-emerald-400" : "text-slate-700"
                       )}>{item.value}</p>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
              <h2 className="text-xl font-bold dark:text-white mb-6 flex items-center gap-2">
                 <ShoppingBag className="text-indigo-500" /> Supply Categories
              </h2>
              <div className="flex flex-wrap gap-3">
                 {MOCK_CATEGORIES.map((cat) => (
                    <div key={cat} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-2 border border-transparent hover:border-indigo-500/30 transition-all cursor-default">
                       <CheckCircle2 size={16} className="text-emerald-500" />
                       <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{cat}</span>
                    </div>
                 ))}
                 <button className="px-4 py-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2 text-slate-400 hover:text-indigo-500 hover:border-indigo-500 transition-all group">
                    <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                    <span className="text-sm font-bold">Request Add Category</span>
                 </button>
              </div>
           </div>
        </div>

        {/* Right Column - Status & Stats */}
        <div className="md:col-span-4 space-y-8">
           <div className="p-8 rounded-3xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                 <div className="flex justify-between items-start">
                    <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center">
                       <ShieldCheck size={28} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/20 px-2 py-1 rounded">Active</span>
                 </div>
                 <div>
                    <h3 className="text-2xl font-bold tracking-tight">Trust Score: 98%</h3>
                    <p className="text-emerald-100 text-sm mt-2">
                       Your account is in excellent standing. You are eligible for Priority Bidding.
                    </p>
                 </div>
                 <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "98%" }}
                      transition={{ duration: 1 }}
                      className="h-full bg-white"
                    />
                 </div>
              </div>
              <ShieldCheck size={180} className="absolute -right-12 -bottom-12 opacity-10 group-hover:opacity-20 transition-opacity rotate-12" />
           </div>

           <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
              <h3 className="text-lg font-bold dark:text-white flex items-center gap-2 mb-6">
                 <History className="text-indigo-500 size={20}" /> Recent Documents
              </h3>
              <div className="space-y-4">
                 {[
                    { name: "Trade License (2024)", year: "Expires Dec 2024" },
                    { name: "FSSAI Certificate", year: "Expires Oct 2025" },
                    { name: "Bank Verification Lettter", year: "Verified Aug 2023" }
                 ].map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                             <ExternalLink size={18} />
                          </div>
                          <div>
                             <p className="text-xs font-bold dark:text-white">{doc.name}</p>
                             <p className="text-[10px] text-slate-500">{doc.year}</p>
                          </div>
                       </div>
                       <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-500 translate-x-0 group-hover:translate-x-1 transition-all" />
                    </div>
                 ))}
              </div>
              <button className="w-full mt-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs hover:opacity-90">
                 View All Compliance Vault
              </button>
           </div>
        </div>
      </div>

      {/* Request Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-[560px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mx-auto"
            >
              {!requestSent ? (
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold dark:text-white">Request Profile Edit</h2>
                      <p className="text-slate-500 mt-1">Changes to core business data require Shopro approval.</p>
                    </div>
                    <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                      <X size={24} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleRequestSubmit} className="space-y-6">
                    <div className="p-4 bg-amber-50 dark:bg-amber-500/5 rounded-2xl border border-amber-100 dark:border-amber-500/20">
                       <div className="flex gap-2">
                          <AlertCircle className="text-amber-600 h-5 w-5 shrink-0" />
                          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                            Updates to GSTIN, Registration Name, or Address will undergo a 48-hour manual verification cycle. High Trust Score accounts are prioritized.
                          </p>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-sm font-bold dark:text-slate-300">Field(s) to Update</label>
                       <div className="grid grid-cols-2 gap-2">
                          {["Business Name", "GSTIN", "CIN", "Official Address"].map(f => (
                             <label key={f} className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-bold dark:text-slate-400 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                                <input type="checkbox" className="rounded text-indigo-500" /> {f}
                             </label>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-sm font-bold dark:text-slate-300">Description of Change</label>
                       <textarea className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm h-24 focus:ring-2 focus:ring-indigo-500/20" />
                    </div>

                    <div className="flex gap-4">
                       <button type="submit" className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/25">
                          Submit for Review
                       </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="p-12 text-center space-y-6">
                  <div className="h-20 w-20 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                     <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold dark:text-white">Request Sent Successfully</h2>
                    <p className="text-slate-500 mt-2">Ticket #SR-9021 has been created. We'll update you via email within 48 hours.</p>
                  </div>
                  <button 
                    onClick={() => setShowEditModal(false)}
                    className="px-8 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                  >
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
