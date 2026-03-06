import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateModifierGroup } from "../hooks/useModifiers";
import { CreateModifierGroupRequestSchema } from "../schema/menuSchema";
import type { CreateModifierGroupRequest } from "../schema/menuSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";

interface ModifierGroupFormProps {
    onComplete: () => void;
}

export function ModifierGroupForm({ onComplete }: ModifierGroupFormProps) {
    const createGroup = useCreateModifierGroup();

    const form = useForm<CreateModifierGroupRequest>({
        resolver: zodResolver(CreateModifierGroupRequestSchema),
        defaultValues: {
            name: "",
            required: false,
            minSelections: 0,
            maxSelections: 1,
            options: [{ label: "", upchargeAmount: 0, displayOrder: 0 }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "options",
    });

    const isRequired = form.watch("required");

    const onSubmit = async (data: CreateModifierGroupRequest) => {
        try {
            await createGroup.mutateAsync(data);
            onComplete();
        } catch (err: any) {
            form.setError("root", { type: "server", message: err.message || "Failed to create modifier group" });
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-3xl space-y-8 rounded-lg border bg-card p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4 md:col-span-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Group Name</Label>
                        <Input id="name" placeholder="e.g., Meat Temperature, Add-ons" {...form.register("name")} />
                        {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                    </div>
                </div>

                <div className="flex flex-col justify-center space-y-2 rounded-md border p-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="required" className="cursor-pointer">Required Modifier?</Label>
                        <Switch
                            id="required"
                            checked={isRequired}
                            onCheckedChange={(checked: boolean) => {
                                form.setValue("required", checked);
                                if (checked && form.getValues("minSelections") < 1) {
                                    form.setValue("minSelections", 1);
                                } else if (!checked) {
                                    form.setValue("minSelections", 0);
                                }
                            }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">If enabled, staff must select an option.</p>
                </div>

                <div className="space-y-4 rounded-md border p-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="minSelections">Min Selections</Label>
                            <Input id="minSelections" type="number" min={0} {...form.register("minSelections", { valueAsNumber: true })} />
                            {form.formState.errors.minSelections && <p className="text-xs text-red-500">{form.formState.errors.minSelections.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxSelections">Max Selections</Label>
                            <Input id="maxSelections" type="number" min={1} {...form.register("maxSelections", { valueAsNumber: true })} />
                            {form.formState.errors.maxSelections && <p className="text-xs text-red-500">{form.formState.errors.maxSelections.message}</p>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="font-semibold text-lg">Options</h3>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ label: "", upchargeAmount: 0, displayOrder: fields.length })}>
                        <Plus className="mr-2 h-4 w-4" /> Add Option
                    </Button>
                </div>

                {form.formState.errors.options?.root && (
                    <p className="text-xs text-red-500">{form.formState.errors.options.root.message}</p>
                )}

                <div className="space-y-3">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-start gap-4 rounded-md border bg-zinc-50 p-3 dark:bg-zinc-900">
                            <div className="flex-1 space-y-2">
                                <Label className="text-xs text-muted-foreground">Option Label</Label>
                                <Input placeholder="e.g. Rare, Extra Cheese" {...form.register(`options.${index}.label`)} />
                                {form.formState.errors.options?.[index]?.label && (
                                    <p className="text-xs text-red-500">{form.formState.errors.options[index]?.label?.message}</p>
                                )}
                            </div>
                            <div className="w-32 space-y-2">
                                <Label className="text-xs text-muted-foreground">Upcharge ($)</Label>
                                <Input type="number" step="0.01" min={0} {...form.register(`options.${index}.upchargeAmount`, { valueAsNumber: true })} />
                                {form.formState.errors.options?.[index]?.upchargeAmount && (
                                    <p className="text-xs text-red-500">{form.formState.errors.options[index]?.upchargeAmount?.message}</p>
                                )}
                            </div>
                            <div className="pt-6">
                                <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20" onClick={() => remove(index)} disabled={fields.length === 1}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {form.formState.errors.root && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/10">
                    {form.formState.errors.root.message}
                </div>
            )}

            <div className="flex justify-end border-t pt-4">
                <Button type="submit" disabled={createGroup.isPending}>
                    {createGroup.isPending ? "Saving..." : "Save Modifier Group"}
                </Button>
            </div>
        </form>
    );
}
