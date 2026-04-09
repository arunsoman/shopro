# Shopro POS - Screen Responsiveness Registry

This file tracks the progress of making all `.tsx` screens mobile-first, tablet, and laptop friendly.

## Progress Checklist

### Layout & Common
- [x] `src/App.tsx` - **DONE** (Routing Fix)
- [ ] `src/components/layout/MainLayout.tsx`
- [ ] `src/components/layout/AuthenticatedLayout.tsx`

### Dashboard Feature
- [x] `src/features/dashboard/pages/DashboardPage.tsx`
- [x] `src/features/dashboard/pages/FeatureHub.tsx`
- [x] `src/features/dashboard/components/DashboardKpis.tsx`
- [x] `src/features/dashboard/components/AlertBanners.tsx`
- [x] `src/features/dashboard/components/QuickActions.tsx`

### Inventory Feature
- [x] `src/features/inventory/pages/InventoryHub.tsx`
- [x] `src/features/inventory/pages/IngredientMasterPage.tsx`
- [x] `src/features/inventory/pages/IngredientList.tsx`
- [x] `src/features/inventory/pages/IngredientDetail.tsx`
- [x] `src/features/inventory/pages/NewIngredientForm.tsx`
- [x] `src/features/inventory/pages/InventoryCountEntry.tsx`
- [x] `src/features/inventory/pages/PeriodDetail.tsx`
- [x] `src/features/inventory/pages/PeriodHistory.tsx`
- [x] `src/features/inventory/pages/LowStockAlerts.tsx`

### Purchasing Feature
- [x] `src/features/purchase/pages/PurchasingHub.tsx` - **DONE** (Premium Refactor)
- [x] `src/features/purchase/pages/InvoiceLog.tsx` - **DONE** (Premium Refactor)
- [x] `src/features/purchase/pages/InvoiceEntry.tsx` - **DONE** (Premium Refactor)
- [x] `src/features/purchase/pages/WeeklySummary.tsx` - **DONE** (Refactor + Fix)
- [x] `src/features/purchase/pages/SupplierDirectory.tsx` - **DONE** (Premium Refactor)

### Recipes & Menu Feature
- [x] `src/features/recipes-menu/pages/RecipeHub.tsx` - **DONE** (Premium Refactor)
- [x] `src/features/recipes-menu/pages/RecipeScreens.tsx` - **DONE** (Premium Refactor)
- [x] `src/features/recipes-menu/pages/MenuItemScreens.tsx` - **DONE** (Premium Refactor)
- [ ] `src/features/recipes-menu/pages/CostCard.tsx`
- [ ] `src/features/recipes-menu/pages/RecipeDetail.tsx`

### Menu Engineering Feature
- [ ] `src/features/menu-engineering/pages/EngineeringScreens.tsx`
- [ ] `src/features/menu-engineering/pages/QuadrantMatrix.tsx`
- [ ] `src/features/menu-engineering/pages/ResultsTable.tsx`

### Prime Cost Feature
- [ ] `src/features/prime-cost/components/primecost/PrimeCostHub.tsx`
- [ ] `src/features/prime-cost/components/primecost/LivePrimeCostDashboard.tsx`
- [ ] `src/features/prime-cost/components/primecost/WeeklyWorksheet.tsx`
- [ ] `src/features/prime-cost/components/primecost/VarianceAttribution.tsx`
- [ ] `src/features/prime-cost/components/primecost/PrimeCostTrend.tsx`
- [ ] `src/features/prime-cost/components/primecost/LaborSchedule.tsx`
- [ ] `src/features/prime-cost/components/primecost/MultiLocationPrimeCost.tsx`

### KDS Feature
- [ ] `src/features/kds/ExpoKds.tsx`
- [ ] `src/features/kds/StationKds.tsx`
- [ ] `src/features/kds/expo/ExpoFullscreen.tsx`
- [ ] `src/features/kds/expo/ExpoTablet.tsx`
- [ ] `src/features/kds/station/StationFullscreen.tsx`
- [ ] `src/features/kds/station/StationPhone.tsx`
- [ ] `src/features/kds/station/StationTablet.tsx`
