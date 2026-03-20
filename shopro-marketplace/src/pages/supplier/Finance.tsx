import React, { useState } from "react";
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  ChevronRight,
  MoreHorizontal,
  Info,
  ShieldCheck,
  History,
  FileText,
  XCircle,
  Upload
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Payout {
  id: string;
  reference: string;
  amount: number;
  date: string;
  status: 'PAID' | 'PENDING' | 'DISPUTED';
  method: string;
  isDisputable: boolean;
}

const MOCK_PAYOUTS: Payout[] = [
  {
    id: "p_1",
    reference: "PAY-5582-X",
    amount: 12450.00,
    date: new Date().toISOString(), // Today
    status: 'PAID',
    method: 'HDFC Bank (**** 8821)',
    isDisputable: true
  },
  {
    id: "p_2",
    reference: "PAY-5491-Y",
    amount: 8900.50,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    status: 'PAID',
    method: 'HDFC Bank (**** 8821)',
    isDisputable: false
  },
  {
    id: "p_3",
    reference: "PAY-5400-Z",
    amount: 15600.00,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'DISPUTED',
    method: 'HDFC Bank (**** 8821)',
    isDisputable: false
  },
  {
    id: "p_4",
    reference: "PAY-5380-W",
    amount: 4200.00,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'PAID',
    method: 'HDFC Bank (**** 8821)',
    isDisputable: false
  }
];

export default function Finance() {
  const [payouts, setPayouts] = useState<Payout[]>(MOCK_PAYOUTS);
  const [showDisputeModal, setShowDisputeModal] = useState<Payout | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const handleDownload = (id: string) => {
    setIsDownloading(id);
    setTimeout(() => setIsDownloading(null), 1500);
  };

  const handleDisputeSubmit = () => {
    if (showDisputeModal) {
      setPayouts(prev => prev.map(p => p.id === showDisputeModal.id ? { ...p, status: 'DISPUTED', isDisputable: false } : p));
      setShowDisputeModal(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Earnings", value: "₹2,45,600", icon: <ArrowUpRight className="text-emerald-500" />, sub: "+12% from last month", trend: "up" },
          { label: "Pending Payouts", value: "₹18,400", icon: <Clock className="text-amber-500" />, sub: "Next payout: 22 Mar", trend: "neutral" },
          { label: "Ready to Withdraw", value: "₹1,12,000", icon: <CheckCircle2 className="text-indigo-500" />, sub: "Auto-sweep enabled", trend: "up" },
        ].map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2 tracking-tight">{card.value}</h3>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:bg-slate-100 dark:group-hover:bg-slate-700 transition-colors">
                {card.icon}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={cn(
                "text-xs font-bold px-1.5 py-0.5 rounded",
                card.trend === 'up' ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              )}>
                {card.sub.split(':')[0]}
              </span>
              <span className="text-xs text-slate-400">{card.sub.includes(':') ? card.sub.split(':')[1] : ''}</span>
            </div>
            {/* Animated underlying accent */}
            <div className="absolute bottom-0 left-0 h-0.5 w-full bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
          </motion.div>
        ))}
      </div>

      {/* Payment Ledger Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-bottom border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
              <History className="text-indigo-500" />
              Payment Ledger
            </h2>
            <p className="text-slate-500 mt-1">Detailed history of all your settlements and payouts.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors h-4 w-4" />
                <input 
                  placeholder="Search by reference..." 
                  className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 w-64 transition-all"
                />
             </div>
             <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 transition-all">
               <Filter size={16} /> Filters
             </button>
             <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20">
               <Download size={16} /> Export CSV
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-y border-slate-100 dark:border-slate-800">
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Reference</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Amount</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Date</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {payouts.map((payout, idx) => (
                <motion.tr 
                  key={payout.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-500">
                        <CreditCard size={18} />
                      </div>
                      <div>
                        <p className="font-bold dark:text-white uppercase tracking-tight">{payout.reference}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{payout.method}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">₹{payout.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {new Date(payout.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      payout.status === 'PAID' ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200/50 dark:border-green-500/20" :
                      payout.status === 'PENDING' ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/20" :
                      "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200/50 dark:border-red-500/20 animate-pulse"
                    )}>
                      {payout.status === 'PAID' && <CheckCircle2 size={10} />}
                      {payout.status === 'PENDING' && <Clock size={10} />}
                      {payout.status === 'DISPUTED' && <AlertCircle size={10} />}
                      {payout.status}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {payout.isDisputable && (
                         <button 
                           onClick={() => setShowDisputeModal(payout)}
                           className="px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-red-100 dark:border-red-500/20"
                         >
                           Dispute
                         </button>
                       )}
                       <button 
                         onClick={() => handleDownload(payout.id)}
                         disabled={isDownloading === payout.id}
                         className={cn(
                           "flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-xs transition-all",
                           isDownloading === payout.id ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-200 dark:hover:bg-slate-700"
                         )}
                       >
                         {isDownloading === payout.id ? "Processing..." : <><FileText size={14} /> Receipt</>}
                       </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safety Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-3xl bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
           <div className="relative z-10 flex items-start justify-between">
              <div className="space-y-4 ">
                 <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <ShieldCheck size={28} />
                 </div>
                 <h3 className="text-2xl font-bold tracking-tight">Financial Security Center</h3>
                 <p className="text-indigo-100 leading-relaxed">
                   All payouts are processed via Shopro's secure escrow. Your financial data is encrypted and never shared.
                 </p>
                 <button className="px-6 py-2.5 bg-white text-indigo-500 font-bold rounded-xl text-sm shadow-lg hover:scale-105 transition-transform active:scale-95">
                    View Security Audit
                 </button>
              </div>
              <div className="opacity-10 group-hover:opacity-20 transition-opacity absolute -right-16 -bottom-16">
                 <ShieldCheck size={240} />
              </div>
           </div>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
           <div className="space-y-4">
              <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                 <Info className="text-indigo-500" /> Need Help?
              </h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                 Payout issues are handled by our dedicated merchant support team. Most disputes are resolved within 5-7 business days.
              </p>
           </div>
           <div className="mt-8 space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                 <span className="text-xs font-medium text-slate-400 italic">Expected next Payout</span>
                 <span className="text-xs font-bold dark:text-white">22 Mar 2024, 10:00 AM</span>
              </div>
              <button className="w-full py-2.5 text-center text-indigo-500 font-bold text-sm hover:underline">
                 Connect with Financial Support →
              </button>
           </div>
        </div>
      </div>

      {/* Dispute Modal */}
      <AnimatePresence>
        {showDisputeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDisputeModal(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-[560px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 overflow-hidden mx-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold dark:text-white">Raise Dispute</h2>
                  <p className="text-slate-500 mt-1">Ref: {showDisputeModal.reference} (₹{showDisputeModal.amount.toLocaleString()})</p>
                </div>
                <button onClick={() => setShowDisputeModal(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                  <XCircle size={24} />
                </button>
              </div>

              <div className="space-y-6 mb-8">
                 <div className="p-4 bg-amber-50 dark:bg-amber-500/5 rounded-2xl border border-amber-100 dark:border-amber-500/20 mb-6">
                    <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                       Disputes must be raised within 48 hours of settlement. You are raising this on {new Date().toLocaleDateString()}.
                    </p>
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-bold dark:text-slate-300">Dispute Reason</label>
                    <select className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20">
                       <option>Incorrect Amount Received</option>
                       <option>Deductions Miscalculated</option>
                       <option>Transaction Not Recognized</option>
                       <option>Delayed Settlement Penalty</option>
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-bold dark:text-slate-300">Evidence / Comments</label>
                    <textarea 
                      placeholder="Provide details about the discrepancy..."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm h-32 focus:ring-2 focus:ring-indigo-500/20"
                    />
                 </div>

                 <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center group hover:border-indigo-500 transition-colors cursor-pointer">
                    <Upload className="mx-auto text-slate-400 group-hover:text-indigo-500 transition-colors h-8 w-8 mb-2" />
                    <p className="text-sm font-bold dark:text-white">Upload Supporting Evidence</p>
                    <p className="text-xs text-slate-500">Screenshots, bank statements (JPG, PDF)</p>
                 </div>
              </div>

              <div className="flex gap-4">
                 <button 
                   onClick={handleDisputeSubmit}
                   className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-red-500/25 flex items-center justify-center gap-2"
                 >
                   Flag Transaction
                 </button>
                 <button 
                   onClick={() => setShowDisputeModal(null)}
                   className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl hover:opacity-90"
                 >
                   Discard
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
