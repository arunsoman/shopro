import { Link } from 'react-router-dom';
import { useAuth, ADMIN_ROLES, type StaffRole } from '@/lib/auth/AuthContext';
import {
    LayoutGrid,
    UtensilsCrossed,
    Package,
    Settings,
    UserCog,
    ShieldCheck,
    Heart,
    ChevronRight,
    Truck,
} from 'lucide-react';

interface NavCard {
    title: string;
    description: string;
    href: string;
    icon: React.ReactNode;
    gradient: string;
    roles: StaffRole[];
    badge?: string;
    iconColor?: string;
}

const ALL_ROLES: StaffRole[] = [
    'OWNER', 'MANAGER', 'HOST', 'HOSTESS', 'SERVER',
    'CASHIER', 'BUSSER', 'CHEF', 'LINE_COOK', 'EXPEDITOR',
];

const NAV_CARDS: NavCard[] = [
    {
        title: 'Floor Plan',
        description: 'Manage tables, seating, and live order status across your dining area.',
        href: '/floor',
        icon: <LayoutGrid className="h-7 w-7" />,
        gradient: 'from-sky-500 to-blue-600',
        iconColor: 'text-sky-500',
        roles: ALL_ROLES,
    },
    {
        title: 'Menu Management',
        description: 'Build and publish your menu — categories, items, modifiers, and photos.',
        href: '/menu',
        icon: <UtensilsCrossed className="h-7 w-7" />,
        gradient: 'from-orange-500 to-red-600',
        iconColor: 'text-orange-500',
        roles: ADMIN_ROLES,
    },
    {
        title: 'Inventory',
        description: 'Track ingredient stock levels, costs, and automated kitchen depletion.',
        href: '/inventory',
        icon: <Package className="h-7 w-7" />,
        gradient: 'from-emerald-500 to-green-600',
        iconColor: 'text-emerald-500',
        roles: ['OWNER', 'MANAGER', 'CHEF'],
        badge: 'Live Depletion',
    },
    {
        title: 'Supplier Portal',
        description: 'Manage vendor relationships, track bid performance, and monitor active RFQs.',
        href: '/inventory', // Linking to inventory for now until dedicated supplier module exists
        icon: <Truck className="h-7 w-7" />,
        gradient: 'from-blue-500 to-indigo-600',
        iconColor: 'text-blue-500',
        roles: ADMIN_ROLES,
        badge: 'New',
    },
    {
        title: 'CRM & Loyalty',
        description: 'Manage guest profiles, loyalty points, tiers, and marketing campaigns.',
        href: '/crm',
        icon: <Heart className="h-7 w-7" />,
        gradient: 'from-pink-500 to-rose-600',
        roles: ADMIN_ROLES,
        badge: 'New',
    },
    {
        title: 'Staff Management',
        description: 'Add staff, assign roles, manage PINs and performance records.',
        href: '/settings/staff',
        icon: <UserCog className="h-7 w-7" />,
        gradient: 'from-violet-500 to-purple-600',
        roles: ADMIN_ROLES,
    },
    {
        title: 'Role & Permissions',
        description: 'Define what each role can see and do across the entire POS system.',
        href: '/settings/security',
        icon: <ShieldCheck className="h-7 w-7" />,
        gradient: 'from-yellow-500 to-amber-600',
        roles: ['OWNER'],
    },
    {
        title: 'Settings',
        description: 'Configure floor layout, tableside ordering, payments, and notifications.',
        href: '/settings',
        icon: <Settings className="h-7 w-7" />,
        gradient: 'from-slate-500 to-gray-700',
        roles: ADMIN_ROLES,
    },
];

export function DashboardPage() {
    const { session, hasRole } = useAuth();
    const visibleCards = NAV_CARDS.filter(card => hasRole(card.roles));

    return (
        <div className="max-w-7xl mx-auto px-6">
            {/* Hero greeting */}
            <div className="pt-12 pb-10">
                <p className="text-muted text-sm font-medium uppercase tracking-widest mb-2">
                    Welcome back
                </p>
                <h1 className="text-4xl font-bold tracking-tight text-foreground">
                    {session?.fullName?.split(' ')[0]},&nbsp;
                    <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                        what are we doing today?
                    </span>
                </h1>
                <p className="mt-3 text-muted max-w-xl">
                    Select a section below to get started. You have access to{' '}
                    <span className="text-foreground font-medium">{visibleCards.length} modules</span> based on your role.
                </p>
            </div>

            {/* Cards grid */}
            <div className="pb-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {visibleCards.map((card) => (
                        <Link
                            key={card.href}
                            to={card.href}
                            className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:border-primary/50 hover:bg-surface/80 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5"
                        >
                            {/* Gradient blob */}
                            <div className={`absolute -top-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br ${card.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300 blur-xl`} />

                            <div className="relative">
                                <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${card.gradient} mb-5 shadow-sm text-white`}>
                                    {card.icon}
                                </div>

                                {card.badge && (
                                    <span className="absolute top-0 right-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                        {card.badge}
                                    </span>
                                )}

                                <h2 className="text-lg font-semibold text-foreground mb-1.5 font-display">
                                    {card.title}
                                </h2>
                                <p className="text-sm text-muted leading-relaxed group-hover:text-foreground transition-colors">
                                    {card.description}
                                </p>

                                <div className="mt-5 flex items-center gap-1 text-xs font-medium text-muted group-hover:text-primary transition-colors">
                                    Open module
                                    <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
