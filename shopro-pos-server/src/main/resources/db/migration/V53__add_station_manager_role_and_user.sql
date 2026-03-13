-- V53__add_station_manager_role_and_user.sql
-- Adds a new Station Manager role and a default user.

-- 1. Create Role
INSERT INTO "staff_roles" ("id", "name", "description", "version", "created_at", "updated_at")
VALUES ('00000000-0000-0000-0000-000000000110', 'STATION_MANAGER', 'Manages specific KDS stations and plate coordination', 0, NOW(), NOW());

-- 2. Assign Permissions
-- Station Manager gets all KDS permissions
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT '00000000-0000-0000-0000-000000000110', id 
FROM "staff_permissions" 
WHERE "category" = 'KDS';

-- 3. Create User
INSERT INTO "staff_member" ("id", "full_name", "pin_hash", "role", "role_id", "active", "version", "created_at", "updated_at")
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 
    'Stan Station', 
    '$2a$10$bBpcmli79wKXDjJ93QzHjOBiEieihlaJz1CTmQRCAr2jkR9SvlBQm', 
    'STATION_MANAGER', 
    '00000000-0000-0000-0000-000000000110', 
    true, 
    0, 
    NOW(), 
    NOW()
);
