import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreateStaffSchema, STAFF_ROLES, type CreateStaffRequest } from '../schema/staffSchema';
import { useCreateStaff } from '../hooks/useStaff';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateStaffModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const { mutate, isPending } = useCreateStaff();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateStaffRequest>({
        resolver: zodResolver(CreateStaffSchema),
    });

    const onSubmit = (data: CreateStaffRequest) => {
        mutate(data, { onSuccess: () => { reset(); onClose(); } });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New Staff Member</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" {...register('fullName')} placeholder="e.g. Arun Kumar" />
                        {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <select
                            id="role"
                            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            {...register('role')}
                        >
                            <option value="">Select a role…</option>
                            {STAFF_ROLES.map(r => (
                                <option key={r} value={r}>{r.replace('_', ' ')}</option>
                            ))}
                        </select>
                        {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="pin">4-Digit PIN</Label>
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
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Creating…' : 'Create Staff'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
