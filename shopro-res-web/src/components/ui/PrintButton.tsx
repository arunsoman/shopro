import React from 'react'
import { Printer } from 'lucide-react'
import { Button, ButtonProps } from "./Button"

export interface PrintButtonProps extends ButtonProps {
  containerId?: string;
}

export function PrintButton({ containerId, children, ...props }: PrintButtonProps) {
  const handlePrint = () => {
     window.print()
  }

  return (
    <Button onClick={handlePrint} variant="outline" size="sm" {...props}>
      <Printer className="mr-2 h-4 w-4" />
      {children || "Print Record"}
    </Button>
  )
}
