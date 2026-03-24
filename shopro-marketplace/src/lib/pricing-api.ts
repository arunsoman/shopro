import api from '@/api';
import type { MarkupRuleFormData } from './pricing-schemas';

export interface MarkupRule extends MarkupRuleFormData {
  id: string;
  priority?: number;
}

export const pricingApi = {
  getRules: async () => {
    const resp = await api.get<MarkupRule[]>('/operator/catalog/pricing-rules');
    return resp.data;
  },

  createRule: async (data: MarkupRuleFormData) => {
    const resp = await api.post<MarkupRule>('/operator/catalog/pricing-rules', data);
    return resp.data;
  },

  deleteRule: async (id: string) => {
    await api.delete(`/operator/catalog/pricing-rules/${id}`);
  },

  toggleRule: async (id: string, active: boolean) => {
    await api.patch(`/operator/catalog/pricing-rules/${id}/status`, { active });
  },

  updateRule: async (id: string, data: Partial<MarkupRuleFormData>) => {
    const resp = await api.put<MarkupRule>(`/operator/catalog/pricing-rules/${id}`, data);
    return resp.data;
  },

  getGroups: async () => {
    const resp = await api.get<string[]>('/operator/catalog/groups');
    return resp.data;
  },

  getSubgroups: async (group: string) => {
    const resp = await api.get<string[]>(`/operator/catalog/subgroups?group=${encodeURIComponent(group)}`);
    return resp.data;
  },

  getFoodBriefs: async () => {
    const resp = await api.get<{ id: string; name: string }[]>('/operator/catalog/foods/brief');
    return resp.data;
  }
};
