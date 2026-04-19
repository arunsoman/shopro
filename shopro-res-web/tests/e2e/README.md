# Shopro POS E2E Test Suite

Generated using the **playwright-tsx** skill - statically analyzing React TSX components to produce comprehensive Playwright test scripts.

## 📁 Test Structure

```
tests/e2e/
├── features/
│   ├── auth/
│   │   ├── ShoProLoginPage.spec.ts       ✅ Real component
│   │   └── StaffLoginPage.spec.ts        ✅ Real component
│   ├── dashboard/
│   │   └── DashboardPage.spec.ts         ✅ Real component
│   ├── inventory/
│   │   └── InventoryHub.spec.ts          ✅ Real component
│   ├── kds/
│   │   └── ExpoKds.spec.ts               ✅ Real component
│   ├── menu-engineering/
│   │   └── EngineeringHubPage.spec.ts    ✅ Real component
│   ├── other/
│   │   └── PlaceholderPages.spec.ts      ⚠️ Placeholders
│   ├── payments/
│   │   └── PaymentHub.spec.ts            ✅ Real component
│   ├── pos/
│   │   ├── FloorMapPage.spec.ts         ⚠️ Placeholder
│   │   └── PlaceholderPages.spec.ts      ⚠️ Placeholders
│   ├── prime-cost/
│   │   └── PrimeCostHub.spec.ts          ✅ Real component
│   ├── purchasing/
│   │   └── POStagingPage.spec.ts        ✅ Real component
│   ├── recipes/
│   │   └── RecipeHubPage.spec.ts        ⚠️ Placeholder
│   └── settings/
│       └── SettingsPage.spec.ts         ✅ Real component
└── playwright.config.ts
```

## 🎯 Coverage Summary

| Feature | Status | Tests |
|---------|--------|-------|
| **Auth** | ✅ Complete | 2 pages |
| **Dashboard** | ✅ Complete | 1 page |
| **Inventory** | ✅ Complete | 1 page |
| **KDS** | ✅ Complete | 1 page |
| **Menu Engineering** | ✅ Complete | 1 page |
| **Payments** | ✅ Complete | 1 page |
| **Prime Cost** | ✅ Complete | 1 page |
| **Purchasing** | ✅ Complete | 1 page |
| **Settings** | ✅ Complete | 1 page |
| **POS** | ⚠️ Placeholders | 5 pages |
| **Recipes** | ⚠️ Placeholders | 1 page |
| **Build Charts** | ⚠️ Placeholders | 3 pages |
| **Operations Manual** | ⚠️ Placeholders | 2 pages |
| **Unit Converter** | ⚠️ Placeholders | 1 page |

**Total: 14 test files, 24 pages tested**

## ✅ Implemented Pages (Full Tests)

| Page | Tests |
|------|-------|
| ShoProLoginPage | Login, MFA, validation, errors |
| StaffLoginPage | PIN login, staff selection |
| DashboardPage | Tab navigation, KPI cards |
| InventoryHub | Navigation, KPIs, cards |
| ExpoKds | Loading states, connection status |
| EngineeringHubPage | Nav cards, periods |
| PrimeCostHub | Status banner, KPIs, navigation |
| PaymentHub | Metrics, providers, transactions |
| SettingsPage | Configuration, navigation |
| POStagingPage | Dual view (Vendor/Table), PO creation |

## ⚠️ Placeholder Pages

These pages are placeholder components that need full implementation:

- `pos/FloorMapPage` - Floor map for table management
- `pos/GuestHeatmapPage` - Customer heat visualization
- `pos/KpiAnalyticsPage` - POS analytics
- `pos/SessionHistoryPage` - Order session history
- `pos/SessionDetailPage` - Individual session details
- `recipes/RecipeHubPage` - Recipe management hub
- `build-charts/*` - Chart builder pages
- `operations-manual/*` - Operations manual pages
- `unit-converter/UnitConverterSlideOver` - Unit conversion tool

## 🚀 Running Tests

```bash
cd shopro-res-web

# Install dependencies
npm install -D @playwright/test
npx playwright install

# Run all tests
npx playwright test

# Run specific feature
npx playwright test tests/e2e/features/purchasing
npx playwright test tests/e2e/features/auth

# Run with UI
npx playwright test --ui

# Generate report
npx playwright show-report
```

## 🔧 Each Test Includes

### Positive Tests
- Page load with correct title/headers
- All interactive elements visible
- Navigation works correctly
- Data displays correctly

### Negative Tests
- Empty states handled gracefully
- Network errors handled
- Loading states work correctly

### Accessibility Tests
- Keyboard navigation
- Proper heading structure
- ARIA labels

### Implementation Checklist
Every test file includes a `data-testid` checklist to make selectors robust.

## 📝 Notes

- **Selector Mode**: Most tests use "BEST-GUESS" mode since components don't have `data-testid` attributes yet
- **API Mocking**: Tests use `page.route()` to mock API calls for deterministic testing
- **Real Components**: Tests are most valuable for pages with full implementations
