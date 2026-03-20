import React from 'react';
import { Package, ShieldCheck, Zap } from 'lucide-react';
import { LiquidButton } from '../components/ui/liquid-glass-button';
import { GlowingEffect } from '../components/ui/glowing-effect';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page space-y-20 py-20 px-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-6xl md:text-8xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
          The Future of <span className="text-indigo-600 dark:text-indigo-500">B2B Procurement</span>
        </h1>
        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
          Direct, Transparent, and Automated. Shopro connects the world's best restaurants with the most reliable suppliers.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
          <LiquidButton size="lg" className="px-10 h-16 text-lg">
            Become a Buyer
          </LiquidButton>
          <LiquidButton variant="outline" size="lg" className="px-10 h-16 text-lg">
            Sell on Shopro
          </LiquidButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <StatCard 
          label="Active Restaurants" 
          value="1,200+" 
          sub="Growing daily" 
          icon={<Zap className="w-6 h-6" />}
        />
        <StatCard 
          label="Verified Suppliers" 
          value="450+" 
          sub="Premium quality" 
          icon={<ShieldCheck className="text-emerald-500 w-6 h-6" />}
        />
        <StatCard 
          label="Monthly GMV" 
          value="$12.5M" 
          sub="Transparent settle" 
          icon={<Package className="text-indigo-500 w-6 h-6" />}
        />
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; sub: string; icon: React.ReactNode }> = ({ label, value, sub, icon }) => (
  <div className="relative group bg-white dark:bg-slate-900/50 p-10 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden transition-all duration-500 hover:scale-[1.02]">
    <GlowingEffect blur={0} borderWidth={1.5} spread={80} proximity={64} inactiveZone={0.01} />
    <div className="relative z-10">
      <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
        {icon}
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest mb-2">{label}</p>
      <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">{value}</h2>
      <p className="text-indigo-600 dark:text-indigo-400 text-sm font-bold mt-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
        {sub}
      </p>
    </div>
  </div>
);

export default LandingPage;
