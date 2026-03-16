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
import { useTranslation } from 'react-i18next';

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
    'OWNER', 'MANAGER', 'GENERAL_MANAGER', 'ASSISTANT_MANAGER', 'FB_MANAGER',
    'KITCHEN_MANAGER', 'EXECUTIVE_CHEF', 'SOUS_CHEF', 'CHEF_DE_PARTIE',
    'LINE_COOK', 'PREP_COOK', 'DISHWASHER', 'MAITRE_D', 'HOST',
    'BARTENDER', 'BUSSER', 'RUNNER', 'SENIOR_SERVER', 'JUNIOR_SERVER',
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
        href: '/inventory/stock',
        icon: <Package className="h-7 w-7" />,
        gradient: 'from-emerald-500 to-green-600',
        iconColor: 'text-emerald-500',
        roles: ['OWNER', 'MANAGER', 'GENERAL_MANAGER', 'KITCHEN_MANAGER', 'EXECUTIVE_CHEF'],
        badge: 'Live Depletion',
    },
    {
        title: 'Supplier Portal',
        description: 'Manage vendor relationships, track bid performance, and monitor active RFQs.',
        href: '/inventory/vendors',
        icon: <Truck className="h-7 w-7" />,
        gradient: 'from-blue-500 to-indigo-600',
        iconColor: 'text-blue-500',
        roles: ADMIN_ROLES,
        badge: 'Staff View',
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
        title: 'Roles and permission',
        description: 'Define what each role can see and do across the entire POS system.',
        href: '/settings/staff',
        icon: <ShieldCheck className="h-7 w-7" />,
        gradient: 'from-yellow-500 to-amber-600',
        roles: ['OWNER'],
    },
    {
        title: 'Taxes & Compliance',
        description: 'Manage jurisdiction, tax rules, VAT inclusive pricing, and regional compliance.',
        href: '/taxes',
        icon: <Package className="h-7 w-7" />,
        gradient: 'from-amber-500 to-orange-600',
        iconColor: 'text-amber-500',
        roles: ADMIN_ROLES,
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
    const { t } = useTranslation();

    const translatedCards = [
        {
            ...NAV_CARDS[0],
            title: t('dashboard.floorTitle'),
            description: t('dashboard.floorDesc'),
        },
        {
            ...NAV_CARDS[1],
            title: t('dashboard.menuTitle'),
            description: t('dashboard.menuDesc'),
        },
        {
            ...NAV_CARDS[2],
            title: t('dashboard.inventoryTitle'),
            description: t('dashboard.inventoryDesc'),
        },
        {
            ...NAV_CARDS[3],
            title: t('dashboard.suppliersTitle'),
            description: t('dashboard.suppliersDesc'),
        },
        {
            ...NAV_CARDS[4],
            title: t('dashboard.crmTitle'),
            description: t('dashboard.crmDesc'),
        },
        {
            ...NAV_CARDS[5],
            title: t('dashboard.staffTitle'),
            description: t('dashboard.staffDesc'),
        },
        {
            ...NAV_CARDS[6],
            title: t('dashboard.rolesTitle'),
            description: t('dashboard.rolesDesc'),
        },
        {
            ...NAV_CARDS[7],
            title: t('dashboard.taxesTitle'),
            description: t('dashboard.taxesDesc'),
        },
        {
            ...NAV_CARDS[8],
            title: t('dashboard.settingsTitle'),
            description: t('dashboard.settingsDesc'),
        },
    ];

    const visibleCards = translatedCards.filter(card => hasRole(card.roles));

    return (
        <div className="max-w-7xl mx-auto px-6">
            {/* Hero greeting */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-12 pb-10">
                <div className="flex-1">
                    <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest mb-2">
                        {t('dashboard.welcome')}
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">
                        {session?.fullName?.split(' ')[0]},&nbsp;
                        <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                            {t('dashboard.question')}
                        </span>
                    </h1>
                    <p className="mt-3 text-muted-foreground max-w-xl">
                        {t('dashboard.description', { count: visibleCards.length })}
                    </p>
                </div>
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
                                <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                                    {card.description}
                                </p>

                                <div className="mt-5 flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                    {t('dashboard.openModule')}
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
