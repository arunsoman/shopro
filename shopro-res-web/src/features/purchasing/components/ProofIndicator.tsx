import React from 'react'
import { Check, AlertCircle } from 'lucide-react'
import { cn } from "@/lib/utils"

export interface ProofIndicatorProps {
  invoiceAmount: number;
  linesTotal: number;
  className?: string;
}

const ProofIndicator: React.FC<ProofIndicatorProps> = ({ invoiceAmount, linesTotal, className }) => {
  const variance = invoiceAmount - linesTotal
  const isPerfect = Math.abs(variance) < 0.001
  const isCentsOff = Math.abs(variance) > 0 && Math.abs(variance) < 1

  return (
    <div className={cn(
      "flex items-center gap-3 p-4 rounded-xl border transition-all duration-500",
      isPerfect 
        ? "bg-success/10 border-success/30 text-success" 
        : "bg-error/10 border-error/30 text-error animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]",
      className
    )}>
      <div className={cn(
        "p-2 rounded-full",
        isPerfect ? "bg-success text-white" : "bg-error text-white"
      )}>
        {isPerfect ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      </div>
      
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-wider font-bold opacity-70">
          Proof Validation
        </span>
        <span className="text-lg font-mono font-bold">
          {isPerfect ? "VERIFIED" : `$${(variance || 0).toFixed(2)} ERROR`}
        </span>
      </div>

      {!isPerfect && (
        <div className="ml-auto text-right">
          <p className="text-[10px] opacity-80 leading-none">Variance detected</p>
          <p className="text-sm font-medium mt-1">
            {isCentsOff ? "Rounding issue?" : "Line missmatch"}
          </p>
        </div>
      )}
    </div>
  )
}

export { ProofIndicator }
