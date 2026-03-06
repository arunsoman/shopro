import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Layers, RefreshCw } from "lucide-react";
import { useTables, useWaitlist, useSeatParty } from "../hooks/useFloor";
import { TableShapeBadge } from "../components/TableShapeBadge";
import { TABLE_STATUS_CONFIG } from "../components/TableShapeBadge";
import { WaitlistSidebar } from "../components/WaitlistSidebar";
import { TableActionModal } from "../components/TableActionModal";
import type { TableShapeResponse, WaitlistEntryResponse } from "../schema/floorSchema";

export function FloorPlanPage() {
    const { data: tables = [], isLoading: tablesLoading, refetch: refetchTables } = useTables();
    const { data: waitlist = [], isLoading: waitlistLoading } = useWaitlist();
    const seatPartyMutation = useSeatParty();

    const [selectedTable, setSelectedTable] = useState<TableShapeResponse | null>(null);
    const [dragEntry, setDragEntry] = useState<WaitlistEntryResponse | null>(null);
    const [dragTargetTableId, setDragTargetTableId] = useState<string | null>(null);

    const canvasRef = useRef<HTMLDivElement>(null);

    // --- Drag-and-drop handlers ---
    const handleTableDragOver = (e: React.DragEvent, table: TableShapeResponse) => {
        e.preventDefault();
        if (table.status === "AVAILABLE" || table.status === "RESERVED") {
            setDragTargetTableId(table.id);
        }
    };

    const handleTableDrop = async (e: React.DragEvent, table: TableShapeResponse) => {
        e.preventDefault();
        setDragTargetTableId(null);
        if (!dragEntry) return;

        if (table.status !== "AVAILABLE" && table.status !== "RESERVED") {
            return; // Table not available — drop rejected
        }

        await seatPartyMutation.mutateAsync({ tableId: table.id, waitlistEntryId: dragEntry.id });
        setDragEntry(null);
    };

    const handleCanvasLeave = () => {
        setDragTargetTableId(null);
    };

    // --- Legend ---
    const Legend = () => (
        <div className="flex items-center gap-3 flex-wrap">
            {Object.entries(TABLE_STATUS_CONFIG).map(([status, config]) => (
                <div key={status} className="flex items-center gap-1.5">
                    <div
                        className="w-2.5 h-2.5 rounded-sm border"
                        style={{ backgroundColor: config.bg, borderColor: config.border }}
                    />
                    <span className="text-[11px] text-muted">{config.label}</span>
                </div>
            ))}
        </div>
    );

    return (
        <div className="flex h-[calc(100vh-56px)] bg-background text-foreground overflow-hidden">
            {/* ── Waitlist sidebar ── */}
            {waitlistLoading ? (
                <div className="w-64 bg-surface border-r border-border flex items-center justify-center">
                    <div className="text-xs text-muted">Loading…</div>
                </div>
            ) : (
                <WaitlistSidebar
                    entries={waitlist.filter(e => e.status === "WAITING" || e.status === "NOTIFIED")}
                    onDragStart={(entry) => setDragEntry(entry)}
                    onDragEnd={() => setDragEntry(null)}
                />
            )}

            {/* ── Main area ── */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* Header bar */}
                <header className="px-5 h-14 flex-shrink-0 flex items-center justify-between border-b border-border bg-surface/60 backdrop-blur-md">
                    <div className="flex items-center gap-2.5">
                        <Layers className="h-5 w-5 text-primary" />
                        <h1 className="font-semibold text-foreground text-base">Live Floor Plan</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Legend />
                        <button
                            onClick={() => refetchTables()}
                            className="p-1.5 rounded text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    </div>
                </header>

                {/* Canvas area */}
                <div
                    ref={canvasRef}
                    className="flex-1 relative overflow-auto"
                    style={{
                        backgroundImage: `
              radial-gradient(circle at 50% 50%, var(--primary-soft) 0%, transparent 70%),
              linear-gradient(var(--border) 1px, transparent 1px),
              linear-gradient(90deg, var(--border) 1px, transparent 1px)
            `,
                        backgroundSize: "100% 100%, 40px 40px, 40px 40px",
                    }}
                    onDragLeave={handleCanvasLeave}
                >
                    {tablesLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-sm text-muted">Loading floor plan…</div>
                        </div>
                    )}

                    {!tablesLoading && tables.length === 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
                            <Layers className="h-10 w-10 text-muted-2" />
                            <p className="text-foreground text-sm font-medium">No tables configured yet.</p>
                            <p className="text-muted text-xs max-w-xs">
                                Go to{" "}
                                <Link
                                    to="/settings/floor-layout"
                                    className="text-primary hover:opacity-80 font-bold underline underline-offset-4 decoration-primary/30"
                                >
                                    Settings → Floor Plan Layout
                                </Link>{" "}
                                to add sections and tables.
                            </p>
                        </div>
                    )}

                    {/* Table shape badges */}
                    {tables.map((table) => (
                        <div
                            key={table.id}
                            onDragOver={(e) => handleTableDragOver(e, table)}
                            onDrop={(e) => handleTableDrop(e, table)}
                        >
                            <TableShapeBadge
                                table={table}
                                isDragTarget={dragTargetTableId === table.id}
                                onClick={() => setSelectedTable(table)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Table action modal ── */}
            {selectedTable && (
                <TableActionModal
                    table={selectedTable}
                    onClose={() => setSelectedTable(null)}
                    onSeatWalkIn={() => {
                        // Walk-in logic — could open an inline form; for now close and let host use waitlist drag
                        setSelectedTable(null);
                    }}
                />
            )}
        </div>
    );
}
