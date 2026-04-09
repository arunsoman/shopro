// ─────────────────────────────────────────────────────────────
// store/pos.store.ts
// Live POS floor state — Zustand (NOT persisted)
// Fed by WebSocket from lib/websocket.ts
// Redis key: restaurant:{id}:sessions:live  (event-driven, no TTL)
// ─────────────────────────────────────────────────────────────

import { create } from "zustand";
import type { TableFloorStatus, Order } from "@/types";

interface PosState {
  // ── Floor status ────────────────────────────────────────────
  // Keyed by tableId for O(1) lookup
  floorStatus: Record<number, TableFloorStatus>;
  wsConnected: boolean;
  lastUpdated: string | null;

  // ── Live orders ─────────────────────────────────────────────
  // Keyed by sessionId
  liveOrders: Record<number, Order[]>;

  // ── Actions ────────────────────────────────────────────────
  setFloorStatus: (tables: TableFloorStatus[]) => void;
  updateTableStatus: (table: TableFloorStatus) => void;
  removeTable: (tableId: number) => void;
  setWsConnected: (connected: boolean) => void;
  setLiveOrders: (sessionId: number, orders: Order[]) => void;
  addLiveOrder: (sessionId: number, order: Order) => void;
  clearFloor: () => void;
}

export const usePosStore = create<PosState>()((set) => ({
  // ── Initial state ────────────────────────────────────────────
  floorStatus:  {},
  wsConnected:  false,
  lastUpdated:  null,
  liveOrders:   {},

  // ── Floor actions ─────────────────────────────────────────────
  setFloorStatus: (tables) =>
    set({
      floorStatus: Object.fromEntries(tables.map((t) => [t.tableId, t])),
      lastUpdated: new Date().toISOString(),
    }),

  updateTableStatus: (table) =>
    set((state) => ({
      floorStatus: { ...state.floorStatus, [table.tableId]: table },
      lastUpdated: new Date().toISOString(),
    })),

  removeTable: (tableId) =>
    set((state) => {
      const next = { ...state.floorStatus };
      delete next[tableId];
      return { floorStatus: next };
    }),

  setWsConnected: (connected) => set({ wsConnected: connected }),

  // ── Order actions ──────────────────────────────────────────────
  setLiveOrders: (sessionId, orders) =>
    set((state) => ({
      liveOrders: { ...state.liveOrders, [sessionId]: orders },
    })),

  addLiveOrder: (sessionId, order) =>
    set((state) => ({
      liveOrders: {
        ...state.liveOrders,
        [sessionId]: [...(state.liveOrders[sessionId] ?? []), order],
      },
    })),

  clearFloor: () =>
    set({ floorStatus: {}, liveOrders: {}, wsConnected: false }),
}));

// ── Selectors ──────────────────────────────────────────────────
export const selectAllTables      = (s: PosState) => Object.values(s.floorStatus);
export const selectTable          = (id: number) => (s: PosState) => s.floorStatus[id];
export const selectWsConnected    = (s: PosState) => s.wsConnected;
export const selectOpenTableCount = (s: PosState) =>
  Object.values(s.floorStatus).filter(
    (t) => t.status === "OPEN" || t.status === "LONG_OPEN",
  ).length;
export const selectLiveOrders     = (sessionId: number) => (s: PosState) =>
  s.liveOrders[sessionId] ?? [];