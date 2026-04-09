import React, { useState } from 'react';
import {
  Warehouse,
  UtensilsCrossed,
  TrendingUp,
  PieChart,
  ShoppingCart,
  BookOpen,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/AuthContext';
import { useAppStore, type Screen } from '@/App';
import { Dialog, DialogTrigger } from '@/components/ui/Dialog';
import { OnboardingForm } from '../components/OnboardingForm';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  screen: Screen;
  color: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon: Icon, screen, color }) => {
  const navigate = useAppStore((s) => s.navigate);

  return (
    <Card
      onClick={() => navigate(screen)}
      className="group relative overflow-hidden border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 hover:border-primary/20 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-primary/5 active:scale-[0.98] rounded-2xl"
    >
      <div className="p-6 flex flex-col h-full gap-5">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm transition-all group-hover:scale-110 group-hover:rotate-3",
          color
        )}>
          <Icon size={24} />
        </div>

        <div className="space-y-1.5 px-0.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
              {title}
            </h3>
            <ArrowRight size={14} className="text-muted-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-[11px] text-muted-foreground/60 leading-relaxed font-medium">
            {description}
          </p>
        </div>

        <div className="mt-auto pt-2 flex items-center gap-2">
          <div className="h-0.5 w-6 rounded-full bg-slate-100 dark:bg-white/10 group-hover:bg-primary/40 transition-colors" />
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/20 group-hover:text-primary/60 transition-all">
            Access Terminal
          </span>
        </div>
      </div>
    </Card>
  );
};

export default function FeatureHub() {
  const { session} = useAuth();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const features: FeatureCardProps[] = [
    {
      title: "Inventory Ledger",
      description: "Master stock audits, par variance, and operational waste tracking.",
      icon: Warehouse,
      screen: "inventory",
      color: "bg-emerald-600"
    },
    {
      title: "Kitchen (KDS)",
      description: "Expedited flow management and real-time station synchronization.",
      icon: UtensilsCrossed,
      screen: "kds",
      color: "bg-amber-600"
    },
    {
      title: "Prime Cost Hub",
      description: "Automated fiscal intelligence and critical margin analytics.",
      icon: PieChart,
      screen: "prime-cost",
      color: "bg-sky-600"
    },
    {
      title: "Engineering",
      description: "Menu profitability matrix and high-velocity item optimization.",
      icon: TrendingUp,
      screen: "engineering",
      color: "bg-indigo-600"
    },
    {
      title: "Purchasing",
      description: "Supplier logistics, digital invoice indexing, and pricing audits.",
      icon: ShoppingCart,
      screen: "purchasing",
      color: "bg-rose-600"
    },
    {
      title: "Recipe Master",
      description: "Centralized portion control and real-time theoretical costing.",
      icon: BookOpen,
      screen: "recipes",
      color: "bg-slate-600"
    }
  ];

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-4">
          {/* ADMIN ONLY: Rapid Restaurant Onboarding */}
          {session?.type === 'ADMIN' && (
            <Dialog open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen}>
              <DialogTrigger asChild>
                <button
                  className="flex items-center gap-4 bg-primary text-white p-5 rounded-2xl shadow-xl shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all group"
                >
                  <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                    <Plus size={20} />
                  </div>
                  <div className="text-left space-y-0.5">
                    <div className="text-[9px] font-bold uppercase tracking-widest opacity-60">Admin Portal</div>
                    <div className="text-sm font-bold leading-tight tracking-tight">Expand Network</div>
                  </div>
                </button>
              </DialogTrigger>
              <OnboardingForm onSuccess={() => setIsOnboardingOpen(false)} />
            </Dialog>
          )}
        </div>

        {/* Grid: 1 col on mobile, 2 on tablet, 3 on laptop/desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-5">
          {features.map((feature) => (
            <FeatureCard key={feature.screen} {...feature} />
          ))}
        </div>
      </div>
    </div>
  );
}
