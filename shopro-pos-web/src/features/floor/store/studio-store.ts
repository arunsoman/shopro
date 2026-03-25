import { create } from 'zustand';
import type { Floor, TableShape, Section, EditorTool, FurnitureTemplate } from '../types/studio-types';

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const snapToGrid = (val: number, gridSize: number) => Math.round(val / gridSize) * gridSize;

interface HistoryEntry {
  floors: Floor[];
}

interface FloorPlanState {
  floors: Floor[];
  activeFloorId: string;
  selectedIds: string[];
  activeTool: EditorTool;
  zoom: number;
  panX: number;
  panY: number;
  gridSize: number;
  showGrid: boolean;
  snapEnabled: boolean;
  isDraggingFromPanel: boolean;
  draggingTemplate: FurnitureTemplate | null;

  // History
  undoStack: HistoryEntry[];
  redoStack: HistoryEntry[];

  // Actions
  setActiveTool: (tool: EditorTool) => void;
  setActiveFloor: (floorId: string) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  setShowGrid: (show: boolean) => void;
  setSnapEnabled: (snap: boolean) => void;
  setSelectedIds: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  selectAll: () => void;

  // Floor CRUD
  addFloor: (name: string) => void;
  renameFloor: (floorId: string, name: string) => void;
  deleteFloor: (floorId: string) => void;

  // Furniture CRUD
  addTable: (template: FurnitureTemplate, posX: number, posY: number) => void;
  moveTable: (id: string, posX: number, posY: number) => void;
  resizeTable: (id: string, width: number, height: number) => void;
  updateTable: (id: string, updates: Partial<TableShape>) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;

  // Sections
  addSection: (name: string, color: string, posX: number, posY: number, width: number, height: number) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
  deleteSection: (id: string) => void;

  // DnD from panel
  setDraggingFromPanel: (dragging: boolean, template?: FurnitureTemplate | null) => void;

  // History
  undo: () => void;
  redo: () => void;

  // Helpers
  getActiveFloor: () => Floor;
}

const createExoticFloor = (): Floor => {
  const floorId = generateId();
  
  const sections: Section[] = [
    { id: 'sec-main', name: 'Main Dining', color: '#10b981', posX: 100, posY: 100, width: 600, height: 500 },
    { id: 'sec-pdr', name: 'VIP Private Suite', color: '#8b5cf6', posX: 750, posY: 100, width: 300, height: 300 },
    { id: 'sec-bar', name: 'Lounge & Bar', color: '#f59e0b', posX: 100, posY: 650, width: 600, height: 250 },
    { id: 'sec-outdoor', name: 'Zen Garden (Outdoor)', color: '#3b82f6', posX: 1100, posY: 100, width: 250, height: 800 },
  ];

  const furniture: TableShape[] = [
    // Main Dining Circle Tables
    { id: 't-1', name: 'T-1', capacity: 4, shapeType: 'CIRCLE', posX: 180, posY: 180, width: 80, height: 80, sectionId: 'sec-main', status: 'AVAILABLE', nfcTagId: null, extraProps: { rotation: 0, colorOverride: null, notes: '', combinable: true, minBookingSize: 2, locked: false, visible: true } },
    { id: 't-2', name: 'T-2', capacity: 4, shapeType: 'CIRCLE', posX: 440, posY: 180, width: 80, height: 80, sectionId: 'sec-main', status: 'OCCUPIED', nfcTagId: null, extraProps: { rotation: 0, colorOverride: null, notes: '', combinable: true, minBookingSize: 2, locked: false, visible: true } },
    
    // Main Dining Rect Tables
    { id: 't-3', name: 'T-3', capacity: 6, shapeType: 'RECTANGLE', posX: 180, posY: 380, width: 120, height: 60, sectionId: 'sec-main', status: 'AVAILABLE', nfcTagId: null, extraProps: { rotation: 0, colorOverride: null, notes: '', combinable: true, minBookingSize: 4, locked: false, visible: true } },
    { id: 't-4', name: 'T-4', capacity: 6, shapeType: 'RECTANGLE', posX: 440, posY: 380, width: 120, height: 60, sectionId: 'sec-main', status: 'ORDER_PLACED', nfcTagId: null, extraProps: { rotation: 0, colorOverride: null, notes: '', combinable: true, minBookingSize: 4, locked: false, visible: true } },

    // VIP Area
    { id: 'vip-1', name: 'Royal Table', capacity: 10, shapeType: 'RECTANGLE', posX: 800, posY: 180, width: 200, height: 80, sectionId: 'sec-pdr', status: 'HELD', nfcTagId: null, extraProps: { rotation: 90, colorOverride: '#7c3aed', notes: 'Premium seating', combinable: false, minBookingSize: 6, locked: false, visible: true } },
    
    // Bar Area
    { id: 'bar-cont', name: 'Grand Bar Counter', capacity: 0, shapeType: 'DECOR', posX: 120, posY: 680, width: 450, height: 40, sectionId: 'sec-bar', status: 'AVAILABLE', nfcTagId: null, extraProps: { rotation: 0, colorOverride: '#475569', notes: '', combinable: false, minBookingSize: 1, locked: true, visible: true }, icon: '▭' },
    { id: 'l-1', name: 'Lounge 1', capacity: 2, shapeType: 'CIRCLE', posX: 150, posY: 780, width: 50, height: 50, sectionId: 'sec-bar', status: 'AVAILABLE', nfcTagId: null, extraProps: { rotation: 0, colorOverride: null, notes: '', combinable: false, minBookingSize: 1, locked: false, visible: true } },
    { id: 'l-2', name: 'Lounge 2', capacity: 2, shapeType: 'CIRCLE', posX: 300, posY: 780, width: 50, height: 50, sectionId: 'sec-bar', status: 'AVAILABLE', nfcTagId: null, extraProps: { rotation: 0, colorOverride: null, notes: '', combinable: false, minBookingSize: 1, locked: false, visible: true } },
    { id: 'l-3', name: 'Lounge 3', capacity: 2, shapeType: 'CIRCLE', posX: 450, posY: 780, width: 50, height: 50, sectionId: 'sec-bar', status: 'PAYING', nfcTagId: null, extraProps: { rotation: 0, colorOverride: null, notes: '', combinable: false, minBookingSize: 1, locked: false, visible: true } },

    // Outdoor
    { id: 'p-1', name: 'Garden-1', capacity: 4, shapeType: 'CIRCLE', posX: 1175, posY: 200, width: 70, height: 70, sectionId: 'sec-outdoor', status: 'AVAILABLE', nfcTagId: null, extraProps: { rotation: 0, colorOverride: null, notes: '', combinable: true, minBookingSize: 2, locked: false, visible: true } },
    { id: 'p-2', name: 'Garden-2', capacity: 4, shapeType: 'CIRCLE', posX: 1175, posY: 400, width: 70, height: 70, sectionId: 'sec-outdoor', status: 'AVAILABLE', nfcTagId: null, extraProps: { rotation: 0, colorOverride: null, notes: '', combinable: true, minBookingSize: 2, locked: false, visible: true } },
    { id: 'p-3', name: 'Garden-3', capacity: 4, shapeType: 'CIRCLE', posX: 1175, posY: 600, width: 70, height: 70, sectionId: 'sec-outdoor', status: 'DIRTY', nfcTagId: null, extraProps: { rotation: 0, colorOverride: null, notes: '', combinable: true, minBookingSize: 2, locked: false, visible: true } },

    // BOH / Amenities
    { id: 'kit-1', name: 'Main Kitchen', capacity: 0, shapeType: 'DECOR', posX: 750, posY: 650, width: 300, height: 200, sectionId: null, status: 'AVAILABLE', nfcTagId: null, extraProps: { rotation: 0, colorOverride: '#f1f5f9', notes: '', combinable: false, minBookingSize: 0, locked: true, visible: true }, icon: '🍳' },
    { id: 'rr-m', name: 'Mens Room', capacity: 0, shapeType: 'DECOR', posX: 750, posY: 450, width: 80, height: 80, sectionId: null, status: 'AVAILABLE', nfcTagId: null, extraProps: { rotation: 0, colorOverride: '#f1f5f9', notes: '', combinable: false, minBookingSize: 0, locked: true, visible: true }, icon: '🚹' },
    { id: 'rr-w', name: 'Womens Room', capacity: 0, shapeType: 'DECOR', posX: 850, posY: 450, width: 80, height: 80, sectionId: null, status: 'AVAILABLE', nfcTagId: null, extraProps: { rotation: 0, colorOverride: '#f1f5f9', notes: '', combinable: false, minBookingSize: 0, locked: true, visible: true }, icon: '🚺' },
    { id: 'host', name: 'Reception', capacity: 0, shapeType: 'DECOR', posX: 20, posY: 350, width: 40, height: 60, sectionId: null, status: 'AVAILABLE', nfcTagId: null, extraProps: { rotation: 0, colorOverride: '#334155', notes: '', combinable: false, minBookingSize: 0, locked: true, visible: true }, icon: '🛎️' },
    
    // Structural
    { id: 'wall-1', name: 'North Wall', capacity: 0, shapeType: 'DECOR', posX: 0, posY: 0, width: 1400, height: 10, sectionId: null, status: 'AVAILABLE', nfcTagId: null, extraProps: { rotation: 0, colorOverride: '#1e293b', notes: '', combinable: false, minBookingSize: 0, locked: true, visible: true }, icon: '▬' },
    { id: 'wall-2', name: 'West Wall', capacity: 0, shapeType: 'DECOR', posX: 0, posY: 0, width: 10, height: 1000, sectionId: null, status: 'AVAILABLE', nfcTagId: null, extraProps: { rotation: 0, colorOverride: '#1e293b', notes: '', combinable: false, minBookingSize: 0, locked: true, visible: true }, icon: '┃' },
  ];

  return {
    id: floorId,
    name: 'Exotic Dining Experience',
    order: 1,
    canvasWidth: 1400,
    canvasHeight: 1000,
    sections,
    furniture,
  };
};

const defaultFloor = createExoticFloor();

export const useFloorPlanStore = create<FloorPlanState>((set, get) => {
  const pushHistory = () => {
    const { floors, undoStack } = get();
    set({
      undoStack: [...undoStack.slice(-49), { floors: JSON.parse(JSON.stringify(floors)) }],
      redoStack: [],
    });
  };

  const getActiveFloor = () => {
    const { floors, activeFloorId } = get();
    return floors.find(f => f.id === activeFloorId) || floors[0];
  };

  const updateActiveFloor = (updater: (floor: Floor) => Floor) => {
    const { floors, activeFloorId } = get();
    set({
      floors: floors.map(f => f.id === activeFloorId ? updater(f) : f),
    });
  };

  return {
    floors: [defaultFloor],
    activeFloorId: defaultFloor.id,
    selectedIds: [],
    activeTool: 'select',
    zoom: 1,
    panX: 40,
    panY: 40,
    gridSize: 10,
    showGrid: true,
    snapEnabled: true,
    isDraggingFromPanel: false,
    draggingTemplate: null,
    undoStack: [],
    redoStack: [],

    setActiveTool: (tool) => set({ activeTool: tool }),
    setActiveFloor: (floorId) => set({ activeFloorId: floorId, selectedIds: [] }),
    setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(4, zoom)) }),
    setPan: (x, y) => set({ panX: x, panY: y }),
    setShowGrid: (show) => set({ showGrid: show }),
    setSnapEnabled: (snap) => set({ snapEnabled: snap }),
    setSelectedIds: (ids) => set({ selectedIds: ids }),
    toggleSelection: (id) => {
      const { selectedIds } = get();
      set({
        selectedIds: selectedIds.includes(id)
          ? selectedIds.filter(i => i !== id)
          : [...selectedIds, id],
      });
    },
    clearSelection: () => set({ selectedIds: [] }),
    selectAll: () => {
      const floor = getActiveFloor();
      set({ selectedIds: floor.furniture.map(f => f.id) });
    },

    addFloor: (name) => {
      const newFloor: Floor = {
        id: generateId(),
        name,
        order: get().floors.length + 1,
        canvasWidth: 1400,
        canvasHeight: 1000,
        sections: [],
        furniture: [],
      };
      set(s => ({ floors: [...s.floors, newFloor], activeFloorId: newFloor.id }));
    },
    renameFloor: (floorId, name) => {
      set(s => ({ floors: s.floors.map(f => f.id === floorId ? { ...f, name } : f) }));
    },
    deleteFloor: (floorId) => {
      const { floors } = get();
      if (floors.length <= 1) return;
      const remaining = floors.filter(f => f.id !== floorId);
      set({ floors: remaining, activeFloorId: remaining[0].id });
    },

    addTable: (template, posX, posY) => {
      pushHistory();
      const { snapEnabled, gridSize } = get();
      const floor = getActiveFloor();
      const tableCount = floor.furniture.filter(f => f.shapeType !== 'DECOR').length;
      const x = snapEnabled ? snapToGrid(posX, gridSize) : posX;
      const y = snapEnabled ? snapToGrid(posY, gridSize) : posY;

      const newTable: TableShape = {
        id: generateId(),
        name: template.shapeType === 'DECOR' ? template.name : `T-${tableCount + 1}`,
        capacity: template.capacity,
        shapeType: template.shapeType,
        posX: x,
        posY: y,
        width: template.defaultWidth,
        height: template.defaultHeight,
        sectionId: null,
        status: 'AVAILABLE',
        nfcTagId: null,
        extraProps: {
          rotation: 0,
          colorOverride: null,
          notes: '',
          combinable: false,
          minBookingSize: 1,
          locked: false,
          visible: true,
        },
        icon: template.icon,
      };

      updateActiveFloor(f => ({ ...f, furniture: [...f.furniture, newTable] }));
      set({ selectedIds: [newTable.id] });
    },

    moveTable: (id, posX, posY) => {
      const { snapEnabled, gridSize } = get();
      const x = snapEnabled ? snapToGrid(posX, gridSize) : posX;
      const y = snapEnabled ? snapToGrid(posY, gridSize) : posY;
      updateActiveFloor(f => ({
        ...f,
        furniture: f.furniture.map(t => t.id === id ? { ...t, posX: x, posY: y } : t),
      }));
    },

    resizeTable: (id, width, height) => {
      updateActiveFloor(f => ({
        ...f,
        furniture: f.furniture.map(t => t.id === id ? { ...t, width: Math.max(20, width), height: Math.max(20, height) } : t),
      }));
    },

    updateTable: (id, updates) => {
      pushHistory();
      updateActiveFloor(f => ({
        ...f,
        furniture: f.furniture.map(t => t.id === id ? { ...t, ...updates } : t),
      }));
    },

    deleteSelected: () => {
      pushHistory();
      const { selectedIds } = get();
      updateActiveFloor(f => ({
        ...f,
        furniture: f.furniture.filter(t => !selectedIds.includes(t.id)),
      }));
      set({ selectedIds: [] });
    },

    duplicateSelected: () => {
      pushHistory();
      const { selectedIds } = get();
      const floor = getActiveFloor();
      const copies = floor.furniture
        .filter(t => selectedIds.includes(t.id))
        .map(t => ({ ...t, id: generateId(), name: `${t.name}-copy`, posX: t.posX + 20, posY: t.posY + 20 }));
      updateActiveFloor(f => ({ ...f, furniture: [...f.furniture, ...copies] }));
      set({ selectedIds: copies.map(c => c.id) });
    },

    addSection: (name, color, posX, posY, width, height) => {
      pushHistory();
      const section: Section = { id: generateId(), name, color, posX, posY, width, height };
      updateActiveFloor(f => ({ ...f, sections: [...f.sections, section] }));
    },

    updateSection: (id, updates) => {
      pushHistory();
      updateActiveFloor(f => ({
        ...f,
        sections: f.sections.map(s => s.id === id ? { ...s, ...updates } : s),
      }));
    },

    deleteSection: (id) => {
      pushHistory();
      updateActiveFloor(f => ({
        ...f,
        sections: f.sections.filter(s => s.id !== id),
      }));
    },

    setDraggingFromPanel: (dragging, template = null) => {
      set({ isDraggingFromPanel: dragging, draggingTemplate: template });
    },

    undo: () => {
      const { undoStack, floors } = get();
      if (undoStack.length === 0) return;
      const prev = undoStack[undoStack.length - 1];
      set(s => ({
        floors: prev.floors,
        undoStack: s.undoStack.slice(0, -1),
        redoStack: [...s.redoStack, { floors: JSON.parse(JSON.stringify(floors)) }],
      }));
    },

    redo: () => {
      const { redoStack, floors } = get();
      if (redoStack.length === 0) return;
      const next = redoStack[redoStack.length - 1];
      set(s => ({
        floors: next.floors,
        redoStack: s.redoStack.slice(0, -1),
        undoStack: [...s.undoStack, { floors: JSON.parse(JSON.stringify(floors)) }],
      }));
    },

    getActiveFloor: () => getActiveFloor(),
  };
});
