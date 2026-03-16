import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { sideNavItemClass } from '@/components/layout/SideNavItem';
import { LayoutDashboard, Send, FileText, Settings, Key, Network } from 'lucide-react';

export function NotificationAdminLayout() {
    const { t } = useTranslation();
    return (
        <div className="flex h-full w-full bg-background">
            {/* Sidebar */}
            <aside className="w-16 lg:w-64 border-r border-border bg-surface flex flex-col transition-all duration-300 items-center lg:items-stretch shrink-0">
                <div className="p-4 border-b border-border w-full hidden lg:block">
                    <h2 className="text-lg font-heading font-bold tracking-tight truncate">{t('notificationsAdmin.engineTitle')}</h2>
                    <p className="text-sm text-muted-foreground mt-1 truncate">{t('notificationsAdmin.adminConsole')}</p>
                </div>

                <nav className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-6 w-full">
                    <div className="space-y-1">
                        <NavLink
                            to="/admin/notifications/dashboard"
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium justify-center lg:justify-start ${sideNavItemClass(isActive)}`
                            }
                            title={t('notificationsAdmin.dashboard')}
                        >
                            <LayoutDashboard size={18} className="shrink-0" />
                            <span className="hidden lg:block truncate">{t('notificationsAdmin.dashboard')}</span>
                        </NavLink>
                    </div>

                    <div>
                        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 hidden lg:block">{t('notificationsAdmin.dispatch')}</h3>
                        <div className="space-y-1">
                            <NavLink
                                to="/admin/notifications/send"
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium justify-center lg:justify-start ${sideNavItemClass(isActive)}`
                                }
                                title={t('notificationsAdmin.manualSend')}
                            >
                                <Send size={18} className="shrink-0" />
                                <span className="hidden lg:block truncate">{t('notificationsAdmin.manualSend')}</span>
                            </NavLink>
                            <NavLink
                                to="/admin/notifications/logs"
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium justify-center lg:justify-start ${sideNavItemClass(isActive)}`
                                }
                                title={t('notificationsAdmin.deliveryLogs')}
                            >
                                <FileText size={18} className="shrink-0" />
                                <span className="hidden lg:block truncate">{t('notificationsAdmin.deliveryLogs')}</span>
                            </NavLink>
                        </div>
                    </div>

                    <div>
                        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 hidden lg:block">{t('notificationsAdmin.config')}</h3>
                        <div className="space-y-1">
                            <NavLink
                                to="/admin/notifications/types"
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium justify-center lg:justify-start ${sideNavItemClass(isActive)}`
                                }
                                title={t('notificationsAdmin.typesTemplates')}
                            >
                                <Settings size={18} className="shrink-0" />
                                <span className="hidden lg:block truncate">{t('notificationsAdmin.typesTemplates')}</span>
                            </NavLink>
                            <NavLink
                                to="/admin/notifications/channels"
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium justify-center lg:justify-start ${sideNavItemClass(isActive)}`
                                }
                                title={t('notificationsAdmin.channels')}
                            >
                                <Key size={18} className="shrink-0" />
                                <span className="hidden lg:block truncate">{t('notificationsAdmin.channels')}</span>
                            </NavLink>
                            <NavLink
                                to="/admin/notifications/routing"
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium justify-center lg:justify-start ${sideNavItemClass(isActive)}`
                                }
                                title={t('notificationsAdmin.routingMatrix')}
                            >
                                <Network size={18} className="shrink-0" />
                                <span className="hidden lg:block truncate">{t('notificationsAdmin.routingMatrix')}</span>
                            </NavLink>
                        </div>
                    </div>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}
