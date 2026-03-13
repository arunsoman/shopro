-- Seed realistic preparation times for existing menu items based on category
UPDATE menu_item SET preparation_time_minutes = 8  WHERE category_id = 'a1000000-0000-0000-0000-000000000001'; -- Starters
UPDATE menu_item SET preparation_time_minutes = 12 WHERE category_id = 'a1000000-0000-0000-0000-000000000002'; -- Burgers
UPDATE menu_item SET preparation_time_minutes = 20 WHERE category_id = 'a1000000-0000-0000-0000-000000000003'; -- Mains
UPDATE menu_item SET preparation_time_minutes = 3  WHERE category_id = 'a1000000-0000-0000-0000-000000000004'; -- Drinks
