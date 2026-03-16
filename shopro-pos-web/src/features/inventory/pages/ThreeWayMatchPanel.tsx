import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, ArrowLeft, CheckCircle2, AlertCircle, TrendingUp, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/AuthContext';
import { usePurchaseOrders, useMatchInvoice } from '../hooks/usePO';
import { useTranslation } from 'react-i18next';
import InventorySkeleton from '../components/InventorySkeletons';

export const ThreeWayMatchPanel: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { session } = useAuth();
    
    const { data: pos, isLoading } = usePurchaseOrders();
    const po = pos?.find(p => p.id === id);
    
    const matchInvoice = useMatchInvoice();
    
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [invoicedQuantities, setInvoicedQuantities] = useState<Record<string, number>>({});
    const [invoicedPrices, setInvoicedPrices] = useState<Record<string, number>>({});
    const [taxAmount, setTaxAmount] = useState<number>(0);
    
    // Initialize quantities and prices with PO defaults
    useEffect(() => {
        if (po && po.items && Object.keys(invoicedQuantities).length === 0) {
            const initialQty: Record<string, number> = {};
            const initialPrices: Record<string, number> = {};
            po.items.forEach(item => {
                initialQty[item.ingredientId] = item.orderedQty; // In a real app, this might prepopulate with received qty
                initialPrices[item.ingredientId] = item.unitCost;
            });
            setInvoicedQuantities(initialQty);
            setInvoicedPrices(initialPrices);
        }
    }, [po]);

    if (isLoading) {
        return <InventorySkeleton variant="dashboard" />;
    }
    
    if (!po) return <div className="p-8 text-red-500">Purchase Order not found.</div>;
    
    if (po.status !== 'RECEIVED' && po.status !== 'PARTIALLY_RECEIVED') {
        return (
            <div className="p-8 max-w-3xl mx-auto">
                <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                        <AlertCircle className="h-12 w-12 text-amber-500" />
                        <h2 className="text-xl font-bold text-amber-900">Cannot Process Invoice</h2>
                        <p className="text-amber-700 max-w-md">This Purchase Order is in status <strong>{po.status}</strong>. Invoices can only be matched against RECEIVED or PARTIALLY_RECEIVED orders.</p>
                        <Button variant="outline" onClick={() => navigate('/inventory/pos')} className="mt-4">Back to Purchases</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleQuantityChange = (ingredientId: string, value: string) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0) {
            setInvoicedQuantities(prev => ({ ...prev, [ingredientId]: numValue }));
        } else if (value === '') {
            setInvoicedQuantities(prev => ({ ...prev, [ingredientId]: 0 }));
        }
    };

    const handlePriceChange = (ingredientId: string, value: string) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0) {
            setInvoicedPrices(prev => ({ ...prev, [ingredientId]: numValue }));
        } else if (value === '') {
            setInvoicedPrices(prev => ({ ...prev, [ingredientId]: 0 }));
        }
    };

    const subtotal = po.items.reduce((sum, item) => {
        const qty = invoicedQuantities[item.ingredientId] || 0;
        const price = invoicedPrices[item.ingredientId] || 0;
        return sum + (qty * price);
    }, 0);
    
    const totalAmount = subtotal + taxAmount;
    
    const priceVariance = totalAmount - po.totalValue;
    const variancePercentage = po.totalValue > 0 ? (priceVariance / po.totalValue) * 100 : 0;
    const hasVariance = Math.abs(variancePercentage) > 2; // Flag if > 2% variance

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session || !id || !invoiceNumber) {
            toast.error("Invoice number is required");
            return;
        }
        
        try {
            await matchInvoice.mutateAsync({
                id,
                data: {
                    invoiceNumber,
                    invoicedQuantities,
                    invoicedPrices,
                    totalAmount,
                    taxAmount
                }
            });
            toast.success('3-Way Match process completed');
            navigate('/inventory/pos');
        } catch (error) {
            toast.error('Failed to process invoice matching');
        }
    };

    return (
        <div className="flex-1 space-y-8 p-8 max-w-6xl mx-auto w-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/inventory/pos')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 group flex items-center gap-3">
                            {t('inventory.matching.title')}
                            <Badge className="bg-indigo-500 hover:bg-indigo-600">{t('inventory.matching.badge')}</Badge>
                        </h2>
                        <p className="text-muted-foreground mt-1 text-sm">{t('inventory.matching.desc', { id: po.id.slice(0, 8) })}</p>
                    </div>
                </div>
                {po.status === 'RECEIVED' && (
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        {t('inventory.matching.downloadInvoice')}
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5 text-indigo-500" />
                                {t('inventory.matching.entryTitle')}
                            </CardTitle>
                            <CardDescription>{t('inventory.matching.entryDesc')}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50/80">
                                    <TableRow>
                                        <TableHead>{t('inventory.ingredient')}</TableHead>
                                        <TableHead>{t('inventory.matching.poCost')}</TableHead>
                                        <TableHead className="w-32 text-right">{t('inventory.matching.invQty')}</TableHead>
                                        <TableHead className="w-32 text-right">{t('inventory.matching.invPrice', { symbol: t('common.currencySymbol') })}</TableHead>
                                        <TableHead className="w-24 text-right pr-6">{t('inventory.matching.extended', { symbol: t('common.currencySymbol') })}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {po.items.map(item => {
                                        const iQty = invoicedQuantities[item.ingredientId] ?? item.orderedQty;
                                        const iPrice = invoicedPrices[item.ingredientId] ?? item.unitCost;
                                        const extPrice = iQty * iPrice;
                                        const priceChanged = iPrice !== item.unitCost;
                                        
                                        return (
                                            <TableRow key={item.id} className={priceChanged ? 'bg-amber-50/20' : ''}>
                                                <TableCell>
                                                    <div className="font-medium">{item.ingredientName}</div>
                                                    <div className="text-xs text-slate-500">{t('inventory.matching.orderedQty')}: {item.orderedQty} {t(`common.units.${item.unitOfMeasure}`, item.unitOfMeasure)}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-slate-500">{t('common.currencySymbol')}{item.unitCost.toFixed(2)}</span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Input 
                                                        type="number" 
                                                        value={iQty || ''}
                                                        onChange={(e) => handleQuantityChange(item.ingredientId, e.target.value)}
                                                        className="h-8 text-right"
                                                        step="0.01"
                                                        min="0"
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Input 
                                                        type="number" 
                                                        value={iPrice || ''}
                                                        onChange={(e) => handlePriceChange(item.ingredientId, e.target.value)}
                                                        className={`h-8 text-right ${priceChanged ? 'border-amber-300 text-amber-700' : ''}`}
                                                        step="0.01"
                                                        min="0"
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right pr-6 font-medium">
                                                    {t('common.currencySymbol')}{extPrice.toFixed(2)}
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
                            <CardTitle className="text-lg">{t('inventory.matching.summaryTitle')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form id="match-form" onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="invoiceNumber" className="text-sm font-semibold text-slate-700">{t('inventory.matching.invoiceNumber')}</Label>
                                    <Input 
                                        id="invoiceNumber" 
                                        placeholder={t('inventory.matching.invoiceNumberPlaceholder')} 
                                        value={invoiceNumber}
                                        onChange={(e) => setInvoiceNumber(e.target.value)}
                                        required
                                        className="border-indigo-200 focus-visible:ring-indigo-500"
                                    />
                                </div>
                                <div className="space-y-2 pt-2 border-t mt-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">{t('inventory.matching.subtotal')}</span>
                                        <span className="font-medium">{t('common.currencySymbol')}{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm items-center">
                                        <span className="text-slate-500">{t('inventory.matching.taxShipping')}</span>
                                        <div className="w-24">
                                            <Input 
                                                type="number" 
                                                value={taxAmount || ''}
                                                onChange={(e) => setTaxAmount(parseFloat(e.target.value) || 0)}
                                                className="h-8 text-right bg-slate-50"
                                                step="0.01"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Separator className="my-4" />
                                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <span className="font-bold text-slate-700">{t('inventory.matching.invoiceTotal')}</span>
                                    <span className="text-xl font-black text-slate-900">{t('common.currencySymbol')}{totalAmount.toFixed(2)}</span>
                                </div>
                                
                                <div className={`p-4 rounded-lg flex items-start gap-3 ${hasVariance ? 'bg-amber-50 border border-amber-200' : 'bg-emerald-50 border border-emerald-100'}`}>
                                    {hasVariance ? <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" /> : <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />}
                                    <div>
                                        <p className={`text-sm font-bold ${hasVariance ? 'text-amber-800' : 'text-emerald-800'}`}>
                                            {hasVariance ? t('inventory.matching.toleranceExceeded') : t('inventory.matching.withinTolerance')}
                                        </p>
                                        <p className={`text-xs mt-1 leading-relaxed ${hasVariance ? 'text-amber-700/80' : 'text-emerald-700/80'}`}>
                                            {t('inventory.matching.varianceHint', { 
                                                pct: variancePercentage.toFixed(2), 
                                                planned: `${t('common.currencySymbol')}${po.totalValue.toFixed(2)}`,
                                                consequence: hasVariance ? t('inventory.matching.reviewConsequence') : t('inventory.matching.approvalConsequence')
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Button 
                        form="match-form"
                        type="submit" 
                        size="lg" 
                        className={`w-full h-14 text-base font-bold shadow-lg ${hasVariance ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20 text-white' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20 text-white'}`}
                        disabled={matchInvoice.isPending}
                    >
                        {matchInvoice.isPending ? t('common.processing') : (
                            <span className="flex items-center gap-2">
                                {hasVariance ? <TrendingUp className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                                {hasVariance ? t('inventory.matching.submitReview') : t('inventory.matching.runMatch')}
                            </span>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
