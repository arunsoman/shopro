import { useState } from "react";
import { Move, Plus, Save, Trash2 } from "lucide-react";
import { useTables, useUpdateTablePosition } from "../hooks/useFloor";
import { TableShapeBadge } from "../components/TableShapeBadge";
import type { TableShapeResponse } from "../schema/floorSchema";

export function LayoutEditorPage() {
    const { data: tables = [] } = useTables();
    const updatePositionMutation = useUpdateTablePosition();

    const [isEditing, setIsEditing] = useState(false);
    const [draggingTableId, setDraggingTableId] = useState<string | null>(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const handleDragStart = (e: React.DragEvent, table: TableShapeResponse) => {
        if (!isEditing) return;
        setDraggingTableId(table.id);
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
        // Set transparent drag image
        const img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        e.dataTransfer.setDragImage(img, 0, 0);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        if (!draggingTableId || !isEditing) return;

        const canvasRect = e.currentTarget.getBoundingClientRect();
        const newX = Math.round((e.clientX - canvasRect.left - offset.x) / 10) * 10;
        const newY = Math.round((e.clientY - canvasRect.top - offset.y) / 10) * 10;

        await updatePositionMutation.mutateAsync({
            id: draggingTableId,
            posX: newX,
            posY: newY,
        });

        setDraggingTableId(null);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-56px)] bg-background text-foreground overflow-hidden">
            <header className="px-5 h-14 flex-shrink-0 flex items-center justify-between border-b border-border bg-surface/60 backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                    <Move className="h-5 w-5 text-primary" />
                    <h1 className="font-semibold text-base">Floor Layout Editor</h1>
                    <span className="ml-2 px-2 py-0.5 rounded bg-surface-2 text-[10px] text-muted uppercase tracking-wider">
                        Main Area
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-2 ${isEditing ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-surface-2 hover:bg-surface-3 text-foreground"
                            }`}
                    >
                        {isEditing ? <Save className="h-3.5 w-3.5" /> : <Move className="h-3.5 w-3.5" />}
                        {isEditing ? "Finish Editing" : "Enter Edit Mode"}
                    </button>
                    <button className="btn-primary px-3 py-1.5 rounded text-xs font-medium flex items-center gap-2 shadow-none">
                        <Plus className="h-3.5 w-3.5" />
                        Add Table
                    </button>
                </div>
            </header>

            <div
                className={`flex-1 relative overflow-auto ${isEditing ? "cursor-crosshair" : "cursor-default"}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 50% 50%, var(--primary-soft) 0%, transparent 70%),
                        linear-gradient(var(--border) 1px, transparent 1px),
                        linear-gradient(90deg, var(--border) 1px, transparent 1px)
                    `,
                    backgroundSize: "100% 100%, 20px 20px, 20px 20px",
                }}
            >
                {tables.map((table) => (
                    <div
                        key={table.id}
                        draggable={isEditing}
                        onDragStart={(e) => handleDragStart(e, table)}
                        className={isEditing ? "cursor-move" : ""}
                    >
                        <TableShapeBadge table={table} />
                        {isEditing && (
                            <div
                                style={{ position: 'absolute', left: table.posX + table.width - 10, top: table.posY - 10 }}
                                className="bg-red-500 rounded-full p-1 cursor-pointer shadow-lg hover:bg-red-400 transition-colors"
                            >
                                <Trash2 className="h-3 w-3 text-white" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {isEditing && (
                <div className="p-3 bg-primary-soft border-t border-primary/20 text-center">
                    <p className="text-xs text-primary flex items-center justify-center gap-2">
                        <Move className="h-3 w-3" />
                        Drag and drop tables to reposition them on the grid. Position is automatically saved.
                    </p>
                </div>
            )}
        </div>
    );
}
