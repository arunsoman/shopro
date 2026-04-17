/**
 * InvoiceLogPage.tsx (SS2.6)
 * ─────────────────────────────────────────────────────────────────
 * Updated Invoice Log — High-density ledger with PO reconciliation linkage.
 */

import React, { useState, useMemo } from 'react';
import { useAppStore } from "@/App";
import { FileText, ShoppingCart, CheckCircle2, Receipt, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/Button";
import { InvoiceTable } from "./components/InvoiceTable";
import { useInvoices, usePostInvoice } from "@/hooks/useInvoices";
import { useRestaurantId } from "@/providers/RestaurantProvider";
import { CreateInvoiceModal } from "./components/CreateInvoiceModal";
import { DefaultLayout, KPICard } from '@/components/shared/DefaultLayout';
import { currency } from '@/lib/utils';

export default function InvoiceLogPage() {
  const navigate = useAppStore(s => s.navigate);
  const restaurantId = useRestaurantId();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [params] = useState({
    restaurantId,
    status: undefined as any
  });

  const { data: invoices = [], isLoading, refetch } = useInvoices(restaurantId, params);
  const { mutate: postInvoice } = usePostInvoice(restaurantId);

  // Calculate KPIs
  const kpiCards: KPICard[] = useMemo(() => {
    const total = invoices.length
    const posted = invoices.filter(i => i.status === 'POSTED').length
    const draft = invoices.filter(i => i.status === 'DRAFT').length
    const totalValue = invoices.reduce((sum, i) => sum + (i.invoiceAmount || 0), 0)
    
    return [
      {
        id: 'total',
        title: 'Total Invoices',
        value: total,
        subtitle: 'All time',
        icon: Receipt,
        variant: 'default' as const
      },
      {
        id: 'posted',
        title: 'Posted',
        value: posted,
        subtitle: 'Completed',
        icon: CheckCircle2,
        variant: 'success' as const
      },
      {
        id: 'draft',
        title: 'Draft',
        value: draft,
        subtitle: 'Pending',
        icon: FileText,
        variant: 'warning' as const
      },
      {
        id: 'value',
        title: 'Total Value',
        value: currency(totalValue),
        subtitle: 'All invoices',
        icon: ShoppingCart,
        variant: 'info' as const
      }
    ]
  }, [invoices])
  
  const handleCreate = () => setShowCreateModal(true)
  
  return (
    <DefaultLayout
      title="Invoice Log"
      subtitle="Track and manage supplier invoices"
      icon={FileText}
      category="Financial Ledger"
      showBack
      createLabel="New Invoice"
      onCreate={handleCreate}
      kpiCards={kpiCards}
      isLoading={isLoading}
      empty={!isLoading && invoices.length === 0}
      emptyTitle="No Invoices"
      emptyDescription="Create your first invoice to start tracking expenses."
      emptyAction={{ label: 'Create Invoice', onClick: handleCreate }}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
        <InvoiceTable
          invoices={invoices}
          onEdit={(id) => { useAppStore.setState({ selectedInvoiceId: id }); navigate("purchase-invoice-entry"); }}
          onPost={(id) => postInvoice(id)}
          onVoid={(id) => console.log('Voiding', id)}
          isLoading={isLoading}
        />
      </div>

      <CreateInvoiceModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={refetch}
      />
    </DefaultLayout>
  );
}
