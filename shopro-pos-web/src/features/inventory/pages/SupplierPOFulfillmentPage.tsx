import React, { useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Package,
    Truck,
    FileText,
    CheckCircle2,
    ArrowLeft,
    Upload,
    Info,
    AlertCircle,
    Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import {
    useSupplierPortalPOs,
    useAcknowledgeOrder,
    useShipOrder,
    useCounterOffer
} from '../hooks/useSupplierPortal';
import { useSupplierAuth } from '@/features/auth/SupplierAuthContext';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const SupplierPOFulfillmentPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { session } = useSupplierAuth();
    const { data: pos, isLoading } = useSupplierPortalPOs(session?.supplierId);

    const acknowledgeMutation = useAcknowledgeOrder();
    const shipMutation = useShipOrder();
    const counterOfferMutation = useCounterOffer();

    const [trackingNumber, setTrackingNumber] = useState('');
    const [deliveryNoteRef, setDeliveryNoteRef] = useState('');
    const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isCounterDialogOpen, setIsCounterDialogOpen] = useState(false);
    const [counterOfferData, setCounterOfferData] = useState({
        proposedPrice: 0,
        proposedQuantity: 0,
        reason: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const po = pos?.find(p => p.id === id);

    if (isLoading) return <div className="p-8 text-center animate-pulse">Loading order details...</div>;
    if (!po) return (
        <div className="p-8 text-center">
            <div className=" mx-auto p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 rounded-lg text-left">
                <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="font-bold text-red-700 dark:text-red-400">Error</span>
                </div>
                <p className="text-sm text-red-600 dark:text-red-300">Purchase Order not found or not assigned to your organization.</p>
            </div>
            <Button variant="link" asChild className="mt-4">
                <Link to="/supplier/dashboard">Return to Dashboard</Link>
            </Button>
        </div>
    );

    const handleAcknowledge = async () => {
        if (!session?.userId || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await acknowledgeMutation.mutateAsync({ id: po.id, userId: session.userId });
            toast.success("PO Acknowledged", {
                description: "The restaurant has been notified that you are processing the order.",
            });
        } catch {
            toast.error("Failed to acknowledge. Error details sent to support.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCounterOffer = async () => {
        if (!session?.userId || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await counterOfferMutation.mutateAsync({
                id: po.id,
                userId: session.userId,
                request: counterOfferData
            });
            toast.success("Counter-Offer Submitted", {
                description: "The staff will review your changes and respond shortly.",
            });
            setIsCounterDialogOpen(false);
            navigate('/supplier/dashboard');
        } catch {
            toast.error("Failed to submit counter-offer.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleShip = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (!trackingNumber) {
            toast.error("Please enter a tracking number.");
            return;
        }
        if (!invoiceFile) {
            toast.error("Please upload a commercial invoice.");
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Upload the file first
            const formData = new FormData();
            formData.append('file', invoiceFile);

            const uploadRes = await apiClient.post<{ fileId: string }>('/documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const fileId = uploadRes.data.fileId;

            // 2. Submit shipment with the real fileId
            await shipMutation.mutateAsync({
                id: po.id,
                userId: session?.userId || '',
                request: {
                    trackingNumber,
                    deliveryNoteRef,
                    invoiceFileId: fileId
                }
            });

            toast.success("Order Shipped", {
                description: "Fulfillment details and invoice have been sent to the restaurant.",
            });
            navigate('/supplier/dashboard');
        } catch (error) {
            console.error("Shipping failed", error);
            toast.error("Shipping Failed: Could not upload invoice or update order status.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Fulfill Order #{po.id.slice(0, 8)}</h1>
                        <p className="text-slate-500 font-medium">Manage acknowledgment, shipping, and invoicing</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                    <div className={`h-2 w-2 rounded-full ${po.status === 'SENT' ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`} />
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        {po.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Package className="h-5 w-5 text-indigo-500" />
                                Line Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50/20 dark:bg-slate-900/40 text-slate-500 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-semibold">Ingredient</th>
                                        <th className="px-6 py-3 text-right font-semibold">Quantity</th>
                                        <th className="px-6 py-3 text-right font-semibold">Unit Cost</th>
                                        <th className="px-6 py-3 text-right font-semibold">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {po.items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium">{item.ingredientName}</td>
                                            <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">
                                                {item.orderedQty}
                                            </td>
                                            <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">
                                                ${Number(item.unitCost || 0).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold">
                                                ${(Number(item.orderedQty || 0) * Number(item.unitCost || 0)).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-slate-50/30 dark:bg-slate-900/60 font-bold border-t">
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-right text-slate-500 text-xs uppercase tracking-widest">Grand Total</td>
                                        <td className="px-6 py-4 text-right text-lg text-indigo-600 dark:text-indigo-400">
                                            ${Number(po.totalValue || 0).toFixed(2)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </CardContent>
                    </Card>

                    {['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'].includes(po.status) && (
                        <Card className="border-amber-100 bg-amber-50/30 dark:bg-amber-950/10">
                            <CardContent className="p-8">
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="p-4 bg-amber-100 dark:bg-amber-900/40 rounded-full">
                                        <Clock className="h-8 w-8 text-amber-600" />
                                    </div>
                                    <div className="space-y-2 text-center md:text-left">
                                        <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100">
                                            {po.status === 'REJECTED' ? 'Order Rejected' : 'Order Finalization in Progress'}
                                        </h3>
                                        <p className="text-sm text-amber-700/70 dark:text-amber-300/60 leading-relaxed max-w-2xl">
                                            {po.status === 'REJECTED'
                                                ? "This Purchase Order has been rejected by the restaurant management and will not be fulfilled."
                                                : "The restaurant is currently finalizing the official Purchase Order document and approval workflow. You will be able to acknowledge and ship this order once it is officially SENT to you."}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {po.status === 'SENT' && (
                        <Card className="border-indigo-100 bg-indigo-50/30 dark:bg-indigo-950/10 shadow-lg shadow-indigo-500/5">
                            <CardContent className="p-8">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-100">Step 1: Acknowledge Receipt</h3>
                                        <p className="text-sm text-indigo-700/70 dark:text-indigo-300/60 leading-relaxed">
                                            Inform the restaurant that you have received this Purchase Order and are preparing it for shipment.
                                        </p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                        <Button
                                            variant="outline"
                                            className="px-6 border-indigo-200 text-indigo-700 hover:bg-indigo-100/50"
                                            onClick={() => {
                                                setCounterOfferData({
                                                    proposedPrice: po.totalValue / (po.items.length || 1),
                                                    proposedQuantity: po.items.map(i => i.orderedQty).reduce((a, b) => a + b, 0),
                                                    reason: ''
                                                });
                                                setIsCounterDialogOpen(true);
                                            }}
                                        >
                                            Negotiate Changes
                                        </Button>
                                        <Button
                                            className="px-8 h-12 text-md font-bold shadow-indigo-200/50 bg-indigo-600 hover:bg-indigo-700"
                                            onClick={handleAcknowledge}
                                            disabled={acknowledgeMutation.isPending || isSubmitting}
                                        >
                                            {acknowledgeMutation.isPending || isSubmitting ? 'Processing...' : 'Acknowledge Now'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {po.status === 'ACKNOWLEDGED' && (
                        <Card className="border-none shadow-sm overflow-hidden">
                            <CardHeader className="border-b">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-indigo-500" />
                                    Step 2: Shipping & Invoicing
                                </CardTitle>
                                <CardDescription>Enter delivery details and upload your commercial invoice.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <form onSubmit={handleShip} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <Label htmlFor="tracking" className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                                                Tracking Number
                                            </Label>
                                            <Input
                                                id="tracking"
                                                placeholder="e.g. FEDEX-4921-992"
                                                className="h-11 bg-slate-50 border-slate-200 focus:ring-indigo-500"
                                                value={trackingNumber}
                                                onChange={(e) => setTrackingNumber(e.target.value)}
                                                required
                                            />
                                            <p className="text-[10px] text-slate-400 italic">Enter the carrier provides tracking ID for this shipment.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="delivery-note" className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                                                Delivery Note Ref (Optional)
                                            </Label>
                                            <Input
                                                id="delivery-note"
                                                placeholder="e.g. DN-2024-X8"
                                                className="h-11 bg-slate-50 border-slate-200"
                                                value={deliveryNoteRef}
                                                onChange={(e) => setDeliveryNoteRef(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-sm font-semibold uppercase tracking-wider text-slate-500">Commercial Invoice (PDF)</Label>
                                        <input
                                            type="file"
                                            accept=".pdf,image/*"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
                                        />
                                        <div
                                            className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors group cursor-pointer ${invoiceFile ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400'}`}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <div className="flex flex-col items-center gap-3">
                                                <div className={`p-4 rounded-full transition-transform ${invoiceFile ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-500 group-hover:scale-110'}`}>
                                                    {invoiceFile ? <FileText className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-bold ${invoiceFile ? 'text-indigo-700 dark:text-indigo-300' : ''}`}>
                                                        {invoiceFile ? invoiceFile.name : 'Drop your invoice here'}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {invoiceFile ? `${(invoiceFile.size / 1024 / 1024).toFixed(2)} MB` : 'or click to browse from files'}
                                                    </p>
                                                </div>
                                                {!invoiceFile && <Button type="button" variant="outline" size="sm" className="mt-2" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Select File</Button>}
                                            </div>
                                        </div>
                                        <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/40 rounded-lg p-4 mt-4 flex gap-3">
                                            <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                                Upload your invoice to trigger a payment requisition on the restaurant side.
                                            </p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-end gap-4 pt-4">
                                        <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
                                        <Button
                                            type="submit"
                                            className="px-10 h-11 text-md font-bold shadow-lg shadow-indigo-500/20"
                                            disabled={shipMutation.isPending || isSubmitting}
                                        >
                                            {shipMutation.isPending || isSubmitting ? 'Submitting...' : 'Mark as Shipped'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {po.status === 'SHIPPED' && (
                        <Card className="border-indigo-100 bg-indigo-50/30 dark:bg-indigo-950/10">
                            <CardContent className="p-8">
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="p-4 bg-indigo-100 dark:bg-indigo-900/40 rounded-full">
                                        <Truck className="h-8 w-8 text-indigo-600" />
                                    </div>
                                    <div className="space-y-2 text-center md:text-left">
                                        <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-100">Order is in Transit</h3>
                                        <p className="text-sm text-indigo-700/70 dark:text-indigo-300/60 leading-relaxed max-w-2xl">
                                            You have successfully marked this order as SHIPPED. The restaurant is awaiting delivery and will perform a 3-way match once received. No further action is required from you at this time.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {['RECEIVED', 'PARTIALLY_RECEIVED', 'INVOICE_MATCHED', 'PAID', 'CLOSED'].includes(po.status) && (
                        <Card className="border-emerald-100 bg-emerald-50/30 dark:bg-emerald-950/10">
                            <CardContent className="p-8">
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="p-4 bg-emerald-100 dark:bg-emerald-900/40 rounded-full">
                                        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                                    </div>
                                    <div className="space-y-2 text-center md:text-left">
                                        <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">Order Fulfilled</h3>
                                        <p className="text-sm text-emerald-700/70 dark:text-emerald-300/60 leading-relaxed max-w-2xl">
                                            This order has been received and processed by the restaurant.
                                            {po.status === 'PAID' || po.status === 'CLOSED' ? " Payment has been settled." : " It is now in the payment processing queue."}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card className="border-none shadow-sm dark:bg-slate-900">
                        <CardHeader className="pb-4 border-b">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Order Context</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">Created At</span>
                                <span className="text-sm font-medium">
                                    {po.createdAt ? format(new Date(po.createdAt), 'MMM d, yyyy') : 'N/A'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">Expected Delivery</span>
                                <span className="text-sm font-medium">{po.expectedDeliveryDate ? format(new Date(po.expectedDeliveryDate), 'MMM d, yyyy') : 'Asap'}</span>
                            </div>
                            <div className="flex items-center justify-between border-t pt-4">
                                <span className="text-sm text-slate-500">Total Award Value</span>
                                <span className="text-lg font-bold text-slate-900 dark:text-slate-50">
                                    ${Number(po.totalValue || 0).toFixed(2)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm dark:bg-slate-900 bg-slate-50/30">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Next Steps</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-24px)] before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">

                                {/* Step 1: Acknowledge */}
                                <div className={`relative pl-10 ${['DRAFT', 'PENDING_APPROVAL', 'APPROVED'].includes(po.status) ? 'opacity-50' : ''}`}>
                                    <div className={`absolute left-0 top-0 h-6 w-6 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center ${['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT'].includes(po.status) ? (po.status === 'SENT' ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 'bg-slate-300 dark:bg-slate-700') : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'}`}>
                                        <CheckCircle2 className="h-4 w-4 text-white" />
                                    </div>
                                    <p className="text-sm font-bold">Acknowledge Order</p>
                                    <p className="text-xs text-slate-500 mt-1">Confirms you've seen the request.</p>
                                </div>

                                {/* Step 2: Ship & Invoice */}
                                <div className={`relative pl-10 ${['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT'].includes(po.status) ? 'opacity-50' : ''}`}>
                                    <div className={`absolute left-0 top-0 h-6 w-6 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center ${['ACKNOWLEDGED'].includes(po.status) ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]' : ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT'].includes(po.status) ? 'bg-slate-200 dark:bg-slate-800' : 'bg-emerald-500'}`}>
                                        {['SHIPPED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'INVOICE_MATCHED', 'PAID', 'CLOSED'].includes(po.status) ? <CheckCircle2 className="h-4 w-4 text-white" /> : <Truck className="h-3 w-3 text-white" />}
                                    </div>
                                    <p className="text-sm font-bold">Ship & Invoice</p>
                                    <p className="text-xs text-slate-500 mt-1">Provide tracking and bill the restaurant.</p>
                                </div>

                                {/* Step 3: Payment Processing */}
                                <div className={`relative pl-10 ${['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'ACKNOWLEDGED'].includes(po.status) ? 'opacity-50' : ''}`}>
                                    <div className={`absolute left-0 top-0 h-6 w-6 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center ${['SHIPPED'].includes(po.status) ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]' : ['RECEIVED', 'INVOICE_MATCHED', 'PAID', 'CLOSED'].includes(po.status) ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}>
                                        {['RECEIVED', 'INVOICE_MATCHED', 'PAID', 'CLOSED'].includes(po.status) ? <CheckCircle2 className="h-4 w-4 text-white" /> : <FileText className="h-3 w-3 text-white" />}
                                    </div>
                                    <p className="text-sm font-bold">Payment Processing</p>
                                    <p className="text-xs text-slate-500 mt-1">Restaurant reviews delivery and invoice.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Negotiation / Counter-Offer Dialog */}
            <Dialog open={isCounterDialogOpen} onOpenChange={setIsCounterDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Submit Counter-Offer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex gap-3 text-xs text-amber-800">
                            <Info className="h-4 w-4 shrink-0" />
                            <p>Proposing changes will move the order to "Negotiation" status. The restaurant must approve these changes before you can ship.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Proposed Unit Cost (Avg)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={counterOfferData.proposedPrice}
                                    onChange={e => setCounterOfferData({ ...counterOfferData, proposedPrice: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Total Quantity</Label>
                                <Input
                                    type="number"
                                    value={counterOfferData.proposedQuantity}
                                    onChange={e => setCounterOfferData({ ...counterOfferData, proposedQuantity: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Reason for Adjustment</Label>
                            <textarea
                                placeholder="e.g. Current market price surge, Partial stock availability..."
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={counterOfferData.reason || ''}
                                onChange={e => setCounterOfferData({ ...counterOfferData, reason: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCounterDialogOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-indigo-600 text-white"
                            onClick={handleCounterOffer}
                            disabled={counterOfferMutation.isPending || isSubmitting || !counterOfferData.reason}
                        >
                            {counterOfferMutation.isPending || isSubmitting ? 'Submitting...' : 'Send Counter-Offer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
