import React, { useState } from "react";
import { ArrowLeft, Check, Landmark, CreditCard, Zap, ShoppingBag, Bot, Loader2 } from "lucide-react";
import { type PaymentProviderType, type PaymentProviderDefinition, type PaymentProvider } from "../../../types/payment.types";

const PROVIDER_TYPES: PaymentProviderDefinition[] = [
  { id:'ach', label:'ACH / Bank transfer', sub:'Direct bank-to-bank, 1–3 days', icon:'🏦', fields:[
    {id:'bank',label:'Bank name',placeholder:'e.g. JPMorgan Chase'},
    {id:'routing',label:'Routing number',placeholder:'021000021'},
    {id:'account',label:'Account number',placeholder:'•••• •••• 4832'},
    {id:'nickname',label:'Nickname (optional)',placeholder:'Main checking'}
  ]},
  { id:'vcard', label:'Virtual card', sub:'Instant, earn rebates, secure', icon:'💳', fields:[
    {id:'provider',label:'Card provider',placeholder:'e.g. American Express, WEX, Corpay'},
    {id:'card_num',label:'Card number (last 4)',placeholder:'•••• •••• •••• 7712'},
    {id:'limit',label:'Monthly spend limit ($)',placeholder:'50000'}
  ]},
  { id:'wire', label:'Wire transfer', sub:'Same-day, large amounts', icon:'⚡', fields:[
    {id:'bank',label:'Bank name',placeholder:'e.g. Bank of America'},
    {id:'swift',label:'SWIFT / BIC code',placeholder:'BOFAUS3N'},
    {id:'account',label:'Account number',placeholder:'•••• •••• 9201'},
    {id:'currency',label:'Default currency',placeholder:'USD'}
  ]},
  { id:'bnpl', label:'Buy Now Pay Later', sub:'Spread payments over time', icon:'🛍️', fields:[
    {id:'provider',label:'BNPL provider',placeholder:'e.g. Credit Key, Resolve Pay'},
    {id:'limit',label:'Credit limit ($)',placeholder:'25000'},
    {id:'terms',label:'Default terms',placeholder:'e.g. Net 30, Net 60'}
  ]},
  { id:'ap', label:'AP automation platform', sub:'MarginEdge, Restaurant365, Ramp', icon:'🤖', fields:[
    {id:'platform',label:'Platform name',placeholder:'e.g. Restaurant365, MarginEdge'},
    {id:'api_key',label:'API key / token',placeholder:'••••••••••••••••'},
    {id:'entity',label:'Entity / location name',placeholder:'e.g. The Oak Kitchen - Main'}
  ]},
];

interface ProviderOnboardingProps {
  onCancel: () => void;
  onSuccess: (provider: PaymentProvider) => void;
}

export default function ProviderOnboarding({ onCancel, onSuccess }: ProviderOnboardingProps) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<PaymentProviderType | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedDef = PROVIDER_TYPES.find(pt => pt.id === selectedType);

  const handleNext = () => {
    if (step === 1 && !selectedType) return;
    if (step === 2) {
      setIsSubmitting(true);
      setTimeout(() => {
        const provider: PaymentProvider = {
          id: `p-${Date.now()}`,
          type: selectedType!,
          label: selectedDef!.label,
          bank: formData[selectedDef!.fields[0].id] || selectedDef!.label,
          account: formData[selectedDef!.fields[2]?.id]?.slice(-4) || '4832',
          icon: selectedDef!.icon,
          status: 'active'
        };
        onSuccess(provider);
      }, 1500);
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-50 font-sans antialiased overflow-y-auto">
      <div className="max-w-[480px] mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={step === 1 ? onCancel : () => setStep(step - 1)} className="p-2 border border-slate-200 rounded-xl hover:bg-white transition-all shadow-sm group">
            <ArrowLeft size={18} className="text-slate-600 group-hover:text-slate-900" />
          </button>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Add payment provider</h2>
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
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Choose provider type</h3>
            <p className="text-xs text-slate-500 font-medium mb-6">Select how you want to pay your suppliers</p>
            
            <div className="space-y-3 mb-8">
              {PROVIDER_TYPES.map((pt) => (
                <div 
                  key={pt.id}
                  onClick={() => setSelectedType(pt.id)}
                  className={`flex items-center gap-4 px-5 py-4 border rounded-2xl cursor-pointer transition-all ${
                    selectedType === pt.id 
                    ? 'border-slate-900 bg-white shadow-md scale-[1.02]' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${selectedType === pt.id ? 'bg-slate-100' : 'bg-slate-50'}`}>
                    {pt.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">{pt.label}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{pt.sub}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedType === pt.id ? 'border-slate-900' : 'border-slate-200'
                  }`}>
                    {selectedType === pt.id && <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && selectedDef && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Connect {selectedDef.label}</h3>
            <p className="text-xs text-slate-500 font-medium mb-6">Enter your account credentials</p>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 mb-8">
              {selectedDef.fields.map((f: any) => (
                <div key={f.id}>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">{f.label}</label>
                  <input 
                    type="text"
                    value={formData[f.id] || ''}
                    onChange={(e) => setFormData({ ...formData, [f.id]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <button 
          onClick={handleNext}
          disabled={isSubmitting || (step === 1 && !selectedType)}
          className={`w-full py-4 rounded-2xl text-[15px] font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
            isSubmitting || (step === 1 && !selectedType)
            ? 'bg-slate-100 text-slate-400'
            : 'bg-slate-900 text-white shadow-slate-900/10 hover:bg-slate-800'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span>Connecting...</span>
            </>
          ) : (
            <span>{step === 2 ? 'Connect provider' : 'Continue'}</span>
          )}
        </button>

      </div>
    </div>
  );
}
