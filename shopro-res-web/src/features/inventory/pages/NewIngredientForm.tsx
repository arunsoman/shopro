import { useState } from 'react'
import { useAppStore } from '@/App'
import { Loader2, ArrowLeft, Plus, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import {
  useCreateIngredient,
  type InventoryType,
  type InventoryCategory,
  type PurchaseUnit,
  type RecipeUnit,
  type InventoryUnit
} from '../hooks/useIngredients'
import { currency, cn } from '@/lib/utils'

const CATEGORIES: InventoryCategory[] = ['MEAT', 'SEAFOOD', 'PRODUCE', 'DAIRY', 'DRY_GOODS', 'BEVERAGES', 'LIQUOR', 'WINE', 'BEER', 'OTHER']
const PURCHASE_UNITS: PurchaseUnit[] = ['LB', 'OZ', 'CASE', 'BOTTLE', 'KEG', 'EACH', 'GALLON', 'LITER']
const RECIPE_UNITS: RecipeUnit[] = ['OZ_WEIGHT', 'OZ_FLUID', 'LB', 'CUP', 'TBSP', 'TSP', 'LITER', 'ML', 'EACH', 'GALLON']
const INVENTORY_UNITS: InventoryUnit[] = ['LB', 'OZ', 'EACH', 'BOTTLE', 'KEG', 'GALLON', 'LITER', 'CASE']

interface FormState {
  itemCode: string
  description: string
  category: InventoryCategory | ''
  inventoryType: InventoryType
  purchaseUnit: PurchaseUnit | ''
  casePackSize: string
  purchaseUnitPrice: string
  recipeUnit: RecipeUnit | ''
  ruPerPu: string
  yieldPct: string
  inventoryUnit: InventoryUnit | ''
  iuPerPu: string
  parLevel: string
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/40 px-1">
        {label}{required && <span className="text-primary ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass = "w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/50 text-sm font-medium focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-muted-foreground/30 shadow-sm"
const selectClass = "w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/50 text-sm font-medium focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 appearance-none group shadow-sm transition-all"

export default function NewIngredientForm() {
  const navigate = useAppStore((s) => s.navigate)
  const createMutation = useCreateIngredient()

  const [form, setForm] = useState<FormState>({
    itemCode: '', description: '', category: '', inventoryType: 'FOOD',
    purchaseUnit: '', casePackSize: '', purchaseUnitPrice: '',
    recipeUnit: '', ruPerPu: '', yieldPct: '1.0',
    inventoryUnit: '', iuPerPu: '', parLevel: '',
  })

  function set(key: keyof FormState, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  // Live cost preview
  const price = parseFloat(form.purchaseUnitPrice) || 0
  const ruPerPuValue = parseFloat(form.ruPerPu) || 0
  const yieldPctValue = parseFloat(form.yieldPct) || 1
  const iuPerPuValue = parseFloat(form.iuPerPu) || 0
  const ruCost = (ruPerPuValue > 0 && yieldPctValue > 0) ? price / ruPerPuValue / yieldPctValue : null
  const iuCost = iuPerPuValue > 0 ? price / iuPerPuValue : null

  const isValid = form.itemCode && form.description && form.category && form.purchaseUnit &&
    form.purchaseUnitPrice && form.recipeUnit && form.ruPerPu &&
    form.inventoryUnit && form.iuPerPu

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    try {
      await createMutation.mutateAsync({
        itemCode: form.itemCode.toUpperCase().slice(0, 6),
        description: form.description,
        category: form.category as InventoryCategory,
        inventoryType: form.inventoryType,
        purchaseUnit: form.purchaseUnit as PurchaseUnit,
        casePackSize: form.casePackSize || null,
        purchaseUnitPrice: parseFloat(form.purchaseUnitPrice),
        recipeUnit: form.recipeUnit as RecipeUnit,
        ruPerPu: parseFloat(form.ruPerPu),
        yieldPct: parseFloat(form.yieldPct),
        inventoryUnit: form.inventoryUnit as InventoryUnit,
        iuPerPu: parseFloat(form.iuPerPu),
        parLevel: form.parLevel ? parseFloat(form.parLevel) : null,
        active: true,
      })
      toast.success('Ingredient created successfully')
      navigate('inventory-ingredients')
    } catch {
      toast.error('Failed to create ingredient')
    }
  }

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950  overflow-hidden flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl relative overflow-hidden">
        {/* Header */}
        <header className="shrink-0 z-20 w-full border-b border-slate-100 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('inventory-ingredients')}
                className="rounded-xl h-9 w-9 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="space-y-0.5">
                <span className="font-semibold text-[10px] text-muted-foreground/40 uppercase tracking-[0.1em]">Onboarding Unit</span>
                <h1 className="text-xl font-bold text-foreground tracking-tight leading-none">
                  Add New Ingredient
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Form Content */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-10 no-scrollbar bg-slate-50/20 dark:bg-transparent">
          <form id="ingredient-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-10">
              <section className="space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">Identity Specs</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="sm:col-span-1">
                      <Field label="Item SKU" required>
                        <input
                          value={form.itemCode}
                          onChange={e => set('itemCode', e.target.value.toUpperCase().slice(0, 6))}
                          placeholder="ME01"
                          className={cn(inputClass, "font-mono font-bold tracking-wider placeholder:font-sans placeholder:font-medium placeholder:tracking-normal")}
                        />
                      </Field>
                    </div>

                    <div className="sm:col-span-2">
                      <Field label="Description / Name" required>
                        <input
                          value={form.description}
                          onChange={e => set('description', e.target.value)}
                          placeholder="e.g. Premium Beef Fillet"
                          className={inputClass}
                        />
                      </Field>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                    <Field label="Operational Flow" required>
                      <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1 border border-slate-200/50 dark:border-white/5">
                        {(['FOOD', 'BAR'] as InventoryType[]).map(t => (
                          <button key={t} type="button"
                            onClick={() => set('inventoryType', t)}
                            className={`flex-1 rounded-lg py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${form.inventoryType === t ? 'bg-white dark:bg-white/10 text-primary shadow-sm' : 'text-muted-foreground/40 hover:text-foreground'
                              }`}
                          >{t}</button>
                        ))}
                      </div>
                    </Field>

                    <Field label="Departmental Category" required>
                      <div className="relative">
                        <select value={form.category} onChange={e => set('category', e.target.value)} className={selectClass}>
                          <option value="">Choose category…</option>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/20 pointer-events-none" />
                      </div>
                    </Field>
                  </div>
                </div>

                <div className="pt-10 border-t border-slate-100 dark:border-white/5 space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-200 dark:bg-white/20" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">Conversion Architecture</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Purchase */}
                    <div className="space-y-5 p-5 rounded-2xl bg-white dark:bg-slate-800/20 border border-slate-100 dark:border-white/5">
                      <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">01. Procurement</p>
                      <Field label="Bulk Unit" required>
                        <div className="relative">
                          <select value={form.purchaseUnit} onChange={e => set('purchaseUnit', e.target.value)} className={cn(selectClass, "h-10 text-xs")}>
                            <option value="">Select…</option>
                            {PURCHASE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/10 pointer-events-none" />
                        </div>
                      </Field>
                      <Field label="Market Price ($)" required>
                        <input type="number" step="0.01" min="0" value={form.purchaseUnitPrice}
                          onChange={e => set('purchaseUnitPrice', e.target.value)}
                          placeholder="0.00" className={cn(inputClass, "h-10 tabular-nums")} />
                      </Field>
                    </div>

                    {/* Recipe */}
                    <div className="space-y-5 p-5 rounded-2xl bg-white dark:bg-slate-800/20 border border-slate-100 dark:border-white/5">
                      <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">02. Cooking</p>
                      <Field label="Prep Unit" required>
                        <div className="relative">
                          <select value={form.recipeUnit} onChange={e => set('recipeUnit', e.target.value)} className={cn(selectClass, "h-10 text-xs")}>
                            <option value="">Select…</option>
                            {RECIPE_UNITS.map(u => <option key={u} value={u}>{u.replace('_', ' ')}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/10 pointer-events-none" />
                        </div>
                      </Field>
                      <Field label="Yield Ratio" required>
                        <input type="number" step="0.0001" min="0" value={form.ruPerPu}
                          onChange={e => set('ruPerPu', e.target.value)} placeholder="0" className={cn(inputClass, "h-10 tabular-nums")} />
                      </Field>
                    </div>

                    {/* Inventory */}
                    <div className="space-y-5 p-5 rounded-2xl bg-white dark:bg-slate-800/20 border border-slate-100 dark:border-white/5">
                      <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">03. Storage</p>
                      <Field label="Count Unit" required>
                        <div className="relative">
                          <select value={form.inventoryUnit} onChange={e => set('inventoryUnit', e.target.value)} className={cn(selectClass, "h-10 text-xs")}>
                            <option value="">Select…</option>
                            {INVENTORY_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/10 pointer-events-none" />
                        </div>
                      </Field>
                      <Field label="Stack Count" required>
                        <input type="number" step="0.0001" min="0" value={form.iuPerPu}
                          onChange={e => set('iuPerPu', e.target.value)} placeholder="0" className={cn(inputClass, "h-10 tabular-nums")} />
                      </Field>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <aside className="lg:col-span-4 space-y-8">
              <div className="space-y-6 p-6 rounded-2xl bg-white dark:bg-slate-800/20 border border-slate-100 dark:border-white/5">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 leading-none">Global Metadata</h3>

                <div className="grid grid-cols-1 gap-5">
                  <Field label="Estimated Yield %">
                    <input type="number" step="0.01" min="0" max="1" value={form.yieldPct}
                      onChange={e => set('yieldPct', e.target.value)} placeholder="1.0" className={cn(inputClass, "h-10 tabular-nums font-bold")} />
                  </Field>

                  <Field label="Packaging Spec">
                    <input value={form.casePackSize} onChange={e => set('casePackSize', e.target.value)}
                      placeholder="e.g. 6/5-lb. tin" className={cn(inputClass, "h-10")} />
                  </Field>

                  <Field label="Critical Par Level">
                    <input type="number" step="0.001" min="0" value={form.parLevel}
                      onChange={e => set('parLevel', e.target.value)} placeholder="0.0" className={cn(inputClass, "h-10 tabular-nums font-bold")} />
                  </Field>
                </div>
              </div>

              {/* Economic Impact Card */}
              {(ruCost !== null || iuCost !== null) && (
                <div className="bg-slate-900 dark:bg-white rounded-2xl p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-500 ring-1 ring-slate-800 dark:ring-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 dark:text-slate-950/40">Unit Cost Impact</p>
                  <div className="space-y-4">
                    {ruCost !== null && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-white/20 dark:text-slate-950/20 uppercase tracking-widest">Base Prep Cost (Recipe Unit)</p>
                        <p className="text-2xl font-black text-white dark:text-slate-950 tabular-nums leading-none tracking-tighter">{currency(ruCost, 4)}</p>
                      </div>
                    )}
                    {iuCost !== null && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-white/20 dark:text-slate-950/20 uppercase tracking-widest">Inventory Value (Inventory Unit)</p>
                        <p className="text-xl font-bold text-slate-400 dark:text-slate-500 tabular-nums leading-none tracking-tighter">{currency(iuCost, 4)}</p>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 border-t border-white/5 dark:border-black/5">
                    <p className="text-[9px] font-medium text-white/30 dark:text-slate-950/30 leading-relaxed italic">Calculated live based on market price and yield settings.</p>
                  </div>
                </div>
              )}
            </aside>
          </form>
        </main>

        {/* Global Footer */}
        <footer className="shrink-0 w-full border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900 px-6 py-5">
          <div className="flex items-center justify-end gap-3 max-w-5xl mx-auto">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('inventory-ingredients')}
              className="font-bold text-xs uppercase tracking-widest text-muted-foreground/60 hover:text-rose-600 transition-colors"
            >
              Discard Entries
            </Button>
            <Button
              form="ingredient-form"
              type="submit"
              disabled={!isValid || createMutation.isPending}
              className="h-11 px-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xl active:scale-95 transition-all gap-2 text-xs uppercase tracking-widest"
            >
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus size={16} />}
              Confirm Ingredient
            </Button>
          </div>
        </footer>
      </div>
    </div>
  )
}