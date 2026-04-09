import React from 'react'
import { LucideIcon, HelpCircle } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "./Button"

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = HelpCircle,
  title,
  description,
  actionLabel,
  onAction,
  className
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center bg-muted/20 border border-dashed rounded-xl",
      className
    )}>
      <div className="p-3 bg-muted/40 rounded-full mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-[280px] mb-6">{description}</p>}
      {actionLabel && (
        <Button onClick={onAction} variant="outline" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export { EmptyState }
