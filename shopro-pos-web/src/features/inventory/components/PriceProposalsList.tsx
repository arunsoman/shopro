import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Check, X, Tag, History, Clock, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAuth } from '@/lib/auth/AuthContext';
import { usePendingProposals, useReviewProposal, useProposalHistory, useCreatePoFromProposal } from '../hooks/usePriceProposals';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const PriceProposalsList: React.FC = () => {
    const { session } = useAuth();
    const { data: pendingProposals, isLoading: isPendingLoading } = usePendingProposals();
    const { data: historyProposals, isLoading: isHistoryLoading } = useProposalHistory();
    const reviewProposal = useReviewProposal();
    const createPO = useCreatePoFromProposal();

    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const handleAccept = async (id: string, ingredientName: string) => {
        try {
            await reviewProposal.mutateAsync({
                id,
                request: {
                    status: 'ACCEPTED',
                    staffId: session?.id || ''
                }
            });
            toast.success(`Proposal for ${ingredientName} accepted successfully.`);
        } catch (error) {
            toast.error('Failed to accept proposal.');
        }
    };

    const handleRejectClick = (id: string) => {
        setSelectedProposalId(id);
        setRejectReason('');
        setIsRejectDialogOpen(true);
    };

    const submitReject = async () => {
        if (!selectedProposalId) return;
        try {
            await reviewProposal.mutateAsync({
                id: selectedProposalId,
                request: {
                    status: 'REJECTED',
                    reason: rejectReason,
                    staffId: session?.id || ''
                }
            });
            toast.success('Proposal rejected.');
            setIsRejectDialogOpen(false);
            setSelectedProposalId(null);
        } catch (error) {
            toast.error('Failed to reject proposal.');
        }
    };

    const handleCreatePO = async (proposalId: string, ingredientName: string) => {
        try {
            await createPO.mutateAsync({
                id: proposalId,
                staffId: session?.id || ''
            });
            toast.success(`Draft PO created for ${ingredientName}.`);
        } catch (error) {
            toast.error('Failed to create draft PO.');
        }
    };

    if (isPendingLoading || isHistoryLoading) {
        return <div className="p-4 text-center">Loading proposals...</div>;
    }

    const renderProposalTable = (proposals: any[], isHistory = false) => {
        if (!proposals || proposals.length === 0) {
            return (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Tag className="h-12 w-12 mb-4 opacity-20" />
                        <p>{isHistory ? 'No proposal history found.' : 'No pending price proposals to review.'}</p>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Supplier</TableHead>
                                <TableHead>Ingredient</TableHead>
                                <TableHead>Current Price</TableHead>
                                <TableHead>Proposed Price</TableHead>
                                <TableHead>Notes</TableHead>
                                {isHistory ? <TableHead>Status</TableHead> : <TableHead className="text-right">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {proposals.map((proposal) => {
                                const isLower = proposal.proposedPrice < proposal.currentPrice;
                                return (
                                    <TableRow key={proposal.id}>
                                        <TableCell>{format(new Date(isHistory ? proposal.reviewedAt || proposal.createdAt : proposal.createdAt), 'MMM d, yyyy')}</TableCell>
                                        <TableCell className="font-medium">{proposal.supplierName}</TableCell>
                                        <TableCell>{proposal.ingredientName}</TableCell>
                                        <TableCell>${proposal.currentPrice.toFixed(2)} / {proposal.unitOfMeasure}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">${proposal.proposedPrice.toFixed(2)}</span>
                                                {isLower && (
                                                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                                                        Savings
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate text-muted-foreground" title={proposal.notes}>
                                            {proposal.notes || '-'}
                                        </TableCell>
                                        <TableCell className={isHistory ? 'text-right' : 'text-right'}>
                                            {isHistory ? (
                                                <div className="flex justify-end items-center gap-3">
                                                    {proposal.generatedPoStatus ? (
                                                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                                                            {proposal.generatedPoStatus.replace('_', ' ')}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant={proposal.status === 'ACCEPTED' ? 'success' : 'destructive'} className={proposal.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : ''}>
                                                            {proposal.status}
                                                        </Badge>
                                                    )}
                                                    {proposal.status === 'ACCEPTED' && !proposal.generatedPoId && (
                                                        <Button 
                                                            size="sm" 
                                                            variant="ghost" 
                                                            className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10"
                                                            onClick={() => handleCreatePO(proposal.id, proposal.ingredientName)}
                                                            title="Create Draft PO"
                                                        >
                                                            <ShoppingCart className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="outline" className="text-red-500 hover:bg-red-50" onClick={() => handleRejectClick(proposal.id)}>
                                                        <X className="h-4 w-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                    <Button size="sm" onClick={() => handleAccept(proposal.id, proposal.ingredientName)}>
                                                        <Check className="h-4 w-4 mr-1" />
                                                        Accept
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-4">
            <Tabs defaultValue="pending">
                <div className="flex items-center justify-between mb-2">
                    <TabsList>
                        <TabsTrigger value="pending" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Pending Proposals
                            {pendingProposals && pendingProposals.length > 0 && (
                                <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-none">
                                    {pendingProposals.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Review History
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="pending" className="mt-0">
                    {renderProposalTable(pendingProposals || [])}
                </TabsContent>

                <TabsContent value="history" className="mt-0">
                    {renderProposalTable(historyProposals || [], true)}
                </TabsContent>
            </Tabs>

            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Price Proposal</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this proposal. This will be visible to the supplier (optional).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input 
                            value={rejectReason}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRejectReason(e.target.value)}
                            placeholder="e.g., Price is still too high compared to market..."
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={submitReject}>Reject Proposal</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
