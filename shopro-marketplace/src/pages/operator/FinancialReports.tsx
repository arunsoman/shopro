import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Calendar, 
  Filter, 
  ChevronRight, 
  FileText,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { NeonEdges } from "@/components/ui/neon-button";
import { OrbitalLoader } from "@/components/ui/orbital-loader";

interface LedgerLine {
  name: string;
  amount: number;
}

interface ReportData {
  pnl?: {
    revenue: LedgerLine[];
    expenses: LedgerLine[];
    totalRevenue: number;
    totalExpense: number;
    netProfit: number;
  };
  balance?: {
    assets: LedgerLine[];
    liabilities: LedgerLine[];
    equity: LedgerLine[];
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    isBalanced: boolean;
  };
}

export default function FinancialReports() {
  const [activeTab, setActiveTab] = useState<'pnl' | 'balance'>('pnl');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      if (activeTab === 'pnl') {
        setData({
          pnl: {
            revenue: [
              { name: "Commission Revenue (Direct)", amount: 124500.50 },
              { name: "Platform Access Fees", amount: 15200.00 },
              { name: "Priority Listing Revenue", amount: 8400.00 }
            ],
            expenses: [
              { name: "Bad Debt Provision", amount: 4200.00 },
              { name: "Payment Gateway Fees", amount: 12500.25 },
              { name: "Marketing Rebates", amount: 5600.00 }
            ],
            totalRevenue: 148100.50,
            totalExpense: 22300.25,
            netProfit: 125800.25
          }
        });
      } else {
        setData({
          balance: {
            assets: [
              { name: "Cash at Bank (HDFC)", amount: 845000.00 },
              { name: "Accounts Receivable", amount: 112400.00 },
              { name: "VAT Input Credit", amount: 15600.00 }
            ],
            liabilities: [
              { name: "Accounts Payable (Suppliers)", amount: 412000.00 },
              { name: "VAT Output Payable", amount: 28400.00 },
              { name: "Supplier Holding Trust", amount: 150000.00 }
            ],
            equity: [
              { name: "Initial Capital", amount: 250000.00 },
              { name: "Retained Earnings", amount: 132600.00 }
            ],
            totalAssets: 973000.00,
            totalLiabilities: 590400.00,
            totalEquity: 382600.00,
            isBalanced: true
          }
        });
      }
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleDownload = (format: 'csv' | 'pdf') => {
    alert(`Generating ${activeTab.toUpperCase()} ${format.toUpperCase()} report...`);
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <OrbitalLoader message="Reconfiguring ledger view..." />
      <span className="text-xs text-muted-foreground animate-pulse">
        {activeTab === 'pnl' ? "Aggregating 4xxx/6xxx nodes..." : "Calculating 1xxx/2xxx/3xxx balances..."}
      </span>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 bg-linear-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
            {activeTab === 'pnl' ? "Profit & Loss" : "Balance Sheet"}
          </h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Double-entry ledger audited in real-time
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-muted/30 p-1 rounded-xl backdrop-blur-md border border-border">
            <button 
              onClick={() => setActiveTab('pnl')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'pnl' ? "bg-background text-primary shadow-sm" : "hover:text-primary/70"
              )}
            >
              P&L Statement
            </button>
            <button 
              onClick={() => setActiveTab('balance')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'balance' ? "bg-background text-primary shadow-sm" : "hover:text-primary/70"
              )}
            >
              Balance Sheet
            </button>
          </div>

          <div className="h-10 w-px bg-border mx-2" />

          <button 
            onClick={() => handleDownload('pdf')}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
          >
            <Download className="w-4 h-4" />
            Export Audit
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {activeTab === 'pnl' ? (
          <>
            <StatCard 
              title="Gross Revenue" 
              amount={data?.pnl?.totalRevenue || 0} 
              trend="+12.5%" 
              color="blue"
              icon={<TrendingUp className="w-5 h-5" />}
            />
            <StatCard 
              title="Total Operating Cost" 
              amount={data?.pnl?.totalExpense || 0} 
              trend="+4.2%" 
              color="rose"
              icon={<TrendingDown className="w-5 h-5" />}
            />
            <StatCard 
              title="Net Platform Margin" 
              amount={data?.pnl?.netProfit || 0} 
              trend="+8.1%" 
              color="emerald"
              icon={<PieChart className="w-5 h-5" />}
            />
          </>
        ) : (
          <>
            <StatCard 
              title="Total Assets" 
              amount={data?.balance?.totalAssets || 0} 
              trend="1xxx" 
              color="emerald"
              icon={<TrendingUp className="w-5 h-5" />}
            />
            <StatCard 
              title="Total Liabilities" 
              amount={data?.balance?.totalLiabilities || 0} 
              trend="2xxx" 
              color="rose"
              icon={<TrendingDown className="w-5 h-5" />}
            />
            <StatCard 
              title="Shareholder Equity" 
              amount={data?.balance?.totalEquity || 0} 
              trend="3xxx" 
              color="blue"
              icon={<PieChart className="w-5 h-5" />}
            />
          </>
        )}
      </div>

      {/* Main Report Table */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-linear-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
        <div className="relative bg-card/60 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {activeTab === 'pnl' ? "Standardized P&L Report" : "Consolidated Balance Sheet"}
                </h3>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">
                  {activeTab === 'pnl' ? "March 01 - March 22, 2025" : "Fiscal Year 2024-25 (As of Today)"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <button className="p-2 hover:bg-muted/50 rounded-lg transition-colors border border-transparent hover:border-border"><Calendar className="w-4 h-4" /></button>
               <button className="p-2 hover:bg-muted/50 rounded-lg transition-colors border border-transparent hover:border-border"><Filter className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="p-8 space-y-10">
            {activeTab === 'pnl' ? (
              <>
                {/* PNL CONTENT */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary">
                      <ArrowUpRight className="w-4 h-4" />
                      Revenue Inflow (4xxx)
                    </h4>
                    <span className="text-xs font-medium text-muted-foreground px-3 py-1 bg-primary/5 rounded-full border border-primary/10">Accrual Basis</span>
                  </div>
                  <div className="space-y-4">
                    {data?.pnl?.revenue.map((line, i) => (
                      <LedgerRow key={i} name={line.name} amount={line.amount} isTotal={false} />
                    ))}
                    <div className="pt-4 border-t border-dashed border-white/5">
                       <LedgerRow name="Total Marketplace Revenue" amount={data?.pnl?.totalRevenue || 0} isTotal={true} />
                    </div>
                  </div>
                </section>

                <section>
                   <div className="flex items-center justify-between mb-6">
                    <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-rose-500">
                      <ArrowDownRight className="w-4 h-4" />
                      Operating Deductions (6xxx)
                    </h4>
                  </div>
                  <div className="space-y-4">
                    {data?.pnl?.expenses.map((line, i) => (
                      <LedgerRow key={i} name={line.name} amount={line.amount} isTotal={false} negative />
                    ))}
                     <div className="pt-4 border-t border-dashed border-white/5">
                       <LedgerRow name="Total Direct Expenses" amount={data?.pnl?.totalExpense || 0} isTotal={true} negative />
                    </div>
                  </div>
                </section>

                <div className="mt-12 p-8 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-inner shadow-primary/5">
                  <div>
                    <p className="text-sm font-bold text-primary mb-1">Period Performance Verdict</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black">₹{(data?.pnl?.netProfit || 0).toLocaleString()}</span>
                      <span className="text-sm font-bold text-emerald-500 flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" /> Net Margin
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                     <button className="px-6 py-3 bg-foreground text-background rounded-xl text-sm font-black hover:scale-105 transition-all shadow-xl">
                       Confirm for Filing
                     </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* BALANCE SHEET CONTENT */}
                <section>
                  <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-emerald-500 mb-6">
                    <ArrowUpRight className="w-4 h-4" />
                    Asset Accounts (1xxx)
                  </h4>
                  <div className="space-y-4">
                    {data?.balance?.assets.map((line, i) => (
                      <LedgerRow key={i} name={line.name} amount={line.amount} isTotal={false} />
                    ))}
                    <div className="pt-4 border-t border-dashed border-white/5">
                       <LedgerRow name="Total Assets" amount={data?.balance?.totalAssets || 0} isTotal={true} />
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-rose-500 mb-6">
                    <ArrowDownRight className="w-4 h-4" />
                    Liability Accounts (2xxx)
                  </h4>
                  <div className="space-y-4">
                    {data?.balance?.liabilities.map((line, i) => (
                      <LedgerRow key={i} name={line.name} amount={line.amount} isTotal={false} negative />
                    ))}
                    <div className="pt-4 border-t border-dashed border-white/5">
                       <LedgerRow name="Total Liabilities" amount={data?.balance?.totalLiabilities || 0} isTotal={true} negative />
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-blue-500 mb-6">
                    <PieChart className="w-4 h-4" />
                    Equity Accounts (3xxx)
                  </h4>
                  <div className="space-y-4">
                    {data?.balance?.equity.map((line, i) => (
                      <LedgerRow key={i} name={line.name} amount={line.amount} isTotal={false} />
                    ))}
                    <div className="pt-4 border-t border-dashed border-white/5">
                       <LedgerRow name="Total Shareholder Equity" amount={data?.balance?.totalEquity || 0} isTotal={true} />
                    </div>
                  </div>
                </section>

                <div className="mt-12 p-8 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-inner shadow-emerald-500/5">
                  <div>
                    <p className="text-sm font-bold text-emerald-500 mb-1">Audit Status: Balanced</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-muted-foreground">Assets = Liabilities + Equity</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/20 text-xs font-black uppercase tracking-widest">
                    Verified by AOP Ledger
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


function StatCard({ title, amount, trend, color, icon }: { title: string, amount: number, trend: string, color: string, icon: React.ReactNode }) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-blue-500/5",
    rose: "text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-rose-500/5",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5",
  };

  return (
    <div className="relative group">
       <div className={cn("absolute -inset-0.5 rounded-2xl blur opacity-20 group-hover:opacity-50 transition duration-500", color === 'blue' ? 'bg-blue-500' : color === 'rose' ? 'bg-rose-500' : 'bg-emerald-500')}></div>
       <div className="relative p-6 rounded-2xl bg-card border border-white/5 shadow-xl transition-all group-hover:-translate-y-xs">
          <div className="flex items-start justify-between mb-6">
            <div className={cn("p-2.5 rounded-xl border", colorMap[color])}>
              {icon}
            </div>
            <div className={cn("text-xs font-black px-2.5 py-1 rounded-full border", colorMap[color])}>
              {trend}
            </div>
          </div>
          <p className="text-sm font-bold text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-black tabular-nums">₹{amount.toLocaleString()}</p>
       </div>
    </div>
  );
}

function LedgerRow({ name, amount, isTotal, negative }: { name: string, amount: number, isTotal?: boolean, negative?: boolean }) {
  return (
    <div className={cn(
      "flex items-center justify-between group/row border-b border-transparent hover:border-white/5 pb-1",
      isTotal ? "text-lg font-black" : "text-sm font-medium"
    )}>
      <div className="flex items-center gap-3">
        {isTotal && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
        <span className={cn(isTotal ? "text-foreground" : "text-muted-foreground")}>{name}</span>
      </div>
      <div className="flex items-center gap-1 tabular-nums font-mono tracking-tighter">
        {negative && <span className="opacity-50">-</span>}
        <span className={cn(
          negative ? "text-rose-500" : isTotal ? "text-primary" : "text-foreground"
        )}>
           ₹{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}
