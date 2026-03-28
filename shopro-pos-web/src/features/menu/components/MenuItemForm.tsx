import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateMenuItem, useUpdateMenuItem, useUploadMenuItemPhoto } from "../hooks/useMenuItems";
import { useModifierGroups } from "../hooks/useModifiers";
import { useIngredients, useSubRecipes, useRecipe } from "../../inventory/hooks/useInventory";
import { CreateMenuItemRequestSchema } from "../schema/menuSchema";
import type { CreateMenuItemRequest, MenuCategoryResponse, MenuItemResponse } from "../schema/menuSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Image as ImageIcon, X, Plus, Trash2, Clock, ChefHat, Layers, Settings2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

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
    
    // Fetch dependencies
    const { data: modifierGroups } = useModifierGroups();
    const { data: allIngredients } = useIngredients(0, 100);
    const { data: allSubRecipes } = useSubRecipes();
    const { data: existingRecipe } = useRecipe(item?.id || "", false);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(item?.photoUrl || null);
    const [activeTab, setActiveTab] = useState("general");

    const form = useForm<CreateMenuItemRequest>({
        resolver: zodResolver(CreateMenuItemRequestSchema),
        defaultValues: {
            name: item?.name || "",
            description: item?.description || "",
            basePrice: item?.basePrice || 0,
            categoryId: item?.categoryId || "",
            photoUrl: item?.photoUrl || "",
            preparationTimeMinutes: (item as any)?.preparationTimeMinutes || 10,
            modifierGroupIds: (item as any)?.modifierGroupResponses?.map((g: any) => g.id) || [],
            recipeIngredients: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "recipeIngredients",
    });

    // Load existing recipe into form
    useEffect(() => {
        if (existingRecipe?.ingredients) {
            const formatted = existingRecipe.ingredients.map(ri => ({
                ingredientId: ri.ingredientId || undefined,
                subRecipeId: ri.subRecipeId || undefined,
                quantity: ri.quantity
            }));
            form.setValue("recipeIngredients", formatted);
        }
    }, [existingRecipe, form]);

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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-muted/20 p-1">
                    <TabsTrigger value="general" className="flex items-center gap-2">
                        <Settings2 className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('menu.generalTab')}</span>
                    </TabsTrigger>
                    <TabsTrigger value="modifiers" className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('menu.modifiersTab')}</span>
                    </TabsTrigger>
                    <TabsTrigger value="inventory" className="flex items-center gap-2">
                        <ChefHat className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('menu.inventoryTab')}</span>
                    </TabsTrigger>
                    <TabsTrigger value="media" className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('menu.mediaTab')}</span>
                    </TabsTrigger>
                </TabsList>

                {/* GENERAL INFO */}
                <TabsContent value="general" className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('menu.itemName')}</Label>
                                <Input id="name" placeholder="e.g. Truffle Burger" {...form.register("name")} className="bg-background" />
                                {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="categoryId">{t('menu.category')}</Label>
                                <select
                                    id="categoryId"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    {...form.register("categoryId")}
                                >
                                    <option value="">{t('menu.selectCategory')}</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                {form.formState.errors.categoryId && <p className="text-xs text-red-500">{form.formState.errors.categoryId.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="basePrice">{t('menu.basePrice')} ({t('common.currencySymbol')})</Label>
                                <Input id="basePrice" type="number" step="0.01" {...form.register("basePrice", { valueAsNumber: true })} className="bg-background" />
                                {form.formState.errors.basePrice && <p className="text-xs text-red-500">{form.formState.errors.basePrice.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="preparationTime" className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    {t('menu.preparationTime')} ({t('common.minutesShort')})
                                </Label>
                                <Input id="preparationTime" type="number" {...form.register("preparationTimeMinutes", { valueAsNumber: true })} className="bg-background" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">{t('menu.description')}</Label>
                        <textarea
                            id="description"
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            placeholder={t('menu.descriptionPlaceholder') || "Describe your item..."}
                            {...form.register("description")}
                        />
                    </div>
                </TabsContent>

                {/* MODIFIERS */}
                <TabsContent value="modifiers" className="space-y-4 pt-6">
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <Label className="mb-4 block text-lg font-medium">{t('menu.modifierGroups')}</Label>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {modifierGroups?.map(group => (
                                <label
                                    key={group.id}
                                    className={cn(
                                        "flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-all hover:bg-muted/50",
                                        form.watch("modifierGroupIds")?.includes(group.id) ? "border-primary bg-primary/5" : "border-border"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            value={group.id}
                                            className="h-4 w-4 rounded border-primary text-primary"
                                            {...form.register("modifierGroupIds")}
                                        />
                                        <div>
                                            <p className="font-medium">{group.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {group.required ? t('common.required') : t('common.optional')} • {group.options.length} {t('menu.options')}
                                            </p>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                {/* INVENTORY / RECIPE */}
                <TabsContent value="inventory" className="space-y-6 pt-6">
                    <div className="rounded-xl border bg-card shadow-sm">
                        <div className="flex items-center justify-between border-b p-6">
                            <div>
                                <h3 className="text-lg font-medium">{t('menu.recipeBuilder')}</h3>
                                <p className="text-sm text-muted-foreground">{t('menu.recipeDesc')}</p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ ingredientId: "", quantity: 0 })}
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                {t('menu.addIngredient')}
                            </Button>
                        </div>
                        
                        <div className="p-6">
                            {fields.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <ChefHat className="mb-2 h-12 w-12 opacity-20" />
                                    <p>{t('menu.noIngredients')}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex items-end gap-4 rounded-lg border bg-muted/10 p-4">
                                            <div className="flex-1 space-y-2">
                                                <Label>{t('menu.ingredientOrSubRecipe')}</Label>
                                                <select
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                                    {...form.register(`recipeIngredients.${index}.ingredientId` as const)}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val.startsWith("sub:")) {
                                                            form.setValue(`recipeIngredients.${index}.subRecipeId`, val.replace("sub:", ""));
                                                            form.setValue(`recipeIngredients.${index}.ingredientId`, undefined);
                                                        } else {
                                                            form.setValue(`recipeIngredients.${index}.ingredientId`, val);
                                                            form.setValue(`recipeIngredients.${index}.subRecipeId`, undefined);
                                                        }
                                                    }}
                                                >
                                                    <option value="">{t('menu.selectIngredient')}</option>
                                                    <optgroup label={t('menu.rawIngredients')}>
                                                        {allIngredients?.content.map(ing => (
                                                            <option key={ing.id} value={ing.id}>{ing.name} ({ing.unitOfMeasure})</option>
                                                        ))}
                                                    </optgroup>
                                                    <optgroup label={t('menu.subRecipes')}>
                                                        {allSubRecipes?.map(sr => (
                                                            <option key={sr.id} value={`sub:${sr.id}`}>{sr.name} ({sr.unitOfMeasure})</option>
                                                        ))}
                                                    </optgroup>
                                                </select>
                                            </div>

                                            <div className="w-32 space-y-2">
                                                <Label>{t('menu.quantity')}</Label>
                                                <Input
                                                    type="number"
                                                    step="0.0001"
                                                    {...form.register(`recipeIngredients.${index}.quantity` as const, { valueAsNumber: true })}
                                                    className="bg-background"
                                                />
                                            </div>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => remove(index)}
                                                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* MEDIA */}
                <TabsContent value="media" className="space-y-6 pt-6">
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
                        <div className="relative mb-6 h-48 w-64 overflow-hidden rounded-2xl border bg-muted/30 shadow-inner">
                            {previewUrl ? (
                                <>
                                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={clearFile}
                                        className="absolute right-3 top-3 rounded-full bg-red-500 p-2 text-white shadow-lg hover:bg-red-600 transition-transform active:scale-95"
                                    >
                                        <X size={16} />
                                    </button>
                                </>
                            ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center gap-3">
                                    <ImageIcon size={48} className="text-muted-foreground opacity-20" />
                                    <p className="text-sm text-muted-foreground">{t('menu.noImageSelected')}</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="max-w-xs space-y-4">
                            <h3 className="text-lg font-medium">{t('menu.uploadNewImage')}</h3>
                            <p className="text-xs text-muted-foreground">{t('menu.imageRequirements')}</p>
                            <Input
                                id="photoFile"
                                type="file"
                                accept="image/jpeg,image/png"
                                onChange={handleFileChange}
                                className="cursor-pointer"
                            />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {form.formState.errors.root && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/10">
                    {form.formState.errors.root.message}
                </div>
            )}

            <div className="sticky bottom-0 flex items-center justify-between border-t bg-background/80 py-6 backdrop-blur-sm">
                <div className="hidden sm:block">
                    {isEditing && (
                        <p className="text-xs text-muted-foreground italic">
                            {t('menu.editWarning')}
                        </p>
                    )}
                </div>
                <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={onComplete}>
                        {t('common.cancel')}
                    </Button>
                    <Button 
                        type="submit" 
                        size="lg"
                        disabled={createItem.isPending || updateItem.isPending || uploadPhoto.isPending}
                        className="px-8"
                    >
                        {createItem.isPending || updateItem.isPending || uploadPhoto.isPending 
                            ? t('common.processing') 
                            : (isEditing ? t('common.saveChanges') : t('menu.createItem'))
                        }
                    </Button>
                </div>
            </div>
        </form>
    );
}
