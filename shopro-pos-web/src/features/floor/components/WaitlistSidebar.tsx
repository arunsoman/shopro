import { useState } from "react";
import { Clock, Phone, Bell, X, UserPlus } from "lucide-react";
import type { WaitlistEntryResponse } from "../schema/floorSchema";
import { useAddToWaitlist, useNotifyGuest, useRemoveFromWaitlist } from "../hooks/useFloor";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createWaitlistEntrySchema, type CreateWaitlistEntryInput } from "../schema/floorSchema";

interface WaitlistSidebarProps {
    entries: WaitlistEntryResponse[];
    onDragStart: (entry: WaitlistEntryResponse) => void;
    onDragEnd: () => void;
}

function WaitTime({ estimatedMinutes }: { estimatedMinutes?: number }) {
    if (!estimatedMinutes) return null;
    return (
        <span className="flex items-center gap-1 text-xs text-muted">
            <Clock className="h-3 w-3" />~{estimatedMinutes} min wait
        </span>
    );
}

function AddGuestForm({ onClose }: { onClose: () => void }) {
    const addMutation = useAddToWaitlist();
    const { register, handleSubmit, formState: { errors } } = useForm<CreateWaitlistEntryInput>({
        resolver: zodResolver(createWaitlistEntrySchema),
        defaultValues: { partySize: 2 }
    });

    const onSubmit = async (data: CreateWaitlistEntryInput) => {
        const payload = { ...data, guestPhone: data.guestPhone || undefined };
        await addMutation.mutateAsync(payload);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-3 bg-surface-2 rounded-lg border border-border mb-3 space-y-2">
            <div>
                <input
                    {...register("guestName")}
                    placeholder="Guest name *"
                    className="w-full bg-surface border border-border rounded px-2 py-1.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary"
                />
                {errors.guestName && <p className="text-red-400 text-xs mt-0.5">{errors.guestName.message}</p>}
            </div>
            <div className="flex gap-2">
                <div className="flex-1">
                    <input
                        {...register("partySize", { valueAsNumber: true })}
                        type="number"
                        placeholder="Party size *"
                        min={1}
                        className="w-full bg-surface border border-border rounded px-2 py-1.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary"
                    />
                    {errors.partySize && <p className="text-red-400 text-xs mt-0.5">{errors.partySize.message}</p>}
                </div>
                <div className="flex-1">
                    <input
                        {...register("guestPhone")}
                        placeholder="Phone (optional)"
                        className="w-full bg-surface border border-border rounded px-2 py-1.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary"
                    />
                </div>
            </div>
            <div className="flex gap-2">
                <button type="button" onClick={onClose} className="flex-1 px-3 py-1.5 text-xs rounded bg-surface/50 border border-border text-muted hover:bg-surface hover:text-foreground">Cancel</button>
                <button type="submit" disabled={addMutation.isPending} className="btn-primary flex-1 px-3 py-1.5 text-xs rounded shadow-none disabled:opacity-50">
                    {addMutation.isPending ? "Adding…" : "Add Guest"}
                </button>
            </div>
        </form>
    );
}

export function WaitlistSidebar({ entries, onDragStart, onDragEnd }: WaitlistSidebarProps) {
    const [showForm, setShowForm] = useState(false);
    const notifyMutation = useNotifyGuest();
    const removeMutation = useRemoveFromWaitlist();

    return (
        <aside className="w-64 flex-shrink-0 flex flex-col bg-surface border-r border-border h-full overflow-hidden">
            {/* Header */}
            <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                    Waitlist
                    {entries.length > 0 && (
                        <span className="ml-1.5 bg-primary text-primary-fore text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {entries.length}
                        </span>
                    )}
                </span>
                <button
                    onClick={() => setShowForm(v => !v)}
                    className="flex items-center gap-1 text-xs text-primary hover:opacity-80 transition-colors"
                >
                    <UserPlus className="h-3.5 w-3.5" />
                    Add
                </button>
            </div>

            {/* Add form */}
            <div className="px-3 pt-2">
                {showForm && <AddGuestForm onClose={() => setShowForm(false)} />}
            </div>

            {/* Entry list */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {entries.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-32 text-muted text-xs text-center px-4">
                        <span>No guests waiting.</span>
                        <span className="mt-1 text-muted-2">Tap "Add" to add a walk-in.</span>
                    </div>
                )}

                {entries.map((entry) => (
                    <div
                        key={entry.id}
                        draggable
                        onDragStart={() => onDragStart(entry)}
                        onDragEnd={onDragEnd}
                        className="bg-surface-2 border border-border rounded-lg p-2.5 cursor-grab active:cursor-grabbing select-none hover:border-primary/50 transition-colors group"
                    >
                        <div className="flex items-start justify-between gap-1">
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{entry.guestName}</p>
                                <p className="text-xs text-muted">{entry.partySize} guests</p>
                                <WaitTime estimatedMinutes={entry.estimatedWaitMinutes} />
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                {entry.guestPhone && entry.status === "WAITING" && (
                                    <button
                                        onClick={() => notifyMutation.mutate(entry.id)}
                                        title="Notify guest by SMS"
                                        className="p-1 rounded text-muted hover:text-primary hover:bg-surface-3 transition-colors"
                                    >
                                        <Bell className="h-3.5 w-3.5" />
                                    </button>
                                )}
                                <button
                                    onClick={() => removeMutation.mutate(entry.id)}
                                    title="Remove from waitlist"
                                    className="p-1 rounded text-muted hover:text-error hover:bg-surface-3 transition-colors"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                        {entry.status === "NOTIFIED" && (
                            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-primary font-medium">
                                <Bell className="h-2.5 w-2.5" />
                                Notified — dragging seats them
                            </div>
                        )}
                        {entry.guestPhone && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-muted">
                                <Phone className="h-2.5 w-2.5" />
                                {entry.guestPhone}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </aside>
    );
}
