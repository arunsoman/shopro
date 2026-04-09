import { useEffect, useState } from "react"
import { useExpoQueue, expoApi } from "./hooks/useKds"
import type { ExpoQueue } from "./types/kds"
import ExpoTablet from "./expo/ExpoTablet"
import ExpoFullscreen from "./expo/ExpoFullscreen"

type FormFactor = "tablet" | "fullscreen"

function detectFormFactor(): FormFactor {
  return window.innerWidth >= 1280 ? "fullscreen" : "tablet"
}

export default function ExpoKds({ outletId }: { outletId: number }) {
  const hook = useExpoQueue(outletId)
  const [formFactor, setFormFactor] = useState<FormFactor>(detectFormFactor())

  useEffect(() => {
    const h = () => setFormFactor(detectFormFactor())
    window.addEventListener("resize", h)
    return () => window.removeEventListener("resize", h)
  }, [])

  const actions = {
    rush: (ticketId: number) => expoApi.rush(outletId, ticketId),
    clearRush: (ticketId: number) => expoApi.clearRush(outletId, ticketId),
    voidTicket: (ticketId: number, reason: string) => expoApi.voidTicket(outletId, ticketId, reason),
    closeTicket: (ticketId: number) => expoApi.closeTicket(outletId, ticketId),
    recallTicket: (ticketId: number) => expoApi.recallTicket(outletId, ticketId),
    setNote: (ticketId: number, note: string) => expoApi.setNote(outletId, ticketId, note),
    fireCourse: (ticketId: number, courseNumber: number) => expoApi.fireCourse(outletId, ticketId, courseNumber),
    recallItem: (stationItemId: number) => expoApi.recallItem(outletId, stationItemId),
  }

  if (!hook.data) {
    return (
      <div className="w-full bg-slate-100/50 dark:bg-slate-950  flex items-center justify-center p-4">
        <div className="w-full max-w-md aspect-square flex flex-col items-center justify-center bg-white dark:bg-slate-900 border rounded-2xl shadow-2xl space-y-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              {hook.connected ? "Initializing Pass" : "Establishing Link"}
            </h2>
            <p className="text-sm text-muted-foreground font-medium px-8">
              {hook.connected
                ? "Synchronizing the latest ticket queue from your kitchen stations..."
                : "Connecting to the Shopro KDS network. Please ensure your device is registered."}
            </p>
          </div>
          <div className="pt-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full border border-border/40">
              <div className={`w-2 h-2 rounded-full ${hook.connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {hook.connected ? "Cloud Sync Active" : "Offline / Connecting"}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const props = { ...hook, data: hook.data as ExpoQueue, actions }
  if (formFactor === "tablet") return <ExpoTablet {...props} />
  return <ExpoFullscreen {...props} />
}
