import type { MenuItemResponse } from "../schema/menuSchema";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItemCardProps {
    item: MenuItemResponse;
    onEdit?: (item: MenuItemResponse) => void;
    onUpdateStatus?: (id: string, newStatus: string) => void;
}

export function MenuItemCard({ item, onEdit, onUpdateStatus }: MenuItemCardProps) {
    const is86 = item.status === "EIGHTY_SIXED";

    const getStatusBadge = () => {
        switch (item.status) {
            case "PUBLISHED":
                return <Badge variant="success">LIVE</Badge>;
            case "DRAFT":
                return <Badge variant="warning">DRAFT</Badge>;
            case "EIGHTY_SIXED":
                return <Badge variant="secondary">86'd</Badge>;
            case "ARCHIVED":
                return <Badge variant="destructive">ARCHIVED</Badge>;
            default:
                return null;
        }
    };

    return (
        <div
            className={cn(
                "group relative flex flex-col rounded-xl border bg-card text-card-foreground shadow transition-all hover:shadow-md",
                is86 && "opacity-60 grayscale"
            )}
        >
            <div className="absolute right-2 top-2 z-10">{getStatusBadge()}</div>

            {/* Action Menu Trigger (Placeholder for Dropdown) */}
            <div className="absolute left-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                    className="rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60"
                    onClick={() => onEdit?.(item)}
                >
                    <MoreVertical className="h-4 w-4" />
                </button>
                {item.status === "DRAFT" ? (
                    <button
                        className="rounded-full bg-blue-500/80 px-2 py-1 text-[10px] font-bold text-white hover:bg-blue-600/90"
                        onClick={() => onUpdateStatus?.(item.id, item.status)}
                    >
                        PUBLISH
                    </button>
                ) : (
                    <button
                        className="rounded-full bg-black/40 px-2 py-1 text-[10px] font-bold text-white hover:bg-black/60"
                        onClick={() => onUpdateStatus?.(item.id, item.status)}
                    >
                        {is86 ? 'UN-86' : '86'}
                    </button>
                )}
            </div>

            {/* Photo Area */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl bg-zinc-100 dark:bg-zinc-800">
                {item.photoUrl ? (
                    <img
                        src={item.photoUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-400">
                        <ImageIcon className="h-8 w-8 opacity-50" />
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                    <h3 className="font-semibold leading-tight tracking-tight">{item.name}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {item.description || "No description provided."}
                    </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <span className="font-medium tabular-nums text-primary">
                        ${item.basePrice.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.categoryName}</span>
                </div>
            </div>

            {/* 86 Overlay Text */}
            {is86 && (
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                    <div className="rotate-[-12deg] rounded-md border-2 border-red-500 bg-red-500/10 px-4 py-1 text-2xl font-black tracking-widest text-red-500 backdrop-blur-sm">
                        86'd
                    </div>
                </div>
            )}
        </div>
    );
}
