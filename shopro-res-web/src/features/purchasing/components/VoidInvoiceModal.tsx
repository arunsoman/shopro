import React from 'react'
import { Trash2 } from 'lucide-react'
import { ConfirmModal } from "@/components/ui/ConfirmModal"

export interface VoidInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  invoiceNumber?: string;
}

export function VoidInvoiceModal({ open, onOpenChange, onConfirm, invoiceNumber }: VoidInvoiceModalProps) {
  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Void Invoice"
      description={`This will permanently mark invoice ${invoiceNumber || ''} as VOID. This action is recorded in the audit trail.`}
      onConfirm={onConfirm}
      confirmText="Void Invoice"
      variant="destructive"
    />
  )
}
