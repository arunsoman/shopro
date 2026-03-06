import React, { useState } from 'react';
import { RecipeBuilder } from '../components/RecipeBuilder';
import { useMenuItems } from '../hooks/useInventory';
import { ChefHat, Loader2, UtensilsCrossed } from 'lucide-react';

export const RecipesPage: React.FC = () => {
    const { data: menuItems, isLoading } = useMenuItems();
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const selected = menuItems?.find(m => m.id === selectedId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24 text-muted">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading menu items…
            </div>
        );
    }

    if (!menuItems || menuItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-muted gap-3">
                <UtensilsCrossed className="h-10 w-10 opacity-40" />
                <p className="text-sm">No menu items found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>

                <h1 className="text-4xl font-bold tracking-tight text-foreground">Recipe Builder</h1>
                <p className="text-muted mt-2">
                    Define ingredient requirements and calculate precise food costing for your menu items.
                </p>
            </div>

            <div className="space-y-6">
                {/* Grid of all menu item recipe cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {menuItems.map(item => {
                        const isActive = selectedId === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setSelectedId(isActive ? null : item.id)}
                                className={`
                                    group flex flex-col items-center gap-2 p-4 rounded-xl border text-left
                                    transition-all duration-200 cursor-pointer select-none
                                    ${isActive
                                        ? 'border-primary bg-primary/10 shadow-md shadow-primary/10 scale-[1.02]'
                                        : 'border-border bg-surface hover:border-primary/40 hover:bg-surface-2 hover:scale-[1.01]'
                                    }
                                `}
                            >
                                <div className={`
                                    h-10 w-10 rounded-lg flex items-center justify-center transition-colors
                                    ${isActive ? 'bg-primary text-white' : 'bg-primary/10 text-primary group-hover:bg-primary/20'}
                                `}>
                                    <ChefHat className="h-5 w-5" />
                                </div>
                                <span className={`text-xs font-medium text-center leading-snug line-clamp-2 ${isActive ? 'text-primary' : 'text-foreground'}`}>
                                    {item.name}
                                </span>
                                {item.category && (
                                    <span className="text-[10px] text-muted truncate w-full text-center">{item.category}</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Expanded Recipe Builder for selected item */}
                {selected && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                        <RecipeBuilder
                            key={selected.id}
                            menuItemId={selected.id}
                            menuItemName={selected.name}
                        />
                    </div>
                )}

                {!selectedId && (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-xl bg-muted/5">
                        <ChefHat className="h-12 w-12 text-muted mb-4 opacity-20" />
                        <p className="text-sm text-muted">
                            Select a menu item above to build or manage its recipe
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecipesPage;
