import { useState } from "react";
import { useDraftMenuItems, usePublishedMenuItems, useUpdateMenuItemStatus } from "../hooks/useMenuItems";
import { useMenuCategories } from "../hooks/useMenuCategories";
import { MenuItemCard } from "../components/MenuItemCard";
import { Button } from "@/components/ui/button";
import { MenuItemForm } from "../components/MenuItemForm";
import type { MenuItemResponse } from "../schema/menuSchema";

export function MenuItemsPage() {
    const { data: drafts, isLoading: draftsLoading } = useDraftMenuItems();
    const { data: published, isLoading: publishedLoading } = usePublishedMenuItems();
    const { data: categories } = useMenuCategories();
    const updateStatus = useUpdateMenuItemStatus();

    const [activeTab, setActiveTab] = useState<"LIVE" | "DRAFT">("LIVE");
    const [isCreating, setIsCreating] = useState(false);

    const isLoading = draftsLoading || publishedLoading;
    const displayItems = activeTab === "LIVE" ? published || [] : drafts || [];

    const handleUpdateStatus = (id: string, currentStatus: string) => {
        // Basic toggle logic for 86'ing and publishing
        if (currentStatus === "PUBLISHED") {
            updateStatus.mutate({ id, status: "EIGHTY_SIXED" });
        } else if (currentStatus === "EIGHTY_SIXED" || currentStatus === "DRAFT") {
            updateStatus.mutate({ id, status: "PUBLISHED" });
        }
    };

    const handleEdit = (item: MenuItemResponse) => {
        console.log("Edit Item", item);
    };

    if (isCreating) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                    <h1 className="text-2xl font-bold tracking-tight">Create Menu Item</h1>
                    <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                </div>
                <MenuItemForm categories={categories || []} onComplete={() => setIsCreating(false)} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Menu Items</h1>
                    <p className="text-muted-foreground text-sm">Manage dishes, prices, and status.</p>
                </div>
                <Button onClick={() => setIsCreating(true)}>+ New Item</Button>
            </div>

            <div className="flex gap-4 border-b">
                <button
                    onClick={() => setActiveTab("LIVE")}
                    className={`pb-2 text-sm font-medium ${activeTab === "LIVE" ? "border-b-2 border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50" : "text-zinc-500 hover:text-zinc-700"}`}
                >
                    Live Menu ({published?.length || 0})
                </button>
                <button
                    onClick={() => setActiveTab("DRAFT")}
                    className={`pb-2 text-sm font-medium ${activeTab === "DRAFT" ? "border-b-2 border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50" : "text-zinc-500 hover:text-zinc-700"}`}
                >
                    Drafts & Archives ({drafts?.length || 0})
                </button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="aspect-[3/4] skeleton-shimmer rounded-xl" />
                    ))}
                </div>
            ) : displayItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                    <p>No {activeTab.toLowerCase()} items found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {displayItems.map(item => (
                        <MenuItemCard
                            key={item.id}
                            item={item}
                            onEdit={handleEdit}
                            onUpdateStatus={handleUpdateStatus}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
