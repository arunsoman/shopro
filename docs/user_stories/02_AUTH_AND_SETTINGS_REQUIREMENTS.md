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
    *   *Acceptance Criteria:*
        *   The PIN entry screen must always be the initial state of an idle or unattended terminal.
        *   After 5 consecutive incorrect PIN entries, the terminal must lock for 60 seconds and display: "Too many attempts. Terminal locked for 60 seconds."
        *   Upon successful login, the active user's name and role must be permanently visible in the top navigation bar of every screen.
        *   A Server's PIN must be set by a Manager in the admin settings; Servers cannot set their own PINs.
    *   **Entities:** `StaffMember`, `AuditLog`
    *   **Tech Stack:** Flutter

*   **US-1.2: Manager Override (Inline Escalation)**
    *   **As a** Manager, **I want to** enter my Manager PIN at a privilege-escalation prompt without fully logging out the active Server, **so that** I can authorize a sensitive action (e.g., discount, void) without disrupting the Server's workflow.
    *   *Acceptance Criteria:*
        *   The Manager Override prompt must appear as a modal overlay over the current screen, not as a full screen transition.
        *   Entering the correct Manager PIN must perform the authorized action and immediately return the terminal to the active Server's session.
        *   The override prompt must cancel automatically after 30 seconds of inactivity, and the action must be aborted.
        *   All Manager Override events must be logged with the Manager's identity, the Server's identity, the action authorized, and a timestamp in the audit trail.
    *   **Entities:** `StaffMember`, `AuditLog`
    *   **Tech Stack:** Flutter

*   **US-1.3: Staff PIN Management (Manager)**
    *   **As a** Manager, **I want to** create, reset, and deactivate staff PINs from the admin panel, **so that** I can onboard new staff and revoke access when someone leaves.
    *   *Acceptance Criteria:*
        *   A Manager must be able to assign a unique 4-digit PIN to any staff member.
        *   If a PIN is already in use by another staff member, the system must block the assignment with the error: "This PIN is already assigned to another staff member."
        *   Deactivating a staff member's PIN must prevent them from logging in immediately, including on any terminal they may currently be logged into (force logout within 60 seconds).
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
    *   *Acceptance Criteria:*
        *   Log out must be prevented if the Server has open, unpaid order tickets. The system must display: "You have [N] open tickets. Pay or transfer them before logging out."
        *   Successful logout must return the terminal to the PIN lock screen within 500ms.
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
    *   *Acceptance Criteria:*
        *   The Dark Mode setting must persist per-device, not per-user. Logging out and back in must not reset the display mode.
        *   Switching modes must apply to all screens within 500ms without requiring an app restart.
        *   Default mode for all new/reset terminals must be **Dark Mode**.
    *   **Entities:** `POSTerminal`
    *   **Tech Stack:** Flutter

## 4. Ambiguity Review Summary
*   **Override vs. Login (US-1.2):** The inline "Manager Override" is a distinct security flow from a full Manager Login. It allows privilege escalation without session interruption — critical for fast-paced FOH service.
*   **Auto-Lock vs. Session Expiry (US-2.1):** Auto-lock preserves open ticket state. It is not a logout. A Server returns to their exact prior screen after re-entering their PIN.
*   **Visible but Gated (US-3.1):** Manager-only buttons are visible to all roles. This is intentional — hiding them would make Servers unaware that a feature exists. The PIN gate is the control mechanism.

### Epic 5: Kitchen Routing Configuration (Admin)
**Goal:** Allow managers to configure which stations exist and what items they receive.

*   **US-5.1: Defining Kitchen Stations**
    *   **As a** Restaurant Manager, **I want to** create, edit, and delete named KDS Stations (e.g., "Grill", "Fryer", "Cold Station") from the Admin Dashboard, **so that** I can configure the system to match my physical kitchen layout.
    *   *Acceptance Criteria:* The Settings UI must have a section for "Kitchen Stations". Each station requires a unique Name and a Type (`PREP`, `EXPO`, `BEVERAGE`). Deleting a station must unbind any devices using it and delete associated routing rules.
    *   **Entities:** `KDSStation`, `StaffMember`
    *   **Tech Stack:** React + shadcn + Tailwind
*   **US-5.2: Assigning Categories to Stations**
    *   **As a** Restaurant Manager, **I want to** select a KDS Station and assign one or more Menu Categories to it, **so that** items ordered from those categories automatically route to that specific screen.
    *   *Acceptance Criteria:* The Settings UI must present a dual-list selector or multi-select dropdown to map Categories (e.g., "Burgers") to a Station (e.g., "Grill"). A single Category can be routed to multiple stations (e.g., both the Grill and the Expo).
    *   **Entities:** `KDSRoutingRule`, `MenuCategory`, `KDSStation`
    *   **Tech Stack:** React + shadcn + Tailwind
*   **US-5.3: Assigning Specific Items to Stations**
    *   **As a** Restaurant Manager, **I want to** assign a specific Menu Item to a KDS Station to override its parent Category rule, **so that** I can handle exceptions (e.g., routing a specific 'Side Salad' to the Cold Station even though it's in the 'Mains' category).
    *   *Acceptance Criteria:* The routing UI must allow selecting individual Menu Items as targets. Item-level routing rules must take precedence over Category-level rules during ticket generation in the backend.
    *   **Entities:** `KDSRoutingRule`, `MenuItem`, `KDSStation`
    *   **Tech Stack:** React + shadcn + Tailwind
