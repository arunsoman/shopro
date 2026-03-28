import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Download,
  AlertCircle
} from 'lucide-react';
import { financeApi } from '../api/financeApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function BalanceSheetPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [balanceSheet, setBalanceSheet] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const balanceSheetData = await financeApi.getBalanceSheet();
      setBalanceSheet(balanceSheetData);
    } catch (error) {
      console.error('Failed to load balance sheet', error);
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

  const identityBalanced = Math.abs(balanceSheet?.totalAssets - (balanceSheet?.totalLiabilities + balanceSheet?.totalEquity)) < 0.01;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('finance.balanceSheet', 'Balance Sheet')}</h1>
          <p className="text-muted-foreground">Snapshot of financial position (Assets, Liabilities, Equity).</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            {t('finance.exportCSV', 'Export CSV')}
          </Button>
        </div>
      </div>

      {!identityBalanced && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex gap-3 mb-6">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-red-600">Accounting Imbalance Detected</h3>
            <p className="text-sm text-red-600/80 mt-1">
              The fundamental accounting identity (Assets = Liabilities + Equity) is currently out of balance by ${(balanceSheet?.totalAssets - (balanceSheet?.totalLiabilities + (balanceSheet?.totalEquity || 0))).toFixed(2)}. This may be due to unposted transactions or manual ledger errors.
            </p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto shadow-2xl rounded-3xl border-4 border-primary/5 overflow-hidden">
        {/* Assets Column */}
        <Card className="border-none shadow-none rounded-none bg-gradient-to-b from-green-500/5 to-transparent">
          <CardHeader className="border-b-2 border-green-500/10 pb-4">
             <CardTitle className="text-xl font-black text-green-700 uppercase tracking-widest">ASSETS</CardTitle>
          </CardHeader>
          <CardContent className="pt-8 px-8 pb-12 overflow-y-auto">
             <div className="space-y-4">
                {balanceSheet?.assetLines.map((line: any) => (
                   <div key={line.accountCode} className="flex justify-between items-center group">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{line.accountName}</span>
                        <span className="text-[10px] text-muted-foreground opacity-50 font-mono italic">{line.accountCode}</span>
                      </div>
                      <span className="font-mono text-sm font-bold">${line.balance.toFixed(2)}</span>
                   </div>
                ))}

                <div className="pt-8 border-t-2 border-green-500/30 font-black text-2xl flex justify-between items-center text-green-700">
                    <span>TOTAL ASSETS</span>
                    <span className="font-mono tracking-tighter">${balanceSheet?.totalAssets?.toFixed(2)}</span>
                </div>
             </div>
          </CardContent>
        </Card>

        {/* Liabilities & Equity Column */}
        <Card className="border-none shadow-none rounded-none bg-gradient-to-b from-indigo-500/5 to-transparent border-l-2 border-primary/5">
          <CardHeader className="border-b-2 border-indigo-500/10 pb-4">
             <CardTitle className="text-xl font-black text-indigo-700 uppercase tracking-widest">LIABILITIES & EQUITY</CardTitle>
          </CardHeader>
          <CardContent className="pt-8 px-8 pb-12 overflow-y-auto">
             <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">LIABILITIES</h3>
                {balanceSheet?.liabilityLines.map((line: any) => (
                   <div key={line.accountCode} className="flex justify-between items-center group">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{line.accountName}</span>
                        <span className="text-[10px] text-muted-foreground opacity-50 font-mono italic">{line.accountCode}</span>
                      </div>
                      <span className="font-mono text-sm font-bold text-red-600">${line.balance.toFixed(2)}</span>
                   </div>
                ))}

                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-1 mt-8 pt-4">EQUITY</h3>
                {balanceSheet?.equityLines.map((line: any) => (
                   <div key={line.accountCode} className="flex justify-between items-center group">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{line.accountName}</span>
                        <span className="text-[10px] text-muted-foreground opacity-50 font-mono italic">{line.accountCode}</span>
                      </div>
                      <span className="font-mono text-sm font-bold text-indigo-600">${line.balance.toFixed(2)}</span>
                   </div>
                ))}

                <div className="pt-8 border-t-2 border-indigo-500/30 font-black text-2xl flex justify-between items-center text-indigo-700">
                    <span className="text-sm lg:text-lg">TOTAL LIABILITIES & EQUITY</span>
                    <span className="font-mono tracking-tighter">${(balanceSheet?.totalLiabilities + balanceSheet?.totalEquity).toFixed(2)}</span>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default BalanceSheetPage;
