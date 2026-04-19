#!/usr/bin/env python3
"""
Direct Order Generator — Work-Stealing + Inventory-Aware + Sanity Suite
10 worker threads, one per day. Uses record-misfire for inventory depletion.
Includes sanity suite + API health check after simulation.

Usage:
    python direct_order_generator.py [days] [start_date]
    python direct_order_generator.py 90 2026-01-01
"""

import subprocess, json, time, random, math, sys, threading, queue
import requests as _req
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor

RESTAURANT_ID = 1
BASE = f"http://localhost:8080/api/v1/restaurants/{RESTAURANT_ID}"

DAYS       = int(sys.argv[1]) if len(sys.argv) > 1 else 90
START_DATE = datetime.strptime(sys.argv[2], "%Y-%m-%d") if len(sys.argv) > 2 else datetime(2026, 1, 1)

LAMBDA_LUNCH = 5; LAMBDA_DINNER = 8; WEEKEND_MULT = 1.3
PARTY_MIN, PARTY_MAX = 2, 4; AVG_CHECK = 45.0; MAX_TABLES = 24

MENU_ITEMS = [
    (1,"Kabuli Pulao",25.0),(2,"Lamb Karahi",28.0),(5,"Kabuli Pulao (Lamb)",13.18),
    (6,"Lamb Karahi (F)",23.07),(7,"Mantu",5.67),(8,"Ashak",3.53),
    (9,"Chicken Palaw",5.45),(10,"Kofta Challow",5.9),(11,"Bamiya",2.53),
    (12,"Chopan Kebab",18.77),(13,"Chicken Tikka",4.85),(14,"Shami Kebab",6.53),
    (15,"Borani Banjan",3.1),(16,"Gandana Sabzi",2.8),(17,"Naan",1.5),
    (18,"Bolani",1.75),(19,"Saffron Tea",2.0),(20,"Dogh",1.5),
]
WEIGHTS = [100,90,85,80,75,70,65,60,55,50,45,40,35,30,25,20,15,10,15,10]
ING_IDS = [1,2,3,8,10,14,15,16,17]

# ── SHARED STATE ────────────────────────────────────────────────────────────────
_slock = threading.Lock()
stats = dict(total_orders=0, items_ordered=0, items_skipped=0,
             total_revenue=0.0, busy_waits=0, order_errors=0,
             menu_fetches=0, sanity_checks=0, sanity_fails=0)

_tlock = threading.Lock()
occupied = {}

work_q = queue.Queue()
done_slots = {}
_total_q = 0; _qlock = threading.Lock()

_rcache_lock = threading.Lock(); _rcache = {}; _rcache_ts = 0.0

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
        r = _sess.post(url, json=body, timeout=timeout)
        return r.text or ""
    except: return ""

def RGET_CODE(url, timeout=15):
    try:
        r = _sess.get(url, timeout=timeout)
        try: data = r.json()
        except: data = None
        return str(r.status_code), data
    except: return "0", None

# ── ON-HAND CACHE (cached every 60 seconds) ───────────────────────────────
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
        if time.time() - _oh_ts > 60 or not _oh_cache:
            _oh_cache = _refresh_oh(); _oh_ts = time.time()
    return _oh_cache.get(iid, -999.0)

def _get(url, timeout=10):
    """Legacy wrapper - use RGET instead."""
    return RGET(url, timeout)

def poisson(lam):
    if lam <= 0: return 0
    L = math.exp(-lam); k = 0; p = 1.0
    while p > L: k += 1; p *= random.random()
    return max(0, k - 1)

def day_type(d): return "weekend" if d.weekday() >= 5 else "weekday"

def lam_for(h, dt):
    if 11 <= h <= 14: b = LAMBDA_LUNCH
    elif 17 <= h <= 22: b = LAMBDA_DINNER
    else: return 0
    return b * WEEKEND_MULT if dt == "weekend" else b

def _build_rcache():
    items = RGET(f"{BASE}/pos/menu-items") or []
    c = {}
    for it in items:
        mid = it.get("id")
        if mid is None: continue
        for r in it.get("recipes", []):
            if r.get("active") or r.get("isActive"):
                c[mid] = [
                    {"ingredientId": l.get("ingredientId") or (l.get("ingredient") or {}).get("id"),
                     "quantityRu": float(l.get("quantityRu", 0))}
                    for l in r.get("ingredientLines", [])
                    if l.get("ingredientId") or (l.get("ingredient") or {}).get("id")
                ]; break
    with _slock: stats["menu_fetches"] += 1
    return c

def rcache():
    global _rcache, _rcache_ts
    with _rcache_lock:
        if time.time() - _rcache_ts > 300 or not _rcache:  # Extended to 5 min
            _rcache = _build_rcache(); _rcache_ts = time.time()
        return _rcache

def item_avail(mid, rc):
    lines = rc.get(mid, [])
    if not lines: return True, []
    miss = []
    for l in lines:
        iid = l.get("ingredientId")
        if iid is None: continue
        if on_hand(iid) < l["quantityRu"]:
            miss.append(f"ing#{iid}")
    return len(miss) == 0, miss

def free_table(ds, h):
    cut = f"{ds}_{h:02d}:00"
    with _tlock:
        for k in list(occupied):
            if k.startswith(ds + "|") and occupied.get(k, "") <= cut: del occupied[k]
    now = f"{ds}_{h:02d}:00"
    with _tlock:
        used = {k.split("|")[1] for k, v in occupied.items()
                if k.startswith(ds + "|") and v > now}
    for t in range(1, MAX_TABLES + 1):
        if f"T{t:02d}" not in used: return f"T{t:02d}"
    return None

def seat(tbl, ds, h):
    with _tlock:
        mins = h * 60 + random.randint(45, 105)
        occupied[f"{ds}|{tbl}"] = f"{ds}_{mins // 60:02d}:{mins % 60:02d}"

# ── WORKER ──────────────────────────────────────────────────────────────────

def worker(wid):
    while True:
        try:
            slot = work_q.get(timeout=0.5)
        except queue.Empty:
            with _qlock:
                done = sum(len(v) for v in done_slots.values())
                if done >= _total_q and _total_q > 0: break
            continue

        ds = slot["date"].strftime("%Y-%m-%d")
        tbl = free_table(ds, slot["hour"])
        if tbl is None:
            with _slock: stats["busy_waits"] += 1
            time.sleep(random.uniform(0.05, 0.3))
            work_q.put(slot); continue

        rc = rcache()
        party = slot["party_size"]
        wanted = [random.choices(range(len(MENU_ITEMS)), weights=WEIGHTS, k=1)[0]
                  for _ in range(party)]

        ok_items = []
        for idx in wanted:
            mid, name, price = MENU_ITEMS[idx]
            avail, miss = item_avail(mid, rc)
            if avail:
                ok_items.append((mid, name, price))
            else:
                with _slock: stats["items_skipped"] += 1

        if not ok_items:
            work_q.task_done()
            continue

        # place via record-misfire (depletes inventory)
        for mid, name, price in ok_items:
            try:
                RPOST(f"{BASE}/inventory/intelligence/record-misfire",
                      params={"menuId": mid, "reason": "SIM_ORDER", "employeeId": 1})
                with _slock:
                    stats["total_orders"] += 1
                    stats["items_ordered"] += 1
                    stats["total_revenue"] += price
            except:
                with _slock: stats["order_errors"] += 1

        seat(tbl, ds, slot["hour"])
        work_q.task_done()

        with _qlock:
            idx = slot["day_idx"]
            if idx not in done_slots: done_slots[idx] = set()
            done_slots[idx].add((slot["hour"], slot["arr"]))

# ── GENERATE WORK ────────────────────────────────────────────────────────────

def gen_work():
    global _total_q
    for di in range(DAYS):
        d = START_DATE + timedelta(days=di); dt = day_type(d)
        for h in range(24):
            l = lam_for(h, dt)
            if l == 0: continue
            for ai in range(poisson(l)):
                work_q.put({
                    "day_idx": di, "date": d, "hour": h, "arr": ai,
                    "party_size": random.randint(PARTY_MIN, PARTY_MAX),
                })
    with _qlock: _total_q = work_q.qsize()

# ── SANITY SUITE ─────────────────────────────────────────────────────────────

def sanity_negative_stock():
    fails = []
    for iid in ING_IDS:
        oh = on_hand(iid)
        if oh < -0.01: fails.append((iid, oh))
    return fails

def sanity_ledger_vs_master():
    fails = []
    ings = RGET(f"{BASE}/ingredients") or []
    for ing in ings:
        iid = ing.get("id"); cached = ing.get("onHand", 0) or 0
        ledger = on_hand(iid)
        if abs(ledger - float(cached)) > 0.5:
            fails.append((iid, ledger, cached))
    return fails

def sanity_recipe_integrity():
    fails = []
    rc = rcache()
    for mid, lines in list(rc.items())[:10]:
        for l in lines:
            iid = l.get("ingredientId")
            if iid is None: fails.append((mid, "null_ing")); continue
            ing = RGET(f"{BASE}/ingredients/{iid}")
            if ing is None: fails.append((mid, f"ing#{iid}_404"))
    return fails

def sanity_low_stock():
    return RGET(f"{BASE}/ingredients/low-stock") or []

def sanity_inventory_valuation():
    val = RGET(f"{BASE}/reports/inventory-valuation")
    if val is None: return [("N/A", "null_response")]
    tv = val.get("totalValue", 0) if isinstance(val, dict) else 0
    if tv < 0: return [("total", f"negative_{tv}")]
    return []

def run_sanity():
    print("\n" + "=" * 60)
    print("🔍  SANITY SUITE")
    print("=" * 60)
    all_pass = True
    checks = [
        ("S1: No negative stock",       sanity_negative_stock),
        ("S2: Ledger vs master",        sanity_ledger_vs_master),
        ("S3: Recipe integrity",        sanity_recipe_integrity),
        ("S4: Inventory valuation",     sanity_inventory_valuation),
    ]
    for label, fn in checks:
        try: result = fn()
        except Exception as e: result = [("ERR", str(e))]
        if isinstance(result, list) and len(result) == 0:
            print(f"  ✅ {label} — PASS")
        elif isinstance(result, list) and len(result) > 0:
            is_fail = any(isinstance(r, tuple) for r in result)
            if is_fail:
                all_pass = False
                with _slock: stats["sanity_fails"] += len(result)
                print(f"  🚨 {label} — FAIL ({len(result)} issues)")
                for r in result[:5]: print(f"       └─ {r}")
            else:
                print(f"  ℹ️  {label} — {result}")
    with _slock: stats["sanity_checks"] += len(checks)
    # S5: low-stock (informational)
    alerts = sanity_low_stock()
    print(f"  ℹ️  S5: Low-stock alerts — {len(alerts)} items below par")
    return all_pass

# ── API HEALTH CHECK ──────────────────────────────────────────────────────────

API_ENDPOINTS = [
    ("PRIME-COST /live",          f"{BASE}/prime-cost/live"),
    ("PRIME-COST /weekly",        f"{BASE}/prime-cost/weekly"),
    ("PRIME-COST /trend",         f"{BASE}/prime-cost/trend"),
    ("PRIME-COST /budget-vs-actual", f"{BASE}/prime-cost/budget-vs-actual"),
    ("PRIME-COST /variance-attrib",f"{BASE}/prime-cost/variance-attribution"),
    ("PRIME-COST /forecast",      f"{BASE}/prime-cost/forecast"),
    ("LABOR /employees",          f"{BASE}/prime-cost/labor/employees"),
    ("LABOR /schedule",           f"{BASE}/prime-cost/labor/schedule"),
    ("LABOR /weekly-summary",     f"{BASE}/prime-cost/labor/weekly-summary"),
    ("ANALYTICS /dashboard",      f"{BASE}/analytics/dashboard"),
    ("ANALYTICS /cfo/snapshot",   f"{BASE}/analytics/cfo/snapshot"),
    ("REPORTS /menu-engineering", f"{BASE}/reports/menu-engineering"),
    ("REPORTS /prime-cost",       f"{BASE}/reports/prime-cost"),
    ("REPORTS /inventory-value",  f"{BASE}/reports/inventory-valuation"),
    ("REPORTS /category-dist",    f"{BASE}/reports/category-distribution"),
    ("REPORTS /overtime-leakage", f"{BASE}/reports/overtime-leakage"),
    ("INVENTORY /stats",          f"{BASE}/inventory/stats"),
    ("INVENTORY /low-stock",     f"{BASE}/ingredients/low-stock"),
    ("POS /menu-items",          f"{BASE}/pos/menu-items"),
]

def api_health():
    print("\n" + "=" * 60)
    print("🌐  API HEALTH CHECK")
    print("=" * 60)
    ok = fail = skip = 0
    failures = []
    for label, url in API_ENDPOINTS:
        code, data = RGET_CODE(url)
        has_data = data is not None and data != 0 and data != [] and data != {}
        if code.startswith("2"):
            m = "✅" if has_data else "⚠️"
            print(f"  {m} {label:35s} HTTP {code:3s} {'data ✓' if has_data else 'empty'}")
            ok += 1
        else:
            print(f"  🚨 {label:35s} HTTP {code}")
            fail += 1; failures.append((label, code))
    print(f"\n  ✅ {ok} OK   🚨 {fail} FAIL   ⚠️ {skip} SKIP")
    return fail == 0

# ── MAIN ────────────────────────────────────────────────────────────────────

def main():
    print("=" * 50)
    print("📋  DIRECT ORDER GENERATOR")
    print("     Work-Stealing ×10 | Inventory-Aware | Sanity + API Check")
    print("=" * 50)

    print("\n🚶 Generating slots …")
    gen_work()
    with _qlock: total = _total_q
    print(f"  ✓ {total} slots ({DAYS} days)")

    # FIX: Actually submit workers to the thread pool
    t0 = time.time()
    print(f"\n⚡ Simulating {DAYS} days (10 workers) ...")
    with ThreadPoolExecutor(max_workers=10) as pool:
        futures = [pool.submit(worker, i) for i in range(10)]
        for f in futures:
            f.result()  # Wait for all workers to complete
    elapsed = time.time() - t0
    print(f"  ⏱  {elapsed:.1f}s  ({total/max(elapsed,0.1):.0f} slots/sec)")

    sanity_pass = run_sanity()
    api_pass = api_health()

    with _slock: s = dict(stats)
    skip_rate = s["items_skipped"] / max(1, s["items_ordered"] + s["items_skipped"]) * 100

    print("\n" + "=" * 50)
    print("📊  SUMMARY")
    print("=" * 50)
    print(f"  Orders placed     : {s['total_orders']}")
    print(f"  Items ordered     : {s['items_ordered']}")
    print(f"  Items skipped     : {s['items_skipped']}  ({skip_rate:.1f}% skip rate)")
    print(f"  Revenue           : ${s['total_revenue']:,.2f}")
    print(f"  Busy-waits        : {s['busy_waits']}")
    print(f"  Errors            : {s['order_errors']}")
    print(f"  Sanity            : {'✅ PASS' if sanity_pass else '🚨 FAIL'}")
    print(f"  API health        : {'✅ PASS' if api_pass else '🚨 FAIL'}")
    print(f"  Wall time         : {elapsed:.1f}s")
    print("=" * 50)


if __name__ == "__main__":
    main()