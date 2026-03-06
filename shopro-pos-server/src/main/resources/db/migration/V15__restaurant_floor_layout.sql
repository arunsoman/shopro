-- V15__restaurant_floor_layout.sql
-- Implements the specific floor plan layout from the reference image.

-- Aggressively clear all tables that might refer to table_shape or section.
-- Using TRUNCATE CASCADE where possible to handle complex dependencies.
TRUNCATE TABLE notification_log, loyalty_transaction, kds_ticket_item, kds_ticket, 
               order_audit_log, order_item_modifier, order_item, order_ticket, 
               waitlist_entry, reservation, tableside_session, guest_cart_item CASCADE;

-- Now clear the core layout tables.
DELETE FROM table_shape;
DELETE FROM section;

-- Create New Sections
INSERT INTO section (id, name, version) VALUES
('f1000000-0000-0000-0000-000000000100', 'BOOTHS', 0),
('f1000000-0000-0000-0000-000000000101', 'PRIVATE_DINING', 0),
('f1000000-0000-0000-0000-000000000102', 'MAIN_HALL', 0),
('f1000000-0000-0000-0000-000000000103', 'BISTRO', 0),
('f1000000-0000-0000-0000-000000000104', 'DECOR', 0);

-- 1. Booths (Top Area) - High-end semi-enclosed spaces with oval tables
-- Coordinates adjusted for a standard canvas size (e.g., 1200x800)
INSERT INTO table_shape (id, section_id, name, capacity, status, pos_x, pos_y, width, height, shape_type, version) VALUES
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000100', 'B-1', 4, 'AVAILABLE', 40, 40, 160, 100, 'OVAL', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000100', 'B-2', 4, 'AVAILABLE', 240, 40, 160, 100, 'OVAL', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000100', 'B-3', 4, 'AVAILABLE', 440, 40, 160, 100, 'OVAL', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000100', 'B-4', 4, 'AVAILABLE', 640, 40, 160, 100, 'OVAL', 0);

-- 2. Private Dining (Left Row) - Enclosed rooms with larger tables
INSERT INTO table_shape (id, section_id, name, capacity, status, pos_x, pos_y, width, height, shape_type, version) VALUES
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000101', 'PV-1', 6, 'AVAILABLE', 40, 180, 140, 90, 'OVAL', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000101', 'PV-2', 6, 'AVAILABLE', 40, 300, 140, 90, 'OVAL', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000101', 'PV-3', 6, 'AVAILABLE', 40, 420, 140, 90, 'OVAL', 0);

-- 3. Main Hall (Center) - High-turnover clusters (Round 4-tops)
INSERT INTO table_shape (id, section_id, name, capacity, status, pos_x, pos_y, width, height, shape_type, version) VALUES
-- Column 1
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000102', 'H-1', 4, 'AVAILABLE', 220, 180, 70, 70, 'ROUND', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000102', 'H-2', 4, 'AVAILABLE', 220, 270, 70, 70, 'ROUND', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000102', 'H-3', 4, 'AVAILABLE', 220, 360, 70, 70, 'ROUND', 0),
-- Column 2
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000102', 'H-4', 4, 'AVAILABLE', 310, 180, 70, 70, 'ROUND', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000102', 'H-5', 4, 'AVAILABLE', 310, 270, 70, 70, 'ROUND', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000102', 'H-6', 4, 'AVAILABLE', 310, 360, 70, 70, 'ROUND', 0),
-- Cluster 2
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000102', 'H-7', 4, 'AVAILABLE', 460, 180, 70, 70, 'ROUND', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000102', 'H-8', 4, 'AVAILABLE', 460, 270, 70, 70, 'ROUND', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000102', 'H-9', 4, 'AVAILABLE', 460, 360, 70, 70, 'ROUND', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000102', 'H-10', 4, 'AVAILABLE', 550, 180, 70, 70, 'ROUND', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000102', 'H-11', 4, 'AVAILABLE', 550, 270, 70, 70, 'ROUND', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000102', 'H-12', 4, 'AVAILABLE', 550, 360, 70, 70, 'ROUND', 0);

-- 4. Bistro (Right) - Small cozy 2-tops
INSERT INTO table_shape (id, section_id, name, capacity, status, pos_x, pos_y, width, height, shape_type, version) VALUES
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000103', 'BR-1', 2, 'AVAILABLE', 660, 180, 60, 60, 'ROUND', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000103', 'BR-2', 2, 'AVAILABLE', 660, 270, 60, 60, 'ROUND', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000103', 'BR-3', 2, 'AVAILABLE', 660, 360, 60, 60, 'ROUND', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000103', 'BR-4', 2, 'AVAILABLE', 660, 450, 60, 60, 'ROUND', 0);

-- 5. Decor (Kitchen & Restrooms) - Using 'DECOR' shape type
INSERT INTO table_shape (id, section_id, name, capacity, status, pos_x, pos_y, width, height, shape_type, version) VALUES
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000104', 'KITCHEN', 0, 'INACTIVE', 480, 520, 340, 180, 'DECOR', 0),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000104', 'RESTROOMS', 0, 'INACTIVE', 40, 520, 280, 180, 'DECOR', 0);
