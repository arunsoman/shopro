import { 
  TrendingUp, 
  ShieldCheck, 
  Truck, 
  Store, 
  Factory, 
  Clock,
  AlertCircle
} from 'lucide-react';
import { LiquidButton } from '../components/ui/liquid-glass-button';
import { GlowingEffect } from '../components/ui/glowing-effect';

const OperatorDashboardPage = () => {
  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Operator Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Real-time marketplace oversight and financial reconciliation.</p>
        </div>
        <div className="flex gap-3">
           <LiquidButton variant="outline" className="h-10">Export Report</LiquidButton>
           <LiquidButton size="lg" className="h-10">Generate Audit</LiquidButton>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Settled Volume" 
          value="$1,284,950.48" 
          trend="+12.4%" 
          icon={<TrendingUp className="text-emerald-500" />}
          description="Gross volume settled this month"
        />
        <StatCard 
          title="Held in Escrow" 
          value="$342,100.00" 
          icon={<ShieldCheck className="text-indigo-500" />}
          description="Verified security & dispute pool"
        />
        <StatCard 
          title="Active Batches" 
          value="148" 
          icon={<Truck className="text-amber-500" />}
          description="67% Logistics complete"
          progress={67}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Transactions */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Sales / Restaurant Side */}
          <Section header="Sales / Restaurant Side" linkText="View All Invoices">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TransactionCard 
                name="Gourmet Bistro #4" 
                id="TX-9901" 
                amount="$12,450.00" 
                status="SETTLED" 
                type="restaurant"
                tag="Premium Organic"
              />
              <TransactionCard 
                name="Pizza Palace Downtown" 
                id="TX-9905" 
                amount="$8,200.00" 
                status="PENDING" 
                type="restaurant"
                tag="Bulk Flour Order"
              />
            </div>
          </Section>

          {/* Procurement / Supplier Side */}
          <Section header="Procurement / Supplier Side" linkText="Manage Payouts">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TransactionCard 
                name="Global Grains Ltd." 
                id="PR-4402" 
                amount="$45,000.00" 
                status="DISBURSED" 
                type="supplier"
                tag="Waitlisted"
              />
              <TransactionCard 
                name="Ocean Fresh Seafood" 
                id="PR-4408" 
                amount="$18,900.00" 
                status="IN ESCROW" 
                type="supplier"
                tag="Verified Partner"
              />
            </div>
          </Section>

          {/* Real-time Stream */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg">Activity Real-Time Stream</h3>
              <Clock className="text-slate-400 w-5 h-5" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 uppercase text-[10px] font-black tracking-widest">
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Activity</th>
                    <th className="px-6 py-4">Entity</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  <ActivityRow time="1 min ago" activity="PO Verification Completed" entity="Gourmet Bistro" amount="$12,450" risk={0.02} color="green" />
                  <ActivityRow time="14 mins ago" activity="Supplier Dispute Initiated" entity="Ocean Fresh" amount="$18,900" risk={0.45} color="yellow" />
                  <ActivityRow time="32 mins ago" activity="Automatic Settlement Multi-sig" entity="Global Grains" amount="$45,000" risk={0.01} color="green" />
                  <ActivityRow time="1 hr ago" activity="New Batch Route Optimized" entity="Logistics Hub" amount="N/A" risk={0.05} color="green" />
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div className="space-y-8">
          {/* Chain of Custody */}
          <div className="relative bg-slate-950 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full border border-slate-800">
            <GlowingEffect blur={0} borderWidth={2} spread={80} proximity={64} inactiveZone={0.01} />
            <div className="relative z-10">
              <div className="p-8 bg-indigo-600">
                 <div className="flex justify-between items-center mb-6">
                   <h3 className="text-white font-black text-lg">Chain of Custody</h3>
                   <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md">LIVE TRACKING</span>
                 </div>
                 <div className="flex items-center gap-4 text-white/90">
                   <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                     <Truck className="w-6 h-6" />
                   </div>
                   <div>
                     <p className="text-xs font-bold opacity-60">IN TRANSIT</p>
                     <p className="font-bold text-lg leading-tight">Truck ID #4022</p>
                   </div>
                 </div>
              </div>
            </div>
            <div className="p-8 flex-1 space-y-8">
              <TimelineItem 
                title="Supplier Verified Packaging" 
                time="10:45 AM" 
                status="completed" 
              />
              <TimelineItem 
                title="Cold-Chain Handover" 
                time="11:32 AM" 
                status="active" 
                description="Temperature monitored at -18°C"
              />
              <TimelineItem 
                title="Last-Mile Dispatch" 
                time="2:00 PM" 
                status="upcoming" 
              />
              <TimelineItem 
                title="Restaurant Receipt" 
                time="3:30 PM" 
                status="upcoming" 
              />
              
              <div className="pt-4">
                <LiquidButton className="w-full">View Full Audit Trail</LiquidButton>
              </div>
            </div>
          </div>

          <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
             <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
             <AlertCircle className="w-8 h-8 mb-4 text-white/80" />
             <h4 className="text-xl font-black mb-2 leading-tight">Maintenance Window</h4>
             <p className="text-sm font-medium text-white/70 mb-6">Settlement engine scheduled for upgrade in 4 hours. All pending transactions will delay by ~15 mins.</p>
             <LiquidButton className="w-full">Acknowledge</LiquidButton>
          </div>
        </div>

      </div>
    </div>
  );
};

// Sub-components
const StatCard = ({ title, value, trend, icon, description, progress }: any) => (
  <div className="relative group bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-transform hover:scale-[1.02] cursor-default overflow-hidden">
    <GlowingEffect blur={0} borderWidth={1.5} spread={60} proximity={64} inactiveZone={0.01} />
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
          {icon}
        </div>
        {trend && (
          <span className="text-emerald-500 font-black text-xs bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest">{title}</h3>
      <p className="text-3xl font-black mt-1 text-slate-900 dark:text-white tabular-nums">{value}</p>
      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-bold">{description}</p>
      {progress && (
        <div className="mt-4 w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  </div>
);

const Section = ({ header, linkText, children }: any) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h3 className="font-black text-lg tracking-tight uppercase text-slate-400 dark:text-slate-600">{header}</h3>
      <button className="text-xs font-black text-indigo-500 hover:text-indigo-600 transition-colors uppercase tracking-widest">{linkText} →</button>
    </div>
    {children}
  </div>
);

const TransactionCard = ({ name, id, amount, status, type, tag }: any) => {
  const statusColors: any = {
    SETTLED: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    PENDING: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    DISBURSED: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
    'IN ESCROW': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };

  return (
    <div className="relative group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex justify-between items-center overflow-hidden transition-all duration-300">
      <GlowingEffect blur={0} borderWidth={1} spread={40} proximity={64} inactiveZone={0.01} />
      <div className="relative z-10 flex flex-1 justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-colors">
            {type === 'restaurant' ? <Store className="w-5 h-5 text-indigo-500" /> : <Factory className="w-5 h-5 text-indigo-500" />}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white leading-none">{name}</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-bold">BATCH {id} • <span className="text-indigo-500">{tag}</span></p>
          </div>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <p className="font-black text-lg tabular-nums">{amount}</p>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg tracking-tight ${statusColors[status] || ''}`}>
            {status}
          </span>
        </div>
      </div>
    </div>
  );
};

const ActivityRow = ({ time, activity, entity, amount, risk, color }: any) => (
  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
    <td className="px-6 py-4 text-xs font-bold text-slate-400 whitespace-nowrap">{time}</td>
    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-slate-100">{activity}</td>
    <td className="px-6 py-4 text-sm font-bold text-indigo-500">{entity}</td>
    <td className="px-6 py-4 text-sm font-black tabular-nums">{amount}</td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${color === 'green' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-amber-500 shadow-lg shadow-amber-500/50'}`} />
        <span className="text-xs font-black">{risk}</span>
      </div>
    </td>
  </tr>
);

const TimelineItem = ({ title, time, status, description }: any) => (
  <div className="flex gap-4 relative">
    {status !== 'upcoming' && (
      <div className="absolute left-[7px] top-6 bottom-[-24px] w-[2px] bg-slate-800" />
    )}
    <div className={`w-4 h-4 rounded-full mt-1.5 z-10 
      ${status === 'completed' ? 'bg-indigo-500' : status === 'active' ? 'bg-indigo-500 ring-4 ring-indigo-500/20' : 'bg-slate-800'}
    `} />
    <div className="pb-8 flex-1">
      <div className="flex justify-between items-start mb-1">
        <h4 className={`text-sm font-bold ${status === 'upcoming' ? 'text-slate-500' : 'text-white'}`}>{title}</h4>
        <span className="text-[10px] font-bold text-slate-500">{time}</span>
      </div>
      {description && <p className="text-xs text-slate-400 font-medium">{description}</p>}
    </div>
  </div>
);

export default OperatorDashboardPage;
