import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FURNITURE_TEMPLATES, type FurnitureTemplate } from '../../types/studio-types';
import { useFloorPlanStore } from '../../store/studio-store';

const CATEGORY_LABELS: Record<string, string> = {
  tables: 'Tables',
  rooms: 'Rooms & Zones',
  structural: 'Structural',
  decor: 'Décor & Fixtures',
};

const CATEGORY_ORDER = ['tables', 'rooms', 'structural', 'decor'];

const FurniturePanel: React.FC = () => {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const { setDraggingFromPanel } = useFloorPlanStore();

  const filtered = FURNITURE_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const items = filtered.filter(t => t.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {} as Record<string, FurnitureTemplate[]>);

  const handleDragStart = (template: FurnitureTemplate) => {
    setDraggingFromPanel(true, template);
  };

  const handleDragEnd = () => {
    setDraggingFromPanel(false);
  };

  return (
    <div className="w-56 bg-editor-panel text-editor-panel-foreground flex flex-col border-r border-editor-panel-border overflow-hidden shrink-0">
      <div className="p-3 border-b border-editor-panel-border">
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-2 text-editor-panel-foreground/60">
          Furniture
        </h2>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-editor-panel-foreground/40" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            className="h-7 pl-7 text-xs bg-editor-panel-muted border-editor-panel-border text-editor-panel-foreground placeholder:text-editor-panel-foreground/30"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat}>
            <button
              onClick={() => setCollapsed(c => ({ ...c, [cat]: !c[cat] }))}
              className="w-full flex items-center justify-between px-1 py-1.5 text-[10px] uppercase tracking-widest font-semibold text-editor-panel-foreground/50 hover:text-editor-panel-foreground/80 transition-colors"
            >
              {CATEGORY_LABELS[cat]}
              <span className="text-[9px]">{collapsed[cat] ? '▸' : '▾'}</span>
            </button>
            {!collapsed[cat] && (
              <div className="grid grid-cols-2 gap-1 mb-2">
                {items.map(item => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(item)}
                    onDragEnd={handleDragEnd}
                    className="flex flex-col items-center justify-center p-2 rounded cursor-grab active:cursor-grabbing bg-editor-panel-muted hover:bg-editor-panel-border transition-colors text-center group"
                    title={item.name}
                  >
                    <div className="text-lg mb-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      {item.shapeType === 'CIRCLE' ? (
                        <div className="w-6 h-6 rounded-full border-2 border-editor-panel-foreground/30 group-hover:border-editor-panel-accent mx-auto" />
                      ) : item.shapeType === 'RECTANGLE' ? (
                        <div className="w-7 h-5 rounded border-2 border-editor-panel-foreground/30 group-hover:border-editor-panel-accent mx-auto" />
                      ) : (
                        <span className="text-sm">{item.icon}</span>
                      )}
                    </div>
                    <span className="text-[9px] leading-tight text-editor-panel-foreground/60 group-hover:text-editor-panel-foreground/90">
                      {item.name.replace(' Table', '').replace(' — ', '\n')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FurniturePanel;
