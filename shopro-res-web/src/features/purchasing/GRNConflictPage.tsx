/**
 * GRNConflictPage.tsx
 * ─────────────────────────────────────────────────────────────────
 * Conflict Resolution Management — review and resolve flagged GRN lines
 */

import { useState } from 'react';
import { useAppStore } from '@/App';
import { ArrowLeft, AlertTriangle, CheckCircle2, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn, currency, formatDate } from '@/lib/utils';
import { useGRNConflicts, useResolveLineConflict } from './hooks/useGoodsReceipts';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';
import type { GoodsReceipt, GoodsReceiptLine } from '@/types/goodsReceipt.types';

export default function GRNConflictPage() {
  const back = useAppStore(s => s.back);
  const { user } = useAuthStore();
  const restaurantId = user?.restaurantId || 1;

  const { data: conflictGRNs = [], isLoading, refetch } = useGRNConflicts(restaurantId);
  const resolveConflict = useResolveLineConflict(restaurantId);
  const [resolving, setResolving] = useState<number | null>(null);

  const handleResolve = async (grnId: number, lineId: number, description: string) => {
    setResolving(lineId);
    try {
      await resolveConflict.mutateAsync({ grnId, lineId });
      toast.success('Conflict resolved', { description: `${description} has been cleared.` });
    } catch {
      toast.error('Failed to resolve conflict');
    } finally {
      setResolving(null);
    }
  };

  const totalConflictLines = conflictGRNs.reduce(
    (sum, grn) => sum + (grn.lines?.filter(l => l.hasConflict).length ?? 0), 0
  );

  return (
    <div className="absolute inset-0 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-10 space-y-8 mi-animate overflow-y-auto">

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => back()} className="h-10 w-10 rounded-xl border border-slate-200 dark:border-white/5 hover:bg-white dark:hover:bg-white/5 group shrink-0">
            <ArrowLeft size={18} className="text-muted-foreground/40 group-hover:-translate-x-1 transition-all" />
          </Button>
          <div>
            <span className="font-bold text-[10px] text-rose-500 uppercase tracking-[0.25em] italic">Dispute Management</span>
            <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tighter leading-none">Conflict Resolution</h1>
          </div>
        </div>
        <Button variant="outline" onClick={() => refetch()} className="h-12 px-5 rounded-2xl font-bold gap-2 border-slate-200 dark:border-white/10">
          <RefreshCw size={15} /> Refresh
        </Button>
      </header>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 px-2">
        {[
          { label: 'Open Disputes', val: conflictGRNs.length, color: 'text-rose-500' },
          { label: 'Conflict Lines', val: totalConflictLines, color: 'text-amber-500' },
          { label: 'GRNs Blocked', val: conflictGRNs.length, color: 'text-slate-500' },
        ].map(({ label, val, color }) => (
          <div key={label} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">{label}</p>
            <p className={cn('text-3xl font-black mt-1 tabular-nums', color)}>{val}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-rose-500" size={28} />
        </div>
      ) : conflictGRNs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl mx-2">
          <CheckCircle2 size={40} className="text-emerald-500 mb-4" />
          <p className="text-sm font-bold text-foreground">No active conflicts</p>
          <p className="text-xs text-muted-foreground/60 mt-1">All deliveries have been verified.</p>
        </div>
      ) : (
        <div className="space-y-6 px-2">
          {conflictGRNs.map((grn: GoodsReceipt) => {
            const conflictLines = grn.lines?.filter(l => l.hasConflict) ?? [];
            return (
              <div key={grn.id} className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-500/20 rounded-[2rem] overflow-hidden">

                {/* GRN header */}
                <div className="px-6 py-5 bg-rose-50/50 dark:bg-rose-500/5 border-b border-rose-100 dark:border-rose-500/10 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center text-rose-500">
                      <AlertCircle size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-foreground tracking-tight">GRN #{grn.id} · {grn.supplierName}</p>
                      <p className="text-[10px] text-muted-foreground/50">{formatDate(grn.receivedDate)} · PO #{grn.purchaseOrderId ?? '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border-none text-[9px] font-bold px-3">
                      {conflictLines.length} dispute{conflictLines.length > 1 ? 's' : ''}
                    </Badge>
                    <span className="text-sm font-black tabular-nums text-foreground">{currency(grn.totalAmount)}</span>
                  </div>
                </div>

                {/* Conflict lines */}
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {conflictLines.map((line: GoodsReceiptLine) => (
                    <div key={line.id} className="px-6 py-5 flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={13} className="text-rose-500 shrink-0" />
                          <p className="text-sm font-bold text-foreground">{line.ingredientDescription || `Ingredient #${line.ingredientId}`}</p>
                        </div>
                        <p className="text-xs text-muted-foreground/60">
                          Received: <strong>{line.receivedQty}</strong> · Unit price: {currency(line.unitPrice)}
                        </p>
                        {line.conflictReason && (
                          <div className="inline-flex items-start gap-2 mt-1 px-3 py-2 bg-rose-50 dark:bg-rose-500/10 rounded-xl">
                            <p className="text-[11px] text-rose-600 font-medium italic">"{line.conflictReason}"</p>
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleResolve(grn.id, line.id!, line.ingredientDescription || '')}
                        disabled={resolving === line.id}
                        className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shrink-0"
                      >
                        {resolving === line.id
                          ? <Loader2 size={14} className="animate-spin mr-1.5" />
                          : <CheckCircle2 size={14} className="mr-1.5" />}
                        Mark Resolved
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
