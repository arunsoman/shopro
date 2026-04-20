// PnLStatementPage — Profit & Loss Statement
import React, { useState, useEffect } from 'react';
import { useRestaurantId } from '@/providers/RestaurantProvider';
import { accountingApi, PnLStatement } from '@/api/accounting.api';
import { HubHeader } from '@/components/shared/headers/HubHeader';
import { useAppStore } from '@/App';
import { Button } from '@/components/ui/Button';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const PnLStatementPage: React.FC = () => {
  const restaurantId = useRestaurantId();
  const back = useAppStore(s => s.back);

  const [loading, setLoading] = useState(true);
  const [pnl, setPnl] = useState<PnLStatement | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const fetchPnL = async () => {
    setLoading(true);
    try {
      const data = await accountingApi.getPnLStatement(restaurantId, startDate, endDate);
      setPnl(data);
    } catch (error) {
      console.error('Failed to fetch P&L:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPnL(); }, [restaurantId, startDate, endDate]);

  const isProfitable = pnl && pnl.netIncome > 0;

  return (
    <div className="absolute inset-0 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-10 space-y-10 overflow-y-auto">

      <HubHeader
        title="P&L Statement"
        subtitle="Profit & Loss Report"
        onBack={() => back()}
      >
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="py-3 px-4 rounded-xl border border-input bg-background text-base font-semibold"
          />
          <span className="text-base font-semibold text-muted-foreground">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="py-3 px-4 rounded-xl border border-input bg-background text-base font-semibold"
          />
          <Button onClick={fetchPnL} size="lg" className="text-base font-bold py-4 px-6">
            Run Report
          </Button>
        </div>
      </HubHeader>

      <div className="flex-1 px-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : pnl ? (
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-green-500/30">
                <div className="text-lg font-semibold text-muted-foreground mb-2">Total Revenue</div>
                <div className="text-3xl font-bold text-green-600">{formatCurrency(pnl.totalRevenue)}</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-green-500/30">
                <div className="text-lg font-semibold text-muted-foreground mb-2">Gross Profit</div>
                <div className="text-3xl font-bold text-green-600">{formatCurrency(pnl.grossProfit)}</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-red-500/30">
                <div className="text-lg font-semibold text-muted-foreground mb-2">Total Expenses</div>
                <div className="text-3xl font-bold text-red-600">{formatCurrency(pnl.totalExpenses)}</div>
              </div>
              <div className={`bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 ${isProfitable ? 'border-green-500' : 'border-red-500'}`}>
                <div className="text-lg font-semibold text-muted-foreground mb-2">Net Income</div>
                <div className={`text-3xl font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(pnl.netIncome)}
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800">
                <div className="text-lg font-bold text-blue-600 mb-2">COGS %</div>
                <div className="text-4xl font-bold text-blue-700">{formatPercent(pnl.cogsPercentage)}</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950/30 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800">
                <div className="text-lg font-bold text-purple-600 mb-2">Labor %</div>
                <div className="text-4xl font-bold text-purple-700">{formatPercent(pnl.laborPercentage)}</div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-6 border-2 border-amber-200 dark:border-amber-800">
                <div className="text-lg font-bold text-amber-600 mb-2">Prime Cost %</div>
                <div className="text-4xl font-bold text-amber-700">{formatPercent(pnl.primeCost)}</div>
              </div>
            </div>

            {/* Revenue Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-8 py-5 bg-green-50 dark:bg-green-950/30 border-b-2 border-green-200 dark:border-green-800">
                <h3 className="text-2xl font-bold text-green-800 dark:text-green-200">Revenue</h3>
              </div>
              <div className="p-8">
                <table className="w-full text-lg">
                  <thead>
                    <tr className="text-left text-base font-bold text-muted-foreground border-b-2">
                      <th className="pb-4 font-bold">Account</th>
                      <th className="pb-4 font-bold text-right">Amount</th>
                      <th className="pb-4 font-bold text-right">% of Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!pnl.foodSales?.length && !pnl.beverageSales?.length && !pnl.otherRevenue?.length) ? (
                      <tr><td colSpan={3} className="py-8 text-center text-muted-foreground">No revenue data</td></tr>
                    ) : (
                      <>
                        {pnl.foodSales?.map((item, idx) => (
                          <tr key={`food-${idx}`} className="border-b border-slate-100 dark:border-slate-800">
                            <td className="py-4 font-semibold">{item.accountName || item.accountCode}</td>
                            <td className="py-4 text-right font-mono font-bold">{formatCurrency(item.amount)}</td>
                            <td className="py-4 text-right text-muted-foreground font-semibold">{formatPercent(item.percentage)}</td>
                          </tr>
                        ))}
                        {pnl.beverageSales?.map((item, idx) => (
                          <tr key={`bev-${idx}`} className="border-b border-slate-100 dark:border-slate-800">
                            <td className="py-4 font-semibold">{item.accountName || item.accountCode}</td>
                            <td className="py-4 text-right font-mono font-bold">{formatCurrency(item.amount)}</td>
                            <td className="py-4 text-right text-muted-foreground font-semibold">{formatPercent(item.percentage)}</td>
                          </tr>
                        ))}
                        {pnl.otherRevenue?.map((item, idx) => (
                          <tr key={`other-${idx}`} className="border-b border-slate-100 dark:border-slate-800">
                            <td className="py-4 font-semibold">{item.accountName || item.accountCode}</td>
                            <td className="py-4 text-right font-mono font-bold">{formatCurrency(item.amount)}</td>
                            <td className="py-4 text-right text-muted-foreground font-semibold">{formatPercent(item.percentage)}</td>
                          </tr>
                        ))}
                      </>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="text-xl font-bold">
                      <td className="pt-6">Total Revenue</td>
                      <td className="pt-6 text-right text-green-600">{formatCurrency(pnl.totalRevenue)}</td>
                      <td className="pt-6 text-right">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* COGS Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-8 py-5 bg-orange-50 dark:bg-orange-950/30 border-b-2 border-orange-200 dark:border-orange-800">
                <h3 className="text-2xl font-bold text-orange-800 dark:text-orange-200">Cost of Goods Sold</h3>
              </div>
              <div className="p-8">
                <table className="w-full text-lg">
                  <tbody>
                    {(!pnl.foodCost?.length && !pnl.beverageCost?.length) ? (
                      <tr><td colSpan={3} className="py-8 text-center text-muted-foreground">No COGS data</td></tr>
                    ) : (
                      <>
                        {pnl.foodCost?.map((item, idx) => (
                          <tr key={`fc-${idx}`} className="border-b border-slate-100 dark:border-slate-800">
                            <td className="py-4 font-semibold">{item.accountName || item.accountCode}</td>
                            <td className="py-4 text-right font-mono font-bold">{formatCurrency(item.amount)}</td>
                            <td className="py-4 text-right text-muted-foreground font-semibold">{formatPercent(item.percentage)}</td>
                          </tr>
                        ))}
                        {pnl.beverageCost?.map((item, idx) => (
                          <tr key={`bc-${idx}`} className="border-b border-slate-100 dark:border-slate-800">
                            <td className="py-4 font-semibold">{item.accountName || item.accountCode}</td>
                            <td className="py-4 text-right font-mono font-bold">{formatCurrency(item.amount)}</td>
                            <td className="py-4 text-right text-muted-foreground font-semibold">{formatPercent(item.percentage)}</td>
                          </tr>
                        ))}
                      </>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="text-xl font-bold">
                      <td className="pt-6">Total COGS</td>
                      <td className="pt-6 text-right text-orange-600">{formatCurrency(pnl.totalCogs)}</td>
                      <td className="pt-6 text-right">{formatPercent(pnl.cogsPercentage)}</td>
                    </tr>
                    <tr className="text-xl font-bold text-green-600">
                      <td className="pt-2">Gross Profit</td>
                      <td className="pt-2 text-right">{formatCurrency(pnl.grossProfit)}</td>
                      <td className="pt-2 text-right">{formatPercent(100 - pnl.cogsPercentage)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Labor Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-8 py-5 bg-purple-50 dark:bg-purple-950/30 border-b-2 border-purple-200 dark:border-purple-800">
                <h3 className="text-2xl font-bold text-purple-800 dark:text-purple-200">Labor Expenses</h3>
              </div>
              <div className="p-8">
                <table className="w-full text-lg">
                  <tbody>
                    {!pnl.laborExpenses?.length ? (
                      <tr><td colSpan={3} className="py-8 text-center text-muted-foreground">No labor data</td></tr>
                    ) : (
                      pnl.laborExpenses?.map((item, idx) => (
                        <tr key={`le-${idx}`} className="border-b border-slate-100 dark:border-slate-800">
                          <td className="py-4 font-semibold">{item.accountName || item.accountCode}</td>
                          <td className="py-4 text-right font-mono font-bold">{formatCurrency(item.amount)}</td>
                          <td className="py-4 text-right text-muted-foreground font-semibold">{formatPercent(item.percentage)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="text-xl font-bold">
                      <td className="pt-6">Total Labor</td>
                      <td className="pt-6 text-right text-purple-600">{formatCurrency(pnl.totalLabor)}</td>
                      <td className="pt-6 text-right">{formatPercent(pnl.laborPercentage)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Operating Expenses */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-8 py-5 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
                <h3 className="text-2xl font-bold">Operating Expenses</h3>
              </div>
              <div className="p-8">
                <table className="w-full text-lg">
                  <tbody>
                    {!pnl.operatingExpenses?.length ? (
                      <tr><td colSpan={3} className="py-8 text-center text-muted-foreground">No operating expense data</td></tr>
                    ) : (
                      pnl.operatingExpenses?.map((item, idx) => (
                        <tr key={`oe-${idx}`} className="border-b border-slate-100 dark:border-slate-800">
                          <td className="py-4 font-semibold">{item.accountName || item.accountCode}</td>
                          <td className="py-4 text-right font-mono font-bold">{formatCurrency(item.amount)}</td>
                          <td className="py-4 text-right text-muted-foreground font-semibold">{formatPercent(item.percentage)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="text-xl font-bold">
                      <td className="pt-6">Total Operating Expenses</td>
                      <td className="pt-6 text-right">{formatCurrency(pnl.totalOperatingExpenses)}</td>
                      <td className="pt-6 text-right">{formatPercent((pnl.totalOperatingExpenses / (pnl.totalRevenue || 1)) * 100)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Final Summary */}
            <div className="bg-slate-900 rounded-2xl p-8">
              <div className="flex justify-between items-center text-2xl">
                <span className="font-bold text-white">Net Income</span>
                <span className={`text-4xl font-bold ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(pnl.netIncome)}
                </span>
              </div>
            </div>

          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-xl text-muted-foreground font-semibold">
            No P&L data available for the selected period
          </div>
        )}
      </div>
    </div>
  );
};

export default PnLStatementPage;
