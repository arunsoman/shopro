import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UpdateRoleSchema, type UpdateRoleRequest, type StaffMemberResponse } from '../schema/staffSchema';
import { useUpdateRole, useRoles } from '../hooks/useStaff';

interface Props {
    member: StaffMemberResponse | null;
    onClose: () => void;
}

export const EditRoleModal: React.FC<Props> = ({ member, onClose }) => {
    const { t } = useTranslation();
    const { mutate, isPending } = useUpdateRole();
    const { data: roles } = useRoles();
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
                    <DialogTitle>{t('staff.editRole.title', { name: member?.fullName })}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>{t('staff.editRole.newRole')}</Label>
                        <select
                            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            {...register('role')}
                        >
                            <option value="">{t('staff.createStaff.rolePlaceholder')}</option>
                            {roles?.map(r => (
                                <option key={r.id} value={r.name}>{t(`roles.${r.name}`)}</option>
                            ))}
                        </select>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? t('common.processing') : t('staff.editRole.button')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
