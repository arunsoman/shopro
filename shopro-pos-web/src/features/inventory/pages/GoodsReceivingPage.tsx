import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Box, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/AuthContext';
import { usePurchaseOrders, useReceiveGoods } from '../hooks/usePO';
import { useTranslation } from 'react-i18next';
import InventorySkeleton from '../components/InventorySkeletons';

export const GoodsReceivingPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { session } = useAuth();
    
    // We already fetch all POs in the management page, so we can just find it here
    const { data: pos, isLoading } = usePurchaseOrders();
    const po = pos?.find(p => p.id === id);
    
    const receiveGoods = useReceiveGoods();
    
    const [receivedQuantities, setReceivedQuantities] = useState<Record<string, number>>({});
    const [deliveryNote, setDeliveryNote] = useState('');
    const [notes, setNotes] = useState('');
    
    // Initialize quantities with ordered quantities or 0
    useEffect(() => {
        if (po && po.items && Object.keys(receivedQuantities).length === 0) {
            const initialQty: Record<string, number> = {};
            po.items.forEach(item => {
                initialQty[item.ingredientId] = item.orderedQty;
            });
            setReceivedQuantities(initialQty);
        }
    }, [po]);

    if (isLoading) {
        return <InventorySkeleton variant="dashboard" />;
    }
    
    if (!po) return <div className="p-8 text-red-500">{t('inventory.grn.poNotFound')}</div>;
    
    if (po.status !== 'SHIPPED' && po.status !== 'PARTIALLY_RECEIVED') {
        return (
            <div className="p-8 max-w-3xl mx-auto">
                <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                        <AlertCircle className="h-12 w-12 text-amber-500" />
                        <h2 className="text-xl font-bold text-amber-900">{t('inventory.grn.cannotReceive')}</h2>
                        <p className="text-amber-700 max-w-md">{t('inventory.grn.statusRestriction', { status: po.status })}</p>
                        <Button variant="outline" onClick={() => navigate('/inventory/pos')} className="mt-4">{t('inventory.grn.backToPurchases')}</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleQuantityChange = (ingredientId: string, value: string) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0) {
            setReceivedQuantities(prev => ({
                ...prev,
                [ingredientId]: numValue
            }));
        } else if (value === '') {
            setReceivedQuantities(prev => ({
                ...prev,
                [ingredientId]: 0
            }));
        }
    };

    const hasDiscrepancy = po.items.some(item => {
        const received = receivedQuantities[item.ingredientId] || 0;
        return received !== item.orderedQty;
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session || !id) return;
        
        try {
            await receiveGoods.mutateAsync({
                id,
                data: {
                    receiverId: session.id,
                    receivedQuantities,
                    deliveryNoteReference: deliveryNote,
                    notes
                }
            });
            toast.success(t('inventory.grn.toastSuccess'));
            navigate('/inventory/pos');
        } catch (error) {
            toast.error(t('inventory.grn.toastError'));
        }
    };

    return (
        <div className="flex-1 space-y-8 p-8 max-w-6xl mx-auto w-full">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/inventory/pos')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 group flex items-center gap-3">
                        {t('inventory.grn.title')}
                        <Badge className="bg-emerald-500 hover:bg-emerald-600">{t('inventory.grn.receiving')}</Badge>
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">{t('inventory.grn.logPo', { id: po.id.slice(0, 8) })}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Box className="h-5 w-5 text-indigo-500" />
                                {t('inventory.grn.verifyQty')}
                            </CardTitle>
                            <CardDescription>{t('inventory.grn.verifyDesc')}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50/80">
                                    <TableRow>
                                        <TableHead>{t('inventory.grn.ingredient')}</TableHead>
                                        <TableHead>{t('inventory.grn.ordered')}</TableHead>
                                        <TableHead className="w-48 text-right pr-6">{t('inventory.grn.actuallyReceived')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {po.items.map(item => {
                                        const received = receivedQuantities[item.ingredientId] ?? item.orderedQty;
                                        const isShort = received < item.orderedQty;
                                        const isOver = received > item.orderedQty;
                                        
                                        return (
                                            <TableRow key={item.id} className={isShort ? 'bg-amber-50/30' : ''}>
                                                <TableCell>
                                                    <div className="font-medium">{item.ingredientName}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-slate-500">{item.orderedQty} {t(`common.units.${item.unitOfMeasure}`, item.unitOfMeasure)}</span>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <div className="flex items-center justify-end gap-3">
                                                        {(isShort || isOver) && (
                                                            <Badge variant="outline" className={isShort ? 'text-amber-600 border-amber-200 bg-amber-50' : 'text-blue-600 border-blue-200 bg-blue-50'}>
                                                                {isShort ? t('inventory.grn.short') : t('inventory.grn.overage')}
                                                            </Badge>
                                                        )}
                                                        <div className="flex items-center gap-2 max-w-[140px]">
                                                            <Input 
                                                                type="number" 
                                                                value={received || ''}
                                                                onChange={(e) => handleQuantityChange(item.ingredientId, e.target.value)}
                                                                className={`text-right ${isShort ? 'border-amber-300 focus-visible:ring-amber-500' : ''}`}
                                                                step="0.01"
                                                                min="0"
                                                            />
                                                            <span className="text-xs text-slate-400 font-medium w-max text-left px-1">
                                                                {t(`common.units.${item.unitOfMeasure}`, item.unitOfMeasure)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t('inventory.grn.registration')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label>{t('inventory.grn.supplierInfo')}</Label>
                                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                                    <p className="font-medium">{po.supplierName}</p>
                                    <p className="text-sm text-slate-500 mt-1">{t('inventory.grn.expected')} {po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString(i18n.language) : t('inventory.benchmarking.na')}</p>
                                    <p className="text-sm text-slate-500">{t('inventory.grn.tracking')} {po.trackingNumber || t('inventory.benchmarking.na')}</p>
                                </div>
                            </div>
                            
                            <form id="grn-form" onSubmit={handleSubmit} className="space-y-6 pt-2">
                                <div className="space-y-2">
                                    <Label htmlFor="deliveryNote">{t('inventory.grn.deliveryNoteRef')}</Label>
                                    <Input 
                                        id="deliveryNote" 
                                        placeholder={t('inventory.grn.deliveryPlaceholder')}
                                        value={deliveryNote}
                                        onChange={(e) => setDeliveryNote(e.target.value)}
                                    />
                                    <p className="text-[10px] text-slate-400">{t('inventory.grn.deliveryHint')}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="notes">{t('inventory.grn.receivingNotes')}</Label>
                                    <textarea 
                                        id="notes" 
                                        className="h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder={t('inventory.grn.notesPlaceholder')}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Button 
                        form="grn-form"
                        type="submit" 
                        size="lg" 
                        className={`w-full h-14 text-base font-bold shadow-lg ${hasDiscrepancy ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20 text-white' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20 text-white'}`}
                        disabled={receiveGoods.isPending}
                    >
                        {receiveGoods.isPending ? t('common.processing') : (
                            <span className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5" />
                                {hasDiscrepancy ? t('inventory.grn.logPartial') : t('inventory.grn.confirmFull')}
                            </span>
                        )}
                    </Button>
                    
                    {hasDiscrepancy && (
                        <p className="text-xs text-amber-600 text-center px-4 font-medium">
                            {t('inventory.grn.discrepancyFlag')}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

