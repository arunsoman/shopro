import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBadge } from "@/components/ui/status-badge";
import { ArrowLeft, ExternalLink, Info, Truck, AlertTriangle, BarChart3, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";

/**
 * OP-06 — Sub-PO Management
 * Purpose: Track all individual supplier fulfillments under a parent PO.
 * DNA: Progress skyline, timeline flow, supplier performance micro-badges.
 */

const INITIAL_SUB_POS = [
  { id: "SPO-22A1", supplier: "Fresh Farms Ltd", items: 8, status: "DISPATCHED", value: 23700, progress: 75, mode: "BID", delivery: "Today, 4PM" },
  { id: "SPO-22A2", supplier: "Dairy Dynamics", items: 12, status: "ACCEPTED", value: 7800, progress: 20, mode: "DIRECT", delivery: "Tomorrow, 9AM" },
  { id: "SPO-22A3", supplier: "Imperial Grains", items: 4, status: "RAISED", value: 11000, progress: 5, mode: "DIRECT", delivery: "Mar 22" },
];

const STATUS_FLOW = ["RAISED", "ACCEPTED", "PREPARING", "DISPATCHED", "DELIVERED"];

export default function SubPOManagement() {
  const navigate = useNavigate();
  const { poId } = useParams();
  const [subPos, setSubPos] = useState(INITIAL_SUB_POS);

  const transitionStatus = (id: string) => {
    setSubPos(prev => prev.map(spo => {
      if (spo.id === id) {
        const currentIndex = STATUS_FLOW.indexOf(spo.status);
        const nextStatus = STATUS_FLOW[(currentIndex + 1) % STATUS_FLOW.length];
        const nextProgress = Math.min(100, (STATUS_FLOW.indexOf(nextStatus) + 1) * 20);
        return { ...spo, status: nextStatus, progress: nextStatus === "DELIVERED" ? 100 : nextProgress };
      }
      return spo;
    }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
        <div className="space-y-4">
          <button 
            onClick={() => navigate(`/operator/po/${poId}`)}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-violet-500 transition-colors uppercase tracking-widest"
          >
            <ArrowLeft size={14} /> Back to PO Review
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight">Fulfillment Breakdown: {poId}</h1>
              <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest">3 Sub-POs Generated</div>
            </div>
            <p className="text-slate-500 font-medium">Monitoring real-time supplier orchestration for <span className="text-slate-900 dark:text-white font-bold">Mama’s Italian Bistro</span></p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="h-10 px-4 bg-white dark:bg-slate-900 rounded-xl text-xs font-black ring-1 ring-slate-200 dark:ring-slate-800 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <BarChart3 size={14} /> Export Manifest
          </button>
          <button className="h-10 px-4 bg-violet-600 text-white rounded-xl text-xs font-black flex items-center gap-2 hover:bg-violet-700 transition-colors shadow-lg shadow-violet-500/20">
            <AlertTriangle size={14} /> Escalation Portal
          </button>
        </div>
      </div>

      {/* Aggregate Progress Skyline */}
      <div className="bg-slate-900 dark:bg-slate-950 p-8 rounded-[3rem] text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-violet-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-12 items-center">
          <div className="md:col-span-1 space-y-2">
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Parent PO Status</p>
            <p className="text-3xl font-bold">34% <span className="text-sm font-medium text-white/40 italic">Aggregate</span></p>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: "34%" }} className="h-full bg-violet-500" />
            </div>
          </div>
          
          <div className="md:col-span-3 flex flex-wrap gap-12">
            {[
              { label: "Suppliers Active", value: "3/3", color: "text-blue-400" },
              { label: "Logistics Latency", value: "0m", color: "text-green-400" },
              { label: "Items Fulfilled", value: "8/24", color: "text-violet-400" },
              { label: "Est. Arrival", value: "Today 4PM", color: "text-amber-400" },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-none">{stat.label}</p>
                <p className={cn("text-xl font-bold", stat.color)}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-PO Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {subPos.map((spo, i) => (
          <motion.div
            key={spo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative"
          >
            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-8 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm hover:shadow-xl transition-all h-full flex flex-col">
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <StatusBadge status={spo.status as any} />
                   <div className="flex items-center gap-2 mt-2">
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">{spo.id}</p>
                    <button 
                      onClick={() => transitionStatus(spo.id)}
                      className="text-[9px] font-black text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 border-b border-violet-500/20 uppercase tracking-tighter"
                    >
                      Transition
                    </button>
                   </div>
                 </div>
                 <div className="flex items-center gap-2 font-black">
                   <div 
                    onClick={() => navigate(`/operator/messages?supplier=${spo.supplier}`)}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 cursor-pointer hover:text-violet-500 transition-colors"
                   >
                     <MessageSquare size={16} />
                   </div>
                   <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 cursor-pointer hover:text-violet-500 transition-colors">
                     <ExternalLink size={16} />
                   </div>
                 </div>
               </div>

               <div className="space-y-4 mb-8 flex-1">
                 <div>
                   <h3 className="text-lg font-bold hover:text-violet-500 transition-colors cursor-pointer">{spo.supplier}</h3>
                   <div className="flex items-center gap-2 mt-1">
                     <span className={cn(
                       "text-[8px] font-black px-1.5 py-0.5 rounded tracking-tighter shadow-sm",
                       spo.mode === "BID" ? "bg-violet-100 text-violet-600 ring-1 ring-violet-500/10" : "bg-teal-100 text-teal-600 ring-1 ring-teal-500/10"
                     )}>{spo.mode}</span>
                     <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{spo.items} Items</span>
                   </div>
                 </div>

                 <div className="space-y-2">
                   <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                     <span className="text-slate-400">Progress Skyline</span>
                     <span className={cn(
                       "transition-colors duration-500",
                       spo.progress === 100 ? "text-green-500" : "text-slate-900 dark:text-white"
                     )}>{spo.progress}%</span>
                   </div>
                   <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${spo.progress}%` }} 
                        className={cn(
                          "h-full transition-all duration-700",
                          spo.status === "DELIVERED" ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]" : 
                          spo.status === "DISPATCHED" ? "bg-blue-500" : "bg-violet-500"
                        )} 
                      />
                   </div>
                 </div>
               </div>

               <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <Truck size={14} className="text-slate-400" />
                   <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{spo.delivery}</span>
                 </div>
                 <p className="text-sm font-bold text-violet-500 tabular-nums">₹{spo.value.toLocaleString()}</p>
               </div>
            </div>
          </motion.div>
        ))}
        
        {/* Support Card */}
        <div className="bg-slate-50 dark:bg-slate-800/20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center space-y-4 opacity-70 hover:opacity-100 transition-opacity">
           <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
             <Info size={24} />
           </div>
           <div>
             <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500">Need Assistance?</h4>
             <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">Our fulfillment specialists are available 24/7 for supplier intervention.</p>
           </div>
           <button className="text-[10px] font-black text-violet-500 uppercase underline decoration-violet-500/30">Connect to Ops Support</button>
        </div>
      </div>
    </div>
  );
}
