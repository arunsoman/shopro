import { useState, useMemo, useCallback } from 'react'
import { useAppStore } from '@/App'
import { Plus, Search, ChevronRight, ArrowLeft } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ResponsiveDataList, type Column, type FilterOption } from '@/components/shared/ResponsiveDataList'
import { useIngredients, type InventoryType, type InventoryCategory, type Ingredient } from '../hooks/useIngredients'
import { useDebounce } from '@/components/shared/useDebounce'
import { currency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

const CATEGORIES: InventoryCategory[] = [
  'MEAT', 'SEAFOOD', 'PRODUCE', 'DAIRY', 'DRY_GOODS',
  'BEVERAGES', 'LIQUOR', 'WINE', 'BEER', 'OTHER',
]

export default function IngredientList() {
  const navigate = useAppStore((s) => s.navigate)
  const openIngredientDetail = useAppStore((s) => s.openIngredientDetail)
  const [search, setSearch] = useState('')
  const [type, setType] = useState<InventoryType | undefined>()

  const debouncedSearch = useDebounce(search, 300)
  const { data: ingredients, isLoading } = useIngredients(type)

  // Create filter options
  const categoryFilterOptions: FilterOption<Ingredient>[] = [
    {
      key: 'category',
      label: 'Supply Domain',
      options: CATEGORIES.map(cat => ({ value: cat, label: cat.replace('_', ' ') }))
    }
  ]

  const statusFilterOptions: FilterOption<Ingredient>[] = [
    {
      key: 'active',
      label: 'Entry Lifecycle',
      options: [
        { value: 'active', label: 'Active Only' },
        { value: 'all', label: 'Show All' }
      ]
    }
  ]

  const filterOptions = [...categoryFilterOptions, ...statusFilterOptions]

  const columns: Column<Ingredient>[] = useMemo(() => [
    {
      header: 'Item Spec',
      accessorKey: 'description',
      cell: (item) => (
        <div className="space-y-0.5">
          <div className="font-bold text-foreground text-[13px] tracking-tight group-hover:text-primary transition-colors">{item.description}</div>
          <div className="font-mono text-[9px] font-bold tracking-wider text-muted-foreground/40 uppercase">{item.itemCode}</div>
        </div>
      )
    },
    {
      header: 'Category',
      accessorKey: 'category',
      cell: (item) => (
        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
          {item.category.replace('_', ' ')}
        </span>
      )
    },
    {
      header: 'Base Unit',
      accessorKey: 'purchaseUnit',
      cell: (item) => <span className="text-xs font-semibold text-muted-foreground/80 lowercase italic">{item.purchaseUnit}</span>
    },
    {
      header: 'Unit Price',
      accessorKey: 'purchaseUnitPrice',
      cell: (item) => <div className="font-bold text-foreground tabular-nums text-[13px]">{currency(item.purchaseUnitPrice)}</div>
    },
    {
      header: 'Conv.',
      accessorKey: 'ruPerPu',
      cell: (item) => (
        <div className="space-y-0.5">
          <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tight">1 {item.purchaseUnit} =</div>
          <div className="text-xs font-mono font-bold text-foreground">{item.ruPerPu} <span className="opacity-40 text-[9px] font-sans">{item.recipeUnit.replace('_', ' ')}</span></div>
        </div>
      )
    },
    {
      header: 'Yield',
      accessorKey: 'yieldPct',
      cell: (item) => <span className="font-mono text-xs font-bold text-foreground/60">{(item.yieldPct * 100).toFixed(0)}%</span>
    },
    {
      header: 'Status',
      accessorKey: 'active',
      cell: (item) => <StatusBadge status={item.active ? 'ACTIVE' : 'INACTIVE'} className="scale-75 origin-left" />
    }
  ], [])

  const mobileRender = useCallback((item: Ingredient) => (
    <div className="p-5 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-white/5 transition-all hover:bg-slate-50/50 dark:hover:bg-white/5 group active:scale-[0.99]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] font-bold text-muted-foreground/40 tracking-wider">
              {item.itemCode}
            </span>
            <StatusBadge status={item.active ? 'ACTIVE' : 'INACTIVE'} className="scale-75 origin-left" />
          </div>
          <h3 className="font-bold text-[15px] text-foreground leading-tight tracking-tight">
            {item.description}
          </h3>
          <div className="flex items-center gap-2.5 pt-1 text-[11px] font-medium text-muted-foreground/60">
            <span className="uppercase tracking-widest text-[9px] font-bold opacity-60">
              {item.category.replace('_', ' ')}
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-200 dark:bg-white/10" />
            <span className="text-foreground/80 font-bold">
              {currency(item.purchaseUnitPrice)} <span className="font-medium opacity-40 text-[9px]">/ {item.purchaseUnit}</span>
            </span>
          </div>
        </div>
        <div className="shrink-0 w-8 h-8 rounded-full border border-slate-100 dark:border-white/5 flex items-center justify-center text-muted-foreground/20 group-hover:text-primary transition-colors">
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  ), [])

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950  overflow-hidden flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl relative overflow-hidden">
        {/* Header */}
        <header className="shrink-0 z-20 w-full border-b border-slate-100 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-5">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate('inventory')} className="rounded-xl h-9 w-9 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="space-y-0.5">
                  <span className="font-semibold text-[10px] text-muted-foreground/40 uppercase tracking-[0.1em]">Ingredient Catalog</span>
                  <h1 className="text-xl font-bold text-foreground tracking-tight leading-none">
                    Master Inventory
                  </h1>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => navigate('inventory-new-ingredient')}
                className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs gap-2 shadow-sm hover:opacity-90 active:scale-95 transition-all h-9 px-5"
              >
                <Plus size={14} />
                New Ingredient
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                <input
                  type="search"
                  placeholder="Filter by name or SKU..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/50 text-sm font-medium focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-muted-foreground/30"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setFilterOpen(true)}
                className="h-10 w-10 rounded-xl relative border-slate-200 dark:border-white/10"
              >
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground/60" />
                {(category || !showActiveOnly) && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary border-2 border-white dark:border-slate-900 shadow-sm" />
                )}
              </Button>
            </div>

            {/* Type segmented control */}
            <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1 max-w-sm">
              {(['All', 'FOOD', 'BAR'] as const).map(t => {
                const active = t === 'All' ? !type : type === t
                return (
                  <button
                    key={t}
                    onClick={() => setType(t === 'All' ? undefined : t)}
                    className={`flex-1 rounded-lg py-1.5 text-[11px] font-bold tracking-tight uppercase transition-all ${active
                        ? 'bg-white dark:bg-white/10 shadow-sm text-foreground ring-1 ring-slate-200/50 dark:ring-white/5'
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

        {/* List Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar bg-slate-50/20 dark:bg-transparent">
          <div className="p-3">
            <ResponsiveDataList<Ingredient>
              data={ingredients || []}
              columns={columns}
              mobileRender={mobileRender}
              onRowClick={(item) => openIngredientDetail(item.id)}
              searchable
              searchPlaceholder="Filter by name or SKU..."
              searchKeys={['description', 'itemCode']}
              filterable
              filterOptions={filterOptions}
              pagination
              initialPageSize={25}
              maxHeight="100%"
              isLoading={isLoading}
              emptyMessage="No results found"
              emptyDescription={search ? `No ingredients match "${search}"` : 'Your ingredient library is empty.'}
            />
          </div>
        </main>

        {/* Metadata Footer - only show if not using table's built-in footer */}
        {!isLoading && ingredients && ingredients.length > 0 && (
          <footer className="shrink-0 px-6 py-3 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20 flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{ingredients.length} total entries</span>
            <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Global Master Database</span>
          </footer>
        )}
      </div>

      {/* Filter bottom sheet - removed since we now use built-in filters */}
      {/* Keeping the filter button for future advanced filters */}
    </div>
  )
}