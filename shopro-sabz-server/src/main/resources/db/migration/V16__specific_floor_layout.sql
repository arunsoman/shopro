-- V16__specific_floor_layout.sql
-- Replicates the specific floor plan layout from the reference image.

-- Aggressively clear all tables that might refer to table_shape or section.
TRUNCATE TABLE notification_log, loyalty_transaction, kds_ticket_item, kds_ticket, 
               order_audit_log, order_item_modifier, order_item, order_ticket, 
               waitlist_entry, reservation, tableside_session, guest_cart_item CASCADE;

DELETE FROM table_shape;
DELETE FROM section;

-- Create New Sections with hardcoded IDs matching Flutter logic
INSERT INTO section (id, name, version) VALUES
('f1000000-0000-0000-0000-000000000100', 'BOOTHS', 0),
('f1000000-0000-0000-0000-000000000101', 'PRIVATE', 0),
('f1000000-0000-0000-0000-000000000102', 'MAIN', 0),
('f1000000-0000-0000-0000-000000000103', 'BAR', 0),
('f1000000-0000-0000-0000-000000000104', 'DECOR', 0);

-- 1. Booths (Top Row) - B1 to B4
-- Oval shaped, green branding in UI
INSERT INTO table_shape (id, section_id, name, capacity, status, pos_x, pos_y, width, height, shape_type, version) VALUES
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000100', 'B1', 6, 'AVAILABLE', 200, 40, 120, 80, 'OVAL', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000100', 'B2', 6, 'AVAILABLE', 460, 40, 120, 80, 'OVAL', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000100', 'B3', 6, 'AVAILABLE', 720, 40, 120, 80, 'OVAL', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000100', 'B4', 6, 'AVAILABLE', 980, 40, 120, 80, 'OVAL', 0);

-- 2. Private Rooms (Left Column) - T-101 to T-103
-- Rectangle shaped, pink branding in UI
INSERT INTO table_shape (id, section_id, name, capacity, status, pos_x, pos_y, width, height, shape_type, version) VALUES
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000101', 'T-101', 8, 'AVAILABLE', 40, 200, 260, 160, 'RECTANGLE', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000101', 'T-102', 8, 'AVAILABLE', 40, 380, 260, 160, 'RECTANGLE', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000101', 'T-103', 8, 'AVAILABLE', 40, 560, 260, 160, 'RECTANGLE', 0);

-- 3. Main Tables (Center 4x3 Grid) - 21 to 53
-- Round shaped, blue branding in UI
-- Spaced for readability: x starts at 360, y starts at 200
INSERT INTO table_shape (id, section_id, name, capacity, status, pos_x, pos_y, width, height, shape_type, version) VALUES
-- Row 1: 21, 22, 23
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000102', '21', 4, 'AVAILABLE', 400, 200, 80, 80, 'ROUND', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000102', '22', 4, 'AVAILABLE', 530, 200, 80, 80, 'ROUND', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000102', '23', 4, 'AVAILABLE', 660, 200, 80, 80, 'ROUND', 0),
-- Row 2: 31, 32, 33
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000102', '31', 4, 'AVAILABLE', 400, 310, 80, 80, 'ROUND', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000102', '32', 4, 'AVAILABLE', 530, 310, 80, 80, 'ROUND', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000102', '33', 4, 'AVAILABLE', 660, 310, 80, 80, 'ROUND', 0),
-- Row 3: 41, 42, 43
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000102', '41', 4, 'AVAILABLE', 400, 420, 80, 80, 'ROUND', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000102', '42', 4, 'AVAILABLE', 530, 420, 80, 80, 'ROUND', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000102', '43', 4, 'AVAILABLE', 660, 420, 80, 80, 'ROUND', 0),
-- Row 4: 51, 52, 53
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000102', '51', 4, 'AVAILABLE', 400, 530, 80, 80, 'ROUND', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000102', '52', 4, 'AVAILABLE', 530, 530, 80, 80, 'ROUND', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000102', '53', 4, 'AVAILABLE', 660, 530, 80, 80, 'ROUND', 0);

-- 4. Bar Area (Right Side) - B1 to B8
-- Small round stools/tables, orange branding in UI
INSERT INTO table_shape (id, section_id, name, capacity, status, pos_x, pos_y, width, height, shape_type, version) VALUES
-- Column 1
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000103', 'B1', 2, 'AVAILABLE', 820, 200, 50, 50, 'ROUND', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000103', 'B3', 2, 'AVAILABLE', 820, 310, 50, 50, 'ROUND', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000103', 'B5', 2, 'AVAILABLE', 820, 420, 50, 50, 'ROUND', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000103', 'B7', 2, 'AVAILABLE', 820, 530, 50, 50, 'ROUND', 0),
-- Column 2
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000103', 'B2', 2, 'AVAILABLE', 910, 200, 50, 50, 'ROUND', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000103', 'B4', 2, 'AVAILABLE', 910, 310, 50, 50, 'ROUND', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000103', 'B6', 2, 'AVAILABLE', 910, 420, 50, 50, 'ROUND', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000103', 'B8', 2, 'AVAILABLE', 910, 530, 50, 50, 'ROUND', 0);

-- 5. Decorative Elements (Bottom Area)
INSERT INTO table_shape (id, section_id, name, capacity, status, pos_x, pos_y, width, height, shape_type, version) VALUES
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000104', 'LADIES', 0, 'INACTIVE', 40, 750, 100, 100, 'DECOR', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000104', 'MEN', 0, 'INACTIVE', 160, 750, 100, 100, 'DECOR', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000104', 'MAIN ENTRANCE', 0, 'INACTIVE', 400, 780, 200, 60, 'DECOR', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000104', 'KITCHEN AREA', 0, 'INACTIVE', 750, 730, 350, 100, 'DECOR', 0);
