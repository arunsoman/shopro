import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ClipboardList,
    Package,
    TrendingUp,
    LogOut,
    User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupplierAuth } from '@/features/auth/SupplierAuthContext';
import { cn } from '@/lib/utils';
import { NotificationBadge, NotificationTray } from '@/features/notifications/components/NotificationTray';

export const SupplierPortalLayout: React.FC = () => {
    const { session, logout } = useSupplierAuth();
    const location = useLocation();
    const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);

    const notificationUser = session ? { id: session.userId, role: session.role } : undefined;

    const navigation = [
        { name: 'Dashboard', href: '/supplier/dashboard', icon: LayoutDashboard },
        { name: 'Active RFQs', href: '/supplier/rfqs', icon: ClipboardList },
        { name: 'Purchase Orders', href: '/supplier/pos', icon: Package },
        { name: 'Inventory View', href: '/supplier/inventory', icon: Package },
        { name: 'Price Proposals', href: '/supplier/proposals', icon: TrendingUp },
    ];

    if (!session) return <Outlet />;

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-white dark:bg-slate-900 flex flex-col">
                <div className="p-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                            V
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 dark:text-slate-100">Supplier Portal</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate w-32">{session.supplierName}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                location.pathname === item.href
                                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t space-y-4">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-slate-500" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{session.userName}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{session.role.replace('SUPPLIER_', '').toLowerCase()}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={logout}
                    >
                        <LogOut className="h-4 w-4" />
                        Log Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 border-b bg-white dark:bg-slate-900 flex items-center justify-between px-8">
                    <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        {navigation.find(n => n.href === location.pathname)?.name || 'Portal'}
                    </h1>
                    <div className="flex items-center gap-4 relative">
                        <NotificationBadge
                            user={notificationUser}
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        />
                        <NotificationTray
                            open={isNotificationsOpen}
                            onClose={() => setIsNotificationsOpen(false)}
                            user={notificationUser}
                        />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
