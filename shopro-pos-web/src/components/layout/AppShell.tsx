import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { Home, LogOut, ChevronRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme/ThemeContext';
import logo from '@/assets/logo.jpeg';

/** Derives a readable breadcrumb label from the current URL path. */
function useBreadcrumb() {
    const { pathname } = useLocation();
    const segments = pathname.replace(/^\//, '').split('/').filter(Boolean);
    if (segments.length === 0) return null;

    const labelMap: Record<string, string> = {
        dashboard: 'Home',
        menu: 'Menu',
        floor: 'Floor Plan',
        inventory: 'Inventory',
        crm: 'CRM & Loyalty',
        settings: 'Settings',
        staff: 'Staff',
        stock: 'Stock Dashboard',
        recipes: 'Recipe Builder',
        vendors: 'Vendors & Catalogs',
        procurement: 'Procurement (RFQs)',
        categories: 'Categories',

        items: 'Items',
        modifiers: 'Modifiers',
        'floor-layout': 'Floor Layout',
        tableside: 'Tableside',
        security: 'Permissions',
        tiers: 'Loyalty Tiers',
        campaigns: 'Campaigns',
    };

    return segments
        .filter(s => s !== 'dashboard')
        .map(s => labelMap[s] ?? s.charAt(0).toUpperCase() + s.slice(1));
}

export function AppShell() {
    const { session, logout } = useAuth();
    const navigate = useNavigate();
    const breadcrumbs = useBreadcrumb();
    const { theme, toggleTheme } = useTheme();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const getRoleLabel = (role: string) =>
        role.charAt(0) + role.slice(1).toLowerCase().replace('_', ' ');

    return (
        <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
            {/* ---- Sticky top bar ---- */}
            <header className="border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
                <div className="px-4 sm:px-6 h-14 flex items-center gap-3">
                    {/* Logo + Home */}
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-2 shrink-0 group"
                        title="Go Home"
                    >
                        <img
                            src={logo}
                            alt="Shopro POS"
                            className="h-8 w-auto object-contain group-hover:scale-105 transition-transform"
                        />
                        <Home className="h-3.5 w-3.5 text-muted group-hover:text-primary transition-colors hidden sm:block" />
                    </Link>

                    {/* Breadcrumb */}
                    {breadcrumbs && breadcrumbs.length > 0 && (
                        <div className="flex items-center gap-1 text-sm text-muted min-w-0">
                            <ChevronRight className="h-3.5 w-3.5 text-muted/30 shrink-0" />
                            {breadcrumbs.map((crumb, i) => (
                                <span key={i} className="flex items-center gap-1 min-w-0">
                                    {i > 0 && <ChevronRight className="h-3 w-3 text-muted/30 shrink-0" />}
                                    <span className={`truncate ${i === breadcrumbs.length - 1 ? 'text-foreground font-medium' : 'text-muted'}`}>
                                        {crumb}
                                    </span>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Theme toggle + User info + logout */}
                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            onClick={toggleTheme}
                            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                            className="p-2 rounded-md hover:bg-muted/10 text-muted hover:text-foreground transition-colors"
                        >
                            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                        </button>

                        <div className="hidden sm:block text-right leading-none border-l border-border pl-3 h-8 flex flex-col justify-center">
                            <p className="text-xs font-medium text-foreground">{session?.fullName}</p>
                            <p className="text-[11px] text-muted mt-0.5">
                                {session ? getRoleLabel(session.role) : ''}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Logout"
                            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted hover:text-foreground hover:bg-muted/10 transition-colors border border-transparent hover:border-border"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* ---- Page content ---- */}
            <main className="flex-1 text-foreground">
                <Outlet />
            </main>
        </div>
    );
}
