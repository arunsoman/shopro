-- V21__comprehensive_roles_and_permissions.sql
-- Expands the default permission set and completes the role taxonomy.

-- 1. Additional Granular Permissions
INSERT INTO staff_permissions (id, name, category, description, version) VALUES
-- KDS
(gen_random_uuid(), 'KDS:VIEW', 'KDS', 'Can view the kitchen display system', 0),
(gen_random_uuid(), 'KDS:COMPLETE', 'KDS', 'Can mark items as ready/completed', 0),
(gen_random_uuid(), 'KDS:PRIORITIZE', 'KDS', 'Can change order priority in kitchen', 0),
-- Inventory
(gen_random_uuid(), 'INVENTORY:VIEW', 'INVENTORY', 'Can view stock levels', 0),
(gen_random_uuid(), 'INVENTORY:EDIT', 'INVENTORY', 'Can adjust stock levels manually', 0),
(gen_random_uuid(), 'INVENTORY:PO_CREATE', 'INVENTORY', 'Can create purchase orders', 0),
-- CRM
(gen_random_uuid(), 'CRM:VIEW', 'CRM', 'Can view customer profiles', 0),
(gen_random_uuid(), 'CRM:EDIT', 'CRM', 'Can edit customer loyalty data', 0),
-- Advanced Floor
(gen_random_uuid(), 'FLOOR:OVERRIDE', 'FLOOR', 'Can unlock tables or override guards', 0);

-- 2. Expand Roles
INSERT INTO staff_roles (id, name, description, version) VALUES
('00000000-0000-0000-0000-000000000004', 'GENERAL_MANAGER', 'Store operations and limited financial oversight', 0),
('00000000-0000-0000-0000-000000000005', 'HEAD_CHEF', 'Kitchen and inventory management', 0),
('00000000-0000-0000-0000-000000000006', 'ASSISTANT_MANAGER', 'Supports daily operations and staff coordination', 0),
('00000000-0000-0000-0000-000000000007', 'FB_MANAGER', 'Food and beverage operations', 0),
('00000000-0000-0000-0000-000000000008', 'KITCHEN_MANAGER', 'Back of house business side', 0),
('00000000-0000-0000-0000-000000000101', 'SENIOR_SERVER', 'Floor supervisor with override privileges', 0),
('00000000-0000-0000-0000-000000000102', 'JUNIOR_SERVER', 'Standard table service', 0),
('00000000-0000-0000-0000-000000000103', 'RUNNER', 'Food delivery and table clearing only', 0),
('00000000-0000-0000-0000-000000000104', 'MAITRE_D', 'Directs dining room flow', 0),
('00000000-0000-0000-0000-000000000105', 'HOST', 'Greets and seats guests', 0),
('00000000-0000-0000-0000-000000000106', 'BARTENDER', 'Drink preparation and bar service', 0),
('00000000-0000-0000-0000-000000000107', 'BUSSER', 'Table clearing and basic FOH support', 0),
('00000000-0000-0000-0000-000000000201', 'EXECUTIVE_CHEF', 'Overall culinary operations', 0),
('00000000-0000-0000-0000-000000000202', 'SOUS_CHEF', 'Second-in-command in kitchen', 0),
('00000000-0000-0000-0000-000000000203', 'CHEF_DE_PARTIE', 'Station chef', 0),
('00000000-0000-0000-0000-000000000204', 'LINE_COOK', 'Executes dishes on line', 0),
('00000000-0000-0000-0000-000000000205', 'PREP_COOK', 'Prepares ingredients', 0),
('00000000-0000-0000-0000-000000000206', 'DISHWASHER', 'Cleanliness and utility', 0);

-- 3. Detailed Mappings
-- GENERAL_MANAGER (Inherits from MANAGER if we had multi-level, but here we just assign perms)
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000004', id FROM staff_permissions 
WHERE name NOT IN ('ADMIN:PIN_RESET', 'REPORT:FULL_FINANCIAL');

-- HEAD_CHEF
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000005', id FROM staff_permissions 
WHERE category IN ('KDS', 'INVENTORY');

-- SENIOR_SERVER
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000101', id FROM staff_permissions 
WHERE name IN ('ORDER:CREATE', 'ORDER:VIEW_ALL', 'ORDER:VOID_ITEM', 'PAYMENT:PROCESS', 'PAYMENT:DISCOUNT', 'FLOOR:TABLE_ASSIGN', 'FLOOR:OVERRIDE', 'KDS:VIEW');

-- JUNIOR_SERVER
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000102', id FROM staff_permissions 
WHERE name IN ('ORDER:CREATE', 'ORDER:VIEW_OWN', 'PAYMENT:PROCESS', 'KDS:VIEW');

-- RUNNER
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000103', id FROM staff_permissions 
WHERE name IN ('KDS:VIEW', 'KDS:COMPLETE');

-- ASSISTANT_MANAGER
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000006', id FROM staff_permissions 
WHERE name NOT IN ('ADMIN:PIN_RESET', 'REPORT:FULL_FINANCIAL', 'ADMIN:SYSTEM_SETTINGS');

-- FB_MANAGER
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000007', id FROM staff_permissions 
WHERE name IN ('ORDER:VIEW_ALL', 'INVENTORY:VIEW', 'CRM:VIEW');

-- KITCHEN_MANAGER
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000008', id FROM staff_permissions 
WHERE category IN ('KDS', 'INVENTORY');

-- MAITRE_D
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000104', id FROM staff_permissions 
WHERE name IN ('FLOOR:TABLE_ASSIGN', 'FLOOR:OVERRIDE', 'ORDER:VIEW_ALL', 'CRM:VIEW');

-- HOST
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000105', id FROM staff_permissions 
WHERE name IN ('FLOOR:TABLE_ASSIGN', 'CRM:VIEW');

-- BARTENDER
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000106', id FROM staff_permissions 
WHERE name IN ('ORDER:CREATE', 'ORDER:VIEW_OWN', 'PAYMENT:PROCESS', 'KDS:VIEW');

-- EXECUTIVE_CHEF
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000201', id FROM staff_permissions 
WHERE category IN ('KDS', 'INVENTORY');

-- SOUS_CHEF
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000202', id FROM staff_permissions 
WHERE name IN ('KDS:VIEW', 'KDS:COMPLETE', 'KDS:PRIORITIZE', 'INVENTORY:VIEW');

-- CHEF_DE_PARTIE
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000203', id FROM staff_permissions 
WHERE name IN ('KDS:VIEW', 'KDS:COMPLETE');

-- LINE_COOK
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000204', id FROM staff_permissions 
WHERE name IN ('KDS:VIEW', 'KDS:COMPLETE');

-- 4. Backfill existing staff members to precise roles (Overriding V20 defaults)
UPDATE staff_member SET role_id = '00000000-0000-0000-0000-000000000105', role = 'HOST' WHERE full_name = 'Hannah Host';
UPDATE staff_member SET role_id = '00000000-0000-0000-0000-000000000101', role = 'SENIOR_SERVER' WHERE full_name = 'Sam Server';
UPDATE staff_member SET role_id = '00000000-0000-0000-0000-000000000106', role = 'BARTENDER' WHERE full_name = 'Carlos Cashier';
UPDATE staff_member SET role_id = '00000000-0000-0000-0000-000000000107', role = 'BUSSER' WHERE full_name = 'Brie Busser';
UPDATE staff_member SET role_id = '00000000-0000-0000-0000-000000000004', role = 'GENERAL_MANAGER' WHERE full_name = 'Maria Manager';
UPDATE staff_member SET role_id = '00000000-0000-0000-0000-000000000001', role = 'OWNER' WHERE full_name = 'Alex Owner';
