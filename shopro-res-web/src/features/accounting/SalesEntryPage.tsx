// SalesEntryPage — Record Daily Sales (Auto-populated from POS Orders)
import React, { useState, useEffect } from 'react';
import { useRestaurantId } from '@/providers/RestaurantProvider';
import { accountingApi, DailySales } from '@/api/accounting.api';
import { HubHeader } from '@/components/shared/headers/HubHeader';
import { useAppStore } from '@/App';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';

// Account codes (hidden from user)
const CATEGORY_TO_ACCOUNT: Record<string, { code: string; name: string }> = {
  food: { code: '4100', name: 'Food Sales' },
  beverage: { code: '4200', name: 'Non-Alcoholic Beverages' },
  alcohol: { code: '4210', name: 'Alcoholic Beverages' },
  takeout: { code: '4300', name: 'Takeout Sales' },
  catering: { code: '4400', name: 'Catering Revenue' },
  other: { code: '4900', name: 'Miscellaneous Revenue' },
};

interface SalesLine {
  id: string;
  category: string;
  categoryLabel: string;
  description: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'digital';
  orderCount: number;
  isAutoPopulated: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const SalesEntryPage: React.FC = () => {
  const restaurantId = useRestaurantId();
  const back = useAppStore(s => s.back);

  const [sales, setSales] = useState<SalesLine[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Auto-populate sales from orders
  const fetchAutoPopulatedSales = async () => {
    setLoading(true);
    try {
      const data: DailySales[] = await accountingApi.getAutoPopulateSales(restaurantId, date);
      
      // Convert to sales lines
      const lines: SalesLine[] = data.map((d, idx) => ({
        id: `auto-${idx}`,
        category: d.category,
        categoryLabel: d.categoryLabel,
        description: `${d.orderCount} order(s)`,
        amount: d.amount,
        paymentMethod: 'card', // Default, user can change
        orderCount: d.orderCount,
        isAutoPopulated: true,
      }));
      
      setSales(lines);
    } catch (error) {
      console.error('Failed to fetch sales:', error);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutoPopulatedSales();
  }, [restaurantId, date]);

  const addSalesLine = () => {
    setSales([...sales, {
      id: Date.now().toString(),
      category: 'food',
      categoryLabel: 'Food Sales',
      description: '',
      amount: 0,
      paymentMethod: 'card',
      orderCount: 0,
      isAutoPopulated: false,
    }]);
  };

  const removeSalesLine = (id: string) => {
    setSales(sales.filter(s => s.id !== id));
  };

  const updateSales = (id: string, field: keyof SalesLine, value: any) => {
    setSales(sales.map(s => {
      if (s.id === id) {
        const updated = { ...s, [field]: value };
        // Update categoryLabel when category changes
        if (field === 'category') {
          const labels: Record<string, string> = {
            food: 'Food Sales',
            beverage: 'Beverage Sales',
            alcohol: 'Alcohol',
            takeout: 'Takeout/Delivery',
            catering: 'Catering',
            other: 'Other Revenue',
          };
          updated.categoryLabel = labels[value] || value;
          updated.isAutoPopulated = false;
        }
        return updated;
      }
      return s;
    }));
  };

  const totalCash = sales.filter(s => s.paymentMethod === 'cash').reduce((s, s2) => s + (s2.amount || 0), 0);
  const totalCard = sales.filter(s => s.paymentMethod === 'card').reduce((s, s2) => s + (s2.amount || 0), 0);
  const totalDigital = sales.filter(s => s.paymentMethod === 'digital').reduce((s, s2) => s + (s2.amount || 0), 0);
  const totalSales = totalCash + totalCard + totalDigital;

  const postSales = async () => {
    if (sales.length === 0) return;
    setSaving(true);

    try {
      const lines = [];

      if (totalCash > 0) lines.push({ accountCode: '1000', debit: totalCash, credit: 0, description: 'Cash Sales' });
      if (totalCard > 0) lines.push({ accountCode: '1100', debit: totalCard, credit: 0, description: 'Card Sales' });
      if (totalDigital > 0) lines.push({ accountCode: '1005', debit: totalDigital, credit: 0, description: 'Digital Payment' });

      const categoryTotals: Record<string, number> = {};
      sales.forEach(s => {
        categoryTotals[s.category] = (categoryTotals[s.category] || 0) + (s.amount || 0);
      });

      Object.entries(categoryTotals).forEach(([cat, amount]) => {
        if (amount > 0) {
          const account = CATEGORY_TO_ACCOUNT[cat];
          lines.push({ accountCode: account.code, debit: 0, credit: amount, description: account.name });
        }
      });

      await accountingApi.createJournalEntry(restaurantId, {
        description: `Daily Sales - ${date}`,
        transactionDate: date,
        lines,
      });

      alert('Sales posted successfully!');
      setSales([]);
      setShowConfirm(false);
    } catch (error) {
      console.error('Failed to post:', error);
      alert('Failed to post sales');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-10 space-y-10 overflow-y-auto">

      <HubHeader
        title="Record Sales"
        subtitle="Auto-populated from POS orders"
        onBack={() => back()}
      >
        <div className="flex items-center gap-4">
          <span className="text-base font-semibold text-muted-foreground">Date:</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="py-3 px-4 rounded-xl border border-input bg-background text-lg font-semibold"
          />
          <Button 
            onClick={fetchAutoPopulatedSales} 
            variant="outline"
            size="lg" 
            className="text-base font-bold py-4"
          >
            🔄 Refresh
          </Button>
        </div>
      </HubHeader>

      <div className="space-y-8 px-4">
        
        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-4">
            <div className="text-4xl">📊</div>
            <div>
              <div className="text-xl font-bold text-blue-800 dark:text-blue-200">Auto-Populated from POS</div>
              <div className="text-lg text-blue-600 dark:text-blue-300">Sales data is automatically fetched from today's orders. You can edit amounts or add custom entries.</div>
            </div>
          </div>
        </div>

        {/* Sales Lines */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">Sales Details</h3>
              <div className="text-base text-muted-foreground font-semibold">{sales.length} categories from POS</div>
            </div>
            <Button variant="outline" size="lg" onClick={addSalesLine} className="text-base font-semibold">
              + Add Custom
            </Button>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <div className="text-xl mt-4 text-muted-foreground font-semibold">Loading sales from orders...</div>
              </div>
            ) : sales.length === 0 ? (
              <div className="text-center py-12 text-xl text-muted-foreground font-semibold">
                No sales found for {date}. Either there were no orders, or they haven't been paid yet.
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 text-base font-bold text-muted-foreground mb-4">
                  <div className="col-span-1"></div>
                  <div className="col-span-3">Category</div>
                  <div className="col-span-3">Description</div>
                  <div className="col-span-3">Payment</div>
                  <div className="col-span-2">Amount</div>
                </div>

                {/* Lines */}
                {sales.map((sale) => (
                  <div key={sale.id} className="grid grid-cols-12 gap-4 mb-4 items-center">
                    <div className="col-span-1">
                      {sale.isAutoPopulated && (
                        <span className="text-2xl" title="Auto-populated from POS">🤖</span>
                      )}
                    </div>
                    <div className="col-span-3">
                      <select
                        value={sale.category}
                        onChange={(e) => updateSales(sale.id, 'category', e.target.value)}
                        className="w-full py-4 px-4 rounded-xl border border-input bg-background text-lg"
                      >
                        <option value="food">Food Sales</option>
                        <option value="beverage">Beverage Sales</option>
                        <option value="alcohol">Alcohol</option>
                        <option value="takeout">Takeout/Delivery</option>
                        <option value="catering">Catering</option>
                        <option value="other">Other Revenue</option>
                      </select>
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={sale.description}
                        onChange={(e) => updateSales(sale.id, 'description', e.target.value)}
                        placeholder="Description"
                        className="w-full py-4 px-4 rounded-xl border border-input bg-background text-lg"
                      />
                    </div>
                    <div className="col-span-3">
                      <select
                        value={sale.paymentMethod}
                        onChange={(e) => updateSales(sale.id, 'paymentMethod', e.target.value)}
                        className="w-full py-4 px-4 rounded-xl border border-input bg-background text-lg"
                      >
                        <option value="card">Card</option>
                        <option value="cash">Cash</option>
                        <option value="digital">Digital</option>
                      </select>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <input
                        type="number"
                        value={sale.amount || ''}
                        onChange={(e) => updateSales(sale.id, 'amount', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="w-full py-4 px-4 rounded-xl border border-input bg-background text-lg text-right font-mono"
                      />
                      <button
                        onClick={() => removeSalesLine(sale.id)}
                        className="py-3 px-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl text-lg font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Summary */}
          {sales.length > 0 && (
            <div className="px-8 py-6 bg-slate-900 dark:bg-slate-800 border-t-2 border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-slate-400">Cash</div>
                  <div className="text-2xl font-bold text-green-400">{formatCurrency(totalCash)}</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-400">Card</div>
                  <div className="text-2xl font-bold text-blue-400">{formatCurrency(totalCard)}</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-400">Digital</div>
                  <div className="text-2xl font-bold text-purple-400">{formatCurrency(totalDigital)}</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-400">Total</div>
                  <div className="text-3xl font-bold text-white">{formatCurrency(totalSales)}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end px-4">
          <Button 
            onClick={() => setShowConfirm(true)} 
            disabled={sales.length === 0}
            size="lg"
            className="text-lg font-bold py-6 px-10"
          >
            Post Sales
          </Button>
        </div>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Confirm Sales Posting</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <p className="text-lg mb-4">Post sales for {date}:</p>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              {sales.map((sale, idx) => (
                <div key={idx} className="flex justify-between py-3 text-lg border-b border-slate-200 dark:border-slate-700 last:border-0">
                  <span className="font-semibold">{sale.categoryLabel}</span>
                  <span className="font-mono font-bold">{formatCurrency(sale.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between py-3 font-bold text-xl mt-4 pt-3 border-t-2 border-slate-300 dark:border-slate-600">
                <span>Total</span>
                <span>{formatCurrency(totalSales)}</span>
              </div>
            </div>
            <p className="mt-4 text-base text-green-600 font-semibold">✓ Revenue will be credited, payments debited automatically</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setShowConfirm(false)} className="flex-1 text-lg font-bold py-6">Cancel</Button>
            <Button onClick={postSales} disabled={saving} className="flex-1 text-lg font-bold py-6">
              {saving ? 'Posting...' : 'Confirm & Post'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesEntryPage;
