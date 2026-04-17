import { useState, useMemo, useCallback } from 'react'
import { useAppStore } from '@/App'
import { Plus, ArrowLeft, ShoppingCart, AlertCircle } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ResponsiveDataTable, type Column, type FilterOption } from '@/components/shared/ResponsiveDataList'
import { useIngredients, type InventoryType, type InventoryCategory, type Ingredient } from '../hooks/useIngredients'
import { cn, currency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

const CATEGORIES: InventoryCategory[] = [
  'MEAT', 'SEAFOOD', 'PRODUCE', 'DAIRY', 'DRY_GOODS',
  'BEVERAGES', 'LIQUOR', 'WINE', 'BEER', 'OTHER',
]

// Create filter options from categories
const categoryFilterOptions: FilterOption<Ingredient>[] = [
  {
    key: 'category',
    label: 'Supply Domain',
    options: CATEGORIES.map(cat => ({ 
      value: cat, 
      label: cat.replace('_', ' ') 
    }))
  }
]

// Create filter options for active status
const statusFilterOptions: FilterOption<Ingredient>[] = [
  {
    key: 'active',
    label: 'Entry Lifecycle',
    options: [
      { value: true, label: 'Active Only' },
      { value: false, label: 'Show Archive' }
    ]
  }
]

export default function IngredientMasterPage() {
  const navigate = useAppStore((s) => s.navigate)
  const openIngredientDetail = useAppStore((s) => s.openIngredientDetail)
  const [type, setType] = useState<InventoryType | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Record<string, string | number | boolean | undefined>>({})

  const { data: ingredients, isLoading } = useIngredients(type)

  // Filter data based on type (segmented control in header)
  const filteredByType = useMemo(() => {
    if (!ingredients) return []
    return ingredients
  }, [ingredients])

  // Filter options combined
  const allFilterOptions = [...categoryFilterOptions, ...statusFilterOptions]

  // Define columns
  const columns: Column<Ingredient>[] = useMemo(() => [
    {
      header: 'Item Identity',
      accessorKey: 'description',
      cell: (item: Ingredient) => (
        <div className="space-y-0.5 py-1">
          <div className="font-bold text-foreground text-[13px] tracking-tight group-hover:text-primary transition-colors">{item.description}</div>
          <div className="font-mono text-[9px] font-bold tracking-wider text-muted-foreground/40 uppercase">{item.itemCode}</div>
        </div>
      )
    },
    {
      header: 'Department',
      accessorKey: 'category',
      cell: (item: Ingredient) => (
        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
          {item.category.replace('_', ' ')}
        </span>
      )
    },
    {
      header: 'Unit Basis',
      accessorKey: 'purchaseUnit',
      cell: (item: Ingredient) => <span className="text-xs font-semibold text-muted-foreground/80 lowercase italic">{item.purchaseUnit}</span>
    },
    {
      header: 'Purchase Val',
      accessorKey: 'purchaseUnitPrice',
      cell: (item: Ingredient) => <div className="font-bold text-foreground tabular-nums text-[13px]">{currency(item.purchaseUnitPrice)}</div>
    },
    {
      header: 'Conversion',
      accessorKey: 'ruPerPu',
      cell: (item: Ingredient) => (
        <div className="space-y-0.5">
          <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tight">1 {item.purchaseUnit} =</div>
          <div className="text-xs font-mono font-bold text-foreground">{item.ruPerPu} <span className="opacity-40 text-[9px] font-sans">{item.recipeUnit.replace('_', ' ')}</span></div>
        </div>
      )
    },
    {
      header: 'Yield',
      accessorKey: 'yieldPct',
      cell: (item: Ingredient) => <span className="font-mono text-xs font-bold text-foreground/60">{(item.yieldPct * 100).toFixed(0)}%</span>
    },
    {
      header: 'Inv Health',
      accessorKey: 'onHand',
      cell: (item: Ingredient) => {
        const isLow = (item.onHand || 0) < (item.parLevel || 0);
        return (
          <div className="flex flex-col gap-1 py-1">
             <div className="flex items-center gap-1.5">
                <span className={cn("text-[13px] font-black tabular-nums", isLow ? "text-rose-600" : "text-emerald-600")}>
                  {item.onHand || 0}
                </span>
                <span className="text-[10px] text-muted-foreground/30 font-medium">/ {item.parLevel || 0}</span>
             </div>
             {isLow && (
                <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-rose-500 italic animate-pulse">
                   <ShoppingCart size={10} /> Reorder
                </div>
             )}
          </div>
        );
      }
    },
    {
      header: 'Status',
      accessorKey: 'active',
      cell: (item: Ingredient) => <StatusBadge status={item.active ? 'ACTIVE' : 'INACTIVE'} className="scale-75 origin-left" />
    }
  ], [])

  // Mobile card render
  const mobileRender = useCallback((item: Ingredient) => (
    <div className="p-5 bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-white/5 rounded-xl transition-all group active:scale-[0.99] relative overflow-hidden">
      <div className="flex justify-between items-start gap-4 mb-3">
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] font-bold text-muted-foreground/40 tracking-wider uppercase">{item.itemCode}</span>
            <StatusBadge status={item.active ? 'ACTIVE' : 'INACTIVE'} className="scale-75 origin-left" />
          </div>
          <h3 className="font-bold text-[15px] text-foreground leading-tight tracking-tight group-hover:text-primary transition-colors">{item.description}</h3>
        </div>
        <div className="shrink-0 w-8 h-8 rounded-full border border-slate-100 dark:border-white/5 flex items-center justify-center text-muted-foreground/20 group-hover:text-primary transition-colors">
          <Plus className="h-4 w-4 rotate-90" />
        </div>
      </div>

      <div className="flex items-center gap-2.5 pt-1 text-[11px] font-medium text-muted-foreground/60">
        <span className="uppercase tracking-widest text-[9px] font-bold opacity-60">
          {item.category.replace('_', ' ')}
        </span>
        <span className="h-1 w-1 rounded-full bg-slate-200 dark:bg-white/10" />
        <span className="text-foreground/80 font-bold">
          {currency(item.purchaseUnitPrice)} <span className="font-medium opacity-40 text-[9px]">/ {item.purchaseUnit}</span>
        </span>
        {(item.onHand || 0) < (item.parLevel || 0) && (
          <>
            <span className="h-1 w-1 rounded-full bg-rose-200" />
            <span className="text-rose-600 font-black text-[9px] uppercase tracking-tighter flex items-center gap-1">
              <AlertCircle size={10} /> Low Stock
            </span>
          </>
        )}
      </div>
    </div>
  ), [])

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  // Handle filter
  const handleFilter = useCallback((newFilters: Record<string, string | number | boolean | undefined>) => {
    setFilters(newFilters)
  }, [])

  // Filter data locally based on type (segmented control)
  const processedData = useMemo(() => {
    let result = filteredByType

    // Apply type filter (from segmented control in header)
    if (type) {
      result = result.filter(i => {
        if (type === 'FOOD') {
          return ['MEAT', 'SEAFOOD', 'PRODUCE', 'DAIRY', 'BAKERY', 'DRY_GOODS'].includes(i.category)
        }
        if (type === 'BAR') {
          return ['BEVERAGES', 'LIQUOR', 'WINE', 'BEER'].includes(i.category)
        }
        return true
      })
    }

    // Apply active filter from table filters
    if (filters.active !== undefined) {
      result = result.filter(i => i.active === filters.active)
    }

    // Apply category filter from table filters
    if (filters.category) {
      result = result.filter(i => i.category === filters.category)
    }

    // Apply search from table
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(i =>
        i.description.toLowerCase().includes(query) ||
        i.itemCode.toLowerCase().includes(query)
      )
    }

    return result
  }, [filteredByType, type, filters, searchQuery])

  return (
    <div className="w-full min-h-0 flex-1 bg-slate-50 dark:bg-slate-950 overflow-hidden flex flex-col p-4 font-sans">
      <div className="w-full max-w-5xl flex-1 min-h-0 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl relative overflow-hidden">
        {/* Header */}
        <header className="shrink-0 z-20 w-full border-b border-slate-100 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4">
          <div className="flex flex-col gap-4">
            {/* Title row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate('inventory')} className="rounded-xl h-9 w-9 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="space-y-0.5">
                  <span className="font-semibold text-[10px] text-muted-foreground/40 uppercase tracking-[0.1em]">Supply Architecture</span>
                  <h1 className="text-xl font-bold text-foreground tracking-tight leading-none">
                    Ingredient Master
                  </h1>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => navigate('inventory-new-ingredient')}
                className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs gap-2 shadow-sm hover:opacity-90 active:scale-95 transition-all h-9 px-5 uppercase tracking-widest"
              >
                <Plus size={14} />
                New Item
              </Button>
            </div>

            {/* Type segmented control - kept in header as it's a top-level filter */}
            <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1 max-w-[280px]">
              {(['All', 'FOOD', 'BAR'] as const).map(t => {
                const active = t === 'All' ? !type : type === t
                return (
                  <button
                    key={t}
                    onClick={() => setType(t === 'All' ? undefined : t)}
                    className={`flex-1 rounded-lg py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all ${active
                        ? 'bg-white dark:bg-white/10 shadow-sm text-foreground ring-1 ring-slate-200/40 dark:ring-white/5'
                        : 'text-muted-foreground/60 hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5'
                      }`}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
          </div>
        </header>

        {/* List Content - table takes remaining height */}
        <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <div className="flex-1 p-3 overflow-hidden bg-slate-50/20 dark:bg-transparent">
            <ResponsiveDataTable
              data={processedData}
              columns={columns}
              mobileRender={mobileRender}
              onRowClick={(item) => openIngredientDetail(item.id)}
              // Search props
              searchable
              searchPlaceholder="Filter by description or SKU..."
              searchKeys={['description', 'itemCode']}
              onSearch={handleSearch}
              // Filter props
              filterable
              filterOptions={allFilterOptions}
              onFilter={handleFilter}
              // Pagination
              pagination
              initialPageSize={25}
              // Take full available height
              maxHeight="100%"
              // UI options
              isLoading={isLoading}
              emptyMessage="No items matched"
              emptyDescription={searchQuery ? `Refine your search for "${searchQuery}"` : 'The database is currently offline or empty.'}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
