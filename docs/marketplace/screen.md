# Shopro Platform — Screen Specifications

> **Fresh document — standalone, not an addendum.**
> Covers the complete Shopro platform: Restaurant Portal, Shopro Operator Portal (7 roles),
> Supplier Portal. 53 screens total. Every entry is a self-contained build instruction
> for the `ui-component-builder` skill.

---

## How to use with the skill

```
"Build [Screen ID] — [Screen Name] from screens.md"
```

The skill reads the screen entry, looks up each component in `references/component-registry.md`,
reads those sections from the source files, and outputs one adapted `.tsx` file.

---

## Shared domain types — `/lib/types/shopro.ts`

```ts
type UUID = string

type ShoproRole =
  | "SUPER_ADMIN" | "OPS_MANAGER" | "PROCUREMENT_OFFICER"
  | "FINANCE_OFFICER" | "SUPPLIER_RELATIONS" | "SUPPORT_AGENT" | "AUDITOR"

type POStatus =
  | "DRAFT" | "RAISED" | "CLARIFICATION_REQUESTED" | "ACCEPTED"
  | "REJECTED" | "SPLITTING" | "SPLIT_COMPLETE" | "IN_FULFILLMENT"
  | "PARTIALLY_DELIVERED" | "DELIVERED" | "CLOSED"

type SubPOStatus =
  | "CREATED" | "DISPATCHED_TO_SUPPLIER" | "ACKNOWLEDGED"
  | "PREPARING" | "DISPATCHED" | "DELIVERED" | "PAID"

type BidStatus      = "OPEN" | "CLOSED" | "AWARDED" | "CANCELLED"
type AssignmentMode = "DIRECT" | "BID"
type VettingStatus  = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "CONDITIONAL" | "REJECTED" | "SUSPENDED"
type PayoutStatus   = "PENDING_DELIVERY" | "IN_QUEUE" | "INITIATED" | "APPROVED" | "PAID" | "HELD" | "FAILED"
type TriggerType    = "STOCK_THRESHOLD" | "SCHEDULED" | "REORDER_RULE"
type AutoPOStatus   = "PENDING" | "EVENT_PUBLISHED" | "PO_CREATED" | "PO_SKIPPED" | "FAILED" | "REQUIRES_REVIEW"

interface Address { line1: string; line2?: string; city: string; state: string; pincode: string; lat?: number; lng?: number }

interface OrderLineItem { productId: UUID; productName: string; quantity: number; unit: string; unitPrice?: number; notes?: string }

interface PurchaseOrder {
  id: UUID; restaurantId: UUID; restaurantName: string; status: POStatus
  lineItems: OrderLineItem[]; deliveryAddress: Address; requiredDeliveryDate: string
  specialInstructions?: string; totalValue: number; currency: string
  source: "MANUAL" | "AUTO"; createdAt: string; acceptedAt?: string; closedAt?: string
}

interface SubPurchaseOrder {
  id: UUID; parentPoId: UUID; supplierId: UUID; supplierName: string
  assignmentMode: AssignmentMode; bidId?: UUID; status: SubPOStatus
  lineItems: SubPOLineItem[]; deliveryProofUrl?: string
  confirmedQuantities?: { productId: UUID; confirmedQty: number }[]
  agreedTotal: number; payoutAmount?: number; payoutStatus?: PayoutStatus
  createdAt: string; updatedAt: string
}

interface SubPOLineItem { productId: UUID; productName: string; quantity: number; agreedUnitPrice: number; unit: string }

interface BidEvent {
  id: UUID; createdByUserId: UUID; parentPoId?: UUID; status: BidStatus
  items: { productId: UUID; productName: string; quantity: number; unit: string; specs?: string }[]
  deadline: string; deliveryRequirements: string
  invitedSupplierIds: UUID[]; isBroadcast: boolean; isBlind: boolean
  quotes: SupplierQuote[]
}

interface SupplierQuote {
  id: UUID; bidEventId: UUID; supplierId: UUID; supplierName: string
  lineQuotes: { productId: UUID; unitPrice: number; availableQty: number; deliveryDate: string }[]
  totalValue: number; notes?: string; submittedAt: string; isWinner: boolean; rank?: number
}

interface Supplier {
  id: UUID; businessName: string; contactEmail: string; phone: string
  categories: string[]; vettingStatus: VettingStatus; documents: SupplierDocument[]
  paymentDetails?: SupplierPaymentDetail
  rating: number; onTimeDeliveryRate: number; bidWinRate: number
  totalOrders: number; createdAt: string; approvedAt?: string
}

interface SupplierDocument {
  id: UUID; type: "BUSINESS_REG" | "GST" | "PAN" | "FSSAI" | "BANK_VERIFY" | "OTHER"
  fileName: string; url: string; uploadedAt: string; expiresAt?: string
  status: "PENDING" | "VERIFIED" | "EXPIRED" | "REJECTED"
}

interface SupplierPaymentDetail {
  id: UUID; method: "BANK" | "UPI" | "WALLET"
  maskedAccountNumber: string   // "XXXXXXXX1234" always — never full number in UI
  ifscCode: string; accountHolderName: string; upiVpa?: string
  isVerified: boolean; verifiedAt?: string; isActive: boolean
  pendingChangeHoldUntil?: string
}

interface Restaurant {
  id: UUID; businessName: string; contactEmail: string; phone: string
  address: Address; fssaiNumber?: string; gstNumber?: string
  onboardingStatus: VettingStatus; isActive: boolean
  creditLimit: number; outstandingDues: number
  accountManagerId?: UUID; accountManagerName?: string; createdAt: string
}

interface ShoproUser {
  id: UUID; email: string; name: string; role: ShoproRole
  department?: string; isActive: boolean; mfaEnabled: boolean
  lastLoginAt?: string; activeSessions?: number
}

interface PayoutQueueItem {
  id: UUID; subPoId: UUID; supplierId: UUID; supplierName: string
  parentPoId: UUID; restaurantName: string
  agreedAmount: number; deductions: number; netPayout: number
  currency: string; status: PayoutStatus; confirmedAt: string
  requiresDualApproval: boolean
}

interface AuditLogEntry {
  id: UUID; timestamp: string; actorId: UUID; actorName: string
  actorRole: string; portal: string; action: string; entityType: string; entityId: UUID
  beforeState?: Record<string, unknown>; afterState?: Record<string, unknown>
  ipAddressHash: string; metadata?: Record<string, unknown>
}

interface CatalogProduct {
  id: UUID; name: string; category: string; unit: string; basePrice: number
  description?: string; isAvailable: boolean; isSeasonal: boolean
  imageUrl?: string; tags: string[]
}

interface CartItem { productId: UUID; productName: string; unit: string; quantity: number; unitPrice: number }

interface SupportTicket {
  id: UUID; restaurantId: UUID; poId?: UUID; subject: string; description: string
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
  createdAt: string; resolvedAt?: string; messages: TicketMessage[]
}

interface TicketMessage {
  id: UUID; authorId: UUID; authorName: string
  authorRole: "RESTAURANT" | "SHOPRO_SUPPORT"; body: string; timestamp: string
}

interface ReorderRule {
  id: UUID; restaurantId: UUID; productId: UUID; productName: string
  reorderThreshold: number; reorderQuantity: number; unit: string
  substituteProductId?: UUID; substituteProductName?: string
  isActive: boolean; cooldownHours: number; lastTriggeredAt?: string
}

interface AutoPOSchedule {
  id: UUID; restaurantId: UUID; name: string; cronExpression: string; timezone: string
  lineItems: { productId: UUID; productName: string; quantity: number; unit: string }[]
  requiredLeadDays: number; specialInstructions?: string
  isActive: boolean; lastTriggeredAt?: string; nextTriggerAt?: string
}

interface AutoPORequest {
  id: UUID; restaurantId: UUID; restaurantName: string
  triggerType: TriggerType; triggerSourceId?: UUID
  lineItems: { productId: UUID; productName: string; requestedQuantity: number; unit: string; currentStock?: number; threshold?: number }[]
  requiredDeliveryDate?: string; status: AutoPOStatus; poId?: UUID; errorDetail?: string
  retryCount: number; maxRetries: number; nextRetryAt?: string
  createdAt: string; processedAt?: string
}

interface Notification {
  id: UUID; type: "order" | "payment" | "bid" | "shipment" | "system" | "document"
  title: string; body: string; timestamp: string; read: boolean
  actionLabel?: string; actionRoute?: string
}
```

---

## Build order

```
Phase 1 — Auth
  R-00  Restaurant Login
  OP-00 Operator Login + MFA Setup + MFA Verify
  S-01  Supplier Login
  S-00  Supplier Registration Wizard

Phase 2 — App Shells (build before all portal screens)
  SHELL-R   Restaurant App Shell
  SHELL-OP  Operator App Shell
  SHELL-S   Supplier App Shell

Phase 3 — Restaurant portal
  R-01 through R-12, AUTO-R-01 through AUTO-R-03

Phase 4 — Operator portal (PO flow first)
  OP-01, OP-03, OP-04, OP-05, OP-06
  OP-07, OP-08
  OP-09, OP-10, OP-11
  OP-12, OP-13, OP-14
  OP-02, OP-15 through OP-21, AUTO-OP-01

Phase 5 — Supplier portal
  S-02 through S-12
```

---

## SHARED SHELLS

---

### SHELL-R — Restaurant App Shell

**File:** `app/(restaurant)/layout.tsx`  
**Role:** all authenticated restaurant users

**Purpose:** Persistent layout — sidebar, breadcrumb, notification bell, user avatar. Sidebar shows only restaurant-relevant navigation. Supplier and sub-PO information never appears anywhere in this shell.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `SidebarNav` | missing-14 | Rename → `RestaurantSidebar`. `role="buyer"`. Nav items: Dashboard, Explore, My Orders (badge=active PO count), Inventory, Payments, Support, Settings. |
| `Breadcrumb` | missing-14 | Rename → `RestaurantBreadcrumb`. Wire to Next.js `usePathname()`. |
| `TooltipIconButton` | original-21 | Notification bell and help icon in header. `side="bottom"`. |
| `NotificationDrawer` | missing-14 | Rename → `RestaurantNotificationDrawer`. Types: `order`, `shipment`, `system`. |
| `OrbitalLoader` | original-21 | Suspense boundary loader. `messagePlacement="bottom"`. message="Loading…" |

---

### SHELL-OP — Operator App Shell

**File:** `app/(operator)/layout.tsx`  
**Role:** all Shopro internal roles

**Purpose:** Operator portal layout. Role badge below logo. Nav items and badge counts are role-dependent. Collapsible sidebar with spring animation.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `SidebarNav` | missing-14 | Rename → `OperatorSidebar`. `role="platform"`. Nav items vary by `ShoproRole` — see nav config below. |
| `Breadcrumb` | missing-14 | Rename → `OperatorBreadcrumb`. |
| `TooltipIconButton` | original-21 | Notification bell; audit shortcut (Auditor/Super Admin only). |
| `NotificationDrawer` | missing-14 | Rename → `OperatorNotificationDrawer`. Types: `order`, `bid`, `payment`, `document`, `system`. Filter by role. |
| `OrbitalLoader` | original-21 | Suspense loader. |

**Nav config by role:**
```ts
// Super Admin sees everything
const SUPER_ADMIN_NAV = [
  { id:"po-inbox",    label:"PO Inbox",       badge: newPOCount   },
  { id:"restaurants", label:"Restaurants"                         },
  { id:"suppliers",   label:"Suppliers"                           },
  { id:"bids",        label:"Bid Engine",     badge: openBidCount },
  { id:"deliveries",  label:"Deliveries"                          },
  { id:"finance",     label:"Finance"                             },
  { id:"catalog",     label:"Catalog"                             },
  { id:"reports",     label:"Reports"                             },
  { id:"audit",       label:"Audit Log"                           },
  { id:"users",       label:"Users"                               },
  { id:"config",      label:"Config"                              },
  { id:"auto-po",     label:"Auto-PO"                             },
]
// Ops Manager: PO flow + deliveries + restaurants + auto-po + audit (view)
// Procurement Officer: PO inbox + bid engine + suppliers
// Finance Officer: payout queue + ledger + revenue + audit (view)
// Supplier Relations: vetting queue + supplier directory
// Support Agent: PO inbox (read-only) + restaurants (read-only) + tickets
// Auditor: audit log + ledger + reports (all read-only)
```

---

### SHELL-S — Supplier App Shell

**File:** `app/(supplier)/layout.tsx`  
**Role:** all authenticated supplier users

**Purpose:** Supplier portal layout. Restaurant identity NEVER shown in this shell or any child screen. "Customer" always = "Shopro".

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `SidebarNav` | missing-14 | Rename → `SupplierSidebar`. `role="seller"`. Nav: Dashboard, Bid Invitations (badge), My Orders (badge), Payments, Profile, Settings. |
| `Breadcrumb` | missing-14 | Rename → `SupplierBreadcrumb`. |
| `TooltipIconButton` | original-21 | Notification bell. |
| `NotificationDrawer` | missing-14 | Rename → `SupplierNotificationDrawer`. Types: `bid`, `order`, `payment`, `document`. |
| `OrbitalLoader` | original-21 | Suspense loader. |

---

## AUTHENTICATION

---

### R-00 — Restaurant Login

**File:** `app/restaurant/login/page.tsx`  
**Role:** unauthenticated restaurant users

**Purpose:** Email + password login for restaurant portal. No MFA required.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `AuroraBackground` | original-21 | Full-screen wrapper. `showRadialGradient={true}`. |
| `PasswordInput` | original-21 | Rename → `RestaurantPasswordField`. Keep show/hide toggle only — remove strength meter and requirements list. |
| `NeonButton` | original-21 | Variant `solid`. "Sign In". Full width. |
| `OrbitalLoader` | original-21 | Loading state inside button. `messagePlacement="right"`. message="Signing in…" |

**Props:**
```ts
interface RestaurantLoginProps {
  onLogin: (email: string, password: string) => Promise<void>
  onForgotPassword: () => void
  isLoading?: boolean
}
```

**Layout:** Centered card (max-w-sm) over Aurora. Card uses `GlowingBorder spread={60}`. Email input → password field → "Sign In" CTA → "Forgot password?" link.

---

### OP-00 — Operator Login + MFA

**Files:** `app/operator/login/page.tsx` · `app/operator/mfa/setup/page.tsx` · `app/operator/mfa/verify/page.tsx`  
**Role:** unauthenticated Shopro staff

**Purpose:** Three-step auth flow. Step 1: email + password. Step 2 (MFA-required roles: Super Admin, Finance Officer, Auditor): either TOTP setup on first login, or TOTP verify on subsequent logins. Non-MFA roles skip step 2.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `AuroraBackground` | original-21 | Wrapper for all three sub-screens. |
| `PasswordInput` | original-21 | Rename → `OperatorPasswordField`. Show/hide only. |
| `OTPVerification` | original-21 | Rename → `TOTPInput`. Extend to **6 digits** (change `otp` state to length 6, all 6 input boxes). Remove giphy background and email text. For MFA Setup: show QR `<img src={qrCodeUri}>` above inputs + backup secret key in monospace. For MFA Verify: instruction text "Open your authenticator app". |
| `NeonButton` | original-21 | "Sign In" / "Confirm Setup" / "Verify". Variant `solid`. |
| `StatusBadge` | original-21 | Show role badge on card after email recognised. e.g. "Finance Officer". |
| `OrbitalLoader` | original-21 | Loading state. |

**Props:**
```ts
interface OperatorLoginProps {
  onLogin: (email: string, password: string) => Promise<{
    mfaRequired: boolean; mfaSetupRequired: boolean; tempToken?: string
  }>
}
interface MFASetupProps {
  qrCodeUri: string; backupSecretKey: string; tempToken: string
  onConfirm: (code: string, tempToken: string) => Promise<void>
}
interface MFAVerifyProps {
  tempToken: string
  onVerify: (code: string, tempToken: string) => Promise<void>
  onBack: () => void
}
```

---

### S-01 — Supplier Login

**File:** `app/supplier/login/page.tsx`  
**Role:** unauthenticated suppliers

**Purpose:** Email + password login. Link to S-00 registration.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `AuroraBackground` | original-21 | Wrapper. |
| `PasswordInput` | original-21 | Rename → `SupplierPasswordField`. Show/hide only. |
| `NeonButton` | original-21 | "Sign In". Variant `solid`. |
| `OrbitalLoader` | original-21 | Loading state. |

**Props:**
```ts
interface SupplierLoginProps {
  onLogin: (email: string, password: string) => Promise<void>
  onRegister: () => void
  onForgotPassword: () => void
}
```

---

### S-00 — Supplier Registration Wizard

**File:** `app/supplier/register/page.tsx`  
**Role:** unauthenticated (new supplier)

**Purpose:** 5-step wizard. Progress saved — can resume. Steps: Business Info → Categories → Documents → Bank/Payment → Review & Submit. On complete → S-02 Verification Status.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `Wizard` | missing-14 | Rename → `SupplierRegistrationWizard`. 5 steps. `onComplete`→`onSubmitRegistration`. Each step has `validate()`. |
| `SmartCombobox` | original-21 | Rename → `SupplierCategorySelector`. Multi-select. Static options: Produce, Dairy, Dry Goods, Meat & Seafood, Beverages, Packaging, Other. Step 2. |
| `FileUpload` | missing-14 | Rename → `RegistrationDocUpload`. One per document type (Business Reg, GST, PAN, FSSAI). `accept="application/pdf,image/*"`. Step 3. |
| `MD3Switch` | original-21 | Payment method toggle (Bank / UPI). `showIcons={true}`. Step 4. |
| `ChecklistCard` | missing-14 | Rename → `RegistrationReviewCard`. Read-only summary in step 5. |
| `ToastSave` | original-21 | Draft auto-save indicator throughout wizard. |
| `AuroraBackground` | original-21 | Full-screen wrapper. |

**Step data shapes:**
```ts
interface Step1 { businessName: string; businessType: string; contactName: string; contactEmail: string; contactPhone: string; address: Address; gstin?: string; pan: string }
interface Step2 { categories: string[] }
interface Step3 { documents: { type: "BUSINESS_REG"|"GST"|"PAN"|"FSSAI"|"OTHER"; file: File }[] }
interface Step4 { paymentMethod: "BANK"|"UPI"; accountNumber?: string; ifscCode?: string; accountHolderName?: string; upiVpa?: string }
```

---

## RESTAURANT PORTAL

---

### R-01 — Restaurant Dashboard

**File:** `app/(restaurant)/dashboard/page.tsx`  
**Role:** restaurant users

**Purpose:** At-a-glance procurement health. KPI cards, recent POs, low-stock alerts. Restaurant sees only Shopro — no supplier/sub-PO data ever shown.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `StatCardGrid` | missing-14 | Rename → `RestaurantKPICards`. `columns={4}`. Cards: "Open POs", "In Fulfillment", "Delivered This Month", "Pending Payment". |
| `ProjectDashboard` | original-21 | Rename → `RecentPOFeed`. Map `PurchaseOrder[]` → `Project[]`. `name`=`"PO-"+id.slice(0,8)`, `subtitle`=items summary, `progress`=delivery progress %, `daysLeft`=days to required delivery. `onProjectClick`→`onOpenPO`. Remove create/edit/delete. |
| `BentoGrid` | original-21 | Rename → `LowStockAlerts`. Items below reorder threshold as BentoItems. `status`="Low Stock". `cta`="Reorder →". |
| `OrbitalLoader` | original-21 | Data loading state. |

**PO → Project mapping:**
```ts
const poAsProject = (po: PurchaseOrder): Project => ({
  id:          po.id,
  name:        `PO-${po.id.slice(0,8).toUpperCase()}`,
  subtitle:    `${po.lineItems.length} items · ₹${po.totalValue.toLocaleString("en-IN")}`,
  date:        po.createdAt,
  progress:    { DRAFT:0, RAISED:10, ACCEPTED:20, SPLITTING:30, SPLIT_COMPLETE:40, IN_FULFILLMENT:60, PARTIALLY_DELIVERED:80, DELIVERED:100, CLOSED:100, REJECTED:0, CLARIFICATION_REQUESTED:10 }[po.status] ?? 0,
  status:      mapPOToProjectStatus(po.status),
  accentColor: { IN_FULFILLMENT:"#6366f1", DELIVERED:"#10b981", REJECTED:"#ef4444" }[po.status] ?? "#6366f1",
  daysLeft:    daysUntil(po.requiredDeliveryDate),
})
```

---

### R-02 — Product Catalog / Explore

**File:** `app/(restaurant)/catalog/page.tsx`  
**Role:** restaurant users

**Purpose:** Browse Shopro's managed product catalog. Search, filter by category. Add to cart. Cart persists to R-03 PO Creation. Shopro controls what is visible (no direct supplier browsing).

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `AnimatedGlowingSearchBar` | original-21 | Rename → `CatalogSearch`. `onSearch`→`setSearchQuery`. |
| `SmartCombobox` | original-21 | Rename → `CategoryFilter`. Single-select. Options: All, Produce, Dairy, Dry Goods, Meat & Seafood, Beverages, Packaging. |
| `BentoGrid` | original-21 | Rename → `ProductCatalogGrid`. Each BentoItem = one product. |
| `StatusBadge` | original-21 | Availability: Available / Seasonal / Out of Stock. |
| `Popover` | original-21 | Quick-view per card — full description, unit breakdown, min order. |
| `NeonButton` | original-21 | "Add to Cart" inside each card. Variant `default`. |
| `ToastSave` | original-21 | "Item added" confirmation. Auto-resets `state="initial"` after 2s. |
| `Breadcrumb` | missing-14 | `Home → Explore` |

**Product → BentoItem:**
```ts
const productAsBentoItem = (p: CatalogProduct): BentoItem => ({
  title:       p.name,
  meta:        `₹${p.basePrice} / ${p.unit}`,
  description: p.description ?? p.category,
  icon:        <CategoryIcon category={p.category} />,
  status:      p.isAvailable ? (p.isSeasonal ? "Seasonal" : "Active") : "Out of Stock",
  tags:        p.tags,
  cta:         p.isAvailable ? "Add to Cart →" : "Unavailable",
  colSpan:     1,
})
```

---

### R-03 — PO Creation

**File:** `app/(restaurant)/orders/new/page.tsx`  
**Role:** restaurant users

**Purpose:** Create Purchase Order from cart. Adjust quantities, set delivery date, address, special instructions. Submit → PO raised to Shopro. Optional internal approval for large orders.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `ContributorsOverviewTable` | original-21 | Rename → `CartReviewTable`. Rows = cart items. Columns: Product, Unit, Qty, Unit Price, Line Total. Footer = PO total. |
| `ShoproNumberField` | original-21 | Rename → `CartQtyField`. One per cart row. Inline quantity editing. |
| `ShoproDatePicker` | original-21 | Rename → `DeliveryDatePicker`. Label "Required Delivery Date". Min = tomorrow. |
| `SmartCombobox` | original-21 | Rename → `DeliveryAddressSelector`. Single-select from saved addresses. `onCreate`→adds new. |
| `ToastSave` | original-21 | Draft auto-save. `onSave`→`saveDraft`. `onReset`→`clearCart`. |
| `Modal` | missing-14 | Rename → `SubmitPOConfirmModal`. Summary: item count, total, delivery date. CTA "Submit to Shopro". |
| `NeonButton` | original-21 | "Submit Order". Variant `solid`. Violet. |
| `Breadcrumb` | missing-14 | `Home → My Orders → New Order` |

**Callback:**
```ts
onSubmitPO: (data: {
  lineItems: CartItem[]; deliveryAddress: Address
  requiredDeliveryDate: string; specialInstructions?: string
}) => Promise<void>
```

---

### R-04 — My Orders (PO List)

**File:** `app/(restaurant)/orders/page.tsx`  
**Role:** restaurant users

**Purpose:** All POs for this restaurant. Simplified statuses — no sub-PO, no supplier, no bid info. Search by PO ID. Filter by status.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `ProductTable` | original-21 | Rename → `RestaurantPOTable`. Columns: PO ID, Items, Total (₹), Status, Required Delivery, Raised At. |
| `StatusBadge` | original-21 | Simplified labels: Raised / Accepted / In Fulfillment / Delivered / Rejected. Map full internal status to these. |
| `SmartCombobox` | original-21 | Rename → `POStatusFilter`. Single-select. |
| `AnimatedGlowingSearchBar` | original-21 | Rename → `POSearch`. Filter by PO ID. |
| `BulkActionBar` | missing-14 | Rename → `POBulkActions`. "Cancel Selected" — only for DRAFT/RAISED rows. |
| `Breadcrumb` | missing-14 | `Home → My Orders` |

**Column definitions:**
```ts
const restaurantPOColumns: ColumnDef<PurchaseOrder>[] = [
  { accessorKey:"id",                  header:"PO ID",       cell:({row})=>`PO-${row.getValue<string>("id").slice(0,8).toUpperCase()}` },
  { accessorKey:"lineItems",           header:"Items",       cell:({row})=>`${row.getValue<OrderLineItem[]>("lineItems").length} items` },
  { accessorKey:"totalValue",          header:"Total",       cell:({row})=>`₹${row.getValue<number>("totalValue").toLocaleString("en-IN")}` },
  { accessorKey:"status",              header:"Status",      cell:({row})=><StatusBadge status={simplifyPOStatus(row.getValue("status"))} /> },
  { accessorKey:"requiredDeliveryDate",header:"Delivery By"  },
  { accessorKey:"createdAt",           header:"Raised",      cell:({row})=>formatDate(row.getValue("createdAt")) },
]
```

---

### R-05 — PO Detail (Restaurant View)

**File:** `app/(restaurant)/orders/[poId]/page.tsx`  
**Role:** restaurant users

**Purpose:** Full detail of one PO from restaurant perspective. Simplified timeline — no sub-PO, no supplier name, no bid details. Actor on all steps = "Shopro".

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `OrderTimeline` | missing-14 | Rename → `RestaurantPOTimeline`. Horizontal. Steps: Order Placed → Accepted by Shopro → Being Fulfilled → In Transit → Delivered. All actors = "Shopro". NEVER show supplier name. |
| `ContributorsOverviewTable` | original-21 | Rename → `POLineItemsTable`. Columns: Product, Qty, Unit, Unit Price, Line Total. Footer = total. |
| `StatCardGrid` | missing-14 | 3 cards: "Items Ordered", "Total Value", "Required By". `columns={3}`. |
| `NeonButton` | original-21 | "Download PDF" (ghost). "Request Amendment" (default, opens R-06 modal). |
| `Breadcrumb` | missing-14 | `My Orders → PO-{id}` |

**Timeline steps:**
```ts
const restaurantTimeline = (po: PurchaseOrder): TimelineStep[] => [
  { id:"placed",    label:"Order Placed",       status:"done",   timestamp: po.createdAt, actor:"You"   },
  { id:"accepted",  label:"Accepted by Shopro", status: po.acceptedAt ? "done" : po.status==="REJECTED" ? "error" : "pending", timestamp: po.acceptedAt, actor:"Shopro" },
  { id:"fulfilling",label:"Being Fulfilled",    status: ["IN_FULFILLMENT","PARTIALLY_DELIVERED","DELIVERED"].includes(po.status) ? (po.status==="IN_FULFILLMENT"?"active":"done") : "pending", actor:"Shopro" },
  { id:"transit",   label:"In Transit",         status: ["PARTIALLY_DELIVERED","DELIVERED"].includes(po.status) ? "done" : "pending", actor:"Shopro" },
  { id:"delivered", label:"Delivered",          status: po.status==="DELIVERED" ? "done" : "pending" },
]
// No supplier name anywhere in this array
```

---

### R-06 — PO Amendment Request

**File:** Modal component inside `app/(restaurant)/orders/[poId]/page.tsx`  
**Role:** restaurant users

**Purpose:** Restaurant requests changes to an accepted PO. Requires Shopro approval — not auto-applied.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `Modal` | missing-14 | Rename → `AmendPOModal`. Size `lg`. |
| `ShoproNumberField` | original-21 | Per line item — new quantity. |
| `SmartCombobox` | original-21 | Rename → `AddProductSelector`. Async search Shopro catalog. Single-select. Add new items. |
| `NeonButton` | original-21 | "Submit Amendment Request". Variant `solid`. |

**Props:**
```ts
interface AmendPOModalProps {
  open: boolean; onClose: () => void; po: PurchaseOrder
  onSubmitAmendment: (changes: {
    lineItemChanges: { productId: UUID; newQty: number }[]
    newItems: { productId: UUID; qty: number }[]
    reason: string
  }) => Promise<void>
}
```

---

### R-07 — Delivery Confirmation

**File:** `app/(restaurant)/orders/[poId]/confirm/page.tsx`  
**Role:** restaurant users

**Purpose:** Restaurant marks delivery received. Full, partial (note actual quantities), or raise quality dispute. Partial leaves remaining items pending. Full confirmation triggers supplier payout queue in Shopro.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `ChecklistCard` | missing-14 | Rename → `DeliveryConfirmationCard`. Each item = one PO line item. Label: "{Product} — {qty} {unit} expected". `onSubmit`→`onConfirmDelivery`. |
| `ShoproNumberField` | original-21 | Rename → `ReceivedQtyField`. Next to each item for actual received quantity if partial. |
| `Modal` | missing-14 | Rename → `QualityDisputeModal`. Triggered by "Raise Issue". Fields: item, description, evidence upload. |
| `FileUpload` | missing-14 | Rename → `DisputeEvidenceUpload`. Inside modal. `accept="image/*"`. |
| `NeonButton` | original-21 | "Confirm Full Receipt" (violet solid). "Partial Receipt" (default). "Raise Quality Issue" (ghost). |
| `ToastSave` | original-21 | After confirmation. `loading`→`success`. |
| `Breadcrumb` | missing-14 | `My Orders → PO-{id} → Confirm Delivery` |

---

### R-08 — Inventory

**File:** `app/(restaurant)/inventory/page.tsx`  
**Role:** restaurant users

**Purpose:** Current stock levels per item. Set reorder thresholds. Low stock alert cards. Auto-PO rules link to AUTO-R-01.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `BentoGrid` | original-21 | Rename → `LowStockSummary`. Top 3 critically low items. `hasPersistentHover={true}`. |
| `ProductTable` | original-21 | Rename → `InventoryTable`. Columns: Product, Category, Current Stock, Unit, Reorder Threshold, Reorder Qty, Status. |
| `StatusBadge` | original-21 | "In Stock" (green) / "Low Stock" (amber) / "Out of Stock" (rose). |
| `Modal` | missing-14 | Rename → `EditInventoryItemModal`. Edit threshold and reorder qty inline. |
| `ShoproNumberField` | original-21 | Threshold + reorder qty inputs inside modal. |
| `Breadcrumb` | missing-14 | `Home → Inventory` |

---

### R-09 — Payments

**File:** `app/(restaurant)/payments/page.tsx`  
**Role:** restaurant users

**Purpose:** Invoices from Shopro after delivery. Payment history. Outstanding dues. Download GST invoice PDFs.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `StatCardGrid` | missing-14 | 3 cards: "Outstanding Dues", "Paid This Month", "Credit Limit Used". `columns={3}`. |
| `LedgerTable` | missing-14 | Rename → `RestaurantInvoiceLedger`. Columns: Date, Invoice No., PO ID, Amount, Status, Due Date. Remove fee/payout columns — restaurant only sees what they pay Shopro. |
| `StatusBadge` | original-21 | "Paid" (green) / "Pending" (amber) / "Overdue" (rose). |
| `NeonButton` | original-21 | "Pay Now" per row. Variant `solid`. Violet. |
| `Breadcrumb` | missing-14 | `Home → Payments` |

---

### R-10 — Support Tickets

**File:** `app/(restaurant)/support/page.tsx`  
**Role:** restaurant users

**Purpose:** Raise and track support tickets. Linked to specific POs. Async messaging with Shopro support.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `ProductTable` | original-21 | Rename → `TicketListTable`. Columns: Ticket ID, Subject, Linked PO, Status, Raised, Last Updated. |
| `StatusBadge` | original-21 | OPEN / IN_PROGRESS / RESOLVED / CLOSED. |
| `Modal` | missing-14 | Rename → `NewTicketModal`. Fields: subject, description, linked PO (ComboBox), attachment. |
| `DisputeThread` | missing-14 | Rename → `TicketThread`. `currentRole="buyer"`. Shows restaurant ↔ Shopro support exchange. "Resolve" button hidden — only Shopro resolves. |
| `FileUpload` | missing-14 | Rename → `TicketAttachment`. Inside NewTicketModal. `accept="image/*,application/pdf"`. |
| `NeonButton` | original-21 | "New Ticket". Variant `default`. |
| `Breadcrumb` | missing-14 | `Home → Support` |

---

### R-11 — KYC / Verification

**File:** `app/(restaurant)/verification/page.tsx`  
**Role:** restaurant users

**Purpose:** Upload KYC documents for Shopro verification. Track status per document. Overall onboarding status.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `OrderTimeline` | missing-14 | Rename → `VerificationProgressTimeline`. Horizontal. Steps: Registered → Documents Submitted → Under Review → Verified. |
| `ChecklistCard` | missing-14 | Rename → `DocumentSubmissionCard`. One section per doc type. Checked = uploaded. `onSubmit`→`onFinaliseKYC`. |
| `FileUpload` | missing-14 | Rename → `KYCDocumentUpload`. One per doc type. `accept="application/pdf,image/*"`. |
| `StatusBadge` | original-21 | Per-document: PENDING / VERIFIED / EXPIRED / REJECTED. |
| `Breadcrumb` | missing-14 | `Settings → Verification` |

---

### R-12 — Settings

**File:** `app/(restaurant)/settings/page.tsx`  
**Role:** restaurant users (Manager role)

**Purpose:** Profile management, delivery addresses, internal staff management (Manager/Staff roles), notification preferences.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `MD3Switch` | original-21 | Email / SMS / In-App notification toggles per event type. `showIcons={true}`. |
| `TooltipIconButton` | original-21 | Info icon per toggle. `side="right"`. |
| `ProductTable` | original-21 | Rename → `RestaurantUsersTable`. Columns: Name, Email, Role, Last Login, Active. |
| `Modal` | missing-14 | Rename → `InviteStaffModal`. Add restaurant user. |
| `MD3Switch` | original-21 | Active/inactive per staff row. |
| `NeonButton` | original-21 | "Save Preferences". Variant `solid`. |
| `ToastSave` | original-21 | After save. |
| `Breadcrumb` | missing-14 | `Home → Settings` |

---

## AUTO-PO SYSTEM — Restaurant side

---

### AUTO-R-01 — Reorder Rules

**File:** `app/(restaurant)/auto-po/rules/page.tsx`  
**Role:** restaurant users (Manager)

**Purpose:** Configure per-item reorder thresholds. When stock falls below threshold, Auto-PO fires. Set cooldown, optional substitute product.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `ProductTable` | original-21 | Rename → `ReorderRulesTable`. Columns: Product, Threshold, Reorder Qty, Unit, Substitute, Cooldown (hrs), Last Triggered, Active. |
| `MD3Switch` | original-21 | Active toggle per rule row. |
| `Modal` | missing-14 | Rename → `EditReorderRuleModal`. |
| `SmartCombobox` | original-21 | Rename → `ProductSelector`. Async search Shopro catalog. For primary and substitute product. |
| `ShoproNumberField` | original-21 | Threshold, reorder qty, cooldown hours inputs. |
| `NeonButton` | original-21 | "+ Add Rule". Variant `default`. |
| `Breadcrumb` | missing-14 | `Auto-PO → Reorder Rules` |

**Rule interface:**
```ts
interface ReorderRuleFormData {
  productId: UUID; reorderThreshold: number; reorderQuantity: number; unit: string
  substituteProductId?: UUID; cooldownHours: number; isActive: boolean
}
```

---

### AUTO-R-02 — Recurring Order Schedules

**File:** `app/(restaurant)/auto-po/schedules/page.tsx`  
**Role:** restaurant users (Manager)

**Purpose:** Create named recurring order templates that fire on a schedule. `trigger_type = SCHEDULED` in auto_po_requests.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `BentoGrid` | original-21 | Rename → `ScheduleCards`. Each card = one schedule. `title`=name, `meta`=next trigger, `description`=items summary, `status`=Active/Paused. |
| `Wizard` | missing-14 | Rename → `NewScheduleWizard`. 3 steps: Items → Schedule (frequency) → Review. |
| `SmartCombobox` | original-21 | Rename → `ScheduleProductSelector`. Multi-select. Step 1. |
| `SmartCombobox` | original-21 | Rename → `FrequencySelector`. Single-select: Daily / Weekly / Fortnightly / Monthly / Custom. Step 2. |
| `ShoproDatePicker` | original-21 | Rename → `ScheduleStartDate`. Step 2. |
| `MD3Switch` | original-21 | Active/pause toggle per card. |
| `Modal` | missing-14 | Rename → `DeleteScheduleModal`. Destructive confirmation. |
| `Breadcrumb` | missing-14 | `Auto-PO → Schedules` |

---

### AUTO-R-03 — Auto-PO Activity Log (Restaurant)

**File:** `app/(restaurant)/auto-po/activity/page.tsx`  
**Role:** restaurant users

**Purpose:** Restaurant sees all auto-created POs — successful, skipped, failed. Explains why. Links to resulting PO. Substitutions flagged.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `ProductTable` | original-21 | Rename → `AutoPOActivityTable`. Columns: Date, Trigger Type, Items, Status, Result (link or skip reason). |
| `StatusBadge` | original-21 | PO_CREATED (green) / PO_SKIPPED (amber) / FAILED (rose) / REQUIRES_REVIEW (blue) / PENDING (slate). |
| `Modal` | missing-14 | Rename → `AutoPODetailModal`. Full line items, trigger source, error detail. |
| `Breadcrumb` | missing-14 | `Auto-PO → Activity Log` |

---

## SHOPRO OPERATOR PORTAL

---

### OP-01 — Operator Dashboard (Role-Adaptive)

**File:** `app/(operator)/dashboard/page.tsx`  
**Role:** all Shopro roles — content differs per role

**Purpose:** Each of the 7 roles sees a tailored dashboard. KPI cards, action panel, and shortcut cards are all role-specific.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `StatCardGrid` | missing-14 | Rename → `OperatorKPICards`. `columns={4}`. Cards from role config below. |
| `BentoGrid` | original-21 | Rename → `QuickActionCards`. 3–4 shortcut cards for the role's most-used screens. `hasPersistentHover={true}`. |
| `ProjectDashboard` | original-21 | Rename → `OperatorActivityPanel`. OPS_MANAGER→incoming POs. FINANCE→payout queue items. PROCUREMENT→open bids. SUPPORT→open tickets. Hidden for AUDITOR. |
| `NotificationDrawer` | missing-14 | Rename → `OperatorNotificationDrawer`. Filter notifications by role relevance. |

**Role → KPI cards:**
```ts
const ROLE_KPIS: Record<ShoproRole, StatCard[]> = {
  SUPER_ADMIN:          [{ label:"GMV (MTD)",            color:"violet" }, { label:"Restaurants",          color:"blue"   }, { label:"Suppliers",            color:"teal"   }, { label:"Payout Velocity (₹/d)",color:"green"  }],
  OPS_MANAGER:          [{ label:"New POs",              color:"amber"  }, { label:"Awaiting Split",       color:"rose"   }, { label:"Active Bids",          color:"blue"   }, { label:"Deliveries Today",     color:"green"  }],
  PROCUREMENT_OFFICER:  [{ label:"Open Bid Events",      color:"blue"   }, { label:"Quotes Received",      color:"violet" }, { label:"Pending Awards",       color:"amber"  }, { label:"Direct Assigns Today", color:"green"  }],
  FINANCE_OFFICER:      [{ label:"Payout Queue",         color:"amber"  }, { label:"Disbursed Today (₹)",  color:"green"  }, { label:"Awaiting Approval",    color:"rose"   }, { label:"Failed Transfers",     color:"red"    }],
  SUPPLIER_RELATIONS:   [{ label:"Pending Applications", color:"amber"  }, { label:"Under Review",         color:"blue"   }, { label:"Expiring Docs (7d)",   color:"rose"   }, { label:"Approved This Month",  color:"green"  }],
  SUPPORT_AGENT:        [{ label:"Open Tickets",         color:"amber"  }, { label:"Avg Response Time",    color:"blue"   }, { label:"Escalated",            color:"rose"   }, { label:"Resolved Today",       color:"green"  }],
  AUDITOR:              [{ label:"Transactions (MTD)",   color:"blue"   }, { label:"Flagged Entries",      color:"rose"   }, { label:"Audit Entries Today",  color:"violet" }, { label:"Pending Review",       color:"amber"  }],
}
```

---

### OP-02 — Restaurant Management

**File:** `app/(operator)/restaurants/page.tsx`  
**Role:** `SUPER_ADMIN`, `OPS_MANAGER`, `SUPPORT_AGENT`

**Purpose:** List all restaurants. View PO history, payment behaviour, outstanding dues. Assign account managers. Set credit limits. Activate/deactivate.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `ProductTable` | original-21 | Rename → `RestaurantManagementTable`. Columns: Business Name, GST, City, Onboarding Status, Credit Limit, Outstanding (₹), Account Manager, Joined. |
| `StatusBadge` | original-21 | APPROVED / PENDING / CONDITIONAL / SUSPENDED. |
| `Modal` | missing-14 | Rename → `EditRestaurantModal`. Edit credit limit, account manager, status. |
| `SmartCombobox` | original-21 | Rename → `AccountManagerPicker`. Async search — filter to OPS_MANAGER role. Inside modal. |
| `ShoproNumberField` | original-21 | Rename → `CreditLimitInput`. Inside modal. |
| `MD3Switch` | original-21 | Active/suspend toggle inside modal. `haptic="heavy"`. `variant="destructive"` for suspend. |
| `BulkActionBar` | missing-14 | "Deactivate Selected", "Export CSV". |
| `Breadcrumb` | missing-14 | `Operator → Restaurants` |

---

### OP-03 — PO Inbox

**File:** `app/(operator)/po/inbox/page.tsx`  
**Role:** `SUPER_ADMIN`, `OPS_MANAGER`, `PROCUREMENT_OFFICER`, `SUPPORT_AGENT`, `AUDITOR`

**Purpose:** All incoming POs from all restaurants. Default sort: urgency (soonest delivery deadline). New POs highlighted. Filter by status and restaurant.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `BentoGrid` | original-21 | Rename → `UrgentPOCards`. Top 3 most urgent POs. `hasPersistentHover={true}`. |
| `ProductTable` | original-21 | Rename → `POInboxTable`. Columns: PO ID, Restaurant, Items, Value (₹), Status, Required Delivery, Source (MANUAL/AUTO), Urgency, Raised At. |
| `StatusBadge` | original-21 | RAISED=blue, ACCEPTED=green, REJECTED=rose, SPLITTING=violet, IN_FULFILLMENT=teal, CLARIFICATION_REQUESTED=amber. |
| `SmartCombobox` | original-21 | Rename → `RestaurantPOFilter`. Async search. Multi-select. |
| `SmartCombobox` | original-21 | Rename → `POStatusFilterOp`. Multi-select. |
| `Breadcrumb` | missing-14 | `Operator → PO Inbox` |

---

### OP-04 — PO Review & Accept / Reject

**File:** `app/(operator)/po/[poId]/page.tsx`  
**Role:** `SUPER_ADMIN`, `OPS_MANAGER`, `PROCUREMENT_OFFICER`

**Purpose:** Review single incoming PO. Accept (→ splitting), reject (with reason), or request clarification (sends message to restaurant, PO put on hold).

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `ContributorsOverviewTable` | original-21 | Rename → `POLineItemsReviewTable`. Columns: Product, Category, Qty, Unit, Estimated Price, Line Total. Footer = total. |
| `StatCardGrid` | missing-14 | 4 cards: "Total Items", "PO Value", "Delivery Deadline", "Days Until Deadline". |
| `Modal` | missing-14 | Rename → `RejectPOModal`. Required reason text. "Restaurant will be notified." |
| `Modal` | missing-14 | Rename → `ClarificationModal`. Message compose. "Send to Restaurant and Hold PO". |
| `DisputeThread` | missing-14 | Rename → `POClarificationThread`. If status=CLARIFICATION_REQUESTED — shows message exchange with restaurant. `currentRole="platform"`. |
| `NeonButton` | original-21 | "Accept & Proceed to Split" (violet solid). "Request Clarification" (default). "Reject PO" (ghost). |
| `ToastSave` | original-21 | After each action. |
| `Breadcrumb` | missing-14 | `PO Inbox → PO-{id}` |

---

### OP-05 — PO Splitting Workspace

**File:** `app/(operator)/po/[poId]/split/page.tsx`  
**Role:** `SUPER_ADMIN`, `OPS_MANAGER`, `PROCUREMENT_OFFICER`

**Purpose:** Core operator workflow. Split parent PO line items into groups. Each group assigned as DIRECT (pick supplier now → sub-PO created immediately) or BID (send to bidding engine → awaits quotes). Groups can be mixed. Emergency override allows direct assign with mandatory audit note.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `ProjectDashboard` | original-21 | Rename → `SplitGroupsPanel`. Repurpose: each "project card" = one line-item group. Card shows: items in group, assignment mode, selected supplier or bid status. Drag to regroup items. Remove messages panel. |
| `MD3Switch` | original-21 | Rename → `AssignmentModeToggle`. Per group. `checkedIcon=<LinkIcon>` (DIRECT) `uncheckedIcon=<GavelIcon>` (BID). `showIcons={true}`. `haptic="light"`. |
| `SmartCombobox` | original-21 | Rename → `DirectSupplierSelector`. Async search verified suppliers filtered by category. `renderOption`→show supplier name + rating + on-time rate. Used per group when mode=DIRECT. |
| `StarRating` | missing-14 | Inside supplier dropdown option. `interactive={false}` `size="sm"`. |
| `NeonButton` | original-21 | "Launch Bid for Group" (mode=BID). Opens OP-07. Variant `default`. |
| `NeonButton` | original-21 | "Create All Sub-POs" (when all groups resolved). Variant `solid`. Violet. |
| `Modal` | missing-14 | Rename → `EmergencyOverrideModal`. Supplier selection + mandatory written reason. Logs to audit. |
| `ChecklistCard` | missing-14 | Rename → `SplitReadinessChecklist`. Pre-submit checklist: all groups assigned, suppliers verified, dates feasible. `onSubmit`→`onCreateAllSubPOs`. |
| `ToastSave` | original-21 | Draft split auto-save. |
| `Breadcrumb` | missing-14 | `PO Inbox → PO-{id} → Split` |

**Group data shape:**
```ts
interface POSplitGroup {
  id: string
  lineItems: OrderLineItem[]
  assignmentMode: AssignmentMode
  selectedSupplierId?: UUID
  bidEventId?: UUID
  status: "PENDING" | "READY" | "BID_LAUNCHED" | "SUB_PO_CREATED"
  emergencyOverride?: { reason: string; overriddenByUserId: UUID }
}
// POST /shopro/po/{poId}/split  →  { groups: POSplitGroup[] }
// DIRECT groups → sub-POs created immediately
// BID groups → BidEvent records created
```

---

### OP-06 — Sub-PO Management

**File:** `app/(operator)/po/[poId]/sub-pos/page.tsx`  
**Role:** `SUPER_ADMIN`, `OPS_MANAGER`, `PROCUREMENT_OFFICER`

**Purpose:** All sub-POs under one parent PO. Track each supplier's fulfillment. Parent PO status derived from aggregate sub-PO statuses.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `OrderTimeline` | missing-14 | Rename → `ParentPOProgress`. Horizontal. Aggregate status of parent PO derived from sub-POs. |
| `ProductTable` | original-21 | Rename → `SubPOTable`. Columns: Sub-PO ID, Supplier (real name — operator sees all), Items, Value, Status, Mode (DIRECT/BID), Delivery By, Proof Uploaded. |
| `StatusBadge` | original-21 | SubPOStatus colours. |
| `Modal` | missing-14 | Rename → `SubPODetailModal`. Full sub-PO: line items, supplier, delivery proof, confirmed quantities. |
| `BulkActionBar` | missing-14 | "Flag as Delayed", "Export". |
| `Breadcrumb` | missing-14 | `PO-{id} → Sub-POs` |

---

### OP-07 — Bid Event Creation

**File:** `app/(operator)/bids/new/page.tsx`  
**Role:** `SUPER_ADMIN`, `OPS_MANAGER`, `PROCUREMENT_OFFICER`

**Purpose:** Create an RFQ event. Configure line items, delivery requirements, bid deadline, blind vs open bidding, invite specific suppliers or broadcast.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `Wizard` | missing-14 | Rename → `BidEventWizard`. 3 steps: Items & Specs → Bid Settings → Invite Suppliers. `onComplete`→`onLaunchBid`. |
| `SmartCombobox` | original-21 | Rename → `BidProductSelector`. Multi-select with qty. Step 1. |
| `ShoproNumberField` | original-21 | Qty, min order inputs per product. Step 1. |
| `ShoproDatePicker` | original-21 | Rename → `BidDeadlinePicker`. Step 2. |
| `MD3Switch` | original-21 | "Blind Bidding" toggle (default on). "Allow Revision" toggle. Step 2. `showIcons={true}`. |
| `ShoproNumberField` | original-21 | Rename → `BidTimerHours`. Min 2h, max 168h, emergency 0.5h. Step 2. |
| `SmartCombobox` | original-21 | Rename → `SupplierInviteSelector`. Multi-select verified suppliers by category. OR broadcast toggle. Step 3. |
| `NeonButton` | original-21 | "Launch Bid Event". Variant `solid`. Violet. |
| `Breadcrumb` | missing-14 | `Bid Engine → New Event` |

---

### OP-08 — Bid Evaluation & Award

**File:** `app/(operator)/bids/[bidId]/page.tsx`  
**Role:** `SUPER_ADMIN`, `OPS_MANAGER`, `PROCUREMENT_OFFICER`

**Purpose:** Side-by-side comparison of all supplier quotes. Auto-ranked. Manual award, counter-offer, or auto-award. Multi-award option for qty split.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `BidComparisonCard` | missing-14 | Rename → `SupplierQuoteCards`. Operator sees real supplier names (no masking). `onSelect`→`onAwardBid`. |
| `StarRating` | missing-14 | Embedded per quote card. Supplier's historical rating. `interactive={false}`. |
| `StatCardGrid` | missing-14 | 3 cards: "Quotes Received", "Bid Closes In", "Lowest Quote (₹)". |
| `OrderTimeline` | missing-14 | Rename → `BidLifecycleTimeline`. Horizontal. Steps: Created → Invitations Sent → Quotes Received → Evaluated → Awarded. |
| `Modal` | missing-14 | Rename → `AwardConfirmModal`. Single or multi-award. Notes dual approval requirement if above threshold. |
| `Modal` | missing-14 | Rename → `CounterOfferModal`. Send counter price to supplier. |
| `NeonButton` | original-21 | "Manual Award" (violet). "Auto-Award" (default). "Counter Offer" (ghost). |
| `Breadcrumb` | missing-14 | `Bid Engine → Bid-{id}` |

---

### OP-09 — Supplier Vetting Queue

**File:** `app/(operator)/suppliers/vetting/page.tsx`  
**Role:** `SUPER_ADMIN`, `SUPPLIER_RELATIONS`

**Purpose:** All supplier applications pending review. Sort by submission date. Click → OP-10.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `StatCardGrid` | missing-14 | 3 cards: "Pending Review", "Under Review", "Approved This Month". |
| `ProductTable` | original-21 | Rename → `VettingQueueTable`. Columns: Business Name, Contact, Categories, Docs Submitted, Applied, Status. |
| `StatusBadge` | original-21 | PENDING (amber) / UNDER_REVIEW (blue) / CONDITIONAL (violet) / APPROVED (green) / REJECTED (rose). |
| `BulkActionBar` | missing-14 | "Move to Under Review". |
| `Breadcrumb` | missing-14 | `Suppliers → Vetting Queue` |

---

### OP-10 — Supplier Detail & Approval

**File:** `app/(operator)/suppliers/[supplierId]/page.tsx`  
**Role:** `SUPER_ADMIN`, `SUPPLIER_RELATIONS`

**Purpose:** Full supplier profile. Review each document. Check penny drop status. Approve, conditional approve, or reject.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `OrderTimeline` | missing-14 | Rename → `SupplierVettingTimeline`. Steps: Registered → Documents Submitted → Under Review → Decision. |
| `ChecklistCard` | missing-14 | Rename → `DocumentReviewChecklist`. Sections: Required Docs, Optional Certs. Checked = Shopro-verified. |
| `StatCardGrid` | missing-14 | 3 cards: "Documents Submitted", "Bank Verified", "Categories Applied". |
| `Modal` | missing-14 | Rename → `ApprovalDecisionModal`. Three actions: Approve / Conditional (missing docs + deadline) / Reject (reason). |
| `Modal` | missing-14 | Rename → `PennyDropModal`. Shows masked account, IFSC, penny drop status. "Trigger Penny Drop" button. |
| `NeonButton` | original-21 | "Approve" (violet). "Conditional" (default). "Reject" (ghost). |
| `Breadcrumb` | missing-14 | `Vetting Queue → {supplierName}` |

---

### OP-11 — Supplier Directory

**File:** `app/(operator)/suppliers/page.tsx`  
**Role:** `SUPER_ADMIN`, `OPS_MANAGER`, `PROCUREMENT_OFFICER`, `SUPPLIER_RELATIONS`

**Purpose:** All approved suppliers. Performance metrics. Manage categories. Suspend/blacklist.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `ProductTable` | original-21 | Rename → `SupplierDirectoryTable`. Columns: Business Name, Categories, Rating, On-Time %, Bid Win Rate, Total Orders, Status. |
| `StarRating` | missing-14 | Inline in rating column. `interactive={false}` `size="sm"`. |
| `StatusBadge` | original-21 | APPROVED / SUSPENDED / CONDITIONAL. |
| `SmartCombobox` | original-21 | Rename → `SupplierCategoryFilter`. Multi-select. |
| `Modal` | missing-14 | Rename → `SuspendSupplierModal`. Reason required. Blacklist checkbox (Super Admin only). |
| `BulkActionBar` | missing-14 | "Assign Category", "Export". |
| `Breadcrumb` | missing-14 | `Operator → Suppliers` |

---

### OP-12 — Payout Queue

**File:** `app/(operator)/finance/payout-queue/page.tsx`  
**Role:** `SUPER_ADMIN`, `FINANCE_OFFICER`

**Purpose:** All confirmed sub-POs where supplier payment is pending. Delivery confirmed by restaurant is prerequisite. Finance Officer reviews, initiates, or holds.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `StatCardGrid` | missing-14 | 4 cards: "In Queue", "Total Queue Value (₹)", "Requires Dual Approval", "On Hold". |
| `LedgerTable` | missing-14 | Rename → `PayoutQueueLedger`. Columns: Confirmed Date, Sub-PO ID, Supplier, Restaurant (Finance sees real name), Agreed Amount, Deductions, Net Payout, Status, Dual Approval. |
| `StatusBadge` | original-21 | IN_QUEUE (blue) / INITIATED (amber) / APPROVED (violet) / PAID (green) / HELD (rose) / FAILED (red). |
| `BulkActionBar` | missing-14 | "Initiate Selected" (violet), "Hold Selected" (amber), "Export". |
| `Breadcrumb` | missing-14 | `Finance → Payout Queue` |

---

### OP-13 — Payout Detail & Approval

**File:** `app/(operator)/finance/payout/[payoutId]/page.tsx`  
**Role:** `SUPER_ADMIN`, `FINANCE_OFFICER`

**Purpose:** Single payout detail. Agreed amount, deductions, net payout. Finance initiates. Dual approval above configured threshold.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `ContributorsOverviewTable` | original-21 | Rename → `PayoutLineItemsTable`. Rows = sub-PO line items with confirmed quantities. Footer: Agreed / Deductions / Net Payout. |
| `StatCardGrid` | missing-14 | 3 cards: "Agreed Amount", "Deductions", "Net Payout". |
| `ChecklistCard` | missing-14 | Rename → `PayoutApprovalChecklist`. Items: delivery confirmed, deductions documented, payment details verified. `onSubmit`→`onInitiatePayout`. |
| `Modal` | missing-14 | Rename → `DeductionModal`. Document deduction reason + amount. Supplier notified. |
| `Modal` | missing-14 | Rename → `DualApprovalModal`. Second approver confirms above-threshold payouts. |
| `NeonButton` | original-21 | "Initiate Payout" (violet). "Add Deduction" (default). "Hold" (ghost). |
| `ToastSave` | original-21 | After initiation. `loading`→`success`. |
| `Breadcrumb` | missing-14 | `Payout Queue → Payout-{id}` |

---

### OP-14 — Payment Ledger

**File:** `app/(operator)/finance/ledger/page.tsx`  
**Role:** `SUPER_ADMIN`, `FINANCE_OFFICER`, `AUDITOR`

**Purpose:** Full transaction history all suppliers. Filter by supplier, date range, status. Export CSV/PDF.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `StatCardGrid` | missing-14 | 4 cards: "Total Disbursed", "Total Deductions", "Platform Fees", "Failed". |
| `LedgerTable` | missing-14 | Rename → `FullPaymentLedger`. All columns: Date, Supplier, Sub-PO ID, Restaurant, Agreed, Deductions, Net Payout, Fee, Status, Bank Ref. |
| `SmartCombobox` | original-21 | Rename → `LedgerSupplierFilter`. Async. Multi-select. |
| `ShoproDatePicker` | original-21 | Two pickers: from / to date range. |
| `BulkActionBar` | missing-14 | "Export CSV", "Export PDF". |
| `Breadcrumb` | missing-14 | `Finance → Payment Ledger` |

---

### OP-15 — Revenue Dashboard

**File:** `app/(operator)/finance/revenue/page.tsx`  
**Role:** `SUPER_ADMIN`, `FINANCE_OFFICER`

**Purpose:** Shopro's revenue tracking. Markup collected vs supplier payouts. Gross margin per PO, category, supplier, restaurant.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `StatCardGrid` | missing-14 | 4 cards: "Gross Revenue (MTD)", "Total Payouts (MTD)", "Gross Margin (₹)", "Margin %". |
| `LedgerTable` | missing-14 | Rename → `RevenueLedger`. Columns: Date, PO ID, Restaurant, Category, Restaurant Invoice, Supplier Payout, Shopro Margin. |
| `SmartCombobox` | original-21 | Rename → `RevenueSegmentFilter`. Filter by category, restaurant, or supplier. |
| `Breadcrumb` | missing-14 | `Finance → Revenue` |

---

### OP-16 — Delivery & Logistics Tracking

**File:** `app/(operator)/deliveries/page.tsx`  
**Role:** `SUPER_ADMIN`, `OPS_MANAGER`

**Purpose:** All active deliveries. Expected vs actual delivery time. Flag delayed. Trigger supplier escalation.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `BentoGrid` | original-21 | Rename → `DelayedDeliveryAlerts`. Top delayed sub-POs. `hasPersistentHover={true}`. |
| `ProductTable` | original-21 | Rename → `ActiveDeliveriesTable`. Columns: Sub-PO ID, Supplier, Restaurant, Items, Dispatched At, Expected By, Status, Delay Flag. |
| `StatusBadge` | original-21 | ON_TRACK (green) / AT_RISK (amber) / DELAYED (rose) / DELIVERED (slate). |
| `Modal` | missing-14 | Rename → `EscalateSupplierModal`. Urgency level, message, expected response time. |
| `Breadcrumb` | missing-14 | `Operator → Deliveries` |

---

### OP-17 — Product Catalog Management

**File:** `app/(operator)/catalog/page.tsx`  
**Role:** `SUPER_ADMIN`, `OPS_MANAGER`

**Purpose:** Shopro manages the master catalog that restaurants browse. Add, edit, remove products. Set pricing, seasonal flags, availability.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `ProductTable` | original-21 | Rename → `CatalogManagementTable`. Columns: Product Name, Category, Unit, Base Price, Available, Seasonal, Tags, Updated. |
| `MD3Switch` | original-21 | Available toggle per row. Seasonal toggle per row. |
| `Modal` | missing-14 | Rename → `AddEditProductModal`. Fields: name, category, unit, price, description, tags, seasonal. |
| `SmartCombobox` | original-21 | Rename → `ProductCategorySelector`. Inside modal. |
| `ShoproNumberField` | original-21 | Base price input inside modal. |
| `FileUpload` | missing-14 | Rename → `ProductImageUpload`. `accept="image/*"`. Single file. Inside modal. |
| `NeonButton` | original-21 | "+ Add Product". Variant `default`. |
| `BulkActionBar` | missing-14 | "Mark Unavailable", "Mark Seasonal", "Remove". |
| `Breadcrumb` | missing-14 | `Operator → Catalog` |

---

### OP-18 — Reports & Analytics

**File:** `app/(operator)/reports/page.tsx`  
**Role:** `SUPER_ADMIN`, `OPS_MANAGER`, `FINANCE_OFFICER`, `AUDITOR`

**Purpose:** Configurable reports: PO analytics, supplier performance, financial summaries, SLA adherence. Export PDF or Excel. Schedule email delivery.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `SmartCombobox` | original-21 | Rename → `ReportTypeSelector`. Single-select: PO Analytics / Supplier Performance / Financial Summary / SLA Report. |
| `ShoproDatePicker` | original-21 | Two pickers: from / to. |
| `SmartCombobox` | original-21 | Rename → `ReportSegmentFilter`. Multi-select. Content varies by report type. |
| `StatCardGrid` | missing-14 | 4 summary KPI cards rendered after report loads. |
| `LedgerTable` | missing-14 | Rename → `ReportDataTable`. Columns vary by report type. |
| `Modal` | missing-14 | Rename → `ScheduleReportModal`. Recipient email, frequency. |
| `BulkActionBar` | missing-14 | "Export PDF", "Export Excel", "Schedule Email". |
| `Breadcrumb` | missing-14 | `Operator → Reports` |

---

### OP-19 — System Configuration

**File:** `app/(operator)/config/page.tsx`  
**Role:** `SUPER_ADMIN` only

**Purpose:** Platform-wide settings. Payout thresholds, bid timer defaults, auto-award rules, GST rates, payment gateway, notification templates.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `ShoproNumberField` | original-21 | Multiple: Payout dual-approval threshold (₹), default bid timer (hours), auto-award price tolerance (%), auto-confirm fallback (hours, default 72). |
| `SmartCombobox` | original-21 | Rename → `AutoAwardRuleSelector`. Single-select: Lowest Price / Best Weighted Score / Preferred Supplier Priority. |
| `MD3Switch` | original-21 | Feature flags: Auto-award enabled / Blind bidding default / Auto-confirm delivery fallback / Require restaurant MFA. |
| `TooltipIconButton` | original-21 | Info icon per setting. `side="right"`. |
| `NeonButton` | original-21 | "Save Configuration". Variant `solid`. Violet. |
| `ToastSave` | original-21 | After save. Spring animation. |
| `Breadcrumb` | missing-14 | `Operator → Configuration` |

---

### OP-20 — Audit Log Viewer

**File:** `app/(operator)/audit/page.tsx`  
**Role:** `SUPER_ADMIN`, `AUDITOR`

**Purpose:** Immutable audit trail. Every state-changing action. Read-only. Filter by actor, role, entity type, action, date. Retained 7 years.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `ProductTable` | original-21 | Rename → `AuditLogTable`. Read-only — no row actions. Columns: Timestamp, Actor, Role, Portal, Action, Entity Type, Entity ID (truncated), IP Hash. |
| `StatusBadge` | original-21 | Portal badge: OPERATOR (violet) / RESTAURANT (blue) / SUPPLIER (teal). |
| `SmartCombobox` | original-21 | Filters: Actor (async), Role (multi), Entity Type (multi), Action (multi). |
| `ShoproDatePicker` | original-21 | Date range from/to. |
| `Modal` | missing-14 | Rename → `AuditEntryDetailModal`. Full before/after JSON state. Read-only. |
| `BulkActionBar` | missing-14 | "Export Audit Report" only. |
| `Breadcrumb` | missing-14 | `Operator → Audit Log` |

---

### OP-21 — Shopro User Management

**File:** `app/(operator)/users/page.tsx`  
**Role:** `SUPER_ADMIN` only

**Purpose:** Create, edit, deactivate Shopro internal users. Assign roles. View MFA status. Force password reset or MFA re-enrollment. Manage sessions.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `ProductTable` | original-21 | Rename → `ShoproUserTable`. Columns: Name, Email, Role, Department, MFA Enabled, Last Login, Active Sessions, Status. |
| `StatusBadge` | original-21 | Active (green) / Inactive (slate) / MFA Not Enrolled (rose). |
| `Modal` | missing-14 | Rename → `InviteUserModal`. Email, name, role, department. Sends magic link. |
| `SmartCombobox` | original-21 | Rename → `RoleAssignmentSelector`. Single-select. All 7 ShoproRole values. |
| `Modal` | missing-14 | Rename → `EditUserModal`. Change role, force password reset, revoke sessions, deactivate. |
| `MD3Switch` | original-21 | Active/inactive toggle in edit modal. `haptic="heavy"`. |
| `NeonButton` | original-21 | "Force MFA Re-enrollment" (ghost). "Revoke All Sessions" (ghost, destructive intent). Inside modal. |
| `BulkActionBar` | missing-14 | "Deactivate Selected", "Force Password Reset". |
| `Breadcrumb` | missing-14 | `Operator → Users` |

---

## AUTO-PO SYSTEM — Operator side

---

### AUTO-OP-01 — Auto-PO Admin View

**File:** `app/(operator)/auto-po/page.tsx`  
**Role:** `SUPER_ADMIN`, `OPS_MANAGER`

**Purpose:** Full visibility into all auto_po_requests across all restaurants. Debug failures, manually retry, monitor worker health.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `StatCardGrid` | missing-14 | 4 cards: "Created Today", "Failed (Attention Required)", "Skipped Today", "Pending Processing". |
| `ProductTable` | original-21 | Rename → `AutoPORequestTable`. Columns: Timestamp, Restaurant, Trigger Type, Items Count, Status, Retry Count, Result, Next Retry. |
| `StatusBadge` | original-21 | PENDING (slate) / EVENT_PUBLISHED (blue) / PO_CREATED (green) / PO_SKIPPED (amber) / FAILED (rose) / REQUIRES_REVIEW (violet). |
| `SmartCombobox` | original-21 | Filters: Restaurant (async), Trigger Type (multi-select), Status (multi-select). |
| `Modal` | missing-14 | Rename → `AutoPORequestDetailModal`. Full line items, error detail, retry history. |
| `NeonButton` | original-21 | "Manual Retry" per failed row. Variant `ghost`. |
| `Breadcrumb` | missing-14 | `Operator → Auto-PO Monitor` |

---

## SUPPLIER PORTAL

---

### S-02 — Verification Status

**File:** `app/(supplier)/verification/page.tsx`  
**Role:** supplier users (pre-approval)

**Purpose:** After registration, supplier tracks vetting progress. Upload replacements for rejected docs.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `OrderTimeline` | missing-14 | Rename → `VettingProgressTimeline`. Horizontal. Steps: Registered → Docs Submitted → Under Review → Decision. |
| `ChecklistCard` | missing-14 | Rename → `DocumentStatusCard`. One section per doc type. Checked = Shopro-verified. Submit button hidden (read-only except upload). |
| `FileUpload` | missing-14 | Rename → `ReplacementDocUpload`. Shown per rejected document. |
| `StatusBadge` | original-21 | Per-document: PENDING / VERIFIED / REJECTED / EXPIRED. |
| `BentoGrid` | original-21 | Rename → `VettingStatusSummary`. 2–3 cards: Documents Verified, Pending, Overall Status. |
| `Breadcrumb` | missing-14 | `Dashboard → Verification` |

---

### S-03 — Supplier Dashboard

**File:** `app/(supplier)/dashboard/page.tsx`  
**Role:** approved supplier users

**Purpose:** Active sub-POs (customer ALWAYS "Shopro"), pending bids, upcoming deliveries, recent payments.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `StatCardGrid` | missing-14 | Rename → `SupplierKPICards`. 4 cards: "Active Orders", "Pending Bids", "Payable Balance (₹)", "Avg Rating". |
| `StarRating` | missing-14 | In KPI area. `interactive={false}` `size="lg"`. |
| `ProjectDashboard` | original-21 | Rename → `SupplierOrderFeed`. Map `SubPurchaseOrder[]` → `Project[]`. `subtitle` = **always "Shopro"** — NEVER restaurant name. |
| `BentoGrid` | original-21 | Rename → `PendingBidAlerts`. Open bid invitations as cards. `cta`="Submit Quote →". |

**Privacy-critical mapping:**
```ts
const subPOAsProject = (spo: SubPurchaseOrder): Project => ({
  id:          spo.id,
  name:        `SPO-${spo.id.slice(0,8).toUpperCase()}`,
  subtitle:    "Shopro",    // ← CRITICAL: NEVER spo.restaurantName or any buyer info
  date:        spo.createdAt,
  progress:    subPOProgress(spo.status),
  status:      mapSubPOStatus(spo.status),
  accentColor: "#14b8a6",
})
```

---

### S-04 — Bid Invitations Inbox

**File:** `app/(supplier)/bids/page.tsx`  
**Role:** approved supplier users

**Purpose:** Open RFQ invitations from Shopro. Items, specs, delivery requirements, bid deadline. Submit quote or decline.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `BentoGrid` | original-21 | Rename → `BidInvitationGrid`. Each card = one RFQ. `title`="Bid Request", `meta`=deadline, `description`=items summary, `status`=time remaining. `cta`="Submit Quote →". |
| `StatusBadge` | original-21 | OPEN (green) / CLOSED (slate). |
| `Modal` | missing-14 | Rename → `BidInvitationDetailModal`. Full RFQ items + specs + delivery terms. "Proceed to Quote" / "Decline". |
| `Breadcrumb` | missing-14 | `Dashboard → Bid Invitations` |

---

### S-05 — Quote Submission

**File:** `app/(supplier)/bids/[bidId]/quote/page.tsx`  
**Role:** approved supplier users

**Purpose:** Submit price quote per bid item. Price, available qty, proposed delivery date. Can revise before deadline if allowed.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `ContributorsOverviewTable` | original-21 | Rename → `QuoteLineItemsTable`. Rows = bid items. Columns: Product, Specs, Required Qty, Your Unit Price, Your Available Qty, Your Delivery Date. |
| `ShoproNumberField` | original-21 | Rename → `QuotePriceField`. Per row. |
| `ShoproNumberField` | original-21 | Rename → `QuoteQtyField`. Per row. |
| `ShoproDatePicker` | original-21 | Rename → `QuoteDeliveryDate`. Per row. |
| `Modal` | missing-14 | Rename → `SubmitQuoteConfirmModal`. Total quote value summary. "Confirm blind submission" warning. |
| `NeonButton` | original-21 | "Submit Quote". Variant `solid`. Violet. |
| `ToastSave` | original-21 | Draft auto-save. |
| `Breadcrumb` | missing-14 | `Bid Invitations → Bid-{id} → Submit Quote` |

---

### S-06 — Bid History

**File:** `app/(supplier)/bids/history/page.tsx`  
**Role:** approved supplier users

**Purpose:** All past bid events — won and lost. Win rate. No restaurant/buyer identity shown.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `StatCardGrid` | missing-14 | 3 cards: "Bids Submitted", "Bids Won", "Win Rate %". `columns={3}`. |
| `ProductTable` | original-21 | Rename → `BidHistoryTable`. Columns: Bid ID, Items, Quote Value, Submitted At, Result (WON/LOST). |
| `StatusBadge` | original-21 | WON (green) / LOST (slate) / PENDING (amber). |
| `Breadcrumb` | missing-14 | `Bids → History` |

---

### S-07 — Sub-PO List

**File:** `app/(supplier)/orders/page.tsx`  
**Role:** approved supplier users

**Purpose:** All sub-POs assigned to this supplier. Customer column always = "Shopro".

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `ProductTable` | original-21 | Rename → `SupplierSubPOTable`. Columns: Order ID, Customer ("Shopro" — hardcoded, never dynamic), Items, Value, Status, Delivery By, ASN Uploaded. |
| `StatusBadge` | original-21 | SubPOStatus colours. |
| `SmartCombobox` | original-21 | Rename → `SubPOStatusFilter`. Single-select. |
| `Breadcrumb` | missing-14 | `Dashboard → My Orders` |

---

### S-08 — Sub-PO Detail & Fulfillment

**File:** `app/(supplier)/orders/[subPoId]/page.tsx`  
**Role:** approved supplier users

**Purpose:** Full sub-PO. Update status (Acknowledge → Preparing → Dispatched). Upload delivery proof. Partial fulfillment with reason. Customer = "Shopro" always.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `OrderTimeline` | missing-14 | Rename → `SupplierFulfillmentTimeline`. Vertical. Steps: Order Received → Acknowledged → Preparing → Dispatched → Delivered to Shopro. Active step has "Update Status" button. |
| `ContributorsOverviewTable` | original-21 | Rename → `SubPOLineItemsTable`. Customer column = "Shopro". Footer = total. |
| `Modal` | missing-14 | Rename → `UpdateFulfillmentModal`. Status + ASN number + tracking reference. |
| `FileUpload` | missing-14 | Rename → `DeliveryProofUpload`. `accept="image/*,application/pdf"`. Receipt / e-way bill. |
| `Modal` | missing-14 | Rename → `PartialFulfillmentModal`. Per item: actual qty + reason for shortfall. |
| `ToastSave` | original-21 | After status update. |
| `Breadcrumb` | missing-14 | `My Orders → SPO-{id}` |

---

### S-09 — Payments (Supplier)

**File:** `app/(supplier)/payments/page.tsx`  
**Role:** approved supplier users

**Purpose:** Payment status per sub-PO. History. Download receipts. Never shows restaurant name or buyer-side invoice value.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `StatCardGrid` | missing-14 | 3 cards: "Payable Balance", "In Queue", "Received This Month". `columns={3}`. |
| `LedgerTable` | missing-14 | Rename → `SupplierPaymentLedger`. Columns: Date, Order ID (masked), Description ("Shopro Procurement - {items}"), Payout Amount, Deductions, Net Received, Status, Bank Ref. NEVER restaurant name or buyer invoice value. |
| `StatusBadge` | original-21 | PayoutStatus colours. |
| `Breadcrumb` | missing-14 | `Dashboard → Payments` |

---

### S-10 — Payment Dispute

**File:** `app/(supplier)/payments/[paymentId]/dispute/page.tsx`  
**Role:** approved supplier users

**Purpose:** Supplier disputes a payout. 48-hour window. Submit evidence. Shopro Finance mediates. 5-business-day resolution.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `StatCardGrid` | missing-14 | 2 cards: "Amount Disputed", "Dispute Status". `columns={2}`. |
| `FileUpload` | missing-14 | Rename → `DisputeEvidenceUpload`. Upload invoice copy, agreed PO, delivery proof. |
| `DisputeThread` | missing-14 | Rename → `PaymentDisputeThread`. `currentRole="seller"`. Supplier sees own messages + Shopro Finance replies. Resolve button hidden — Shopro resolves. |
| `NeonButton` | original-21 | "Submit Dispute". Variant `solid`. |
| `Breadcrumb` | missing-14 | `Payments → Dispute` |

---

### S-11 — Profile & Settings (Supplier)

**File:** `app/(supplier)/settings/page.tsx`  
**Role:** approved supplier users

**Purpose:** Business details, categories, notification preferences. Category changes require Shopro approval.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `SmartCombobox` | original-21 | Rename → `SupplierCategoryUpdater`. Multi-select. Category change triggers Shopro review notification. |
| `MD3Switch` | original-21 | Email / SMS / In-App per event type. `showIcons={true}`. |
| `TooltipIconButton` | original-21 | Info icon per toggle. |
| `NeonButton` | original-21 | "Save Changes". Variant `solid`. |
| `ToastSave` | original-21 | After save. |
| `Breadcrumb` | missing-14 | `Dashboard → Settings` |

---

### S-12 — Bank / Payment Details

**File:** `app/(supplier)/settings/payment-details/page.tsx`  
**Role:** approved supplier users

**Purpose:** View and update bank/UPI details. Any update triggers automatic penny drop + mandatory 24-hour hold before new details active. Old details archived for audit.

**Components:**

| Component | Source | Adaptation |
|---|---|---|
| `ChecklistCard` | missing-14 | Rename → `PaymentDetailStatus`. Sections: "Current Active Details" (read-only, masked), "Verification Status" (penny drop result), "24-Hour Hold" (countdown if pending). `onSubmit`="Request Update". |
| `Modal` | missing-14 | Rename → `UpdatePaymentDetailsModal`. Method toggle, account number (text input — never echoed back in full after submit), IFSC, holder name, UPI. WARNING text: "24-hour hold applies. Current details remain active during hold." |
| `MD3Switch` | original-21 | Payment method toggle: Bank / UPI. `showIcons={true}`. |
| `OrderTimeline` | missing-14 | Rename → `PaymentChangeTimeline`. Steps: Submitted → Penny Drop → 24h Hold → Active. |
| `StatusBadge` | original-21 | Verification: PENDING / VERIFIED / FAILED. |
| `NeonButton` | original-21 | "Request Update". Variant `default`. Opens modal. |
| `Breadcrumb` | missing-14 | `Settings → Payment Details` |

---

## Complete screen index

| ID | Screen | Portal | Key role(s) |
|---|---|---|---|
| SHELL-R | Restaurant App Shell | Restaurant | All restaurant |
| SHELL-OP | Operator App Shell | Operator | All Shopro |
| SHELL-S | Supplier App Shell | Supplier | All supplier |
| R-00 | Restaurant Login | Restaurant | Unauthenticated |
| OP-00 | Operator Login + MFA | Operator | Unauthenticated |
| S-01 | Supplier Login | Supplier | Unauthenticated |
| S-00 | Supplier Registration Wizard | Supplier | Unauthenticated |
| R-01 | Restaurant Dashboard | Restaurant | All |
| R-02 | Product Catalog / Explore | Restaurant | All |
| R-03 | PO Creation | Restaurant | All |
| R-04 | My Orders (PO List) | Restaurant | All |
| R-05 | PO Detail | Restaurant | All |
| R-06 | PO Amendment Request | Restaurant | All |
| R-07 | Delivery Confirmation | Restaurant | All |
| R-08 | Inventory | Restaurant | All |
| R-09 | Payments | Restaurant | All |
| R-10 | Support Tickets | Restaurant | All |
| R-11 | KYC / Verification | Restaurant | All |
| R-12 | Settings | Restaurant | Manager |
| AUTO-R-01 | Reorder Rules | Restaurant | Manager |
| AUTO-R-02 | Recurring Schedules | Restaurant | Manager |
| AUTO-R-03 | Auto-PO Activity Log | Restaurant | All |
| OP-01 | Operator Dashboard | Operator | All Shopro roles |
| OP-02 | Restaurant Management | Operator | Super Admin, Ops Mgr, Support |
| OP-03 | PO Inbox | Operator | Super Admin, Ops Mgr, Procurement, Support, Auditor |
| OP-04 | PO Review & Accept/Reject | Operator | Super Admin, Ops Mgr, Procurement |
| OP-05 | PO Splitting Workspace | Operator | Super Admin, Ops Mgr, Procurement |
| OP-06 | Sub-PO Management | Operator | Super Admin, Ops Mgr, Procurement |
| OP-07 | Bid Event Creation | Operator | Super Admin, Ops Mgr, Procurement |
| OP-08 | Bid Evaluation & Award | Operator | Super Admin, Ops Mgr, Procurement |
| OP-09 | Supplier Vetting Queue | Operator | Super Admin, Supplier Relations |
| OP-10 | Supplier Detail & Approval | Operator | Super Admin, Supplier Relations |
| OP-11 | Supplier Directory | Operator | Super Admin, Ops Mgr, Procurement, Supplier Relations |
| OP-12 | Payout Queue | Operator | Super Admin, Finance Officer |
| OP-13 | Payout Detail & Approval | Operator | Super Admin, Finance Officer |
| OP-14 | Payment Ledger | Operator | Super Admin, Finance, Auditor |
| OP-15 | Revenue Dashboard | Operator | Super Admin, Finance |
| OP-16 | Delivery & Logistics | Operator | Super Admin, Ops Mgr |
| OP-17 | Product Catalog Management | Operator | Super Admin, Ops Mgr |
| OP-18 | Reports & Analytics | Operator | Super Admin, Ops Mgr, Finance, Auditor |
| OP-19 | System Configuration | Operator | Super Admin only |
| OP-20 | Audit Log Viewer | Operator | Super Admin, Auditor |
| OP-21 | Shopro User Management | Operator | Super Admin only |
| AUTO-OP-01 | Auto-PO Admin View | Operator | Super Admin, Ops Mgr |
| S-02 | Verification Status | Supplier | Pre-approval |
| S-03 | Supplier Dashboard | Supplier | Approved |
| S-04 | Bid Invitations Inbox | Supplier | Approved |
| S-05 | Quote Submission | Supplier | Approved |
| S-06 | Bid History | Supplier | Approved |
| S-07 | Sub-PO List | Supplier | Approved |
| S-08 | Sub-PO Detail & Fulfillment | Supplier | Approved |
| S-09 | Payments (Supplier) | Supplier | Approved |
| S-10 | Payment Dispute | Supplier | Approved |
| S-11 | Profile & Settings | Supplier | Approved |
| S-12 | Bank / Payment Details | Supplier | Approved |

**Total: 53 screens across 3 portals**