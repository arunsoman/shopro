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
            <header className="flex items-center justify-between border-b border-zinc-800 pb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Floor Plan Layout</h2>
                    <p className="text-zinc-400 mt-2">
                        Design your restaurant floor plan by adding sections and placing tables.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setTables([])}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors border border-zinc-700/50"
                    >
                        Clear All
                    </button>
                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/40">
                        <Save className="h-4 w-4" />
                        Save Layout
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Column: Properties & Controls */}
                <div className="lg:col-span-1 space-y-6">
                    <section className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                            Sections
                        </h3>
                        <div className="space-y-2">
                            {["Main Dining", "Bar Area", "Terrace"].map((section) => (
                                <button
                                    key={section}
                                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-800/40 border border-zinc-700/30 text-sm group hover:border-indigo-500/50 transition-colors text-left"
                                >
                                    <span className="text-zinc-300">{section}</span>
                                    <span className="text-[10px] py-0.5 px-1.5 rounded bg-zinc-700 text-zinc-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-400">
                                        Active
                                    </span>
                                </button>
                            ))}
                            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-zinc-700 text-sm text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-all">
                                <Plus className="h-4 w-4" />
                                Add Section
                            </button>
                        </div>
                    </section>

                    <section className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                                Table Templates
                            </h3>
                            <span className="text-[10px] text-zinc-600">DRAG TO ADD</span>
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
                                    className="flex items-center gap-4 p-4 rounded-xl bg-zinc-800/40 border border-zinc-700/30 hover:border-indigo-500/50 hover:bg-zinc-800/60 transition-all cursor-grab active:cursor-grabbing group"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-700 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/5">
                                        <item.icon className="h-6 w-6 text-zinc-400 group-hover:text-indigo-400" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-zinc-300">{item.name} Table</p>
                                        <p className="text-[10px] text-zinc-500">Standard 4-Seater</p>
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
                        className="relative w-full h-[650px] rounded-2xl bg-zinc-900/40 border-2 border-dashed border-zinc-800 overflow-hidden group/canvas"
                        style={{
                            backgroundImage: `
                                radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.03) 0%, transparent 70%),
                                linear-gradient(rgba(63,63,70,0.1) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(63,63,70,0.1) 1px, transparent 1px)
                            `,
                            backgroundSize: "100% 100%, 40px 40px, 40px 40px",
                        }}
                    >
                        {tables.length === 0 && !draggedShape && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 pointer-events-none">
                                <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4 border border-zinc-700/30">
                                    <Map className="h-8 w-8 text-zinc-600" />
                                </div>
                                <h3 className="text-lg font-medium text-zinc-300">Layout Canvas</h3>
                                <p className="text-zinc-500 text-sm mt-1 max-w-sm">
                                    Canvas is empty. Drag high-fidelity table templates from the sidebar to start designing your floor plan.
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
                                    bg-indigo-600/10 border-indigo-500/50 hover:border-indigo-400 hover:scale-105 active:scale-95
                                `}>
                                    <span className="text-xs font-bold text-indigo-400">{table.name}</span>

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
                        <p className="text-xs text-zinc-500">
                            Visual Position: {tables.length} tables placed across 1 section.
                        </p>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500/20 border border-indigo-500/40" />
                                <span className="text-[10px] text-zinc-500 uppercase font-bold">In Draft</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
