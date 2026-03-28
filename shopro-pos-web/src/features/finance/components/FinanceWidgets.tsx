import { useState, useEffect } from 'react';
import { 
  Plus, 
  Wallet, 
  Briefcase, 
  UserPlus, 
  Loader2,
  CheckCircle2,
  Building2,
  Zap,
  Trash2,
  CircleDollarSign,
  ArrowRightLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
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

type DialogType = 'petty_cash' | 'expense' | 'staff_advance' | 'bank_deposit' | 'utility' | 'waste' | 'equity' | 'adjustment' | null;

export const FinanceWidgets: React.FC<FinanceWidgetsProps> = ({ onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [activeDialog, setActiveDialog] = useState<DialogType>(null);
    const [accounts, setAccounts] = useState<any[]>([]);

    // Form states
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('General');
    const [staffName, setStaffName] = useState('');
    const [initiatedBy, setInitiatedBy] = useState('');
    const [utilityName, setUtilityName] = useState('');
    const [reason, setReason] = useState('Spoilage');
    const [equityAction, setEquityAction] = useState('Drawing');
    const [fromAccount, setFromAccount] = useState('');
    const [toAccount, setToAccount] = useState('');
    const [adjustmentDesc, setAdjustmentDesc] = useState('');

    useEffect(() => {
        if (activeDialog === 'adjustment') {
            loadAccounts();
        }
    }, [activeDialog]);

    const loadAccounts = async () => {
        try {
            const data = await financeApi.getAccounts();
            setAccounts(data);
        } catch (error) {
            console.error(error);
        }
    };

    const resetForm = () => {
        setAmount('');
        setCategory('General');
        setStaffName('');
        setInitiatedBy('');
        setUtilityName('');
        setReason('Spoilage');
        setEquityAction('Drawing');
        setFromAccount('');
        setToAccount('');
        setAdjustmentDesc('');
    };

    const handleSubmit = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        setLoading(true);
        try {
            const numAmount = parseFloat(amount);
            const approver = initiatedBy || 'Manager';

            switch (activeDialog) {
                case 'petty_cash':
                    await financeApi.replenishPettyCash(numAmount, approver);
                    break;
                case 'expense':
                    await financeApi.recordExpense(numAmount, category, approver);
                    break;
                case 'staff_advance':
                    await financeApi.payStaffAdvance(numAmount, staffName, approver);
                    break;
                case 'bank_deposit':
                    await financeApi.recordBankDeposit(numAmount, approver);
                    break;
                case 'utility':
                    await financeApi.payUtility(numAmount, utilityName, approver);
                    break;
                case 'waste':
                    await financeApi.logInventoryWaste(numAmount, reason, approver);
                    break;
                case 'equity':
                    await financeApi.recordEquityAction(numAmount, equityAction, approver);
                    break;
                case 'adjustment':
                    if (!fromAccount || !toAccount) {
                        toast.error("Select both accounts");
                        setLoading(false);
                        return;
                    }
                    await financeApi.postEntry({
                        description: `Manual Adjustment: ${adjustmentDesc} - by ${approver}`,
                        entryDate: new Date().toISOString(),
                        lines: [
                            { accountCode: toAccount, debit: numAmount, credit: 0 },
                            { accountCode: fromAccount, debit: 0, credit: numAmount }
                        ]
                    });
                    break;
            }
            
            toast.success("Transaction posted successfully");
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

    const WidgetCard = ({ id, icon: Icon, title, desc, colorClass }: { id: DialogType, icon: any, title: string, desc: string, colorClass: string }) => (
        <Card className={cn("relative overflow-hidden group cursor-pointer hover:border-primary/50 transition-all", colorClass)} onClick={() => setActiveDialog(id)}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className={cn("p-2 rounded-xl transition-transform group-hover:scale-110")}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <Plus className="h-4 w-4 text-muted-foreground opacity-30" />
                </div>
                <h3 className="text-sm font-bold mb-1 truncate">{title}</h3>
                <p className="text-[10px] text-muted-foreground line-clamp-2">{desc}</p>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <WidgetCard 
                    id="petty_cash" 
                    icon={Wallet} 
                    title="Replenish Petty Cash" 
                    desc="Safe (1000) → Petty Cash (1005)" 
                    colorClass="bg-primary/5 border-primary/20 text-primary"
                />
                <WidgetCard 
                    id="bank_deposit" 
                    icon={Building2} 
                    title="Deposit to Bank" 
                    desc="Safe (1000) → Bank (1100)" 
                    colorClass="bg-blue-500/5 border-blue-500/20 text-blue-500"
                />
                <WidgetCard 
                    id="expense" 
                    icon={Briefcase} 
                    title="Cash Expense" 
                    desc="Petty Cash (1005) → OpEx" 
                    colorClass="bg-orange-500/5 border-orange-500/20 text-orange-500"
                />
                <WidgetCard 
                    id="utility" 
                    icon={Zap} 
                    title="Pay Utility/Rent" 
                    desc="Bank (1100) → OpEx" 
                    colorClass="bg-yellow-500/5 border-yellow-500/20 text-yellow-500"
                />
                <WidgetCard 
                    id="staff_advance" 
                    icon={UserPlus} 
                    title="Staff Advance" 
                    desc="Safe (1000) → Asset (1210)" 
                    colorClass="bg-indigo-500/5 border-indigo-500/20 text-indigo-500"
                />
                <WidgetCard 
                    id="waste" 
                    icon={Trash2} 
                    title="Inventory Waste" 
                    desc="Inventory (1200) → COGS" 
                    colorClass="bg-red-500/5 border-red-500/20 text-red-500"
                />
                <WidgetCard 
                    id="equity" 
                    icon={CircleDollarSign} 
                    title="Equity Action" 
                    desc="Owner Injection/Drawing" 
                    colorClass="bg-emerald-500/5 border-emerald-500/20 text-emerald-500"
                />
                <WidgetCard 
                    id="adjustment" 
                    icon={ArrowRightLeft} 
                    title="General Adjustment" 
                    desc="Flexible Dr/Cr Movement" 
                    colorClass="bg-purple-500/5 border-purple-500/20 text-purple-500"
                />
            </div>

            <Dialog open={activeDialog !== null} onOpenChange={(open) => !open && setActiveDialog(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                           {activeDialog === 'petty_cash' && "Replenish Petty Cash"}
                           {activeDialog === 'bank_deposit' && "Bank Deposit"}
                           {activeDialog === 'expense' && "Record Cash Expense"}
                           {activeDialog === 'utility' && "Pay Utility/Rent"}
                           {activeDialog === 'staff_advance' && "Pay Staff Advance"}
                           {activeDialog === 'waste' && "Log Inventory Waste"}
                           {activeDialog === 'equity' && "Equity Action"}
                           {activeDialog === 'adjustment' && "General Adjustment"}
                        </DialogTitle>
                        <DialogDescription>
                            Accounting journals will be posted automatically via the EDP system.
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
                                <Label>Category</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Cleaning Supplies">Cleaning Supplies</SelectItem>
                                        <SelectItem value="Stationery">Stationery</SelectItem>
                                        <SelectItem value="Daily Repairs">Daily Repairs</SelectItem>
                                        <SelectItem value="Transport">Transport</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {activeDialog === 'utility' && (
                            <div className="grid gap-2">
                                <Label>Select Bill Type</Label>
                                <Select value={utilityName} onValueChange={setUtilityName}>
                                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Electricity">Electricity</SelectItem>
                                        <SelectItem value="Water">Water</SelectItem>
                                        <SelectItem value="Internet">Internet</SelectItem>
                                        <SelectItem value="Rent">Rent</SelectItem>
                                        <SelectItem value="Insurance">Insurance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {activeDialog === 'waste' && (
                            <div className="grid gap-2">
                                <Label>Reason for Waste</Label>
                                <Select value={reason} onValueChange={setReason}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Spoilage">Spoilage</SelectItem>
                                        <SelectItem value="Expired">Expired</SelectItem>
                                        <SelectItem value="Broken/Damaged">Broken/Damaged</SelectItem>
                                        <SelectItem value="Theft/Shrinkage">Theft/Shrinkage</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {activeDialog === 'equity' && (
                            <div className="grid gap-2">
                                <Label>Action Type</Label>
                                <Select value={equityAction} onValueChange={setEquityAction}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Drawing">Owner Drawing (Out)</SelectItem>
                                        <SelectItem value="Injection">Capital Injection (In)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {activeDialog === 'staff_advance' && (
                            <div className="grid gap-2">
                                <Label htmlFor="staff">Staff Name</Label>
                                <Input id="staff" placeholder="Enter name" value={staffName} onChange={(e) => setStaffName(e.target.value)} />
                            </div>
                        )}

                        {activeDialog === 'adjustment' && (
                           <>
                             <div className="grid gap-2">
                                <Label>Move Money From</Label>
                                <Select value={fromAccount} onValueChange={setFromAccount}>
                                    <SelectTrigger><SelectValue placeholder="Select Source" /></SelectTrigger>
                                    <SelectContent>
                                        {accounts.map(acc => <SelectItem key={acc.code} value={acc.code}>{acc.name} ({acc.code})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                             </div>
                             <div className="grid gap-2">
                                <Label>Move Money To</Label>
                                <Select value={toAccount} onValueChange={setToAccount}>
                                    <SelectTrigger><SelectValue placeholder="Select Destination" /></SelectTrigger>
                                    <SelectContent>
                                        {accounts.map(acc => <SelectItem key={acc.code} value={acc.code}>{acc.name} ({acc.code})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                             </div>
                             <div className="grid gap-2">
                                <Label>Memo / Reason</Label>
                                <Input placeholder="Brief description" value={adjustmentDesc} onChange={(e) => setAdjustmentDesc(e.target.value)} />
                             </div>
                           </>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="by">Initiated By / Approver</Label>
                            <Input id="by" placeholder="Manager Name" value={initiatedBy} onChange={(e) => setInitiatedBy(e.target.value)} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActiveDialog(null)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={loading} className="gap-2">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                            Process Entry
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
