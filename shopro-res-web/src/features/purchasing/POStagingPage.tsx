/**
 * POStagingPage.tsx (SS2.0+)
 * ─────────────────────────────────────────────────────────────────
 * Reorder Staging — Identify low-stock items and raise Purchase Orders.
 * 
 * Two views:
 * 1. Default: Vendor Card View - items grouped by preferred vendor, click to raise PO
 * 2. Advanced: Table View - current detailed table view
 */

import React, { useState, useMemo, lazy, Suspense } from 'react';
import { useAppStore } from "@/App";
import { 
  Package, Plus, Search, Filter, ShoppingCart, Truck, ArrowLeft, 
  Loader2, AlertCircle, LayoutGrid, List, ChevronRight, 
  Building2, PackagePlus, CheckCircle2, XCircle
} from 'lucide-react';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { StagingTable } from "./components/StagingTable";
import { usePOStaging, type StagingItem } from "./hooks/usePOStaging";
import { cn } from '@/lib/utils';
import { usePreferredVendors } from './hooks/usePreferredVendors';

// Lazy load RaisePOModal to prevent API calls until modal is opened
const RaisePOModal = lazy(() => 
  import('./components/RaisePOModal').then(module => ({ default: module.RaisePOModal }))
);

type ViewMode = 'vendor' | 'advanced';

// Vendor grouped data structure
interface VendorGroup {
  supplierId: number;
  supplierName: string;
  items: StagingItem[];
  totalShortfall: number;
  estimatedCost: number;
  unitCosts: Map<number, number>; // ingredientId -> unitCost
}

export default function POStagingPage() {
  const navigate = useAppStore(s => s.navigate);
  const { data: stagingItems, isLoading } = usePOStaging();
  const { data: vendorData } = usePreferredVendors(3);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('vendor');
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  const [quickRaiseVendor, setQuickRaiseVendor] = useState<number | null>(null);

  // Group items by preferred vendor
  const vendorGroups = useMemo(() => {
    if (!stagingItems || !vendorData) return [];
    
    const groups: Map<number, VendorGroup> = new Map();
    
    stagingItems.forEach(item => {
      // Find preferred vendor for this ingredient
      const vendorMap = vendorData.find(v => v.ingredientId === item.id);
      const supplierId = vendorMap?.supplierId || 0; // 0 = unassigned
      const supplierName = vendorMap?.supplierName || 'Unassigned';
      const unitCost = vendorMap?.unitCost; // Get unit cost from preferred vendor
      
      if (!groups.has(supplierId)) {
        groups.set(supplierId, {
          supplierId,
          supplierName,
          items: [],
          totalShortfall: 0,
          estimatedCost: 0,
          unitCosts: new Map(),
        });
      }
      
      const group = groups.get(supplierId)!;
      group.items.push(item);
      group.totalShortfall += item.shortfall;
      
      // Store unit cost for this ingredient
      if (unitCost !== undefined) {
        group.unitCosts.set(item.id, unitCost);
        // Calculate estimated cost using actual unit cost
        group.estimatedCost += Math.abs(item.shortfall) * unitCost;
      } else {
        // Rough estimate: shortfall * $5 (avg price) if no cost available
        group.estimatedCost += Math.abs(item.shortfall) * 5;
      }
    });
    
    // Sort by total shortfall (highest first)
    return Array.from(groups.values()).sort((a, b) => b.totalShortfall - a.totalShortfall);
  }, [stagingItems, vendorData]);

  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = (ids: number[]) => {
    setSelectedIds(ids);
  };

  const handleVendorSelect = (supplierId: number) => {
    // Toggle vendor selection - select all items from that vendor
    const vendorGroup = vendorGroups.find(g => g.supplierId === supplierId);
    if (!vendorGroup) return;
    
    const vendorItemIds = vendorGroup.items.map(i => i.id);
    const allSelected = vendorItemIds.every(id => selectedIds.includes(id));
    
    if (allSelected) {
      // Deselect all from this vendor
      setSelectedIds(prev => prev.filter(id => !vendorItemIds.includes(id)));
    } else {
      // Select all from this vendor
      setSelectedIds(prev => [...new Set([...prev, ...vendorItemIds])]);
    }
  };

  const handleQuickRaisePO = (supplierId: number) => {
    const vendorGroup = vendorGroups.find(g => g.supplierId === supplierId);
    if (!vendorGroup) return;
    
    // Select all items from this vendor
    const vendorItemIds = vendorGroup.items.map(i => i.id);
    setSelectedIds(vendorItemIds);
    setQuickRaiseVendor(supplierId);
    setShowRaiseModal(true);
  };

  const selectedItems = stagingItems?.filter(i => selectedIds.includes(i.id)) || [];
  
  // Get unit costs for selected items from preferred vendors
  const selectedItemsWithCosts = useMemo(() => {
    return selectedItems.map(item => {
      // Find the vendor group this item belongs to
      const vendorGroup = vendorGroups.find(g => g.items.some(i => i.id === item.id));
      const unitCost = vendorGroup?.unitCosts.get(item.id);
      return {
        ...item,
        unitCost: unitCost, // Add unit cost from preferred vendor
      };
    });
  }, [selectedItems, vendorGroups]);

  // Calculate stats
  const totalShortfall = stagingItems?.reduce((sum, item) => sum + Math.abs(item.shortfall), 0) || 0;
  const selectedCount = selectedIds.length;
  const vendorCount = vendorGroups.length;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden">
      
      {/* Header and Stats - Fixed, doesn't scroll */}
      <div className="flex-shrink-0 p-4 sm:p-10 space-y-10">
        
        {/* Header Ledger Block */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 px-2">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <Button variant="ghost" size="icon" onClick={() => navigate("purchasing")} className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-muted-foreground/40 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all">
                  <ArrowLeft size={18} strokeWidth={3} />
               </Button>
               <span className="font-bold text-[10px] text-muted-foreground/40 uppercase tracking-[0.25em] italic">Procurement Staging</span>
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">Reorder Staging</h1>
            <p className="text-lg font-medium text-muted-foreground/40 leading-tight">
              {viewMode === 'vendor' 
                ? 'Items grouped by preferred vendor — click to select and raise PO'
                : 'Ingredients below threshold waiting for commitment.'}
            </p>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
            <button
              onClick={() => setViewMode('vendor')}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                viewMode === 'vendor'
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-muted-foreground/40 hover:text-foreground hover:bg-slate-50 dark:hover:bg-white/5"
              )}
            >
              <LayoutGrid size={16} />
              Vendor View
            </button>
            <button
              onClick={() => setViewMode('advanced')}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                viewMode === 'advanced'
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-muted-foreground/40 hover:text-foreground hover:bg-slate-50 dark:hover:bg-white/5"
              )}
            >
              <List size={16} />
              Advanced
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
           <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] shadow-sm">
              <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em] mb-4">Total Shortfall</p>
              <h4 className="text-4xl font-black text-foreground tracking-tighter tabular-nums">{stagingItems?.length || 0}</h4>
              <p className="text-[11px] font-bold text-rose-500 mt-2 uppercase tracking-tight italic">Items Need Restock</p>
           </div>
           
           <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] shadow-sm">
              <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em] mb-4">Preferred Vendors</p>
              <h4 className="text-4xl font-black text-foreground tracking-tighter tabular-nums">{vendorCount}</h4>
              <p className="text-[11px] font-bold text-emerald-500 mt-2 uppercase tracking-tight italic">With Low Stock Items</p>
           </div>

           <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] shadow-sm">
              <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em] mb-4">Selected</p>
              <h4 className="text-4xl font-black text-foreground tracking-tighter tabular-nums">{selectedCount}</h4>
              <p className="text-[11px] font-bold text-indigo-500 mt-2 uppercase tracking-tight italic">Ready to Order</p>
           </div>

           <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] shadow-sm">
              <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em] mb-4">Raise PO</p>
              <Button 
                onClick={() => setShowRaiseModal(true)} 
                disabled={selectedIds.length === 0}
                className={cn(
                  "w-full h-14 mt-2 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-500/20 gap-2 font-black text-sm uppercase tracking-wider transition-all",
                  selectedIds.length > 0 ? "scale-100 opacity-100 hover:bg-indigo-700" : "opacity-40 cursor-not-allowed"
                )}
              >
                <ShoppingCart size={18} strokeWidth={3} />
                Create PO
              </Button>
           </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
             <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          </div>
        ) : stagingItems?.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-6 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[3rem] m-4 sm:m-10">
             <div className="h-24 w-24 rounded-[2.5rem] bg-indigo-50 dark:bg-indigo-500/5 flex items-center justify-center text-indigo-600 shadow-inner">
                <Truck size={40} className="opacity-20" />
             </div>
             <div className="space-y-2">
                <h3 className="text-3xl font-black text-foreground tracking-tight leading-none">All Stock Verified</h3>
                <p className="text-lg font-medium text-muted-foreground/40 leading-relaxed font-sans max-w-sm">No ingredients currently fall below their reorder threshold. All levels are optimal.</p>
             </div>
          </div>
        ) : viewMode === 'vendor' ? (
          <VendorCardView 
            vendorGroups={vendorGroups}
            selectedIds={selectedIds}
            onVendorSelect={handleVendorSelect}
            onQuickRaise={handleQuickRaisePO}
          />
        ) : (
          <StagingTable 
            items={stagingItems || []} 
            selectedIds={selectedIds} 
            onToggleSelect={handleToggleSelect} 
            onSelectAll={handleSelectAll} 
          />
        )}
      </div>

      <Suspense fallback={null}>
        <RaisePOModal
          open={showRaiseModal}
          onOpenChange={(open) => {
            setShowRaiseModal(open);
            if (!open) setQuickRaiseVendor(null);
          }}
          selectedItems={selectedItemsWithCosts}
          onSuccess={() => {
            setSelectedIds([]);
            setQuickRaiseVendor(null);
          }}
          defaultSupplierId={quickRaiseVendor || undefined}
        />
      </Suspense>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * VENDOR CARD VIEW COMPONENT
 * ───────────────────────────────────────────────────────────────── */
interface VendorCardViewProps {
  vendorGroups: VendorGroup[];
  selectedIds: number[];
  onVendorSelect: (supplierId: number) => void;
  onQuickRaise: (supplierId: number) => void;
}

function VendorCardView({ vendorGroups, selectedIds, onVendorSelect, onQuickRaise }: VendorCardViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-4">
      {vendorGroups.map((group) => {
        const isAllSelected = group.items.every(item => selectedIds.includes(item.id));
        const isPartialSelected = group.items.some(item => selectedIds.includes(item.id)) && !isAllSelected;
        
        return (
          <div 
            key={group.supplierId}
            className={cn(
              "group relative bg-white dark:bg-slate-900 border-2 rounded-[2rem] overflow-hidden transition-all cursor-pointer",
              isAllSelected 
                ? "border-indigo-500 shadow-xl shadow-indigo-500/10" 
                : isPartialSelected
                  ? "border-indigo-300 shadow-lg shadow-indigo-500/5"
                  : "border-slate-200 dark:border-white/5 hover:border-rose-300 hover:shadow-lg hover:shadow-rose-500/5"
            )}
            onClick={() => onVendorSelect(group.supplierId)}
          >
            {/* Selection Indicator */}
            <div className={cn(
              "absolute top-6 right-6 h-8 w-8 rounded-full flex items-center justify-center transition-all",
              isAllSelected 
                ? "bg-indigo-600 text-white" 
                : isPartialSelected
                  ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600"
                  : "bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-slate-600 group-hover:bg-rose-100 group-hover:text-rose-500"
            )}>
              {isAllSelected ? (
                <CheckCircle2 size={18} strokeWidth={3} />
              ) : isPartialSelected ? (
                <div className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
              ) : (
                <div className="h-2.5 w-2.5 rounded-full border-2 border-current" />
              )}
            </div>

            {/* Card Header */}
            <div className="p-8 pb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={cn(
                  "h-14 w-14 rounded-2xl flex items-center justify-center transition-colors",
                  isAllSelected 
                    ? "bg-indigo-600 text-white" 
                    : "bg-rose-50 dark:bg-rose-500/10 text-rose-500 group-hover:bg-rose-100 dark:group-hover:bg-rose-500/20"
                )}>
                  <Building2 size={24} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black text-foreground tracking-tight truncate">
                    {group.supplierName}
                  </h3>
                  <p className="text-xs font-bold text-muted-foreground/30 uppercase tracking-wider">
                    Supplier #{group.supplierId}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-black/20">
                  <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-wider mb-1">Items</p>
                  <p className="text-2xl font-black text-foreground">{group.items.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-black/20">
                  <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-wider mb-1">Shortfall</p>
                  <p className="text-2xl font-black text-rose-500">{group.totalShortfall}</p>
                </div>
              </div>

              {/* Items List Preview */}
              <div className="space-y-2 mb-6">
                {group.items.slice(0, 3).map((item) => (
                  <div 
                    key={item.id}
                    className={cn(
                      "flex items-center justify-between py-2 px-3 rounded-xl transition-colors",
                      selectedIds.includes(item.id) 
                        ? "bg-indigo-50 dark:bg-indigo-500/10" 
                        : "bg-slate-50 dark:bg-black/10"
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        selectedIds.includes(item.id) ? "bg-indigo-500" : "bg-rose-400"
                      )} />
                      <span className="text-xs font-bold text-muted-foreground/50 uppercase truncate">
                        {item.itemCode}
                      </span>
                    </div>
                    <span className="text-xs font-black text-foreground">
                      −{Math.abs(item.shortfall)} {item.unit}
                    </span>
                  </div>
                ))}
                {group.items.length > 3 && (
                  <p className="text-[10px] font-bold text-muted-foreground/30 text-center py-1">
                    +{group.items.length - 3} more items
                  </p>
                )}
              </div>
            </div>

            {/* Card Footer - Quick Raise Button */}
            <div className="px-8 pb-8 pt-0">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickRaise(group.supplierId);
                }}
                className={cn(
                  "w-full h-12 rounded-2xl font-black text-xs uppercase tracking-wider transition-all",
                  isAllSelected
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                    : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-500/20"
                )}
              >
                <PackagePlus size={16} className="mr-2" />
                Raise PO for {group.items.length} Items
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
