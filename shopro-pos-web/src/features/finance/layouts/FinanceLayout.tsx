import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { sideNavItemClass } from '@/components/layout/SideNavItem';
import { LayoutDashboard, PieChart, TableProperties, BarChart3, History } from 'lucide-react';

export function FinanceLayout() {
    const { t } = useTranslation();
    const location = useLocation();

    const navItems = [
        {
            label: t('finance.overview', 'Overview'),
            path: "/finance",
            icon: <LayoutDashboard className="h-4 w-4" />
        },
        {
            label: t('finance.ledger', 'Journal Ledger'),
            path: "/finance/ledger",
            icon: <History className="h-4 w-4" />
        },
        {
            label: t('finance.pnl', 'Profit & Loss'),
            path: "/finance/pnl",
            icon: <BarChart3 className="h-4 w-4" />
        },
        {
            label: t('finance.balanceSheet', 'Balance Sheet'),
            path: "/finance/balance",
            icon: <PieChart className="h-4 w-4" />
        },
        {
            label: t('finance.accounts', 'Chart of Accounts'),
            path: "/finance/accounts",
            icon: <TableProperties className="h-4 w-4" />
        },
    ];

    return (
        <div className="flex min-h-screen w-full bg-background animate-in fade-in duration-300">
            {/* Sidebar */}
            <aside className="w-16 lg:w-64 border-r nav-panel-bg px-3 lg:px-4 py-6 shrink-0 transition-all duration-300 flex flex-col items-center lg:items-stretch">
                <div className="mb-8 px-2 hidden lg:block">
                    <h2 className="text-lg font-semibold tracking-tight truncate">{t('finance.title', 'Financial Reports')}</h2>
                    <p className="text-[11px] text-muted-2 mt-1 uppercase tracking-wider font-bold truncate">
                        Management Suite
                    </p>
                </div>

                <nav className="space-y-1 w-full text-center">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    sideNavItemClass(isActive),
                                )}
                                title={item.label}
                            >
                                <div className={cn(
                                    "p-1.5 rounded-md transition-colors shrink-0",
                                    isActive ? "shadow-sm border border-primary/20 bg-primary/5" : "bg-transparent"
                                )}>
                                    {isActive ? React.cloneElement(item.icon, { className: "h-4 w-4 text-primary" }) : item.icon}
                                </div>
                                <span className="hidden lg:block truncate">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto px-2 pt-10 hidden lg:block">
                    <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">Financial Integrity</p>
                        <p className="text-xs font-medium text-foreground mt-1">Double-entry verified</p>
                        <div className="mt-2 h-1 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-full animate-pulse" />
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-8 bg-background overflow-auto">
                <div className="mx-auto max-w-7xl">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default FinanceLayout;
