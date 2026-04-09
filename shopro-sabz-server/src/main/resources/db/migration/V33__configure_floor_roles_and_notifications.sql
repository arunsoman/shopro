-- V33__configure_floor_roles_and_notifications.sql

-- 1. Restrict HOST role permissions
DELETE FROM role_permissions WHERE role_id = '00000000-0000-0000-0000-000000000105';
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000105', id FROM staff_permissions WHERE name = 'FLOOR:TABLE_ASSIGN';

-- 2. Ensure BUSSER role permissions
-- Bussers need to see the floor plan and mark tables as clean
DELETE FROM role_permissions WHERE role_id = '00000000-0000-0000-0000-000000000107';
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000107', id FROM staff_permissions 
WHERE name IN ('FLOOR:VIEW', 'FLOOR:TABLE_ASSIGN');

-- 3. Add Notification Types
INSERT INTO "notification_types" ("id", "code", "name", "category", "severity") VALUES
(gen_random_uuid(), 'TABLE_DIRTY', 'Table Dirty', 'FLOOR', 'INFO'),
(gen_random_uuid(), 'TABLE_VACANT', 'Table Vacant', 'FLOOR', 'INFO');

-- 4. Add Recipient Groups for Host and Busser
INSERT INTO "recipient_groups" ("id", "name", "role_code") VALUES
(gen_random_uuid(), 'Hosts', 'ROLE_HOST'),
(gen_random_uuid(), 'Bussers', 'ROLE_BUSSER');

-- 5. Configure Routing (Matrix)
-- Get the ID of the IN_APP channel
DO $$
DECLARE
    in_app_id UUID;
BEGIN
    SELECT id INTO in_app_id FROM channels WHERE type = 'IN_APP' LIMIT 1;
    
    INSERT INTO "notification_type_channels" ("id", "notification_type_id", "channel_id", "recipient_group_id")
    SELECT gen_random_uuid(), nt.id, in_app_id, rg.id
    FROM notification_types nt, recipient_groups rg
    WHERE nt.code = 'TABLE_DIRTY' AND rg.role_code = 'ROLE_BUSSER';

    INSERT INTO "notification_type_channels" ("id", "notification_type_id", "channel_id", "recipient_group_id")
    SELECT gen_random_uuid(), nt.id, in_app_id, rg.id
    FROM notification_types nt, recipient_groups rg
    WHERE nt.code = 'TABLE_VACANT' AND rg.role_code = 'ROLE_HOST';
END $$;

-- 6. Add "Benny Busser" user (PIN 6666)
INSERT INTO "staff_member" ("id", "full_name", "pin_hash", "role", "role_id", "active", "version") VALUES
(gen_random_uuid(), 'Benny Busser', '$2a$10$uO3i1hJfgMvJ4nlqp0YZbO6sWCIZCzureSc3gEJE0n1R5rzvg/NIO', 'BUSSER', '00000000-0000-0000-0000-000000000107', true, 0);
