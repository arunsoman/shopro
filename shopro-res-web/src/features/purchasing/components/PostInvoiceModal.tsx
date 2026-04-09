import React from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"

export interface PostInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  invoiceNumber?: string;
  total?: number;
  variance?: number;
}

export function PostInvoiceModal({ open, onOpenChange, onConfirm, invoiceNumber, total, variance = 0 }: PostInvoiceModalProps) {
  const hasVariance = Math.abs(variance) > 0.01

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-[425px]">
        <ModalHeader>
          <ModalTitle>Post Invoice to Ledger</ModalTitle>
          <ModalDescription>
            {hasVariance 
              ? "Warning: This invoice has a variance. Are you sure you want to post it?"
              : `Confirm posting ${invoiceNumber || 'this invoice'} for $${total?.toFixed(2)}.`
            }
          </ModalDescription>
        </ModalHeader>

        <div className="p-4 rounded-xl bg-muted/20 border space-y-3">
           <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Invoice Amount</span>
              <span className="font-bold">${total?.toFixed(2)}</span>
           </div>
           <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Variance</span>
              <span className={hasVariance ? "text-error font-bold" : "text-success"}>
                 {hasVariance ? `$${(variance || 0).toFixed(2)}` : "None (Balanced)"}
              </span>
           </div>
        </div>

        <ModalFooter className="mt-6">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            variant={hasVariance ? "destructive" : "default"} 
            onClick={onConfirm}
            className="shadow-lg"
          >
            {hasVariance ? "Post with Variance" : "Post Invoice"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
