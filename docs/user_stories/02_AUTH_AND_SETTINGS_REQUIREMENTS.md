# Authentication, Sessions & Settings Requirements

## 1. Overview
This document captures user stories for **cross-cutting** concerns: how all roles authenticate into the Shopro POS, how sessions are managed securely, how access is denied gracefully, and how system-wide display settings are controlled.

## 2. User Roles & Permission Hierarchy
Shopro POS uses a hierarchical permission model with specific functional overrides.

*   **FOH Roles:**
    *   **Server:** Standard order entry and payment. Scoped to assigned sections.
    *   **Cashier:** Rapid payment processing across all sections. Drawer accountability.
    *   **Host:** Waitlist and reservation management; section assignments.
    *   **Busser/Runner:** Support roles for table resets and food delivery (minimal PIN entry required).
    *   **Bartender:** Bar-specific order entry, tab management, and high-volume cash handling.
*   **BOH Roles:**
    *   **Line Cook:** Station-specific order view and completion.
    *   **Lead Cook:** Kitchen supervisor; can 86 items and modify routing.
    *   **Expo:** Final quality control; master ticket view and runner assignment.
*   **Management:**
    *   **Floor Manager:** Universal override for voids, comps, and seating escalations.
    *   **General Manager (GM):** Full operational oversight, scheduling, and mid-level reporting.
    *   **Owner:** Multi-unit oversight, system-wide configuration, and deep financial analytics.

## 3. User Stories

### Epic 1: Authentication & Login
**Goal:** Ensure every role has a secure, role-specific entry point to the POS.

*   **US-1.1: Server PIN Login**
    *   **As a** Server, **I want to** log in to a POS terminal by entering my unique 4-digit PIN on a lock screen, **so that** my name is associated with all orders and actions I take during my shift.
    *   **UI Journey (GATE 5b):**
        *   **Origin:** Terminal is on the PIN Lock Screen (`/lock`).
        *   **Trigger:** Numeric Keypad (inline, center-screen).
        *   **Container:** Full-screen lock interface.
        *   **Spatial:** Non-dismissible blocking interface; masks all app content.
        *   **Cancel Path:** None. User must authenticate to leave the screen.
    *   *Acceptance Criteria:*
        *   The PIN entry screen must always be the initial state of an idle or unattended terminal.
        *   PIN entry follows the **Strict Masking** pattern: `••••` (characters never echo).
        *   After 5 consecutive incorrect PIN entries, the terminal must transition to `BRUTE_FORCE_LOCKOUT` for 60 seconds and display a countdown timer.
        *   Upon successful login, the active user's name and role must be visible in the top navigation bar.
        *   A Server's PIN must be set by a Manager; Servers cannot set their own PINs.
    *   **Entities:** `StaffMember`, `POSTerminal`, `AuditLog`
    *   **Tech Stack:** Flutter

*   **US-1.2: Manager Override (Inline Escalation)**
    *   **As a** Manager, **I want to** enter my Manager PIN at a privilege-escalation prompt without fully logging out the active Server, **so that** I can authorize a sensitive action (e.g., discount, void) without disrupting the Server's workflow.
    *   **UI Journey (GATE 5b):**
        *   **Origin:** Any active operational screen (e.g., Order Entry `/orders/:id`).
        *   **Trigger:** Tapping a 'Gated' action button (e.g., "Void Item") or the "Manager Override" button in the Nav Bar.
        *   **Container:** `AlertDialog` modal (center-screen).
        *   **Spatial:** Modal overlays the current screen with a high-contrast dimming backdrop; focus is trapped within the modal.
        *   **Cancel Path:** Manager taps the "Cancel" button or the backdrop. The modal dismisses, and the action is aborted. The terminal remains in the Server's session.
    *   *Acceptance Criteria:*
        *   The Manager Override prompt must appear as a modal overlay, not a screen transition.
        *   Entering the correct Manager PIN must perform the authorized action and immediately return the terminal to the active Server's session.
        *   The backend validates the PIN and issues a temporary **Elevated Context Token** bound to the current device via **DPoP**.
        *   The prompt cancels automatically after 30 seconds of inactivity.
        *   All Override events are logged with Manager ID, Server ID, Action, and Timestamp.
    *   **Entities:** `StaffMember`, `POSTerminal`, `AuditLog`
    *   **Tech Stack:** Flutter

*   **US-1.3: Staff PIN Management (Manager)**
    *   **As a** Manager, **I want to** create, reset, and deactivate staff PINs from the admin panel, **so that** I can onboard new staff and revoke access when someone leaves.
    *   **UI Journey (GATE 5b):**
        *   **Origin:** Staff Management screen (`/admin/staff`).
        *   **Trigger:** Taps the "Edit" button (Pencil icon) on a staff row.
        *   **Container:** `Sheet` (slides in from the right, 480px width).
        *   **Spatial:** Overlays the right side of the staff list.
        *   **Cancel Path:** Taps "Cancel" or "X". If `isDirty` (PIN changed), show `AlertDialog`: "Discard changes?".
    *   *Acceptance Criteria:*
        *   A Manager must be able to assign a unique 4-digit PIN to any staff member.
        *   If a PIN is already in use, block with: "This PIN is already assigned to another staff member."
        *   Deactivating a staff member's PIN forces a logout across all terminals within 60 seconds via WebSocket broadcast.
    *   **Entities:** `StaffMember`, `AuditLog`
    *   **Tech Stack:** React + shadcn + Tailwind

### Epic 2: Session Management
**Goal:** Protect the terminal and customer data when it is left unattended.

*   **US-2.1: Session Timeout / Auto-Lock**
    *   **As a** Manager, **I want to** configure an idle timeout period for all POS terminals (default: 3 minutes), **so that** unattended terminals automatically return to the PIN lock screen and restrict unauthorized access.
    *   *Acceptance Criteria:*
        *   The countdown to auto-lock must begin after the terminal registers no touch input for the configured duration.
        *   Any active open order ticket in progress must be preserved exactly as-is upon auto-lock; no data must be lost.
        *   The timeout period must be configurable between 1 minute and 30 minutes in the admin settings (Manager PIN required to change).
        *   Auto-lock must display the lock screen, not a "session expired" error.
    *   **Entities:** `POSTerminal`, `StaffMember`
    *   **Tech Stack:** Flutter

*   **US-2.2: Manual Log Out**
    *   **As a** Server, **I want to** manually log out of the POS terminal when I finish my shift, **so that** the next Server can log in with their own PIN.
    *   **UI Journey (GATE 5b):**
        *   **Origin:** Main Navigation/Dashboard.
        *   **Trigger:** "Logout" icon button (top-right of top nav, labeled with exit icon).
        *   **Container:** `AlertDialog` center-screen.
        *   **Spatial:** Center overlay.
        *   **Cancel Path:** Tapping "Stay Logged In" dismisses the modal.
    *   *Acceptance Criteria:*
        *   Log out must be prevented if the Server has open, unpaid order tickets. Display: "You have [N] open tickets. Pay or transfer them before logging out."
        *   Successful logout must return the terminal to the PIN lock screen (`/lock`) within 500ms.
    *   **Entities:** `POSTerminal`, `StaffMember`, `OrderTicket`
    *   **Tech Stack:** Flutter

### Epic 3: Permission Denied UX
**Goal:** Provide a clear, non-disruptive experience when a Server attempts a Manager-only action.

*   **US-3.1: Privilege Escalation Prompt**
    *   **As a** Server, **I want to** see a Manager PIN prompt (not a simple error) when I tap a Manager-only action, **so that** I can call over a Manager to authorize the action without losing my place on the screen.
    *   *Acceptance Criteria:*
        *   Manager-only buttons (e.g., "Apply Discount", "Void Item") must be visible but not hidden from Servers. They must be accessible and trigger the inline Manager Override (US-1.2) rather than showing an error.
        *   If a Server dismisses the override prompt without a Manager PIN, a non-blocking toast must appear: "Action requires Manager authorization."
        *   A Server must never see a raw "Access Denied" or HTTP 403 error.
    *   **Entities:** `StaffMember`, `AuditLog`
    *   **Tech Stack:** Flutter

### Epic 4: System Settings
**Goal:** Provide system-wide display and UX preferences configurable by Managers.

*   **US-4.1: Dark Mode Toggle**
    *   **As a** Manager, **I want to** switch the POS terminal's display between Dark Mode and Light Mode from the device settings, **so that** the UI can be optimized for the terminal's environment (bright dining room vs. dim bar).
    *   **UI Journey (GATE 5b):**
        *   **Origin:** Station Settings screen (`/settings/display`).
        *   **Trigger:** "Theme" `Switch` or `SegmentedControl` (Light/Dark/Auto).
        *   **Container:** Inline adjustment on settings page.
        *   **Cancel Path:** None. Setting is saved immediately to local storage on toggle.
    *   *Acceptance Criteria:*
        *   The Dark Mode setting must persist per-device (using **SharedPreferences** or **LocalStorage**), not per-user.
        *   Switching modes must apply to all screens within 500ms without requiring an app restart.
        *   Default mode for all new/reset terminals must be **Dark Mode**.
    *   **Entities:** `POSTerminal`
    *   **Tech Stack:** Flutter

---

## 4. Terminal & Session State Machine

> **Source:** State machine patterns for high-frequency terminals (squareup.com, lightspeedhq.com)

### 4.1 MenuItem State Machine

**States:** `LOCKED` | `AUTHENTICATING` | `ACTIVE` | `IDLE_LOCKED` | `BRUTE_FORCE_LOCKOUT` | `OVERRIDE_PENDING`

| From | To | Trigger | Actor(s) | Guard Conditions |
|---|---|---|---|---|
| `LOCKED` | `AUTHENTICATING` | PIN Entry (4th digit) | Staff | None |
| `AUTHENTICATING` | `ACTIVE` | Auth Success | SYSTEM | `pin_hash` match AND status is ACTIVE |
| `AUTHENTICATING` | `LOCKED` | Auth Failure | SYSTEM | `failed_attempts < 5` |
| `AUTHENTICATING` | `LOCKOUT` | Auth Failure | SYSTEM | `failed_attempts == 5` |
| `ACTIVE` | `IDLE_LOCKED` | Idle Timeout | SYSTEM | Terminal `idle_timeout_seconds` reached |
| `ACTIVE` | `LOCKED` | Explicit Logout | Staff | No open tickets |
| `IDLE_LOCKED` | `ACTIVE` | PIN Re-entry | Staff | Correct PIN for active session user |
| `ACTIVE` | `OVERRIDE_PENDING`| Gated Action Tap | Server | Action requires `MANAGER` role |
| `OVERRIDE_PENDING`| `ACTIVE` | PIN Success | Manager | Manager PIN valid |
| `OVERRIDE_PENDING`| `ACTIVE` | Dimissal | Staff | None |

#### Transition Side Effects
- `AUTHENTICATING → ACTIVE`: Emit `SESSION_START` event; load role permissions into local cache.
- `ACTIVE → IDLE_LOCKED`: Preserve navigation state; hide screen content with PIN overlay.
- `LOCKED → LOCKOUT`: Disable PIN pad; start 60s cooldown timer.

---

## 5. Data Schema & Entities

### 5.1 Primary Entities

#### `staff_members`
| Column | Type | Nullable | Constraints |
|---|---|---|---|
| `id` | UUID | NOT NULL | PK |
| `name` | VARCHAR(100)| NOT NULL | |
| `role_id` | UUID | NOT NULL | FK → roles.id |
| `pin_hash` | VARCHAR(255)| NOT NULL | Salted PBKDF2 |
| `status` | VARCHAR(20) | NOT NULL | ACTIVE, INACTIVE; default ACTIVE |
| `version` | INTEGER | NOT NULL | Optimistic locking |

#### `pos_terminals`
| Column | Type | Nullable | Constraints |
|---|---|---|---|
| `id` | UUID | NOT NULL | PK |
| `name` | VARCHAR(50) | NOT NULL | |
| `idle_timeout` | INTEGER | NOT NULL | 60–1800; default 180 |
| `theme` | VARCHAR(10) | NOT NULL | LIGHT, DARK, AUTO; default DARK |
| `last_sync_at` | TIMESTAMPTZ | NULL | |

#### `kds_routing_rules`
| Column | Type | Nullable | Constraints |
|---|---|---|---|
| `id` | UUID | NOT NULL | PK |
| `rule_type` | ENUM | NOT NULL | CATEGORY, ITEM |
| `target_id` | UUID | NOT NULL | FK → menu_items OR categories |
| `station_id` | UUID | NOT NULL | FK → kds_stations.id |
| `priority` | INTEGER | NOT NULL | Item-level override = 10; Category-level = 1 |

---

## 6. Security & Permissions

> **Source:** `02_ROLE_MANAGEMENT_UX_ARCHITECTURE.md` — PET/FAPI policy

### 6.1 Permission Matrix (COMPONENT:ACTION)

| Operation | Permission Code | Manager | Server | Kitchen/Expo | Owner |
|---|---|---|---|---|---|
| Login to POS | `SESSION:LOGIN` | ALLOW | ALLOW | ALLOW | ALLOW |
| Manual Logout | `SESSION:LOGOUT` | ALLOW | ALLOW | ALLOW | ALLOW |
| Edit Staff PINs | `ADMIN:STAFF_EDIT` | ALLOW | DENY | DENY | ALLOW |
| Adjust Terminals | `ADMIN:TERMINAL_CONFIG`| ALLOW | DENY | DENY | ALLOW |
| Route Kitchen | `ADMIN:KDS_ROUTING` | ALLOW | DENY | DENY | ALLOW |
| View System Audit| `ADMIN:AUDIT_VIEW` | ALLOW | DENY | DENY | ALLOW |

### 6.2 Security Policy
- **DPoP Token Binding:** Access tokens are cryptographically bound to the terminal hardware. Replaying a token on a different device returns 403.
- **Dual-Layer Validation:** Every PIN entry is validated locally (against the short-TTL signed permission cache) and verified on the backend (auth service).
- **Masking:** PIN entry follows the **Strict Masking** pattern (`••••`) defined in the UX Architecture.

---

## 7. Error Handling

### 7.1 Connectivity Errors
- **Offline PIN Check:** If the Auth service is inaccessible, the terminal uses the local **Signed Permission Cache** (15-min TTL). If the cache is expired and offline, it blocks access with: "System offline. Authenticate via Manager override."
- **Sync Conflict:** If two managers update a KDS routing rule simultaneously: "Conflict detected. [Manager Name] updated this rule at [HH:MM]. Please refresh."

### 7.2 Auth Errors
- **Deactivated Account:** Attempting to login with a deactivated PIN: "Account inactive. Contact management."
- **Invalid PIN:** PIN pad shakes + Toast: "Invalid PIN. [N] attempts remaining."

---

## 8. Accessibility

- **Touch Targets:** PIN pad buttons are minimum **50×50px** (exceeds WCAG 2.2 AA).
- **Haptic Feedback:** Optional vibration on PIN tap (standard for FOH terminals).
- **Dark Mode Default:** Provided to reduce eye strain in dimly lit restaurant environments.

## 4. Ambiguity Review Summary
*   **Override vs. Login (US-1.2):** The inline "Manager Override" is a distinct security flow from a full Manager Login. It allows privilege escalation without session interruption — critical for fast-paced FOH service.
*   **Auto-Lock vs. Session Expiry (US-2.1):** Auto-lock preserves open ticket state. It is not a logout. A Server returns to their exact prior screen after re-entering their PIN.
*   **Visible but Gated (US-3.1):** Manager-only buttons are visible to all roles. This is intentional — hiding them would make Servers unaware that a feature exists. The PIN gate is the control mechanism.

### Epic 5: Kitchen Routing Configuration (Admin)
**Goal:** Allow managers to configure which stations exist and what items they receive.

*   **US-5.1: Defining Kitchen Stations**
    *   **As a** Restaurant Manager, **I want to** create, edit, and delete named KDS Stations (e.g., "Grill", "Fryer", "Cold Station") from the Admin Dashboard, **so that** I can configure the system to match my physical kitchen layout.
    *   **UI Journey (GATE 5b):**
        *   **Origin:** KDS Settings screen (`/admin/settings/kds`).
        *   **Trigger:** `+ Create Station` button (Primary, top-right of page header).
        *   **Container:** `Sheet` component (Side-right, 480px width).
        *   **Spatial:** Slides in from the right, overlaying the station list.
        *   **Cancel Path:** Tapping the 'X' icon or 'Cancel' button. If any fields are modified, trigger `AlertDialog` confirmation to discard changes.
    *   *Acceptance Criteria:* The Settings UI must have a section for "Kitchen Stations". Each station requires a unique Name and a Type (`PREP`, `EXPO`, `BEVERAGE`). Deleting a station must unbind any devices using it and delete associated routing rules.
    *   **Entities:** `KDSStation`, `StaffMember`
    *   **Tech Stack:** React + shadcn + Tailwind
*   **US-5.2: Assigning Categories to Stations**
    *   **As a** Restaurant Manager, **I want to** select a KDS Station and assign one or more Menu Categories to it, **so that** items ordered from those categories automatically route to that specific screen.
    *   **UI Journey (GATE 5b):**
        *   **Origin:** Station Details screen (`/admin/settings/kds/:id`).
        *   **Trigger:** "Mapped Categories" section → `Add Categories` button.
        *   **Container:** `Command` palette (searchable multi-select).
        *   **Spatial:** Centered dialog overlay.
        *   **Cancel Path:** Pressing `Esc` or clicking outside the command palette.
    *   *Acceptance Criteria:* The Settings UI must present a dual-list selector or multi-select dropdown to map Categories (e.g., "Burgers") to a Station (e.g., "Grill"). A single Category can be routed to multiple stations (e.g., both the Grill and the Expo).
    *   **Entities:** `KDSRoutingRule`, `MenuCategory`, `KDSStation`
    *   **Tech Stack:** React + shadcn + Tailwind
*   **US-5.3: Assigning Specific Items to Stations**
    *   **As a** Restaurant Manager, **I want to** assign a specific Menu Item to a KDS Station to override its parent Category rule, **so that** I can handle exceptions (e.g., routing a specific 'Side Salad' to the Cold Station even though it's in the 'Mains' category).
    *   **UI Journey (GATE 5b):**
        *   **Origin:** Station Details screen (`/admin/settings/kds/:id`).
        *   **Trigger:** "Item Overrides" section → `+ Add Override` button.
        *   **Container:** `Dialog` with a searchable `Combobox`.
        *   **Spatial:** Centered modal context.
        *   **Cancel Path:** 'Cancel' button or backdrop click ensures no partial rule is saved.
    *   *Acceptance Criteria:* The routing UI must allow selecting individual Menu Items as targets. Item-level routing rules must take precedence over Category-level rules during ticket generation in the backend.
    *   **Entities:** `KDSRoutingRule`, `MenuItem`, `KDSStation`
    *   **Tech Stack:** React + shadcn + Tailwind
