# Screen Map — All 53 Screens

Ordered for depth-first execution. Parent screen before child screens.
Each entry: `ID | Name | Type | REST Endpoints | Notes`

---

## SS0 — Shell / Global

| ID | Name | Type | Key Endpoints | Notes |
|----|------|------|--------------|-------|
| SS0.1 | Login | Full page | POST /auth/login | JWT stored in Zustand |
| SS0.2 | Dashboard | Full page (live) | GET /kpis/today, GET /kpis/food-cost, GET /kpis/prime-cost-trend, GET /ingredients/low-stock, GET /invoices?status=DRAFT | Auto-refresh 60s |
| SS0.3 | Global Search | Slide-over | GET /ingredients/search, GET /suppliers/search, GET /recipes/search | Debounced 300ms |
| SS0.4 | Notifications | Slide-over | GET /ingredients/low-stock, GET /invoices?status=DRAFT, GET /menu-engineering/periods?status=DRAFT, GET /sessions?status=OPEN | Badge count in header |
| SS0.5 | Settings | Full page tabbed | Restaurant, Tables, Cost Groups, Suppliers, Users tabs | See sub-tabs below |

---

## SS1 — Inventory Management

| ID | Name | Type | Key Endpoints | Notes |
|----|------|------|--------------|-------|
| SS1.0 | Inventory Hub | Hub | GET /inventory/periods/latest?type=FOOD, GET /inventory/periods/latest?type=BAR, GET /ingredients/low-stock | 4 nav cards + 3 KPI |
| SS1.1 | Ingredient Master List | Full page | GET /ingredients?type=&category=, GET /ingredients/search | Card list mobile, table desktop |
| SS1.2 | Ingredient Detail | Full page | GET /ingredients/{id}, GET /ingredients/{id}/costs | Accordion sections |
| SS1.3 | New Ingredient Form | Slide-over 480px | POST /ingredients, POST /conversions/ingredient-cost-calculator | Live ruCost/iuCost preview |
| SS1.4 | Inventory Count Entry | Full page inline editable | GET /inventory/periods/current?type=, GET /inventory/periods/{id}/detail, PUT /inventory/periods/{id}/lines/{lineId}/count, POST /inventory/periods/{id}/lines/batch, POST /inventory/periods | Optimistic update on blur |
| SS1.5 | Period Detail | Full page read-only | GET /inventory/periods/{id}/detail | Export CSV/PDF |
| SS1.6 | Period History | Full page list | GET /inventory/periods | Date sorted DESC |
| SS1.7 | Period Comparison | Full page | GET /inventory/periods/{id1}/compare/{id2} | Side-by-side delta |
| SS1.8 | Low Stock Alerts | Full page | GET /ingredients/low-stock | Red left border cards |

---

## SS2 — Purchasing

| ID | Name | Type | Key Endpoints | Notes |
|----|------|------|--------------|-------|
| SS2.0 | Purchasing Hub | Hub | GET /invoices?status=DRAFT count, GET /invoices/weekly-summary | 3 nav cards + KPI |
| SS2.1 | Invoice Log | Full page | GET /invoices?status=&supplier=&from=&to= | Filterable table |
| SS2.2 | Invoice Entry | Full page | GET /invoices/{id}, POST /invoices, PUT /invoices/{id}, POST /invoices/{id}/post, GET /suppliers/search, GET /ingredients/search | Draft → Posted flow |
| SS2.3 | Weekly Summary | Full page | GET /invoices/weekly-summary?from=&to= | Category subtotals |
| SS2.4 | Trend Chart | Full page | GET /invoices/trend?weeks=12 | Recharts line chart |
| SS2.5 | Proof Alerts | Full page | GET /invoices/proof-alerts | Price variance vs last |
| SS2.6 | Supplier Directory | Full page | GET /suppliers, POST /suppliers, PUT /suppliers/{id}, DELETE /suppliers/{id} | Active/inactive toggle |

---

## SS3 — Recipes & Menu

| ID | Name | Type | Key Endpoints | Notes |
|----|------|------|--------------|-------|
| SS3.0 | Recipe Hub | Hub | GET /recipes count, GET /menu-items count, GET /cost-groups | 4 nav cards |
| SS3.1 | Recipe List | Full page | GET /recipes?active= | Search + filter |
| SS3.2 | Recipe Detail | Full page | GET /recipes/{id}, GET /recipes/{id}/cost | Accordion: ingredients, cost breakdown |
| SS3.3 | Recipe Editor | Full page | PUT /recipes/{id}, POST /recipes/{id}/ingredients, DELETE /recipes/{id}/ingredients/{lineId} | Inline line editing |
| SS3.4 | Cost Group List | Full page | GET /cost-groups, POST /cost-groups, PUT /cost-groups/{id} | Settings tab reuse |
| SS3.5 | Menu Item List | Full page | GET /menu-items?costGroupId= | Tab per cost group |
| SS3.6 | Cost Card | Full page | GET /menu-items/{id}/cost-card | Full recipe cost breakdown |
| SS3.7 | Build Chart List | Full page | GET /build-charts | List of saved charts |
| SS3.8 | Build Chart Editor | Full page | GET /build-charts/{id}, PUT /build-charts/{id} | Step-by-step prep |
| SS3.9 | Build Chart Print | Full page | GET /build-charts/{id} | Print-optimized view |
| SS3.10 | Manual List | Full page | GET /manual-entries | Recipe manual entries |
| SS3.11 | Manual Editor | Full page | GET /manual-entries/{id}, PUT /manual-entries/{id} | Rich text |
| SS3.12 | Unit Conversion Calculator | Full page | GET /conversions/convert, POST /conversions/ingredient-cost-calculator | Stateless computation |

---

## SS4 — Menu Engineering

| ID | Name | Type | Key Endpoints | Notes |
|----|------|------|--------------|-------|
| SS4.0 | Engineering Hub | Hub | GET /menu-engineering/periods | Period count + last run |
| SS4.1 | Period Setup | Full page | POST /menu-engineering/periods, PUT /menu-engineering/periods/{id}/run | Date range + cost group |
| SS4.2 | Results Table | Full page | GET /menu-engineering/periods/{id}/results | Classification badges |
| SS4.3 | Item Drilldown | Slide-over | GET /menu-engineering/periods/{id}/results/{itemId} | Single item deep dive |
| SS4.4 | Quadrant Matrix | Full page | GET /menu-engineering/periods/{id}/results | Scatter plot Recharts |
| SS4.5 | Category Summary | Full page | GET /menu-engineering/periods/{id}/summary | Bar chart per category |
| SS4.6 | Period History | Full page | GET /menu-engineering/periods | List + 2-period compare |
| SS4.7 | Live Sales Counter | Full page | GET /analytics/top-sellers?period=today, GET /kpis/food-cost?period=today | 5-min polling |
| SS4.8 | What-If Simulator | Full page | GET /menu-engineering/periods/{id}/results, POST /menu-engineering/periods/{id}/simulate | Left/right split |
| SS4.9 | Period Comparison | Full page | POST /menu-engineering/periods/compare | 2-column layout |

---

## SS5 — POS / Floor

| ID | Name | Type | Key Endpoints | Notes |
|----|------|------|--------------|-------|
| SS5.0 | Floor Map (Live) | Full page | GET /tables/floor-status | WebSocket preferred, polling fallback |
| SS5.1 | Open Session | Modal 400px | POST /sessions | Pre-selected table |
| SS5.2 | Session Detail | Full page | GET /sessions/{id}/detail, POST /sessions/{id}/orders, POST /orders/{id}/lines, PUT /orders/{id}/lines/{lineId}/quantity, POST /orders/{id}/lines/{lineId}/void, POST /orders/{id}/lines/{lineId}/comp, POST /orders/{id}/fire, POST /orders/{id}/close, POST /sessions/{id}/close | Complex multi-action |
| SS5.3 | Session History | Full page | GET /sessions?from=&to= | Date range table |
| SS5.4 | Guest Heatmap | Full page | GET /sessions/heatmap?weekStart=, GET /sessions/heatmap/rolling, GET /guest-counts/grid?weekStart=, GET /guest-counts/heatmap/rolling | POS/manual toggle |
| SS5.5 | KPI Analytics | Full page tabbed | GET /kpis/today, GET /kpis/weekly, GET /analytics/top-sellers, GET /analytics/slow-sellers, GET /sales/daily, GET /kpis/turn-times, GET /kpis/prime-cost-trend | 3 tabs |

---

## REST Endpoint Base Paths

All endpoints are prefixed with `/api/restaurants/{restaurantId}/` unless noted.

```
/api/restaurants/{id}/ingredients
/api/restaurants/{id}/ingredients/{ingredientId}/costs
/api/restaurants/{id}/inventory/periods
/api/restaurants/{id}/inventory/periods/{periodId}/detail
/api/restaurants/{id}/inventory/periods/{periodId}/lines/{lineId}/count
/api/restaurants/{id}/suppliers
/api/restaurants/{id}/invoices
/api/restaurants/{id}/recipes
/api/restaurants/{id}/menu-items
/api/restaurants/{id}/cost-groups
/api/restaurants/{id}/menu-engineering/periods
/api/restaurants/{id}/tables/floor-status
/api/restaurants/{id}/sessions
/api/restaurants/{id}/orders
/api/restaurants/{id}/kpis/today
/api/restaurants/{id}/kpis/food-cost
/api/restaurants/{id}/kpis/weekly
/api/restaurants/{id}/kpis/prime-cost-trend
/api/restaurants/{id}/analytics/top-sellers
/api/restaurants/{id}/analytics/slow-sellers
/api/restaurants/{id}/sales/daily
/api/restaurants/{id}/guest-counts
/api/conversions/convert                     ← no restaurantId prefix
/api/conversions/ingredient-cost-calculator  ← no restaurantId prefix
```
