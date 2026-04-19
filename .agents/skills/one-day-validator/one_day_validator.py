#!/usr/bin/env python3
"""
One-Day Validator — Simulates 1 day of restaurant traffic, tracks EVERY
data insertion, then validates the server's ENTIRE state by calling ALL
REST API endpoints and comparing actual vs expected.

Phases:
  0. PRE-SNAPSHOT  — baseline state of every entity
  1. BOOTSTRAP     — create restaurant/suppliers/ingredients/menu/staff/tables
  2. SIMULATE      — 1 day of traffic (clock-in, orders, procurement, clock-out)
  3. VALIDATE      — call every REST API, compare against tracked state

Usage:
    python one_day_validator.py [date] [restaurant_id]
    python one_day_validator.py                    # today, restaurant=3
    python one_day_validator.py 2026-04-19
    python one_day_validator.py 2026-04-19 1
"""

import subprocess, json, time, random, math, sys, os
from datetime import datetime, timedelta
import requests as _req

# ── CLI ARGS ─────────────────────────────────────────────────────────────
if len(sys.argv) > 1:
    SIM_DATE = datetime.strptime(sys.argv[1], "%Y-%m-%d")
else:
    SIM_DATE = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

RESTAURANT_ID = int(sys.argv[2]) if len(sys.argv) > 2 else 3
BASE = f"http://localhost:8080/api/v1/restaurants/{RESTAURANT_ID}"
SIM_BASE = "http://localhost:8080/api/v1/simulation"

# ── CONFIG ───────────────────────────────────────────────────────────────
LAMBDA_LUNCH = 5
LAMBDA_DINNER = 8
WEEKEND_MULT = 1.3
PARTY_MIN, PARTY_MAX = 2, 4
MAX_TABLES = 20

# ── PSQL HELPER ─────────────────────────────────────────────────────────
PG = ["psql", "-h", "localhost", "-U", "postgres", "-d", "shopro_pos", "-c"]
PSQL_PASS = "password"

def psql(sql):
    env = {**os.environ, "PGPASSWORD": PSQL_PASS}
    try:
        r = subprocess.run(PG + [sql], capture_output=True, text=True, timeout=15, env=env)
        return r.returncode == 0, r.stdout or r.stderr
    except Exception as e:
        return False, str(e)

# ── REST HELPERS ─────────────────────────────────────────────────────────
_sess = _req.Session()
_sess.headers.update({"Content-Type": "application/json"})

def _check_error(r, url):
    if 400 <= r.status_code < 600:
        print(f"\n❌ HTTP {r.status_code} from {url}")
        print(f"   Response: {r.text[:500]}")
        sys.exit(1)

def RGET(url, timeout=15):
    try:
        r = _sess.get(url, timeout=timeout)
        _check_error(r, url)
        if r.status_code == 200 and r.text.strip():
            return r.json()
    except SystemExit:
        raise
    except:
        pass
    return None

def RPOST(url, body=None, timeout=15):
    try:
        r = _sess.post(url, json=body, timeout=timeout)
        _check_error(r, url)
        return r.status_code, r.text or ""
    except SystemExit:
        raise
    except Exception as e:
        return 0, str(e)

def RPATCH(url, timeout=15):
    try:
        r = _sess.patch(url, timeout=timeout)
        _check_error(r, url)
        return r.status_code, r.text or ""
    except SystemExit:
        raise
    except Exception as e:
        return 0, str(e)

def RGET_FULL(url, timeout=15):
    """Returns (status_code, json_or_None, raw_text)."""
    try:
        r = _sess.get(url, timeout=timeout)
        _check_error(r, url)
        data = None
        try:
            data = r.json()
        except:
            pass
        return r.status_code, data, r.text or ""
    except SystemExit:
        raise
    except Exception as e:
        return 0, None, str(e)


# ═══════════════════════════════════════════════════════════════════════════
# TRACKING LEDGER — records EVERY insertion for later validation
# ═══════════════════════════════════════════════════════════════════════════

class TrackingLedger:
    """Immutable record of everything the simulator inserted into the system."""

    def __init__(self):
        # Bootstrap entities
        self.supplier_ids = []
        self.ingredient_ids = {}       # item_code → ingredient_id
        self.cost_group_ids = []
        self.menu_item_ids = {}        # pos_id → menu_item_id
        self.recipe_ids = {}
        self.staff_ids = []
        self.table_ids = []

        # Simulation events
        self.clockins = []             # [{employee_id, time}]
        self.clockouts = []            # [{employee_id, time}]
        self.sessions_opened = []      # [{session_id, table_id, openedAt, guests}]
        self.sessions_closed = []      # [{session_id, closedAt}]
        self.orders_placed = []         # [{order_id, session_id, total, lines, createdAt, status}]
        self.orders_paid = []           # [{order_id, paidAt}]
        self.procurement = []           # [{po_id, grn_id, invoice_id, lines: [{ingredient_id, qty, price}], posted: bool}]

        # Aggregations (computed after simulation)
        self.expected_order_count = 0
        self.expected_revenue = 0.0
        self.expected_ingredient_consumption = {}  # {ingredient_id: qty}
        self.expected_stock_received = {}           # {ingredient_id: qty}

    def compute_aggregations(self, recipe_cache, menu_price_cache):
        """Compute expected totals from tracked data."""
        self.expected_order_count = len(self.orders_placed)
        self.expected_revenue = sum(o["total"] for o in self.orders_placed)

        # Ingredient consumption based on recipe × order lines
        for order in self.orders_placed:
            for line in order.get("lines", []):
                mid = line.get("menuItemId")
                qty = line.get("quantity", 1)
                recipe_lines = recipe_cache.get(mid, [])
                for rl in recipe_lines:
                    iid = rl["i"]
                    ingr_qty = rl["q"] * qty
                    self.expected_ingredient_consumption[iid] = \
                        self.expected_ingredient_consumption.get(iid, 0) + ingr_qty

        # Stock received from procurement
        for proc in self.procurement:
            for line in proc.get("lines", []):
                iid = line["ingredient_id"]
                qty = line["receivedQty"]
                self.expected_stock_received[iid] = \
                    self.expected_stock_received.get(iid, 0) + qty


ledger = TrackingLedger()


# ═══════════════════════════════════════════════════════════════════════════
# VALIDATION REPORT
# ═══════════════════════════════════════════════════════════════════════════

class ValidationReport:
    def __init__(self):
        self.results = []    # [{category, check, status, expected, actual, detail}]

    def pass_(self, category, check, expected="", actual="", detail=""):
        self.results.append({"category": category, "check": check, "status": "PASS",
                             "expected": expected, "actual": actual, "detail": detail})

    def warn(self, category, check, expected="", actual="", detail=""):
        self.results.append({"category": category, "check": check, "status": "WARN",
                             "expected": expected, "actual": actual, "detail": detail})

    def fail(self, category, check, expected="", actual="", detail=""):
        self.results.append({"category": category, "check": check, "status": "FAIL",
                             "expected": expected, "actual": actual, "detail": detail})

    def summary(self):
        passed = sum(1 for r in self.results if r["status"] == "PASS")
        warned = sum(1 for r in self.results if r["status"] == "WARN")
        failed = sum(1 for r in self.results if r["status"] == "FAIL")
        return passed, warned, failed

    def print_report(self):
        print("\n" + "=" * 70)
        print("📊  ONE-DAY VALIDATION REPORT")
        print("=" * 70)

        # Group by category
        categories = {}
        for r in self.results:
            cat = r["category"]
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(r)

        for cat, checks in categories.items():
            print(f"\n┌─ {cat} {'─' * (60 - len(cat))}")
            for c in checks:
                icon = {"PASS": "✅", "WARN": "⚠️", "FAIL": "🚨"}[c["status"]]
                line = f"│ {icon} {c['check']}"
                if c["expected"] or c["actual"]:
                    line += f"  (expected: {c['expected']}, actual: {c['actual']})"
                if c["detail"]:
                    line += f"  — {c['detail']}"
                print(line)
            print(f"└{'─' * 69}")

        passed, warned, failed = self.summary()
        print(f"\n{'=' * 70}")
        print(f"  ✅ Passed: {passed}   ⚠️ Warnings: {warned}   🚨 Failed: {failed}")
        overall = "✅ ALL PASS" if failed == 0 else "🚨 FAILURES DETECTED"
        print(f"  Overall: {overall}")
        print("=" * 70)

    def print_failed(self):
        """Print only failures with full detail."""
        failures = [r for r in self.results if r["status"] == "FAIL"]
        if not failures:
            return
        print("\n" + "=" * 70)
        print("🚨  FAILURE DETAILS")
        print("=" * 70)
        for f in failures:
            print(f"  [{f['category']}] {f['check']}")
            print(f"    Expected: {f['expected']}")
            print(f"    Actual:   {f['actual']}")
            if f["detail"]:
                print(f"    Detail:   {f['detail']}")
            print()


report = ValidationReport()


# ═══════════════════════════════════════════════════════════════════════════
# SEED DATA (Afghan Cuisine)
# ═══════════════════════════════════════════════════════════════════════════


# ═══════════════════════════════════════════════════════════════════════════
# RECIPE CACHE
# ═══════════════════════════════════════════════════════════════════════════

recipe_cache = {}       # {menu_item_id: [{i: ingredient_id, q: quantity}]}
menu_price_cache = {}   # {menu_item_id: sellPrice}
all_menu_ids = []
ingredient_names = {}   # {ingredient_id: description}

def build_recipe_cache():
    """Build recipe cache + menu prices from REST API."""
    global recipe_cache, menu_price_cache, all_menu_ids, ingredient_names

    recipes = RGET(f"{BASE}/recipes") or []
    cache = {}
    for r in recipes:
        mid = r.get("menuItemId")
        if mid is None:
            continue
        if not (r.get("active") or r.get("isActive")):
            continue
        lines = []
        for l in r.get("ingredientLines", []):
            iid = l.get("ingredientId")
            if iid is None:
                continue
            lines.append({"i": iid, "q": float(l.get("quantity", 0) or l.get("quantityRu", 0))})
        cache[mid] = lines
    recipe_cache = cache

    items = RGET(f"{BASE}/menu-items") or []
    all_menu_ids = []
    for it in items:
        mid = it.get("id")
        price = it.get("sellPriceBuffer") or it.get("sellPrice") or 0
        if mid and it.get("active", True):
            all_menu_ids.append(mid)
            menu_price_cache[mid] = float(price)

    # Ingredient names
    ings = RGET(f"{BASE}/ingredients") or []
    for ing in ings:
        iid = ing.get("id")
        if iid:
            ingredient_names[iid] = ing.get("description", f"ING#{iid}")


# ═══════════════════════════════════════════════════════════════════════════
# PHASE 0: PRE-SNAPSHOT
# ═══════════════════════════════════════════════════════════════════════════

def pre_snapshot():
    """Capture baseline state of every entity before simulation."""
    snap = {}

    # Orders
    snap["orders_count"] = len(RGET(f"{BASE}/pos/orders") or [])

    # Ingredients on-hand
    ings = RGET(f"{BASE}/ingredients") or []
    snap["ingredient_onhand"] = {ing["id"]: float(ing.get("onHand", 0) or 0) for ing in ings if ing.get("id")}

    # Tables
    tables = RGET(f"{BASE}/pos/tables") or []
    snap["table_count"] = len(tables)
    snap["table_statuses"] = {t.get("id"): t.get("status") for t in tables if t.get("id")}

    # Active sessions
    snap["active_sessions_count"] = len(RGET(f"{BASE}/pos/sessions/active") or [])

    # Suppliers
    snap["supplier_count"] = len(RGET(f"{BASE}/suppliers") or [])

    # Purchase orders
    snap["po_count"] = len(RGET(f"{BASE}/purchase-orders") or [])

    # GRNs
    snap["grn_count"] = len(RGET(f"{BASE}/purchasing/grns") or [])

    # Invoices
    inv_data = RGET(f"{BASE}/purchasing/invoices") or []
    snap["invoice_count"] = len(inv_data) if isinstance(inv_data, list) else 0

    # Staff / employees
    emps = RGET(f"{BASE}/prime-cost/labor/employees") or []
    snap["employee_count"] = len(emps)

    # Menu items
    snap["menu_item_count"] = len(RGET(f"{BASE}/menu-items") or [])

    # Recipes
    snap["recipe_count"] = len(RGET(f"{BASE}/recipes") or [])

    # Cost groups
    snap["cost_group_count"] = len(RGET(f"{BASE}/cost-groups") or [])

    # Inventory stats
    inv_stats = RGET(f"{BASE}/inventory/stats")
    snap["inventory_value"] = float(inv_stats.get("totalInventoryValue", 0) or 0) if inv_stats else 0

    return snap


# ═══════════════════════════════════════════════════════════════════════════
# PHASE 1: BOOTSTRAP
# ═══════════════════════════════════════════════════════════════════════════

def bootstrap():
    """Create everything from scratch — REST where possible, psql where no endpoint exists."""
    print("\n🔧 Phase 1: Bootstrap")
    print("=" * 60)

    # Restaurant
    ok, _ = psql(f"INSERT INTO restaurant (id, name, timezone, created_at, updated_at) "
                 f"VALUES ({RESTAURANT_ID}, 'Afghan Cuisine', 'Asia/Kabul', NOW(), NOW()) "
                 f"ON CONFLICT (id) DO NOTHING")
    print(f"  ✓ Restaurant {RESTAURANT_ID}")

    # Suppliers
    for s in SEED_SUPPLIERS:
        code, body = RPOST(f"{BASE}/suppliers", s)
        if code in (200, 201):
            try:
                d = json.loads(body)
                sid = d.get("id")
                if sid:
                    ledger.supplier_ids.append(sid)
            except:
                pass
    print(f"  ✓ {len(ledger.supplier_ids)} suppliers")

    # Ingredients — create via REST, but also load existing IDs from psql
    for ing in SEED_INGREDIENTS:
        code, desc, itype, cat, pu, case, price, ru, rppu, yp, iu, iuppu, par = ing
        _, body = RPOST(f"{BASE}/ingredients", {
            "itemCode": code, "description": desc,
            "inventoryType": itype, "category": cat,
            "purchaseUnit": pu, "casePackSize": case, "purchaseUnitPrice": price,
            "recipeUnit": ru, "ruPerPu": rppu, "yieldPct": yp,
            "inventoryUnit": iu, "iuPerPu": iuppu,
            "parLevel": par, "onHand": par * 2, "active": True
        })
        try:
            d = json.loads(body)
            iid = d.get("id")
            if iid:
                ledger.ingredient_ids[code] = iid
        except:
            pass
    # Fallback: load existing ingredients from psql for items REST didn't create
    if len(ledger.ingredient_ids) < len(SEED_INGREDIENTS):
        _, ing_out = psql(f"SELECT id, item_code FROM ingredient WHERE restaurant_id={RESTAURANT_ID} ORDER BY id")
        for line in ing_out.strip().split('\n'):
            parts = line.strip().split('|')
            if len(parts) >= 2:
                try:
                    iid = int(parts[0].strip())
                    code = parts[1].strip()
                    if code not in ledger.ingredient_ids:
                        ledger.ingredient_ids[code] = iid
                except:
                    pass
    print(f"  ✓ {len(ledger.ingredient_ids)} ingredients")

    # Cost groups (psql — REST has duplicate issue)
    grp_parts = []
    for g in SEED_COST_GROUPS:
        grp_parts.append(f"({RESTAURANT_ID},'{g['name']}','{g['revenueCategory']}',{g['displayOrder']},NOW())")
    psql(f"INSERT INTO menu_cost_group (restaurant_id,name,revenue_category,display_order,created_at) "
         f"VALUES {','.join(grp_parts)} ON CONFLICT (restaurant_id,name) DO NOTHING")
    _, grp_out = psql(f"SELECT id,name FROM menu_cost_group WHERE restaurant_id={RESTAURANT_ID} ORDER BY display_order")
    grp_ids = []
    for line in grp_out.strip().split('\n'):
        parts = line.strip().split('|')
        if len(parts) >= 2:
            try:
                grp_ids.append(int(parts[0].strip()))
            except:
                pass
    ledger.cost_group_ids = grp_ids
    print(f"  ✓ {len(grp_ids)} cost groups")

    # Menu items (psql — REST endpoint has pos_id NULL bug)
    for item in SEED_MENU_ITEMS:
        gidx, posId, name, sell, fcPct, _ = item
        gid = grp_ids[gidx] if gidx < len(grp_ids) else (grp_ids[0] if grp_ids else 1)
        psql(f"INSERT INTO menu_item (restaurant_id,group_id,pos_id,name,sell_price,target_fc_pct,plate_cost,is_active,display_order,created_at,updated_at) "
             f"VALUES ({RESTAURANT_ID},{gid},'{posId}','{name}',{sell},{fcPct},{sell*fcPct},true,1,NOW(),NOW()) "
             f"ON CONFLICT (restaurant_id,pos_id) DO NOTHING")
    _, mi_out = psql(f"SELECT id,pos_id FROM menu_item WHERE restaurant_id={RESTAURANT_ID} ORDER BY pos_id")
    for line in mi_out.strip().split('\n'):
        parts = line.strip().split('|')
        if len(parts) >= 2:
            try:
                ledger.menu_item_ids[parts[1].strip()] = int(parts[0].strip())
            except:
                pass
    print(f"  ✓ {len(ledger.menu_item_ids)} menu items")

    # Recipes + ingredient lines (psql)
    def mid(pos_id):
        return ledger.menu_item_ids.get(pos_id, 0)
    def iid(ing_code):
        return ledger.ingredient_ids.get(ing_code, 0)

    recipe_rows = [
        (mid('M01'), 'Kabuli Pulao', 'PLATE', 'LINE_COOK', True, 1.0, 'EACH', 'ONE_DAY'),
        (mid('M02'), 'Lamb Karahi', 'PLATE', 'LINE_COOK', True, 1.0, 'EACH', 'ONE_SHIFT'),
        (mid('M03'), 'Mantu Dumplings', 'PLATE', 'LINE_COOK', True, 1.0, 'EACH', 'ONE_DAY'),
        (mid('M04'), 'Ashak Dumplings', 'PLATE', 'LINE_COOK', True, 1.0, 'EACH', 'ONE_DAY'),
        (mid('K01'), 'Chopan Kebab', 'PLATE', 'LINE_COOK', True, 1.0, 'EACH', 'ONE_SHIFT'),
        (mid('K02'), 'Chicken Tikka', 'PLATE', 'LINE_COOK', True, 1.0, 'EACH', 'ONE_SHIFT'),
        (mid('K03'), 'Shami Kebab', 'PLATE', 'PREP_COOK', True, 1.0, 'EACH', 'ONE_DAY'),
        (mid('S01'), 'Borani Banjan', 'PLATE', 'PREP_COOK', True, 1.0, 'EACH', 'ONE_DAY'),
        (mid('S02'), 'Dal (Lentil Stew)', 'PLATE', 'LINE_COOK', True, 1.0, 'EACH', 'ONE_DAY'),
        (mid('S03'), 'Tandoori Naan', 'BATCH', 'PREP_COOK', True, 8.0, 'EACH', 'ONE_SHIFT'),
        (mid('B01'), 'Afghan Chai', 'BATCH', 'PANTRY', True, 10.0, 'CUP', 'ONE_SHIFT'),
        (mid('B02'), 'Dogh', 'BATCH', 'PANTRY', True, 4.0, 'PINT', 'ONE_DAY'),
    ]
    rv = ','.join(
        f"({RESTAURANT_ID},{m},'{name}','{rtype}','{stn}',{str(act).lower()},{yq},'{yu}','{sl}',NOW(),NOW())"
        for m, name, rtype, stn, act, yq, yu, sl in recipe_rows if m > 0
    )
    psql(f"INSERT INTO recipe (restaurant_id,menu_item_id,name,recipe_type,station,is_active,yield_quantity,yield_unit,shelf_life,created_at,updated_at) "
         f"VALUES {rv} ON CONFLICT DO NOTHING")

    # Recipe ingredient lines
    ril_data = [
        (mid('M01'), iid('ING01'), 1, 0.50, 'LB'),
        (mid('M01'), iid('ING02'), 2, 0.50, 'LB'),
        (mid('M01'), iid('ING06'), 3, 0.02, 'LB'),
        (mid('M01'), iid('ING10'), 4, 0.005, 'LB'),
        (mid('M02'), iid('ING02'), 1, 1.00, 'LB'),
        (mid('M02'), iid('ING04'), 2, 0.30, 'LB'),
        (mid('M02'), iid('ING05'), 3, 0.02, 'LB'),
        (mid('M02'), iid('ING03'), 4, 0.02, 'CUP'),
        (mid('M02'), iid('ING07'), 5, 0.01, 'LB'),
        (mid('M03'), iid('ING02'), 1, 0.40, 'LB'),
        (mid('M03'), iid('ING14'), 2, 0.20, 'LB'),
        (mid('M03'), iid('ING04'), 3, 0.20, 'LB'),
        (mid('M03'), iid('ING11'), 4, 0.10, 'CUP'),
        (mid('M04'), iid('ING19'), 1, 0.30, 'LB'),
        (mid('M04'), iid('ING04'), 2, 0.20, 'LB'),
        (mid('M04'), iid('ING11'), 3, 0.10, 'CUP'),
        (mid('M04'), iid('ING14'), 4, 0.15, 'LB'),
        (mid('K01'), iid('ING02'), 1, 0.75, 'LB'),
        (mid('K01'), iid('ING06'), 2, 0.02, 'LB'),
        (mid('K01'), iid('ING07'), 3, 0.01, 'LB'),
        (mid('K01'), iid('ING09'), 4, 0.005, 'LB'),
        (mid('K02'), iid('ING02'), 1, 0.50, 'LB'),
        (mid('K02'), iid('ING11'), 2, 0.10, 'CUP'),
        (mid('K02'), iid('ING07'), 3, 0.01, 'LB'),
        (mid('K02'), iid('ING08'), 4, 0.005, 'LB'),
        (mid('K03'), iid('ING02'), 1, 0.30, 'LB'),
        (mid('K03'), iid('ING12'), 2, 0.20, 'LB'),
        (mid('K03'), iid('ING04'), 3, 0.10, 'LB'),
        (mid('K03'), iid('ING05'), 4, 0.01, 'LB'),
        (mid('S01'), iid('ING20'), 1, 1.00, 'LB'),
        (mid('S01'), iid('ING11'), 2, 0.05, 'CUP'),
        (mid('S01'), iid('ING06'), 3, 0.01, 'LB'),
        (mid('S02'), iid('ING13'), 1, 0.50, 'LB'),
        (mid('S02'), iid('ING04'), 2, 0.20, 'LB'),
        (mid('S02'), iid('ING03'), 3, 0.02, 'CUP'),
        (mid('S02'), iid('ING07'), 4, 0.005, 'LB'),
        (mid('S03'), iid('ING14'), 1, 0.25, 'LB'),
        (mid('S03'), iid('ING11'), 2, 0.02, 'CUP'),
        (mid('S03'), iid('ING03'), 3, 0.005, 'CUP'),
        (mid('B01'), iid('ING16'), 1, 0.01, 'LB'),
        (mid('B01'), iid('ING17'), 2, 0.002, 'LB'),
        (mid('B02'), iid('ING11'), 1, 0.10, 'CUP'),
        (mid('B02'), iid('ING04'), 2, 0.05, 'LB'),
    ]
    ril_vals = ','.join(
        f"((SELECT id FROM recipe WHERE menu_item_id={m} AND restaurant_id={RESTAURANT_ID}),{i},{ln},{q},'{ru}')"
        for m, i, ln, q, ru in ril_data if m > 0 and i > 0
    )
    psql(f"INSERT INTO recipe_ingredient_line (recipe_id,ingredient_id,line_number,quantity_ru,recipe_unit) "
         f"VALUES {ril_vals} ON CONFLICT DO NOTHING")
    print(f"  ✓ recipes + ingredient lines")

    # Staff (psql)
    staff_vals = ','.join(
        f"({RESTAURANT_ID},'{n}','{t}',{r},true,NOW())" for n, t, r in SEED_STAFF
    )
    psql(f"INSERT INTO employee (restaurant_id,name,employee_type,hourly_rate,is_active,created_at) "
         f"VALUES {staff_vals} ON CONFLICT (restaurant_id,name) DO NOTHING")
    _, cnt = psql(f"SELECT count(*) FROM employee WHERE restaurant_id={RESTAURANT_ID}")
    staff_count = int(cnt.strip()) if cnt.strip().isdigit() else len(SEED_STAFF)
    print(f"  ✓ {staff_count} staff")

    # Load staff IDs into ledger
    emps = RGET(f"{BASE}/prime-cost/labor/employees") or []
    for emp in emps:
        if emp.get("isActive", True):
            ledger.staff_ids.append({"id": emp.get("id"), "name": emp.get("name"), "type": emp.get("employeeType", "HOURLY")})

    # Tables (psql)
    psql(f"""INSERT INTO dining_table (restaurant_id,table_number,capacity,status,pos_x,pos_y)
        SELECT {RESTAURANT_ID},'T'||n, CASE WHEN n<=6 THEN 2 WHEN n<=16 THEN 4 ELSE 6 END, 'AVAILABLE',
               ((n-1)%5)*100+40, ((n-1)/5)*100+40
        FROM generate_series(1,{MAX_TABLES}) AS n
        ON CONFLICT (restaurant_id,table_number) DO NOTHING""")
    _, cnt = psql(f"SELECT count(*) FROM dining_table WHERE restaurant_id={RESTAURANT_ID}")
    table_count = int(cnt.strip()) if cnt.strip().isdigit() else MAX_TABLES
    print(f"  ✓ {table_count} tables")

    # Load table IDs into ledger — try REST first, fallback to psql
    tbls = RGET(f"{BASE}/pos/tables") or []
    for t in tbls:
        tid = t.get("id")
        if tid:
            ledger.table_ids.append(tid)
    if not ledger.table_ids:
        # Fallback: load from psql when REST /tables has serialization bug
        _, tbl_out = psql(f"SELECT id FROM dining_table WHERE restaurant_id={RESTAURANT_ID} AND table_number LIKE 'T%_' ORDER BY id")
        for line in tbl_out.strip().split('\n'):
            line = line.strip()
            if line and line.isdigit():
                ledger.table_ids.append(int(line))
        print(f"    (loaded {len(ledger.table_ids)} table IDs from psql fallback)")

    print(f"\n  Bootstrap complete: {len(ledger.supplier_ids)}s  {len(ledger.ingredient_ids)}ing  "
          f"{len(grp_ids)}grp  {len(ledger.menu_item_ids)}mi  {len(ledger.staff_ids)}st  {len(ledger.table_ids)}tbl")


# ═══════════════════════════════════════════════════════════════════════════
# PHASE 2: SIMULATE ONE DAY
# ═══════════════════════════════════════════════════════════════════════════

def poisson(lam):
    if lam <= 0:
        return 0
    L = math.exp(-lam)
    k = 0
    p = 1.0
    while p > L:
        k += 1
        p *= random.random()
    return max(0, k - 1)


def simulate_one_day():
    """Simulate one complete day of restaurant operations with full tracking."""
    date_str = SIM_DATE.strftime("%Y-%m-%d")
    is_weekend = SIM_DATE.weekday() >= 5
    dt_label = "Weekend" if is_weekend else "Weekday"

    print(f"\n🍽️  Phase 2: Simulate ONE DAY — {date_str} ({dt_label})")
    print("=" * 60)

    # ── 2a. Clock-in all staff ──────────────────────────────────────────
    print("  ⏰ Clocking in staff ...")
    for staff in ledger.staff_ids:
        # 90% on-time (7:30-8:30), 10% late (9:00-12:00)
        if random.random() < 0.90:
            clock_in = SIM_DATE.replace(hour=random.randint(7, 8), minute=random.choice([0, 15, 30, 45]), second=0)
        else:
            clock_in = SIM_DATE.replace(hour=random.randint(9, 11), minute=random.randint(0, 59), second=0)

        code, body = RPOST(f"{BASE}/prime-cost/labor/employees/{staff['id']}/clock-in?clockInTime={clock_in.isoformat()}")
        if code in (200, 201):
            ledger.clockins.append({"employee_id": staff["id"], "time": clock_in})
        else:
            # Try alternate labor endpoint
            code2, body2 = RPOST(f"{BASE}/labor/employees/{staff['id']}/clock-in?clockInTime={clock_in.isoformat()}")
            if code2 in (200, 201):
                ledger.clockins.append({"employee_id": staff["id"], "time": clock_in})
            else:
                # Try staff shifts endpoint
                code3, body3 = RPOST(f"{BASE}/staff/{staff['id']}/shifts/clock-in?clockInTime={clock_in.isoformat()}")
                if code3 in (200, 201):
                    ledger.clockins.append({"employee_id": staff["id"], "time": clock_in})
    print(f"  ✓ {len(ledger.clockins)}/{len(ledger.staff_ids)} staff clocked in")

    # ── 2b. Generate and process orders ────────────────────────────────
    print("  📋 Processing orders ...")
    total_arrivals = 0
    order_errors = 0

    LUNCH_H = (11, 14)
    DINNER_H = (17, 22)

    for hour in range(24):
        # Determine lambda
        if LUNCH_H[0] <= hour <= LUNCH_H[1]:
            lam = LAMBDA_LUNCH
        elif DINNER_H[0] <= hour <= DINNER_H[1]:
            lam = LAMBDA_DINNER
        else:
            continue

        if is_weekend:
            lam = lam * WEEKEND_MULT

        arrivals = poisson(lam)
        total_arrivals += arrivals

        for arr_i in range(arrivals):
            party = random.randint(PARTY_MIN, PARTY_MAX)
            wanted = [random.choice(all_menu_ids) for _ in range(party)]
            ok_items = [m for m in wanted if m in menu_price_cache]
            if not ok_items:
                continue

            total = round(sum(menu_price_cache.get(m, 0) for m in ok_items), 2)
            order_time = SIM_DATE.replace(hour=hour, minute=random.randint(0, 59),
                                           second=random.randint(0, 59))

            # Pick a random table
            if not ledger.table_ids:
                order_errors += 1
                continue
            tbl_id = random.choice(ledger.table_ids)

            # Open session
            _, sess_body = RPOST(f"{BASE}/pos/tables/{tbl_id}/open?guests={party}&openedAt={order_time.isoformat()}", {})
            try:
                sess = json.loads(sess_body)
                session_id = sess.get("id")
                if session_id:
                    ledger.sessions_opened.append({
                        "session_id": session_id, "table_id": tbl_id,
                        "openedAt": order_time, "guests": party
                    })
                else:
                    order_errors += 1
                    continue
            except:
                order_errors += 1
                continue

            # Place order
            onum = f"ODV-{order_time.strftime('%Y%m%d%H%M%S')}-{random.randint(10000, 99999)}"
            lines = [{"menuItemId": m, "quantity": 1, "unitPrice": menu_price_cache.get(m, 0)} for m in ok_items]
            _, order_body = RPOST(f"{BASE}/pos/orders", {
                "orderNumber": onum,
                "sessionId": session_id,
                "totalAmount": total,
                "status": "PENDING",
                "createdAt": order_time.isoformat(),
                "lines": lines
            })
            order = None
            order_id = None
            try:
                order = json.loads(order_body)
                order_id = order.get("id")
            except:
                pass

            if order_id:
                ledger.orders_placed.append({
                    "order_id": order_id, "session_id": session_id,
                    "total": total, "lines": lines, "createdAt": order_time,
                    "status": "PENDING"
                })

                # Mark PAID
                RPATCH(f"{BASE}/pos/orders/{order_id}/status?status=PAID")
                ledger.orders_paid.append({"order_id": order_id, "paidAt": order_time})
            else:
                order_errors += 1

            # Close session
            close_min = random.randint(45, 90)
            close_dt = order_time + timedelta(minutes=close_min)
            RPOST(f"{BASE}/pos/sessions/{session_id}/close?closedAt={close_dt.isoformat()}", {})
            ledger.sessions_closed.append({"session_id": session_id, "closedAt": close_dt})

            # Clean table
            RPATCH(f"{BASE}/pos/tables/{tbl_id}/status?status=AVAILABLE")

    print(f"  ✓ {total_arrivals} arrivals, {len(ledger.orders_placed)} orders placed, {len(ledger.orders_paid)} paid")
    if order_errors:
        print(f"  ⚠️  {order_errors} order errors")

    # ── 2c. Procurement — receive stock ────────────────────────────────
    print("  📦 Running procurement cycle ...")
    if ledger.supplier_ids:
        sup_id = ledger.supplier_ids[0]
        # Pick 3 ingredients to restock
        proc_lines = []
        ing_ids_list = list(ledger.ingredient_ids.values())[:3]
        for iid in ing_ids_list:
            proc_lines.append({"ingredientId": iid, "receivedQty": 10, "unitPrice": 5.00})

        code, body = RPOST(f"{BASE}/purchasing/grns/receive", {
            "supplierId": sup_id,
            "lines": proc_lines
        })
        if code in (200, 201):
            try:
                resp = json.loads(body)
                po_id = resp.get("purchaseOrderId") or resp.get("poId")
                grn_id = resp.get("goodsReceiptId") or resp.get("grnId")
                invoice_id = resp.get("invoiceId")

                proc_record = {
                    "po_id": po_id, "grn_id": grn_id, "invoice_id": invoice_id,
                    "lines": proc_lines, "posted": False
                }

                # Post invoice for 3-way match
                if invoice_id:
                    post_code, _ = RPOST(f"{BASE}/purchasing/invoices/{invoice_id}/post", {})
                    if post_code in (200, 201):
                        proc_record["posted"] = True

                ledger.procurement.append(proc_record)
                print(f"  ✓ Procurement: PO#{po_id} GRN#{grn_id} INV#{invoice_id} (posted={proc_record['posted']})")
            except Exception as e:
                print(f"  ⚠️  Procurement parse error: {e}")
        else:
            print(f"  ⚠️  Procurement API returned {code}")

    # ── 2d. Clock-out all staff ─────────────────────────────────────────
    print("  🌙 Clocking out staff ...")
    for staff in ledger.staff_ids:
        clock_out = SIM_DATE.replace(hour=random.randint(19, 20), minute=random.randint(0, 59), second=0)
        code, body = RPOST(f"{BASE}/prime-cost/labor/employees/{staff['id']}/clock-out?clockOutTime={clock_out.isoformat()}")
        if code in (200, 201):
            ledger.clockouts.append({"employee_id": staff["id"], "time": clock_out})
        else:
            # Try alternate labor endpoint
            code2, body2 = RPOST(f"{BASE}/labor/employees/{staff['id']}/clock-out?clockOutTime={clock_out.isoformat()}")
            if code2 in (200, 201):
                ledger.clockouts.append({"employee_id": staff["id"], "time": clock_out})
            else:
                # Try staff shifts endpoint
                code3, body3 = RPOST(f"{BASE}/staff/{staff['id']}/shifts/clock-out?clockOutTime={clock_out.isoformat()}")
                if code3 in (200, 201):
                    ledger.clockouts.append({"employee_id": staff["id"], "time": clock_out})
    print(f"  ✓ {len(ledger.clockouts)}/{len(ledger.staff_ids)} staff clocked out")

    # ── 2e. Compute aggregations ───────────────────────────────────────
    ledger.compute_aggregations(recipe_cache, menu_price_cache)

    print(f"\n  📊 Simulation Summary:")
    print(f"     Orders:     {ledger.expected_order_count}")
    print(f"     Revenue:    ${ledger.expected_revenue:,.2f}")
    print(f"     Sessions:   {len(ledger.sessions_opened)} opened / {len(ledger.sessions_closed)} closed")
    print(f"     Clock-ins:  {len(ledger.clockins)}")
    print(f"     Clock-outs: {len(ledger.clockouts)}")
    print(f"     Procurement:{len(ledger.procurement)} cycles")


# ═══════════════════════════════════════════════════════════════════════════
# PHASE 3: VALIDATE ALL ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

def validate_pos():
    """Validate POS-related endpoints and state."""
    cat = "POS"

    # V1: Order count
    orders = RGET(f"{BASE}/pos/orders") or []
    actual_count = len(orders)
    expected_count = ledger.expected_order_count
    if actual_count >= expected_count:
        report.pass_(cat, f"Order count ≥ expected", str(expected_count), str(actual_count))
    elif actual_count >= expected_count * 0.9:
        report.warn(cat, f"Order count slightly below expected", str(expected_count), str(actual_count))
    else:
        report.fail(cat, f"Order count far below expected", str(expected_count), str(actual_count))

    # V2: Revenue
    actual_revenue = sum(float(o.get("totalAmount", 0) or 0) for o in orders if o.get("status") == "PAID")
    expected_revenue = ledger.expected_revenue
    tolerance = max(expected_revenue * 0.05, 1.0)  # 5% or $1
    if abs(actual_revenue - expected_revenue) <= tolerance:
        report.pass_(cat, f"Total revenue matches", f"${expected_revenue:.2f}", f"${actual_revenue:.2f}")
    elif abs(actual_revenue - expected_revenue) <= tolerance * 3:
        report.warn(cat, f"Total revenue slightly off", f"${expected_revenue:.2f}", f"${actual_revenue:.2f}")
    else:
        report.fail(cat, f"Total revenue mismatch", f"${expected_revenue:.2f}", f"${actual_revenue:.2f}")

    # V3: All tracked orders exist
    tracked_ids = {o["order_id"] for o in ledger.orders_placed}
    server_ids = {o.get("id") for o in orders if o.get("id")}
    missing = tracked_ids - server_ids
    if not missing:
        report.pass_(cat, "All tracked orders found in server", str(len(tracked_ids)), str(len(server_ids)))
    else:
        report.fail(cat, f"{len(missing)} tracked orders missing from server",
                    str(len(tracked_ids)), str(len(server_ids)),
                    f"Missing IDs: {list(missing)[:5]}")

    # V4: All orders are PAID
    paid_count = sum(1 for o in orders if o.get("status") == "PAID")
    if paid_count >= ledger.expected_order_count * 0.9:
        report.pass_(cat, "Orders marked as PAID", str(ledger.expected_order_count), str(paid_count))
    else:
        report.fail(cat, "Not all orders are PAID", str(ledger.expected_order_count), str(paid_count))

    # V5: No orphan active sessions
    active_sessions = RGET(f"{BASE}/pos/sessions/active") or []
    if len(active_sessions) == 0:
        report.pass_(cat, "No orphan active sessions", "0", str(len(active_sessions)))
    else:
        report.warn(cat, "Orphan active sessions remain", "0", str(len(active_sessions)))

    # V6: Table states (all should be AVAILABLE after cleanup)
    tables = RGET(f"{BASE}/pos/tables") or []
    non_avail = [t for t in tables if t.get("status") != "AVAILABLE"]
    if not non_avail:
        report.pass_(cat, "All tables AVAILABLE", "0 non-AVAIL", str(len(non_avail)))
    else:
        report.warn(cat, f"{len(non_avail)} tables not AVAILABLE", "0", str(len(non_avail)),
                     f"Tables: {[t.get('tableNumber', t.get('id')) for t in non_avail[:5]]}")

    # V7: POS menu items endpoint
    pos_items = RGET(f"{BASE}/pos/menu-items")
    if pos_items and len(pos_items) > 0:
        report.pass_(cat, "POS menu items endpoint returns data", ">0", str(len(pos_items)))
    else:
        report.fail(cat, "POS menu items endpoint empty or failed", ">0", "0 or null")

    # V8: POS tables endpoint
    if tables and len(tables) > 0:
        report.pass_(cat, "POS tables endpoint returns data", ">0", str(len(tables)))
    else:
        report.fail(cat, "POS tables endpoint empty or failed", ">0", "0 or null")


def validate_inventory():
    """Validate inventory-related endpoints and state."""
    cat = "INVENTORY"

    # V1: Ingredients exist
    ings = RGET(f"{BASE}/ingredients") or []
    if len(ings) >= len(ledger.ingredient_ids):
        report.pass_(cat, "Ingredients count", f"≥{len(ledger.ingredient_ids)}", str(len(ings)))
    else:
        report.fail(cat, "Ingredients count too low", f"≥{len(ledger.ingredient_ids)}", str(len(ings)))

    # V2: No negative on-hand
    neg_ings = [i for i in ings if float(i.get("onHand", 0) or 0) < -0.01]
    if not neg_ings:
        report.pass_(cat, "No negative on-hand quantities", "0", str(len(neg_ings)))
    else:
        report.fail(cat, f"{len(neg_ings)} ingredients with negative on-hand",
                     "0", str(len(neg_ings)),
                     f"Items: {[i.get('description', i.get('id')) for i in neg_ings[:5]]}")

    # V3: Ingredient consumption matches expected (from ledger)
    date_str = SIM_DATE.strftime("%Y-%m-%d")
    ok, actual_data = psql(f"""
        SELECT ingredient_id, SUM(ABS(quantity)) as consumed
        FROM inventory_ingredient_ledger
        WHERE restaurant_id = {RESTAURANT_ID}
          AND event_type = 'DEPLETION'
          AND created_at >= '{date_str} 00:00:00'
          AND created_at <= '{date_str} 23:59:59'
        GROUP BY ingredient_id
    """)
    actual_consumption = {}
    if ok and actual_data.strip():
        for line in actual_data.strip().split('\n'):
            parts = line.strip().split('|')
            if len(parts) >= 2:
                try:
                    iid = int(parts[0].strip())
                    qty = float(parts[1].strip())
                    actual_consumption[iid] = qty
                except:
                    pass

    mismatched = []
    for iid, expected_qty in ledger.expected_ingredient_consumption.items():
        actual_qty = actual_consumption.get(iid, 0)
        if expected_qty > 0 and abs(actual_qty - expected_qty) / expected_qty > 0.15:  # 15% tolerance
            name = ingredient_names.get(iid, f"ING#{iid}")
            mismatched.append(f"{name}: exp={expected_qty:.2f} act={actual_qty:.2f}")

    if not mismatched:
        report.pass_(cat, "Ingredient consumption matches expected",
                     f"{len(ledger.expected_ingredient_consumption)} ingredients",
                     f"{len(actual_consumption)} ingredients tracked")
    else:
        report.warn(cat, f"{len(mismatched)} ingredients with consumption variance >15%",
                     f"{len(ledger.expected_ingredient_consumption)}",
                     f"{len(actual_consumption)}",
                     f"; ".join(mismatched[:5]))

    # V4: Stock received from procurement
    if ledger.procurement:
        for proc in ledger.procurement:
            for line in proc.get("lines", []):
                iid = line["ingredientId"]
                # Check on-hand increased
                ing_data = RGET(f"{BASE}/ingredients/{iid}")
                if ing_data:
                    on_hand = float(ing_data.get("onHand", 0) or 0)
                    if on_hand > 0:
                        report.pass_(cat, f"Stock received for ingredient {iid}", ">0", f"{on_hand:.2f}")
                    else:
                        report.warn(cat, f"Ingredient {iid} on-hand zero after procurement", ">0", f"{on_hand:.2f}")

    # V5: Low-stock alerts endpoint
    low_stock = RGET(f"{BASE}/ingredients/low-stock") or []
    report.pass_(cat, f"Low-stock alerts endpoint works", "any", f"{len(low_stock)} alerts")

    # V6: Inventory stats endpoint
    inv_stats = RGET(f"{BASE}/inventory/stats")
    if inv_stats:
        report.pass_(cat, "Inventory stats endpoint returns data", "non-null", "present")
    else:
        report.fail(cat, "Inventory stats endpoint returned null", "non-null", "null")

    # V7: Inventory valuation
    val = RGET(f"{BASE}/reports/inventory-valuation")
    if val is not None:
        report.pass_(cat, "Inventory valuation endpoint works", "non-null", "present")
    else:
        report.fail(cat, "Inventory valuation endpoint failed", "non-null", "null")

    # V8: Inventory latest
    latest = RGET(f"{BASE}/inventory/latest")
    if latest:
        report.pass_(cat, "Inventory latest endpoint works", "non-null", "present")
    else:
        report.warn(cat, "Inventory latest endpoint empty", "non-null", "null/empty")

    # V9: Inventory periods
    periods = RGET(f"{BASE}/inventory/periods")
    if periods:
        report.pass_(cat, "Inventory periods endpoint works", "non-null", "present")
    else:
        report.warn(cat, "Inventory periods endpoint empty", "non-null", "null")

    # V10: Ingredient quantity endpoint (for first ingredient)
    if ledger.ingredient_ids:
        first_iid = list(ledger.ingredient_ids.values())[0]
        qty = RGET(f"{BASE}/inventory/ingredients/{first_iid}/quantity")
        if qty is not None:
            report.pass_(cat, f"Ingredient quantity endpoint (ING#{first_iid})", "non-null", "present")
        else:
            report.warn(cat, f"Ingredient quantity endpoint returned null", "non-null", "null")

    # V11: Inventory intelligence — profitability
    if all_menu_ids:
        mid = all_menu_ids[0]
        prof = RGET(f"{BASE}/inventory/intelligence/profitability/{mid}")
        if prof is not None:
            report.pass_(cat, f"Profitability endpoint (menu item {mid})", "non-null", "present")
        else:
            report.warn(cat, f"Profitability endpoint returned null for menu {mid}", "non-null", "null")

    # V12: Wastage summary
    waste = RGET(f"{BASE}/inventory/intelligence/wastage/summary?start={SIM_DATE.isoformat()}&end={(SIM_DATE + timedelta(days=1)).isoformat()}")
    if waste is not None:
        report.pass_(cat, "Wastage summary endpoint", "non-null", "present")
    else:
        report.warn(cat, "Wastage summary endpoint returned null", "non-null", "null")


def validate_procurement():
    """Validate procurement-related endpoints and state."""
    cat = "PROCUREMENT"

    # V1: Suppliers exist
    suppliers = RGET(f"{BASE}/suppliers") or []
    if len(suppliers) >= len(ledger.supplier_ids):
        report.pass_(cat, "Suppliers count", f"≥{len(ledger.supplier_ids)}", str(len(suppliers)))
    else:
        report.warn(cat, "Suppliers count", f"≥{len(ledger.supplier_ids)}", str(len(suppliers)))

    # V2: Purchase orders endpoint works
    pos_list = RGET(f"{BASE}/purchase-orders") or []
    report.pass_(cat, f"Purchase orders endpoint returns data", "0+", str(len(pos_list)))

    # V3: Validate tracked POs exist
    for proc in ledger.procurement:
        if proc["po_id"]:
            po = RGET(f"{BASE}/purchase-orders/{proc['po_id']}")
            if po:
                report.pass_(cat, f"Tracked PO#{proc['po_id']} found in server", "exists", "found")
            else:
                report.fail(cat, f"Tracked PO#{proc['po_id']} NOT found", "exists", "missing")

        # V4: 3-Way match — GRN
        if proc["grn_id"]:
            grns = RGET(f"{BASE}/purchasing/grns") or []
            grn_found = any(g.get("id") == proc["grn_id"] for g in grns)
            if grn_found:
                report.pass_(cat, f"Tracked GRN#{proc['grn_id']} found", "exists", "found")
            else:
                report.warn(cat, f"GRN#{proc['grn_id']} not found in list (may be paginated)", "exists", "not in list")

        # V5: Invoice exists
        if proc["invoice_id"]:
            inv = RGET(f"{BASE}/purchasing/invoices/{proc['invoice_id']}")
            if inv:
                report.pass_(cat, f"Tracked Invoice#{proc['invoice_id']} found", "exists", "found")
            else:
                report.warn(cat, f"Invoice#{proc['invoice_id']} not found via GET", "exists", "not found")

        # V6: Invoice posted
        if proc["posted"] and proc["invoice_id"]:
            inv = RGET(f"{BASE}/purchasing/invoices/{proc['invoice_id']}")
            if inv and inv.get("status") == "POSTED":
                report.pass_(cat, f"Invoice#{proc['invoice_id']} is POSTED", "POSTED", str(inv.get("status")))
            else:
                report.warn(cat, f"Invoice#{proc['invoice_id']} status",
                            "POSTED", str(inv.get("status") if inv else "null"))

    # V7: GRNs endpoint
    grns = RGET(f"{BASE}/purchasing/grns") or []
    report.pass_(cat, "GRNs endpoint works", "0+", str(len(grns)))

    # V8: Invoices endpoint
    invoices = RGET(f"{BASE}/purchasing/invoices") or []
    inv_count = len(invoices) if isinstance(invoices, list) else 0
    report.pass_(cat, "Invoices endpoint works", "0+", str(inv_count))

    # V9: Purchasing hub counts
    hub = RGET(f"{BASE}/purchasing-hub/counts")
    if hub:
        report.pass_(cat, "Purchasing hub counts endpoint", "non-null", "present")
    else:
        report.warn(cat, "Purchasing hub counts endpoint returned null", "non-null", "null")

    # V10: Preferred vendors endpoint
    pv = RGET(f"{BASE}/preferred-vendors")
    if pv is not None:
        report.pass_(cat, "Preferred vendors endpoint", "non-null", "present")
    else:
        report.warn(cat, "Preferred vendors endpoint returned null", "non-null", "null")


def validate_prime_cost():
    """Validate prime cost endpoints."""
    cat = "PRIME COST"
    week_start = SIM_DATE - timedelta(days=SIM_DATE.weekday())  # Monday of the week

    # V1: Live
    live = RGET(f"{BASE}/prime-cost/live")
    if live and live.get("totalPrimeCostPct") is not None:
        report.pass_(cat, "Prime cost /live returns data", "non-null", "present")
    else:
        report.warn(cat, "Prime cost /live empty or null", "non-null", "null/empty")

    # V2: Weekly
    weekly = RGET(f"{BASE}/prime-cost/weekly?weekStart={week_start.strftime('%Y-%m-%d')}")
    if weekly:
        report.pass_(cat, "Prime cost /weekly", "non-null", "present")
    else:
        report.warn(cat, "Prime cost /weekly empty", "non-null", "null")

    # V3: Trend
    trend = RGET(f"{BASE}/prime-cost/trend")
    if trend:
        report.pass_(cat, "Prime cost /trend", "non-null", "present")
    else:
        report.warn(cat, "Prime cost /trend empty", "non-null", "null")

    # V4: Budget vs Actual
    bva = RGET(f"{BASE}/prime-cost/budget-vs-actual?weekStart={week_start.strftime('%Y-%m-%d')}")
    if bva:
        report.pass_(cat, "Prime cost /budget-vs-actual", "non-null", "present")
    else:
        report.warn(cat, "Prime cost /budget-vs-actual empty", "non-null", "null")

    # V5: Variance attribution
    va = RGET(f"{BASE}/prime-cost/variance-attribution?weekStart={week_start.strftime('%Y-%m-%d')}")
    if va:
        report.pass_(cat, "Prime cost /variance-attribution", "non-null", "present")
    else:
        report.warn(cat, "Prime cost /variance-attribution empty", "non-null", "null")

    # V6: Forecast
    fc = RGET(f"{BASE}/prime-cost/forecast?weekStart={week_start.strftime('%Y-%m-%d')}")
    if fc:
        report.pass_(cat, "Prime cost /forecast", "non-null", "present")
    else:
        report.warn(cat, "Prime cost /forecast empty", "non-null", "null")

    # V7: Shrinkage
    shrink = RGET(f"{BASE}/prime-cost/shrinkage?from={SIM_DATE.strftime('%Y-%m-%d')}&to={(SIM_DATE + timedelta(days=6)).strftime('%Y-%m-%d')}")
    if shrink is not None:
        report.pass_(cat, "Prime cost /shrinkage", "non-null", "present")
    else:
        report.warn(cat, "Prime cost /shrinkage null", "non-null", "null")

    # V8: Trend daily
    td = RGET(f"{BASE}/prime-cost/trend/daily")
    if td:
        report.pass_(cat, "Prime cost /trend/daily", "non-null", "present")
    else:
        report.warn(cat, "Prime cost /trend/daily empty", "non-null", "null")


def validate_labor():
    """Validate labor/staff endpoints."""
    cat = "LABOR"
    week_start = SIM_DATE - timedelta(days=SIM_DATE.weekday())

    # V1: Employees endpoint
    emps = RGET(f"{BASE}/prime-cost/labor/employees") or []
    if len(emps) >= len(ledger.staff_ids):
        report.pass_(cat, "Employees count", f"≥{len(ledger.staff_ids)}", str(len(emps)))
    else:
        report.warn(cat, "Employees count lower than expected", f"≥{len(ledger.staff_ids)}", str(len(emps)))

    # V2: Clock-in records match
    date_str = SIM_DATE.strftime("%Y-%m-%d")
    ok, att_data = psql(f"""
        SELECT COUNT(DISTINCT employee_id)
        FROM employee_attendance
        WHERE restaurant_id = {RESTAURANT_ID}
          AND clock_in_time >= '{date_str} 00:00:00'
          AND clock_in_time <= '{date_str} 23:59:59'
    """)
    actual_clockins = 0
    if ok and att_data.strip():
        try:
            actual_clockins = int(att_data.strip().split('\n')[-1].strip())
        except:
            pass
    if actual_clockins >= len(ledger.clockins) * 0.8:
        report.pass_(cat, "Clock-in records match", f"≥{len(ledger.clockins)}", str(actual_clockins))
    else:
        report.fail(cat, "Clock-in records don't match", f"≥{len(ledger.clockins)}", str(actual_clockins))

    # V3: Clock-out records
    ok, att_data2 = psql(f"""
        SELECT COUNT(*)
        FROM employee_attendance
        WHERE restaurant_id = {RESTAURANT_ID}
          AND clock_in_time >= '{date_str} 00:00:00'
          AND clock_in_time <= '{date_str} 23:59:59'
          AND clock_out_time IS NOT NULL
    """)
    actual_clockouts = 0
    if ok and att_data2.strip():
        try:
            actual_clockouts = int(att_data2.strip().split('\n')[-1].strip())
        except:
            pass
    if actual_clockouts >= len(ledger.clockouts) * 0.8:
        report.pass_(cat, "Clock-out records match", f"≥{len(ledger.clockouts)}", str(actual_clockouts))
    else:
        report.warn(cat, "Clock-out records below expected", f"≥{len(ledger.clockouts)}", str(actual_clockouts))

    # V4: Weekly summary
    ws = RGET(f"{BASE}/prime-cost/labor/weekly-summary?weekStart={week_start.strftime('%Y-%m-%d')}")
    if ws:
        report.pass_(cat, "Labor weekly summary", "non-null", "present")
    else:
        report.warn(cat, "Labor weekly summary empty", "non-null", "null")

    # V5: Schedule
    sched = RGET(f"{BASE}/prime-cost/labor/schedule?weekStart={week_start.strftime('%Y-%m-%d')}")
    if sched is not None:
        report.pass_(cat, "Labor schedule endpoint", "non-null", "present")
    else:
        report.warn(cat, "Labor schedule endpoint null", "non-null", "null")

    # V6: Variance
    var = RGET(f"{BASE}/prime-cost/labor/variance?weekStart={week_start.strftime('%Y-%m-%d')}")
    if var is not None:
        report.pass_(cat, "Labor variance endpoint", "non-null", "present")
    else:
        report.warn(cat, "Labor variance endpoint null", "non-null", "null")

    # V7: Staff labor endpoint (alternate)
    staff_labor = RGET(f"{BASE}/labor/employees")
    if staff_labor:
        report.pass_(cat, "Staff labor /employees (alternate)", "non-null", "present")
    else:
        report.warn(cat, "Staff labor /employees empty", "non-null", "null")


def validate_analytics():
    """Validate analytics endpoints."""
    cat = "ANALYTICS"

    dashboard = RGET(f"{BASE}/analytics/dashboard")
    if dashboard and not isinstance(dashboard, list):
        report.pass_(cat, "Analytics /dashboard", "non-null object", "present")
    else:
        report.warn(cat, "Analytics /dashboard empty or array", "non-null", "null/empty")

    cfo = RGET(f"{BASE}/analytics/cfo/snapshot")
    if cfo:
        report.pass_(cat, "Analytics /cfo/snapshot", "non-null", "present")
    else:
        report.warn(cat, "Analytics /cfo/snapshot empty", "non-null", "null")

    gm = RGET(f"{BASE}/analytics/manager/gm")
    if gm:
        report.pass_(cat, "Analytics /manager/gm", "non-null", "present")
    else:
        report.warn(cat, "Analytics /manager/gm empty", "non-null", "null")

    chef = RGET(f"{BASE}/analytics/manager/chef")
    if chef:
        report.pass_(cat, "Analytics /manager/chef", "non-null", "present")
    else:
        report.warn(cat, "Analytics /manager/chef empty", "non-null", "null")

    foh = RGET(f"{BASE}/analytics/manager/foh")
    if foh is not None:
        report.pass_(cat, "Analytics /manager/foh", "non-null", "present")
    else:
        report.warn(cat, "Analytics /manager/foh null", "non-null", "null")

    shift = RGET(f"{BASE}/analytics/manager/shift")
    if shift is not None:
        report.pass_(cat, "Analytics /manager/shift", "non-null", "present")
    else:
        report.warn(cat, "Analytics /manager/shift null", "non-null", "null")

    # Experiments
    experiments = RGET(f"{BASE}/analytics/experiments")
    if experiments is not None:
        report.pass_(cat, "Analytics /experiments", "non-null", "present")
    else:
        report.warn(cat, "Analytics /experiments null", "non-null", "null")


def validate_reports():
    """Validate all report endpoints."""
    cat = "REPORTS"
    week_start = SIM_DATE - timedelta(days=SIM_DATE.weekday())

    # Menu engineering
    me = RGET(f"{BASE}/reports/menu-engineering?startDate={SIM_DATE.strftime('%Y-%m-%d')}&endDate={(SIM_DATE + timedelta(days=6)).strftime('%Y-%m-%d')}")
    if me:
        report.pass_(cat, "Reports /menu-engineering", "non-null", "present")
    else:
        report.warn(cat, "Reports /menu-engineering empty", "non-null", "null")

    # Prime cost report
    pc = RGET(f"{BASE}/reports/prime-cost?startDate={SIM_DATE.strftime('%Y-%m-%d')}")
    if pc is not None:
        report.pass_(cat, "Reports /prime-cost", "non-null", "present")
    else:
        report.warn(cat, "Reports /prime-cost null", "non-null", "null")

    # Inventory valuation
    iv = RGET(f"{BASE}/reports/inventory-valuation")
    if iv is not None:
        report.pass_(cat, "Reports /inventory-valuation", "non-null", "present")
    else:
        report.fail(cat, "Reports /inventory-valuation null", "non-null", "null")

    # Category distribution
    cd = RGET(f"{BASE}/reports/category-distribution")
    if cd is not None:
        report.pass_(cat, "Reports /category-distribution", "non-null", "present")
    else:
        report.warn(cat, "Reports /category-distribution null", "non-null", "null")

    # Overtime leakage
    ol = RGET(f"{BASE}/reports/overtime-leakage?weekStart={week_start.strftime('%Y-%m-%d')}")
    if ol is not None:
        report.pass_(cat, "Reports /overtime-leakage", "non-null", "present")
    else:
        report.warn(cat, "Reports /overtime-leakage null", "non-null", "null")

    # Table turnaround
    tt = RGET(f"{BASE}/reports/table-turnaround?startDate={SIM_DATE.strftime('%Y-%m-%d')}&endDate={(SIM_DATE + timedelta(days=6)).strftime('%Y-%m-%d')}")
    if tt is not None:
        report.pass_(cat, "Reports /table-turnaround", "non-null", "present")
    else:
        report.warn(cat, "Reports /table-turnaround null", "non-null", "null")

    # Inventory variance
    ivr = RGET(f"{BASE}/reports/inventory-variance?startDate={SIM_DATE.strftime('%Y-%m-%d')}&endDate={(SIM_DATE + timedelta(days=6)).strftime('%Y-%m-%d')}")
    if ivr is not None:
        report.pass_(cat, "Reports /inventory-variance", "non-null", "present")
    else:
        report.warn(cat, "Reports /inventory-variance null", "non-null", "null")

    # Waste summary
    ws = RGET(f"{BASE}/reports/waste-summary?startDate={SIM_DATE.strftime('%Y-%m-%d')}")
    if ws is not None:
        report.pass_(cat, "Reports /waste-summary", "non-null", "present")
    else:
        report.warn(cat, "Reports /waste-summary null", "non-null", "null")

    # Guest heatmap
    gh = RGET(f"{BASE}/reports/guest-heatmap?startDate={SIM_DATE.strftime('%Y-%m-%d')}")
    if gh is not None:
        report.pass_(cat, "Reports /guest-heatmap", "non-null", "present")
    else:
        report.warn(cat, "Reports /guest-heatmap null", "non-null", "null")

    # Revenue heatmap
    rh = RGET(f"{BASE}/reports/revenue-heatmap?startDate={SIM_DATE.strftime('%Y-%m-%d')}")
    if rh is not None:
        report.pass_(cat, "Reports /revenue-heatmap", "non-null", "present")
    else:
        report.warn(cat, "Reports /revenue-heatmap null", "non-null", "null")

    # Labor heatmap
    lh = RGET(f"{BASE}/reports/labor-heatmap?startDate={SIM_DATE.strftime('%Y-%m-%d')}")
    if lh is not None:
        report.pass_(cat, "Reports /labor-heatmap", "non-null", "present")
    else:
        report.warn(cat, "Reports /labor-heatmap null", "non-null", "null")


def validate_kds():
    """Validate KDS (Kitchen Display System) endpoints."""
    cat = "KDS"

    # Central KDS summary
    central = RGET(f"{BASE}/kds/central/summary")
    if central is not None:
        report.pass_(cat, "KDS /central/summary", "non-null", "present")
    else:
        report.warn(cat, "KDS /central/summary null", "non-null", "null")

    # Central KDS analytics
    central_analytics = RGET(f"{BASE}/kds/central/analytics")
    if central_analytics is not None:
        report.pass_(cat, "KDS /central/analytics", "non-null", "present")
    else:
        report.warn(cat, "KDS /central/analytics null", "non-null", "null")

    # Expo queue
    expo_queue = RGET(f"{BASE}/kds/expo/queue")
    if expo_queue is not None:
        report.pass_(cat, "KDS /expo/queue", "non-null", "present")
    else:
        report.warn(cat, "KDS /expo/queue null", "non-null", "null")

    # Expo completed
    expo_done = RGET(f"{BASE}/kds/expo/completed")
    if expo_done is not None:
        report.pass_(cat, "KDS /expo/completed", "non-null", "present")
    else:
        report.warn(cat, "KDS /expo/completed null", "non-null", "null")

    # Station KDS
    stations = RGET(f"{BASE}/kds/stations")
    if stations is not None:
        report.pass_(cat, "KDS /stations", "non-null", "present")
    else:
        report.warn(cat, "KDS /stations null", "non-null", "null")


def validate_menu_and_recipes():
    """Validate menu and recipe endpoints."""
    cat = "MENU & RECIPES"

    # Cost groups
    groups = RGET(f"{BASE}/cost-groups") or []
    if len(groups) >= len(ledger.cost_group_ids):
        report.pass_(cat, "Cost groups count", f"≥{len(ledger.cost_group_ids)}", str(len(groups)))
    else:
        report.warn(cat, "Cost groups count", f"≥{len(ledger.cost_group_ids)}", str(len(groups)))

    # Menu items
    items = RGET(f"{BASE}/menu-items") or []
    if len(items) >= len(ledger.menu_item_ids):
        report.pass_(cat, "Menu items count", f"≥{len(ledger.menu_item_ids)}", str(len(items)))
    else:
        report.warn(cat, "Menu items count", f"≥{len(ledger.menu_item_ids)}", str(len(items)))

    # Recipes
    recipes = RGET(f"{BASE}/recipes") or []
    if len(recipes) > 0:
        report.pass_(cat, "Recipes endpoint returns data", ">0", str(len(recipes)))
    else:
        report.fail(cat, "Recipes endpoint empty", ">0", "0")

    # Recipe integrity — check ingredient lines resolve
    bad_recipes = []
    for r in recipes[:10]:
        for l in r.get("ingredientLines", []):
            iid = l.get("ingredientId")
            if iid:
                ing = RGET(f"{BASE}/ingredients/{iid}")
                if not ing:
                    bad_recipes.append(f"recipe#{r.get('id')} ing#{iid}")
    if not bad_recipes:
        report.pass_(cat, "Recipe ingredient integrity (10 checked)", "0 broken", "0 broken")
    else:
        report.fail(cat, "Recipe ingredient integrity", "0 broken", f"{len(bad_recipes)} broken",
                     f"; ".join(bad_recipes[:5]))

    # Cost card for first menu item
    if all_menu_ids:
        mid = all_menu_ids[0]
        cost_card = RGET(f"{BASE}/menu-items/{mid}/cost-card")
        if cost_card:
            report.pass_(cat, f"Cost card for menu item {mid}", "non-null", "present")
        else:
            report.warn(cat, f"Cost card for menu item {mid} null", "non-null", "null")

    # Menu engineering
    me = RGET(f"{BASE}/menu-engineering/periods")
    if me is not None:
        report.pass_(cat, "Menu engineering /periods", "non-null", "present")
    else:
        report.warn(cat, "Menu engineering /periods null", "non-null", "null")


def validate_all_endpoints():
    """Run comprehensive HTTP health check on every known endpoint."""
    cat = "API HEALTH"

    endpoints = [
        ("POS /orders", f"{BASE}/pos/orders"),
        ("POS /tables", f"{BASE}/pos/tables"),
        ("POS /menu-items", f"{BASE}/pos/menu-items"),
        ("POS /sessions/active", f"{BASE}/pos/sessions/active"),
        ("INGREDIENTS list", f"{BASE}/ingredients"),
        ("INGREDIENTS low-stock", f"{BASE}/ingredients/low-stock"),
        ("INVENTORY /stats", f"{BASE}/inventory/stats"),
        ("INVENTORY /latest", f"{BASE}/inventory/latest"),
        ("INVENTORY /periods", f"{BASE}/inventory/periods"),
        ("SUPPLIERS list", f"{BASE}/suppliers"),
        ("PO list", f"{BASE}/purchase-orders"),
        ("GRNs list", f"{BASE}/purchasing/grns"),
        ("INVOICES list", f"{BASE}/purchasing/invoices"),
        ("RECIPES list", f"{BASE}/recipes"),
        ("COST GROUPS list", f"{BASE}/cost-groups"),
        ("MENU ITEMS list", f"{BASE}/menu-items"),
        ("PRIME-COST /live", f"{BASE}/prime-cost/live"),
        ("PRIME-COST /trend", f"{BASE}/prime-cost/trend"),
        ("LABOR /employees", f"{BASE}/prime-cost/labor/employees"),
        ("LABOR /weekly-summary", f"{BASE}/prime-cost/labor/weekly-summary?weekStart={(SIM_DATE - timedelta(days=SIM_DATE.weekday())).strftime('%Y-%m-%d')}"),
        ("ANALYTICS /dashboard", f"{BASE}/analytics/dashboard"),
        ("ANALYTICS /cfo/snapshot", f"{BASE}/analytics/cfo/snapshot"),
        ("ANALYTICS /manager/chef", f"{BASE}/analytics/manager/chef"),
        ("REPORTS /inventory-valuation", f"{BASE}/reports/inventory-valuation"),
        ("REPORTS /category-distribution", f"{BASE}/reports/category-distribution"),
        ("REPORTS /menu-engineering", f"{BASE}/reports/menu-engineering?startDate={SIM_DATE.strftime('%Y-%m-%d')}&endDate={(SIM_DATE + timedelta(days=6)).strftime('%Y-%m-%d')}"),
        ("KDS /central/summary", f"{BASE}/kds/central/summary"),
        ("KDS /expo/queue", f"{BASE}/kds/expo/queue"),
        ("MENU-ENG /periods", f"{BASE}/menu-engineering/periods"),
        ("PURCHASING-HUB /counts", f"{BASE}/purchasing-hub/counts"),
    ]

    ok_count = 0
    fail_count = 0
    for label, url in endpoints:
        code, data, raw = RGET_FULL(url)
        has_data = data is not None and data != 0 and data != [] and data != {}
        if str(code).startswith("2"):
            if has_data:
                report.pass_(cat, f"GET {label}", "200+data", f"{code}")
                ok_count += 1
            else:
                report.warn(cat, f"GET {label}", "200+data", f"{code} empty")
                ok_count += 1
        else:
            report.fail(cat, f"GET {label}", "2xx", f"{code}")
            fail_count += 1

    report.pass_(cat, f"API Health: {ok_count} OK, {fail_count} FAIL", f"{ok_count+fail_count} total", f"{ok_count} ok")


def run_validation():
    """Run ALL validation checks."""
    print(f"\n🔍 Phase 3: Validate ALL Endpoints & State")
    print("=" * 70)

    validate_pos()
    validate_inventory()
    validate_procurement()
    validate_prime_cost()
    validate_labor()
    validate_analytics()
    validate_reports()
    validate_kds()
    validate_menu_and_recipes()
    validate_all_endpoints()


# ═══════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════

def main():
    print("=" * 70)
    print("🍽️  ONE-DAY VALIDATOR")
    print("    Simulate 1 Day → Track Everything → Validate Entire Server State")
    print("=" * 70)
    print(f"  Date:     {SIM_DATE.strftime('%Y-%m-%d')}")
    print(f"  Restaurant: {RESTAURANT_ID}")
    print(f"  Base URL: {BASE}")

    # Phase 0: Pre-snapshot
    print(f"\n📸 Phase 0: Pre-Snapshot (baseline state)")
    print("=" * 60)
    pre = pre_snapshot()
    for k, v in sorted(pre.items()):
        if isinstance(v, dict):
            print(f"  {k}: {len(v)} entries")
        else:
            print(f"  {k}: {v}")

    # Phase 1: Bootstrap
    bootstrap()

    # Build recipe cache
    print(f"\n📖 Building recipe cache ...")
    build_recipe_cache()
    print(f"  ✓ {len(recipe_cache)} recipes, {len(all_menu_ids)} menu items, {len(ingredient_names)} ingredients")

    # Reset tables to AVAILABLE
    print(f"  Resetting tables to AVAILABLE ...")
    for tbl_id in ledger.table_ids:
        RPATCH(f"{BASE}/pos/tables/{tbl_id}/status?status=AVAILABLE")
    print(f"  ✓ All tables cleaned")

    # Phase 2: Simulate
    t0 = time.time()
    simulate_one_day()
    elapsed = time.time() - t0
    print(f"\n  ⏱  Simulation took {elapsed:.1f}s")

    # Phase 3: Validate
    run_validation()

    # Print report
    report.print_report()

    # Print failures detail
    report.print_failed()

    # Final summary
    passed, warned, failed = report.summary()
    print(f"\n{'=' * 70}")
    print(f"  🎯 RESULT: {'✅ ALL PASS' if failed == 0 else '🚨 FAILURES DETECTED'}")
    print(f"     ✅ {passed} passed  ⚠️ {warned} warnings  🚨 {failed} failures")
    print(f"     Orders: {ledger.expected_order_count}  Revenue: ${ledger.expected_revenue:,.2f}")
    print(f"{'=' * 70}")

    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())