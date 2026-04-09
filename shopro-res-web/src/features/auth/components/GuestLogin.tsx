import React, { useState } from 'react';
import { useGuestAuth } from '../hooks/useGuestAuth';
import { OAuthButtons } from './OAuthButtons';
import { Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type LoginMode = 'local' | 'oauth';

export const GuestLogin: React.FC = () => {
  const [mode, setMode] = useState<LoginMode>('local');
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [localError, setLocalError] = useState('');
  
  const { login, register, loginWithOAuth, isLoading, error } = useGuestAuth();

  const handleLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(''); 
    
    try {
      if (isRegistering) {
        await register({ email, password, displayName });
      } else {
        await login({ email, password });
      }
    } catch {}
  };

  const handleOAuthSuccess = async (provider: string, code: string) => {
    try {
      await loginWithOAuth(provider, code);
    } catch {}
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-sm mx-auto">
      {/* Switcher */}
      <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl w-fit mx-auto border border-slate-200/50 dark:border-white/5">
        <button 
          className={cn(
            "px-6 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
            mode === 'local' ? "bg-white dark:bg-white/10 shadow-sm text-primary ring-1 ring-slate-200/40 dark:ring-white/5" : "text-muted-foreground/30 hover:text-foreground"
          )}
          onClick={() => setMode('local')}
        >
          Direct
        </button>
        <button 
          className={cn(
            "px-6 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
            mode === 'oauth' ? "bg-white dark:bg-white/10 shadow-sm text-primary ring-1 ring-slate-200/40 dark:ring-white/5" : "text-muted-foreground/30 hover:text-foreground"
          )}
          onClick={() => setMode('oauth')}
        >
          Social
        </button>
      </div>

      <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-bold text-foreground tracking-tight leading-tight">
            {isRegistering ? 'Register Account' : 'Patron Login'}
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">Global Patron Identity Access</p>
      </div>

      {mode === 'local' ? (
        <form onSubmit={handleLocalSubmit} className="space-y-6">
          <div className="space-y-5">
            {isRegistering && (
                <div className="space-y-2 group/input">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic">Display Name</label>
                        <User size={10} className="text-muted-foreground/20" />
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            required
                            className="w-full h-12 px-5 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 font-bold text-sm outline-none transition-all placeholder:text-muted-foreground/20"
                        />
                    </div>
                </div>
            )}
            
            <div className="space-y-2 group/input">
              <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic">Email Address</label>
                  <Mail size={10} className="text-muted-foreground/20" />
              </div>
              <div className="relative">
                  <input
                    type="email"
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-12 px-5 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 font-bold text-sm outline-none transition-all placeholder:text-muted-foreground/20"
                  />
              </div>
            </div>
            
            <div className="space-y-2 group/input">
              <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic">Access Key</label>
                  <Lock size={10} className="text-muted-foreground/20" />
              </div>
              <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-12 px-5 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 font-bold text-sm outline-none transition-all placeholder:text-muted-foreground/20"
                  />
              </div>
            </div>
          </div>
          
          {(error || localError) && <div className="text-rose-500 text-[10px] font-bold uppercase tracking-widest text-center animate-pulse">{error || localError}</div>}
          
          <div className="space-y-4 pt-4">
            <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/10 disabled:opacity-40"
            >
                {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : (
                    <>
                        {isRegistering ? 'Register Profile' : 'Access Services'}
                        <ArrowRight size={14} />
                    </>
                )}
            </Button>
            
            <div className="text-center">
                <button 
                  type="button" 
                  className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30 hover:text-emerald-500 transition-all hover:underline decoration-emerald-500/20"
                  onClick={() => setIsRegistering(!isRegistering)}
                >
                  {isRegistering ? 'Already Registered? Sign In' : 'New Patron? Secure Onboarding'}
                </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
            <OAuthButtons 
              providers={['Google', 'Facebook', 'X']}
              onSuccess={handleOAuthSuccess}
              redirectUri={`${window.location.origin}/oauth/callback`}
            />
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/20 text-center italic">Verified Trust Exchange Service</p>
        </div>
      )}
    </div>
  );
};
