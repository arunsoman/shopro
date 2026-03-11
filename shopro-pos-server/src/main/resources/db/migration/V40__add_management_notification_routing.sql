-- V40__add_management_notification_routing.sql

-- 1. Create ROLE_MANAGEMENT recipient group if it doesn't exist
INSERT INTO "recipient_groups" ("id", "name", "role_code")
SELECT gen_random_uuid(), 'Management', 'ROLE_MANAGEMENT'
WHERE NOT EXISTS (SELECT 1 FROM recipient_groups WHERE role_code = 'ROLE_MANAGEMENT');

-- 2. Configure Routing for Managers to receive Floor events
DO $$
DECLARE
    in_app_id UUID;
    mgmt_group_id UUID;
    type_vacant_id UUID;
    type_dirty_id UUID;
    type_occupied_id UUID;
BEGIN
    -- Resolve IDs
    SELECT id INTO in_app_id FROM channels WHERE type = 'IN_APP' LIMIT 1;
    SELECT id INTO mgmt_group_id FROM recipient_groups WHERE role_code = 'ROLE_MANAGEMENT';
    
    SELECT id INTO type_vacant_id FROM notification_types WHERE code = 'TABLE_VACANT';
    SELECT id INTO type_dirty_id FROM notification_types WHERE code = 'TABLE_DIRTY';
    SELECT id INTO type_occupied_id FROM notification_types WHERE code = 'TABLE_OCCUPIED';

    -- Route TABLE_VACANT to Managers
    IF type_vacant_id IS NOT NULL AND mgmt_group_id IS NOT NULL AND in_app_id IS NOT NULL THEN
        INSERT INTO "notification_type_channels" ("id", "notification_type_id", "channel_id", "recipient_group_id")
        SELECT gen_random_uuid(), type_vacant_id, in_app_id, mgmt_group_id
        WHERE NOT EXISTS (
            SELECT 1 FROM notification_type_channels 
            WHERE notification_type_id = type_vacant_id AND channel_id = in_app_id AND recipient_group_id = mgmt_group_id
        );
    END IF;

    -- Route TABLE_DIRTY to Managers
    IF type_dirty_id IS NOT NULL AND mgmt_group_id IS NOT NULL AND in_app_id IS NOT NULL THEN
        INSERT INTO "notification_type_channels" ("id", "notification_type_id", "channel_id", "recipient_group_id")
        SELECT gen_random_uuid(), type_dirty_id, in_app_id, mgmt_group_id
        WHERE NOT EXISTS (
            SELECT 1 FROM notification_type_channels 
            WHERE notification_type_id = type_dirty_id AND channel_id = in_app_id AND recipient_group_id = mgmt_group_id
        );
    END IF;

    -- Route TABLE_OCCUPIED to Managers
    IF type_occupied_id IS NOT NULL AND mgmt_group_id IS NOT NULL AND in_app_id IS NOT NULL THEN
        INSERT INTO "notification_type_channels" ("id", "notification_type_id", "channel_id", "recipient_group_id")
        SELECT gen_random_uuid(), type_occupied_id, in_app_id, mgmt_group_id
        WHERE NOT EXISTS (
            SELECT 1 FROM notification_type_channels 
            WHERE notification_type_id = type_occupied_id AND channel_id = in_app_id AND recipient_group_id = mgmt_group_id
        );
    END IF;

END $$;
