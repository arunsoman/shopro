/**
 * CostingFlow.tsx
 * ─────────────────────────────────────────────────────────────────
 * Main coordinator for the Menu Item Costing flow (SS3.4 Hub to SS3.6 precision).
 * Manages the internal local navigation between:
 *   1.  ledgers (list of cost groups)
 *   2.  items (list of items within a group)
 *   3.  editor (deep precision editor)
 */

import { useState } from 'react';
import CostGroupHub from './CostGroupHub';
import ItemList from './ItemList';
import PrecisionCostCard from './CostCard';

type ViewMode = 'HUB' | 'ITEMS' | 'EDITOR';

export default function MenuItemCostingFlow() {
  const [view, setView] = useState<ViewMode>('HUB');
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  const handleGroupSelect = (id: number) => {
    setSelectedGroupId(id);
    setView('ITEMS');
  };

  const handleItemSelect = (id: number) => {
    setSelectedItemId(id);
    setView('EDITOR');
  };

  const handleBack = () => {
    if (view === 'EDITOR') setView('ITEMS');
    else if (view === 'ITEMS') setView('HUB');
  };

  return (
    <div className="w-full  bg-slate-50 dark:bg-slate-950 font-sans">
      {view === 'HUB' && (
        <CostGroupHub onGroupSelect={handleGroupSelect} />
      )}

      {view === 'ITEMS' && selectedGroupId && (
        <ItemList
          groupId={selectedGroupId}
          onItemSelect={handleItemSelect}
          onBack={handleBack}
        />
      )}

      {view === 'EDITOR' && selectedItemId && (
        <PrecisionCostCard
          itemId={selectedItemId}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
