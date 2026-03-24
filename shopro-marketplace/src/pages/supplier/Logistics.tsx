"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { 
  Truck, 
  MapPin, 
  Navigation, 
  Clock, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Search, 
  Filter, 
  RefreshCw,
  Target,
  Box,
  ChevronRight,
  ArrowUpRight,
  User
} from "lucide-react";
import { SecureOverlay } from "@/components/SecureOverlay";
import { StatusBadge } from "@/components/ui/status-badge";

/**
 * S-07 — Logistics & Dispatch
 * Purpose: Monitor delivery status and manage dispatch schedules for suppliers.
 */

interface DeliveryTracking {
  id: string;
  orderId: string;
  vehicle: string;
  driver: string;
  status: string;
  eta: string;
}

export default function Logistics() {
  const { data: activeDeliveries = [], isLoading: isLogsLoading } = useQuery<DeliveryTracking[]>({
    queryKey: ["supplier-logistics-active"],
    queryFn: async () => {
      const resp = await api.get("/api/supplier/logistics/active");
      return resp.data;
    }
  });

  const { data: vehicles = [], isLoading: isVehiclesLoading } = useQuery({
    queryKey: ["supplier-vehicles"],
    queryFn: async () => {
      const resp = await api.get("/api/supplier/logistics/vehicles");
      return resp.data;
    }
  });

  return (
    <SecureOverlay>
    <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-1000 pb-24 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 border-b border-slate-100 dark:border-slate-800 pb-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
             Deliveries & <span className="text-indigo-500">Fleet</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg tracking-wide leading-relaxed flex items-center gap-3">
             <Navigation className="w-6 h-6 text-indigo-500" />
             Track active shipments, manage your fleet, and monitor fulfillment performance.
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
             <Search size={20} className="text-slate-400" />
             <input 
               type="text" 
               placeholder="Search by Order ID or Plate..." 
               className="bg-transparent border-none outline-none text-sm w-64 font-medium text-slate-900 dark:text-white placeholder:text-slate-400" 
             />
          </div>
          <button className="h-14 w-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl flex items-center justify-center hover:scale-105 transition-all shadow-lg active:scale-95">
             <Truck size={24} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Active Shipments Radar */}
        <div className="lg:col-span-8 space-y-8">
           <div className="flex items-center justify-between px-8 bg-slate-50 dark:bg-slate-900/50 py-6 rounded-3xl border border-slate-200 dark:border-slate-800">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-4">
                 <Activity size={24} className="text-indigo-500" /> Active Shipments
              </h2>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 tracking-wider uppercase opacity-60">
                 Real-time Tracking Active
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {isLogsLoading ? (
                 <div className="md:col-span-2 p-40 flex flex-col items-center justify-center space-y-8 opacity-40">
                    <RefreshCw className="w-16 h-16 text-indigo-500 animate-spin" />
                    <p className="text-sm font-bold tracking-widest uppercase">Locating shipments...</p>
                 </div>
              ) : activeDeliveries.map((ship, i) => (
                <motion.div
                  key={ship.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl rounded-[3rem] p-10 border-4 border-slate-100 dark:border-slate-800 hover:border-indigo-500 transition-all shadow-4xl group relative overflow-hidden shadow-inner flex flex-col justify-between h-[400px]"
                >
                   <div className="flex justify-between items-start relative z-10">
                      <div className="space-y-3">
                         <div className="text-[10px] font-black tracking-[0.4em] text-slate-400 opacity-60 leading-none">{ship.id}</div>
                         <div className="text-2xl font-black italic tracking-tighter shadow-text text-slate-900 dark:text-white uppercase leading-none">{ship.orderId}</div>
                      </div>
                      <StatusBadge status={ship.status === 'ON_ROUTE' ? 'captured' : 'PENDING'} label={ship.status} />
                   </div>

                   <div className="space-y-8 relative z-10">
                      <div className="flex items-center justify-center h-24 relative">
                         <div className="absolute inset-x-0 h-1 bg-slate-100 dark:bg-slate-800 rounded-full" />
                         <motion.div 
                           className="absolute inset-y-0 left-0 flex items-center"
                           animate={{ x: ship.status === 'ON_ROUTE' ? "60%" : "20%" }}
                           transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                         >
                            <Truck size={32} className="text-indigo-600 drop-shadow-sm transform -scale-x-100" />
                         </motion.div>
                         <MapPin className="absolute right-0 text-emerald-500 animate-bounce" size={20} />
                      </div>

                      <div className="grid grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-950/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                         <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase opacity-80">Estimated Arrival</p>
                            <p className="text-xl font-bold text-indigo-500 tabular-nums">{ship.eta}</p>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase opacity-80">Vehicle</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{ship.vehicle}</p>
                         </div>
                      </div>
                   </div>

                   <div className="pt-6 border-t-4 border-slate-50 dark:border-slate-800/60 flex items-center justify-between relative z-10 font-black italic">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                            <User size={20} />
                         </div>
                         <div className="text-[10px] font-black tracking-widest text-slate-400 italic opacity-60">{ship.driver}</div>
                      </div>
                      <ArrowUpRight size={24} className="text-slate-200 dark:text-slate-800 group-hover:text-indigo-500 transition-colors" />
                   </div>
                </motion.div>
              ))}
           </div>
        </div>

        {/* Fleet Inventory */}
        <div className="lg:col-span-4 space-y-8">
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-4 px-6">
              <Zap size={24} className="text-indigo-500" /> Fleet Management
           </h2>
           <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl rounded-[4rem] border-4 border-slate-100 dark:border-slate-800 p-8 shadow-4xl shadow-inner space-y-8 overflow-hidden">
              {isVehiclesLoading ? (
                 <div className="p-20 flex flex-col items-center justify-center space-y-8 opacity-40">
                    <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin" />
                    <p className="text-[10px] tracking-[0.4em]">SYNCING_FLEET.NODE...</p>
                 </div>
              ) : vehicles.map((v: any, idx: number) => (
                <div key={idx} className="p-6 bg-slate-50 dark:bg-slate-950/30 rounded-3xl border border-slate-100 dark:border-slate-800/60 hover:bg-white dark:hover:bg-slate-900 transition-all group/vehicle cursor-pointer shadow-sm">
                   <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                         <div className="text-[10px] font-bold tracking-wider text-slate-400 opacity-60 uppercase">{v.plate}</div>
                         <div className="text-lg font-bold text-slate-900 dark:text-white group-hover/vehicle:text-indigo-500 transition-colors uppercase">{v.type}</div>
                      </div>
                      <div className={cn("w-3 h-3 rounded-full border-2", 
                        v.status === 'AVAILABLE' ? 'bg-emerald-500 border-emerald-100' : 'bg-rose-500 border-rose-100 animate-pulse')} />
                   </div>
                   <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-slate-400 uppercase opacity-60">
                      <span>Status: {v.status === 'AVAILABLE' ? 'READY' : v.status}</span>
                      <ChevronRight size={14} className="group-hover/vehicle:translate-x-1 transition-transform" />
                   </div>
                </div>
              ))}

              <button className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-98 shadow-lg">
                 Register New Vehicle
              </button>
           </div>
        </div>
      </div>

      {/* Compliance / Maintenance Alert */}
      <div className="p-10 bg-slate-900 dark:bg-slate-950 rounded-[3rem] border-b-8 border-amber-500 flex flex-col lg:flex-row items-center gap-10 shadow-xl">
         <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
            <ShieldCheck size={40} className="animate-pulse" />
         </div>
         <div className="flex-1 text-center lg:text-left space-y-2">
            <h4 className="text-3xl font-bold text-white uppercase tracking-tight">Maintenance & Compliance</h4>
            <p className="text-lg text-slate-400 font-medium leading-relaxed">
              Vehicle <span className="text-white">MH-01-AX-9021</span> maintenance window expires in 48 hours. Ensure your fleet remains compliant and safe.
            </p>
         </div>
         <button className="h-14 px-10 bg-white text-slate-900 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg border-2 border-amber-500">
            Review Schedule
         </button>
      </div>
    </div>
    </SecureOverlay>
  );
}
