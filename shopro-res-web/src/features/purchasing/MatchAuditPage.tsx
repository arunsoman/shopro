import React, { useState } from 'react';
import { useAppStore } from '@/App';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  ArrowRight, 
  ChevronRight, 
  Search, 
  Filter,
  DollarSign,
  Package,
  FileText,
  History,
  TrendingDown,
  TrendingUp,
  PackageCheck,
  ArrowLeft
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";
import { usePurchaseOrders, useMatchBundle } from "./hooks/usePurchaseOrders";
import { currency as formatCurrency, formatDate } from "@/lib/utils";

const MatchAuditPage: React.FC = () => {
  const restaurantId = 1; // From Auth context normally
  const [selectedPoId, setSelectedPoId] = useState<number | null>(null);
  const back = useAppStore(s => s.back);
  
  const { data: orders, isLoading: loadingOrders } = usePurchaseOrders(restaurantId, { restaurantId });
  const { data: bundle, isLoading: loadingBundle } = useMatchBundle(restaurantId, selectedPoId!);

  // Filter for orders that are likely to have receipts (SENT, PARTIAL, RECEIVED)
  const auditOrders = orders?.filter(o => o.status !== 'DRAFT' && o.status !== 'CANCELLED') || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PERFECT': return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Perfect Match <CheckCircle2 className="ml-1 w-3 h-3" /></Badge>;
      case 'LEAK': return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20">Leak Detected <AlertCircle className="ml-1 w-3 h-3" /></Badge>;
      case 'VARIANCE': return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Variance <AlertTriangle className="ml-1 w-3 h-3" /></Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => back()} className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-muted-foreground/40 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all">
             <ArrowLeft size={18} strokeWidth={3} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">3-Way Match Audit</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Reconcile orders, receipts, and invoices to protect your margins.</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" className="gap-2">
             <History className="w-4 h-4" /> Audit Logs
           </Button>
           <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 gap-2">
             <Filter className="w-4 h-4" /> Advanced Filter
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LHS: PO Summary Table */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  Recent Orders
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                  <Input placeholder="Search PO..." className="pl-8 h-9 w-[150px] bg-white dark:bg-slate-800" />
                </div>
              </div>
            </CardHeader>
            <div className="max-h-[700px] overflow-y-auto">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead>PO Detail</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingOrders ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i} className="animate-pulse">
                        <TableCell><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div></TableCell>
                        <TableCell><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 ml-auto"></div></TableCell>
                        <TableCell><div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div></TableCell>
                      </TableRow>
                    ))
                  ) : auditOrders.map((order) => (
                    <TableRow 
                      key={order.id} 
                      className={`cursor-pointer transition-colors hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 ${selectedPoId === order.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                      onClick={() => setSelectedPoId(order.id)}
                    >
                      <TableCell>
                        <div className="font-medium text-slate-900 dark:text-slate-100">#{order.id} - {order.supplierName || order.supplierId}</div>
                        <div className="text-xs text-slate-400">{formatDate(order.issueDate)}</div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm leading-6">
                        {formatCurrency(order.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <ChevronRight className={`w-4 h-4 transition-transform ${selectedPoId === order.id ? 'translate-x-1 text-indigo-500' : 'text-slate-300'}`} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* RHS: Match Matrix */}
        <div className="lg:col-span-8 space-y-6">
          {!selectedPoId ? (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/30 dark:bg-slate-900/30">
              <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
                <PackageCheck className="w-10 h-10 text-indigo-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Start Reconciliation</h3>
              <p className="text-slate-500 max-w-sm">Select a purchase order from the list to begin the 3-way match audit process.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-slate-50 dark:bg-slate-800/50 border-none shadow-md">
                   <CardContent className="p-4 flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Ordered</span>
                      <span className="text-2xl font-bold">{bundle ? formatCurrency(bundle.summary.totalOrdered) : '---'}</span>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <FileText className="w-3 h-3" /> PO #{selectedPoId}
                      </div>
                   </CardContent>
                </Card>
                <Card className="bg-slate-50 dark:bg-slate-800/50 border-none shadow-md">
                   <CardContent className="p-4 flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Received</span>
                      <span className="text-2xl font-bold text-emerald-500">{bundle ? formatCurrency(bundle.summary.totalReceived) : '---'}</span>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-500/70">
                        <Package className="w-3 h-3" /> {bundle?.goodsReceipts.length || 0} Receipts
                      </div>
                   </CardContent>
                </Card>
                <Card className="bg-slate-50 dark:bg-slate-800/50 border-none shadow-md">
                   <CardContent className="p-4 flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Invoiced</span>
                      <span className="text-2xl font-bold text-indigo-500">{bundle ? formatCurrency(bundle.summary.totalBilled) : '---'}</span>
                      <div className="flex items-center gap-1 text-[10px] text-indigo-500/70">
                        <DollarSign className="w-3 h-3" /> {bundle?.invoices.length || 0} Invoices
                      </div>
                   </CardContent>
                </Card>
                <Card className={`border-none shadow-md ${bundle?.summary.matchStatus === 'PERFECT' ? 'bg-emerald-500' : bundle?.summary.matchStatus === 'LEAK' ? 'bg-rose-500' : 'bg-amber-500'}`}>
                   <CardContent className="p-4 flex flex-col gap-1 text-white">
                      <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Match Health</span>
                      <span className="text-2xl font-bold flex items-center justify-between">
                        {bundle?.summary.matchStatus || '---'}
                         {bundle?.summary.matchStatus === 'PERFECT' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                      </span>
                      <div className="text-[10px] opacity-80">
                        Variance: {bundle ? formatCurrency(bundle.summary.totalVariance) : '---'}
                      </div>
                   </CardContent>
                </Card>
              </div>

              {/* The Matrix Panel */}
              <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 border-l-4 border-l-indigo-500 overflow-hidden">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 py-3">
                   <div className="flex justify-between items-center">
                     <CardTitle className="text-base font-semibold tracking-tight uppercase text-slate-500">The Match Matrix</CardTitle>
                     <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-200"></span> Ordered</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Received</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Invoiced</span>
                     </div>
                   </div>
                </CardHeader>
                <div className="overflow-x-auto">
                   <Table>
                      <TableHeader className="bg-slate-50/30 dark:bg-slate-800/20 shadow-sm border-b border-slate-100 dark:border-slate-800">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-[200px] py-4 pl-6 uppercase tracking-widest text-[10px] font-bold">Ingredient / Service</TableHead>
                          <TableHead className="py-4 uppercase tracking-widest text-[10px] font-bold text-center">Commitment (PO)</TableHead>
                          <TableHead className="py-4 uppercase tracking-widest text-[10px] font-bold text-center">Intake (GRN)</TableHead>
                          <TableHead className="py-4 uppercase tracking-widest text-[10px] font-bold text-center">Claim (INV)</TableHead>
                          <TableHead className="py-4 uppercase tracking-widest text-[10px] font-bold text-right pr-6">Reconciliation</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loadingBundle ? (
                          Array(8).fill(0).map((_, i) => (
                            <TableRow key={i}><TableCell colSpan={5} className="h-16 animate-pulse bg-slate-50/50 dark:bg-slate-800/10"></TableCell></TableRow>
                          ))
                        ) : bundle?.purchaseOrder.lines.map((pol) => {
                          // Find corresponding GRN lines
                          const totalReceived = bundle.goodsReceipts.reduce((sum, grn) => {
                            const line = grn.lines.find(l => l.ingredientId === pol.ingredientId);
                            return sum + (line?.receivedQty || 0);
                          }, 0);

                          // Find corresponding Invoice lines (mapped by category in typical flow, but we compare totals)
                          // For high-fidelity, we iterate unique ingredients as the primary key
                          const invoicedAmount = bundle.invoices.reduce((sum, inv) => {
                             // This is a simplification since Invoices are category-based. 
                             // Real audit would look at Invoice details if the system tracks them sub-line.
                             // For now, we compute an 'expected invoice' based on receipt.
                             return sum; 
                          }, 0);

                          const hasQtyShortage = totalReceived < pol.orderedQty;
                          const hasLeak = false; // logic would check if billed > received if we had line-level bills

                          return (
                            <TableRow key={pol.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 group">
                              <TableCell className="pl-6 py-4">
                                <div className="font-semibold text-slate-900 dark:text-slate-100">{pol.ingredientDescription}</div>
                                <div className="text-[10px] font-mono text-slate-400">ID: {pol.ingredientId} | UC: {formatCurrency(pol.unitPrice)}</div>
                              </TableCell>
                              
                              <TableCell className="text-center py-4 bg-slate-50/20 dark:bg-slate-800/5">
                                <div className="text-sm font-bold tracking-tight">{pol.orderedQty}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{formatCurrency(pol.orderedQty * pol.unitPrice)}</div>
                              </TableCell>

                              <TableCell className={`text-center py-4 ${hasQtyShortage ? 'bg-rose-500/5' : 'bg-emerald-500/5'}`}>
                                <div className={`text-sm font-bold tracking-tight flex items-center justify-center gap-1 ${hasQtyShortage ? 'text-rose-500' : 'text-emerald-500'}`}>
                                  {totalReceived}
                                  {hasQtyShortage && <TrendingDown className="w-3 h-3" />}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono underline decoration-dotted decoration-slate-300">
                                  {formatCurrency(totalReceived * pol.unitPrice)}
                                </div>
                              </TableCell>

                              <TableCell className="text-center py-4 bg-indigo-500/5">
                                 <div className="text-sm font-bold text-indigo-500 tracking-tight">---</div>
                                 <div className="text-[10px] text-slate-400 italic">Sub-total view</div>
                              </TableCell>

                              <TableCell className="text-right pr-6 py-4">
                                 <div className="flex flex-col items-end gap-1">
                                    {pol.receivedQty === pol.orderedQty ? (
                                      <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                                        Perfect Qty <CheckCircle2 className="w-3 h-3" />
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1.5 text-rose-500 text-[10px] font-bold uppercase tracking-wider">
                                        Short {pol.orderedQty - totalReceived} {hasQtyShortage && <AlertTriangle className="w-3 h-3" />}
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                       <Badge variant="outline" className="text-[9px] h-4 bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800">Review Delta</Badge>
                                       <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-indigo-100 hover:text-indigo-600 transition-all">
                                          <ChevronRight className="w-4 h-4" />
                                       </Button>
                                    </div>
                                 </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                   </Table>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                   <div className="text-xs text-slate-400">Showing reconciliation for {bundle?.purchaseOrder.lines.length || 0} line items.</div>
                   <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50/50">Dispute Line(s)</Button>
                      <Button variant="outline" size="sm" className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50">Post Reconciliation</Button>
                   </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchAuditPage;
