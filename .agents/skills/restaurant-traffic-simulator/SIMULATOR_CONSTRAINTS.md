# Restaurant Traffic Simulator - Constraints & Rules

## ⚠️ CRITICAL: REST API ONLY

**The simulator MUST ONLY use REST API endpoints. NO direct database access is allowed.**

### Prohibited Operations
- ❌ **NO psql commands** from the simulator
- ❌ **NO direct database queries** (SELECT, UPDATE, INSERT, DELETE)
- ❌ **NO database connection strings** in simulator code
- ❌ **NO bypassing of business logic** via direct DB manipulation

### Allowed Operations
- ✅ **HTTP GET** requests to fetch data
- ✅ **HTTP POST** requests to create resources
- ✅ **HTTP PATCH** requests to update resources
- ✅ **HTTP DELETE** requests to remove resources
- ✅ **Standard Python libraries** (requests, json, datetime, threading, etc.)

## Why This Matters

1. **Business Logic Enforcement**: REST APIs enforce validation, triggers, and business rules
2. **Audit Trail**: All operations are logged and traceable
3. **Data Integrity**: Prevents race conditions and inconsistent states
4. **Production Parity**: Simulator behavior matches real-world API usage
5. **Testing Validity**: Tests the actual system, not a mocked version

## Current Violations to Fix

### 1. `procure()` Function - Uses psql ❌
```python
# WRONG - Direct DB access
sql = "UPDATE ingredient SET on_hand = on_hand + 200 WHERE ..."
ok, _ = psql(sql)
```

**Solution**: Use REST endpoint for purchase orders or skip procurement entirely

### 2. `load_staff_ids()` - Uses psql ❌
```python
# WRONG - Direct DB access
ok, data = psql("SELECT id, name, employee_type FROM employee ...")
```

**Solution**: Use `/employees` REST endpoint (if available) or cache from bootstrap

### 3. `load_table_ids()` - Uses psql ❌
```python
# WRONG - Direct DB access  
ok, cnt = psql("SELECT COUNT(*) FROM dining_table ...")
```

**Solution**: Already fixed - uses `/pos/tables` REST endpoint ✅

### 4. EOD Audit - Uses psql ❌
```python
# WRONG - Direct DB access
ok, data = psql("SELECT ... FROM inventory_ingredient_ledger ...")
```

**Solution**: Use `/inventory/ledger` or `/inventory/stats` REST endpoints

## REST Endpoint Alternatives

### Inventory Management
| Operation | REST Endpoint | Method |
|-----------|--------------|--------|
| Get ingredient on-hand | `/ingredients` | GET |
| Get low-stock items | `/ingredients/low-stock` | GET |
| Get inventory stats | `/inventory/stats` | GET |
| Create purchase order | `/purchase-orders` | POST |
| Receive shipment | `/purchase-orders/{id}/receive` | POST |
| Get ledger entries | `/inventory/ledger` | GET |

### Staff Management
| Operation | REST Endpoint | Method |
|-----------|--------------|--------|
| Get employees | `/prime-cost/labor/employees` | GET |
| Clock in | `/prime-cost/employees/{id}/clock-in` | POST |
| Clock out | `/prime-cost/employees/{id}/clock-out` | POST |
| Get attendance | `/prime-cost/labor/attendance` | GET |

### Table Management
| Operation | REST Endpoint | Method |
|-----------|--------------|--------|
| Get tables | `/pos/tables` | GET |
| Open table | `/pos/tables/{id}/open` | POST |
| Update status | `/pos/tables/{id}/status` | PATCH |

### Order Management
| Operation | REST Endpoint | Method |
|-----------|--------------|--------|
| Place order | `/pos/orders` | POST |
| Update status | `/pos/orders/{id}/status` | PATCH |
| Void order | `/pos/orders/{id}/void` | PATCH |

## Implementation Guidelines

### 1. Use requests.Session() for Efficiency
```python
_sess = requests.Session()
_sess.headers.update({'Content-Type': 'application/json'})

def RGET(url):
    r = _sess.get(url, timeout=10)
    return r.json() if r.status_code == 200 else None

def RPOST(url, body):
    r = _sess.post(url, json=body, timeout=15)
    return r.text
```

### 2. Implement Caching to Reduce API Calls
```python
_cache = {}
_cache_ts = 0

def get_cached_data():
    if time.time() - _cache_ts > 60 or not _cache:
        _cache = RGET(f"{BASE}/endpoint")
        _cache_ts = time.time()
    return _cache
```

### 3. Handle Missing Endpoints Gracefully
If a REST endpoint doesn't exist:
1. **Document the gap** in MISSING_ENDPOINTS.md
2. **Skip the feature** or use reasonable defaults
3. **DO NOT** fall back to direct DB access

### 4. Log All API Calls for Debugging
```python
def RPOST(url, body):
    print(f"[API] POST {url[:80]}...")
    r = _sess.post(url, json=body)
    print(f"[API] ✓ {r.status_code}")
    return r.text
```

## Compliance Checklist

Before committing any simulator changes, verify:
- [ ] No `psql` commands in code
- [ ] No `SELECT`, `UPDATE`, `INSERT`, `DELETE` SQL statements
- [ ] All data fetches use `RGET()` or `requests.get()`
- [ ] All data writes use `RPOST()`, `RPATCH()`, or `requests.post/patch()`
- [ ] No database connection strings or credentials
- [ ] Error handling for API failures (timeouts, 404s, etc.)

## Violation Examples

### ❌ WRONG - Direct DB Access
```python
def get_ingredients():
    ok, data = psql("SELECT * FROM ingredient WHERE restaurant_id = 3")
    return parse_psql_output(data)
```

### ✅ CORRECT - REST API
```python
def get_ingredients():
    return RGET(f"{BASE}/ingredients") or []
```

### ❌ WRONG - Direct DB Update
```python
def restock_ingredient(iid, qty):
    sql = f"UPDATE ingredient SET on_hand = on_hand + {qty} WHERE id = {iid}"
    psql(sql)
```

### ✅ CORRECT - REST API (Purchase Order)
```python
def restock_ingredient(iid, qty):
    # Create PO
    po = RPOST(f"{BASE}/purchase-orders", {
        "ingredientId": iid,
        "quantity": qty,
        "supplierId": 1
    })
    # Receive shipment
    RPOST(f"{BASE}/purchase-orders/{po['id']}/receive", {})
```

## Enforcement

This file should be **included as context** in every simulator development session to ensure compliance.

**If you see psql usage in the simulator, it MUST be replaced with REST API calls immediately.**

## Last Updated
2026-04-18 - Created to enforce REST-only architecture
