import { useState } from "react";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Wallet, 
  FileText, 
  CheckCircle2, 
  Layers,
  LayoutDashboard
} from "lucide-react";
import FinanceOverview from "./FinanceOverview";
import SupplierInvoices from "./Invoices";
import SupplierSettlements from "./Settlements";
import SupplierLedger from "./Ledger";

export default function FinanceHub() {
  const location = useLocation();
  
  const TABS = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, href: "/supplier/finance/overview" },
    { id: "invoices", label: "Invoices", icon: FileText, href: "/supplier/finance/invoices" },
    { id: "settlements", label: "Settlements", icon: CheckCircle2, href: "/supplier/finance/settlements" },
    { id: "ledger", label: "Ledger", icon: Layers, href: "/supplier/finance/ledger" },
  ];

  const activeTab = TABS.find(tab => location.pathname.startsWith(tab.href)) || TABS[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sub-Navigation Bar */}
      <div className="sticky top-0 z-[40] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Wallet size={20} />
             </div>
             <h2 className="text-(--text-lg) font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">Finance <span className="text-emerald-500">Vault</span></h2>
          </div>

          <nav className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            {TABS.map((tab) => {
              const isActive = location.pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.id}
                  to={tab.href}
                  className={cn(
                    "relative px-6 py-2.5 rounded-xl text-(--text-xs) font-bold transition-all flex items-center gap-2",
                    isActive 
                      ? "text-slate-900 dark:text-white" 
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                  )}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white dark:bg-slate-700 rounded-xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-600"
                    />
                  )}
                  <tab.icon size={16} className="relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Routes>
          <Route path="overview" element={<FinanceOverview />} />
          <Route path="invoices" element={<SupplierInvoices />} />
          <Route path="settlements" element={<SupplierSettlements />} />
          <Route path="ledger" element={<SupplierLedger />} />
          <Route path="*" element={<Navigate to="overview" replace />} />
        </Routes>
      </div>
    </div>
  );
}
