import { NavLink, Outlet } from "react-router-dom";
import { Settings, Map, Users, Bell, CreditCard, ShieldCheck, Smartphone, Monitor } from "lucide-react";

const NAV_ITEMS = [
    { label: "Floor Plan Layout", icon: Map, href: "/settings/floor-layout" },
    { label: "Tableside Ordering", icon: Smartphone, href: "/settings/tableside" },
    { label: "Kitchen Display (KDS)", icon: Monitor, href: "/settings/kds" },
    { label: "Staff & Permissions", icon: Users, href: "/settings/staff" },
    { label: "Notifications", icon: Bell, href: "/settings/notifications" },
    { label: "Payments", icon: CreditCard, href: "/settings/payments" },
    { label: "Security", icon: ShieldCheck, href: "/settings/security" },
];

export function SettingsLayout() {
    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-surface border-r border-border flex flex-col transition-colors">
                <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Settings className="h-5 w-5 text-primary" />
                        </div>
                        <h1 className="font-bold text-lg">Settings</h1>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${isActive
                                    ? "bg-primary text-primary-fore shadow-lg shadow-primary/20"
                                    : "text-muted hover:text-foreground hover:bg-muted/10 border border-transparent"
                                }`
                            }
                        >
                            <item.icon className="h-4.5 w-4.5" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-border">
                    <div className="p-3 rounded-lg bg-muted/10 border border-border">
                        <p className="text-[10px] text-muted-2 uppercase tracking-widest font-bold mb-1">
                            System Version
                        </p>
                        <p className="text-xs text-muted">v1.2.4-stable</p>
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
