import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus,
  Download,
  Info
} from 'lucide-react';
import { financeApi } from '../api/financeApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function AccountsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const accountsData = await financeApi.getAccounts();
      setAccounts(accountsData);
    } catch (error) {
      console.error('Failed to load chart of accounts', error);
    } finally {
      setLoading(false);
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'ASSET': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'LIABILITY': return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'EQUITY': return 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20';
      case 'REVENUE': return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
      case 'EXPENSE': return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
      default: return 'bg-muted text-muted-foreground';
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
          <h1 className="text-3xl font-bold tracking-tight">{t('finance.accounts', 'Chart of Accounts')}</h1>
          <p className="text-muted-foreground">Listing all ledger categories and their current net financial position.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            {t('finance.exportCSV', 'Export CSV')}
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Account
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">General Ledger Accounts</CardTitle>
          <CardDescription>Accounts are organized by category and code range (1000-6000).</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">{t('finance.code', 'Code')}</TableHead>
                <TableHead>{t('finance.name', 'Account Name')}</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">{t('finance.balance', 'Current Balance')}</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((acc) => (
                <TableRow key={acc.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-mono font-bold text-primary">{acc.code}</TableCell>
                  <TableCell className="font-medium">{acc.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getAccountTypeColor(acc.accountType)}>
                      {acc.accountType}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right font-mono font-bold ${acc.balance < 0 ? "text-red-500" : ""}`}>
                    ${acc.balance.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-20 hover:opacity-100">
                             <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                           View details for {acc.name}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default AccountsPage;
