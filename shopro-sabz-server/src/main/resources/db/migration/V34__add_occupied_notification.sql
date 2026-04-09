-- V34__add_occupied_notification.sql

-- 1. Add missing config column (jsonb for extensibility) to notification_types
ALTER TABLE "notification_types" ADD COLUMN IF NOT EXISTS "config" JSONB DEFAULT '{}';

-- 2. Add TABLE_OCCUPIED notification type
INSERT INTO "notification_types" ("id", "code", "name", "category", "severity", "config")
SELECT gen_random_uuid(), 'TABLE_OCCUPIED', 'Table Occupied', 'FLOOR', 'INFO', '{}'
WHERE NOT EXISTS (SELECT 1 FROM notification_types WHERE code = 'TABLE_OCCUPIED');

-- 3. Add ROLE_SERVER_ALL recipient group
INSERT INTO "recipient_groups" ("id", "name", "role_code")
SELECT gen_random_uuid(), 'All Servers', 'ROLE_SERVER_ALL'
WHERE NOT EXISTS (SELECT 1 FROM recipient_groups WHERE role_code = 'ROLE_SERVER_ALL');

-- 4. Configure Routing (Matrix)
-- Get the ID of the IN_APP channel
DO $$
DECLARE
    in_app_id UUID;
    type_id UUID;
    group_id UUID;
BEGIN
    SELECT id INTO in_app_id FROM channels WHERE type = 'IN_APP' LIMIT 1;
    SELECT id INTO type_id FROM notification_types WHERE code = 'TABLE_OCCUPIED';
    SELECT id INTO group_id FROM recipient_groups WHERE role_code = 'ROLE_SERVER_ALL';
    
    IF in_app_id IS NOT NULL AND type_id IS NOT NULL AND group_id IS NOT NULL THEN
        INSERT INTO "notification_type_channels" ("id", "notification_type_id", "channel_id", "recipient_group_id")
        SELECT gen_random_uuid(), type_id, in_app_id, group_id
        WHERE NOT EXISTS (
            SELECT 1 FROM notification_type_channels 
            WHERE notification_type_id = type_id AND channel_id = in_app_id AND recipient_group_id = group_id
        );
    END IF;
END $$;
