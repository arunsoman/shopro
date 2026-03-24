import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Fingerprint } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SecureOverlayProps {
  children: React.ReactNode;
  isAuthenticated?: boolean;
}

export const SecureOverlay: React.FC<SecureOverlayProps> = ({ children, isAuthenticated = false }) => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');
  const isProtected = !!token;

  if (isProtected) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-[500px]">
      <div className="filter blur-xl pointer-events-none select-none">
        {children}
      </div>

      <div className="absolute inset-0 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl  w-full text-center space-y-6"
        >
          <div className="w-16 h-16 bg-slate-900 dark:bg-white rounded-3xl mx-auto flex items-center justify-center shadow-xl">
            <Lock className="text-white dark:text-slate-900 w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
              Secured <span className="text-emerald-500 text-3xl">Access</span>
            </h2>
            <p className="text-[10px] items-center justify-center flex gap-2 text-slate-500 font-black italic tracking-widest uppercase mt-4">
              <Fingerprint className="w-4 h-4 text-emerald-500" />
              Identity Resonance Required
            </p>
          </div>

          <button
            onClick={() => {
              const path = window.location.pathname;
              if (path.startsWith('/operator')) navigate('/login/operator');
              else if (path.startsWith('/supplier')) navigate('/login/supplier');
              else navigate('/login/restaurant');
            }}
            className="w-full py-4 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-black italic uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
          >
            Authenticate Session
          </button>

          <p className="text-[9px] text-slate-400 font-black italic uppercase tracking-[0.2em]">
            Shopro Marketplace Protocol v1.0.4
          </p>
        </motion.div>
      </div>
    </div>
  );
};
