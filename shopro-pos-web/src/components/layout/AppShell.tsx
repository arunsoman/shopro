import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { Home, LogOut, ChevronRight, Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';
import { useTheme } from '@/lib/theme/ThemeContext';
import { NotificationBadge, NotificationTray } from '@/features/notifications/components/NotificationTray';
import { useState } from 'react';
import logo from '@/assets/logo.jpeg';

/** Derives a readable breadcrumb label from the current URL path. */
function useBreadcrumb() {
    const { pathname } = useLocation();
    const { t } = useTranslation();
    const segments = pathname.replace(/^\//, '').split('/').filter(Boolean);
    if (segments.length === 0) return null;

    const labelMap: Record<string, string> = {
        dashboard: t('common.home', 'Home'),
        menu: t('menu.title', 'Menu'),
        floor: t('floor.title', 'Floor Plan'),
        inventory: t('inventory.title', 'Inventory'),
        crm: t('crm.title', 'CRM & Loyalty'),
        settings: t('settings.title', 'Settings'),
        staff: t('staff.title', 'Staff'),
        stock: t('inventory.stock', 'Stock Dashboard'),
        recipes: t('menu.recipes', 'Recipe Builder'),
        vendors: t('inventory.vendors', 'Vendors & Catalogs'),
        procurement: t('inventory.procurement', 'Procurement (RFQs)'),
        categories: t('menu.categories', 'Categories'),

        items: t('menu.items', 'Items'),
        modifiers: t('menu.modifiers', 'Modifiers'),
        'floor-layout': t('floor.layout', 'Floor Layout'),
        tableside: t('pos.tableside', 'Tableside'),
        security: t('settings.security', 'Permissions'),
        tiers: t('crm.tiers', 'Loyalty Tiers'),
        campaigns: t('crm.campaigns', 'Campaigns'),
    };

    return segments
        .filter(s => s !== 'dashboard')
        .map(s => labelMap[s] ?? s.charAt(0).toUpperCase() + s.slice(1));
}

export function AppShell() {
    const { t } = useTranslation();
    const { session, logout } = useAuth();
    const navigate = useNavigate();
    const breadcrumbs = useBreadcrumb();
    const { theme, toggleTheme } = useTheme();
    const [isNotificationTrayOpen, setIsNotificationTrayOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const getRoleLabel = (role: string) =>
        role.charAt(0) + role.slice(1).toLowerCase().replace('_', ' ');

    return (
        <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
            {/* ---- Sticky top bar ---- */}
            <header className="border-b border-white/10 bg-[#180B33] sticky top-0 z-50 transition-colors">
                <div className="px-4 sm:px-6 h-14 flex items-center gap-3">
                    {/* Logo + Home */}
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-2 shrink-0 group"
                        title={t('common.goHome')}
                    >
                        <img
                            src={logo}
                            alt={t('common.home')}
                            className="h-14 w-auto object-contain group-hover:scale-115 transition-transform"
                        />
                        <Home className="h-3.5 w-3.5 text-white/40 group-hover:text-primary transition-colors hidden sm:block" />
                    </Link>

                    {/* Breadcrumb */}
                    {breadcrumbs && breadcrumbs.length > 0 && (
                        <div className="flex items-center gap-1 text-sm text-white/60 min-w-0">
                            <ChevronRight className="h-3.5 w-3.5 text-white/20 shrink-0" />
                            {breadcrumbs.map((crumb, i) => (
                                <span key={i} className="flex items-center gap-1 min-w-0">
                                    {i > 0 && <ChevronRight className="h-3 w-3 text-white/20 shrink-0" />}
                                    <span className={`truncate ${i === breadcrumbs.length - 1 ? 'text-white font-medium' : 'text-white/60'}`}>
                                        {crumb}
                                    </span>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Theme toggle + Language + User info + logout */}
                    <div className="flex items-center gap-3 shrink-0">
                        <LanguageSelector />

                        <button
                            onClick={toggleTheme}
                             title={t('common.switch_theme', { mode: theme === 'light' ? 'dark' : 'light' })}
                            className="p-2 rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                        >
                            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                        </button>

                        <div className="relative">
                            <button 
                                onClick={() => setIsNotificationTrayOpen(!isNotificationTrayOpen)}
                                title={t('notifications.title')}
                                className="outline-none"
                            >
                                <NotificationBadge />
                            </button>
                            <NotificationTray
                                open={isNotificationTrayOpen}
                                onClose={() => setIsNotificationTrayOpen(false)}
                            />
                        </div>

                        <div className="hidden sm:block text-right border-l border-white/10 pl-3 h-8 flex flex-col justify-center leading-tight">
                            <p className="text-xs font-semibold text-white">{session?.fullName}</p>
                            <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">
                                {session ? t(`roles.${session.role}`, getRoleLabel(session.role)) : ''}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            title={t('auth.logout', 'Logout')}
                            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{t('auth.logout', 'Logout')}</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* ---- Page content ---- */}
            <main className="flex-1 text-foreground overflow-y-auto overflow-x-hidden">
                <Outlet />
            </main>
        </div>
    );
}
