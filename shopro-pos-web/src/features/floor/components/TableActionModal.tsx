import { useState } from "react";
import { CheckCheck, Trash2, Armchair } from "lucide-react";
import type { TableShapeResponse } from "../schema/floorSchema";
import { TABLE_STATUS_CONFIG } from "./TableShapeBadge";
import { useDeleteTable, useMarkTableClean, useUpdateTableStatus } from "../hooks/useFloor";

interface TableActionModalProps {
    table: TableShapeResponse;
    onClose: () => void;
}

export function TableActionModal({ table, onClose }: TableActionModalProps) {
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

            {/* Modal - Premium Glassmorphism */}
            <div className="relative bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] w-full max-w-[340px] overflow-hidden">
                {/* Header with gradient subtle accent */}
                <div className="relative px-6 py-5 border-b border-white/5 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center shadow-inner ${config.bg.replace('/40', '/20')}`}>
                             <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentcolor] ${config.text}`} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg tracking-tight">{table.name}</h3>
                            <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                                <span>{table.capacity} Guests</span>
                                <span className="w-1 h-1 rounded-full bg-zinc-600" />
                                <span className={config.text}>{config.label}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Actions Area */}
                <div className="p-5 space-y-3">
                    {/* Primary Actions */}
                    <div className="space-y-2">
                        {(table.status === "AVAILABLE" || table.status === "RESERVED") && (
                            <button
                                onClick={() => handleStatusChange("OCCUPIED")}
                                disabled={updateStatusMutation.isPending}
                                className="w-full group relative flex items-center justify-between px-4 py-3.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all duration-300 disabled:opacity-50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                                        <Armchair className="h-4 w-4" />
                                    </div>
                                    <span className="text-emerald-100 font-semibold text-sm">
                                        {updateStatusMutation.isPending ? "Seating..." : "Seat Walk-in"}
                                    </span>
                                </div>
                                <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                            </button>
                        )}

                        {table.status === "DIRTY" && (
                            <button
                                onClick={handleMarkClean}
                                disabled={cleanMutation.isPending}
                                className="w-full group flex items-center gap-3 px-4 py-3.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-300 transition-all duration-300 disabled:opacity-50"
                            >
                                <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400">
                                    <CheckCheck className="h-4 w-4" />
                                </div>
                                <span className="font-semibold text-sm">{cleanMutation.isPending ? "Clearing..." : "Mark Table Available"}</span>
                            </button>
                        )}
                    </div>

                    {/* Manual Overrides */}
                    <div className="pt-4 space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">Quick Status</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {['AVAILABLE', 'OCCUPIED', 'FOOD_SENT', 'RESERVED', 'DIRTY'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(status)}
                                    disabled={table.status === status || updateStatusMutation.isPending}
                                    className={`py-2 px-3 text-[10px] font-bold rounded-lg border transition-all duration-200 ${
                                        table.status === status
                                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-[0_0_15px_-5px_rgba(99,102,241,0.3)]'
                                            : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10 hover:text-zinc-200 hover:border-white/10'
                                    }`}
                                >
                                    {status.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Advanced Actions (Danger Zone) */}
                    {table.status === "AVAILABLE" && (
                        <div className="pt-4">
                            {!confirmDelete ? (
                                <button
                                    onClick={() => setConfirmDelete(true)}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span className="text-[11px] font-semibold uppercase tracking-wider">Remove Table</span>
                                </button>
                            ) : (
                                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                                    <p className="text-[11px] text-red-200 text-center font-medium leading-relaxed">
                                        Permanently remove <strong>{table.name}</strong>?
                                    </p>
                                    <div className="flex gap-2">
                                        <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2 text-[10px] font-bold rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700">
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            disabled={deleteMutation.isPending}
                                            className="flex-1 py-2 text-[10px] font-bold rounded-lg bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
                                        >
                                            {deleteMutation.isPending ? "Wait..." : "Delete"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <button 
                    onClick={onClose} 
                    className="w-full py-4 text-xs font-bold text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border-t border-white/5 transition-all"
                >
                    Dismiss
                </button>
            </div>
        </div>
    );
}
