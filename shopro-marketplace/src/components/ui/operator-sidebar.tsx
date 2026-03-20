import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlowingBorder } from "@/components/ui/neon-button";
import { NeonEdges } from "@/components/ui/neon-button";
import { useLocation, Link } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";

/**
 * OperatorSidebar
 * Adapted from: SidebarNav (shopro-missing-components.tsx)
 * Role: platform (Shopro Operators)
 */

const SPRING = { type: "spring" as const, stiffness: 400, damping: 25, mass: 1 };

interface NavSubItem {
  label: string;
  href: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  href?: string;
  badge?: number;
  subItems?: NavSubItem[];
}

export function OperatorSidebar({ 
  className 
}: { 
  activeId?: string; // Kept for prop-drilling compatibility but derived from location
  className?: string; 
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(["po-inbox"]);
  const location = useLocation();

  const toggleExpand = (id: string) => {
    setExpandedItems((prev: string[]) => 
      prev.includes(id) ? prev.filter((i: string) => i !== id) : [...prev, id]
    );
  };

  const NAV_ITEMS: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: "🏠", href: "/operator/dashboard" },
    { 
      id: "orders", 
      label: "Orders", 
      icon: "📦", 
      subItems: [
        { label: "Global Flux", href: "/operator/orders" },
        { label: "PO Inbox", href: "/operator/po/inbox" },
        { label: "PO Outbox", href: "/operator/po/outbox" },
        { label: "Disputes", href: "/operator/disputes" },
      ]
    },
    { 
      id: "bids", 
      label: "Bid Engine", 
      icon: "⚖️", 
      badge: 5,
      subItems: [
        { label: "New Bid", href: "/operator/bids/new" },
        { label: "Active Bids", href: "/operator/bids/demo-bid" },
      ]
    },
    { 
      id: "auto-po", 
      label: "Auto-PO", 
      icon: "🤖", 
      href: "/operator/auto-po" 
    },
    { 
      id: "restaurants", 
      label: "Restaurants", 
      icon: "🏪", 
      href: "/operator/restaurants" 
    },
    { 
      id: "suppliers", 
      label: "Suppliers", 
      icon: "🚚", 
      href: "/operator/suppliers",
      subItems: [
        { label: "Directory", href: "/operator/suppliers" },
        { label: "Vetting Queue", href: "/operator/suppliers/vetting" },
      ]
    },
    { 
      id: "finance", 
      label: "Finance", 
      icon: "💰",
      subItems: [
        { label: "Settlements", href: "/operator/settlement-logs" },
        { label: "Payout Vault", href: "/operator/payouts" },
        { label: "Ledger", href: "/operator/ledger" },
        { label: "Reconciliation", href: "/operator/reconciliation" },
        { label: "Tax Dashboard", href: "/operator/tax" },
        { label: "Credit Notes", href: "/operator/credit-notes" },
      ]
    },
    { 
      id: "analytics", 
      label: "Analytics", 
      icon: "📊",
      subItems: [
        { label: "Revenue Pulse", href: "/operator/revenue" },
        { label: "Sourcing Wizard", href: "/operator/sourcing-wizard" },
        { label: "Demand Forecast", href: "/operator/demand-forecasting" },
      ]
    },
    { 
      id: "catalog", 
      label: "Catalog", 
      icon: "📖", 
      subItems: [
        { label: "Master SKUs", href: "/operator/products" },
        { label: "Taxonomy", href: "/operator/categories" },
      ]
    },
    { 
      id: "strategy", 
      label: "Strategy", 
      icon: "🎯", 
      subItems: [
        { label: "Pricing Rules", href: "/operator/pricing-rules" },
        { label: "Promo Vault", href: "/operator/discounts" },
        { label: "Margin Opt.", href: "/operator/margin-optimization" },
      ]
    },
    { 
      id: "administration", 
      label: "Administration", 
      icon: "⚙️", 
      subItems: [
        { label: "Users", href: "/operator/users" },
        { label: "User Roles", href: "/operator/roles" },
        { label: "Audit Trail", href: "/operator/audit-trail" },
        { label: "System Health", href: "/operator/system-health" },
        { label: "API Keys", href: "/operator/api-keys" },
        { label: "Webhooks", href: "/operator/webhooks" },
        { label: "Marketplace Config", href: "/operator/marketplace-settings" },
      ]
    },
    { 
      id: "automation", 
      label: "Automation", 
      icon: "🤖", 
      subItems: [
        { label: "Orchestration Logic", href: "/operator/automation-logic" },
        { label: "Workflow Schedules", href: "/operator/automation-schedules" },
        { label: "Automation Log", href: "/operator/automation-log" },
      ]
    },
  ];

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={SPRING}
      className={cn(
        "relative h-screen flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50",
        className
      )}
    >
      <div className="p-6 flex items-center justify-between overflow-hidden">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                S
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white tracking-tight">SHOPRO</span>
                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-0.5">Operator</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronRight size={18} className="rotate-180" />}
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {NAV_ITEMS.map((item) => {
          const isExpanded = expandedItems.includes(item.id);
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isActive = item.href ? location.pathname.startsWith(item.href) : (hasSubItems && item.subItems?.some(s => location.pathname === s.href));

          return (
            <div key={item.id} className="space-y-1">
              {item.href && !hasSubItems ? (
                <Link
                  to={item.href}
                  className={cn(
                    "group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                    isActive 
                      ? "bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-100 dark:ring-slate-700" 
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  )}
                >
                  <AnimatePresence>
                    {isActive && (
                      <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <GlowingBorder spread={40} />
                      </div>
                    )}
                  </AnimatePresence>
                  
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  
                  {!isCollapsed && (
                    <span className="text-sm font-semibold truncate">{item.label}</span>
                  )}

                  {item.badge && !isCollapsed && (
                    <span className="ml-auto bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md shadow-indigo-500/30">
                      {item.badge}
                    </span>
                  )}
                  
                  <NeonEdges active={isActive} color="violet" />
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className={cn(
                      "group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                      isActive 
                        ? "text-indigo-600 dark:text-indigo-400 font-semibold" 
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    )}
                  >
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    {!isCollapsed && (
                      <>
                        <span className="text-sm truncate">{item.label}</span>
                        <ChevronDown 
                          size={14} 
                          className={cn("ml-auto transition-transform duration-200", isExpanded ? "rotate-180" : "rotate-0")} 
                        />
                      </>
                    )}
                  </button>

                  <AnimatePresence>
                    {isExpanded && !isCollapsed && hasSubItems && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-11 pr-2 space-y-1"
                      >
                        {item.subItems?.map((sub) => {
                          const isSubActive = location.pathname === sub.href;
                          return (
                            <Link
                              key={sub.href + sub.label}
                              to={sub.href}
                              className={cn(
                                "flex items-center py-2 px-3 text-xs font-medium rounded-lg transition-colors relative",
                                isSubActive
                                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10"
                                  : "text-slate-500 dark:text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-slate-800"
                              )}
                            >
                              {isSubActive && (
                                <motion.div 
                                  layoutId="sub-indicator"
                                  className="absolute left-0 w-1 h-4 bg-indigo-500 rounded-full"
                                />
                              )}
                              {sub.label}
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          );
        })}
      </nav>

      <div className={cn("p-4 mt-auto border-t border-slate-200 dark:border-slate-800", isCollapsed && "items-center")}>
        <div className="p-3 bg-white dark:bg-slate-950 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Admin User</p>
              <p className="text-[10px] text-slate-500 uppercase font-medium truncate tracking-wider">Super Admin</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
