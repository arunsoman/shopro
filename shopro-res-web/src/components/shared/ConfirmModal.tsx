import { AlertTriangle, Info, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
}

export function ConfirmModal({
  open, onClose, onConfirm, title, description,
  confirmLabel = 'Confirm', variant = 'info', isLoading
}: ConfirmModalProps) {
  if (!open) return null

  const Icon = variant === 'danger' ? XCircle : variant === 'warning' ? AlertTriangle : Info
  const iconColor = {
    danger: 'text-rose-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
  }[variant]
  const confirmBg = variant === 'danger'
    ? 'bg-rose-600 hover:bg-rose-700'
    : 'bg-emerald-600 hover:bg-emerald-700'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="relative bg-background rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center gap-3">
          <Icon className={cn('h-12 w-12', iconColor)} />
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-11 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              'flex-1 h-11 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50',
              confirmBg
            )}
          >
            {isLoading ? 'Loading...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}