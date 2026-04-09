import { useState } from "react"
import type {
  ExpoQueue,
  ExpoTicket,
  CompletedTicket,
  StationDeviceStatus,
} from "../types/kds"
import { elapsed, timerColor } from "../utils/timer"
import { cn } from "@/lib/utils"
import { History, RotateCcw, AlertTriangle, CheckCircle2, Star, X, Info, Layers, User, MoreHorizontal, ChevronRight, Activity } from "lucide-react"
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

export default function ExpoTablet({
  data,
  completed,
  deviceStatus,
  connected,
  refresh,
  actions,
}: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [expandedStations, setExpandedStations] = useState<Set<string>>(new Set())
  const [confirmVoid, setConfirmVoid] = useState<number | null>(null)
  const [showDone, setShowDone] = useState(false)

  const { tickets, activeCount, ticketsOverAlert } = data
  const offlineCount = deviceStatus.filter((s) => !s.hasOnlineDevice).length

  function toggleExpand(ticketId: number) {
    setExpanded((prev) => {
      const n = new Set(prev)
      n.has(ticketId) ? n.delete(ticketId) : n.add(ticketId)
      return n
    })
  }

  function toggleStation(ticketId: number, stationId: number) {
    const key = `${ticketId}-${stationId}`
    setExpandedStations((prev) => {
      const n = new Set(prev)
      n.has(key) ? n.delete(key) : n.add(key)
      return n
    })
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-950 text-white overflow-hidden select-none font-sans antialiased">
      {/* Precision Header */}
      <header className="shrink-0 h-14 border-b border-white/5 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between z-30 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
                <Layers size={16} />
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] leading-none mb-1">
                   {data.outletName}
                </span>
                <span className="text-sm font-bold text-white tracking-tight">{activeCount} Validated Tickets</span>
             </div>
          </div>
          
          <div className="h-6 w-[1px] bg-white/5" />

          {ticketsOverAlert > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 animate-pulse">
               <AlertTriangle size={12} className="text-rose-500" />
               <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest leading-none pt-0.5">
                  {ticketsOverAlert} Critical
               </span>
            </div>
          )}
          
          {offlineCount > 0 && (
            <div className="flex items-center gap-2 text-[10px] font-bold text-amber-500/80 uppercase tracking-widest bg-amber-500/5 px-2 py-1 rounded-lg border border-amber-500/20">
              <Activity size={10} /> {offlineCount} OFFLINE
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setShowDone(s => !s)}
            className={cn(
              "h-10 px-5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
              showDone 
                ? 'bg-white text-slate-900 shadow-xl' 
                : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10 hover:text-white'
            )}
          >
            <History size={14} className="mr-2" />
            Archive ({completed.length})
          </Button>
          
          <Button 
            variant="ghost" size="icon"
            onClick={refresh}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90"
          >
            <RotateCcw size={18} />
          </Button>
          
          <div className="ml-2 flex items-center gap-3">
             <div className={cn("w-2 h-2 rounded-full", connected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]')} />
             <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{connected ? 'Live' : 'Disc'}</span>
          </div>
        </div>
      </header>

      {/* Primary Pass Grid */}
      <main className="flex-1 flex gap-4 p-5 overflow-x-auto overflow-y-hidden no-scrollbar bg-slate-950/20">
        {tickets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in-95 duration-700">
             <div className="w-24 h-24 rounded-3xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center text-white/5">
                <CheckCircle2 size={48} strokeWidth={1} />
             </div>
             <div className="text-center space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/20 italic">Command Center Cleared</p>
                <div className="px-6 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-[0.1em]">All Production Cycles Finalized</div>
             </div>
          </div>
        ) : (
          tickets.map((ticket) => (
            <CompactCard
              key={ticket.ticketId}
              ticket={ticket}
              isExpanded={expanded.has(ticket.ticketId)}
              expandedStations={expandedStations}
              onToggle={() => toggleExpand(ticket.ticketId)}
              onToggleStation={(sid) => toggleStation(ticket.ticketId, sid)}
              onRush={() =>
                ticket.priority === "RUSH"
                  ? actions.clearRush(ticket.ticketId)
                  : actions.rush(ticket.ticketId)
              }
              onClose={() => actions.closeTicket(ticket.ticketId)}
              onVoid={() => setConfirmVoid(ticket.ticketId)}
              onFireCourse={(n) => actions.fireCourse(ticket.ticketId, n)}
            />
          ))
        )}
      </main>

      {/* Archive Strip */}
      {showDone && (
        <footer className="h-44 shrink-0 border-t border-white/10 bg-black/60 backdrop-blur-2xl flex gap-4 p-4 overflow-x-auto no-scrollbar items-stretch animate-in slide-in-from-bottom-full duration-500 z-40">
           <div className="flex items-center px-2 text-[9px] font-bold text-white/20 uppercase tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 border-r border-white/5 mr-2 italic">
             Completion Records
           </div>
          {completed.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-white/10 text-[10px] font-bold uppercase tracking-[0.2em] italic">
              No recent finalized instances
            </div>
          ) : (
            completed.map((c) => (
              <div
                key={c.ticketId}
                className="w-48 shrink-0 flex flex-col justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/20 transition-all group active:scale-[0.98] shadow-2xl"
              >
                <div>
                    <div className="flex items-center justify-between">
                       <span className="text-2xl font-bold font-mono tracking-tighter text-white/40 group-hover:text-white transition-colors">
                         #{c.ticketNumber}
                       </span>
                       <div className="flex items-center gap-1.5 opacity-20 group-hover:opacity-100 transition-opacity">
                          <CheckCircle2 size={12} className="text-emerald-500" />
                          <span className="text-[9px] font-bold uppercase text-emerald-500">Done</span>
                       </div>
                    </div>
                    <div className="text-[10px] font-bold text-white/10 group-hover:text-white/40 transition-colors mt-2 uppercase tracking-widest tabular-nums">
                      {formatPrepTime(c.prepTimeSeconds)} Cycle Time
                    </div>
                </div>
                {c.canRecall && (
                  <button
                    onClick={() => actions.recallTicket(c.ticketId)}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-primary hover:text-white hover:border-transparent border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40 transition-all active:scale-95 shadow-none hover:shadow-lg hover:shadow-primary/20"
                  >
                    Recall Ticket
                  </button>
                )}
              </div>
            ))
          )}
        </footer>
      )}

      {/* Terminal Confirmation Modals */}
      {confirmVoid !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setConfirmVoid(null)}>
          <div className="w-full max-w-sm p-8 rounded-[2.5rem] bg-slate-900 border border-white/10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center space-y-4">
               <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20 shadow-inner">
                  <X size={32} />
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-bold text-rose-500/60 uppercase tracking-[0.2em] italic">Terminal Deletion Authorized</p>
                  <h3 className="text-2xl font-bold text-white tracking-tight leading-none">
                    Void Ticket #{tickets.find((t) => t.ticketId === confirmVoid)?.ticketNumber}?
                  </h3>
               </div>
               <p className="text-[13px] font-medium text-white/40 leading-relaxed px-4">This action will flush the verification cycle and alert the originating station.</p>
            </div>
            
            <div className="space-y-4">
               <div className="relative group">
                  <Info className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-rose-500 transition-colors" size={14} />
                  <input
                    id="tvr"
                    autoFocus
                    placeholder="Mandatory Audit Reason..."
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm font-bold tracking-tight text-white placeholder:text-white/10 placeholder:font-bold placeholder:uppercase focus:outline-none focus:border-rose-500/50 transition-all border-dashed"
                  />
               </div>
               
               <div className="flex gap-4">
                 <Button 
                   variant="ghost"
                   className="flex-1 h-14 rounded-2xl border border-white/5 font-bold text-[10px] uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5" 
                   onClick={() => setConfirmVoid(null)}
                 >
                   Keep Ticket
                 </Button>
                 <Button
                   variant="destructive"
                   className="flex-1 h-14 rounded-2xl bg-rose-600 hover:bg-rose-500 font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-rose-900/40 active:scale-95"
                   onClick={async () => {
                     const r = (document.getElementById("tvr") as HTMLInputElement).value
                     await actions.voidTicket(confirmVoid!, r)
                     setConfirmVoid(null)
                   }}
                 >
                   Authorize Void
                 </Button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CompactCard({
  ticket, isExpanded, expandedStations,
  onToggle, onToggleStation, onRush, onClose, onVoid,
}: {
  ticket: ExpoTicket
  isExpanded: boolean
  expandedStations: Set<string>
  onToggle: () => void
  onToggleStation: (sid: number) => void
  onRush: () => void
  onClose: () => void
  onVoid: () => void
  onFireCourse: (n: number) => void
}) {
  const isAlert = ticket.secondsElapsed >= 480
  const isReady = ticket.overallStatus === "READY"
  const isRush = ticket.priority === "RUSH"
  const tc = timerColor(ticket.secondsElapsed, 300, 480)
  
  const borderColor = isReady
    ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
    : isAlert
    ? "border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse"
    : isRush
    ? "border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
    : "border-white/10"

  return (
    <div
      className={cn(
        "shrink-0 flex flex-col bg-slate-900 rounded-3xl overflow-hidden border-2 transition-all duration-500 relative",
        isExpanded ? 'w-64' : 'w-48',
        borderColor
      )}
    >
       {isRush && (
         <div className="absolute top-0 right-0 p-2 z-10">
            <div className="bg-amber-500 p-1.5 rounded-lg shadow-xl animate-bounce">
               <Star size={12} className="text-black fill-black" strokeWidth={3} />
            </div>
         </div>
       )}

      {/* Card Body — tap to expand */}
      <div
        onClick={onToggle}
        className={cn(
          "p-5 border-b border-white/5 cursor-pointer flex-shrink-0 transition-colors relative z-0",
          isReady ? 'bg-emerald-500/[0.03]' : ''
        )}
      >
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="text-3xl font-black font-mono tracking-tighter text-white/90 leading-none">
              #{ticket.ticketNumber}
            </div>
            {ticket.guestCount && (
              <div className="flex items-center gap-1.5 mt-2">
                 <User size={10} className="text-white/20" />
                 <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">{ticket.guestCount} CVRS</span>
              </div>
            )}
          </div>
          <div className="text-right space-y-2">
            <div className="text-xl font-mono font-bold tabular-nums tracking-tighter" style={{ color: tc }}>
              {elapsed(ticket.secondsElapsed)}
            </div>
            <div className={cn(
               "text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-lg border inline-block leading-none",
               isReady ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10' : 
               ticket.overallStatus === 'COOKING' ? 'text-amber-500 border-amber-500/20 bg-amber-500/10' : 
               'text-white/10 border-white/5 bg-white/5'
            )}>
              {ticket.overallStatus}
            </div>
          </div>
        </div>
        {ticket.serverNote && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-500 leading-tight flex gap-2">
            <AlertTriangle size={14} className="shrink-0" /> {ticket.serverNote}
          </div>
        )}
      </div>

      {/* Production Breakdown */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-900/50">
        {ticket.stationBreakdown.map((station) => {
          const key = `${ticket.ticketId}-${station.stationId}`
          const stExpanded = expandedStations.has(key)
          const isDone = station.stationStatus === "ALL_DONE"
          const isInProgress = station.stationStatus === "IN_PROGRESS"
          
          return (
            <div
              key={station.stationId}
              onClick={() => onToggleStation(station.stationId)}
              className={cn(
                 "p-4 border-b border-white/5 cursor-pointer transition-all border-l-4",
                 isDone ? 'border-l-emerald-500 bg-emerald-500/[0.02]' : 
                 isInProgress ? 'border-l-amber-500 bg-amber-500/[0.02]' : 'border-l-transparent'
              )}
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                  {station.stationName}
                </span>
                <span className={cn(
                   "flex items-center justify-center w-5 h-5 rounded-md text-xs font-bold",
                   isDone ? 'bg-emerald-500/10 text-emerald-500' : isInProgress ? 'bg-amber-500/10 text-amber-500' : 'bg-white/5 text-white/10'
                )}>
                  {isDone ? "✓" : isInProgress ? "…" : <div className="w-1.5 h-1.5 rounded-full bg-white/10" />}
                </span>
              </div>
              {(isExpanded || stExpanded) && (
                <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-300">
                  {station.items.map((item) => (
                    <div
                      key={item.stationItemId}
                      className={cn(
                         "text-[12px] leading-tight flex gap-3 items-start",
                         item.status === "DONE" ? "text-white/10 line-through" : "text-white/70 font-bold"
                      )}
                    >
                      <span className="font-mono tabular-nums opacity-40 shrink-0">{item.quantity}×</span>
                      <span className="tracking-tight">{item.menuItemName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Critical Actions */}
      <div className="shrink-0 flex border-t border-white/5 bg-black/40 h-14" onClick={e => e.stopPropagation()}>
        <button
          className={cn(
             "flex-1 flex items-center justify-center border-r border-white/5 hover:bg-white/5 transition-all active:scale-[0.8] relative group",
             ticket.priority === "RUSH" ? "text-amber-500" : "text-white/10"
          )}
          onClick={(e) => { e.stopPropagation(); onRush(); }}
        >
          <Star size={20} className={cn(ticket.priority === "RUSH" ? "fill-amber-500" : "")} />
          <span className="absolute bottom-2 text-[8px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">Rush</span>
        </button>

        {isReady ? (
          <button
             className="flex-[2] flex items-center justify-center gap-2 bg-emerald-500 text-slate-900 hover:bg-emerald-400 transition-colors active:scale-[0.98] group"
             onClick={(e) => { e.stopPropagation(); onClose(); }}
          >
             <CheckCircle2 size={24} strokeWidth={3} className="transition-transform group-hover:scale-110" />
             <span className="text-[11px] font-black uppercase tracking-[0.2em]">Validated OK</span>
          </button>
        ) : (
          <button
             className="flex-[2] flex items-center justify-center gap-2 hover:bg-rose-500/10 text-rose-500 transition-all active:scale-[0.98] group"
             onClick={(e) => { e.stopPropagation(); onVoid(); }}
          >
             <X size={20} strokeWidth={3} className="opacity-40 group-hover:opacity-100 transition-opacity" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100">Abort Cycle</span>
          </button>
        )}
        
        <button className="flex-1 flex items-center justify-center border-l border-white/5 text-white/5 hover:text-white/20 transition-all active:scale-[0.8]">
           <MoreHorizontal size={20} />
        </button>
      </div>
    </div>
  )
}

function formatPrepTime(s: number): string {
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`
}
