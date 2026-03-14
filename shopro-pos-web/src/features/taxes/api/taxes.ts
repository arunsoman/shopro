import { apiClient } from "@/lib/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { 
  Country, 
  TaxRule, 
  VenueCountryAssignment, 
  TaxCalculationRequest, 
  TaxCalculationResponse 
} from "../types";

export const taxesApi = {
  getCountries: async () => {
    const { data } = await apiClient.get<Country[]>("/taxes/countries");
    return data;
  },
  
  getRules: async (isoCode: string) => {
    const { data } = await apiClient.get<TaxRule[]>(`/taxes/rules/${isoCode}`);
    return data;
  },
  
  getVenueAssignment: async (venueId: string) => {
    const { data } = await apiClient.get<VenueCountryAssignment>(`/taxes/venue/${venueId}`);
    return data;
  },
  
  assignCountry: async ({ venueId, isoCode }: { venueId: string; isoCode: string }) => {
    await apiClient.post("/taxes/assign", null, { params: { venueId, isoCode } });
  },
  
  setOverride: async ({ 
    venueId, 
    ruleId, 
    rate, 
    reason 
  }: { 
    venueId: string; 
    ruleId: string; 
    rate: number; 
    reason: string 
  }) => {
    await apiClient.post("/taxes/override", null, { params: { venueId, ruleId, rate, reason } });
  },
  
  calculatePreview: async (request: TaxCalculationRequest, venueId: string) => {
    const { data } = await apiClient.post<TaxCalculationResponse>("/taxes/calculate", request, { params: { venueId } });
    return data;
  }
};

export const useCountries = () => useQuery({
  queryKey: ["taxes", "countries"],
  queryFn: async () => {
    const data = await taxesApi.getCountries();
    return Array.isArray(data) ? data : [];
  }
});

export const useTaxRules = (isoCode?: string) => useQuery({
  queryKey: ["taxes", "rules", isoCode],
  queryFn: () => taxesApi.getRules(isoCode!),
  enabled: !!isoCode
});

export const useVenueTaxAssignment = (venueId?: string) => useQuery({
  queryKey: ["taxes", "venue", venueId],
  queryFn: () => taxesApi.getVenueAssignment(venueId!),
  enabled: !!venueId
});

export const useAssignCountry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taxesApi.assignCountry,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["taxes", "venue"] })
  });
};

export const useSetTaxOverride = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taxesApi.setOverride,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taxes", "rules"] });
      queryClient.invalidateQueries({ queryKey: ["taxes", "venue"] });
    }
  });
};

export const useTaxCalculationPreview = (venueId?: string) => {
  return useMutation({
    mutationFn: (request: TaxCalculationRequest) => taxesApi.calculatePreview(request, venueId!)
  });
};
