import type { TableShapeResponse, TableStatus } from "../schema/floorSchema";

interface TableStatusConfig {
    bg: string;
    border: string;
    text: string;
    label: string;
}

export const TABLE_STATUS_CONFIG: Record<TableStatus, TableStatusConfig> = {
    AVAILABLE: {
        bg: "var(--status-available-bg)",
        border: "var(--status-available-border)",
        text: "var(--status-available-text)",
        label: "Available",
    },
    RESERVED: {
        bg: "var(--status-reserved-bg)",
        border: "var(--status-reserved-border)",
        text: "var(--status-reserved-text)",
        label: "Reserved",
    },
    HELD: {
        bg: "var(--status-reserved-bg)",
        border: "var(--status-reserved-border)",
        text: "var(--status-reserved-text)",
        label: "Held",
    },
    OCCUPIED: {
        bg: "var(--status-occupied-bg)",
        border: "var(--status-occupied-border)",
        text: "var(--status-occupied-text)",
        label: "Occupied",
    },
    ORDER_PLACED: {
        bg: "var(--status-ordered-bg)",
        border: "var(--status-ordered-border)",
        text: "var(--status-ordered-text)",
        label: "Ordering",
    },
    FOOD_DELIVERED: {
        bg: "var(--status-ordered-bg)",
        border: "var(--status-ordered-border)",
        text: "var(--status-ordered-text)",
        label: "Eating",
    },
    DESSERT_COURSE: {
        bg: "var(--status-ordered-bg)",
        border: "var(--status-ordered-border)",
        text: "var(--status-ordered-text)",
        label: "Dessert",
    },
    CHECK_DROPPED: {
        bg: "var(--status-ordered-bg)",
        border: "var(--status-ordered-border)",
        text: "var(--status-ordered-text)",
        label: "Check",
    },
    PAYING: {
        bg: "var(--status-available-bg)",
        border: "var(--status-available-border)",
        text: "var(--status-available-text)",
        label: "Paying",
    },
    DIRTY: {
        bg: "var(--status-dirty-bg)",
        border: "var(--status-dirty-border)",
        text: "var(--status-dirty-text)",
        label: "Dirty",
    },
    CLEANING: {
        bg: "var(--status-available-bg)",
        border: "var(--status-available-border)",
        text: "var(--status-available-text)",
        label: "Cleaning",
    },
    MAINTENANCE: {
        bg: "rgba(239, 68, 68, 0.1)",
        border: "rgba(239, 68, 68, 0.4)",
        text: "rgb(239, 68, 68)",
        label: "Out of Service",
    },
    INACTIVE: {
        bg: "var(--status-inactive-bg)",
        border: "var(--status-inactive-border)",
        text: "var(--status-inactive-text)",
        label: "Inactive",
    },
};

interface TableShapeBadgeProps {
    table: TableShapeResponse;
    isDragTarget?: boolean;
    onClick?: () => void;
}

export function TableShapeBadge({ table, isDragTarget, onClick }: TableShapeBadgeProps) {
    const config = TABLE_STATUS_CONFIG[table.status];
    const isCircle = table.shapeType === "CIRCLE" || table.shapeType === "ROUND" || table.shapeType === "OVAL";

    return (
        <button
            onClick={onClick}
            style={{
                position: "absolute",
                left: table.posX,
                top: table.posY,
                width: table.width,
                height: table.height,
                backgroundColor: config.bg,
                borderColor: config.border,
                color: config.text,
            }}
            className={[
                "group flex flex-col items-center justify-center",
                "border-2 transition-all duration-200 cursor-pointer select-none",
                isCircle ? "rounded-full" : "rounded-lg",
                isDragTarget
                    ? "ring-2 ring-white ring-offset-1 ring-offset-zinc-900 scale-105"
                    : "hover:scale-105 hover:ring-1 hover:ring-white/40",
            ].join(" ")}
            title={`${table.name} — ${config.label}`}
        >
            <span className="text-xs font-bold leading-none">{table.name}</span>
            <span className="text-[10px] opacity-70 mt-0.5">{table.capacity} pax</span>
            <span className="text-[9px] mt-0.5 font-medium uppercase tracking-wider">
                {config.label}
            </span>
        </button>
    );
}
