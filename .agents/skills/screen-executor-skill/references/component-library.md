# Component Library Reference

All shared components used across screens. Build these before implementing any screen.

---

## shadcn/ui Components Used

Install with:
```bash
npx shadcn@latest add button input card badge dialog sheet tabs
npx shadcn@latest add select separator skeleton table label
npx shadcn@latest add dropdown-menu popover command toast sonner
npx shadcn@latest add progress avatar scroll-area
```

---

## Custom Shared Components

### 1. KpiCard

```tsx
// src/components/shared/KpiCard.tsx
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string;
  delta?: string;
  deltaDir?: 'up' | 'down' | 'flat';
  icon?: LucideIcon;
  isLive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function KpiCard({ title, value, delta, deltaDir, icon: Icon, isLive, onClick, className }: KpiCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative bg-card rounded-xl p-4 border shadow-sm text-left',
        'active:scale-[0.97] transition-transform w-full',
        onClick && 'cursor-pointer hover:shadow-md',
        className
      )}
    >
      {isLive && (
        <span className="absolute top-3 right-3 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
      )}
      <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
        {Icon && <Icon className="h-4 w-4" />}
        <span>{title}</span>
      </div>
      <p className="text-[28px] font-bold leading-none tracking-tight">{value}</p>
      {delta && (
        <div className={cn(
          'flex items-center gap-1 mt-1.5 text-xs font-medium',
          deltaDir === 'up' && 'text-emerald-600',
          deltaDir === 'down' && 'text-rose-500',
          deltaDir === 'flat' && 'text-muted-foreground',
        )}>
          {deltaDir === 'up' && <TrendingUp className="h-3 w-3" />}
          {deltaDir === 'down' && <TrendingDown className="h-3 w-3" />}
          {deltaDir === 'flat' && <Minus className="h-3 w-3" />}
          {delta}
        </div>
      )}
    </button>
  );
}
```

### 2. DataTable (Responsive)

```tsx
// src/components/shared/DataTable.tsx
// Renders as cards on mobile (<768px), as <table> on md+

import { SkeletonCard } from './SkeletonCard';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  mobileHide?: boolean;   // hide on mobile card view
  className?: string;
}

interface DataTableProps<T extends { id: number | string }> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends { id: number | string }>({
  columns, data, onRowClick, isLoading, emptyMessage = 'No data'
}: DataTableProps<T>) {
  if (isLoading) return (
    <div className="space-y-3 p-4">
      {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
  if (!data.length) return <EmptyState title={emptyMessage} />;

  const visibleCols = columns.filter(c => !c.mobileHide);

  return (
    <>
      {/* Mobile: cards */}
      <div className="md:hidden space-y-3 p-4">
        {data.map(row => (
          <button
            key={row.id}
            onClick={() => onRowClick?.(row)}
            className="w-full text-left bg-card rounded-xl border p-4 shadow-sm active:scale-[0.98] transition-transform"
          >
            {visibleCols.map(col => (
              <div key={col.key} className="flex justify-between items-start py-0.5">
                <span className="text-xs text-muted-foreground">{col.header}</span>
                <span className="text-sm font-medium text-right ml-4">
                  {col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as React.ReactNode}
                </span>
              </div>
            ))}
          </button>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              {columns.map(col => (
                <th key={col.key} className={`px-4 py-3 text-left font-medium text-muted-foreground ${col.className ?? ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? 'cursor-pointer hover:bg-muted/50 border-b' : 'border-b'}
              >
                {columns.map(col => (
                  <td key={col.key} className={`px-4 py-3 ${col.className ?? ''}`}>
                    {col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as React.ReactNode}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
```

### 3. BottomSheet

```tsx
// src/components/shared/BottomSheet.tsx
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: '50vh' | '70vh' | '90vh' | 'auto';
}

export function BottomSheet({ open, onClose, title, children, height = '70vh' }: BottomSheetProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl',
          'flex flex-col animate-in slide-in-from-bottom duration-300',
        )}
        style={{ maxHeight: height }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold text-base">{title}</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
```

### 4. ConfirmModal

```tsx
// src/components/shared/ConfirmModal.tsx
import { AlertTriangle, Info, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmModal({
  open, onClose, onConfirm, title, description,
  confirmLabel = 'Confirm', variant = 'info', isLoading
}: ConfirmModalProps) {
  if (!open) return null;
  const Icon = variant === 'danger' ? XCircle : variant === 'warning' ? AlertTriangle : Info;
  const iconColor = variant === 'danger' ? 'text-rose-500' : variant === 'warning' ? 'text-amber-500' : 'text-blue-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in zoom-in-95">
        <div className="flex flex-col items-center text-center gap-3">
          <Icon className={`h-12 w-12 ${iconColor}`} />
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button
            className={`flex-1 ${variant === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### 5. SkeletonCard

```tsx
// src/components/shared/SkeletonCard.tsx
import { Skeleton } from '@/components/ui/skeleton';

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-card rounded-xl border p-4 space-y-2.5">
      {[...Array(lines)].map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i === 0 ? 'w-1/3' : i === 1 ? 'w-full' : 'w-2/3'}`} />
      ))}
    </div>
  );
}
```

### 6. EmptyState

```tsx
// src/components/shared/EmptyState.tsx
import { Package, Search, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const icons = { package: Package, search: Search, error: AlertCircle };

interface EmptyStateProps {
  icon?: keyof typeof icons;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon = 'package', title, description, action }: EmptyStateProps) {
  const Icon = icons[icon];
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center">
      <Icon className="h-16 w-16 text-muted-foreground/30" />
      <div>
        <p className="font-semibold text-base">{title}</p>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {action && (
        <Button onClick={action.onClick} className="mt-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" /> {action.label}
        </Button>
      )}
    </div>
  );
}
```

### 7. StatusBadge

```tsx
// src/components/shared/StatusBadge.tsx
import { cn } from '@/lib/utils';

type StatusVariant =
  | 'ACTIVE' | 'INACTIVE'
  | 'DRAFT' | 'POSTED' | 'VOID'
  | 'OPEN' | 'CLOSED' | 'FINALISED'
  | 'WINNER' | 'WORKHORSE' | 'OPPORTUNITY' | 'LOSER'
  | 'AVAILABLE' | 'HIGH' | 'LOW';

const variantStyles: Record<StatusVariant, string> = {
  ACTIVE:      'bg-emerald-100 text-emerald-800',
  INACTIVE:    'bg-slate-100 text-slate-600',
  DRAFT:       'bg-amber-100 text-amber-800',
  POSTED:      'bg-emerald-100 text-emerald-800',
  VOID:        'bg-rose-100 text-rose-800',
  OPEN:        'bg-blue-100 text-blue-800',
  CLOSED:      'bg-slate-100 text-slate-600',
  FINALISED:   'bg-emerald-100 text-emerald-800',
  WINNER:      'bg-emerald-100 text-emerald-800',
  WORKHORSE:   'bg-blue-100 text-blue-800',
  OPPORTUNITY: 'bg-amber-100 text-amber-800',
  LOSER:       'bg-rose-100 text-rose-800',
  AVAILABLE:   'bg-emerald-100 text-emerald-800',
  HIGH:        'bg-emerald-100 text-emerald-800',
  LOW:         'bg-rose-100 text-rose-800',
};

export function StatusBadge({ status }: { status: StatusVariant }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
      variantStyles[status] ?? 'bg-slate-100 text-slate-600'
    )}>
      {status}
    </span>
  );
}
```

### 8. AppShell (Bottom Tab Bar + Header)

```tsx
// src/components/layout/AppShell.tsx
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Map, ChefHat, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Package,         label: 'Inventory',  path: '/inventory' },
  { icon: Map,             label: 'Floor',      path: '/floor' },
  { icon: ChefHat,         label: 'Recipes',    path: '/recipes' },
  { icon: MoreHorizontal,  label: 'More',       path: '/more' },
];

export function AppShell() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>

      {/* Bottom tab bar */}
      <nav className="border-t bg-background safe-area-pb">
        <div className="flex h-16">
          {tabs.map(tab => {
            const active = pathname === tab.path ||
              (tab.path !== '/' && pathname.startsWith(tab.path));
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-1 transition-colors',
                  active ? 'text-emerald-600' : 'text-muted-foreground'
                )}
              >
                <tab.icon className={cn('h-5 w-5', active && 'fill-current')} />
                <span className="text-[10px] font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
```

---

## Utility Functions

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function currency(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: decimals
  }).format(value);
}

export function percent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
```

---

## Zustand Store

```typescript
// src/store/useRestaurantStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RestaurantStore {
  restaurantId: number;
  restaurantName: string;
  authToken: string | null;
  setAuth: (token: string, restaurantId: number, name: string) => void;
  clearAuth: () => void;
}

export const useRestaurantStore = create<RestaurantStore>()(
  persist(
    (set) => ({
      restaurantId: 1,   // default to seeded restaurant
      restaurantName: '',
      authToken: null,
      setAuth: (token, restaurantId, name) =>
        set({ authToken: token, restaurantId, restaurantName: name }),
      clearAuth: () => set({ authToken: null }),
    }),
    { name: 'restaurant-store' }
  )
);
```
