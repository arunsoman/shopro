import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlowingBorder } from "@/components/ui/neon-button";
import { NeonEdges } from "@/components/ui/neon-button";
import { Link, useLocation } from "react-router-dom";

/**
 * SupplierSidebar
 * Adapted from: SidebarNav (shopro-missing-components.tsx)
 * Role: seller (Suppliers)
 */

const SPRING = { type: "spring" as const, stiffness: 400, damping: 25, mass: 1 };

export function SupplierSidebar({ 
  className 
}: { 
  activeId?: string; // Derived from location
  className?: string; 
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  // Nav config as per screen.md
  const NAV_ITEMS = [
    { id: "dashboard",   label: "Dashboard",       icon: "📈", href: "/supplier/dashboard" },
    { id: "catalog",     label: "My Catalog",      icon: "🗂️", href: "/supplier/catalog" },
    { id: "bids",        label: "Bid Invitations", icon: "📧", badge: 3, href: "/supplier/bids" },
    { id: "leads",       label: "Market Leads",    icon: "🎯", href: "/supplier/leads" },
    { id: "orders",      label: "My Orders",       icon: "📦", badge: 8, href: "/supplier/orders" },
    { id: "logistics",   label: "Logistics",       icon: "🚚", href: "/supplier/logistics" },
    { id: "finance",     label: "Finance",         icon: "💰", href: "/supplier/finance" },
    { id: "profile",     label: "Profile",          icon: "🏢", href: "/supplier/profile" },
    { id: "settings",    label: "Settings",         icon: "⚙️", href: "/supplier/settings" },
  ];

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={SPRING}
      className={cn(
        "relative h-screen flex flex-col bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50",
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
              <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white font-bold">
                S
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white tracking-tight">SHOPRO</span>
                <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest mt-0.5">Supplier</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          {isCollapsed ? "»" : "«"}
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.id}
              to={item.href}
              className={cn(
                "group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 overflow-hidden",
                isActive 
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50"
              )}
            >
              <AnimatePresence>
                {isActive && <GlowingBorder spread={40} />}
              </AnimatePresence>
              
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              
              {!isCollapsed && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}

              {item.badge && !isCollapsed && (
                <span className="ml-auto bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
              
              <NeonEdges active={isActive} color="green" />
            </Link>
          );
        })}
      </nav>

      <div className={cn("p-4 mt-auto border-t border-slate-200 dark:border-slate-800", isCollapsed && "items-center")}>
        <div className="p-3 bg-white dark:bg-slate-950 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Global Foods Ltd</p>
              <p className="text-[10px] text-slate-500 uppercase font-medium truncate tracking-wider">Approved Supplier</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
