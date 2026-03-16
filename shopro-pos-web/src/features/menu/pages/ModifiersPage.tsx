import { useState } from "react";
import { useModifierGroups } from "../hooks/useModifiers";
import { Button } from "@/components/ui/button";
import { ModifierGroupForm } from "../components/ModifierGroupForm";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

export function ModifiersPage() {
    const { t } = useTranslation();
    const { data: modifierGroups, isLoading, error } = useModifierGroups();
    const [isCreating, setIsCreating] = useState(false);

    if (isCreating) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                    <h1 className="text-2xl font-bold tracking-tight">{t('menu.createModifierHeader')}</h1>
                    <Button variant="ghost" onClick={() => setIsCreating(false)}>{t('common.cancel')}</Button>
                </div>
                <ModifierGroupForm onComplete={() => setIsCreating(false)} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('menu.modifierGroupsHeader')}</h1>
                    <p className="text-muted-foreground text-sm">{t('menu.modifierDesc')}</p>
                </div>
                <Button onClick={() => setIsCreating(true)}>{t('menu.createGroup')}</Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-48 skeleton-shimmer rounded-xl" />)}
                </div>
            ) : error ? (
                <div className="text-red-500">{t('menu.failedLoadModifiers')}</div>
            ) : !modifierGroups || modifierGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted">
                    <p>{t('menu.noModifiersFound')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {modifierGroups.map(group => (
                        <div key={group.id} className="flex flex-col rounded-xl border border-border bg-surface p-5 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-foreground">{group.name}</h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {group.required 
                                            ? t('menu.requiredWithRange', { min: group.minSelections, max: group.maxSelections }) 
                                            : t('menu.optionalWithMax', { max: group.maxSelections })}
                                    </p>
                                </div>
                                {group.required ? (
                                    <Badge variant="destructive">{t('common.required')}</Badge>
                                ) : (
                                    <Badge variant="secondary">{t('common.optional')}</Badge>
                                )}
                            </div>

                            <div className="mt-4 flex-1 space-y-2 rounded-md bg-muted/5 p-3">
                                <h4 className="text-xs font-medium text-muted uppercase tracking-wider">{t('menu.optionsCount', { count: group.options.length })}</h4>
                                <ul className="space-y-1">
                                    {group.options.slice(0, 4).map(opt => (
                                        <li key={opt.id} className="flex justify-between text-sm">
                                            <span>{opt.label}</span>
                                            <span className="text-muted-foreground">
                                                {opt.upchargeAmount > 0 ? `+$${opt.upchargeAmount.toFixed(2)}` : t('menu.free')}
                                            </span>
                                        </li>
                                    ))}
                                    {group.options.length > 4 && (
                                        <li className="text-xs text-muted-foreground italic pt-1">
                                            {t('menu.moreOptions', { count: group.options.length - 4 })}
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
