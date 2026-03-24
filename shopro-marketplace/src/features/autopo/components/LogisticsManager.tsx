"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { logisticsZoneSchema, hubSchema } from "../lib/schemas";
import type { LogisticsZoneData, HubData } from "../lib/schemas";
import { autopoApi } from "../api";
import { MapPin, Truck, Plus, Trash2, Globe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export function LogisticsManager() {
  const { data: hubs = [], refetch: refetchHubs } = useQuery({
    queryKey: ["hubs"],
    queryFn: autopoApi.getHubs
  });

  const { data: zones = [], refetch: refetchZones } = useQuery({
    queryKey: ["zones"],
    queryFn: autopoApi.getZones
  });

  const { register: regHub, handleSubmit: handleHub, reset: resetHub } = useForm<HubData>({
    resolver: zodResolver(hubSchema)
  });

  const { register: regZone, handleSubmit: handleZone, reset: resetZone } = useForm<LogisticsZoneData>({
    resolver: zodResolver(logisticsZoneSchema)
  });

  const onAddHub = async (data: HubData) => {
    try {
      await autopoApi.createHub(data);
      refetchHubs();
      resetHub();
    } catch (e) {
      console.error(e);
    }
  };

  const onAddZone = async (data: LogisticsZoneData) => {
    try {
      // Pincodes should be passed as array, RHF might pass as string if not careful
      const pincodesArray = typeof data.pincodes === 'string' 
        ? (data.pincodes as string).split(',').map(p => p.trim())
        : data.pincodes;
      
      await autopoApi.createZone({ ...data, pincodes: pincodesArray });
      refetchZones();
      resetZone();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Left: Hub Registry */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Truck className="text-violet-600" size={20} />
            <h3 className="text-[16px] font-semibold text-(--sp-text-0)">Hub Registry</h3>
          </div>
          
          <form onSubmit={handleHub(onAddHub)} className="space-y-4 mb-8">
            <div className="space-y-1">
              <input 
                {...regHub("name")}
                placeholder="Central Hub Name"
                className="w-full h-9 px-3 bg-(--sp-bg-1) border border-(--sp-border) rounded-md text-[13px] outline-none focus:border-violet-500/50"
              />
            </div>
            <button className="w-full h-9 bg-(--sp-bg-1) border border-(--sp-border) text-(--sp-text-1) hover:bg-violet-600 hover:text-white rounded-md text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-2">
              <Plus size={14} /> Add Hub
            </button>
          </form>

          <div className="space-y-2">
            {hubs.map((hub: any) => (
              <div key={hub.id} className="p-3 bg-(--sp-bg-1)/50 border border-(--sp-border) rounded-md flex justify-between items-center group">
                <span className="text-[13px] font-medium text-(--sp-text-1)">{hub.name}</span>
                <span className="text-[10px] text-(--sp-text-3) uppercase font-bold tracking-widest">{hub.id.slice(0,8)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Zone Mapping */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="text-violet-600" size={20} />
            <h3 className="text-[16px] font-semibold text-(--sp-text-0)">Zone to Hub Mapping</h3>
          </div>

          <form onSubmit={handleZone(onAddZone)} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-(--sp-bg-1)/30 border border-dashed border-(--sp-border) rounded-md">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-(--sp-text-3)">Zone Name</label>
              <input {...regZone("name")} placeholder="North Delhi" className="w-full h-9 px-3 bg-(--sp-bg-1) border border-(--sp-border) rounded-md text-[13px]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-(--sp-text-3)">Assign to Hub</label>
              <select {...regZone("hubId")} className="w-full h-9 px-2 bg-(--sp-bg-1) border border-(--sp-border) rounded-md text-[13px]">
                <option value="">Select Hub...</option>
                {hubs.map((h: any) => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-(--sp-text-3)">Pincodes (Comma separated)</label>
              <input {...regZone("pincodes")} placeholder="110001, 110002" className="w-full h-9 px-3 bg-(--sp-bg-1) border border-(--sp-border) rounded-md text-[13px]" />
            </div>
            <div className="md:col-span-3">
              <button className="h-9 px-6 bg-violet-600 text-white rounded-md text-[11px] font-bold uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2">
                <Plus size={16} /> Forge Logistics Zone
              </button>
            </div>
          </form>

          <table className="w-full text-left">
            <thead>
              <tr className="text-(--sp-text-3) text-[11px] font-bold uppercase tracking-wider border-b border-(--sp-border)">
                <th className="py-3 px-2">Zone</th>
                <th className="py-3 px-2">Hub</th>
                <th className="py-3 px-2">Coverage</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--sp-border)">
              {zones.map((zone: any) => (
                <tr key={zone.id} className="group hover:bg-(--sp-bg-1)/30 transition-all">
                  <td className="py-4 px-2 text-[14px] font-medium text-(--sp-text-1)">{zone.name}</td>
                  <td className="py-4 px-2 font-mono text-[11px] text-(--sp-text-3)">{hubs.find((h: any) => h.id === zone.hubId)?.name || "---"}</td>
                  <td className="py-4 px-2">
                    <div className="flex flex-wrap gap-1">
                      {zone.pincodes.slice(0,3).map((p: string) => (
                        <span key={p} className="px-1.5 py-0.5 bg-(--sp-bg-1) border border-(--sp-border) rounded text-[10px] text-(--sp-text-3)">{p}</span>
                      ))}
                      {zone.pincodes.length > 3 && <span className="text-[10px] text-(--sp-text-3) pt-0.5">+{zone.pincodes.length - 3}</span>}
                    </div>
                  </td>
                  <td className="py-4 px-2 text-right">
                    <button className="text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 p-1.5 rounded">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
