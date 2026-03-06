import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useRfq, useSubmitBid } from '../hooks/useRFQ';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Truck, DollarSign, Calendar, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export const VendorRFQPage: React.FC = () => {
    const { rfqId } = useParams<{ rfqId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const supplierId = searchParams.get('supplier') || '';

    const { data: rfq, isLoading: isRfqLoading, error: rfqError } = useRfq(rfqId || '');
    const submitBid = useSubmitBid(rfqId || '');

    const [formData, setFormData] = useState({
        unitPrice: 0,
        quantityAvailable: 0,
        deliveryDate: new Date().toISOString().split('T')[0],
        paymentTerms: 'NET30',
        notes: ''
    });

    const handleSubmit = async () => {
        if (!supplierId) {
            toast.error('Missing supplier authorization token');
            return;
        }

        try {
            await submitBid.mutateAsync({
                ...formData,
                supplierId
            });
            toast.success('Bid submitted successfully!');
        } catch (error) {
            toast.error('Failed to submit bid. Please check your inputs.');
        }
    };

    if (isRfqLoading) return (
        <div className="min-h-screen bg-muted/30 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground animate-pulse">Loading quotation details...</p>
            </div>
        </div>
    );

    if (rfqError || !rfq) return (
        <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
            <Card className="max-w-md w-full text-center">
                <CardContent className="pt-8 space-y-4">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                    <h2 className="text-xl font-bold">Invalid Quotation Link</h2>
                    <p className="text-muted-foreground">This quotation request may have expired or been cancelled. Please contact our procurement team for assistance.</p>
                    <Button variant="outline" onClick={() => navigate('/login')}>Return to Portal</Button>
                </CardContent>
            </Card>
        </div>
    );

    const isExpired = new Date(rfq.bidDeadline) < new Date();

    return (
        <div className="min-h-screen bg-muted/30 py-12 px-4">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <Truck className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Vendor Bidding Portal</h1>
                    <p className="text-muted-foreground">Shopro POS Procurement | Reference #{rfq.id.slice(0, 8)}</p>
                </div>

                {submitBid.isSuccess ? (
                    <Card className="border-emerald-500/20 bg-emerald-500/5">
                        <CardContent className="pt-6 text-center space-y-4">
                            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
                            <h2 className="text-xl font-bold text-foreground">Bid Submitted Successfully</h2>
                            <p className="text-muted-foreground">
                                Your quotation for <strong>{rfq.ingredientName}</strong> has been logged.
                                Our procurement team will contact you if your bid is awarded.
                            </p>
                            <Button variant="outline" onClick={() => window.location.reload()}>Submit Another</Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Custom Alert Implementation using Card as Alert is missing */}
                        <div className={`p-4 rounded-lg border flex gap-3 ${isExpired ? "border-destructive/20 bg-destructive/5 text-destructive" : "border-primary/20 bg-primary/5 text-primary"}`}>
                            <Info className="h-5 w-5 shrink-0" />
                            <div>
                                <p className="font-semibold">{isExpired ? 'Bidding Closed' : 'Quotation Required'}</p>
                                <p className="text-sm opacity-90">
                                    {isExpired
                                        ? "This RFQ has passed its deadline and is no longer accepting bids."
                                        : `Please submit your best price for ${rfq.requiredQty} units of ${rfq.ingredientName} by ${new Date(rfq.bidDeadline).toLocaleString()}.`}
                                </p>
                            </div>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Submit Your Quote</CardTitle>
                                <CardDescription>Enter your best unit pricing and earliest delivery availability.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Unit Price ($)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                step="0.01"
                                                className="pl-9"
                                                value={formData.unitPrice || ''}
                                                onChange={e => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
                                                disabled={isExpired}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Qty Available</label>
                                        <Input
                                            type="number"
                                            value={formData.quantityAvailable || ''}
                                            onChange={e => setFormData({ ...formData, quantityAvailable: parseFloat(e.target.value) })}
                                            disabled={isExpired}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Delivery Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                type="date"
                                                className="pl-9"
                                                value={formData.deliveryDate}
                                                onChange={e => setFormData({ ...formData, deliveryDate: e.target.value })}
                                                disabled={isExpired}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Payment Terms</label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                                            value={formData.paymentTerms}
                                            onChange={e => setFormData({ ...formData, paymentTerms: e.target.value })}
                                            disabled={isExpired}
                                        >
                                            <option value="NET30">Net 30</option>
                                            <option value="NET15">Net 15</option>
                                            <option value="CIA">Cash in Advance</option>
                                            <option value="COD">Cash on Delivery</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Notes / Comments</label>
                                    <textarea
                                        className="w-full h-24 p-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                                        placeholder="Add any specific delivery instructions or volume discounts..."
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        disabled={isExpired}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    disabled={submitBid.isPending || isExpired}
                                    onClick={handleSubmit}
                                >
                                    {submitBid.isPending ? 'Submitting...' : 'Submit Quotation'}
                                </Button>
                            </CardFooter>
                        </Card>
                    </>
                )}

                <div className="text-center">
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Secure vendor portal powered by Shopro POS. Unauthorized access prohibited.
                    </p>
                </div>
            </div>
        </div>
    );
};
