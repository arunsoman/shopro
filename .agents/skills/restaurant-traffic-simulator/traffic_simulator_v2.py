#!/usr/bin/env python3
"""
Restaurant Traffic Simulator — Pure REST + Work-Stealing + Progress Bar

Features:
- Checks DB every 2 minutes for order count
- Shows progress bar with DB-verified orders
- Fails immediately if any API response != 200
"""

import subprocess, json, time, random, math, sys, threading, queue
from datetime import datetime, timedelta
import requests as _req
import os

def poisson(lambd):
    """Simple Poisson distribution implementation"""
    L = math.exp(-lambd)
    k = 0
    p = 1.0
    while p > L:
        k += 1
        p *= random.random()
    return k - 1

# ── CONFIG ─────────────────────────────────────────────────────────────────
RESTAURANT_ID = 3
BASE = f"http://localhost:8080/api/v1/restaurants/{RESTAURANT_ID}"

DAYS       = int(sys.argv[1]) if len(sys.argv) > 1 else 15
START_DATE = datetime.strptime(sys.argv[2], "%Y-%m-%d") if len(sys.argv) > 2 else datetime(2026, 4, 3)

LUNCH_H = (11, 14)
DINNER_H = (17, 22)
LAM_L = 5
LAM_D = 8
WEEKEND_X = 1.3
PARTY_MIN = 2
PARTY_MAX = 4
AVG_CHK = 45.0
MAX_TBL = 20

# DB query for order count
PG = ["psql", "-h", "localhost", "-U", "postgres", "-d", "shopro_pos", "-t", "-c"]
PG_ENV = {**os.environ, "PGPASSWORD": "password"}

def get_db_order_count():
    """Get total orders from DB"""
    try:
        sql = f"SELECT COUNT(*) FROM restaurant_order WHERE restaurant_id={RESTAURANT_ID} AND created_at >= '{START_DATE.strftime('%Y-%m-%d')}';"
        r = subprocess.run(PG + [sql], capture_output=True, text=True, timeout=5, env=PG_ENV)
        if r.returncode == 0:
            return int(r.stdout.strip())
    except:
        pass
    return 0

# ── SHARED STATE ─────────────────────────────────────────────────────────
_slock = threading.Lock()
stats = dict(
    total_orders=0, items_ordered=0, items_skipped=0, total_revenue=0.0,
    order_errors=0, busy_waits=0, api_failures=0
)
_tlock = threading.Lock()
occupied = {}
work_q = queue.Queue()
done_slots = {}
_qlock = threading.Lock()

# Menu cache
_menu_price_cache = {}
_all_menu_ids = []
_table_ids = []

# ── REST HELPERS ─────────────────────────────────────────────────────────
_sess = _req.Session()

def RGET(url, timeout=10):
    r = _sess.get(url, timeout=timeout)
    if r.status_code != 200:
        print(f"\n❌ API ERROR: GET {url} returned {r.status_code}")
        print(f"   Response: {r.text[:200]}")
        stats["api_failures"] += 1
        return None
    return r.json() if r.text.strip() else {}

def RPOST(url, body=None, timeout=15):
    r = _sess.post(url, json=body, timeout=timeout)
    if r.status_code not in [200, 201]:
        print(f"\n❌ API ERROR: POST {url} returned {r.status_code}")
        print(f"   Response: {r.text[:200]}")
        stats["api_failures"] += 1
        return None
    return r.json() if r.text.strip() else {}

def RPATCH(url, timeout=10):
    r = _sess.patch(url, timeout=timeout)
    if r.status_code not in [200, 204]:
        print(f"\n❌ API ERROR: PATCH {url} returned {r.status_code}")
        print(f"   Response: {r.text[:200]}")
        stats["api_failures"] += 1
        return None
    return r.text if r.text.strip() else ""

# ── PROGRESS BAR ─────────────────────────────────────────────────────────
_progress_lock = threading.Lock()
_last_db_check = 0
_last_db_count = 0
_current_day = 0

def print_progress(current, total, db_count=None, current_day=None, total_days=None):
    """Print progress bar with DB verification and current day"""
    bar_width = 50
    pct = current / total if total > 0 else 0
    filled = int(bar_width * pct)
    bar = "█" * filled + "░" * (bar_width - filled)
    
    db_info = f" | DB: {db_count:,}" if db_count is not None else ""
    day_info = f" | Day {current_day}/{total_days}" if current_day is not None else ""
    sys.stdout.write(f"\r[{bar}] {current:,}/{total:,}{db_info}{day_info} ({pct*100:.1f}%)")
    sys.stdout.flush()

def db_monitor(total_slots, total_days):
    """Background thread to check DB every 2 minutes"""
    global _last_db_check, _last_db_count
    start_time = time.time()
    
    while True:
        time.sleep(120)  # Check every 2 minutes
        
        db_count = get_db_order_count()
        with _progress_lock:
            _last_db_count = db_count
        
        elapsed = time.time() - start_time
        mins = int(elapsed // 60)
        print(f"\n⏰ [{mins}m elapsed] DB check: {db_count:,} orders verified")

# ── INVENTORY HELPERS ────────────────────────────────────────────────────
def load_menu_prices():
    """Load menu item prices"""
    global _menu_price_cache, _all_menu_ids
    data = RGET(f"{BASE}/menu-items")
    if not data:
        return False
    for item in data:
        # Use sellPriceBuffer as the selling price
        _menu_price_cache[item["id"]] = item.get("sellPriceBuffer", AVG_CHK)
        _all_menu_ids.append(item["id"])
    return True

def load_tables():
    """Load table IDs"""
    global _table_ids
    data = RGET(f"{BASE}/pos/tables")
    if not data:
        return False
    _table_ids = [t["id"] for t in data]
    return True

def reset_tables():
    """Set all tables to AVAILABLE"""
    for tid in _table_ids:
        RPATCH(f"{BASE}/pos/tables/{tid}/status?status=AVAILABLE")

# ── ORDER PLACEMENT ──────────────────────────────────────────────────────
def place_order(slot, tbl_id):
    """Place order with full error checking"""
    party = slot["party_size"]
    wanted = [random.choice(_all_menu_ids) for _ in range(party)]
    
    total = sum(_menu_price_cache.get(m, AVG_CHK) for m in wanted)
    total = round(total, 2)
    
    odt = slot["date"].replace(hour=slot["hour"], minute=random.randint(0, 59), second=random.randint(0, 59))
    odt_str = odt.isoformat()
    
    # 1. Open session
    session = RPOST(f"{BASE}/pos/tables/{tbl_id}/open?guests={party}&openedAt={odt_str}", {})
    if not session:
        return False
    session_id = session.get("id")
    
    # 2. Place order
    onum = f"SIM-{odt.strftime('%Y%m%d%H%M%S')}-{random.randint(10000, 99999)}"
    lines = [{"menuItemId": m, "quantity": 1, "unitPrice": _menu_price_cache.get(m, AVG_CHK)} for m in wanted]
    
    order = RPOST(f"{BASE}/pos/orders", {
        "sessionId": session_id,
        "orderNumber": onum,
        "totalAmount": total,
        "status": "PENDING",
        "createdAt": odt_str,
        "lines": lines
    })
    if not order:
        return False
    
    order_id = order.get("id")
    
    # 3. Mark PAID
    result = RPATCH(f"{BASE}/pos/orders/{order_id}/status?status=PAID")
    if result is None:
        return False
    
    # 4. Close session
    close_min = random.randint(45, 90)
    close_dt = odt + timedelta(minutes=close_min)
    RPOST(f"{BASE}/pos/sessions/{session_id}/close?closedAt={close_dt.isoformat()}", {})
    
    # 5. Reset table
    RPATCH(f"{BASE}/pos/tables/{tbl_id}/status?status=AVAILABLE")
    
    with _slock:
        stats["total_orders"] += 1
        stats["total_revenue"] += total
        stats["items_ordered"] += len(wanted)
    
    return True

# ── WORKER ───────────────────────────────────────────────────────────────
def worker(worker_id):
    global _current_day
    while True:
        try:
            slot = work_q.get(timeout=0.5)
        except queue.Empty:
            continue
        
        if slot is None:
            work_q.task_done()
            break
        
        day_idx = slot["day_idx"]
        
        # Update current day tracker
        with _progress_lock:
            _current_day = day_idx + 1
        
        # Check if already done
        with _qlock:
            if day_idx in done_slots and slot["hour"] in done_slots[day_idx]:
                work_q.task_done()
                continue
        
        # Get free table
        free_table = None
        with _tlock:
            key = f"{slot['date'].strftime('%Y-%m-%d')}|{slot['hour']}"
            for tid in _table_ids:
                tkey = f"{key}|T{tid}"
                if tkey not in occupied:
                    free_table = tid
                    occupied[tkey] = True
                    break
        
        if not free_table:
            with _slock:
                stats["busy_waits"] += 1
            work_q.put(slot)  # Re-queue
            time.sleep(0.1)
            continue
        
        # Place order
        success = place_order(slot, free_table)
        
        if success:
            with _qlock:
                if day_idx not in done_slots:
                    done_slots[day_idx] = set()
                done_slots[day_idx].add(slot["hour"])
        
        # Release table after delay (simulated)
        with _tlock:
            key = f"{slot['date'].strftime('%Y-%m-%d')}|{slot['hour']}"
            tkey = f"{key}|T{free_table}"
            if tkey in occupied:
                del occupied[tkey]
        
        work_q.task_done()

# ── MAIN ─────────────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("🍽  RESTAURANT TRAFFIC SIMULATOR")
    print(f"   Days: {DAYS} | Start: {START_DATE.strftime('%Y-%m-%d')}")
    print(f"   API: {BASE}")
    print("=" * 60)
    
    # Load data
    print("\n📖 Loading menu prices...")
    if not load_menu_prices():
        print("❌ Failed to load menu prices")
        sys.exit(1)
    print(f"   ✓ {len(_menu_price_cache)} items")
    
    print("   Loading tables...")
    if not load_tables():
        print("❌ Failed to load tables")
        sys.exit(1)
    print(f"   ✓ {len(_table_ids)} tables")
    
    print("   Resetting tables...")
    reset_tables()
    print("   ✓ All tables AVAILABLE")
    
    # Generate slots
    print(f"\n🚶 Generating {DAYS} days of slots...")
    slots = []
    for day in range(DAYS):
        date = START_DATE + timedelta(days=day)
        is_weekend = date.weekday() >= 5
        
        for hour in list(range(LUNCH_H[0], LUNCH_H[1])) + list(range(DINNER_H[0], DINNER_H[1])):
            lambda_h = LAM_D if hour >= DINNER_H[0] else LAM_L
            if is_weekend:
                lambda_h *= WEEKEND_X
            
            arrivals = max(1, poisson(lambda_h))
            for _ in range(arrivals):
                slots.append({
                    "day_idx": day,
                    "date": date,
                    "hour": hour,
                    "party_size": random.randint(PARTY_MIN, PARTY_MAX)
                })
    
    print(f"   ✓ {len(slots)} slots")
    
    # Start DB monitor
    db_thread = threading.Thread(target=db_monitor, args=(len(slots), DAYS), daemon=True)
    db_thread.start()
    
    # Enqueue slots
    for slot in slots:
        work_q.put(slot)
    
    # Start workers
    print(f"\n⚡ Simulating (10 workers, fail-fast on API errors)...")
    workers = []
    for i in range(10):
        t = threading.Thread(target=worker, args=(i,), daemon=True)
        t.start()
        workers.append(t)
    
    # Progress monitoring
    total = len(slots)
    last_db_count = 0
    start_time = time.time()
    
    while True:
        remaining = work_q.qsize()
        done = total - remaining
        
        # Check DB count
        db_count = get_db_order_count()
        
        # Get current day
        with _progress_lock:
            current_day = _current_day
        
        print_progress(done, total, db_count, current_day, DAYS)
        
        if remaining == 0 and all(not t.is_alive() for t in workers):
            break
        
        # Check for API failures
        if stats["api_failures"] > 0:
            print(f"\n\n❌ SIMULATION FAILED: {stats['api_failures']} API errors detected")
            sys.exit(1)
        
        time.sleep(0.5)
    
    # Final stats
    elapsed = time.time() - start_time
    print("\n\n" + "=" * 60)
    print("✅ SIMULATION COMPLETE")
    print("=" * 60)
    print(f"⏱  Wall time: {elapsed:.1f}s")
    print(f"📊 Orders placed: {stats['total_orders']:,}")
    print(f"💰 Revenue: ${stats['total_revenue']:,.2f}")
    print(f"🍽  Items ordered: {stats['items_ordered']:,}")
    print(f"🔄 Busy waits: {stats['busy_waits']:,}")
    print(f"📋 DB verified: {get_db_order_count():,} orders")
    
    if stats["api_failures"] > 0:
        print(f"\n❌ API FAILURES: {stats['api_failures']}")
        sys.exit(1)
    
    print("\n✅ All API calls returned 200 OK")

if __name__ == "__main__":
    main()
