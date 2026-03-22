"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api";
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Upload,
  FileCheck,
  MoreVertical,
  XCircle,
  ArrowRight,
  Search,
  Filter,
  RefreshCw,
  Box,
  Layers,
  ChevronRight
} from "lucide-react";
import { SecureOverlay } from "@/components/SecureOverlay";

/**
 * S-06 — Order Fulfillment
 * Purpose: Manage outgoing shipments and track delivery status for suppliers.
 */

interface SupplierOrderItem {
  id: string;
  product: string;
  quantity: number;
  price: number;
}

interface SubOrder {
  id: string;
  buyer: string;
  date: string;
  amount: number;
  status: string;
  items: SupplierOrderItem[];
}

export default function OrderFulfillment() {
  const queryClient = useQueryClient();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPartialModal, setShowPartialModal] = useState(false);

  const { data: orders = [], isLoading } = useQuery<SubOrder[]>({
    queryKey: ["supplier-orders"],
    queryFn: async () => {
      const resp = await api.get("/api/supplier/orders");
      return resp.data;
    }
  });

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await api.patch(`/api/supplier/orders/${id}/status?status=${status}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-orders"] });
    }
  });

  const handleFileUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      if (selectedOrderId) {
        statusMutation.mutate({ id: selectedOrderId, status: 'SHIPPED' });
      }
    }, 2000);
  };

  const currentStatusIndex = (status: string) => {
    switch(status) {
      case 'PENDING_ACK': return 0;
      case 'PREPARING': return 1;
      case 'SHIPPED': return 2;
      case 'DELIVERED': return 3;
      default: return 0;
    }
  };

  return (
    <SecureOverlay>
    <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-1000 font-black italic uppercase leading-none pb-24 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 border-b-8 border-slate-100 dark:border-slate-800 pb-12 font-black italic leading-none shadow-inner">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter italic uppercase leading-none shadow-text mt-4">
             Fulfillment <span className="text-indigo-500">Node.X</span>
          </h1>
          <p className="text-slate-500 font-black italic text-xl tracking-wide opacity-60 leading-none flex items-center gap-4">
             <Truck className="w-8 h-8 text-indigo-500 animate-pulse" />
             Manage outgoing shipments and track delivery status nodes alpha.
          </p>
        </div>
        
        <div className="flex items-center gap-6 font-black italic uppercase tracking-[0.4em] leading-none">
          <div className="flex items-center gap-6 bg-white dark:bg-slate-950 px-8 py-5 rounded-[1.5rem] border-4 border-slate-50 dark:border-slate-800 shadow-xl shadow-inner">
             <Search size={24} className="text-slate-400" />
             <input 
               type="text" 
               placeholder="SEARCH_ORDERS.X..." 
               className="bg-transparent border-none outline-none text-[11px] w-64 tracking-[0.4em] font-black italic uppercase" 
             />
          </div>
          <button className="h-20 w-20 bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] flex items-center justify-center border-4 border-slate-50 dark:border-slate-800 hover:scale-110 transition-all shadow-4xl shadow-inner">
             <Filter size={32} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 h-[800px]">
        {/* Order List */}
        <div className="lg:col-span-4 space-y-8 overflow-y-auto pr-4 custom-scrollbar font-black italic uppercase leading-none">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center space-y-8 opacity-40">
                <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin" />
                <p className="text-[10px] tracking-[0.4em]">SYNCING_ORDERS.NODE...</p>
            </div>
          ) : orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setSelectedOrderId(order.id)}
              className={cn(
                "p-8 rounded-[2.5rem] border-4 cursor-pointer transition-all hover:shadow-4xl h-[180px] flex flex-col justify-between group shadow-inner relative overflow-hidden",
                selectedOrderId === order.id 
                  ? "border-indigo-500 bg-white dark:bg-slate-950 shadow-indigo-500/10" 
                  : "border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50"
              )}
            >
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-black italic tracking-tight shadow-text text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors uppercase">{order.id}</span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 text-[9px] uppercase font-black rounded-lg border-2 border-slate-200 dark:border-slate-700 italic">NORMAL.FLUX</span>
                  </div>
                  <p className="text-[11px] font-black text-slate-400 tracking-[0.2em] italic opacity-60 truncate max-w-[200px]">{order.buyer}</p>
                </div>
                <div className={cn(
                  "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border-2 italic",
                  order.status === 'PENDING_ACK' ? "bg-amber-500 border-amber-300 text-white shadow-amber-500/20" :
                  order.status === 'PREPARING' ? "bg-indigo-600 border-indigo-400 text-white shadow-indigo-500/20" :
                  "bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/20"
                )}>
                  {order.status.replace('_', ' ')}
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] font-black italic tracking-[0.3em] opacity-60 relative z-10 pt-4 border-t-4 border-slate-50 dark:border-slate-800/60">
                <div className="flex items-center gap-3">
                  <Box size={16} className="text-indigo-500" />
                  <span>{order.items.length}_ITEMS.X</span>
                </div>
                <span className="text-slate-900 dark:text-white shadow-text">₹{order.amount.toLocaleString()}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Fulfillment Workspace */}
        <div className="lg:col-span-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl rounded-[4rem] border-4 border-slate-100 dark:border-slate-800 shadow-4xl shadow-inner overflow-hidden flex flex-col font-black italic uppercase italic leading-none relative">
          {selectedOrder ? (
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedOrder.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex-1 flex flex-col p-12"
              >
                <div className="flex justify-between items-start mb-12">
                  <div className="space-y-4">
                    <h2 className="text-5xl font-black italic tracking-tighter shadow-text text-slate-900 dark:text-white uppercase leading-none">{selectedOrder.id}</h2>
                    <p className="text-xl text-slate-400 font-black italic tracking-wide flex items-center gap-6 opacity-60">
                      <Clock size={24} className="text-indigo-500" /> RECEIVED_ON_{selectedOrder.date.replace(/-/g, '.')}
                    </p>
                  </div>
                  <button className="w-16 h-16 rounded-[1.25rem] bg-slate-50 dark:bg-slate-950 flex items-center justify-center border-4 border-slate-100 dark:border-slate-800 hover:scale-110 transition-all shadow-xl">
                    <MoreVertical size={32} className="text-slate-400 shadow-text" />
                  </button>
                </div>

                {/* Timeline Visualizer */}
                <div className="relative flex justify-between mb-20 px-12">
                  <div className="absolute top-1/2 left-0 w-full h-2 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 rounded-full border-2 border-slate-200 dark:border-slate-700 shadow-inner" />
                  <div 
                    className="absolute top-1/2 left-0 h-2 bg-indigo-600 -translate-y-1/2 transition-all duration-1000 rounded-full border-2 border-indigo-400 shadow-4xl shadow-indigo-500/30" 
                    style={{ width: `${(currentStatusIndex(selectedOrder.status) / 3) * 100}%` }}
                  />
                  
                  {['ACKNOWLEDGE.SIGN', 'PREPARE.NODE', 'DISPATCH.FORCE', 'DELIVER.CORE'].map((step, idx) => {
                    const isActive = idx <= currentStatusIndex(selectedOrder.status);
                    
                    return (
                      <div key={step} className="relative z-10 flex flex-col items-center gap-6">
                        <div className={cn(
                          "h-16 w-16 rounded-[1.25rem] flex items-center justify-center border-4 transition-all duration-500 shadow-4xl",
                          isActive 
                            ? "bg-indigo-600 border-indigo-400 text-white shadow-indigo-500/30 scale-110" 
                            : "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-400"
                        )}>
                          {isActive ? <CheckCircle2 size={32} /> : <span className="text-lg font-black">{idx + 1}</span>}
                        </div>
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-[0.3em] italic leading-none whitespace-nowrap",
                          isActive ? "text-indigo-500 shadow-text" : "text-slate-400 opacity-60"
                        )}>{step}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Action Content */}
                <div className="flex-1 bg-slate-50/50 dark:bg-slate-950/20 rounded-[3rem] border-4 border-slate-100 dark:border-slate-800/60 p-12 flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden group/actions">
                  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] pointer-events-none group-hover/actions:scale-125 transition-transform duration-[4000ms]" />

                  {selectedOrder.status === 'PENDING_ACK' && (
                    <div className="max-w-2xl space-y-10 relative z-10">
                      <div className="h-24 w-24 bg-amber-500/10 rounded-[2rem] border-4 border-amber-500/20 flex items-center justify-center mx-auto shadow-4xl group-hover/actions:scale-110 transition-transform">
                        <AlertCircle className="text-amber-500 h-12 w-12 animate-pulse shadow-text" />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase shadow-text">New Order Detected.X</h3>
                        <p className="text-xl text-slate-400 font-black italic opacity-80 leading-relaxed uppercase tracking-wide">
                          Acknowledge this order to begin the preparation process. Once acknowledged, the restaurant node will be notified for synchronization alpha.
                        </p>
                      </div>
                      <div className="flex gap-8">
                        <button 
                          onClick={() => statusMutation.mutate({ id: selectedOrder.id, status: 'PREPARING' })}
                          className="h-20 flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-10 rounded-[1.5rem] transition-all shadow-4xl border-4 border-indigo-400 italic flex items-center justify-center gap-6 hover:scale-110 active:scale-95 text-xs uppercase tracking-[0.4em]"
                        >
                          ACKNOWLEDGE_ORDER.X <ArrowRight size={24} className="animate-bounce-x" />
                        </button>
                        <button 
                          onClick={() => setShowPartialModal(true)}
                          className="h-20 px-10 border-4 border-slate-100 dark:border-slate-800 text-slate-400 font-black rounded-[1.5rem] hover:bg-white dark:hover:bg-slate-950 transition-all flex items-center gap-4 italic text-xs uppercase tracking-[0.4em] hover:text-rose-500 hover:border-rose-500 group"
                        >
                          <XCircle size={24} className="group-hover:rotate-90 transition-transform" /> PARTIAL.FLUX
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedOrder.status === 'PREPARING' && (
                    <div className="max-w-2xl space-y-10 relative z-10">
                      <div className="h-24 w-24 bg-indigo-600/10 rounded-[2rem] border-4 border-indigo-600/20 flex items-center justify-center mx-auto shadow-4xl group-hover/actions:scale-110 transition-transform">
                        <Package className="text-indigo-500 h-12 w-12 animate-bounce shadow-text" />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase shadow-text">Preparation Phase.NODE</h3>
                        <p className="text-xl text-slate-400 font-black italic opacity-80 leading-relaxed uppercase tracking-wide">
                          Please upload a proof of delivery or manifest (NODE_MANIFEST.JSON) to mark this order as dispatched to the fulfillment network alpha.
                        </p>
                      </div>
                      <div 
                        onClick={handleFileUpload}
                        className={cn(
                          "w-full border-4 border-dashed rounded-[3rem] p-12 transition-all cursor-pointer flex flex-col items-center gap-8 shadow-inner group/upload",
                          isUploading 
                            ? "border-indigo-500 bg-white dark:bg-slate-950" 
                            : "border-slate-100 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-white dark:hover:bg-slate-950"
                        )}
                      >
                        {isUploading ? (
                          <div className="flex flex-col items-center gap-8 w-full font-black italic">
                            <div className="h-4 w-64 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-inner">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2 }}
                                className="h-full bg-indigo-600 shadow-4xl shadow-indigo-500/30"
                              />
                            </div>
                            <span className="text-sm font-black tracking-[0.4em] text-indigo-500 animate-pulse uppercase">UPLOADING_MANIFEST.FLUX...</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="text-slate-200 dark:text-slate-800 h-20 w-20 group-hover/upload:text-indigo-500 transition-colors shadow-text" />
                            <div className="space-y-3">
                              <p className="text-xl font-black italic text-slate-900 dark:text-white shadow-text uppercase tracking-tight">DROP_MANIFEST.X</p>
                              <p className="text-[10px] text-slate-400 font-black tracking-[0.2em] uppercase opacity-60">Invoice, Waybill or Shipment Hub (PDF, JPG, NODE.JSON)</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedOrder.status === 'SHIPPED' && (
                    <div className="max-w-2xl space-y-10 relative z-10">
                      <div className="h-24 w-24 bg-emerald-500/10 rounded-[2rem] border-4 border-emerald-500/20 flex items-center justify-center mx-auto shadow-4xl group-hover/actions:scale-110 transition-transform">
                        <FileCheck className="text-emerald-500 h-12 w-12 shadow-text" />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase shadow-text">In Transit.SIGNAL</h3>
                        <p className="text-xl text-slate-400 font-black italic opacity-80 leading-relaxed uppercase tracking-wide">
                          The order has been dispatched to the fulfillment network. Track the shipment or communicate with the restaurant node via the secure alpha channel.
                        </p>
                      </div>
                      <button className="h-20 bg-slate-950 dark:bg-white text-white dark:text-slate-900 font-black py-4 px-12 rounded-[1.5rem] transition-all hover:scale-110 active:scale-95 shadow-4xl border-4 border-indigo-500 italic text-xs uppercase tracking-[0.5em]">
                         VIEW_DELIVERY_TELEMETRY.FORCE
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-200 space-y-12 h-full">
              <div className="p-16 bg-slate-50 dark:bg-slate-950 rounded-[3rem] border-4 border-slate-100 dark:border-slate-800 shadow-inner group hover:scale-110 transition-transform">
                <Box size={100} className="opacity-10 group-hover:opacity-100 transition-opacity text-indigo-500 shadow-text italic" />
              </div>
              <p className="text-2xl font-black italic tracking-[0.4em] uppercase opacity-20">SELECT_ORDER_NODE.X</p>
            </div>
          )}
        </div>
      </div>

      {/* Partial Fulfillment Modal */}
      <AnimatePresence>
        {showPartialModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPartialModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
              className="relative w-[600px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-[4rem] border-8 border-slate-100 dark:border-slate-800 shadow-4xl overflow-hidden mx-auto font-black italic uppercase italic leading-none"
            >
              <div className="p-12 space-y-10 shadow-inner">
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <h3 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase shadow-text">Discrepancy.X</h3>
                    <p className="text-xl text-slate-400 font-black italic opacity-60 tracking-tight">Select signals that cannot be synchronized node.</p>
                  </div>
                  <button onClick={() => setShowPartialModal(false)} className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center border-4 border-slate-100 dark:border-slate-800 hover:text-rose-500 transition-all shadow-xl">
                    <XCircle size={32} />
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="p-8 bg-slate-50/50 dark:bg-slate-950/30 rounded-[2.5rem] border-4 border-slate-100 dark:border-slate-800/60 shadow-inner space-y-4">
                    <p className="text-xs font-black tracking-[0.3em] text-slate-400 italic opacity-60">REASON_FOR_PARTIAL_SIGNAL.X</p>
                    <select className="w-full bg-white dark:bg-slate-950 border-4 border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-[11px] font-black italic uppercase tracking-[0.2em] focus:ring-4 focus:ring-rose-500/20 outline-none shadow-text text-slate-900 dark:text-white">
                      <option>STOCK_SHORTAGE.FORCE</option>
                      <option>QUALITY_REJECTED.NODE</option>
                      <option>LOGISTICS_CONSTRAINED.CORE</option>
                    </select>
                  </div>
                  <div className="p-8 bg-rose-500/10 rounded-[2.5rem] border-4 border-rose-500/20 flex gap-6 items-start">
                     <AlertCircle className="text-rose-500 h-8 w-8 shrink-0 shadow-text animate-pulse" />
                     <p className="text-[11px] text-rose-600 dark:text-rose-400 font-black italic uppercase leading-relaxed tracking-wider">
                       Reporting a partial fulfillment may impact your supplier rating node. Please ensure accurate stock counts for future bids alpha.
                     </p>
                  </div>
                </div>

                <div className="flex gap-8">
                  <button 
                    onClick={() => {
                        if (selectedOrderId) statusMutation.mutate({ id: selectedOrderId, status: 'PREPARING' });
                        setShowPartialModal(false);
                    }}
                    className="h-20 flex-1 bg-rose-600 hover:bg-rose-700 text-white font-black py-4 rounded-[1.5rem] shadow-4xl border-4 border-rose-400 italic text-xs uppercase tracking-[0.4em] hover:scale-105 transition-all"
                  >
                    CONFIRM_PARTIAL_ACK.FORCE
                  </button>
                  <button 
                    onClick={() => setShowPartialModal(false)}
                    className="h-20 px-10 border-4 border-slate-100 dark:border-slate-800 text-slate-400 font-black rounded-[1.5rem] hover:bg-white dark:hover:bg-slate-950 transition-all italic text-xs uppercase tracking-[0.4em]"
                  >
                    ABORT.X
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </SecureOverlay>
  );
}
