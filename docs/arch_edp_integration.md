# Architecture Document: Shopro Event-Driven Protocol (EDP)

## Overview

The **Event-Driven Protocol (EDP)** is the backbone of real-time communication and state synchronization across all layers of the Shopro POS system — from the Flutter client through the Spring Boot backend to the Kitchen Display System (KDS), inventory, and floor plan surfaces.

This document provides a precise, implementation-grounded reference for every event type the system recognizes, its exact payload structure, who produces it, and which consumers react to it.

---

## 1. Core Architecture: The Dual-Layer Delivery Model

Every event published in the system flows through two channels simultaneously, governed by the `EdpPublisher` service.

```
[Producer Service]
       │
       ▼
 EdpPublisher.publish(eventType, payload)
       │
   ┌───┴────────────────────────┐
   │                            │
   ▼                            ▼
EventStoreService.append()    ApplicationEventPublisher.publishEvent()
(PostgreSQL: event_store)     (Spring In-Process Bus)
                                    │
                          ┌─────────┼─────────────┐
                          ▼         ▼              ▼
                 StationEventConsumer  InventoryEventConsumer
                 OrderActionConsumer   PosStatusConsumer
```

### 1.1 Persistence Layer: `EventStore`

Every event is immediately persisted to the `event_store` PostgreSQL table with the following schema:

| Column       | Type        | Description                                          |
|--------------|-------------|------------------------------------------------------|
| `id`         | `BIGINT`    | Auto-incremented sequence (used for consumer checkpoints) |
| `event_id`   | `UUID`      | Globally unique event identifier                     |
| `event_type` | `VARCHAR`   | Dot-notated event name (e.g. `order.fire`)           |
| `timestamp`  | `TIMESTAMPTZ` | Server-side time of event creation                 |
| `payload`    | `JSONB`     | Domain-specific data; varies by event type           |

This append-only design provides:
- **Durability** within the originating transaction (event is saved before consumers run).
- **Replay capability** for catch-up scenarios after a crash or missed WebSocket message.
- **Consumer checkpoints** via the `consumer_checkpoint` table, allowing each consumer to track its own cursor independently.

### 1.2 In-Process Bus: Spring `ApplicationEventPublisher`

After persisting, the saved `EventStore` entity is published on the Spring internal event bus. All `@EventListener`-annotated beans will receive it synchronously within the same transaction. Each consumer independently filters events by `eventType` using a guard clause at the top of its handler.

---

## 2. Complete Event Catalogue

The system recognises **9 distinct event types** across three domains.

---

### Domain A: Order Lifecycle

#### Event 1 — `order.created`
**Produced by:** `OrderServiceImpl.createOrder()`  
**Trigger:** A new order ticket is opened for a table or takeaway.

**Payload:**
```json
{
  "orderId":  "<UUID>",
  "tableId":  "<UUID | null>",
  "type":     "DINE_IN | TAKEAWAY | DELIVERY",
  "serverId": "<UUID>"
}
```
**Consumers:**
- `StationEventConsumer`: Receives this event but currently passes through (sets checkpoint only). Reserved for future KDS pre-routing.

---

#### Event 2 — `order.fire`
**Produced by:** `OrderServiceImpl.sendToKitchen()`  
**Trigger:** The server taps "Send to Kitchen" or fire a course. Each unit of each item generates **one independent event** to enable unit-level tracking.

**Payload:**
```json
{
  "orderId":     "<UUID>",
  "orderItemId": "<UUID>",
  "menuItemId":  "<UUID>",
  "unitIndex":   1,
  "quantity":    1,
  "timestamp":   "2026-03-28T01:02:03.456Z"
}
```
> `unitIndex` distinguishes individual units of the same item. For 3 Burgers, three separate `order.fire` events are published with `unitIndex: 1`, `2`, and `3`.

**Consumers:**
- `StationEventConsumer`: Routes the unit to the correct KDS station, sets the `firedAt` timestamp on the `kds_ticket_item` row.
- `InventoryEventConsumer`: Calls `RecipeService.depleteForOrderItem()` to reduce raw ingredient stock.

---

#### Event 3 — `order.item_decrement`
**Produced by:** `OrderServiceImpl.updateItemQuantity()` (quantity decrease) or the Flutter POS via the LIFO stack.  
**Trigger:** A server reduces the quantity of a sent item (e.g., guest changes their mind before cooking begins).

**Payload:**
```json
{
  "orderId":     "<UUID>",
  "orderItemId": "<UUID>",
  "menuItemId":  "<UUID>",
  "unitIndex":   3,
  "quantity":    1,
  "timestamp":   "2026-03-28T01:02:03.456Z",
  "type":        "order.item_decrement"
}
```
> The `timestamp` field **must match** the `firedAt` value stored on the target `kds_ticket_item` row. This is the "Perfect Unit Identity" triplet: `(orderItemId, unitIndex, firedAt)`.

**Consumers:**
- `StationEventConsumer`: Calls `KDSService.decrementSpecificUnit()`. If the unit is still `PENDING`, removes it and publishes `order.item_decrement_ok`. If the unit is `COOKING` or later, publishes `order.item_decrement_ko`.

---

#### Event 4 — `order.item_decrement_ok`
**Produced by:** `StationEventConsumer` (after successful KDS match).  
**Trigger:** The KDS confirmed that the targeted unit was `PENDING` and has been removed.

**Payload:**
```json
{
  "orderId":       "<UUID>",
  "orderItemId":   "<UUID>",
  "menuItemId":    "<UUID>",
  "unitIndex":     3,
  "quantity":      1,
  "timestamp":     "<original firedAt>",
  "status":        "OK",
  "resultTimestamp": "2026-03-28T01:02:04.000Z"
}
```
**Consumers:**
- `StationEventConsumer` itself: Also calls `OrderService.processConfirmedDecrement()` to formally reduce the DB quantity by 1.
- **Flutter POS (`OrderWatcher`)**: Receives this via WebSocket `REFRESH`. Finalises the optimistic UI deduction.

---

#### Event 5 — `order.item_decrement_ko`
**Produced by:** `StationEventConsumer` (after failed KDS match).  
**Trigger:** The KDS rejected the decrement because the unit has already started cooking.

**Payload:**
```json
{
  "orderId":       "<UUID>",
  "orderItemId":   "<UUID>",
  "menuItemId":    "<UUID>",
  "unitIndex":     3,
  "quantity":      1,
  "timestamp":     "<original firedAt>",
  "status":        "KO",
  "resultTimestamp": "2026-03-28T01:02:04.000Z"
}
```
**Consumers:**
- **Flutter POS (`OrderWatcher`)**: Rolls back the optimistic UI decrement; the count is restored to its previous value. The user sees an error message.

---

#### Event 6 — `order.item_void`
**Produced by:** `OrderServiceImpl.voidOrderItem()`  
**Trigger:** A specific item is voided from the order (requires manager PIN if already sent to kitchen).

**Payload:**
```json
{
  "orderId":     "<UUID>",
  "orderItemId": "<UUID>",
  "reason":      "Guest changed mind",
  "performedBy": "manager@example.com"
}
```
**Consumers:**
- `OrderActionConsumer`: Calls `KDSService.voidItemInKDS()` to cancel all corresponding KDS tickets for the item.

---

#### Event 7 — `order.cancel`
**Produced by:** `OrderServiceImpl.cancelOrder()`  
**Trigger:** An entire order is cancelled. Requires manager PIN if any items are already cooking.

**Payload:**
```json
{
  "orderId":     "<UUID>",
  "reason":      "Order voided",
  "performedBy": "manager@example.com"
}
```
**Consumers:**
- `OrderActionConsumer`: Calls `KDSService.cancelKDSTickets()` to void all KDS tickets for the order.

---

#### Event 8 — `order.payment_completed`
**Produced by:** `OrderServiceImpl.completePayment()`  
**Trigger:** The guest's payment is successfully processed.

**Payload:**
```json
{
  "orderId":       "<UUID>",
  "totalAmount":   142.50,
  "paymentMethod": "CASH | CARD | MIPAY"
}
```
**Consumers:**
- No internal `@EventListener` consumers currently. The notification engine and floor plan broadcast are triggered directly from the service (table → `DIRTY` status, busser push notification).
- **Flutter POS**: Triggers physical receipt printing via the NEXGO EF60 hardware bridge.

---

### Domain B: KDS Status Changes

#### Event 9 — `kds.item.status_changed`
**Produced by:** `KDSService.updateKDSItemStatus()`  
**Trigger:** A chef or expo changes the status of an item on the KDS screen (e.g., `PENDING → COOKING → READY`).

**Payload:**
```json
{
  "orderItemId": "<UUID>",
  "orderId":     "<UUID>",
  "unitIndex":   1,
  "newStatus":   "COOKING | READY | SERVED | PAUSED",
  "priority":    "NORMAL | HIGH"
}
```
**Consumers:**
- `PosStatusConsumer`: Maps the KDS status to a POS `OrderItemStatus` and updates the `order_item` row. Applies a "quorum rule" — only upgrades to `READY` or `DELIVERED` once **all units** of the item have reached that status.

---

### Domain C: Floor Plan & Table Lifecycle

#### Event 10 — `table.status_changed`
**Produced by:** `FloorPlanServiceImpl` (multiple methods: `seatParty`, `markTableClean`, `updateTableStatus`, `updateReservationHolds`).  
**Trigger:** Any change to a table's physical state.

**Payload:**
```json
{
  "tableId":   "<UUID>",
  "tableName": "A3",
  "newStatus": "AVAILABLE | OCCUPIED | HELD | DIRTY | ORDER_PLACED | FOOD_DELIVERED"
}
```
**Consumers:**
- No `@EventListener` currently. Table status changes are broadcast immediately via WebSocket `/topic/tables`. The EDP event exists for **audit trail and future cross-service consumption** (e.g., a housekeeping microservice).

---

## 3. Consumer Registry

| Consumer Class           | `CONSUMER_ID`      | Events Handled                                 | Side Effects                                        |
|--------------------------|--------------------|------------------------------------------------|-----------------------------------------------------|
| `StationEventConsumer`   | `STATION_ROUTER`   | `order.created`, `order.fire`, `order.item_decrement` | Routes items to KDS; triggers OK/KO publish; DB decrement |
| `InventoryEventConsumer` | `INV_SYNC`         | `order.fire`                                   | Depletes raw ingredient stock via `RecipeService`    |
| `OrderActionConsumer`    | `order_action_sync`| `order.cancel`, `order.item_void`              | Cancels or voids KDS tickets                         |
| `PosStatusConsumer`      | `pos_status_sync`  | `kds.item.status_changed`                      | Syncs KDS status → POS `OrderItemStatus`; quorum check |
| `POEventListener`        | (Inventory module) | Inventory purchase order events                | Restocks ingredient levels                           |

---

## 4. Flutter POS Client: LIFO Stack Protocol

The Flutter app maintains a separate in-memory protocol on top of EDP to handle optimistic UI updates and precise decrement targeting.

### 4.1 LIFO Stack Per Item
For each `orderItemId`, the `OrderNotifier` maintains a stack of `{unitIndex, timestamp}` pairs.

```
Item: "Burger" (orderItemId: abc-123)
Stack (top → bottom):
  Unit 3 | firedAt: 2026-03-28T02:01:28.711
  Unit 2 | firedAt: 2026-03-28T02:01:28.450
  Unit 1 | firedAt: 2026-03-28T02:01:28.201
```
When the "-" button is tapped:
1. Pop the **top** entry `(unitIndex: 3, timestamp: 2026-03-28T02:01:28.711)`.
2. Immediately decrement the local UI count (optimistic).
3. Publish `EdpEvent.itemDecrement(orderId, orderItemId, menuItemId, unitIndex: 3, timestamp: "2026-03-28T02:01:28.711")` to the backend via REST.

### 4.2 Event Filtering (Flicker Prevention)
The `OrderWatcher` inside `OrderNotifier` subscribes to `/topic/orders/{orderId}` via STOMP/WebSocket. It **ignores** incoming `order.fire` and `order.item_decrement` events to prevent overwriting the local optimistic state with intermediate database snapshots.

Only these signals trigger a full state re-sync from the database:
- `REFRESH` string (explicit signal from the server after `OK`/`KO` resolution).
- `order.item_decrement_ok` or `order.item_decrement_ko` payloads.

---

## 5. End-to-End Flow: Firing and Cancelling a Unit

```
Server taps "Remove 1 Burger"
         │
         ▼
[POS Flutter]
  1. Pop LIFO → (unitIndex=3, ts=T1)
  2. UI: qty 3 → 2 (optimistic)
  3. POST /orders/{id}/items/{itemId}?newQuantity=2
         │
         ▼
[OrderServiceImpl]
  4. Detects partial decrement (qty was 3 in DB)
  5. Calls KDSService.decrementSpecificUnit(itemId, 3, null) — immediate path
  6. Publishes EDP: order.item_decrement {unitIndex:3, timestamp:T1}
         │
         ▼
[StationEventConsumer]
  7. Finds kds_ticket_item WHERE (orderItemId, unitIndex=3, firedAt=T1)
  8a. If PENDING → voids item, publishes order.item_decrement_ok
       └→ [OrderServiceImpl] processConfirmedDecrement() → qty in DB: 3→2
       └→ WebSocket REFRESH signal sent to POS
  8b. If COOKING → publishes order.item_decrement_ko
       └→ WebSocket REFRESH signal sent to POS
         │
         ▼
[POS Flutter OrderWatcher]
  9a. On OK → REFRESH received → re-fetches order → confirms qty=2 ✓
  9b. On KO → REFRESH received → re-fetches order → rolls back qty=2→3 ✗
```

---

## 6. Key Design Principles

| Principle | Implementation |
|---|---|
| **Durability** | Events are persisted to PostgreSQL *before* any consumer runs |
| **At-Least-Once Delivery** | Consumer checkpoints allow replay from last known position |
| **Optimistic UI** | POS updates locally before server confirmation to feel responsive |
| **Idempotency Anchor** | `(orderItemId, unitIndex, firedAt)` triplet prevents double-decrements |
| **Decoupling** | Consumers are independent beans; adding a new one requires no changes to producers |
| **Audit Trail** | Every state change is permanently recorded in `event_store` |
