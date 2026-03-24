import { useState, useRef } from "react";
import { Map, Plus, Save, Square, Circle, StretchHorizontal, Trash2 } from "lucide-react";

interface PlacedTable {
    id: string;
    shape: "SQUARE" | "ROUND" | "RECTANGLE";
    x: number;
    y: number;
    name: string;
}

export function FloorLayoutSettingsPage() {
    const [tables, setTables] = useState<PlacedTable[]>([]);
    const [draggedShape, setDraggedShape] = useState<PlacedTable["shape"] | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    const handleDragStart = (shape: PlacedTable["shape"]) => {
        setDraggedShape(shape);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (!draggedShape || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - 40; // Center the 80px shape
        const y = e.clientY - rect.top - 40;

        const newTable: PlacedTable = {
            id: crypto.randomUUID(),
            shape: draggedShape,
            x: Math.max(0, x),
            y: Math.max(0, y),
            name: `T-${tables.length + 1}`,
        };

        setTables([...tables, newTable]);
        setDraggedShape(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const removeTable = (id: string) => {
        setTables(tables.filter((t) => t.id !== id));
    };

    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between border-b border-border pb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Floor Plan Layout</h2>
                    <p className="text-muted-foreground mt-2">
                        Design your restaurant floor plan by adding sections and placing tables.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setTables([])}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-muted/10 text-muted-foreground hover:bg-muted/20 transition-colors border border-border"
                    >
                        Clear All
                    </button>
                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                        <Save className="h-4 w-4" />
                        Save Layout
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Column: Properties & Controls */}
                <div className="lg:col-span-1 space-y-6">
                    <section className="p-5 rounded-xl bg-surface border border-border space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
                            Sections
                        </h3>
                        <div className="space-y-2">
                            {["Main Dining", "Bar Area", "Terrace"].map((section) => (
                                <button
                                    key={section}
                                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-muted/5 border border-border text-sm group hover:border-primary/50 transition-colors text-left"
                                >
                                    <span className="text-foreground/80">{section}</span>
                                    <span className="text-[10px] py-0.5 px-1.5 rounded bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary">
                                        Active
                                    </span>
                                </button>
                            ))}
                            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-all">
                                <Plus className="h-4 w-4" />
                                Add Section
                            </button>
                        </div>
                    </section>

                    <section className="p-5 rounded-xl bg-surface border border-border space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
                                Table Templates
                            </h3>
                            <span className="text-[10px] text-muted-foreground/50">DRAG TO ADD</span>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { name: "Square", shape: "SQUARE", icon: Square },
                                { name: "Round", shape: "ROUND", icon: Circle },
                                { name: "Long", shape: "RECTANGLE", icon: StretchHorizontal },
                            ].map((item) => (
                                <button
                                    key={item.name}
                                    draggable
                                    onDragStart={() => handleDragStart(item.shape as PlacedTable["shape"])}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/5 border border-border hover:border-primary/50 hover:bg-muted/10 transition-all cursor-grab active:cursor-grabbing group"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center border border-border group-hover:border-primary/30 group-hover:bg-primary/5">
                                        <item.icon className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-foreground/90">{item.name} Table</p>
                                        <p className="text-[10px] text-muted-foreground/60">Standard 4-Seater</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column: Interactive Canvas */}
                <div className="lg:col-span-3">
                    <div
                        ref={canvasRef}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className="relative w-full h-[650px] rounded-2xl bg-surface-2/50 border-2 border-dashed border-border overflow-hidden group/canvas"
                        style={{
                            backgroundImage: `
                                radial-gradient(circle at 50% 50%, rgba(var(--primary), 0.03) 0%, transparent 70%),
                                linear-gradient(rgba(var(--foreground), 0.05) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(var(--foreground), 0.05) 1px, transparent 1px)
                            `,
                            backgroundSize: "100% 100%, 40px 40px, 40px 40px",
                        }}
                    >
                        {tables.length === 0 && !draggedShape && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 pointer-events-none">
                                <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4 border border-border">
                                    <Map className="h-8 w-8 text-muted-foreground/40" />
                                </div>
                                <h3 className="text-lg font-medium text-foreground/80">Layout Canvas</h3>
                                <p className="text-muted-foreground text-sm mt-1 max-w-sm">
                                    Canvas is empty. Drag  table templates from the sidebar to start designing your floor plan.
                                </p>
                            </div>
                        )}

                        {/* Rendering Placed Tables */}
                        {tables.map((table) => (
                            <div
                                key={table.id}
                                className="absolute group/table cursor-move"
                                style={{ left: table.x, top: table.y }}
                            >
                                <div className={`
                                    relative flex items-center justify-center border-2 transition-all shadow-xl
                                    ${table.shape === "ROUND" ? "rounded-full w-20 h-20" : ""}
                                    ${table.shape === "SQUARE" ? "rounded-xl w-20 h-20" : ""}
                                    ${table.shape === "RECTANGLE" ? "rounded-xl w-32 h-20" : ""}
                                    bg-primary/10 border-primary/50 hover:border-primary active:scale-95
                                `}>
                                    <span className="text-xs font-bold text-primary">{table.name}</span>

                                    {/* Table Delete Action */}
                                    <button
                                        onClick={() => removeTable(table.id)}
                                        className="absolute -top-3 -right-3 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover/table:opacity-100 transition-opacity shadow-lg hover:bg-red-500"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Drop Target Feedback */}
                        {draggedShape && (
                            <div className="absolute inset-0 bg-indigo-500/5 border-4 border-indigo-500/20 animate-pulse pointer-events-none flex items-center justify-center">
                                <span className="text-indigo-400 font-medium tracking-widest uppercase text-xs">
                                    Drop to place table
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex items-center justify-between px-2">
                        <p className="text-xs text-muted-foreground">
                            Visual Position: {tables.length} tables placed across 1 section.
                        </p>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-primary/20 border border-primary/40" />
                                <span className="text-[10px] text-muted-foreground uppercase font-bold">In Draft</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
