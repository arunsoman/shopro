import React, { useEffect, useCallback } from 'react';
import { useFloorPlanStore } from '../../store/studio-store';
import EditorToolbar from './EditorToolbar';
import FloorTabs from './FloorTabs';
import FurniturePanel from './FurniturePanel';
import EditorCanvas from './EditorCanvas';
import PropertiesPanel from './PropertiesPanel';

const FloorPlanEditor: React.FC = () => {
  const {
    setActiveTool, undo, redo, deleteSelected, duplicateSelected,
    selectAll, clearSelection, showGrid, setShowGrid,
  } = useFloorPlanStore();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isInput = (e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA';
    if (isInput) return;

    const ctrl = e.ctrlKey || e.metaKey;

    // Tool shortcuts
    if (e.key === 'v' && !ctrl) { setActiveTool('select'); e.preventDefault(); }
    if (e.key === 'h' && !ctrl) { setActiveTool('pan'); e.preventDefault(); }
    if (e.key === 'r' && !ctrl) { setActiveTool('section'); e.preventDefault(); }

    // Undo/Redo
    if (ctrl && e.key === 'z' && !e.shiftKey) { undo(); e.preventDefault(); }
    if (ctrl && e.key === 'z' && e.shiftKey) { redo(); e.preventDefault(); }
    if (ctrl && e.key === 'y') { redo(); e.preventDefault(); }

    // Delete
    if (e.key === 'Delete' || e.key === 'Backspace') { deleteSelected(); e.preventDefault(); }

    // Duplicate
    if (ctrl && e.key === 'd') { duplicateSelected(); e.preventDefault(); }

    // Select all
    if (ctrl && e.key === 'a') { selectAll(); e.preventDefault(); }

    // Escape
    if (e.key === 'Escape') { clearSelection(); }

    // Grid toggle
    if (ctrl && e.key === "'") { setShowGrid(!showGrid); e.preventDefault(); }

    // Prevent save
    if (ctrl && e.key === 's') { e.preventDefault(); }
  }, [setActiveTool, undo, redo, deleteSelected, duplicateSelected, selectAll, clearSelection, showGrid, setShowGrid]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="h-screen w-full flex flex-col bg-editor-panel overflow-hidden">
      <EditorToolbar />
      <FloorTabs />
      <div className="flex flex-1 min-h-0">
        <FurniturePanel />
        <EditorCanvas />
        <PropertiesPanel />
      </div>
    </div>
  );
};

export default FloorPlanEditor;
