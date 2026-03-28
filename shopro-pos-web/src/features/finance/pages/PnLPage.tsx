import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Download,
  Calendar
} from 'lucide-react';
import { financeApi } from '../api/financeApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function PnLPage() {
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
      console.error('Failed to load P&L statement', error);
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
          <h1 className="text-3xl font-bold tracking-tight">{t('finance.pnl', 'Profit & Loss Statement')}</h1>
          <p className="text-muted-foreground">Performance summary for the current period.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Select Period
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            {t('finance.exportCSV', 'Export CSV')}
          </Button>
        </div>
      </div>

      <Card className="max-w-4xl mx-auto shadow-lg border-primary/10">
        <CardHeader className="text-center border-b pb-8">
           <CardTitle className="text-2xl font-bold uppercase tracking-widest text-primary">Shopro Restaurant</CardTitle>
           <CardDescription className="text-lg">Statement of Operations & Comprehensive Income</CardDescription>
           <p className="text-xs text-muted-foreground mt-2 italic font-mono uppercase tracking-tighter opacity-50">Draft (Accrual Basis)</p>
        </CardHeader>
        <CardContent className="pt-8 px-12 pb-12">
          <div className="space-y-6">
             {/* Revenue Section */}
             <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">REVENUE</h3>
                <div className="flex justify-between items-center text-lg font-medium">
                   <span>{t('finance.grossSales', 'Total Sales Revenue')}</span>
                   <span className="font-mono">${pnl?.totalRevenue?.toFixed(2)}</span>
                </div>
                {pnl?.revenueLines.map((line: any) => (
                   <div key={line.accountCode} className="flex justify-between items-center pl-4 text-sm text-muted-foreground italic">
                      <span>{line.accountName}</span>
                      <span className="font-mono text-xs">${line.balance.toFixed(2)}</span>
                   </div>
                ))}
             </div>

             {/* COGS Section */}
             <div className="space-y-2 pt-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-red-600/70 border-b pb-1 border-red-200">COST OF GOODS SOLD</h3>
                <div className="flex justify-between items-center text-lg font-medium text-red-600">
                   <span>{t('finance.cogs_total', 'Total COGS')}</span>
                   <span className="font-mono">(${pnl?.totalCOGS?.toFixed(2)})</span>
                </div>
                {pnl?.cogsLines?.map((line: any) => (
                  <div key={line.accountCode} className="flex justify-between items-center pl-4 text-sm text-muted-foreground italic">
                    <span>{line.accountName}</span>
                    <span className="font-mono text-xs">${line.balance.toFixed(2)}</span>
                  </div>
                ))}
             </div>

             {/* Gross Profit Summary */}
             <div className="flex justify-between items-center bg-primary/5 p-4 rounded-xl border border-primary/10 font-bold text-xl drop-shadow-sm">
                <span>{t('finance.grossProfit', 'GROSS PROFIT')}</span>
                <span className="text-primary font-mono">${pnl?.grossProfit?.toFixed(2)}</span>
             </div>

             {/* OpEx Section */}
             <div className="space-y-2 pt-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-red-600/70 border-b pb-1 border-red-200">OPERATING EXPENSES</h3>
                <div className="flex justify-between items-center text-lg font-medium text-red-600">
                   <span>{t('finance.opExpenses_total', 'Total Operating Expenses')}</span>
                   <span className="font-mono">(${pnl?.totalOperatingExpenses?.toFixed(2)})</span>
                </div>
                {pnl?.expenseLines?.map((line: any) => (
                  <div key={line.accountCode} className="flex justify-between items-center pl-4 text-sm text-muted-foreground italic">
                    <span>{line.accountName}</span>
                    <span className="font-mono text-xs">${line.balance.toFixed(2)}</span>
                  </div>
                ))}
             </div>

             {/* Net Income Summary */}
             <div className={`flex justify-between items-center p-6 rounded-2xl border-2 font-black text-2xl shadow-inner mt-8 ${pnl?.netIncome >= 0 ? "bg-green-500/10 border-green-500/20 text-green-600" : "bg-red-500/10 border-red-500/20 text-red-600"}`}>
                <span>{t('finance.netIncome', 'NET INCOME')}</span>
                <span className="font-mono">${pnl?.netIncome?.toFixed(2)}</span>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PnLPage;
