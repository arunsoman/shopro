import React, { useMemo } from 'react';
import type { PurchaseOrder, PurchaseOrderStatus } from '../api/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Truck, CheckCircle, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PurchaseOrderKanbanProps {
    orders: PurchaseOrder[];
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
}

const COLUMNS: { id: PurchaseOrderStatus; translationKey: string; icon: React.ReactNode; color: string }[] = [
    { id: 'PENDING_APPROVAL', translationKey: 'pendingApproval', icon: <Clock className="w-4 h-4" />, color: 'bg-warning/10 text-warning border-warning/20' },
    { id: 'APPROVED', translationKey: 'approved', icon: <CheckCircle className="w-4 h-4" />, color: 'bg-success/10 text-success border-success/20' },
    { id: 'SENT', translationKey: 'dispatched', icon: <Truck className="w-4 h-4" />, color: 'bg-primary/10 text-primary border-primary/20' },
    { id: 'ACKNOWLEDGED', translationKey: 'acknowledged', icon: <Package className="w-4 h-4" />, color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20' },
];

export const PurchaseOrderKanban: React.FC<PurchaseOrderKanbanProps> = ({ orders, onApprove, onReject }) => {
    const { t, i18n } = useTranslation();
    const groupedOrders = useMemo(() => {
        const acc: Record<string, PurchaseOrder[]> = {
            'PENDING_APPROVAL': [],
            'APPROVED': [],
            'SENT': [],
            'ACKNOWLEDGED': [],
        };
        orders.forEach(order => {
            if (acc[order.status]) {
                acc[order.status].push(order);
            }
        });
        return acc;
    }, [orders]);

    return (
        <div className="flex gap-6 overflow-x-auto pb-4 pt-1 h-[calc(100vh-200px)]">
            {COLUMNS.map(column => (
                <div key={column.id} className="min-w-[320px] max-w-[320px] flex flex-col bg-muted/5 border border-border rounded-xl overflow-hidden">
                    {/* Column Header */}
                    <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
                        <div className="flex items-center gap-2 font-medium text-foreground">
                            <span className={`p-1.5 rounded-md ${column.color.split(' ')[0]} ${column.color.split(' ')[1]}`}>
                                {column.icon}
                            </span>
                            <span>{t(`inventory.po.kanban.${column.translationKey}`)}</span>
                        </div>
                        <Badge variant="secondary" className="bg-muted/20 text-muted-foreground font-mono border-border">
                            {groupedOrders[column.id].length}
                        </Badge>
                    </div>

                    {/* Column Content */}
                    <div className="p-4 flex-1 overflow-y-auto space-y-4">
                        {groupedOrders[column.id].map(order => (
                            <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow border-border bg-surface">
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-mono text-muted">#{order.id.split('-')[0]}</span>
                                        <span className="text-sm font-semibold text-foreground">
                                            {t('common.currencySymbol')}{order.totalValue.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <CardTitle className="text-base text-foreground line-clamp-1">
                                        {order.supplierName}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="text-sm text-muted mb-3 line-clamp-2">
                                        {t('inventory.po.kanban.itemCount', { count: order.items.length })} • {order.items.map(i => i.ingredientName).join(', ')}
                                    </div>

                                    <div className="text-xs text-muted/60 mb-3 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {order.expectedDeliveryDate 
                                            ? t('inventory.po.kanban.expectedDate', { date: new Date(order.expectedDeliveryDate).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric', year: 'numeric' }) }) 
                                            : t('common.tbd')}
                                    </div>

                                    {column.id === 'PENDING_APPROVAL' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onApprove?.(order.id)}
                                                className="flex-1 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium rounded-md transition-colors shadow-sm"
                                            >
                                                {t('common.approve')}
                                            </button>
                                            <button
                                                onClick={() => onReject?.(order.id)}
                                                className="flex-1 py-1.5 bg-muted/20 hover:bg-muted/30 text-foreground text-xs font-medium rounded-md transition-colors border border-border"
                                            >
                                                {t('common.reject')}
                                            </button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}

                        {groupedOrders[column.id].length === 0 && (
                            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                                <div className="w-12 h-12 rounded-full bg-muted/10 flex items-center justify-center mb-3">
                                    <Package className="w-6 h-6 text-muted/30" />
                                </div>
                                <p className="text-sm text-muted">{t('inventory.po.kanban.noOrders')}</p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
