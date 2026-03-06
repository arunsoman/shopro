import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, GitBranch, ArrowRight } from 'lucide-react';
import { useKdsRoutingRules, useCreateKdsRoutingRule, useDeleteKdsRoutingRule } from '../../hooks/useKdsRoutingRules';
import { useKdsStations } from '../../hooks/useKdsStations';
import { useMenuCategories } from '../../../menu/hooks/useMenuCategories';
import { usePublishedMenuItems } from '../../../menu/hooks/useMenuItems';

const ruleSchema = z.object({
    stationId: z.string().uuid('Please select a station'),
    targetType: z.enum(['CATEGORY', 'ITEM']),
    targetId: z.string().uuid('Please select a target'),
});

type RuleFormData = z.infer<typeof ruleSchema>;

export const KdsRoutingSettings = () => {
    const { data: rules, isLoading: rulesLoading } = useKdsRoutingRules();
    const deleteMutation = useDeleteKdsRoutingRule();

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to remove this routing rule?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <Card className="bg-surface border-border">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl font-bold">Kitchen Routing Rules</CardTitle>
                    <CardDescription className="text-muted">Route categories or specific items to kitchen stations</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="btn-primary">
                            <Plus className="w-4 h-4 mr-2" /> New Rule
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-surface border-border text-foreground max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create Routing Rule</DialogTitle>
                        </DialogHeader>
                        <KdsRoutingForm onSuccess={() => setIsDialogOpen(false)} />
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {rulesLoading ? (
                    <div className="py-20 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted">Loading rules...</p>
                    </div>
                ) : !rules?.length ? (
                    <div className="py-20 text-center border-2 border-dashed border-border rounded-xl">
                        <GitBranch className="w-12 h-12 text-muted/30 mx-auto mb-4" />
                        <p className="text-muted">No routing rules defined yet.</p>
                        <p className="text-xs text-muted/60 mt-1 max-w-xs mx-auto">
                            Rules determine which kitchen screen receives which order items.
                        </p>
                        <Button variant="link" onClick={() => setIsDialogOpen(true)} className="text-primary mt-2">
                            Add your first rule
                        </Button>
                    </div>
                ) : (
                    <div className="rounded-md border border-border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/5">
                                <TableRow className="border-border">
                                    <TableHead className="text-muted">Target (Category/Item)</TableHead>
                                    <TableHead className="text-muted text-center"><ArrowRight className="w-4 h-4 inline" /></TableHead>
                                    <TableHead className="text-muted">Kitchen Station</TableHead>
                                    <TableHead className="text-right text-muted">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rules.map((rule) => (
                                    <TableRow key={rule.id} className="border-border hover:bg-muted/5">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground">{rule.targetName}</span>
                                                <Badge variant="outline" className="w-fit scale-75 -ml-2 border-border text-muted px-2">
                                                    {rule.targetType}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center text-muted/40">
                                            <ArrowRight className="w-4 h-4 inline" />
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-primary font-medium">{rule.stationName}</span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)} className="hover:bg-error/10 hover:text-error">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
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

const KdsRoutingForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const { data: stations } = useKdsStations();
    const { data: categories } = useMenuCategories();
    const { data: items } = usePublishedMenuItems();
    const createMutation = useCreateKdsRoutingRule();

    const form = useForm<RuleFormData>({
        resolver: zodResolver(ruleSchema),
        defaultValues: {
            targetType: 'CATEGORY',
        },
    });

    const selectedType = form.watch('targetType');

    const onSubmit = (values: RuleFormData) => {
        createMutation.mutate(values, { onSuccess });
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="space-y-2">
                <Label className="text-muted">Target Type</Label>
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        type="button"
                        variant={selectedType === 'CATEGORY' ? 'default' : 'outline'}
                        className={selectedType === 'CATEGORY' ? 'bg-primary' : 'border-border text-muted'}
                        onClick={() => form.setValue('targetType', 'CATEGORY')}
                    >
                        Menu Category
                    </Button>
                    <Button
                        type="button"
                        variant={selectedType === 'ITEM' ? 'default' : 'outline'}
                        className={selectedType === 'ITEM' ? 'bg-primary' : 'border-border text-muted'}
                        onClick={() => form.setValue('targetType', 'ITEM')}
                    >
                        Specific Item
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="targetId" className="text-muted">
                    {selectedType === 'CATEGORY' ? 'Select Category' : 'Select Menu Item'}
                </Label>
                <select
                    id="targetId"
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary"
                    {...form.register("targetId")}
                >
                    <option value="">-- Select --</option>
                    {selectedType === 'CATEGORY'
                        ? categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                        : items?.map(i => <option key={i.id} value={i.id}>{i.name}</option>)
                    }
                </select>
                {form.formState.errors.targetId && (
                    <p className="text-xs text-red-500">{form.formState.errors.targetId.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="stationId" className="text-muted">Kitchen Station</Label>
                <select
                    id="stationId"
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary"
                    {...form.register("stationId")}
                >
                    <option value="">-- Choose destination --</option>
                    {stations?.map(s => <option key={s.id} value={s.id}>{s.name} ({s.stationType})</option>)}
                </select>
                {form.formState.errors.stationId && (
                    <p className="text-xs text-red-500">{form.formState.errors.stationId.message}</p>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onSuccess}
                    className="text-muted hover:text-foreground hover:bg-muted/10"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="btn-primary min-w-[120px]"
                >
                    {createMutation.isPending ? 'Creating...' : 'Add Rule'}
                </Button>
            </div>
        </form>
    );
};
