import * as React from "react"
import * as DividerPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

const Divider = React.forwardRef<
  React.ElementRef<typeof DividerPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof DividerPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <DividerPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Divider.displayName = DividerPrimitive.Root.displayName

export { Divider }
