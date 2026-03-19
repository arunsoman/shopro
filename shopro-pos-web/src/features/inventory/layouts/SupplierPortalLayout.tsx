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
import { sideNavItemClass } from '@/components/layout/SideNavItem';
import { NotificationBadge, NotificationTray } from '@/features/notifications/components/NotificationTray';

import { useTranslation } from 'react-i18next';

export const SupplierPortalLayout: React.FC = () => {
    const { t } = useTranslation();
    const { session, logout } = useSupplierAuth();
    const location = useLocation();
    const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);

    const notificationUser = session ? { id: session.userId, role: session.role } : undefined;

    const navigation = [
        { name: t('supplierPortal.dashboard'), href: '/supplier/dashboard', icon: LayoutDashboard },
        { name: t('supplierPortal.activeRfqs'), href: '/supplier/rfqs', icon: ClipboardList },
        { name: t('supplierPortal.purchaseOrders'), href: '/supplier/pos', icon: Package },
        { name: t('supplierPortal.inventoryView'), href: '/supplier/inventory', icon: Package },
        { name: t('supplierPortal.priceProposals'), href: '/supplier/proposals', icon: TrendingUp },
    ];

    if (!session) return <Outlet />;

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <aside className="w-16 lg:w-64 border-r nav-panel-bg flex flex-col transition-all duration-300 items-center lg:items-stretch">
                <div className="p-6 border-b w-full hidden lg:block">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                            V
                        </div>
                        <div className="overflow-hidden">
                            <h2 className="font-bold text-foreground truncate">{t('supplierPortal.title')}</h2>
                            <p className="text-xs text-muted-foreground truncate">{session.supplierName}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-3 lg:p-4 space-y-1 w-full text-center">
                    {navigation.map((item) => (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                 sideNavItemClass(location.pathname === item.href),
                             )}
                            title={item.name}
                        >
                            <item.icon className="h-4 w-4 shrink-0" />
                            <span className="hidden lg:block truncate">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t space-y-4 w-full">
                    <div className="flex items-center gap-3 px-3 py-2 justify-center lg:justify-start">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="overflow-hidden hidden lg:block">
                            <p className="text-sm font-medium text-foreground truncate">{session.fullName}</p>
                            <p className="text-xs text-muted-foreground capitalize">{session.role.replace('SUPPLIER_', '').toLowerCase()}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-center lg:justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={logout}
                        title={t('supplierPortal.logout')}
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        <span className="hidden lg:block">{t('supplierPortal.logout')}</span>
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 border-b bg-surface border-border flex items-center justify-between px-8">
                    <h1 className="text-lg font-semibold text-foreground">
                        {navigation.find(n => n.href === location.pathname)?.name || t('common.portal', 'Portal')}
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

                <div className="flex-1 p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
