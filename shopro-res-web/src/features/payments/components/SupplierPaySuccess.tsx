import React from "react";
import { Check, ArrowRight, Home } from "lucide-react";

interface SuccessProps {
  title: string;
  subtitle: string;
  details?: { label: string; value: string }[];
  primaryAction: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
}

export default function SupplierPaySuccess({ title, subtitle, details, primaryAction, secondaryAction }: SuccessProps) {
  return (
    <div className="absolute inset-0 bg-slate-50 font-sans antialiased overflow-y-auto animate-in fade-in duration-500">
      <div className="max-w-[480px] mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[80vh]">
        
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-8 shadow-inner shadow-emerald-200/50">
          <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
            <Check size={28} strokeWidth={3} />
          </div>
        </div>

        {/* Text */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">{title}</h2>
          <p className="text-slate-500 font-medium px-4">{subtitle}</p>
        </div>

        {/* Details Card */}
        {details && details.length > 0 && (
          <div className="w-full bg-white border border-slate-200 rounded-3xl p-8 mb-10 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Check size={120} strokeWidth={4} className="text-emerald-500" />
            </div>
            <div className="space-y-4 relative z-10">
              {details.map((d, idx) => (
                <div key={idx} className="flex items-center justify-between py-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{d.label}</span>
                  <span className="text-sm font-bold text-slate-900">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="w-full space-y-3">
          <button 
            onClick={primaryAction.onClick}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[15px] font-bold shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {primaryAction.label}
            <ArrowRight size={18} />
          </button>
          
          {secondaryAction && (
            <button 
              onClick={secondaryAction.onClick}
              className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Home size={18} />
              {secondaryAction.label}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
