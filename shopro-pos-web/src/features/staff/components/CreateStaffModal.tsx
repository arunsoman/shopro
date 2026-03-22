import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreateStaffSchema, type CreateStaffRequest } from '../schema/staffSchema';
import { useCreateStaff, useRoles } from '../hooks/useStaff';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateStaffModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { mutate, isPending } = useCreateStaff();
    const { data: roles } = useRoles();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateStaffRequest>({
        resolver: zodResolver(CreateStaffSchema),
    });

    const onSubmit = (data: CreateStaffRequest) => {
        mutate(data, { onSuccess: () => { reset(); onClose(); } });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:">
                <DialogHeader>
                    <DialogTitle>{t('staff.createStaff.title')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">{t('staff.createStaff.fullName')}</Label>
                        <Input id="fullName" {...register('fullName')} placeholder={t('staff.createStaff.fullNamePlaceholder')} />
                        {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">{t('staff.table.role')}</Label>
                        <select
                            id="role"
                            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            {...register('role')}
                        >
                            <option value="">{t('staff.createStaff.rolePlaceholder')}</option>
                            {roles?.map(r => (
                                <option key={r.id} value={r.name}>{t(`roles.${r.name}`)}</option>
                            ))}
                        </select>
                        {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="pin">{t('staff.createStaff.pin')}</Label>
                        <Input
                            id="pin"
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            placeholder="••••"
                            {...register('pin')}
                        />
                        {errors.pin && <p className="text-xs text-destructive">{errors.pin.message}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? t('staff.createStaff.creating') : t('staff.createStaff.button')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
