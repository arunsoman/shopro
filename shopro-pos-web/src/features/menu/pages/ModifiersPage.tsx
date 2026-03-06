import { useState } from "react";
import { useModifierGroups } from "../hooks/useModifiers";
import { Button } from "@/components/ui/button";
import { ModifierGroupForm } from "../components/ModifierGroupForm";
import { Badge } from "@/components/ui/badge";

export function ModifiersPage() {
    const { data: modifierGroups, isLoading, error } = useModifierGroups();
    const [isCreating, setIsCreating] = useState(false);

    if (isCreating) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                    <h1 className="text-2xl font-bold tracking-tight">Create Modifier Group</h1>
                    <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                </div>
                <ModifierGroupForm onComplete={() => setIsCreating(false)} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Modifier Groups</h1>
                    <p className="text-muted-foreground text-sm">Define required and optional choices for your menu items.</p>
                </div>
                <Button onClick={() => setIsCreating(true)}>+ Create Group</Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-48 skeleton-shimmer rounded-xl" />)}
                </div>
            ) : error ? (
                <div className="text-red-500">Failed to load modifier groups.</div>
            ) : !modifierGroups || modifierGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                    <p>No modifier groups found. Create one to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {modifierGroups.map(group => (
                        <div key={group.id} className="flex flex-col rounded-xl border bg-card p-5 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold">{group.name}</h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {group.required ? `Required (Min: ${group.minSelections}, Max: ${group.maxSelections})` : `Optional (Max: ${group.maxSelections})`}
                                    </p>
                                </div>
                                {group.required ? (
                                    <Badge variant="destructive">Required</Badge>
                                ) : (
                                    <Badge variant="secondary">Optional</Badge>
                                )}
                            </div>

                            <div className="mt-4 flex-1 space-y-2 rounded-md bg-zinc-50 p-3 dark:bg-zinc-900/50">
                                <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Options ({group.options.length})</h4>
                                <ul className="space-y-1">
                                    {group.options.slice(0, 4).map(opt => (
                                        <li key={opt.id} className="flex justify-between text-sm">
                                            <span>{opt.label}</span>
                                            <span className="text-muted-foreground">
                                                {opt.upchargeAmount > 0 ? `+$${opt.upchargeAmount.toFixed(2)}` : 'Free'}
                                            </span>
                                        </li>
                                    ))}
                                    {group.options.length > 4 && (
                                        <li className="text-xs text-muted-foreground italic pt-1">
                                            + {group.options.length - 4} more options...
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
