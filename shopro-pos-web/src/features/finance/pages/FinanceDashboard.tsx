import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, 
  BookOpen, 
  List, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import { financeApi } from '../api/financeApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';

export function FinanceDashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [pnl, setPnl] = useState<any>(null);
  const [ledger, setLedger] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pnlData, ledgerData, accountsData] = await Promise.all([
        financeApi.getPnL(),
        financeApi.getLedger(),
        financeApi.getAccounts()
      ]);
      setPnl(pnlData);
      setLedger(ledgerData);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Failed to load financial data', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-muted-foreground">{t('common.processing')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('finance.title')}</h1>
          <p className="text-muted-foreground">{t('finance.desc')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Last 30 Days
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            {t('finance.exportReport')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('finance.revenue')}</CardTitle>
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
            <CardTitle className="text-sm font-medium">{t('finance.cogs')}</CardTitle>
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
            <CardTitle className="text-sm font-medium">{t('finance.grossProfit')}</CardTitle>
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
            <CardTitle className="text-sm font-medium">{t('finance.netIncome')}</CardTitle>
            {pnl?.netIncome >= 0 ? <ArrowUpRight className="h-4 w-4 text-green-600" /> : <ArrowDownRight className="h-4 w-4 text-red-600" />}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${pnl?.netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${pnl?.netIncome?.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ledger" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="ledger">{t('finance.ledger')}</TabsTrigger>
          <TabsTrigger value="pnl">{t('finance.pnl')}</TabsTrigger>
          <TabsTrigger value="accounts">{t('finance.accounts')}</TabsTrigger>
        </TabsList>

        <TabsContent value="ledger" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('finance.ledger')}</CardTitle>
                <CardDescription>Comprehensive transaction history for the period.</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('finance.date')}</TableHead>
                    <TableHead>{t('finance.description')}</TableHead>
                    <TableHead>{t('finance.reference')}</TableHead>
                    <TableHead className="text-right">{t('finance.debit')}</TableHead>
                    <TableHead className="text-right">{t('finance.credit')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledger.map((entry) => (
                    <React.Fragment key={entry.id}>
                      <TableRow className="bg-muted/30 font-medium">
                        <TableCell colSpan={3}>
                           <div className="flex items-center gap-2">
                             <span className="text-xs text-muted-foreground">{format(new Date(entry.entryDate), 'MMM dd, HH:mm')}</span>
                             {entry.description}
                           </div>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">{entry.referenceId?.substring(0,8)}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      {entry.lines.map((line: any) => (
                        <TableRow key={line.id}>
                          <TableCell></TableCell>
                          <TableCell className="pl-8 text-sm italic">{line.accountName} ({line.accountCode})</TableCell>
                          <TableCell></TableCell>
                          <TableCell className="text-right font-mono">
                            {line.debitAmount > 0 ? line.debitAmount.toFixed(2) : '-'}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {line.creditAmount > 0 ? line.creditAmount.toFixed(2) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                  {ledger.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        {t('finance.noEntries')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pnl" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('finance.pnl')}</CardTitle>
              <CardDescription>Profit and Loss statement performance metrics.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                 <div className="flex justify-between border-b pb-2 font-bold">
                    <span>{t('finance.revenue')}</span>
                    <span>${pnl?.totalRevenue?.toFixed(2)}</span>
                 </div>
                 {pnl?.revenueLines.map((line: any) => (
                    <div key={line.accountCode} className="flex justify-between pl-4 text-sm text-muted-foreground">
                        <span>{line.accountName}</span>
                        <span>${line.balance.toFixed(2)}</span>
                    </div>
                 ))}

                 <div className="flex justify-between border-b pb-2 pt-4 font-bold text-red-600">
                    <span>{t('finance.cogs')}</span>
                    <span>(${pnl?.totalCOGS?.toFixed(2)})</span>
                 </div>

                 <div className="flex justify-between bg-muted/50 p-2 font-bold text-lg">
                    <span>{t('finance.grossProfit')}</span>
                    <span className="text-primary">${pnl?.grossProfit?.toFixed(2)}</span>
                 </div>

                 <div className="flex justify-between border-b pb-2 pt-4 font-bold text-red-600">
                    <span>{t('finance.opExpenses')}</span>
                    <span>(${pnl?.totalOperatingExpenses?.toFixed(2)})</span>
                 </div>

                  <div className={`flex justify-between p-2 font-bold text-xl ${pnl?.netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
                    <span>{t('finance.netIncome')}</span>
                    <span>${pnl?.netIncome?.toFixed(2)}</span>
                 </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="mt-4">
          <Card>
             <CardHeader>
                <CardTitle>{t('finance.accounts')}</CardTitle>
                <CardDescription>Listing all accounts and their net financial position.</CardDescription>
             </CardHeader>
             <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('finance.accountCode')}</TableHead>
                            <TableHead>{t('finance.accountName')}</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">{t('finance.balance')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {accounts.map(acc => (
                            <TableRow key={acc.id}>
                                <TableCell className="font-mono">{acc.code}</TableCell>
                                <TableCell className="font-medium">{acc.name}</TableCell>
                                <TableCell className="text-xs uppercase opacity-70">{acc.accountType}</TableCell>
                                <TableCell className={`text-right font-mono ${acc.balance < 0 ? "text-red-500" : ""}`}>
                                    ${acc.balance.toFixed(2)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
             </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
