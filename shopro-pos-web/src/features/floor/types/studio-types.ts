export type ShapeType = 'CIRCLE' | 'RECTANGLE' | 'DECOR';

export type TableStatus = 'AVAILABLE' | 'HELD' | 'OCCUPIED' | 'ORDER_PLACED' | 'PAYING' | 'DIRTY';

export interface TableExtraProps {
  rotation: number;
  colorOverride: string | null;
  notes: string;
  combinable: boolean;
  minBookingSize: number;
  locked: boolean;
  visible: boolean;
}

export interface TableShape {
  id: string;
  name: string;
  capacity: number;
  shapeType: ShapeType;
  posX: number;
  posY: number;
  width: number;
  height: number;
  sectionId: string | null;
  status: TableStatus;
  nfcTagId: string | null;
  extraProps: TableExtraProps;
  icon?: string;
}

export interface Section {
  id: string;
  name: string;
  color: string;
  posX: number;
  posY: number;
  width: number;
  height: number;
}

export interface Floor {
  id: string;
  name: string;
  order: number;
  canvasWidth: number;
  canvasHeight: number;
  sections: Section[];
  furniture: TableShape[];
}

export type EditorTool = 'select' | 'pan' | 'section';

export interface FurnitureTemplate {
  id: string;
  name: string;
  category: 'tables' | 'rooms' | 'structural' | 'decor';
  shapeType: ShapeType;
  capacity: number;
  defaultWidth: number;
  defaultHeight: number;
  icon: string;
}

export const FURNITURE_TEMPLATES: FurnitureTemplate[] = [
  // Tables
  { id: 'circle-2', name: 'Circle Table — 2 seat', category: 'tables', shapeType: 'CIRCLE', capacity: 2, defaultWidth: 60, defaultHeight: 60, icon: '⬤' },
  { id: 'circle-4', name: 'Circle Table — 4 seat', category: 'tables', shapeType: 'CIRCLE', capacity: 4, defaultWidth: 80, defaultHeight: 80, icon: '⬤' },
  { id: 'circle-6', name: 'Circle Table — 6 seat', category: 'tables', shapeType: 'CIRCLE', capacity: 6, defaultWidth: 100, defaultHeight: 100, icon: '⬤' },
  { id: 'rect-2', name: 'Rect Table — 2 seat', category: 'tables', shapeType: 'RECTANGLE', capacity: 2, defaultWidth: 60, defaultHeight: 40, icon: '▬' },
  { id: 'rect-4', name: 'Rect Table — 4 seat', category: 'tables', shapeType: 'RECTANGLE', capacity: 4, defaultWidth: 90, defaultHeight: 60, icon: '▬' },
  { id: 'rect-6', name: 'Rect Table — 6 seat', category: 'tables', shapeType: 'RECTANGLE', capacity: 6, defaultWidth: 120, defaultHeight: 60, icon: '▬' },
  { id: 'rect-8', name: 'Rect Table — 8 seat', category: 'tables', shapeType: 'RECTANGLE', capacity: 8, defaultWidth: 150, defaultHeight: 70, icon: '▬' },
  // Decor / Rooms
  // Rooms & Zones
  { id: 'pdr', name: 'Private Dining Room', category: 'rooms', shapeType: 'DECOR', capacity: 0, defaultWidth: 160, defaultHeight: 120, icon: '💎' },
  { id: 'bar-lounge', name: 'Bar / Lounge', category: 'rooms', shapeType: 'DECOR', capacity: 0, defaultWidth: 150, defaultHeight: 100, icon: '🍸' },
  { id: 'patio', name: 'Outdoor Patio', category: 'rooms', shapeType: 'DECOR', capacity: 0, defaultWidth: 180, defaultHeight: 140, icon: '☀️' },
  { id: 'chef-table', name: 'Chef\'s Table Area', category: 'rooms', shapeType: 'DECOR', capacity: 0, defaultWidth: 100, defaultHeight: 80, icon: '👨‍🍳' },
  { id: 'kitchen', name: 'Kitchen Area', category: 'rooms', shapeType: 'DECOR', capacity: 0, defaultWidth: 150, defaultHeight: 120, icon: '🍳' },
  { id: 'buffet', name: 'Buffet Station', category: 'rooms', shapeType: 'DECOR', capacity: 0, defaultWidth: 140, defaultHeight: 50, icon: '🍱' },
  { id: 'coffee-bar', name: 'Coffee / Dessert Bar', category: 'rooms', shapeType: 'DECOR', capacity: 0, defaultWidth: 100, defaultHeight: 60, icon: '☕' },
  { id: 'wash-area', name: 'Wash Area', category: 'rooms', shapeType: 'DECOR', capacity: 0, defaultWidth: 80, defaultHeight: 60, icon: '🚰' },
  { id: 'restroom-m', name: 'Men\'s Room', category: 'rooms', shapeType: 'DECOR', capacity: 0, defaultWidth: 60, defaultHeight: 60, icon: '🚹' },
  { id: 'restroom-w', name: 'Women\'s Room', category: 'rooms', shapeType: 'DECOR', capacity: 0, defaultWidth: 60, defaultHeight: 60, icon: '🚺' },
  { id: 'waiting-area', name: 'Waiting / Lobby', category: 'rooms', shapeType: 'DECOR', capacity: 0, defaultWidth: 120, defaultHeight: 80, icon: '🛋️' },
  { id: 'wine-cellar', name: 'Wine Cellar / Display', category: 'rooms', shapeType: 'DECOR', capacity: 0, defaultWidth: 100, defaultHeight: 80, icon: '🍷' },
  { id: 'stage', name: 'Live Music / Stage', category: 'rooms', shapeType: 'DECOR', capacity: 0, defaultWidth: 120, defaultHeight: 80, icon: '🎸' },
  
  // Operational & Structural
  { id: 'pos-station', name: 'POS Station', category: 'structural', shapeType: 'DECOR', capacity: 0, defaultWidth: 40, defaultHeight: 40, icon: '🖥️' },
  { id: 'dish-wash', name: 'Dishwashing Area', category: 'structural', shapeType: 'DECOR', capacity: 0, defaultWidth: 100, defaultHeight: 60, icon: '🧼' },
  { id: 'storage', name: 'Storage / Pantry', category: 'structural', shapeType: 'DECOR', capacity: 0, defaultWidth: 100, defaultHeight: 100, icon: '📦' },
  { id: 'office', name: 'Manager Office', category: 'structural', shapeType: 'DECOR', capacity: 0, defaultWidth: 80, defaultHeight: 80, icon: '💼' },
  { id: 'entrance', name: 'Main Entrance', category: 'structural', shapeType: 'DECOR', capacity: 0, defaultWidth: 80, defaultHeight: 15, icon: '🚪' },
  { id: 'exit-emergency', name: 'Emergency Exit', category: 'structural', shapeType: 'DECOR', capacity: 0, defaultWidth: 60, defaultHeight: 10, icon: '🏃' },
  { id: 'wall', name: 'Wall Segment', category: 'structural', shapeType: 'DECOR', capacity: 0, defaultWidth: 200, defaultHeight: 10, icon: '▬' },
  { id: 'pillar', name: 'Pillar', category: 'structural', shapeType: 'DECOR', capacity: 0, defaultWidth: 20, defaultHeight: 20, icon: '■' },
  { id: 'divider', name: 'Divider', category: 'structural', shapeType: 'DECOR', capacity: 0, defaultWidth: 120, defaultHeight: 8, icon: '┃' },
  { id: 'stairs', name: 'Stairs', category: 'structural', shapeType: 'DECOR', capacity: 0, defaultWidth: 80, defaultHeight: 80, icon: '🪜' },
  
  // Decor & Fixtures
  { id: 'bar-counter', name: 'Bar Counter', category: 'decor', shapeType: 'DECOR', capacity: 0, defaultWidth: 200, defaultHeight: 40, icon: '▭' },
  { id: 'host-stand', name: 'Host Stand', category: 'decor', shapeType: 'DECOR', capacity: 0, defaultWidth: 40, defaultHeight: 40, icon: '◫' },
  { id: 'plant', name: 'Plant / Decor', category: 'decor', shapeType: 'DECOR', capacity: 0, defaultWidth: 30, defaultHeight: 30, icon: '🌿' },
  { id: 'coat-check', name: 'Coat Check', category: 'decor', shapeType: 'DECOR', capacity: 0, defaultWidth: 60, defaultHeight: 40, icon: '🧥' },
];
