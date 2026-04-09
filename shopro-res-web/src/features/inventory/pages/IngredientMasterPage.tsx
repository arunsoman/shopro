import { useState, useMemo } from 'react'
import { useAppStore } from '@/App'
import { Plus, Search, SlidersHorizontal, ChevronRight, ArrowLeft, Tag, Package, ShoppingCart, AlertCircle } from 'lucide-react'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { BottomSheet } from '@/components/shared/BottomSheet'
import { ResponsiveDataList } from '@/components/shared/ResponsiveDataList'
import { useIngredients, type InventoryType, type InventoryCategory, type Ingredient } from '../hooks/useIngredients'
import { useDebounce } from '@/components/shared/useDebounce'
import { cn, currency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

const CATEGORIES: InventoryCategory[] = [
  'MEAT', 'SEAFOOD', 'PRODUCE', 'DAIRY', 'DRY_GOODS',
  'BEVERAGES', 'LIQUOR', 'WINE', 'BEER', 'OTHER',
]

export default function IngredientMasterPage() {
  const navigate = useAppStore((s) => s.navigate)
  const openIngredientDetail = useAppStore((s) => s.openIngredientDetail)
  const [search, setSearch] = useState('')
  const [type, setType] = useState<InventoryType | undefined>()
  const [category, setCategory] = useState<InventoryCategory | undefined>()
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)

  const debouncedSearch = useDebounce(search, 300)
  const { data: ingredients, isLoading } = useIngredients(type)

  const filtered = useMemo(() => {
    if (!ingredients) return []
    return ingredients.filter(i => {
      const matchSearch = !debouncedSearch ||
        i.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        i.itemCode.toLowerCase().includes(debouncedSearch.toLowerCase())
      const matchCat = !category || i.category === category
      const matchActive = !showActiveOnly || i.active
      return matchSearch && matchCat && matchActive
    })
  }, [ingredients, debouncedSearch, category, showActiveOnly])

  const columns = [
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
  ];

  const mobileRender = (item: Ingredient) => (
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
          <ChevronRight className="h-4 w-4" />
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
  );

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950  overflow-hidden flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl relative overflow-hidden">
        {/* Header */}
        <header className="shrink-0 z-20 w-full border-b border-slate-100 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-5">
          <div className="flex flex-col gap-6">
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

            <div className="flex items-center gap-3">
              <div className="relative flex-1 group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                <input
                  type="search"
                  placeholder="Filter by description or SKU..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/50 text-sm font-medium focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-muted-foreground/30 shadow-sm"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setFilterOpen(true)}
                className="h-10 w-10 rounded-xl relative border-slate-200 dark:border-white/10 shadow-sm"
              >
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground/60" />
                {(category || !showActiveOnly) && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary border-2 border-white dark:border-slate-900 shadow-sm" />
                )}
              </Button>
            </div>

            {/* Type segmented control */}
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

        {/* List Content */}
        <main className="flex-1 p-3 overflow-y-auto no-scrollbar bg-slate-50/20 dark:bg-transparent">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10">
              <EmptyState
                title="No items matched"
                description={search ? `Refine your search for "${search}"` : 'The database is currently offline or empty.'}
                action={{ label: 'Onboard Ingredient', onClick: () => navigate('inventory-new-ingredient') }}
              />
            </div>
          ) : (
            <div className="w-full">
              <ResponsiveDataList
                data={filtered}
                columns={columns}
                mobileRender={mobileRender}
                onRowClick={(item) => openIngredientDetail(item.id)}
              />
            </div>
          )}
        </main>

        {!isLoading && filtered.length > 0 && (
          <footer className="shrink-0 px-6 py-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex items-center justify-between">
            <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">{filtered.length} items cataloged</span>
            <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">Verified Registry</span>
          </footer>
        )}
      </div>

      {/* Filter bottom sheet */}
      <BottomSheet open={filterOpen} onClose={() => setFilterOpen(false)} title="Registry Filters">
        <div className="p-6 space-y-8">
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Entry Lifecycle</p>
            <div className="flex gap-2">
              {[{ label: 'Active Only', val: true }, { label: 'Show Archive', val: false }].map(opt => (
                <button
                  key={String(opt.val)}
                  onClick={() => setShowActiveOnly(opt.val)}
                  className={`flex-1 px-4 py-2.5 rounded-xl border text-[11px] font-bold uppercase tracking-tight transition-all ${showActiveOnly === opt.val
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg shadow-black/10'
                      : 'border-slate-200 dark:border-white/10 text-muted-foreground hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Supply Domain</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(c => c === cat ? undefined : cat)}
                  className={`px-3.5 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wide transition-all ${category === cat
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md shadow-black/5'
                      : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-muted-foreground/60'
                    }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={() => {
              setCategory(undefined)
              setShowActiveOnly(true)
              setFilterOpen(false)
            }}
            className="w-full justify-center text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold text-[11px] uppercase tracking-widest"
          >
            Clear Filters
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}
