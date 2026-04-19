# Inventory Intelligence APIs

## Overview

The **Inventory Intelligence System** automatically tracks inventory depletion when orders are placed. The simulator should **NOT** manually call fulfillment APIs - the backend handles this automatically through entity listeners or service hooks.

## APIs Exposed by InventoryIntelligenceController

### Base Path
```
/api/v1/restaurants/{restaurantId}/inventory/intelligence
```

### 1. POST /fulfill-order/{orderId}
**Purpose**: Manually trigger inventory depletion for an order

**When to Use**: Only if automatic depletion fails or for retroactive order processing

**Request**:
```http
POST /api/v1/restaurants/3/inventory/intelligence/fulfill-order/123
```

**Response**: `200 OK`

**Note**: The simulator should **NOT** call this - depletion should happen automatically when orders are placed via the POS system.

---

### 2. POST /record-misfire
**Purpose**: Record a menu item that couldn't be fulfilled (86'd item)

**When to Use**: When kitchen runs out of an item and must void/refund

**Request**:
```http
POST /api/v1/restaurants/3/inventory/intelligence/record-misfire
  ?menuId=3036
  &orderId=123
  &reason=OUT_OF_STOCK
  &employeeId=5
```

**Parameters**:
- `menuId` (required): Menu item that was misfired
- `orderId` (optional): Associated order ID
- `reason` (required): Reason code (OUT_OF_STOCK, QUALITY_ISSUE, EQUIPMENT_FAILURE, etc.)
- `employeeId` (required): Employee who recorded the misfire

**Response**: `200 OK`

**Note**: The simulator **CAN** use this to simulate real-world scenarios where items are unavailable.

---

### 3. GET /profitability/{menuId}
**Purpose**: Get profitability analysis for a specific menu item

**When to Use**: EOD audits, menu engineering reports

**Request**:
```http
GET /api/v1/restaurants/3/inventory/intelligence/profitability/3036
```

**Response**:
```json
{
  "menuItemId": 3036,
  "itemName": "Duck Breast — Recipe",
  "sellPrice": 32.00,
  "theoreticalCost": 9.99,
  "actualCost": 10.50,
  "grossMargin": 22.01,
  "marginPct": 68.78,
  "variancePct": 5.1
}
```

---

### 4. GET /wastage/summary
**Purpose**: Get summary of all waste/misfire events in a date range

**When to Use**: EOD audits, weekly reviews

**Request**:
```http
GET /api/v1/restaurants/3/inventory/intelligence/wastage/summary
  ?start=2026-01-01T00:00:00
  &end=2026-01-01T23:59:59
```

**Response**:
```json
{
  "startDate": "2026-01-01T00:00:00",
  "endDate": "2026-01-01T23:59:59",
  "totalWasteValue": 125.50,
  "misfireCount": 3,
  "byReason": [
    {"reason": "OUT_OF_STOCK", "count": 2, "value": 85.00},
    {"reason": "QUALITY_ISSUE", "count": 1, "value": 40.50}
  ]
}
```

---

### 5. GET /ingredient/{ingredientId}/on-hand
**Purpose**: Get **derived** on-hand quantity (calculated from ledger, not master table)

**When to Use**: Real-time inventory checks, EOD audits

**Request**:
```http
GET /api/v1/restaurants/3/inventory/intelligence/ingredient/316/on-hand
```

**Response**:
```json
185.50
```

**Note**: This is the **true** on-hand quantity based on all transactions (receipts + depletion - waste), NOT the cached value in the ingredient master table.

---

## Architecture: How Depletion Works

### ✅ Correct Flow (Automatic)
```
1. Simulator → POST /pos/orders
   → Creates order with lines

2. Backend (OrderService) → Saves order
   → Triggers entity listener or service hook

3. Backend (InventoryIntelligenceService) → Automatically called
   → Calls orderFulfillment()
   → Creates DEPLETION ledger entries for each ingredient

4. Result: Inventory depleted automatically
```

### ❌ Wrong Flow (Manual)
```
1. Simulator → POST /pos/orders
2. Simulator → POST /inventory/intelligence/fulfill-order/{orderId}
   → DUPLICATE depletion!
```

## Why Automatic Depletion?

1. **Single Source of Truth**: Inventory intelligence is the only system that should create depletion entries
2. **Prevents Duplicates**: Automatic hooks ensure exactly one depletion per order
3. **Business Logic**: Handles recipe scaling, yield percentages, waste factors
4. **Audit Trail**: All depletion is traceable to specific orders

## Simulator Best Practices

### DO ✅
- Place orders via `/pos/orders`
- Trust that depletion happens automatically
- Use `/inventory/intelligence/profitability/{menuId}` for audits
- Use `/inventory/intelligence/wastage/summary` for EOD reports
- Use `/ingredients/low-stock` to check inventory levels
- Use `/inventory/intelligence/record-misfire` to simulate 86'd items

### DON'T ❌
- Call `/fulfill-order/{orderId}` manually (causes double depletion)
- Directly update `ingredient.on_hand` via SQL
- Directly insert into `inventory_ingredient_ledger`
- Bypass the intelligence system

## Troubleshooting

### If Depletion Is NOT Happening

1. **Check Backend Logs**:
   ```bash
   tail -f /tmp/server.log | grep -i "fulfillment\|depletion"
   ```

2. **Verify Order Status**:
   - Depletion may only trigger on PAID orders
   - Ensure order status transitions: PENDING → PAID

3. **Check Entity Listeners**:
   - Look for `@PostPersist` or `@PostUpdate` on Order entity
   - Verify InventoryIntelligenceService is being called

4. **Test Manually**:
   ```bash
   # Place an order
   curl -X POST http://localhost:8080/api/v1/restaurants/3/pos/orders ...
   
   # Check ledger
   curl http://localhost:8080/api/v1/restaurants/3/inventory/stats
   ```

### If Depletion IS Happening (Double)

1. **Check for Manual Calls**: Ensure simulator isn't calling `/fulfill-order`
2. **Check for Duplicate Hooks**: Backend may have multiple listeners
3. **Check Transaction Boundaries**: Depletion may be called outside transaction

## Current Simulator Status

As of 2026-04-18:
- ✅ Orders placed via REST (`/pos/orders`)
- ✅ Order status updated to PAID (`/pos/orders/{id}/status`)
- ❌ **NOT calling** `/fulfill-order` (correct!)
- ❌ **Depletion NOT happening** (backend issue to investigate)

## Next Steps

1. **Verify Backend**: Check if `InventoryIntelligenceService.orderFulfillment()` is being called automatically
2. **Add Logging**: Add debug logs to track depletion flow
3. **Test Manually**: Place one order and check ledger entries
4. **Fix Backend**: If auto-depletion isn't working, fix the backend hook

## Related Files

- Controller: `shopro-res/src/main/java/mls/sho/dms/application/inventory/web/InventoryIntelligenceController.java`
- Service: `shopro-res/src/main/java/mls/sho/dms/application/inventory/service/InventoryIntelligenceService.java`
- Entity Listener: Check `Order.java` or `OrderService.java` for hooks

## Last Updated
2026-04-18 - Documented correct API usage and architecture
