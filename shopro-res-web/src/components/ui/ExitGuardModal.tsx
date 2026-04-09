import React from 'react'
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "./Modal"
import { Button } from "./Button"

export interface ExitGuardModalProps {
  isOpen: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onStay: () => void;
}

export function ExitGuardModal({
  isOpen,
  onSave,
  onDiscard,
  onStay,
}: ExitGuardModalProps) {
  return (
    <Modal open={isOpen} onOpenChange={onStay}>
      <ModalContent className="sm:max-w-[425px]">
        <ModalHeader>
          <ModalTitle>Unsaved Changes</ModalTitle>
          <ModalDescription>
            You have unsaved changes. Do you want to save them before leaving?
          </ModalDescription>
        </ModalHeader>
        <ModalFooter className="flex-col sm:flex-row gap-2 mt-4">
          <Button variant="ghost" onClick={onStay} className="sm:flex-1">Keep Editing</Button>
          <Button variant="destructive" onClick={onDiscard} className="sm:flex-1">Discard</Button>
          <Button variant="default" onClick={onSave} className="sm:flex-1">Save Draft</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
