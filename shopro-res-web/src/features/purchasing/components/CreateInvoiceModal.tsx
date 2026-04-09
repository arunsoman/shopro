import React, { useState, useEffect } from 'react'
import { Plus, Save, CheckCircle, X } from 'lucide-react'
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/Dialog"
import { SlideOver, SlideOverContent, SlideOverDescription, SlideOverHeader, SlideOverTitle } from "@/components/ui/SlideOver"
import { InvoiceHeader } from "./InvoiceHeader"
import { CategoryLinesTable } from "./CategoryLinesTable"
import { ProofIndicator } from "./ProofIndicator"
import { SupplierForm } from "./SupplierForm"
import { useCreateInvoiceDraft, usePostInvoice, useUpsertInvoiceLine } from "@/hooks/useInvoices"
import { useCreateSupplier } from "@/hooks/useSuppliers"
import { useToast } from "@/providers/ToastProvider"
import { useRestaurantId } from "@/providers/RestaurantProvider"
import type { PurchaseCategory, PurchaseInvoice } from "@/types"
import { format } from "date-fns"

interface CreateInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateInvoiceModal({ open, onOpenChange, onSuccess }: CreateInvoiceModalProps) {
  const restaurantId = useRestaurantId()
  const toast = useToast()
  
  const [invoiceId, setInvoiceId] = useState<number | null>(null)
  const isNew = !invoiceId

  const { mutate: createDraft, isPending: isCreating } = useCreateInvoiceDraft(restaurantId)
  const { mutate: postInvoice, isPending: isPosting } = usePostInvoice(restaurantId)
  const { mutate: upsertLine } = useUpsertInvoiceLine(restaurantId, invoiceId!)
  const { mutate: createSupplier } = useCreateSupplier(restaurantId)

  const [localInvoice, setLocalInvoice] = useState<Partial<PurchaseInvoice> & { supplierId?: number }>({
    invoiceDate: format(new Date(), 'yyyy-MM-dd'),
    invoiceNumber: '',
    invoiceAmount: 0,
    lines: [],
    status: 'DRAFT',
    supplierId: undefined
  })
  
  const [lineAmounts, setLineAmounts] = useState<Record<PurchaseCategory, number>>({} as any)
  const [showAddSupplier, setShowAddSupplier] = useState(false)

  // Reset state when opening for a new invoice
  useEffect(() => {
    if (open && !invoiceId) {
      setLocalInvoice({
        invoiceDate: format(new Date(), 'yyyy-MM-dd'),
        invoiceNumber: '',
        invoiceAmount: 0,
        lines: [],
        status: 'DRAFT',
        supplierId: undefined
      })
      setLineAmounts({} as any)
      setInvoiceId(null)
    }
  }, [open, invoiceId])

  const handleHeaderChange = (field: string, value: any) => {
    setLocalInvoice(prev => ({ ...prev, [field]: value }))
  }

  const handleLineChange = (category: PurchaseCategory, amount: number) => {
    setLineAmounts(prev => ({ ...prev, [category]: amount }))
    if (invoiceId) {
      upsertLine({ purchaseCategory: category, amount })
    }
  }

  const handleSaveDraft = () => {
    if (!localInvoice.supplierId) {
      return toast.error("Please select a supplier first.")
    }
    
    createDraft({
      supplierId: localInvoice.supplierId!,
      invoiceDate: localInvoice.invoiceDate!,
      invoiceNumber: localInvoice.invoiceNumber || '',
      invoiceAmount: localInvoice.invoiceAmount || 0
    }, {
      onSuccess: (newInv) => {
        setInvoiceId(newInv.id)
        toast.success("Draft created.")
        // Also upsert any lines entered so far
        Object.entries(lineAmounts).forEach(([cat, amt]) => {
          if (amt > 0) upsertLine({ purchaseCategory: cat as PurchaseCategory, amount: amt })
        })
      }
    })
  }

  const handlePost = () => {
    if (!invoiceId) return
    const linesTotal = Object.values(lineAmounts).reduce((acc, curr) => acc + (curr || 0), 0)
    if (Math.abs((localInvoice.invoiceAmount || 0) - linesTotal) > 0.01) {
      return toast.error("Invoice proof does not balance.")
    }

    postInvoice(invoiceId, {
      onSuccess: () => {
        toast.success("Invoice posted successfully.")
        onOpenChange(false)
        onSuccess?.()
      }
    })
  }

  const handleQuickSupplierSave = (data: any) => {
    createSupplier(data, {
      onSuccess: (newSupplier) => {
        setLocalInvoice(prev => ({ ...prev, supplierId: newSupplier.id }))
        setShowAddSupplier(false)
        toast.success(`Supplier "${newSupplier.name}" created and selected.`)
      }
    })
  }

  const linesTotal = Object.values(lineAmounts).reduce((acc, curr) => acc + (curr || 0), 0)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-muted shadow-2xl"
          style={{ background: "var(--crd)" }}
        >
          <div className="sticky top-0 z-50 border-b p-6 flex justify-between items-center" style={{ background: "var(--crd)" }}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">New Purchasing Invoice</DialogTitle>
              <DialogDescription>Enter manual categorical spend for your restaurant.</DialogDescription>
            </DialogHeader>
            <div className="flex gap-3">
               {isNew ? (
                 <Button onClick={handleSaveDraft} disabled={isCreating}>
                   {isCreating ? "Creating..." : "Save Header & Start"}
                 </Button>
               ) : (
                 <Button onClick={handlePost} variant="default" disabled={isPosting}>
                   <CheckCircle className="mr-2 h-4 w-4" />
                   {isPosting ? "Posting..." : "Post Invoice"}
                 </Button>
               )}
            </div>
          </div>

          <div className="p-6 space-y-8">
            <InvoiceHeader 
              supplierId={localInvoice.supplierId} 
              invoiceDate={localInvoice.invoiceDate!} 
              invoiceNumber={localInvoice.invoiceNumber!} 
              invoiceAmount={localInvoice.invoiceAmount!} 
              onChange={handleHeaderChange}
              onAddSupplier={() => setShowAddSupplier(true)}
              readOnly={!isNew && localInvoice.status === 'POSTED'}
            />

            <div className={isNew ? "opacity-50 pointer-events-none grayscale" : ""}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                Category Breakdown
              </h3>
              <CategoryLinesTable 
                lines={lineAmounts} 
                onChange={handleLineChange} 
                readOnly={localInvoice.status === 'POSTED'}
              />
            </div>
          </div>

          {/* Floating Proof Footer in Modal */}
          <div className="sticky bottom-0 border-t p-4 z-50" style={{ background: "var(--crd)" }}>
            <div className="max-w-3xl mx-auto flex items-center justify-between">
               <div className="flex-1">
                  <ProofIndicator 
                    invoiceAmount={localInvoice.invoiceAmount || 0} 
                    linesTotal={linesTotal} 
                  />
               </div>
               {!isNew && (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    DRAFT #{invoiceId}
                  </Badge>
               )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SlideOver 
        open={showAddSupplier} 
        onOpenChange={setShowAddSupplier}
      >
        <SlideOverContent className="z-[100]">
          <SlideOverHeader>
            <SlideOverTitle>Quick Add Supplier</SlideOverTitle>
            <SlideOverDescription>Register a new vendor without leaving the invoice flow.</SlideOverDescription>
          </SlideOverHeader>
          <div className="mt-6">
            <SupplierForm 
              onSave={handleQuickSupplierSave}
              onCancel={() => setShowAddSupplier(false)}
            />
          </div>
        </SlideOverContent>
      </SlideOver>
    </>
  )
}
