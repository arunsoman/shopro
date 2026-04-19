# NaN Detection in Tests

## Overview

All test suites now include **automatic NaN detection** to catch calculation/display errors before they reach production. NaN (Not-a-Number) values in financial/numeric displays are critical bugs that indicate:

- Division by zero errors
- Missing/undefined data in calculations
- Incorrect type conversions
- API data mismatches
- Broken formulas

## Utility Functions

Located in `tests/utils/nan-check.ts`:

### 1. `expectNoNaN(page, context)`
Checks if any element on the page displays "NaN" text.

```typescript
await expectNoNaN(page, 'Dashboard');
```

**Error output example:**
```
NaN detected (Dashboard)!
  Count: 1 element(s)
  Element: <SPAN> with class "text-red-500"
  Content: "NaN"
  Parent: <DIV> class="kpi-card"
  Parent text: "Food Cost: NaN%"
  URL: http://localhost:5173/prime-cost
```

### 2. `expectNoNaNInNumericDisplays(page)`
Automatically checks common numeric display patterns:
- Prices (`[class*="price"]`)
- Costs (`[class*="cost"]`)
- Amounts (`[class*="amount"]`)
- Totals (`[class*="total"]`)
- Percentages (`[class*="percent"]`)
- Currency symbols (`$`, `€`, `£`)
- And 10+ more selectors

```typescript
await expectNoNaNInNumericDisplays(page);
```

### 3. `expectNoNaNInSelectors(page, selectors)`
Custom selector-based NaN checking.

```typescript
await expectNoNaNInSelectors(page, [
  '[data-testid="revenue"]',
  '[data-testid="cost"]'
]);
```

## Integration in Test Suites

### Every Module Includes NaN Tests

Each spec file now has a dedicated `NaN Detection` test suite:

```typescript
test.describe('Module — NaN Detection', () => {
  test('no NaN in [specific view]', async ({ page }) => {
    await expectNoNaN(page, 'View Name');
    await expectNoNaNInNumericDisplays(page);
  });
});
```

### Coverage by Module

| Module | NaN Test Coverage |
|--------|------------------|
| **Auth** | Login page, post-login dashboard, error messages |
| **Dashboard** | All 8 role views (CFO, GM, Chef, FOH, Bar, Shift, Catering, Lab) |
| **Inventory** | Hub, ingredients, count entry, alerts, history, detail views |
| **Purchasing** | Hub, suppliers, invoices, POs, GRNs, 3-way match, variance |
| **KDS** | Order timers, quantities, guest counts |
| **Recipes** | Hub, list, costing, menu items, detail, unit converter |
| **Engineering** | Hub, analysis matrix, live sales, comparison, what-if |
| **Prime Cost** | Hub, labor/food breakdown, trends, multi-location, percentages |
| **Labor Staffing** | Schedule, hours, cost calculations, budget, overtime |
| **Payments** | Dashboard, pending, amounts, history, reconciliation |

**Total: 60+ NaN detection tests**

## When NaN Tests Run

NaN checks execute:
1. **After page load** — Catches initial render issues
2. **After tab/view switches** — Catches calculation errors on data change
3. **After form submissions** — Catches validation/calculation bugs
4. **After API responses** — Catches data transformation errors
5. **In error states** — Ensures error messages don't show NaN

## Example Test Output

### Passing Test
```
✓ no NaN in prime cost hub (1.2s)
✓ no NaN in labor cost breakdown (0.8s)
✓ no NaN in food cost breakdown (0.9s)
```

### Failing Test
```
✗ no NaN in recipe costing (1.5s)

Error: NaN detected (Recipe Costing)!
  Count: 2 element(s)
  Element: <SPAN> with class "cost-value"
  Content: "NaN"
  Parent: <DIV> class="recipe-row"
  Parent text: "Total Cost: NaN"
  URL: http://localhost:5173/recipes/costing
  
  Element: <SPAN> with class "cost-per-portion"
  Content: "NaN"
  Parent: <DIV> class="portion-info"
  Parent text: "Cost per portion: NaN"
  URL: http://localhost:5173/recipes/costing
```

## Common NaN Causes & Fixes

### 1. Division by Zero
```typescript
// ❌ Bug
const costPerPortion = totalCost / portions; // NaN if portions = 0

// ✅ Fix
const costPerPortion = portions > 0 ? totalCost / portions : 0;
```

### 2. Missing Data
```typescript
// ❌ Bug
const margin = revenue - cost; // NaN if either is undefined

// ✅ Fix
const margin = (revenue || 0) - (cost || 0);
```

### 3. String-to-Number Conversion
```typescript
// ❌ Bug
const total = price * quantity; // NaN if price is "10.99" (string)

// ✅ Fix
const total = parseFloat(price) * quantity;
```

### 4. Array Reduce on Empty Array
```typescript
// ❌ Bug
const total = items.reduce((sum, item) => sum + item.cost); // NaN on empty array

// ✅ Fix
const total = items.reduce((sum, item) => sum + (item.cost || 0), 0);
```

## Running NaN Tests

### Run All NaN Tests
```bash
# Run all tests (includes NaN checks)
npx playwright test

# Run specific NaN test
npx playwright test -g "no NaN"
```

### Debug NaN Issues
```bash
# Run with UI mode to see where NaN appears
npx playwright test -g "no NaN" --ui

# Run headed to see browser
npx playwright test -g "no NaN" --headed
```

## Best Practices

### 1. Add NaN Checks After Calculations
```typescript
test('calculates food cost percentage', async ({ page }) => {
  // ... trigger calculation
  await expectNoNaN(page, 'Food Cost %');
});
```

### 2. Check Empty States
```typescript
test('handles empty data gracefully', async ({ page }) => {
  await page.route('**/api/data', route => {
    route.fulfill({ body: JSON.stringify({ items: [] }) });
  });
  await page.reload();
  await expectNoNaN(page, 'Empty State');
});
```

### 3. Verify Error States
```typescript
test('shows proper error on API failure', async ({ page }) => {
  await page.route('**/api/data', route => {
    route.fulfill({ status: 500 });
  });
  await page.reload();
  await expectNoNaN(page, 'Error State');
});
```

## CI/CD Integration

Add NaN detection to your CI pipeline:

```yaml
# .github/workflows/test.yml
- name: Run Playwright Tests with NaN Detection
  run: npx playwright test --grep "no NaN"
  
# Fail build if NaN detected
- name: Check for NaN in tests
  run: |
    if npx playwright test --grep "no NaN" | grep -q "NaN detected"; then
      echo "::error::NaN values detected in UI!"
      exit 1
    fi
```

## Monitoring

### Production Monitoring
Add console error tracking for NaN:

```javascript
// In your React app
window.addEventListener('error', (e) => {
  if (e.message.includes('NaN')) {
    // Send to error tracking service
    trackError('NaN detected', { message: e.message });
  }
});
```

### React DevTools
Check for NaN in component state during development.

## Related Files

- `tests/utils/nan-check.ts` — NaN detection utilities
- `tests/NAN-DETECTION.md` — This documentation
- All `*.spec.ts` files — Include NaN test suites

---

**Status**: ✅ Implemented in all 10 test modules  
**Coverage**: 60+ NaN detection tests  
**Goal**: Zero NaN values in production UI
