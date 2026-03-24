import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  FileText, 
  CreditCard, 
  CheckCircle2, 
  Upload,
  ArrowRight,
  ArrowLeft,
  Search,
  Plus,
  X,
  Globe
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { AuroraBackground } from '../../components/ui/aurora-background';
import { ShoproInput } from '../../components/ui/shopro-input';
import { GlowingBorder, NeonEdges } from '../../components/ui/neon-button';
import { IconTooltip } from '@/components/shared/IconTooltip';

// --- DNA PRIMITIVES ---
const SPRING = { type: 'spring', stiffness: 300, damping: 30 } as const;
const EASE_OUT_CSS = [0, 0, 0.2, 1] as const;

// --- SHARED COMPONENTS ---
// ... (omitting local GlowingBorder and NeonEdges as they are now imported)

interface WizardStep {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
}

function Wizard({ steps, currentStep, onStepChange, onComplete }: { 
  steps: WizardStep[]; 
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete: () => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      {/* Step Indicators */}
      <div className="flex items-center justify-between px-4">
        {steps.map((step, i) => {
          const isActive = i === currentStep;
          const isDone = i < currentStep;
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-2">
                <div className={cn(
                  "relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500",
                  isActive ? "bg-primary dark:bg-white text-white dark:text-slate-900 ring-4 ring-brand/20" : 
                  isDone ? "bg-green-500 text-white" : "bg-muted text-secondary"
                )}>
                  {isActive && (
                    <motion.div 
                      layoutId="step-glow"
                      className="absolute -inset-1 rounded-full border border-brand/50"
                      initial={false}
                      transition={SPRING}
                    />
                  )}
                  {isDone ? (
                    <IconTooltip label="Completed">
                      <CheckCircle2 className="w-5 h-5" />
                    </IconTooltip>
                  ) : i + 1}
                </div>
                <span className={cn(
                  "text-2xs font-medium hidden md:block",
                  isActive ? "text-primary" : "text-secondary"
                )}>
                  {step.title}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={cn(
                  "flex-1 h-px mt-5 transition-colors duration-500",
                  isDone ? "bg-green-500" : "bg-border"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: EASE_OUT_CSS }}
          className="min-h-[400px] bg-card/80 backdrop-blur-xl rounded-xl border border-border p-8 shadow-sm relative group overflow-hidden"
        >
          <GlowingBorder />
          <div className="mb-6">
            <h2 className="text-lg font-bold text-primary">{steps[currentStep].title}</h2>
            {steps[currentStep].description && (
              <p className="text-sm text-secondary mt-1">{steps[currentStep].description}</p>
            )}
          </div>
          {steps[currentStep].content}
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onStepChange(currentStep - 1)}
          disabled={currentStep === 0}
          className={cn(
            "group relative px-6 py-2.5 rounded-lg text-2xs font-semibold transition-all",
            "border border-border bg-card",
            "hover:bg-muted text-secondary",
            "disabled:opacity-0 disabled:pointer-events-none"
          )}
        >
          <NeonEdges />
          <span className="flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Previous</span>
        </button>

        <button
          onClick={() => currentStep === steps.length - 1 ? onComplete() : onStepChange(currentStep + 1)}
          className={cn(
            "group relative px-8 py-2.5 rounded-lg text-2xs font-bold transition-all",
            "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20"
          )}
        >
          <NeonEdges color="violet" />
          <span className="flex items-center gap-2">
            {currentStep === steps.length - 1 ? 'Submit Application' : 'Continue'}
            <ArrowRight className="w-4 h-4" />
          </span>
        </button>
      </div>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---

export default function SupplierRegistration() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(() => {
    const saved = sessionStorage.getItem('supplier_onboarding_draft');
    return saved ? JSON.parse(saved) : {
      businessName: '',
      tradeName: '',
      taxId: '',
      registrationNumber: '',
      address: '',
      city: '',
      country: '',
      categories: [],
      documents: [],
      bankName: '',
      accountNumber: '',
      iban: '',
      swift: '',
      currency: 'USD'
    };
  });

  useEffect(() => {
    sessionStorage.setItem('supplier_onboarding_draft', JSON.stringify(formData));
  }, [formData]);

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const steps: WizardStep[] = [
    {
      id: 'business',
      title: 'Business Information',
      description: 'Enter your legal business details and registration info.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ShoproInput 
            label="Legal Business Name"
            value={formData.businessName}
            onChange={e => updateField('businessName', e.target.value)}
            placeholder="e.g. Acme Corp Ltd."
            required
          />
          <ShoproInput 
            label="Trade Name / Brand"
            value={formData.tradeName}
            onChange={e => updateField('tradeName', e.target.value)}
            placeholder="e.g. Acme Fresh"
            required
          />
          <ShoproInput 
            label="VAT / Tax ID"
            value={formData.taxId}
            onChange={e => updateField('taxId', e.target.value)}
            placeholder="Tax Identification Number"
            required
          />
          <div className="space-y-2">
            <label className="text-2xs font-bold uppercase tracking-wider text-secondary">Primary Industry</label>
            <div className="group relative">
              <GlowingBorder spread={20} borderWidth={1} />
              <NeonEdges />
              <select 
                className="w-full h-12 bg-white dark:bg-slate-900/50 border border-border rounded-lg px-4 py-3 text-sm text-primary focus:ring-2 focus:ring-brand outline-none transition-all appearance-none relative z-10"
              >
                <option>Food & Beverage</option>
                <option>Packaging</option>
                <option>Equipment</option>
                <option>Services</option>
              </select>
            </div>
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-2xs font-bold uppercase tracking-wider text-secondary">Registered Address</label>
            <div className="group relative">
              <GlowingBorder spread={20} borderWidth={1} />
              <NeonEdges />
              <textarea 
                value={formData.address}
                onChange={e => updateField('address', e.target.value)}
                className="w-full bg-white dark:bg-slate-900/50 border border-border rounded-lg px-4 py-3 text-sm text-primary focus:ring-2 focus:ring-brand outline-none transition-all resize-none h-24 relative z-10"
                placeholder="Building, Street, Landmark..."
                required
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'categories',
      title: 'Categories & Products',
      description: 'Select the categories you supply to help Shopro categorize your products.',
      content: (
        <div className="space-y-6">
          <div className="p-6 bg-violet-50 dark:bg-violet-900/10 rounded-xl border border-violet-100 dark:border-violet-900/30 flex items-start gap-4">
            <div className="p-2 bg-violet-600 text-white rounded-lg">
              <IconTooltip label="Marketplace Visibility">
                <Globe className="w-5 h-5" />
              </IconTooltip>
            </div>
            <div>
              <h4 className="text-sm font-bold text-violet-900 dark:text-violet-100">Marketplace Visibility</h4>
              <p className="text-2xs text-violet-700 dark:text-violet-400 mt-1">Selecting accurate categories ensures your products are available for relevant Shopro fulfillments.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <label className="text-2xs font-bold uppercase tracking-wider text-secondary">Product Categories</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center text-slate-400 z-20 pointer-events-none"><Search className="w-4 h-4" /></div>
              <ShoproInput 
                placeholder="Search categories (e.g. Organic Vegetables, Dairy...)"
                className="pl-12"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {['Fresh Produce', 'Dairy & Eggs', 'Meat & Poultry', 'Dry Goods', 'Beverages'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => {
                    const next = formData.categories.includes(cat) 
                      ? formData.categories.filter((c: string) => c !== cat)
                      : [...formData.categories, cat];
                    updateField('categories', next);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-full text-2xs font-bold transition-all border",
                    formData.categories.includes(cat)
                      ? "bg-violet-600 border-violet-600 text-white"
                      : "bg-white dark:bg-slate-900 border-border text-secondary hover:border-brand"
                  )}
                >
                  {cat}
                </button>
              ))}
              <button className="px-4 py-2 rounded-full text-2xs font-bold bg-muted text-secondary border border-dashed border-border flex items-center gap-1">
                <Plus className="w-3 h-3" /> Other
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'documents',
      title: 'Document Upload',
      description: 'Upload necessary compliance documents for verification.',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'license', label: 'Trade License', desc: 'Valid commercial license copy' },
              { id: 'tax', label: 'Tax Certificate', desc: 'VAT/Tax registration document' },
              { id: 'id', label: 'Authorized Signatory ID', desc: 'Passport or National ID' },
              { id: 'bank', label: 'Bank Confirmation', desc: 'Cancelled check or bank letter' }
            ].map(doc => (
              <div key={doc.id} className="group relative p-4 rounded-lg border border-border bg-card flex items-center justify-between group cursor-pointer hover:border-brand transition-all overflow-hidden shadow-sm">
                <GlowingBorder spread={20} borderWidth={1} />
                <NeonEdges />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-secondary group-hover:text-brand transition-colors">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-primary">{doc.label}</h5>
                    <p className="text-2xs text-secondary">{doc.desc}</p>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-border relative z-10" />
              </div>
            ))}
          </div>
          
          <div className="group relative p-12 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center bg-card/30 overflow-hidden">
            <GlowingBorder spread={40} borderWidth={1} />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-full bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-brand mb-4 mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-primary">Drag & Drop Documents</h4>
              <p className="text-2xs text-secondary mt-1 max-w-[200px]">PDF, PNG, JPG up to 10MB per file</p>
              <button className="mt-4 px-6 py-2 bg-primary text-white dark:text-slate-900 text-2xs font-bold rounded-md transition-transform active:scale-95">
                Browse Files
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'financial',
      title: 'Settlement Details',
      description: 'Configure how you want to receive payments from Shopro.',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ShoproInput 
              label="Bank Name"
              value={formData.bankName}
              onChange={e => updateField('bankName', e.target.value)}
              placeholder="e.g. Global Trust Bank"
              required
            />
            <div className="space-y-2">
              <label className="text-2xs font-bold uppercase tracking-wider text-secondary">Currency</label>
              <div className="group relative">
                <GlowingBorder spread={20} borderWidth={1} />
                <NeonEdges />
                <select 
                  value={formData.currency}
                  onChange={e => updateField('currency', e.target.value)}
                  className="w-full h-12 bg-white dark:bg-slate-900/50 border border-border rounded-lg px-4 py-3 text-sm text-primary focus:ring-2 focus:ring-brand outline-none transition-all appearance-none relative z-10"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="AED">AED - UAE Dirham</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>
            </div>
            <ShoproInput 
              label="Account Number"
              value={formData.accountNumber}
              onChange={e => updateField('accountNumber', e.target.value)}
              required
            />
            <ShoproInput 
              label="SWIFT / BIC Code"
              value={formData.swift}
              onChange={e => updateField('swift', e.target.value)}
              required
            />
            <div className="md:col-span-2">
              <ShoproInput 
                label="IBAN"
                value={formData.iban}
                onChange={e => updateField('iban', e.target.value)}
                className="font-mono uppercase"
                placeholder="International Bank Account Number"
                required
              />
            </div>
          </div>
          
          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/30 flex gap-3">
            <IconTooltip label="Compliance Check">
                <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
            </IconTooltip>
            <p className="text-2xs text-amber-800 dark:text-amber-400">
              By submitting, you agree that settlements will be processed via Shopro's secure payment gateway subject to a 2.5% marketplace fee.
            </p>
          </div>
        </div>
      )
    }
  ];

  const handleComplete = () => {
    // Navigate to localized "Thank You / Progress" page or dashboard
    console.log('Application Submitted', formData);
    window.location.href = '/supplier/dashboard'; // For now
  };

  return (
    <AuroraBackground showRadialGradient className="min-h-screen py-12 px-4 overflow-y-auto block">
      <div className="w-full min-w-[400px] max-w-5xl mx-auto relative z-10 flex flex-col py-8">
        <div className="text-center mb-12 w-full max-w-3xl mx-auto shrink-0 px-4">
          <div className="w-16 h-16 bg-violet-600 rounded-xl flex items-center justify-center text-white mb-6 shadow-xl shadow-violet-500/20 mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight mb-4">Supplier Onboarding</h1>
          <p className="text-secondary mt-4 block w-full max-w-2xl mx-auto text-lg leading-relaxed whitespace-normal">Join the Shopro Marketplace and start your partnership with Shopro today.</p>
        </div>

        <div className="w-full">
          <Wizard 
            steps={steps} 
            currentStep={currentStep} 
            onStepChange={setCurrentStep}
            onComplete={handleComplete}
          />
        </div>

        <div className="mt-12 text-center text-2xs text-secondary">
          Already have an account? <a href="/login/supplier" className="text-violet-500 font-bold hover:underline">Login here</a>
        </div>
      </div>
    </AuroraBackground>
  );
}
