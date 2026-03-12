import React, { useState } from 'react';
import { useStaff, useDeactivateStaff, useReactivateStaff } from '../hooks/useStaff';
import { CreateStaffModal } from '../components/CreateStaffModal';
import { EditRoleModal } from '../components/EditRoleModal';
import {cn} from '@/lib/utils';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { UserPlus, Pencil, PowerOff, RefreshCcw, ShieldCheck } from 'lucide-react';
import { STAFF_ROLES, type StaffMemberResponse } from '../schema/staffSchema';
import { useNavigate } from 'react-router-dom';

const ROLE_COLORS: Record<string, string> = {
    OWNER: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    MANAGER: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    GENERAL_MANAGER: 'bg-violet-600/10 text-violet-700 dark:text-violet-300 border-violet-600/20',
    ASSISTANT_MANAGER: 'bg-violet-400/10 text-violet-500 dark:text-violet-200 border-violet-400/20',
    FB_MANAGER: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    KITCHEN_MANAGER: 'bg-orange-600/10 text-orange-700 dark:text-orange-300 border-orange-600/20',
    EXECUTIVE_CHEF: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    SOUS_CHEF: 'bg-orange-400/10 text-orange-500 dark:text-orange-300 border-orange-400/20',
    CHEF_DE_PARTIE: 'bg-orange-300/10 text-orange-400 dark:text-orange-200 border-orange-300/20',
    LINE_COOK: 'bg-orange-200/10 text-orange-300 dark:text-orange-100 border-orange-200/20',
    PREP_COOK: 'bg-muted/10 text-muted-foreground border-border',
    DISHWASHER: 'bg-muted/20 text-muted-foreground border-border',
    MAITRE_D: 'bg-cyan-600/10 text-cyan-700 dark:text-cyan-300 border-cyan-600/20',
    HOST: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    BARTENDER: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    BUSSER: 'bg-muted/10 text-muted-foreground border-border',
    RUNNER: 'bg-emerald-400/10 text-emerald-500 dark:text-emerald-300 border-emerald-400/20',
    SENIOR_SERVER: 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 border-emerald-600/20',
    JUNIOR_SERVER: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
};

export const StaffListPage: React.FC = () => {
    const navigate = useNavigate();
    const [roleFilter, setRoleFilter] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<StaffMemberResponse | null>(null);

    const { data: staff, isLoading } = useStaff(roleFilter || undefined);
    const { mutate: deactivate, isPending: deactivating } = useDeactivateStaff();
    const { mutate: reactivate, isPending: reactivating } = useReactivateStaff();

    const formatDate = (iso: string | null) =>
        iso ? new Date(iso).toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage team members, roles, and access PINs.
                    </p>
                </div>
                <div className="flex gap-2 shrink-0">
                    <Button variant="outline" onClick={() => navigate('/settings/roles')} className="gap-2">
                        <ShieldCheck className="h-4 w-4" /> Manage Roles
                    </Button>
                    <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                        <UserPlus className="h-4 w-4" /> Add Staff
                    </Button>
                </div>
            </div>

            {/* Role filter tabs */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setRoleFilter('')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${roleFilter === ''
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:text-foreground'
                        }`}
                >
                    All Roles
                </button>
                {STAFF_ROLES.map(r => (
                    <button
                        key={r}
                        onClick={() => setRoleFilter(r === roleFilter ? '' : r)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${roleFilter === r
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {r.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Stats strip */}
            {staff && (
                <div className="flex gap-4 text-sm text-muted-foreground">
                    <span><strong className="text-foreground">{staff.filter(s => s.active).length}</strong> active</span>
                    <span><strong className="text-foreground">{staff.filter(s => !s.active).length}</strong> inactive</span>
                    <span><strong className="text-foreground">{staff.length}</strong> total</span>
                </div>
            )}

            {/* Table */}
            <div className="rounded-xl border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                {Array.from({ length: 6 }).map((_, j) => (
                                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                                ))}
                            </TableRow>
                        ))}

                        {!isLoading && staff?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                    No staff members found.
                                </TableCell>
                            </TableRow>
                        )}

                        {staff?.map(member => (
                            <TableRow key={member.id} className={!member.active ? 'opacity-50' : ''}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border",
                                            ROLE_COLORS[member.role] ?? 'bg-muted text-muted-foreground border-border'
                                        )}>
                                            {member.fullName.charAt(0).toUpperCase()}
                                        </div>
                                        {member.fullName}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={ROLE_COLORS[member.role] ?? ''}>
                                        {member.role.replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {member.active
                                        ? <Badge variant="secondary" className="bg-success/10 text-success dark:text-success border-success/20">Active</Badge>
                                        : <Badge variant="secondary" className="bg-muted/10 text-muted-foreground dark:text-muted-foreground border-muted/20">Inactive</Badge>
                                    }
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {formatDate(member.lastLoginAt)}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {formatDate(member.createdAt)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="Change role"
                                            onClick={() => setEditTarget(member)}
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        {member.active ? (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Deactivate"
                                                className="text-destructive hover:text-destructive"
                                                disabled={deactivating}
                                                onClick={() => deactivate(member.id)}
                                            >
                                                <PowerOff className="h-3.5 w-3.5" />
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Reactivate"
                                                className="text-emerald-500 hover:text-emerald-400"
                                                disabled={reactivating}
                                                onClick={() => reactivate(member.id)}
                                            >
                                                <RefreshCcw className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <CreateStaffModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
            <EditRoleModal member={editTarget} onClose={() => setEditTarget(null)} />
        </div>
    );
};
