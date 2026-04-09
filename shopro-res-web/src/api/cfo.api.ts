import { apiGet } from "./client";
import { useQuery } from "@tanstack/react-query";

export interface CfoDashboardSnapshot {
  pulse: {
    primeCostPctActual: number;
    primeCostPctTarget: number;
    cashPosition: number;
    breakEvenCoversNeeded: number;
    netProfitYesterday: number;
    netProfitSameDayLastWeek: number;
    primeCostTrend: number[];
    cashFlowTrend: number[];
  };
  varianceByStation: Array<{
    stationName: string;
    theoreticalCost: number;
    actualCost: number;
    variancePct: number;
  }>;
  menuMatrix: Array<{
    itemName: string;
    category: "STAR" | "PLOWHORSE" | "PUZZLE" | "DOG";
    popularity: number;
    margin: number;
    salesCount: number;
  }>;
  labor: {
    laborCostPct: number;
    salesPerLaborHour: number;
    overtimeRiskCount: number;
    scheduleAdherencePct: number;
  };
  inventory: {
    turnoverDays: number;
    deadStockValue: number;
    openPoCommitments: number;
    priceShockCount: number;
  };
  anomalies: Array<{
    type: string;
    description: string;
    amount: number;
    employeeName: string;
  }>;
  strategic: {
    capexPipeline: Array<{
      item: string;
      cost: number;
      roi: string;
      status: string;
    }>;
    scenarioModeling: Array<{
      scenario: string;
      impactLabel: string;
      impactValue: number;
    }>;
    yieldIntelligence: Array<{
      itemName: string;
      status: string;
      detail: string;
      costImpact: number;
    }>;
  };
}

export const cfoApi = {
  getSnapshot: async (restaurantId: number): Promise<CfoDashboardSnapshot> => {
    return apiGet<CfoDashboardSnapshot>(`/restaurants/${restaurantId}/analytics/cfo/snapshot`);
  },
};

export const useCfoSnapshot = (restaurantId: number) => {
  return useQuery({
    queryKey: ["cfo-snapshot", restaurantId],
    queryFn: () => cfoApi.getSnapshot(restaurantId),
  });
};
