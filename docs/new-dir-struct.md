src/
│
├── main.tsx                          # React entry point
├── App.tsx                           # Root router (React Router v6)
├── vite.config.ts                    # Vite + path aliases
├── tsconfig.json
│
├── api/                              # All API calls — one file per service
│   ├── client.ts                     # Base apiFetch<T>(), auth headers, error handling
│   ├── ingredients.api.ts            # IngredientService endpoints
│   ├── inventory.api.ts              # InventoryService endpoints
│   ├── invoices.api.ts               # PurchaseInvoiceService endpoints
│   ├── recipes.api.ts                # BatchRecipeService endpoints
│   ├── menuItems.api.ts              # MenuItemCostService endpoints
│   ├── costGroups.api.ts             # MenuCostGroupService endpoints
│   ├── menuEngineering.api.ts        # MenuEngineeringService endpoints
│   ├── primeCost.api.ts              # PrimeCostService endpoints
│   ├── labor.api.ts                  # LaborService endpoints
│   ├── sessions.api.ts               # TableSessionService + OrderService endpoints
│   ├── suppliers.api.ts              # SupplierService endpoints
│   ├── buildCharts.api.ts            # BuildChartService endpoints
│   ├── guestCount.api.ts             # GuestCountService endpoints
│   └── kpi.api.ts                    # KpiService endpoints
│
├── types/                            # All TypeScript interfaces — one file per domain
│   ├── ingredient.types.ts           # Ingredient, IngredientCostDto, LowStockAlert
│   ├── inventory.types.ts            # InventoryPeriod, InventoryLineItem, CategorySubtotal
│   ├── invoice.types.ts              # PurchaseInvoice, PurchaseInvoiceLine, Supplier
│   ├── recipe.types.ts               # BatchRecipe, RecipeLine, ProcedureStep, KitchenStation, ShelfLife
│   ├── menuItem.types.ts             # MenuItem, CostingLine, LineSourceType, MenuItemDetail
│   ├── costGroup.types.ts            # CostGroup, CostGroupSummary
│   ├── menuEngineering.types.ts      # AnalysisPeriod, MenuEngineeringResult, Classification
│   ├── primeCost.types.ts            # PrimeCostReport, WeeklyBudget, VarianceBucket, LaborRecord
│   ├── pos.types.ts                  # DiningTable, TableSession, Order, OrderLine
│   ├── guestCount.types.ts           # GuestCountEntry, GuestCountAverage
│   ├── restaurant.types.ts           # Restaurant, User, Role
│   └── common.types.ts               # ApiResponse<T>, PaginatedResponse<T>, SortOrder
│
├── hooks/                            # Data-fetching and state hooks
│   ├── useIngredients.ts             # useIngredients(), useIngredientDetail(), useIngredientCosts()
│   ├── useInventory.ts               # useInventoryPeriods(), useCurrentPeriod(), useLowStock()
│   ├── useInvoices.ts                # useInvoices(), useInvoiceDetail(), useWeeklySummary()
│   ├── useRecipes.ts                 # useRecipes(), useRecipeDetail(), useRecipeCost()
│   ├── useMenuItems.ts               # useMenuItems(), useMenuItemDetail(), useCostGroupSummary()
│   ├── useCostGroups.ts              # useCostGroups()
│   ├── useMenuEngineering.ts         # usePeriods(), useResults(), useLiveSales(), useWhatIf()
│   ├── usePrimeCost.ts               # useLivePrimeCost(), useWeeklyReport(), useForecast()
│   ├── useLabor.ts                   # useLaborSummary(), useSchedule()
│   ├── useSessions.ts                # useFloorStatus(), useSessionDetail()
│   ├── useGuestCount.ts              # useGuestHeatmap(), useRollingAverage()
│   ├── useKpi.ts                     # useTodayKpis(), useWeekKpis(), usePrimeCostTrend()
│   ├── useSuppliers.ts               # useSuppliers()
│   ├── useRestaurant.ts              # useRestaurant(), useCurrentRestaurant()
│   ├── useDebounce.ts                # generic useDebounce(value, delay)
│   ├── useAutosave.ts                # useAutosave(saveFn, deps, delay) — used in wizards
│   └── useDragReorder.ts             # useDragReorder(items, onReorder) — shared by tables
│
├── store/                            # Global state (Zustand)
│   ├── auth.store.ts                 # currentUser, restaurantId, token
│   ├── ui.store.ts                   # toast queue, global loading, sidebar open/closed
│   └── pos.store.ts                  # live floor state (WebSocket-fed)
│
├── lib/                              # Pure utilities — no React
│   ├── fmt.ts                        # fmt(n), pct(n), fmtDate(), fmtTime()
│   ├── fcColor.ts                    # fcColor(fc), fcBg(fc), fcLabel(fc) — shared FC% logic
│   ├── cost.ts                       # calcLineCost(), calcTotalCost(), calcCostPerYield()
│   ├── validation.ts                 # validateRecipe(), validateMenuItem(), validateInvoice()
│   └── dragReorder.ts                # reorder(list, fromIdx, toIdx) — pure array util
│
├── design-system/                    # Tokens, global styles, base atoms
│   ├── tokens.ts                     # C (color map), typography, spacing — single source of truth
│   ├── GlobalStyles.tsx              # <style> tag injecting fonts + CSS keyframes
│   ├── theme.css                     # CSS custom properties (--color-amber etc.)
│   └── index.ts                      # re-exports everything
│
├── components/                       # Shared UI atoms and molecules
│   │
│   ├── ui/                           # Lowest-level atoms — no business logic
│   │   ├── Button.tsx                # BtnPrimary, BtnSecondary, BtnGhost, BtnIcon
│   │   ├── Input.tsx                 # TextInput, NumberInput, Textarea, Select
│   │   ├── Badge.tsx                 # FcBadge, StatusBadge, StationBadge, SourceBadge
│   │   ├── Toast.tsx                 # Toast + useToast hook
│   │   ├── Modal.tsx                 # Modal backdrop + box
│   │   ├── SlideOver.tsx             # 480px right panel with backdrop
│   │   ├── Skeleton.tsx              # Skeleton loading placeholder
│   │   ├── Divider.tsx               # <hr> styled divider
│   │   ├── Spinner.tsx               # Inline spin animation
│   │   ├── EmptyState.tsx            # Icon + heading + sub + optional CTA
│   │   ├── ProgressBar.tsx           # Thin progress strip (wizard)
│   │   ├── Tabs.tsx                  # Tab bar + panel switcher
│   │   ├── Table.tsx                 # Styled <table> shell with th/td tokens
│   │   ├── DragHandle.tsx            # ⠿ grip icon used in all reorderable tables
│   │   ├── ImageZone.tsx             # Click-to-upload image placeholder
│   │   └── ConfirmModal.tsx          # "Are you sure?" modal — reused for deactivate/void/discard
│   │
│   ├── layout/                       # App shell pieces
│   │   ├── AppShell.tsx              # Sidebar + topbar + <Outlet />
│   │   ├── Topbar.tsx                # Restaurant name, global search, notifications bell
│   │   ├── Sidebar.tsx               # Nav links to each subsystem hub
│   │   ├── Breadcrumb.tsx            # e.g. "Cost Groups › Starters › Shrimp Cocktail"
│   │   └── SubsystemHeader.tsx       # Page title + subtitle + primary action button
│   │
│   ├── search/                       # Global search slide-over (SS0.3)
│   │   ├── GlobalSearch.tsx
│   │   └── SearchResult.tsx
│   │
│   ├── notifications/                # Notifications panel (SS0.4)
│   │   ├── NotificationsPanel.tsx
│   │   └── NotificationItem.tsx
│   │
│   └── kpi/                          # Shared KPI cards used across multiple subsystems
│       ├── KpiCard.tsx               # Single stat card (label + hero number)
│       ├── KpiGrid.tsx               # 2–4 col responsive grid of KpiCards
│       └── PrimeCostSparkline.tsx    # 8-week trend line used on dashboard
│
├── features/                         # One folder per subsystem — each self-contained
│   │
│   ├── dashboard/                    # SS0.2 — Main hub
│   │   ├── DashboardPage.tsx
│   │   └── components/
│   │       ├── LiveKpiStrip.tsx
│   │       ├── AlertBadges.tsx
│   │       └── TrendSparkline.tsx
│   │
│   ├── inventory/                    # SS1 — Inventory Management
│   │   ├── InventoryHubPage.tsx      # SS1.0
│   │   ├── IngredientListPage.tsx    # SS1.1
│   │   ├── IngredientDetailPage.tsx  # SS1.2
│   │   ├── CountEntryPage.tsx        # SS1.4
│   │   ├── PeriodDetailPage.tsx      # SS1.5
│   │   ├── PeriodHistoryPage.tsx     # SS1.6
│   │   ├── PeriodComparisonPage.tsx  # SS1.7
│   │   ├── LowStockPage.tsx          # SS1.8
│   │   └── components/
│   │       ├── IngredientCard.tsx
│   │       ├── IngredientForm.tsx    # Slide-over create/edit (SS1.3)
│   │       ├── CountTable.tsx        # Inline-editable count grid
│   │       ├── CategorySubtotal.tsx
│   │       └── PeriodSummaryPanel.tsx
│   │
│   ├── purchasing/                   # SS2 — Purchasing & Invoice Management
│   │   ├── PurchasingHubPage.tsx     # SS2.0
│   │   ├── InvoiceLogPage.tsx        # SS2.1
│   │   ├── InvoiceEntryPage.tsx      # SS2.2
│   │   ├── WeeklySummaryPage.tsx     # SS2.3
│   │   ├── TrendChartPage.tsx        # SS2.4
│   │   ├── ProofAlertsPage.tsx       # SS2.5
│   │   ├── SupplierDirectoryPage.tsx # SS2.6
│   │   └── components/
│   │       ├── InvoiceHeader.tsx
│   │       ├── CategoryLinesTable.tsx
│   │       ├── ProofIndicator.tsx    # Green $0 / red pulsing if ≠ 0
│   │       ├── SupplierAutocomplete.tsx
│   │       ├── SupplierForm.tsx      # Slide-over create/edit
│   │       └── SpendBarChart.tsx
│   │
│   ├── recipes/                      # SS3.1–SS3.3 — Batch Recipe Management
│   │   ├── RecipeListPage.tsx        # SS3.1
│   │   ├── RecipeDetailPage.tsx      # SS3.2
│   │   ├── RecipeEditorPage.tsx      # SS3.3 (wizard — create + edit)
│   │   └── components/
│   │       ├── RecipeCard.tsx        # Grid card with station colour strip
│   │       ├── StepRail.tsx          # 4-step progress indicator
│   │       ├── steps/
│   │       │   ├── StepDetails.tsx   # Step 1
│   │       │   ├── StepIngredients.tsx # Step 2 — drag table + search
│   │       │   ├── StepYield.tsx     # Step 3 — yield + live cost panel
│   │       │   └── StepProcedure.tsx # Step 4 — drag-reorderable steps
│   │       ├── IngredientLineTable.tsx  # Reusable draggable costing table
│   │       ├── IngredientSearchDropdown.tsx
│   │       ├── ScaleCalculator.tsx   # Modal — scale factor slider
│   │       └── ExitGuardModal.tsx    # Save Draft / Discard / Keep editing
│   │
│   ├── menu-costing/                 # SS3.4–SS3.6 — Menu Item Costing
│   │   ├── CostGroupHubPage.tsx      # SS3.4
│   │   ├── MenuItemCostCardPage.tsx  # SS3.6
│   │   └── components/
│   │       ├── CostGroupAccordion.tsx    # Expandable group row
│   │       ├── ItemListTable.tsx         # SS3.5 — inline item list
│   │       ├── ItemRow.tsx               # Single row with FC% badge
│   │       ├── NewMenuItemSlideOver.tsx  # "+ New item in {group}"  ← built this session
│   │       ├── CostCardHeader.tsx        # Name, price, PLU, image upload
│   │       ├── CostingLineTable.tsx      # Draggable lines (ING + RCP)
│   │       ├── SourcePickerSlideOver.tsx # Add line — ingredient or recipe tab
│   │       ├── CostSummaryPanel.tsx      # Sticky right panel — FC% hero
│   │       ├── TargetPriceCalculator.tsx # Live FC% → suggested price
│   │       └── MoveGroupModal.tsx        # Move item to different group
│   │
│   ├── build-charts/                 # SS3.7–SS3.8 — Build Charts
│   │   ├── BuildChartListPage.tsx    # SS3.7
│   │   ├── BuildChartEditorPage.tsx  # SS3.8
│   │   ├── BuildChartPrintPage.tsx   # SS3.8-print
│   │   └── components/
│   │       ├── BuildChartCard.tsx
│   │       ├── BuildLineTable.tsx
│   │       └── PlatingSpecEditor.tsx
│   │
│   ├── operations-manual/            # SS3.9–SS3.10
│   │   ├── ManualListPage.tsx        # SS3.9
│   │   ├── ManualEntryEditorPage.tsx # SS3.10
│   │   └── components/
│   │       ├── ManualEntryCard.tsx
│   │       └── RecipeStepViewer.tsx  # Read-only steps when linked to recipe
│   │
│   ├── unit-converter/               # SS3.11
│   │   └── UnitConverterSlideOver.tsx
│   │
│   ├── menu-engineering/             # SS4 — Menu Engineering
│   │   ├── EngineeringHubPage.tsx    # SS4.0
│   │   ├── PeriodSetupPage.tsx       # SS4.1
│   │   ├── ResultsTablePage.tsx      # SS4.2
│   │   ├── QuadrantMatrixPage.tsx    # SS4.4
│   │   ├── CategorySummaryPage.tsx   # SS4.5
│   │   ├── PeriodHistoryPage.tsx     # SS4.6
│   │   ├── LiveSalesCounterPage.tsx  # SS4.7
│   │   ├── WhatIfSimulatorPage.tsx   # SS4.8
│   │   ├── PeriodComparisonPage.tsx  # SS4.9
│   │   └── components/
│   │       ├── ClassificationBadge.tsx  # WINNER / WORKHORSE / OPPORTUNITY / LOSER
│   │       ├── ResultsTable.tsx
│   │       ├── ItemDrilldownSlideOver.tsx # SS4.3
│   │       ├── QuadrantScatter.tsx      # 2×2 SVG scatter plot
│   │       ├── WhatIfTable.tsx          # Editable price overrides
│   │       └── ComparisonGrid.tsx       # Side-by-side period diff
│   │
│   ├── prime-cost/                   # SS5 — Prime Cost
│   │   ├── PrimeCostHubPage.tsx      # SS5.0
│   │   ├── LiveDashboardPage.tsx     # SS5.1
│   │   ├── WeeklyWorksheetPage.tsx   # SS5.2
│   │   ├── BudgetVsActualPage.tsx    # SS5.3
│   │   ├── VarianceAttributionPage.tsx # SS5.4
│   │   ├── TrendChartPage.tsx        # SS5.5
│   │   ├── LaborSchedulePage.tsx     # SS5.6
│   │   ├── MultiLocationPage.tsx     # SS5.7
│   │   └── components/
│   │       ├── LivePrimeCostBanner.tsx  # Hero % with color coding
│   │       ├── WeeklyAccordion.tsx      # Sales / COS / Labor / Summary sections
│   │       ├── BudgetRow.tsx            # Actual vs Budget line with variance
│   │       ├── VarianceDonut.tsx        # SVG donut — 4 buckets
│   │       ├── VarianceBucketPanel.tsx  # Expandable PRICE/MIX/PORTION/LABOR
│   │       ├── PrimeCostLineChart.tsx   # 8-week trend with budget overlay
│   │       ├── LaborHoursGrid.tsx       # Editable daily hours table
│   │       ├── ScheduleVsActualTable.tsx
│   │       └── LocationRollupTable.tsx
│   │
│   ├── pos/                          # SS6 — POS / Floor Operations
│   │   ├── FloorMapPage.tsx          # SS6.0 — live table grid
│   │   ├── SessionDetailPage.tsx     # SS6.2 — order screen
│   │   ├── SessionHistoryPage.tsx    # SS6.3
│   │   ├── GuestHeatmapPage.tsx      # SS6.4
│   │   ├── KpiAnalyticsPage.tsx      # SS6.5
│   │   └── components/
│   │       ├── TableTile.tsx         # Single table — colour by status
│   │       ├── FloorGrid.tsx         # Responsive table layout
│   │       ├── OpenSessionModal.tsx  # SS6.1 — guest count input
│   │       ├── OrderLineItem.tsx
│   │       ├── MenuItemPicker.tsx    # Tabbed by cost group
│   │       ├── HeatmapGrid.tsx       # Time × day colour grid
│   │       └── KpiTabPanel.tsx       # Today / Weekly / Trend tabs
│   │
│   └── settings/                     # SS0.5 — Settings
│       ├── SettingsPage.tsx
│       └── components/
│           ├── RestaurantProfileTab.tsx
│           ├── TableLayoutTab.tsx
│           ├── CostGroupsTab.tsx
│           ├── SupplierListTab.tsx
│           └── UserManagementTab.tsx
│
├── router/
│   ├── index.tsx                     # createBrowserRouter() — all routes
│   ├── ProtectedRoute.tsx            # Auth guard
│   └── routes.ts                     # Route path constants (no magic strings)
│
└── assets/
    └── fonts/                        # Self-hosted fallback if Google Fonts blocked