// ─────────────────────────────────────────────────────────────
// FinalisePeriodModal.tsx
// Confirm finalization of an analysis period.
// ─────────────────────────────────────────────────────────────

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Lock } from "lucide-react";

interface FinalisePeriodModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  periodLabel?: string;
  isLoading?: boolean;
}

export function FinalisePeriodModal({
  open,
  onClose,
  onConfirm,
  periodLabel = "this analysis",
  isLoading,
}: FinalisePeriodModalProps) {
  return (
    <Modal open={open} onOpenChange={(v) => !v && onClose()}>
      <ModalContent className="sm:max-w-sm">
        <ModalHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Lock size={20} className="text-amber-600" />
          </div>
          <ModalTitle>Finalise Analysis?</ModalTitle>
          <ModalDescription>
            Finalising <strong>{periodLabel}</strong> will lock it and prevent further edits. This
            cannot be undone.
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading} className="rounded-xl">
            {isLoading ? "Finalising…" : "Finalise"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
