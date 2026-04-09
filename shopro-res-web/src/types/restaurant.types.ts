// ─────────────────────────────────────────────────────────────
// restaurant.types.ts
// ─────────────────────────────────────────────────────────────

export interface Restaurant {
  id: number;
  name: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRestaurantRequest {
  name: string;
  timezone: string;
}

export interface UpdateRestaurantRequest {
  name?: string;
  timezone?: string;
}
