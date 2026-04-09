-- V50__seed_notification_routing_matrix.sql

-- 1. Ensure Recipient Groups exist
INSERT INTO "recipient_groups" ("id", "name", "role_code")
VALUES 
    (gen_random_uuid(), 'General Manager', 'ROLE_GENERAL_MANAGER'),
    (gen_random_uuid(), 'Waitstaff & Runners', 'ROLE_SERVER'),
    (gen_random_uuid(), 'Kitchen & BOH', 'ROLE_CHEF'),
    (gen_random_uuid(), 'Purchasing', 'ROLE_ADMIN')
ON CONFLICT (role_code) DO NOTHING;

-- 2. Ensure Notification Types exist
INSERT INTO "notification_types" ("id", "code", "name", "category", "severity")
VALUES
    (gen_random_uuid(), 'PO_APPROVAL_REQUIRED', 'PO Approval Required', 'PURCHASING', 'INFO'),
    (gen_random_uuid(), 'BID_RECEIVED', 'Vendor Bid Received', 'PURCHASING', 'INFO'),
    (gen_random_uuid(), 'ORDER_READY', 'Order Ready for Pickup', 'KDS', 'INFO'),
    (gen_random_uuid(), 'ITEM_REJECTED', 'Kitchen 86''d Item', 'KDS', 'WARNING'),
    (gen_random_uuid(), 'ASSISTANCE_NEEDED', 'Customer Assistance Needed', 'FLOOR', 'INFO'),
    (gen_random_uuid(), 'VOID_REQUEST', 'Void Approval Request', 'POS', 'WARNING'),
    (gen_random_uuid(), 'CURBSIDE_ARRIVAL', 'Curbside Arrival', 'FLOOR', 'INFO'),
    (gen_random_uuid(), 'SHRINKAGE_ALERT', 'High Variance Alert', 'INVENTORY', 'WARNING'),
    (gen_random_uuid(), 'OVERTIME_WARNING', 'Approaching Overtime', 'STAFF', 'INFO'),
    (gen_random_uuid(), 'VIP_GUEST_SEATED', 'VIP Guest Seated', 'FLOOR', 'INFO')
ON CONFLICT (code) DO NOTHING;

-- 3. Seed some initial routing rules
DO $$
DECLARE
    in_app_id UUID;
    email_id UUID;
    push_id UUID;
    
    gm_group_id UUID;
    chef_group_id UUID;
    purchasing_group_id UUID;
    server_group_id UUID;
    mgmt_group_id UUID;
    
    type_stock_id UUID;
    type_po_id UUID;
    type_bid_id UUID;
    type_ready_id UUID;
BEGIN
    -- Resolve Channel IDs
    SELECT id INTO in_app_id FROM channels WHERE type = 'IN_APP' LIMIT 1;
    SELECT id INTO email_id FROM channels WHERE type = 'EMAIL' LIMIT 1;
    SELECT id INTO push_id FROM channels WHERE type = 'PUSH' LIMIT 1;
    
    -- Resolve Group IDs
    SELECT id INTO gm_group_id FROM recipient_groups WHERE role_code = 'ROLE_GENERAL_MANAGER';
    SELECT id INTO chef_group_id FROM recipient_groups WHERE role_code = 'ROLE_CHEF';
    SELECT id INTO purchasing_group_id FROM recipient_groups WHERE role_code = 'ROLE_ADMIN';
    SELECT id INTO server_group_id FROM recipient_groups WHERE role_code = 'ROLE_SERVER';
    SELECT id INTO mgmt_group_id FROM recipient_groups WHERE role_code = 'ROLE_MANAGEMENT';

    -- Resolve Type IDs
    SELECT id INTO type_stock_id FROM notification_types WHERE code = 'STOCK_CRITICAL';
    SELECT id INTO type_po_id FROM notification_types WHERE code = 'PO_APPROVAL_REQUIRED';
    SELECT id INTO type_bid_id FROM notification_types WHERE code = 'BID_RECEIVED';
    SELECT id INTO type_ready_id FROM notification_types WHERE code = 'ORDER_READY';

    -- GM: EMAIL for Stock Critical
    IF type_stock_id IS NOT NULL AND gm_group_id IS NOT NULL AND email_id IS NOT NULL THEN
        INSERT INTO "notification_type_channels" ("id", "notification_type_id", "channel_id", "recipient_group_id")
        VALUES (gen_random_uuid(), type_stock_id, email_id, gm_group_id)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Chef: IN_APP for Stock Critical
    IF type_stock_id IS NOT NULL AND chef_group_id IS NOT NULL AND in_app_id IS NOT NULL THEN
        INSERT INTO "notification_type_channels" ("id", "notification_type_id", "channel_id", "recipient_group_id")
        VALUES (gen_random_uuid(), type_stock_id, in_app_id, chef_group_id)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Purchasing: IN_APP & EMAIL for Stock Critical
    IF type_stock_id IS NOT NULL AND purchasing_group_id IS NOT NULL AND in_app_id IS NOT NULL THEN
        INSERT INTO "notification_type_channels" ("id", "notification_type_id", "channel_id", "recipient_group_id")
        VALUES (gen_random_uuid(), type_stock_id, in_app_id, purchasing_group_id)
        ON CONFLICT DO NOTHING;
    END IF;
    IF type_stock_id IS NOT NULL AND purchasing_group_id IS NOT NULL AND email_id IS NOT NULL THEN
        INSERT INTO "notification_type_channels" ("id", "notification_type_id", "channel_id", "recipient_group_id")
        VALUES (gen_random_uuid(), type_stock_id, email_id, purchasing_group_id)
        ON CONFLICT DO NOTHING;
    END IF;

    -- GM: ALL channels for PO Approval
    IF type_po_id IS NOT NULL AND gm_group_id IS NOT NULL THEN
        IF in_app_id IS NOT NULL THEN INSERT INTO "notification_type_channels" ("id", "notification_type_id", "channel_id", "recipient_group_id") VALUES (gen_random_uuid(), type_po_id, in_app_id, gm_group_id) ON CONFLICT DO NOTHING; END IF;
        IF email_id IS NOT NULL THEN INSERT INTO "notification_type_channels" ("id", "notification_type_id", "channel_id", "recipient_group_id") VALUES (gen_random_uuid(), type_po_id, email_id, gm_group_id) ON CONFLICT DO NOTHING; END IF;
        IF push_id IS NOT NULL THEN INSERT INTO "notification_type_channels" ("id", "notification_type_id", "channel_id", "recipient_group_id") VALUES (gen_random_uuid(), type_po_id, push_id, gm_group_id) ON CONFLICT DO NOTHING; END IF;
    END IF;

END $$;
