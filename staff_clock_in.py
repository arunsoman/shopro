#!/usr/bin/env python3
"""
Staff Clock-In Script
Clocks in all staff members at the current time.
"""

import datetime
import requests
import sys


# Configuration
API_BASE = "http://localhost:8080/api/v1"
RESTAURANT_ID = 3  # Change to your restaurant ID


def get_staff_list_from_api(restaurant_id: int):
    """Fetch staff list from API."""
    try:
        url = f"{API_BASE}/restaurants/{restaurant_id}/labor/employees"
        response = requests.get(url)
        if response.status_code == 200:
            staff_data = response.json()
            staff_list = []
            for s in staff_data:
                staff = {
                    'id': s.get("id", ""),
                    'name': s.get("staffName") or s.get("name") or s.get("displayName") or "Unknown",
                    'role': s.get("employeeType") or s.get("role") or "HOURLY",
                }
                staff_list.append(staff)
            return staff_list
        else:
            print(f"❌ Failed to get staff: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error fetching staff: {e}")
        return []


def clock_in_staff(staff_id: str, name: str, clock_in_time: datetime.datetime, restaurant_id: int) -> bool:
    """Clock in a single staff member via API."""
    try:
        url = f"{API_BASE}/restaurants/{restaurant_id}/labor/employees/{staff_id}/clock-in"
        params = {"clockInTime": clock_in_time.isoformat()}
        response = requests.post(url, params=params)
        
        if response.status_code == 200:
            print(f"✅ {name} clocked in at {clock_in_time.strftime('%H:%M:%S')}")
            return True
        else:
            print(f"❌ Failed to clock in {name}: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error clocking in {name}: {e}")
        return False


def clock_in_all_staff(restaurant_id: int, clock_in_time: datetime.datetime = None):
    """Clock in all staff members."""
    if clock_in_time is None:
        clock_in_time = datetime.datetime.now()
    
    print("=" * 60)
    print("⏰ STAFF CLOCK-IN")
    print("=" * 60)
    print(f"📅 Date: {clock_in_time.strftime('%A, %B %d, %Y')}")
    print(f"🕐 Time: {clock_in_time.strftime('%H:%M:%S')}")
    print("=" * 60)
    
    # Get staff list
    print("\n📥 Fetching staff list...")
    staff_list = get_staff_list_from_api(restaurant_id)
    
    if not staff_list:
        print("❌ No staff found. Make sure the backend is running.")
        return False
    
    print(f"✅ Found {len(staff_list)} staff members\n")
    
    # Clock in all staff
    print("=" * 60)
    print("🌅 Clocking in all staff...")
    print("=" * 60)
    
    success_count = 0
    fail_count = 0
    
    for staff in staff_list:
        success = clock_in_staff(staff['id'], staff['name'], clock_in_time, restaurant_id)
        if success:
            success_count += 1
        else:
            fail_count += 1
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 CLOCK-IN SUMMARY")
    print("=" * 60)
    print(f"  Total staff: {len(staff_list)}")
    print(f"  Successfully clocked in: {success_count}")
    print(f"  Failed: {fail_count}")
    print("=" * 60)
    
    # Verify clocked-in staff
    print("\n📱 Verifying clocked-in staff...")
    try:
        url = f"{API_BASE}/restaurants/{restaurant_id}/labor/clocked-in"
        response = requests.get(url)
        if response.status_code == 200:
            clocked_in = response.json()
            print(f"✅ {len(clocked_in)} staff currently clocked in:")
            for c in clocked_in:
                name = c.get("staff", {}).get("displayName", "Unknown")
                clock_in = c.get("clockIn", "")
                print(f"  - {name} (since {clock_in})")
    except Exception as e:
        print(f"Error checking clocked-in: {e}")
    
    return success_count == len(staff_list)


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Clock in all staff members")
    parser.add_argument("--restaurant-id", type=int, default=RESTAURANT_ID,
                        help=f"Restaurant ID (default: {RESTAURANT_ID})")
    parser.add_argument("--time", type=str, default=None,
                        help="Clock-in time in ISO format (default: now)")
    
    args = parser.parse_args()
    
    # Parse custom time if provided
    clock_in_time = None
    if args.time:
        try:
            clock_in_time = datetime.datetime.fromisoformat(args.time)
        except ValueError:
            print(f"❌ Invalid time format: {args.time}")
            print("Use ISO format, e.g., 2026-04-20T09:00:00")
            sys.exit(1)
    
    success = clock_in_all_staff(args.restaurant_id, clock_in_time)
    sys.exit(0 if success else 1)
