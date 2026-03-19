-- V19__seed_ingredients_mock.sql
INSERT INTO raw_ingredient (id, name, unit_of_measure, cost_per_unit, yield_pct, current_stock, par_level, reorder_point, safety_level, critical_level, max_stock_level, auto_replenish, restocking_mode, shelf_life_days, storage_type, daily_restock_enrolled, category, version, created_at, updated_at)
VALUES
('b0000000-0000-0000-0000-000000000001', 'Baking Flour', 'kg', 1.20, 1.0000, 50.00, 200.00, 40.00, 20.00, 10.00, 500.00, true, 'AUTOMATED', 180, 'AMBIENT', false, 'Dry Goods', 0, now(), now()),
('b0000000-0000-0000-0000-000000000002', 'Unsalted Butter', 'kg', 8.50, 1.0000, 10.00, 50.00, 15.00, 5.00, 2.00, 100.00, true, 'AUTOMATED', 60, 'COLD', false, 'Dairy', 0, now(), now()),
('b0000000-0000-0000-0000-000000000003', 'Whole Milk', 'liter', 0.90, 1.0000, 20.00, 100.00, 30.00, 10.00, 5.00, 200.00, true, 'AUTOMATED', 7, 'COLD', false, 'Dairy', 0, now(), now())
ON CONFLICT (id) DO NOTHING;
