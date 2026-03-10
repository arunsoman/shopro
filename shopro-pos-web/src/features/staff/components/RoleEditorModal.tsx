import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { RoleResponse, Permission } from '../schema/staffSchema';
import { useUpdateRoleEntity, useCreateRole } from '../hooks/useStaff';

interface Props {
    role: RoleResponse | null;
    isOpen: boolean;
    onClose: () => void;
    allPermissions: Permission[] | undefined;
}

export const RoleEditorModal: React.FC<Props> = ({ role, isOpen, onClose, allPermissions }) => {
    const updateMutation = useUpdateRoleEntity();
    const createMutation = useCreateRole();

    const { register, handleSubmit, reset, watch, setValue } = useForm({
        defaultValues: {
            name: '',
            description: '',
            permissions: [] as string[]
        }
    });

    const selectedPermissions = watch('permissions');

    useEffect(() => {
        if (role) {
            reset({
                name: role.name,
                description: role.description,
                permissions: role.permissions
            });
        } else {
            reset({ name: '', description: '', permissions: [] });
        }
    }, [role, reset]);

    const onSubmit = (data: any) => {
        if (role) {
            updateMutation.mutate({ id: role.id, data }, { onSuccess: onClose });
        } else {
            createMutation.mutate(data, { onSuccess: onClose });
        }
    };

    const togglePermission = (permName: string) => {
        const current = [...selectedPermissions];
        const index = current.indexOf(permName);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(permName);
        }
        setValue('permissions', current);
    };

    const categories = Array.from(new Set(allPermissions?.map(p => p.category) || []));

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{role ? `Edit Role: ${role.name}` : 'Create New Role'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Role Name</Label>
                            <Input {...register('name')} placeholder="e.g. FLOOR_MANAGER" />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input {...register('description')} placeholder="Brief role summary" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-base">Permissions Matrix</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border rounded-xl p-4 bg-muted/30">
                            {categories.map(cat => (
                                <div key={cat} className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">
                                        {cat}
                                    </h4>
                                    <div className="space-y-2">
                                        {allPermissions?.filter(p => p.category === cat).map(p => (
                                            <div key={p.id} className="flex items-start gap-3 group">
                                                <Checkbox
                                                    id={p.id}
                                                    checked={selectedPermissions.includes(p.name)}
                                                    onCheckedChange={() => togglePermission(p.name)}
                                                />
                                                <div className="grid gap-1 leading-none">
                                                    <label
                                                        htmlFor={p.id}
                                                        className="text-sm font-medium leading-none cursor-pointer group-hover:text-primary transition-colors"
                                                    >
                                                        {p.name}
                                                    </label>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {p.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={updateMutation.isPending || createMutation.isPending}>
                            {role ? 'Save Changes' : 'Create Role'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
