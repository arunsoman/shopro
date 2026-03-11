import React from 'react';
import type { POStatusHistory, PurchaseOrderStatus } from '../api/types';
import { Badge } from '@/components/ui/badge';
import { Clock, User, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface POStatusTimelineProps {
    history: POStatusHistory[];
}

export const POStatusTimeline: React.FC<POStatusTimelineProps> = ({ history }) => {
    if (!history || history.length === 0) {
        return <div className="text-muted text-sm py-4">No status history available.</div>;
    }

    const getStatusColor = (status: PurchaseOrderStatus) => {
        switch (status) {
            case 'APPROVED':
            case 'RECEIVED':
            case 'INVOICE_MATCHED':
                return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'REJECTED':
            case 'CANCELLED':
                return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'PENDING_APPROVAL':
            case 'COUNTER_OFFERED':
            case 'DISCREPANCY_REVIEW':
                return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'SENT':
            case 'ACKNOWLEDGED':
            case 'SHIPPED':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default:
                return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    return (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent">
            {history.map((event, index) => (
                <div key={event.id} className="relative flex items-start gap-6 pl-2">
                    <div className={`mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white ring-2 ${index === 0 ? 'ring-primary' : 'ring-slate-200'} z-10`}>
                        <div className={`h-2 w-2 rounded-full ${index === 0 ? 'bg-primary' : 'bg-slate-400'}`} />
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className={getStatusColor(event.toStatus)}>
                                    {event.toStatus.replace('_', ' ')}
                                </Badge>
                                {event.fromStatus && (
                                    <>
                                        <span className="text-muted text-xs">from</span>
                                        <Badge variant="outline" className="opacity-60">
                                            {event.fromStatus.replace('_', ' ')}
                                        </Badge>
                                    </>
                                )}
                            </div>
                            <time className="flex items-center gap-1.5 text-xs text-muted tabular-nums">
                                <Clock className="h-3 w-3" />
                                {format(new Date(event.createdAt), 'MMM dd, HH:mm')}
                            </time>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                                <User className="h-3.5 w-3.5 text-muted" />
                                {event.actorName}
                            </div>
                            {event.reason && (
                                <div className="flex items-start gap-1.5 rounded-md bg-muted/30 p-2 text-xs text-muted">
                                    <MessageSquare className="mt-0.5 h-3 w-3 shrink-0" />
                                    <span>{event.reason}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
