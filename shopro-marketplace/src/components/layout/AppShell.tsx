import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import CinematicThemeSwitcher from '../ui/cinematic-theme-switcher';

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-300">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-[var(--bg-card)] border-r border-[var(--border-color)] p-8 flex flex-col gap-10 z-20 glass">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/30">
            <span className="text-white font-black text-2xl">S</span>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter leading-none">SHOPRO</h1>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[var(--text-secondary)] mt-1">Marketplace</p>
          </div>
        </div>
        
        <nav className="flex flex-col gap-3">
          <NavItem label="Home" to="/" />
          <NavItem label="Explore" to="/explore" />
          <NavItem label="Orders" to="/orders" />
          <NavItem label="Dashboard" to="/dashboard" />
          <NavItem label="Operator" to="/operator-dashboard" />
          <NavItem label="Demo" to="/demo" />
          <NavItem label="Settings" to="/settings" />
        </nav>

        <div className="mt-auto pt-8 border-t border-[var(--border-color)]">
           <div className="flex flex-col gap-4">
             <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Theme</p>
             <CinematicThemeSwitcher />
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-72 flex flex-col">
        <header className="h-20 px-10 flex items-center justify-between border-b border-[var(--border-color)] sticky top-0 bg-[var(--bg-app)]/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-4 bg-[var(--bg-card)] px-4 py-2 rounded-xl border border-[var(--border-color)] w-96">
             <span className="text-[var(--text-secondary)] text-sm font-medium">Search marketplace...</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold">Admin User</p>
                <p className="text-xs text-[var(--text-secondary)] font-medium">Marketplace Lead</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-white/20 shadow-lg" />
            </div>
          </div>
        </header>

        <main className="p-10 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

const NavItem: React.FC<{ label: string; to: string }> = ({ label, to }) => {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link to={to} className="no-underline relative group">
      <div className={`
        relative px-6 py-3 rounded-xl cursor-pointer font-bold text-sm transition-all duration-300 z-10
        ${active 
          ? 'text-indigo-600 dark:text-indigo-400' 
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}
      `}>
        {label}
        
        {/* Active Pill with Liquid/Glass Effect */}
        {active && (
          <motion.div
            layoutId="activeNav"
            className="absolute inset-0 rounded-xl bg-white dark:bg-slate-900 shadow-[0_4px_12px_rgba(79,70,229,0.12)] border border-indigo-500/20 z-[-1]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
          >
            {/* Liquid Highlight Effect */}
            <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none opacity-50">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
            </div>
            
            {/* Left accent bar */}
            <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-600 rounded-r-full" />
          </motion.div>
        )}
      </div>
    </Link>
  );
};

export default AppShell;
