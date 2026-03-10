import React, { useState } from 'react';
import {
    Clock,
    Calendar,
    ArrowRight,
    Search,
    Filter,
    DollarSign,
    CheckCircle2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useSupplierAuth } from '@/features/auth/SupplierAuthContext';
import { useSupplierPortalRfqs, useSubmitPortalBid } from '../hooks/useSupplierPortal';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const SupplierRfqList: React.FC = () => {
    const { session } = useSupplierAuth();
    const { data: rfqs, isLoading } = useSupplierPortalRfqs(session?.supplierId);

    // Bidding State
    const [selectedRfq, setSelectedRfq] = useState<any>(null);
    const [bidData, setBidData] = useState({
        unitPrice: 0,
        quantityAvailable: 0,
        deliveryDate: format(new Date(), 'yyyy-MM-dd'),
        notes: ''
    });

    const submitBidMutation = useSubmitPortalBid(selectedRfq?.id || '', session?.userId || '');

    if (isLoading) return <div className="text-slate-500">Fetching active RFQs...</div>;

    const handleBidSubmit = async () => {
        try {
            await submitBidMutation.mutateAsync({
                supplierId: session?.supplierId || '',
                unitPrice: bidData.unitPrice,
                quantityAvailable: bidData.quantityAvailable,
                deliveryDate: bidData.deliveryDate,
                notes: bidData.notes
            });
            toast.success('Bid submitted successfully');
            setSelectedRfq(null);
        } catch (e) {
            toast.error('Failed to submit bid');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Search requests..." className="pl-10" />
                </div>
                <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                </Button>
            </div>

            <div className="grid gap-4">
                {rfqs?.length === 0 ? (
                    <Card className="border-dashed border-2 py-16 text-center text-slate-500">
                        <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-10" />
                        <p>No active Requests for Quotation at the moment.</p>
                        <p className="text-xs">We'll notify you when new opportunities match your catalog.</p>
                    </Card>
                ) : (
                    rfqs?.map(rfq => (
                        <Card key={rfq.id} className="hover:border-indigo-200 transition-colors shadow-sm dark:bg-slate-900 border-none">
                            <CardContent className="p-6">
                                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{rfq.ingredientName}</h3>
                                            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
                                                {rfq.requiredQty} units required
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-4 w-4" />
                                                Deadline: {format(new Date(rfq.bidDeadline), 'MMM d, HH:mm')}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-4 w-4" />
                                                Delivery by: {format(new Date(rfq.desiredDeliveryDate), 'MMM d, yyyy')}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Button
                                            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                                            onClick={() => {
                                                setSelectedRfq(rfq);
                                                setBidData({ ...bidData, quantityAvailable: rfq.requiredQty });
                                            }}
                                        >
                                            Submit Quote
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Bidding Dialog */}
            <Dialog open={!!selectedRfq} onOpenChange={() => setSelectedRfq(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Submit Quote for {selectedRfq?.ingredientName}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2">
                                    <DollarSign className="h-3 w-3" />
                                    Unit Price
                                </label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={bidData.unitPrice}
                                    onChange={e => setBidData({ ...bidData, unitPrice: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Qty Available</label>
                                <Input
                                    type="number"
                                    value={bidData.quantityAvailable}
                                    onChange={e => setBidData({ ...bidData, quantityAvailable: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Earliest Delivery</label>
                            <Input
                                type="date"
                                value={bidData.deliveryDate}
                                onChange={e => setBidData({ ...bidData, deliveryDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Logistics Notes (Optional)</label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Terms, shipping method, or constraints..."
                                value={bidData.notes}
                                onChange={e => setBidData({ ...bidData, notes: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedRfq(null)}>Review Later</Button>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                            disabled={submitBidMutation.isPending || !bidData.unitPrice}
                            onClick={handleBidSubmit}
                        >
                            {submitBidMutation.isPending ? 'Submitting...' : 'Confirm Quote'}
                            <CheckCircle2 className="h-4 w-4" />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const ClipboardList = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg>
);
