import React, { useState } from 'react';
import { useCustomerSearch } from '../hooks/useCrm';
import { CreateCustomerModal } from '../components/CreateCustomerModal';
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
import { UserPlus, Search, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const CustomerListPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // For now, we only search by phone as per backend implementation
    const { data: customer, isLoading } = useCustomerSearch(searchTerm);

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
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Guest Search</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Enter phone number (e.g. +971...)"
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                            <TableHead className="text-right">Points</TableHead>
                            <TableHead className="text-right">Total Spent</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                    Searching...
                                </TableCell>
                            </TableRow>
                        )}
                        {searchTerm.length >= 8 && !isLoading && !customer && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                    No guest found with this phone number.
                                </TableCell>
                            </TableRow>
                        )}
                        {customer && (
                            <TableRow>
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
                                        {customer.tierName}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                    {customer.availablePoints} pts
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    AED {customer.lifetimeSpend.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">View History</Button>
                                </TableCell>
                            </TableRow>
                        )}
                        {!searchTerm && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                    Enter a phone number to find a guest.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <CreateCustomerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};
