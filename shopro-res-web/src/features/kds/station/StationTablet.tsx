import { useState } from "react"
import type {
  StationQueuePage,
  StationTicket,
  BumpResult,
} from "../../../types/kds"
import { elapsed, timerColor } from "../utils/timer"
import { cn } from "@/lib/utils"
import { AlertTriangle, CheckCircle2, ChevronRight, Clock, Info, Layers, MoreHorizontal, RotateCcw, Search, Star, User, X } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface Props {
  queue: StationQueuePage
  connected: boolean
  bumpFlash: number | null
  onBumpItem: (id: number) => Promise<BumpResult>
  onBumpAll: (ticketId: number) => Promise<void>
  onStartItem: (id: number) => Promise<void>
  onRecallItem: (id: number) => Promise<void>
}

export default function StationTablet({
  queue,
  connected,
  onBumpItem,
  onBumpAll,
  onStartItem,
  onRecallItem,
}: Props) {
  const [bumping, setBumping] = useState<Set<number>>(new Set())
  const [contextMenu, setContextMenu] = useState<{
    itemId: number
    x: number
    y: number
  } | null>(null)

  const { tickets, settings, deviceCapacity, totalInQueue } = queue
  const visible = tickets.slice(0, deviceCapacity)
  const overflow = totalInQueue - visible.length

  async function handleBump(stationItemId: number) {
    if (bumping.has(stationItemId)) return
    setBumping((prev) => new Set(prev).add(stationItemId))
    try {
      await onBumpItem(stationItemId)
    } finally {
      setBumping((prev) => {
        const s = new Set(prev)
        s.delete(stationItemId)
        return s
      })
    }
  }

  return (
    <div 
      className="flex flex-col h-[100dvh] bg-slate-950 text-white overflow-hidden select-none font-sans antialiased"
      onClick={() => setContextMenu(null)}
    >
      {/* Precision Header */}
      <header className="shrink-0 h-14 border-b border-white/5 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between z-30 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
                <ChefHat size={16} />
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] leading-none mb-1">
                   {queue.stationName}
                </span>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-sm font-bold text-white tracking-tight">{tickets.length} Active Tickets</span>
                  {overflow > 0 && (
                    <div className="flex items-center gap-2 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 animate-pulse">
                       <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest leading-none pt-0.5">
                          +{overflow} In Queue
                       </span>
                    </div>
                  )}
                </div>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex items-center gap-3">
              <div className={cn("w-2 h-2 rounded-full", connected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]')} />
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{connected ? 'Station Online' : 'Offline'}</span>
           </div>
        </div>
      </header>

      {/* Primary Production Grid */}
      <main className="flex-1 flex gap-4 p-5 overflow-hidden bg-slate-950/20">
        {visible.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in-95 duration-700">
             <div className="w-24 h-24 rounded-3xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center text-white/5">
                <CheckCircle2 size={48} strokeWidth={1} />
             </div>
             <div className="text-center space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/20 italic">Production Clear</p>
                <div className="px-6 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-[0.1em]">No Discretized Inputs Detected</div>
             </div>
          </div>
        ) : (
          visible.map((ticket, ci) => (
            <TicketCard
              key={ticket.ticketId}
              ticket={ticket}
              settings={settings}
              bumping={bumping}
              columnIndex={ci}
              totalColumns={visible.length}
              onBump={handleBump}
              onBumpAll={onBumpAll}
              onContextMenu={(e, id) => {
                e.preventDefault()
                setContextMenu({ itemId: id, x: e.clientX, y: e.clientY })
              }}
            />
          ))
        )}
      </main>

      {/* Contextual Command Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-slate-900 border border-white/10 rounded-2xl overflow-hidden min-w-[220px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-150 p-2"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {settings.enableStartAction && (
            <button
              className="w-full text-left px-5 py-4 hover:bg-white/5 rounded-xl transition-all text-xs font-bold text-white tracking-widest uppercase flex items-center gap-3"
              onClick={async () => {
                await onStartItem(contextMenu.itemId)
                setContextMenu(null)
              }}
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Clock size={12} /></div>
              Commence Prep
            </button>
          )}
          {settings.enableRecall && (
            <button
              className="w-full text-left px-5 py-4 hover:bg-white/5 rounded-xl transition-all text-xs font-bold text-white tracking-widest uppercase flex items-center gap-3"
              onClick={async () => {
                await onRecallItem(contextMenu.itemId)
                setContextMenu(null)
              }}
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500"><RotateCcw size={12} /></div>
              Recall Instance
            </button>
          )}
          <div className="h-[1px] bg-white/5 my-2" />
          <button
            className="w-full text-left px-5 py-4 hover:bg-rose-500/10 rounded-xl transition-all text-xs font-bold text-rose-500 tracking-widest uppercase flex items-center gap-3"
            onClick={() => setContextMenu(null)}
          >
            <div className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500"><X size={12} /></div>
            Abort Menu
          </button>
        </div>
      )}
    </div>
  )
}

function ChefHat({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
       <path d="M6 13.8a4.41 4.41 0 0 1-2-3.8 4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 8 3.8 4.41 4.41 0 0 1-2 3.8" />
       <path d="M6 13c0 4.4 3.6 8 8 8s8-3.6 8-8" />
       <path d="M6 13h16" />
    </svg>
  )
}

function TicketCard({
  ticket, settings, bumping, columnIndex, totalColumns, onBump, onBumpAll, onContextMenu,
}: {
  ticket: StationTicket
  settings: StationQueuePage["settings"]
  bumping: Set<number>
  columnIndex: number
  totalColumns: number
  onBump: (id: number) => void
  onBumpAll: (id: number) => void
  onContextMenu: (e: React.MouseEvent, id: number) => void
}) {
  const tc = timerColor(ticket.secondsElapsed, settings.warnThresholdSeconds, settings.alertThresholdSeconds)
  const isAlert = ticket.secondsElapsed >= settings.alertThresholdSeconds
  const isRush = ticket.priority === "RUSH"

  const active = ticket.items.filter((i) => ["NEW", "IN_PROGRESS", "RECALLED"].includes(i.status))
  const done = ticket.items.filter((i) => i.status === "DONE")
  const allDone = active.length === 0 && done.length > 0

  const borderColor = allDone ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : isAlert ? "border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse" : isRush ? "border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]" : "border-white/10"

  return (
    <div
      className={cn(
        "flex-1 flex flex-col bg-slate-900 rounded-[2.5rem] overflow-hidden border-2 transition-all duration-500 min-w-0 relative",
        borderColor
      )}
      style={{ maxWidth: `calc(${100 / totalColumns}% - 12px)` }}
    >
      {/* Card Header — Specialized for Kitchen Visibility */}
      <header className={cn(
        "p-6 border-b transition-colors flex-shrink-0 relative overflow-hidden",
        allDone ? 'bg-emerald-500/[0.03] border-emerald-500/20' : 
        isAlert ? 'bg-rose-500/[0.03] border-rose-500/20' : 
        isRush ? 'bg-amber-500/[0.03] border-amber-500/20' : 'bg-black/40 border-white/5'
      )}>
        <div className="flex justify-between items-start relative z-10">
          <div className="space-y-1">
            {isRush && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500 text-[9px] font-black text-black uppercase tracking-[0.2em] mb-2 animate-bounce">
                <Star size={8} className="fill-black" /> RUSH
              </div>
            )}
            <div className="text-4xl font-black font-mono tracking-tighter text-white/90 leading-none">#{ticket.ticketNumber}</div>
            <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mt-2 italic">{ticket.source}</div>
          </div>
          <div className="text-right space-y-2">
            <div className="text-2xl font-mono font-bold tabular-nums tracking-tighter" style={{ color: tc }}>
              {elapsed(ticket.secondsElapsed)}
            </div>
            {ticket.guestCount && (
              <div className="flex items-center gap-1.5 justify-end mt-2 opacity-30">
                 <User size={10} />
                 <span className="text-[9px] font-bold text-white uppercase tracking-widest">{ticket.guestCount} CVRS</span>
              </div>
            )}
          </div>
        </div>
        {ticket.serverNote && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-500 leading-tight flex gap-2 animate-in zoom-in-95">
            <AlertTriangle size={14} className="shrink-0" /> {ticket.serverNote}
          </div>
        )}
      </header>

      {/* Target Production SKUs */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-900/50">
        {active.map((item) => (
          <button
            key={item.stationItemId}
            className={cn(
               "w-full p-5 text-left border-b border-white/5 transition-all active:bg-white/5 flex gap-5 border-l-4",
               item.status === "IN_PROGRESS" ? "bg-emerald-500/[0.03] border-l-emerald-500" : "bg-transparent border-l-transparent",
               bumping.has(item.stationItemId) ? "opacity-30" : "opacity-100"
            )}
            onPointerUp={() => onBump(item.stationItemId)}
            onContextMenu={(e) => onContextMenu(e, item.stationItemId)}
          >
            <div className="flex-1 space-y-2">
               <div className="flex items-start gap-4">
                  <span className="font-mono tabular-nums text-lg font-black text-primary/40 pt-0.5">{item.quantity}×</span>
                  <div className="text-lg font-bold text-white tracking-tight leading-tight pt-0.5">
                    {item.menuItemName}
                  </div>
               </div>
              
              {item.modifications.map((m, i) => (
                <div key={i} className="text-xs text-white/40 italic font-medium ml-12 underline decoration-white/10 underline-offset-8 decoration-dashed pt-1">— {m}</div>
              ))}

              {item.allergenFlags.length > 0 && (
                <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest pt-3 flex items-center gap-2 ml-12">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                  {item.allergenFlags.join(" · ")}
                </div>
              )}
            </div>
            
            <div className={cn(
               "w-10 h-10 rounded-2xl border shrink-0 mt-0.5 flex items-center justify-center transition-all duration-300",
               bumping.has(item.stationItemId) ? 'bg-emerald-500 border-emerald-500 scale-110 shadow-lg shadow-emerald-500/20' : 'bg-white/5 border-white/10'
            )}>
              <svg width="18" height="18" viewBox="0 0 13 13" fill="none">
                <path d="M2 6.5l3.5 3.5 5.5-6.5" stroke={bumping.has(item.stationItemId) ? "white" : "#22c55e"} strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </button>
        ))}

        {done.map((item) => (
          <div key={item.stationItemId} className="p-5 flex items-center gap-5 opacity-10 border-b border-white/5 grayscale saturate-0">
            <span className="font-mono text-lg opacity-40">{item.quantity}×</span>
            <div className="flex-1 text-base font-bold line-through decoration-[3px]">
               {item.menuItemName}
            </div>
          </div>
        ))}
      </div>

      {/* Terminal Footer Execution */}
      <footer className="shrink-0 p-4 bg-black/40 border-t border-white/5" onClick={e => e.stopPropagation()}>
        {active.length > 0 ? (
          <button
            className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-600 transition-all rounded-2xl text-[12px] font-black text-white uppercase tracking-[0.3em] shadow-xl shadow-emerald-950/20 flex items-center justify-center gap-3 group"
            onPointerUp={() => onBumpAll(ticket.ticketId)}
          >
            <CheckCircle2 size={20} className="transition-transform group-active:scale-90" />
            Complete Cycle
          </button>
        ) : (
          <div className="w-full h-16 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center gap-3 text-white/10 text-[11px] font-black uppercase tracking-[0.3em] leading-none">
            <CheckCircle2 size={18} className="opacity-40" />
            Stage Finalized
          </div>
        )}
      </footer>
    </div>
  )
}

function formatPrepTime(s: number): string {
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`
}
