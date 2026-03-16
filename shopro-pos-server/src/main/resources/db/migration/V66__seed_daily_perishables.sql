-- V63: Seed Daily Perishables Data
-- Ingredients with 1-day shelf life requiring mandatory daily restock.

INSERT INTO raw_ingredient (
    id, 
    name, 
    unit_of_measure, 
    cost_per_unit, 
    yield_pct, 
    -- effective_cost_per_unit, 
    current_stock, 
    par_level, 
    reorder_point, 
    safety_level, 
    critical_level, 
    max_stock_level, 
    supplier_id, 
    category, 
    storage_type, 
    restocking_mode, 
    shelf_life_days, 
    daily_restock_enrolled, 
    version
) VALUES 
('00000000-1000-0000-0000-000000000063', 'Fresh Artisanal Baguette', 'ea', 1.50, 1.0000,  20, 24, 5, 10, 5, 50, 'c0000000-0000-0000-0000-000000000001', 'Bakery', 'AMBIENT', 'MANUAL', 1, true, 0),
('00000000-1000-0000-0000-000000000064', 'Microgreens Sunflower Mix', 'oz', 3.20, 0.9500, 10, 16, 4, 8, 4, 32, 'c0000000-0000-0000-0000-000000000001', 'Produce', 'COLD', 'MANUAL', 1, true, 0),
('00000000-1000-0000-0000-000000000065', 'Hand-Picked Thai Basil', 'ea', 2.00, 0.8500, 15, 20, 5, 10, 5, 40, 'c0000000-0000-0000-0000-000000000001', 'Produce', 'COLD', 'MANUAL', 1, true, 0),
('00000000-1000-0000-0000-000000000066', 'Fresh Pressed Orange Juice', 'l', 4.50, 1.0000, 5, 10, 2, 4, 2, 20, 'c0000000-0000-0000-0000-000000000001', 'Beverage', 'COLD', 'MANUAL', 1, true, 0)
ON CONFLICT (id) DO UPDATE SET
    shelf_life_days = EXCLUDED.shelf_life_days,
    daily_restock_enrolled = EXCLUDED.daily_restock_enrolled;
