#!/usr/bin/env python3
"""
Staff Clock-In/Clock-Out Simulation
Simulates staff members clocking in at the start of day and clocking out after 8 hours.
Makes actual API calls to the backend.
"""

import datetime
import random
import uuid
import requests
import json
from dataclasses import dataclass, field
from typing import List, Optional
from enum import Enum


# Configuration
API_BASE = "http://localhost:8080/api/v1"
RESTAURANT_ID = 3  # Change to your restaurant ID


class ShiftStatus(Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


@dataclass
class Staff:
    """Represents a staff member."""
    id: str  # This is the staffId (UUID)
    name: str
    role: str
    shift_start_time: Optional[datetime.time] = None
    shift_end_time: Optional[datetime.time] = None
    clock_in_time: Optional[datetime.datetime] = None
    clock_out_time: Optional[datetime.datetime] = None
    status: ShiftStatus = ShiftStatus.NOT_STARTED
    hours_worked: float = 0.0

    def clock_in(self, clock_in_time: datetime.datetime = None, restaurant_id: int = None):
        """Simulate staff clocking in via API."""
        if self.status == ShiftStatus.IN_PROGRESS:
            print(f"⚠️  {self.name} is already clocked in!")
            return False
        
        # Default to current time if not provided
        if clock_in_time is None:
            clock_in_time = datetime.datetime.now()
        
        self.clock_in_time = clock_in_time
        self.shift_start_time = clock_in_time.time()
        self.status = ShiftStatus.IN_PROGRESS
        
        # Calculate expected shift end (8 hours later)
        shift_duration = datetime.timedelta(hours=8)
        expected_end = clock_in_time + shift_duration
        self.shift_end_time = expected_end.time()
        
        # Make API call to clock in
        try:
            url = f"{API_BASE}/restaurants/{restaurant_id}/labor/employees/{self.id}/clock-in"
            params = {"clockInTime": clock_in_time.isoformat()}
            response = requests.post(url, params=params)
            if response.status_code == 200:
                print(f"✅ {self.name} ({self.role}) clocked in at {clock_in_time.strftime('%H:%M:%S')}")
                print(f"   Expected clock-out: {self.shift_end_time}")
                return True
            else:
                print(f"❌ Failed to clock in {self.name}: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Error clocking in {self.name}: {e}")
            return False

    def clock_out(self, clock_out_time: datetime.datetime = None, restaurant_id: int = None):
        """Simulate staff clocking out via API."""
        if self.status != ShiftStatus.IN_PROGRESS:
            print(f"⚠️  {self.name} is not currently clocked in!")
            return False
        
        # Default to current time if not provided
        if clock_out_time is None:
            clock_out_time = datetime.datetime.now()
        
        self.clock_out_time = clock_out_time
        
        # Calculate hours worked
        if self.clock_in_time:
            duration = clock_out_time - self.clock_in_time
            self.hours_worked = round(duration.total_seconds() / 3600, 2)
        
        self.status = ShiftStatus.COMPLETED
        
        # Make API call to clock out
        try:
            url = f"{API_BASE}/restaurants/{restaurant_id}/labor/employees/{self.id}/clock-out"
            params = {"clockOutTime": clock_out_time.isoformat()}
            response = requests.post(url, params=params)
            if response.status_code == 200:
                print(f"🚪 {self.name} ({self.role}) clocked out at {clock_out_time.strftime('%H:%M:%S')}")
                print(f"   Total hours worked: {self.hours_worked} hours")
                return True
            else:
                print(f"❌ Failed to clock out {self.name}: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Error clocking out {self.name}: {e}")
            return False

    def get_shift_info(self) -> dict:
        """Get shift information as a dictionary."""
        return {
            'name': self.name or 'Unknown',
            'role': self.role or 'HOURLY',
            'clock_in_time': self.clock_in_time.strftime('%H:%M:%S') if self.clock_in_time else None,
            'clock_out_time': self.clock_out_time.strftime('%H:%M:%S') if self.clock_out_time else None,
            'hours_worked': self.hours_worked or 0.0
        }


def get_staff_list_from_api(restaurant_id: int) -> List[Staff]:
    """Fetch staff list from API."""
    try:
        url = f"{API_BASE}/restaurants/{restaurant_id}/labor/employees"
        response = requests.get(url)
        if response.status_code == 200:
            staff_data = response.json()
            staff_list = []
            for s in staff_data:
                staff = Staff(
                    id=s.get("id", ""),
                    name=s.get("staffName") or s.get("name") or s.get("displayName") or "Unknown",
                    role=s.get("employeeType") or s.get("role") or "HOURLY",
                )
                staff_list.append(staff)
            return staff_list
        else:
            print(f"❌ Failed to get staff: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error fetching staff: {e}")
        return []


def simulate_day(staff_list: List[Staff], restaurant_id: int, simulation_date: datetime.date = None):
    """
    Simulate a full day of staff clock-in and clock-out.
    """
    if simulation_date is None:
        simulation_date = datetime.date.today()
    
    print("=" * 60)
    print(f"🏪 SIMULATING STAFF DAY")
    print(f"📅 Date: {simulation_date.strftime('%A, %B %d, %Y')}")
    print("=" * 60)
    
    # Define shift start time (e.g., 9 AM)
    shift_start_hour = 9
    shift_start_minute = random.randint(0, 59)
    
    print(f"\n📋 Staff Roster: {len(staff_list)} employees\n")
    
    # Phase 1: Morning Clock-In
    print("=" * 60)
    print("🌅 MORNING SHIFT - All staff clocking in")
    print("=" * 60)
    
    for staff in staff_list:
        # Simulate slight variation in arrival time (±15 minutes)
        minute_offset = random.randint(-15, 15)
        
        # Create base shift start time
        base_shift_start = datetime.datetime(
            simulation_date.year,
            simulation_date.month,
            simulation_date.day,
            shift_start_hour,
            shift_start_minute
        )
        # Add offset
        clock_in_time = base_shift_start + datetime.timedelta(minutes=minute_offset)
        staff.clock_in(clock_in_time, restaurant_id)
        print()
    
    # Show current clocked-in staff
    print("\n" + "=" * 60)
    print("📱 Current clocked-in staff (from API):")
    print("=" * 60)
    try:
        url = f"{API_BASE}/restaurants/{restaurant_id}/labor/clocked-in"
        response = requests.get(url)
        if response.status_code == 200:
            clocked_in = response.json()
            print(f"Found {len(clocked_in)} staff clocked in:")
            for c in clocked_in:
                name = c.get("staff", {}).get("displayName", "Unknown")
                clock_in = c.get("clockIn", "")
                print(f"  - {name} (since {clock_in})")
    except Exception as e:
        print(f"Error checking clocked-in: {e}")
    
    print("\n" + "=" * 60)
    print("⏰ Staff working... (simulating 8 hour shift)")
    print("=" * 60)
    
    # Phase 2: End of shift - Clock out after 8 hours
    print("\n" + "=" * 60)
    print("🌙 EVENING SHIFT - All staff clocking out after 8 hours")
    print("=" * 60)
    
    for staff in staff_list:
        if staff.clock_in_time:
            # Calculate exact 8-hour mark
            shift_end_datetime = staff.clock_in_time + datetime.timedelta(hours=8)
            
            # Add slight variation (±10 minutes)
            minute_offset = random.randint(-10, 10)
            actual_clock_out = shift_end_datetime + datetime.timedelta(minutes=minute_offset)
            
            staff.clock_out(actual_clock_out, restaurant_id)
            print()
    
    # Summary
    print("=" * 60)
    print("📊 DAILY SUMMARY")
    print("=" * 60)
    
    total_hours = 0
    for staff in staff_list:
        info = staff.get_shift_info()
        total_hours += info['hours_worked']
        print(f"  {info['name'] or 'Unknown':20} | {info['role'] or 'HOURLY':15} | {info['hours_worked'] or 0.0:5.2f} hrs")
    
    print("-" * 60)
    print(f"  Total hours worked by all staff: {total_hours:.2f} hours")
    print(f"  Average hours per staff: {total_hours/len(staff_list):.2f} hours")
    print("=" * 60)


def clock_in_all_now(staff_list: List[Staff], restaurant_id: int):
    """Clock in all staff right now."""
    print("=" * 60)
    print("⏰ Clocking in all staff NOW")
    print("=" * 60)
    
    now = datetime.datetime.now()
    for staff in staff_list:
        staff.clock_in(now, restaurant_id)
        print()


if __name__ == "__main__":
    import sys
    
    # Get staff from API
    print("📥 Fetching staff from API...")
    staff_list = get_staff_list_from_api(RESTAURANT_ID)
    
    if not staff_list:
        print("❌ No staff found. Make sure the backend is running.")
        exit(1)
    
    print(f"✅ Found {len(staff_list)} staff members\n")
    
    if len(sys.argv) > 1 and sys.argv[1] == "--clock-in":
        # Just clock everyone in now
        clock_in_all_now(staff_list, RESTAURANT_ID)
    elif len(sys.argv) > 1 and sys.argv[1] == "--clock-in-test":
        # Clock in a few staff for testing
        print("🧪 Clocking in first 3 staff for testing...")
        for staff in staff_list[:3]:
            now = datetime.datetime.now()
            staff.clock_in(now, RESTAURANT_ID)
    else:
        # Run full day simulation
        simulate_day(staff_list, RESTAURANT_ID)
    
    print("\n" + "=" * 60)
    print("To just clock in everyone now: python staff_simulation.py --clock-in")
    print("To test with a few staff: python staff_simulation.py --clock-in-test")
    print("=" * 60)
