import React, { useState } from 'react';
import { useRfqs, useCreateRfq, useCancelRfq } from '../hooks/useRFQ';
import { useIngredients } from '../hooks/useInventory';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, XCircle, Eye, Clock, AlertCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { ReviewBidsDialog } from '../components/ReviewBidsDialog';
import { PriceProposalsList } from '../components/PriceProposalsList';
import InventorySkeleton from '../components/InventorySkeletons';

export const RFQManagementPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { data: rfqs, isLoading } = useRfqs();
    const { data: ingredients } = useIngredients();
    const createRfq = useCreateRfq();
    const cancelRfq = useCancelRfq();

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        ingredientId: '',
        requiredQty: 0,
        desiredDeliveryDate: new Date().toISOString().split('T')[0]
    });

    const [selectedRfqId, setSelectedRfqId] = useState<string | undefined>();
    const [selectedRfqRef, setSelectedRfqRef] = useState<string | undefined>();
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);

    const handleCreate = async () => {
        try {
            await createRfq.mutateAsync(formData);
            toast.success(t('inventory.rfq.toasts.issueSuccess'));
            setIsAddDialogOpen(false);
            setFormData({ ingredientId: '', requiredQty: 0, desiredDeliveryDate: new Date().toISOString().split('T')[0] });
        } catch (error) {
            toast.error(t('inventory.rfq.toasts.issueError'));
        }
    };

    const handleCancel = async (id: string) => {
        try {
            await cancelRfq.mutateAsync(id);
            toast.success(t('inventory.rfq.toasts.cancelSuccess'));
        } catch (error) {
            toast.error(t('inventory.rfq.toasts.cancelError'));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">{t('inventory.rfq.title')}</h1>
                    <p className="text-muted mt-2">{t('inventory.rfq.desc')}</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            {t('inventory.rfq.issueManual')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{t('inventory.rfq.wizard.title')}</DialogTitle>
                            <div className="flex items-center gap-2 mt-4">
                                {[1, 2, 3, 4].map(step => (
                                    <div 
                                        key={step} 
                                        className={`h-1 flex-1 rounded-full ${wizardStep >= step ? 'bg-primary' : 'bg-muted'}`} 
                                    />
                                ))}
                            </div>
                        </DialogHeader>

                        {wizardStep === 1 && (
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">{t('inventory.rfq.selectIngredient')}</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.ingredientId}
                                        onChange={e => setFormData({ ...formData, ingredientId: e.target.value })}
                                    >
                                        <option value="">{t('inventory.rfq.ingPlaceholder')}</option>
                                        {ingredients?.content?.map((ing: any) => (
                                            <option key={ing.id} value={ing.id}>{ing.name} ({t(`common.units.${ing.unitOfMeasure}`, ing.unitOfMeasure)})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">{t('inventory.rfq.qtyNeeded')}</label>
                                    <Input
                                        type="number"
                                        value={formData.requiredQty}
                                        onChange={e => setFormData({ ...formData, requiredQty: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                        )}

                        {wizardStep === 2 && (
                            <div className="py-4 space-y-4">
                                <label className="text-sm font-medium">{t('inventory.rfq.wizard.selectSuppliers')}</label>
                                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2">
                                    {['Amazon Fresh', 'BigBasket', 'Local Mandi', 'Swiggy Instamart'].map(s => (
                                        <div key={s} className="flex items-center space-x-2 p-2 border rounded hover:bg-muted/50 transition-colors">
                                            <input type="checkbox" id={s} defaultChecked className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                            <label htmlFor={s} className="text-sm cursor-pointer">{s}</label>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-muted italic">* {t('inventory.rfq.wizard.supplierHint')}</p>
                            </div>
                        )}

                        {wizardStep === 3 && (
                            <div className="grid gap-6 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">{t('inventory.rfq.wizard.auctionWindow')}</label>
                                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                            <option value="1">1 Hour</option>
                                            <option value="3" selected>3 Hours (Standard)</option>
                                            <option value="6">6 Hours</option>
                                            <option value="24">24 Hours</option>
                                        </select>
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">{t('inventory.rfq.wizard.priceCeiling')}</label>
                                        <Input type="number" placeholder={t('common.optional')} />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">{t('inventory.rfq.desiredDelivery')}</label>
                                    <Input
                                        type="date"
                                        value={formData.desiredDeliveryDate}
                                        onChange={e => setFormData({ ...formData, desiredDeliveryDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {wizardStep === 4 && (
                            <div className="py-4 space-y-4">
                                <div className="bg-muted p-4 rounded-lg space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted">{t('inventory.po.details.ingredient')}:</span>
                                        <span className="font-semibold">{ingredients?.content?.find((i: any) => i.id === formData.ingredientId)?.name}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted">{t('inventory.rfq.table.qty')}:</span>
                                        <span className="font-semibold">{formData.requiredQty}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted">{t('inventory.rfq.table.deadline')}:</span>
                                        <span className="font-semibold">3 Hours</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted">{t('common.suppliers')}:</span>
                                        <span className="font-semibold">{t('inventory.rfq.wizard.invitedCount', { count: 4 })}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-700 dark:text-amber-400 text-xs text-balance">
                                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                    <p>{t('inventory.rfq.wizard.launchNotice')}</p>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="flex justify-between sm:justify-between items-center">
                            <div className="flex-1">
                                {wizardStep > 1 && (
                                    <Button variant="ghost" onClick={() => setWizardStep(prev => prev - 1)}>
                                        {t('common.prev')}
                                    </Button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>{t('common.cancel')}</Button>
                                {wizardStep < 4 ? (
                                    <Button onClick={() => setWizardStep(prev => prev + 1)} disabled={wizardStep === 1 && !formData.ingredientId}>
                                        {t('common.next')}
                                    </Button>
                                ) : (
                                    <Button onClick={handleCreate} disabled={createRfq.isPending}>
                                        {createRfq.isPending ? t('inventory.rfq.issuing') : t('inventory.rfq.issueButton')}
                                    </Button>
                                )}
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted">{t('inventory.rfq.activeRfqs')}</p>
                                <p className="text-2xl font-bold text-foreground">
                                    {rfqs?.filter(r => r.status === 'OPEN').length || 0}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-full">
                                <Send className="h-6 w-6 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted">{t('inventory.rfq.bidsReceived')}</p>
                                <p className="text-2xl font-bold text-foreground">0</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-warning/10 rounded-full">
                                <AlertCircle className="h-6 w-6 text-warning" />
                            </div>
                            <div>
                                <p className="text-sm text-muted">{t('inventory.rfq.expiringSoon')}</p>
                                <p className="text-2xl font-bold text-foreground">0</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="rfqs" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="rfqs">{t('inventory.rfq.tabs.active')}</TabsTrigger>
                    <TabsTrigger value="proposals">{t('inventory.rfq.tabs.proposals')}</TabsTrigger>
                </TabsList>

                <TabsContent value="rfqs">
                    <Card>
                        <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('inventory.rfq.table.ref')}</TableHead>
                                    <TableHead>{t('inventory.po.details.ingredient')}</TableHead>
                                    <TableHead>{t('inventory.rfq.table.qty')}</TableHead>
                                    <TableHead>{t('inventory.rfq.table.deadline')}</TableHead>
                                    <TableHead>{t('inventory.po.table.status')}</TableHead>
                                    <TableHead className="text-right">{t('inventory.po.table.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-4">
                                            <InventorySkeleton variant="table" />
                                        </TableCell>
                                    </TableRow>
                                ) : rfqs?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-muted">
                                            {t('inventory.rfq.noRfqs')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rfqs?.map(rfq => (
                                        <TableRow key={rfq.id}>
                                            <TableCell className="font-mono text-xs">
                                                #{rfq.id.slice(0, 8)}
                                            </TableCell>
                                            <TableCell className="font-medium text-foreground">
                                                {rfq.ingredientName}
                                            </TableCell>
                                            <TableCell>
                                                {rfq.requiredQty}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <Clock className="h-3 w-3 text-muted" />
                                                    <span className={new Date(rfq.bidDeadline).getTime() - Date.now() < 1800000 ? "text-red-500 font-medium" : ""}>
                                                        {new Date(rfq.bidDeadline).toLocaleString(i18n.language)}
                                                        {rfq.status === 'OPEN' && (
                                                            <span className="ml-1 text-[10px] opacity-70">
                                                                ({t('inventory.rfq.table.timeLeft', { count: Math.max(0, Math.floor((new Date(rfq.bidDeadline).getTime() - Date.now()) / 60000)) })})
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={rfq.status === 'OPEN' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : ""}
                                                >
                                                    {t(`inventory.rfq.statuses.${rfq.status}`)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="gap-2 h-8"
                                                        onClick={() => {
                                                            setSelectedRfqId(rfq.id);
                                                            setSelectedRfqRef(`${rfq.ingredientName} (${rfq.requiredQty})`);
                                                            setReviewDialogOpen(true);
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        {t('inventory.rfq.table.reviewBids')}
                                                    </Button>
                                                    {rfq.status === 'OPEN' && (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                                            onClick={() => handleCancel(rfq.id)}
                                                            title={t('inventory.rfq.table.cancelTitle')}
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="proposals">
            <PriceProposalsList />
        </TabsContent>
    </Tabs>

    <ReviewBidsDialog
                rfqId={selectedRfqId}
                rfqReference={selectedRfqRef}
                open={reviewDialogOpen}
                onOpenChange={setReviewDialogOpen}
            />
        </div>
    );
};
