import { Outlet, Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { sideNavItemClass } from '@/components/layout/SideNavItem';
import { Users, Settings, History, LayoutDashboard, BarChart3 } from "lucide-react";

export function CrmLayout() {
    const location = useLocation();

    const navItems = [
        { label: "Guest List", path: "/crm", icon: <Users className="h-4 w-4" /> },
        { label: "Loyalty Tiers", path: "/crm/tiers", icon: <LayoutDashboard className="h-4 w-4" /> },
        { label: "Analytics", path: "/crm/analytics", icon: <BarChart3 className="h-4 w-4" /> },
        { label: "Campaigns", path: "/crm/campaigns", icon: <History className="h-4 w-4" /> },
        { label: "Settings", path: "/crm/settings", icon: <Settings className="h-4 w-4" /> },
    ];

    return (
        <div className="flex min-h-screen w-full bg-background">
            <aside className="w-16 lg:w-64 border-r bg-surface px-3 lg:px-4 py-6 transition-all duration-300 shrink-0 flex flex-col items-center lg:items-stretch">
                <h2 className="mb-6 px-2 text-lg font-semibold tracking-tight hidden lg:block truncate">CRM & Loyalty</h2>
                <nav className="space-y-1 w-full text-center">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                sideNavItemClass(location.pathname === item.path),
                            )}
                            title={item.label}
                        >
                            {item.icon}
                            <span className="hidden lg:block truncate">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </aside>

            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}
