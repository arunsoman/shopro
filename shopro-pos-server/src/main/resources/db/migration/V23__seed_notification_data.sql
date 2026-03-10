-- V23__seed_notification_data.sql
-- Realistic default routing and initial notifications

-- 1. Default Role Mappings
INSERT INTO notification_recipient_mapping (id, created_at, updated_at, version, notification_type, recipient_type, recipient_id) VALUES
-- Order Updates
(gen_random_uuid(), NOW(), NOW(), 0, 'ORDER_READY', 'ROLE', 'SERVER'),
(gen_random_uuid(), NOW(), NOW(), 0, 'ORDER_READY', 'ROLE', 'SENIOR_SERVER'),
(gen_random_uuid(), NOW(), NOW(), 0, 'ORDER_READY', 'ROLE', 'JUNIOR_SERVER'),
(gen_random_uuid(), NOW(), NOW(), 0, 'ORDER_READY', 'ROLE', 'RUNNER'),
(gen_random_uuid(), NOW(), NOW(), 0, 'ITEM_REJECTED', 'ROLE', 'SERVER'),
(gen_random_uuid(), NOW(), NOW(), 0, 'ITEM_REJECTED', 'ROLE', 'SENIOR_SERVER'),
(gen_random_uuid(), NOW(), NOW(), 0, 'ITEM_REJECTED', 'ROLE', 'JUNIOR_SERVER'),

-- Floor Management
(gen_random_uuid(), NOW(), NOW(), 0, 'ASSISTANCE_NEEDED', 'ROLE', 'SERVER'),
(gen_random_uuid(), NOW(), NOW(), 0, 'ASSISTANCE_NEEDED', 'ROLE', 'SENIOR_SERVER'),
(gen_random_uuid(), NOW(), NOW(), 0, 'ASSISTANCE_NEEDED', 'ROLE', 'JUNIOR_SERVER'),
(gen_random_uuid(), NOW(), NOW(), 0, 'TABLE_DIRTY', 'ROLE', 'BUSSER'),
(gen_random_uuid(), NOW(), NOW(), 0, 'TABLE_DIRTY', 'ROLE', 'RUNNER'),
(gen_random_uuid(), NOW(), NOW(), 0, 'CURBSIDE_ARRIVAL', 'ROLE', 'RUNNER'),
(gen_random_uuid(), NOW(), NOW(), 0, 'CURBSIDE_ARRIVAL', 'ROLE', 'HOST'),

-- Management & Inventory
(gen_random_uuid(), NOW(), NOW(), 0, 'STOCK_CRITICAL', 'ROLE', 'MANAGER'),
(gen_random_uuid(), NOW(), NOW(), 0, 'STOCK_CRITICAL', 'ROLE', 'HEAD_CHEF'),
(gen_random_uuid(), NOW(), NOW(), 0, 'STOCK_CRITICAL', 'ROLE', 'GENERAL_MANAGER'),
(gen_random_uuid(), NOW(), NOW(), 0, 'STOCK_CRITICAL', 'ROLE', 'OWNER'),
(gen_random_uuid(), NOW(), NOW(), 0, 'PO_APPROVAL_REQUIRED', 'ROLE', 'GENERAL_MANAGER'),
(gen_random_uuid(), NOW(), NOW(), 0, 'PO_APPROVAL_REQUIRED', 'ROLE', 'OWNER'),
(gen_random_uuid(), NOW(), NOW(), 0, 'BID_RECEIVED', 'ROLE', 'HEAD_CHEF'),
(gen_random_uuid(), NOW(), NOW(), 0, 'BID_RECEIVED', 'ROLE', 'GENERAL_MANAGER'),
(gen_random_uuid(), NOW(), NOW(), 0, 'VOID_REQUEST', 'ROLE', 'MANAGER'),
(gen_random_uuid(), NOW(), NOW(), 0, 'VOID_REQUEST', 'ROLE', 'GENERAL_MANAGER'),
(gen_random_uuid(), NOW(), NOW(), 0, 'VOID_REQUEST', 'ROLE', 'SENIOR_SERVER'),

-- System
(gen_random_uuid(), NOW(), NOW(), 0, 'SYSTEM_WARNING', 'ROLE', 'GENERAL_MANAGER'),
(gen_random_uuid(), NOW(), NOW(), 0, 'SYSTEM_WARNING', 'ROLE', 'OWNER');

-- 2. Initial "Welcome" Notifications
INSERT INTO in_app_notification (id, created_at, updated_at, version, recipient_type, recipient_id, title, message, category, priority, is_read, is_dismissed) VALUES
-- For Owners/Managers
(gen_random_uuid(), NOW(), NOW(), 0, 'ROLE', 'OWNER', 'Welcome to Shopro POS', 'The system is ready. You can now manage your restaurant floor and inventory in real-time.', 'SYSTEM', 'MEDIUM', false, false),
(gen_random_uuid(), NOW(), NOW(), 0, 'ROLE', 'MANAGER', 'Smart Notifications Active', 'You will now receive alerts for stock levels and void requests directly here.', 'SYSTEM', 'MEDIUM', false, false),
(gen_random_uuid(), NOW(), NOW(), 0, 'ROLE', 'GENERAL_MANAGER', 'Inventory Analytics Ready', 'AI-driven stock replenishment suggestions are now available in the inventory section.', 'INVENTORY', 'HIGH', false, false),

-- For Staff
(gen_random_uuid(), NOW(), NOW(), 0, 'ROLE', 'SERVER', 'Table Tracking Enabled', 'Table status changes (Dirty/Available) will now push instant alerts.', 'SYSTEM', 'LOW', false, false),
(gen_random_uuid(), NOW(), NOW(), 0, 'ROLE', 'HEAD_CHEF', 'KDS Master Sync', 'The Kitchen Display System is now synced with your raw ingredient stock.', 'INVENTORY', 'MEDIUM', false, false);
