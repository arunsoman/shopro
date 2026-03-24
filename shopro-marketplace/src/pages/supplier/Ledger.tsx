import { motion } from "framer-motion";
import { 
  Building2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  Download,
  Calendar,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IconTooltip } from "@/components/shared/IconTooltip";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";

interface LedgerEntry {
  id: string;
  date: string;
  reference: string;
  type: 'PAYMENT_RECEIVED' | 'FEE_DEDUCTION' | 'ADJUSTMENT' | 'PAYOUT_INITIATED';
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export default function SupplierLedger() {
  const { data: entries = [] } = useQuery<LedgerEntry[]>({
    queryKey: ['supplier', 'ledger'],
    queryFn: () => api.get('/supplier/finance/ledger')
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 pt-12">
      <div className="max-w-[1280px] mx-auto space-y-12">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="space-y-4">
            <h1 className="text-(--text-3xl) font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <Layers className="w-10 h-10 text-emerald-500" />
              Supplier <span className="text-emerald-500">Ledger</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-extrabold italic uppercase tracking-widest text-(--text-2xs) opacity-60">
              Finance Node.X // Global Transaction Stream
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border-2 border-emerald-500/20 shadow-sm text-right">
               <p className="text-(--text-2xs) text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Current Balance</p>
               <p className="text-(--text-xl) font-black text-slate-900 dark:text-white italic tracking-tighter">₹2,45,670</p>
            </div>
            <button className="h-14 w-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20">
               <Download size={24} />
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-4 flex items-center gap-4 shadow-xl">
           <div className="relative flex-1">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
             <input 
               type="text"
               placeholder="Search by reference, description..."
               className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl pl-12 pr-4 py-4 text-(--text-sm) font-bold outline-none"
             />
           </div>
           <button className="h-14 px-6 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 rounded-2xl font-bold flex items-center gap-2 transition-all">
             <Calendar size={18} /> Last 30 Days
           </button>
           <button className="h-14 px-6 bg-slate-50 dark:bg-slate-800/50 text-emerald-500 rounded-2xl font-bold flex items-center gap-2 transition-all hover:bg-emerald-500 hover:text-white">
             <Filter size={18} /> More Filters
           </button>
        </div>

        {/* Ledger Table */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-8 py-4 text-(--text-2xs) font-black uppercase text-slate-400 tracking-widest">Date</th>
                    <th className="px-8 py-4 text-(--text-2xs) font-black uppercase text-slate-400 tracking-widest">Entry Details</th>
                    <th className="px-8 py-4 text-(--text-2xs) font-black uppercase text-slate-400 tracking-widest">Reference</th>
                    <th className="px-8 py-4 text-(--text-2xs) font-black uppercase text-slate-400 tracking-widest text-emerald-500">Credit (+)</th>
                    <th className="px-8 py-4 text-(--text-2xs) font-black uppercase text-slate-400 tracking-widest text-rose-500">Debit (-)</th>
                    <th className="px-8 py-4 text-(--text-2xs) font-black uppercase text-slate-400 tracking-widest">Balance</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                 {entries.length === 0 ? (
                    <tr>
                       <td colSpan={6} className="px-8 py-24 text-center">
                          <div className="space-y-4">
                             <Layers className="mx-auto text-slate-300 dark:text-slate-700" size={48} />
                             <p className="text-slate-500 font-bold italic tracking-tighter uppercase">No ledger entries found for selected period</p>
                          </div>
                       </td>
                    </tr>
                 ) : (
                    entries.map((entry) => (
                       <tr key={entry.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all">
                          <td className="px-8 py-6">
                             <p className="font-bold text-slate-900 dark:text-white tracking-tight">{new Date(entry.date).toLocaleDateString()}</p>
                             <p className="text-slate-400 text-(--text-3xs) font-mono tracking-tighter uppercase">{new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </td>
                          <td className="px-8 py-6 max-w-xs">
                             <div className="flex items-center gap-3">
                                <div className={cn(
                                   "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                   entry.credit > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                                )}>
                                   {entry.credit > 0 ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                                </div>
                                <div>
                                   <p className="font-bold text-slate-900 dark:text-white text-(--text-sm) leading-tight">{entry.description}</p>
                                   <p className="text-slate-400 text-(--text-2xs) font-bold uppercase tracking-widest mt-0.5">{entry.type.replace(/_/g, ' ')}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <code className="text-(--text-xs) font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-600 dark:text-slate-400 uppercase">
                                {entry.reference}
                             </code>
                          </td>
                          <td className="px-8 py-6">
                             <p className={cn("font-bold text-emerald-500", entry.credit === 0 && "opacity-20 text-slate-300")}>
                                {entry.credit > 0 ? `+₹${entry.credit.toLocaleString()}` : "—"}
                             </p>
                          </td>
                          <td className="px-8 py-6">
                             <p className={cn("font-bold text-rose-500", entry.debit === 0 && "opacity-20 text-slate-300")}>
                                {entry.debit > 0 ? `-₹${entry.debit.toLocaleString()}` : "—"}
                             </p>
                          </td>
                          <td className="px-8 py-6">
                             <p className="font-black text-slate-900 dark:text-white tabular-nums">₹{entry.balance.toLocaleString()}</p>
                          </td>
                       </tr>
                    ))
                 )}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}
