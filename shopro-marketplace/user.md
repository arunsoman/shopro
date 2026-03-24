# Shopro Marketplace - Pre-seeded Users & Session Binding

This document summarizes the pre-seeded user access for the Shopro Marketplace and the implementation of strict single-tab session binding.

## 1. Pre-seeded Marketplace Users

The following users are pre-seeded in the `shopro_marketplace_db` database via Flyway migrations (`V9`, `V10`, `V11`).

**Default Password**: `password`

### Shopro Internal (Operators)
| Login (Email) | Role | Domain |
| :--- | :--- | :--- |
| `root@shopro.internal` | SUPER_ADMIN | `shopro.internal` |
| `ops@shopro.internal` | OPS_MANAGER | `shopro.internal` |
| `finance@shopro.internal` | FINANCE_OFFICER | `shopro.internal` |
| `logistics@shopro.internal` | PROCUREMENT_OFFICER | `shopro.internal` |
| `evaluator@shopro.internal` | AUDITOR | `shopro.internal` |
| `admin@shopro.ae` | SUPER_ADMIN | `shopro.ae` |
| `ops@shopro.ae` | OPS_MANAGER | `shopro.ae` |

### Marketplace Participants (Buyers & Suppliers)
| Login (Email) | Role | Entity (Domain) |
| :--- | :--- | :--- |
| `owner@bistro.internal` | BUYER | Bistro Hub (`bistro.internal`) |
| `admin@harvest.internal` | SUPPLIER_ADMIN | Harvest Hub (`harvest.internal`) |
| `vendor@harvest.internal` | SUPPLIER_VENDOR | Harvest Hub (`harvest.internal`) |

---

## 2. Session Binding (Single-Tab Restriction)

As requested, the system now strictly binds sessions to a single browser tab/window to prevent session sharing and state leakage.

### Implementation Details
- **Storage Strategy**: Migrated all authentication and session-related data from `localStorage` to `sessionStorage`.
- **Files Modified**:
  - [src/api.ts](file:///home/arun/IdeaProjects/shopro-pos/shopro-marketplace/src/api.ts): JWT injection now pulls from `sessionStorage`.
  - `src/pages/auth/*`: Login pages ([Supplier](file:///home/arun/IdeaProjects/shopro-pos/shopro-marketplace/src/pages/auth/SupplierLogin.tsx#18-115), [Restaurant](file:///home/arun/IdeaProjects/shopro-pos/shopro-marketplace/src/pages/auth/RestaurantLogin.tsx#19-119), [Operator](file:///home/arun/IdeaProjects/shopro-pos/shopro-marketplace/src/pages/auth/OperatorLogin.tsx#22-166)) now store tokens in `sessionStorage`.
  - [src/components/layout/OperatorShell.tsx](file:///home/arun/IdeaProjects/shopro-pos/shopro-marketplace/src/components/layout/OperatorShell.tsx): Authentication guard now checks `sessionStorage`.
  - [src/pages/auth/SupplierRegistration.tsx](file:///home/arun/IdeaProjects/shopro-pos/shopro-marketplace/src/pages/auth/SupplierRegistration.tsx): Onboarding drafts are now isolated per tab.
  - [src/components/ui/glowing-search.tsx](file:///home/arun/IdeaProjects/shopro-pos/shopro-marketplace/src/components/ui/glowing-search.tsx): Recent search history is now isolated per tab.

### Verification
- **Isolation**: Sessions are no longer shared across tabs. Opening a new tab requires a fresh login.
- **Persistence**: Sessions persist through page refreshes within the same tab.
- **Cleanup**: Sessions are automatically cleared when the tab is closed.
