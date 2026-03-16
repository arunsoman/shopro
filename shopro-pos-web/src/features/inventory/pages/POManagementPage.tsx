import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePurchaseOrders, useApprovePO, useRejectPO, usePOHistory, useSubmitForApproval, useSendPO } from '../hooks/usePO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Eye, 
    ArrowRight, 
    Truck, 
    AlertTriangle,
    Search,
    Filter,
    Download,
    Box,
    FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { POStatusTimeline } from '../components/POStatusTimeline';
import type { PurchaseOrder, PurchaseOrderStatus } from '../api/types';
import { useAuth } from '@/lib/auth/AuthContext';

export const POManagementPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { session } = useAuth();
    const { data: pos, isLoading } = usePurchaseOrders();
    const submitForApproval = useSubmitForApproval();
    const approveOrder = useApprovePO();
    const rejectOrder = useRejectPO();
    const sendOrder = useSendPO();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

    const { data: history } = usePOHistory(selectedPo?.id);

    const filteredPos = pos?.filter(po => {
        const matchesSearch = po.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            po.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || po.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusVariant = (status: PurchaseOrderStatus) => {
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

    const handleSubmit = async (id: string) => {
        try {
            await submitForApproval.mutateAsync(id);
            toast.success(t('inventory.po.toasts.submitSuccess'));
        } catch (error) {
            toast.error(t('inventory.po.toasts.submitError'));
        }
    };

    const handleApprove = async () => {
        if (!selectedPo || !session) return;
        try {
            await approveOrder.mutateAsync({ id: selectedPo.id, staffId: session.id });
            toast.success(t('inventory.po.toasts.approveSuccess'));
            setIsDetailsOpen(false);
        } catch (error) {
            toast.error(t('inventory.po.toasts.approveError'));
        }
    };

    const handleReject = async () => {
        if (!selectedPo || !session || !rejectReason) return;
        try {
            await rejectOrder.mutateAsync({ id: selectedPo.id, staffId: session.id, reason: rejectReason });
            toast.success(t('inventory.po.toasts.rejectSuccess'));
            setIsRejectDialogOpen(false);
            setIsDetailsOpen(false);
            setRejectReason('');
        } catch (error) {
            toast.error(t('inventory.po.toasts.rejectError'));
        }
    };

    const handleSend = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!session) return;
        try {
            await sendOrder.mutateAsync({ id, staffId: session.id });
            toast.success(t('inventory.po.toasts.sendSuccess'));
            setIsDetailsOpen(false);
        } catch (error) {
            toast.error(t('inventory.po.toasts.sendError'));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">{t('inventory.po.title')}</h1>
                    <p className="text-muted-foreground mt-2">{t('inventory.po.desc')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        {t('inventory.po.export')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('inventory.po.pendingAction')}</p>
                                <p className="text-xl font-bold">{pos?.filter(p => ['DRAFT', 'PENDING_APPROVAL', 'COUNTER_OFFERED', 'DISCREPANCY_REVIEW'].includes(p.status)).length || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Truck className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('inventory.po.inTransit')}</p>
                                <p className="text-xl font-bold">{pos?.filter(p => p.status === 'SHIPPED').length || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('inventory.po.completedMtd')}</p>
                                <p className="text-xl font-bold">{pos?.filter(p => p.status === 'CLOSED').length || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-red-500/10 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('inventory.po.exceptions')}</p>
                                <p className="text-xl font-bold">{pos?.filter(p => p.status === 'DISCREPANCY_REVIEW').length || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">{t('inventory.po.registryTitle')}</CardTitle>
                    <div className="flex items-center gap-4">
                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t('inventory.po.searchPlaceholder')}
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-md">
                            <Filter className="h-4 w-4 text-muted-foreground ml-2" />
                            <select 
                                className="bg-transparent text-sm font-medium border-none focus:ring-0 outline-none pr-4"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ALL">{t('inventory.po.allStatuses')}</option>
                                <option value="DRAFT">{t('inventory.po.statuses.DRAFT')}</option>
                                <option value="PENDING_APPROVAL">{t('inventory.po.statuses.PENDING_APPROVAL')}</option>
                                <option value="SENT">{t('inventory.po.statuses.SENT')}</option>
                                <option value="COUNTER_OFFERED">{t('inventory.po.statuses.COUNTER_OFFERED')}</option>
                                <option value="SHIPPED">{t('inventory.po.statuses.SHIPPED')}</option>
                                <option value="DISCREPANCY_REVIEW">{t('inventory.po.statuses.DISCREPANCY_REVIEW')}</option>
                                <option value="CLOSED">{t('inventory.po.statuses.CLOSED')}</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">{t('inventory.po.table.id')}</TableHead>
                                <TableHead>{t('inventory.po.table.date')}</TableHead>
                                <TableHead>{t('inventory.po.table.supplier')}</TableHead>
                                <TableHead>{t('inventory.po.table.value')}</TableHead>
                                <TableHead>{t('inventory.po.table.delivery')}</TableHead>
                                <TableHead>{t('inventory.po.table.status')}</TableHead>
                                <TableHead className="text-right">{t('inventory.po.table.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={7} className="h-16 animate-pulse bg-muted/20" />
                                    </TableRow>
                                ))
                            ) : filteredPos?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                        {t('inventory.po.noOrders')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPos?.map((po) => (
                                    <TableRow key={po.id} className="group hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-mono text-xs text-primary font-medium">
                                            #{po.id.slice(0, 8)}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {format(new Date(po.createdAt), 'MMM dd, yyyy')}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {po.supplierName}
                                        </TableCell>
                                        <TableCell className="tabular-nums font-semibold">
                                            {t('common.currencySymbol')}{po.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {po.expectedDeliveryDate ? format(new Date(po.expectedDeliveryDate), 'MMM dd, yyyy') : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getStatusVariant(po.status)}>
                                                {t(`inventory.po.statuses.${po.status}`)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-8 gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => {
                                                            setSelectedPo(po);
                                                            setIsDetailsOpen(true);
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        {t('inventory.po.actions.explore')}
                                                    </Button>
                                                    {po.status === 'DRAFT' && (
                                                        <Button 
                                                            size="sm" 
                                                            className="h-8 gap-1.5"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleSubmit(po.id);
                                                            }}
                                                        >
                                                            {t('inventory.po.actions.submit')}
                                                            <ArrowRight className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                {po.status === 'APPROVED' && (
                                                    <Button 
                                                        size="sm" 
                                                        className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                                                        onClick={(e) => handleSend(po.id, e)}
                                                        disabled={sendOrder.isPending}
                                                    >
                                                        {sendOrder.isPending ? t('inventory.po.actions.sending') : t('inventory.po.actions.send')}
                                                        <Truck className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {po.status === 'SHIPPED' && (
                                                    <Button 
                                                        size="sm" 
                                                        className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/inventory/po/${po.id}/receive`);
                                                        }}
                                                    >
                                                        {t('inventory.po.actions.receive')}
                                                        <Box className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {(po.status === 'RECEIVED' || po.status === 'PARTIALLY_RECEIVED') && (
                                                    <Button 
                                                        size="sm" 
                                                        className="h-8 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/inventory/po/${po.id}/match`);
                                                        }}
                                                    >
                                                        {t('inventory.po.actions.match')}
                                                        <FileText className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Order Details Drawer/Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center justify-between gap-4 mr-6">
                            <div>
                                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                                    {t('inventory.po.details.id', { id: selectedPo?.id.slice(0, 8) })}
                                    <Badge variant="outline" className={selectedPo ? getStatusVariant(selectedPo.status) : ''}>
                                        {selectedPo ? t(`inventory.po.statuses.${selectedPo.status}`) : ''}
                                    </Badge>
                                </DialogTitle>
                                <DialogDescription className="mt-1">
                                    {selectedPo ? t('inventory.po.details.issuedTo', { 
                                        supplier: selectedPo.supplierName, 
                                        date: format(new Date(selectedPo.createdAt), 'PPPP') 
                                    }) : ''}
                                </DialogDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                {selectedPo?.status === 'PENDING_APPROVAL' && (
                                    <>
                                        <Button variant="outline" className="text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50" onClick={() => setIsRejectDialogOpen(true)}>
                                            <XCircle className="mr-2 h-4 w-4" />
                                            {t('inventory.po.details.reject')}
                                        </Button>
                                        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleApprove}>
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            {t('inventory.po.details.approve')}
                                        </Button>
                                    </>
                                )}
                                {selectedPo?.status === 'APPROVED' && (
                                    <Button 
                                        className="bg-blue-600 hover:bg-blue-700" 
                                        onClick={(e) => handleSend(selectedPo.id, e)}
                                        disabled={sendOrder.isPending}
                                    >
                                        <Truck className="mr-2 h-4 w-4" />
                                        {sendOrder.isPending ? t('inventory.po.actions.sending') : t('inventory.po.details.sendToVendor')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </DialogHeader>

                    <Tabs defaultValue="items" className="mt-6">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="items">{t('inventory.po.details.lineItems')}</TabsTrigger>
                            <TabsTrigger value="history">{t('inventory.po.details.timeline')}</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="items" className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-8 mb-4">
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('inventory.po.details.logistics')}</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground">{t('inventory.po.details.delivery')}</p>
                                            <p className="text-sm font-medium">{selectedPo?.expectedDeliveryDate ? format(new Date(selectedPo.expectedDeliveryDate), 'PPP') : t('inventory.benchmarking.na')}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">{t('inventory.po.details.trackingRef')}</p>
                                            <p className="text-sm font-medium font-mono">{selectedPo?.trackingNumber || t('inventory.po.details.awaitingShipment')}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('inventory.po.details.financial')}</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground">{t('inventory.po.details.totalValue')}</p>
                                            <p className="text-xl font-bold text-primary">{t('common.currencySymbol')}{selectedPo?.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">{t('inventory.po.details.paymentTerms')}</p>
                                            <p className="text-sm font-medium">Net 30</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border bg-muted/5 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/20">
                                        <TableRow>
                                            <TableHead>{t('inventory.po.details.ingredient')}</TableHead>
                                            <TableHead className="text-right">{t('inventory.po.details.unitCost')}</TableHead>
                                            <TableHead className="text-right">{t('inventory.po.details.qty')}</TableHead>
                                            <TableHead className="text-right">{t('inventory.po.details.subtotal')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedPo?.items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.ingredientName}</TableCell>
                                                <TableCell className="text-right tabular-nums">{t('common.currencySymbol')}{item.unitCost.toFixed(2)}</TableCell>
                                                <TableCell className="text-right tabular-nums">{item.orderedQty}</TableCell>
                                                <TableCell className="text-right tabular-nums font-semibold">{t('common.currencySymbol')}{(item.unitCost * item.orderedQty).toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>

                        <TabsContent value="history" className="pt-6 px-2">
                            <POStatusTimeline history={history || []} />
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

            {/* Rejection Reason Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('inventory.po.rejection.title')}</DialogTitle>
                        <DialogDescription>
                            {t('inventory.po.rejection.desc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <label className="text-sm font-medium mb-2 block">{t('inventory.po.rejection.reasonLabel')}</label>
                        <Input 
                            placeholder={t('inventory.po.rejection.reasonPlaceholder')}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>{t('common.cancel')}</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={!rejectReason}>
                            {t('inventory.po.rejection.confirm')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
