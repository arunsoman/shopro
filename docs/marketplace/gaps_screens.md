# Shopro Platform — Gap Screen Specifications
> **This file is the companion to `screens-fresh.md`.**  
> It contains complete, skill-consumable screen entries for every screen that had
> missing controls, dead handlers, or was entirely absent from the original spec.
> When the skill builds a screen, it should read BOTH `screens-fresh.md` (for the
> base component list) AND this file (for all wired handlers, missing controls, and
> new screens). This file's entries take precedence over screens-fresh.md for the
> same screen ID.

---

## How to use with the skill

```
"Build [Screen ID] — [Screen Name] from gap_screens.md"
```

For screens that exist in both files, this file is the **authoritative version**.
It includes everything from screens-fresh.md PLUS all resolved gaps.

---

## Conventions used in this file

```
onClick    → the function called when element is clicked
onChange   → the function called when input value changes
onSubmit   → the function called on form submission
onUpload   → the function called when file upload completes
onSearch   → the function called from search bar
→          → "routes to" or "triggers"
PATCH/POST/DELETE → the API endpoint called
[NEW]      → control not in screens-fresh.md, added to resolve a gap
[WIRED]    → control existed but handler was missing, now specified
```

---

## Shared primitive patterns (apply to ALL screens)

These patterns appear on every screen. The skill must include them without
being explicitly told for each screen.

### Table pagination (every screen with `ProductTable` or `LedgerTable`)
```tsx
// Always add to every table screen:
const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 })

// Page size selector — bottom left of table
<SmartCombobox
  options={[{value:"10",label:"10/page"},{value:"25",label:"25/page"},{value:"50",label:"50/page"}]}
  value={String(pagination.pageSize)}
  onValueChange={(v) => setPagination(p => ({...p, pageSize: Number(v), pageIndex: 0}))}
/>

// Prev / Next — bottom right
<NeonButton variant="ghost" onClick={() => setPagination(p => ({...p, pageIndex: p.pageIndex - 1}))}
  disabled={pagination.pageIndex === 0}>← Prev</NeonButton>
<span className="text-sm text-muted-foreground">Page {pagination.pageIndex + 1} of {pageCount}</span>
<NeonButton variant="ghost" onClick={() => setPagination(p => ({...p, pageIndex: p.pageIndex + 1}))}
  disabled={pagination.pageIndex >= pageCount - 1}>Next →</NeonButton>
```

### Table row click (every table screen)
```tsx
// Every table row must navigate to a detail screen or open a modal:
<TableRow
  className="cursor-pointer hover:bg-muted/50 transition-colors"
  onClick={() => onRowClick(row.original)}
/>
```

### Error alert (every form / login screen)
```tsx
// Shown when API call rejects:
{error && (
  <p role="alert" className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
    {error}
  </p>
)}
```

### Loading guard (every form submit button)
```tsx
// Submit button always:
<NeonButton variant="solid" disabled={isLoading} onClick={handleSubmit}>
  {isLoading ? <OrbitalLoader message="" messagePlacement="right" /> : "Submit Label"}
</NeonButton>
```

---

## SHARED SHELLS

---

### SHELL-R — Restaurant App Shell (resolved)

**File:** `app/(restaurant)/layout.tsx`

**Additions to screens-fresh.md spec:**

```tsx
// [NEW] Global search in header
<AnimatedGlowingSearchBar
  placeholder="Search orders, products…"
  onSearch={(q) => router.push(`/restaurant/orders?q=${encodeURIComponent(q)}`)}
/>

// [NEW] User avatar menu
<Popover>
  <PopoverTrigger asChild>
    <button className="rounded-full ring-2 ring-border w-8 h-8 overflow-hidden">
      <img src={user.avatarUrl} alt={user.name} />
    </button>
  </PopoverTrigger>
  <PopoverContent align="end" className="w-48">
    <NeonButton variant="ghost" className="w-full justify-start"
      onClick={() => router.push("/restaurant/settings")}>Profile</NeonButton>
    <NeonButton variant="ghost" className="w-full justify-start"
      onClick={() => signOut()}>Sign Out</NeonButton>
  </PopoverContent>
</Popover>

// [NEW] Theme toggle
<TooltipIconButton tooltip="Toggle theme" side="bottom"
  onClick={() => document.documentElement.classList.toggle("dark")}>
  <SunMoonIcon className="h-4 w-4" />
</TooltipIconButton>

// [WIRED] Notification bell badge
<TooltipIconButton tooltip="Notifications" side="bottom" badge={unreadCount}
  onClick={() => setNotificationDrawerOpen(true)}>
  <BellIcon className="h-4 w-4" />
</TooltipIconButton>

// [WIRED] Breadcrumb — all items with href render as <Link>
// BreadcrumbItem must pass href to render <Link href={item.href}>{item.label}</Link>
// Not <span> unless it is the current (last) page
```

---

### SHELL-OP — Operator App Shell (resolved)

**File:** `app/(operator)/layout.tsx`

**Additions:**

```tsx
// [WIRED] Global cross-entity search
<AnimatedGlowingSearchBar
  placeholder="Search POs, suppliers, restaurants…"
  onSearch={(q) => router.push(`/operator/search?q=${encodeURIComponent(q)}`)}
/>

// [WIRED] Role switcher — role badge is clickable
<button
  className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary"
  onClick={() => {
    localStorage.setItem("activeRole", nextRole)
    router.push(`/${nextRole}/dashboard`)
  }}
>{currentRole}</button>

// [NEW] Avatar / profile popover
<Popover>
  <PopoverTrigger asChild><button className="..."><img src={user.avatarUrl} /></button></PopoverTrigger>
  <PopoverContent align="end" className="w-48">
    <NeonButton variant="ghost" className="w-full justify-start"
      onClick={() => router.push("/operator/profile")}>My Profile</NeonButton>
    <NeonButton variant="ghost" className="w-full justify-start"
      onClick={() => router.push("/operator/profile/password")}>Change Password</NeonButton>
    <NeonButton variant="ghost" className="w-full justify-start text-destructive"
      onClick={() => signOut()}>Sign Out</NeonButton>
  </PopoverContent>
</Popover>

// [WIRED] Notification bell badge
<TooltipIconButton tooltip="Notifications" badge={unreadCount}
  onClick={() => setNotificationDrawerOpen(true)}>
  <BellIcon className="h-4 w-4" />
</TooltipIconButton>

// [WIRED] Sidebar collapse persisted
const [collapsed, setCollapsed] = useState(() =>
  localStorage.getItem("sidebarCollapsed") === "true"
)
const toggleCollapse = () => {
  setCollapsed(v => { localStorage.setItem("sidebarCollapsed", String(!v)); return !v })
}
```

---

### SHELL-S — Supplier App Shell (resolved)

**File:** `app/(supplier)/layout.tsx`

**Additions:**

```tsx
// [NEW] Global search
<AnimatedGlowingSearchBar
  placeholder="Search orders, bids…"
  onSearch={(q) => router.push(`/supplier/orders?q=${encodeURIComponent(q)}`)}
/>

// [NEW] Avatar popover
<Popover>
  <PopoverTrigger asChild><button className="..."><img src={user.avatarUrl} /></button></PopoverTrigger>
  <PopoverContent align="end" className="w-40">
    <NeonButton variant="ghost" className="w-full justify-start"
      onClick={() => router.push("/supplier/settings")}>Profile</NeonButton>
    <NeonButton variant="ghost" className="w-full justify-start text-destructive"
      onClick={() => signOut()}>Sign Out</NeonButton>
  </PopoverContent>
</Popover>

// [WIRED] Notification bell badge
<TooltipIconButton tooltip="Notifications" badge={unreadCount}
  onClick={() => setNotificationDrawerOpen(true)}>
  <BellIcon className="h-4 w-4" />
</TooltipIconButton>
```

---

## AUTHENTICATION

---

### R-00 — Restaurant Login (resolved)

**File:** `app/restaurant/login/page.tsx`

**Full component list with all handlers:**

| Component | Source | Adaptation |
|---|---|---|
| `AuroraBackground` | original-21 | Wrapper. `showRadialGradient={true}`. |
| `PasswordInput` | original-21 | Rename → `RestaurantPasswordField`. Show/hide only. `onEnter`→`handleSubmit`. |
| `NeonButton` | original-21 | "Sign In". Variant `solid`. `disabled={isLoading}`. `onClick`→`handleSubmit`. |
| `OrbitalLoader` | original-21 | Shown inside button when `isLoading`. |

**Complete wired state:**
```tsx
const [email, setEmail] = useState("")
const [password, setPassword] = useState("")
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [rememberMe, setRememberMe] = useState(false)

// [NEW] Email input
<input
  type="email" value={email} placeholder="you@restaurant.com"
  onChange={(e) => setEmail(e.target.value)}
  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
/>

// [NEW] Error display
{error && <p role="alert" className="text-sm text-destructive">{error}</p>}

// [NEW] Remember me
<NeonCheckbox label="Remember me" checked={rememberMe}
  onChange={(e) => setRememberMe(e.target.checked)} />

// [WIRED] Forgot password link
<button className="text-sm text-muted-foreground hover:text-foreground underline"
  onClick={onForgotPassword}>Forgot password?</button>

// handleSubmit
const handleSubmit = async () => {
  if (!email || !password) { setError("Email and password are required"); return }
  setIsLoading(true); setError(null)
  try { await onLogin(email, password) }
  catch (e) { setError(e instanceof Error ? e.message : "Sign in failed") }
  finally { setIsLoading(false) }
}
```

---

### OP-00 — Operator Login + MFA (resolved)

**Files:** `app/operator/login/page.tsx` · `app/operator/mfa/setup/page.tsx` · `app/operator/mfa/verify/page.tsx`

**Login step wired state:**
```tsx
const [email, setEmail] = useState("")
const [password, setPassword] = useState("")
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

// [NEW] Email input — same pattern as R-00
// [NEW] Error display
// [WIRED] handleSubmit → calls onLogin → if mfaRequired redirect to /operator/mfa/verify
//                                       if mfaSetupRequired redirect to /operator/mfa/setup

// MFA Setup additions:
// [NEW] "Can't scan?" toggle
const [showSecret, setShowSecret] = useState(false)
<button className="text-sm text-muted-foreground underline"
  onClick={() => setShowSecret(v => !v)}>Can't scan? Enter code manually</button>
{showSecret && <code className="font-mono text-xs bg-muted px-2 py-1 rounded">{backupSecretKey}</code>}

// [WIRED] 6-digit TOTP auto-submit
useEffect(() => {
  if (otp.join("").length === 6) onVerify(otp.join(""), tempToken)
}, [otp])

// [WIRED] "Back to login" in MFA Verify
<NeonButton variant="ghost" onClick={onBack}>← Back</NeonButton>

// [NEW] Attempt counter display
{attemptsRemaining < 3 && (
  <p role="alert" className="text-sm text-destructive">
    Invalid code. {attemptsRemaining} attempt{attemptsRemaining !== 1 ? "s" : ""} remaining.
  </p>
)}
```

---

### S-01 — Supplier Login (resolved)

**File:** `app/supplier/login/page.tsx`

**Wired state:**
```tsx
// [NEW] Email input — same pattern as R-00
// [NEW] Error display
// [WIRED] "Register" link
<button className="text-sm text-muted-foreground underline"
  onClick={onRegister}>New supplier? Register here</button>

// [WIRED] "Forgot password?"
<button className="text-sm text-muted-foreground underline"
  onClick={onForgotPassword}>Forgot password?</button>
```

---

### S-00 — Supplier Registration Wizard (resolved)

**File:** `app/supplier/register/page.tsx`

**All step form inputs wired:**
```tsx
// [NEW] Step 1 — Business Info inputs
const [step1, setStep1] = useState<Step1>({
  businessName:"", businessType:"", contactName:"",
  contactEmail:"", contactPhone:"", address:{line1:"",city:"",state:"",pincode:""}, pan:""
})
// Each field:
<input type="text" value={step1.businessName}
  onChange={(e) => setStep1(s => ({...s, businessName: e.target.value}))}
  placeholder="Registered business name" />
// ... same pattern for all Step1 fields

// [NEW] Step 4 — Bank/Payment inputs
const [step4, setStep4] = useState<Step4>({paymentMethod:"BANK"})
const [accountNumberRaw, setAccountNumberRaw] = useState("")
const [accountNumberMasked, setAccountNumberMasked] = useState("")

<input type="text" value={accountNumberMasked || accountNumberRaw}
  onChange={(e) => { setAccountNumberRaw(e.target.value); setAccountNumberMasked("") }}
  onBlur={() => {
    if (accountNumberRaw.length >= 4) {
      setAccountNumberMasked("X".repeat(accountNumberRaw.length - 4) + accountNumberRaw.slice(-4))
    }
  }}
  placeholder="Account number" autoComplete="off" />
<input type="text" value={step4.ifscCode ?? ""}
  onChange={(e) => setStep4(s => ({...s, ifscCode: e.target.value.toUpperCase()}))}
  placeholder="IFSC code (e.g. HDFC0001234)" maxLength={11} />

// [WIRED] Wizard navigation
const validateStep = (n: number): boolean => {
  // Step 1: all required fields filled
  // Step 2: at least one category selected
  // Step 3: required docs uploaded (Business Reg, GST, PAN)
  // Step 4: bank OR UPI details complete
}
// Next button:
<NeonButton variant="solid" onClick={() => { if (validateStep(currentStep)) setCurrentStep(s => s + 1) }}>
  Next →
</NeonButton>
// Back button:
<NeonButton variant="ghost" onClick={() => setCurrentStep(s => s - 1)}>← Back</NeonButton>

// [WIRED] Step 3 per-type doc upload
<FileUpload
  onUpload={(files) => setDocuments(prev => ({...prev, [docType]: files[0]}))}
  accept="application/pdf,image/*" label={docLabel} />

// [NEW] Resume draft banner
useEffect(() => {
  const draft = localStorage.getItem("supplierRegDraft")
  if (draft) { setStep1(JSON.parse(draft).step1); /* etc */ }
}, [])
// Auto-save on step change:
useEffect(() => {
  localStorage.setItem("supplierRegDraft", JSON.stringify({step1, step2, currentStep}))
}, [step1, step2, currentStep])
```

---

## RESTAURANT PORTAL

---

### R-01 — Restaurant Dashboard (resolved)

**File:** `app/(restaurant)/dashboard/page.tsx`

```tsx
// [WIRED] KPI cards navigate on click
<StatCardGrid cards={cards.map(c => ({
  ...c,
  onClick: () => router.push(c.targetRoute)  // e.g. targetRoute: "/restaurant/orders?status=RAISED"
}))} />

// [WIRED] RecentPOFeed row click
<RecentPOFeed
  projects={pos.map(poAsProject)}
  onProjectClick={(project) => router.push(`/restaurant/orders/${project.id}`)}
/>

// [WIRED] LowStockAlerts CTA
// BentoGrid items: cta="Reorder →" maps to:
// onClick on the CTA button → router.push(`/restaurant/orders/new?product=${item.productId}`)

// [NEW] Period selector in header
<SmartCombobox
  options={[
    {value:"week",  label:"This Week"},
    {value:"month", label:"This Month"},
    {value:"q",     label:"Last 3 Months"},
  ]}
  value={period} onValueChange={(v) => { setPeriod(v); refetchDashboard(v) }}
/>
```

---

### R-02 — Product Catalog / Explore (resolved)

**File:** `app/(restaurant)/catalog/page.tsx`

```tsx
// Cart state (use zustand or Context)
const { cart, addToCart, cartCount } = useCart()

// [WIRED] Category filter
<SmartCombobox
  value={selectedCategory}
  onValueChange={(v) => setSelectedCategory(v)}
  options={categoryOptions}
/>

// [WIRED] "Add to Cart" on each BentoGrid card
// BentoGrid item cta onClick:
const handleAddToCart = (product: CatalogProduct) => {
  addToCart({ productId: product.id, productName: product.name,
    unit: product.unit, quantity: 1, unitPrice: product.basePrice })
  setToastState("success")
  setTimeout(() => setToastState("initial"), 2000)
}

// [WIRED] Popover trigger per card
<Popover>
  <PopoverTrigger asChild>
    <TooltipIconButton tooltip="Quick view" side="top">
      <InfoIcon className="h-3 w-3" />
    </TooltipIconButton>
  </PopoverTrigger>
  <PopoverContent className="w-72">
    <p className="text-sm font-medium">{product.name}</p>
    <p className="text-xs text-muted-foreground mt-1">{product.description}</p>
    <p className="text-xs mt-2">Min order: {product.minOrderQty} {product.unit}</p>
  </PopoverContent>
</Popover>

// [NEW] Floating cart button
<div className="fixed bottom-6 right-6 z-50">
  <NeonButton variant="solid" onClick={() => router.push("/restaurant/orders/new")}>
    🛒 Cart ({cartCount})
  </NeonButton>
</div>

// [WIRED] Disabled out-of-stock CTA
// In BentoItem: cta={p.isAvailable ? "Add to Cart →" : "Unavailable"}
// The CTA button must be: disabled={!p.isAvailable}

// [NEW] Empty state
{filteredProducts.length === 0 && (
  <div className="text-center py-16 text-muted-foreground">
    <p className="text-sm">No products found for "{searchQuery}".</p>
    <p className="text-xs mt-1">Try a different search or category.</p>
  </div>
)}
```

---

### R-03 — PO Creation (resolved)

**File:** `app/(restaurant)/orders/new/page.tsx`

```tsx
// [WIRED] CartQtyField per row
<ShoproNumberField
  defaultValue={item.quantity} label=""
  onChange={(val) => onUpdateQty(item.productId, val)}
/>

// [NEW] Remove item per row
<TooltipIconButton tooltip="Remove" side="left"
  onClick={() => onRemoveItem(item.productId)}>
  <Trash2Icon className="h-3.5 w-3.5 text-destructive" />
</TooltipIconButton>

// [NEW] Special instructions textarea
<textarea
  className="w-full min-h-[80px] rounded-md border border-border bg-background px-3 py-2 text-sm
    resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  placeholder="Allergies, substitution preferences, delivery access notes…"
  value={specialInstructions}
  onChange={(e) => setSpecialInstructions(e.target.value)}
/>

// [WIRED] Submit guard
<NeonButton variant="solid" disabled={cart.length === 0 || isLoading}
  onClick={() => setConfirmModalOpen(true)}>
  {cart.length === 0 ? "Cart is empty" : "Submit Order"}
</NeonButton>

// [WIRED] SubmitPOConfirmModal CTA
// Modal footer CTA:
<NeonButton variant="solid" onClick={async () => {
  setIsLoading(true)
  try {
    await onSubmitPO({ lineItems: cart, deliveryAddress, requiredDeliveryDate, specialInstructions })
    router.push("/restaurant/orders")
  } finally { setIsLoading(false) }
}}>Confirm & Submit to Shopro</NeonButton>

// [NEW] Large order approval warning
{totalValue > restaurant.creditLimit * 0.8 && (
  <div className="rounded-md bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
    ⚠️ This order requires manager approval before submission.
    <SmartCombobox placeholder="Select approver…" options={managers}
      value={selectedApprover} onValueChange={setSelectedApprover} className="mt-2" />
  </div>
)}
```

---

### R-04 — My Orders / PO List (resolved)

**File:** `app/(restaurant)/orders/page.tsx`

```tsx
// [WIRED] Search
<AnimatedGlowingSearchBar
  placeholder="Search by PO ID…"
  onSearch={(q) => table.setGlobalFilter(q)}
/>

// [WIRED] Status filter
<SmartCombobox options={poStatusOptions} value={statusFilter}
  onValueChange={(v) => table.getColumn("status")?.setFilterValue(v)} />

// [WIRED] Row click
<TableRow className="cursor-pointer" onClick={() => router.push(`/restaurant/orders/${row.original.id}`)}>

// [NEW] New Order button in header
<NeonButton variant="solid" onClick={() => router.push("/restaurant/catalog")}>
  + New Order
</NeonButton>

// [WIRED] BulkActionBar Cancel
<BulkActionBar
  selectedCount={selectedRows.length}
  actions={[{
    label: "Cancel Selected",
    variant: "destructive",
    onClick: () => {
      setCancelTargetIds(selectedRows.map(r => r.id))
      setCancelModalOpen(true)
    }
  }]}
/>
// CancelPOConfirmModal CTA:
<NeonButton variant="solid" onClick={async () => {
  await Promise.all(cancelTargetIds.map(id => deletePO(id)))
  setCancelModalOpen(false)
  refetch()
}}>Confirm Cancellation</NeonButton>

// TanStack Table sorting (on all columns):
// columnDef: { enableSorting: true }
// Header: <button onClick={column.getToggleSortingHandler()}>...</button>
```

---

### R-05 — PO Detail (resolved)

**File:** `app/(restaurant)/orders/[poId]/page.tsx`

```tsx
// [WIRED] Download PDF
<NeonButton variant="ghost" onClick={() => window.open(`/restaurant/po/${poId}/pdf`, '_blank')}>
  ↓ Download PDF
</NeonButton>

// [WIRED] Request Amendment
<NeonButton variant="default" onClick={() => setAmendModalOpen(true)}>
  Request Amendment
</NeonButton>

// [NEW] Cancel PO (status-gated)
{po.status === "RAISED" && (
  <NeonButton variant="ghost"
    className="text-destructive hover:text-destructive"
    onClick={() => setCancelModalOpen(true)}>
    Cancel PO
  </NeonButton>
)}

// [WIRED] Timeline steps expandable
// Each TimelineStep gets: onClick={() => setExpandedStep(step.id)}
// Expanded step shows: timestamp, actor, description

// [NEW] Back navigation
<NeonButton variant="ghost" onClick={() => router.back()}>← My Orders</NeonButton>
```

---

### R-06 — PO Amendment Request (resolved)

**File:** modal inside R-05

```tsx
// [NEW] Reason textarea inside AmendPOModal
<textarea
  className="w-full min-h-[80px] rounded-md border border-border bg-background px-3 py-2 text-sm resize-none
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  placeholder="Explain why you need to amend this order…"
  value={reason} onChange={(e) => setReason(e.target.value)}
  required
/>

// [NEW] Change summary before submit
{lineItemChanges.length > 0 && (
  <div className="rounded-md bg-muted px-3 py-2 text-xs space-y-1">
    {lineItemChanges.map(c => (
      <p key={c.productId}>
        {c.productName}: {c.oldQty} {c.unit} → <strong>{c.newQty} {c.unit}</strong>
      </p>
    ))}
  </div>
)}

// [WIRED] Submit
<NeonButton variant="solid" disabled={!reason.trim() || lineItemChanges.length === 0} onClick={async () => {
  await onSubmitAmendment({ lineItemChanges, newItems, reason })
  setAmendModalOpen(false)
}}>Submit Amendment Request</NeonButton>
```

---

### R-07 — Delivery Confirmation (resolved)

**File:** `app/(restaurant)/orders/[poId]/confirm/page.tsx`

```tsx
const [confirmedItems, setConfirmedItems] = useState<Set<UUID>>(new Set())
const [isPartialMode, setIsPartialMode] = useState(false)
const [receivedQtys, setReceivedQtys] = useState<Record<UUID, number>>({})
const [disputeFiles, setDisputeFiles] = useState<File[]>([])
const [disputeModalOpen, setDisputeModalOpen] = useState(false)

// [WIRED] Checklist item toggle
// ChecklistCard onItemToggle → maps to:
const toggleItem = (itemId: UUID) => {
  setConfirmedItems(prev => {
    const next = new Set(prev)
    next.has(itemId) ? next.delete(itemId) : next.add(itemId)
    return next
  })
}

// [WIRED] Full receipt
<NeonButton variant="solid"
  disabled={confirmedItems.size !== po.lineItems.length}
  onClick={() => onConfirmDelivery({ type: "FULL", confirmedItems: Array.from(confirmedItems) })}>
  ✓ Confirm Full Receipt
</NeonButton>

// [WIRED] Partial receipt toggle
<NeonButton variant="default" onClick={() => setIsPartialMode(true)}>
  Partial Receipt
</NeonButton>
{isPartialMode && po.lineItems.map(item => (
  <div key={item.productId} className="flex items-center gap-3">
    <span className="text-sm flex-1">{item.productName}</span>
    <ShoproNumberField
      label="" defaultValue={item.quantity}
      onChange={(v) => setReceivedQtys(prev => ({...prev, [item.productId]: v}))}
    />
    <span className="text-xs text-muted-foreground">of {item.quantity} {item.unit}</span>
  </div>
))}

// [WIRED] Raise issue
<NeonButton variant="ghost" onClick={() => setDisputeModalOpen(true)}>
  Raise Quality Issue
</NeonButton>

// [WIRED] Dispute evidence upload
<FileUpload onUpload={(files) => setDisputeFiles(files)} accept="image/*" />

// [WIRED] Dispute modal submit
<NeonButton variant="solid" onClick={() =>
  onRaiseDispute({ itemId: disputeItemId, description: disputeDesc, evidence: disputeFiles })
}>Submit Dispute</NeonButton>

// [NEW] Auto-confirm notice
<div className="rounded-md bg-muted/50 px-4 py-3 text-xs text-muted-foreground flex items-center gap-2">
  <InfoIcon className="h-3.5 w-3.5 shrink-0" />
  If not confirmed within 72 hours, delivery will be auto-confirmed.
</div>
```

---

### R-08 — Inventory (resolved)

**File:** `app/(restaurant)/inventory/page.tsx`

```tsx
// [NEW] Search
<AnimatedGlowingSearchBar placeholder="Search inventory…"
  onSearch={(q) => table.setGlobalFilter(q)} />

// [NEW] "+ Add Item" button
<NeonButton variant="default" onClick={() => { setEditItem(null); setModalOpen(true) }}>
  + Add Item
</NeonButton>

// [WIRED] Per-row edit button
// In table Actions column:
<TooltipIconButton tooltip="Edit thresholds" side="left"
  onClick={() => { setEditItem(row.original); setModalOpen(true) }}>
  <PencilIcon className="h-3.5 w-3.5" />
</TooltipIconButton>

// [WIRED] EditInventoryItemModal save
<NeonButton variant="solid" onClick={async () => {
  await onSaveInventoryItem(editItem)
  setModalOpen(false); refetch()
}}>Save</NeonButton>

// [WIRED] LowStockSummary CTA
// BentoGrid item cta onClick:
// onClick={() => router.push(`/restaurant/orders/new?product=${item.productId}`)}

// [NEW] Category filter
<SmartCombobox options={categoryOptions} value={categoryFilter}
  onValueChange={(v) => table.getColumn("category")?.setFilterValue(v)} />
```

---

### R-09 — Payments (resolved)

**File:** `app/(restaurant)/payments/page.tsx`

```tsx
// [NEW] Search
<AnimatedGlowingSearchBar placeholder="Search invoices…"
  onSearch={(q) => table.setGlobalFilter(q)} />

// [NEW] Date range filters
<ShoproDatePicker value={dateFrom} onChange={setDateFrom} label="From" />
<ShoproDatePicker value={dateTo} onChange={setDateTo} label="To" />

// [WIRED] "Pay Now" per row
// In table: "Pay Now" NeonButton per PENDING/OVERDUE row:
onClick={() => { setPayTarget(row.original); setPayModalOpen(true) }}
// PaymentGatewayModal CTA:
<NeonButton variant="solid" onClick={() => onInitiatePayment(payTarget.id)}>
  Confirm Payment of ₹{payTarget.amount.toLocaleString("en-IN")}
</NeonButton>

// [NEW] Download invoice per row
<TooltipIconButton tooltip="Download invoice" side="left"
  onClick={() => window.open(`/restaurant/invoices/${row.original.id}/pdf`)}>
  <DownloadIcon className="h-3.5 w-3.5" />
</TooltipIconButton>

// [NEW] Export CSV
<NeonButton variant="ghost" onClick={() => downloadCSV(filteredRows)}>
  Export CSV
</NeonButton>
```

---

### R-10 — Support Tickets (resolved)

**File:** `app/(restaurant)/support/page.tsx`

```tsx
// [NEW] Search
<AnimatedGlowingSearchBar placeholder="Search tickets…"
  onSearch={(q) => table.setGlobalFilter(q)} />

// [NEW] Status filter
<SmartCombobox options={ticketStatusOptions} value={statusFilter}
  onValueChange={(v) => table.getColumn("status")?.setFilterValue(v)} />

// [WIRED] "New Ticket" button
<NeonButton variant="default" onClick={() => setNewTicketModalOpen(true)}>
  + New Ticket
</NeonButton>

// [WIRED] Row click
<TableRow className="cursor-pointer"
  onClick={() => router.push(`/restaurant/support/${row.original.id}`)} />

// [WIRED] NewTicketModal submit
const handleCreateTicket = async () => {
  if (!subject.trim() || !description.trim()) return
  await onCreateTicket({ subject, description, poId: linkedPoId, attachments })
  setNewTicketModalOpen(false)
}
<NeonButton variant="solid" onClick={handleCreateTicket}>Submit Ticket</NeonButton>

// [WIRED] TicketThread onSend
<TicketThread
  currentRole="buyer"
  onSend={async (msg) => {
    await onSendTicketMessage(ticketId, msg)
  }}
/>
```

---

### R-11 — KYC / Verification (resolved)

**File:** `app/(restaurant)/verification/page.tsx`

```tsx
// [WIRED] Document upload — auto-checks checklist
const [documents, setDocuments] = useState<Record<string, File | null>>({
  BUSINESS_REG: null, GST: null, FSSAI: null
})
// KYCDocumentUpload per doc type:
<FileUpload
  onUpload={(files) => setDocuments(prev => ({...prev, [docType]: files[0]}))}
  accept="application/pdf,image/*"
/>
// ChecklistCard items are auto-checked based on documents state — not user-toggled:
// checked={documents[item.docType] !== null}

// [WIRED] Finalise KYC
<NeonButton variant="solid"
  disabled={requiredDocs.some(d => !documents[d])}
  onClick={async () => {
    const formData = new FormData()
    Object.entries(documents).forEach(([type, file]) => {
      if (file) formData.append(type, file)
    })
    await onFinaliseKYC(formData)
    setSubmitted(true)
  }}>Submit for Verification</NeonButton>

// [NEW] Re-upload for rejected docs
{rejectedDocs.map(doc => (
  <div key={doc.type} className="mt-2">
    <StatusBadge status="REJECTED" label={`${doc.type} rejected`} />
    <FileUpload
      onUpload={(files) => onResubmitDoc(doc.type, files[0])}
      accept="application/pdf,image/*"
      label={`Re-upload ${doc.type}`}
    />
  </div>
))}
```

---

### R-12 — Settings (resolved)

**File:** `app/(restaurant)/settings/page.tsx`

```tsx
// [WIRED] Notification switches
const [preferences, setPreferences] = useState<NotificationPreferences>(initialPrefs)
const updatePreference = (eventType: string, channel: string, value: boolean) => {
  setPreferences(prev => ({...prev, [eventType]: {...prev[eventType], [channel]: value}}))
}
// Each MD3Switch:
<MD3Switch checked={preferences[eventType][channel]}
  onCheckedChange={(v) => updatePreference(eventType, channel, v)} showIcons />

// [WIRED] Save preferences
<NeonButton variant="solid" onClick={async () => {
  setIsLoading(true)
  try { await onSavePreferences(preferences); setToastState("success") }
  finally { setIsLoading(false) }
}}>Save Preferences</NeonButton>

// [NEW] Invite Staff button
<NeonButton variant="default" onClick={() => setInviteModalOpen(true)}>
  + Invite Staff Member
</NeonButton>
// InviteStaffModal submit:
<NeonButton variant="solid" onClick={async () => {
  await onInviteStaff({ email: inviteEmail, role: inviteRole })
  setInviteModalOpen(false)
}}>Send Invite</NeonButton>

// [WIRED] Per-row staff active toggle
<MD3Switch checked={staffMember.isActive} haptic="heavy"
  onCheckedChange={(v) => onToggleStaffActive(staffMember.id, v)} />

// [NEW] Delivery address section
<section>
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-sm font-semibold">Delivery Addresses</h3>
    <NeonButton variant="ghost" onClick={() => setAddressModalOpen(true)}>+ Add Address</NeonButton>
  </div>
  {addresses.map(addr => (
    <div key={addr.id} className="flex items-center justify-between p-3 rounded-md border border-border">
      <span className="text-sm">{addr.line1}, {addr.city}</span>
      <TooltipIconButton tooltip="Delete" onClick={() => onDeleteAddress(addr.id)}>
        <Trash2Icon className="h-3.5 w-3.5 text-destructive" />
      </TooltipIconButton>
    </div>
  ))}
</section>

// [NEW] Edit Profile button
<NeonButton variant="ghost" onClick={() => setProfileModalOpen(true)}>Edit Profile</NeonButton>
// EditProfileModal: businessName, contactPhone, logo FileUpload
// CTA: PATCH /restaurant/profile
```

---

### AUTO-R-01 — Reorder Rules (resolved)

**File:** `app/(restaurant)/auto-po/rules/page.tsx`

```tsx
// [NEW] Search
<AnimatedGlowingSearchBar placeholder="Search by product name…"
  onSearch={(q) => table.setGlobalFilter(q)} />

// [WIRED] "+ Add Rule" 
<NeonButton variant="default" onClick={() => { setEditRule(null); setModalOpen(true) }}>+ Add Rule</NeonButton>

// [WIRED] Per-row edit
<TooltipIconButton tooltip="Edit rule" onClick={() => { setEditRule(row.original); setModalOpen(true) }}>
  <PencilIcon className="h-3.5 w-3.5" />
</TooltipIconButton>

// [WIRED] Per-row delete
<TooltipIconButton tooltip="Delete rule" onClick={() => { setDeleteTarget(row.original.id); setDeleteModalOpen(true) }}>
  <Trash2Icon className="h-3.5 w-3.5 text-destructive" />
</TooltipIconButton>
// DeleteRuleConfirmModal CTA:
<NeonButton variant="solid" onClick={async () => {
  await onDeleteRule(deleteTarget); setDeleteModalOpen(false); refetch()
}}>Delete Rule</NeonButton>

// [WIRED] Per-row active toggle
<MD3Switch checked={row.original.isActive} haptic="light"
  onCheckedChange={(v) => onToggleRule(row.original.id, v)} />

// [WIRED] EditReorderRuleModal save
<NeonButton variant="solid" onClick={async () => {
  await onSaveRule(editRule); setModalOpen(false); refetch()
}}>Save Rule</NeonButton>
```

---

### AUTO-R-02 — Recurring Schedules (resolved)

**File:** `app/(restaurant)/auto-po/schedules/page.tsx`

```tsx
// [NEW] "+ New Schedule" button
<NeonButton variant="solid" onClick={() => { setEditSchedule(null); setWizardOpen(true) }}>
  + New Schedule
</NeonButton>

// [WIRED] Wizard onComplete
<NewScheduleWizard
  open={wizardOpen}
  initialData={editSchedule}
  onComplete={async (data) => {
    if (editSchedule) await onUpdateSchedule(editSchedule.id, data)
    else await onCreateSchedule(data)
    setWizardOpen(false); refetch()
  }}
  onClose={() => setWizardOpen(false)}
/>

// [WIRED] Schedule card active toggle
// Each schedule BentoCard has MD3Switch:
<MD3Switch checked={schedule.isActive}
  onCheckedChange={(v) => onToggleSchedule(schedule.id, v)} />

// [WIRED] Card "Edit →" CTA
// BentoGrid item cta onClick:
// onClick={() => { setEditSchedule(schedule); setWizardOpen(true) }}

// [WIRED] Delete confirm
<NeonButton variant="solid" onClick={async () => {
  await onDeleteSchedule(deleteTarget); setDeleteModalOpen(false); refetch()
}}>Delete Schedule</NeonButton>
```

---

### AUTO-R-03 — Auto-PO Activity Log (resolved)

**File:** `app/(restaurant)/auto-po/activity/page.tsx`

```tsx
// [NEW] Date range
<ShoproDatePicker value={dateFrom} onChange={setDateFrom} label="From" />
<ShoproDatePicker value={dateTo}   onChange={setDateTo}   label="To"   />

// [NEW] Trigger type filter
<SmartCombobox options={[
  {value:"all",            label:"All Triggers"},
  {value:"STOCK_THRESHOLD",label:"Stock Threshold"},
  {value:"SCHEDULED",      label:"Scheduled"},
  {value:"REORDER_RULE",   label:"Reorder Rule"},
]} value={triggerFilter} onValueChange={setTriggerFilter} />

// [WIRED] Row click
<TableRow className="cursor-pointer"
  onClick={() => { setDetailItem(row.original); setDetailModalOpen(true) }} />

// [WIRED] "View PO →" link
// In result column cell renderer:
{row.original.status === "PO_CREATED" && (
  <NeonButton variant="ghost" className="h-auto p-0 text-xs underline"
    onClick={(e) => { e.stopPropagation(); router.push(`/restaurant/orders/${row.original.poId}`) }}>
    View PO →
  </NeonButton>
)}

// [NEW] Retry per FAILED row
{row.original.status === "FAILED" && (
  <TooltipIconButton tooltip="Retry" onClick={(e) => { e.stopPropagation(); onRequestRetry(row.original.id) }}>
    <RefreshCwIcon className="h-3.5 w-3.5" />
  </TooltipIconButton>
)}
```

---

## SHOPRO OPERATOR PORTAL

---

### OP-01 — Operator Dashboard (resolved)

**File:** `app/(operator)/dashboard/page.tsx`

```tsx
// [WIRED] KPI cards navigate
<OperatorKPICards cards={roleKpis.map(c => ({ ...c, onClick: () => router.push(c.targetRoute) }))} />

// [WIRED] QuickActionCards CTA
// Each BentoGrid item: onClick on CTA → router.push(card.targetRoute)

// [WIRED] OperatorActivityPanel click
<OperatorActivityPanel onProjectClick={(item) => router.push(item.detailRoute)} />

// [NEW] Period selector
<SmartCombobox options={periodOptions} value={period} onValueChange={(v) => { setPeriod(v); refetch(v) }} />

// [WIRED] Notification drawer "Mark all read"
// Inside NotificationDrawer header:
<NeonButton variant="ghost" onClick={onMarkAllRead}>Mark all read</NeonButton>
```

---

### OP-02 — Restaurant Management (resolved)

**File:** `app/(operator)/restaurants/page.tsx`

```tsx
// [NEW] Search + status filter
<AnimatedGlowingSearchBar placeholder="Search merchants…" onSearch={(q) => table.setGlobalFilter(q)} />
<SmartCombobox options={onboardingStatusOptions} value={statusFilter}
  onValueChange={(v) => table.getColumn("onboardingStatus")?.setFilterValue(v)} />

// [NEW] "+ Add Restaurant" button
<NeonButton variant="solid" onClick={() => { setEditRestaurant(null); setModalOpen(true) }}>
  + Add Restaurant
</NeonButton>

// [WIRED] Row click → edit modal
<TableRow className="cursor-pointer"
  onClick={() => { setEditRestaurant(row.original); setModalOpen(true) }} />

// In Actions column:
// [NEW] View Sales / PO History
<TooltipIconButton tooltip="View PO history" onClick={(e) => {
  e.stopPropagation(); router.push(`/operator/restaurants/${row.original.id}/history`)
}}>
  <BarChart2Icon className="h-3.5 w-3.5" />
</TooltipIconButton>

// [WIRED] EditRestaurantModal save
<NeonButton variant="solid" onClick={async () => {
  await onSaveRestaurant(editRestaurant); setModalOpen(false); refetch()
}}>Save Changes</NeonButton>

// [WIRED] BulkActionBar
actions={[
  { label:"Deactivate Selected", variant:"destructive",
    onClick: () => { setBulkTarget(selectedIds); setBulkModalOpen(true) } },
  { label:"Export CSV", onClick: () => downloadCSV(filteredRows) }
]}
```

---

### OP-03 — PO Inbox (resolved)

**File:** `app/(operator)/po/inbox/page.tsx`

```tsx
// [NEW] Search + filters
<AnimatedGlowingSearchBar placeholder="Quick search POs…" onSearch={(q) => table.setGlobalFilter(q)} />
<SmartCombobox // Restaurant filter
  options={restaurantOptions} value={restaurantFilter}
  onValueChange={(v) => table.getColumn("restaurantId")?.setFilterValue(v)} />
<SmartCombobox // Status filter
  options={poStatusOptions} value={statusFilter}
  onValueChange={(v) => table.getColumn("status")?.setFilterValue(v)} />

// [NEW] Advanced filters panel (toggleable)
const [showAdvanced, setShowAdvanced] = useState(false)
<NeonButton variant="ghost" onClick={() => setShowAdvanced(v => !v)}>
  Advanced Filters {showAdvanced ? "▲" : "▼"}
</NeonButton>
{showAdvanced && (
  <div className="flex gap-3 mt-2">
    <ShoproDatePicker value={dateFrom} onChange={setDateFrom} label="From" />
    <ShoproDatePicker value={dateTo}   onChange={setDateTo}   label="To" />
    <SmartCombobox options={[{value:"MANUAL",label:"Manual"},{value:"AUTO",label:"Auto-PO"}]}
      value={sourceFilter} onValueChange={setSourceFilter} />
  </div>
)}

// [WIRED] Row click
<TableRow className="cursor-pointer" onClick={() => router.push(`/operator/po/${row.original.id}`)} />

// [WIRED] UrgentPOCards CTA
// Each card onClick: router.push(`/operator/po/${po.id}`)

// [NEW] Per-row info icon
<TooltipIconButton tooltip={`${po.restaurantName} · Due ${formatDate(po.requiredDeliveryDate)}`} side="left">
  <InfoIcon className="h-3.5 w-3.5" />
</TooltipIconButton>
```

---

### OP-04 — PO Review & Accept / Reject (resolved)

**File:** `app/(operator)/po/[poId]/page.tsx`

```tsx
// [WIRED] External link (open as PDF)
<TooltipIconButton tooltip="Open as PDF" side="bottom"
  onClick={() => window.open(`/operator/po/${poId}/pdf`, '_blank')}>
  <ExternalLinkIcon className="h-4 w-4" />
</TooltipIconButton>

// [WIRED] Accept & Split
<NeonButton variant="solid" onClick={async () => {
  setIsLoading(true)
  try {
    await onAcceptPO(poId)
    router.push(`/operator/po/${poId}/split`)
  } finally { setIsLoading(false) }
}}>Accept & Proceed to Split</NeonButton>

// [WIRED] Request Clarification
<NeonButton variant="default" onClick={() => setClarificationModalOpen(true)}>
  Request Clarification
</NeonButton>
// ClarificationModal:
<textarea className="..." value={clarificationMessage}
  onChange={(e) => setClarificationMessage(e.target.value)}
  placeholder="Ask the restaurant to clarify…" />
<NeonButton variant="solid" disabled={!clarificationMessage.trim()} onClick={async () => {
  await onRequestClarification(poId, clarificationMessage)
  setClarificationModalOpen(false)
}}>Send & Hold PO</NeonButton>

// [WIRED] Reject
<NeonButton variant="ghost" onClick={() => setRejectModalOpen(true)}>Reject PO</NeonButton>
// RejectPOModal:
<textarea className="..." value={rejectionReason}
  onChange={(e) => setRejectionReason(e.target.value)}
  placeholder="Reason for rejection (required — sent to restaurant)…" />
<NeonButton variant="solid" disabled={!rejectionReason.trim()} onClick={async () => {
  await onRejectPO(poId, rejectionReason)
  router.push("/operator/po/inbox")
}}>Confirm Rejection</NeonButton>

// [WIRED] POClarificationThread onSend
<POClarificationThread currentRole="platform"
  onSend={(msg) => onSendClarificationReply(poId, msg)} />
```

---

### OP-05 — PO Splitting Workspace (resolved)

**File:** `app/(operator)/po/[poId]/split/page.tsx`

```tsx
// Drag-and-drop state
const [groups, setGroups] = useState<POSplitGroup[]>([
  { id: "group-1", lineItems: po.lineItems, assignmentMode: "DIRECT", status: "PENDING" }
])
const [dragItem, setDragItem] = useState<{item: OrderLineItem, fromGroupId: string} | null>(null)

// [WIRED] Drag between groups
// Each line item card:
<div
  draggable
  onDragStart={() => setDragItem({ item, fromGroupId: group.id })}
  className="cursor-grab active:cursor-grabbing"
>
  {item.productName}
</div>
// Each group drop zone:
<div
  onDragOver={(e) => e.preventDefault()}
  onDrop={() => {
    if (!dragItem) return
    setGroups(prev => prev.map(g => {
      if (g.id === dragItem.fromGroupId)
        return {...g, lineItems: g.lineItems.filter(i => i.productId !== dragItem.item.productId)}
      if (g.id === group.id)
        return {...g, lineItems: [...g.lineItems, dragItem.item]}
      return g
    }))
    setDragItem(null)
  }}
>

// [WIRED] Assignment mode toggle per group
<MD3Switch
  checked={group.assignmentMode === "DIRECT"}
  onCheckedChange={(checked) => setGroups(prev => prev.map(g =>
    g.id === group.id ? {...g, assignmentMode: checked ? "DIRECT" : "BID", selectedSupplierId: undefined} : g
  ))}
  checkedIcon={<LinkIcon />} uncheckedIcon={<GavelIcon />} showIcons haptic="light"
/>

// [WIRED] Direct supplier selector
<SmartCombobox
  value={group.selectedSupplierId ?? ""}
  onValueChange={(supplierId) => setGroups(prev => prev.map(g =>
    g.id === group.id ? {...g, selectedSupplierId: supplierId, status: "READY"} : g
  ))}
  onQuery={async (q) => searchSuppliers(q, group.lineItems[0]?.productId)}
  renderOption={(s) => (
    <div className="flex items-center gap-2">
      <span className="flex-1">{s.businessName}</span>
      <StarRating value={s.rating} interactive={false} size="sm" />
      <span className="text-xs text-muted-foreground">{s.onTimeRate}% on-time</span>
    </div>
  )}
/>

// [WIRED] "Launch Bid for Group"
<NeonButton variant="default" onClick={() =>
  router.push(`/operator/bids/new?groupId=${group.id}&poId=${poId}`)
}>Launch Bid</NeonButton>

// [NEW] Add group
<NeonButton variant="ghost" onClick={() => setGroups(prev => [
  ...prev, { id: `group-${Date.now()}`, lineItems: [], assignmentMode: "DIRECT", status: "PENDING" }
])}>+ Add Group</NeonButton>

// [NEW] Remove group
<TooltipIconButton tooltip="Remove group"
  onClick={() => {
    const items = groups.find(g => g.id === group.id)?.lineItems ?? []
    setGroups(prev => [
      ...prev.filter(g => g.id !== group.id),
      // Move items back to first group
      {...prev[0], lineItems: [...prev[0].lineItems, ...items]}
    ])
  }}>
  <Trash2Icon className="h-3.5 w-3.5 text-destructive" />
</TooltipIconButton>

// [WIRED] SplitReadinessChecklist → "Create All Sub-POs"
<SplitReadinessChecklist
  groups={groups}
  onSubmit={async () => {
    setIsLoading(true)
    try {
      await onCreateAllSubPOs({ poId, groups })
      router.push(`/operator/po/${poId}/sub-pos`)
    } finally { setIsLoading(false) }
  }}
/>

// [WIRED] Emergency override modal
// EmergencyOverrideModal:
<textarea value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)}
  placeholder="Reason for emergency override (required for audit trail)…" />
<NeonButton variant="solid" disabled={!overrideReason.trim()} onClick={() => {
  applyEmergencyOverride(group.id, selectedSupplierId, overrideReason)
  setOverrideModalOpen(false)
}}>Apply Override</NeonButton>
```

---

### OP-06 — Sub-PO Management (resolved)

```tsx
// [NEW] Search + status filter
<AnimatedGlowingSearchBar placeholder="Search sub-POs…" onSearch={(q) => table.setGlobalFilter(q)} />
<SmartCombobox options={subPOStatusOptions} value={statusFilter}
  onValueChange={(v) => table.getColumn("status")?.setFilterValue(v)} />

// [WIRED] Row click → detail modal
<TableRow className="cursor-pointer"
  onClick={() => { setDetailSubPO(row.original); setDetailModalOpen(true) }} />

// In SubPODetailModal: delivery proof image
{subPO.deliveryProofUrl && (
  <img src={subPO.deliveryProofUrl} alt="Delivery proof" className="rounded-md cursor-zoom-in"
    onClick={() => setLightboxOpen(true)} />
)}

// [WIRED] "Flag as Delayed" bulk
actions={[
  { label:"Flag as Delayed",
    onClick: () => onFlagDelayed(selectedIds) },
  { label:"Export", onClick: () => downloadCSV(filteredRows) }
]}
```

---

### OP-07 — Bid Event Creation (resolved)

**File:** `app/(operator)/bids/new/page.tsx`

```tsx
// Bid items state
const [bidItems, setBidItems] = useState<BidEventItem[]>([])

// [WIRED] Product selector → adds item
<SmartCombobox onValueChange={(productId) => {
  const product = catalogProducts.find(p => p.id === productId)
  if (product && !bidItems.find(i => i.productId === productId)) {
    setBidItems(prev => [...prev, {
      productId, productName: product.name, quantity: 1, unit: product.unit
    }])
  }
}} />

// [WIRED] Per-item qty
<ShoproNumberField defaultValue={item.quantity} label=""
  onChange={(v) => setBidItems(prev => prev.map(i =>
    i.productId === item.productId ? {...i, quantity: v} : i
  ))} />

// [WIRED] Per-item quality specs textarea
<textarea
  className="w-full min-h-[60px] resize-none rounded border border-border bg-background px-2 py-1.5 text-sm
    focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
  placeholder="Quality specifications…"
  value={item.specs ?? ""}
  onChange={(e) => setBidItems(prev => prev.map(i =>
    i.productId === item.productId ? {...i, specs: e.target.value} : i
  ))}
/>

// [WIRED] Delete per item
<TooltipIconButton tooltip="Remove item"
  onClick={() => setBidItems(prev => prev.filter(i => i.productId !== item.productId))}>
  <Trash2Icon className="h-3.5 w-3.5 text-destructive" />
</TooltipIconButton>

// [WIRED] Bid deadline picker
<ShoproDatePicker value={deadline} onChange={setDeadline} label="Bid Deadline" />

// [WIRED] Price transparency select
<select value={isBlind ? "blind" : "open"}
  onChange={(e) => setIsBlind(e.target.value === "blind")}
  className="rounded-md border border-border bg-background px-3 py-2 text-sm">
  <option value="blind">Blind — suppliers cannot see each other's bids</option>
  <option value="open">Open — lowest current bid visible to all</option>
</select>

// [WIRED] Auto-award logic cards — select on click
{autoAwardOptions.map(opt => (
  <div key={opt.id}
    className={cn("cursor-pointer rounded-lg border-2 p-4 transition-all",
      autoAwardRule === opt.id ? "border-primary bg-primary/5" : "border-border")}
    onClick={() => setAutoAwardRule(opt.id)}>
    <p className="text-sm font-medium">{opt.label}</p>
    <p className="text-xs text-muted-foreground mt-1">{opt.description}</p>
  </div>
))}

// [WIRED] Supplier checkboxes
{suppliers.map(s => (
  <NeonCheckbox key={s.id} label={s.businessName}
    checked={invitedIds.includes(s.id)}
    onChange={(e) => {
      if (e.target.checked) setInvitedIds(p => [...p, s.id])
      else setInvitedIds(p => p.filter(id => id !== s.id))
    }} />
))}

// [WIRED] "Broadcast to all eligible"
<NeonButton variant="ghost" onClick={() => { setIsBroadcast(true); setInvitedIds([]) }}>
  Broadcast to all eligible suppliers in category
</NeonButton>

// [WIRED] Launch Bid Event
<NeonButton variant="solid" disabled={bidItems.length === 0 || !deadline} onClick={async () => {
  setIsLoading(true)
  try {
    const newBid = await onLaunchBid({ items: bidItems, deadline, isBlind, isBroadcast,
      invitedSupplierIds: invitedIds, autoAwardRule, deliveryRequirements })
    router.push(`/operator/bids/${newBid.id}`)
  } finally { setIsLoading(false) }
}}>Launch Bid Event</NeonButton>
```

---

### OP-08 — Bid Evaluation & Award (resolved)

```tsx
// [WIRED] Quote card selection
<BidComparisonCard offers={quoteAsBids} selectedId={selectedQuoteId}
  onSelect={(aliasId) => setSelectedQuoteId(aliasId)} />

// [WIRED] Sort quotes
<SmartCombobox options={[
  {value:"price",    label:"Lowest Price"},
  {value:"rating",   label:"Best Rating"},
  {value:"delivery", label:"Fastest Delivery"},
]} value={sortBy} onValueChange={(v) => setSortBy(v)} />

// [WIRED] Manual Award
<NeonButton variant="solid" disabled={!selectedQuoteId}
  onClick={() => setAwardModalOpen(true)}>Manual Award</NeonButton>
// AwardConfirmModal CTA:
<NeonButton variant="solid" onClick={async () => {
  await onAwardBid(bidId, selectedSupplierId)
  router.push(`/operator/po/${bid.parentPoId}/sub-pos`)
}}>Confirm Award</NeonButton>

// [WIRED] Auto-Award
<NeonButton variant="default" onClick={async () => {
  const winner = await onAutoAward(bidId)
  setToastSaveState("success")
}}>Auto-Award</NeonButton>

// [WIRED] Counter Offer
<NeonButton variant="ghost" onClick={() => setCounterOfferModalOpen(true)}>Counter Offer</NeonButton>
// CounterOfferModal:
<ShoproNumberField label="Counter price per unit (₹)" defaultValue={selectedQuote?.pricePerUnit}
  onChange={(v) => setCounterPrice(v)} />
<NeonButton variant="solid" onClick={() => onSendCounterOffer(bidId, selectedSupplierId, counterPrice)}>
  Send Counter Offer
</NeonButton>
```

---

### OP-09 — Supplier Vetting Queue (resolved)

```tsx
// [NEW] Search + status filter
<AnimatedGlowingSearchBar placeholder="Search by business name…" onSearch={(q) => table.setGlobalFilter(q)} />
<SmartCombobox options={vettingStatusOptions} value={statusFilter}
  onValueChange={(v) => table.getColumn("vettingStatus")?.setFilterValue(v)} />

// [WIRED] Row click
<TableRow className="cursor-pointer" onClick={() => router.push(`/operator/suppliers/${row.original.id}`)} />

// [WIRED] Bulk "Move to Under Review"
actions={[{ label:"Move to Under Review", onClick: () => onBulkMoveToReview(selectedIds) }]}
```

---

### OP-10 — Supplier Detail & Approval (resolved)

```tsx
// [WIRED] Document checklist — per-item verify toggle
<ChecklistCard
  onItemToggle={(itemId) => onVerifyDocument(supplierId, itemId)}
  // each item checked = verified by Shopro
/>

// [WIRED] Per-doc download
<TooltipIconButton tooltip="View / Download"
  onClick={() => window.open(doc.url, '_blank')}>
  <DownloadIcon className="h-3.5 w-3.5" />
</TooltipIconButton>

// [WIRED] Trigger Penny Drop
<NeonButton variant="default" onClick={async () => {
  await onTriggerPennyDrop(supplierId)
  setPennyDropStatus("PENDING")
  pollPennyDropStatus()
}}>Trigger Penny Drop</NeonButton>

// [WIRED] Approve
<NeonButton variant="solid" onClick={async () => {
  await onApproveSupplier(supplierId)
  setToastState("success")
}}>Approve Supplier</NeonButton>

// [WIRED] Conditional / Reject via ApprovalDecisionModal
// Modal has textarea for reason + ShoproDatePicker for deadline (conditional only)
// CTA: await onSubmitDecision(supplierId, decision, { reason, deadline })
```

---

### OP-11 — Supplier Directory (resolved)

```tsx
// [NEW] Search + category filter
<AnimatedGlowingSearchBar placeholder="Search suppliers…" onSearch={(q) => table.setGlobalFilter(q)} />
<SmartCombobox options={categoryOptions} value={categoryFilter}
  onValueChange={(v) => table.getColumn("categories")?.setFilterValue(v)} />

// [WIRED] Row click
<TableRow className="cursor-pointer" onClick={() => router.push(`/operator/suppliers/${row.original.id}`)} />

// [WIRED] Per-row suspend
<TooltipIconButton tooltip="Suspend supplier"
  onClick={(e) => { e.stopPropagation(); setSuspendTarget(row.original); setSuspendModalOpen(true) }}>
  <ShieldOffIcon className="h-3.5 w-3.5 text-destructive" />
</TooltipIconButton>
// SuspendModal: textarea for reason + blacklist checkbox + CTA → onSuspendSupplier(...)

// [WIRED] Bulk actions
actions={[
  { label:"Assign Category", onClick: () => setBulkCategoryModalOpen(true) },
  { label:"Export CSV",      onClick: () => downloadCSV(filteredRows) }
]}
```

---

### OP-12 — Payout Queue (resolved)

```tsx
// [NEW] Search + date + status filters
<AnimatedGlowingSearchBar placeholder="Search by supplier or sub-PO ID…"
  onSearch={(q) => table.setGlobalFilter(q)} />
<ShoproDatePicker value={dateFrom} onChange={setDateFrom} label="From" />
<ShoproDatePicker value={dateTo}   onChange={setDateTo}   label="To" />
<SmartCombobox options={payoutStatusOptions} value={statusFilter}
  onValueChange={(v) => table.getColumn("status")?.setFilterValue(v)} />

// [WIRED] Row click
<TableRow className="cursor-pointer"
  onClick={() => router.push(`/operator/finance/payout/${row.original.id}`)} />

// [WIRED] BulkActionBar
actions={[
  { label:"Initiate Selected", variant:"solid",
    onClick: () => setBulkInitiateModalOpen(true) },
  { label:"Hold Selected",
    onClick: () => { setHoldReason(""); setBulkHoldModalOpen(true) } },
  { label:"Export CSV", onClick: () => downloadCSV(filteredRows) }
]}
```

---

### OP-13 — Payout Detail & Approval (resolved)

```tsx
// [WIRED] Initiate Payout
<NeonButton variant="solid" onClick={() => setChecklistOpen(true)}>Initiate Payout</NeonButton>
// ChecklistCard onSubmit → POST /shopro/finance/payout/${id}/initiate

// [WIRED] Add Deduction
<NeonButton variant="default" onClick={() => setDeductionModalOpen(true)}>Add Deduction</NeonButton>
// DeductionModal:
<ShoproNumberField label="Deduction amount (₹)" defaultValue={0} onChange={setDeductionAmount} />
<textarea value={deductionReason} onChange={(e) => setDeductionReason(e.target.value)}
  placeholder="Reason (sent to supplier)…" />
<NeonButton variant="solid" disabled={deductionAmount <= 0 || !deductionReason.trim()}
  onClick={async () => {
    await onAddDeduction(payoutId, { amount: deductionAmount, reason: deductionReason })
    setDeductionModalOpen(false); refetch()
  }}>Apply Deduction</NeonButton>

// [WIRED] Hold
<NeonButton variant="ghost" onClick={() => setHoldModalOpen(true)}>Hold</NeonButton>
// HoldModal: textarea reason → POST /shopro/finance/payout/${id}/hold

// [WIRED] Dual approval CTA
// DualApprovalModal — second approver:
<NeonButton variant="solid" onClick={async () => {
  await onApprovePayoutDual(payoutId); setDualApprovalModalOpen(false)
}}>Approve Disbursement of ₹{netPayout.toLocaleString("en-IN")}</NeonButton>

// [NEW] Back navigation
<NeonButton variant="ghost" onClick={() => router.push("/operator/finance/payout-queue")}>
  ← Payout Queue
</NeonButton>
```

---

### OP-14 — Payment Ledger (resolved)

```tsx
// [WIRED] All filters
<SmartCombobox value={supplierFilter} onValueChange={(v) => table.getColumn("supplierId")?.setFilterValue(v)} />
<ShoproDatePicker value={dateFrom} onChange={(d) => { setDateFrom(d); refetch() }} label="From" />
<ShoproDatePicker value={dateTo}   onChange={(d) => { setDateTo(d);   refetch() }} label="To" />
<SmartCombobox options={payoutStatusOptions} value={statusFilter}
  onValueChange={(v) => table.getColumn("status")?.setFilterValue(v)} />

// [WIRED] Row click
<TableRow className="cursor-pointer"
  onClick={() => router.push(`/operator/finance/payout/${row.original.id}`)} />

// [WIRED] Export actions
actions={[
  { label:"Export CSV", onClick: () => downloadCSV(filteredRows)                        },
  { label:"Export PDF", onClick: () => window.open(`/operator/finance/ledger/pdf?${params}`) }
]}
```

---

### OP-15 — Revenue Dashboard (resolved)

```tsx
// [NEW] Period selector
<SmartCombobox options={[
  {value:"mtd",    label:"Month to Date"},
  {value:"qtd",    label:"Quarter to Date"},
  {value:"ytd",    label:"Year to Date"},
  {value:"custom", label:"Custom Range"},
]} value={period} onValueChange={(v) => { setPeriod(v); if (v !== "custom") refetch(v) }} />
{period === "custom" && (
  <>
    <ShoproDatePicker value={dateFrom} onChange={setDateFrom} label="From" />
    <ShoproDatePicker value={dateTo}   onChange={setDateTo}   label="To" />
    <NeonButton variant="default" onClick={() => refetch("custom")}>Apply</NeonButton>
  </>
)}

// [WIRED] Segment filter
<SmartCombobox value={segment} onValueChange={(v) => { setSegment(v); refetch(period, v) }} />

// [WIRED] Export
<NeonButton variant="ghost" onClick={() => window.open(`/operator/finance/revenue/pdf?${params}`)}>
  Export Report
</NeonButton>

// [WIRED] Row click
<TableRow className="cursor-pointer" onClick={() => router.push(`/operator/po/${row.original.poId}`)} />
```

---

### OP-16 — Delivery & Logistics Tracking (resolved)

```tsx
// [NEW] Search + status filter
<AnimatedGlowingSearchBar placeholder="Search deliveries…" onSearch={(q) => table.setGlobalFilter(q)} />
<SmartCombobox options={deliveryStatusOptions} value={statusFilter}
  onValueChange={(v) => table.getColumn("status")?.setFilterValue(v)} />

// [WIRED] Row click
<TableRow className="cursor-pointer"
  onClick={() => router.push(`/operator/po/${row.original.parentPoId}/sub-pos`)} />

// [WIRED] Per-row escalate (DELAYED/AT_RISK rows)
{["DELAYED","AT_RISK"].includes(row.original.deliveryStatus) && (
  <TooltipIconButton tooltip="Escalate supplier"
    onClick={(e) => { e.stopPropagation(); setEscalateTarget(row.original); setEscalateModalOpen(true) }}>
    <AlertTriangleIcon className="h-3.5 w-3.5 text-destructive" />
  </TooltipIconButton>
)}
// EscalateSupplierModal:
// urgency SmartCombobox + message textarea + expected response SmartCombobox
// CTA → onEscalateSupplier(subPoId, { urgency, message, expectedResponseHours })

// [WIRED] Delayed alert cards CTA
// DelayedDeliveryAlerts card CTA onClick:
// onClick={() => router.push(`/operator/po/${po.parentPoId}/sub-pos`)
```

---

### OP-17 — Product Catalog Management (resolved)

```tsx
// [NEW] Search + category filter
<AnimatedGlowingSearchBar placeholder="Search catalog…" onSearch={(q) => table.setGlobalFilter(q)} />
<SmartCombobox options={categoryOptions} value={categoryFilter}
  onValueChange={(v) => table.getColumn("category")?.setFilterValue(v)} />

// [WIRED] "+ Add Product"
<NeonButton variant="default" onClick={() => { setEditProduct(null); setModalOpen(true) }}>
  + Add Product
</NeonButton>

// [WIRED] Row click → edit
<TableRow className="cursor-pointer"
  onClick={() => { setEditProduct(row.original); setModalOpen(true) }} />

// [WIRED] AddEditProductModal save
<NeonButton variant="solid" onClick={async () => {
  if (editProduct?.id) await onUpdateProduct(editProduct.id, editProduct)
  else await onCreateProduct(editProduct)
  setModalOpen(false); refetch()
}}>Save Product</NeonButton>

// [WIRED] Per-row availability toggle
<MD3Switch checked={row.original.isAvailable}
  onCheckedChange={(v) => onToggleAvailability(row.original.id, v)} />
<MD3Switch checked={row.original.isSeasonal}
  onCheckedChange={(v) => onToggleSeasonal(row.original.id, v)} />

// [WIRED] Bulk actions
actions={[
  { label:"Mark Unavailable", onClick: () => onBulkToggleAvailability(selectedIds, false) },
  { label:"Mark Seasonal",    onClick: () => onBulkToggleSeasonal(selectedIds, true) },
  { label:"Remove",           variant:"destructive",
    onClick: () => { setBulkDeleteTarget(selectedIds); setBulkDeleteModalOpen(true) } }
]}
```

---

### OP-18 — Reports & Analytics (resolved)

```tsx
// [WIRED] Report type selector
<SmartCombobox options={reportTypeOptions} value={reportType}
  onValueChange={(v) => { setReportType(v); setReportData(null) }} />

// [WIRED] Date pickers
<ShoproDatePicker value={dateFrom} onChange={setDateFrom} label="From" />
<ShoproDatePicker value={dateTo}   onChange={setDateTo}   label="To" />

// [WIRED] Segment filter
<SmartCombobox options={segmentOptions[reportType]} value={segment}
  onValueChange={setSegment} />

// [NEW] "Generate" button
<NeonButton variant="solid" disabled={!reportType || !dateFrom || !dateTo} onClick={async () => {
  setIsLoading(true)
  try {
    const data = await onGenerateReport({ type: reportType, dateRange: {from: dateFrom, to: dateTo}, segment })
    setReportData(data)
  } finally { setIsLoading(false) }
}}>Generate Report</NeonButton>

// [WIRED] Period quick-select buttons (MTD, QTD, YTD)
{["MTD","QTD","YTD"].map(p => (
  <NeonButton key={p}
    variant={activePeriod === p ? "solid" : "ghost"}
    onClick={() => { setActivePeriod(p); setDateRange(computeRange(p)) }}>
    {p}
  </NeonButton>
))}

// [WIRED] Export actions
actions={[
  { label:"Export PDF",    onClick: () => window.open(`/operator/reports/pdf?${reportParams}`) },
  { label:"Export Excel",  onClick: () => downloadXLSX(reportData) },
  { label:"Schedule Email",onClick: () => setScheduleModalOpen(true) }
]}
// ScheduleReportModal:
// <input type="email"> for recipient + SmartCombobox frequency
// CTA → onScheduleReport({ email, frequency, reportConfig })
```

---

### OP-19 — System Configuration (resolved)

```tsx
// [WIRED] All ShoproNumberField onChange
const [config, setConfig] = useState<SystemConfig>(initialConfig)
const updateConfig = (key: keyof SystemConfig, value: unknown) =>
  setConfig(prev => ({...prev, [key]: value}))

<ShoproNumberField label="Payout Dual-Approval Threshold (₹)"
  defaultValue={config.payoutDualApprovalThreshold}
  onChange={(v) => updateConfig("payoutDualApprovalThreshold", v)} />
<ShoproNumberField label="Default Bid Timer (hours)"
  defaultValue={config.defaultBidTimerHours}
  onChange={(v) => updateConfig("defaultBidTimerHours", v)} />
<ShoproNumberField label="Auto-Award Price Tolerance (%)"
  defaultValue={config.autoAwardPriceTolerance}
  onChange={(v) => updateConfig("autoAwardPriceTolerance", v)} />
<ShoproNumberField label="Auto-Confirm Delivery Fallback (hours)"
  defaultValue={config.autoConfirmHours}
  onChange={(v) => updateConfig("autoConfirmHours", v)} />

// [WIRED] Auto-award rule selector
<SmartCombobox value={config.autoAwardRule} onValueChange={(v) => updateConfig("autoAwardRule", v)} />

// [WIRED] Feature flag toggles
{featureFlags.map(flag => (
  <MD3Switch key={flag.key}
    checked={config[flag.key] as boolean}
    onCheckedChange={(v) => updateConfig(flag.key, v)}
    showIcons />
))}

// [WIRED] Save
<NeonButton variant="solid" onClick={async () => {
  setIsLoading(true)
  try { await onSaveConfig(config); setToastState("success") }
  finally { setIsLoading(false) }
}}>Save Configuration</NeonButton>

// [NEW] Reset to defaults
<NeonButton variant="ghost" onClick={() => setResetConfirmOpen(true)}>Reset to Defaults</NeonButton>
// ResetConfirmModal CTA → setConfig(defaultConfig)

// [NEW] Tax configuration section
<section>
  <h3 className="text-sm font-semibold mb-3">GST Rates by Category</h3>
  {categories.map(cat => (
    <div key={cat.id} className="flex items-center gap-4">
      <span className="text-sm flex-1">{cat.name}</span>
      <ShoproNumberField label="GST %" defaultValue={cat.gstRate}
        onChange={(v) => updateCategoryGST(cat.id, v)} />
    </div>
  ))}
  <NeonButton variant="solid" onClick={() => onSaveTaxConfig(taxConfig)}>Save Tax Config</NeonButton>
</section>
```

---

### OP-20 — Audit Log Viewer (resolved)

```tsx
// [NEW] Search
<AnimatedGlowingSearchBar placeholder="Search by actor or action…"
  onSearch={(q) => table.setGlobalFilter(q)} />

// [WIRED] All filter SmartComboboxes
<SmartCombobox options={actorOptions}     value={actorFilter}     onValueChange={(v) => table.getColumn("actorName")?.setFilterValue(v)} />
<SmartCombobox options={roleOptions}      value={roleFilter}      onValueChange={(v) => table.getColumn("actorRole")?.setFilterValue(v)} />
<SmartCombobox options={entityTypeOptions}value={entityTypeFilter} onValueChange={(v) => table.getColumn("entityType")?.setFilterValue(v)} />
<SmartCombobox options={actionOptions}    value={actionFilter}    onValueChange={(v) => table.getColumn("action")?.setFilterValue(v)} />

// [WIRED] Date pickers
<ShoproDatePicker value={dateFrom} onChange={(d) => { setDateFrom(d); refetch() }} label="From" />
<ShoproDatePicker value={dateTo}   onChange={(d) => { setDateTo(d);   refetch() }} label="To" />

// [WIRED] Row click
<TableRow className="cursor-pointer"
  onClick={() => { setDetailEntry(row.original); setDetailModalOpen(true) }} />

// AuditEntryDetailModal — before/after JSON with diff
// Before state: red background for removed keys
// After state: green background for added/changed keys
<pre className="text-xs font-mono overflow-auto max-h-64 rounded bg-muted p-3">
  {JSON.stringify(entry.beforeState, null, 2)}
</pre>
<pre className="text-xs font-mono overflow-auto max-h-64 rounded bg-muted p-3">
  {JSON.stringify(entry.afterState, null, 2)}
</pre>

// [WIRED] Export
actions={[{ label:"Export Audit Report",
  onClick: () => downloadCSV(filteredRows) }]}
```

---

### OP-21 — Shopro User Management (resolved)

*(Full revised spec — supersedes screens-fresh.md entry)*

**File:** `app/(operator)/users/page.tsx`

**Components:**

| Component | Source | Placement | Adaptation |
|---|---|---|---|
| `AnimatedGlowingSearchBar` | original-21 | Filter bar left | `onSearch`→`table.setGlobalFilter(q)` |
| `SmartCombobox` | original-21 | Filter bar | Rename → `RoleFilter`. Multi-select all 7 roles. `onValueChange`→filter |
| `SmartCombobox` | original-21 | Filter bar | Rename → `UserStatusFilter`. Single-select. `onValueChange`→filter |
| `NeonButton` | original-21 | Header right — secondary | "Provision Role". Variant `ghost`. `onClick`→`setProvisionRoleOpen(true)` |
| `NeonButton` | original-21 | Header right — primary | "+ Provision User". Variant `solid`. `onClick`→`setInviteOpen(true)` |
| `TooltipIconButton` | original-21 | Header far right | Settings2 icon. "View Role Permissions". `onClick`→`setPermissionMatrixOpen(true)` |
| `ProductTable` | original-21 | Screen body | `ShoproUserTable`. Columns: Name, Email, Role, Dept, MFA, Last Login, Sessions, Status, Actions |
| `StatusBadge` | original-21 | Status column | Active / Inactive / MFA Not Enrolled |
| `TooltipIconButton` | original-21 | Actions column | Mail. "Resend invite". `onClick`→`onResendInvite(userId)`. Shown when `lastLoginAt === null` |
| `TooltipIconButton` | original-21 | Actions column | ShieldAlert. "Send MFA enrollment link". `onClick`→`onSendMFAEnrollment(userId)`. Shown when `!mfaEnabled && roleMFARequired` |
| `Popover` | original-21 | Actions column | MoreHorizontal trigger. Menu: Edit / View Sessions / Force Reset / Deactivate |
| `BulkActionBar` | missing-14 | Screen body | "Deactivate Selected" / "Force Password Reset" / "Resend Invite" |
| `Breadcrumb` | missing-14 | Header | `Operator → Users` |
| `Modal` (InviteUserModal) | missing-14 | From "+ Provision User" | Email, name, role, department. Magic link. |
| `Modal` (ProvisionRoleModal) | missing-14 | From "Provision Role" | Search existing user by email → assign role → confirm |
| `Modal` (EditUserModal) | missing-14 | From row Popover | Role change, department, login history table |
| `Modal` (SessionDetailModal) | missing-14 | From row Popover | Active sessions table with per-row revoke |
| `Modal` (PermissionMatrixModal) | missing-14 | From Settings icon | Read-only 7×12 RBAC grid |

**Wired handlers:**
```tsx
// Search + filters
<AnimatedGlowingSearchBar onSearch={(q) => table.setGlobalFilter(q)} placeholder="Search staff…" />
<SmartCombobox // Role filter
  options={roleFilterOptions} value={roleFilter}
  onValueChange={(v) => table.getColumn("role")?.setFilterValue(v)} />
<SmartCombobox // Status filter
  options={userStatusOptions} value={statusFilter}
  onValueChange={(v) => table.getColumn("status")?.setFilterValue(v)} />

// Header buttons
<NeonButton variant="ghost" onClick={() => setProvisionRoleOpen(true)}>Provision Role</NeonButton>
<NeonButton variant="solid" onClick={() => setInviteOpen(true)}>+ Provision User</NeonButton>
<TooltipIconButton tooltip="View Role Permissions"
  onClick={() => setPermissionMatrixOpen(true)}>
  <Settings2Icon className="h-4 w-4" />
</TooltipIconButton>

// Per-row actions
// Mail: shown when user.lastLoginAt === null
<TooltipIconButton tooltip="Resend magic link"
  onClick={(e) => { e.stopPropagation(); onResendInvite(user.id) }}>
  <MailIcon className="h-3.5 w-3.5" />
</TooltipIconButton>
// ShieldAlert: shown when !user.mfaEnabled && roleRequiresMFA(user.role)
<TooltipIconButton tooltip="Send MFA enrollment link"
  onClick={(e) => { e.stopPropagation(); onSendMFAEnrollment(user.id) }}>
  <ShieldAlertIcon className="h-3.5 w-3.5 text-amber-500" />
</TooltipIconButton>
// Popover menu
<Popover>
  <PopoverTrigger asChild>
    <TooltipIconButton tooltip="More actions" onClick={(e) => e.stopPropagation()}>
      <MoreHorizontalIcon className="h-3.5 w-3.5" />
    </TooltipIconButton>
  </PopoverTrigger>
  <PopoverContent align="end" className="w-44">
    <NeonButton variant="ghost" className="w-full justify-start text-sm"
      onClick={() => { setEditUser(user); setEditOpen(true) }}>Edit</NeonButton>
    <NeonButton variant="ghost" className="w-full justify-start text-sm"
      onClick={() => { setSessionUser(user); setSessionOpen(true) }}>View Sessions</NeonButton>
    <NeonButton variant="ghost" className="w-full justify-start text-sm"
      onClick={() => onForcePasswordReset(user.id)}>Force Password Reset</NeonButton>
    <NeonButton variant="ghost" className="w-full justify-start text-sm text-destructive"
      onClick={() => { setDeactivateTarget(user.id); setDeactivateOpen(true) }}>Deactivate</NeonButton>
  </PopoverContent>
</Popover>

// Bulk actions
actions={[
  { label:"Deactivate Selected",    variant:"destructive", onClick: () => setBulkDeactivateOpen(true) },
  { label:"Force Password Reset",   onClick: () => onBulkForceReset(selectedIds) },
  { label:"Resend Invite",          onClick: () => onBulkResendInvite(selectedIds) },
]}

// InviteUserModal submit
<NeonButton variant="solid" onClick={async () => {
  await onInviteUser({ email: inviteEmail, name: inviteName, role: inviteRole, department: inviteDept })
  setInviteOpen(false); refetch()
}}>Send Magic Link</NeonButton>

// EditUserModal — login history section
<ContributorsOverviewTable
  data={userLoginHistory}
  columns={[
    {header:"Time",   cell: r => formatDateTime(r.timestamp) },
    {header:"IP",     cell: r => r.maskedIp },
    {header:"Device", cell: r => r.device },
    {header:"Result", cell: r => <StatusBadge status={r.result} /> },
  ]}
/>
```

---

### AUTO-OP-01 — Auto-PO Admin View (resolved)

```tsx
// [NEW] "Retry All Failed" button
<NeonButton variant="default" onClick={() => setRetryAllModalOpen(true)}>
  Retry All Failed
</NeonButton>
// RetryAllModal: shows count of failed items + CTA → POST /shopro/auto-po/retry-all-failed

// [NEW] "Pause/Resume Engine" button
<NeonButton variant="ghost"
  className={enginePaused ? "text-green-600" : "text-destructive"}
  onClick={() => enginePaused ? onResumeEngine() : setPauseModalOpen(true)}>
  {enginePaused ? "▶ Resume Engine" : "⏸ Pause Engine"}
</NeonButton>

// [WIRED] All filter SmartComboboxes
<SmartCombobox options={restaurantOptions} value={restaurantFilter}
  onValueChange={(v) => table.getColumn("restaurantId")?.setFilterValue(v)} />
<SmartCombobox options={triggerTypeOptions} value={triggerFilter}
  onValueChange={(v) => table.getColumn("triggerType")?.setFilterValue(v)} />
<SmartCombobox options={autoPOStatusOptions} value={statusFilter}
  onValueChange={(v) => table.getColumn("status")?.setFilterValue(v)} />

// [WIRED] Trigger frequency select
<select value={pollingInterval} onChange={(e) => {
  setPollingInterval(Number(e.target.value))
  onUpdatePollingInterval(Number(e.target.value))
}} className="rounded-md border border-border bg-background px-3 py-2 text-sm">
  <option value={60}>Every 1 min</option>
  <option value={300}>Every 5 min</option>
  <option value={900}>Every 15 min</option>
</select>

// [WIRED] Row click
<TableRow className="cursor-pointer"
  onClick={() => { setDetailItem(row.original); setDetailModalOpen(true) }} />

// [WIRED] Per-row "View PO →"
{row.original.status === "PO_CREATED" && (
  <NeonButton variant="ghost" className="h-auto p-0 text-xs"
    onClick={(e) => { e.stopPropagation(); router.push(`/operator/po/${row.original.poId}`) }}>
    View PO →
  </NeonButton>
)}

// [WIRED] Per-row "Manual Retry" for FAILED
{row.original.status === "FAILED" && row.original.retryCount < row.original.maxRetries && (
  <TooltipIconButton tooltip="Manual retry"
    onClick={(e) => { e.stopPropagation(); onManualRetry(row.original.id) }}>
    <RefreshCwIcon className="h-3.5 w-3.5" />
  </TooltipIconButton>
)}

// [NEW] Worker health indicator
const [workerStatus, setWorkerStatus] = useState<"ONLINE"|"OFFLINE">("ONLINE")
useInterval(() => {
  fetch("/shopro/auto-po/worker-status")
    .then(r => r.json())
    .then(d => setWorkerStatus(d.status))
}, 30_000)
// Display:
<StatusBadge
  status={workerStatus === "ONLINE" ? "active" : "error"}
  label={`Worker ${workerStatus}`}
/>
```

---

## SUPPLIER PORTAL

---

### S-02 — Verification Status (resolved)

```tsx
// [WIRED] Replacement doc upload per rejected doc
{rejectedDocTypes.map(docType => (
  <div key={docType} className="mt-3">
    <StatusBadge status="REJECTED" label={`${docType} rejected — re-upload required`} />
    <FileUpload
      onUpload={(files) => onResubmitDoc(docType, files[0])}
      accept="application/pdf,image/*"
    />
  </div>
))}

// [NEW] Contact support for rejected status
{rejectedDocTypes.length > 0 && (
  <NeonButton variant="ghost" onClick={() => router.push("/supplier/support/new?reason=doc-rejection")}>
    Contact Support
  </NeonButton>
)}

// [NEW] Refresh button
<TooltipIconButton tooltip="Refresh status" onClick={refetch}>
  <RefreshCwIcon className="h-4 w-4" />
</TooltipIconButton>
```

---

### S-03 — Supplier Dashboard (resolved)

```tsx
// [WIRED] KPI card navigation
<SupplierKPICards cards={kpis.map(c => ({...c, onClick: () => router.push(c.targetRoute)}))} />

// [WIRED] SupplierOrderFeed click
<SupplierOrderFeed
  projects={subPOs.map(subPOAsProject)}
  onProjectClick={(p) => router.push(`/supplier/orders/${p.id}`)}
/>

// [WIRED] Pending bid alerts CTA
// BentoGrid item cta onClick:
// onClick={() => router.push(`/supplier/bids/${bid.id}/quote`)
```

---

### S-04 — Bid Invitations Inbox (resolved)

```tsx
// [NEW] Status filter
<SmartCombobox options={[
  {value:"all",    label:"All"},
  {value:"OPEN",   label:"Open"},
  {value:"CLOSED", label:"Closed"},
  {value:"AWARDED",label:"Awarded"},
]} value={statusFilter} onValueChange={setStatusFilter} />

// [WIRED] Card CTA "Submit Quote →"
// BentoGrid item cta onClick:
// onClick={() => router.push(`/supplier/bids/${bid.id}/quote`)

// [WIRED] Card click → detail modal (not CTA area)
// BentoGrid item has additional onClick on the card body (not CTA):
// onClick={() => { setDetailBid(bid); setDetailModalOpen(true) }

// [WIRED] "Decline" in detail modal
<NeonButton variant="ghost" onClick={() => setDeclineModalOpen(true)}>Decline</NeonButton>
// DeclineModal: reason textarea + CTA → POST /supplier/bids/${bidId}/decline

// [NEW] Deadline countdown per card
// meta field: `${timeRemaining(bid.deadline)} remaining`
// Use useMemo + useInterval to update every minute
const timeRemaining = (deadline: string) => {
  const ms = new Date(deadline).getTime() - Date.now()
  if (ms <= 0) return "Expired"
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  return h > 24 ? `${Math.floor(h/24)}d remaining` : `${h}h ${m}m remaining`
}
```

---

### S-05 — Quote Submission (resolved)

```tsx
// Quote state
const [lineQuotes, setLineQuotes] = useState<Record<UUID, {unitPrice:number; availableQty:number; deliveryDate:string}>>({})
const [notes, setNotes] = useState("")

const setLineQuoteField = (productId: UUID, field: string, value: unknown) =>
  setLineQuotes(prev => ({...prev, [productId]: {...prev[productId], [field]: value}}))

// [WIRED] Per-item fields
<ShoproNumberField label="" defaultValue={lineQuotes[item.productId]?.unitPrice ?? 0}
  onChange={(v) => setLineQuoteField(item.productId, "unitPrice", v)} />
<ShoproNumberField label="" defaultValue={lineQuotes[item.productId]?.availableQty ?? 0}
  onChange={(v) => setLineQuoteField(item.productId, "availableQty", v)} />
<ShoproDatePicker value={lineQuotes[item.productId]?.deliveryDate ?? ""}
  onChange={(d) => setLineQuoteField(item.productId, "deliveryDate", d)} />

// [NEW] Notes textarea
<textarea className="w-full min-h-[80px] resize-none rounded-md border border-border bg-background
  px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  placeholder="Additional terms or conditions…"
  value={notes} onChange={(e) => setNotes(e.target.value)} />

// [NEW] Live total value
const totalValue = useMemo(() =>
  bidItems.reduce((sum, item) => {
    const q = lineQuotes[item.productId]
    return sum + (q ? q.unitPrice * q.availableQty : 0)
  }, 0), [lineQuotes, bidItems])
<div className="text-right">
  <span className="text-sm text-muted-foreground">Total Quote Value: </span>
  <span className="text-base font-semibold">₹{totalValue.toLocaleString("en-IN")}</span>
</div>

// [WIRED] Submit
const allFilled = bidItems.every(i => {
  const q = lineQuotes[i.productId]
  return q && q.unitPrice > 0 && q.availableQty > 0 && q.deliveryDate
})
<NeonButton variant="solid" disabled={!allFilled}
  onClick={() => setConfirmModalOpen(true)}>Submit Quote</NeonButton>
// ConfirmModal CTA:
<NeonButton variant="solid" onClick={async () => {
  await onSubmitQuote({ bidId, lineQuotes: Object.entries(lineQuotes).map(([productId, q]) => ({productId, ...q})), notes })
  router.push("/supplier/bids/history")
}}>Confirm Blind Submission</NeonButton>
```

---

### S-06 — Bid History (resolved)

```tsx
// [NEW] Search + date range
<AnimatedGlowingSearchBar placeholder="Search by bid ID…" onSearch={(q) => table.setGlobalFilter(q)} />
<ShoproDatePicker value={dateFrom} onChange={setDateFrom} label="From" />
<ShoproDatePicker value={dateTo}   onChange={setDateTo}   label="To" />

// [WIRED] Row click
<TableRow className="cursor-pointer"
  onClick={() => { setDetailBid(row.original); setDetailModalOpen(true) }} />
// DetailModal: shows all lineQuotes submitted for that bid
```

---

### S-07 — Sub-PO List (resolved)

```tsx
// [NEW] Search
<AnimatedGlowingSearchBar placeholder="Search orders…" onSearch={(q) => table.setGlobalFilter(q)} />

// [WIRED] Status filter
<SmartCombobox options={subPOStatusOptions} value={statusFilter}
  onValueChange={(v) => table.getColumn("status")?.setFilterValue(v)} />

// [WIRED] Row click
<TableRow className="cursor-pointer"
  onClick={() => router.push(`/supplier/orders/${row.original.id}`)} />
```

---

### S-08 — Sub-PO Detail & Fulfillment (resolved)

```tsx
// [WIRED] Timeline "Update Status" — only on current active step
// Each active step has:
<NeonButton variant="default" onClick={() => setUpdateModalOpen(true)}>
  Update Status
</NeonButton>

// UpdateFulfillmentModal — wired status progression
const nextStatuses: Record<SubPOStatus, SubPOStatus[]> = {
  CREATED:               ["ACKNOWLEDGED"],
  DISPATCHED_TO_SUPPLIER:["ACKNOWLEDGED"],
  ACKNOWLEDGED:          ["PREPARING"],
  PREPARING:             ["DISPATCHED"],
  DISPATCHED:            ["DELIVERED"],
  DELIVERED:             [],
  PAID:                  [],
}
<SmartCombobox
  options={nextStatuses[subPO.status].map(s => ({value:s, label:s.replace(/_/g," ")}))}
  value={newStatus} onValueChange={setNewStatus} />
<input type="text" placeholder="ASN number (optional)"
  value={asn} onChange={(e) => setAsn(e.target.value)} />
<input type="text" placeholder="Tracking reference (optional)"
  value={trackingRef} onChange={(e) => setTrackingRef(e.target.value)} />
<NeonButton variant="solid" disabled={!newStatus} onClick={async () => {
  await onUpdateStatus(subPO.id, { status: newStatus, asn, trackingRef })
  setUpdateModalOpen(false); refetch()
}}>Update Status</NeonButton>

// [WIRED] Delivery proof upload
<FileUpload
  onUpload={async (files) => {
    await onUploadDeliveryProof(subPO.id, files)
    refetch()
  }}
  accept="image/*,application/pdf"
  label="Upload delivery proof (receipt / e-way bill)"
/>
// Proof thumbnail viewer
{subPO.deliveryProofUrl && (
  <img src={subPO.deliveryProofUrl} alt="Delivery proof"
    className="rounded-md max-h-32 cursor-zoom-in object-cover"
    onClick={() => setLightboxOpen(true)} />
)}

// [NEW] "Report Partial Fulfillment" button
<NeonButton variant="ghost" onClick={() => setPartialModalOpen(true)}>
  Report Partial Fulfillment
</NeonButton>
// PartialFulfillmentModal:
{subPO.lineItems.map(item => (
  <div key={item.productId} className="flex items-center gap-3">
    <span className="text-sm flex-1">{item.productName}</span>
    <ShoproNumberField label="" defaultValue={item.quantity}
      onChange={(v) => setPartialQtys(prev => ({...prev, [item.productId]: v}))} />
    <span className="text-xs text-muted-foreground">of {item.quantity} {item.unit}</span>
  </div>
))}
<textarea value={partialReason} onChange={(e) => setPartialReason(e.target.value)}
  placeholder="Reason for partial fulfillment…" />
<NeonButton variant="solid" onClick={async () => {
  await onReportPartial(subPO.id, { itemQtys: partialQtys, reason: partialReason })
  setPartialModalOpen(false)
}}>Submit Partial Report</NeonButton>
```

---

### S-09 — Payments (resolved)

```tsx
// [NEW] Search + date + status filters
<AnimatedGlowingSearchBar placeholder="Search by order ID…" onSearch={(q) => table.setGlobalFilter(q)} />
<ShoproDatePicker value={dateFrom} onChange={setDateFrom} label="From" />
<ShoproDatePicker value={dateTo}   onChange={setDateTo}   label="To" />
<SmartCombobox options={payoutStatusOptions} value={statusFilter}
  onValueChange={(v) => table.getColumn("status")?.setFilterValue(v)} />

// [WIRED] Per-row Download Receipt (PAID rows only)
{row.original.status === "PAID" && (
  <TooltipIconButton tooltip="Download receipt"
    onClick={(e) => { e.stopPropagation(); window.open(`/supplier/payments/${row.original.id}/receipt`) }}>
    <DownloadIcon className="h-3.5 w-3.5" />
  </TooltipIconButton>
)}

// [WIRED] Per-row Raise Dispute (PAID rows within 48h window)
{row.original.status === "PAID" && isWithin48Hours(row.original.confirmedAt) && (
  <TooltipIconButton tooltip="Raise payment dispute"
    onClick={(e) => { e.stopPropagation(); router.push(`/supplier/payments/${row.original.id}/dispute`) }}>
    <AlertCircleIcon className="h-3.5 w-3.5 text-amber-500" />
  </TooltipIconButton>
)}
```

---

### S-10 — Payment Dispute (resolved)

```tsx
const [disputeDesc, setDisputeDesc] = useState("")
const [disputeFiles, setDisputeFiles] = useState<File[]>([])
const [submitted, setSubmitted] = useState(false)

// [NEW] Dispute description textarea (required, before FileUpload)
<textarea
  className="w-full min-h-[100px] resize-none rounded-md border border-border bg-background
    px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  placeholder="Describe the discrepancy — expected amount, actual received, any deductions not agreed…"
  value={disputeDesc} onChange={(e) => setDisputeDesc(e.target.value)} required
/>

// [WIRED] Evidence upload
<FileUpload onUpload={(files) => setDisputeFiles(files)}
  accept="image/*,application/pdf" label="Attach evidence (invoice, PO, delivery proof)" />

// [NEW] 48-hour countdown warning
{timeRemainingMs > 0 && (
  <div className="rounded-md bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-sm text-amber-700">
    ⏳ You have {formatCountdown(timeRemainingMs)} remaining to raise a dispute.
  </div>
)}

// [WIRED] Submit dispute
<NeonButton variant="solid" disabled={!disputeDesc.trim() || submitted}
  onClick={async () => {
    setIsLoading(true)
    try {
      await onSubmitDispute({ paymentId, description: disputeDesc, evidence: disputeFiles })
      setSubmitted(true)
    } finally { setIsLoading(false) }
  }}>Submit Dispute</NeonButton>

// [WIRED] Thread onSend (after dispute submitted)
{submitted && (
  <PaymentDisputeThread currentRole="seller"
    onSend={(msg) => onSendDisputeMessage(disputeId, msg)} />
)}
```

---

### S-11 — Profile & Settings (resolved)

```tsx
// [NEW] "Edit Profile" button + modal
<NeonButton variant="ghost" onClick={() => setProfileModalOpen(true)}>Edit Profile</NeonButton>
// EditProfileModal:
// contactName, contactPhone, address fields
// CTA: await PATCH /supplier/profile

// [WIRED] Category updater
<SmartCombobox multiple value={pendingCategories}
  onValueChange={(v) => {
    setPendingCategories(v)
    // Show "Pending Shopro approval" badge next to changed categories
  }}
/>
{pendingCategories.some(c => !approvedCategories.includes(c)) && (
  <StatusBadge status="pending" label="Category change pending Shopro approval" />
)}

// [WIRED] Notification switches
{notificationEvents.map(event =>
  notificationChannels.map(channel => (
    <MD3Switch key={`${event}-${channel}`}
      checked={preferences[event]?.[channel] ?? false}
      onCheckedChange={(v) => updatePreference(event, channel, v)}
      showIcons />
  ))
)}

// [WIRED] Save
<NeonButton variant="solid" onClick={async () => {
  setIsLoading(true)
  try {
    await onSaveSettings({ categories: pendingCategories, preferences })
    setToastState("success")
  } finally { setIsLoading(false) }
}}>Save Changes</NeonButton>
```

---

### S-12 — Bank / Payment Details (resolved)

```tsx
const [accountNumberRaw, setAccountNumberRaw] = useState("")
const [accountNumberMasked, setAccountNumberMasked] = useState("")
const [ifsc, setIfsc] = useState("")
const [holderName, setHolderName] = useState("")
const [upiVpa, setUpiVpa] = useState("")
const [paymentMethod, setPaymentMethod] = useState<"BANK"|"UPI">("BANK")

// [WIRED] Payment method toggle
<MD3Switch checked={paymentMethod === "BANK"}
  onCheckedChange={(v) => setPaymentMethod(v ? "BANK" : "UPI")}
  checkedIcon={<BuildingIcon />} uncheckedIcon={<SmartphoneIcon />} showIcons />

// [WIRED] Bank fields (shown when paymentMethod === "BANK")
{paymentMethod === "BANK" && (
  <>
    <input type="text"
      value={accountNumberMasked || accountNumberRaw}
      onChange={(e) => { setAccountNumberRaw(e.target.value); setAccountNumberMasked("") }}
      onBlur={() => {
        if (accountNumberRaw.length >= 4)
          setAccountNumberMasked("X".repeat(accountNumberRaw.length - 4) + accountNumberRaw.slice(-4))
      }}
      placeholder="Account number" autoComplete="off"
      className="rounded-md border border-border bg-background px-3 py-2 text-sm w-full" />
    <input type="text" value={ifsc.toUpperCase()}
      onChange={(e) => setIfsc(e.target.value.toUpperCase())}
      placeholder="IFSC code" maxLength={11}
      className="rounded-md border border-border bg-background px-3 py-2 text-sm w-full" />
    <input type="text" value={holderName}
      onChange={(e) => setHolderName(e.target.value)}
      placeholder="Account holder name (must match business name)"
      className="rounded-md border border-border bg-background px-3 py-2 text-sm w-full" />
  </>
)}

// [WIRED] UPI field (shown when paymentMethod === "UPI")
{paymentMethod === "UPI" && (
  <input type="text" value={upiVpa}
    onChange={(e) => setUpiVpa(e.target.value)}
    placeholder="UPI VPA (e.g. business@ybl)"
    className="rounded-md border border-border bg-background px-3 py-2 text-sm w-full" />
)}

// [WIRED] "Request Update" → modal
<NeonButton variant="default" onClick={() => setUpdateModalOpen(true)}>Request Update</NeonButton>

// Modal submit
<NeonButton variant="solid" onClick={async () => {
  const payload = paymentMethod === "BANK"
    ? { method:"BANK", accountNumber: accountNumberRaw, ifscCode: ifsc, accountHolderName: holderName }
    : { method:"UPI",  upiVpa }
  await onUpdatePaymentDetails(payload)
  // After success: mask account number display permanently
  setAccountNumberMasked("X".repeat(accountNumberRaw.length - 4) + accountNumberRaw.slice(-4))
  setAccountNumberRaw("")
  setUpdateModalOpen(false)
}}>Submit — 24h hold will apply</NeonButton>

// [NEW] PaymentChangeTimeline polling
useInterval(async () => {
  const status = await fetchPaymentDetailStatus()
  setTimelineStatus(status)
}, 10_000)

// [NEW] 24h hold countdown
{details.pendingChangeHoldUntil && new Date(details.pendingChangeHoldUntil) > new Date() && (
  <div className="rounded-md bg-muted px-4 py-3 text-sm">
    <CountdownTimer targetTime={details.pendingChangeHoldUntil} label="New details activate in" />
  </div>
)}
```

---

## NEW SCREENS (from audit doc — not in screens-fresh.md)

These 6 screens appear in the operator portal audit (doc 5) but were absent from
screens-fresh.md. They must be built from scratch using the component library.

---

### OP-S1 — Sourcing Wizard

**Route:** `/operator/sourcing-wizard`  
**File:** `app/(operator)/sourcing-wizard/page.tsx`  
**Role:** `SUPER_ADMIN`, `OPS_MANAGER`, `PROCUREMENT_OFFICER`

**Purpose:**  
AI-assisted sourcing scenario builder. Operator defines requirements (category,
volume, quality tier, budget cap). The optimization engine scores all eligible
suppliers against the requirements and recommends the optimal sourcing strategy.
Scenarios can be saved and applied to real PO splits.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `Wizard` | missing-14 | Rename → `SourcingScenarioWizard`. 3 steps: Define Requirements → Review Optimization → Apply Strategy. |
| `SmartCombobox` | original-21 | Step 1: category selector, quality tier, preferred region. |
| `ShoproNumberField` | original-21 | Step 1: target volume, budget cap per unit. |
| `BidComparisonCard` | missing-14 | Rename → `SourcingRecommendationCards`. Step 2: top-ranked suppliers from engine. `onSelect`→`setSelectedStrategy`. |
| `StarRating` | missing-14 | Inside each recommendation card. |
| `StatCardGrid` | missing-14 | Step 2: 4 cards: "Projected Savings", "Top Supplier Match", "Risk Score", "Est. Delivery Days". |
| `ChecklistCard` | missing-14 | Rename → `StrategyReviewChecklist`. Step 3: verify strategy before applying. |
| `ToastSave` | original-21 | After "Save Scenario". `state` flows `initial→loading→success`. |
| `Breadcrumb` | missing-14 | `Operator → Sourcing Wizard` |

**Wired handlers:**
```tsx
// [WIRED] "RUN OPTIMIZATION ENGINE"
<NeonButton variant="solid" disabled={!requirementsComplete || isOptimizing}
  onClick={async () => {
    setIsOptimizing(true)
    try {
      const results = await onRunOptimizationEngine(requirements)
      setOptimizationResults(results)
      goToStep(2)
    } finally { setIsOptimizing(false) }
  }}>
  {isOptimizing ? <OrbitalLoader message="Optimizing…" messagePlacement="right" /> : "Run Optimization Engine"}
</NeonButton>

// [WIRED] "Save Scenario"
<NeonButton variant="default" onClick={async () => {
  setToastState("loading")
  await onSaveScenario({ requirements, results: optimizationResults, name: scenarioName })
  setToastState("success")
}}>Save Scenario</NeonButton>

// [WIRED] "Apply Strategy"
<NeonButton variant="solid" onClick={async () => {
  await onApplyStrategy(selectedStrategy)
  router.push(`/operator/po/inbox`)
}}>Apply Strategy to PO Split</NeonButton>
```

---

### OP-S2 — Margin Optimization

**Route:** `/operator/margin-optimization`  
**File:** `app/(operator)/margin-optimization/page.tsx`  
**Role:** `SUPER_ADMIN`, `FINANCE_OFFICER`

**Purpose:**  
Pricing architecture tool. Adjust markup percentages by category/supplier.
Elasticity and competition sliders model the impact of price changes on order
volume. Bulk adjust margins across selected products. Export report.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `StatCardGrid` | missing-14 | 4 cards: "Avg Margin %", "Revenue at Risk", "Price Elasticity Index", "Competitive Gap". |
| `LedgerTable` | missing-14 | Rename → `MarginTable`. Columns: Category, Product, Cost Price, Current Markup %, Sell Price, Margin ₹, Elasticity Score. |
| `ShoproNumberField` | original-21 | Inline markup % editor per row. `onChange`→`updateMarkup(productId, value)`. |
| `BulkActionBar` | missing-14 | Rename → `MarginBulkActions`. "Bulk Adjust" action. |
| `Modal` | missing-14 | Rename → `BulkAdjustModal`. `ShoproNumberField` for adjustment %. Apply to all selected rows. |
| `ToastSave` | original-21 | After "Save Pricing Architecture". |
| `Breadcrumb` | missing-14 | `Finance → Margin Optimization` |

**Wired handlers:**
```tsx
// [NEW] Range sliders for Elasticity + Competition sensitivity
// These are custom <input type="range"> controls (not in component library — add inline):
<div className="space-y-4">
  <label className="text-sm font-medium">Price Elasticity Sensitivity</label>
  <input type="range" min={0} max={100} value={elasticity}
    onChange={(e) => { setElasticity(Number(e.target.value)); recomputeImpact() }}
    className="w-full accent-primary" />
  <div className="flex justify-between text-xs text-muted-foreground">
    <span>Low (price insensitive)</span><span>High (price sensitive)</span>
  </div>

  <label className="text-sm font-medium">Competitive Pressure</label>
  <input type="range" min={0} max={100} value={competition}
    onChange={(e) => { setCompetition(Number(e.target.value)); recomputeImpact() }}
    className="w-full accent-primary" />
</div>

// [WIRED] "Export Report"
<NeonButton variant="ghost" onClick={() => window.open("/operator/margin-optimization/report/pdf")}>
  Export Report
</NeonButton>

// [WIRED] "Bulk Adjust"
<BulkActionBar actions={[{
  label: "Bulk Adjust",
  onClick: () => setBulkAdjustModalOpen(true)
}]} />
// BulkAdjustModal:
<ShoproNumberField label="Adjust markup by (%)" defaultValue={0} onChange={setBulkAdjustPct} />
<NeonButton variant="solid" onClick={() => {
  selectedIds.forEach(id => updateMarkup(id, currentMarkup(id) + bulkAdjustPct))
  setBulkAdjustModalOpen(false)
}}>Apply to {selectedIds.length} products</NeonButton>

// [WIRED] "Save Pricing Architecture"
<NeonButton variant="solid" onClick={async () => {
  setToastState("loading")
  await onSavePricingArchitecture(markupChanges)
  setToastState("success")
}}>Save Pricing Architecture</NeonButton>
```

---

### OP-S3 — Demand Forecasting

**Route:** `/operator/demand-forecasting`  
**File:** `app/(operator)/demand-forecasting/page.tsx`  
**Role:** `SUPER_ADMIN`, `OPS_MANAGER`, `PROCUREMENT_OFFICER`

**Purpose:**  
Forecast demand for catalog products over the next 30/60/90 days based on
historical PO data. Period selectors (MTD/QTD) for historical context.
Download raw data for external analysis.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `StatCardGrid` | missing-14 | 4 cards: "Forecast Accuracy", "Top Demand Item", "Predicted Volume (30d)", "Stockout Risk Items". |
| `SmartCombobox` | original-21 | Rename → `ForecastCategorySelector`. Multi-select categories to forecast. |
| `ShoproDatePicker` | original-21 | Forecast horizon start date. |
| `ProductTable` | original-21 | Rename → `ForecastResultsTable`. Columns: Product, Avg Weekly Demand, Forecast 30d, Forecast 60d, Confidence %, Stockout Risk. |
| `StatusBadge` | original-21 | Stockout risk: HIGH (rose) / MEDIUM (amber) / LOW (green). |
| `BulkActionBar` | missing-14 | "Download Raw Data" action. |
| `OrbitalLoader` | original-21 | During forecast generation. |
| `Breadcrumb` | missing-14 | `Operator → Demand Forecasting` |

**Wired handlers:**
```tsx
// [WIRED] Period selector buttons (MTD, QTD, YTD, Custom)
{["MTD","QTD","YTD"].map(p => (
  <NeonButton key={p}
    variant={activePeriod === p ? "solid" : "ghost"}
    onClick={() => { setActivePeriod(p); setHistoricalRange(computeRange(p)) }}>
    {p}
  </NeonButton>
))}

// [WIRED] "Generate Forecast"
<NeonButton variant="solid" disabled={isGenerating || selectedCategories.length === 0}
  onClick={async () => {
    setIsGenerating(true)
    try {
      const results = await onGenerateForecast({ categories: selectedCategories, horizonDays: 30, historicalRange })
      setForecastData(results)
    } finally { setIsGenerating(false) }
  }}>
  {isGenerating ? <OrbitalLoader messagePlacement="right" message="Generating…" /> : "Generate Forecast"}
</NeonButton>

// [WIRED] "Download Raw Data"
actions={[{ label:"Download Raw Data",
  onClick: () => downloadCSV(forecastData) }]}
```

---

### OP-S4 — Inventory Prediction

**Route:** `/operator/inventory-prediction`  
**File:** `app/(operator)/inventory-prediction/page.tsx`  
**Role:** `SUPER_ADMIN`, `OPS_MANAGER`, `PROCUREMENT_OFFICER`

**Purpose:**  
SKU-level inventory prediction. Predicts depletion dates for all active products
based on historical consumption rates and current stock levels. Allows operators
to pre-emptively place orders for at-risk SKUs.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `AnimatedGlowingSearchBar` | original-21 | Rename → `SKUSearch`. `onSearch`→`setGlobalFilter`. |
| `StatCardGrid` | missing-14 | 3 cards: "SKUs at Risk", "Predicted Stockouts (7d)", "Avg Days Coverage". |
| `ProductTable` | original-21 | Rename → `InventoryPredictionTable`. Columns: SKU, Product, Current Stock, Avg Daily Consumption, Predicted Depletion Date, Days Coverage, Risk, Actions. |
| `StatusBadge` | original-21 | Risk: CRITICAL (rose) / AT_RISK (amber) / HEALTHY (green). |
| `Modal` | missing-14 | Rename → `PlaceOrderModal`. Pre-fills SmartCombobox with product and suggested quantity for direct order. |
| `OrbitalLoader` | original-21 | During prediction generation. |
| `Breadcrumb` | missing-14 | `Operator → Inventory Prediction` |

**Wired handlers:**
```tsx
// [WIRED] "Search SKU" onChange
<AnimatedGlowingSearchBar placeholder="Search SKU or product name…"
  onSearch={(q) => table.setGlobalFilter(q)} />

// [WIRED] "Place Order" per at-risk row
<NeonButton variant="default" onClick={(e) => {
  e.stopPropagation()
  setOrderTarget(row.original)
  setPlaceOrderModalOpen(true)
}}>Place Order</NeonButton>
// PlaceOrderModal: pre-populates product + recommended qty (suggestedReorderQty based on prediction)
// CTA → router.push(`/operator/po/inbox`) with pre-populated split data

// [WIRED] "Predict Next 30 Days"
<NeonButton variant="solid" disabled={isPredicting}
  onClick={async () => {
    setIsPredicting(true)
    try {
      const predictions = await onPredictInventory({ horizonDays: 30 })
      setPredictionData(predictions)
    } finally { setIsPredicting(false) }
  }}>
  {isPredicting ? <OrbitalLoader messagePlacement="right" message="Predicting…" /> : "Predict Next 30 Days"}
</NeonButton>
```

---

### OP-S5 — Payment Reconciliation

**Route:** `/operator/reconciliation`  
**File:** `app/(operator)/reconciliation/page.tsx`  
**Role:** `SUPER_ADMIN`, `FINANCE_OFFICER`

**Purpose:**  
Match bank settlement files against platform payout records. Auto-match by
transaction reference. Manual resolution for conflicts (amount mismatch, missing
reference). Upload new settlement files from the bank.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `StatCardGrid` | missing-14 | 4 cards: "Matched", "Unmatched", "Conflicts", "Total Reconciled (₹)". |
| `AnimatedGlowingSearchBar` | original-21 | Rename → `InvoiceSearch`. `onSearch`→filter reconciliation table. |
| `LedgerTable` | missing-14 | Rename → `ReconciliationTable`. Columns: Tx Ref, Supplier, Expected Amount, Bank Amount, Match Status, Difference, Action. |
| `StatusBadge` | original-21 | MATCHED (green) / UNMATCHED (amber) / CONFLICT (rose) / PENDING (slate). |
| `FileUpload` | missing-14 | Rename → `SettlementFileUpload`. Accept `.csv,.xlsx`. Trigger bank file import. |
| `Modal` | missing-14 | Rename → `ResolveConflictModal`. Shows expected vs actual. Finance Officer selects resolution: Accept Bank Amount / Accept Platform Amount / Manual Entry. |
| `BulkActionBar` | missing-14 | "Match All (Auto)" action. |
| `Breadcrumb` | missing-14 | `Finance → Reconciliation` |

**Wired handlers:**
```tsx
// [WIRED] "Upload Settlement File"
<FileUpload
  onUpload={async (files) => {
    setIsImporting(true)
    try {
      await onUploadSettlementFile(files[0])
      refetch()
    } finally { setIsImporting(false) }
  }}
  accept=".csv,.xlsx"
  label="Upload bank settlement file (.csv or .xlsx)"
/>

// [WIRED] "Match All (Auto)"
actions={[{
  label: "Match All (Auto)",
  onClick: async () => {
    setIsMatching(true)
    try { await onAutoMatchAll(); refetch() }
    finally { setIsMatching(false) }
  }
}]}

// [WIRED] "Search Invoice" onChange
<AnimatedGlowingSearchBar placeholder="Search by invoice or transaction ref…"
  onSearch={(q) => table.setGlobalFilter(q)} />

// [WIRED] "Resolve Conflict" per row
{row.original.status === "CONFLICT" && (
  <NeonButton variant="ghost" onClick={(e) => {
    e.stopPropagation()
    setConflictItem(row.original)
    setResolveModalOpen(true)
  }}>Resolve</NeonButton>
)}
// ResolveConflictModal:
// Show: Expected ₹{item.expectedAmount} vs Bank ₹{item.bankAmount}
// Radio group: "Accept Bank Amount" / "Accept Platform Amount" / "Enter Manual Amount"
// If manual: ShoproNumberField
// CTA: await onResolveConflict(item.txRef, { resolution, manualAmount })
```

---

### OP-S6 — Tax Compliance

**Route:** `/operator/tax`  
**File:** `app/(operator)/tax/page.tsx`  
**Role:** `SUPER_ADMIN`, `FINANCE_OFFICER`, `AUDITOR`

**Purpose:**  
GST filing management. View all taxable transactions grouped by filing period.
Verify GSTN numbers against the government portal. Download filing data
(GSTR-1/GSTR-3B format). Filter by filing period, entity, status.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `StatCardGrid` | missing-14 | 3 cards: "Transactions This Period", "Total Tax Collected (₹)", "Pending Verification". |
| `AnimatedGlowingSearchBar` | original-21 | Rename → `FilingSearch`. `onSearch`→filter filing table. |
| `SmartCombobox` | original-21 | Rename → `FilingPeriodSelector`. Options: current quarter + last 4 quarters. |
| `LedgerTable` | missing-14 | Rename → `TaxFilingTable`. Columns: Invoice No., Date, Party (Restaurant/Supplier), GSTIN, Taxable Amount, GST Rate, Tax Amount, Filing Status. |
| `StatusBadge` | original-21 | FILED / PENDING / VERIFIED / ERROR. |
| `Modal` | missing-14 | Rename → `GSTNVerificationModal`. Shows GSTN + verification result from government API. |
| `BulkActionBar` | missing-14 | "Download Filing Data" action. |
| `Breadcrumb` | missing-14 | `Finance → Tax Compliance` |

**Wired handlers:**
```tsx
// [WIRED] "Filter Filing" search
<AnimatedGlowingSearchBar placeholder="Filter by invoice or GSTIN…"
  onSearch={(q) => table.setGlobalFilter(q)} />

// [WIRED] Filing period selector
<SmartCombobox options={filingPeriodOptions} value={filingPeriod}
  onValueChange={(v) => { setFilingPeriod(v); refetch(v) }} />

// [WIRED] "Verify with GSTN" per row
{["PENDING","ERROR"].includes(row.original.filingStatus) && (
  <NeonButton variant="ghost" onClick={(e) => {
    e.stopPropagation()
    setVerifyTarget(row.original)
    setVerifyModalOpen(true)
  }}>Verify GSTN</NeonButton>
)}
// GSTNVerificationModal:
// Shows GSTN number + spinner while verifying
// CTA: await onVerifyGSTN(gstin) → calls govt GST portal API
// Shows result: VALID / INVALID / SUSPENDED

// [WIRED] "Download Filing Data"
actions={[{
  label: "Download Filing Data",
  onClick: () => window.open(`/operator/tax/download?period=${filingPeriod}&format=gstr1`)
}]}
```

---

## Screen index (this file)

| ID | Screen | Status |
|---|---|---|
| SHELL-R | Restaurant App Shell | ✅ Resolved — all handlers wired |
| SHELL-OP | Operator App Shell | ✅ Resolved |
| SHELL-S | Supplier App Shell | ✅ Resolved |
| R-00 | Restaurant Login | ✅ Resolved |
| OP-00 | Operator Login + MFA | ✅ Resolved |
| S-01 | Supplier Login | ✅ Resolved |
| S-00 | Supplier Registration Wizard | ✅ Resolved |
| R-01 through R-12 | Restaurant Portal | ✅ Resolved |
| AUTO-R-01 through AUTO-R-03 | Auto-PO Restaurant | ✅ Resolved |
| OP-01 through OP-21 | Operator Portal | ✅ Resolved |
| AUTO-OP-01 | Auto-PO Admin | ✅ Resolved |
| S-02 through S-12 | Supplier Portal | ✅ Resolved |
| OP-S1 | Sourcing Wizard | 🆕 New screen |
| OP-S2 | Margin Optimization | 🆕 New screen |
| OP-S3 | Demand Forecasting | 🆕 New screen |
| OP-S4 | Inventory Prediction | 🆕 New screen |
| OP-S5 | Payment Reconciliation | 🆕 New screen |
| OP-S6 | Tax Compliance | 🆕 New screen |