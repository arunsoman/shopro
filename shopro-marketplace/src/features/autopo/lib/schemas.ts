import { z } from "zod";

export const consolidationSchema = z.object({
  windowType: z.enum(["DAILY_CUTOFF", "INTERVAL", "REAL_TIME"]),
  windowValue: z.string().min(1, "Window value is required"),
  minThreshold: z.number().min(0, "Threshold must be non-negative"),
});

export const substitutionSchema = z.object({
  autoSwap: z.boolean(),
  maxPriceVariance: z.number().min(0).max(100),
  approvalEscalation: z.boolean(),
});

export const logisticsZoneSchema = z.object({
  name: z.string().min(2, "Zone name must be at least 2 characters"),
  hubId: z.string().uuid("Invalid Hub ID"),
  pincodes: z.array(z.string().regex(/^\d{6}$/, "Invalid pincode format")).min(1, "At least one pincode required"),
});

export const hubSchema = z.object({
  name: z.string().min(2, "Hub name must be at least 2 characters"),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
});

export type ConsolidationData = z.infer<typeof consolidationSchema>;
export type SubstitutionData = z.infer<typeof substitutionSchema>;
export type LogisticsZoneData = z.infer<typeof logisticsZoneSchema>;
export type HubData = z.infer<typeof hubSchema>;
