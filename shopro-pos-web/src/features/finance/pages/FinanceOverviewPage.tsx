import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, 
  BookOpen, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Calendar
} from 'lucide-react';
import { financeApi } from '../api/financeApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FinanceWidgets } from '../components/FinanceWidgets';

export function FinanceOverviewPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [pnl, setPnl] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const pnlData = await financeApi.getPnL();
      setPnl(pnlData);
    } catch (error) {
      console.error('Failed to load financial overview', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-muted-foreground">{t('common.processing', 'Processing...')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('finance.overview', 'Financial Overview')}</h1>
          <p className="text-muted-foreground">Snapshot of your restaurant's current financial health.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Last 30 Days
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            {t('finance.exportReport', 'Export Report')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('finance.revenue', 'Total Revenue')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pnl?.totalRevenue?.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 font-medium inline-flex items-center">
                <ArrowUpRight className="mr-1 h-3 w-3" /> +12.5%
              </span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('finance.cogs', 'Total COGS')}</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pnl?.totalCOGS?.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Target: 25% | Actual: {((pnl?.totalCOGS / pnl?.totalRevenue) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('finance.grossProfit', 'Gross Profit')}</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pnl?.grossProfit?.toFixed(2)}</div>
            <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                    className="h-full bg-primary" 
                    style={{ width: `${(pnl?.grossProfit / pnl?.totalRevenue) * 100}%` }}
                />
            </div>
          </CardContent>
        </Card>
        <Card className={pnl?.netIncome >= 0 ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('finance.netIncome', 'Net Income')}</CardTitle>
            {pnl?.netIncome >= 0 ? <ArrowUpRight className="h-4 w-4 text-green-600" /> : <ArrowDownRight className="h-4 w-4 text-red-600" />}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${pnl?.netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${pnl?.netIncome?.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="pt-4">
        <h2 className="text-lg font-semibold mb-4">Quick Financial Actions</h2>
        <FinanceWidgets onSuccess={loadData} />
      </div>
    </div>
  );
}

export default FinanceOverviewPage;
