# Staff Security & Dashboard Deep Dive

Shopro POS employs a robust, multi-layered security architecture designed for the high-pressure environment of a restaurant terminal, ensuring fast access for staff while maintaining rigorous FAPI 2.0 compliance and role-based controls.

## 1. Terminal Authentication (PIN-Based)
The primary entry point for staff is a 4-digit PIN system optimized for speed and security.

### User Experience
- **Auto-Submission**: The login screen automatically submits the PIN as soon as the 4th digit is entered, eliminating the need for an extra "Enter" tap.
- **Visual Feedback**: A premium keypad with haptic-like animations and distinct "filled" states for entered digits.
- **Quick Staff Hints**: For development and training, the login screen provides avatar-based hints for different roles (e.g., Owner: 1111, Manager: 2222).

### Technical Implementation
- **Frontend**: `LoginPage.tsx` manages a local `pin` state. The `handleDigit` callback triggers `handleSubmit` once the length reaches 4.
- **Backend Verification**: `AuthServiceImpl.java` receives the PIN and uses Spring Security's `BCryptPasswordEncoder` to match it against a hashed value in the database.
- **Terminal Lockout**: To prevent brute-force attacks, the system tracks failed attempts by IP address. After 5 failed attempts, the terminal is locked for 60 seconds (managed via `failureTracker` in-memory).

---

## 2. FAPI 2.0 & Device Binding (DPoP)
Shopro implements Demonstrating Proof-of-Possession (DPoP) to satisfy FAPI 2.0 security requirements, ensuring that stolen tokens cannot be used on unauthorized devices.

### Technical Implementation
- **Key Thumbprint (jkt)**: During login, the client sends a public key thumbprint. 
- **Device Binding**: The backend stores this `jkt` in a `DeviceBinding` entity, linking the session to that specific browser or tablet.
- **Single Active Session**: To prevent session hijacking and concurrent sessions for the same staff member, the system automatically revokes all other active bindings for a staff member when a new successful login occurs on a different device.

---

## 3. Role-Based Access Control (RBAC)
Feature visibility and action permissions are strictly governed by a staff member's assigned role.

### User Experience
- **Dashboard Filtering**: The central dashboard only displays "Nav Cards" for modules the user is authorized to enter. For example, a Busser sees "Floor Plan" but not "Menu Management".
- **Dynamic Breadcrumbs**: The `AppShell` generates breadcrumbs that guide the user through authorized paths.

### Technical Implementation
- **Role Categories**: Roles are grouped into `ADMIN_ROLES` (Owner, Managers) and `OPERATIONAL_ROLES` (Everyone).
- **Filtering Logic**: 
    - The `AuthContext` provides a `hasRole(roles[])` helper. 
    - `DashboardPage.tsx` uses this to filter the `NAV_CARDS` array before rendering.
    - Specific high-authority modules like "Roles and Permissions" are restricted solely to the `OWNER` role.

---

## 4. Business Rules
- **Non-Transferable PINs**: PINs are venue-unique and tied to a single `StaffMember` identity.
- **Shift Continuity**: Sessions are persistent across tab refreshes (stored in `localStorage`), but sensitive actions always re-verify permissions against the live token.
- **Real-time Revocation**: If a manager changes a staff member's role or deactivates them in the back office, the `StaffAuthenticationFilter` on the backend will reject subsequent requests immediately.
