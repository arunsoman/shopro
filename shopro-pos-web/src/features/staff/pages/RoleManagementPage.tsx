import React, { useState } from 'react';
import { useRoles, usePermissions, useDeleteRole } from '../hooks/useStaff';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Plus, ChevronRight, Lock, Trash2, Edit } from 'lucide-react';
import { RoleEditorModal } from '../components/RoleEditorModal';
import type { RoleResponse } from '../schema/staffSchema';

export const RoleManagementPage: React.FC = () => {
    const { data: roles, isLoading: loadingRoles } = useRoles();
    const { data: permissions } = usePermissions();
    const deleteMutation = useDeleteRole();

    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<RoleResponse | null>(null);

    const categories = Array.from(new Set(permissions?.map(p => p.category) || []));

    const openCreate = () => {
        setEditTarget(null);
        setIsEditorOpen(true);
    };

    const openEdit = (role: RoleResponse) => {
        setEditTarget(role);
        setIsEditorOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this role? This might affect staff members assigned to it.')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Access Control & Roles</h1>
                    <p className="text-muted-foreground mt-1">
                        Define dynamic permission sets and hardware binding policies.
                    </p>
                </div>
                <Button className="gap-2" onClick={openCreate}>
                    <Plus className="h-4 w-4" /> Create Custom Role
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Role List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        <Shield className="h-4 w-4" /> Active Roles
                    </div>

                    <div className="rounded-xl border bg-card overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Role Name</TableHead>
                                    <TableHead>Permissions</TableHead>
                                    <TableHead>Inheritance</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingRoles ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    roles?.map(role => (
                                        <TableRow key={role.id}>
                                            <TableCell className="font-bold">{role.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{role.permissions.length} perms</Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {role.parentRoleId ? "Inherited" : "Base"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => openEdit(role)}>
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleDelete(role.id)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Permissions Reference / Quick View */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        <Lock className="h-4 w-4" /> Permission Matrix
                    </div>

                    <div className="rounded-xl border bg-card p-4 space-y-6">
                        {categories.map(cat => (
                            <div key={cat} className="space-y-2">
                                <h3 className="text-xs font-bold text-muted-foreground/50 flex items-center gap-2">
                                    <ChevronRight className="h-3 w-3" /> {cat}
                                </h3>
                                <div className="space-y-1">
                                    {permissions?.filter(p => p.category === cat).map(p => (
                                        <div key={p.id} className="text-xs flex justify-between items-center group">
                                            <span className="font-mono text-foreground/80">{p.name}</span>
                                            <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                                {p.description}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <RoleEditorModal
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                role={editTarget}
                allPermissions={permissions}
            />
        </div>
    );
};
