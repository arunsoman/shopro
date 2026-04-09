import { StaffPinLogin } from '../components/StaffPinLogin';
import { ShieldCheck, Zap, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { Link } from 'react-router-dom';

export default function StaffLoginPage() {
  const restaurantId = useAuthStore(s => s.restaurantId) || 1;

  return (
    <div className=" w-full bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Subtle Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20 dark:opacity-40">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-5%] right-[-5%] w-64 h-64 bg-amber-500/5 rounded-full blur-2xl" />
      </div>

      <div className="w-full max-w-2xl relative z-10 flex flex-col items-center">
        {/* Professional Branding */}
        <div className="flex flex-col items-center gap-4 mb-10 text-center">
          <div className="h-14 w-14 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-slate-900 shadow-xl shadow-slate-900/10 dark:shadow-white/5 transition-transform hover:scale-105 active:scale-95">
            <Zap size={28} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">ShoPro POS</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 italic">Terminal Node Entry</p>
          </div>
        </div>

        {/* Login Container */}
        <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-8 sm:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden">
          <StaffPinLogin restaurantId={restaurantId} />
        </div>

        {/* Footer Meta */}
        <div className="mt-10 flex flex-col items-center gap-6">
          <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30">
            <span className="flex items-center gap-2">
              <ShieldCheck size={12} className="text-emerald-500/60" />
              Terminal Encrypted
            </span>
            <span className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
            <Link to="/" className="flex items-center gap-1.5 hover:text-primary transition-colors hover:underline underline-offset-4 decoration-primary/20">
              <ArrowLeft size={10} />
              Return to Hub
            </Link>
          </div>
          <p className="text-[9px] font-bold text-muted-foreground/20 uppercase tracking-widest">Active Operations Cycle</p>
        </div>
      </div>
    </div>
  );
}
