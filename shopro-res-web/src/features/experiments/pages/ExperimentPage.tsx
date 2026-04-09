import React, { useState } from 'react';
import { 
  Beaker, ChevronRight, Plus, Rocket, ShieldCheck, Target, 
  AlertTriangle, ArrowLeft, Check, Info, Users, Zap, 
  Clock, BarChart3, Star, Layers, Activity, Lock, RefreshCw,
  Search, Filter, Play, Archive, FileText
} from 'lucide-react';
import { useExperiments } from '../hooks/useExperiments';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

/* ── CONSTANTS & MOCKS ── */
const KPI_OPTIONS = [
  /* Revenue & Spend */
  { id: 'revisit', label: 'Repeat visit rate', unit: '%', desc: 'Percent of guests who return within 30 days' },
  { id: 'avgspend', label: 'Avg spend per visit', unit: '$', desc: 'Average ticket size per guest' },
  { id: 'revenue', label: 'Total revenue', unit: '$', desc: 'Gross revenue in period' },
  { id: 'revpash', label: 'RevPASH', unit: '$/hr', desc: 'Revenue per Available Seat Hour' },
  { id: 'upsell', label: 'Upsell attach rate', unit: '%', desc: 'Percent of checks with add-ons' },

  /* Velocity & Throughput */
  { id: 'turnover', label: 'Table Turnover', unit: 'x', desc: 'Number of times a table is sat per shift' },
  { id: 'ticket_time', label: 'Avg Ticket Time', unit: 'min', desc: 'Time from order to food delivery' },
  { id: 'wait_time', label: 'Avg Wait Time', unit: 'min', desc: 'Time from entry to seating' },
  { id: 'accuracy', label: 'Order Accuracy', unit: '%', desc: 'Percent of orders without voids or errors' },

  /* Cost Control */
  { id: 'prime_cost', label: 'Prime Cost %', unit: '%', desc: 'COGS + Labor costs as % of sales' },
  { id: 'food_cost', label: 'Food Cost %', unit: '%', desc: 'Direct food costs as % of sales' },
  { id: 'labor_cost', label: 'Labor Cost %', unit: '%', desc: 'Total labor $ as % of sales' },
  { id: 'waste', label: 'Waste %', unit: '%', desc: 'Inventory loss vs total stock usage' },

  /* Loyalty & UX */
  { id: 'nps', label: 'Guest NPS', unit: 'pts', desc: 'Net Promoter Score from surveys' },
  { id: 'csat', label: 'Customer CSAT', unit: 'pts', desc: 'Average guest satisfaction rating (1-5)' },
  { id: 'dwell', label: 'Avg dwell time', unit: 'min', desc: 'Minutes spent in restaurant' },
  
  /* Productivity */
  { id: 'splh', label: 'Sales per Labor Hr', unit: '$', desc: 'Sales generated per 1 staff member hour' },
];

/* ── HELPERS ── */
const TrendingUp: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

/* ── ATOMS ── */
const StepIndicator: React.FC<{ current: number }> = ({ current }) => (
  <div className="flex items-center gap-2 mb-8">
    {[1, 2, 3, 4].map(s => (
      <React.Fragment key={s}>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
          s < current ? 'bg-emerald-100 text-emerald-700' : 
          s === current ? 'bg-slate-900 text-white shadow-lg' : 
          'bg-slate-100 text-slate-400 border border-slate-200'
        }`}>
          {s < current ? <Check size={12} /> : s}
        </div>
        {s < 4 && <div className={`flex-1 h-px ${s < current ? 'bg-emerald-200' : 'bg-slate-200'}`} />}
      </React.Fragment>
    ))}
  </div>
);

const SectionLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-3 ${className}`}>
    {children}
  </div>
);

const SelCard: React.FC<{ 
  icon: React.ElementType; 
  title: string; 
  subtitle: string; 
  selected: boolean; 
  onClick: () => void;
  variant?: 'radio' | 'check';
}> = ({ icon: Icon, title, subtitle, selected, onClick, variant = 'radio' }) => (
  <div 
    onClick={onClick}
    className={`flex items-start gap-4 p-3.5 rounded-xl border transition-all cursor-pointer mb-2 ${
      selected ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900' : 'border-slate-200 bg-white hover:border-slate-300'
    }`}
  >
    <div className={`p-2 rounded-lg ${selected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
      <Icon size={18} />
    </div>
    <div className="flex-1">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{subtitle}</div>
    </div>
    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1 transition-all ${
      selected ? 'border-slate-900' : 'border-slate-300'
    }`}>
      {selected && (
        variant === 'radio' ? <div className="w-2 h-2 rounded-full bg-slate-900" /> : <Check size={10} strokeWidth={4} />
      )}
    </div>
  </div>
);

/* ══ MAIN COMPONENT ════════════════════════════════════════════════════ */
export const ExperimentPage: React.FC = () => {
  const { experiments, isLoading, createExperiment, startExperiment, rollbackExperiment } = useExperiments(1);
  const [view, setView] = useState<'home' | 'new-1' | 'new-2' | 'new-3' | 'new-4' | 'detail'>('home');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  /* Wizard State */
  const [draft, setDraft] = useState({
    name: '',
    hypothesis: '',
    target: 'all',
    type: 'LOYALTY',
    start: '',
    end: '',
    days: 30,
    control: 'ab',
    split: 50,
    primaryKpi: 'revisit',
    secondaryKpis: [] as string[],
    lift: 10,
    confidence: 95,
  });

  const selectedExp = experiments.find((e: any) => e.id === selectedId);

  const handleCreate = async () => {
    // Map wizard state to CreateExperimentRequest DTO
    const payload = {
      name: draft.name,
      type: draft.type,
      ownerRole: 'GENERAL_MANAGER', // Fixed for this context
      hypothesis: {
        description: draft.hypothesis,
        targetAudience: draft.target,
        expectedValue: draft.lift,
        confidenceLevel: draft.confidence
      },
      variants: [
        { name: 'Control', variantKey: 'control', isControl: true, description: 'Normal operations' },
        { name: 'Treatment', variantKey: 'treatment', isControl: false, description: draft.type }
      ],
      randomization: {
        type: draft.control === 'ab' ? 'A_B_SPLIT' : 'RATIO_SPLIT',
        segmentCriteria: draft.target,
        trafficSplit: draft.split
      },
      execution: {
        startDate: draft.start || new Date().toISOString(),
        endDate: draft.end || new Date(Date.now() + draft.days * 24 * 60 * 60 * 1000).toISOString(),
        primaryMetric: draft.primaryKpi,
        haltThreshold: 5.0
      }
    };

    try {
      await createExperiment(payload);
      setView('home');
      // Reset draft
    } catch (err) {
      console.error("Experiment creation failed", err);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-full animate-pulse">
      <Beaker className="text-slate-200 w-12 h-12 mb-4" />
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Initializing Lab...</span>
    </div>
  );

  /* ── HOME VIEW ── */
  if (view === 'home') {
    const running = experiments.filter((e: any) => e.status === 'RUNNING').length;
    const completed = experiments.filter((e: any) => e.status === 'COMPLETED').length;

    return (
      <div className="h-full overflow-y-auto px-6 py-8 custom-scrollbar bg-slate-50/50">
        <div className="max-w-4xl mx-auto animate-in fade-in duration-300 pb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Experiment Lab</h1>
              <p className="text-sm text-slate-500">Design, run, and measure restaurant theories.</p>
            </div>
            <Button 
              className="rounded-xl shadow-lg shadow-black/10 bg-slate-900 hover:bg-black text-white gap-2 h-10 px-5 text-sm font-semibold"
              onClick={() => setView('new-1')}
            >
              <Plus className="w-4 h-4" />
              New Experiment
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Experiments', val: experiments.length, color: 'text-slate-900' },
              { label: 'Running now', val: running, color: 'text-amber-600' },
              { label: 'Completed', val: completed, color: 'text-emerald-600' },
              { label: 'Avg Lift', val: '+12%', color: 'text-emerald-500' },
            ].map(m => (
              <div key={m.label} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{m.label}</div>
                <div className={`text-xl font-bold ${m.color}`}>{m.val}</div>
              </div>
            ))}
          </div>

          <SectionLabel>Audit History</SectionLabel>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mb-6">
            {experiments.length === 0 ? (
              <div className="p-12 text-center text-slate-400 italic text-sm">No theories tested yet.</div>
            ) : (
              experiments.map((e: any) => (
                <div 
                  key={e.id} 
                  onClick={() => { setSelectedId(e.id); setView('detail'); }}
                  className="flex items-center gap-4 p-5 border-b border-slate-100 last:border-none hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    e.status === 'RUNNING' ? 'bg-amber-500 animate-pulse' : 
                    e.status === 'COMPLETED' ? 'bg-emerald-500' :
                    'bg-slate-300'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate uppercase tracking-tight">{e.name}</div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-semibold">{e.type}</span>
                      <span>•</span>
                      <span>{e.hypothesis?.targetAudience || 'All Guests'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock size={10}/> {e.startDate ? new Date(e.startDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                  <Badge variant={e.status === 'RUNNING' ? 'warning' : e.status === 'COMPLETED' ? 'success' : 'outline'} className="rounded-lg px-2 py-0.5 text-[10px]">
                    {e.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
          
          <Button 
            variant="outline" 
            className="w-full rounded-xl border-dashed py-6 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all border-slate-200 gap-2"
            onClick={() => setView('new-1')}
          >
            <Plus size={16} />
            Design a new operational experiment
          </Button>
        </div>
      </div>
    );
  }

  /* ── STEP 1 VIEW ── */
  if (view === 'new-1') {
    return (
      <div className="max-w-xl mx-auto py-8 px-6 animate-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView('home')} className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-500">
            <ArrowLeft size={18} />
          </button>
          <div className="text-lg font-bold text-slate-900">New Experiment</div>
        </div>

        <StepIndicator current={1} />

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col max-h-[70vh]">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            <div>
              <div className="text-base font-bold text-slate-900 mb-1">Name your theory</div>
              <div className="text-xs text-slate-500 mb-4">What do you believe will happen, and who are you testing it on?</div>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Experiment Name</label>
                  <input 
                    type="text" 
                    value={draft.name}
                    onChange={(e) => setDraft({...draft, name: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:outline-none text-sm"
                    placeholder="e.g. Free drink loyalty reward"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Hypothesis</label>
                  <textarea 
                    value={draft.hypothesis}
                    onChange={(e) => setDraft({...draft, hypothesis: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:outline-none text-sm min-h-[100px] leading-relaxed"
                    placeholder="Offering a free drink on every 5th visit will increase repeat visits by 20%..."
                  />
                </div>
              </div>
            </div>

            <SectionLabel>Target Audience</SectionLabel>
            <div className="space-y-1">
              {[
                { id: 'all', title: 'All Guests', sub: 'Every customer visiting during period', icon: Users },
                { id: 'new', title: 'New Guests', sub: 'First-time visitors only', icon: Zap },
                { id: 'loyal', title: 'Loyal Guests', sub: '3+ visits in last 90 days', icon: Star },
                { id: 'segment', title: 'Custom Segment', sub: 'Define your own filter (Spend, Day part)', icon: Layers },
              ].map(t => (
                <SelCard 
                  key={t.id}
                  selected={draft.target === t.id}
                  onClick={() => setDraft({...draft, target: t.id})}
                  title={t.title}
                  subtitle={t.sub}
                  icon={t.icon}
                />
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <Button 
              className="w-full bg-slate-900 text-white py-6 rounded-xl font-bold shadow-xl shadow-black/10"
              disabled={!draft.name || !draft.hypothesis}
              onClick={() => setView('new-2')}
            >
              Continue to Intervention
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── STEP 2 VIEW ── */
  if (view === 'new-2') {
    const INTERV_TYPES = [
      { id: 'LOYALTY', title: 'Loyalty / Reward Trigger', sub: 'Reward on Nth visit or spend threshold', icon: Star },
      { id: 'SPEED', title: 'Happy Hour / Time Promo', sub: 'Incentives during quiet day parts', icon: Zap },
      { id: 'MARGIN', title: 'Discount / Price Change', sub: 'Test impact of % or flat fee changes', icon: BarChart3 },
      { id: 'UPSell', title: 'Upsell / Bundle Offer', sub: 'Suggest add-ons or upgrades at checkout', icon: Rocket },
      { id: 'MENU', title: 'Menu / Item Change', sub: 'Impact of renaming or adding items', icon: FileText },
    ];

    return (
      <div className="max-w-xl mx-auto py-8 px-6 animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView('new-1')} className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-500">
            <ArrowLeft size={18} />
          </button>
          <div className="text-lg font-bold text-slate-900">Define intervention</div>
        </div>

        <StepIndicator current={2} />

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col max-h-[70vh]">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            <div>
              <div className="text-base font-bold text-slate-900 mb-1">What are you changing?</div>
              <div className="text-xs text-slate-500 mb-6">Choose the operational change you want to test.</div>

              <div className="space-y-1">
                {INTERV_TYPES.map(it => (
                  <SelCard 
                    key={it.id}
                    selected={draft.type === it.id}
                    onClick={() => setDraft({...draft, type: it.id})}
                    title={it.title}
                    subtitle={it.sub}
                    icon={it.icon}
                  />
                ))}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Info size={16} className="text-slate-400 mt-0.5" />
                <p className="text-[11px] text-slate-500 leading-relaxed italic">
                  Selected: <span className="font-bold text-slate-900 uppercase">{draft.type.replace('_',' ')}</span>. 
                  The system will automatically configure treatment variants for your POS and Loyalty flow based on this type.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <Button 
              className="w-full bg-slate-900 text-white py-6 rounded-xl font-bold shadow-xl shadow-black/10"
              onClick={() => setView('new-3')}
            >
              Set Duration & Split
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── STEP 3 VIEW ── */
  if (view === 'new-3') {
    return (
      <div className="max-w-xl mx-auto py-8 px-6 animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView('new-2')} className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-500">
            <ArrowLeft size={18} />
          </button>
          <div className="text-lg font-bold text-slate-900">Duration & Split</div>
        </div>

        <StepIndicator current={3} />

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col max-h-[70vh]">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            <SectionLabel>Experiment Window</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Days to run</label>
                <input 
                  type="number" 
                  value={draft.days}
                  onChange={(e) => setDraft({...draft, days: parseInt(e.target.value)})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 text-sm"
                  placeholder="30"
                />
              </div>
              <div className="space-y-1.5 pt-6 flex items-center px-1">
                <p className="text-[11px] text-slate-400 italic">Recommended: 30+ days for statistical significance.</p>
              </div>
            </div>

            <SectionLabel>Control Group</SectionLabel>
            <div className="space-y-1">
              <SelCard 
                selected={draft.control === 'ab'}
                onClick={() => setDraft({...draft, control: 'ab', split: 50})}
                title="A/B Split — 50/50"
                subtitle="Perfect statistical balance between standard and test"
                icon={Activity}
              />
              <SelCard 
                selected={draft.control === 'off'}
                onClick={() => setDraft({...draft, control: 'off', split: 100})}
                title="No Control — Full Rollout"
                subtitle="Apply to everyone. Comparison is vs. historical baseline."
                icon={ShieldCheck}
              />
            </div>

            <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Split Visualizer</span>
                <span className="text-[10px] font-black text-indigo-500 bg-white px-2 py-0.5 rounded-full shadow-sm">{draft.split}% TREATMENT</span>
              </div>
              <div className="h-3 w-full bg-indigo-200 rounded-full overflow-hidden flex">
                <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${draft.split}%` }} />
                <div className="h-full bg-indigo-300" style={{ flex: 1 }} />
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-indigo-400 font-bold">
                <span>NEW THEORY</span>
                <span>STATUS QUO</span>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <Button 
              className="w-full bg-slate-900 text-white py-6 rounded-xl font-bold shadow-xl shadow-black/10"
              onClick={() => setView('new-4')}
            >
              Finalize KPIs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── STEP 4 VIEW ── */
  if (view === 'new-4') {
    return (
      <div className="max-w-xl mx-auto py-8 px-6 animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView('new-3')} className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-500">
            <ArrowLeft size={18} />
          </button>
          <div className="text-lg font-bold text-slate-900">Success Metrics</div>
        </div>

        <StepIndicator current={4} />

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col max-h-[70vh]">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            <SectionLabel>Primary Success Metric</SectionLabel>
            <div className="space-y-4 mb-4">
              {[
                { label: 'Revenue & Spend', ids: ['revisit', 'avgspend', 'revenue', 'revpash', 'upsell'] },
                { label: 'Velocity & Throughput', ids: ['turnover', 'ticket_time', 'wait_time', 'accuracy'] },
                { label: 'Cost Control', ids: ['prime_cost', 'food_cost', 'labor_cost', 'waste'] },
                { label: 'Loyalty & UX', ids: ['nps', 'csat', 'dwell'] },
                { label: 'Productivity', ids: ['splh'] },
              ].map(group => (
                <div key={group.label}>
                  <div className="text-[9px] font-black text-slate-400 uppercase mb-2 ml-1">{group.label}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {group.ids.map(id => {
                      const k = KPI_OPTIONS.find(x => x.id === id);
                      if (!k) return null;
                      return (
                        <button 
                          key={k.id}
                          onClick={() => setDraft({...draft, primaryKpi: k.id})}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-left ${
                            draft.primaryKpi === k.id ? 'border-slate-900 bg-slate-900 text-white shadow-md' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          <div className="text-[10px] font-bold uppercase tracking-tight text-center">{k.label}</div>
                          <div className="text-[8px] opacity-60 text-center leading-tight">{k.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Target Lift (%)</label>
                <input 
                  type="number" 
                  value={draft.lift}
                  onChange={(e) => setDraft({...draft, lift: parseInt(e.target.value)})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 text-sm font-bold"
                  placeholder="10"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Confidence Target</label>
                <select 
                  value={draft.confidence}
                  onChange={(e) => setDraft({...draft, confidence: parseInt(e.target.value)})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 text-sm font-bold bg-white"
                >
                  <option value={90}>90% (Fast)</option>
                  <option value={95}>95% (Standard)</option>
                  <option value={99}>99% (Scientific)</option>
                </select>
              </div>
            </div>

            <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl border-l-4 border-l-emerald-500">
              <div className="text-xs font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <Rocket size={14} />
                  HYPOTHESIS PREVIEW
              </div>
              <p className="text-[13px] text-emerald-800 leading-relaxed italic">
                "{draft.hypothesis || draft.name || '[Theory]'}". We expect a <strong>{draft.lift}%</strong> improvement in 
                <strong> {KPI_OPTIONS.find(k => k.id === draft.primaryKpi)?.label}</strong> across {draft.target} guests.
              </p>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col gap-2">
            <Button 
              className="w-full bg-slate-900 text-white py-7 rounded-2xl font-black text-lg shadow-2xl shadow-black/30 hover:scale-[1.02] active:scale-[0.98] transition-all gap-3"
              onClick={handleCreate}
            >
              <Rocket size={20} />
              LAUNCH LAB TEST
            </Button>
            <Button 
              variant="ghost"
              className="w-full text-slate-500 py-3 text-sm font-bold"
              onClick={() => setView('home')}
            >
              Cancel & Archieve Draft
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── DETAIL VIEW ── */
  if (view === 'detail' && selectedExp) {
    return (
      <div className="h-full overflow-y-auto px-6 py-8 custom-scrollbar bg-slate-50">
        <div className="max-w-3xl mx-auto animate-in zoom-in duration-300 pb-12">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setView('home')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 font-semibold transition-colors">
              <ArrowLeft size={16} />
              Back to Hub
            </button>
            <div className="flex gap-2">
              {selectedExp.status === 'RUNNING' && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="rounded-lg h-9 font-bold"
                  onClick={() => rollbackExperiment({ id: selectedExp.id, reason: 'Manual abort' })}
                >
                  Abrupt Rollback
                </Button>
              )}
               <Button 
                 disabled={!selectedExp.results?.isSignificant || !selectedExp.results?.minDurationMet}
                 className={`rounded-lg h-9 font-bold gap-2 ${selectedExp.results?.isSignificant && selectedExp.results?.minDurationMet ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-200 text-slate-400'}`}
               >
                 <Rocket size={14} />
                 Ship Winner
               </Button>
               <Button variant="outline" size="sm" className="rounded-lg h-9 font-bold">
                 Download CSV
               </Button>
            </div>
          </div>

          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{selectedExp.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={selectedExp.status === 'RUNNING' ? 'warning' : 'success'}>{selectedExp.status}</Badge>
                <div className="flex gap-1">
                  <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">{selectedExp.type}</span>
                  <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">{selectedExp.hypothesis?.targetAudience}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
               <div className="text-[10px] font-bold text-slate-400 uppercase">Started</div>
               <div className="text-sm font-bold text-slate-900">{selectedExp.startDate ? new Date(selectedExp.startDate).toLocaleDateString() : 'N/A'}</div>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-5 rounded-3xl mb-8 relative overflow-hidden border border-slate-800 shadow-xl">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Beaker size={100} />
             </div>
             <SectionLabel className="text-slate-400">Theory Hypothesis</SectionLabel>
             <p className="text-base font-medium leading-relaxed italic opacity-90">
               "{selectedExp.hypothesis?.description || 'No description recorded.'}"
             </p>

             {selectedExp.results?.noveltyWarning && (
               <div className="mt-4 p-3 bg-amber-500/20 border border-amber-500/30 rounded-xl flex items-start gap-3">
                 <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                 <div className="text-[11px] text-amber-100 leading-tight">
                   <span className="font-bold uppercase block mb-1">Statistical Warning</span>
                   {selectedExp.results.noveltyWarning}
                 </div>
               </div>
             )}
          </div>

          <SectionLabel>Live Results vs Control</SectionLabel>
          <div className="grid grid-cols-2 gap-3 mb-8">
             {[
               { 
                 label: 'Primary KPI Lift', 
                 val: `${(selectedExp.results?.primaryLift || 0) > 0 ? '+' : ''}${selectedExp.results?.primaryLift ?? '0.00'}%`, 
                 sub: `vs ${selectedExp.hypothesis?.expectedValue || 10}% target`, 
                 color: 'bg-emerald-50 text-emerald-700', 
                 icon: TrendingUp 
               },
               { 
                 label: 'Confidence', 
                 val: `${selectedExp.results?.confidence ?? '50.00'}%`, 
                 sub: `Target ${selectedExp.hypothesis?.confidenceLevel || 95}%`, 
                 color: 'bg-indigo-50 text-indigo-700', 
                 icon: ShieldCheck 
               },
               { 
                 label: 'Variant Performance', 
                 val: `$${selectedExp.results?.treatmentValue ?? '0.00'}`, 
                 sub: `Control $${selectedExp.results?.controlValue ?? '0.00'}`, 
                 color: 'bg-slate-50 text-slate-700', 
                 icon: BarChart3 
               },
               { 
                 label: 'Sample size', 
                 val: selectedExp.results?.sampleSize ?? '0', 
                 sub: selectedExp.results?.statusMessage || 'Covers tracked', 
                 color: 'bg-slate-50 text-slate-700', 
                 icon: Users 
               },
             ].map((r, i) => (
               <div key={i} className={`p-5 rounded-2xl border border-slate-100 shadow-sm ${r.color}`}>
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">{r.label}</div>
                  <div className="text-2xl font-black">{r.val}</div>
                  <div className="text-[10px] font-bold mt-1 opacity-70">{r.sub}</div>
               </div>
             ))}
          </div>

          <SectionLabel>Progress Tracking</SectionLabel>
          <div className="card-elevated p-6 rounded-3xl mb-8 border border-slate-200 bg-white">
             <div className="flex items-center justify-between mb-3 text-sm">
               <span className="font-bold text-slate-900">{Math.round(selectedExp.results?.progressPercentage || 0)}% Completed</span>
               <div className="text-slate-400">{selectedExp.status === 'RUNNING' ? 'Experiment in Progress' : 'Lifecycle Finished'}</div>
             </div>
             <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-slate-900 rounded-full transition-all duration-1000" style={{ width: `${selectedExp.results?.progressPercentage || 0}%` }} />
             </div>
             {!selectedExp.results?.minDurationMet && selectedExp.status === 'RUNNING' && (
               <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-amber-600 bg-amber-50 p-2 rounded-lg">
                 <Clock size={12} />
                 SHIELD ACTIVE: Wait at least 14 days to stabilize novelty effect.
               </div>
             )}
          </div>

          <div className="grid grid-cols-2 gap-6 p-6 border border-slate-200 rounded-3xl bg-slate-50 mb-12">
             <div>
                <SectionLabel>Control Config</SectionLabel>
                <div className="space-y-3">
                   <div className="grid grid-cols-2 gap-2">
                      <span className="text-[11px] text-slate-400 font-bold uppercase">Split</span>
                      <span className="text-[11px] text-slate-900 font-black">{selectedExp.randomization?.trafficSplit}% Treatment</span>
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                      <span className="text-[11px] text-slate-400 font-bold uppercase">Start</span>
                      <span className="text-[11px] text-slate-900 font-black">{selectedExp.startDate ? new Date(selectedExp.startDate).toLocaleDateString() : 'N/A'}</span>
                   </div>
                </div>
             </div>
             <div>
                <SectionLabel>Guardrails</SectionLabel>
                <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
                   <ShieldCheck size={14} />
                   SYSTEM SAFE — NO HALT RISK
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Halt trigger at &gt;5% deviation on margin.</p>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
