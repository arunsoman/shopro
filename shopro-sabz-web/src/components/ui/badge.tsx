import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-md border border-zinc-200 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:border-zinc-800 dark:focus:ring-zinc-300",
    {
        variants: {
            variant: {
                default: "border-transparent bg-primary text-white hover:bg-primary/80",
                secondary: "border-transparent bg-muted/10 text-foreground hover:bg-muted/20",
                destructive: "border-transparent bg-error text-white hover:bg-error/80",
                outline: "text-foreground border-border",
                success: "border-transparent bg-success text-white hover:bg-success/80",
                warning: "border-transparent bg-warning text-white hover:bg-warning/80",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
