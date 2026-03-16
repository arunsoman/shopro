import React, { useState } from "react";
import { useMenuCategories, useCreateMenuCategory, useReorderMenuCategories } from "../hooks/useMenuCategories";
import { CategoryDraggableList } from "../components/CategoryDraggableList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import type { MenuCategoryResponse } from "../schema/menuSchema";

export function CategoriesPage() {
    const { t } = useTranslation();
    const { data: categories, isLoading, error } = useMenuCategories();
    const createCategory = useCreateMenuCategory();
    const reorderCategories = useReorderMenuCategories();

    const [isCreating, setIsCreating] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleCreate = async () => {
        if (!newCategoryName.trim()) return;
        try {
            await createCategory.mutateAsync({ name: newCategoryName });
            setNewCategoryName("");
            setIsCreating(false);
            setErrorMsg(null);
        } catch (err: any) {
            setErrorMsg(err.message || t('menu.failedCreateCategory'));
        }
    };

    const handleReorder = (newIds: string[]) => {
        // Optimistically update the UI is handled by react-dnd state, this sends the array
        reorderCategories.mutate({ categoryIds: newIds });
    };

    const handleEdit = (category: MenuCategoryResponse) => {
        // Open edit dialog/slide-over
        console.log("Edit requested for", category);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('menu.categories')}</h1>
                    <p className="text-muted-foreground text-sm">{t('menu.categoriesDesc')}</p>
                </div>
                <Button onClick={() => setIsCreating(true)}>{t('menu.createCategory')}</Button>
            </div>

            {isCreating && (
                <div className="flex items-center gap-3 rounded-md border bg-card p-4 shadow-sm">
                    <Input
                        value={newCategoryName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategoryName(e.target.value)}
                        placeholder={t('menu.categoryPlaceholder')}
                        autoFocus
                    />
                    <Button onClick={handleCreate} disabled={createCategory.isPending}>
                        {createCategory.isPending ? t('common.wait') : t('common.save')}
                    </Button>
                    <Button variant="ghost" onClick={() => { setIsCreating(false); setErrorMsg(null); }}>
                        {t('common.cancel')}
                    </Button>
                    {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
                </div>
            )}

            {isLoading ? (
                <div className="space-y-2">
                    {[1, 2, 3].map(i => <div key={i} className="h-14 skeleton-shimmer rounded-md" />)}
                </div>
            ) : error ? (
                <div className="text-red-500">{t('menu.failedLoadCategories')}</div>
            ) : (
                <CategoryDraggableList
                    categories={categories || []}
                    onReorder={handleReorder}
                    onEdit={handleEdit}
                />
            )
            }
        </div >
    );
}
