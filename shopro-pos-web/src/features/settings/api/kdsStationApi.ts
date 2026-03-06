import { apiClient } from '@/lib/api/client';

export type KDSStationType = 'PREP' | 'EXPO' | 'BEVERAGE';

export interface KDSStation {
    id: string;
    name: string;
    stationType: KDSStationType;
    online: boolean;
    createdAt?: string;
}

export interface CreateKDSStationRequest {
    name: string;
    stationType: KDSStationType;
}

export interface UpdateKDSStationRequest {
    name: string;
    stationType: KDSStationType;
}

export const kdsStationApi = {
    // Stations
    getAll: () => apiClient.get<KDSStation[]>('/kds/stations').then(res => res.data),
    create: (data: CreateKDSStationRequest) => apiClient.post<KDSStation>('/kds/stations', data).then(res => res.data),
    update: (id: string, data: UpdateKDSStationRequest) => apiClient.put<KDSStation>(`/kds/stations/${id}`, data).then(res => res.data),
    toggleStatus: (id: string) => apiClient.patch<KDSStation>(`/kds/stations/${id}/toggle-status`).then(res => res.data),
    delete: (id: string) => apiClient.delete<void>(`/kds/stations/${id}`).then(res => res.data),

    // Routing Rules
    getRoutingRules: () => apiClient.get<KDSRoutingRule[]>('/kds/routing-rules').then(res => res.data),
    createRoutingRule: (data: CreateKDSRoutingRuleRequest) => apiClient.post<KDSRoutingRule>('/kds/routing-rules', data).then(res => res.data),
    deleteRoutingRule: (id: string) => apiClient.delete<void>(`/kds/routing-rules/${id}`).then(res => res.data),
};

export type RoutingTargetType = 'CATEGORY' | 'ITEM';

export interface KDSRoutingRule {
    id: string;
    stationId: string;
    stationName: string;
    targetType: RoutingTargetType;
    targetId: string;
    targetName: string;
}

export interface CreateKDSRoutingRuleRequest {
    stationId: string;
    targetType: RoutingTargetType;
    targetId: string;
}
