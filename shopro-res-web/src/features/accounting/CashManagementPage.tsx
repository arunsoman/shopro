// CashManagementPage — Cash & Bank Management UI
import React, { useState } from 'react';
import { useRestaurantId } from '@/providers/RestaurantProvider';
import { accountingApi } from '@/api/expense.api';
import { HubHeader } from '@/components/shared/headers/HubHeader';
import { useAppStore } from '@/App';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';

interface CashTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  description: string;
  date: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const CashManagementPage: React.FC = () => {
  const restaurantId = useRestaurantId();
  const back = useAppStore(s => s.back);

  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [newTx, setNewTx] = useState({
    type: 'deposit' as 'deposit' | 'withdrawal' | 'transfer',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const addTransaction = () => {
    if (!newTx.amount || !newTx.description) return;
    
    setTransactions([...transactions, {
      id: Date.now().toString(),
      ...newTx,
    }]);
    
    setNewTx({
      type: 'deposit',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const removeTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const totalIn = transactions.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0);

  const postTransactions = async () => {
    if (transactions.length === 0) return;
    setSaving(true);

    try {
      for (const tx of transactions) {
        const lines = [];
        
        if (tx.type === 'deposit') {
          lines.push({ accountCode: '1005', debit: tx.amount, credit: 0, description: tx.description });
          lines.push({ accountCode: '1000', debit: 0, credit: tx.amount, description: tx.description });
        } else if (tx.type === 'withdrawal') {
          lines.push({ accountCode: '1000', debit: tx.amount, credit: 0, description: tx.description });
          lines.push({ accountCode: '1005', debit: 0, credit: tx.amount, description: tx.description });
        }

        await accountingApi.createJournalEntry(restaurantId, {
          description: tx.description,
          transactionDate: tx.date,
          lines,
        });
      }

      alert('Transactions posted successfully!');
      setTransactions([]);
      setShowConfirm(false);
    } catch (error) {
      console.error('Failed to post:', error);
      alert('Failed to post transactions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-10 space-y-10 overflow-y-auto">

      <HubHeader
        title="Cash & Bank"
        subtitle="Manage deposits and withdrawals"
        onBack={() => back()}
      />

      <div className="space-y-8 px-4">
        
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-6">
          <button
            onClick={() => setNewTx({ ...newTx, type: 'deposit' })}
            className={`py-10 px-6 rounded-2xl border-2 transition-all ${newTx.type === 'deposit' ? 'border-green-500 bg-green-50 dark:bg-green-950/30' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
          >
            <div className="text-3xl font-bold mb-2">↓</div>
            <div className="text-xl font-bold">Cash Deposit</div>
            <div className="text-base text-muted-foreground">Put cash in bank</div>
          </button>
          <button
            onClick={() => setNewTx({ ...newTx, type: 'withdrawal' })}
            className={`py-10 px-6 rounded-2xl border-2 transition-all ${newTx.type === 'withdrawal' ? 'border-red-500 bg-red-50 dark:bg-red-950/30' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
          >
            <div className="text-3xl font-bold mb-2">↑</div>
            <div className="text-xl font-bold">Cash Withdrawal</div>
            <div className="text-base text-muted-foreground">Take cash from bank</div>
          </button>
          <button
            onClick={() => setNewTx({ ...newTx, type: 'transfer' })}
            className={`py-10 px-6 rounded-2xl border-2 transition-all ${newTx.type === 'transfer' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
          >
            <div className="text-3xl font-bold mb-2">⇄</div>
            <div className="text-xl font-bold">Transfer</div>
            <div className="text-base text-muted-foreground">Move between accounts</div>
          </button>
        </div>

        {/* Add Transaction Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold mb-6">Add Transaction</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="col-span-1">
              <label className="block text-base font-bold mb-2">Date</label>
              <input
                type="date"
                value={newTx.date}
                onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                className="w-full py-4 px-4 rounded-xl border border-input bg-background text-lg"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-base font-bold mb-2">Amount</label>
              <input
                type="number"
                value={newTx.amount || ''}
                onChange={(e) => setNewTx({ ...newTx, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                className="w-full py-4 px-4 rounded-xl border border-input bg-background text-lg font-mono text-right"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-base font-bold mb-2">Description</label>
              <input
                type="text"
                value={newTx.description}
                onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                placeholder="What's this for?"
                className="w-full py-4 px-4 rounded-xl border border-input bg-background text-lg"
              />
            </div>
            <div className="col-span-1 flex items-end">
              <Button 
                onClick={addTransaction} 
                disabled={!newTx.amount || !newTx.description} 
                className="w-full py-4 text-lg font-bold"
              >
                + Add
              </Button>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        {transactions.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold">Pending Transactions ({transactions.length})</h3>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {transactions.map((tx) => (
                <div key={tx.id} className="px-8 py-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold ${
                      tx.type === 'deposit' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                      tx.type === 'withdrawal' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                      'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                    }`}>
                      {tx.type === 'deposit' ? '↓' : tx.type === 'withdrawal' ? '↑' : '⇄'}
                    </div>
                    <div>
                      <div className="text-xl font-bold">{tx.description}</div>
                      <div className="text-lg text-muted-foreground">{tx.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className={`text-2xl font-bold font-mono ${
                      tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </div>
                    <button
                      onClick={() => removeTransaction(tx.id)}
                      className="py-2 px-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl text-lg font-bold"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-8 py-6 bg-slate-900 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div className="text-lg font-semibold text-slate-400">
                {transactions.length} transaction(s)
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-slate-400">Net Effect</div>
                <div className="text-3xl font-bold text-white">{formatCurrency(totalIn - totalOut)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {transactions.length > 0 && (
          <div className="flex justify-end px-4">
            <Button 
              onClick={() => setShowConfirm(true)} 
              size="lg"
              className="text-lg font-bold py-6 px-10"
            >
              Post Transactions
            </Button>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Confirm Posting</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <p className="text-lg mb-4">Post {transactions.length} transaction(s)?</p>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              {transactions.map((tx, i) => (
                <div key={i} className="flex justify-between py-3 text-lg">
                  <span className="font-semibold capitalize">{tx.type}: {tx.description}</span>
                  <span className="font-mono font-bold">{formatCurrency(tx.amount)}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-base text-green-600 font-semibold">✓ Double-entry will be created automatically</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setShowConfirm(false)} className="flex-1 text-lg font-bold py-6">Cancel</Button>
            <Button onClick={postTransactions} disabled={saving} className="flex-1 text-lg font-bold py-6">
              {saving ? 'Posting...' : 'Confirm & Post'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CashManagementPage;
