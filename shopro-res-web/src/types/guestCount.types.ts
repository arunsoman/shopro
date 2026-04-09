// ─────────────────────────────────────────────────────────────
// guestCount.types.ts
// Sourced from: GuestCountEntry JPA entity + GuestCountService
// Manual entry fallback for non-POS restaurants
// ─────────────────────────────────────────────────────────────

// ── Core entity ───────────────────────────────────────────────

export interface GuestCountEntry {
  id: number;
  restaurantId: number;
  weekStartDate: string;          // yyyy-MM-dd (Monday)
  timeSlot: string;               // HH:mm
  slotLabel: string | null;       // e.g. "Lunch", "Frokost"
  countMon: number | null;
  countTue: number | null;
  countWed: number | null;
  countThu: number | null;
  countFri: number | null;
  countSat: number | null;
  countSun: number | null;
  // DERIVED:
  weeklyTotal: number;
  weeklyAverage: number;
}

// ── Weekly grid (full week for entry screen) ──────────────────

export interface WeeklyGridDto {
  restaurantId: number;
  weekStart: string;
  entries: GuestCountEntry[];
  // Column totals
  totalMon: number;
  totalTue: number;
  totalWed: number;
  totalThu: number;
  totalFri: number;
  totalSat: number;
  totalSun: number;
  weekGrandTotal: number;
  weekAverage: number;
}

// ── 3-week rolling average ────────────────────────────────────

export interface RollingAverageRow {
  timeSlot: string;
  slotLabel: string | null;
  avgMon: number | null;
  avgTue: number | null;
  avgWed: number | null;
  avgThu: number | null;
  avgFri: number | null;
  avgSat: number | null;
  avgSun: number | null;
  avgTotal: number;
  avgAverage: number;
}

export interface RollingAverageDto {
  restaurantId: number;
  weekStart: string;
  weeksBack: number;
  rows: RollingAverageRow[];
}

// ── Request shapes ────────────────────────────────────────────

export interface UpsertSlotRequest {
  weekStartDate: string;
  timeSlot: string;
  slotLabel?: string;
  countMon?: number;
  countTue?: number;
  countWed?: number;
  countThu?: number;
  countFri?: number;
  countSat?: number;
  countSun?: number;
}

export interface BatchUpsertRequest {
  slots: UpsertSlotRequest[];
}
