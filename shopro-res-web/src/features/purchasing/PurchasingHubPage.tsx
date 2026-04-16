/**
 * PurchasingHubPage.tsx (SS2.0)
 * ─────────────────────────────────────────────────────────────────
 * Central Command for Purchasing, Procurement, and Invoicing.
 */

import React from 'react';
import { useAppStore } from "@/App";
import { FileText, Users, BarChart3, ShoppingCart, CheckCircle2, ClipboardCheck, Plus, LayoutGrid, TrendingUp } from 'lucide-react';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { KpiCard } from "@/components/shared/cards/KpiCard";
import { usePurchasingDashboard } from "@/hooks/useInvoices";
import { format, startOfWeek } from "date-fns";
import { useRestaurantId } from "@/providers/RestaurantProvider";

import { SupplierForm } from "./components/SupplierForm";
import { SlideOver, SlideOverContent, SlideOverHeader, SlideOverTitle, SlideOverDescription } from "@/components/ui/SlideOver";
import NavCard from "@/components/shared/cards/NavCard";
import type { NavCardContent } from "@/components/shared/cards/NavCard";
import { HubHeader } from "@/components/shared/headers/HubHeader";
import { DataList, DataListItem } from "@/components/shared/lists/DataList";
import { Suspendable } from "@/components/shared/Suspendable";
import { useCreateSupplier } from "@/hooks/useSuppliers";
import { useLowStockAlerts } from "@/features/inventory/hooks/useIngredients";
import { useToast } from "@/providers/ToastProvider";
import { cn, currency } from "@/lib/utils";

// ── Trend chart skeleton ─────────────────────────────────────────

function TrendChartSkeleton() {
  return (
    <div className="h-[280px] flex items-end gap-4 pb-4 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex-1 bg-muted/10 rounded-2xl" style={{ height: `${30 + Math.random() * 60}%` }} />
      ))}
    </div>
  );
}

export default function PurchasingHubPage() {
  const navigate = useAppStore(s => s.navigate);
  const restaurantId = useRestaurantId();
  const toast = useToast();

  const [showAddSupplier, setShowAddSupplier] = React.useState(false);
  const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');
  const { data: dashboard, isLoading } = usePurchasingDashboard(restaurantId, weekStart);
  const { mutate: createSupplier } = useCreateSupplier(restaurantId);
  const { data: lowStockAlerts } = useLowStockAlerts();

  const navCards: NavCardContent[] = [
    { label: 'Reorder Staging', desc: 'Mark items for reorder & raise POs', count: lowStockAlerts?.length, Icon: LayoutGrid, route: 'purchase-po-staging', iconColor: 'text-rose-500', iconBg: 'bg-rose-500/10' },
    { label: 'Purchase Orders', desc: 'Procurement drafts & sent orders', count: dashboard?.openPoCount, Icon: ShoppingCart, route: 'purchase-po-list', iconColor: 'text-indigo-600', iconBg: 'bg-indigo-500/10' },
    { label: 'Goods Receipts', desc: 'Verify and confirm deliveries', count: dashboard?.unmatchedGrnCount, Icon: CheckCircle2, route: 'purchase-grn-list', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10' },
    { label: '3-Way Match', desc: 'Reconcile PO vs GRN vs INV', count: dashboard?.matchingHealth, Icon: ClipboardCheck, route: 'purchase-matching', iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10' },
  ];

  return (
    <div className="absolute inset-0 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-10 space-y-10 mi-animate overflow-y-auto">

      <HubHeader
        title="Purchasing Hub"
        subtitle="Purchasing Command"
        icon={ShoppingCart}
        loading={isLoading}
      >
        <Button variant="outline" onClick={() => setShowAddSupplier(true)} className="h-14 px-8 rounded-2xl border-slate-200 dark:border-white/10 font-bold tracking-tight text-base transition-all hover:bg-white dark:hover:bg-white/5">
          <Users className="mr-2 h-5 w-5" /> Add Supplier
        </Button>
        <Button onClick={() => { useAppStore.setState({ selectedPOId: 'new' }); navigate("purchase-po-editor"); }} className="h-14 px-8 rounded-2xl bg-indigo-600 shadow-2xl shadow-indigo-500/20 gap-2.5 font-bold tracking-tight text-base transition-all hover:scale-[1.02] active:scale-[0.98] text-white">
          <Plus size={20} strokeWidth={3} /> Generate PO
        </Button>
      </HubHeader>

      {/* KPI Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 px-2">
        <KpiCard
          title="Weekly Spend"
          value={currency(dashboard?.weeklySpend || 0)}
          delta={dashboard?.spendDelta || '0%'}
          deltaDir="up"
          icon={BarChart3}
          loading={isLoading}
        />
        <KpiCard
          title="Open Orders"
          value={String(dashboard?.openPoCount ?? 0)}
          delta="Requires follow-up"
          deltaDir="flat"
          icon={ShoppingCart}
          loading={isLoading}
        />
        <KpiCard
          title="Unmatched GRNs"
          value={String(dashboard?.unmatchedGrnCount ?? 0)}
          delta="Critical reconciliation"
          deltaDir={(dashboard?.unmatchedGrnCount ?? 0) > 0 ? 'down' : 'flat'}
          icon={CheckCircle2}
          loading={isLoading}
        />
        <KpiCard
          title="Matching Health"
          value={`${dashboard?.matchingHealth ?? 0}%`}
          delta="On target"
          deltaDir={(dashboard?.matchingHealth ?? 0) >= 90 ? 'up' : 'down'}
          icon={ClipboardCheck}
          loading={isLoading}
        />
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
        {navCards.map((card) => (
          <NavCard
            key={card.label}
            card={card}
            loading={isLoading}
            onClick={() => navigate(card.route as any)}
          />
        ))}
      </div>

      {/* Charts + Latest Vouchers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2 pb-10">
        <Card className="lg:col-span-2 p-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 rounded-[2.5rem] space-y-10 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center relative z-10">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground opacity-60 flex items-center gap-2">
              <TrendingUp size={14} className="text-indigo-600" />
              Spend Frequency (8 Weeks)
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate("purchase-trend")} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-500/5 rounded-xl px-4">
              Analyze Trends
            </Button>
          </div>

          <Suspendable
            isLoading={isLoading}
            skeleton={<TrendChartSkeleton />}
          >
            <div className="h-[280px] flex items-end gap-4 pb-4 relative z-10">
              {(dashboard?.spendTrend || []).map((trend, i) => (
                <div key={i} className="flex-1 bg-slate-50 dark:bg-black/20 rounded-2xl relative group h-full">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-indigo-600 rounded-2xl transition-all duration-700 ease-out group-hover:shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                    style={{ height: `${trend.trendPercentage}%` }}
                  />
                </div>
              ))}
            </div>
          </Suspendable>

          <div className="flex justify-between text-[9px] font-black tracking-[0.2em] text-muted-foreground/30 opacity-60 uppercase relative z-10 mt-2">
            <span>{dashboard?.spendTrend?.[0]?.weekLabel || 'Start'}</span>
            <span>{dashboard?.spendTrend?.length ? dashboard.spendTrend[dashboard.spendTrend.length - 1].weekLabel + ' (Current)' : 'Current'}</span>
          </div>
        </Card>

        <Card className="p-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 rounded-[2.5rem] space-y-6 shadow-sm">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground opacity-60 flex items-center gap-2">
            <FileText size={14} className="text-sky-500" />
            Latest Vouchers
          </h3>

          <DataList loading={isLoading} skeletonCount={4}>
            {(dashboard?.latestVouchers || []).map(invoice => (
              <DataListItem
                key={invoice.id}
                title={(invoice.invoiceNumber && invoice.invoiceNumber.length > 0) ? invoice.invoiceNumber : `INV-${invoice.id}`}
                subtitle={invoice.supplierName || 'Unknown Supplier'}
                value={currency(invoice.invoiceAmount)}
                onClick={() => navigate('purchase-invoice-log')}
              />
            ))}
          </DataList>

          <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 dark:border-white/5 font-black uppercase tracking-widest text-[11px] hover:bg-slate-50 dark:hover:bg-white/5" onClick={() => navigate("purchase-invoice-log")}>
            See Integrated Log
          </Button>
        </Card>
      </div>

      <SlideOver open={showAddSupplier} onOpenChange={setShowAddSupplier}>
        <SlideOverContent className="sm:max-w-xl">
          <SlideOverHeader>
            <SlideOverTitle className="text-2xl font-black tracking-tighter">Fast Registration</SlideOverTitle>
            <SlideOverDescription className="text-xs font-medium opacity-50 italic">Onboard a new supplier entity immediately.</SlideOverDescription>
          </SlideOverHeader>
          <div className="mt-10 px-2">
            <SupplierForm
              onSave={(data) => {
                createSupplier(data, {
                  onSuccess: () => {
                    toast.success("Supplier registered.");
                    setShowAddSupplier(false);
                  }
                });
              }}
              onCancel={() => setShowAddSupplier(false)}
            />
          </div>
        </SlideOverContent>
      </SlideOver>
    </div>
  );
}
