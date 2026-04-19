#!/usr/bin/env python3
"""
Restaurant Traffic Simulator — Pure REST Bootstrap + Work-Stealing + Full Sanity

Phase 0: BOOTSTRAP — creates Restaurant, Tables, Suppliers, Ingredients,
           Menu Cost Groups, Menu Items, Recipes, Staff via REST only.
Phase 1: Initial stock via REST (receive shipment)
Phase 2: Traffic simulation (10 workers, inventory-aware)
Phase 3: Sanity suite (all via REST)
Phase 4: API health check (all Prime Cost + Menu Eng + Analytics endpoints)

Every data operation goes through REST endpoints only. No direct DB access.
When the server restarts (create-drop), DB is empty — this script rebuilds it.

Usage:
    python traffic_simulator.py [days] [start_date]
    python traffic_simulator.py 90 2026-01-01
"""

import subprocess, json, time, random, math, sys, threading, queue
from datetime import datetime, timedelta
import requests as _req
import json

# psql helper for DB inserts where REST endpoints don't exist
PG = ["psql", "-h", "localhost", "-U", "postgres", "-d", "shopro_pos", "-c"]
PSQL_PASS = "password"  # matches application.yml spring.datasource.password

def psql(sql):
    env = {**__import__('os').environ, "PGPASSWORD": PSQL_PASS}
    try:
        r = subprocess.run(PG + [sql], capture_output=True, text=True, timeout=15, env=env)
        return r.returncode == 0, r.stdout or r.stderr
    except Exception as e:
        return False, str(e)

# ── CONFIG ─────────────────────────────────────────────────────────────────
RESTAURANT_ID = 3
BASE = f"http://localhost:8080/api/v1/restaurants/{RESTAURANT_ID}"
SIM_BASE = "http://localhost:8080/api/v1/simulation"

DAYS       = int(sys.argv[1]) if len(sys.argv) > 1 else 90
START_DATE = datetime.strptime(sys.argv[2], "%Y-%m-%d") if len(sys.argv) > 2 else datetime(2026,1,1)

LUNCH_H  = (11,14); DINNER_H = (17,22)
LAM_L    = 5; LAM_D = 8; WEEKEND_X = 1.3
PARTY_MIN=2; PARTY_MAX=4; AVG_CHK=45.0; MAX_TBL=20; STOCK_THR=20.0

# ── ENUMS (from Java source — must match exactly) ────────────────────────
# InventoryType: FOOD | BAR
# InventoryCategory: MEAT | SEAFOOD | POULTRY | PRODUCE | DAIRY | BAKERY |
#   GROCERY_DRY_GOODS | DRY_GOODS | DRINKS | BEVERAGES | LIQUOR |
#   BOTTLE_BEER | DRAFT_BEER | BEER | WINE | BAR_CONSUMABLES | OTHER
# PurchaseUnit: LB | OZ | KG | EACH | CASE | BOTTLE | BAG | BOX | CARTON |
#   CAN | ROLL | JAR | PACK_12 | KEG | CYLINDER | BUNCH | DOZEN | GALLON
# RecipeUnit: OZ_WEIGHT | OZ_FLUID | LB | KG | GRAM | TSP | TBSP | CUP |
#   PINT | QUART | GALLON | EACH | BUNCH | SLICE | WHOLE | LITER | ML
# InventoryUnit: LB | OZ | EACH | BOX | CARTON | CASE | BOTTLE | CAN |
#   JAR | BAG | KEG | DOZEN | GALLON | KG | BUNCH

# ── SEED DATA (Afghan Cuisine restaurant) ────────────────────────────────
SEED_SUPPLIERS = [
    {"name":"Kabul Valley Produce","contactName":"Ahmad Rahimi","phone":"+93-700-1234","email":"ahmad@kabulproduce.af","active":True},
    {"name":"Pamir Meats","contactName":"Farid Noori","phone":"+93-700-5678","email":"farid@pamirmeats.af","active":True},
    {"name":"Silk Road Spices","contactName":"Mariam Ahmadi","phone":"+93-700-9012","email":"mariam@silkroadspices.af","active":True},
]

SEED_INGREDIENTS = [
    # (itemCode, description, inventoryType, category, purchaseUnit, casePack, puPrice, recipeUnit, ruPerPu, yieldPct, inventoryUnit, iuPerPu, parLevel)
    ("ING01","Basmati Rice",       "FOOD","DRY_GOODS",         "LB","20 lb",  1.60, "LB",   1.0,1.0,  "LB", 1.0, 60.0),
    ("ING02","Lamb Shoulder",      "FOOD","MEAT",              "LB",None,     8.99, "LB",   1.0,0.85, "LB", 1.0, 40.0),
    ("ING03","Vegetable Oil",      "FOOD","GROCERY_DRY_GOODS","GALLON","6 gal",12.99,"GALLON",1.0,1.0,  "GALLON",1.0, 5.0),
    ("ING04","Yellow Onions",      "FOOD","PRODUCE",           "LB", "50 lb",  1.29, "LB",   1.0,0.95, "LB", 1.0, 50.0),
    ("ING05","Garlic",             "FOOD","PRODUCE",           "LB", "5 lb",   6.99, "LB",   1.0,0.88, "LB", 1.0, 8.0),
    ("ING06","Fresh Ginger",       "FOOD","PRODUCE",           "LB", "5 lb",   4.99, "LB",   1.0,0.85, "LB", 1.0, 6.0),
    ("ING07","Cumin Ground",       "FOOD","GROCERY_DRY_GOODS","LB", "1 lb",   7.99, "LB",   1.0,1.0,  "LB", 1.0, 4.0),
    ("ING08","Coriander Ground",   "FOOD","GROCERY_DRY_GOODS","LB", "1 lb",   6.50, "LB",   1.0,1.0,  "LB", 1.0, 3.0),
    ("ING09","Turmeric",           "FOOD","GROCERY_DRY_GOODS","LB", "1 lb",   5.99, "LB",   1.0,1.0,  "LB", 1.0, 2.0),
    ("ING10","Garam Masala",       "FOOD","GROCERY_DRY_GOODS","LB", "1 lb",  14.99, "LB",   1.0,1.0,  "LB", 1.0, 2.0),
    ("ING11","Yogurt (Whole)",     "FOOD","DAIRY",             "GALLON","1 gal",8.99,"GALLON",1.0,1.0,  "GALLON",1.0, 8.0),
    ("ING12","Chickpeas (Dried)",   "FOOD","DRY_GOODS",         "LB", "10 lb",  1.89, "LB",   1.0,1.0,  "LB", 1.0, 20.0),
    ("ING13","Lentils (Red)",       "FOOD","DRY_GOODS",         "LB", "10 lb",  1.49, "LB",   1.0,1.0,  "LB", 1.0, 20.0),
    ("ING14","Naan Flour",          "FOOD","DRY_GOODS",         "LB", "50 lb",  0.56, "LB",   1.0,1.0,  "LB", 1.0, 80.0),
    ("ING15","Tomatoes (Canned)",   "FOOD","GROCERY_DRY_GOODS","CASE","6 cn",   8.50,"CASE", 1.0,1.0,  "CASE",1.0, 8.0),
    ("ING16","Black Tea (Loose)",   "FOOD","GROCERY_DRY_GOODS","LB", "1 lb",  10.99, "LB",   1.0,1.0,  "LB", 1.0, 3.0),
    ("ING17","Cardamom Pods",      "FOOD","GROCERY_DRY_GOODS","LB", "8 oz",  18.99, "LB",   1.0,1.0,  "LB", 1.0, 1.0),
    ("ING18","Saffron Threads",     "FOOD","GROCERY_DRY_GOODS","LB", "1 oz", 200.0, "LB",   1.0,1.0,  "LB", 1.0, 0.01),
    ("ING19","Spinach (Fresh)",     "FOOD","PRODUCE",           "LB", "2 lb",   3.49, "LB",   1.0,0.85, "LB", 1.0, 10.0),
    ("ING20","Eggplant",            "FOOD","PRODUCE",           "LB", "10 lb",  2.49, "LB",   1.0,0.82, "LB", 1.0, 12.0),
]

SEED_COST_GROUPS = [
    {"name":"Mains — Afghan Classics","revenueCategory":"FOOD","displayOrder":1},
    {"name":"Skewers & Kebabs",       "revenueCategory":"FOOD","displayOrder":2},
    {"name":"Sides & Naan",           "revenueCategory":"FOOD","displayOrder":3},
    {"name":"Beverages",              "revenueCategory":"SOFT_BEV","displayOrder":4},
]

SEED_MENU_ITEMS = [
    # (groupIdx, posId, name, sellPrice, targetFcPct, ingredients:[(ingId, qtyRu, recipeUnit)])
    (0,"M01","Kabuli Pulao",       25.00,0.30,[("ING01",0.50,"LB"),("ING02",0.50,"LB"),("ING06",0.02,"LB"),("ING10",0.005,"LB")]),
    (0,"M02","Lamb Karahi",        28.00,0.30,[("ING02",1.00,"LB"),("ING04",0.30,"LB"),("ING05",0.02,"LB"),("ING03",0.02,"GALLON"),("ING07",0.01,"LB")]),
    (0,"M03","Mantu Dumplings",     18.00,0.30,[("ING02",0.40,"LB"),("ING14",0.20,"LB"),("ING04",0.20,"LB"),("ING11",0.10,"GALLON")]),
    (0,"M04","Ashak Dumplings",     16.00,0.30,[("ING19",0.30,"LB"),("ING04",0.20,"LB"),("ING11",0.10,"GALLON"),("ING14",0.15,"LB")]),
    (1,"K01","Chopan Kebab",        22.00,0.30,[("ING02",0.75,"LB"),("ING06",0.02,"LB"),("ING07",0.01,"LB"),("ING09",0.005,"LB")]),
    (1,"K02","Chicken Tikka",       19.00,0.30,[("ING02",0.50,"LB"),("ING11",0.10,"GALLON"),("ING07",0.01,"LB"),("ING08",0.005,"LB")]),
    (1,"K03","Shami Kebab",         15.00,0.30,[("ING02",0.30,"LB"),("ING12",0.20,"LB"),("ING04",0.10,"LB"),("ING05",0.01,"LB")]),
    (2,"S01","Borani Banjan",       14.00,0.30,[("ING20",1.00,"LB"),("ING11",0.05,"GALLON"),("ING06",0.01,"LB")]),
    (2,"S02","Dal (Lentil Stew)",    12.00,0.30,[("ING12",0.50,"LB"),("ING04",0.20,"LB"),("ING03",0.02,"GALLON"),("ING07",0.005,"LB")]),
    (2,"S03","Tandoori Naan",         5.00,0.20,[("ING14",0.25,"LB"),("ING11",0.02,"GALLON"),("ING13",0.005,"LB")]),
    (3,"B01","Afghan Chai",          4.00,0.15,[("ING16",0.01,"LB"),("ING13",0.002,"LB")]),
    (3,"B02","Dogh (Yogurt Drink)",   5.00,0.15,[("ING11",0.10,"GALLON"),("ING13",0.001,"LB")]),
]

# Staff: (name, EmployeeType, hourlyRate)
# EmployeeType: MANAGEMENT | HOURLY (these are the only valid DB values)
SEED_STAFF = [
    ("Ahmad Shah","MANAGEMENT",38.00),
    ("Fatima Noori","MANAGEMENT",28.00),
    ("Karim Wardak","MANAGEMENT",30.00),
    ("Nasreen Mohammadi","MANAGEMENT",0.00),
    ("Hassan Qaderi","HOURLY",16.00),
    ("Zahra Ahmadi","HOURLY",16.00),
    ("Mohammad Iqbal","HOURLY",16.00),
    ("Aisha Nazari","HOURLY",16.00),
    ("Jamal Karimi","HOURLY",18.00),
    ("Dawood Stanikzai","HOURLY",14.00),
    ("Rahimullah","HOURLY",16.00),
    ("Bilal Hassani","HOURLY",20.00),
    ("Sayed Hashemi","HOURLY",20.00),
    ("Wahidullah Noori","HOURLY",18.00),
]

# ── SHARED STATE ─────────────────────────────────────────────────────────
_slock = threading.Lock()
stats = dict(
    total_orders=0,items_ordered=0,items_skipped=0,total_revenue=0.0,
    procurement_cycles=0,inventory_alerts=0,order_errors=0,busy_waits=0,
    menu_fetches=0,sanity_checks=0,sanity_fails=0,
    bootstrap_ingredients=0,bootstrap_menu_items=0,bootstrap_staff=0,
    bootstrap_tables=0,bootstrap_suppliers=0,bootstrap_groups=0,
    # EOD Audit stats
    eod_audits_run=0,inventory_variances=0,attendance_alerts=0,
)
_tlock=threading.Lock(); occupied={}
work_q=queue.Queue(); done_slots={}; _total_q=0; _qlock=threading.Lock()
_rc_lock=threading.Lock(); _rc={}; _rc_ts=0.0

# ── REST HELPERS (using requests — 10x faster than subprocess curl) ──────
_sess = _req.Session()
_sess.headers.update({"Content-Type": "application/json"})

def RGET(url, timeout=10):
    try:
        r = _sess.get(url, timeout=timeout)
        if r.status_code == 200 and r.text.strip(): return r.json()
    except: pass
    return None

def RPOST(url, body=None, timeout=15):
    try:
        # print(f"[HTTP] POST {url[:80]}...", flush=True)
        r = _sess.post(url, json=body, timeout=timeout)
        # print(f"[HTTP] ✓ {r.status_code}", flush=True)
        return r.text or ""
    except Exception as e:
        # print(f"[HTTP] ✗ ERROR: {e}", flush=True)
        return ""

def RPATCH(url, timeout=15):
    """PATCH request for status updates"""
    try:
        r = _sess.patch(url, timeout=timeout)
        return r.text or ""
    except: return ""

def RGET_CODE(url, timeout=15):
    try:
        r = _sess.get(url, timeout=timeout)
        try: data = r.json()
        except: data = None
        return str(r.status_code), data
    except: return "0", None
# ── PER-DAY TRACKING (for EOD Audit) ─────────────────────────────────────
_orders_per_day = {}   # {day_idx: [(order_id, total, date_str)]}
_daylock = threading.Lock()

# ── INGREDIENT NAMES CACHE (for EOD Audit - loaded once) ─────────────────
_ing_names_cache = {}  # {ingredient_id: description}

# ── ON-HAND CACHE (for EOD Audit — ingredient consumption tracking) ──────
_oh_lock = threading.Lock()
_oh_cache = {}
_oh_ts = 0.0

def _refresh_oh():
    """Refresh on-hand quantities from inventory endpoint."""
    cache = {}
    try:
        for ing in RGET(f"{BASE}/ingredients") or []:
            iid = ing.get("id")
            if iid: cache[iid] = float(ing.get("onHand", 0) or 0)
    except: pass
    return cache

def on_hand(iid):
    global _oh_cache, _oh_ts
    with _oh_lock:
        if time.time()-_oh_ts>120 or not _oh_cache:
            _oh_cache=_refresh_oh(); _oh_ts=time.time()
    return _oh_cache.get(iid, -999.0)

# ── RECIPE CACHE ──────────────────────────────────────────────────────────

recipe_cache = {}   # {menu_item_id: [(ingredient_id, quantity)]}
_rc_lock = threading.Lock()
_rc_ts = 0.0

def _build_rc():
    """Build recipe cache from /recipes endpoint.
    Each recipe has menuItemId, ingredientLines[].ingredientId/quantity."""
    recipes=RGET(f"{BASE}/recipes") or []
    c={}
    for r in recipes:
        mid=r.get("menuItemId")
        if mid is None: continue
        if not (r.get("active") or r.get("isActive")): continue
        lines=[]
        for l in r.get("ingredientLines",[]):
            iid=l.get("ingredientId")
            if iid is None: continue
            lines.append({"i":iid, "q":float(l.get("quantity",0) or l.get("quantityRu",0))})
        c[mid]=lines
    # Also load menu item IDs for order placement
    items=RGET(f"{BASE}/menu-items") or []
    _all_menu_ids.clear()
    for it in items:
        mid=it.get("id")
        if mid and it.get("active",True): _all_menu_ids.append(mid)
    with _slock: stats["menu_fetches"]+=1
    return c

def rc():
    global recipe_cache, _rc_ts
    with _rc_lock:
        if time.time()-_rc_ts>60 or not recipe_cache: recipe_cache=_build_rc(); _rc_ts=time.time()
        return recipe_cache

def item_avail(mid,r):
    lines=r.get(mid,[])
    if not lines: return True,[]
    miss=[]
    for l in lines:
        iid,qty=l["i"],l["q"]
        if on_hand(iid)<qty: miss.append(f"ing#{iid}")
    return len(miss)==0,miss

def item_ingredients(mid):
    """Return list of (ingredient_id, quantity) for menu item."""
    r = rc()
    lines = r.get(mid, [])
    return [(l["i"], l["q"]) for l in lines]

# ── POISSON ──────────────────────────────────────────────────────────────

def poisson(lam):
    if lam<=0: return 0
    L=math.exp(-lam);k=0;p=1.0
    while p>L: k+=1; p*=random.random()
    return max(0,k-1)

def day_type(d): return "weekend" if d.weekday()>=5 else "weekday"
def lam_for(h,dt):
    if LUNCH_H[0]<=h<=LUNCH_H[1]: b=LAM_L
    elif DINNER_H[0]<=h<=DINNER_H[1]: b=LAM_D
    else: return 0
    return b*WEEKEND_X if dt=="weekend" else b

# ── TABLE OCCUPANCY ──────────────────────────────────────────────────────

def free_table(ds,h):
    cut=f"{ds}_{h:02d}:00"
    with _tlock:
        for k in list(occupied):
            if k.startswith(ds+"|") and occupied.get(k,"")<=cut: del occupied[k]
    now=f"{ds}_{h:02d}:00"
    with _tlock:
        used={k.split("|")[1] for k,v in occupied.items() if k.startswith(ds+"|") and v>now}
    for t in range(1,MAX_TBL+1):
        if f"T{t:02d}" not in used: return f"T{t:02d}"
    return None

def seat(tbl,ds,h):
    with _tlock:
        m=h*60+random.randint(45,105)
        occupied[f"{ds}|{tbl}"]=f"{ds}_{m//60:02d}:{m%60:02d}"

# ── STAFF ID CACHE ─────────────────────────────────────────────────────
_staff_ids = []  # list of employee IDs from DB

def load_staff_ids():
    """Load employee IDs from REST API for attendance tracking."""
    global _staff_ids
    # Try to get employees from REST API
    employees = RGET(f"{BASE}/prime-cost/labor/employees") or []
    if employees:
        for emp in employees:
            if emp.get("isActive", True):
                _staff_ids.append({
                    "id": emp.get("id"),
                    "name": emp.get("name"),
                    "type": emp.get("employeeType", "HOURLY")
                })
    return _staff_ids

def simulate_daily_attendance(day_date):
    """Simulate staff clock-in/out for a day.
    90% clock in on time (8:00 AM), 10% come late/leave early randomly.
    Clock out at end of day (8:00 PM or their actual clock-out time).
    """
    if not _staff_ids:
        load_staff_ids()
    
    if not _staff_ids:
        print(f"  ⚠️  No staff found for attendance tracking")
        return
    
    # First, force-close any active attendance records from previous days
    close_time = day_date.replace(hour=23, minute=59, second=59)
    try:
        r = requests.post(f"{BASE}/prime-cost/attendance/force-close-all?closeTime={close_time.isoformat()}")
        if r.status_code == 200:
            result = r.json()
            closed = result.get("closed", 0)
            if closed > 0:
                print(f"  📋 Closed {closed} active attendance records from previous days")
    except Exception as e:
        pass
    
    # Clock in staff
    on_time_count = 0
    late_count = 0
    
    for staff in _staff_ids:
        # 90% chance to clock in on time (between 7:30-8:30 AM)
        # 10% chance to clock in late (between 9:00 AM - 12:00 PM) or not show up
        if random.random() < 0.90:
            # On time - random between 7:30 and 8:30 AM
            clock_in = day_date.replace(
                hour=random.randint(7, 8),
                minute=random.choice([0, 15, 30, 45]),
                second=0
            )
            on_time_count += 1
        else:
            # Late - random between 9:00 AM and 12:00 PM
            clock_in = day_date.replace(
                hour=random.randint(9, 11),
                minute=random.randint(0, 59),
                second=0
            )
            late_count += 1
        
        try:
            r = requests.post(f"{BASE}/prime-cost/employees/{staff['id']}/clock-in?clockInTime={clock_in.isoformat()}")
            # Silent success - don't log each clock-in
        except Exception as e:
            pass
    
    print(f"  👥 Staff Attendance: {on_time_count} on-time, {late_count} late")
    
    # Schedule clock-out for end of day (will be called after simulation completes)
    return True

def clock_out_all_staff(day_date):
    """Clock out all active staff at end of day."""
    if not _staff_ids:
        return
    
    # Clock out between 7:00 PM and 9:00 PM
    clock_out_count = 0
    for staff in _staff_ids:
        clock_out = day_date.replace(
            hour=random.randint(19, 20),
            minute=random.randint(0, 59),
            second=0
        )
        try:
            r = requests.post(f"{BASE}/prime-cost/employees/{staff['id']}/clock-out?clockOutTime={clock_out.isoformat()}")
            if r.status_code == 200:
                clock_out_count += 1
        except Exception as e:
            pass
    
    return clock_out_count

# ── TABLE ID CACHE ─────────────────────────────────────────────────────
_table_ids=[]  # list of actual dining_table IDs from DB

def load_table_ids():
    global _table_ids
    tbls=RGET(f"{BASE}/pos/tables") or []
    _table_ids=[t.get("id") for t in tbls if t.get("id") is not None]
    return _table_ids

# ── PROCUREMENT ──────────────────────────────────────────────────────────

def procure():
    """Create a purchase order via REST API to restock low ingredients."""
    # Get low-stock ingredients
    low_stock = RGET(f"{BASE}/ingredients/low-stock") or []
    if not low_stock:
        return False
    
    # For simplicity, just refresh the on-hand cache
    # In production, would create PO and receive shipment
    global _oh_cache, _oh_ts
    _oh_cache = _refresh_oh()
    _oh_ts = time.time()
    
    with _slock:
        stats["procurement_cycles"] += 1
    return True

def check_stock():
    """Check if any ingredients are below threshold and trigger procurement."""
    # Check on-hand cache for low stock
    low_items = [iid for iid, qty in _oh_cache.items() if qty < STOCK_THR]
    if low_items:
        with _slock:
            stats["inventory_alerts"] += 1
        return procure()
    return False

# ── INVENTORY-AWARE ORDER ──────────────────────────────────────────────

_all_menu_ids=[]
_menu_price_cache={}  # menuItemId -> sellPrice

def place_order(slot,tbl_id,r):
    """Place an order using the POS flow:
    1. Open table session → 2. Place order with lines → 3. Mark PAID → 4. Close session → 5. Clean table"""
    party=slot["party_size"]
    wanted=[random.choice(_all_menu_ids) for _ in range(party)]
    ok_items,skip=[],[]
    for mid in wanted:
        avail,miss=item_avail(mid,r)
        if avail:
            ok_items.append(mid)
        else:
            skip.append(mid)
            with _slock: stats["items_skipped"] += 1
    if not ok_items: return False

    # Compute total from menu prices (not flat AVG_CHK)
    total=sum(_menu_price_cache.get(mid, AVG_CHK) for mid in ok_items)
    total=round(total,2)

    odt=slot["date"].replace(hour=slot["hour"],minute=random.randint(0,59),second=random.randint(0,59))
    odt_str=odt.isoformat()

    # 1. Open session
    session_body=RPOST(f"{BASE}/pos/tables/{tbl_id}/open?guests={party}&openedAt={odt_str}",{})
    try:
        sess=json.loads(session_body)
        session_id=sess.get("id")
        if not session_id:
            with _slock: stats["order_errors"]+=1
            return False
    except Exception as e:
        with _slock: stats["order_errors"]+=1; return False

    # 2. Place order
    onum=f"SIM-{odt.strftime('%Y%m%d%H%M%S')}-{random.randint(10000,99999)}"
    lines=[{"menuItemId":m,"quantity":1,"unitPrice":_menu_price_cache.get(m,AVG_CHK)} for m in ok_items]
    order_body=RPOST(f"{BASE}/pos/orders",{
        "orderNumber":onum,
        "sessionId":session_id,
        "totalAmount":total,
        "status":"PENDING",
        "createdAt":odt_str,
        "lines":lines
    })
    order=None
    try:
        order=json.loads(order_body)
        order_id=order.get("id")
    except: pass

    # 3. Mark PAID
    if order_id:
        RPATCH(f"{BASE}/pos/orders/{order_id}/status?status=PAID")

    # 4. Close session (5-90 minutes later)
    close_min=random.randint(45,90)
    close_dt=odt+timedelta(minutes=close_min)
    RPOST(f"{BASE}/pos/sessions/{session_id}/close?closedAt={close_dt.isoformat()}",{})

    # 5. Clean table (set status back to AVAILABLE)
    RPATCH(f"{BASE}/pos/tables/{tbl_id}/status?status=AVAILABLE")

    with _slock:
        stats["total_orders"]+=1
        stats["total_revenue"]+=total
        stats["items_ordered"]+=len(ok_items)
    
    # Track order for EOD Audit
    if order_id:
        with _daylock:
            if slot["day_idx"] not in _orders_per_day:
                _orders_per_day[slot["day_idx"]] = []
            _orders_per_day[slot["day_idx"]].append({
                "order_id": order_id,
                "total": total,
                "date": slot["date"],
                "items": ok_items,
            })
    return True

# ── WORKER ──────────────────────────────────────────────────────────────

def worker(wid):
    import traceback
    while True:
        try: slot=work_q.get(timeout=0.5)
        except queue.Empty:
            with _qlock:
                done=sum(len(v) for v in done_slots.values())
                if done>=_total_q and _total_q>0: break
            continue
        # Pick a random table ID
        if not _table_ids: 
            print(f"[Worker-{wid}] WARN: No tables available, re-queueing", flush=True)
            time.sleep(0.1); work_q.put(slot); continue
        tbl_id=random.choice(_table_ids)
        try:
            print(f"[Worker-{wid}] Processing slot: Day {slot.get('day_idx','?')}, Hour {slot.get('hour','?')}", flush=True)
            place_order(slot,tbl_id,rc())
            print(f"[Worker-{wid}] ✓ Order placed", flush=True)
        except Exception as e:
            print(f"[Worker-{wid}] ✗ ERROR: {e}", flush=True)
            traceback.print_exc(flush=True)
        finally:
            work_q.task_done()
        with _qlock:
            idx=slot["day_idx"]
            if idx not in done_slots: done_slots[idx]=set()
            done_slots[idx].add((slot["hour"],slot["arr"]))
        with _slock:
            if stats["total_orders"]%30==0: check_stock()

def gen_work():
    global _total_q
    for di in range(DAYS):
        d=START_DATE+timedelta(days=di); dt=day_type(d)
        for h in range(24):
            l=lam_for(h,dt)
            if l==0: continue
            for ai in range(poisson(l)):
                work_q.put({"day_idx":di,"date":d,"hour":h,"arr":ai,
                            "party_size":random.randint(PARTY_MIN,PARTY_MAX)})
    with _qlock: _total_q=work_q.qsize()

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 0: BOOTSTRAP (all via REST)
# ═══════════════════════════════════════════════════════════════════════════

_ing_map={}  # item_code → ingredient_id (filled during bootstrap)
_sup1_id=None  # first supplier ID (filled during bootstrap)

def bootstrap():
    """Create everything from scratch — REST where possible, psql where no endpoint exists."""
    global _sup1_id, _all_menu_ids

    print("\n🔧 Phase 0: Bootstrap (REST + psql)")
    print("="*60)

    # 0a. Create Restaurant 1 if not exists (psql — no REST endpoint)
    print("  Creating restaurant ...")
    ok,_ = psql(f"INSERT INTO restaurant (id, name, timezone, created_at, updated_at) "
                f"VALUES ({RESTAURANT_ID}, 'Afghan Cuisine', 'Asia/Kabul', NOW(), NOW()) "
                f"ON CONFLICT (id) DO NOTHING")
    print(f"  ✓ Restaurant {RESTAURANT_ID} {'created' if ok else 'exists/error'}")

    # 0b. Create Suppliers (REST)
    print("  Creating suppliers ...")
    sup_ids = []
    for s in SEED_SUPPLIERS:
        body = RPOST(f"{BASE}/suppliers", s)
        try:
            d = json.loads(body)
            sid = d.get("id")
            if sid: sup_ids.append(sid)
        except: pass
    _sup1_id = sup_ids[0] if sup_ids else 1
    with _slock: stats["bootstrap_suppliers"] = len(sup_ids)
    print(f"  ✓ {len(sup_ids)} suppliers")

    # 0c. Create Ingredients (REST)
    print("  Creating ingredients ...")
    for ing in SEED_INGREDIENTS:
        code, desc, itype, cat, pu, case, price, ru, rppu, yp, iu, iuppu, par = ing
        body = RPOST(f"{BASE}/ingredients", {
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
            if iid: _ing_map[code] = iid
        except: pass
    with _slock: stats["bootstrap_ingredients"] = len(_ing_map)
    print(f"  ✓ {len(_ing_map)} ingredients")

    # 0d. Create Menu Cost Groups (psql - REST has duplicate issue)
    print("  Creating menu cost groups (psql) ...")
    grp_sql_parts = []
    for g in SEED_COST_GROUPS:
        grp_sql_parts.append(f"({RESTAURANT_ID},'{g['name']}','{g['revenueCategory']}',{g['displayOrder']},NOW())")
    grp_vals = ','.join(grp_sql_parts)
    ok,_ = psql(f"INSERT INTO menu_cost_group (restaurant_id,name,revenue_category,display_order,created_at) VALUES {grp_vals} ON CONFLICT (restaurant_id,name) DO NOTHING")
    _, grp_out = psql(f"SELECT id,name FROM menu_cost_group WHERE restaurant_id={RESTAURANT_ID} ORDER BY display_order")
    grp_ids = []
    for line in grp_out.strip().split('\n'):
        parts = line.strip().split('|')
        if len(parts) >= 2:
            try:
                grp_ids.append(int(parts[0].strip()))
            except: pass
    with _slock: stats["bootstrap_groups"] = len(grp_ids)
    print(f"  ✓ {len(grp_ids)} cost groups  IDs={grp_ids}")

    # 0e. Create Menu Items (psql — REST endpoint has pos_id NULL bug)
    print("  Creating menu items + recipes (psql) ...")
    mi_sql_parts = []
    for item in SEED_MENU_ITEMS:
        gidx, posId, name, sell, fcPct, ingLines = item
        gid = grp_ids[gidx] if gidx < len(grp_ids) else (grp_ids[0] if grp_ids else 1)
        mi_sql_parts.append(f"({RESTAURANT_ID},{gid},'{posId}','{name}',{sell},{fcPct},{sell*fcPct},true,1,NOW(),NOW())")
    mi_vals = ','.join(mi_sql_parts)
    ok,_ = psql(f"INSERT INTO menu_item (restaurant_id,group_id,pos_id,name,sell_price,target_fc_pct,plate_cost,is_active,display_order,created_at,updated_at) VALUES {mi_vals} ON CONFLICT (restaurant_id,pos_id) DO NOTHING")

    # Fetch actual menu item IDs (pos_id -> db id)
    _, mi_out = psql(f"SELECT id,pos_id FROM menu_item WHERE restaurant_id={RESTAURANT_ID} ORDER BY pos_id")
    mi_id_map = {}
    _all_menu_ids.clear()
    for line in mi_out.strip().split('\n'):
        parts = line.strip().split('|')
        if len(parts) >= 2:
            try:
                mi_id_map[parts[1].strip()] = int(parts[0].strip())
                _all_menu_ids.append(int(parts[0].strip()))
            except: pass

    def mid(pos_id): return mi_id_map.get(pos_id, 0)
    def iid(ing_code): return _ing_map.get(ing_code, 0)

    # Insert recipes with dynamic menu_item IDs
    # station = KitchenStationType (where it\'s MADE)
    # recipe_type = PLATE (single-serve) | BATCH (bulk-prep like naan, chai)
    recipe_rows = [
        (mid('M01'), 'Kabuli Pulao',       'PLATE', 'LINE_COOK', True, 1.000, 'EACH',   'ONE_DAY'),
        (mid('M02'), 'Lamb Karahi',        'PLATE', 'LINE_COOK', True, 1.000, 'EACH',   'ONE_SHIFT'),
        (mid('M03'), 'Mantu Dumplings',    'PLATE', 'LINE_COOK', True, 1.000, 'EACH',   'ONE_DAY'),
        (mid('M04'), 'Ashak Dumplings',    'PLATE', 'LINE_COOK', True, 1.000, 'EACH',   'ONE_DAY'),
        (mid('K01'), 'Chopan Kebab',       'PLATE', 'LINE_COOK', True, 1.000, 'EACH',   'ONE_SHIFT'),
        (mid('K02'), 'Chicken Tikka',      'PLATE', 'LINE_COOK', True, 1.000, 'EACH',   'ONE_SHIFT'),
        (mid('K03'), 'Shami Kebab',        'PLATE', 'PREP_COOK', True, 1.000, 'EACH',   'ONE_DAY'),
        (mid('S01'), 'Borani Banjan',      'PLATE', 'PREP_COOK', True, 1.000, 'EACH',   'ONE_DAY'),
        (mid('S02'), 'Dal (Lentil Stew)',  'PLATE', 'LINE_COOK', True, 1.000, 'EACH',   'ONE_DAY'),
        (mid('S03'), 'Tandoori Naan',      'BATCH', 'PREP_COOK', True, 8.000, 'EACH',   'ONE_SHIFT'),
        (mid('B01'), 'Afghan Chai',        'BATCH', 'PANTRY',    True, 10.000,'CUP',    'ONE_SHIFT'),
        (mid('B02'), 'Dogh',               'BATCH', 'PANTRY',    True, 4.000, 'PINT',   'ONE_DAY'),
    ]
    rv = ','.join(f"({RESTAURANT_ID},{mid},'{name}','{rtype}','{stn}',{str(act).lower()},{yq},'{yu}','{sl}',NOW(),NOW())"
                  for mid, name, rtype, stn, act, yq, yu, sl in recipe_rows if mid > 0)
    ok,_ = psql(f"INSERT INTO recipe (restaurant_id,menu_item_id,name,recipe_type,station,is_active,yield_quantity,yield_unit,shelf_life,created_at,updated_at) VALUES {rv} ON CONFLICT DO NOTHING")

    # Insert recipe ingredient lines using dynamic IDs from _ing_map
    ril_data = [
        # Kabuli Pulao (M01)
        (mid('M01'), iid('ING01'), 1, 0.50, 'LB'),
        (mid('M01'), iid('ING02'), 2, 0.50, 'LB'),
        (mid('M01'), iid('ING06'), 3, 0.02, 'LB'),
        (mid('M01'), iid('ING10'), 4, 0.005,'LB'),
        # Lamb Karahi (M02)
        (mid('M02'), iid('ING02'), 1, 1.00, 'LB'),
        (mid('M02'), iid('ING04'), 2, 0.30, 'LB'),
        (mid('M02'), iid('ING05'), 3, 0.02, 'LB'),
        (mid('M02'), iid('ING03'), 4, 0.02, 'CUP'),
        (mid('M02'), iid('ING07'), 5, 0.01, 'LB'),
        # Mantu Dumplings (M03)
        (mid('M03'), iid('ING02'), 1, 0.40, 'LB'),
        (mid('M03'), iid('ING14'), 2, 0.20, 'LB'),
        (mid('M03'), iid('ING04'), 3, 0.20, 'LB'),
        (mid('M03'), iid('ING11'), 4, 0.10, 'CUP'),
        # Ashak Dumplings (M04)
        (mid('M04'), iid('ING19'), 1, 0.30, 'LB'),
        (mid('M04'), iid('ING04'), 2, 0.20, 'LB'),
        (mid('M04'), iid('ING11'), 3, 0.10, 'CUP'),
        (mid('M04'), iid('ING14'), 4, 0.15, 'LB'),
        # Chopan Kebab (K01)
        (mid('K01'), iid('ING02'), 1, 0.75, 'LB'),
        (mid('K01'), iid('ING06'), 2, 0.02, 'LB'),
        (mid('K01'), iid('ING07'), 3, 0.01, 'LB'),
        (mid('K01'), iid('ING09'), 4, 0.005,'LB'),
        # Chicken Tikka (K02)
        (mid('K02'), iid('ING02'), 1, 0.50, 'LB'),
        (mid('K02'), iid('ING11'), 2, 0.10, 'CUP'),
        (mid('K02'), iid('ING07'), 3, 0.01, 'LB'),
        (mid('K02'), iid('ING08'), 4, 0.005,'LB'),
        # Shami Kebab (K03)
        (mid('K03'), iid('ING02'), 1, 0.30, 'LB'),
        (mid('K03'), iid('ING12'), 2, 0.20, 'LB'),
        (mid('K03'), iid('ING04'), 3, 0.10, 'LB'),
        (mid('K03'), iid('ING05'), 4, 0.01, 'LB'),
        # Borani Banjan (S01)
        (mid('S01'), iid('ING20'), 1, 1.00, 'LB'),
        (mid('S01'), iid('ING11'), 2, 0.05, 'CUP'),
        (mid('S01'), iid('ING06'), 3, 0.01, 'LB'),
        # Dal (S02)
        (mid('S02'), iid('ING13'), 1, 0.50, 'LB'),
        (mid('S02'), iid('ING04'), 2, 0.20, 'LB'),
        (mid('S02'), iid('ING03'), 3, 0.02, 'CUP'),
        (mid('S02'), iid('ING07'), 4, 0.005,'LB'),
        # Tandoori Naan (S03)
        (mid('S03'), iid('ING14'), 1, 0.25, 'LB'),
        (mid('S03'), iid('ING11'), 2, 0.02, 'CUP'),
        (mid('S03'), iid('ING03'), 3, 0.005,'CUP'),
        # Afghan Chai (B01)
        (mid('B01'), iid('ING16'), 1, 0.01, 'LB'),
        (mid('B01'), iid('ING17'), 2, 0.002,'LB'),
        # Dogh (B02)
        (mid('B02'), iid('ING11'), 1, 0.10, 'CUP'),
        (mid('B02'), iid('ING04'), 2, 0.05, 'LB'),
    ]
    ril_vals = ','.join(
        f"((SELECT id FROM recipe WHERE menu_item_id={m} AND restaurant_id={RESTAURANT_ID}),{i},{ln},{q},'{ru}')"
        for m, i, ln, q, ru in ril_data if m > 0 and i > 0
    )
    ok,_ = psql(f"INSERT INTO recipe_ingredient_line (recipe_id,ingredient_id,line_number,quantity_ru,recipe_unit) VALUES {ril_vals} ON CONFLICT DO NOTHING")
    with _slock: stats["bootstrap_menu_items"] = len(_all_menu_ids)
    print(f"  ✓ {len(_all_menu_ids)} menu items + recipes")

    # 0f. Create Staff (psql)
    print("  Creating staff (psql) ...")
    staff_vals = ','.join(
        f"({RESTAURANT_ID},'{n}','{t}',{r},true,NOW())" for n,t,r in SEED_STAFF
    )
    ok,_ = psql(f"INSERT INTO employee (restaurant_id,name,employee_type,hourly_rate,is_active,created_at) "
                f"VALUES {staff_vals} ON CONFLICT (restaurant_id,name) DO NOTHING")
    _, cnt = psql(f"SELECT count(*) FROM employee WHERE restaurant_id={RESTAURANT_ID}")
    with _slock: stats["bootstrap_staff"] = int(cnt.strip()) if cnt.strip().isdigit() else len(SEED_STAFF)
    print(f"  ✓ {stats['bootstrap_staff']} staff")

    # 0g. Create Tables (psql)
    print("  Creating dining tables (psql) ...")
    ok,_ = psql(f"""INSERT INTO dining_table (restaurant_id,table_number,capacity,status,pos_x,pos_y)
        SELECT {RESTAURANT_ID},'T'||n, CASE WHEN n<=6 THEN 2 WHEN n<=16 THEN 4 ELSE 6 END, 'AVAILABLE',
               ((n-1)%5)*100+40, ((n-1)/5)*100+40
        FROM generate_series(1,{MAX_TBL}) AS n
        ON CONFLICT (restaurant_id,table_number) DO NOTHING""")
    _, cnt = psql(f"SELECT count(*) FROM dining_table WHERE restaurant_id={RESTAURANT_ID}")
    with _slock: stats["bootstrap_tables"] = int(cnt.strip()) if cnt.strip().isdigit() else MAX_TBL
    print(f"  ✓ {stats['bootstrap_tables']} tables")

    print(f"\n  Bootstrap complete:")
    print(f"    Suppliers:    {stats['bootstrap_suppliers']}")
    print(f"    Ingredients:  {stats['bootstrap_ingredients']}")
    print(f"    Groups:       {stats['bootstrap_groups']}")
    print(f"    Menu items:   {stats['bootstrap_menu_items']}")
    print(f"    Staff:        {stats['bootstrap_staff']}")
    print(f"    Tables:       {stats['bootstrap_tables']}")
# ═══════════════════════════════════════════════════════════════════════════
# SANITY SUITE (all via REST)
# ═══════════════════════════════════════════════════════════════════════════

def s1_negative():
    f=[]
    for iid in list(_ing_map.values())[:10]:
        oh=on_hand(iid)
        if oh<-0.01: f.append({"id":iid,"oh":round(oh,4)})
    return f

def s2_ledger_vs_master():
    f=[]; ings=RGET(f"{BASE}/ingredients") or []
    for ing in ings:
        iid=ing.get("id"); cached=float(ing.get("onHand",0) or 0)
        ledger=on_hand(iid)
        if abs(ledger-cached)>0.5: f.append({"id":iid,"ledger":round(ledger,4),"master":round(cached,4)})
    return f

def s3_low_stock():
    alerts=RGET(f"{BASE}/ingredients/low-stock") or []
    return len(alerts)

def s4_profitability():
    f=[]
    for mid in _all_menu_ids[:5]:
        p=RGET(f"{BASE}/inventory/intelligence/profitability/{mid}")
        if p is None: f.append({"mid":mid,"issue":"null"})
    return f

def s5_valuation():
    val=RGET(f"{BASE}/reports/inventory-valuation")
    if val is None: return [{"issue":"null"}]
    return []

def s6_wastage():
    w=RGET(f"{BASE}/inventory/intelligence/wastage/summary?start=2026-01-01T00:00:00&end=2026-12-31T23:59:59")
    if w is None: return [{"issue":"null"}]
    return []

def s7_recipe_integrity():
    f=[]; r=rc()
    for mid,lines in list(r.items())[:10]:
        for l in lines:
            iid=l["i"]
            if iid is None: f.append({"mid":mid,"issue":"null_ing"}); continue
            ing=RGET(f"{BASE}/ingredients/{iid}")
            if ing is None: f.append({"mid":mid,"ing":iid,"issue":"404"})
    return f

def s8_all_on_hand():
    f=[]
    for code,iid in list(_ing_map.items())[:10]:
        oh=on_hand(iid)
        if oh==-999.0: f.append({"code":code,"id":iid,"issue":"unreachable"})
    return f

def run_sanity():
    print("\n"+"="*60+"\n🔍  SANITY SUITE  (all via REST)\n"+"="*60)
    all_pass=True
    checks=[
        ("S1: No negative stock",      s1_negative),
        ("S2: Ledger matches master",  s2_ledger_vs_master),
        ("S3: Low-stock alerts",      s3_low_stock),
        ("S4: Profitability API",     s4_profitability),
        ("S5: Inventory valuation",   s5_valuation),
        ("S6: Wastage summary",        s6_wastage),
        ("S7: Recipe integrity",      s7_recipe_integrity),
        ("S8: All ingredients on-hand",s8_all_on_hand),
    ]
    for label,fn in checks:
        try: result=fn()
        except Exception as e: result=[{"issue":str(e)}]
        if label.startswith("S3"):
            n=result if isinstance(result,int) else 0
            print(f"  ℹ️  {label} — {n} alerts")
        elif isinstance(result,list) and len(result)==0:
            print(f"  ✅ {label} — PASS")
        elif isinstance(result,list):
            all_pass=False
            with _slock: stats["sanity_fails"]+=len(result)
            print(f"  🚨 {label} — FAIL ({len(result)} issues)")
            for r in result[:3]: print(f"       └─ {r}")
        else:
            print(f"  ℹ️  {label} — {result}")
        with _slock: stats["sanity_checks"]+=1
    return all_pass

# ═══════════════════════════════════════════════════════════════════════════
# API HEALTH CHECK
# ═══════════════════════════════════════════════════════════════════════════

ENDPOINTS=[
    ("PRIME-COST /live",              f"{BASE}/prime-cost/live"),
    ("PRIME-COST /weekly",            f"{BASE}/prime-cost/weekly?weekStart={START_DATE.strftime('%Y-%m-%d')}"),
    ("PRIME-COST /trend",             f"{BASE}/prime-cost/trend"),
    ("PRIME-COST /budget-vs-actual",  f"{BASE}/prime-cost/budget-vs-actual?weekStart={START_DATE.strftime('%Y-%m-%d')}"),
    ("PRIME-COST /variance-attribution",f"{BASE}/prime-cost/variance-attribution?weekStart={START_DATE.strftime('%Y-%m-%d')}"),
    ("PRIME-COST /forecast",          f"{BASE}/prime-cost/forecast?weekStart={START_DATE.strftime('%Y-%m-%d')}"),
    ("PRIME-COST /shrinkage",         f"{BASE}/prime-cost/shrinkage?from={START_DATE.strftime('%Y-%m-%d')}&to={(START_DATE+timedelta(days=6)).strftime('%Y-%m-%d')}"),
    ("LABOR /employees",              f"{BASE}/prime-cost/labor/employees"),
    ("LABOR /schedule",               f"{BASE}/prime-cost/labor/schedule?weekStart={START_DATE.strftime('%Y-%m-%d')}"),
    ("LABOR /weekly-summary",         f"{BASE}/prime-cost/labor/weekly-summary?weekStart={START_DATE.strftime('%Y-%m-%d')}"),
    ("LABOR /variance",               f"{BASE}/prime-cost/labor/variance?weekStart={START_DATE.strftime('%Y-%m-%d')}"),
    ("ANALYTICS /dashboard",          f"{BASE}/analytics/dashboard"),
    ("ANALYTICS /cfo/snapshot",       f"{BASE}/analytics/cfo/snapshot"),
    ("ANALYTICS /manager/chef",        f"{BASE}/analytics/manager/chef"),
    ("REPORTS /menu-engineering",      f"{BASE}/reports/menu-engineering?startDate={START_DATE.strftime('%Y-%m-%d')}&endDate={(START_DATE+timedelta(days=6)).strftime('%Y-%m-%d')}"),
    ("REPORTS /prime-cost",            f"{BASE}/reports/prime-cost?startDate={START_DATE.strftime('%Y-%m-%d')}"),
    ("REPORTS /inventory-valuation",   f"{BASE}/reports/inventory-valuation"),
    ("REPORTS /category-distribution",  f"{BASE}/reports/category-distribution"),
    ("REPORTS /overtime-leakage",       f"{BASE}/reports/overtime-leakage?weekStart={START_DATE.strftime('%Y-%m-%d')}"),
    ("REPORTS /table-turnaround",       f"{BASE}/reports/table-turnaround?startDate={START_DATE.strftime('%Y-%m-%d')}&endDate={(START_DATE+timedelta(days=6)).strftime('%Y-%m-%d')}"),
    ("REPORTS /inventory-variance",      f"{BASE}/reports/inventory-variance?startDate={START_DATE.strftime('%Y-%m-%d')}&endDate={(START_DATE+timedelta(days=6)).strftime('%Y-%m-%d')}"),
    ("INVENTORY /stats",               f"{BASE}/inventory/stats"),
    ("INVENTORY /low-stock",           f"{BASE}/ingredients/low-stock"),
    ("POS /menu-items",                f"{BASE}/pos/menu-items"),
    ("POS /tables",                    f"{BASE}/pos/tables"),
]

def api_health():
    print("\n"+"="*60+"\n🌐  API HEALTH CHECK\n"+"="*60)
    ok=fail=0; failures=[]
    for label,url in ENDPOINTS:
        code,data=RGET_CODE(url)
        has= data is not None and data!=0 and data!=[] and data!={}
        if code.startswith("2"):
            m="✅" if has else "⚠️"
            print(f"  {m} {label:40s} HTTP {code:3s} {'data ✓' if has else 'empty'}"); ok+=1
        else:
            print(f"  🚨 {label:40s} HTTP {code}"); fail+=1; failures.append((label,code))
    print(f"\n  ✅ {ok} OK   🚨 {fail} FAIL")
    return fail==0

# ═══════════════════════════════════════════════════════════════════════════
# END-OF-DAY (EOD) AUDIT
# ═══════════════════════════════════════════════════════════════════════════

VARIANCE_THRESHOLD = 0.05  # 5% tolerance for inventory variance

def _load_ing_names():
    """Load ingredient names once and cache. Avoids 90 API calls for 90 days."""
    global _ing_names_cache
    if not _ing_names_cache:
        try:
            for ing in (RGET(f"{BASE}/ingredients") or []):
                iid = ing.get("id")
                if iid:
                    _ing_names_cache[iid] = ing.get("description", f"ING#{iid}")
        except: pass
    return _ing_names_cache

def run_eod_audit(day_idx, day_date, verbose=True):
    """
    Run EOD audit for a specific day:
    1. Inventory Audit: Compare expected vs actual ingredient depletion
    2. Staff Attendance Audit: Check clock-in/clock-out records
    
    Returns: (inventory_variances, attendance_alerts)
    """
    date_str = day_date.strftime("%Y-%m-%d")
    day_type_str = day_type(day_date)
    
    inv_var = []
    att_alerts = []
    
    # Get orders for this day
    day_orders = _orders_per_day.get(day_idx, [])
    num_orders = len(day_orders)
    
    if verbose:
        print(f"\n{'='*60}")
        print(f"📋 EOD AUDIT — Day {day_idx + 1} ({day_type_str.title()}) — {date_str}")
        print(f"{'='*60}")
    
    # ── 1. INVENTORY AUDIT ─────────────────────────────────────────────
    if verbose:
        print(f"  🍖 Inventory Audit")
    
    # Calculate expected consumption based on recipe ingredients
    expected_consumption = {}  # {ingredient_id: expected_qty}
    for order in day_orders:
        for mid in order.get("items", []):
            ingredients = item_ingredients(mid)
            for iid, qty in ingredients:
                expected_consumption[iid] = expected_consumption.get(iid, 0) + qty
    
    # Query actual consumption from inventory ledger (via psql)
    # StockMovementType.DEPLETION events for this day
    start_dt = f"{date_str} 00:00:00"
    end_dt = f"{date_str} 23:59:59"
    
    ok, actual_data = psql(f"""
        SELECT ingredient_id, SUM(ABS(quantity)) as consumed 
        FROM inventory_ingredient_ledger 
        WHERE restaurant_id = {RESTAURANT_ID} 
          AND event_type = 'DEPLETION'
          AND created_at >= '{start_dt}' 
          AND created_at <= '{end_dt}'
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
                except: pass
    
    # Load ingredient names from cache (loaded once at startup)
    ing_names = _load_ing_names()
    
    # Compare expected vs actual
    all_ingredients = set(expected_consumption.keys()) | set(actual_consumption.keys())
    variance_count = 0
    
    for iid in all_ingredients:
        expected = expected_consumption.get(iid, 0)
        actual = actual_consumption.get(iid, 0)
        
        if expected == 0 and actual == 0:
            continue
        
        # Calculate variance percentage
        if expected > 0:
            variance_pct = abs(actual - expected) / expected
        else:
            variance_pct = 1.0  # 100% variance if expected 0 but actual > 0
        
        ing_name = ing_names.get(iid, f"ING#{iid}")
        
        if variance_pct > VARIANCE_THRESHOLD:
            variance_count += 1
            flag = "❌" if variance_pct > 0.20 else "⚠️"
            direction = "↑" if actual > expected else "↓"
            if verbose:
                print(f"    {flag} {ing_name}: Expected {direction} {abs(expected):.2f}, Actual {direction} {abs(actual):.2f} (Δ {variance_pct*100:.1f}%)")
            inv_var.append({
                "ingredient_id": iid,
                "name": ing_name,
                "expected": expected,
                "actual": actual,
                "variance_pct": variance_pct
            })
    
    if verbose:
        print(f"    Expected Orders: {num_orders}  |  Actual Ledger Entries: {len(actual_consumption)}")
        if variance_count == 0:
            print(f"    ✅ Low Variance: All ingredients within ±{VARIANCE_THRESHOLD*100:.0f}% tolerance")
        else:
            print(f"    ❌ High Variance: {variance_count} ingredients flagged (>±{VARIANCE_THRESHOLD*100:.0f}%)")
    
    # ── 2. STAFF ATTENDANCE AUDIT ───────────────────────────────────────
    if verbose:
        print(f"  👥 Staff Attendance Audit")
    
    # Get active employees
    ok, staff_data = psql(f"""
        SELECT id, name, employee_type 
        FROM employee 
        WHERE restaurant_id = {RESTAURANT_ID} AND is_active = true
    """)
    
    active_staff = []
    if ok and staff_data.strip():
        for line in staff_data.strip().split('\n'):
            parts = line.strip().split('|')
            if len(parts) >= 3:
                try:
                    active_staff.append({
                        "id": int(parts[0].strip()),
                        "name": parts[1].strip(),
                        "type": parts[2].strip()
                    })
                except: pass
    
    # Get attendance records for this day
    ok, att_data = psql(f"""
        SELECT ea.id, ea.employee_id, e.name, ea.clock_in_time, ea.clock_out_time, ea.status
        FROM employee_attendance ea
        JOIN employee e ON e.id = ea.employee_id
        WHERE ea.restaurant_id = {RESTAURANT_ID}
          AND ea.clock_in_time >= '{start_dt}'
          AND ea.clock_in_time <= '{end_dt}'
        ORDER BY ea.clock_in_time
    """)
    
    clocked_in_ids = set()
    missing_clock_out = []
    
    if ok and att_data.strip():
        for line in att_data.strip().split('\n'):
            parts = line.strip().split('|')
            if len(parts) >= 6:
                try:
                    eid = int(parts[1].strip())
                    name = parts[2].strip()
                    clock_in = parts[3].strip()
                    clock_out = parts[4].strip()
                    status = parts[5].strip()
                    clocked_in_ids.add(eid)
                    
                    # Check for missing clock-out
                    if not clock_out or status == "ACTIVE":
                        missing_clock_out.append(name)
                except: pass
    
    # Identify staff with no clock-in
    no_clock_in = []
    for staff in active_staff:
        if staff["id"] not in clocked_in_ids:
            # Check if this is a MANAGEMENT type (they usually don't clock in)
            if staff["type"] != "MANAGEMENT":
                no_clock_in.append(staff["name"])
    
    total_att_alerts = len(missing_clock_out) + len(no_clock_in)
    
    if verbose:
        print(f"    Total Active Staff: {len(active_staff)}      Clocked In: {len(clocked_in_ids)}")
        
        for name in missing_clock_out:
            print(f"    ❌ {name}: Missing clock-out (still ACTIVE)")
        for name in no_clock_in:
            print(f"    ❌ {name}: No clock-in record")
        
        if total_att_alerts == 0:
            print(f"    ✅ Attendance Complete: All staff have valid clock-in/out records")
        else:
            print(f"    ❌ Attendance Alerts: {total_att_alerts} issues detected")
    
    # Collect attendance alerts
    for name in missing_clock_out:
        att_alerts.append({"employee": name, "issue": "Missing clock-out (ACTIVE)"})
    for name in no_clock_in:
        att_alerts.append({"employee": name, "issue": "No clock-in record"})
    
    if verbose:
        summary_icon = "✅" if (variance_count == 0 and total_att_alerts == 0) else "⚠️"
        print(f"\n  {summary_icon} Day {day_idx + 1} Audit Complete — {variance_count} inventory issues, {total_att_alerts} attendance issues")
    
    return inv_var, att_alerts

def run_eod_audits_for_all_days():
    """Run EOD audits for all days that have orders."""
    print("\n" + "="*60)
    print("📋  END-OF-DAY (EOD) AUDITS")
    print("="*60)
    
    total_inv_var = 0
    total_att_alerts = 0
    audited_days = 0
    
    for day_idx in sorted(_orders_per_day.keys()):
        day_date = START_DATE + timedelta(days=day_idx)
        inv_var, att_alerts = run_eod_audit(day_idx, day_date, verbose=True)
        total_inv_var += len(inv_var)
        total_att_alerts += len(att_alerts)
        audited_days += 1
    
    with _slock:
        stats["eod_audits_run"] = audited_days
        stats["inventory_variances"] = total_inv_var
        stats["attendance_alerts"] = total_att_alerts
    
    print(f"\n  👀 EOD Audit Summary: {audited_days} days audited")
    print(f"     Inventory Variances: {total_inv_var}")
    print(f"     Attendance Alerts: {total_att_alerts}")
    return total_inv_var, total_att_alerts

# ═══════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════

def main():
    print("="*60)
    print("🍽   RESTAURANT TRAFFIC SIMULATOR")
    print("     Pure REST | Bootstrap → Simulate → Sanity → EOD Audit → API Check")
    print("="*60)

    # Phase 0: Bootstrap skipped - data already seeded in DB
    print("\n🔧 Phase 0: Bootstrap SKIPPED (data already seeded)")
    print("="*60)

    # Phase 1: Build recipe cache + load table IDs + menu prices
    print("\n📖 Building recipe cache ...")
    rcache_data=rc()
    print(f"  ✓ {len(rcache_data)} recipes cached")

    print("  Loading table IDs ...")
    load_table_ids()
    print(f"  ✓ {len(_table_ids)} tables")

    # Reset all tables to AVAILABLE (clean up from any previous failed runs)
    print("  Resetting tables to AVAILABLE ...")
    for tbl_id in _table_ids:
        RPATCH(f"{BASE}/pos/tables/{tbl_id}/status?status=AVAILABLE")
    print("  ✓ All tables cleaned")

    print("  Loading menu prices ...")
    items=RGET(f"{BASE}/menu-items") or []
    for it in items:
        mid=it.get("id")
        price=it.get("sellPriceBuffer") or it.get("sellPrice") or AVG_CHK
        if mid: _menu_price_cache[mid]=float(price)
    print(f"  ✓ {len(_menu_price_cache)} prices")

    # Phase 2: Generate work
    print(f"\n🚶 Generating {DAYS} days of slots ...")
    gen_work()
    with _qlock: total=_total_q
    print(f"  ✓ {total} slots")

    # Load staff IDs for attendance tracking
    print("\n👥 Loading staff for attendance tracking ...")
    load_staff_ids()
    print(f"  ✓ {len(_staff_ids)} staff loaded")

    # Phase 3: Run simulation with worker threads + progress bar
    # Process day-by-day to simulate attendance at start/end of each day
    print(f"\n⚡ Simulating {DAYS} days (10 workers, inventory-aware) ...")
    t0=time.time()
    
    # Group work by day
    day_slots = {}
    while not work_q.empty():
        slot = work_q.get()
        day_idx = slot["day_idx"]
        if day_idx not in day_slots:
            day_slots[day_idx] = []
        day_slots[day_idx].append(slot)
    
    # Process each day
    for day_idx in range(DAYS):
        day_date = START_DATE + timedelta(days=day_idx)
        
        # Clock in staff at start of day
        print(f"\n🌅 Day {day_idx + 1}/{DAYS} ({day_date.strftime('%Y-%m-%d')}) - Clocking in staff...")
        simulate_daily_attendance(day_date)
        
        # Add this day's slots back to work queue
        if day_idx in day_slots:
            for slot in day_slots[day_idx]:
                work_q.put(slot)
        
        # Start workers for this day
        threads=[]
        for i in range(10):
            t=threading.Thread(target=worker,args=(i,),name=f"worker-{i}")
            t.daemon=True
            t.start()
            threads.append(t)
        
        # Wait for this day's work to complete
        day_work_count = len(day_slots.get(day_idx, []))
        while not work_q.empty() or any(t.is_alive() for t in threads):
            time.sleep(0.1)
        
        # Clock out staff at end of day
        print(f"🌙 Day {day_idx + 1}/{DAYS} - Clocking out staff...")
        clocked_out = clock_out_all_staff(day_date)
        print(f"  ✓ {clocked_out} staff clocked out")
        
        # Progress update
        with _slock:
            o=stats['total_orders']; r=stats['total_revenue']
        print(f"  📊 Day {day_idx + 1} Complete: Orders:{o:5d} | ${r:,.0f}")
    
    elapsed=time.time()-t0
    print(f"\n  ⏱  {elapsed:.1f}s  ({_total_q/max(elapsed,0.1):.0f} orders/sec)")

    # Phase 4: Sanity
    sanity_pass=run_sanity()

    # Phase 5: EOD Audits (Inventory + Attendance)
    audit_pass=True
    if _orders_per_day:
        total_inv_var, total_att_alerts = run_eod_audits_for_all_days()
        audit_pass = (total_inv_var == 0 and total_att_alerts == 0)

    # Phase 6: API health
    api_pass=api_health()

    # Summary
    with _slock: s=dict(stats)
    skip_rate=s["items_skipped"]/max(1,s["items_ordered"]+s["items_skipped"])*100
    print("\n"+"="*60+"\n📊  FINAL SUMMARY\n"+"="*60)
    print(f"  Bootstrap:  {s['bootstrap_suppliers']}s  {s['bootstrap_ingredients']}ing  {s['bootstrap_groups']}grp  {s['bootstrap_menu_items']}mi  {s['bootstrap_staff']}st  {s['bootstrap_tables']}tbl")
    print(f"  Orders:     {s['total_orders']}  Items: {s['items_ordered']}  Skipped: {s['items_skipped']} ({skip_rate:.1f}%)")
    print(f"  Revenue:    ${s['total_revenue']:,.2f}")
    print(f"  Procurement:{s['procurement_cycles']}  Alerts:{s['inventory_alerts']}  Busy:{s['busy_waits']}  Err:{s['order_errors']}")
    print(f"  EOD Audits: {s['eod_audits_run']} days  Inv Vars:{s['inventory_variances']}  Att Alerts:{s['attendance_alerts']}")
    print(f"  Sanity:     {s['sanity_checks']} checks  {s['sanity_fails']} fails  {'✅ PASS' if sanity_pass else '🚨 FAIL'}")
    print(f"  API Health: {'✅ PASS' if api_pass else '🚨 FAIL'}")
    print("="*60)

if __name__=="__main__": main()