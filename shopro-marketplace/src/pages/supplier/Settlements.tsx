import { motion } from "framer-motion";
import { 
  BarChart3, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Download,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IconTooltip } from "@/components/shared/IconTooltip";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";

interface Settlement {
  id: string;
  poId: string;
  captured: number;
  payout: number;
  fee: number;
  status: 'SETTLED' | 'PENDING' | 'FAILED';
  date: string;
}

export default function SupplierSettlements() {
  const { data: settlements = [] } = useQuery<Settlement[]>({
    queryKey: ['supplier', 'settlements'],
    queryFn: () => api.get('/supplier/finance/settlements')
  });

  const totalEarned = settlements.filter(s => s.status === 'SETTLED').reduce((acc, s) => acc + s.payout, 0);
  const pendingPayout = settlements.filter(s => s.status === 'PENDING').reduce((acc, s) => acc + s.payout, 0);
  const totalFees = settlements.reduce((acc, s) => acc + s.fee, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 pt-12">
      <div className="max-w-[1280px] mx-auto space-y-12">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="space-y-4">
            <h1 className="text-(--text-3xl) font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <Wallet className="w-10 h-10 text-emerald-500" />
              Payment <span className="text-emerald-500">Settlements</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-extrabold italic uppercase tracking-widest text-(--text-2xs) opacity-60">
              Finance Node.X // Funds & Payouts
            </p>
          </div>
          
          <button className="h-14 px-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold flex items-center gap-3 hover:border-emerald-500 transition-all shadow-sm">
            <Calendar size={20} />
            This Month
          </button>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-8">
           {[
             { label: "Total Earned", val: `₹${totalEarned.toLocaleString()}`, icon: TrendingUp, color: "emerald", trend: "+12.5%" },
             { label: "Pending Settlement", val: `₹${pendingPayout.toLocaleString()}`, icon: Clock, color: "amber", trend: "4 Active" },
             { label: "Marketplace Fees", val: `₹${totalFees.toLocaleString()}`, icon: BarChart3, color: "rose", trend: "Flat Rate" },
           ].map((stat, idx) => (
             <motion.div
               key={stat.label}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
               className="relative overflow-hidden p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-200 dark:border-slate-800 shadow-xl"
             >
               <div className={cn(
                 "w-14 h-14 rounded-2xl flex items-center justify-center mb-6",
                 `bg-${stat.color}-500/10 text-${stat.color}-500`
               )}>
                 <stat.icon size={28} />
               </div>
               <div className="space-y-1">
                 <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-(--text-2xs)">
                   {stat.label}
                 </p>
                 <div className="flex items-end justify-between">
                   <h2 className="text-(--text-4xl) font-black text-slate-900 dark:text-white italic tracking-tighter">
                     {stat.val}
                   </h2>
                   <span className={cn(
                     "text-(--text-xs) font-bold px-3 py-1 rounded-full",
                     `bg-${stat.color}-500/10 text-${stat.color}-500`
                   )}>
                     {stat.trend}
                   </span>
                 </div>
               </div>
             </motion.div>
           ))}
        </div>

        {/* Ledger Section */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
           <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-(--text-xl) font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">Settlement History</h3>
              <div className="flex items-center gap-2">
                 <button className="h-10 px-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-(--text-xs) font-bold">Show All</button>
                 <button className="h-10 px-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-(--text-xs) font-bold flex items-center gap-2">
                   <Download size={14} /> Report
                 </button>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                       <th className="px-8 py-4 text-(--text-2xs) font-black uppercase text-slate-400 tracking-widest">Date // ID</th>
                       <th className="px-8 py-4 text-(--text-2xs) font-black uppercase text-slate-400 tracking-widest">PO Reference</th>
                       <th className="px-8 py-4 text-(--text-2xs) font-black uppercase text-slate-400 tracking-widest">Total Value</th>
                       <th className="px-8 py-4 text-(--text-2xs) font-black uppercase text-slate-400 tracking-widest text-rose-500">Fees</th>
                       <th className="px-8 py-4 text-(--text-2xs) font-black uppercase text-slate-400 tracking-widest text-emerald-500">Payout</th>
                       <th className="px-8 py-4 text-(--text-2xs) font-black uppercase text-slate-400 tracking-widest">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {settlements.map((s) => (
                       <tr key={s.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all">
                          <td className="px-8 py-6">
                             <p className="font-bold text-slate-900 dark:text-white tracking-tight">{new Date(s.date).toLocaleDateString()}</p>
                             <p className="text-slate-400 text-(--text-xs) font-mono uppercase tracking-tighter truncate w-24">TXN-{s.id.slice(0,8)}</p>
                          </td>
                          <td className="px-8 py-6">
                             <span className="h-8 px-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 font-bold text-(--text-xs) flex items-center w-fit">
                                PO-{s.poId.slice(0,6)}
                             </span>
                          </td>
                          <td className="px-8 py-6">
                             <p className="font-bold text-slate-900 dark:text-white">₹{s.captured.toLocaleString()}</p>
                          </td>
                          <td className="px-8 py-6">
                             <p className="font-bold text-rose-500">(-₹{s.fee.toLocaleString()})</p>
                          </td>
                          <td className="px-8 py-6">
                             <p className="font-black text-emerald-500 text-(--text-lg)">₹{s.payout.toLocaleString()}</p>
                          </td>
                          <td className="px-8 py-6">
                             <div className={cn(
                                "flex items-center gap-2 font-bold text-(--text-xs)",
                                s.status === 'SETTLED' ? "text-emerald-500" :
                                s.status === 'PENDING' ? "text-amber-500" :
                                "text-rose-500"
                             )}>
                                {s.status === 'SETTLED' ? <CheckCircle2 size={14} /> : 
                                 s.status === 'PENDING' ? <Clock size={14} /> : 
                                 <AlertCircle size={14} />}
                                {s.status}
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
}
