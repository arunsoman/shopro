import React from 'react';
import { useRfqBids, useAwardBid } from '../hooks/useRFQ';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface ReviewBidsDialogProps {
    rfqId?: string;
    rfqReference?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export const ReviewBidsDialog: React.FC<ReviewBidsDialogProps> = ({
    rfqId,
    rfqReference,
    open,
    onOpenChange
}) => {
    const { t, i18n } = useTranslation();
    const { data: bids, isLoading } = useRfqBids(rfqId || '');
    const awardBid = useAwardBid();

    if (!rfqId) return null;

    const handleAward = async (bidId: string) => {
        try {
            await awardBid.mutateAsync(bidId);
            toast.success(t('inventory.bids.awardSuccess'));
            onOpenChange?.(false);
        } catch (error) {
            toast.error(t('inventory.bids.awardError'));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        <DialogTitle>{t('inventory.bids.reviewTitle', { ref: rfqReference })}</DialogTitle>
                    </div>
                </DialogHeader>

                <div className="py-4">
                    {isLoading ? (
                        <div className="h-48 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                    ) : !bids?.length ? (
                        <div className="h-48 flex flex-col items-center justify-center text-muted gap-2 text-center">
                            <Clock className="h-8 w-8 opacity-20" />
                            <p>{t('inventory.bids.noBids')}</p>
                            <p className="text-xs max-w-xs">{t('inventory.bids.vendorNotification')}</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('inventory.bids.supplier')}</TableHead>
                                    <TableHead>{t('inventory.bids.unitPrice')}</TableHead>
                                    <TableHead>{t('inventory.bids.qtyAvailable')}</TableHead>
                                    <TableHead>{t('inventory.bids.deliveryEta')}</TableHead>
                                    <TableHead>{t('inventory.bids.status')}</TableHead>
                                    <TableHead>{t('inventory.rfq.table.score')}</TableHead>
                                    <TableHead className="text-right">{t('inventory.bids.action')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bids.map((bid) => (
                                    <TableRow key={bid.id}>
                                        <TableCell>
                                            <div className="font-semibold text-foreground">{bid.supplierName}</div>
                                            {bid.notes && <div className="text-xs text-muted truncate max-w-[200px]">{bid.notes}</div>}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 font-mono text-emerald-500">
                                                <span className="text-sm">{t('common.currencySymbol')}</span>
                                                {bid.unitPrice.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {bid.quantityAvailable.toLocaleString(i18n.language)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <Clock className="h-3.5 w-3.5 text-muted" />
                                                {new Date(bid.deliveryDate).toLocaleDateString(i18n.language)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant="outline"
                                                className={
                                                    bid.status === 'WON' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                    bid.status === 'LOST' || bid.status === 'REJECTED' ? "bg-error/10 text-error border-error/20" :
                                                    "bg-primary/10 text-primary border-primary/20"
                                                }
                                             >
                                                 {t(`inventory.bids.statuses.${bid.status}`, { defaultValue: bid.status })}
                                             </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1 w-24">
                                                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                                    <span>{t('inventory.rfq.table.score')}</span>
                                                    <span>{bid.score || 0} {t('common.points')}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${bid.status === 'WON' ? 'bg-emerald-500' : 'bg-primary'}`} 
                                                        style={{ width: `${bid.score || 0}%` }} 
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {bid.status === 'SUBMITTED' ? (
                                                <Button 
                                                    size="sm" 
                                                    variant="secondary"
                                                    className="gap-2"
                                                    onClick={() => handleAward(bid.id)}
                                                    disabled={awardBid.isPending}
                                                >
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    {t('inventory.bids.award')}
                                                </Button>
                                            ) : bid.status === 'WON' ? (
                                                <div className="flex items-center justify-end gap-1 text-emerald-500 text-xs font-semibold">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    {t('inventory.bids.awarded')}
                                                </div>
                                            ) : null}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                <DialogFooter className="sm:justify-start">
                    <div className="flex items-center gap-2 text-xs text-muted">
                        <AlertCircle className="h-4 w-4" />
                        <span>{t('inventory.bids.awardWarning')}</span>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

