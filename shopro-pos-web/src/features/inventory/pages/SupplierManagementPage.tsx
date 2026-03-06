import React, { useState } from 'react';
import { useSuppliers, useCreateSupplier, useImportCatalog } from '../hooks/useSuppliers';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, Search, Truck, Mail, Phone, Clock, Star, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const SupplierManagementPage: React.FC = () => {
    const { data: suppliers, isLoading } = useSuppliers();
    const createSupplier = useCreateSupplier();
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
    const [catalogJson, setCatalogJson] = useState('');

    const importCatalogMutation = useImportCatalog(selectedSupplierId || '');

    // Form States
    const [formData, setFormData] = useState({
        companyName: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        leadTimeDays: 1
    });

    const handleCreate = async () => {
        try {
            await createSupplier.mutateAsync(formData);
            toast.success('Supplier added successfully');
            setIsAddDialogOpen(false);
            setFormData({ companyName: '', contactName: '', contactEmail: '', contactPhone: '', leadTimeDays: 1 });
        } catch (error) {
            toast.error('Failed to add supplier');
        }
    };

    const filteredSuppliers = suppliers?.filter(s =>
        s.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.contactName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">Supplier Registry</h1>
                    <p className="text-muted mt-2">Manage your vendors, lead times, and bidding performance.</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Supplier
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Register New Supplier</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Company Name</label>
                                <Input
                                    placeholder="e.g. Sysco Foods"
                                    value={formData.companyName}
                                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Primary Contact</label>
                                    <Input
                                        placeholder="Name"
                                        value={formData.contactName}
                                        onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Lead Time (Days)</label>
                                    <Input
                                        type="number"
                                        value={formData.leadTimeDays}
                                        onChange={e => setFormData({ ...formData, leadTimeDays: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Email Address</label>
                                <Input
                                    type="email"
                                    placeholder="orders@supplier.com"
                                    value={formData.contactEmail}
                                    onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Phone Number</label>
                                <Input
                                    placeholder="+1 (555) 000-0000"
                                    value={formData.contactPhone}
                                    onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={createSupplier.isPending}>
                                {createSupplier.isPending ? 'Saving...' : 'Register Supplier'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <Input
                        placeholder="Search vendors..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Supplier</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Performance</TableHead>
                                <TableHead>Lead Time</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={5} className="h-16 animate-pulse bg-muted/20" />
                                    </TableRow>
                                ))
                            ) : filteredSuppliers?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted">
                                        No suppliers found matching your search.
                                    </TableCell>
                                </TableRow>
                            ) : filteredSuppliers?.map(supplier => (
                                <TableRow key={supplier.id} className="group cursor-pointer hover:bg-muted/50 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <Truck className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-foreground">{supplier.companyName}</div>
                                                <div className="text-xs text-muted">ID: {supplier.id.slice(0, 8)}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail className="h-3.5 w-3.5 text-muted" />
                                                {supplier.contactEmail}
                                            </div>
                                            {supplier.contactPhone && (
                                                <div className="flex items-center gap-2 text-xs text-muted">
                                                    <Phone className="h-3 w-3" />
                                                    {supplier.contactPhone}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-0.5 text-yellow-500">
                                                <Star className="h-3.5 w-3.5 fill-current" />
                                                <span className="text-sm font-medium text-foreground">{supplier.vendorRating}</span>
                                            </div>
                                            <Badge variant="outline" className="text-[10px] h-4">Verified</Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-foreground">
                                            <Clock className="h-3.5 w-3.5 text-muted" />
                                            {supplier.leadTimeDays} days
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="gap-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedSupplierId(supplier.id);
                                                    setIsImportDialogOpen(true);
                                                }}
                                            >
                                                <Upload className="h-4 w-4" />
                                                Catalog
                                            </Button>
                                            <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Catalog Import Dialog */}
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Import Supplier Catalog</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-muted">
                            Paste the JSON catalog data below to sync vendor pricing and SKUs.
                        </p>
                        <textarea
                            className="w-full h-64 p-4 rounded-md border bg-black text-xs font-mono text-emerald-400 focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder='[ { "productName": "Beef", "vendorSku": "B123", "unitPrice": 45.50, "mappedIngredientId": "..." } ]'
                            value={catalogJson}
                            onChange={e => setCatalogJson(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>Cancel</Button>
                        <Button
                            disabled={!catalogJson || !selectedSupplierId || importCatalogMutation.isPending}
                            onClick={async () => {
                                try {
                                    const items = JSON.parse(catalogJson);
                                    await importCatalogMutation.mutateAsync({ items });
                                    toast.success('Catalog imported successfully');
                                    setIsImportDialogOpen(false);
                                    setCatalogJson('');
                                } catch (e) {
                                    toast.error('Invalid JSON format or import failed');
                                }
                            }}
                        >
                            {importCatalogMutation.isPending ? 'Importing...' : 'Start Import'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
