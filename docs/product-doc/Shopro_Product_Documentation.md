# Shopro Restaurant POS — Product Documentation

## 1. Executive Summary
Shopro is a high-fidelity, full-stack restaurant management platform designed for the modern hospitality industry. It seamlessly integrates front-of-house operations (Floor Plan, Tableside Ordering) with back-of-house controls (Inventory, Procurement, Recipe Costing) and guest-centric growth tools (CRM, Loyalty).

Built with a focus on premium aesthetics and real-time synchronization, Shopro ensures that every staff member — from the host at the entrance to the chef in the kitchen — operates with a single, accurate view of the restaurant's heartbeat.

---

## 2. Core Modules & Features

### Staff Security & Access  <!-- feature-id: staff-login -->

**What it does**
The Staff Login module is the secure gateway to the system. It ensures that only authorized personnel can access sensitive restaurant data and perform operations based on their specific role (e.g., Server, Manager, or Admin).

**How it works**
1. Staff enter their unique 4-digit PIN on the terminal.
2. The system validates the PIN and identifies the staff member's role.
3. Upon successful login, the user is redirected to the Main Dashboard with permissions tailored to their job function.

**Business Rules**
- PINs must be unique within the venue.
- Automatic login occurs as soon as the 4th digit is entered for speed during busy shifts.
- Role-based access control (RBAC) hides or disables modules the user is not authorized to see.

---

### Central Command Dashboard  <!-- feature-id: dashboard-main -->

**What it does**
The Dashboard serves as the command center for every staff member. It provides high-level visibility into all restaurant modules and acts as the primary navigation hub.

**What you'll see**
- **Personalized Header**: Greets the logged-in staff member.
- **Navigation Cards**: Direct links to Floor Plans, Menu Management, Inventory, and CRM.
- **Smart Filtering**: Only shows the cards that the current user has permission to access.

---

### Menu Management  <!-- feature-id: menu-mgmt -->

**What it does**
Menu Management allows restaurant leaders to define their culinary offerings. It handles everything from high-level categories to the specific details of individual dishes, including pricing, photography, and availability.

**Key Features**
- **Categories**: Organize the menu into sections like Starters, Mains, and Desserts with drag-and-drop reordering.
- **Live vs. Draft**: Edit menu changes in a "Draft" workspace and "Publish" them all at once when ready.
- **86'ing (Out of Stock)**: A one-tap toggle to mark items as unavailable, instantly updating all POS and guest-facing digital menus.

---

### Live Floor Plan & Waitlist  <!-- feature-id: floor-mgmt -->

**What it does**
This module provides a real-time, visual representation of the restaurant's dining area. It is the primary tool for seating guests, tracking table status, and managing walk-in traffic.

**How it works**
- **Visual Status**: Tables are color-coded (Green: Available, Blue: Occupied, Orange: Dirty) for instant recognition.
- **Waitlist Integration**: Drag party names from the waitlist directly onto an available table to seat them.
- **Table Actions**: A premium modal for seating walk-ins, marking tables as cleaned, or manual status overrides.

---

### Inventory & Procurement  <!-- feature-id: inventory-procurement -->

**What it does**
Shopro takes the guesswork out of stock management. By linking recipes to the pantry, the system provides real-time stock levels, automated reordering, and precise food costing.

**Key Features**
- **Stock Tracking**: Monitor ingredients with yield-adjusted costing and critical stock level alerts.
- **Purchase Orders**: A full procurement lifecycle — from drafting an order to manager approval and supplier tracking via a Kanban board.
- **Recipe Builder**: Define exact ingredient quantities for every menu item. This enables "Theoretical Food Cost" calculation and automatic stock depletion upon sale.

---

### CRM & Loyalty  <!-- feature-id: crm-loyalty -->

**What it does**
The CRM (Customer Relationship Management) module builds lasting guest relationships. It tracks visit history, preferences, and loyalty points to enable personalized service and high-impact marketing.

**Key Features**
- **Guest Profiles**: Store contact info, dietary tags (e.g., Vegan), and special occasions (e.g., Anniversaries).
- **Loyalty Program**: Tiered memberships (Gold, Platinum) that reward guests with redeemable points for every spend.
- **Profile Merging**: A safe tool to combine duplicate guest entries into a single clinical record.
- **CRM Analytics**: Identify "At-Risk" guests who haven't visited lately and trigger "Win-Back" offers.

---

### Tableside Ordering  <!-- feature-id: tableside-settings -->

**What it does**
Tableside Ordering empowers guests to use their own devices to browse the menu and order. This reduces the burden on servers and increases table turnover rates.

**Manager Controls**
- **QR Generation**: Generate and print secure QR codes for every table.
- **Server Approval**: A safety toggle that ensures a staff member reviews and approves guest carts before they reach the kitchen.

---

### Taxes & Compliance  <!-- feature-id: tax-rules -->

**What it does**
The system automates complex tax calculations across different jurisdictions. It handles rules based on item type, temperature, and order source (Dine-in vs. Takeaway).

**Key Features**
- **Rule Engine**: Automatically applies VAT/GST based on regional laws.
- **Administrative Overrides**: Allows managers to adjust rates within legal bounds for emergency updates.
- **Bill Simulator**: A tool to verify exactly how taxes will appear on a guest's check before going live.

---

## 3. Data Architecture (Technical Mapping)

| Functional Area | Primary API Endpoints | Database Entities |
|---|---|---|
| Menu & Catalog | `/api/menu/items`, `/api/menu/categories` | `MenuItem`, `MenuCategory` |
| Operations | `/api/floor/tables`, `/api/floor/waitlist` | `TableShape`, `WaitlistEntry` |
| Supply Chain | `/api/inventory/ingredients`, `/api/procurement/...` | `RawIngredient`, `PurchaseOrder` |
| Guest Relations | `/api/crm/customers`, `/api/crm/transactions` | `CustomerProfile`, `LoyaltyTier` |
| Compliance | `/api/taxes/rules` | `TaxRule`, `Country` |

---

## 4. Business Rules & Logic

- **Live Depletion**: Stock is deducted only upon "Fulfillment" of an order, following the recipe definition.
- **Access Hierarchy**: Sensitive actions (Price changes, Tax overrides, Stock adjustments) require "Manager" or "Admin" role permissions.
- **Tax Precedence**: Item-level tax tags take precedence over category-level defaults.
- **Session Consistency**: DPoP-signed sessions ensure that staff cannot have their identity spoofed across different devices.

---

## 5. Feature Deep Dives & Architectural Specs

For detailed technical implementations, data structures, and lifecycle logic, refer to the following:

*   [Menu Management & Versioning](file:///home/arun/IdeaProjects/shopro-pos/docs/product-doc/Menu_Management_Deep_Dive.md)
*   [Staff Security, FAPI 2.0 & Dashboard](file:///home/arun/IdeaProjects/shopro-pos/docs/product-doc/Staff_Security_Deep_Dive.md)
*   [Live Floor Plan & Waitlist Dynamics](file:///home/arun/IdeaProjects/shopro-pos/docs/product-doc/Floor_Plan_Deep_Dive.md)
*   [Supply Chain, Recipes & RFQ Automation](file:///home/arun/IdeaProjects/shopro-pos/docs/product-doc/Supply_Chain_Deep_Dive.md)
*   [Procurement Policy & 3-Way Match](file:///home/arun/IdeaProjects/shopro-pos/docs/product-doc/Procurement_Policy_Deep_Dive.md)
*   [Guest Relations & Loyalty Systems](file:///home/arun/IdeaProjects/shopro-pos/docs/product-doc/Guest_Relations_Deep_Dive.md)
*   [Tableside Ordering & QR Security](file:///home/arun/IdeaProjects/shopro-pos/docs/product-doc/Tableside_Ordering_Deep_Dive.md)
*   [Taxes, Compliance & Bill Simulation](file:///home/arun/IdeaProjects/shopro-pos/docs/product-doc/Taxes_&_Compliance_Deep_Dive.md)

---
*Generated by Shopro Documentation Engine*
