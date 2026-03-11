import React from 'react';
import {
    TrendingUp,
    CheckCircle2,
    XCircle,
    Clock,
    ShoppingCart,
    ExternalLink
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupplierAuth } from '@/features/auth/SupplierAuthContext';
import { useMyProposals } from '../hooks/useSupplierPortal';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export const SupplierProposalsList: React.FC = () => {
    const { session } = useSupplierAuth();
    const { data: proposals, isLoading } = useMyProposals(session?.supplierId);

    if (isLoading) return <div className="text-slate-500">Fetching your proposals...</div>;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACCEPTED':
                return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400">Accepted</Badge>;
            case 'REJECTED':
                return <Badge className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-400">Rejected</Badge>;
            default:
                return <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400">Pending</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4">
                {!proposals || proposals.length === 0 ? (
                    <Card className="border-dashed border-2 py-16 text-center text-slate-500 bg-transparent">
                        <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-10" />
                        <p>You haven't submitted any proactive price proposals yet.</p>
                        <p className="text-xs">Use the inventory view to propose new prices for your products.</p>
                    </Card>
                ) : (
                    proposals.map(proposal => (
                        <Card key={proposal.id} className="hover:border-indigo-200 transition-colors shadow-sm dark:bg-slate-900 border-none">
                            <CardContent className="p-6">
                                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{proposal.ingredientName}</h3>
                                            {getStatusBadge(proposal.status)}
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                            <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                                                Proposed: ${proposal.proposedPrice.toFixed(2)} / {proposal.unitOfMeasure}
                                            </div>
                                            <div className="text-slate-400">
                                                (Current: ${proposal.currentPrice.toFixed(2)})
                                            </div>
                                            <div className="flex items-center gap-1.5 border-l pl-4">
                                                <Clock className="h-4 w-4" />
                                                Submitted: {format(new Date(proposal.createdAt), 'MMM d, HH:mm')}
                                            </div>
                                        </div>
                                        {proposal.notes && (
                                            <p className="text-sm italic text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-2 rounded">
                                                "{proposal.notes}"
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {proposal.generatedPoId ? (
                                            <Button variant="outline" className="gap-2 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/20" asChild>
                                                <Link to={`/supplier/po/${proposal.generatedPoId}`}>
                                                    <ShoppingCart className="h-4 w-4 text-emerald-600" />
                                                    View PO
                                                    <ExternalLink className="h-3 w-3 ml-1" />
                                                </Link>
                                            </Button>
                                        ) : proposal.status === 'ACCEPTED' ? (
                                            <div className="text-xs text-amber-600 flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                                                <Clock className="h-3 w-3" />
                                                PO Generation Pending
                                            </div>
                                        ) : null}
                                        
                                        {proposal.status === 'REJECTED' && (
                                            <XCircle className="h-5 w-5 text-rose-300" />
                                        )}
                                        {proposal.status === 'ACCEPTED' && !proposal.generatedPoId && (
                                            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
