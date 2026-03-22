"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Plus, Filter, FileText, ArrowLeft, CheckCircle2, AlertTriangle, ExternalLink, Mail, Phone, MapPin, Calendar, Clock, Lock, Download, MoreHorizontal, ShieldCheck, TrendingUp, BarChart3, History, RefreshCw, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * OP-10/11 — Supplier Detail & Performance
 * Purpose: KYC review, trust scoring, and fulfillment health.
 */

export default function SupplierDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: supplier, isLoading } = useQuery({
    queryKey: ["operator-supplier-detail", id],
    queryFn: async () => {
      const resp = await api.get(`/operator/relationships/suppliers/${id}`);
      return resp.data;
    }
  });

  if (isLoading) {
      return (
          <div className="h-screen flex flex-col items-center justify-center space-y-6">
              <RefreshCw className="w-12 h-12 text-(--sp-cyan) animate-spin" />
              <p className="text-(--sp-text-3) text-[13px] font-medium">Mapping supplier node...</p>
          </div>
      );
  }

  return (
    <SecureOverlay>
    <div className="max-w-[1280px] mx-auto space-y-8 animate-in fade-in duration-1000 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-(--sp-border) pb-8">
        <div className="space-y-4">
          <button 
            onClick={() => navigate("/operator/suppliers")}
            className="flex items-center gap-2 text-[11px] font-bold text-(--sp-text-3) hover:text-(--sp-cyan) transition-all uppercase tracking-wider"
          >
            <ArrowLeft size={14} /> Global directory matrix
          </button>
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-md bg-(--sp-bg-1) flex items-center justify-center text-(--sp-text-3) text-[24px] font-bold border border-(--sp-border)">
              {supplier?.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-4">
                <h1 className="text-[28px] font-medium tracking-tight text-(--sp-text-0)">{supplier?.name}</h1>
                <StatusBadge status="ACTIVE" />
              </div>
              <div className="flex items-center gap-3 text-[12px] text-(--sp-text-3) font-medium">
                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-(--sp-cyan)" /> {supplier?.fullAddress}</span>
                <span className="text-(--sp-border)">|</span>
                <span className="bg-(--sp-bg-1) px-2 py-0.5 rounded border border-(--sp-border) text-[11px] font-bold text-(--sp-text-2) uppercase">GST: 29AABCXXXX1ZJ</span>
                <span className="text-(--sp-border)">|</span>
                <span className="text-(--sp-cyan)/80 font-mono">ID: {id}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="h-9 px-4 rounded-md bg-(--sp-bg-1) border border-(--sp-border) text-(--sp-text-1) font-bold text-[11px] flex items-center gap-2 hover:bg-(--sp-bg-0) transition-all shadow-sm uppercase tracking-wider">
            <Mail size={16} /> Message vendor
          </button>
          <button className="w-9 h-9 rounded-md border border-(--sp-border) text-(--sp-text-3) hover:text-(--sp-cyan) transition-all flex items-center justify-center bg-(--sp-bg-1)">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Business Profile */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-(--sp-bg-2) rounded-md p-8 border border-(--sp-border) shadow-sm space-y-8">
            <h2 className="text-[18px] font-medium flex items-center gap-3 text-(--sp-text-0)">
              <ShieldCheck className="text-(--sp-cyan) w-5 h-5" /> Business credentials
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[
                 { label: "Entity Type", value: "Private Limited", icon: FileText },
                 { label: "Date of Incorporation", value: "Oct 12, 2018", icon: Calendar },
                 { label: "Annual Turnover", value: "₹4.5 Crores", icon: CheckCircle2 },
                 { label: "Warehouse Capacity", value: "12,000 SQ.FT", icon: Lock },
               ].map((item) => (
                 <div key={item.label} className="flex items-start gap-4">
                   <div className="w-10 h-10 rounded-md bg-(--sp-bg-1) flex items-center justify-center text-(--sp-text-3) border border-(--sp-border)">
                     <item.icon size={18} />
                   </div>
                   <div className="space-y-0.5">
                     <p className="text-[10px] text-(--sp-text-3) font-bold uppercase tracking-wider">{item.label}</p>
                     <p className="text-[15px] font-semibold text-(--sp-text-1)">{item.value}</p>
                   </div>
                 </div>
               ))}
            </div>

            <div className="space-y-4 pt-8 border-t border-(--sp-border)">
               <h3 className="text-[10px] font-bold uppercase tracking-wider text-(--sp-text-3)">Owner information</h3>
               <div className="p-4 rounded-md bg-(--sp-bg-1) border border-(--sp-border) flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-md bg-(--sp-cyan)/10 text-(--sp-cyan) border border-(--sp-cyan)/20 flex items-center justify-center font-bold text-[14px]">KS</div>
                   <div className="space-y-0.5">
                     <p className="text-[14px] font-semibold text-(--sp-text-0)">Karan Sharma</p>
                     <p className="text-[11px] text-(--sp-text-3) font-medium">Managing Director</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-md text-(--sp-text-3) hover:text-(--sp-cyan) transition-all border border-(--sp-border) flex items-center justify-center bg-(--sp-bg-2)"><Phone size={14} /></button>
                    <button className="w-8 h-8 rounded-md text-(--sp-text-3) hover:text-(--sp-cyan) transition-all border border-(--sp-border) flex items-center justify-center bg-(--sp-bg-2)"><Mail size={14} /></button>
                 </div>
               </div>
            </div>
          </div>

          {/* Performance Health */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {[
               { label: "Fulfillment Rate", value: supplier?.performance?.fulfillment || "98.2%", trend: "+1.2%", color: "text-emerald-500", icon: CheckCircle2 },
               { label: "Avg Lead Time", value: "4.2 Days", trend: "-0.5d", color: "text-blue-500", icon: Clock },
               { label: "Accuracy Index", value: supplier?.performance?.accuracy || "99%", trend: "+0.1%", color: "text-(--sp-cyan)", icon: TrendingUp },
             ].map((stat) => (
                <div key={stat.label} className="bg-(--sp-bg-2) rounded-md p-6 border border-(--sp-border) shadow-sm hover:border-(--sp-cyan)/30 transition-all">
                 <div className="flex items-center justify-between mb-6">
                   <div className="w-9 h-9 rounded-md bg-(--sp-bg-1) text-(--sp-text-3) border border-(--sp-border) flex items-center justify-center">
                     <stat.icon size={18} />
                   </div>
                   <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border border-(--sp-border) bg-(--sp-bg-2)", stat.color)}>
                     {stat.trend}
                   </span>
                 </div>
                 <p className="text-[11px] text-(--sp-text-3) font-bold uppercase tracking-wider">{stat.label}</p>
                 <p className="text-[24px] font-semibold text-(--sp-text-0) mt-2 tracking-tight tabular-nums">{stat.value}</p>
                 
                 <div className="mt-6 h-10 flex items-end gap-1">
                    {[40, 70, 45, 90, 65, 80, 50, 85].map((h, i) => (
                      <div key={i} className="flex-1 bg-(--sp-bg-1) rounded-sm relative h-full">
                        <div 
                          className={cn("absolute bottom-0 left-0 right-0 rounded-sm transition-all duration-1000", i === 7 ? "bg-(--sp-cyan)" : "bg-(--sp-cyan)/20")} 
                          style={{ height: `${h}%` }} 
                        />
                      </div>
                    ))}
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Right Column: Decisions & Audit */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-(--sp-cyan) rounded-md p-8 shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-all duration-500" />
            
            <h2 className="text-[11px] font-bold flex items-center gap-2 uppercase tracking-wider mb-8 text-white/60 relative z-10">
               <ShieldCheck size={16} className="text-white/80" /> Vetting action matrix
            </h2>
            <div className="space-y-8 relative z-10">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-14 h-14 rounded-md bg-white/10 border border-white/20 text-white flex items-center justify-center">
                  <Clock size={28} />
                </div>
                <div>
                   <p className="text-[14px] font-semibold text-white tracking-tight">Pending Review</p>
                   <p className="text-[11px] text-white/60 font-medium">SLA: 2H Delta • Assigned: Admin Alpha</p>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-white/10">
                 <button className="w-full h-10 bg-white text-(--sp-cyan) rounded-md font-bold text-[11px] uppercase tracking-wider hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-2">
                   Approve supplier <CheckCircle2 size={16} className="text-emerald-500" />
                 </button>
                 <button className="w-full h-10 bg-rose-500 text-white border border-rose-400/20 rounded-md font-bold text-[11px] uppercase tracking-wider hover:bg-rose-600 transition-all shadow-sm">
                   Reject partner
                 </button>
                 <button className="w-full h-10 bg-transparent border border-white/20 text-white rounded-md font-bold text-[11px] uppercase tracking-wider hover:bg-white/5 transition-all opacity-80">
                   Request clarification
                 </button>
              </div>
            </div>
          </div>

          <div className="bg-(--sp-bg-2) rounded-md p-8 border border-(--sp-border) shadow-sm">
             <h3 className="text-[11px] font-bold uppercase tracking-wider mb-6 text-(--sp-text-3) border-b border-(--sp-border) pb-4">Verification Audit Log</h3>
             <div className="space-y-6">
               {[
                 { type: "DOC_VERIFIED", text: "FSSAI License verified manually", time: "1h ago", user: "Admin Alpha" },
                 { type: "DOC_UPLOAD", text: "New GST Certificate uploaded", time: "2h ago", user: "System flux" },
                 { type: "APP_START", text: "Application submitted", time: "4h ago", user: "Vendor Unit 1" },
               ].map((log, i) => (
                 <div key={i} className="relative pl-6 border-l border-(--sp-border) group">
                    <div className="absolute -left-[4.5px] top-0 w-2 h-2 rounded-full bg-(--sp-border) group-hover:bg-(--sp-cyan) transition-all border-2 border-(--sp-bg-2)" />
                    <p className="text-[13px] font-medium text-(--sp-text-1) leading-tight">{log.text}</p>
                    <p className="text-[10px] text-(--sp-text-3) mt-1 uppercase tracking-wider font-bold">{log.time} • {log.user}</p>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
    </SecureOverlay>
  );
}
