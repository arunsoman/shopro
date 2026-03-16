import { Outlet, Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { sideNavItemClass } from '@/components/layout/SideNavItem';
import { Coffee, Grid, LayoutList, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

export function MenuDashboard() {
    const location = useLocation();
    const { t } = useTranslation();

    const navItems = [
        { label: t('menu.overview'), path: "/menu", icon: <Grid className="h-4 w-4" /> },
        { label: t('menu.categories'), path: "/menu/categories", icon: <LayoutList className="h-4 w-4" /> },
        { label: t('menu.items'), path: "/menu/items", icon: <Coffee className="h-4 w-4" /> },
        { label: t('menu.modifiers'), path: "/menu/modifiers", icon: <Settings className="h-4 w-4" /> },
    ];

    return (
        <div className="flex min-h-screen w-full bg-background">
            <aside className="w-16 lg:w-64 border-r bg-surface px-3 lg:px-4 py-6 transition-all duration-300 flex flex-col items-center lg:items-stretch shrink-0">
                <h2 className="mb-6 px-2 text-lg font-semibold tracking-tight hidden lg:block truncate">{t('menu.manager')}</h2>
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

            <main className="flex-1 overflow-auto p-8">
                <div className="mx-auto max-w-5xl">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
