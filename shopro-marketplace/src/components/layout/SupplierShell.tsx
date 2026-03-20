import React from "react";
import { SupplierSidebar } from "@/components/ui/supplier-sidebar";
import { RestaurantBreadcrumb } from "@/components/ui/restaurant-breadcrumb";
import { GlowingSearch } from "@/components/ui/glowing-search";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { NotificationDrawer, type Notification } from "@/components/ui/notification-drawer";
import CinematicThemeSwitcher from "@/components/ui/cinematic-theme-switcher";
import { TooltipIconButton } from "@/components/ui/tooltip-icon-button";
import { OrbitalLoader } from "@/components/ui/orbital-loader";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * SHELL-S — Supplier App Shell
 * Role: all authenticated supplier users
 * Purpose: Supplier portal layout. Restaurant identity NEVER shown.
 */

export function SupplierShell({ children }: { children: React.ReactNode }) {
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>([
    { id: "1", type: "order", title: "New Bid Invitation", body: "Shopro invited you to bid for 'Fresh Produce - Cluster B'.", timestamp: "5m ago", read: false },
    { id: "2", type: "payment", title: "Payment Received", body: "Invoice #9902 (₹45,200) paid via Bank Transfer.", timestamp: "4h ago", read: false },
    { id: "3", type: "system", title: "Policy Update", body: "New packing guidelines for perishable goods are now active.", timestamp: "1d ago", read: true },
  ]);

  const location = useLocation();
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Sidebar DNA */}
      <SupplierSidebar activeId="dashboard" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header DNA */}
        <header className="h-16 px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl z-30">
          <div className="flex items-center gap-6">
            <RestaurantBreadcrumb items={[{ label: "Dashboard", href: "/supplier/dashboard" }]} />
            <GlowingSearch 
              placeholder="Search bids, invoices..." 
              className="hidden lg:flex"
              onSearch={(q) => console.log("Supplier Search:", q)}
            />
          </div>

          <div className="flex items-center gap-3">
            <CinematicThemeSwitcher />

            <div className="relative">
              <TooltipIconButton
                tooltip="Notifications"
                onClick={() => setIsNotificationsOpen(true)}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                </svg>
              </TooltipIconButton>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-xs font-bold leading-none">Global Foods Ltd.</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Supplier</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-800 shadow-sm">
                    GF
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-56 p-2">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 text-sm transition-colors">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8z" strokeLinecap="round" /></svg>
                  <span>Supplier Profile</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 text-sm transition-colors">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19H6a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v3m0 0l2 2m-2-2l-2 2" /><path d="M14 11h4v4h-4z" /></svg>
                  <span>Business Catalog</span>
                </button>
                <div className="h-px bg-slate-200 dark:bg-slate-700 my-2" />
                <button 
                  onClick={() => navigate("/")}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 text-sm transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <span>Sign Out</span>
                </button>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 relative">
          <React.Suspense fallback={<div className="flex h-full items-center justify-center"><OrbitalLoader message="Syncing data..." /></div>}>
            {children}
          </React.Suspense>
        </main>
      </div>

      {/* Notification Drawer DNA */}
      <NotificationDrawer
        open={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        onMarkRead={handleMarkRead}
      />
    </div>
  );
}
