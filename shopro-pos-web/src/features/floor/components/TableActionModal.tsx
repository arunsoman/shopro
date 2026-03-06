import { useState } from "react";
import { CheckCheck, Trash2, Armchair } from "lucide-react";
import type { TableShapeResponse } from "../schema/floorSchema";
import { TABLE_STATUS_CONFIG } from "./TableShapeBadge";
import { useDeleteTable, useMarkTableClean, useUpdateTableStatus } from "../hooks/useFloor";

interface TableActionModalProps {
    table: TableShapeResponse;
    onClose: () => void;
    onSeatWalkIn: () => void;
}

export function TableActionModal({ table, onClose, onSeatWalkIn }: TableActionModalProps) {
    const config = TABLE_STATUS_CONFIG[table.status];
    const cleanMutation = useMarkTableClean();
    const deleteMutation = useDeleteTable();
    const updateStatusMutation = useUpdateTableStatus();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleMarkClean = async () => {
        await cleanMutation.mutateAsync(table.id);
        onClose();
    };

    const handleStatusChange = async (status: string) => {
        await updateStatusMutation.mutateAsync({ id: table.id, status });
        onClose();
    };

    const handleDelete = async () => {
        await deleteMutation.mutateAsync(table.id);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-80 overflow-hidden">
                {/* Header */}
                <div className={`px-5 py-4 border-b border-zinc-700 flex items-center gap-3`}>
                    <div className={`w-3 h-3 rounded-full border-2 ${config.border} ${config.bg}`} />
                    <div>
                        <h3 className="font-semibold text-white text-base">{table.name}</h3>
                        <p className="text-xs text-zinc-400">{table.capacity} pax · {table.sectionName} · <span className={config.text}>{config.label}</span></p>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-4 space-y-2">
                    {/* Seat walk-in — only AVAILABLE or RESERVED */}
                    {(table.status === "AVAILABLE" || table.status === "RESERVED") && (
                        <button
                            onClick={() => { onSeatWalkIn(); onClose(); }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-700/50 text-emerald-300 text-sm font-medium transition-colors"
                        >
                            <Armchair className="h-4 w-4" />
                            Seat Walk-in Party
                        </button>
                    )}

                    {/* Mark clean — only DIRTY */}
                    {table.status === "DIRTY" && (
                        <button
                            onClick={handleMarkClean}
                            disabled={cleanMutation.isPending}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-teal-900/40 hover:bg-teal-800/60 border border-teal-700/50 text-teal-300 text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            <CheckCheck className="h-4 w-4" />
                            {cleanMutation.isPending ? "Marking clean…" : "Mark Table Clean"}
                        </button>
                    )}

                    {/* Delete — only AVAILABLE */}
                    {table.status === "AVAILABLE" && !confirmDelete && (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-900/20 hover:bg-red-900/40 border border-red-700/30 text-red-400 text-sm font-medium transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                            Remove Table from Layout
                        </button>
                    )}

                    {confirmDelete && (
                        <div className="rounded-lg border border-red-700/50 bg-red-900/20 p-3 space-y-2">
                            <p className="text-xs text-red-300">Remove <strong>{table.name}</strong> from layout? This cannot be undone.</p>
                            <div className="flex gap-2">
                                <button onClick={() => setConfirmDelete(false)} className="flex-1 py-1.5 text-xs rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleteMutation.isPending}
                                    className="flex-1 py-1.5 text-xs rounded bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
                                >
                                    {deleteMutation.isPending ? "Removing…" : "Yes, Remove"}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="pt-3 border-t border-zinc-800">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-2.5">Set Status Manually</p>
                        <div className="grid grid-cols-2 gap-2">
                            {['AVAILABLE', 'OCCUPIED', 'FOOD_SENT', 'RESERVED', 'DIRTY'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(status)}
                                    disabled={table.status === status || updateStatusMutation.isPending}
                                    className={`py-1.5 text-[10px] font-medium rounded border transition-colors ${table.status === status
                                        ? 'bg-indigo-900/40 text-indigo-300 border-indigo-700/50'
                                        : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700 hover:text-white'
                                        }`}
                                >
                                    {status.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button onClick={onClose} className="w-full py-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
