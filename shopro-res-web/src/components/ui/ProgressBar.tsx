import * as React from "react"
import * as ProgressBarPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const ProgressBar = React.forwardRef<
  React.ElementRef<typeof ProgressBarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressBarPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressBarPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressBarPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressBarPrimitive.Root>
))
ProgressBar.displayName = ProgressBarPrimitive.Root.displayName

export { ProgressBar }
