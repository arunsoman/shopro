---
name: restaurant-screen-executor
description: >
  Implements screens for the Restaurant Management Platform one at a time using a
  depth-first approach. Use this skill whenever the user asks to execute screen executor, implement, build, code,
  scaffold, or generate any screen, page, component, or feature from the restaurant
  platform (SS0–SS5). Also trigger when the user mentions: "implement the dashboard",
  "build the ingredient screen", "create the floor map", "add seeder data", "wire up
  the API", "connect to REST controllers", "implement POS screens", "build inventory
  management", or any reference to a screen ID like SS1.1, SS2.3, SS5.0 etc.
  This skill uses React + shadcn/ui + Tailwind CSS on the frontend and connects to
  Spring Boot REST controllers. It uses a depth-first strategy: one screen at a time,
  fully complete before moving to the next — including the component, API wiring,
  and seed data.
---

# Restaurant Platform Screen Executor

## Overview

This skill implements every screen documented in the Restaurant Management Platform
spec using a **depth-first approach**: implement one screen fully (component + API
hooks + seed data), verify it works, then move to the next.

**Tech Stack**
- Frontend: React 18 + TypeScript + shadcn/ui + Tailwind CSS
- API Layer: React Query (`@tanstack/react-query`) for REST calls
- State: Zustand for global state (auth, restaurant context)
- Charts: Recharts
- Routing: React Router v6
- Backend: Spring Boot REST controllers (called via fetch/axios)
- Seed data: Java `DataSeeder.java` (CommandLineRunner) per subsystem

---

## Pre-Execution Checklist

Before implementing any screen, read:
1. `references/screen-map.md` — all 53 screens, their IDs, service calls, and order
2. `references/api-contracts.md` — REST endpoint shapes and DTO structures
3. `references/component-library.md` — shared components and their props

---

## Depth-First Execution Protocol

### Phase 1 — Understand the Screen

For each screen, identify:
```
SCREEN ID:       e.g. SS1.1
NAME:            Ingredient Master List  
TYPE:            Full page | Slide-over | Modal | Hub
DATA SOURCES:    List of service methods → REST endpoints
USER ACTIONS:    What triggers what service call
CHILD SCREENS:   What this screen navigates to
SEED NEEDED:     What entities must exist for this screen to show data
```

### Phase 2 — Implement in This Exact Order

```
Step 1: Seed Data (Java DataSeeder)
  → Create realistic seed records for all entities this screen needs
  → Seed parent entities first (Restaurant → Supplier → Ingredient etc.)

Step 2: REST Hook (TypeScript)
  → Create useXxx() hook in src/hooks/
  → Uses @tanstack/react-query
  → Maps exactly to the documented service method / REST endpoint
  → Include loading, error, and success states

Step 3: Screen Component (TSX)
  → Create src/pages/SS{id}/{ScreenName}.tsx
  → Mobile-first (375px base), responsive up to desktop
  → Follow UX spec: cards on mobile, tables on tablet+
  → Use shadcn/ui components throughout
  → Wire all user actions to the REST hooks

Step 4: Route Registration
  → Add route to src/router/routes.tsx

Step 5: Navigation Link
  → Add nav entry to the appropriate section (bottom bar / sidebar / hub card)

Step 6: Smoke Test Notes
  → Document what the seeded data should produce in the UI
  → List any loading states, empty states, or error states to verify
```

### Phase 3 — Move to Next Screen

Only proceed after all 6 steps are complete. Follow the canonical order in
`references/screen-map.md` unless the user specifies a different screen.

---

## Project Structure

```
src/
├── api/
│   └── client.ts              # axios instance, base URL, auth header
├── hooks/
│   ├── useKpis.ts
│   ├── useIngredients.ts
│   ├── useInventory.ts
│   ├── useSuppliers.ts
│   ├── usePurchaseInvoices.ts
│   ├── useRecipes.ts
│   ├── useMenuEngineering.ts
│   └── useFloor.ts
├── pages/
│   ├── SS0/                   # Shell / Global
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── GlobalSearch.tsx
│   │   ├── Notifications.tsx
│   │   └── Settings.tsx
│   ├── SS1/                   # Inventory
│   ├── SS2/                   # Purchasing
│   ├── SS3/                   # Recipes & Menu
│   ├── SS4/                   # Menu Engineering
│   └── SS5/                   # POS / Floor
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx       # Bottom tab bar + header
│   │   ├── BottomTabBar.tsx
│   │   └── Sidebar.tsx        # Desktop persistent nav
│   ├── shared/
│   │   ├── KpiCard.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── SkeletonCard.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ConfirmModal.tsx
│   │   ├── BottomSheet.tsx
│   │   └── DataTable.tsx      # Responsive: cards on mobile, table on desktop
│   └── domain/
│       ├── IngredientCard.tsx
│       ├── TableCell.tsx      # Floor map cell
│       └── OrderLineRow.tsx
├── store/
│   └── useRestaurantStore.ts  # Zustand: restaurantId, authToken
├── router/
│   └── routes.tsx
└── lib/
    └── utils.ts               # cn(), currency(), percent()

backend/
└── src/main/java/com/restaurant/
    └── seeder/
        ├── RestaurantSeeder.java
        ├── InventorySeeder.java
        ├── PurchasingSeeder.java
        ├── RecipeSeeder.java
        ├── MenuEngineeringSeeder.java
        └── PosSeeder.java
```

---

## Seed Data Strategy

Each seeder is a Spring `@Component` that implements `CommandLineRunner` (or is
called from a master `DataSeeder` behind a `@Profile("dev")` guard).

### Seed Order (respects FK constraints)
```
1. Restaurant (1 record — "Bistro Verde")
2. Suppliers (5 records)
3. MenuCostGroups (4: Food, Beverages, Desserts, Cocktails)
4. DiningTables (12 tables across 2 sections)
5. Ingredients (20 FOOD + 10 BAR)
6. BatchRecipes (5 recipes, each using 3–5 ingredients)
7. MenuItems (15 items linked to cost groups + recipes)
8. PurchaseInvoices (10 invoices: mix of DRAFT/POSTED)
9. InventoryPeriods (2: one FOOD FINALISED, one OPEN)
10. TableSessions (8: mix of OPEN and CLOSED with orders)
11. Orders + OrderLines (realistic quantities for KPI computation)
12. MenuEngineeringPeriod (1 FINALISED period)
13. GuestCountEntries (current week, manual mode)
```

### Seeder Template (Java)

```java
@Component
@Profile("dev")
@Order(1)
public class RestaurantSeeder implements CommandLineRunner {

    @Autowired private RestaurantRepository restaurantRepo;

    @Override
    public void run(String... args) {
        if (restaurantRepo.count() > 0) return; // idempotent

        Restaurant r = new Restaurant();
        r.setName("Bistro Verde");
        r.setTimezone("America/New_York");
        r.setCreatedAt(LocalDateTime.now());
        restaurantRepo.save(r);
    }
}
```

---

## REST Hook Template (TypeScript)

```typescript
// src/hooks/useIngredients.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { useRestaurantStore } from '@/store/useRestaurantStore';

export interface Ingredient {
  id: number;
  itemCode: string;
  description: string;
  category: string;
  inventoryType: 'FOOD' | 'BAR';
  purchaseUnit: string;
  purchaseUnitPrice: number;
  recipeUnit: string;
  ruPerPu: number;
  yieldPct: number;
  inventoryUnit: string;
  iuPerPu: number;
  parLevel: number | null;
  active: boolean;
}

export function useIngredients(type?: 'FOOD' | 'BAR', category?: string) {
  const { restaurantId } = useRestaurantStore();
  return useQuery({
    queryKey: ['ingredients', restaurantId, type, category],
    queryFn: () =>
      api.get<Ingredient[]>(`/restaurants/${restaurantId}/ingredients`, {
        params: { type, category },
      }).then(r => r.data),
  });
}

export function useCreateIngredient() {
  const qc = useQueryClient();
  const { restaurantId } = useRestaurantStore();
  return useMutation({
    mutationFn: (body: Partial<Ingredient>) =>
      api.post(`/restaurants/${restaurantId}/ingredients`, body).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ingredients'] }),
  });
}

export function useUpdateIngredient(id: number) {
  const qc = useQueryClient();
  const { restaurantId } = useRestaurantStore();
  return useMutation({
    mutationFn: (body: Partial<Ingredient>) =>
      api.put(`/restaurants/${restaurantId}/ingredients/${id}`, body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ingredients'] });
      qc.invalidateQueries({ queryKey: ['ingredient', id] });
    },
  });
}
```

---

## Screen Component Template (TSX)

```tsx
// src/pages/SS1/IngredientList.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SkeletonCard } from '@/components/shared/SkeletonCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { useIngredients } from '@/hooks/useIngredients';
import { useDebounce } from '@/hooks/useDebounce';

export default function IngredientList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [type, setType] = useState<'FOOD' | 'BAR' | undefined>();
  const debouncedSearch = useDebounce(search, 300);

  const { data: ingredients, isLoading, error } = useIngredients(type);

  const filtered = ingredients?.filter(i =>
    i.description.toLowerCase().includes(debouncedSearch.toLowerCase())
  ) ?? [];

  if (isLoading) return <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}</div>;
  if (error) return <EmptyState icon="error" title="Failed to load ingredients" />;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ingredients..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-12"
            />
          </div>
          <Button variant="outline" size="icon" className="h-12 w-12 shrink-0">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        {/* Type filter — segmented control */}
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(['All', 'FOOD', 'BAR'] as const).map(t => (
            <button
              key={t}
              onClick={() => setType(t === 'All' ? undefined : t)}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${
                (t === 'All' ? !type : type === t)
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* List — cards on mobile */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filtered.length === 0 ? (
          <EmptyState icon="package" title="No ingredients found" />
        ) : (
          filtered.map(ingredient => (
            <button
              key={ingredient.id}
              onClick={() => navigate(`/ingredients/${ingredient.id}`)}
              className="w-full text-left bg-card rounded-xl p-4 shadow-sm border
                         active:scale-[0.98] transition-transform"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs text-muted-foreground">{ingredient.itemCode}</p>
                  <p className="font-semibold text-base leading-tight mt-0.5 truncate">
                    {ingredient.description}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {ingredient.category} · ${ingredient.purchaseUnitPrice.toFixed(2)}/{ingredient.purchaseUnit}
                  </p>
                </div>
                <Badge variant={ingredient.active ? 'default' : 'secondary'}>
                  {ingredient.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </button>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/ingredients/new')}
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full bg-emerald-600
                   text-white shadow-lg flex items-center justify-center
                   active:scale-95 transition-transform z-20"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
```

---

## Shared Components to Build First

Before implementing any screen, build these once:

### 1. `KpiCard.tsx`
Props: `title`, `value`, `unit?`, `delta?`, `deltaDir?`, `icon`, `isLive?`, `onClick?`

### 2. `DataTable.tsx`
Responsive wrapper: renders `<table>` on md+, card list on mobile.
Props: `columns`, `data`, `onRowClick?`, `isLoading?`, `emptyMessage?`

### 3. `BottomSheet.tsx`
Animated slide-up panel. Props: `open`, `onClose`, `title`, `children`, `height?`

### 4. `ConfirmModal.tsx`
Props: `open`, `onClose`, `onConfirm`, `title`, `description`, `variant?` (danger/warning/info)

### 5. `SkeletonCard.tsx`
Shimmer placeholder. Props: `lines?` (default 3)

### 6. `EmptyState.tsx`
Props: `icon`, `title`, `description?`, `action?`

### 7. `StatusBadge.tsx`
Maps string status → color. Covers: ACTIVE/INACTIVE, DRAFT/POSTED/VOID, OPEN/CLOSED/FINALISED, WINNER/WORKHORSE/OPPORTUNITY/LOSER

---

## Screen Execution Order

See `references/screen-map.md` for the full ordered list. Canonical order:

```
PHASE 0 — Foundation
  [0] Project scaffold + shared components + AppShell
  [1] SS0.1 Login
  [2] SS0.2 Dashboard ← start here for visible value

PHASE 1 — Inventory (SS1)
  [3]  SS1.0 Inventory Hub
  [4]  SS1.1 Ingredient Master List
  [5]  SS1.2 Ingredient Detail
  [6]  SS1.3 New Ingredient Form
  [7]  SS1.4 Inventory Count Entry
  [8]  SS1.5 Period Detail
  [9]  SS1.6 Period History
  [10] SS1.7 Period Comparison
  [11] SS1.8 Low Stock Alerts

PHASE 2 — Purchasing (SS2)
  [12] SS2.0 Purchasing Hub
  [13] SS2.1 Invoice Log
  [14] SS2.2 Invoice Entry
  [15] SS2.3 Weekly Summary
  [16] SS2.4 Trend Chart
  [17] SS2.5 Proof Alerts
  [18] SS2.6 Supplier Directory

PHASE 3 — Recipes & Menu (SS3)
  [19] SS3.0 Recipe Hub
  [20] SS3.1 Recipe List
  [21] SS3.2 Recipe Detail
  [22] SS3.3 Recipe Editor
  [23] SS3.4 Cost Group List
  [24] SS3.5 Menu Item List
  [25] SS3.6 Cost Card
  [26] SS3.7–3.9 Build Charts
  [27] SS3.10–3.11 Manual Editors
  [28] SS3.12 Unit Conversion Calculator

PHASE 4 — Menu Engineering (SS4)
  [29] SS4.0 Engineering Hub
  [30] SS4.1 Period Setup
  [31] SS4.2 Results Table
  [32] SS4.3 Item Drilldown
  [33] SS4.4 Quadrant Matrix
  [34] SS4.5 Category Summary
  [35] SS4.6 Period History
  [36] SS4.7 Live Sales Counter
  [37] SS4.8 What-If Simulator
  [38] SS4.9 Period Comparison

PHASE 5 — POS / Floor (SS5)
  [39] SS5.0 Floor Map
  [40] SS5.1 Open Session Modal
  [41] SS5.2 Session Detail
  [42] SS5.3 Session History
  [43] SS5.4 Guest Heatmap
  [44] SS5.5 KPI Analytics

PHASE 6 — Global Overlays
  [45] SS0.3 Global Search
  [46] SS0.4 Notifications Panel
  [47] SS0.5 Settings
```

---

## UX Rules (Always Apply)

1. **Mobile-first**: design for 375px, enhance for md (768px), lg (1024px)
2. **Bottom sheets** over modals for selections and forms on mobile
3. **Skeleton screens** while loading — never bare spinners
4. **Optimistic updates** for count entry and quantity changes
5. **Debounce 300ms** on all search inputs
6. **Touch targets**: min 44×44px — use `h-11 min-h-[44px]` on all clickables
7. **Color system**: emerald-600 primary, rose-500 danger, amber-500 warning
8. **Empty states**: always show icon + message + optional CTA
9. **Error states**: inline toast (sonner) for mutations, full-page error for queries
10. **Pull-to-refresh**: wrap main scroll areas with pull-to-refresh hook

---

## API Client Setup

```typescript
// src/api/client.ts
import axios from 'axios';
import { useRestaurantStore } from '@/store/useRestaurantStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = useRestaurantStore.getState().authToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

---

## Smoke Test Protocol

After each screen implementation, document expected output:

```
SCREEN: SS1.1 — Ingredient Master List
SEED RECORDS: 20 FOOD + 10 BAR ingredients in "Bistro Verde"
EXPECTED UI:
  ✓ 30 ingredient cards rendered
  ✓ Filter "BAR" shows 10 cards
  ✓ Search "tomato" narrows to 1 card
  ✓ Clicking card navigates to SS1.2
  ✓ FAB "+" opens SS1.3 slide-over
  ✓ Skeleton shown during first load
  ✓ Empty state shown if all filtered out
```

---

## Reference Files

| File | Contents |
|------|----------|
| `references/screen-map.md` | All 53 screens with service calls, full ordered list |
| `references/api-contracts.md` | Every REST endpoint, request/response DTO shapes |
| `references/component-library.md` | shadcn/ui components used + custom props |
| `references/seed-data.md` | Complete Java seeder code for all 13 entities |
| `references/entity-types.md` | All TypeScript interfaces matching Java DTOs |

Read the relevant reference file before starting each phase.
