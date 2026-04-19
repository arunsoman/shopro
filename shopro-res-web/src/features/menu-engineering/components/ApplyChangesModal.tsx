// ─────────────────────────────────────────────────────────────
// ApplyChangesModal.tsx (ME.8)
// Confirm applying What-If price changes.
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
import { FlaskConical } from "lucide-react";

interface ApplyChangesModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemCount?: number;
  changedCount?: number;
  isLoading?: boolean;
}

export function ApplyChangesModal({
  open,
  onClose,
  onConfirm,
  itemCount = 0,
  changedCount = 0,
  isLoading,
}: ApplyChangesModalProps) {
  return (
    <Modal open={open} onOpenChange={(v) => !v && onClose()}>
      <ModalContent className="sm:max-w-sm">
        <ModalHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <FlaskConical size={20} className="text-primary" />
          </div>
          <ModalTitle>Apply Price Changes?</ModalTitle>
          <ModalDescription>
            Apply {itemCount} price override{itemCount !== 1 ? "s" : ""}
            {changedCount > 0 && <> ({changedCount} classification change{changedCount !== 1 ? "s" : ""})</>}
            ? This will update the menu item sell prices.
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading} className="rounded-xl">
            {isLoading ? "Applying…" : "Apply Changes"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
