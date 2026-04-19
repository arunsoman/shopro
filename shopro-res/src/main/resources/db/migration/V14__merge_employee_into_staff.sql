-- ============================================================
-- V14: Merge Employee into Staff Entity
-- ============================================================
-- 1. Extend Staff table with labor fields
-- 2. Migrate data from employee to staff (name match)
-- 3. Create missing staff records for orphans
-- 4. Align foreign keys in dependent tables (Labor, Shifts, HACCP, Orders)
-- 5. Migrate attendance history to staff_shift
-- 6. Cleanup obsolete tables
-- ============================================================

-- 1. EXTEND STAFF TABLE
ALTER TABLE staff ADD COLUMN employee_type VARCHAR(20);
ALTER TABLE staff ADD COLUMN annual_salary NUMERIC(12,2);

-- 2. MIGRATE DATA (NAME MATCH)
UPDATE staff s
SET employee_type = e.employee_type,
    annual_salary = e.annual_salary,
    hourly_rate = COALESCE(s.hourly_rate, e.hourly_rate)
FROM employee e
WHERE LOWER(s.display_name) = LOWER(e.name)
  AND s.restaurant_id = e.restaurant_id;

-- 3. CREATE MISSING STAFF RECORDS (ORPHANS)
-- Migrated orphans are set to 'LINE_COOK' role and inactive by default.
INSERT INTO staff (
    staff_id, restaurant_id, display_name, role, pin_hash, pin_length, 
    is_active, shift_active, hourly_rate, employee_type, annual_salary, 
    created_at, updated_at
)
SELECT 
    gen_random_uuid(), 
    e.restaurant_id, 
    e.name, 
    'LINE_COOK', 
    'INVALID', 4,
    false, false, 
    e.hourly_rate,
    e.employee_type,
    e.annual_salary,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM employee e
WHERE NOT EXISTS (
    SELECT 1 FROM staff s 
    WHERE LOWER(s.display_name) = LOWER(e.name) 
      AND s.restaurant_id = e.restaurant_id
);

-- 4. ALIGN FOREIGN KEYS IN DEPENDENT TABLES

-- Employee Labor Record
ALTER TABLE employee_labor_record ADD COLUMN staff_id UUID;
UPDATE employee_labor_record elr
SET staff_id = s.staff_id
FROM employee e
JOIN staff s ON LOWER(s.display_name) = LOWER(e.name) AND s.restaurant_id = e.restaurant_id
WHERE elr.employee_id = e.id;

-- Scheduled Shift
ALTER TABLE scheduled_shift ADD COLUMN staff_id UUID;
UPDATE scheduled_shift ss
SET staff_id = s.staff_id
FROM employee e
JOIN staff s ON LOWER(s.display_name) = LOWER(e.name) AND s.restaurant_id = e.restaurant_id
WHERE ss.employee_id = e.id;

-- HACCP Log
ALTER TABLE haccp_log ADD COLUMN staff_id UUID;
UPDATE haccp_log hl
SET staff_id = s.staff_id
FROM employee e
JOIN staff s ON LOWER(s.display_name) = LOWER(e.name) AND s.restaurant_id = e.restaurant_id
WHERE hl.employee_id = e.id;

-- Orders (void_employee_id)
ALTER TABLE restaurant_order ADD COLUMN void_staff_id UUID;
UPDATE restaurant_order ro
SET void_staff_id = s.staff_id
FROM employee e
JOIN staff s ON LOWER(s.display_name) = LOWER(e.name) AND s.restaurant_id = e.restaurant_id
WHERE ro.void_employee_id = e.id;

-- Inventory Waste Registry
ALTER TABLE inventory_waste_registry ADD COLUMN staff_id UUID;
UPDATE inventory_waste_registry iwr
SET staff_id = s.staff_id
FROM employee e
JOIN staff s ON LOWER(s.display_name) = LOWER(e.name) AND s.restaurant_id = e.restaurant_id
WHERE iwr.employee_id = e.id;

-- 5. MIGRATE ATTENDANCE HISTORY
INSERT INTO staff_shift (
    shift_id, staff_id, restaurant_id, clock_in, clock_out, 
    is_active, duration_minutes, created_at
)
SELECT 
    gen_random_uuid(),
    s.staff_id,
    ea.restaurant_id,
    ea.clock_in_time,
    ea.clock_out_time,
    (ea.status = 'ACTIVE'),
    CASE 
        WHEN ea.clock_out_time IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (ea.clock_out_time - ea.clock_in_time))/60 
        ELSE 0 
    END,
    ea.created_at
FROM employee_attendance ea
JOIN employee e ON ea.employee_id = e.id
JOIN staff s ON LOWER(s.display_name) = LOWER(e.name) AND s.restaurant_id = e.restaurant_id;

-- 6. CLEANUP
-- Set NOT NULL constraints on new staff_id columns where needed
ALTER TABLE employee_labor_record ALTER COLUMN staff_id SET NOT NULL;
ALTER TABLE scheduled_shift ALTER COLUMN staff_id SET NOT NULL;

-- Drop obsolete columns
ALTER TABLE employee_labor_record DROP COLUMN employee_id;
ALTER TABLE scheduled_shift DROP COLUMN employee_id;
ALTER TABLE haccp_log DROP COLUMN employee_id;
ALTER TABLE restaurant_order DROP COLUMN void_employee_id;
ALTER TABLE inventory_waste_registry DROP COLUMN employee_id;

-- Drop obsolete tables
DROP TABLE IF EXISTS employee_attendance;
DROP TABLE IF EXISTS employee CASCADE;
