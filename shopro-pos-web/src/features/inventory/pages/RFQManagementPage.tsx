import React, { useState } from 'react';
import { useRfqs, useCreateRfq } from '../hooks/useRFQ';
import { useIngredients } from '../hooks/useInventory';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Send, Clock, AlertCircle, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export const RFQManagementPage: React.FC = () => {
    const { data: rfqs, isLoading: isRfqsLoading } = useRfqs();
    const { data: ingredients } = useIngredients();
    const createRfq = useCreateRfq();

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        ingredientId: '',
        requiredQty: 0,
        desiredDeliveryDate: new Date().toISOString().split('T')[0]
    });

    const handleCreate = async () => {
        try {
            await createRfq.mutateAsync(formData);
            toast.success('RFQ issued successfully');
            setIsAddDialogOpen(false);
            setFormData({ ingredientId: '', requiredQty: 0, desiredDeliveryDate: new Date().toISOString().split('T')[0] });
        } catch (error) {
            toast.error('Failed to issue RFQ');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">Procurement Center</h1>
                    <p className="text-muted mt-2">Manage Quotation Requests and monitor vendor bidding status.</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Issue Manual RFQ
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Issue New Request for Quotation</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Select Ingredient</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.ingredientId}
                                    onChange={e => setFormData({ ...formData, ingredientId: e.target.value })}
                                >
                                    <option value="">Select an ingredient...</option>
                                    {ingredients?.map(ing => (
                                        <option key={ing.id} value={ing.id}>{ing.name} ({ing.unitOfMeasure})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Quantity Needed</label>
                                    <Input
                                        type="number"
                                        value={formData.requiredQty}
                                        onChange={e => setFormData({ ...formData, requiredQty: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Desired Delivery</label>
                                    <Input
                                        type="date"
                                        value={formData.desiredDeliveryDate}
                                        onChange={e => setFormData({ ...formData, desiredDeliveryDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={createRfq.isPending}>
                                {createRfq.isPending ? 'Issuing...' : 'Issue RFQ'}
                            </Button>
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
                                <p className="text-sm text-muted">Active RFQs</p>
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
                                <p className="text-sm text-muted">Bids Received</p>
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
                                <p className="text-sm text-muted">Expiring Soon</p>
                                <p className="text-2xl font-bold text-foreground">0</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>RFQ Reference</TableHead>
                                <TableHead>Ingredient</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Deadline</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isRfqsLoading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={6} className="h-16 animate-pulse bg-muted/20" />
                                    </TableRow>
                                ))
                            ) : rfqs?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted">
                                        No active RFQs. Automated RFQs will appear here when stock is low.
                                    </TableCell>
                                </TableRow>
                            ) : rfqs?.map(rfq => (
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
                                            {new Date(rfq.bidDeadline).toLocaleString()}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={rfq.status === 'OPEN' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : ""}
                                        >
                                            {rfq.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" className="gap-2">
                                            <ShoppingCart className="h-4 w-4" />
                                            Review Bids
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};
