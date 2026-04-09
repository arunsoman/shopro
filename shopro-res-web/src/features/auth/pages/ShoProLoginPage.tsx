import { ShoProLogin } from '../components/ShoProLogin';
import { ShieldCheck, Zap, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export default function ShoProLoginPage() {
  return (
    <div className=" w-full bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Subtle Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20 dark:opacity-40">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 bg-primary/5 rounded-full blur-2xl" />
      </div>

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        {/* Professional Branding */}
        <div className="flex flex-col items-center gap-4 mb-10 text-center">
          <div className="h-14 w-14 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-slate-900 shadow-xl shadow-slate-900/10 dark:shadow-white/5 transition-transform hover:scale-105 active:scale-95">
            <Zap size={28} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">ShoPro DMS</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 italic">Centralized Platform Control</p>
          </div>
        </div>

        {/* Login Container */}
        <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-8 sm:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-black/50">
          <ShoProLogin />
        </div>

        {/* Footer Meta */}
        <div className="mt-10 flex flex-col items-center gap-6">
          <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30">
            <span className="flex items-center gap-2">
              <ShieldCheck size={12} className="text-emerald-500/60" />
              FAPI 2.0 Encrypted
            </span>
            <span className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
            <Link to="/" className="flex items-center gap-1.5 hover:text-primary transition-colors hover:underline decoration-primary/20">
              <ArrowLeft size={10} />
              Return to Hub
            </Link>
          </div>
          <p className="text-[9px] font-bold text-muted-foreground/20 uppercase tracking-widest">Authorized Personnel Only</p>
        </div>
      </div>
    </div>
  );
}
