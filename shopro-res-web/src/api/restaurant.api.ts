import type { Restaurant } from "@/types";

/**
 * Fetches restaurant details by ID.
 * Currently returns mock data to satisfy requirements.
 */
export async function getRestaurantById(id: number): Promise<Restaurant> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    id,
    name: "Bistro Verde",
    timezone: "UTC",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function updateRestaurant(id: number, data: Partial<Restaurant>): Promise<Restaurant> {
  return {
      id,
      name: data.name || "Bistro Verde",
      timezone: data.timezone || "UTC",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
  }
}
