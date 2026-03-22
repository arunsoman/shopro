import React from "react";
import { RestaurantSidebar } from "@/components/ui/restaurant-sidebar";
import { RestaurantBreadcrumb } from "@/components/ui/restaurant-breadcrumb";
import { GlowingSearch } from "@/components/ui/glowing-search";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { NotificationDrawer, type Notification } from "@/components/ui/notification-drawer";
import CinematicThemeSwitcher from "@/components/ui/cinematic-theme-switcher";
import { TooltipIconButton } from "@/components/ui/tooltip-icon-button";
import { NeonEdges } from "@/components/ui/neon-button";
import { OrbitalLoader } from "@/components/ui/orbital-loader";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

import { AlertTriangle, ShoppingBag } from "lucide-react";

/**
 * SHELL-R — Restaurant App Shell
 * Role: all authenticated restaurant users
 * Purpose: sidebar, breadcrumb, notification bell, user avatar. 
 */

export function RestaurantShell({ children }: { children: React.ReactNode }) {
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>([
    { id: "1", type: "order", title: "PO Accepted", body: "Shopro has accepted your fresh produce order #PO-9021.", timestamp: "2m ago", read: false },
    { id: "2", type: "shipment", title: "In Transit", body: "Dairy delivery from 'Mother Dairy' scheduled for 10:00 AM.", timestamp: "1h ago", read: false },
    { id: "3", type: "system", title: "Price Alert", body: "Tomato prices dropped by 15% today.", timestamp: "3h ago", read: false },
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

  // Demo breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", href: "/restaurant/dashboard" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Sidebar DNA */}
      <RestaurantSidebar 
        role="buyer" 
        activeId="dashboard" 
        items={[
          { id: "dashboard", label: "Dashboard", href: "/restaurant/dashboard", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg> },
          { id: "catalog", label: "Marketplace", href: "/restaurant/catalog", icon: <ShoppingBag size={20} /> },
          { id: "orders", label: "Orders", href: "/restaurant/orders", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
          { id: "inventory", label: "Inventory", href: "/restaurant/inventory", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
          { id: "inventory-prediction", label: "Inventory Risks", href: "/restaurant/inventory-prediction", icon: <AlertTriangle size={20} /> },
          { id: "payments", label: "Payments", href: "/restaurant/payments", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M7 15h.01M11 15h2" /></svg> },
          { id: "auto-po", label: "Automation", href: "/restaurant/auto-po/rules", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4m0 16v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m16 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg> },
          { id: "support", label: "Support", href: "/restaurant/support", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
          { id: "settings", label: "Settings", href: "/restaurant/settings", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg> },
        ]}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header DNA */}
        <header className="h-16 px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl z-30">
          <div className="flex items-center gap-6">
            <RestaurantBreadcrumb items={breadcrumbItems} />
            <GlowingSearch 
              placeholder="Search products, orders..." 
              className="hidden lg:flex"
              onSearch={(q: string) => console.log("Restaurant Search:", q)}
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
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-primary ring-2 ring-card animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
              )}
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

            <Popover>
              <PopoverTrigger asChild>
                <button className="group relative flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-primary/5 transition-all overflow-hidden">
                  <NeonEdges />
                  <div className="flex flex-col items-end hidden sm:flex relative z-10">
                    <span className="text-xs font-bold leading-none">The Italian Kitchen</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Manager</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold border-2 border-card shadow-sm shadow-primary/20 relative z-10">
                    IK
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-56 p-2">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 text-sm transition-colors">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8z" strokeLinecap="round" /></svg>
                  <span>My Profile</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 text-sm transition-colors">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><circle cx="12" cy="12" r="3" /></svg>
                  <span>Settings</span>
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
          <React.Suspense fallback={<div className="flex h-full items-center justify-center"><OrbitalLoader message="Loading page..." /></div>}>
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
