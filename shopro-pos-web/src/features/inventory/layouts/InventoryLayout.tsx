import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { sideNavItemClass } from '@/components/layout/SideNavItem';
import {
    LayoutDashboard,
    ChefHat,
    Truck,
    ClipboardList,
    Clock,
    Zap,
    Trash2,
    BarChart3
} from 'lucide-react';

export function InventoryLayout() {
    const { t } = useTranslation();
    const location = useLocation();

    const internalItems = [
        {
            label: t('inventory.dashboard.title'),
            path: "/inventory/stock",
            icon: <LayoutDashboard className="h-4 w-4" />
        },
        {
            label: t('inventory.perishables.title', 'Daily Perishables'),
            path: "/inventory/perishables",
            icon: <Zap className="h-4 w-4" />
        },
        {
            label: t('inventory.expiry.title', 'Expiry Monitor'),
            path: "/inventory/expiry",
            icon: <Clock className="h-4 w-4" />
        },
        {
            label: t('inventory.waste.title', 'Waste & Donations'),
            path: "/inventory/waste",
            icon: <Trash2 className="h-4 w-4" />
        },
        {
            label: t('inventory.shelfLife.title', 'Rotation & Shelf Life'),
            path: "/inventory/shelf-life",
            icon: <Clock className="h-4 w-4" />
        },
        {
            label: t('inventory.yield.title', 'Yield & Variance'),
            path: "/inventory/yield",
            icon: <BarChart3 className="h-4 w-4" />
        },
        {
            label: t('menu.recipes'),
            path: "/inventory/recipes",
            icon: <ChefHat className="h-4 w-4" />
        },
    ];

    const procurementItems = [
        {
            label: t('inventory.registry.title'),
            path: "/inventory/vendors",
            icon: <Truck className="h-4 w-4" />
        },
        {
            label: t('inventory.procurement'),
            path: "/inventory/procurement",
            icon: <ClipboardList className="h-4 w-4" />
        },
        {
            label: t('inventory.dashboard.tabs.orders'),
            path: "/inventory/pos",
            icon: <Truck className="h-4 w-4" />
        },
    ];

    // Determine which module set to show based on the current path
    const isProcurementPath = location.pathname.includes('/vendors') || 
                             location.pathname.includes('/procurement') ||
                             location.pathname.includes('/pos');
    const navItems = isProcurementPath ? procurementItems : internalItems;
    const title = isProcurementPath ? t('inventory.registry.portalTitle', 'Supplier Portal') : t('inventory.dashboard.controlTitle', 'Inventory Control');
    const subtitle = isProcurementPath ? t('inventory.registry.procurementStaff', 'Procurement Staff') : t('inventory.dashboard.mgmtSuite', 'Management Suite');

    return (
        <div className="flex min-h-screen w-full bg-background animate-in fade-in duration-300">
            {/* Sidebar */}
            <aside className="w-16 lg:w-64 border-r bg-surface px-3 lg:px-4 py-6 shrink-0 transition-all duration-300 flex flex-col items-center lg:items-stretch">
                <div className="mb-8 px-2 hidden lg:block">
                    <h2 className="text-lg font-semibold tracking-tight truncate">{title}</h2>
                    <p className="text-[11px] text-muted-2 mt-1 uppercase tracking-wider font-bold truncate">
                        {subtitle}
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
                                    isActive ? "bg-background shadow-sm" : "bg-transparent"
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
                        <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">{t('common.systemStatus')}</p>
                        <p className="text-xs font-medium text-foreground mt-1">{t('common.connectivityOpt')}</p>
                        <div className="mt-2 h-1 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-full animate-pulse" />
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto p-8 bg-background">
                <div className="mx-auto max-w-7xl">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default InventoryLayout;
