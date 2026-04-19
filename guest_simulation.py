import requests
import json
import random
import sys

BASE_URL = "http://localhost:8080/api/v1/restaurants/{}/pos"
REST_ID = 1
GUESTS = 2

def log(msg, data=None):
    print(f"\n>>> {msg}")
    if data:
        print(json.dumps(data, indent=2))

def simulate():
    base_url = BASE_URL.format(REST_ID)
    
    # 1. Find Available Tables
    log(f"Step 1: Checking available tables for {GUESTS} guests...")
    resp = requests.get(f"{base_url}/tables/available/{GUESTS}")
    if resp.status_code != 200:
        print(f"Failed to get tables: {resp.text}")
        return

    tables = resp.json()
    if not tables:
        print("No tables available.")
        return
    
    table = tables[0]
    table_id = table['id']
    log(f"Found table {table['tableNumber']} (ID: {table_id})")

    # 2. Open Table
    log(f"Step 2: Opening table {table_id}...")
    resp = requests.post(f"{base_url}/tables/{table_id}/open", params={"guests": GUESTS})
    if resp.status_code != 200:
        print(f"Failed to open table: {resp.text}")
        return
    
    session = resp.json()
    session_id = session['id']
    log(f"Table opened. Session ID: {session_id}")

    # 3. Get Menu Items
    log("Step 3: Fetching menu items...")
    resp = requests.get(f"{base_url}/menu-items")
    if resp.status_code != 200:
        print(f"Failed to get menu: {resp.text}")
        return
    
    menu = resp.json()
    if not menu:
        print("Menu is empty.")
        return
    
    # Pick a random item
    item = random.choice(menu)
    log(f"Selected item: {item['name']} @ {item['sellPrice']}")

    # 4. Place Order
    log("Step 4: Placing order...")
    order_payload = {
        "sessionId": session_id,
        "restaurantId": REST_ID,
        "lines": [{
            "menuItemId": item['id'],
            "quantity": 1,
            "unitPrice": item['sellPrice'],
            "subtotal": item['sellPrice']
        }]
    }
    resp = requests.post(f"{base_url}/orders", json=order_payload)
    if resp.status_code != 200:
        print(f"Failed to place order: {resp.text}")
        return
    
    order = resp.json()
    order_id = order['id']
    log(f"Order placed. Order ID: {order_id}", order)

    # 5. Pay
    log(f"Step 5: Paying for order {order_id} at table {table_id}...")
    resp = requests.patch(f"{base_url}/tables/{table_id}/pay/{order_id}")
    if resp.status_code != 200:
        print(f"Payment failed: {resp.text}")
        return
    log("Payment successful. Table status updated to DIRTY.")

    # 6. Clean Table
    log(f"Step 6: Cleaning table {table_id}...")
    resp = requests.patch(f"{base_url}/tables/{table_id}/clean")
    if resp.status_code != 200:
        print(f"Cleaning failed: {resp.text}")
        return
    log("Table cleaned and now AVAILABLE.")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        REST_ID = int(sys.argv[1])
    simulate()
