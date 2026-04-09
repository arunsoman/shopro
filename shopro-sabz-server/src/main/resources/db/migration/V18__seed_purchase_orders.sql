-- V18__seed_purchase_orders.sql
-- Seeds purchase orders for the Inventory Kanban board

-- 1. PENDING_APPROVAL PO
INSERT INTO purchase_order (id, supplier_id, generated_by_id, status, total_value, expected_delivery_date, created_at, updated_at, version)
VALUES ('e0000000-2000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'PENDING_APPROVAL', 1450.00, CURRENT_DATE + INTERVAL '2 days', NOW(), NOW(), 0);

INSERT INTO purchase_order_line (id, purchase_order_id, ingredient_id, ordered_qty, unit_cost, created_at, updated_at, version)
VALUES (gen_random_uuid(), 'e0000000-2000-0000-0000-000000000001', '00000000-1000-0000-0000-000000000001', 100, 1.35, NOW(), NOW(), 0),
       (gen_random_uuid(), 'e0000000-2000-0000-0000-000000000001', '00000000-1000-0000-0000-000000000020', 50, 0.52, NOW(), NOW(), 0);

-- 2. APPROVED PO
INSERT INTO purchase_order (id, supplier_id, generated_by_id, status, total_value, expected_delivery_date, approved_by_id, approved_at, created_at, updated_at, version)
VALUES ('e0000000-2000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'APPROVED', 850.00, CURRENT_DATE + INTERVAL '1 day', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW(), NOW(), NOW(), 0);

INSERT INTO purchase_order_line (id, purchase_order_id, ingredient_id, ordered_qty, unit_cost, created_at, updated_at, version)
VALUES (gen_random_uuid(), 'e0000000-2000-0000-0000-000000000002', '00000000-1000-0000-0000-000000000002', 80, 0.98, NOW(), NOW(), 0);

-- 3. SENT (Dispatched) PO
INSERT INTO purchase_order (id, supplier_id, generated_by_id, status, total_value, expected_delivery_date, sent_at, created_at, updated_at, version)
VALUES ('e0000000-2000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'SENT', 3200.00, CURRENT_DATE, NOW() - INTERVAL '4 hours', NOW(), NOW(), 0);

INSERT INTO purchase_order_line (id, purchase_order_id, ingredient_id, ordered_qty, unit_cost, created_at, updated_at, version)
VALUES (gen_random_uuid(), 'e0000000-2000-0000-0000-000000000003', '00000000-1000-0000-0000-000000000001', 200, 1.35, NOW(), NOW(), 0);

-- 4. ACKNOWLEDGED PO
INSERT INTO purchase_order (id, supplier_id, generated_by_id, status, total_value, expected_delivery_date, created_at, updated_at, version)
VALUES ('e0000000-2000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ACKNOWLEDGED', 500.00, CURRENT_DATE + INTERVAL '3 days', NOW(), NOW(), 0);

INSERT INTO purchase_order_line (id, purchase_order_id, ingredient_id, ordered_qty, unit_cost, created_at, updated_at, version)
VALUES (gen_random_uuid(), 'e0000000-2000-0000-0000-000000000004', '00000000-1000-0000-0000-000000000004', 100, 0.55, NOW(), NOW(), 0);
