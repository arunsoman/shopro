import React from 'react';
import { useRfqBids, useAwardBid } from '../hooks/useRFQ';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

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
    const { data: bids, isLoading } = useRfqBids(rfqId || '');
    const awardBid = useAwardBid();

    if (!rfqId) return null;

    const handleAward = async (bidId: string) => {
        try {
            await awardBid.mutateAsync(bidId);
            toast.success('Bid awarded successfully. Purchase Order generated.');
            onOpenChange?.(false);
        } catch (error) {
            toast.error('Failed to award bid');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        <DialogTitle>Review Vendor Bids: {rfqReference}</DialogTitle>
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
                            <p>No bids received yet for this RFQ.</p>
                            <p className="text-xs max-w-xs">Vendors have been notified and will submit quotes through the Supplier Portal.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead>Unit Price</TableHead>
                                    <TableHead>Qty Available</TableHead>
                                    <TableHead>Delivery ETA</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
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
                                                <DollarSign className="h-3 w-3" />
                                                {bid.unitPrice.toFixed(2)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {bid.quantityAvailable}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <Clock className="h-3.5 w-3.5 text-muted" />
                                                {new Date(bid.deliveryDate).toLocaleDateString()}
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
                                                {bid.status}
                                            </Badge>
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
                                                    Award
                                                </Button>
                                            ) : bid.status === 'WON' ? (
                                                <div className="flex items-center justify-end gap-1 text-emerald-500 text-xs font-semibold">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Awarded
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
                        <span>Awarding a bid will close the RFQ and automatically notify the vendor.</span>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
