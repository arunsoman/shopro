import React, { useRef, useCallback, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Circle, Text, Group } from 'react-konva';
import type Konva from 'konva';
import { useFloorPlanStore } from '../../store/studio-store';
import type { TableShape } from '../../types/studio-types';

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: '#34d399',
  HELD: '#fbbf24',
  OCCUPIED: '#ef4444',
  ORDER_PLACED: '#f97316',
  PAYING: '#3b82f6',
  DIRTY: '#9ca3af',
};

const SECTION_OPACITY = 0.12;

interface TableNodeProps {
  table: TableShape;
  isSelected: boolean;
  onSelect: (id: string, shiftKey: boolean) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}

const TableNode: React.FC<TableNodeProps> = ({ table, isSelected, onSelect, onDragEnd }) => {
  const { extraProps } = table;
  const fill = extraProps.colorOverride || STATUS_COLORS[table.status] || '#e5e7eb';
  const strokeColor = isSelected ? '#3b82f6' : '#64748b';
  const strokeWidth = isSelected ? 2.5 : 1;

  return (
    <Group
      x={table.posX}
      y={table.posY}
      draggable={!extraProps.locked}
      rotation={extraProps.rotation}
      onClick={(e) => onSelect(table.id, e.evt.shiftKey)}
      onTap={() => onSelect(table.id, false)}
      onDragEnd={(e) => {
        const node = e.target;
        onDragEnd(table.id, node.x(), node.y());
      }}
    >
      {table.shapeType === 'CIRCLE' ? (
        <Circle
          x={table.width / 2}
          y={table.height / 2}
          radius={table.width / 2}
          fill={fill}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          shadowColor="rgba(0,0,0,0.1)"
          shadowBlur={4}
          shadowOffsetY={2}
        />
      ) : (
        <Rect
          width={table.width}
          height={table.height}
          fill={fill}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          cornerRadius={table.shapeType === 'DECOR' ? 2 : 6}
          shadowColor="rgba(0,0,0,0.1)"
          shadowBlur={4}
          shadowOffsetY={2}
        />
      )}

      {/* Capacity number */}
      {table.capacity > 0 && (
        <Text
          text={String(table.capacity)}
          x={0}
          y={table.shapeType === 'CIRCLE' ? table.height / 2 - 7 : table.height / 2 - 7}
          width={table.width}
          align="center"
          fontSize={14}
          fontStyle="600"
          fill="#1e293b"
          fontFamily="IBM Plex Sans"
        />
      )}

      {/* Icon for Decor/Rooms */}
      {table.icon && table.capacity === 0 && (
        <Text
          text={table.icon}
          x={0}
          y={table.height / 2 - 10}
          width={table.width}
          align="center"
          fontSize={Math.min(table.width, table.height) * 0.5}
          fill="#1e293b"
          opacity={0.6}
        />
      )}

      {/* Table label */}
      <Text
        text={table.name}
        x={0}
        y={table.shapeType === 'CIRCLE' ? table.height + 6 : table.height + 4}
        width={table.width}
        align="center"
        fontSize={10}
        fill="#64748b"
        fontFamily="IBM Plex Sans"
      />

      {/* Chair dots around perimeter */}
      {table.capacity > 0 && Array.from({ length: table.capacity }).map((_, i) => {
        const cx = table.width / 2;
        const cy = table.height / 2;
        const r = (Math.max(table.width, table.height) / 2) + 10;
        const angle = (2 * Math.PI * i) / table.capacity - Math.PI / 2;
        return (
          <Circle
            key={i}
            x={cx + Math.cos(angle) * r}
            y={cy + Math.sin(angle) * r}
            radius={5}
            fill="#94a3b8"
            stroke="#cbd5e1"
            strokeWidth={1}
          />
        );
      })}

      {/* Selection ring for circles */}
      {isSelected && table.shapeType === 'CIRCLE' && (
        <Circle
          x={table.width / 2}
          y={table.height / 2}
          radius={table.width / 2 + 3}
          stroke="#3b82f6"
          strokeWidth={1.5}
          dash={[4, 3]}
          listening={false}
        />
      )}
      {isSelected && table.shapeType !== 'CIRCLE' && (
        <Rect
          x={-3}
          y={-3}
          width={table.width + 6}
          height={table.height + 6}
          stroke="#3b82f6"
          strokeWidth={1.5}
          dash={[4, 3]}
          listening={false}
        />
      )}
    </Group>
  );
};

const EditorCanvas: React.FC = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });

  const {
    getActiveFloor, zoom, panX, panY, setZoom, setPan,
    selectedIds, setSelectedIds, toggleSelection, clearSelection,
    moveTable, activeTool, showGrid, gridSize,
    draggingTemplate, addTable, setDraggingFromPanel,
  } = useFloorPlanStore();

  const floor = getActiveFloor();

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setStageSize({ width, height });
        }
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    if (e.evt.ctrlKey || e.evt.metaKey) {
      const scaleBy = 1.05;
      const newZoom = e.evt.deltaY < 0 ? zoom * scaleBy : zoom / scaleBy;
      setZoom(newZoom);
    } else {
      setPan(panX - e.evt.deltaX, panY - e.evt.deltaY);
    }
  }, [zoom, panX, panY, setZoom, setPan]);

  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      clearSelection();
    }
  }, [clearSelection]);

  const handleSelect = useCallback((id: string, shiftKey: boolean) => {
    if (shiftKey) {
      toggleSelection(id);
    } else {
      setSelectedIds([id]);
    }
  }, [toggleSelection, setSelectedIds]);

  const handleDragEnd = useCallback((id: string, x: number, y: number) => {
    moveTable(id, x, y);
  }, [moveTable]);

  // Handle drop from furniture panel
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!draggingTemplate || !stageRef.current) return;
    
    const stage = stageRef.current;
    const stageRect = stage.container().getBoundingClientRect();
    const x = (e.clientX - stageRect.left - panX) / zoom;
    const y = (e.clientY - stageRect.top - panY) / zoom;
    
    addTable(draggingTemplate, x - draggingTemplate.defaultWidth / 2, y - draggingTemplate.defaultHeight / 2);
    setDraggingFromPanel(false);
  }, [draggingTemplate, panX, panY, zoom, addTable, setDraggingFromPanel]);

  // Grid dots
  const gridDots: { x: number; y: number }[] = [];
  if (showGrid) {
    const spacing = gridSize * 4;
    for (let x = 0; x < floor.canvasWidth; x += spacing) {
      for (let y = 0; y < floor.canvasHeight; y += spacing) {
        gridDots.push({ x, y });
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-editor-canvas overflow-hidden relative"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={zoom}
        scaleY={zoom}
        x={panX}
        y={panY}
        onWheel={handleWheel}
        onClick={handleStageClick}
        onTap={() => clearSelection()}
        draggable={activeTool === 'pan'}
        onDragEnd={(e) => {
          if (activeTool === 'pan') {
            setPan(e.target.x(), e.target.y());
          }
        }}
      >
        <Layer>
          {/* Canvas background */}
          <Rect
            x={0}
            y={0}
            width={floor.canvasWidth}
            height={floor.canvasHeight}
            fill="#ffffff"
            cornerRadius={4}
            shadowColor="rgba(0,0,0,0.06)"
            shadowBlur={20}
            shadowOffsetY={4}
          />

          {/* Grid dots */}
          {gridDots.map((dot, i) => (
            <Circle
              key={`dot-${i}`}
              x={dot.x}
              y={dot.y}
              radius={1}
              fill="#c4c8d0"
              listening={false}
            />
          ))}

          {/* Sections */}
          {floor.sections.map(section => (
            <Group key={section.id}>
              <Rect
                x={section.posX}
                y={section.posY}
                width={section.width}
                height={section.height}
                fill={section.color}
                opacity={SECTION_OPACITY}
                cornerRadius={4}
              />
              <Rect
                x={section.posX}
                y={section.posY}
                width={section.width}
                height={section.height}
                stroke={section.color}
                strokeWidth={1.5}
                opacity={0.4}
                cornerRadius={4}
                listening={false}
              />
              <Text
                x={section.posX + 8}
                y={section.posY + 6}
                text={section.name}
                fontSize={11}
                fill={section.color}
                fontStyle="600"
                fontFamily="IBM Plex Sans"
                opacity={0.7}
              />
            </Group>
          ))}

          {/* Furniture */}
          {floor.furniture
            .filter(t => t.extraProps.visible)
            .map(table => (
              <TableNode
                key={table.id}
                table={table}
                isSelected={selectedIds.includes(table.id)}
                onSelect={handleSelect}
                onDragEnd={handleDragEnd}
              />
            ))}
        </Layer>
      </Stage>

      {/* Zoom indicator */}
      <div className="absolute bottom-3 right-3 bg-card/90 backdrop-blur border border-border rounded-md px-2.5 py-1 text-xs font-mono text-muted-foreground">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
};

export default EditorCanvas;
