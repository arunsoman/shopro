"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Plus, 
  Package, 
  Filter, 
  Download, 
  ExternalLink, 
  MoreVertical,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertCircle,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Settings2,
  RefreshCw,
  Database
} from "lucide-react";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * OP-29 — Order Operations
 * Purpose: Global marketplace transaction oversight and fulfillment auditing.
 */

interface MarketplaceOrder {
  id: string;
  referenceNumber: string;
  restaurantName: string;
  totalAmount: number;
  status: string;
  deliveryDate: string;
}

export default function OrderOperations() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: orders = [], isLoading } = useQuery<MarketplaceOrder[]>({
    queryKey: ["operator-orders"],
    queryFn: async () => {
      const resp = await api.get("operator/orders");
      return resp.data;
    }
  });

  const filteredOrders = useMemo(() => {
    return orders.filter(order => 
      order.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.restaurantName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [orders, searchQuery]);

  return (
    <SecureOverlay>
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-(--sp-border) mt-4">
        <div className="space-y-1">
          <h1 className="text-[28px] font-medium tracking-[-0.02em] text-(--sp-text-0)">
             Order flux
          </h1>
          <div className="flex items-center gap-2">
             <ShoppingBag className="w-4 h-4 text-emerald-500" />
             <p className="text-[13px] text-(--sp-text-2)">
                Global marketplace transaction oversight and fulfillment auditing.
             </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="h-9 px-4 rounded-[6px] bg-(--sp-bg-2) border border-(--sp-border) text-[13px] font-medium hover:bg-(--sp-bg-1)/50 transition-all flex items-center gap-2 text-(--sp-text-1)">
            <Download size={14} /> Export ledger
          </button>
          <button className="h-9 px-4 rounded-[6px] bg-emerald-500 text-white text-[13px] font-medium hover:opacity-90 transition-all shadow-sm flex items-center gap-2">
            <ShieldCheck size={16} /> Intervene node
          </button>
        </div>
      </header>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-1">
               <div className="text-[11px] font-medium text-(--sp-text-2) uppercase tracking-[0.04em]">Active volume</div>
               <div className="text-[32px] font-light text-(--sp-text-0) tracking-[-0.02em] tabular-nums">₹1.24M</div>
            </div>
            <div className="flex items-center gap-2 text-emerald-500 text-[11px] font-medium uppercase tracking-[0.06em] mt-4">
               <TrendingUp size={14} /> +14.2% Growth
            </div>
         </div>
         
         {[
           { label: "Transit fleet", val: "42 Units", icon: Truck, color: "text-blue-500" },
           { label: "Pending review", val: String(orders.filter(o => o.status === 'PENDING').length), icon: Clock, color: "text-amber-500" },
           { label: "Issues flagged", val: "3 Nodes", icon: AlertCircle, color: "text-(--sp-red)" },
         ].map((stat, i) => (
           <div key={i} className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) p-5 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                 <div className="w-8 h-8 rounded-sm bg-(--sp-bg-3) flex items-center justify-center text-(--sp-text-2) border border-(--sp-border)">
                    <stat.icon size={16} />
                 </div>
              </div>
              <div>
                 <div className="text-[11px] font-medium text-(--sp-text-2) uppercase tracking-[0.04em] mb-1">{stat.label}</div>
                 <div className="text-[24px] font-light text-(--sp-text-0) tracking-[-0.01em] tabular-nums line-clamp-1">{stat.val}</div>
              </div>
           </div>
         ))}
      </div>

      {/* Global Registry */}
      <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-sm overflow-hidden">
         <div className="p-6 border-b border-(--sp-border) bg-(--sp-bg-1)/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-[16px] font-medium text-(--sp-text-0)">Master registry</h3>
            
            <div className="flex items-center gap-3 bg-(--sp-bg-0) px-3 py-1.5 rounded-sm border border-(--sp-border) w-full md:w-64 focus-within:border-emerald-500/30 transition-all">
               <Search size={14} className="text-(--sp-text-2)" />
               <input 
                 type="text" 
                 placeholder="Search registry..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="bg-transparent border-none outline-none text-[13px] w-full text-(--sp-text-0) placeholder:text-(--sp-text-3)" 
               />
            </div>
         </div>

         <div className="overflow-x-auto min-h-[400px]">
            {isLoading ? (
                <div className="py-24 text-center flex flex-col items-center justify-center space-y-4 opacity-70">
                    <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                    <p className="text-[13px] text-(--sp-text-2) font-medium">Deciphering marketplace flux...</p>
                </div>
            ) : (
              <table className="w-full">
                  <thead>
                      <tr className="border-b border-(--sp-border) bg-(--sp-bg-1)/30">
                        <th className="text-left py-4 px-6 text-[11px] font-medium text-(--sp-text-2) uppercase tracking-[0.04em]">PO Reference</th>
                        <th className="text-left py-4 px-6 text-[11px] font-medium text-(--sp-text-2) uppercase tracking-[0.04em]">Stakeholders</th>
                        <th className="text-left py-4 px-6 text-[11px] font-medium text-(--sp-text-2) uppercase tracking-[0.04em]">Gross Value</th>
                        <th className="text-left py-4 px-6 text-[11px] font-medium text-(--sp-text-2) uppercase tracking-[0.04em]">Lifecycle</th>
                        <th className="text-right py-4 px-6 text-[11px] font-medium text-(--sp-text-2) uppercase tracking-[0.04em]">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-(--sp-border)">
                      {filteredOrders.map(order => (
                      <tr key={order.id} className="group/row hover:bg-(--sp-bg-1)/50 transition-all">
                          <td className="py-5 px-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-sm bg-(--sp-bg-3) text-(--sp-text-1) flex items-center justify-center font-medium text-[13px] border border-(--sp-border) group-hover/row:border-emerald-500/30 transition-all">
                                    {order.referenceNumber.slice(-3).toUpperCase()}
                                </div>
                                <div className="space-y-0.5">
                                    <div className="text-[14px] font-medium text-(--sp-text-0) group-hover/row:text-emerald-500 transition-colors">{order.referenceNumber}</div>
                                    <div className="text-[11px] text-(--sp-text-2) uppercase tracking-[0.04em]">{order.deliveryDate}</div>
                                </div>
                              </div>
                          </td>
                          <td className="py-5 px-6">
                              <div className="space-y-0.5">
                                <div className="text-[14px] font-medium text-(--sp-text-1) flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    {order.restaurantName}
                                </div>
                                <div className="text-[11px] text-(--sp-text-3) uppercase tracking-[0.04em] flex items-center gap-2">
                                    <Database size={10} /> Marketplace route
                                </div>
                              </div>
                          </td>
                          <td className="py-5 px-6 text-[16px] font-medium text-(--sp-text-0) tabular-nums">₹{order.totalAmount.toLocaleString()}</td>
                          <td className="py-5 px-6">
                              <div className={cn(
                                  "inline-flex px-2 py-0.5 rounded-[4px] text-[10px] font-medium uppercase tracking-[0.06em] border",
                                  order.status === 'FULLY_FULFILLED' ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" : 
                                  order.status === 'PROCESSING' || order.status === 'PENDING' ? "bg-(--sp-red)/5 text-(--sp-red) border-(--sp-red)/20" :
                                  "bg-(--sp-bg-3) text-(--sp-text-2) border-(--sp-border)"
                              )}>
                                  {order.status}
                              </div>
                          </td>
                          <td className="py-5 px-6">
                              <div className="flex justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                <button className="w-8 h-8 rounded-[6px] bg-(--sp-bg-2) border border-(--sp-border) text-(--sp-text-2) hover:text-(--sp-text-0) transition-all flex items-center justify-center">
                                   <ExternalLink size={14} />
                                </button>
                                <button className="w-8 h-8 rounded-[6px] bg-emerald-500 text-white transition-all shadow-sm flex items-center justify-center">
                                   <Settings2 size={14} />
                                </button>
                              </div>
                          </td>
                      </tr>
                      ))}
                  </tbody>
              </table>
            )}
         </div>

         <div className="p-6 border-t border-(--sp-border) bg-(--sp-bg-1)/30 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-[11px] text-(--sp-text-2) font-medium tracking-[0.04em] uppercase">Showing {filteredOrders.length} of {orders.length} entries</div>
            <div className="flex items-center gap-2">
               <button className="w-8 h-8 rounded-[4px] border border-(--sp-border) text-(--sp-text-2) hover:text-(--sp-text-0) transition-all flex items-center justify-center bg-(--sp-bg-2)"><ChevronLeft size={16} /></button>
               <div className="flex items-center gap-2">
                  {[1].map(p => (
                    <button key={p} className={cn("w-8 h-8 rounded-[4px] text-[11px] font-medium transition-all border", p === 1 ? "bg-emerald-500 text-white border-emerald-500 shadow-sm" : "text-(--sp-text-2) hover:text-(--sp-text-0) border-(--sp-border) bg-(--sp-bg-2)")}>{p}</button>
                  ))}
               </div>
               <button className="w-8 h-8 rounded-[4px] border border-(--sp-border) text-(--sp-text-2) hover:text-(--sp-text-0) transition-all flex items-center justify-center bg-(--sp-bg-2)"><ChevronRight size={16} /></button>
            </div>
         </div>
      </div>
      </div>
    </SecureOverlay>
  );
}
