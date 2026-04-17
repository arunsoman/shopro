# Inventory Intelligence End-to-End Tester Skill

This skill validates that the inventory intelligence system correctly:
1. Opens table sessions
2. Places orders incrementally (dish by dish, simulating real restaurant flow)
3. Verifies ingredient depletion with yield factors applied correctly
4. Checks audit logs are created
5. Validates double-entry ledger entries

## ⚠️ IMPORTANT: Prerequisite

Before running this test, ensure that:
1. **Recipes are properly seeded** - The AfghanIngredientSeeder should create recipes and link them to menu items
2. **Menu items have active recipes** - Each menu item should have at least one active recipe
3. **Server is running** - Start with `restart-server` skill if needed

If recipes are missing, run:
```bash
# Restart server to trigger seeders
./gradlew :shopro-res:bootRun
```

Then verify recipes exist via:
```bash
curl "http://localhost:8080/api/v1/restaurants/1/inventory/intelligence/profitability/1"
```
If this returns non-zero `actualCostBasis`, the recipe exists.

## Usage

Trigger this skill when you want to validate the inventory intelligence system end-to-end:
- "test inventory intelligence"
- "validate inventory depletion"  
- "run inventory audit test"
- "test recipe yield calculation"
- "verify ledger entries"
- "run inventory e2e test"

## What This Skill Does

### Phase 1: Setup - Receive Inventory
- Receives initial inventory for key test ingredients (Lamb, Chicken, Rice, Onions)
- Records initial on-hand quantities

### Phase 2: Open Table Session
- Opens a new POS table session with guest count

### Phase 3: Place Orders Incrementally
- Tries to place orders via POS API
- Falls back to `record-misfire` endpoint to trigger inventory depletion

### Phase 4: Verification
For each step:
1. **Ingredient Depletion Check**: Verifies inventory reduced by correct amount (with yield applied)
2. **Ledger Entry Check**: Verifies inventory_ingredient_ledger entries created
3. **Double-Entry Check**: Ensures both the lot reduction AND ledger entry exist
4. **Audit Trail Check**: Confirms all movements are traceable

### Phase 5: Report Generation
- Compares expected vs actual ingredient usage
- Lists any discrepancies found
- Provides overall pass/fail verdict

## Expected Results

### For Order of Kabuli Pulao (with yield factor):
- Recipe: BATCH type, yieldQuantity=10
- Ingredient: Lamb Shoulder, quantityRu=0.3kg per portion, yieldPct=0.75
- Expected calculation: `orderQty × recipeQtyRu × (1/yieldPct)`
- Example: 3 portions × 0.3kg ÷ 0.75 = 1.2kg depletion

### Ledger Should Show:
- Event type: `DEPLETION`
- Quantity: negative (e.g., -1.2)
- Order ID linked
- Menu ID linked
- Reason: `POS_SALE` or `MISFIRE`

## Running the Test

```bash
cd /home/arun/IdeaProjects/shopro-pos/.agents/skills/inventory-intelligence-tester
python3 inventory_e2e_tester.py
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No menu item with recipe" | Check seeders ran correctly; restart server |
| "No depletion detected" | Verify recipe is linked to menu item and is active |
| "Session not opening" | Check table availability |

## Output Format

Returns a JSON-style report:
```
{
  "testName": "Inventory Intelligence E2E Validation",
  "status": "PASS|PARTIAL|FAIL",
  "phases": {
    "setup": { "status": "PASS|FAIL", ... },
    "tableSession": { "status": "PASS|FAIL", "sessionId": 123 },
    "orders": { "status": "PASS|FAIL", ... },
    "verification": { "status": "PASS|FAIL", "checks": {...} }
  }
}
```

## Code Location

- Skill: `.agents/skills/inventory-intelligence-tester/`
- Test script: `inventory_e2e_tester.py`
- Tested service: `InventoryIntelligenceService.java`
