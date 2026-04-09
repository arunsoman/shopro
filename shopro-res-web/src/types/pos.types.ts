// ─────────────────────────────────────────────────────────────
// pos.types.ts
// Sourced from: DiningTable, TableSession, Order, OrderLine
//               JPA entities + TableSessionService, OrderService
// ─────────────────────────────────────────────────────────────

import type {
  TableSection,
  TableStatus,
  SessionStatus,
  OrderStatus,
  OrderLineStatus,
} from "./enums.types";

// ── Dining Table ──────────────────────────────────────────────

export interface DiningTable {
  id: number;
  restaurantId: number;
  tableNumber: string;
  seatCapacity: number | null;
  section: TableSection;
  active: boolean;
}

export interface CreateDiningTableRequest {
  tableNumber: string;
  seatCapacity?: number;
  section: TableSection;
}

export interface UpdateDiningTableRequest extends Partial<CreateDiningTableRequest> {}

// ── Floor Status (Redis event-driven) ────────────────────────
// GET /api/v1/dining-tables/{restaurantId}/floor-status

export interface TableFloorStatus {
  tableId: number;
  tableNumber: string;
  section: TableSection;
  seatCapacity: number | null;
  status: TableStatus;
  // Set when status is OPEN or LONG_OPEN:
  sessionId: number | null;
  guestCount: number | null;
  openedAt: string | null;
  durationMinutes: number | null;
  orderCount: number | null;
  sessionTotal: number | null;
}

export interface FloorStatusDto {
  restaurantId: number;
  tables: TableFloorStatus[];
  openSessionCount: number;
  totalCoversLive: number;
  computedAt: string;
}

// ── Table Session ─────────────────────────────────────────────

export interface TableSession {
  id: number;
  diningTableId: number;
  tableNumber: string;
  openedAt: string;
  closedAt: string | null;
  guestCount: number;
  status: SessionStatus;
  closedByUserId: number | null;
  // DERIVED:
  durationMinutes: number | null;
  sessionTotal: number;
}

export interface OpenSessionRequest {
  diningTableId: number;
  guestCount: number;
}

export interface UpdateGuestCountRequest {
  guestCount: number;
}

// ── Order ──────────────────────────────────────────────────────

export interface OrderLine {
  id: number;
  orderId: number;
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  priceAtOrder: number;
  status: OrderLineStatus;
  lineTotal: number;              // priceAtOrder × quantity — DERIVED
  theoreticalCost: number;        // menuItem.totalCost × quantity — DERIVED
  createdAt: string;
}

export interface Order {
  id: number;
  tableSessionId: number;
  orderedAt: string;
  closedAt: string | null;
  status: OrderStatus;
  createdByUserId: number | null;
  lines: OrderLine[];
  orderTotal: number;             // SUM(lineTotal where status = ORDERED) — DERIVED
}

export interface AddLineRequest {
  menuItemId: number;
  quantity: number;
}

export interface UpdateLineQuantityRequest {
  quantity: number;
}

export interface VoidLineRequest {
  reason?: string;
}

export interface CompLineRequest {
  reason?: string;
}

// ── Session Detail ────────────────────────────────────────────

export interface SessionDetailDto {
  session: TableSession;
  orders: Order[];
  sessionTotal: number;
  activeOrderId: number | null;   // the current OPEN order
}

// ── Session History ───────────────────────────────────────────

export interface SessionSummaryRow {
  id: number;
  tableNumber: string;
  section: TableSection;
  openedAt: string;
  closedAt: string | null;
  durationMinutes: number | null;
  guestCount: number;
  sessionTotal: number;
  checkAverage: number;
  orderCount: number;
  status: SessionStatus;
}

export interface SessionHistoryParams {
  restaurantId: number;
  from: string;
  to: string;
  tableId?: number;
}

// ── Guest Count Heatmap ───────────────────────────────────────

export interface HeatmapCell {
  timeSlot: string;               // HH:mm
  dayOfWeek: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
  count: number;
}

export interface GuestHeatmapDto {
  restaurantId: number;
  weekStart: string;
  source: "POS" | "MANUAL";
  cells: HeatmapCell[];
  maxCount: number;               // for colour scale
  weeklyTotal: number;
}

export interface RollingAverageHeatmapDto {
  restaurantId: number;
  weekStart: string;
  weeksBack: number;
  cells: HeatmapCell[];
  maxCount: number;
}
