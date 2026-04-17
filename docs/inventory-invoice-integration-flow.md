# Real-Time Inventory & Invoice Integration Flow

## Overview

This document describes the end-to-end flow of **Purchase Orders → Goods Receipts → Invoices → Inventory Intelligence** and how each step integrates with the real-time inventory management system.

---

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Purchase Order │────▶│ Goods Receipt  │────▶│     Invoice     │
│     (PO)        │     │     (GRN)      │     │    (AP)        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────┐
                                              │   Inventory     │
                                              │  Intelligence   │
                                              │  (FIFO Ledger) │
                                              └─────────────────┘
```

---

## Step-by-Step Flow

### Step 1: Create Purchase Order (PO)

**Purpose:** Initiate procurement from a supplier

**Process:**
- User creates PO with line items (ingredient, qty, unit price)
- PO status set to `SENT`
- No inventory impact yet

**Database Impact:**
- `purchase_order` table created
- `purchase_order_line` table populated

---

### Step 2: Receive Stock - Create Goods Receipt (GRN)

**Purpose:** Record physical intake of goods

**Process:**
1. User selects a SENT PO in GRN Editor
2. Enters received quantities for each line
3. Clicks "Finalize Receipt"

**Backend Flow:**
```
GRNController.receiveStockDirectly()
  ├─ Create temporary PO with lines
  ├─ Create GRN (links to PO)
  ├─ InventoryIntelligenceService.receiveShipment()
  │   ├─ Create FIFO lots (InventoryActiveLot)
  │   └─ Create ledger entries (RECEIVING)
  ├─ Update ingredient.onHand (physical stock)
  └─ Auto-create draft invoice
```

**Database Impact:**
- `goods_receipt` table
- `inventory_active_lot` table (FIFO lots)
- `inventory_ingredient_ledger` table (RECEIVING entries)
- `ingredient.onHand` updated

---

### Step 3: Invoice Entry & Verification

**Purpose:** Record supplier's tax invoice and verify against PO/GRN

**Process:**
1. User selects GRN in Invoice Editor
2. Enters supplier invoice number, date
3. Optionally adds adjustments (delivery charges, discounts)
4. System validates 3-way match (PO qty = GRN qty = Invoice qty)

**Database Impact:**
- `purchase_invoice` table created (status: DRAFT)
- Links to `goods_receipt_id`

---

### Step 4: Post Invoice - Critical Integration Point

**Purpose:** Finalize invoice and update inventory cost basis

**Process:**
1. User clicks "Post Invoice"
2. System validates invoice is balanced
3. Status changes to `POSTED`
4. **Key Integration:** Cost basis update triggers

**Backend Flow:**
```
PurchaseInvoiceService.postInvoice()
  ├─ Validate invoice balanced
  ├─ Set status = POSTED
  └─ updateIngredientCostBasis()
      ├─ For each line:
      │   ├─ Update ingredient.purchaseUnitPrice
      │   └─ InventoryIntelligenceService.recordCostBasisUpdate()
      │       ├─ Create ledger entry (COST_BASIS_UPDATE)
      │       └─ Record experiment metric
      └─ Save to ingredient_repository
```

**Database Impact:**
- `purchase_invoice.status` → POSTED
- `ingredient.purchase_unit_price` → updated with latest price
- `inventory_ingredient_ledger` → COST_BASIS_UPDATE entry

---

## Inventory Intelligence Integration

### Why Invoice Posting Updates Inventory

1. **Real-Time Cost Basis**
   - When invoice is posted, the actual purchase price is confirmed
   - This updates `ingredient.purchaseUnitPrice`
   - All future FIFO lot valuations use this price

2. **FIFO Lot Valuation**
   - InventoryIntelligenceService tracks lots with unit prices
   - When depleting stock (POS sale), cost = oldest lot price
   - Invoice posting ensures prices are current

3. **Variance Analysis**
   - Ledger entries track movement types:
     - `RECEIVING` - GRN intake
     - `DEPLETION` - POS sale
     - `MISFIRE` - Kitchen error
     - `DISCARD` - Spoilage
     - `RECONCILIATION` - Physical count
     - `COST_BASIS_UPDATE` - Invoice posted

4. **Analytics Triggers**
   - Experiment metrics recorded:
     - `WASTE_VALUE` - On misfire/discard
     - `INVOICE_POSTED_VALUE` - On invoice post

---

## Ledger Movement Types

| Movement Type | Trigger | Effect |
|--------------|---------|--------|
| `RECEIVING` | GRN finalized | +Qty to ledger |
| `DEPLETION` | POS order fulfilled | -Qty from FIFO lots |
| `MISFIRE` | Kitchen error recorded | -Qty, tracked as waste |
| `DISCARD` | Manual spoilage entry | -Qty, tracked as waste |
| `RECONCILIATION` | Physical count entry | Adjusts theoretical qty |
| `COST_BASIS_UPDATE` | Invoice posted | Updates unit price |

---

## Real-Time Inventory Calculations

### On-Hand Quantity
```
Theoretical On-Hand = SUM(ledger.quantity) for all movements
Live On-Hand = ledger_repository.sumQuantityByIngredient()
```

### FIFO Depletion
```java
// Always consumes oldest lots first
activeLots = findAvailableLotsOrderByFifo();
for (lot : activeLots) {
    consume = min(lot.availableQty, remainingToDeplete);
    lot.availableQty -= consume;
    createLedgerEntry(DEPLETION, consume, lot.unitPrice);
}
```

---

## API Endpoints

### Purchasing
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/purchase-orders` | POST | Create PO |
| `/purchasing/grns/receive` | POST | Direct stock receive |
| `/purchasing/grns/{id}/finalise` | POST | Finalize GRN |
| `/purchase-invoices/{id}/post` | POST | Post invoice |

### Inventory Intelligence
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/inventory/intelligence/fulfill-order/{orderId}` | POST | Record POS sale |
| `/inventory/intelligence/record-misfire` | POST | Record kitchen error |
| `/inventory/intelligence/ingredient/{id}/on-hand` | GET | Get live quantity |
| `/inventory/intelligence/profitability/{menuId}` | GET | Get menu food cost |
| `/inventory/intelligence/wastage/summary` | GET | Get waste report |

---

## Summary

The invoice posting flow is the **critical integration point** between:

1. **Accounts Payable** (invoice status tracking)
2. **Inventory Valuation** (cost basis updates)
3. **Analytics** (real-time food cost, waste metrics)

When an invoice is posted:
- ✅ Invoice status → POSTED (AP finalized)
- ✅ Ingredient prices → Updated (current cost basis)
- ✅ Ledger entries → Created (audit trail)
- ✅ Metrics → Recorded (analytics)

This ensures **real-time inventory management** with accurate cost tracking at every step!
