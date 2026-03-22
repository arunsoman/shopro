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
    <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-1000 font-black italic uppercase leading-none pb-24 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 border-b-8 border-slate-100 dark:border-slate-800 pb-12 font-black italic leading-none shadow-inner">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter italic uppercase leading-none shadow-text mt-4">
             Logistics <span className="text-indigo-500">Grid.X</span>
          </h1>
          <p className="text-slate-500 font-black italic text-xl tracking-wide opacity-60 leading-none flex items-center gap-4">
             <Navigation className="w-8 h-8 text-indigo-500 animate-pulse" />
             Monitor delivery status and manage dispatch trajectories nodes alpha.
          </p>
        </div>
        
        <div className="flex items-center gap-6 font-black italic uppercase tracking-[0.4em] leading-none">
          <div className="flex items-center gap-6 bg-white dark:bg-slate-950 px-8 py-5 rounded-[1.5rem] border-4 border-slate-50 dark:border-slate-800 shadow-xl shadow-inner">
             <Search size={24} className="text-slate-400" />
             <input 
               type="text" 
               placeholder="TRACK_SHIPMENT.NODE..." 
               className="bg-transparent border-none outline-none text-[11px] w-64 tracking-[0.4em] font-black italic uppercase" 
             />
          </div>
          <button className="h-20 w-20 bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] flex items-center justify-center border-4 border-slate-50 dark:border-slate-800 hover:scale-110 transition-all shadow-4xl shadow-inner">
             <Truck size={32} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Active Shipments Radar */}
        <div className="lg:col-span-8 space-y-8 font-black italic uppercase leading-none">
           <div className="flex items-center justify-between px-8 bg-slate-50/50 dark:bg-slate-950/20 py-6 rounded-[2rem] border-4 border-slate-100 dark:border-slate-800/60 shadow-text">
              <h2 className="text-3xl font-black italic text-slate-900 dark:text-white flex items-center gap-6 tracking-tight">
                 <Activity size={32} className="text-indigo-500 animate-pulse" /> Active Trajectories.X
              </h2>
              <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 tracking-[0.3em] italic opacity-60">
                 NODES_SYNCED_REALTIME.SIGN
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {isLogsLoading ? (
                 <div className="md:col-span-2 p-40 flex flex-col items-center justify-center space-y-12 opacity-40">
                    <RefreshCw className="w-20 h-20 text-indigo-500 animate-spin" />
                    <p className="text-[12px] tracking-[0.6em] font-black italic">SCANNING_GPS_NODES.X...</p>
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
                            <Truck size={40} className="text-indigo-600 shadow-text transform -scale-x-100" />
                         </motion.div>
                         <MapPin className="absolute right-0 text-emerald-500 animate-bounce" size={24} />
                      </div>

                      <div className="grid grid-cols-2 gap-8 bg-slate-50/50 dark:bg-slate-950/30 p-6 rounded-[1.5rem] border-4 border-slate-100 dark:border-slate-800 shadow-inner">
                         <div className="space-y-2">
                            <p className="text-[8px] font-black text-slate-400 tracking-[0.3em] opacity-60">ETA.CORE</p>
                            <p className="text-xl font-black italic text-indigo-500 tabular-nums">{ship.eta}</p>
                         </div>
                         <div className="space-y-2">
                            <p className="text-[8px] font-black text-slate-400 tracking-[0.3em] opacity-60">VEHICLE.SIGN</p>
                            <p className="text-xs font-black italic text-slate-900 dark:text-white truncate">{ship.vehicle}</p>
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
        <div className="lg:col-span-4 space-y-8 font-black italic uppercase leading-none">
           <h2 className="text-3xl font-black italic text-slate-900 dark:text-white flex items-center gap-6 px-10 tracking-tight shadow-text">
              <Zap size={32} className="text-indigo-500" /> Fleet Hub.X
           </h2>
           <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl rounded-[4rem] border-4 border-slate-100 dark:border-slate-800 p-8 shadow-4xl shadow-inner space-y-8 overflow-hidden">
              {isVehiclesLoading ? (
                 <div className="p-20 flex flex-col items-center justify-center space-y-8 opacity-40">
                    <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin" />
                    <p className="text-[10px] tracking-[0.4em]">SYNCING_FLEET.NODE...</p>
                 </div>
              ) : vehicles.map((v: any, idx: number) => (
                <div key={idx} className="p-8 bg-slate-50/50 dark:bg-slate-950/30 rounded-[2.5rem] border-4 border-slate-100 dark:border-slate-800/60 hover:bg-white dark:hover:bg-slate-950 transition-all group/vehicle cursor-pointer">
                   <div className="flex justify-between items-start mb-6">
                      <div className="space-y-4">
                         <div className="text-[10px] font-black tracking-[0.4em] text-slate-400 opacity-60 leading-none">{v.plate}</div>
                         <div className="text-xl font-black italic tracking-tighter text-slate-900 dark:text-white group-hover/vehicle:text-indigo-500 transition-colors uppercase">{v.type}</div>
                      </div>
                      <div className={cn("w-4 h-4 rounded-full border-2 shadow-4xl", 
                        v.status === 'AVAILABLE' ? 'bg-emerald-500 border-emerald-300 shadow-emerald-500/20' : 'bg-rose-500 border-rose-300 shadow-rose-500/20 animate-pulse')} />
                   </div>
                   <div className="flex items-center justify-between text-[9px] font-black tracking-[0.3em] text-slate-400 italic opacity-60">
                      <span>STATUS:_{v.status}</span>
                      <ChevronRight size={16} className="group-hover/vehicle:translate-x-2 transition-transform" />
                   </div>
                </div>
              ))}

              <button className="w-full h-20 bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.5em] transition-all hover:shadow-4xl hover:scale-105 active:scale-95 italic border-4 border-indigo-500 shadow-xl overflow-hidden group/btn relative">
                 <div className="absolute inset-0 bg-indigo-600/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                 <span className="relative z-10">DISPATCH_NEW_VEHICLE.FORCE</span>
              </button>
           </div>
        </div>
      </div>

      {/* Compliance / Maintenance Alert */}
      <div className="p-12 bg-slate-950 rounded-[4rem] border-b-[1.5rem] border-amber-500 shadow-4xl flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden group shadow-inner">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px] pointer-events-none group-hover:scale-125 transition-transform duration-[5000ms]" />
         <div className="w-24 h-24 rounded-[2rem] bg-white/5 border-4 border-white/5 shadow-4xl flex items-center justify-center text-white shrink-0 relative z-10">
            <ShieldCheck size={48} className="text-amber-500 animate-pulse shadow-text" />
         </div>
         <div className="flex-1 text-center lg:text-left relative z-10 space-y-4">
            <h4 className="text-4xl font-black italic tracking-tighter text-white uppercase shadow-text">Compliance Shield.CORE</h4>
            <p className="text-xl text-slate-400 font-black italic opacity-80 leading-relaxed uppercase tracking-wide">
              Vehicle MH-01-AX-9021 maintenance window expires in 48 hours. Schedule synchronization with service nodes alpha.
            </p>
         </div>
         <button className="h-20 px-12 bg-white text-slate-900 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.5em] shadow-4xl transition-all hover:scale-110 active:scale-95 relative z-10 border-4 border-amber-500 italic">
            SCHEDULE_SERVICE.X
         </button>
      </div>
    </div>
    </SecureOverlay>
  );
}
