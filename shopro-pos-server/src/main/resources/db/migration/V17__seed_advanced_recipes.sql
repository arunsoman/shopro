-- 0. CLEANUP (Idempotency)
-- Clear any existing versions to allow re-running the script
DELETE FROM recipe_ingredient WHERE recipe_id IN (SELECT id FROM recipe WHERE recipe_version = 2 OR (sub_recipe_id IS NOT NULL AND recipe_version = 1));
DELETE FROM recipe WHERE recipe_version = 2 OR (sub_recipe_id IS NOT NULL AND recipe_version = 1);
DELETE FROM sub_recipe CASCADE;

-- 1. SUB-RECIPES (Prepped items)
INSERT INTO sub_recipe (id, name, yield_quantity, unit_of_measure, cost_per_unit, created_at, updated_at, version)
VALUES
('00000000-5000-0000-0000-000000000001', 'Burger Patty (Prepped)',     1.0,  'ea', 0.52, NOW(), NOW(), 0),
('00000000-5000-0000-0000-000000000002', 'Special Sauce (1L Batch)',  1000, 'ml', 0.01, NOW(), NOW(), 0),
('00000000-5000-0000-0000-000000000003', 'Caesar Dressing (1L Batch)', 1000, 'ml', 0.01, NOW(), NOW(), 0);

-- 2. RECIPE HEADERS FOR SUB-RECIPES
INSERT INTO recipe (id, sub_recipe_id, recipe_version, effective_from, created_at, updated_at, version)
VALUES
('00000000-6000-0000-0000-000000000001', '00000000-5000-0000-0000-000000000001', 1, NOW(), NOW(), NOW(), 0), -- Patty
('00000000-6000-0000-0000-000000000002', '00000000-5000-0000-0000-000000000002', 1, NOW(), NOW(), NOW(), 0), -- Sauce
('00000000-6000-0000-0000-000000000003', '00000000-5000-0000-0000-000000000003', 1, NOW(), NOW(), NOW(), 0); -- Dressing

-- 3. INGREDIENTS FOR SUB-RECIPES
INSERT INTO recipe_ingredient (id, recipe_id, ingredient_id, quantity, created_at, updated_at, version)
VALUES
-- Smash Burger Patty Ingredients (Ground Beef)
(gen_random_uuid(), '00000000-6000-0000-0000-000000000001', '00000000-1000-0000-0000-000000000007', 4.0, NOW(), NOW(), 0),
-- Special Sauce Ingredients (Aioli + BBQ)
(gen_random_uuid(), '00000000-6000-0000-0000-000000000002', '00000000-1000-0000-0000-000000000041', 500, NOW(), NOW(), 0),
(gen_random_uuid(), '00000000-6000-0000-0000-000000000002', '00000000-1000-0000-0000-000000000036', 500, NOW(), NOW(), 0),
-- Caesar Dressing Ingredients (Oil + Garlic + Lemon)
(gen_random_uuid(), '00000000-6000-0000-0000-000000000003', '00000000-1000-0000-0000-000000000032', 0.8, NOW(), NOW(), 0),
(gen_random_uuid(), '00000000-6000-0000-0000-000000000003', '00000000-1000-0000-0000-000000000021', 2.0, NOW(), NOW(), 0),
(gen_random_uuid(), '00000000-6000-0000-0000-000000000003', '00000000-1000-0000-0000-000000000027', 4.0, NOW(), NOW(), 0);

-- 4. NEW RECIPE VERSIONS FOR MENU ITEMS (Version 2)
-- This demonstrates the versioning system and uses the Sub-Recipes created above.
INSERT INTO recipe (id, menu_item_id, recipe_version, effective_from, created_at, updated_at, version)
VALUES
-- Classic Smash Burger (V2 uses prepped patty and special sauce)
('00000000-2000-0000-0000-000000001006', 'd1000000-0000-0000-0000-000000000003', 2, NOW(), NOW(), NOW(), 0),
-- Caesar Salad (V2 uses prepped dressing)
('00000000-2000-0000-0000-000000001002', 'd1000010-0000-0000-0000-000000000001', 2, NOW(), NOW(), NOW(), 0),
-- Calamari (V2 uses prepped aioli)
('00000000-2000-0000-0000-000000001001', 'd1000000-0000-0000-0000-000000000001', 2, NOW(), NOW(), NOW(), 0)
ON CONFLICT (menu_item_id, recipe_version) WHERE menu_item_id IS NOT NULL DO NOTHING;

-- 5. ADVANCED INGREDIENTS/SUB-RECIPES FOR MENU ITEMS (Version 2)
INSERT INTO recipe_ingredient (id, recipe_id, ingredient_id, sub_recipe_id, quantity, created_at, updated_at, version)
VALUES
-- Classic Smash Burger (V2)
(gen_random_uuid(), '00000000-2000-0000-0000-000000001006', NULL, '00000000-5000-0000-0000-000000000001', 1.0, NOW(), NOW(), 0), -- Patty (Sub)
(gen_random_uuid(), '00000000-2000-0000-0000-000000001006', NULL, '00000000-5000-0000-0000-000000000002', 15.0, NOW(), NOW(), 0), -- Sauce (Sub, 15ml)
(gen_random_uuid(), '00000000-2000-0000-0000-000000001006', '00000000-1000-0000-0000-000000000040', NULL, 1.0,  NOW(), NOW(), 0), -- Bun
(gen_random_uuid(), '00000000-2000-0000-0000-000000001006', '00000000-1000-0000-0000-000000000015', NULL, 2.0,  NOW(), NOW(), 0), -- Cheese

-- Caesar Salad (V2)
(gen_random_uuid(), '00000000-2000-0000-0000-000000001002', NULL, '00000000-5000-0000-0000-000000000003', 30.0, NOW(), NOW(), 0), -- Dressing (Sub, 30ml)
(gen_random_uuid(), '00000000-2000-0000-0000-000000001002', '00000000-1000-0000-0000-000000000018', NULL, 6.0,  NOW(), NOW(), 0), -- Romaine
(gen_random_uuid(), '00000000-2000-0000-0000-000000001002', '00000000-1000-0000-0000-000000000043', NULL, 1.5,  NOW(), NOW(), 0), -- Croutons
(gen_random_uuid(), '00000000-2000-0000-0000-000000001002', '00000000-1000-0000-0000-000000000014', NULL, 1.0,  NOW(), NOW(), 0), -- Parmesan

-- Crispy Calamari (V2)
(gen_random_uuid(), '00000000-2000-0000-0000-000000001001', '00000000-1000-0000-0000-000000000005', NULL, 6.0,  NOW(), NOW(), 0), -- Squid
(gen_random_uuid(), '00000000-2000-0000-0000-000000001001', '00000000-1000-0000-0000-000000000033', NULL, 1.5,  NOW(), NOW(), 0), -- Flour
(gen_random_uuid(), '00000000-2000-0000-0000-000000001001', '00000000-1000-0000-0000-000000000035', NULL, 1.0,  NOW(), NOW(), 0), -- Panko
(gen_random_uuid(), '00000000-2000-0000-0000-000000001001', '00000000-1000-0000-0000-000000000041', NULL, 1.5,  NOW(), NOW(), 0); -- Aioli
