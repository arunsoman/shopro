// ExpenseEntryPage — Fool-Proof Expense Entry UI
import React, { useState } from 'react';
import { useRestaurantId } from '@/providers/RestaurantProvider';
import { accountingApi } from '@/api/expense.api';
import { HubHeader } from '@/components/shared/headers/HubHeader';
import { useAppStore } from '@/App';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';

// Predefined expense categories - no account numbers shown to user
const EXPENSE_CATEGORIES = [
  { id: 'rent', label: 'Rent & Lease' },
  { id: 'utilities', label: 'Utilities' },
  { id: 'supplies', label: 'Supplies & Materials' },
  { id: 'maintenance', label: 'Repairs & Maintenance' },
  { id: 'marketing', label: 'Marketing & Advertising' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'licenses', label: 'Licenses & Permits' },
  { id: 'bank_charges', label: 'Bank Charges & Fees' },
  { id: 'transportation', label: 'Transportation & Delivery' },
  { id: 'payroll_expense', label: 'Payroll Expenses' },
  { id: 'technology', label: 'Technology & Software' },
  { id: 'professional', label: 'Professional Services' },
  { id: 'other', label: 'Other Expenses' },
];

// Map categories to account codes (hidden from user)
const CATEGORY_TO_ACCOUNT: Record<string, { code: string; name: string }> = {
  rent: { code: '6720', name: 'Rent Expense' },
  utilities: { code: '6710', name: 'Utilities Expense' },
  supplies: { code: '6730', name: 'Supplies Expense' },
  maintenance: { code: '6800', name: 'Repairs & Maintenance' },
  marketing: { code: '6600', name: 'Marketing & Advertising' },
  insurance: { code: '6740', name: 'Insurance Expense' },
  licenses: { code: '6750', name: 'Licenses & Permits' },
  bank_charges: { code: '6760', name: 'Bank Charges & Fees' },
  transportation: { code: '6770', name: 'Transportation Expense' },
  payroll_expense: { code: '5000', name: 'Salaries & Wages' },
  technology: { code: '6780', name: 'Technology & Software' },
  professional: { code: '6790', name: 'Professional Services' },
  other: { code: '7999', name: 'Miscellaneous Expense' },
};

interface ExpenseLine {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const ExpenseEntryPage: React.FC = () => {
  const restaurantId = useRestaurantId();
  const navigate = useAppStore(s => s.navigate);
  const back = useAppStore(s => s.back);

  const [expenses, setExpenses] = useState<ExpenseLine[]>([
    { id: '1', category: '', description: '', amount: 0, date: new Date().toISOString().split('T')[0] }
  ]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank' | 'credit_card'>('bank');
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const addExpenseLine = () => {
    setExpenses([...expenses, {
      id: Date.now().toString(),
      category: '',
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0]
    }]);
  };

  const removeExpenseLine = (id: string) => {
    if (expenses.length > 1) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  const updateExpense = (id: string, field: keyof ExpenseLine, value: any) => {
    setExpenses(expenses.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const validExpenses = expenses.filter(e => e.category && e.amount > 0);

  const postExpenses = async () => {
    if (validExpenses.length === 0) return;
    setSaving(true);

    try {
      const journalLines = validExpenses.map(expense => {
        const account = CATEGORY_TO_ACCOUNT[expense.category];
        return {
          accountCode: account.code,
          debit: expense.amount,
          credit: 0,
          description: expense.description || account.name,
        };
      });

      const bankAccountCode = paymentMethod === 'cash' ? '1000' : paymentMethod === 'bank' ? '1005' : '2010';
      journalLines.push({
        accountCode: bankAccountCode,
        debit: 0,
        credit: totalAmount,
        description: `Payment for expenses`,
      });

      await accountingApi.createJournalEntry(restaurantId, {
        description: `Expense Entry - ${new Date().toLocaleDateString()}`,
        transactionDate: new Date().toISOString().split('T')[0],
        lines: journalLines,
      });

      alert('Expenses posted successfully!');
      setExpenses([{ id: '1', category: '', description: '', amount: 0, date: new Date().toISOString().split('T')[0] }]);
      setShowConfirm(false);
    } catch (error) {
      console.error('Failed to post expenses:', error);
      alert('Failed to post expenses. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-10 space-y-10 overflow-y-auto">

      <HubHeader
        title="Record Expenses"
        subtitle="Enter expenses without debits or credits"
        onBack={() => back()}
      />

      <div className="space-y-8 px-4">
        
        {/* Payment Method */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold mb-6">Payment Method</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'cash', label: 'Cash' },
              { id: 'bank', label: 'Bank Transfer' },
              { id: 'credit_card', label: 'Credit Card' },
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id as any)}
                className={`py-6 px-4 rounded-xl border-2 text-lg font-semibold transition-all ${
                  paymentMethod === method.id
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                {method.label}
              </button>
            ))}
          </div>
        </div>

        {/* Expense Lines */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-xl font-bold">Expense Details</h3>
            <Button variant="outline" size="lg" onClick={addExpenseLine} className="text-base font-semibold">
              + Add Line
            </Button>
          </div>

          <div className="p-8">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 text-base font-bold text-muted-foreground mb-4">
              <div className="col-span-4">Category</div>
              <div className="col-span-4">Description</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-2"></div>
            </div>

            {/* Lines */}
            {expenses.map((expense) => (
              <div key={expense.id} className="grid grid-cols-12 gap-4 mb-4 items-center">
                <div className="col-span-4">
                  <select
                    value={expense.category}
                    onChange={(e) => updateExpense(expense.id, 'category', e.target.value)}
                    className="w-full py-4 px-4 rounded-xl border border-input bg-background text-lg"
                  >
                    <option value="">Select category...</option>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-4">
                  <input
                    type="text"
                    value={expense.description}
                    onChange={(e) => updateExpense(expense.id, 'description', e.target.value)}
                    placeholder="What was this for?"
                    className="w-full py-4 px-4 rounded-xl border border-input bg-background text-lg"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    value={expense.amount || ''}
                    onChange={(e) => updateExpense(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full py-4 px-4 rounded-xl border border-input bg-background text-lg text-right font-mono"
                  />
                </div>
                <div className="col-span-2 flex justify-end">
                  <button
                    onClick={() => removeExpenseLine(expense.id)}
                    disabled={expenses.length === 1}
                    className="py-3 px-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl disabled:opacity-30 text-lg font-bold"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="px-8 py-6 bg-slate-900 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold text-slate-400">
                {validExpenses.length} expense(s) ready
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-slate-400">Total Amount</div>
                <div className="text-4xl font-bold text-white">{formatCurrency(totalAmount)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end px-4">
          <Button 
            onClick={() => setShowConfirm(true)} 
            disabled={validExpenses.length === 0 || saving}
            size="lg"
            className="text-lg font-bold py-6 px-10"
          >
            Post Expenses
          </Button>
        </div>
      </div>

      {/* confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Confirm Expense Posting</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <p className="text-lg mb-4">Post the following expenses:</p>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 max-h-60 overflow-y-auto">
              {validExpenses.map((e, i) => (
                <div key={i} className="flex justify-between py-3 border-b border-slate-200 dark:border-slate-700 last:border-0 text-lg">
                  <span className="font-semibold">{EXPENSE_CATEGORIES.find(c => c.id === e.category)?.label}</span>
                  <span className="font-mono font-bold">{formatCurrency(e.amount)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center text-xl font-bold mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <span>Total</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            <p className="mt-4 text-base text-green-600 font-semibold">
              ✓ Double-entry will be created automatically
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setShowConfirm(false)} className="flex-1 text-lg font-bold py-6">
              Cancel
            </Button>
            <Button onClick={postExpenses} disabled={saving} className="flex-1 text-lg font-bold py-6">
              {saving ? 'Posting...' : 'Confirm & Post'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseEntryPage;
