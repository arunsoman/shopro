import { NavLink, Outlet } from "react-router-dom";
import { sideNavItemClass } from '@/components/layout/SideNavItem';
import { Settings, Map, Users, Bell, CreditCard, ShieldCheck, Smartphone, Monitor } from "lucide-react";

import { useTranslation } from "react-i18next";

export function SettingsLayout() {
    const { t } = useTranslation();
    
    const NAV_ITEMS = [
        { label: t('settings.floorLayout'), icon: Map, href: "/settings/floor-layout" },
        { label: t('settings.tableside'), icon: Smartphone, href: "/settings/tableside" },
        { label: t('settings.kds'), icon: Monitor, href: "/settings/kds" },
        { label: t('settings.roles'), icon: Users, href: "/settings/staff" },
        { label: t('settings.notifications'), icon: Bell, href: "/settings/notifications" },
        { label: t('settings.payments'), icon: CreditCard, href: "/settings/payments" },
        { label: t('settings.security'), icon: ShieldCheck, href: "/settings/security" },
    ];
    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            {/* Sidebar */}
            <aside className="w-16 lg:w-64 flex-shrink-0 bg-surface border-r border-border flex flex-col transition-all duration-300 items-center lg:items-stretch">
                <div className="p-6 border-b border-border w-full hidden lg:block">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Settings className="h-5 w-5 text-primary" />
                        </div>
                        <h1 className="font-bold text-lg truncate">{t('settings.title')}</h1>
                    </div>
                </div>

                <nav className="flex-1 p-3 lg:p-4 space-y-1 w-full text-center">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            className={({ isActive }) => sideNavItemClass(isActive)}
                            title={item.label}
                        >
                            <item.icon className="h-4.5 w-4.5 shrink-0" />
                            <span className="hidden lg:block truncate">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-border w-full hidden lg:block">
                    <div className="p-3 rounded-lg bg-muted/10 border border-border">
                        <p className="text-[10px] text-muted-2 uppercase tracking-widest font-bold mb-1">
                            {t('common.systemVersion', 'System Version')}
                        </p>
                        <p className="text-xs text-muted-foreground">v1.2.4-stable</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 overflow-auto relative">
                <div className="p-10 max-w-5xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
