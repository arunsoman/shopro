import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, Monitor } from 'lucide-react';
import { useKdsStations, useCreateKdsStation, useUpdateKdsStation, useDeleteKdsStation, useToggleKdsStationStatus } from '../../hooks/useKdsStations';
import type { KDSStation } from '../../api/kdsStationApi';

const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    stationType: z.enum(['PREP', 'EXPO', 'BEVERAGE']),
});

type FormData = z.infer<typeof formSchema>;

export const KdsStationSettings = () => {
    const { data: stations, isLoading } = useKdsStations();
    const deleteMutation = useDeleteKdsStation();
    const toggleMutation = useToggleKdsStationStatus();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingStation, setEditingStation] = useState<KDSStation | null>(null);

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this station? Route rules will also be deleted.')) {
            deleteMutation.mutate(id);
        }
    };

    const openEdit = (station: KDSStation) => {
        setEditingStation(station);
        setIsDialogOpen(true);
    };

    const openCreate = () => {
        setEditingStation(null);
        setIsDialogOpen(true);
    };

    return (
        <Card className="bg-surface border-border">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl font-bold">Kitchen Stations</CardTitle>
                    <CardDescription className="text-muted">Manage KDS screens and display types</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreate} className="btn-primary">
                            <Plus className="w-4 h-4 mr-2" /> Add Station
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-surface border-border text-foreground">
                        <DialogHeader>
                            <DialogTitle>{editingStation ? 'Edit Station' : 'Create Station'}</DialogTitle>
                        </DialogHeader>
                        <KdsStationForm
                            initialData={editingStation}
                            onSuccess={() => setIsDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="py-20 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted">Loading stations...</p>
                    </div>
                ) : !stations?.length ? (
                    <div className="py-20 text-center border-2 border-dashed border-border rounded-xl">
                        <Monitor className="w-12 h-12 text-muted/30 mx-auto mb-4" />
                        <p className="text-muted">No kitchen stations configured yet.</p>
                        <Button variant="link" onClick={openCreate} className="text-primary mt-2">
                            Add your first station
                        </Button>
                    </div>
                ) : (
                    <div className="rounded-md border border-border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/5">
                                <TableRow className="border-border hover:bg-transparent">
                                    <TableHead className="text-muted">Name</TableHead>
                                    <TableHead className="text-muted">Type</TableHead>
                                    <TableHead className="text-muted">Status</TableHead>
                                    <TableHead className="text-right text-muted">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stations.map((station) => (
                                    <TableRow key={station.id} className="border-border hover:bg-muted/5 transition-colors">
                                        <TableCell className="font-medium text-foreground">{station.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="border-border text-muted">
                                                {station.stationType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                onClick={() => toggleMutation.mutate(station.id)}
                                                className="focus:outline-none"
                                                title="Click to toggle status"
                                            >
                                                {station.online ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                                                        <span className="text-xs text-success font-medium">Online</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-muted"></div>
                                                        <span className="text-xs text-muted font-medium">Offline</span>
                                                    </div>
                                                )}
                                            </button>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(station)} className="hover:bg-primary/10 hover:text-primary">
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(station.id)} className="hover:bg-error/10 hover:text-error">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

interface KdsStationFormProps {
    initialData: KDSStation | null;
    onSuccess: () => void;
}

const KdsStationForm = ({ initialData, onSuccess }: KdsStationFormProps) => {
    const createMutation = useCreateKdsStation();
    const updateMutation = useUpdateKdsStation();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || '',
            stationType: initialData?.stationType || 'PREP',
        },
    });

    const onSubmit = (values: FormData) => {
        if (initialData) {
            updateMutation.mutate({ id: initialData.id, data: values }, { onSuccess });
        } else {
            createMutation.mutate(values, { onSuccess });
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="space-y-2">
                <Label htmlFor="name" className="text-muted">Station Name</Label>
                <Input
                    id="name"
                    placeholder="e.g., Grill Station"
                    className="bg-background border-border text-foreground placeholder:text-muted/50 focus:ring-primary"
                    {...form.register("name")}
                />
                {form.formState.errors.name && (
                    <p className="text-xs text-error mt-1">{form.formState.errors.name.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="stationType" className="text-muted">Station Type</Label>
                <select
                    id="stationType"
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...form.register("stationType")}
                >
                    <option value="PREP">Prep Station (Standard)</option>
                    <option value="EXPO">Expeditor (Consolidated)</option>
                    <option value="BEVERAGE">Beverage/Bar</option>
                </select>
                {form.formState.errors.stationType && (
                    <p className="text-xs text-error mt-1">{form.formState.errors.stationType.message}</p>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onSuccess()}
                    className="text-muted hover:text-foreground hover:bg-muted/10"
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="btn-primary">
                    {isPending ? 'Saving...' : 'Save Station'}
                </Button>
            </div>
        </form>
    );
};
