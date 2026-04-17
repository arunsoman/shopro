/**
 * PurchasingHubPage.tsx (SS2.0)
 * ─────────────────────────────────────────────────────────────────
 * Central Command for Purchasing, Procurement, and Invoicing.
 */

import React from 'react';
import { useAppStore } from "@/App";
import { Users, BarChart3, ShoppingCart, CheckCircle2, ClipboardCheck, Plus, LayoutGrid, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/Button";
import { KpiCard } from "@/components/shared/cards/KpiCard";
import { KpiChartCard } from "@/components/shared/cards/KpiChartCard";
import { usePurchasingDashboard } from "@/hooks/useInvoices";
import { usePurchasingHubCounts } from "./hooks/usePurchasingHubCounts";
import { format, startOfWeek } from "date-fns";
import { useRestaurantId } from "@/providers/RestaurantProvider";

import { SupplierForm } from "./components/SupplierForm";
import { SlideOver, SlideOverContent, SlideOverHeader, SlideOverTitle, SlideOverDescription } from "@/components/ui/SlideOver";
import NavCard from "@/components/shared/cards/NavCard";
import type { NavCardContent } from "@/components/shared/cards/NavCard";
import { HubHeader } from "@/components/shared/headers/HubHeader";
import { useCreateSupplier } from "@/hooks/useSuppliers";
import { useToast } from "@/providers/ToastProvider";
import { currency } from "@/lib/utils";

export default function PurchasingHubPage() {
  const navigate = useAppStore(s => s.navigate);
  const restaurantId = useRestaurantId();
  const toast = useToast();

  const [showAddSupplier, setShowAddSupplier] = React.useState(false);
  const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');
  const { data: dashboard, isLoading } = usePurchasingDashboard(restaurantId, weekStart);
  const { data: hubCounts, isLoading: hubLoading } = usePurchasingHubCounts();
  const { mutate: createSupplier } = useCreateSupplier(restaurantId);

  // Use hub counts from dedicated endpoint for nav cards
  const isCardLoading = isLoading || hubLoading;

  const navCards: NavCardContent[] = [
    { label: 'Reorder Staging', desc: 'Mark items for reorder & raise POs', count: hubCounts?.reorderStagingCount, Icon: LayoutGrid, route: 'purchase-po-staging', iconColor: 'text-rose-500', iconBg: 'bg-rose-500/10' },
    { label: 'Purchase Orders', desc: 'Procurement drafts & sent orders', count: hubCounts?.purchaseOrdersToSendCount, Icon: ShoppingCart, route: 'purchase-po-list', iconColor: 'text-indigo-600', iconBg: 'bg-indigo-500/10' },
    { label: 'Goods Receipts', desc: 'Verify and confirm deliveries', count: hubCounts?.goodsReceiptsPendingCount, Icon: CheckCircle2, route: 'purchase-grn-list', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10' },
    { label: '3-Way Match', desc: 'Reconcile PO vs GRN vs INV', count: hubCounts?.threeWayMatchPendingCount, Icon: ClipboardCheck, route: 'purchase-matching', iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10' },
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

      {/* KPI Matrix with Chart */}
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
          title="Matching Health"
          value={`${dashboard?.matchingHealth ?? 0}%`}
          delta="On target"
          deltaDir={(dashboard?.matchingHealth ?? 0) >= 90 ? 'up' : 'down'}
          icon={ClipboardCheck}
          loading={isLoading}
        />
        <KpiChartCard
          title="Spend Trend (8 Weeks)"
          data={(dashboard?.spendTrend || []).map(t => ({
            label: t.weekLabel || '',
            value: t.trendPercentage || 0
          }))}
          chartType="line"
          color="primary"
          icon={TrendingUp}
          height={140}
          loading={isLoading}
          className="xl:col-span-2"
          action={
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("purchase-trend")} 
              className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-500/5 rounded-xl px-4 h-7"
            >
              Analyze Trends
            </Button>
          }
          footer={
            <div className="flex justify-between text-[9px] font-black tracking-[0.2em] text-muted-foreground/30 opacity-60 uppercase">
              <span>{dashboard?.spendTrend?.[0]?.weekLabel || 'Start'}</span>
              <span>{dashboard?.spendTrend?.length ? dashboard.spendTrend[dashboard.spendTrend.length - 1].weekLabel + ' (Current)' : 'Current'}</span>
            </div>
          }
        />
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
        {navCards.map((card) => (
          <NavCard
            key={card.label}
            card={card}
            loading={isCardLoading}
            onClick={() => navigate(card.route as any)}
          />
        ))}
      </div>

      {/* Charts + Latest Vouchers - Now uses KpiChartCard above */}
      {/* Remaining content can be added here if needed */}

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
