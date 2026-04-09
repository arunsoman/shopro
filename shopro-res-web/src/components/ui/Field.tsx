import * as React from "react"
import { Label } from "./Label"
import { Input } from "./Input"
import { cn } from "@/lib/utils"

export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ className, label, error, hint, type, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        <Label htmlFor={props.id || props.name} className="text-xs font-semibold text-foreground/80">{label}</Label>
        <Input 
          ref={ref} 
          type={type} 
          className={cn(
            "h-10",
            error && "border-error focus-visible:ring-error text-error", 
            className
          )} 
          {...props} 
        />
        {hint && !error && <p className="text-[10px] text-muted-foreground">{hint}</p>}
        {error && <p className="text-[10px] text-error font-medium animate-in fade-in slide-in-from-top-1">{error}</p>}
      </div>
    )
  }
)
Field.displayName = "Field"

export { Field }
