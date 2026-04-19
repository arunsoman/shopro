// ─────────────────────────────────────────────────────────────
// components/OverrideEditorTable.tsx (ME.8 override panel)
// Editable table of menu item prices for What-If simulation.
// BE: WhatIfOverride uses itemId (number), not menuItemId.
// ─────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { Plus, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { InlineEdit } from "@/components/ui/InlineEdit";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/Popover";
import { ClassificationBadge } from "./ClassificationBadge";
import { formatCurrency } from "../hooks/useMenuEngineering";

interface OverrideEditorTableProps {
  results: {
    itemId: number;
    itemName: string;
    sellPrice: number;
    contributionMargin: number;
    classification: string;
  }[];
  overrides: {
    itemId: number;
    newSellPrice: number;
    itemName: string;
    sellPrice: number;
    classification: string;
    contributionMargin: number;
  }[];
  onOverridesChange: (overrides: OverrideEditorTableProps["overrides"]) => void;
}

export function OverrideEditorTable({
  results,
  overrides,
  onOverridesChange,
}: OverrideEditorTableProps) {
  const [adding, setAdding] = useState(false);

  const availableItems = useMemo(
    () => results.filter((r) => !overrides.some((o) => o.itemId === r.itemId)),
    [results, overrides],
  );

  const handlePriceChange = (itemId: number, newPrice: string) => {
    const parsed = parseFloat(newPrice);
    if (isNaN(parsed) || parsed <= 0) return;
    onOverridesChange(
      overrides.map((o) =>
        o.itemId === itemId ? { ...o, newSellPrice: parsed } : o,
      ),
    );
  };

  const handleRemoveOverride = (itemId: number) => {
    onOverridesChange(overrides.filter((o) => o.itemId !== itemId));
  };

  const handleAddItem = (itemId: number) => {
    const item = results.find((r) => r.itemId === itemId);
    if (!item) return;
    // Build the override entry — explicit fields, no spread conflict.
    const entry = {
      itemId,
      newSellPrice: item.sellPrice,
      itemName:      item.itemName,
      sellPrice:     item.sellPrice,
      classification: item.classification,
      contributionMargin: item.contributionMargin,
    };
    onOverridesChange([...overrides, entry]);
    setAdding(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Price Overrides</h3>
        <div className="flex gap-2">
          <Popover open={adding} onOpenChange={setAdding}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 rounded-lg gap-1 text-xs">
                <Plus size={12} /> Add Override
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-2" align="end">
              {availableItems.length === 0 ? (
                <div className="py-4 text-center text-xs text-muted-foreground">All items have overrides.</div>
              ) : (
                <div className="max-h-[240px] overflow-y-auto space-y-1">
                  {availableItems.map((item) => (
                    <button
                      key={item.itemId}
                      onClick={() => handleAddItem(item.itemId)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-2 text-xs flex items-center justify-between group"
                    >
                      <span className="font-semibold truncate">{item.itemName}</span>
                      <span className="text-muted-foreground">{formatCurrency(item.sellPrice)}</span>
                    </button>
                  ))}
                </div>
              )}
            </PopoverContent>
          </Popover>

          {overrides.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-lg gap-1 text-xs text-rose-600"
              onClick={() => onOverridesChange([])}
            >
              <RotateCcw size={12} /> Reset All
            </Button>
          )}
        </div>
      </div>

      {overrides.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No price overrides. Click "Add Override" to simulate price changes.
        </div>
      ) : (
        <div className="divide-y divide-border-soft rounded-xl border border-border">
          {overrides.map((o) => (
            <div key={o.itemId} className="flex items-center gap-4 px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground truncate">{o.itemName}</span>
                  <ClassificationBadge classification={o.classification} />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Current: {formatCurrency(o.sellPrice)} · CM: {formatCurrency(o.contributionMargin)}
                </div>
              </div>
              <div className="w-28 text-right">
                <InlineEdit
                  value={o.newSellPrice.toFixed(2)}
                  onSave={(val) => handlePriceChange(o.itemId, val)}
                  className="text-right font-mono font-semibold text-sm tabular-nums"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-rose-600"
                onClick={() => handleRemoveOverride(o.itemId)}
              >
                <X size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
