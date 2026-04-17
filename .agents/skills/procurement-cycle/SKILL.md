---
name: procurement-cycle
description: Executes a complete procurement cycle - creates PO, GRN, Invoice, performs 3-way match verification, posts invoice, and validates inventory intelligence updates including stock counts and ledger entries.
---

# Procurement Cycle Skill

This skill executes a complete end-to-end procurement workflow for the Shopro POS system. It creates a Purchase Order (PO), Goods Receipt Note (GRN), and Invoice, performs 3-way match verification, posts the invoice, and validates that inventory intelligence correctly updates stock levels and creates ledger entries.

## Usage

Use this skill whenever you need to:
- Test the complete procurement workflow
- Verify 3-way match (PO = GRN = Invoice)
- Validate inventory stock updates after receiving goods
- Check that ledger entries are created for FIFO tracking
- Perform acceptance testing on purchasing functionality

## Prerequisites

1. **Shopro POS Server Running**: The backend must be running on `http://localhost:8080`
2. **Database Populated**: At least one supplier and ingredients should exist
3. **Restaurant ID**: Know the restaurant ID (default: 1)

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/restaurants/{restaurantId}/purchasing/grns/receive` | POST | Create PO, GRN, Invoice in one call |
| `/api/v1/restaurants/{restaurantId}/purchase-orders/{id}` | GET | Verify PO details |
| `/api/v1/restaurants/{restaurantId}/purchasing/grns` | GET | Verify GRN details |
| `/api/v1/restaurants/{restaurantId}/invoices/{id}` | GET | Verify Invoice details |
| `/api/v1/restaurants/{restaurantId}/invoices/{id}/post` | POST | Post invoice (complete 3-way match) |
| `/api/v1/restaurants/{restaurantId}/ingredients/{id}` | GET | Check stock levels |
| `/api/v1/restaurants/{restaurantId}/inventory/stats` | GET | Check inventory value |
| `/api/v1/restaurants/{restaurantId}/inventory/ingredients/{id}/quantity` | GET | Check live quantity from ledger |

## Complete Workflow

### Step 1: Create PO, GRN, and Invoice

```bash
curl -s -X POST "http://localhost:8080/api/v1/restaurants/1/purchasing/grns/receive" \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": 1,
    "lines": [
      {
        "ingredientId": 8,
        "receivedQty": 10,
        "unitPrice": 75.00
      },
      {
        "ingredientId": 9,
        "receivedQty": 5,
        "unitPrice": 35.00
      }
    ]
  }'
```

**Response includes:**
- Invoice ID and Number
- GRN ID
- PO ID
- Line items with quantities and prices

### Step 2: Verify 3-Way Match

Compare totals across all three documents:

```bash
# Get PO
curl -s "http://localhost:8080/api/v1/restaurants/1/purchase-orders/{poId}"

# Get GRN
curl -s "http://localhost:8080/api/v1/restaurants/1/purchasing/grns"

# Get Invoice
curl -s "http://localhost:8080/api/v1/restaurants/1/invoices/{invoiceId}"
```

**3-Way Match Criteria:**
- PO Total = GRN Total = Invoice Total ✓

### Step 3: Post Invoice (Complete 3-Way Match)

```bash
curl -s -X POST "http://localhost:8080/api/v1/restaurants/1/invoices/{invoiceId}/post"
```

**What happens when invoice is posted:**
1. Invoice status changes from DRAFT → POSTED
2. Ingredient cost basis is updated with invoice prices
3. Ledger entries created for COST_BASIS_UPDATE
4. Active FIFO lots are created with unit prices

### Step 4: Verify Inventory Stock Updates

```bash
# Check ingredient stock levels
curl -s "http://localhost:8080/api/v1/restaurants/1/ingredients/8"
curl -s "http://localhost:8080/api/v1/restaurants/1/ingredients/9"

# Check live quantity from ledger
curl -s "http://localhost:8080/api/v1/restaurants/1/inventory/ingredients/8/quantity"
curl -s "http://localhost:8080/api/v1/restaurants/1/inventory/ingredients/9/quantity"

# Check inventory value
curl -s "http://localhost:8080/api/v1/restaurants/1/inventory/stats"
```

**Expected Results:**
- Stock increases by received quantity
- Live quantity matches ledger entries
- Inventory value reflects the purchase

## Example Complete Cycle

```bash
#!/bin/bash

RESTAURANT_ID=1
SUPPLIER_ID=1

echo "=== Step 1: Create PO, GRN, Invoice ==="
INVOICE_RESPONSE=$(curl -s -X POST "http://localhost:8080/api/v1/restaurants/$RESTAURANT_ID/purchasing/grns/receive" \
  -H "Content-Type: application/json" \
  -d "{
    \"supplierId\": $SUPPLIER_ID,
    \"lines\": [
      {\"ingredientId\": 8, \"receivedQty\": 10, \"unitPrice\": 75.00},
      {\"ingredientId\": 9, \"receivedQty\": 5, \"unitPrice\": 35.00}
    ]
  }")

echo "$INVOICE_RESPONSE"

# Extract IDs (using grep/sed or your preferred method)
# Then verify 3-way match and post invoice

echo "=== Step 2: Verify 3-Way Match ==="
# Compare PO, GRN, Invoice totals

echo "=== Step 3: Post Invoice ==="
curl -s -X POST "http://localhost:8080/api/v1/restaurants/$RESTAURANT_ID/invoices/6/post"

echo "=== Step 4: Verify Stock Updates ==="
curl -s "http://localhost:8080/api/v1/restaurants/$RESTAURANT_ID/ingredients/8"
curl -s "http://localhost:8080/api/v1/restaurants/$RESTAURANT_ID/ingredients/9"
curl -s "http://localhost:8080/api/v1/restaurants/$RESTAURANT_ID/inventory/stats"
```

## Validation Checklist

After completing the cycle, verify:

- [ ] PO created with correct line items and total
- [ ] GRN created with same quantities as PO
- [ ] Invoice created with amount matching PO and GRN
- [ ] 3-Way Match: PO Total = GRN Total = Invoice Total
- [ ] Invoice posted successfully (DRAFT → POSTED)
- [ ] Stock levels increased by received quantity
- [ ] Inventory value reflects the purchase amount
- [ ] Active FIFO lots created
- [ ] Ledger entries created for tracking

## Troubleshooting

### Common Issues

1. **500 Error on POST**: Check that ingredient IDs exist and itemCode is ≤6 characters
2. **Stock not updating**: Verify GRN status is RECEIVED
3. **Invoice won't post**: Ensure invoice amount matches line totals exactly
4. **Inventory value wrong**: Check that invoice was posted to trigger cost basis updates

### API Base URL

```
http://localhost:8080/api/v1/restaurants/{restaurantId}
```

### Related Entities

- **Ingredient**: Master catalog of purchasable items
- **Supplier**: Vendor from whom goods are purchased
- **PurchaseOrder**: Order placed to supplier
- **PurchaseOrderLine**: Individual line items in a PO
- **GoodsReceipt (GRN)**: Receipt of goods from supplier
- **PurchaseInvoice**: Invoice from supplier for received goods
- **InventoryActiveLot**: FIFO lot tracking for inventory
- **InventoryIngredientLedger**: Transaction history for inventory

## Skill Metadata

- **Skill Name**: Procurement Cycle
- **Description**: Complete procurement workflow with 3-way match
- **Category**: Testing / Integration / Acceptance
- **Project**: Shopro POS
- **Backend**: Spring Boot (shopro-res)
