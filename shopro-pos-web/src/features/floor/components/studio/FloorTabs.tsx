import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useFloorPlanStore } from '../../store/studio-store';

const FloorTabs: React.FC = () => {
  const { floors, activeFloorId, setActiveFloor, addFloor, deleteFloor, renameFloor } = useFloorPlanStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const startRename = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const commitRename = () => {
    if (editingId && editName.trim()) {
      renameFloor(editingId, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="h-8 bg-editor-panel border-b border-editor-panel-border flex items-center px-2 gap-1 shrink-0">
      {floors.map(floor => (
        <div
          key={floor.id}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] cursor-pointer transition-colors ${
            floor.id === activeFloorId
              ? 'bg-editor-panel-muted text-editor-panel-foreground'
              : 'text-editor-panel-foreground/50 hover:text-editor-panel-foreground/80'
          }`}
          onClick={() => setActiveFloor(floor.id)}
          onDoubleClick={() => startRename(floor.id, floor.name)}
        >
          {editingId === floor.id ? (
            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={e => e.key === 'Enter' && commitRename()}
              className="w-20 bg-transparent outline-none text-[11px]"
              autoFocus
            />
          ) : (
            <span>{floor.name}</span>
          )}
          {floors.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); deleteFloor(floor.id); }}
              className="opacity-0 group-hover:opacity-100 hover:text-destructive ml-1"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
      <button
        onClick={() => addFloor(`Floor ${floors.length + 1}`)}
        className="w-6 h-6 flex items-center justify-center rounded text-editor-panel-foreground/40 hover:text-editor-panel-foreground/80 hover:bg-editor-panel-muted transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default FloorTabs;
