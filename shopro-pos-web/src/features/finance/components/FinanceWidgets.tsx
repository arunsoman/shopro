import React, { useState } from 'react';
import { 
  Plus, 
  Wallet, 
  Briefcase, 
  UserPlus, 
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { financeApi } from '../api/financeApi';
import { toast } from 'sonner';

interface FinanceWidgetsProps {
    onSuccess: () => void;
}

export const FinanceWidgets: React.FC<FinanceWidgetsProps> = ({ onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [activeDialog, setActiveDialog] = useState<'petty_cash' | 'expense' | 'staff_advance' | null>(null);

    // Form states
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('General');
    const [staffName, setStaffName] = useState('');
    const [initiatedBy, setInitiatedBy] = useState('');

    const resetForm = () => {
        setAmount('');
        setCategory('General');
        setStaffName('');
        setInitiatedBy('');
    };

    const handleSubmit = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        setLoading(true);
        try {
            const numAmount = parseFloat(amount);
            if (activeDialog === 'petty_cash') {
                await financeApi.replenishPettyCash(numAmount, initiatedBy || 'Manager');
                toast.success("Petty cash replenished successfully");
            } else if (activeDialog === 'expense') {
                await financeApi.recordExpense(numAmount, category, initiatedBy || 'Manager');
                toast.success("Expense recorded successfully");
            } else if (activeDialog === 'staff_advance') {
                await financeApi.payStaffAdvance(numAmount, staffName, initiatedBy || 'Manager');
                toast.success("Staff advance paid successfully");
            }
            
            setActiveDialog(null);
            resetForm();
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Failed to process transaction");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Petty Cash Widget */}
            <Card className="relative overflow-hidden group cursor-pointer hover:border-primary/50 transition-all bg-gradient-to-br from-primary/5 to-transparent border-primary/20" onClick={() => setActiveDialog('petty_cash')}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                            <Wallet className="h-6 w-6" />
                        </div>
                        <Plus className="h-5 w-5 text-muted-foreground opacity-30" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">Replenish Petty Cash</h3>
                    <p className="text-sm text-muted-foreground">Move funds from main safe to petty cash.</p>
                </CardContent>
            </Card>

            {/* Expense Widget */}
            <Card className="relative overflow-hidden group cursor-pointer hover:border-primary/50 transition-all" onClick={() => setActiveDialog('expense')}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform">
                            <Briefcase className="h-6 w-6" />
                        </div>
                        <Plus className="h-5 w-5 text-muted-foreground opacity-30" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">Record Cash Expense</h3>
                    <p className="text-sm text-muted-foreground">Log expenses paid directly via petty cash.</p>
                </CardContent>
            </Card>

            {/* Staff Advance Widget */}
            <Card className="relative overflow-hidden group cursor-pointer hover:border-primary/50 transition-all" onClick={() => setActiveDialog('staff_advance')}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:scale-110 transition-transform">
                            <UserPlus className="h-6 w-6" />
                        </div>
                        <Plus className="h-5 w-5 text-muted-foreground opacity-30" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">Pay Staff Advance</h3>
                    <p className="text-sm text-muted-foreground">Issue and track refundable staff advances.</p>
                </CardContent>
            </Card>

            {/* Global Dialog */}
            <Dialog open={activeDialog !== null} onOpenChange={(open) => !open && setActiveDialog(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {activeDialog === 'petty_cash' && <Wallet className="h-5 w-5 text-primary" />}
                            {activeDialog === 'expense' && <Briefcase className="h-5 w-5 text-orange-500" />}
                            {activeDialog === 'staff_advance' && <UserPlus className="h-5 w-5 text-indigo-500" />}
                            {activeDialog === 'petty_cash' && "Replenish Petty Cash"}
                            {activeDialog === 'expense' && "Record Cash Expense"}
                            {activeDialog === 'staff_advance' && "Pay Staff Advance"}
                        </DialogTitle>
                        <DialogDescription>
                            All entries generated balanced double-entry journals in the ledger.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Amount ($)</Label>
                            <Input 
                                id="amount" 
                                type="number" 
                                placeholder="0.00" 
                                value={amount} 
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>

                        {activeDialog === 'expense' && (
                            <div className="grid gap-2">
                                <Label htmlFor="category">Category</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Cleaning Supplies">Cleaning Supplies</SelectItem>
                                        <SelectItem value="Stationery">Stationery</SelectItem>
                                        <SelectItem value="Daily Repairs">Daily Repairs</SelectItem>
                                        <SelectItem value="Staff Meals">Staff Meals</SelectItem>
                                        <SelectItem value="Transport">Transport</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {activeDialog === 'staff_advance' && (
                            <div className="grid gap-2">
                                <Label htmlFor="staff">Staff Name</Label>
                                <Input 
                                    id="staff" 
                                    placeholder="Enter full name" 
                                    value={staffName} 
                                    onChange={(e) => setStaffName(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="by">Initiated By / Approver</Label>
                            <Input 
                                id="by" 
                                placeholder="Manager Name" 
                                value={initiatedBy} 
                                onChange={(e) => setInitiatedBy(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActiveDialog(null)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={loading} className="gap-2">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                            Post Transaction
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
