-- V9__seed_modifier_group_sys.sql
INSERT INTO modifier_group (id, name, required, min_selections, max_selections, created_at, updated_at, version)
VALUES
('b1000000-0000-0000-0000-000000000001', 'Meat Temperature', true, 1, 1, '2026-03-13T16:54:47.130Z', '2026-03-13T16:54:47.130Z', 0),
('b1000000-0000-0000-0000-000000000002', 'Burger Add-ons', false, 0, 3, '2026-03-13T16:54:47.130Z', '2026-03-13T16:54:47.130Z', 0)
ON CONFLICT (id) DO NOTHING;
