import React, { useState } from "react";
import { PlusCircle, Search, CreditCard, Landmark, Zap, ShoppingBag, Bot, ChevronRight, ArrowLeft } from "lucide-react";
import { type PaymentProvider, type PaymentTransaction, type PaymentSupplier } from "../../types/payment.types";

interface PaymentHubProps {
  onAddProvider: () => void;
  onMakePayment: () => void;
}

const INITIAL_PROVIDERS: PaymentProvider[] = [
  { id: 'p1', type: 'ach', label: 'ACH / Bank transfer', bank: 'JPMorgan Chase', account: '4832', icon: '🏦', status: 'active' },
  { id: 'p2', type: 'vcard', label: 'Virtual card', bank: 'American Express', account: '7712', icon: '💳', status: 'active' },
];

const RECENT_TX: PaymentTransaction[] = [
  { id: '1', supplierName: 'Fresh Farms Co.', method: 'ACH', date: 'Apr 03', amount: 4200, ref: 'INV-2024-001', color: '#185fa5' },
  { id: '2', supplierName: 'Metro Meats Ltd.', method: 'Virtual Card', date: 'Apr 01', amount: 6750, ref: 'INV-2024-012', color: '#0f6e56' },
  { id: '3', supplierName: 'Coastal Seafood', method: 'Wire', date: 'Mar 29', amount: 9100, ref: 'INV-2024-015', color: '#854f0b' },
  { id: '4', supplierName: 'SpiceRoute Import', method: 'BNPL', date: 'Mar 27', amount: 2340, ref: 'INV-2024-018', color: '#993556' },
];

export default function PaymentHub({ onAddProvider, onMakePayment }: PaymentHubProps) {
  return (
    <div className="absolute inset-0 bg-slate-50 overflow-y-auto font-sans antialiased">
      <div className="max-w-[480px] mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Supplier Pay</h1>
            <p className="text-sm text-slate-500 font-medium">Restaurant payment hub</p>
          </div>
          <button 
            onClick={onAddProvider}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <PlusCircle size={16} />
            <span>Add provider</span>
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { label: "This month", value: "$24,850", color: "text-slate-900" },
            { label: "Pending", value: "$3,200", color: "text-amber-600" },
            { label: "Suppliers", value: "24", color: "text-slate-900" },
            { label: "Providers", value: "2", color: "text-slate-900" },
          ].map((m) => (
            <div key={m.label} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{m.label}</p>
              <p className={`text-xl font-bold font-mono ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Primary CTA */}
        <button 
          onClick={onMakePayment}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[15px] font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-[0.98] mb-10"
        >
          Make a payment
        </button>

        {/* Recent Transactions */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recent Transactions</h3>
            <button className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">View All</button>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {RECENT_TX.map((tx, idx) => (
              <div 
                key={tx.id} 
                className={`flex items-center gap-4 px-5 py-4 ${idx !== RECENT_TX.length - 1 ? 'border-slate-100 border-b' : ''} hover:bg-slate-50 transition-colors cursor-pointer`}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tx.color }} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">{tx.supplierName}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{tx.method} • {tx.date}</p>
                </div>
                <p className="text-sm font-bold text-rose-600">-${tx.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Active Providers */}
        <div className="mb-10">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">Active Providers</h3>
          {INITIAL_PROVIDERS.map((p) => (
            <div key={p.id} className="flex items-center gap-4 px-5 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm mb-3 hover:border-slate-400 transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl group-hover:bg-slate-200 transition-colors">
                {p.type === 'ach' ? <Landmark size={20} className="text-slate-600" /> : <CreditCard size={20} className="text-slate-600" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">{p.label}</p>
                <p className="text-[11px] text-slate-500 font-medium">{p.bank} • ••••{p.account}</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-emerald-100">
                Active
              </span>
            </div>
          ))}
          <button 
            onClick={onAddProvider}
            className="w-full py-4 bg-white border border-slate-200 border-dashed rounded-2xl text-sm font-bold text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-all active:scale-[0.99]"
          >
            + Onboard new payment provider
          </button>
        </div>

      </div>
    </div>
  );
}
