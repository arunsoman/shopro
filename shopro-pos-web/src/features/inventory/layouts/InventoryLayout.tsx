import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    ChefHat,
    Truck,
    ClipboardList
} from 'lucide-react';

const navItems = [
    {
        label: "Stock Dashboard",
        path: "/inventory/stock",
        icon: <LayoutDashboard className="h-4 w-4" />
    },
    {
        label: "Recipe Builder",
        path: "/inventory/recipes",
        icon: <ChefHat className="h-4 w-4" />
    },
    {
        label: "Vendors & Catalogs",
        path: "/inventory/vendors",
        icon: <Truck className="h-4 w-4" />
    },
    {
        label: "Procurement (RFQs)",
        path: "/inventory/procurement",
        icon: <ClipboardList className="h-4 w-4" />
    },
];

export function InventoryLayout() {
    const location = useLocation();

    return (
        <div className="flex min-h-screen w-full bg-background">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-surface px-4 py-6 shrink-0 transition-colors">
                <div className="mb-8 px-2">
                    <h2 className="text-lg font-semibold tracking-tight">Inventory Control</h2>
                    <p className="text-[11px] text-muted-2 mt-1 uppercase tracking-wider font-bold">
                        Management Suite
                    </p>
                </div>

                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary shadow-sm"
                                        : "text-muted hover:bg-muted/10 hover:text-foreground"
                                )}
                            >
                                <div className={cn(
                                    "p-1.5 rounded-md transition-colors",
                                    isActive ? "bg-background shadow-sm" : "bg-transparent"
                                )}>
                                    {isActive ? React.cloneElement(item.icon, { className: "h-4 w-4 text-primary" }) : item.icon}
                                </div>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto px-2 pt-10">
                    <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">System Status</p>
                        <p className="text-xs font-medium text-foreground mt-1">Connectivity Optimized</p>
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
