import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { STAFF_ROLES, UpdateRoleSchema, type UpdateRoleRequest, type StaffMemberResponse } from '../schema/staffSchema';
import { useUpdateRole } from '../hooks/useStaff';

interface Props {
    member: StaffMemberResponse | null;
    onClose: () => void;
}

export const EditRoleModal: React.FC<Props> = ({ member, onClose }) => {
    const { mutate, isPending } = useUpdateRole();
    const { register, handleSubmit } = useForm<UpdateRoleRequest>({
        resolver: zodResolver(UpdateRoleSchema),
        defaultValues: { role: member?.role },
    });

    const onSubmit = (data: UpdateRoleRequest) => {
        if (!member) return;
        mutate({ id: member.id, role: data.role }, { onSuccess: onClose });
    };

    return (
        <Dialog open={!!member} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Change Role — {member?.fullName}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>New Role</Label>
                        <select
                            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            {...register('role')}
                        >
                            {STAFF_ROLES.map(r => (
                                <option key={r} value={r}>{r.replace('_', ' ')}</option>
                            ))}
                        </select>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Saving…' : 'Update Role'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
