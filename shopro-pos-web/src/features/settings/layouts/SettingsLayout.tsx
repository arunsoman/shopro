import { NavLink, Outlet } from "react-router-dom";
import { sideNavItemClass } from '@/components/layout/SideNavItem';
import { Settings, Map, Users, Bell, CreditCard, ShieldCheck, Smartphone, Monitor } from "lucide-react";

const NAV_ITEMS = [
    { label: "Floor Plan Layout", icon: Map, href: "/settings/floor-layout" },
    { label: "Tableside Ordering", icon: Smartphone, href: "/settings/tableside" },
    { label: "Kitchen Display (KDS)", icon: Monitor, href: "/settings/kds" },
    { label: "Roles and permission", icon: Users, href: "/settings/staff" },
    { label: "Notifications", icon: Bell, href: "/settings/notifications" },
    { label: "Payments", icon: CreditCard, href: "/settings/payments" },
    { label: "Security", icon: ShieldCheck, href: "/settings/security" },
];

export function SettingsLayout() {
    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            {/* Sidebar */}
            <aside className="w-16 lg:w-64 flex-shrink-0 bg-surface border-r border-border flex flex-col transition-all duration-300 items-center lg:items-stretch">
                <div className="p-6 border-b border-border w-full hidden lg:block">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Settings className="h-5 w-5 text-primary" />
                        </div>
                        <h1 className="font-bold text-lg truncate">Settings</h1>
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
                            System Version
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
