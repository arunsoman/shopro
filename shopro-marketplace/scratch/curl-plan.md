# Bidding Engine Curl Test Plan

## 1. Create Bid Invitation (Operator)
**Goal:** Verify `operationMode` and `repeatFrequency` are correctly handled.
```bash
curl -X POST http://localhost:8081/api/operator/bids \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Weekly Organic Produce - April W1",
    "description": "Premium organic vegetables for regional distribution",
    "deadline": "2026-04-05T10:00:00",
    "urgency": "NORMAL",
    "operationMode": "AUTOMATIC",
    "repeatFrequency": "WEEKLY",
    "items": [
      { "productName": "Organic Carrots", "quantity": 500, "unit": "kg" },
      { "productName": "Organic Spinach", "quantity": 200, "unit": "kg" }
    ]
  }'
```

## 2. Get Bid Details
**Goal:** Verify `nextRunDate` calculation and DTO enrichment.
```bash
# Replace {id} with ID from previous step
curl http://localhost:8081/api/operator/bids/{id}
```

## 3. Submit Quote (Supplier)
**Goal:** Verify `leadTime` and `offeredQuantity` tracking.
```bash
curl -X POST http://localhost:8081/api/supplier/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "bidInvitationId": "{id}",
    "supplierId": "{supplierId}",
    "leadTime": 24,
    "items": [
      { "bidItemId": "{itemId}", "unitPrice": 12.50, "totalPrice": 6250.00, "leadTime": 24, "offeredQuantity": 500 }
    ]
  }'
```

## 4. Get Evaluation Comparison
**Goal:** Verify `reliabilityScore` calculation (mocked).
```bash
curl http://localhost:8081/api/operator/bids/{id}/quotes
```
