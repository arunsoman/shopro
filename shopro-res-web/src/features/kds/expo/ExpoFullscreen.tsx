import { useState } from "react"
import type {
  ExpoQueue,
  ExpoTicket,
  ExpoStationStatus,
  CompletedTicket,
  StationDeviceStatus,
} from "../types/kds"
import { elapsed, timerColor } from "../utils/timer"
import { cn } from "@/lib/utils"
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  History, 
  MoreHorizontal, 
  Plus, 
  RotateCcw, 
  Search, 
  Settings, 
  ShieldAlert, 
  Star, 
  Terminal, 
  TrendingUp, 
  User, 
  X 
} from "lucide-react"
import { Button } from "@/components/ui/Button"

interface Actions {
  rush: (id: number) => Promise<void>
  clearRush: (id: number) => Promise<void>
  voidTicket: (id: number, reason: string) => Promise<void>
  closeTicket: (id: number) => Promise<void>
  recallTicket: (id: number) => Promise<void>
  setNote: (id: number, note: string) => Promise<void>
  fireCourse: (id: number, course: number) => Promise<void>
  recallItem: (id: number) => Promise<void>
}

interface Props {
  data: ExpoQueue
  completed: CompletedTicket[]
  deviceStatus: StationDeviceStatus[]
  connected: boolean
  refresh: () => void
  actions: Actions
}

export default function ExpoFullscreen({
  data,
  completed,
  deviceStatus,
  connected,
  refresh,
  actions,
}: Props) {
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null)
  const [confirmVoid, setConfirmVoid] = useState<number | null>(null)
  const [noteEdit, setNoteEdit] = useState<{ ticketId: number; value: string } | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const { tickets, activeCount, ticketsOverWarn, ticketsOverAlert } = data
  const offlineStations = deviceStatus.filter((s) => !s.hasOnlineDevice)

  async function act(key: string, fn: () => Promise<void>) {
    setActionLoading(key)
    try {
      await fn()
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-950 text-white overflow-hidden select-none font-sans antialiased">
      {/* Universal Command Header */}
      <header className="shrink-0 h-16 border-b border-white/5 bg-slate-900/80 backdrop-blur-xl px-8 flex items-center justify-between z-30 shadow-2xl relative">
        <div className="flex items-center gap-10">
          <div className="flex flex-col leading-none">
             <div className="flex items-center gap-2 mb-1.5">
                <div className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                   <Terminal size={10} />
                </div>
                <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">
                   {data.outletName} · EXPEDITOR CORE
                </span>
             </div>
             <div className="flex items-center gap-6">
                <div className="flex items-baseline gap-2">
                   <span className="text-2xl font-black text-white tracking-tighter tabular-nums">{activeCount}</span>
                   <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest pt-1">Active Manifests</span>
                </div>
                
                {ticketsOverWarn > 0 && (
                   <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider">
                         {ticketsOverWarn} WARNING
                      </span>
                   </div>
                )}

                {ticketsOverAlert > 0 && (
                   <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 animate-pulse">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                      <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider">
                         {ticketsOverAlert} CRITICAL
                      </span>
                   </div>
                )}
             </div>
          </div>
          {offlineStations.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] font-bold text-rose-500 tracking-tight flex items-center gap-2">
               <ShieldAlert size={14} />
               {offlineStations.length} Stations Unreachable
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          <Button 
            variant="ghost"
            size="icon"
            onClick={refresh}
            className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/40 hover:text-white transition-all active:scale-90"
          >
            <RotateCcw size={18} />
          </Button>
          
          <div className="flex items-center gap-4 bg-black/40 px-5 py-2 rounded-2xl border border-white/5">
              <div className={cn("w-2 h-2 rounded-full", connected ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] animate-pulse')} />
              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{connected ? 'Network Online' : 'Signal Lost'}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden bg-slate-950/40 relative">
        {/* Primary Expeditor Matrix */}
        <div className="flex-1 overflow-hidden flex flex-col relative z-10">
          {tickets.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-12 animate-in fade-in zoom-in-95 duration-1000">
               <div className="relative">
                  <div className="w-32 h-32 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center text-white/[0.03]">
                     <CheckCircle2 size={84} strokeWidth={0.5} />
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] whitespace-nowrap">
                     Production Terminal Clear
                  </div>
               </div>
               <div className="text-center space-y-3 opacity-20">
                  <p className="text-xs font-bold uppercase tracking-[0.4em] italic italic">Standing by for next order</p>
                  <p className="text-[10px] font-medium tracking-widest">REAL-TIME SYNC ACTIVE</p>
               </div>
            </div>
          ) : (
            <div className="flex-1 flex gap-6 p-8 overflow-x-auto no-scrollbar scroll-smooth">
              {tickets.map((ticket) => (
                <ExpoTicketColumn
                  key={ticket.ticketId}
                  ticket={ticket}
                  selected={selectedTicket === ticket.ticketId}
                  actionLoading={actionLoading}
                  onSelect={() =>
                    setSelectedTicket(
                      selectedTicket === ticket.ticketId ? null : ticket.ticketId
                    )
                  }
                  onRush={() =>
                    act(
                      `rush-${ticket.ticketId}`,
                      ticket.priority === "RUSH"
                        ? () => actions.clearRush(ticket.ticketId)
                        : () => actions.rush(ticket.ticketId)
                    )
                  }
                  onClose={() =>
                    act(`close-${ticket.ticketId}`, () =>
                      actions.closeTicket(ticket.ticketId)
                    )
                  }
                  onVoid={() => setConfirmVoid(ticket.ticketId)}
                  onNote={() =>
                    setNoteEdit({
                      ticketId: ticket.ticketId,
                      value: ticket.serverNote ?? "",
                    })
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Global Operational Analytics Sidebar */}
        <aside className="w-80 shrink-0 border-l border-white/5 bg-slate-900/40 backdrop-blur-md p-8 space-y-12 overflow-y-auto no-scrollbar relative z-20">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
               <div className="flex items-center gap-3">
                  <Settings size={14} className="text-white/20" />
                  <h3 className="text-[11px] font-black text-white/40 tracking-[0.2em] uppercase">
                    Terminal Nodes
                  </h3>
               </div>
            </div>
            <div className="space-y-4">
              {deviceStatus.map((s) => (
                <div key={s.stationId} className="flex items-center justify-between group transition-all hover:translate-x-1">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                       "w-2 h-2 rounded-full transition-shadow duration-500", 
                       s.hasOnlineDevice ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)] animate-pulse'
                    )} />
                    <span className={cn(
                       "text-xs font-bold transition-colors", 
                       s.hasOnlineDevice ? 'text-white/70' : 'text-rose-500/70'
                    )}>
                      {s.stationName}
                    </span>
                  </div>
                  {!s.hasOnlineDevice && (
                    <span className="text-[9px] font-black text-rose-500/20 uppercase tracking-tighter italic">UNREACHABLE</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
               <div className="flex items-center gap-3">
                  <History size={14} className="text-white/20" />
                  <h3 className="text-[11px] font-black text-white/40 tracking-[0.2em] uppercase">
                    Recent Fulfilments
                  </h3>
               </div>
            </div>
            <div className="space-y-3">
              {completed.length === 0 ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-12 opacity-10">
                   <Clock size={32} strokeWidth={1} />
                   <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Zero Recent Activity</span>
                </div>
              ) : (
                completed.map((c) => (
                  <div key={c.ticketId} className="flex flex-col gap-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group relative overflow-hidden">
                    <div className="flex items-center justify-between relative z-10">
                        <span className="text-xl font-black font-mono tracking-tighter text-white/40 group-hover:text-primary transition-colors">
                          #{c.ticketNumber}
                        </span>
                        {c.canRecall && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg bg-white/5 hover:bg-primary/20 text-white/20 hover:text-primary transition-all active:scale-90"
                            onClick={() => actions.recallTicket(c.ticketId)}
                          >
                            <RotateCcw size={12} />
                          </Button>
                        )}
                    </div>
                    <div className="flex items-center gap-2 relative z-10">
                       <TrendingUp size={10} className="text-white/10" />
                       <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                          {formatPrepTime(c.prepTimeSeconds)} Cycle Time
                       </span>
                    </div>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary/10 transition-colors" />
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </main>

      {/* Global Administrative Overlays */}
      {confirmVoid !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/90 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setConfirmVoid(null)}>
          <div className="w-full max-w-md p-10 rounded-[2.5rem] bg-slate-900 border border-white/10 shadow-[0_32px_128px_-32px_rgba(0,0,0,1)] space-y-10 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-3 relative z-10">
               <div className="flex items-center gap-3 text-rose-500 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                     <ShieldAlert size={20} />
                  </div>
                  <span className="text-[12px] font-black uppercase tracking-[0.3em] leading-none pt-1">Security Alert</span>
               </div>
               <h3 className="text-4xl font-black text-white tracking-tighter">
                 Void Product #{tickets.find((t) => t.ticketId === confirmVoid)?.ticketNumber}?
               </h3>
               <p className="text-lg text-white/40 font-medium leading-relaxed">
                 All station nodes will terminate production immediately. This audit log entry is permanent.
               </p>
            </div>
            
            <div className="space-y-4 relative z-10">
               <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-2 px-2">Authorization Justification</p>
               <input
                 autoFocus
                 id="void-reason"
                 placeholder="e.g., Guest Cancellation, Server Error..."
                 className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 text-white text-lg placeholder:text-white/10 focus:outline-none focus:border-rose-500/50 transition-all font-bold"
               />
            </div>

            <div className="flex gap-4 pt-4 relative z-10">
               <button className="flex-1 h-16 rounded-[1.25rem] border border-white/10 font-bold text-white/40 hover:text-white transition-colors uppercase text-xs tracking-widest" onClick={() => setConfirmVoid(null)}>
                  Abort
                </button>
                <button
                  className="flex-1 h-16 rounded-[1.25rem] bg-rose-600 hover:bg-rose-500 font-black text-white shadow-2xl shadow-rose-900/40 active:scale-95 transition-all text-xs uppercase tracking-widest"
                  onClick={async () => {
                    const reason = (document.getElementById("void-reason") as HTMLInputElement).value
                    await act(`void-${confirmVoid}`, () => actions.voidTicket(confirmVoid!, reason))
                    setConfirmVoid(null)
                  }}
                >
                  Confirm Void
                </button>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          </div>
        </div>
      )}

      {/* Instructional Broadcast Overlay */}
      {noteEdit !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/90 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setNoteEdit(null)}>
          <div className="w-full max-w-2xl p-12 rounded-[3rem] bg-slate-900 border border-white/10 shadow-[0_32px_128px_-32px_rgba(0,0,0,1)] space-y-10 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 text-primary relative z-10">
               <div className="w-12 h-12 rounded-3xl bg-primary/10 flex items-center justify-center">
                  <Info size={24} />
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 leading-none">Broadcast Channel</p>
                  <h3 className="text-3xl font-black text-white tracking-tighter">Manifest Instructions</h3>
               </div>
            </div>
            
            <textarea
              autoFocus
              value={noteEdit.value}
              onChange={(e) => setNoteEdit((p) => p ? { ...p, value: e.target.value } : null)}
              placeholder="Inject allergy warnings, custom requests, or VIP markers..."
              className="w-full h-48 bg-white/5 border border-white/10 rounded-[2rem] p-8 text-white text-2xl placeholder:text-white/10 focus:outline-none focus:border-primary/50 transition-all font-bold resize-none leading-relaxed"
            />

            <div className="flex gap-6 pt-2 relative z-10">
               <button className="flex-1 h-16 rounded-[1.5rem] border border-white/10 font-bold text-white/40 hover:text-white transition-colors uppercase text-xs tracking-widest" onClick={() => setNoteEdit(null)}>
                  Discard
                </button>
                <button
                  className="flex-1 h-16 rounded-[1.5rem] bg-primary hover:bg-primary/90 font-black text-white shadow-2xl shadow-primary/40 active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-3"
                  onClick={async () => {
                    await actions.setNote(noteEdit!.ticketId, noteEdit!.value)
                    setNoteEdit(null)
                  }}
                >
                  <CheckCircle2 size={18} />
                  Propagate to Stations
                </button>
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          </div>
        </div>
      )}
    </div>
  )
}

function ExpoTicketColumn({
  ticket, selected, actionLoading,
  onSelect, onRush, onClose, onVoid, onNote,
}: {
  ticket: ExpoTicket
  selected: boolean
  actionLoading: string | null
  onSelect: () => void
  onRush: () => void
  onClose: () => void
  onVoid: () => void
  onNote: () => void
}) {
  const isAlert = ticket.secondsElapsed >= 480
  const isWarn = ticket.secondsElapsed >= 300 && !isAlert
  const isRush = ticket.priority === "RUSH"
  const isReady = ticket.overallStatus === "READY"
  const tc = timerColor(ticket.secondsElapsed, 300, 480)
  
  return (
    <div
      className={cn(
        "w-80 shrink-0 flex flex-col bg-slate-900 rounded-[2rem] overflow-hidden border-2 transition-all duration-500 cursor-pointer relative",
        selected ? 'border-primary ring-8 ring-primary/10 scale-[1.02] z-20 shadow-2xl shadow-black/80' : 'border-white/5 hover:border-white/20 z-10',
        isAlert && !isReady ? 'animate-pulse' : ''
      )}
      onClick={onSelect}
    >
      <header className={cn(
        "p-6 border-b transition-colors flex-shrink-0 space-y-5 relative overflow-hidden",
        isReady ? 'bg-emerald-500/[0.03] border-emerald-500/20' : 
        isAlert ? 'bg-rose-500/[0.03] border-rose-500/20' : 
        isWarn ? 'bg-amber-500/[0.03] border-amber-500/20' : 'bg-black/40 border-white/5'
      )}>
        <div className="flex justify-between items-start relative z-10">
          <div className="space-y-1">
            {isRush && (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-500 text-[9px] font-black text-black uppercase tracking-[0.2em] mb-2 shadow-lg shadow-amber-500/20">
                <Star size={10} className="fill-black" /> RUSH
              </div>
            )}
            <div className="text-4xl font-black font-mono text-white tracking-tighter leading-none">#{ticket.ticketNumber}</div>
            <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] pt-2 italic">{ticket.source}</div>
          </div>
          <div className="text-right space-y-2">
            <div className="text-2xl font-mono font-bold tabular-nums tracking-tighter" style={{ color: tc }}>
              {elapsed(ticket.secondsElapsed)}
            </div>
            {ticket.guestCount && (
              <div className="flex items-center gap-2 justify-end opacity-20">
                 <User size={12} />
                 <span className="text-[10px] font-bold text-white uppercase tracking-widest">{ticket.guestCount} CVRS</span>
              </div>
            )}
          </div>
        </div>

        {ticket.serverNote && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-500 leading-tight flex gap-2 relative z-10 animate-in zoom-in-95">
            <AlertTriangle size={14} className="shrink-0" /> {ticket.serverNote}
          </div>
        )}

        <div className="flex justify-start relative z-10">
          <div className={cn(
            "text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl border flex items-center gap-2 shadow-sm",
            isReady ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10' : 
            ticket.overallStatus === 'COOKING' ? 'text-amber-500 border-amber-500/20 bg-amber-500/10' : 
            'text-white/20 border-white/10 bg-white/[0.03]'
          )}>
            <div className={cn("w-1.5 h-1.5 rounded-full", isReady ? 'bg-emerald-500' : ticket.overallStatus === 'COOKING' ? 'bg-amber-500 animate-pulse' : 'bg-white/20')} />
            {ticket.overallStatus === 'READY' ? 'PASS READY' : ticket.overallStatus === 'COOKING' ? 'IN PRODUCTION' : 'PENDING FIRE'}
          </div>
        </div>
        
        {/* Modernist background texture */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-900/50">
        {ticket.stationBreakdown.map((station) => (
          <StationRow key={station.stationId} station={station} />
        ))}
      </div>

      <footer className="shrink-0 flex bg-slate-950 p-2" onClick={e => e.stopPropagation()}>
        <div className="flex-1 flex gap-2">
           <ActionBtn 
             icon={<Star size={14} />} 
             label={ticket.priority === "RUSH" ? "CLEAR" : "RUSH"} 
             active={ticket.priority === "RUSH"}
             color={ticket.priority === "RUSH" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-white/5 text-white/40 border-white/5 hover:text-white hover:bg-white/10"} 
             onClick={onRush} 
             disabled={!!actionLoading} 
           />
           <ActionBtn 
             icon={<Info size={14} />} 
             label="NOTE" 
             color="bg-white/5 text-primary border-white/5 hover:bg-primary/10 hover:border-primary/20" 
             onClick={onNote} 
           />
           {isReady ? (
             <ActionBtn 
               icon={<CheckCircle2 size={16} />} 
               label="FINISH" 
               color="bg-emerald-500 text-white shadow-[0_8px_20px_-4px_rgba(16,185,129,0.4)] hover:bg-emerald-400" 
               onClick={onClose} 
               disabled={!!actionLoading} 
             />
           ) : (
             <ActionBtn 
               icon={<X size={16} />} 
               label="VOID" 
               color="bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500 hover:text-white" 
               onClick={onVoid} 
               disabled={!!actionLoading} 
             />
           )}
        </div>
      </footer>
    </div>
  )
}

function StationRow({ station }: { station: ExpoStationStatus }) {
  const isDone = station.stationStatus === "ALL_DONE"
  const isInProgress = station.stationStatus === "IN_PROGRESS"
  return (
    <div className={cn(
      "p-5 border-b border-white/5 transition-all relative overflow-hidden group",
      isDone ? 'bg-emerald-500/[0.01] border-l-4 border-l-emerald-500/60' : 
      isInProgress ? 'bg-amber-500/[0.01] border-l-4 border-l-amber-500/60' : 'border-l-4 border-l-transparent'
    )}>
      <div className="flex justify-between items-center mb-3 relative z-10">
        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{station.stationName}</span>
        <div className={cn(
           "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest",
           isDone ? 'bg-emerald-500/10 text-emerald-500' : isInProgress ? 'bg-amber-500/10 text-amber-500 animate-pulse' : 'bg-white/5 text-white/10'
        )}>
          {isDone ? 'COMPLETE' : isInProgress ? 'FIRING' : 'IDLE'}
        </div>
      </div>
      <div className="space-y-2 relative z-10">
        {station.items.map((item) => (
          <div key={item.stationItemId} className={cn(
             "text-xs flex gap-3 transition-opacity", 
             item.status === "DONE" ? "opacity-10 line-through grayscale" : "text-white/70 font-bold"
          )}>
            <span className="font-mono tabular-nums opacity-30 text-xs">{item.quantity}×</span>
            <span className="flex-1 tracking-tight">{item.menuItemName}</span>
            {item.status === "IN_PROGRESS" && (
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 self-center shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ActionBtn({ 
  label, 
  icon,
  color, 
  onClick, 
  disabled,
  active 
}: { 
  label: string; 
  icon?: React.ReactNode;
  color: string; 
  onClick: () => void; 
  disabled?: boolean;
  active?: boolean 
}) {
  return (
    <button
      className={cn(
        "flex-1 h-12 flex flex-col items-center justify-center gap-1 rounded-2xl border transition-all duration-300 disabled:opacity-20 relative overflow-hidden",
        color
      )}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      disabled={disabled}
    >
      <div className="transition-transform group-hover:scale-110">{icon}</div>
      <span className="text-[8px] font-black uppercase tracking-[0.2em] leading-none pt-0.5">{label}</span>
      {active && <div className="absolute top-0 inset-x-0 h-[2px] bg-current" />}
    </button>
  )
}

function formatPrepTime(s: number): string {
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`
}
