import { Package, Search, AlertCircle, Plus, type LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  package: Package,
  search: Search,
  error: AlertCircle,
}

interface EmptyStateProps {
  icon?: keyof typeof iconMap | LucideIcon
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon = 'package', title, description, action }: EmptyStateProps) {
  const Icon = typeof icon === 'string' ? (iconMap[icon] ?? Package) : icon
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center">
      <Icon className="h-16 w-16 text-muted-foreground/30" strokeWidth={1} />
      <div className="space-y-1">
        <p className="font-semibold text-base">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium active:scale-95 transition-transform"
        >
          <Plus className="h-4 w-4" />
          {action.label}
        </button>
      )}
    </div>
  )
}