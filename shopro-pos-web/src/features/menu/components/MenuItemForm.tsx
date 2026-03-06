import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateMenuItem, useUploadMenuItemPhoto } from "../hooks/useMenuItems";
import { useModifierGroups } from "../hooks/useModifiers";
import { CreateMenuItemRequestSchema } from "../schema/menuSchema";
import type { CreateMenuItemRequest, MenuCategoryResponse } from "../schema/menuSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface MenuItemFormProps {
    categories: MenuCategoryResponse[];
    onComplete: () => void;
}

export function MenuItemForm({ categories, onComplete }: MenuItemFormProps) {
    const createItem = useCreateMenuItem();
    const uploadPhoto = useUploadMenuItemPhoto();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const form = useForm<CreateMenuItemRequest>({
        resolver: zodResolver(CreateMenuItemRequestSchema),
        defaultValues: {
            name: "",
            description: "",
            basePrice: 0,
            categoryId: "",
            photoUrl: "",
            modifierGroupIds: [],
        },
    });

    const { data: modifierGroups } = useModifierGroups();

    const onSubmit = async (data: CreateMenuItemRequest) => {
        try {
            const newItem = await createItem.mutateAsync(data);

            if (selectedFile) {
                await uploadPhoto.mutateAsync({ id: newItem.id, file: selectedFile });
            }

            onComplete();
        } catch (err: any) {
            if (err.details) {
                // Map backend validation errors (e.g., from DuplicateName logic or Jakarta)
                Object.entries(err.details).forEach(([field, messages]) => {
                    form.setError(field as any, { type: "server", message: (messages as string[])[0] });
                });
            } else {
                form.setError("root", { type: "server", message: err.message || "Failed to create item" });
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-6 rounded-lg border bg-card p-6 shadow-sm">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Item Name</Label>
                    <Input id="name" placeholder="Truffle Burger" {...form.register("name")} />
                    {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="basePrice">Base Price ($)</Label>
                    <Input id="basePrice" type="number" step="0.01" {...form.register("basePrice", { valueAsNumber: true })} />
                    {form.formState.errors.basePrice && <p className="text-xs text-red-500">{form.formState.errors.basePrice.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="categoryId">Category</Label>
                    <select
                        id="categoryId"
                        className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm dark:border-zinc-800"
                        {...form.register("categoryId")}
                    >
                        <option value="">Select a category</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    {form.formState.errors.categoryId && <p className="text-xs text-red-500">{form.formState.errors.categoryId.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="photoFile">Item Photo (Optional)</Label>
                    <div className="flex items-center gap-4">
                        <Input
                            id="photoFile"
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={handleFileChange}
                            className="cursor-pointer"
                        />
                        {selectedFile && (
                            <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                                {selectedFile.name}
                            </div>
                        )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">Max 5MB (JPEG, PNG only)</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <textarea
                        id="description"
                        className="flex w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm dark:border-zinc-800"
                        rows={3}
                        {...form.register("description")}
                    />
                    {form.formState.errors.description && <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>}
                </div>

                {modifierGroups && modifierGroups.length > 0 && (
                    <div className="space-y-3 pt-2">
                        <Label>Modifier Groups (Optional)</Label>
                        <div className="rounded-md border p-4 space-y-2">
                            {modifierGroups.map(group => (
                                <div key={group.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`modifier-${group.id}`}
                                        value={group.id}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        {...form.register("modifierGroupIds")}
                                    />
                                    <Label htmlFor={`modifier-${group.id}`} className="font-normal cursor-pointer">
                                        {group.name} <span className="text-xs text-muted-foreground ml-1">({group.required ? 'Required' : 'Optional'})</span>
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
                <Button type="submit" disabled={createItem.isPending || uploadPhoto.isPending}>
                    {createItem.isPending || uploadPhoto.isPending ? "Processing..." : "Create Item"}
                </Button>
            </div>
        </form>
    );
}
