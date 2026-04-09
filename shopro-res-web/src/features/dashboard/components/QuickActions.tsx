import { useAppStore, type Screen } from '@/App';
import { Warehouse, BookOpen, Map, Settings, TrendingUp, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

export const QuickActions = () => {
    const navigate = useAppStore(s => s.navigate);

    const ACTIONS = [
        { label: 'Inventory Master', icon: Warehouse, screen: 'inventory-ingredients' as Screen, color: 'bg-emerald-500' },
        { label: 'Recipes & Menu', icon: BookOpen, screen: 'recipes' as Screen, color: 'bg-blue-500' },
        { label: 'Floor Map', icon: Map, screen: 'dashboard' as Screen, color: 'bg-amber-500' },
        { label: 'Purchasing', icon: ShoppingCart, screen: 'purchasing' as Screen, color: 'bg-indigo-500' },
        { label: 'Engineering', icon: TrendingUp, screen: 'engineering' as Screen, color: 'bg-violet-500' },
        { label: 'Settings', icon: Settings, screen: 'dashboard' as Screen, color: 'bg-slate-500' },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {ACTIONS.map((action) => (
                <button
                    key={action.screen}
                    onClick={() => navigate(action.screen)}
                    className="flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-6 bg-surface border border-border/50 rounded-2xl sm:rounded-[28px] hover:border-primary/30 transition-all hover:shadow-lg group active:scale-95"
                >
                    <div className={cn(
                        "w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110",
                        action.color
                    )}>
                        <action.icon size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground text-center">
                        {action.label}
                    </span>
                </button>
            ))}
        </div>
    );
};


