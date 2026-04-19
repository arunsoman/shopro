import { useState, useEffect } from "react"
import type {
  StationQueuePage,
  StationTicket,
  BumpResult,
} from "../types/kds"
import { elapsed, timerColor } from "../utils/timer"
import { cn } from "@/lib/utils"
import { 
  AlertTriangle, 
  CheckCircle2, 
  ChefHat, 
  Clock, 
  Command, 
  HelpCircle, 
  Info, 
  Keyboard, 
  MoreHorizontal, 
  Plus, 
  RotateCcw, 
  Star, 
  User, 
  X 
} from "lucide-react"
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

export default function StationFullscreen({
  queue,
  connected,
  onBumpItem,
  onBumpAll,
  onStartItem,
  onRecallItem,
}: Props) {
  const [bumping, setBumping] = useState<Set<number>>(new Set())
  const [completing, setCompleting] = useState<Set<number>>(new Set())
  const [showShortcuts, setShowShortcuts] = useState(false)

  const { tickets, settings, deviceCapacity, totalInQueue } = queue
  const visible = tickets.slice(0, deviceCapacity)
  const overflow = totalInQueue - visible.length

  // Bump-bar keyboard support (F1–F8)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const match = e.key.match(/^F(\d+)$/)
      if (match) {
        const idx = parseInt(match[1]) - 1
        if (tickets[idx]) onBumpAll(tickets[idx].ticketId)
      }
      if (e.key === "?") setShowShortcuts((s) => !s)
      if (e.key === "Escape") setShowShortcuts(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [tickets, onBumpAll])

  async function handleBump(stationItemId: number): Promise<void> {
    if (bumping.has(stationItemId)) return
    setBumping((prev) => new Set(prev).add(stationItemId))
    try {
      const result = await onBumpItem(stationItemId)
      if (result.ticketComplete) {
        setCompleting((prev) => new Set(prev).add(stationItemId))
        setTimeout(() => {
          setCompleting((prev) => {
            const s = new Set(prev)
            s.delete(stationItemId)
            return s
          })
        }, 2000)
      }
    } finally {
      setBumping((prev) => {
        const s = new Set(prev)
        s.delete(stationItemId)
        return s
      })
    }
  }

  const cols = visible.length <= 4 ? visible.length || 3 : Math.ceil(visible.length / 2)
  const rows = visible.length <= 4 ? 1 : 2

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-950 text-white overflow-hidden select-none font-sans antialiased">
      {/* Top bar */}
      <header className="shrink-0 h-14 border-b border-white/5 bg-slate-900/80 backdrop-blur-xl px-8 flex items-center justify-between z-30 shadow-2xl relative">
        <div className="flex items-center gap-10">
          <div className="flex flex-col leading-none">
             <div className="flex items-center gap-2 mb-1.5">
                <div className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                   <ChefHat size={10} />
                </div>
                <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">
                   {queue.stationName} · STATION TERMINAL
                </span>
             </div>
             <div className="flex items-center gap-6">
                <div className="flex items-baseline gap-2">
                   <span className="text-2xl font-black text-white tracking-tighter tabular-nums">{tickets.length}</span>
                   <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest pt-1">Active Manifests</span>
                </div>
                {overflow > 0 && (
                   <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 animate-pulse">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider">
                         +{overflow} IN QUEUE
                      </span>
                   </div>
                )}
             </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <button
            className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-all active:scale-95"
            onClick={() => setShowShortcuts(true)}
          >
            <Keyboard size={14} />
            <span className="pt-0.5">Key Ops [?]</span>
          </button>
          
          <div className="flex items-center gap-4 bg-black/40 px-5 py-2 rounded-2xl border border-white/5">
              <div className={cn("w-2 h-2 rounded-full", connected ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] animate-pulse')} />
              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{connected ? 'Network Online' : 'Signal Lost'}</span>
          </div>
        </div>
      </header>

      {/* Primary Production Grid */}
      <main className="flex-1 overflow-hidden bg-slate-950/40 relative">
        {visible.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-12 animate-in fade-in zoom-in-95 duration-1000 h-full">
             <div className="relative">
                <div className="w-32 h-32 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center text-white/[0.03]">
                   <CheckCircle2 size={84} strokeWidth={0.5} />
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] whitespace-nowrap">
                   Station Clear
                </div>
             </div>
             <div className="text-center space-y-3 opacity-20">
                <p className="text-xs font-bold uppercase tracking-[0.4em] italic">Standing by for next order</p>
                <p className="text-[10px] font-medium tracking-widest">REAL-TIME SYNC ACTIVE</p>
             </div>
          </div>
        ) : (
          <div
            className="h-full p-4 gap-4 grid relative z-10"
            style={{
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: rows === 2 ? "1fr 1fr" : "1fr",
            }}
          >
            {visible.map((ticket, idx) => (
              <FullscreenCard
                key={ticket.ticketId}
                ticket={ticket}
                settings={settings}
                bumping={bumping}
                completing={completing}
                ticketIndex={idx}
                onBump={handleBump}
                onBumpAll={onBumpAll}
                onStartItem={onStartItem}
                onRecallItem={onRecallItem}
              />
            ))}
          </div>
        )}
        
        {/* Abstract background depth */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[160px]" />
           <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-emerald-500/5 rounded-full blur-[160px]" />
        </div>
      </main>

      {/* Global Command Map Overlay */}
      {showShortcuts && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/90 backdrop-blur-md animate-in fade-in duration-500"
          onClick={() => setShowShortcuts(false)}
        >
          <div 
            className="w-full max-w-lg p-12 rounded-[3rem] bg-slate-900 border border-white/10 shadow-[0_32px_128px_-32px_rgba(0,0,0,1)] space-y-10 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 text-primary relative z-10">
               <div className="w-12 h-12 rounded-3xl bg-primary/10 flex items-center justify-center">
                  <Command size={24} />
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 leading-none">Bump-Bar Interface</p>
                  <h3 className="text-3xl font-black text-white tracking-tighter">Command Mapping</h3>
               </div>
            </div>
            
            <div className="space-y-6 relative z-10">
               {[
                  ["F1 – F8", "BUMP TICKET BY VISUAL MATRIX POSITION"],
                  ["?", "TOGGLE COMMAND MAPPING VIEW"],
                  ["ESC", "TERMINATE OVERLAY & RETURN TO PRODUCTION"],
               ].map(([key, desc]) => (
                  <div key={key} className="flex items-center justify-between group p-4 rounded-2xl bg-white/[0.02] border border-white/5 transition-all hover:bg-white/[0.05]">
                     <div className="px-4 py-2 rounded-xl bg-slate-900 border border-white/20 text-sm font-black font-mono text-primary shadow-lg group-hover:scale-110 transition-transform">{key}</div>
                     <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{desc}</span>
                  </div>
               ))}
            </div>

            <button
              className="w-full h-18 rounded-[1.5rem] bg-white/5 border border-white/10 font-black text-white/40 hover:text-white transition-all uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 active:scale-[0.98]"
              onClick={() => setShowShortcuts(false)}
            >
              Back to Station Terminal
            </button>
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          </div>
        </div>
      )}
    </div>
  )
}

function FullscreenCard({
  ticket, settings, bumping, completing, ticketIndex, onBump, onBumpAll, onStartItem, onRecallItem,
}: {
  ticket: StationTicket
  settings: StationQueuePage["settings"]
  bumping: Set<number>
  completing: Set<number>
  ticketIndex: number
  onBump: (id: number) => void
  onBumpAll: (id: number) => void
  onStartItem: (id: number) => void
  onRecallItem: (id: number) => void
}) {
  const [ctxItem, setCtxItem] = useState<number | null>(null)

  const tc = timerColor(ticket.secondsElapsed, settings.warnThresholdSeconds, settings.alertThresholdSeconds)
  const isAlert = ticket.secondsElapsed >= settings.alertThresholdSeconds
  const isRush = ticket.priority === "RUSH"

  const active = ticket.items.filter((i) => ["NEW", "IN_PROGRESS", "RECALLED"].includes(i.status))
  const done = ticket.items.filter((i) => i.status === "DONE")
  const allDone = active.length === 0

  return (
    <div
      className={cn(
        "flex flex-col bg-slate-900 rounded-[2rem] overflow-hidden border-2 transition-all duration-500 min-h-0 relative",
        allDone ? 'border-emerald-500 shadow-2xl shadow-emerald-500/10' : 
        isAlert ? 'border-rose-500 animate-pulse' : 
        isRush ? 'border-amber-500 shadow-2xl shadow-amber-500/10' : 'border-white/5'
      )}
      onClick={() => setCtxItem(null)}
    >
      {/* Ticket Header Spec */}
      <header className={cn(
        "p-6 border-b space-y-4 flex-shrink-0 transition-colors relative overflow-hidden",
        allDone ? 'bg-emerald-500/[0.03] border-emerald-500/20' : 
        isAlert ? 'bg-rose-500/[0.03] border-rose-500/20' : 
        isRush ? 'bg-amber-500/[0.03] border-amber-500/20' : 'bg-black/40 border-white/5'
      )}>
        <div className="flex justify-between items-start relative z-10">
          <div className="flex items-center gap-4">
            {isRush && (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-500 text-[9px] font-black text-black uppercase tracking-[0.2em] shadow-lg shadow-amber-500/20">
                <Star size={10} className="fill-black" /> RUSH
              </div>
            )}
            <div className="text-4xl font-black font-mono text-white tracking-tighter leading-none">#{ticket.ticketNumber}</div>
            {ticket.guestCount && (
               <div className="flex items-center gap-2 opacity-20">
                  <User size={10} />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest pt-0.5">{ticket.guestCount}P</span>
               </div>
            )}
          </div>
          <div className="flex items-center gap-6">
             <div className="text-2xl font-mono font-bold tabular-nums tracking-tighter" style={{ color: tc }}>
                {elapsed(ticket.secondsElapsed)}
             </div>
             <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black font-mono text-white/20 shadow-inner">
                F{ticketIndex + 1}
             </div>
          </div>
        </div>

        {ticket.serverNote && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-500 leading-tight flex gap-2 relative z-10 animate-in zoom-in-95">
            <AlertTriangle size={14} className="shrink-0" /> {ticket.serverNote}
          </div>
        )}
        
        {/* Modernist background texture */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      </header>

      {/* Production Item Stream */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-900/50">
        {active.map((item) => (
          <div key={item.stationItemId} className="relative">
            <button
              className={cn(
                "w-full p-5 text-left border-b border-white/5 transition-all active:bg-white/5 flex gap-5 items-start border-l-4 group/item",
                item.status === "IN_PROGRESS" ? "bg-emerald-500/[0.03] border-l-emerald-500" : "bg-transparent border-l-transparent",
                bumping.has(item.stationItemId) ? "opacity-30" : "opacity-100"
              )}
              onPointerUp={() => onBump(item.stationItemId)}
              onContextMenu={(e) => { e.preventDefault(); setCtxItem(item.stationItemId); }}
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-start gap-4">
                   <span className="font-mono tabular-nums text-lg font-black text-primary/40 pt-0.5 group-hover/item:text-primary transition-colors">{item.quantity}×</span>
                   <div className="text-lg font-bold text-white tracking-tight leading-tight pt-0.5 uppercase">
                     {item.menuItemName}
                   </div>
                </div>
                
                {item.modifications.map((m, i) => (
                  <div key={i} className="text-xs text-white/30 italic font-medium ml-12 underline decoration-white/10 underline-offset-8 decoration-dashed pt-1">— {m}</div>
                ))}

                {item.allergenFlags.length > 0 && (
                  <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest pt-3 flex items-center gap-2 ml-12">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                    {item.allergenFlags.join(" · ")}
                  </div>
                )}
              </div>
              
              <div className={cn(
                "w-9 h-9 rounded-2xl border shrink-0 mt-0.5 flex items-center justify-center transition-all duration-300",
                bumping.has(item.stationItemId) ? 'bg-emerald-500 border-emerald-500 scale-110 shadow-lg shadow-emerald-500/20' : 'bg-white/5 border-white/10 group-hover/item:border-emerald-500/50'
              )}>
                <svg width="18" height="18" viewBox="0 0 13 13" fill="none">
                  <path d="M2 6.5l3.5 3.5 5.5-6.5" stroke={bumping.has(item.stationItemId) ? "white" : "#22c55e"} strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </button>

            {/* Preparation Context Menu */}
            {ctxItem === item.stationItemId && (
              <div 
                className="absolute right-4 top-4 z-[40] bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-150 min-w-[200px] p-2" 
                onClick={e => e.stopPropagation()}
              >
                {settings.enableStartAction && item.status === "NEW" && (
                  <button 
                    className="w-full text-left px-4 py-4 hover:bg-white/5 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-3" 
                    onClick={(e) => { e.stopPropagation(); onStartItem(item.stationItemId); setCtxItem(null); }}
                  >
                    <Clock size={14} /> Commence Prep
                  </button>
                )}
                {settings.enableRecall && (
                  <button 
                    className="w-full text-left px-4 py-4 hover:bg-white/5 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-3" 
                    onClick={(e) => { e.stopPropagation(); onRecallItem(item.stationItemId); setCtxItem(null); }}
                  >
                    <RotateCcw size={14} /> Recall Item
                  </button>
                )}
                <div className="h-[1px] bg-white/5 my-1" />
                <button 
                  className="w-full text-left px-4 py-4 hover:bg-rose-500/10 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest text-rose-500/40 flex items-center gap-3" 
                  onClick={(e) => { e.stopPropagation(); setCtxItem(null); }}
                >
                  <X size={14} /> Abort
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Fulfilled Components Stack */}
        {done.length > 0 && (
           <div className="bg-black/20 mt-4 border-t border-white/5">
              {done.map((item) => (
                <div 
                   key={item.stationItemId} 
                   className="p-5 flex items-center gap-5 opacity-10 border-b border-white/5 grayscale saturate-0"
                >
                   <span className="font-mono text-lg opacity-40">{item.quantity}×</span>
                   <div className="flex-1 text-base font-bold line-through decoration-[3px] tracking-tight uppercase">
                      {item.menuItemName}
                   </div>
                   <CheckCircle2 size={16} className="text-emerald-500" strokeWidth={3} />
                </div>
              ))}
           </div>
        )}
      </div>

      {/* Primary Terminal Action */}
      <footer className="shrink-0 p-2 bg-slate-950" onClick={e => e.stopPropagation()}>
        {active.length > 0 ? (
          <button 
            className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-600 rounded-2xl transition-all text-[11px] font-black text-white uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl"
            onPointerUp={() => onBumpAll(ticket.ticketId)}
          >
            <CheckCircle2 size={20} />
            Fulfil Manifest
          </button>
        ) : (
          <div className="w-full h-14 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center gap-4 text-emerald-500/30">
            <div className="w-8 h-8 rounded-full bg-emerald-500/5 flex items-center justify-center">
               <CheckCircle2 size={18} />
            </div>
            <span className="font-black text-[10px] uppercase tracking-[0.4em] pt-0.5">Manifest Cleared</span>
          </div>
        )}
      </footer>
    </div>
  )
}
