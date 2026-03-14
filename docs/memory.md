# Shopro POS Memory File

This file serves as a persistent reference for complex business logic, state machines, and cross-component architectures.

## Table State Machine & Notification Flow

The table dining lifecycle consists of an 11-state machine. Transitions are triggered by specific staff roles or automated system processes.

```mermaid
stateDiagram-v2
    direction TB

    %% States
    state "AVAILABLE (Green)" as AV
    state "HELD (Yellow)" as HE
    state "OCCUPIED (Blue)" as OC
    state "ORDER_PLACED (Purple)" as OP
    state "FOOD_DELIVERED (Orange)" as FD
    state "DESSERT_COURSE (Pink)" as DC
    state "CHECK_DROPPED (Black)" as CD
    state "PAYING (Gray)" as PA
    state "DIRTY (Red)" as DI
    state "CLEANING (Brown)" as CL
    state "MAINTENANCE (White)" as MA

    %% Transitions
    AV --> HE : 15m Hold (System)\n[Notification: TABLE_HELD]
    HE --> AV : Cancel (Host)\n[Notification: TABLE_RELEASED]
    
    AV --> OC : Seat Party (Host/Server)\n[Notification: TABLE_OCCUPIED]
    HE --> OC : Guest Arrived (Host)\n[Notification: TABLE_OCCUPIED]
    
    OC --> OP : Send Kitchen (Server/Guest)\n[Notification: KDS_ORDER_SENT]
    
    OP --> FD : Expo Bump (Food Runner)\n[Notification: TICKET_READY]
    
    FD --> DC : Fire Course (Server)\n[Notification: COURSE_FIRED]
    FD --> CD : Print Bill (Server)\n[Notification: BILL_PRINTED]
    DC --> CD : Print Bill (Server)\n[Notification: BILL_PRINTED]
    
    CD --> PA : Start Payment (Server/Guest)\n[Notification: PAYMENT_PENDING]
    PA --> DI : Paid (System/POS)\n[Notification: TABLE_DIRTY]
    
    CD --> AV : Cash/Fast Pay (Server)\n[Notification: TABLE_VACANT]
    
    DI --> CL : Start Cleaning (Busser)\n[Notification: CLEANING_IN_PROGRESS]
    CL --> AV : Mark Clean (Busser/Host)\n[Notification: TABLE_VACANT]
    
    AV --> MA : Deactivate (Manager)
    MA --> AV : Re-activate (Manager)
```

### State Definitions & Actors

| Current State | Next State | Triggering Actor | Event / Action | Notification | Recipients |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AVAILABLE** | **HELD** | **System** | 15 min before reservation | `TABLE_HELD` | Host, Manager |
| **AVAILABLE** | **OCCUPIED** | **Host / Server**| Seating a party manually | `TABLE_OCCUPIED`| Assigned Server |
| **HELD** | **OCCUPIED** | **Host** | Guest for reservation arrived| `TABLE_OCCUPIED`| Assigned Server |
| **OCCUPIED** | **ORDER_PLACED**| **Server / Guest**| "Send to Kitchen" action | `KDS_ORDER_SENT` | Kitchen Staff |
| **ORDER_PLACED**| **FOOD_DELIVERED**| **Food Runner** | Bumping ticket at Expo | `TICKET_READY` | Server, Runner |
| **FOOD_DELIVERED**| **DESSERT_COURSE**| **Server** | Firing a dessert course | `COURSE_FIRED` | Kitchen (Pastry) |
| **FOOD/DESSERT**| **CHECK_DROPPED**| **Server** | Printing the bill | `BILL_PRINTED` | Host Stand |
| **CHECK_DROPPED**| **PAYING** | **Server / Guest**| Swiping card / Initiating pay | `PAYMENT_PENDING`| N/A |
| **PAYING** | **DIRTY** | **System** | Payment Authorization OK | `TABLE_DIRTY` | Bussers |
| **DIRTY** | **CLEANING** | **Busser** | Starting the reset process | `CLEANING_IN_PROG`| N/A |
| **CLEANING** | **AVAILABLE** | **Busser / Host** | Marking table ready | `TABLE_VACANT` | Hosts |

### Key Notification Recipients Summary
- **Servers:** `TABLE_OCCUPIED`, `TICKET_READY`, `CALL_BUTTON`
- **Hosts:** `TABLE_HELD`, `TABLE_VACANT`, `BILL_PRINTED`, `VIP_ALERT`
- **Bussers:** `TABLE_DIRTY`
- **Kitchen:** `KDS_ORDER_SENT`, `COURSE_FIRED`
- **Food Runners:** `TICKET_READY`

---

## Tableside Ordering & Feedback System

### Secure Session Management
Tableside ordering is secured via dynamic QR tokens tied to individual tables.
- **QR Base URL:** `https://tableasist.afriqpay.com/scan/{token}`
- **Staff Approval:** All new sessions start in `PENDING_APPROVAL`; staff must approve via "Tableside Requests" in the Floor Plan sidebar.
- **Instant Occupancy:** A QR scan triggers an immediate `OCCUPIED` transition on the table AND sends a `TABLE_OCCUPIED` notification to all staff.
- **Auto-Invalidation:** Sessions are set to `EXPIRED` automatically when a table is marked `CLEAN`, preventing QR reuse.

### Notification Events (Tableside)
| Event | Code | Recipients |
| :--- | :--- | :--- |
| Guest scans QR | `TABLE_OCCUPIED` | Servers, Hosts |

### Item Feedback Tracking
Guests can rate specific dishes from the app.
- **Entity:** `MenuItemRating` — stores `menuItemId`, `orderId`, rating (1–5), comment.
- **Endpoint:** `POST /api/v1/tableside/menu/items/feedback`
- **Usage:** Back-office reporting on dish performance.

### Premium UX Architecture (Guest App)
The Tableside Flutter app uses a "Hero & Sheet" interaction model:
- **Hero Transitions:** Smooth animation from menu grid → Item Detail Sheet.
- **Preparation Time:** Shown on menu grid cards AND in the detail sheet.
- **Clutter-Free:** All cart actions are localized to the Detail Sheet (nothing on the grid card itself).
