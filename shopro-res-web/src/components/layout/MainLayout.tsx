import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Warehouse,
  Clock,
  Bell,
  Search,
  User,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';

export const MainLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const navItems = [
    { label: 'Hub', path: '/' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Inventory', path: '/inventory' },
    { label: 'Recipes', path: '/recipes' },
    { label: 'Prime Cost', path: '/prime-cost' },
    { label: 'Finance', path: 'finance-hub' },
  ];

  return (
    <div className="flex flex-col  bg-background text-foreground transition-colors duration-300">
      {/* Brand accent bar */}
      <div className="brand-bar fixed top-0 left-0 right-0 h-1 z-[70]" aria-hidden />

      {/* Sticky Header */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-border/40 bg-background/80 backdrop-blur-md z-50 flex items-center justify-between px-4 sm:px-6 md:px-8">
        <div className="flex items-center gap-4 md:gap-6">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <Warehouse size={18} className="sm:w-[22px] sm:h-[22px]" strokeWidth={2.5} />
            </div>
            <span className="text-xl sm:text-2xl font-black font-logo tracking-tighter italic uppercase text-primary">Shopro</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  if (item.path.startsWith('/')) {
                    navigate(item.path);
                  } else {
                    // Screen name navigation
                    navigate(item.path as any);
                  }
                }}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all",
                  location.pathname === item.path
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-surface-2 text-muted-foreground">
            <Search size={20} />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-surface-2 text-muted-foreground relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-secondary rounded-full border-2 border-background" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-surface-2 text-muted-foreground"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </Button>

          <div className="h-8 w-[1px] bg-border/40 mx-2 hidden sm:block" />

          <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border border-border/40 bg-surface/50 hover:border-primary/40 transition-all group">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hidden sm:block pl-2">Admin</span>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-white transition-colors">
              <User size={16} />
            </div>
          </button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full ml-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 bg-background z-[60] animate-in slide-in-from-top duration-300 md:hidden">
          <nav className="flex flex-col p-6 gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "px-6 py-4 rounded-2xl text-lg font-black uppercase tracking-tighter italic transition-all border",
                  location.pathname === item.path
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                    : "bg-surface border-border/40 text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pt-24 pb-16 px-4 md:px-8 max-w-screen-2xl mx-auto w-full relative">
        <Outlet />
      </main>

      {/* Sticky Footer */}
      <footer className="fixed bottom-0 left-0 right-0 h-8 border-t border-border/40 bg-background/80 backdrop-blur-md z-50 flex items-center justify-between px-4 text-[10px] text-muted-foreground/60 select-none">
        <div className="flex items-center gap-4">
          <span className="font-bold tracking-tight">&copy; {new Date().getFullYear()} SHOPRO RMP</span>
          <span className="opacity-30">|</span>
          <div className="flex items-center gap-2 font-medium">
            <Clock size={12} className="opacity-70" />
            <span>{formatDate(currentTime)}</span>
            <span className="opacity-30">&bull;</span>
            <span className="font-mono">{formatTime(currentTime)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-success/10 text-success border border-success/20">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="font-bold uppercase tracking-tighter">System Online</span>
          </div>
          <span className="opacity-40 hidden sm:block">BUILD v0.2.1-PRO</span>
          <div className="w-8 h-1-[1px] bg-border/40 mx-1" />
          <span className="font-mono opacity-50 uppercase tracking-tighter">Terminal: {window.location.hostname}</span>
        </div>
      </footer>

      {/* Toaster */}
      <Toaster
        position="top-right"
        theme={theme as any}
        closeButton
        toastOptions={{
          style: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.875rem',
            borderRadius: '12px',
          },
        }}
      />
    </div>
  );
};
