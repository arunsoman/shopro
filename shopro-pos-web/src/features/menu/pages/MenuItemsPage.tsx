import { useState } from "react";
import { useDraftMenuItems, usePublishedMenuItems, useUpdateMenuItemStatus } from "../hooks/useMenuItems";
import { useMenuCategories } from "../hooks/useMenuCategories";
import { MenuItemCard } from "../components/MenuItemCard";
import { Button } from "@/components/ui/button";
import { MenuItemForm } from "../components/MenuItemForm";
import { useTranslation } from "react-i18next";
import type { MenuItemResponse } from "../schema/menuSchema";
import { useAuth, ADMIN_ROLES } from "@/lib/auth/AuthContext";
import { AlertCircle, CheckCircle2, LayoutGrid, ListTodo, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function MenuItemsPage() {
    const { data: drafts, isLoading: draftsLoading, refetch: refetchDrafts } = useDraftMenuItems();
    const { data: published, isLoading: publishedLoading, refetch: refetchPublished } = usePublishedMenuItems();
    const { data: categories } = useMenuCategories();
    const updateStatus = useUpdateMenuItemStatus();
    const { t } = useTranslation();
    const { hasRole } = useAuth();

    const isManager = hasRole(ADMIN_ROLES);

    const [activeTab, setActiveTab] = useState<"LIVE" | "DRAFT">("LIVE");
    const [isCreating, setIsCreating] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItemResponse | null>(null);

    const isLoading = draftsLoading || publishedLoading;
    const displayItems = activeTab === "LIVE" ? published || [] : drafts || [];

    const handleUpdateStatus = async (id: string, currentStatus: string) => {
        if (!isManager && (currentStatus === "DRAFT" || currentStatus === "ARCHIVED")) {
            alert(t('menu.publishPermissionDenied'));
            return;
        }

        // Basic toggle logic for 86'ing and publishing
        if (currentStatus === "PUBLISHED") {
            await updateStatus.mutateAsync({ id, status: "EIGHTY_SIXED" });
        } else if (currentStatus === "EIGHTY_SIXED" || currentStatus === "DRAFT") {
            await updateStatus.mutateAsync({ id, status: "PUBLISHED" });
        }
        refetchDrafts();
        refetchPublished();
    };

    const handleEdit = (item: MenuItemResponse) => {
        setEditingItem(item);
        setIsCreating(false);
    };

    if (isCreating || editingItem) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between border-b pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {isCreating ? t('menu.createItemHeader') : t('menu.editItemHeader', { name: editingItem?.name })}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {isCreating ? t('menu.createItemDesc') : t('menu.editItemDesc')}
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => { setIsCreating(false); setEditingItem(null); }}>
                        {t('common.cancel')}
                    </Button>
                </div>
                <MenuItemForm
                    categories={categories || []}
                    item={editingItem || undefined}
                    onComplete={() => { setIsCreating(false); setEditingItem(null); refetchDrafts(); refetchPublished(); }}
                />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('menu.items')}</h1>
                    <p className="text-muted-foreground mt-1">{t('menu.manageDesc')}</p>
                </div>
                <Button onClick={() => setIsCreating(true)} size="lg" className="shadow-lg shadow-primary/20">
                    <Plus className="mr-2 h-5 w-5" />
                    {t('menu.newItem')}
                </Button>
            </div>

            <div className="flex gap-1 rounded-xl bg-muted/20 p-1 w-fit border border-border/50">
                <button
                    onClick={() => setActiveTab("LIVE")}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all",
                        activeTab === "LIVE" 
                            ? "bg-background text-primary shadow-sm" 
                            : "text-muted-foreground hover:bg-background/50"
                    )}
                >
                    <LayoutGrid className="h-4 w-4" />
                    {t('menu.liveMenu')}
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-[10px] font-bold">
                        {published?.length || 0}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab("DRAFT")}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all",
                        activeTab === "DRAFT" 
                            ? "bg-background text-primary shadow-sm" 
                            : "text-muted-foreground hover:bg-background/50"
                    )}
                >
                    <ListTodo className="h-4 w-4" />
                    {t('menu.draftsArchives')}
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-muted-foreground/10 text-[10px] font-bold text-muted-foreground">
                        {drafts?.length || 0}
                    </span>
                </button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="aspect-[3/4] skeleton-shimmer rounded-2xl border border-border/40" />
                    ))}
                </div>
            ) : displayItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/40 py-24 text-center">
                    <div className="h-20 w-20 rounded-full bg-muted/10 flex items-center justify-center mb-6">
                        {activeTab === "LIVE" ? <CheckCircle2 className="h-10 w-10 text-muted-foreground/20" /> : <AlertCircle className="h-10 w-10 text-muted-foreground/20" />}
                    </div>
                    <h3 className="text-xl font-semibold">{activeTab === "LIVE" ? t('menu.noLiveItems') : t('menu.noDraftItems')}</h3>
                    <p className="text-muted-foreground mt-2 max-w-xs">{activeTab === "LIVE" ? t('menu.noLiveItemsDesc') : t('menu.noDraftItemsDesc')}</p>
                    {activeTab === "LIVE" && <Button variant="outline" className="mt-6" onClick={() => setActiveTab("DRAFT")}>{t('menu.checkDrafts')}</Button>}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 pb-12">
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
