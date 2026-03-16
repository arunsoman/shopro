import React, { useState } from 'react';
import { useSuppliers, useCreateSupplier, useImportCatalog } from '../hooks/useSuppliers';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
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
import { useTranslation } from 'react-i18next';

export const SupplierManagementPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
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
        leadTimeDays: 1,
        minOrderValue: 0,
        bidEligible: true,
        categories: [] as string[]
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
            toast.success(t('inventory.registry.toast.success'));
            setIsAddDialogOpen(false);
            setFormData({ 
                companyName: '', 
                contactName: '', 
                contactEmail: '', 
                contactPhone: '', 
                leadTimeDays: 1,
                minOrderValue: 0,
                bidEligible: true,
                categories: []
            });
        } catch (error) {
            toast.error(t('inventory.registry.toast.error'));
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
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">{t('inventory.registry.title')}</h1>
                    <p className="text-muted mt-2">{t('inventory.registry.desc')}</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            {t('inventory.registry.addSupplier')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('inventory.registry.registerTitle')}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">{t('inventory.registry.companyName')}</label>
                                <Input
                                    placeholder={t('inventory.registry.placeholders.company')}
                                    value={formData.companyName}
                                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">{t('inventory.registry.primaryContact')}</label>
                                    <Input
                                        placeholder={t('common.name')}
                                        value={formData.contactName}
                                        onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">{t('inventory.registry.leadTime')}</label>
                                    <Input
                                        type="number"
                                        value={formData.leadTimeDays}
                                        onChange={e => setFormData({ ...formData, leadTimeDays: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">{t('inventory.registry.email')}</label>
                                <Input
                                    type="email"
                                    placeholder={t('inventory.registry.placeholders.email')}
                                    value={formData.contactEmail}
                                    onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">{t('inventory.registry.phone')}</label>
                                <Input
                                    placeholder={t('inventory.registry.placeholders.phone')}
                                    value={formData.contactPhone}
                                    onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>{t('common.cancel')}</Button>
                            <Button onClick={handleCreate} disabled={createSupplier.isPending}>
                                {createSupplier.isPending ? t('common.wait') : t('inventory.registry.registerTitle')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-4 pb-2">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">{t('inventory.registry.stats.activeProviders', 'Active Providers')}</p>
                            <Truck className="h-4 w-4 text-primary" />
                        </div>
                        <div className="mt-2">
                            <div className="text-2xl font-bold">{suppliers?.length || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {suppliers?.filter(s => s.bidEligible).length} bid eligible
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-emerald-500/5 border-emerald-500/20">
                    <CardContent className="pt-4 pb-2">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">{t('inventory.registry.stats.reliability', 'Avg Reliability')}</p>
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="mt-2">
                            <div className="text-2xl font-bold text-emerald-600">
                                {(suppliers?.reduce((acc, s) => acc + s.reliabilityScore, 0) || 0 / (suppliers?.length || 1)).toFixed(1)}%
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                +1.2% in 30 days
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-amber-500/5 border-amber-500/20">
                    <CardContent className="pt-4 pb-2">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">{t('inventory.registry.stats.otif', 'OTIF Rating')}</p>
                            <Clock className="h-4 w-4 text-amber-500" />
                        </div>
                        <div className="mt-2">
                            <div className="text-2xl font-bold text-amber-600">
                                {(suppliers?.reduce((acc, s) => acc + s.vendorRating, 0) || 0 / (suppliers?.length || 1)).toFixed(1)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                On-Time In-Full score
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-4 pb-2">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">{t('inventory.registry.stats.procurementLoad', 'Procurement Load')}</p>
                            <Users className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="mt-2">
                            <div className="text-2xl font-bold">124 POs</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Open active orders
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <Input
                        placeholder={t('inventory.registry.searchPlaceholder')}
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
                                <TableHead>{t('inventory.registry.table.supplier')}</TableHead>
                                <TableHead>{t('inventory.registry.table.contact')}</TableHead>
                                <TableHead>{t('inventory.registry.table.performance')}</TableHead>
                                <TableHead>{t('inventory.registry.table.leadTime')}</TableHead>
                                <TableHead className="text-right">{t('common.actions')}</TableHead>
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
                                        {t('inventory.registry.table.noSuppliers')}
                                    </TableCell>
                                </TableRow>
                            ) : filteredSuppliers?.map(supplier => (
                                <TableRow 
                                    key={supplier.id} 
                                    className="group cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => navigate(`/inventory/vendors/${supplier.id}`)}
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <Truck className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-foreground">{supplier.companyName}</div>
                                                <div className="text-xs text-muted">{t('common.id')}: {supplier.id.slice(0, 8)}</div>
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
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5 text-yellow-500 text-sm font-bold">
                                                    <Star className="h-3.5 w-3.5 fill-current" />
                                                    {supplier.vendorRating}
                                                </div>
                                                <div className="text-[10px] text-muted flex items-center gap-1">
                                                    <ShieldCheck className="h-2.5 w-2.5" />
                                                    {supplier.reliabilityScore}% rel.
                                                </div>
                                            </div>
                                            <Badge variant="outline" className={cn(
                                                "text-[9px] h-4 px-1 capitalize whitespace-nowrap",
                                                supplier.reliabilityScore > 95 ? "border-emerald-500 text-emerald-600 bg-emerald-50" :
                                                supplier.reliabilityScore > 85 ? "border-blue-500 text-blue-600 bg-blue-50" :
                                                "border-amber-500 text-amber-600 bg-amber-50"
                                            )}>
                                                {supplier.reliabilityScore > 95 ? 'Premium' : supplier.reliabilityScore > 85 ? 'Reliable' : 'Standard'}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                                                <Clock className="h-3.5 w-3.5 text-muted" />
                                                {supplier.leadTimeDays} {t('inventory.registry.performance.days')}
                                            </div>
                                            <div className="text-[10px] text-muted ml-5">
                                                ±{supplier.leadTimeVariance}d variance
                                            </div>
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
                                                {t('inventory.registry.actions.users')}
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
                                                {t('inventory.registry.actions.catalog')}
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
                                                {t('inventory.registry.actions.policy')}
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
                        <DialogTitle>{t('inventory.catalog.importTitle')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-muted">
                            {t('inventory.catalog.importDesc')}
                        </p>
                        <textarea
                            className="w-full h-64 p-4 rounded-md border bg-black text-xs font-mono text-emerald-400 focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder={t('inventory.catalog.placeholder')}
                            value={catalogJson}
                            onChange={e => setCatalogJson(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>{t('common.cancel')}</Button>
                        <Button
                            disabled={!catalogJson || !selectedSupplierId || importCatalogMutation.isPending}
                            onClick={async () => {
                                try {
                                    const items = JSON.parse(catalogJson);
                                    await importCatalogMutation.mutateAsync({ items });
                                    toast.success(t('inventory.catalog.toast.success'));
                                    setIsImportDialogOpen(false);
                                    setCatalogJson('');
                                } catch (e) {
                                    toast.error(t('inventory.catalog.toast.error'));
                                }
                            }}
                        >
                            {importCatalogMutation.isPending ? t('inventory.catalog.importing') : t('inventory.catalog.startImport')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Manage Users Dialog */}
            <Dialog open={isUsersDialogOpen} onOpenChange={setIsUsersDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader className="flex flex-row items-center justify-between">
                        <DialogTitle>{t('inventory.users.title')}</DialogTitle>
                        <Button
                            size="sm"
                            className="gap-2"
                            onClick={() => setIsInviteDialogOpen(true)}
                        >
                            <UserPlus className="h-4 w-4" />
                            {t('inventory.users.inviteUser')}
                        </Button>
                    </DialogHeader>
                    <div className="py-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('inventory.users.table.name')}</TableHead>
                                    <TableHead>{t('inventory.users.table.contact')}</TableHead>
                                    <TableHead>{t('inventory.users.table.role')}</TableHead>
                                    <TableHead>{t('inventory.users.table.status')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {supplierUsers?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-muted">
                                            {t('inventory.users.noUsers')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    supplierUsers?.map(user => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.fullName}</TableCell>
                                            <TableCell>
                                                <div className="text-sm">{user.email}</div>
                                                <div className="text-xs text-muted">{user.phoneNumber || t('inventory.users.noPhone')}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="text-[10px]">
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={user.active ? 'default' : 'destructive'} className="text-[10px]">
                                                    {user.active ? t('inventory.users.status.active') : t('inventory.users.status.inactive')}
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
                        <DialogTitle>{t('inventory.users.inviteUser')}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">{t('inventory.users.table.name')}</label>
                            <Input
                                placeholder={t('inventory.users.placeholders.fullName')}
                                value={inviteData.fullName}
                                onChange={e => setInviteData({ ...inviteData, fullName: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">{t('inventory.registry.email')}</label>
                            <Input
                                type="email"
                                placeholder={t('inventory.registry.placeholders.email')}
                                value={inviteData.email}
                                onChange={e => setInviteData({ ...inviteData, email: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">{t('inventory.users.phoneOptional')}</label>
                            <Input
                                placeholder={t('inventory.registry.placeholders.phone')}
                                value={inviteData.phoneNumber}
                                onChange={e => setInviteData({ ...inviteData, phoneNumber: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">{t('inventory.users.portalRole')}</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={inviteData.role}
                                onChange={e => setInviteData({ ...inviteData, role: e.target.value as SupplierRole })}
                            >
                                <option value="SUPPLIER_BIDDER">{t('inventory.users.roles.bidder')}</option>
                                <option value="SUPPLIER_ADMIN">{t('inventory.users.roles.admin')}</option>
                                <option value="SUPPLIER_PLANNER">{t('inventory.users.roles.planner')}</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>{t('common.cancel')}</Button>
                        <Button
                            disabled={!inviteData.fullName || !inviteData.email || inviteUserMutation.isPending}
                            onClick={async () => {
                                try {
                                    await inviteUserMutation.mutateAsync(inviteData);
                                    toast.success(t('inventory.users.toast.success'));
                                    setIsInviteDialogOpen(false);
                                    setInviteData({ fullName: '', email: '', phoneNumber: '', role: 'SUPPLIER_BIDDER' });
                                } catch (e) {
                                    toast.error(t('inventory.users.toast.error'));
                                }
                            }}
                        >
                            {inviteUserMutation.isPending ? t('common.processing') : t('inventory.users.sendInvite')}
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
    const { t } = useTranslation();
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
            toast.success(t('inventory.policy.toast.success'));
            onClose();
        } catch (error) {
            toast.error(t('inventory.policy.toast.error'));
        }
    };

    if (isLoading) return <div className="p-8 text-center animate-pulse">{t('inventory.policy.loading')}</div>;

    return (
        <DialogContent className="max-w-xl">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    {t('inventory.policy.title')}
                </DialogTitle>
                <p className="text-sm text-muted">{t('inventory.policy.desc')}</p>
            </DialogHeader>
            
            <div className="space-y-6 py-4 overflow-y-auto max-h-[70vh]">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="space-y-0.5">
                        <label className="text-sm font-semibold">{t('inventory.policy.autoAck')}</label>
                        <p className="text-xs text-muted">{t('inventory.policy.autoAckDesc')}</p>
                    </div>
                    <Switch 
                        checked={localPolicy.autoAcknowledge} 
                        onCheckedChange={(val) => setLocalPolicy({ ...localPolicy, autoAcknowledge: val })}
                    />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="space-y-0.5">
                        <label className="text-sm font-semibold">{t('inventory.policy.allowCounter')}</label>
                        <p className="text-xs text-muted">{t('inventory.policy.allowCounterDesc')}</p>
                    </div>
                    <Switch 
                        checked={localPolicy.counterOfferAllowed} 
                        onCheckedChange={(val) => setLocalPolicy({ ...localPolicy, counterOfferAllowed: val })}
                    />
                </div>

                <div className="space-y-3 p-3 rounded-lg border border-divider">
                    <label className="text-sm font-semibold">{t('inventory.policy.paymentTerms')}</label>
                    <Input 
                        placeholder={t('inventory.policy.placeholders.paymentTerms')}
                        value={localPolicy.paymentTerms || ''}
                        onChange={(e) => setLocalPolicy({ ...localPolicy, paymentTerms: e.target.value })}
                    />
                </div>

                <div className="space-y-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold">{t('inventory.policy.priceTolerance')}</label>
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
                        <label className="text-sm font-semibold">{t('inventory.policy.qtyTolerance')}</label>
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
                <Button variant="outline" onClick={onClose}>{t('common.dismiss')}</Button>
                <Button onClick={handleSave} disabled={updatePolicy.isPending} className="min-w-[120px]">
                    {updatePolicy.isPending ? t('common.wait') : t('inventory.policy.save')}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};
