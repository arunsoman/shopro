import React, { useState } from "react";
import { ArrowLeft, Check, Landmark, CreditCard, ChevronRight, Loader2, Info } from "lucide-react";
import { type PaymentProvider, type PaymentSupplier, type PaymentTransaction } from "../../../types/payment.types";

const MOCK_SELLERS: PaymentSupplier[] = [
  {id:'s1', name:'Fresh Farms Co.', contact:'Maria Chen', cat:'Produce'},
  {id:'s2', name:'Metro Meats Ltd.', contact:'David Kim', cat:'Meat & Poultry'},
  {id:'s3', name:'Coastal Seafood', contact:'Ana Torres', cat:'Seafood'},
  {id:'s4', name:'SpiceRoute Import', contact:'Raj Patel', cat:'Dry Goods'},
];

interface PaymentFlowProps {
  providers: PaymentProvider[];
  onCancel: () => void;
  onSuccess: (tx: PaymentTransaction) => void;
}

export default function PaymentFlow({ providers, onCancel, onSuccess }: PaymentFlowProps) {
  const [step, setStep] = useState(1);
  const [selectedPid, setSelectedPid] = useState<string | null>(providers[0]?.id || null);
  const [selectedSid, setSelectedSid] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [invoice, setInvoice] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProvider = providers.find(p => p.id === selectedPid);
  const selectedSupplier = MOCK_SELLERS.find(s => s.id === selectedSid);

  const handleNext = () => {
    if (step === 1 && (!selectedPid || !selectedSid)) return;
    if (step === 2 && !amount) return;
    if (step === 3) {
      setIsSubmitting(true);
      setTimeout(() => {
        const tx: PaymentTransaction = {
          id: `tx-${Date.now()}`,
          supplierName: selectedSupplier!.name,
          method: selectedProvider!.label,
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
          amount: parseFloat(amount),
          ref: invoice || 'N/A',
          color: '#1a1a1a'
        };
        onSuccess(tx);
      }, 2000);
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-50 font-sans antialiased overflow-y-auto">
      <div className="max-w-[480px] mx-auto px-6 py-8 pb-32">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={step === 1 ? onCancel : () => setStep(step - 1)} className="p-2 border border-slate-200 rounded-xl hover:bg-white transition-all shadow-sm group">
            <ArrowLeft size={18} className="text-slate-600 group-hover:text-slate-900" />
          </button>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            {step === 1 ? 'New payment' : step === 2 ? 'Payment details' : 'Review & confirm'}
          </h2>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                s < step ? 'bg-emerald-500 text-white' : 
                s === step ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 
                'bg-slate-200 text-slate-500'
              }`}>
                {s < step ? <Check size={14} strokeWidth={3} /> : s}
              </div>
              {s < 3 && <div className={`flex-1 h-0.5 rounded-full ${s < step ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div>
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Pay via</h3>
              <div className="space-y-3">
                {providers.map((p) => (
                  <div 
                    key={p.id}
                    onClick={() => setSelectedPid(p.id)}
                    className={`flex items-center gap-4 px-5 py-4 border rounded-2xl cursor-pointer transition-all ${
                      selectedPid === p.id 
                      ? 'border-slate-900 bg-white shadow-md' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${selectedPid === p.id ? 'bg-slate-100' : 'bg-slate-50'}`}>
                      {p.type === 'ach' ? <Landmark size={20} className="text-slate-600" /> : <CreditCard size={20} className="text-slate-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">{p.label}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{p.bank} • ••••{p.account}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedPid === p.id ? 'border-slate-900' : 'border-slate-200'
                    }`}>
                      {selectedPid === p.id && <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Select supplier</h3>
              <div className="space-y-3">
                {MOCK_SELLERS.map((s) => (
                  <div 
                    key={s.id}
                    onClick={() => setSelectedSid(s.id)}
                    className={`flex items-center gap-4 px-5 py-4 border rounded-2xl cursor-pointer transition-all ${
                      selectedSid === s.id 
                      ? 'border-slate-900 bg-white shadow-md' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-slate-400 ${selectedSid === s.id ? 'bg-slate-100' : 'bg-slate-50'}`}>
                      {s.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">{s.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{s.contact} • {s.cat}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedSid === s.id ? 'border-slate-900' : 'border-slate-200'
                    }`}>
                      {selectedSid === s.id && <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center py-10 mb-8 border-b border-slate-200 border-dashed">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-4">Amount to pay</p>
              <div className="relative inline-block">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 -ml-8 text-3xl font-light text-slate-300">$</span>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full text-5xl font-bold bg-transparent border-none text-slate-900 focus:outline-none focus:ring-0 text-center tracking-tighter placeholder:text-slate-100"
                />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 mb-8">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Invoice / reference number</label>
                <input 
                  type="text"
                  value={invoice}
                  onChange={(e) => setInvoice(e.target.value)}
                  placeholder="INV-2024-001"
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Payment note (optional)</label>
                <input 
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Weekly produce order"
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Payment date</label>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && selectedProvider && selectedSupplier && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mb-6">
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Amount</p>
                  <p className="text-3xl font-bold">${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <CreditCard size={24} className="text-slate-300" />
                </div>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: "Supplier", value: selectedSupplier.name },
                  { label: "Method", value: `${selectedProvider.label} (${selectedProvider.bank})` },
                  { label: "Invoice ref.", value: invoice || 'N/A' },
                  { label: "Payment date", value: date },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm py-1">
                    <span className="font-medium text-slate-400">{item.label}</span>
                    <span className="font-bold text-slate-700">{item.value}</span>
                  </div>
                ))}
                {note && (
                   <div className="flex items-center justify-between text-sm py-1 border-t border-slate-50 pt-3">
                    <span className="font-medium text-slate-400">Note</span>
                    <span className="font-bold text-slate-700 text-right">{note}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 p-4 bg-blue-50 border border-blue-100 rounded-2xl mb-8">
              <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 font-medium leading-relaxed">
                By confirming, you authorize this payment from your connected account.
              </p>
            </div>
          </div>
        )}

        {/* Global Action Button */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent pointer-events-none">
          <div className="max-w-[480px] mx-auto pointer-events-auto">
            <button 
              onClick={handleNext}
              disabled={isSubmitting || (step === 1 && (!selectedPid || !selectedSid)) || (step === 2 && !amount)}
              className={`w-full py-4 rounded-2xl text-[15px] font-bold shadow-xl transition-all flex items-center justify-center gap-2 ${
                isSubmitting || (step === 1 && (!selectedPid || !selectedSid)) || (step === 2 && !amount)
                ? 'bg-slate-100 text-slate-400 shadow-none'
                : 'bg-slate-900 text-white shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>
                    {step === 1 ? 'Continue to details' : step === 2 ? 'Review payment' : 'Confirm & send payment'}
                  </span>
                  {step < 3 && <ChevronRight size={18} />}
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
