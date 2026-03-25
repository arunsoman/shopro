import React from 'react';
import {
  MousePointer2, Hand, Square, Undo2, Redo2, Grid3X3, Magnet,
  ZoomIn, ZoomOut, Maximize, Trash2, Copy, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useFloorPlanStore } from '../../store/studio-store';
import type { EditorTool } from '../../types/studio-types';

interface ToolBtnProps {
  icon: React.ElementType;
  label: string;
  shortcut?: string;
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const ToolBtn: React.FC<ToolBtnProps> = ({ icon: Icon, label, shortcut, active, onClick, disabled }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClick}
        disabled={disabled}
        className={`w-8 h-8 rounded-md transition-colors ${
          active
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'text-editor-panel-foreground/70 hover:text-editor-panel-foreground hover:bg-editor-panel-muted'
        }`}
      >
        <Icon className="w-4 h-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent side="bottom" className="text-xs">
      {label}{shortcut && <span className="ml-1.5 text-muted-foreground">{shortcut}</span>}
    </TooltipContent>
  </Tooltip>
);

const EditorToolbar: React.FC = () => {
  const {
    activeTool, setActiveTool, showGrid, setShowGrid,
    snapEnabled, setSnapEnabled, zoom, setZoom, setPan,
    undo, redo, undoStack, redoStack,
    deleteSelected, duplicateSelected, selectedIds,
  } = useFloorPlanStore();

  return (
    <div className="h-10 bg-editor-panel border-b border-editor-panel-border flex items-center px-2 gap-0.5 shrink-0">
      {/* Tool modes */}
      <ToolBtn icon={MousePointer2} label="Select" shortcut="V" active={activeTool === 'select'} onClick={() => setActiveTool('select')} />
      <ToolBtn icon={Hand} label="Pan" shortcut="H" active={activeTool === 'pan'} onClick={() => setActiveTool('pan')} />
      <ToolBtn icon={Square} label="Section" shortcut="R" active={activeTool === 'section'} onClick={() => setActiveTool('section')} />

      <Separator orientation="vertical" className="mx-1.5 h-5 bg-editor-panel-border" />

      {/* Undo/Redo */}
      <ToolBtn icon={Undo2} label="Undo" shortcut="⌘Z" onClick={undo} disabled={undoStack.length === 0} />
      <ToolBtn icon={Redo2} label="Redo" shortcut="⌘⇧Z" onClick={redo} disabled={redoStack.length === 0} />

      <Separator orientation="vertical" className="mx-1.5 h-5 bg-editor-panel-border" />

      {/* Grid & Snap */}
      <ToolBtn icon={Grid3X3} label="Grid" shortcut="⌘'" active={showGrid} onClick={() => setShowGrid(!showGrid)} />
      <ToolBtn icon={Magnet} label="Snap" active={snapEnabled} onClick={() => setSnapEnabled(!snapEnabled)} />

      <Separator orientation="vertical" className="mx-1.5 h-5 bg-editor-panel-border" />

      {/* Zoom */}
      <ToolBtn icon={ZoomOut} label="Zoom Out" shortcut="⌘-" onClick={() => setZoom(zoom - 0.1)} />
      <ToolBtn icon={ZoomIn} label="Zoom In" shortcut="⌘+" onClick={() => setZoom(zoom + 0.1)} />
      <ToolBtn icon={Maximize} label="Fit" shortcut="⌘⇧H" onClick={() => { setZoom(1); setPan(20, 20); }} />

      <div className="flex-1" />

      {/* Actions */}
      <ToolBtn icon={Copy} label="Duplicate" shortcut="⌘D" onClick={duplicateSelected} disabled={selectedIds.length === 0} />
      <ToolBtn icon={Trash2} label="Delete" shortcut="Del" onClick={deleteSelected} disabled={selectedIds.length === 0} />

      <Separator orientation="vertical" className="mx-1.5 h-5 bg-editor-panel-border" />

      <ToolBtn icon={Save} label="Save Draft" shortcut="⌘S" onClick={() => {}} />

      <Button
        size="sm"
        className="h-7 text-xs ml-1 px-3 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Publish
      </Button>
    </div>
  );
};

export default EditorToolbar;
