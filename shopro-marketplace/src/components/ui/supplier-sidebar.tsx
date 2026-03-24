import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, Inbox, Zap, Wallet, Truck, User, Settings as SettingsIcon, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { IconTooltip } from "@/components/shared/IconTooltip";
import { GlowingBorder, NeonEdges } from "@/components/ui/neon-button";

const SPRING = { type: "spring" as const, stiffness: 400, damping: 25, mass: 1 };

export function SupplierSidebar({ 
  className 
}: { 
  activeId?: string; // Derived from location
  className?: string; 
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const { data: stats } = useQuery({
    queryKey: ["supplier-dashboard-stats"],
    queryFn: async () => {
      const resp = await api.get("/supplier/dashboard/stats");
      return resp.data;
    }
  });

  // Nav config as per screen.md
  const NAV_ITEMS = [
    { id: "dashboard",   label: "Home",             icon: LayoutDashboard, href: "/supplier/dashboard" },
    { id: "inventory",   label: "My Catalog",       icon: Package, href: "/supplier/inventory" },
    { id: "bids-pos",    label: "Orders & Bids",    icon: Inbox, badge: stats?.activeOrders, href: "/supplier/bids-pos" },
    { id: "leads",       label: "Opportunities",    icon: Zap, href: "/supplier/leads" },
    { id: "finance",     label: "Earnings",         icon: Wallet, href: "/supplier/finance/overview" },
    { id: "logistics",   label: "Deliveries",       icon: Truck, href: "/supplier/logistics" },
    { id: "profile",     label: "Company Profile",  icon: User, href: "/supplier/profile" },
    { id: "settings",    label: "Preferences",      icon: SettingsIcon, href: "/supplier/settings" },
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
              
              <div className="flex-none shrink-0 group-hover:scale-110 transition-transform duration-500">
                <IconTooltip label={item.label} side="right">
                  <item.icon size={22} className={cn(
                    "transition-all duration-500",
                    isActive 
                      ? "text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] scale-110" 
                      : "text-slate-500 group-hover:text-emerald-400"
                  )} />
                </IconTooltip>
              </div>
              
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
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {stats?.companyName || "Loading..."}
              </p>
              <p className="text-[10px] text-slate-500 uppercase font-medium truncate tracking-wider">Approved Supplier</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
