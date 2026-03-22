# Agent 03 — UI Plan

Read `scratch/entity-map.json` and the UI component index from `scratch/discovery.md`. Design the complete UI/UX plan for the onboarding wizard. Output `scratch/ui-plan.md`. No code yet.

---

## Step 1 — Load context

Read:
- `scratch/entity-map.json` — steps, fields, types
- `scratch/discovery.md` — component index and screens.md hints

Do NOT re-read original docs.

## Step 2 — Read relevant UI components

From the component index in discovery.md, identify which components are relevant to onboarding forms. Read ONLY those files — not the entire component library:

Priority reads (if they exist):
- Any `Form`, `Input`, `Select`, `Textarea`, `FileUpload`, `Stepper`, `Wizard`, `MultiStep` components
- Any `Card`, `Modal`, `Drawer` layout components
- Any `Badge`, `Tag`, `Checkbox`, `Radio`, `Toggle` components

For each, extract:
- Props interface (what it accepts)
- Whether it uses `var(--sp-*)` tokens or needs wrapping
- Any existing validation integration (react-hook-form? formik? native?)

Read max 10 component files. If more are needed, prioritise by frequency of use in entity-map.json field types.

## Step 3 — Map fields to components

For every field in every step from entity-map.json, assign the best UI component:

| Field type | Best component | Fallback if not found |
|---|---|---|
| string (short) | `<Input>` | `<input className="...">` |
| string (long) | `<Textarea>` | `<textarea>` |
| enum | `<Select>` or `<RadioGroup>` | `<select>` |
| boolean | `<Toggle>` or `<Checkbox>` | `<input type="checkbox">` |
| file | `<FileUpload>` or `<DropZone>` | `<input type="file">` |
| relation (FK search) | `<Combobox>` or `<SearchSelect>` | `<Select>` with options |
| number | `<Input type="number">` | native |
| time | `<TimePicker>` | `<Input type="time">` |
| geo/address | `<AddressSearch>` | stacked Inputs |
| array of hours | repeating `<TimeRangePicker>` per day | 7 × time inputs |

If a needed component doesn't exist, mark it `[BUILD]` — Phase 4 will create a minimal version.

## Step 4 — Design the wizard shell

Choose the navigation pattern based on step count and field complexity:

- **5–7 steps, many fields** → Vertical stepper sidebar + scrollable form body
- **3–4 steps, few fields** → Horizontal step tabs at top
- **Many steps with branching** → Progress bar + back/next nav

For this onboarding (typically 6–7 steps), use:

```
┌─────────────────────────────────────────────────────┐
│  ← Back to Merchants          Step 3 of 7           │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│  ① Basic     │  Location Details                    │
│  ② Location  │  ─────────────────────────────────  │
│  ③ Contact ← │  [Address Line 1]  [Address Line 2] │
│  ④ Menu      │  [City]            [Pincode]         │
│  ⑤ Hours     │  [State]           [Country]         │
│  ⑥ Docs      │  [Latitude]        [Longitude]       │
│  ⑦ Review    │  [Service Radius km]                 │
│              │                                      │
│              │  ─────────────────────────────────  │
│              │         [Back]      [Save & Next →]  │
└──────────────┴──────────────────────────────────────┘
```

Sidebar: `w-[220px]` fixed, steps with status icons (pending/active/complete/error).
Main: `flex-1 min-w-0`, scrollable form area, sticky footer with nav buttons.

## Step 5 — Define validation strategy

Specify per step:
- **Trigger**: validate on `blur` for fields, on `next` click for step submission
- **Library**: react-hook-form + Zod resolver (matches backend Zod schemas)
- **Error display**: inline below field, red border, `text-[var(--sp-coral)]`
- **Step gating**: cannot advance to next step if current step has errors
- **Partial save**: auto-save draft to localStorage on every valid change using debounce 800ms

## Step 6 — Define API call strategy

For each step transition:
- **On "Save & Next"**: call the step's endpoint (PATCH if restaurant already created, POST for first step)
- **Optimistic**: disable the Next button and show spinner while in-flight
- **On error**: show toast notification using existing toast component
- **Draft ID**: store `restaurantId` in component state after step 1 POST — pass to all subsequent PATCH calls

## Step 7 — Write ui-plan.md

```markdown
# UI Plan — Restaurant Onboarding

## Wizard shell
- Pattern: vertical stepper sidebar (220px) + scrollable main
- File: onboarding/frontend/screens/RestaurantOnboarding.tsx
- Sub-components to build: StepSidebar, StepHeader, FormFooter

## Steps

### Step 1 — Basic Info
- Component file: screens/steps/BasicInfoStep.tsx
- Fields:
  - name: Input (required)
  - cuisineType: Select with enum options (required)
  - description: Textarea (optional, max 500)
  - logo: FileUpload accept=image/* (optional)
- API: POST /api/restaurants
- Validation: RHF + Zod, on-next

### Step 2 — Location
...

## Components to build (not found in library)
- FileUpload: drag-drop + click, preview, size limit display
- TimeRangePicker: open/close time pair per day

## Components to reuse (found in library)
- Input → src/components/ui/Input.tsx
- Select → src/components/ui/Select.tsx
- Button → src/components/ui/Button.tsx

## Validation
- Library: react-hook-form + @hookform/resolvers/zod
- Trigger: blur + on-next
- Error style: text-[var(--sp-coral)] text-[12px] mt-1

## API strategy
- Step 1: POST /api/restaurants → store restaurantId
- Steps 2–6: PATCH /api/restaurants/:id/[section]
- Step 7: POST /api/restaurants/:id/submit
```

## Step 8 — Append to progress.md

```
## Phase 3 — UI Plan ✓
- Wizard pattern: vertical stepper
- Steps planned: N
- Components reused: N
- Components to build: N (list them)
- Validation: react-hook-form + zod
→ Output: scratch/ui-plan.md
```
