import React from "react";
import { GlowingSearch } from "@/components/ui/glowing-search";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { NotificationDrawer, type Notification } from "@/components/ui/notification-drawer";
import { TooltipIconButton } from "@/components/ui/tooltip-icon-button";
import { useNotifications } from "@/hooks/useNotifications";
import { OrbitalLoader } from "@/components/ui/orbital-loader";
import { OperatorSidebar } from "@/components/ui/operator-sidebar";
import { RestaurantBreadcrumb } from "@/components/ui/restaurant-breadcrumb";
import CinematicThemeSwitcher from "@/components/ui/cinematic-theme-switcher";
import { NeonEdges } from "@/components/ui/neon-button";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LoadingBoundary } from "./LoadingBoundary";

const OPERATOR_ROLES = [
  { id: "admin", label: "Platform Admin", icon: "💎" },
  { id: "support", label: "Merchant Support", icon: "🎧" },
  { id: "compliance", label: "Compliance Officer", icon: "🛡️" },
  { id: "finance", label: "Finance Manager", icon: "💰" },
];

export function OperatorShell({ children }: { children: React.ReactNode }) {
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [currentRole, setCurrentRole] = React.useState(OPERATOR_ROLES[0]);
  
  // Use the live notifications hook
  const userId = "ADMIN-001"; // In a real app, get from auth context
  const { 
    notifications: liveNotifications, 
    unreadCount, 
    markRead, 
    dismiss 
  } = useNotifications(userId);
  
  const location = useLocation();
  const navigate = useNavigate();

  const handleMarkRead = (id: string) => {
    markRead(id);
  };

  const handleMarkAllRead = () => {
    // Implement if needed
  };

  // Auth guard: Redirect if no token or incorrect role
  React.useEffect(() => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");
    
    if (!token && location.pathname !== "/operator/login") {
      navigate("/operator/login");
    } else if (token && role !== "marketplace_operator") {
      // Cross-portal prevention: Redirect to authorized portal
      if (role === "marketplace_buyer") navigate("/restaurant/dashboard");
      else if (role === "marketplace_supplier") navigate("/supplier/dashboard");
      else navigate("/operator/login");
    }
  }, [location.pathname, navigate]);

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
      'pricing-refresh': 'Price Refresh',
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
      'sub-pos': 'Fulfillment Breakdown',
      'traceability': 'Traceability'
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
    <div className="flex h-screen bg-(--sp-bg-0) text-(--sp-text-1) overflow-hidden font-sans">
      {/* Sidebar DNA */}
      <OperatorSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header DNA */}
        <header className="h-16 px-6 flex items-center justify-between border-b border-(--sp-border) bg-(--sp-bg-1)/50 backdrop-blur-xl z-30">
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
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-destructive ring-2 ring-card animate-pulse" />
              )}
            </div>

            <div className="h-8 w-px bg-(--sp-border) mx-1" />
            
            <CinematicThemeSwitcher />

            <div className="h-8 w-px bg-(--sp-border) mx-1" />

            <Popover>
              <PopoverTrigger asChild>
                <button className="group relative flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-primary/5 transition-all overflow-hidden">
                  <NeonEdges />
                  <div className="hidden sm:flex flex-col items-end relative z-10">
                    <span className="text-xs font-bold leading-none">Admin User</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{currentRole.label}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold border-2 border-card shadow-sm shadow-primary/20 relative z-10">
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
                  onClick={() => {
                    sessionStorage.clear();
                    navigate("/login/operator");
                  }}
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
        <main className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div className="max-w-[1280px] mx-auto px-8 py-10">
            <LoadingBoundary>
              <React.Suspense fallback={<div className="flex h-full items-center justify-center"><OrbitalLoader message="Loading workspace..." /></div>}>
                {children}
              </React.Suspense>
            </LoadingBoundary>
          </div>
        </main>
      </div>

      {/* Notification Drawer DNA */}
      <NotificationDrawer
        open={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={liveNotifications as any}
        onMarkAllRead={handleMarkAllRead}
        onMarkRead={handleMarkRead}
      />
    </div>
  );
}
