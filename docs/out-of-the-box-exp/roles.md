# Shopro POS: Role Definitions & Permissions

Welcome to the Shopro POS "Out of the Box" experience. This document outlines the pre-configured roles and their associated responsibilities within the system.

## 🏛️ Management Roles

### **OWNER**
- **Mental Model**: "The Captain."
- **Responsibilities**: Full system access, financial oversight, personnel management, and critical system configuration.
- **Key Permissions**: `ADMIN:SYSTEM_SETTINGS`, `REPORT:FULL_FINANCIAL`, `ADMIN:PIN_RESET`.

### **GENERAL_MANAGER**
- **Mental Model**: "The Operations Lead."
- **Responsibilities**: Daily store operations, staff coordination, and advanced problem resolution.
- **Key Permissions**: `ORDER:VOID_ITEM`, `PAYMENT:VOID_BILL`, `INVENTORY:VIEW`.

---

## 🍽️ Front of House (FOH)

### **SENIOR_SERVER** / **SERVER**
- **Mental Model**: "The Guest Advocate."
- **Responsibilities**: Table service, order entry, and payment processing.
- **Key Permissions**: `ORDER:CREATE`, `ORDER:VIEW_OWN`, `PAYMENT:PROCESS`.

### **HOST**
- **Mental Model**: "The Gatekeeper."
- **Responsibilities**: Greeting guests, managing the waitlist, and table assignments.
- **Key Permissions**: `FLOOR:TABLE_ASSIGN`, `CRM:VIEW`.

### **BARTENDER**
- **Mental Model**: "The Craftsman."
- **Responsibilities**: Managing the bar station and processing drink orders.
- **Key Permissions**: `ORDER:CREATE`, `KDS:VIEW`.

### **BUSSER**
- **Mental Model**: "The Support Crew."
- **Responsibilities**: Clearing tables and maintaining floor cleanliness.
- **Key Permissions**: `FLOOR:VIEW`, `FLOOR:TABLE_ASSIGN`.

---

## 🍳 Back of House (BOH)

### **KITCHEN_MANAGER**
- **Mental Model**: "The Culinary Director."
- **Responsibilities**: Inventory control, recipe precision, and Expo coordination.
- **Key Permissions**: `INVENTORY:PO_CREATE`, `KDS:PRIORITIZE`, `KDS:VIEW`.

### **STATION_MANAGER**
- **Mental Model**: "The Station Lead."
- **Responsibilities**: Direct oversight of specific KDS stations (e.g., Grill, Fry) and quality control.
- **Key Permissions**: `KDS:VIEW`, `KDS:COMPLETE`, `KDS:PRIORITIZE`.

---

> [!TIP]
> Each role inherits permissions designed to minimize operational friction while maintaining strict audit trails and security.
