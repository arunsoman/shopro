import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useFloorPlanStore } from '../../store/studio-store';
import type { ShapeType } from '../../types/studio-types';

const PropertiesPanel: React.FC = () => {
  const { getActiveFloor, selectedIds, updateTable } = useFloorPlanStore();
  const floor = getActiveFloor();

  const selectedTable = selectedIds.length === 1
    ? floor.furniture.find(t => t.id === selectedIds[0])
    : null;

  if (!selectedTable) {
    return (
      <div className="w-56 bg-editor-panel text-editor-panel-foreground border-l border-editor-panel-border flex flex-col shrink-0">
        <div className="p-3 border-b border-editor-panel-border">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-editor-panel-foreground/60">
            Properties
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-[11px] text-editor-panel-foreground/40 text-center">
            {selectedIds.length > 1
              ? `${selectedIds.length} objects selected`
              : 'Select an object to edit its properties'}
          </p>
        </div>
        {/* Floor info */}
        <div className="p-3 border-t border-editor-panel-border space-y-2">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-editor-panel-foreground/50">Floor</p>
          <p className="text-xs text-editor-panel-foreground/80">{floor.name}</p>
          <p className="text-[10px] text-editor-panel-foreground/40">
            {floor.canvasWidth} × {floor.canvasHeight} · {floor.furniture.length} objects
          </p>
        </div>
      </div>
    );
  }

  const update = (updates: Record<string, any>) => updateTable(selectedTable.id, updates);
  const updateExtra = (key: string, value: any) => {
    update({ extraProps: { ...selectedTable.extraProps, [key]: value } });
  };

  return (
    <div className="w-56 bg-editor-panel text-editor-panel-foreground border-l border-editor-panel-border flex flex-col shrink-0 overflow-y-auto">
      <div className="p-3 border-b border-editor-panel-border">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-editor-panel-foreground/60">
          Properties
        </h2>
      </div>

      <div className="p-3 space-y-3">
        {/* Name */}
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-wider text-editor-panel-foreground/50">Name</Label>
          <Input
            value={selectedTable.name}
            onChange={e => update({ name: e.target.value })}
            className="h-7 text-xs bg-editor-panel-muted border-editor-panel-border text-editor-panel-foreground"
          />
        </div>

        {/* Shape */}
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-wider text-editor-panel-foreground/50">Shape</Label>
          <Select value={selectedTable.shapeType} onValueChange={(v: ShapeType) => update({ shapeType: v })}>
            <SelectTrigger className="h-7 text-xs bg-editor-panel-muted border-editor-panel-border text-editor-panel-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CIRCLE">Circle</SelectItem>
              <SelectItem value="RECTANGLE">Rectangle</SelectItem>
              <SelectItem value="DECOR">Decor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Capacity */}
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-wider text-editor-panel-foreground/50">Capacity</Label>
          <Input
            type="number"
            min={0}
            max={20}
            value={selectedTable.capacity}
            onChange={e => update({ capacity: parseInt(e.target.value) || 0 })}
            className="h-7 text-xs bg-editor-panel-muted border-editor-panel-border text-editor-panel-foreground"
          />
        </div>

        {/* Size */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wider text-editor-panel-foreground/50">W</Label>
            <Input
              type="number"
              value={Math.round(selectedTable.width)}
              onChange={e => update({ width: parseInt(e.target.value) || 20 })}
              className="h-7 text-xs bg-editor-panel-muted border-editor-panel-border text-editor-panel-foreground"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wider text-editor-panel-foreground/50">H</Label>
            <Input
              type="number"
              value={Math.round(selectedTable.height)}
              onChange={e => update({ height: parseInt(e.target.value) || 20 })}
              className="h-7 text-xs bg-editor-panel-muted border-editor-panel-border text-editor-panel-foreground"
            />
          </div>
        </div>

        {/* Position */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wider text-editor-panel-foreground/50">X</Label>
            <Input
              type="number"
              value={Math.round(selectedTable.posX)}
              onChange={e => update({ posX: parseInt(e.target.value) || 0 })}
              className="h-7 text-xs bg-editor-panel-muted border-editor-panel-border text-editor-panel-foreground font-mono"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wider text-editor-panel-foreground/50">Y</Label>
            <Input
              type="number"
              value={Math.round(selectedTable.posY)}
              onChange={e => update({ posY: parseInt(e.target.value) || 0 })}
              className="h-7 text-xs bg-editor-panel-muted border-editor-panel-border text-editor-panel-foreground font-mono"
            />
          </div>
        </div>

        {/* Rotation */}
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-wider text-editor-panel-foreground/50">Rotation</Label>
          <Input
            type="number"
            step={15}
            value={selectedTable.extraProps.rotation}
            onChange={e => updateExtra('rotation', parseInt(e.target.value) || 0)}
            className="h-7 text-xs bg-editor-panel-muted border-editor-panel-border text-editor-panel-foreground font-mono"
          />
        </div>

        <div className="border-t border-editor-panel-border pt-3 space-y-3">
          {/* Locked */}
          <div className="flex items-center justify-between">
            <Label className="text-[10px] uppercase tracking-wider text-editor-panel-foreground/50">Locked</Label>
            <Switch
              checked={selectedTable.extraProps.locked}
              onCheckedChange={v => updateExtra('locked', v)}
              className="scale-75"
            />
          </div>

          {/* Combinable */}
          <div className="flex items-center justify-between">
            <Label className="text-[10px] uppercase tracking-wider text-editor-panel-foreground/50">Combinable</Label>
            <Switch
              checked={selectedTable.extraProps.combinable}
              onCheckedChange={v => updateExtra('combinable', v)}
              className="scale-75"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1 border-t border-editor-panel-border pt-3">
          <Label className="text-[10px] uppercase tracking-wider text-editor-panel-foreground/50">Notes</Label>
          <Textarea
            value={selectedTable.extraProps.notes}
            onChange={e => updateExtra('notes', e.target.value)}
            rows={2}
            className="text-xs bg-editor-panel-muted border-editor-panel-border text-editor-panel-foreground resize-none"
          />
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
