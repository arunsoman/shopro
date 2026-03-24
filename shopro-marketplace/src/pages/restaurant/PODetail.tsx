"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  Printer,
  Download,
  Edit3,
  Award,
  Zap,
  TrendingUp,
  Box,
  CircleDot,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * RD-01 — Purchase Order Detail
 * Purpose: Track a specific PO for restaurant buyers.
 */

interface POItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  unit: string;
}

interface POActivity {
  status: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

interface PODetail {
  id: string;
  status: string;
  displayStatus: string;
  placedDate: string;
  expectedDelivery: string;
  items: POItem[];
  total: number;
  activities: POActivity[];
}

const OrderHeader = ({ id, status }: { id: string; status: string }) => (
  <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-slate-200 dark:border-slate-800 pb-8 transition-all">
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button 
            onClick={() => window.history.back()}
            className="h-12 w-12 bg-white dark:bg-slate-950 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 hover:scale-105 transition-all shadow-sm"
        >
            <IconTooltip label="Return to Hub"><ArrowLeft size={20} /></IconTooltip>
        </button>
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            {id.replace(/PO-/g, '')} <span className="text-brand-primary font-extrabold italic">Order</span>
        </h1>
      </div>
      <p className="text-slate-500 font-medium text-sm flex items-center gap-3">
         <IconTooltip label="Status Stream"><CircleDot className="w-5 h-5 text-brand-primary animate-pulse" /></IconTooltip>
         Order Status: <span className="font-bold">{status}</span>
      </p>
    </div>

    <div className="flex items-center gap-4">
        <button className="h-12 w-12 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-md transition-all hover:scale-105">
            <IconTooltip label="Print Order"><Printer size={20} /></IconTooltip>
        </button>
        <button className="h-12 px-6 bg-indigo-600 text-white rounded-xl border border-indigo-400 flex items-center gap-3 shadow-md transition-all hover:scale-[1.02] italic">
            <IconTooltip label="Request Changes"><Edit3 size={20} /></IconTooltip>
            <span className="text-sm font-bold tracking-tight uppercase">Request Amendment</span>
        </button>
    </div>
  </header>
);

const TimelineNode = ({ step, i, total }: { step: any; i: number; total: number }) => (
  <div className="flex gap-8 group">
    <div className="flex flex-col items-center">
        <div className={cn(
            "relative h-12 w-12 rounded-xl flex items-center justify-center border transition-all duration-500 z-10",
            step.completed ? "bg-emerald-500 border-emerald-300 text-white" : step.current ? "bg-indigo-600 border-indigo-400 text-white shadow-xl" : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400"
        )}>
            {step.completed ? <IconTooltip label="Stage Complete"><CheckCircle2 size={24} /></IconTooltip> : <span className="text-lg font-bold">{i+1}</span>}
            {step.current && <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -inset-2 rounded-2xl bg-indigo-500/20 pointer-events-none" />}
        </div>
        {i < total - 1 && (
            <div className={cn("w-2 h-20 my-2 rounded-full transition-all duration-700", step.completed ? "bg-emerald-500" : "bg-border")} />
        )}
    </div>
    <div className="pt-1 space-y-1 italic leading-none">
        <div className={cn("text-xl font-bold tracking-tight uppercase", step.completed || step.current ? "text-indigo-600" : "text-slate-400 opacity-60")}>{step.title}</div>
        <div className="text-[10px] font-semibold tracking-wide text-slate-400 leading-none">{step.description}</div>
        {step.timestamp && <div className="text-lg font-bold text-slate-900 dark:text-white mt-3 uppercase italic tracking-tighter">{step.timestamp}</div>}
    </div>
  </div>
);

export default function PODetail() {
  const { poId } = useParams();
  const navigate = useNavigate();

  const { data: po, isLoading } = useQuery<PODetail>({
    queryKey: ["buyer-po-detail", poId],
    queryFn: async () => {
      const resp = await api.get(`buyer/orders/${poId}`);
      return resp.data;
    }
  });

  if (isLoading) return (
      <SecureOverlay>
          <div className="p-24 space-y-12 animate-pulse">
              <div className="h-40 bg-muted/20 rounded-3xl" />
              <div className="grid grid-cols-3 gap-12">
                  <div className="h-96 bg-muted/20 rounded-3xl col-span-2" />
                  <div className="h-96 bg-muted/20 rounded-3xl" />
              </div>
          </div>
      </SecureOverlay>
  );

  if (!po) return null;

  return (
    <SecureOverlay>
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-24 text-slate-900 dark:text-white">
      <OrderHeader id={po.id} status={po.displayStatus || po.status} />

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-12">
            {/* Items Breakdown */}
            <section className="bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-4">
                  <IconTooltip label="Payload Manifest"><Box size={24} className="text-brand-primary" /></IconTooltip> 
                  Order Items
                </h2>
                
                    <div className="space-y-4">
                       {po.items.map((item, i) => (
                           <div key={item.id} className="group relative bg-slate-100/50 dark:bg-slate-950/20 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-all hover:bg-white dark:hover:bg-slate-950 hover:border-indigo-500">
                              <div className="flex items-center gap-6">
                                    <div className="h-12 w-12 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-lg font-bold italic text-brand-primary shadow-sm group-hover:rotate-6 transition-transform">
                                        {i + 1}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase italic">{item.name}</h3>
                                        <p className="text-[10px] text-slate-400 font-semibold tracking-wide">Unit Price: ₹{item.price.toFixed(2)} / {item.unit}</p>
                                    </div>
                              </div>
                              <div className="text-right space-y-1">
                                    <p className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">x{item.qty}</p>
                                    <p className="text-md font-bold text-brand-primary">₹{(item.price * item.qty).toFixed(2)}</p>
                              </div>
                           </div>
                       ))}
                    </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex justify-between items-end">
                    <div className="space-y-4">
                        <div className="flex gap-8 items-center">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold tracking-widest text-slate-400 opacity-60 uppercase">Subtotal</p>
                                <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">₹{po.total.toFixed(2)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold tracking-widest text-brand-success uppercase">Tax Status</p>
                                <p className="text-xl font-bold italic tracking-tight text-brand-success uppercase">Eligible</p>
                            </div>
                        </div>
                    </div>
                     <div className="text-right space-y-2">
                        <p className="text-sm font-extrabold tracking-wider text-brand-primary uppercase">Grand Total</p>
                        <h3 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">₹{po.total.toFixed(2)}</h3>
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-lg space-y-4 group">
                   <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-brand-primary/10 rounded-lg border border-brand-primary/20 flex items-center justify-center text-brand-primary shadow-md group-hover:scale-110 transition-transform">
                         <IconTooltip label="Activity Delta"><FileText size={20} /></IconTooltip>
                      </div>
                      <h4 className="text-lg font-bold tracking-tight uppercase italic">Activity Logs</h4>
                   </div>
                   <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase leading-relaxed">
                      Access full procurement audit trails, manifests, and shipping signatures.
                   </p>
                   <button className="h-10 w-full bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-bold uppercase text-[10px] tracking-widest shadow-sm">
                      Download Logs
                   </button>
                </div>
                <div className="bg-slate-950 p-6 rounded-2xl border border-brand-primary/50 shadow-lg space-y-4 relative overflow-hidden group text-white">
                   <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                   <h4 className="text-lg font-bold tracking-tight uppercase relative z-10 flex items-center gap-3 italic">
                     <IconTooltip label="Fiscal Seal"><Download size={20} /></IconTooltip> 
                     Invoice
                   </h4>
                   <p className="text-[10px] font-bold tracking-wide opacity-40 uppercase leading-relaxed relative z-10">
                      Transmit compliant tax invoice to external accounting nodes. Secure and verified.
                   </p>
                   <button className="h-10 w-full bg-white text-slate-900 rounded-xl border border-white/10 font-bold uppercase text-[10px] tracking-widest shadow-sm relative z-10">
                      Download Invoice
                   </button>
                </div>
            </div>
        </div>

        <aside className="lg:col-span-4 space-y-12">
            {/* Live Tracking */}
            <div className="bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-lg space-y-6 relative overflow-hidden group">
               <div className="absolute inset-0 bg-brand-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
               <h3 className="text-lg font-bold tracking-tight uppercase flex items-center gap-3 relative z-10">
                 <IconTooltip label="Order Progress"><TrendingUp className="text-brand-primary" /></IconTooltip> 
                 Order Tracking
               </h3>
               
               <div className="space-y-6 relative z-10">
                  <div className="flex flex-col gap-0">
                    {(po.activities && po.activities.length > 0) ? (
                        po.activities.map((step, i) => (
                            <TimelineNode 
                                key={i} 
                                step={{
                                    title: step.status,
                                    description: step.description,
                                    timestamp: new Date(step.timestamp).toLocaleString('en-IN', {
                                        month: 'short',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false
                                    }).toUpperCase(),
                                    completed: step.completed,
                                    current: i === po.activities.length - 1 && step.completed
                                }} 
                                i={i} 
                                total={po.activities.length} 
                            />
                        ))
                    ) : (
                        <TimelineNode 
                            step={{
                                title: "Order Placed",
                                description: "Order registered in system",
                                timestamp: new Date(po.placedDate).toLocaleString('en-IN', {
                                    month: 'short',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                }).toUpperCase(),
                                completed: true,
                                current: true
                            }} 
                            i={0} 
                            total={1} 
                        />
                    )}
                  </div>
               </div>
            </div>

            {/* Support Zone */}
            <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-2xl shadow-lg space-y-6">
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg animate-pulse">
                      <IconTooltip label="Critical Alert"><AlertCircle size={24} /></IconTooltip>
                   </div>
                   <div className="space-y-1 uppercase italic leading-none">
                      <h4 className="text-lg font-bold tracking-tight text-rose-600">Assistance</h4>
                      <p className="text-[10px] font-bold tracking-widest text-rose-500 opacity-60">Need help with this order?</p>
                   </div>
                </div>
                <button className="h-14 w-full bg-rose-500 text-white rounded-xl border border-rose-400 font-bold text-[10px] tracking-widest shadow-md uppercase hover:scale-[1.02] transition-transform italic">
                   Cancel Order
                </button>
            </div>
        </aside>
      </main>
    </div>
    </SecureOverlay>
  );
}
