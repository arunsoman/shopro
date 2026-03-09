import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCustomerSearch, useMergeProfiles } from '../hooks/useCrm';
import { useDebounce } from 'use-debounce';
import { Search, User, AlertTriangle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import type { CustomerProfileResponse } from '../schema/crmSchema';

interface MergeProfilesModalProps {
    isOpen: boolean;
    onClose: () => void;
    sourceCustomer: CustomerProfileResponse;
}

export const MergeProfilesModal: React.FC<MergeProfilesModalProps> = ({
    isOpen,
    onClose,
    sourceCustomer,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch] = useDebounce(searchTerm, 500);
    const [targetCustomer, setTargetCustomer] = useState<CustomerProfileResponse | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);

    const { data: searchResults, isLoading: isSearching } = useCustomerSearch(debouncedSearch);
    const mergeMutation = useMergeProfiles();

    const handleMerge = async () => {
        if (!sourceCustomer || !targetCustomer) return;

        try {
            await mergeMutation.mutateAsync({
                sourceId: sourceCustomer.id,
                targetId: targetCustomer.id,
            });
            toast.success('Profiles merged successfully');
            onClose();
            setTargetCustomer(null);
            setIsConfirming(false);
        } catch (error) {
            toast.error('Failed to merge profiles');
        }
    };

    if (!sourceCustomer) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Merge Customer Profiles</DialogTitle>
                    <DialogDescription>
                        Combine {sourceCustomer.firstName} {sourceCustomer.lastName}'s data into another profile.
                    </DialogDescription>
                </DialogHeader>

                {!isConfirming ? (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Source Profile (To be deleted)</Label>
                            <div className="p-3 rounded-lg border bg-destructive/5 flex items-center gap-3 text-left">
                                <User className="h-4 w-4 text-destructive" />
                                <div>
                                    <div className="text-sm font-medium">{sourceCustomer.firstName} {sourceCustomer.lastName}</div>
                                    <div className="text-xs text-muted-foreground">{sourceCustomer.phoneNumber}</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 text-left">
                            <Label>Find Target Profile (To keep)</Label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by phone number..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {isSearching && <p className="text-sm text-center text-muted-foreground">Searching...</p>}

                        {searchResults && searchResults.length > 0 && (
                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                                {searchResults
                                    .filter((c: CustomerProfileResponse) => c.id !== sourceCustomer.id)
                                    .map((customer: CustomerProfileResponse) => (
                                        <div
                                            key={customer.id}
                                            className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center justify-between text-left ${
                                                targetCustomer?.id === customer.id 
                                                ? 'border-primary bg-primary/5' 
                                                : 'hover:bg-muted'
                                            }`}
                                            onClick={() => setTargetCustomer(customer)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <User className="h-4 w-4 text-primary" />
                                                <div>
                                                    <div className="text-sm font-medium">{customer.firstName} {customer.lastName}</div>
                                                    <div className="text-xs text-muted-foreground">{customer.phoneNumber}</div>
                                                </div>
                                            </div>
                                            {targetCustomer?.id === customer.id && <Badge>Selected</Badge>}
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-4 py-4">
                            <div className="text-center">
                                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-2 text-destructive">
                                    <User className="h-6 w-6" />
                                </div>
                                <div className="text-xs font-semibold max-w-[80px] truncate mx-auto">{sourceCustomer.firstName}</div>
                            </div>
                            <ArrowRight className="h-6 w-6 text-muted-foreground" />
                            <div className="text-center">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 text-primary">
                                    <User className="h-6 w-6" />
                                </div>
                                <div className="text-xs font-semibold max-w-[80px] truncate mx-auto">{targetCustomer?.firstName}</div>
                            </div>
                        </div>

                        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm flex gap-3 text-left">
                            <AlertTriangle className="h-5 w-5 shrink-0" />
                            <p>This action is irreversible. All points, visit history, and loyalty transactions will be transferred to {targetCustomer?.firstName}'s profile. {sourceCustomer.firstName}'s profile will be permanently deleted.</p>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    {!isConfirming ? (
                        <>
                            <Button variant="outline" onClick={onClose}>Cancel</Button>
                            <Button 
                                disabled={!targetCustomer} 
                                onClick={() => setIsConfirming(true)}
                            >
                                Compare & Review
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => setIsConfirming(false)} disabled={mergeMutation.isPending}>Back</Button>
                            <Button 
                                variant="destructive" 
                                onClick={handleMerge} 
                                disabled={mergeMutation.isPending}
                            >
                                {mergeMutation.isPending ? 'Merging...' : 'Confirm Merge'}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
