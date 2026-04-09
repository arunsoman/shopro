import { useState } from 'react'
import { useAppStore } from '@/App'
import { ArrowLeft, ChevronDown, Edit2, Save, X, ImagePlus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import {
  useIngredient, useIngredientCosts, useUpdateIngredient, useDeactivateIngredient,
  type Ingredient,
} from '../hooks/useIngredients'
import { currency, percent } from '@/lib/utils'

type Section = 'purchase' | 'recipe' | 'inventory' | 'par'

function AccordionSection({
  title, expanded, onToggle, children, badge,
}: {
  title: string; expanded: boolean; onToggle: () => void
  children: React.ReactNode; badge?: string
}) {
  return (
    <div className="border border-border/50 rounded-[24px] overflow-hidden bg-surface/50 backdrop-blur-sm transition-all duration-300">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 bg-card text-left min-h-[56px] hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-black italic uppercase tracking-tight text-sm text-foreground">{title}</span>
          {badge && (
            <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <div className={expanded ? 'rotate-180 transition-transform duration-300' : 'transition-transform duration-300'}>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 pb-6 pt-2 border-t border-border/30 space-y-3">
          {children}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/10 last:border-0">
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-tight">{label}</span>
      <span className="text-sm font-black text-foreground">{value}</span>
    </div>
  )
}

function EditField({
  label, name, value, type = 'text', onChange,
}: {
  label: string; name: string; value: string | number
  type?: string; onChange: (name: string, val: string) => void
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-border/10 last:border-0">
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-tight sm:shrink-0 sm:w-1/3">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(name, e.target.value)}
        className="w-full sm:w-2/3 h-10 px-4 rounded-xl border bg-surface text-sm font-bold
                   focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
      />
    </div>
  )
}

export default function IngredientDetail() {
  const navigate = useAppStore((s) => s.navigate)
  const ingredientId = useAppStore((s) => s.selectedIngredientId)

  if (!ingredientId) {
    navigate('inventory-ingredients')
    return null
  }

  const { data: ingredient, isLoading } = useIngredient(ingredientId)
  const { data: costs } = useIngredientCosts(ingredientId)
  const updateMutation = useUpdateIngredient(ingredientId)
  const deactivateMutation = useDeactivateIngredient()

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Partial<Ingredient>>({})
  const [expanded, setExpanded] = useState<Set<Section>>(new Set(['purchase', 'recipe']))
  const [confirmDeactivate, setConfirmDeactivate] = useState(false)

  function toggle(section: Section) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(section) ? next.delete(section) : next.add(section)
      return next
    })
  }

  function startEdit() {
    if (!ingredient) return
    setDraft({ ...ingredient })
    setEditing(true)
  }

  function cancelEdit() {
    setDraft({})
    setEditing(false)
  }

  async function saveEdit() {
    try {
      await updateMutation.mutateAsync(draft)
      toast.success('Ingredient updated')
      setEditing(false)
      setDraft({})
    } catch {
      toast.error('Failed to save changes')
    }
  }

  async function handleDeactivate() {
    try {
      await deactivateMutation.mutateAsync(ingredientId!)
      toast.success('Ingredient deactivated')
      navigate('inventory-ingredients')
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Cannot deactivate — ingredient may be in use')
    }
    setConfirmDeactivate(false)
  }

  function handleFieldChange(name: string, val: string) {
    setDraft(prev => ({ ...prev, [name]: val }))
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-pulse">
        <div className="h-12 bg-muted rounded-xl w-1/3 mb-4" />
        <div className="h-20 bg-muted rounded-[32px] w-2/3" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          <div className="lg:col-span-4 h-[400px] bg-muted rounded-[32px]" />
          <div className="lg:col-span-8 space-y-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-muted rounded-[24px]" />)}
          </div>
        </div>
      </div>
    )
  }

  if (!ingredient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center text-muted-foreground/20">
          <X size={48} strokeWidth={1} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-foreground">Ingredient Not Found</h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">The item you're looking for doesn't exist or has been removed from the system.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('inventory-ingredients')}
          className="h-12 px-8 rounded-xl font-black uppercase tracking-tight text-xs border-2"
        >
          Return to Master List
        </Button>
      </div>
    )
  }

  const data = (editing ? { ...ingredient, ...draft } : ingredient) as Ingredient

  return (
    <div className="w-full bg-slate-100/50 dark:bg-slate-950  overflow-hidden flex items-center justify-center p-4">
      <div className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Header */}
        <header className="shrink-0 z-20 w-full border-b bg-white dark:bg-slate-900 px-4 py-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('inventory-ingredients')}
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-primary/60 font-bold uppercase tracking-tight opacity-60 px-1.5 py-0.5 bg-primary/5 rounded border border-primary/10">{ingredient.itemCode}</span>
                  <StatusBadge status={ingredient.active ? 'ACTIVE' : 'INACTIVE'} className="scale-75 origin-left" />
                </div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">
                  {ingredient.description}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!editing ? (
                <Button
                  onClick={startEdit}
                  variant="outline"
                  className="rounded-xl font-bold gap-2 active:scale-95 transition-all w-full sm:w-auto shadow-sm"
                >
                  <Edit2 size={16} strokeWidth={2.5} />
                  Edit Item
                </Button>
              ) : (
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    onClick={cancelEdit}
                    variant="ghost"
                    className="rounded-xl font-bold text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={saveEdit}
                    disabled={updateMutation.isPending}
                    className="rounded-xl font-bold shadow-lg shadow-primary/10 gap-2 active:scale-95 transition-all w-full sm:w-auto bg-primary text-white"
                  >
                    <Save size={16} strokeWidth={2.5} />
                    {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
            {/* Left Pillar: Image & Classification */}
            <div className="lg:col-span-4 border-r bg-slate-50/30 dark:bg-slate-900/50 p-6 space-y-6">
              <div className="relative aspect-square rounded-2xl overflow-hidden border bg-white dark:bg-slate-900 shadow-sm group">
                {ingredient.imageUrl ? (
                  <img src={ingredient.imageUrl} alt={ingredient.description} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-muted-foreground/20 bg-slate-50 dark:bg-slate-800">
                    <ImagePlus size={64} strokeWidth={1} />
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">No Image</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="secondary" size="sm" className="font-bold text-xs">Update</Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground/60 px-1 border-b pb-2">Classification</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center group">
                    <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-tight">Category</span>
                    <span className="text-xs font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10">{ingredient.category.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-tight">Type</span>
                    <span className="text-xs font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10">{ingredient.inventoryType}</span>
                  </div>
                </div>
              </div>

              {/* Danger zone — simplified */}
              {ingredient.active && !editing && (
                <div className="pt-6 border-t mt-12">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDeactivate(true)}
                    className="w-full justify-start text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold gap-2"
                  >
                    <Trash2 size={14} strokeWidth={2.5} />
                    Deactivate Ingredient
                  </Button>
                </div>
              )}
            </div>

            {/* Right Pillar: Main Data */}
            <div className="lg:col-span-8 p-6 sm:p-10 space-y-8">
              {/* Computed costs highlight */}
              {costs && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border p-6 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground/60 mb-1">Cost per {ingredient.recipeUnit.replace('_', ' ')}</p>
                    <p className="text-2xl font-bold text-primary tracking-tight">{currency(costs.ruCost, 4)}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border p-6 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground/60 mb-1">Cost per {ingredient.inventoryUnit}</p>
                    <p className="text-2xl font-bold text-blue-600 tracking-tight">{currency(costs.iuCost, 4)}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <AccordionSection title="Identity" expanded={expanded.has('purchase')} onToggle={() => toggle('purchase')}>
                  {editing ? (
                    <div className="space-y-2">
                      <EditField label="Item Code (SKU)" name="itemCode" value={draft.itemCode ?? (data.itemCode || '')} onChange={(n, v) => handleFieldChange(n, v.toUpperCase().slice(0, 6))} />
                      <EditField label="Description" name="description" value={draft.description ?? (data.description || '')} onChange={handleFieldChange} />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Row label="Item Code" value={data.itemCode} />
                      <Row label="Description" value={data.description} />
                    </div>
                  )}
                </AccordionSection>

                <AccordionSection title="Purchase Unit" expanded={expanded.has('purchase')} onToggle={() => toggle('purchase')}>
                  {editing ? (
                    <div className="space-y-2">
                      <EditField label="Price" name="purchaseUnitPrice" value={draft.purchaseUnitPrice ?? (data.purchaseUnitPrice || 0)} type="number" onChange={handleFieldChange} />
                      <EditField label="Pack Size" name="casePackSize" value={draft.casePackSize ?? (data.casePackSize || '')} onChange={handleFieldChange} />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Row label="Purchase Unit" value={data.purchaseUnit} />
                      <Row label="Price" value={currency(data.purchaseUnitPrice || 0)} />
                      {data.casePackSize && <Row label="Pack Size" value={data.casePackSize} />}
                    </div>
                  )}
                </AccordionSection>

                <AccordionSection title="Recipe Unit" expanded={expanded.has('recipe')} onToggle={() => toggle('recipe')}>
                  {editing ? (
                    <div className="space-y-2">
                      <EditField label="Recipe Units per Purchase Unit" name="ruPerPu" value={draft.ruPerPu ?? (data.ruPerPu || 0)} type="number" onChange={handleFieldChange} />
                      <EditField label="Yield %" name="yieldPct" value={draft.yieldPct ?? (data.yieldPct || 0)} type="number" onChange={handleFieldChange} />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Row label="Recipe Unit" value={data.recipeUnit.replace('_', ' ')} />
                      <Row label="Recipe Units per Purchase Unit" value={String(data.ruPerPu || 0)} />
                      <Row label="Yield %" value={percent(data.yieldPct || 0)} />
                      {costs && <Row label="Cost / RU" value={currency(costs.ruCost, 4)} />}
                    </div>
                  )}
                </AccordionSection>

                <AccordionSection title="Inventory Unit" expanded={expanded.has('inventory')} onToggle={() => toggle('inventory')}>
                  {editing ? (
                    <div className="space-y-2">
                      <EditField label="Inventory Units per Purchase Unit" name="iuPerPu" value={draft.iuPerPu ?? (data.iuPerPu || 0)} type="number" onChange={handleFieldChange} />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Row label="Inventory Unit" value={data.inventoryUnit} />
                      <Row label="Inventory Units per Purchase Unit" value={String(data.iuPerPu || 0)} />
                      {costs && <Row label="Cost / IU" value={currency(costs.iuCost, 4)} />}
                    </div>
                  )}
                </AccordionSection>

                <AccordionSection title="Par Level" expanded={expanded.has('par')} onToggle={() => toggle('par')}>
                  {editing ? (
                    <div className="space-y-2">
                      <EditField label="Par Level" name="parLevel" value={draft.parLevel ?? (data.parLevel || '')} type="number" onChange={handleFieldChange} />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Row label="Par Level" value={data.parLevel ? `${data.parLevel} ${data.inventoryUnit}` : 'Not set'} />
                    </div>
                  )}
                </AccordionSection>
              </div>
            </div>
          </div>
        </main>
      </div>

      <ConfirmModal
        open={confirmDeactivate}
        onClose={() => setConfirmDeactivate(false)}
        onConfirm={handleDeactivate}
        title="Deactivate Ingredient?"
        description={`This will hide "${ingredient.description}" from new recipes and counts. The ingredient cannot be deactivated if it is used in active recipes or menu items.`}
        confirmLabel="Deactivate"
        variant="danger"
        isLoading={deactivateMutation.isPending}
      />
    </div>
  )
}