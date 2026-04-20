#!/usr/bin/env python3
"""
Staff Clock-Out Script
Clocks out all currently clocked-in staff members.
"""

import datetime
import requests
import sys


# Configuration
API_BASE = "http://localhost:8080/api/v1"
RESTAURANT_ID = 3  # Change to your restaurant ID


def get_clocked_in_staff(restaurant_id: int):
    """Fetch currently clocked-in staff from API."""
    try:
        url = f"{API_BASE}/restaurants/{restaurant_id}/labor/clocked-in"
        response = requests.get(url)
        if response.status_code == 200:
            clocked_in_data = response.json()
            staff_list = []
            for c in clocked_in_data:
                staff_info = c.get("staff", {})
                staff = {
                    'id': staff_info.get("id", ""),
                    'name': staff_info.get("displayName") or staff_info.get("staffName") or staff_info.get("name") or "Unknown",
                    'role': staff_info.get("employeeType") or staff_info.get("role") or "HOURLY",
                    'clock_in_time': c.get("clockIn"),
                }
                staff_list.append(staff)
            return staff_list
        else:
            print(f"❌ Failed to get clocked-in staff: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error fetching clocked-in staff: {e}")
        return []


def clock_out_staff(staff_id: str, name: str, clock_out_time: datetime.datetime, restaurant_id: int) -> bool:
    """Clock out a single staff member via API."""
    try:
        url = f"{API_BASE}/restaurants/{restaurant_id}/labor/employees/{staff_id}/clock-out"
        params = {"clockOutTime": clock_out_time.isoformat()}
        response = requests.post(url, params=params)
        
        if response.status_code == 200:
            print(f"🚪 {name} clocked out at {clock_out_time.strftime('%H:%M:%S')}")
            return True
        else:
            print(f"❌ Failed to clock out {name}: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error clocking out {name}: {e}")
        return False


def clock_out_all_staff(restaurant_id: int, clock_out_time: datetime.datetime = None):
    """Clock out all currently clocked-in staff members."""
    if clock_out_time is None:
        clock_out_time = datetime.datetime.now()
    
    print("=" * 60)
    print("🌙 STAFF CLOCK-OUT")
    print("=" * 60)
    print(f"📅 Date: {clock_out_time.strftime('%A, %B %d, %Y')}")
    print(f"🕐 Time: {clock_out_time.strftime('%H:%M:%S')}")
    print("=" * 60)
    
    # Get clocked-in staff
    print("\n📥 Fetching currently clocked-in staff...")
    staff_list = get_clocked_in_staff(restaurant_id)
    
    if not staff_list:
        print("⚠️  No staff currently clocked in.")
        return True
    
    print(f"✅ Found {len(staff_list)} staff members clocked in\n")
    
    # Show current staff
    print("Current clocked-in staff:")
    for staff in staff_list:
        clock_in = staff['clock_in_time']
        if clock_in:
            try:
                clock_in_dt = datetime.datetime.fromisoformat(clock_in.replace('Z', '+00:00'))
                hours_worked = (clock_out_time - clock_in_dt).total_seconds() / 3600
                print(f"  - {staff['name']} (clocked in at {clock_in_dt.strftime('%H:%M:%S')}, ~{hours_worked:.2f} hrs)")
            except:
                print(f"  - {staff['name']} (clocked in at {clock_in})")
        else:
            print(f"  - {staff['name']}")
    
    # Clock out all staff
    print("\n" + "=" * 60)
    print("🏠 Clocking out all staff...")
    print("=" * 60)
    
    success_count = 0
    fail_count = 0
    
    for staff in staff_list:
        success = clock_out_staff(staff['id'], staff['name'], clock_out_time, restaurant_id)
        if success:
            success_count += 1
        else:
            fail_count += 1
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 CLOCK-OUT SUMMARY")
    print("=" * 60)
    print(f"  Total staff clocked in: {len(staff_list)}")
    print(f"  Successfully clocked out: {success_count}")
    print(f"  Failed: {fail_count}")
    print("=" * 60)
    
    # Verify no one is clocked in
    print("\n📱 Verifying clocked-in staff...")
    try:
        url = f"{API_BASE}/restaurants/{restaurant_id}/labor/clocked-in"
        response = requests.get(url)
        if response.status_code == 200:
            clocked_in = response.json()
            if len(clocked_in) == 0:
                print("✅ All staff successfully clocked out!")
            else:
                print(f"⚠️  {len(clocked_in)} staff still clocked in:")
                for c in clocked_in:
                    name = c.get("staff", {}).get("displayName", "Unknown")
                    print(f"  - {name}")
    except Exception as e:
        print(f"Error checking clocked-in: {e}")
    
    return success_count == len(staff_list)


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Clock out all staff members")
    parser.add_argument("--restaurant-id", type=int, default=RESTAURANT_ID,
                        help=f"Restaurant ID (default: {RESTAURANT_ID})")
    parser.add_argument("--time", type=str, default=None,
                        help="Clock-out time in ISO format (default: now)")
    
    args = parser.parse_args()
    
    # Parse custom time if provided
    clock_out_time = None
    if args.time:
        try:
            clock_out_time = datetime.datetime.fromisoformat(args.time)
        except ValueError:
            print(f"❌ Invalid time format: {args.time}")
            print("Use ISO format, e.g., 2026-04-20T17:00:00")
            sys.exit(1)
    
    success = clock_out_all_staff(args.restaurant_id, clock_out_time)
    sys.exit(0 if success else 1)
