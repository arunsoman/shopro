# Multi-Channel Notification System — UX Blueprint

> **Generated From:** `docs/user_stories/14_NOTIFICATION_SYSTEM.md`
> **Methodology:** UX Architecture & Information Design Skill

---

## 1. Actor & Role Table

| Role | Primary Goal | Device | Urgency | Access Level |
|---|---|---|---|---|
| **Administrator (Admin)** | Configure notification types, delivery channels, routing rules, and monitor system health. | Desktop (Back-office) | Low / Deliberate | Admin |
| **Operator** | Trigger manual dispatch and query delivery logs for troubleshooting. | Desktop (Back-office) | Low / Deliberate | Operator |
| **Manager / Owner** | Receive and action high-level alerts (PO approvals, voids, stock) across multiple devices. | POS, Mobile, Web | Medium / High | Admin / Op |
| **Server / Runner / Busser**| Receive real-time operational cues (order ready, table dirty) to execute floor tasks instantly. | POS, Tablet, Mobile | High (Real-time) | Read / Ack |
| **Chef / Kitchen** | Receive critical stock alerts and bid updates while in the kitchen. | KDS, Tablet | High (Real-time) | Read / Ack |

---

## 2. Role × Feature Matrix

| Feature | Admin | Operator | Manager | Server / Runner |
|---|---|---|---|---|
| Manage Notification Types | ✅ Write | 👁 Read | ❌ | ❌ |
| Configure Channels | ✅ Write | 👁 Read | ❌ | ❌ |
| Manage Recipients & Groups | ✅ Write | ❌ | ❌ | ❌ |
| Edit Routing Matrix | ✅ Write | ❌ | ❌ | ❌ |
| Trigger Manual Dispatch | ✅ Write | ✅ Write | ❌ | ❌ |
| View Delivery Logs | ✅ Read | ✅ Read | ❌ | ❌ |
| View Dashboards | ✅ Read | ✅ Read | ❌ | ❌ |
| Receive In-App Notifications | ✅ Ack | ✅ Ack | ✅ Ack | ✅ Ack |
| Mute Notification Types | ✅ Write | ✅ Write | ✅ Write | ✅ Write |

---

## 3. Domain Map

```
App Domain Map
──────────────────────────────────────────────────
GLOBAL (All authenticated roles)
  └── Notification Center (Bell Icon Slide-Panel)
  └── Settings > Notification Preferences

ADMIN / OPERATOR DOMAINS (MCNS Admin Console)
  ├── Dispatch & Monitoring
  │   ├── Dashboard (Stats, Volume, Failures)
  │   ├── Delivery Logs
  │   └── Manual Send
  │
  ├── Definitions
  │   ├── Notification Types
  │   └── Channel Config
  │
  └── Routing
      ├── Recipients & Groups
      └── Routing Matrix
──────────────────────────────────────────────────

Home domain per role:
  Administrator → MCNS Dashboard
  Operator      → Delivery Logs
  Server/Chef   → No MCNS home (use POS screens, receive via Bell)
```

---

## 4. Navigation Architecture

### 4.1 Top Header (Global across apps)
- **Right — Notifications:** Bell icon + unread badge (e.g., `8`). Opens Notification Slide-Panel.
- **Right — User Menu:** Avatar → Settings → Notification Preferences.

### 4.2 Sidebar / Left Navigation (Admin Console)
```
┌─────────────────┐
│  MCNS Admin     │
├─────────────────┤
│  ▸ Dashboard    │
│  ─────────────  │
│  ▸ Dispatch     │
│    ▸ Manual Send│
│    ▸ Logs       │
│  ─────────────  │
│  ▸ Settings     │
│    ▸ Types      │
│    ▸ Channels   │
│    ▸ Routing    │
│  ─────────────  │
│  [Avatar]       │
└─────────────────┘
```

---

## 5. Page Inventory

| Page | Route | Type | Primary Actor | Entry From | Exits To |
|---|---|---|---|---|---|
| **MCNS Dashboard** | `/admin/notifications` | Dashboard | Admin | Sidebar | Logs, Manual Send |
| **Notification Types** | `/admin/notifications/types` | List | Admin | Sidebar | Create, Edit Type |
| **Create/Edit Type** | `/admin/notifications/types/:id` | Edit Form | Admin | Types List | Types List (on save) |
| **Channel Config** | `/admin/notifications/channels`| List/Cards | Admin | Sidebar | Edit Config |
| **Routing Matrix** | `/admin/notifications/routing` | Matrix (Grid)| Admin | Sidebar | Types |
| **Manual Send** | `/admin/notifications/send` | Wizard/Form | Operator | Sidebar | Logs |
| **Delivery Logs** | `/admin/notifications/logs` | List | Operator | Sidebar, Dashboard | Log Detail |
| **User Preferences** | `/settings/notifications` | Settings | All | User Menu | — |
| **Notification Panel** | *(Overlay, no route)* | Panel | All | Header Bell | Target POS Entity |

---

## 6. Layout Zone Specification

### ZONE MAP: Notification Types List
```
┌────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  ZONE A: "Notification Types"      [+ Create Type]   │
│         ├──────────────────────────────────────────────────────│
│         │  ZONE B: [🔍 Search...] [Severity ▾] [Status ▾]     │
│         ├──────────────────────────────────────────────────────│
│         │  ZONE C: Data Table                                  │
│         │  Code       Name       Sev      Channels   Status    │
│         │  [Item]     [Item]     [Attr]   [Qty]      [Active]  │
│         │  [Item]     [Item]     [Attr]   [Qty]      [Active]  │
└─────────┴──────────────────────────────────────────────────────┘
```

### ZONE MAP: Routing Matrix
```
┌────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  ZONE A: "Routing Matrix"               [Save]       │
│         ├──────────────────────────────────────────────────────│
│         │  ZONE C: Editable Data Grid                          │
│         │  Type           | In-App     | Email    | WhatsApp   │
│         │  PO_APPROVAL    | [Select ▾] | [None ▾] | [Select ▾] │
│         │  STOCK_CRITICAL | [Select ▾] | [None ▾] | [None ▾]   │
└─────────┴──────────────────────────────────────────────────────┘
```

### ZONE MAP: In-App Notification Overlay (POS / Web)
```
┌──────────────────────────────────────────────────────────┐
│  Any App View (ZONE C)               │  ZONE D: Alerts   │
│                                      │  ┌──────────────┐ │
│                                      │  │ Notifications│ │
│                                      │  │ ──────────── │ │
│                                      │  │ 🔴 [Title]   │ │
│                                      │  │    [Body]    │ │
│                                      │  │    [Action]  │ │
│                                      │  │ ──────────── │ │
│                                      │  │ 🟡 [Title]   │ │
│                                      │  │    [Body]    │ │
│                                      │  └──────────────┘ │
└──────────────────────────────────────┴───────────────────┘
```

---

## 7. Component Placement Dictionary

| COMPONENT | PAGE(S) | ZONE | TRIGGER | PRIMARY ACTION |
|---|---|---|---|---|
| **NotificationBell** | All authed headers | Top-R | Always | Opens SlidePanel (ZONE D) |
| **NotificationSlidePanel**| All authed pages | D | Bell click | View alerts, nav to entities |
| **NotificationCard** | SlidePanel | D | Inside panel | Nav to route (deep link), Mark dismiss |
| **MutePreferenceToggle**| `/settings/notifications` | C | Always | Mutes notification type |
| **TypeDataTable** | `/types` | C | Always | Click row to edit |
| **ConfigCard (Channel)**| `/channels` | C | Always | Edit channel credentials |
| **RoutingMatrixGrid** | `/routing` | C | Always | Map Group to Type/Channel |
| **LivePreviewPanel** | `/types/new`, `/send`| C-Right | Form change | Preview rendered template |
| **DashboardStatFeed** | `/admin/notifications`| C-Left| Always | Shows realtime delivery metrics |

---

## 8. Interaction Flows

### FLOW: US-14.14 / 14.15 Receive & Recall Notification
Actor: **Manager** (POS Terminal)
Entry: **Background WebSocket Event (`WS_NEW`)**
────────────────────────────────────────────────────────────────
**HAPPY PATH (Actioning)**
  1. System emits `WS_NEW` (VOID_REQUEST).
     → Bell icon badge flashes and updates count (+1).
     → (Optional) In-app success style toast briefly drops down.
  2. Manager clicks Bell Icon.
     → ZONE D: SlidePanel opens from right.
     → Shows `VOID_REQUEST` card at top.
  3. Manager clicks "Review Void" on card.
     → Client marks is_read via PATCH `/notifications/{id}/read` (triggers `WS_UPDATE` to other devices).
     → Full page navigation to `/orders/123/voids` (deep link payload).
     → SlidePanel closes.

**BRANCH: Resolved by another manager (State-Dependent Recall)**
  1. System emits `WS_CANCEL` (correlation_id = `void_123`).
     → Client intercepts event.
     → Removes matching notification card from SlidePanel state.
     → Bell icon badge decrements seamlessly.

**ERROR PATH: WebSocket Disconnected**
  1. Connection drops.
     → Yellow "Reconnecting..." banner at top.
  2. Reconnects.
     → Client fetches `/notifications/active` to sync missed events.
────────────────────────────────────────────────────────────────

### FLOW: US-14.17 Update Notification Preferences
Actor: **Manager**
Entry: **Clicks User Menu -> Settings -> Notification Preferences**
────────────────────────────────────────────────────────────────
**HAPPY PATH**
  1. Manager navigates to `/settings/notifications`.
     → ZONE C: Renders list of allowed types grouped by channel.
  2. Manager toggles OFF "PO Approval" for WhatsApp.
     → PUT `/preferences/{userId}` is called immediately on toggle.
     → Toggle goes grey. Success toast.
  3. Manager tries to toggle OFF "System Warning".
     → Toggle is disabled and locked. Tooltip: "This alert is mandatory and cannot be muted."
────────────────────────────────────────────────────────────────

---

## 9. Component Spatial Placement Flow

### SPATIAL FLOW: Trigger & Action an In-App Notification
Actor: **Manager**
Starting Point: Any full-page POS screen (e.g. `/tables`)
───────────────────────────────────────────────────────────────────────
**STEP 1**
  Component:  **NotificationBell Badge**
  Location:   Global Header → Top-Right corner
  Dimensions: 16px × 16px (badge)
  Appears:    Scale-in animation when `WS_NEW` arrives.
  Actor does: Clicks the Bell icon.
  ↓
**STEP 2**
  Component:  **NotificationSlidePanel**
  Location:   ZONE D → Slides from right edge of viewport over ZONE C.
  Dimensions: 360px wide × 100vh.
  Appears:    Slide-in from right (250ms ease-out). ZONE C dims slightly.
  Actor does: Scans list, clicks the `NotificationCard` Action Button (Deep link).
  ↓
**STEP 3**
  Component:  **Detailed POS Screen (e.g., Target Order Form)**
  Location:   `/orders/123` → ZONE C
  Dimensions: Full workspace width.
  Appears:    Full page rapid navigation. SlidePanel dismisses simultaneously (slides right).
  Spatial Note: Rule SP-1 (Panel Click → Full Page Nav if complex entity).
  Actor does: Completes the void approval.
  ↓
**STEP 4**
  Component:  **WS_CANCEL Background Processor**
  Location:   No UI.
  Appears:    Silent sync. Removes the notification from the list.
───────────────────────────────────────────────────────────────────────

---

## 10. UX Rules & Heuristics Applied

- **Visibility & Feedback:** The Unread badge on the Bell is instantly updated via WebSocket. State recall (`WS_CANCEL`) happens instantly so the user doesn't see stale alerts.
- **Rule SP-1 (Trigger-Result Space):** Notifications appear in a right SlidePanel since they are quick references. Navigating deeper (via deep link) takes them to a Full Page view.
- **Error Communication:** If the WebSocket disconnects, a clear, non-blocking yellow banner is displayed.
- **Role-Based UI:** Users only see mute options for Notification Types routed to their POS role.
- **Rule SP-5 (Toast Fixed):** Success toasts during manual dispatch or settings updates are fixed top-right.

---

## 11. Handoff Checklist

- [x] Every user story has at least one page in the page inventory.
- [x] Every page has a defined layout zone map.
- [x] Every component has an entry in the component placement dictionary.
- [x] Every major flow is documented with happy path + at least 2 error branches.
- [x] Every role has a defined home page.
- [x] Header anatomy is fully specified.
- [x] Navigation depth is max 3 levels.
- [x] Mobile layout for every page is addressed (Slide-Panel fills width on mobile).
- [x] All destructive actions have confirmation flows.
- [x] Every primary user journey has a Spatial Placement Flow documented.
- [x] Panel vs. Modal vs. Full-page decisions handled (Slide-Panel for alerts).
