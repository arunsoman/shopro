import { useState, useEffect, useCallback, useRef } from "react"
import type {
  StationQueuePage,
  ExpoQueue,
  CompletedTicket,
  StationDeviceStatus,
} from "../types/kds"

const BASE = "/api/kds"

async function apiFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

async function apiPost<T>(path: string, token: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  // 204 No Content
  if (res.status === 204) return undefined as unknown as T
  return res.json()
}

async function apiDelete(path: string, token: string): Promise<void> {
  const res = await fetch(`${BASE}${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
}

async function apiPatch<T>(path: string, token: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  if (res.status === 204) return undefined as unknown as T
  return res.json()
}

function getDeviceToken(): string {
  return localStorage.getItem("kds_device_token") ?? ""
}

function getUserToken(): string {
  return localStorage.getItem("auth_token") ?? ""
}

// ─────────────────────────────────────────────────────────────
// Station queue hook — device token auth, WebSocket + polling
// ─────────────────────────────────────────────────────────────

export function useStationQueue(stationId: number) {
  const [data, setData] = useState<StationQueuePage | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval>>()

  const loadQueue = useCallback(async () => {
    try {
      const q = await apiFetch<StationQueuePage>(
        `/stations/${stationId}/queue`,
        getDeviceToken()
      )
      setData(q)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed")
    }
  }, [stationId])

  useEffect(() => {
    loadQueue()

    const proto = location.protocol === "https:" ? "wss" : "ws"
    const ws = new WebSocket(
      `${proto}://${location.host}/ws/kds?token=${getDeviceToken()}`
    )
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      ws.send(
        JSON.stringify({
          type: "SUBSCRIBE",
          topic: `/topic/kds/station/${stationId}`,
        })
      )
    }

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      if (msg.type === "QUEUE_UPDATE") setData(msg.payload)
      if (msg.type === "SETTINGS_CHANGED")
        setData((prev) =>
          prev ? { ...prev, settings: msg.payload } : prev
        )
    }

    ws.onclose = () => {
      setConnected(false)
      // Fall back to polling every 10 s
      pollRef.current = setInterval(loadQueue, 10_000)
    }

    ws.onerror = () => setConnected(false)

    return () => {
      ws.close()
      clearInterval(pollRef.current)
    }
  }, [stationId, loadQueue])

  return { data, connected, error, refresh: loadQueue }
}

// ─────────────────────────────────────────────────────────────
// Station actions — device token auth
// ─────────────────────────────────────────────────────────────

export const stationApi = {
  bumpItem: (stationId: number, stationItemId: number) =>
    apiPost<import("./types/kds").BumpResult>(
      `/stations/${stationId}/items/${stationItemId}/bump`,
      getDeviceToken()
    ),

  bumpAll: (stationId: number, ticketId: number) =>
    apiPost<void>(
      `/stations/${stationId}/tickets/${ticketId}/bump-all`,
      getDeviceToken()
    ),

  startItem: (stationId: number, stationItemId: number) =>
    apiPost<void>(
      `/stations/${stationId}/items/${stationItemId}/start`,
      getDeviceToken()
    ),

  recallItem: (stationId: number, stationItemId: number) =>
    apiPost<void>(
      `/stations/${stationId}/items/${stationItemId}/recall`,
      getDeviceToken()
    ),

  recallAll: (stationId: number, ticketId: number) =>
    apiPost<void>(
      `/stations/${stationId}/tickets/${ticketId}/recall-all`,
      getDeviceToken()
    ),

  heartbeat: (stationId: number) =>
    apiPost<{ serverTimeMs: number; settingsVersion: number }>(
      `/stations/${stationId}/heartbeat`,
      getDeviceToken(),
      { clientTimeMs: Date.now() }
    ),
}

// ─────────────────────────────────────────────────────────────
// Expo queue hook — user JWT auth, WebSocket
// ─────────────────────────────────────────────────────────────

export function useExpoQueue(outletId: number) {
  const [data, setData] = useState<ExpoQueue | null>(null)
  const [completed, setCompleted] = useState<CompletedTicket[]>([])
  const [deviceStatus, setDeviceStatus] = useState<StationDeviceStatus[]>([])
  const [connected, setConnected] = useState(false)

  const loadAll = useCallback(async () => {
    const [q, c, d] = await Promise.all([
      apiFetch<ExpoQueue>(`/expo/${outletId}/queue`, getUserToken()),
      apiFetch<CompletedTicket[]>(
        `/expo/${outletId}/completed?limit=10`,
        getUserToken()
      ),
      apiFetch<StationDeviceStatus[]>(
        `/expo/${outletId}/device-status`,
        getUserToken()
      ),
    ])
    setData(q)
    setCompleted(c)
    setDeviceStatus(d)
  }, [outletId])

  useEffect(() => {
    loadAll()

    const proto = location.protocol === "https:" ? "wss" : "ws"
    const ws = new WebSocket(
      `${proto}://${location.host}/ws/kds?token=${getUserToken()}`
    )

    ws.onopen = () => {
      setConnected(true)
      ws.send(
        JSON.stringify({
          type: "SUBSCRIBE",
          topic: `/topic/kds/expo/${outletId}`,
        })
      )
    }

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      if (msg.type === "QUEUE_UPDATE") setData(msg.payload)
      if (msg.type === "TICKET_COMPLETE") {
        setData((prev) =>
          prev
            ? {
                ...prev,
                tickets: prev.tickets.filter(
                  (t) => t.ticketId !== msg.ticketId
                ),
                activeCount: prev.activeCount - 1,
              }
            : prev
        )
        setCompleted((prev) =>
          [msg.completedTicket, ...prev].slice(0, 10)
        )
      }
      if (msg.type === "DEVICE_STATUS") {
        setDeviceStatus((prev) =>
          prev.map((s) =>
            s.stationId === msg.stationId
              ? {
                  ...s,
                  devices: s.devices.map((d) =>
                    d.deviceId === msg.deviceId
                      ? { ...d, status: msg.online ? "ONLINE" : "OFFLINE" }
                      : d
                  ),
                }
              : s
          )
        )
      }
    }

    ws.onclose = () => setConnected(false)

    return () => ws.close()
  }, [outletId, loadAll])

  return {
    data,
    completed,
    deviceStatus,
    connected,
    refresh: loadAll,
    setData,
    setCompleted,
  }
}

// ─────────────────────────────────────────────────────────────
// Expo actions — user JWT auth
// ─────────────────────────────────────────────────────────────

export const expoApi = {
  rush: (outletId: number, ticketId: number) =>
    apiPost<void>(
      `/expo/${outletId}/tickets/${ticketId}/rush`,
      getUserToken()
    ),

  clearRush: (outletId: number, ticketId: number) =>
    apiDelete(`/expo/${outletId}/tickets/${ticketId}/rush`, getUserToken()),

  voidTicket: (outletId: number, ticketId: number, reason: string) =>
    apiPost<void>(
      `/expo/${outletId}/tickets/${ticketId}/void`,
      getUserToken(),
      { reason }
    ),

  closeTicket: (outletId: number, ticketId: number) =>
    apiPost<void>(
      `/expo/${outletId}/tickets/${ticketId}/close`,
      getUserToken()
    ),

  recallTicket: (outletId: number, ticketId: number) =>
    apiPost<void>(
      `/expo/${outletId}/tickets/${ticketId}/recall`,
      getUserToken()
    ),

  setNote: (outletId: number, ticketId: number, note: string) =>
    apiPatch<void>(
      `/expo/${outletId}/tickets/${ticketId}/note`,
      getUserToken(),
      { note }
    ),

  fireCourse: (outletId: number, ticketId: number, courseNumber: number) =>
    apiPost<void>(
      `/expo/${outletId}/tickets/${ticketId}/fire-course`,
      getUserToken(),
      { courseNumber }
    ),

  recallItem: (outletId: number, stationItemId: number) =>
    apiPost<void>(
      `/expo/${outletId}/station-items/${stationItemId}/recall`,
      getUserToken()
    ),
}
