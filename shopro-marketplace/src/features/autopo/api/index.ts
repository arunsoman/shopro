import api from "@/api";
import type { ConsolidationData, SubstitutionData, LogisticsZoneData, HubData } from "../lib/schemas";

export const autopoApi = {
  // Engine Control
  getEngineStatus: async () => {
    const resp = await api.get("/operator/automation/autopo/status");
    return resp.data;
  },

  startEngine: async () => {
    const resp = await api.post("/operator/automation/autopo/start");
    return resp.data;
  },

  stopEngine: async () => {
    const resp = await api.post("/operator/automation/autopo/stop");
    return resp.data;
  },

  runBatch: async () => {
    const resp = await api.post("/operator/automation/autopo/run-batch");
    return resp.data;
  },

  updateSetting: async (key: string, value: string) => {
    const resp = await api.post("/operator/automation/settings", { key, value });
    return resp.data;
  },

  getSetting: async (key: string) => {
    const resp = await api.get(`/operator/automation/settings/${key}`);
    return resp.data;
  },

  // Policies
  getPolicies: async () => {
    const resp = await api.get("/operator/automation/config");
    return resp.data;
  },
  
  updatePolicy: async (type: string, config: ConsolidationData | SubstitutionData) => {
    const resp = await api.patch("/operator/automation/config", { type, config });
    return resp.data;
  },

  // Logistics
  getHubs: async () => {
    const resp = await api.get("/operator/logistics/hubs");
    return resp.data;
  },

  createHub: async (data: HubData) => {
    const resp = await api.post("/operator/logistics/hubs", data);
    return resp.data;
  },

  getZones: async () => {
    const resp = await api.get("/operator/logistics/zones");
    return resp.data;
  },

  createZone: async (data: LogisticsZoneData) => {
    const resp = await api.post("/operator/logistics/zones", data);
    return resp.data;
  }
};
