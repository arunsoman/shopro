# Agent 04 — Frontend Codegen

Read `scratch/ui-plan.md` and `scratch/entity-map.json`. Generate all TSX files one at a time. Apply Shopro design system throughout. Use react-hook-form + Zod.

---

## Step 1 — Load context

Read:
- `scratch/ui-plan.md` — wizard structure, step definitions, component assignments
- `scratch/entity-map.json` — exact field names, types, validations, endpoints

Do NOT re-read original docs or component source files.

## Step 2 — Generation order

Generate files in this exact order (dependencies first):

1. `onboarding/frontend/lib/onboarding-schemas.ts` — all Zod schemas
2. `onboarding/frontend/lib/onboarding-api.ts` — API call functions
3. Any `[BUILD]` components from ui-plan.md
4. Each step screen file
5. `onboarding/frontend/components/StepSidebar.tsx`
6. `onboarding/frontend/components/FormFooter.tsx`
7. `onboarding/frontend/screens/RestaurantOnboarding.tsx` — the shell

## Step 3 — Zod schemas file

Generate `onboarding/frontend/lib/onboarding-schemas.ts`:

```ts
import { z } from 'zod'

export const basicInfoSchema = z.object({
  name: z.string().min(2).max(100),
  cuisineType: z.enum(['indian', 'chinese', 'italian', 'other']),
  description: z.string().max(500).optional(),
  logo: z.instanceof(File).optional(),
})

export const locationSchema = z.object({
  addressLine1: z.string().min(5),
  city: z.string().min(2),
  pincode: z.string().regex(/^\d{6}$/),
  state: z.string(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  serviceRadiusKm: z.number().min(1).max(50),
})

// ... one schema per step, derived directly from entity-map.json fields
```

Write all schemas for all steps in one file. Use field names and validation rules exactly from entity-map.json.

## Step 4 — API layer file

Generate `onboarding/frontend/lib/onboarding-api.ts`:

```ts
const BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api'

export async function createRestaurant(data: BasicInfoPayload) {
  const res = await fetch(`${BASE}/restaurants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}` },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json() as Promise<{ id: string }>
}

export async function updateRestaurantSection(
  id: string,
  section: string,
  data: unknown
) {
  const res = await fetch(`${BASE}/restaurants/${id}/${section}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}` },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

function getToken() {
  return localStorage.getItem('shopro-token') ?? ''
}
```

Adapt endpoint paths to match entity-map.json exactly.

## Step 5 — Generate each step component

For every step in ui-plan.md, generate its TSX file. Follow this pattern precisely:

```tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { basicInfoSchema } from '../lib/onboarding-schemas'

type FormData = z.infer<typeof basicInfoSchema>

interface Props {
  defaultValues?: Partial<FormData>
  onNext: (data: FormData, restaurantId?: string) => void
  onBack?: () => void
  isLoading?: boolean
}

export function BasicInfoStep({ defaultValues, onNext, onBack, isLoading }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="flex flex-col gap-6">
      <div>
        <label className="text-[11px] font-medium tracking-[0.06em] uppercase
                          text-[var(--sp-text-2)] mb-1.5 block">
          Restaurant Name *
        </label>
        <input
          {...register('name')}
          placeholder="e.g. Mama's Italian"
          className="w-full bg-[var(--sp-bg-1)] border border-[var(--sp-border)]
                     rounded-[6px] text-[var(--sp-text-0)] text-[13px] px-3 py-2
                     outline-none placeholder:text-[var(--sp-text-2)]
                     focus:border-[var(--sp-cyan-border)] transition-colors duration-150"
        />
        {errors.name && (
          <p className="text-[12px] text-[var(--sp-coral)] mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Repeat pattern for every field in this step */}
    </form>
  )
}
```

Rules for codegen:
- Every field gets a `<label>` + input + error `<p>`
- Use existing library components where ui-plan.md says "reuse"
- Build inline minimal versions where ui-plan.md says "[BUILD]"
- Never hardcode colors — always `var(--sp-*)`
- Never use `italic`, `uppercase` on headings
- File uploads: use `<input type="file">` wrapped in a drag-drop zone div

Generate one file at a time. After each file, confirm it was written before continuing.

## Step 6 — Generate wizard shell

`onboarding/frontend/screens/RestaurantOnboarding.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { StepSidebar } from '../components/StepSidebar'
import { BasicInfoStep } from './steps/BasicInfoStep'
// ... other step imports

const STEPS = [
  { id: 'basic-info', title: 'Basic Info', component: BasicInfoStep },
  // ... all steps from ui-plan.md
]

export function RestaurantOnboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [stepData, setStepData] = useState<Record<string, unknown>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const handleNext = async (data: unknown) => {
    setIsLoading(true)
    try {
      // call API, store restaurantId on step 1, advance step
      setStepData(prev => ({ ...prev, [STEPS[currentStep].id]: data }))
      setCompletedSteps(prev => new Set([...prev, currentStep]))
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1))
    } catch (err) {
      // show toast
    } finally {
      setIsLoading(false)
    }
  }

  const ActiveStep = STEPS[currentStep].component

  return (
    <div className="flex min-h-screen bg-[var(--sp-bg-0)]">
      <StepSidebar
        steps={STEPS}
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={setCurrentStep}
      />
      <main className="flex-1 min-w-0">
        <div className="max-w-[860px] mx-auto px-8 py-10">
          <div className="mb-8">
            <p className="text-[11px] font-medium tracking-[0.08em] uppercase
                          text-[var(--sp-text-2)] mb-1">
              Step {currentStep + 1} of {STEPS.length}
            </p>
            <h1 className="text-[28px] font-medium tracking-[-0.02em] text-[var(--sp-text-0)]">
              {STEPS[currentStep].title}
            </h1>
          </div>

          <ActiveStep
            defaultValues={stepData[STEPS[currentStep].id] as never}
            onNext={handleNext}
            onBack={currentStep > 0 ? () => setCurrentStep(p => p - 1) : undefined}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  )
}
```

## Step 7 — Append to progress.md

```
## Phase 4 — Frontend Codegen ✓
- Files generated: N
- Steps implemented: N
- [BUILD] components created: list
- Reused components: list
→ Files in: onboarding/frontend/
```
