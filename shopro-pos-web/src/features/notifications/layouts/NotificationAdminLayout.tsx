import { NavLink, Outlet } from 'react-router-dom';
import { sideNavItemClass } from '@/components/layout/SideNavItem';
import { LayoutDashboard, Send, FileText, Settings, Key, Network } from 'lucide-react';

export function NotificationAdminLayout() {
    return (
        <div className="flex h-full w-full bg-background">
            {/* Sidebar */}
            <aside className="w-16 lg:w-64 border-r border-border bg-surface flex flex-col transition-all duration-300 items-center lg:items-stretch shrink-0">
                <div className="p-4 border-b border-border w-full hidden lg:block">
                    <h2 className="text-lg font-heading font-bold tracking-tight truncate">Notification Engine</h2>
                    <p className="text-sm text-muted-foreground mt-1 truncate">Admin Console</p>
                </div>

                <nav className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-6 w-full">
                    <div className="space-y-1">
                        <NavLink
                            to="/admin/notifications/dashboard"
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium justify-center lg:justify-start ${sideNavItemClass(isActive)}`
                            }
                            title="Dashboard"
                        >
                            <LayoutDashboard size={18} className="shrink-0" />
                            <span className="hidden lg:block truncate">Dashboard</span>
                        </NavLink>
                    </div>

                    <div>
                        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 hidden lg:block">Dispatch</h3>
                        <div className="space-y-1">
                            <NavLink
                                to="/admin/notifications/send"
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium justify-center lg:justify-start ${sideNavItemClass(isActive)}`
                                }
                                title="Manual Send"
                            >
                                <Send size={18} className="shrink-0" />
                                <span className="hidden lg:block truncate">Manual Send</span>
                            </NavLink>
                            <NavLink
                                to="/admin/notifications/logs"
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium justify-center lg:justify-start ${sideNavItemClass(isActive)}`
                                }
                                title="Delivery Logs"
                            >
                                <FileText size={18} className="shrink-0" />
                                <span className="hidden lg:block truncate">Delivery Logs</span>
                            </NavLink>
                        </div>
                    </div>

                    <div>
                        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 hidden lg:block">Config</h3>
                        <div className="space-y-1">
                            <NavLink
                                to="/admin/notifications/types"
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium justify-center lg:justify-start ${sideNavItemClass(isActive)}`
                                }
                                title="Types & Templates"
                            >
                                <Settings size={18} className="shrink-0" />
                                <span className="hidden lg:block truncate">Types & Templates</span>
                            </NavLink>
                            <NavLink
                                to="/admin/notifications/channels"
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium justify-center lg:justify-start ${sideNavItemClass(isActive)}`
                                }
                                title="Channels"
                            >
                                <Key size={18} className="shrink-0" />
                                <span className="hidden lg:block truncate">Channels</span>
                            </NavLink>
                            <NavLink
                                to="/admin/notifications/routing"
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium justify-center lg:justify-start ${sideNavItemClass(isActive)}`
                                }
                                title="Routing Matrix"
                            >
                                <Network size={18} className="shrink-0" />
                                <span className="hidden lg:block truncate">Routing Matrix</span>
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
