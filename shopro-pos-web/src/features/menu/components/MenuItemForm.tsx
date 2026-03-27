import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateMenuItem, useUpdateMenuItem, useUploadMenuItemPhoto } from "../hooks/useMenuItems";
import { useModifierGroups } from "../hooks/useModifiers";
import { CreateMenuItemRequestSchema } from "../schema/menuSchema";
import type { CreateMenuItemRequest, MenuCategoryResponse, MenuItemResponse } from "../schema/menuSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Image as ImageIcon, X } from "lucide-react";

interface MenuItemFormProps {
    categories: MenuCategoryResponse[];
    onComplete: () => void;
    item?: MenuItemResponse;
}

export function MenuItemForm({ categories, onComplete, item }: MenuItemFormProps) {
    const { t } = useTranslation();
    const createItem = useCreateMenuItem();
    const updateItem = useUpdateMenuItem();
    const uploadPhoto = useUploadMenuItemPhoto();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(item?.photoUrl || null);

    const form = useForm<CreateMenuItemRequest>({
        resolver: zodResolver(CreateMenuItemRequestSchema),
        defaultValues: {
            name: item?.name || "",
            description: item?.description || "",
            basePrice: item?.basePrice || 0,
            categoryId: item?.categoryId || "",
            photoUrl: item?.photoUrl || "",
            modifierGroupIds: [], // Current backend doesn't return these in MenuItemResponse yet, needs careful handling if needed
        },
    });

    const { data: modifierGroups } = useModifierGroups();

    const isEditing = !!item;

    const onSubmit = async (data: CreateMenuItemRequest) => {
        try {
            let itemId = item?.id;

            if (isEditing && itemId) {
                await updateItem.mutateAsync({ id: itemId, data });
            } else {
                const newItem = await createItem.mutateAsync(data);
                itemId = newItem.id;
            }

            if (selectedFile && itemId) {
                await uploadPhoto.mutateAsync({ id: itemId, file: selectedFile });
            }

            onComplete();
        } catch (err: any) {
            if (err.details) {
                Object.entries(err.details).forEach(([field, messages]) => {
                    form.setError(field as any, { type: "server", message: (messages as string[])[0] });
                });
            } else {
                form.setError("root", { type: "server", message: err.message || t('menu.failedToSave') });
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setPreviewUrl(item?.photoUrl || null);
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-6 rounded-lg border border-border bg-surface p-6 shadow-sm">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">{t('menu.itemName')}</Label>
                    <Input id="name" placeholder={t('menu.itemNamePlaceholder') || "e.g. Truffle Burger"} {...form.register("name")} />
                    {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="basePrice">{t('menu.basePrice')} ({t('common.currencySymbol')})</Label>
                    <Input id="basePrice" type="number" step="0.01" {...form.register("basePrice", { valueAsNumber: true })} />
                    {form.formState.errors.basePrice && <p className="text-xs text-red-500">{form.formState.errors.basePrice.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="categoryId">{t('menu.category')}</Label>
                    <select
                        id="categoryId"
                        className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none"
                        {...form.register("categoryId")}
                    >
                        <option value="">{t('menu.selectCategory')}</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    {form.formState.errors.categoryId && <p className="text-xs text-red-500">{form.formState.errors.categoryId.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="photoFile">{t('menu.itemPhoto')}</Label>
                    <div className="flex flex-col gap-4">
                        <div className="relative flex h-32 w-48 items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-muted bg-muted/5">
                            {previewUrl ? (
                                <>
                                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={clearFile}
                                        className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                                    >
                                        <X size={12} />
                                    </button>
                                </>
                            ) : (
                                <ImageIcon size={24} className="text-muted-foreground opacity-30" />
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <Input
                                id="photoFile"
                                type="file"
                                accept="image/jpeg,image/png"
                                onChange={handleFileChange}
                                className="cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">{t('menu.description')} ({t('common.optional')})</Label>
                    <textarea
                        id="description"
                        className="flex w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none"
                        rows={3}
                        {...form.register("description")}
                    />
                    {form.formState.errors.description && <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>}
                </div>

                {modifierGroups && modifierGroups.length > 0 && (
                    <div className="space-y-3 pt-2">
                        <Label>{t('menu.modifierGroups')} ({t('common.optional')})</Label>
                        <div className="rounded-md border border-border bg-muted/5 p-4 space-y-2">
                            {modifierGroups.map(group => (
                                <div key={group.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`modifier-${group.id}`}
                                        value={group.id}
                                        className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
                                        {...form.register("modifierGroupIds")}
                                    />
                                    <Label htmlFor={`modifier-${group.id}`} className="font-normal cursor-pointer text-foreground">
                                        {group.name} <span className="text-xs text-muted ml-1">({group.required ? t('common.required') : t('common.optional')})</span>
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {form.formState.errors.root && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/10">
                    {form.formState.errors.root.message}
                </div>
            )}

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={createItem.isPending || updateItem.isPending || uploadPhoto.isPending}>
                    {createItem.isPending || updateItem.isPending || uploadPhoto.isPending ? t('common.processing') : (isEditing ? t('common.saveChanges') : t('menu.createItem'))}
                </Button>
            </div>
        </form>
    );
}
