import React, { useState } from 'react';
import { useSuppliers, useCreateSupplier, useImportCatalog } from '../hooks/useSuppliers';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, Search, Truck, Mail, Phone, Clock, Star, UserPlus, Users, Settings2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useSupplierUsers, useInviteSupplierUser, useSupplierPolicy, useUpdateSupplierPolicy } from '../hooks/useSuppliers';
import type { SupplierRole, SupplierPolicy } from '../api/types';
import { Switch } from '@/components/ui/switch';

export const SupplierManagementPage: React.FC = () => {
    const { data: suppliers, isLoading } = useSuppliers();
    const createSupplier = useCreateSupplier();
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false);
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false);
    const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
    const [catalogJson, setCatalogJson] = useState('');

    const { data: supplierUsers } = useSupplierUsers(selectedSupplierId || '');
    const inviteUserMutation = useInviteSupplierUser(selectedSupplierId || '');

    const importCatalogMutation = useImportCatalog(selectedSupplierId || '');

    // Form States
    const [formData, setFormData] = useState({
        companyName: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        leadTimeDays: 1
    });

    const [inviteData, setInviteData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        role: 'SUPPLIER_BIDDER' as SupplierRole
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
                                                variant="outline"
                                                size="sm"
                                                className="gap-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedSupplierId(supplier.id);
                                                    setIsUsersDialogOpen(true);
                                                }}
                                            >
                                                <Users className="h-4 w-4" />
                                                Users
                                            </Button>
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
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="gap-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedSupplierId(supplier.id);
                                                    setIsPolicyDialogOpen(true);
                                                }}
                                            >
                                                <Settings2 className="h-4 w-4" />
                                                Policy
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

            {/* Manage Users Dialog */}
            <Dialog open={isUsersDialogOpen} onOpenChange={setIsUsersDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader className="flex flex-row items-center justify-between">
                        <DialogTitle>Supplier Contacts & Users</DialogTitle>
                        <Button
                            size="sm"
                            className="gap-2"
                            onClick={() => setIsInviteDialogOpen(true)}
                        >
                            <UserPlus className="h-4 w-4" />
                            Invite User
                        </Button>
                    </DialogHeader>
                    <div className="py-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Full Name</TableHead>
                                    <TableHead>Email / Phone</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {supplierUsers?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-muted">
                                            No users invited yet for this supplier.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    supplierUsers?.map(user => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.fullName}</TableCell>
                                            <TableCell>
                                                <div className="text-sm">{user.email}</div>
                                                <div className="text-xs text-muted">{user.phoneNumber || 'No phone'}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="text-[10px]">
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={user.active ? 'default' : 'destructive'} className="text-[10px]">
                                                    {user.active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Invite User Dialog */}
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite Supplier User</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <Input
                                placeholder="e.g. John Doe"
                                value={inviteData.fullName}
                                onChange={e => setInviteData({ ...inviteData, fullName: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <Input
                                type="email"
                                placeholder="john@supplier.com"
                                value={inviteData.email}
                                onChange={e => setInviteData({ ...inviteData, email: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Phone Number (Optional)</label>
                            <Input
                                placeholder="+1 (555) 000-0000"
                                value={inviteData.phoneNumber}
                                onChange={e => setInviteData({ ...inviteData, phoneNumber: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Portal Role</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={inviteData.role}
                                onChange={e => setInviteData({ ...inviteData, role: e.target.value as SupplierRole })}
                            >
                                <option value="SUPPLIER_BIDDER">Bidder (Participation in RFQs)</option>
                                <option value="SUPPLIER_ADMIN">Admin (Manage other users)</option>
                                <option value="SUPPLIER_PLANNER">Planner (View inventory forecasts)</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>Cancel</Button>
                        <Button
                            disabled={!inviteData.fullName || !inviteData.email || inviteUserMutation.isPending}
                            onClick={async () => {
                                try {
                                    await inviteUserMutation.mutateAsync(inviteData);
                                    toast.success('Invitation sent successfully');
                                    setIsInviteDialogOpen(false);
                                    setInviteData({ fullName: '', email: '', phoneNumber: '', role: 'SUPPLIER_BIDDER' });
                                } catch (e) {
                                    toast.error('Failed to send invitation');
                                }
                            }}
                        >
                            {inviteUserMutation.isPending ? 'Sending...' : 'Send Invitation'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Procurement Policy Dialog */}
            <Dialog open={isPolicyDialogOpen} onOpenChange={setIsPolicyDialogOpen}>
                <SupplierPolicyDialog 
                    supplierId={selectedSupplierId || ''} 
                    onClose={() => setIsPolicyDialogOpen(false)} 
                />
            </Dialog>
        </div>
    );
};

interface SupplierPolicyDialogProps {
    supplierId: string;
    onClose: () => void;
}

const SupplierPolicyDialog: React.FC<SupplierPolicyDialogProps> = ({ supplierId, onClose }) => {
    const { data: policy, isLoading } = useSupplierPolicy(supplierId);
    const updatePolicy = useUpdateSupplierPolicy();
    const [localPolicy, setLocalPolicy] = useState<Partial<SupplierPolicy>>({});

    // Sync local state when data loads
    React.useEffect(() => {
        if (policy) {
            setLocalPolicy(policy);
        }
    }, [policy]);

    const handleSave = async () => {
        try {
            await updatePolicy.mutateAsync({ supplierId, policy: localPolicy });
            toast.success('Procurement policy updated');
            onClose();
        } catch (error) {
            toast.error('Failed to update policy');
        }
    };

    if (isLoading) return <div className="p-8 text-center animate-pulse">Loading policy config...</div>;

    return (
        <DialogContent className="max-w-xl">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Procurement Policy Configuration
                </DialogTitle>
                <p className="text-sm text-muted">Define automation rules and tolerances for this supplier.</p>
            </DialogHeader>
            
            <div className="space-y-6 py-4 overflow-y-auto max-h-[70vh]">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="space-y-0.5">
                        <label className="text-sm font-semibold">Automated Acknowledgment</label>
                        <p className="text-xs text-muted">Auto-accept PO acknowledgments if they match perfectly.</p>
                    </div>
                    <Switch 
                        checked={localPolicy.autoAcknowledge} 
                        onCheckedChange={(val) => setLocalPolicy({ ...localPolicy, autoAcknowledge: val })}
                    />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="space-y-0.5">
                        <label className="text-sm font-semibold">Allow Counter Offers</label>
                        <p className="text-xs text-muted">Permit vendors to propose price or quantity changes.</p>
                    </div>
                    <Switch 
                        checked={localPolicy.counterOfferAllowed} 
                        onCheckedChange={(val) => setLocalPolicy({ ...localPolicy, counterOfferAllowed: val })}
                    />
                </div>

                <div className="space-y-3 p-3 rounded-lg border border-divider">
                    <label className="text-sm font-semibold">Payment Terms</label>
                    <Input 
                        placeholder="e.g. Net 30, Due on Receipt"
                        value={localPolicy.paymentTerms || ''}
                        onChange={(e) => setLocalPolicy({ ...localPolicy, paymentTerms: e.target.value })}
                    />
                </div>

                <div className="space-y-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold">Price Variance Tolerance</label>
                        <Badge variant="outline" className="font-mono text-primary bg-background shadow-sm">
                            {localPolicy.priceTolerance}%
                        </Badge>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="20" 
                        step="0.5" 
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        value={localPolicy.priceTolerance || 0}
                        onChange={(e) => setLocalPolicy({ ...localPolicy, priceTolerance: parseFloat(e.target.value) })}
                    />
                </div>

                <div className="space-y-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold">Quantity Variance Tolerance</label>
                        <Badge variant="outline" className="font-mono text-primary bg-background shadow-sm">
                            {localPolicy.qtyTolerance}%
                        </Badge>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="50" 
                        step="1" 
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        value={localPolicy.qtyTolerance || 0}
                        onChange={(e) => setLocalPolicy({ ...localPolicy, qtyTolerance: parseFloat(e.target.value) })}
                    />
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={onClose}>Discard</Button>
                <Button onClick={handleSave} disabled={updatePolicy.isPending} className="min-w-[120px]">
                    {updatePolicy.isPending ? 'Saving...' : 'Save Policy Config'}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};
