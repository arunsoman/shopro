import { useEffect, useState } from "react"
import { useStationQueue, stationApi } from "./hooks/useKds"
import type { BumpResult } from "./types/kds"
import { Button } from "@/components/ui/Button"
import StationPhone from "./station/StationPhone"
import StationTablet from "./station/StationTablet"
import StationFullscreen from "./station/StationFullscreen"

type FormFactor = "phone" | "tablet" | "fullscreen"

function detectFormFactor(): FormFactor {
  const w = window.innerWidth
  if (w < 600) return "phone"
  if (w < 1100) return "tablet"
  return "fullscreen"
}

interface Props {
  stationId: number
}

export default function StationKds({ stationId }: Props) {
  const { data, connected, error, refresh } = useStationQueue(stationId)
  const [formFactor, setFormFactor] = useState<FormFactor>(detectFormFactor())
  const [bumpFlash, setBumpFlash] = useState<number | null>(null)

  useEffect(() => {
    const handler = () => setFormFactor(detectFormFactor())
    window.addEventListener("resize", handler)
    return () => window.removeEventListener("resize", handler)
  }, [])

  // Heartbeat every 30 s
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        await stationApi.heartbeat(stationId)
      } catch (_) { }
    }, 30_000)
    return () => clearInterval(id)
  }, [stationId])

  async function bumpItem(stationItemId: number): Promise<BumpResult> {
    const result = await stationApi.bumpItem(stationId, stationItemId)
    if (result.ticketComplete) {
      setBumpFlash(stationItemId)
      setTimeout(() => setBumpFlash(null), 800)
    }
    return result
  }

  async function bumpAll(ticketId: number): Promise<void> {
    await stationApi.bumpAll(stationId, ticketId)
  }

  async function startItem(stationItemId: number): Promise<void> {
    await stationApi.startItem(stationId, stationItemId)
  }

  async function recallItem(stationItemId: number): Promise<void> {
    await stationApi.recallItem(stationId, stationItemId)
  }

  // ── Loading / error state ────────────────────────────────────
  if (!data) {
    return (
      <div className="w-full bg-slate-100/50 dark:bg-slate-950  flex items-center justify-center p-4">
        <div className="w-full max-w-md aspect-square flex flex-col items-center justify-center bg-white dark:bg-slate-900 border rounded-2xl shadow-2xl space-y-6">
          {error ? (
            <>
              <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                <span className="text-3xl">⚠</span>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-foreground tracking-tight">Signal Interrupted</h2>
                <p className="text-sm text-muted-foreground font-medium px-8">{error}</p>
              </div>
              <Button
                onClick={refresh}
                className="rounded-xl px-8 font-bold shadow-lg shadow-primary/10 active:scale-95 transition-all"
              >
                Attempt Reconnect
              </Button>
            </>
          ) : (
            <>
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-foreground tracking-tight">Station Initializing</h2>
                <p className="text-sm text-muted-foreground font-medium px-8">Syncing station inventory and live ticket stream...</p>
              </div>
              <div className="pt-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full border border-border/40">
                  <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {connected ? "KDS Network Active" : "Disconnected"}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  const sharedProps = {
    queue: data,
    connected,
    bumpFlash,
    onBumpItem: bumpItem,
    onBumpAll: bumpAll,
    onStartItem: startItem,
    onRecallItem: recallItem,
  }

  if (formFactor === "phone") return <StationPhone {...sharedProps} />
  if (formFactor === "tablet") return <StationTablet {...sharedProps} />
  return <StationFullscreen {...sharedProps} />
}
