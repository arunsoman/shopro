import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Filter,
  Download,
  Search
} from 'lucide-react';
import { financeApi } from '../api/financeApi';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';

export function LedgerPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [ledger, setLedger] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const ledgerData = await financeApi.getLedger();
      setLedger(ledgerData);
    } catch (error) {
      console.error('Failed to load ledger', error);
    } finally {
      setLoading(false);
    }
  };

  // Group entries by referenceId
  const groupedLedger = useMemo(() => {
    if (!ledger.length) return [];
    
    const groups = new Map<string, any[]>();
    
    ledger.forEach(entry => {
      // Use referenceId as key, fall back to entry ID if ref is missing
      const key = entry.referenceId || `entry-${entry.id}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(entry);
    });

    // Convert map to array and sort by the latest entry date in each group
    return Array.from(groups.entries())
      .map(([ref, entries]) => ({
        ref,
        entries: entries.sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()),
        maxDate: new Date(Math.max(...entries.map(e => new Date(e.entryDate).getTime())))
      }))
      .sort((a, b) => b.maxDate.getTime() - a.maxDate.getTime());
  }, [ledger]);

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
          <h1 className="text-3xl font-bold tracking-tight">{t('finance.ledger', 'Journal Ledger')}</h1>
          <p className="text-muted-foreground">Comprehensive transaction history grouped by order reference.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            {t('finance.exportCSV', 'Export CSV')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div className="flex items-center gap-4 w-full max-w-sm">
             <div className="relative w-full">
               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
               <Input 
                 placeholder="Search entries..." 
                 className="pl-8"
               />
             </div>
             <Button variant="outline" size="icon">
               <Filter className="h-4 w-4" />
             </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('finance.date', 'Date')}</TableHead>
                <TableHead>{t('finance.description', 'Description')}</TableHead>
                <TableHead>{t('finance.reference', 'Reference')}</TableHead>
                <TableHead className="text-right">{t('finance.debit', 'Debit')}</TableHead>
                <TableHead className="text-right">{t('finance.credit', 'Credit')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedLedger.map((group) => (
                <div key={group.ref} className="contents">
                    {group.entries.map((entry, idx) => (
                        <div key={entry.id} className="contents">
                            <TableRow className={`bg-muted/30 font-medium ${idx > 0 ? "border-t-0 opacity-80" : ""}`}>
                                <TableCell className="whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                            {format(new Date(entry.entryDate), 'MMM dd, HH:mm')}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={idx > 0 ? "pl-4 italic text-sm text-muted-foreground" : ""}>
                                        {entry.description}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs text-primary font-mono bg-primary/5 px-2 py-0.5 rounded">
                                        {entry.referenceId ? entry.referenceId.substring(0, 8) : '-'}
                                    </span>
                                </TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                            {entry.lines.map((line: any) => (
                                <TableRow key={line.id} className="border-none hover:bg-transparent">
                                    <TableCell></TableCell>
                                    <TableCell className="pl-8 text-sm italic py-1 text-muted-foreground/80">
                                        {line.accountName} <span className="text-[10px] opacity-40">({line.accountCode})</span>
                                    </TableCell>
                                    <TableCell></TableCell>
                                    <TableCell className="text-right font-mono py-1 text-sm">
                                        {line.debitAmount > 0 ? line.debitAmount.toFixed(2) : '-'}
                                    </TableCell>
                                    <TableCell className="text-right font-mono py-1 text-sm">
                                        {line.creditAmount > 0 ? line.creditAmount.toFixed(2) : '-'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </div>
                    ))}
                    {/* Add a thicker border between groups */}
                    <TableRow className="h-4 border-b-2 border-primary/10 last:border-b-0" />
                </div>
              ))}
              {ledger.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    {t('finance.noEntries', 'No ledger entries found.')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default LedgerPage;
