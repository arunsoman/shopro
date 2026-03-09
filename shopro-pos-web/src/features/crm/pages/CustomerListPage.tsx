import React, { useState } from 'react';
import { useCustomers } from '../hooks/useCrm';
import { CreateCustomerModal } from '../components/CreateCustomerModal';
import { MergeProfilesModal } from '../components/MergeProfilesModal';
import type { CustomerProfileResponse } from '../schema/crmSchema';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Search, User, ChevronLeft, ChevronRight, GitMerge } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useDebounce } from 'use-debounce';
import { useNavigate } from 'react-router-dom';

export const CustomerListPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch] = useDebounce(searchTerm, 500);
    const [page, setPage] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfileResponse | null>(null);
    const navigate = useNavigate();

    const { data: customerPage, isLoading } = useCustomers(debouncedSearch, page, 10);

    const getTierColor = (tier: string) => {
        switch (tier?.toUpperCase()) {
            case 'GOLD': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'PLATINUM': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'SILVER': return 'bg-slate-400/10 text-slate-400 border-slate-400/20';
            default: return 'bg-orange-700/10 text-orange-700 border-orange-700/20';
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">CRM & Loyalty</h1>
                    <p className="text-muted-foreground">Manage guest profiles and reward programs.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                    <UserPlus className="h-4 w-4" /> Register Guest
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Guest Database</CardTitle>
                    <CardDescription>Search by name, phone, or email to find guests quickly.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search guests..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(0); // reset page on search
                            }}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Guest</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Tier</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                    Loading guests...
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading && customerPage?.content.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                    No guests found matching your search.
                                </TableCell>
                            </TableRow>
                        )}
                        {customerPage?.content.map((customer) => (
                            <TableRow key={customer.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate(`/crm/customers/${customer.id}`)}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            {customer.firstName} {customer.lastName}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">{customer.phoneNumber}</div>
                                    <div className="text-xs text-muted-foreground">{customer.email || 'No email'}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={getTierColor(customer.tierName)}>
                                        {customer.tierName || 'Bronze'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                setSelectedCustomer(customer);
                                                setIsMergeModalOpen(true);
                                            }}
                                            title="Merge Profile"
                                        >
                                            <GitMerge className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/crm/customers/${customer.id}`); }}>
                                            View
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                
                {/* Pagination Controls */}
                {!isLoading && customerPage && customerPage.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                        <div className="text-sm text-muted-foreground">
                            Showing page {page + 1} of {customerPage.totalPages}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(customerPage.totalPages - 1, p + 1))}
                                disabled={page >= customerPage.totalPages - 1}
                            >
                                Next <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <CreateCustomerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            {selectedCustomer && (
                <MergeProfilesModal
                    isOpen={isMergeModalOpen}
                    onClose={() => {
                        setIsMergeModalOpen(false);
                        setSelectedCustomer(null);
                    }}
                    sourceCustomer={selectedCustomer}
                />
            )}
        </div>
    );
};
