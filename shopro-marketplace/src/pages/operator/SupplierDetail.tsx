"use client";

import { useState, useMemo } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Plus, Filter, FileText, ArrowLeft, CheckCircle2, AlertTriangle, ExternalLink, Mail, Phone, MapPin, Calendar, Clock, Lock, Download, MoreHorizontal, ShieldCheck, TrendingUp, BarChart3, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";

/**
 * OP-10/11 — Supplier Detail & Performance
 * Purpose: KYC review, trust scoring, and fulfillment health.
 */

export default function SupplierDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [status, setStatus] = useState("UNDER_REVIEW");
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [docs, setDocs] = useState([
    { id: "doc-1", name: "GST Certificate", size: "1.2 MB", date: "Mar 15, 2024", verified: true },
    { id: "doc-2", name: "FSSAI License", size: "2.5 MB", date: "Mar 18, 2024", verified: true },
    { id: "doc-3", name: "Bank Cancelled Cheque", size: "0.8 MB", date: "Mar 14, 2024", verified: false },
    { id: "doc-4", name: "Pan Card", size: "0.5 MB", date: "Mar 12, 2024", verified: true },
  ]);

  const toggleVerify = (docId: string) => {
    setDocs(prev => prev.map(d => d.id === docId ? { ...d, verified: !d.verified } : d));
  };

  const handleApprove = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setStatus("ACTIVE");
      setIsVerifying(false);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
        <div className="space-y-4">
          <button 
            onClick={() => navigate("/operator/suppliers")}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-violet-500 transition-colors uppercase tracking-widest"
          >
            <ArrowLeft size={14} /> Global Directory
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-2xl font-black shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
              GH
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Golden Harvest Spices</h1>
                <StatusBadge status={status as any} />
              </div>
              <p className="text-slate-500 font-medium flex items-center gap-2 text-sm">
                <MapPin size={14} /> Bangalore, Karnataka • <span className="text-slate-900 dark:text-white font-bold uppercase tracking-tighter text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">GST: 29AABCXXXX1ZJ</span>
                <span className="text-slate-300">|</span>
                <span className="text-violet-500 font-bold uppercase tracking-widest text-[10px]">ID: {id || "SUP-001"}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="h-10 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-xs flex items-center gap-2 hover:bg-slate-200 transition-all">
            <Mail size={14} /> MESSAGE VENDOR
          </button>
          <button className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Business Profile */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-8 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm space-y-8">
            <h2 className="text-xl font-bold flex items-center gap-2 uppercase tracking-tighter text-slate-900 dark:text-white">
              <ShieldCheck className="text-violet-500" size={20} /> Business Credentials
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[
                 { label: "Entity Type", value: "Private Limited", icon: FileText },
                 { label: "Date of Incorp.", value: "Oct 12, 2018", icon: Calendar },
                 { label: "Annual Turnover", value: "₹4.5 Crores", icon: CheckCircle2 },
                 { label: "Warehouse Capacity", value: "12,000 sq.ft", icon: Lock },
               ].map((item) => (
                 <div key={item.label} className="flex items-start gap-3">
                   <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400">
                     <item.icon size={16} />
                   </div>
                   <div>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.label}</p>
                     <p className="text-sm font-bold text-slate-900 dark:text-white">{item.value}</p>
                   </div>
                 </div>
               ))}
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
               <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Owner Information</h3>
               <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-500 flex items-center justify-center font-bold">KS</div>
                   <div>
                     <p className="text-sm font-bold">Karan Sharma</p>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Managing Director</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <button className="text-slate-400 hover:text-violet-500 transition-colors"><Phone size={16} /></button>
                    <button className="text-slate-400 hover:text-violet-500 transition-colors"><Mail size={16} /></button>
                 </div>
               </div>
            </div>
          </div>

          {/* Performance Micro-Health (OP-11) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {[
               { label: "Fulfillment Rate", value: "98.2%", trend: "+1.2%", color: "text-green-500", icon: CheckCircle2 },
               { label: "Avg. Lead Time", value: "4.2 Days", trend: "-0.5d", color: "text-blue-500", icon: Clock },
               { label: "Damage/Return", value: "0.4%", trend: "-0.1%", color: "text-violet-500", icon: TrendingUp },
             ].map((stat) => (
               <div key={stat.label} className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl p-6 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm">
                 <div className="flex items-center justify-between mb-4">
                   <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400">
                     <stat.icon size={18} />
                   </div>
                   <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800", stat.color)}>
                     {stat.trend}
                   </span>
                 </div>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{stat.label}</p>
                 <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</p>
                 
                 <div className="mt-4 h-8 flex items-end gap-1">
                    {[40, 70, 45, 90, 65, 80, 50, 85].map((h, i) => (
                      <div key={i} className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-sm group relative">
                        <div 
                          className={cn("absolute bottom-0 left-0 right-0 rounded-sm transition-all duration-1000", i === 7 ? "bg-violet-500" : "bg-slate-300 dark:bg-slate-600")} 
                          style={{ height: `${h}%` }} 
                        />
                      </div>
                    ))}
                 </div>
               </div>
             ))}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-tighter px-4 text-slate-900 dark:text-white flex items-center justify-between">
              KYC Documents
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{docs.filter(d => d.verified).length}/{docs.length} Verified</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {docs.map((doc) => (
                 <div key={doc.id} className={cn(
                   "p-5 bg-white dark:bg-slate-900 rounded-3xl ring-1 transition-all flex items-center justify-between group",
                   doc.verified ? "ring-slate-200 dark:ring-slate-800" : "ring-amber-500/50 bg-amber-500/5"
                 )}>
                    <div className="flex items-center gap-3">
                       <div className={cn(
                         "p-2 rounded-xl transition-colors",
                         doc.verified ? "bg-violet-50 dark:bg-violet-900/20 text-violet-500" : "bg-amber-100 dark:bg-amber-900/30 text-amber-500"
                       )}>
                         <FileText size={20} />
                       </div>
                       <div>
                         <p className="text-sm font-bold text-slate-900 dark:text-white">{doc.name}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{doc.size} • {doc.date}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                        onClick={() => toggleVerify(doc.id)}
                        className={cn(
                          "p-2 rounded-lg transition-all",
                          doc.verified ? "text-green-500 hover:bg-green-50" : "text-amber-500 hover:bg-amber-50"
                        )}
                       >
                         {doc.verified ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                       </button>
                       <button className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-900 transition-colors">
                         <Download size={16} />
                       </button>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Right Column: Decisions & Audit */}
        <div className="space-y-8">
           <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <h2 className="text-lg font-bold flex items-center gap-2 uppercase tracking-tighter mb-6 text-white/50 relative z-10">
               Vetting Action
            </h2>
            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Decision Status</p>
                <div className={cn(
                  "flex items-center gap-2 font-black text-xs",
                  status === "ACTIVE" ? "text-green-400" : "text-amber-500"
                )}>
                  {status === "ACTIVE" ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                  {status === "ACTIVE" ? "VENDOR APPROVED" : "PENDING REVIEW (SLA: 2h remaining)"}
                </div>
              </div>

              <div className="space-y-3">
                 <button 
                  disabled={status === "ACTIVE" || isVerifying}
                  onClick={handleApprove}
                  className="w-full h-12 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                 >
                   {isVerifying ? "PROCESSING..." : "APPROVE SUPPLIER"}
                 </button>
                 <button 
                  disabled={status === "ACTIVE" || isVerifying}
                  className="w-full h-12 bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all disabled:opacity-50"
                 >
                   REJECT & NOTIFY
                 </button>
                 <button 
                  disabled={status === "ACTIVE" || isVerifying}
                  className="w-full h-12 border border-white/10 text-white/60 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all disabled:opacity-50"
                 >
                   REQUEST CLARIFICATION
                 </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-8 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm">
             <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-slate-900 dark:text-white">Verification Audit</h3>
             <div className="space-y-6">
               {[
                 { type: "DOC_VERIFIED", text: "FSSAI License verified manually", time: "1h ago", user: "Arun S." },
                 { type: "DOC_UPLOAD", text: "New GST Certificate uploaded", time: "2h ago", user: "Backend System" },
                 { type: "APP_START", text: "Application submitted by vendor", time: "4h ago", user: "Golden Harvest" },
               ].map((log, i) => (
                 <div key={i} className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 group">
                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-slate-300 group-hover:bg-violet-500 transition-colors" />
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{log.text}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{log.time} • {log.user}</p>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
