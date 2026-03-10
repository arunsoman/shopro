import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Send, FileText, Settings, Key, Network } from 'lucide-react';

export function NotificationAdminLayout() {
    return (
        <div className="flex h-full w-full bg-background">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-surface flex flex-col">
                <div className="p-4 border-b border-border">
                    <h2 className="text-lg font-heading font-bold tracking-tight">Notification Engine</h2>
                    <p className="text-sm text-muted mt-1">Admin Console</p>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div className="space-y-1">
                        <NavLink
                            to="/admin/notifications/dashboard"
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium ${isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted hover:text-foreground hover:bg-muted/10'
                                }`
                            }
                        >
                            <LayoutDashboard size={18} />
                            Dashboard
                        </NavLink>
                    </div>

                    <div>
                        <h3 className="px-3 text-xs font-semibold text-muted uppercase tracking-wider mb-2">Dispatch</h3>
                        <div className="space-y-1">
                            <NavLink
                                to="/admin/notifications/send"
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted hover:text-foreground hover:bg-muted/10'
                                    }`
                                }
                            >
                                <Send size={18} />
                                Manual Send
                            </NavLink>
                            <NavLink
                                to="/admin/notifications/logs"
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted hover:text-foreground hover:bg-muted/10'
                                    }`
                                }
                            >
                                <FileText size={18} />
                                Delivery Logs
                            </NavLink>
                        </div>
                    </div>

                    <div>
                        <h3 className="px-3 text-xs font-semibold text-muted uppercase tracking-wider mb-2">Config</h3>
                        <div className="space-y-1">
                            <NavLink
                                to="/admin/notifications/types"
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted hover:text-foreground hover:bg-muted/10'
                                    }`
                                }
                            >
                                <Settings size={18} />
                                Types & Templates
                            </NavLink>
                            <NavLink
                                to="/admin/notifications/channels"
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted hover:text-foreground hover:bg-muted/10'
                                    }`
                                }
                            >
                                <Key size={18} />
                                Channels
                            </NavLink>
                            <NavLink
                                to="/admin/notifications/routing"
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted hover:text-foreground hover:bg-muted/10'
                                    }`
                                }
                            >
                                <Network size={18} />
                                Routing Matrix
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
