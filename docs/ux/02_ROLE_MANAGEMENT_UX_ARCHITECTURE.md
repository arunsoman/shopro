# Role Management UI/UX Architecture

## 1. Executive Summary
This document defines the architecture for a dynamic, PET-compliant, and Financial-Grade (FAPI) role management system for Shopro POS. It moves away from a static, enum-based model to a flexible, permission-driven framework that ensures data privacy and transaction integrity.

## 2. Security & Compliance (PET/PT/FAPI)

### A. Privacy-Enhancing Technology (PET)
- **Data Minimization**: API endpoints for staff retrieval will never transmit sensitive fields like `pinHash`.
- **UI Masking**: PIN entry follows the "Strict Masking" pattern: `••••`.
- **Anonymized Auditing**: Logs use unique IDs linked to roles rather than full PII, preserving privacy while allowing traceability.

### B. Financial-Grade Security (FAPI 2.0 Inspired)
- **DPoP (Demonstration of Proof-of-Possession)**: 
    - Tokens are cryptographically bound to the specific client device key pair.
    - Mitigates token theft/replay attacks across different devices.
- **JWS Signed Payloads**: 
    - Financial actions (Voids, Comps, Refunds) are signed by the server to ensure message integrity.
- **mTLS (Optional)**: Recommended for fixed kiosks and server-to-server integrations for hardware-level authentication.

### C. Cybersecurity Measures (PT Hardening)
- **Dual-Layer Validation**: All permissions verified in the Flutter/React UI (for UX) and in the Spring Boot backend (for security).
- **Brute Force Protection**: 5 consecutive failed PIN attempts trigger a 60-second hardware lockout.

## 3. Role Taxonomy & Permission Matrix

Permissions follow a `<COMPONENT>:<ACTION>` structure.

| Category | Component | Key Actions |
| :--- | :--- | :--- |
| **Sales** | `ORDER` | `CREATE`, `VIEW_OWN`, `VIEW_ALL`, `VOID_ITEM` |
| **Financials**| `PAYMENT` | `PROCESS`, `COMP`, `VOID_BILL`, `DISCOUNT` |
| **Inventory** | `INV` | `VIEW`, `ADJUST`, `PO_APPROVE` |
| **Admin** | `ADMIN` | `STAFF_EDIT`, `ROLE_CONFIG`, `SYSTEM_SETTINGS` |

### Default Role Mappings (Examples)
- **Server**: `ORDER:CREATE`, `ORDER:VIEW_OWN`, `FLOOR:STATUS_RESET`
- **Manager**: All `ORDER:*`, All `PAYMENT:*`, `ADMIN:PIN_RESET`
- **Owner**: Superuser status (`*:*`)

## 4. Interaction Flows

### A. Manager Override (Inline Elevation)
1. Server taps a gated action (e.g., "Void Bill").
2. System detects insufficient permission and triggers the **Override Modal**.
3. Manager enters 4-digit PIN.
4. Backend validates Manager PIN and issues a temporary **Elevated Context Token** bound to the current device via DPoP.
5. Action is performed; context immediately reverts to Server upon completion.

### B. Offline Resilience
- The system maintains a **Local Permission Cache** (signed with a short TTL).
- During internet outages, the terminal verifies actions against this cache.
- Synchronized logs are transmitted with original cryptographic proofs once back online.

## 5. User Interface Design

### A. Staff Dashboard (Web/Admin)
- **Device Management**: View and revoke DPoP-bound devices.
- **PIN Security**: Dedicated section for hashed PIN resets (Manager only).

### B. Role Configurator (Web/Admin)
- **Categorized Grid**: Permissions grouped by business unit.
- **Inheritance Graph**: Visual representation of role hierarchies with cycle detection.
- **Threshold Inputs**: Configurable limits for discounts and comps within specific roles.
