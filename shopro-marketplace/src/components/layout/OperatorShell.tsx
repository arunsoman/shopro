import React from "react";
import { GlowingSearch } from "@/components/ui/glowing-search";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { NotificationDrawer, type Notification } from "@/components/ui/notification-drawer";
import { TooltipIconButton } from "@/components/ui/tooltip-icon-button";
import { OrbitalLoader } from "@/components/ui/orbital-loader";
import { OperatorSidebar } from "@/components/ui/operator-sidebar";
import { RestaurantBreadcrumb } from "@/components/ui/restaurant-breadcrumb";
import CinematicThemeSwitcher from "@/components/ui/cinematic-theme-switcher";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const OPERATOR_ROLES = [
  { id: "admin", label: "Platform Admin", icon: "💎" },
  { id: "support", label: "Merchant Support", icon: "🎧" },
  { id: "compliance", label: "Compliance Officer", icon: "🛡️" },
  { id: "finance", label: "Finance Manager", icon: "💰" },
];

export function OperatorShell({ children }: { children: React.ReactNode }) {
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [currentRole, setCurrentRole] = React.useState(OPERATOR_ROLES[0]);
  const [notifications, setNotifications] = React.useState<Notification[]>([
    { id: "1", type: "system", title: "System Update", body: "Platform v1.2 is live with enhanced tax engine.", timestamp: "10m ago", read: false },
    { id: "2", type: "payment", title: "Payout Pending", body: "Supplier #402 requires payout approval for ₹1.2L.", timestamp: "2h ago", read: false },
    { id: "3", type: "dispute", title: "New Dispute", body: "Order #8822 flagged by Restaurant 'The Oven'.", timestamp: "5h ago", read: false },
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

  // Dynamic breadcrumb logic
  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: { label: string; href?: string }[] = [{ label: "Operator", href: "/operator/dashboard" }];
    
    const mapping: Record<string, string> = {
      'dashboard': 'Dashboard',
      'po': 'Purchase Orders',
      'inbox': 'Inbox',
      'outbox': 'Outbox',
      'orders': 'Order Flux',
      'restaurants': 'Restaurants',
      'suppliers': 'Suppliers',
      'vetting': 'Vetting Queue',
      'categories': 'Categories',
      'products': 'Product Master',
      'pricing-rules': 'Pricing Rules',
      'discounts': 'Promo Vault',
      'disputes': 'Disputes',
      'settlement-logs': 'Settlements',
      'payouts': 'Payout Vault',
      'revenue': 'Revenue Pulse',
      'roles': 'User Roles',
      'audit-trail': 'Audit Trail',
      'system-health': 'System Health',
      'api-keys': 'API Keys',
      'webhooks': 'Webhooks',
      'marketplace-settings': 'Marketplace Config',
      'automation-logic': 'Orchestration Logic',
      'automation-schedules': 'Workflow Schedules',
      'automation-log': 'Automation Log',
      'users': 'User Management',
      'ledger': 'Ledger',
      'reconciliation': 'Reconciliation',
      'credit-notes': 'Credit Notes',
      'tax': 'Tax Dashboard',
      'sourcing-wizard': 'Sourcing Wizard',
      'inventory-prediction': 'Inventory Pred.',
      'demand-forecasting': 'Demand Forecast',
      'margin-optimization': 'Margin Opt.',
      'split': 'Split Order',
      'sub-pos': 'Fulfillment Breakdown'
    };

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      // Skip the initial 'operator' segment as we add it by default
      if (segment === 'operator') return;
      
      currentPath += `/operator/${segment}`;
      
      // If segment is a PO ID (PO-XXXX), keep it as is, otherwise map it
      const label = mapping[segment] || segment.toUpperCase();
      
      breadcrumbs.push({
        label,
        href: index === pathSegments.length - 1 ? undefined : currentPath
      });
    });

    return breadcrumbs;
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Sidebar DNA */}
      <OperatorSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header DNA */}
        <header className="h-16 px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl z-30">
          <div className="flex items-center gap-6">
            <RestaurantBreadcrumb items={getBreadcrumbs()} />
            <GlowingSearch 
              placeholder="Search orders, tickets, entities..." 
              className="hidden lg:flex"
              onSearch={(q) => console.log("Search query:", q)}
            />
          </div>

          <div className="flex items-center gap-3">
            <TooltipIconButton tooltip="Audit Logs">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" />
              </svg>
            </TooltipIconButton>

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
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
            
            <CinematicThemeSwitcher />

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-xs font-bold leading-none">Admin User</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{currentRole.label}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-800 shadow-sm">
                    {currentRole.icon}
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64 p-2">
                <div className="px-2 py-1.5 mb-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Switch Role</p>
                </div>
                <div className="space-y-1">
                  {OPERATOR_ROLES.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setCurrentRole(role)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm",
                        currentRole.id === role.id 
                          ? "bg-slate-100 dark:bg-slate-800 font-medium" 
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      )}
                    >
                      <span>{role.icon}</span>
                      <span>{role.label}</span>
                      {currentRole.id === role.id && <span className="ml-auto text-blue-500">✓</span>}
                    </button>
                  ))}
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-700 my-2" />
                <button 
                  onClick={() => navigate("/")}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 text-sm transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 relative">
          <React.Suspense fallback={<div className="flex h-full items-center justify-center"><OrbitalLoader message="Loading workspace..." /></div>}>
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
