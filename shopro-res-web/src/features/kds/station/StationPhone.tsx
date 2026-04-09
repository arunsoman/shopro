import { useState, useRef } from "react"
import type {
  StationQueuePage,
  StationTicketItem,
  BumpResult,
} from "../types/kds"
import { elapsed, timerColor } from "../utils/timer"
import { cn } from "@/lib/utils"
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Clock, Info, MoreHorizontal, RotateCcw, Star, User, X } from "lucide-react"
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

export default function StationPhone({
  queue,
  connected,
  onBumpItem,
  onBumpAll,
  onStartItem,
  onRecallItem,
}: Props) {
  const [index, setIndex] = useState(0)
  const [bumping, setBumping] = useState<number | null>(null)
  const [longPress, setLongPress] = useState<number | null>(null)
  const lpRef = useRef<ReturnType<typeof setTimeout>>()

  const tickets = queue.tickets
  const ticket = tickets[index] ?? null
  const settings = queue.settings

  async function handleBump(item: StationTicketItem) {
    if (bumping === item.stationItemId) return
    setBumping(item.stationItemId)
    try {
      await onBumpItem(item.stationItemId)
    } finally {
      setBumping(null)
    }
  }

  async function handleBumpAll() {
    if (!ticket) return
    await onBumpAll(ticket.ticketId)
    if (index >= tickets.length - 1) setIndex(Math.max(0, index - 1))
  }

  function startLp(id: number) {
    lpRef.current = setTimeout(() => setLongPress(id), 500)
  }

  function endLp() {
    clearTimeout(lpRef.current)
  }

  if (!ticket) {
    return (
      <div className="flex flex-col h-[100dvh] bg-slate-950 text-white overflow-hidden select-none font-sans antialiased">
        <StatusBar stationName={queue.stationName} connected={connected} />
        <div className="flex-1 flex flex-col items-center justify-center space-y-8 px-10 text-center animate-in fade-in zoom-in-95 duration-700">
           <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white/10">
              <CheckCircle2 size={48} strokeWidth={1} />
           </div>
           <div className="space-y-3">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20 italic">Production Clear</p>
              <div className="px-6 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-[0.1em]">No Active Production manifestos</div>
           </div>
        </div>
      </div>
    )
  }

  const tc = timerColor(ticket.secondsElapsed, settings.warnThresholdSeconds, settings.alertThresholdSeconds)
  const isAlert = ticket.secondsElapsed >= settings.alertThresholdSeconds
  const isRush = ticket.priority === "RUSH"

  const active = ticket.items.filter(
    (i) => i.status === "NEW" || i.status === "IN_PROGRESS" || i.status === "RECALLED"
  )
  const done = ticket.items.filter((i) => i.status === "DONE")

  return (
    <div 
      className="flex flex-col h-[100dvh] bg-slate-950 text-white overflow-hidden select-none font-sans antialiased"
      onClick={() => setLongPress(null)}
    >
      <StatusBar
        stationName={queue.stationName}
        connected={connected}
        queueCount={tickets.length}
        currentIndex={index}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header Spec */}
        <header className={cn(
          "shrink-0 p-6 space-y-4 border-b transition-colors relative overflow-hidden",
          isAlert ? 'bg-rose-500/[0.03] border-rose-500/50 animate-pulse' : 
          isRush ? 'bg-amber-500/[0.03] border-amber-500/50' : 'bg-black/40 border-white/10'
        )}>
          <div className="flex justify-between items-start relative z-10">
            <div className="space-y-1">
              {isRush && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500 text-[8px] font-black text-black uppercase tracking-[0.2em] mb-2">
                   <Star size={8} className="fill-black" /> RUSH
                </div>
              )}
              <div className="text-4xl font-black font-mono text-white tracking-tighter leading-none">#{ticket.ticketNumber}</div>
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
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-500 leading-tight flex gap-2 animate-in zoom-in-95">
              <AlertTriangle size={14} className="shrink-0" /> {ticket.serverNote}
            </div>
          )}
        </header>

        {/* High-Density Mobile Item Feed */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-950/20 relative">
          {active.map((item) => (
            <div key={item.stationItemId} className="relative">
              <button
                className={cn(
                  "w-full p-6 text-left border-b border-white/5 transition-all active:bg-white/5 flex gap-5 items-start border-l-4",
                  item.status === "IN_PROGRESS" ? "bg-emerald-500/[0.03] border-l-emerald-500" : "bg-transparent border-l-transparent",
                  bumping === item.stationItemId ? "opacity-30" : "opacity-100"
                )}
                onPointerDown={() => startLp(item.stationItemId)}
                onPointerUp={() => {
                  endLp()
                  if (!longPress) handleBump(item)
                }}
                onPointerCancel={endLp}
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-start gap-4">
                     <span className="font-mono tabular-nums text-lg font-black text-primary/40 pt-0.5">{item.quantity}×</span>
                     <div className="text-lg font-bold text-white tracking-tight leading-tight pt-0.5">
                       {item.menuItemName}
                     </div>
                  </div>
                  
                  {item.modifications.map((m: string, i: number) => (
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
                  bumping === item.stationItemId ? 'bg-emerald-500 border-emerald-500 scale-110 shadow-lg shadow-emerald-500/20' : 'bg-white/5 border-white/10'
                )}>
                  <svg width="18" height="18" viewBox="0 0 13 13" fill="none">
                    <path d="M2 6.5l3.5 3.5 5.5-6.5" stroke={bumping === item.stationItemId ? "white" : "#22c55e"} strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              </button>

              {/* Mobile Context Overlay */}
              {longPress === item.stationItemId && (
                <div
                  className="fixed inset-x-6 top-1/2 -translate-y-1/2 z-50 bg-slate-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-200 p-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {settings.enableStartAction && item.status === "NEW" && (
                    <button
                      className="w-full text-left px-5 py-5 hover:bg-white/5 rounded-2xl transition-all text-xs font-bold text-white tracking-widest uppercase flex items-center gap-3"
                      onClick={() => {
                        onStartItem(item.stationItemId)
                        setLongPress(null)
                      }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Clock size={14} /></div>
                      Commence Prep
                    </button>
                  )}
                  {settings.enableRecall && item.status !== "NEW" && (
                    <button
                      className="w-full text-left px-5 py-5 hover:bg-white/5 rounded-2xl transition-all text-xs font-bold text-white tracking-widest uppercase flex items-center gap-3"
                      onClick={() => {
                        onRecallItem(item.stationItemId)
                        setLongPress(null)
                      }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500"><RotateCcw size={14} /></div>
                      Recall Instance
                    </button>
                  )}
                  <div className="h-[1px] bg-white/5 my-2" />
                  <button
                    className="w-full text-left px-5 py-5 hover:bg-rose-500/10 rounded-2xl transition-all text-xs font-bold text-rose-500 tracking-widest uppercase flex items-center gap-3"
                    onClick={() => setLongPress(null)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500"><X size={14} /></div>
                    Abort Operation
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Fulfilled Mobile Ledger */}
          {done.length > 0 && (
            <div className="mt-6 border-t border-white/5 bg-black/20">
               <div className="px-6 py-4 border-b border-white/5">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] italic">Fulfilled Components</span>
               </div>
              {done.map((item) => (
                <div
                  key={item.stationItemId}
                  className="p-6 flex items-center gap-5 opacity-10 border-b border-white/5 grayscale saturate-0"
                >
                  <span className="font-mono text-lg opacity-40">{item.quantity}×</span>
                  <div className="flex-1 text-base font-bold line-through decoration-[3px]">
                     {item.menuItemName}
                  </div>
                   <CheckCircle2 size={16} className="text-emerald-500" strokeWidth={3} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Analytical Navigation & Action Unit */}
      <footer className="shrink-0 flex flex-col bg-slate-900 border-t border-white/5 pb-safe">
        {active.length > 0 && (
          <button 
            className="h-16 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-600 transition-all text-[11px] font-black text-white uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl"
            onPointerUp={handleBumpAll}
          >
            <CheckCircle2 size={20} />
            Finish Ticket {ticket.ticketNumber}
          </button>
        )}

        {/* Sequential Index Navigation */}
        {tickets.length > 1 && (
          <div className="h-16 flex items-center justify-between px-6 bg-black/40">
            <button 
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 text-white/20 active:text-primary transition-all disabled:opacity-0"
              onClick={() => setIndex(Math.max(0, index - 1))}
              disabled={index === 0}
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="flex-1 flex flex-col items-center">
               <div className="flex gap-2 items-center mb-2">
                 {tickets.slice(0, 5).map((_t, i) => (
                   <div
                     key={i}
                     onClick={() => setIndex(i)}
                     className={cn(
                       "h-1.5 rounded-full transition-all duration-300",
                       i === index ? 'w-8 bg-primary shadow-[0_0_12px_rgba(var(--primary),0.6)]' : 'w-1.5 bg-white/10'
                     )}
                   />
                 ))}
                 {tickets.length > 5 && (
                   <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                 )}
               </div>
               <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest pt-1">
                  Ticket {index + 1} of {tickets.length}
               </span>
            </div>

            <button
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 text-white/20 active:text-primary transition-all disabled:opacity-0"
              onClick={() => setIndex(Math.min(tickets.length - 1, index + 1))}
              disabled={index === tickets.length - 1}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </footer>
    </div>
  )
}

function StatusBar({
  stationName,
  connected,
}: {
  stationName: string
  connected: boolean
  queueCount?: number
  currentIndex?: number
}) {
  return (
    <header className="shrink-0 h-12 border-b border-white/5 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between z-30">
      <div className="flex items-center gap-3">
         <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
            <ChefHat size={12} />
         </div>
         <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] pt-0.5 truncate max-w-[120px]">
            {stationName}
         </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
           <div className={cn("w-2 h-2 rounded-full", connected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)] animate-pulse')} />
           <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">{connected ? 'Online' : 'Offline'}</span>
        </div>
      </div>
    </header>
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
