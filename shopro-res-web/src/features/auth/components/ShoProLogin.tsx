import React, { useState } from 'react';
import { useShoProAuth } from '../hooks/useShoProAuth';
import { Loader2, KeyRound, ShieldCheck, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export const ShoProLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [error, setError] = useState('');
  
  const { login, verifyMfa, isLoading } = useShoProAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await login({ username, password });
      
      if (response.requiresMfa) {
        setRequiresMfa(true);
        setMfaToken(response.mfaToken);
      }
    } catch (err) {
      setError('Invalid platform credentials');
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await verifyMfa({ mfaToken, mfaCode });
    } catch (err) {
      setError('Invalid verification code');
    }
  };

  if (requiresMfa) {
    return (
      <form onSubmit={handleMfaSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-4">
            <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto shadow-sm">
                <ShieldCheck size={28} />
            </div>
            <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground tracking-tight">MFA Verification</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">Enter your 6-digit authenticator code</p>
            </div>
        </div>
        
        <div className="space-y-6">
            <div className="relative group/input">
                <input
                    type="text"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    placeholder="000 000"
                    maxLength={6}
                    autoFocus
                    className="w-full h-14 px-6 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 text-center text-2xl font-bold font-mono tracking-[0.2em] outline-none transition-all"
                />
            </div>
            
            {error && <div className="text-rose-500 text-[10px] font-bold uppercase tracking-widest text-center animate-pulse">{error}</div>}
            
            <Button 
                type="submit" 
                disabled={isLoading || mfaCode.length < 6} 
                className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-lg shadow-slate-900/10 dark:shadow-white/5"
            >
                {isLoading ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : 'Authorize Connection'}
            </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1.5 mb-10">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Signal Login</h1>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 leading-none">Authentication required for platform access</p>
      </div>
      
      <div className="space-y-5">
        <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic">Identifier</label>
                <Mail size={10} className="text-muted-foreground/20" />
            </div>
            <div className="relative group/input">
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                    placeholder="SYSTEM_ADMIN"
                    className="w-full h-12 px-5 rounded-xl bg-slate-50/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 font-bold text-sm outline-none transition-all placeholder:text-muted-foreground/20"
                />
            </div>
        </div>
        
        <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic">Platform Token</label>
                <Lock size={10} className="text-muted-foreground/20" />
            </div>
            <div className="relative group/input">
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 px-5 rounded-xl bg-slate-50/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 font-bold text-sm outline-none transition-all placeholder:text-muted-foreground/20"
                />
            </div>
        </div>
      </div>
      
      {error && <div className="text-rose-500 text-[10px] font-bold uppercase tracking-widest text-center animate-pulse">{error}</div>}
      
      <div className="space-y-4 pt-4">
        <Button 
            type="submit" 
            disabled={isLoading || !username || !password} 
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-40"
        >
            {isLoading ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : 'Signal Authentication'}
        </Button>
        
        <div className="text-center">
            <button 
                type="button"
                onClick={(e) => e.preventDefault()} 
                className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30 hover:text-primary transition-all hover:underline underline-offset-4 decoration-primary/20"
            >
                Lost Platform Access?
            </button>
        </div>
      </div>
    </form>
  );
};
