-- V9__market_table_market_informed_menu.sql
-- ══════════════════════════════════════════════════════════════════════════
-- The Market Table — Market-Informed Menu Update (Spring 2026)
--
-- Based on comprehensive market research for Midtown Manhattan, NYC:
--   - Trending dishes (Eater, Infatuation, Grub Street, OpenTable)
--   - Competitive analysis of 8 nearby restaurants
--   - NYC diner preferences & industry data
--   - Menu engineered for competitive gaps in Midtown
--
-- KEY CHANGES FROM V6:
--   1. NEW menu groups: Signature Cocktails (LIQUOR), Mocktails (SOFT_BEV)
--   2. NEW ingredients: Chicken (whole rotisserie), Rigatoni, Vodka, Mezcal,
--      Shrimp (jumbo), Polenta, Hot Honey, Seaweed Butter, etc.
--   3. UPDATED menu items: Added trending dishes (Spicy Rigatoni, Rotisserie
--      Chicken, Smash Burger, Shrimp Cocktail, Mezze Plate, etc.)
--   4. UPDATED prices: Reflect Midtown competitive landscape ($60-75 avg check)
--   5. UPDATED staff: Added 2 bartenders + 1 barback (from V6's 28 → 26 staff)
--   6. UPDATED weekly_budget: liquor sales split added
--
-- All INSERTs use ON CONFLICT DO NOTHING for idempotency.
-- ══════════════════════════════════════════════════════════════════════════

-- ═════════════════════════════════════════════════════════════════════════
-- STEP 1: ADD NEW INGREDIENTS (market-informed additions)
-- ═════════════════════════════════════════════════════════════════════════

-- Whole Chicken (for rotisserie hero dish — the #1 protein trend in NYC 2026)
INSERT INTO ingredient
  (id, restaurant_id, item_code, description, inventory_type, category,
   purchase_unit, case_pack_size, purchase_unit_price,
   recipe_unit, ru_per_pu, yield_pct, inventory_unit, iu_per_pu,
   oz_weight_per_cup, packed_by, par_level, on_hand,
   preferred_supplier_id, shelf_life_days, is_active, created_at, updated_at)
VALUES
  (321, 3, 'ING21', 'Whole Chicken (Fryer)',       'FOOD','POULTRY',        'EACH',  '12 ct',   4.49,  'LB',     3.5000, 0.8500, 'LB',    3.5000, 0.0000, null,     30.0, 30.0, 102, 5,  true, '2026-04-01','2026-04-01'),
  -- Rigatoni pasta (for spicy rigatoni — +56% search trend)
  (322, 3, 'ING22', 'Rigatoni Pasta (Dry)',        'FOOD',   'DRY_GOODS',       'LB',    '20 lb',   1.89,  'LB',     1.0000, 1.0000, 'LB',    1.0000, 0.0000, null,     25.0, 25.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- Vodka (for cocktail program — NY strip, spicy rigatoni)
  (323, 3, 'ING23', 'Vodka (Premium)',             'BAR',   'LIQUOR',           'LITER', '12 bt',  11.99,  'OZ_FLUID',33.8000, 1.0000,'ML',   1000.00, 0.0000, null,     10.0, 10.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- Mezcal (for signature cocktail — +29% mezcal trend)
  (324, 3, 'ING24', 'Mezcal Joven',               'BAR',   'LIQUOR',           'LITER', '6 bt',   22.99,  'OZ_FLUID',33.8000, 1.0000,'ML',   1000.00, 0.0000, null,      6.0,  6.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- Jumbo Shrimp (for shrimp cocktail — nostalgia trend)
  (325, 3, 'ING25', 'Jumbo Shrimp (16/20)',        'FOOD','SEAFOOD',         'LB',    '5 lb',    9.99,  'LB',     1.0000, 0.9000, 'LB',    1.0000, 0.0000, null,     25.0, 25.0, 103, 2,  true, '2026-04-01','2026-04-01'),
  -- Polenta (for braised short rib)
  (326, 3, 'ING26', 'Polenta (Instant)',            'FOOD',   'DRY_GOODS',        'LB',    '25 lb',   2.49,  'LB',     1.0000, 1.0000, 'LB',    1.0000, 5.3000, 'WEIGHT', 15.0, 15.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- Hot Honey (for burrata — trending condiment)
  (327, 3, 'ING27', 'Hot Honey (Mike''s Style)',    'FOOD',   'GROCERY_DRY_GOODS','JAR',   '12 oz',   7.99,  'OZ_FLUID',  12.00, 1.0000,'OZ_FLUID', 12.00, 0.0000, null,     12.0, 12.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- Seaweed Butter (for mushroom risotto — umami trend)
  (328, 3, 'ING28', 'Nori / Seaweed Powder',        'FOOD',   'GROCERY_DRY_GOODS','JAR',   '4 oz',    8.99,  'OZ',      4.0000, 1.0000, 'OZ',     4.0000, 0.0000, null,      6.0,  6.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- Smoked Paprika (for chicken chops)
  (329, 3, 'ING29', 'Smoked Paprika',              'FOOD',   'GROCERY_DRY_GOODS','JAR',   '8 oz',    6.49,  'OZ',      8.0000, 1.0000, 'OZ',     8.0000, 2.0000, 'WEIGHT',  5.0,  5.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- Hummus / Labneh base (for mezze plate — +30% mezze trend)
  (330, 3, 'ING30', 'Labneh (Strained Yogurt)',    'FOOD','DAIRY',           'EACH',  '8 pc',    4.49,  'EACH',   1.0000, 1.0000, 'EACH',   1.0000, 0.0000, null,     15.0, 15.0, 104, 10, true, '2026-04-01','2026-04-01'),
  -- Chickpeas (for hummus — mezze plate)
  (331, 3, 'ING31', 'Chickpeas (Canned)',           'FOOD',   'GROCERY_DRY_GOODS','EACH',  '24 cn',   1.29,  'EACH',   1.0000, 1.0000, 'EACH',   1.0000, 0.0000, null,     24.0, 24.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- Pita Bread (for mezze plate)
  (332, 3, 'ING32', 'Pita Bread (Fresh)',           'FOOD','GROCERY_DRY_GOODS','EACH',  '12 pk',   3.49,  'EACH',   1.0000, 1.0000, 'EACH',   1.0000, 0.0000, null,     20.0, 20.0, 105, 3,  true, '2026-04-01','2026-04-01'),
  -- Kalamata Olives (for mezze plate)
  (333, 3, 'ING33', 'Kalamata Olives (Jar)',        'FOOD',   'GROCERY_DRY_GOODS','JAR',   '16 oz',   5.99,  'OZ_FLUID',  16.00, 1.0000,'OZ_FLUID', 16.00, 0.0000, null,     8.0,  8.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- Aperol (for signature cocktail)
  (334, 3, 'ING34', 'Aperol',                       'BAR',   'LIQUOR',           'LITER', '12 bt',  12.99,  'OZ_FLUID',33.8000, 1.0000,'ML',   1000.00, 0.0000, null,      4.0,  4.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- Grapefruit Juice (for cocktails)
  (335, 3, 'ING35', 'Grapefruit Juice (Fresh)',     'FOOD','PRODUCE',         'EACH',  '12 bt',   4.99,  'OZ_FLUID',  16.00, 1.0000,'OZ_FLUID', 16.00, 0.0000, null,     12.0, 12.0, 101, 7,  true, '2026-04-01','2026-04-01'),
  -- Jalapeño (for spicy paloma cocktail)
  (336, 3, 'ING36', 'Jalapeño Peppers',             'FOOD','PRODUCE',         'LB',    '5 lb',    3.99,  'LB',     1.0000, 0.9500, 'LB',    1.0000, 0.0000, null,      5.0,  5.0, 101, 7,  true, '2026-04-01','2026-04-01'),
  -- Cream Cheese (for Basque cheesecake)
  (337, 3, 'ING37', 'Cream Cheese (Philadelphia)',   'FOOD','DAIRY',           'LB',    '6 lb',    4.99,  'LB',     1.0000, 1.0000, 'LB',    1.0000, 0.0000, null,     20.0, 20.0, 104, 14, true, '2026-04-01','2026-04-01'),
  -- Fresh Berries (for cheesecake garnish)
  (338, 3, 'ING38', 'Mixed Berries (Seasonal)',      'FOOD','PRODUCE',         'EACH',  '12 pt',   4.99,  'LB',     1.0000, 0.9000, 'LB',    1.0000, 0.0000, null,     10.0, 10.0, 101, 3,  true, '2026-04-01','2026-04-01'),
  -- Lemon (for paloma + seafood)
  (339, 3, 'ING39', 'Fresh Lemons',                 'FOOD','PRODUCE',         'EACH',  '50 ct',   0.49,  'EACH',   1.0000, 0.9500, 'EACH',   1.0000, 0.0000, null,     50.0, 50.0, 101, 7,  true, '2026-04-01','2026-04-01'),
  -- Seedlip (NA botanical — for mocktail program)
  (340, 3, 'ING40', 'Seedlip Garden (NA Spirit)',    'BAR',   'LIQUOR',          'EACH',  '6 bt',    8.99,  'OZ_FLUID',25.3600, 1.0000,'ML',    750.00, 0.0000, null,      6.0,  6.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- Short Rib (for braised short rib main)
  (341, 3, 'ING41', 'Beef Short Rib (Bone-In)',     'FOOD','MEAT',             'LB',    '10 lb',   8.99,  'LB',     1.0000, 0.8500, 'LB',    1.0000, 0.0000, null,     40.0, 40.0, 102, 5,  true, '2026-04-01','2026-04-01'),
  -- Horseradish (for shrimp cocktail)
  (342, 3, 'ING42', 'Prepared Horseradish',         'FOOD',   'GROCERY_DRY_GOODS','JAR',   '8 oz',    3.99,  'OZ',      8.0000, 1.0000, 'OZ',     8.0000, 0.0000, null,      4.0,  4.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- Cocktail Sauce (for shrimp cocktail)
  (343, 3, 'ING43', 'Cocktail Sauce',               'FOOD',   'GROCERY_DRY_GOODS','EACH',  '12 bt',   2.99,  'OZ_FLUID',12.00, 1.0000,'OZ_FLUID', 12.00, 0.0000, null,      8.0,  8.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- Dijon Mustard (for chicken + salad)
  (344, 3, 'ING44', 'Dijon Mustard',                 'FOOD',   'GROCERY_DRY_GOODS','JAR',   '8 oz',    4.49,  'OZ',      8.0000, 1.0000, 'OZ',     8.0000, 0.0000, null,      4.0,  4.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- Arugula (for Caesar + chicken paillard)
  (345, 3, 'ING45', 'Baby Arugula (Washed)',         'FOOD','PRODUCE',         'LB',    '2 lb',    5.99,  'LB',     1.0000, 0.9000, 'LB',    1.0000, 0.0000, null,     15.0, 15.0, 101, 5,  true, '2026-04-01','2026-04-01'),
  -- Flatbread (for mezze + burrata)
  (346, 3, 'ING46', 'Naan / Flatbread (Pack)',        'FOOD','GROCERY_DRY_GOODS','EACH',  '12 pk',   2.99,  'EACH',   1.0000, 1.0000, 'EACH',   1.0000, 0.0000, null,     24.0, 24.0, 105, 5,  true, '2026-04-01','2026-04-01'),
  -- Espresso Beans (for Espresso Martini — trending coffee cocktail)
  (347, 3, 'ING47', 'Espresso Beans (Premium)',       'FOOD','DRINKS',          'LB',    '1 lb',   18.99, 'OZ',      16.000, 1.0000, 'OZ',     16.00, 0.0000, null,      5.0,  5.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- Coffee Liqueur (for Espresso Martini)
  (348, 3, 'ING48', 'Coffee Liqueur (Kahlua)',        'BAR', 'LIQUOR',          'LITER', '12 bt',  14.99, 'OZ_FLUID',33.8000, 1.0000,'ML',   1000.00, 0.0000, null,      6.0,  6.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- Tequila Blanco (for Spicy Paloma)
  (349, 3, 'ING49', 'Tequila Blanco',                 'BAR', 'LIQUOR',          'LITER', '12 bt',  15.99, 'OZ_FLUID',33.8000, 1.0000,'ML',   1000.00, 0.0000, null,      6.0,  6.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- House Wine Rosé (for Frozen Rosé)
  (350, 3, 'ING50', 'House Wine Rosé',                 'BAR', 'WINE',            'LITER', '12 bt',   9.99, 'OZ_FLUID',33.8000, 1.0000,'ML',   1000.00, 0.0000, null,     12.0, 12.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- Orange Juice (for Citrus Fizz + cocktails)
  (351, 3, 'ING51', 'Orange Juice (Fresh)',           'FOOD','BEVERAGES',       'EACH',  '12 bt',   5.99, 'OZ_FLUID', 16.00, 1.0000,'OZ_FLUID', 16.00, 0.0000, null,     12.0, 12.0, 101, 5,  true, '2026-04-01','2026-04-01'),
  -- Soda Water (for mocktails + cocktails)
  (352, 3, 'ING52', 'Soda Water',                     'FOOD','BEVERAGES',       'EACH',  '24 cs',   8.99, 'OZ_FLUID', 12.00, 1.0000,'OZ_FLUID', 12.00, 0.0000, null,     24.0, 24.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- Tonic Water (for Gin & Tonic)
  (353, 3, 'ING53', 'Tonic Water',                    'FOOD','BEVERAGES',       'EACH',  '24 cs',   9.99, 'OZ_FLUID', 12.00, 1.0000,'OZ_FLUID', 12.00, 0.0000, null,     18.0, 18.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- Ginger Beer (for Moscow Mule + mocktails)
  (354, 3, 'ING54', 'Ginger Beer',                     'FOOD','BEVERAGES',       'EACH',  '24 cs',  10.99, 'OZ_FLUID', 12.00, 1.0000,'OZ_FLUID', 12.00, 0.0000, null,     18.0, 18.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- Black Tea (for iced tea)
  (355, 3, 'ING55', 'Black Tea (Assam)',               'FOOD','BEVERAGES',       'LB',    '1 lb',    8.99, 'OZ',      16.000, 1.0000, 'OZ',     16.00, 0.0000, null,      8.0,  8.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- Green Tea (for matcha base)
  (356, 3, 'ING56', 'Green Tea (Sencha)',               'FOOD','BEVERAGES',       'LB',    '1 lb',   12.99, 'OZ',      16.000, 1.0000, 'OZ',     16.00, 0.0000, null,      6.0,  6.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- Matcha Powder (for Matcha Cooler)
  (357, 3, 'ING57', 'Matcha Powder (Ceremonial)',       'FOOD','BEVERAGES',       'CAN',   '1 lb',   29.99, 'OZ',       4.000, 1.0000, 'OZ',      4.00, 0.0000, null,      4.0,  4.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- Coconut Milk (for Matcha Cooler)
  (358, 3, 'ING58', 'Coconut Milk (Unsweetened)',       'FOOD','BEVERAGES',       'CAN',   '12 cs',   3.99, 'OZ_FLUID', 14.00, 1.0000,'OZ_FLUID', 14.00, 0.0000, null,     12.0, 12.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- Simple Syrup (for cocktails)
  (359, 3, 'ING59', 'Simple Syrup',                    'BAR', 'BAR_CONSUMABLES','BOTTLE','12 bt',   6.99, 'OZ_FLUID', 12.00, 1.0000,'OZ_FLUID', 12.00, 0.0000, null,      6.0,  6.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- Agave Nectar (for cocktails + mocktails)
  (360, 3, 'ING60', 'Agave Nectar',                    'BAR', 'BAR_CONSUMABLES','BOTTLE','12 bt',   7.99, 'OZ_FLUID', 12.00, 1.0000,'OZ_FLUID', 12.00, 0.0000, null,      6.0,  6.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- House Red Wine (for by-glass sales)
  (361, 3, 'ING61', 'House Wine Red',                   'BAR', 'WINE',            'LITER', '12 bt',   8.99, 'OZ_FLUID',33.8000, 1.0000,'ML',   1000.00, 0.0000, null,     12.0, 12.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- House White Wine (for by-glass sales)
  (362, 3, 'ING62', 'House Wine White',                 'BAR', 'WINE',            'LITER', '12 bt',   8.99, 'OZ_FLUID',33.8000, 1.0000,'ML',   1000.00, 0.0000, null,     12.0, 12.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- Draft Beer (for draft pour)
  (363, 3, 'ING63', 'Draft Beer (Lager)',               'BAR', 'DRAFT_BEER',      'KEG',   '1/2 bbl', 85.00, 'OZ_FLUID',640.00, 1.0000,'OZ_FLUID', 640.00, 0.0000, null,     2.0,  2.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- IPA Draft Beer
  (364, 3, 'ING64', 'Draft Beer (IPA)',                 'BAR', 'DRAFT_BEER',      'KEG',   '1/2 bbl', 95.00, 'OZ_FLUID',640.00, 1.0000,'OZ_FLUID', 640.00, 0.0000, null,     2.0,  2.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- Bottled Beer
  (365, 3, 'ING65', 'Bottled Beer (Selection)',         'BAR', 'BOTTLE_BEER',    'CASE',  '24 cs',  28.00, 'OZ_FLUID',288.00, 1.0000,'OZ_FLUID', 288.00, 0.0000, null,     24.0, 24.0, 105, NULL, true, '2026-04-01','2026-04-01'),
  -- Whole Milk (for cappuccino)
  (366, 3, 'ING66', 'Whole Milk',                       'FOOD','DAIRY',           'GALLON','4 gal',   4.99, 'GALLON', 1.0000, 1.0000,'GALLON', 1.0000, 8.0000, 'VOLUME', 8.0, 8.0, 104, 7,  true, '2026-04-01','2026-04-01'),
  -- Oat Milk (for latte alternatives)
  (367, 3, 'ING67', 'Oat Milk (Barista)',               'FOOD','DAIRY',           'CASE',  '12 cs',  6.99, 'EACH',   1.0000, 1.0000,'EACH',   1.0000, 0.0000, null,     12.0, 12.0, 104, NULL, true, '2026-04-01','2026-04-01')
ON CONFLICT (restaurant_id, item_code) DO NOTHING;

-- ═════════════════════════════════════════════════════════════════════════
-- STEP 2: ADD NEW MENU COST GROUPS
-- ═════════════════════════════════════════════════════════════════════════

-- Signature Cocktails (LIQUOR)
INSERT INTO menu_cost_group
  (id, restaurant_id, name, revenue_category, display_order, created_at)
VALUES
  (309, 3, 'Signature Cocktails', 'LIQUOR', 9, '2026-04-01'),
  (310, 3, 'Mocktails',            'SOFT_BEV', 10, '2026-04-01')
ON CONFLICT DO NOTHING;

-- ═════════════════════════════════════════════════════════════════════════
-- STEP 3: ADD NEW MARKET-INFORMED MENU ITEMS
-- ═════════════════════════════════════════════════════════════════════════
-- Prices reflect Midtown competitive analysis ($60-75 avg check target)
-- Food cost target: 28-30% (down from 30% in V6, more competitive)
-- Tax: 10% (NYC)

-- ── BREAKFAST & BRUNCH (group 301) — updated prices ──
INSERT INTO menu_item
  (id, restaurant_id, group_id, pos_id, name, sell_price, target_fc_pct, plate_cost,
   is_active, display_order, created_at, updated_at)
VALUES
  -- Updated/added items per market research
  (4001, 3, 301, 'BRK05', 'Smash Burger with Fries',         18.00, 0.28, 4.50, true, 5, '2026-04-01','2026-04-01'),
  (4002, 3, 301, 'BRK06', 'Miso Scotch Egg',                  15.00, 0.28, 3.75, true, 6, '2026-04-01','2026-04-01')
ON CONFLICT (restaurant_id, pos_id) DO NOTHING;

-- ── SMALL PLATES (group 302) — market-informed additions ──
INSERT INTO menu_item
  (id, restaurant_id, group_id, pos_id, name, sell_price, target_fc_pct, plate_cost,
   is_active, display_order, created_at, updated_at)
VALUES
  (4010, 3, 302, 'SPL05', 'Mezze Plate',                       16.00, 0.28, 4.00, true, 5, '2026-04-01','2026-04-01'),
  (4011, 3, 302, 'SPL06', 'Jumbo Shrimp Cocktail',              18.00, 0.30, 4.50, true, 6, '2026-04-01','2026-04-01')
ON CONFLICT (restaurant_id, pos_id) DO NOTHING;

-- ── MAINS (group 303) — market-informed additions ──
INSERT INTO menu_item
  (id, restaurant_id, group_id, pos_id, name, sell_price, target_fc_pct, plate_cost,
   is_active, display_order, created_at, updated_at)
VALUES
  (4020, 3, 303, 'MN07',  'Rotisserie Half Chicken w/ Herb Butter & Frites', 28.00, 0.24, 5.88, true, 5, '2026-04-01','2026-04-01'),
  (4021, 3, 303, 'MN09',  'Spicy Rigatoni Vodka',               22.00, 0.19, 3.74, true, 7, '2026-04-01','2026-04-01'),
  (4022, 3, 303, 'MN10',  'Chicken Paillard w/ Arugula & Lemon', 26.00, 0.26, 5.98, true, 8, '2026-04-01','2026-04-01'),
  (4023, 3, 303, 'MN11',  'Braised Short Rib w/ Creamy Polenta', 34.00, 0.30, 9.09, true, 9, '2026-04-01','2026-04-01'),
  (4024, 3, 303, 'MN12',  'Market Fish of the Day',              0.00,  0.30, 0.00, true, 10,'2026-04-01','2026-04-01')
ON CONFLICT (restaurant_id, pos_id) DO NOTHING;

-- ── DESSERTS (group 305) — market-informed update ──
-- Replace NY Cheesecake with Basque Cheesecake (trending +44%)
UPDATE menu_item SET name = 'Basque Cheesecake w/ Berry Compote',
                    sell_price = 14.00, target_fc_pct = 0.23, plate_cost = 2.85,
                    updated_at = '2026-04-01'
WHERE restaurant_id = 3 AND pos_id = 'DES01';

-- ── SIGNATURE COCKTAILS (group 309) — NEW ──
INSERT INTO menu_item
  (id, restaurant_id, group_id, pos_id, name, sell_price, target_fc_pct, plate_cost,
   is_active, display_order, created_at, updated_at)
VALUES
  (4030, 3, 309, 'LIQ01', 'The Market Table (Mezcal, Aperol, Grapefruit)',  17.00, 0.18, 2.72, true, 1, '2026-04-01','2026-04-01'),
  (4031, 3, 309, 'LIQ02', 'Espresso Martini',                                16.00, 0.20, 2.88, true, 2, '2026-04-01','2026-04-01'),
  (4032, 3, 309, 'LIQ03', 'Spicy Paloma (Tequila, Grapefruit, Jalapeño)',  16.00, 0.20, 2.88, true, 3, '2026-04-01','2026-04-01'),
  (4033, 3, 309, 'LIQ04', 'Frozen Rosé (Seasonal)',                         15.00, 0.18, 2.40, true, 4, '2026-04-01','2026-04-01')
ON CONFLICT (restaurant_id, pos_id) DO NOTHING;

-- ── MOCKTAILS (group 310) — NEW (trend: +52% mocktail growth) ──
INSERT INTO menu_item
  (id, restaurant_id, group_id, pos_id, name, sell_price, target_fc_pct, plate_cost,
   is_active, display_order, created_at, updated_at)
VALUES
  (4040, 3, 310, 'MCK01', 'Seedlip Garden (NA Botanical, Cucumber, Tonic)', 12.00, 0.25, 2.25, true, 1, '2026-04-01','2026-04-01'),
  (4041, 3, 310, 'MCK02', 'Spiced Pear Spritz (NA, Ginger, Lime)',           11.00, 0.25, 2.06, true, 2, '2026-04-01','2026-04-01'),
  (4042, 3, 310, 'MCK03', 'Matcha Cooler (Matcha, Coconut, Lime)',           10.00, 0.25, 1.88, true, 3, '2026-04-01','2026-04-01'),
  (4043, 3, 310, 'MCK04', 'Citrus Fizz (Orange, Lemon, Soda, Bitters)',       9.00, 0.20, 1.35, true, 4, '2026-04-01','2026-04-01')
ON CONFLICT (restaurant_id, pos_id) DO NOTHING;

-- ── WINE BY THE GLASS (group 307) — House wines added in V9
INSERT INTO menu_item
  (id, restaurant_id, group_id, pos_id, name, sell_price, target_fc_pct, plate_cost,
   is_active, display_order, created_at, updated_at)
VALUES
  (4050, 3, 307, 'WNG01', 'House Rosé (Glass)',         12.00, 0.25, 2.40, true, 1, '2026-04-01','2026-04-01'),
  (4051, 3, 307, 'WNG02', 'House White (Glass)',        12.00, 0.25, 2.40, true, 2, '2026-04-01','2026-04-01'),
  (4052, 3, 307, 'WNG03', 'House Red (Glass)',          12.00, 0.25, 2.40, true, 3, '2026-04-01','2026-04-01')
ON CONFLICT (restaurant_id, pos_id) DO NOTHING;

-- ── CRAFT BEER (group 308) — Draft & bottled options
INSERT INTO menu_item
  (id, restaurant_id, group_id, pos_id, name, sell_price, target_fc_pct, plate_cost,
   is_active, display_order, created_at, updated_at)
VALUES
  (4060, 3, 308, 'BPR01', 'Draft Beer (Local Lager)',     8.00, 0.20, 1.60, true, 1, '2026-04-01','2026-04-01'),
  (4061, 3, 308, 'BPR02', 'Draft IPA (Local Hoppy)',      9.00, 0.20, 1.80, true, 2, '2026-04-01','2026-04-01'),
  (4062, 3, 308, 'BTP01', 'Bottled Beer (Selection)',     7.00, 0.25, 1.40, true, 3, '2026-04-01','2026-04-01')
ON CONFLICT (restaurant_id, pos_id) DO NOTHING;

-- ── COFFEE & TEA (group 306) ── already exists from V6
-- Group 306 'Coffee & Tea' already exists from V6, skipping duplicate insert
-- COF01-COF04 already exist from V6 as menu_item IDs 3061-3064;
-- only insert truly new items: COF05 (Iced Coffee), TEA01-TEA03

INSERT INTO menu_item
  (id, restaurant_id, group_id, pos_id, name, sell_price, target_fc_pct, plate_cost,
   is_active, display_order, created_at, updated_at)
VALUES
  (4074, 3, 306, 'COF05', 'Iced Coffee',                 4.50, 0.20, 0.90, true, 5, '2026-04-01','2026-04-01'),
  (4075, 3, 306, 'TEA01', 'Hot Tea (Assam)',              3.00, 0.25, 0.60, true, 6, '2026-04-01','2026-04-01'),
  (4076, 3, 306, 'TEA02', 'Iced Tea (Black)',             4.00, 0.25, 0.80, true, 7, '2026-04-01','2026-04-01'),
  (4077, 3, 306, 'TEA03', 'Matcha Latte (Hot)',           6.00, 0.22, 1.32, true, 8, '2026-04-01','2026-04-01')
ON CONFLICT (restaurant_id, pos_id) DO NOTHING;

-- ═════════════════════════════════════════════════════════════════════════
-- STEP 4: ADD RECIPES FOR NEW MENU ITEMS
-- ═════════════════════════════════════════════════════════════════════════

INSERT INTO recipe
  (id, restaurant_id, menu_item_id, name, recipe_type, station, yield_quantity, yield_unit, is_active, created_at, updated_at)
VALUES
  -- BRK05: Smash Burger
  (4001, 3, 4001, 'Smash Burger — Recipe',          'PLATE', 'GRILL', 1.000, 'EACH', true, '2026-04-01','2026-04-01'),
  -- BRK06: Miso Scotch Egg
  (4002, 3, 4002, 'Miso Scotch Egg — Recipe',        'PLATE', 'FRY', 1.000, 'EACH', true, '2026-04-01','2026-04-01'),
  -- SPL05: Mezze Plate
  (4010, 3, 4010, 'Mezze Plate — Recipe',            'PLATE', 'SALAD', 1.000, 'EACH', true, '2026-04-01','2026-04-01'),
  -- SPL06: Shrimp Cocktail
  (4011, 3, 4011, 'Jumbo Shrimp Cocktail — Recipe',  'PLATE', 'SALAD', 1.000, 'EACH', true, '2026-04-01','2026-04-01'),
  -- MN07: Rotisserie Half Chicken
  (4020, 3, 4020, 'Rotisserie Half Chicken — Recipe','PLATE', 'GRILL', 1.000, 'EACH', true, '2026-04-01','2026-04-01'),
  -- MN09: Spicy Rigatoni Vodka
  (4021, 3, 4021, 'Spicy Rigatoni Vodka — Recipe',   'PLATE', 'SAUTE', 1.000, 'EACH', true, '2026-04-01','2026-04-01'),
  -- MN10: Chicken Paillard
  (4022, 3, 4022, 'Chicken Paillard — Recipe',       'PLATE', 'GRILL', 1.000, 'EACH', true, '2026-04-01','2026-04-01'),
  -- MN11: Braised Short Rib
  (4023, 3, 4023, 'Braised Short Rib — Recipe',      'PLATE', 'SAUTE', 1.000, 'EACH', true, '2026-04-01','2026-04-01'),
  -- MN12: Market Fish (placeholder)
  (4024, 3, 4024, 'Market Fish of the Day — Recipe',  'PLATE', 'SAUTE', 1.000, 'EACH', true, '2026-04-01','2026-04-01'),
  -- LIQ01: The Market Table cocktail
  (4030, 3, 4030, 'The Market Table Cocktail — Recipe','PLATE', 'BAR', 1.000, 'EACH', true, '2026-04-01','2026-04-01'),
  -- LIQ02: Espresso Martini
  (4031, 3, 4031, 'Espresso Martini — Recipe',       'PLATE', 'BAR', 1.000, 'EACH', true, '2026-04-01','2026-04-01'),
  -- LIQ03: Spicy Paloma
  (4032, 3, 4032, 'Spicy Paloma — Recipe',           'PLATE', 'BAR', 1.000, 'EACH', true, '2026-04-01','2026-04-01'),
  -- LIQ04: Frozen Rosé
  (4033, 3, 4033, 'Frozen Rosé — Recipe',             'PLATE', 'BAR', 1.000, 'EACH', true, '2026-04-01','2026-04-01'),
  -- MCK01: Seedlip Garden
  (4040, 3, 4040, 'Seedlip Garden — Recipe',         'PLATE', 'BAR', 1.000, 'EACH', true, '2026-04-01','2026-04-01'),
  -- MCK02: Spiced Pear Spritz
  (4041, 3, 4041, 'Spiced Pear Spritz — Recipe',     'PLATE', 'BAR', 1.000, 'EACH', true, '2026-04-01','2026-04-01'),
  -- MCK03: Matcha Cooler
  (4042, 3, 4042, 'Matcha Cooler — Recipe',          'PLATE', 'BAR', 1.000, 'EACH', true, '2026-04-01','2026-04-01'),
  -- MCK04: Citrus Fizz
  (4043, 3, 4043, 'Citrus Fizz — Recipe',             'PLATE', 'BAR', 1.000, 'EACH', true, '2026-04-01','2026-04-01')
ON CONFLICT (restaurant_id, menu_item_id, name) DO NOTHING;

-- ═════════════════════════════════════════════════════════════════════════
-- STEP 5: RECIPE INGREDIENT LINES FOR NEW ITEMS
-- ═════════════════════════════════════════════════════════════════════════

-- BRK05: Smash Burger (beef patty + bun + lettuce + tomato + sauce)
INSERT INTO recipe_ingredient_line
  (id, recipe_id, ingredient_id, line_number, quantity_ru, recipe_unit)
VALUES
  (40001, 4001, 307, 1, 0.33, 'LB'),   -- Beef tenderloin 5.3oz patty
  (40002, 4001, 316, 2, 0.15, 'LB'),   -- Bun/flour
  (40003, 4001, 302, 3, 0.10, 'LB'),   -- Tomato
  (40004, 4001, 304, 4, 0.10, 'LB'),   -- Arugula (replaces lettuce placeholder)
  (40005, 4001, 313, 5, 0.05, 'LB'),   -- Butter for toasting bun
  (40006, 4001, 345, 6, 0.10, 'LB'),   -- Arugula

  -- BRK06: Miso Scotch Egg (egg + sausage + panko + miso)
  (40007, 4002, 305, 1, 1.0, 'EACH'),   -- Egg
  (40008, 4002, 316, 2, 0.10, 'LB'),    -- Flour/panko
  (40009, 4002, 313, 3, 0.05, 'LB'),    -- Butter for frying

  -- SPL05: Mezze Plate (hummus + labneh + olives + pita)
  (40010, 4010, 330, 1, 1.0, 'EACH'),   -- Labneh
  (40011, 4010, 331, 2, 1.0, 'EACH'),   -- Chickpeas (hummus base)
  (40012, 4010, 333, 3, 2.0, 'OZ_FLUID'), -- Kalamata olives
  (40013, 4010, 332, 4, 2.0, 'EACH'),    -- Pita bread
  (40014, 4010, 318, 5, 0.50, 'LITER'),  -- Olive oil drizzle
  (40015, 4010, 306, 6, 0.25, 'BUNCH'),  -- Fresh herbs

  -- SPL06: Jumbo Shrimp Cocktail (shrimp + cocktail sauce + horseradish + lemon)
  (40016, 4011, 325, 1, 0.50, 'LB'),     -- Jumbo shrimp
  (40017, 4011, 343, 2, 2.0, 'OZ_FLUID'), -- Cocktail sauce
  (40018, 4011, 342, 3, 0.50, 'OZ'),     -- Horseradish
  (40019, 4011, 339, 4, 1.0, 'EACH'),    -- Lemon wedge

  -- MN07: Rotisserie Half Chicken (whole chicken + herb butter + frites)
  (40020, 4020, 321, 1, 1.0, 'EACH'),    -- Whole chicken (half)
  (40021, 4020, 313, 2, 0.10, 'LB'),     -- Herb butter
  (40022, 4020, 329, 3, 0.02, 'OZ'),     -- Smoked paprika rub
  (40023, 4020, 306, 4, 0.50, 'BUNCH'),   -- Fresh herbs (rosemary, thyme)
  (40024, 4020, 339, 5, 1.0, 'EACH'),    -- Lemon halves

  -- MN09: Spicy Rigatoni Vodka (rigatoni + vodka + cream + tomato + parmesan)
  (40025, 4021, 322, 1, 0.25, 'LB'),     -- Rigatoni pasta
  (40026, 4021, 323, 2, 0.50, 'OZ_FLUID'), -- Vodka
  (40027, 4021, 314, 3, 0.25, 'GALLON'), -- Heavy cream
  (40028, 4021, 302, 4, 0.25, 'LB'),     -- Roma tomatoes (sauce base)
  (40029, 4021, 329, 5, 0.05, 'OZ'),     -- Smoked paprika (for heat)

  -- MN10: Chicken Paillard (chicken breast + arugula + lemon + dijon)
  (40030, 4022, 321, 1, 1.0, 'EACH'),    -- Chicken (1 breast)
  (40031, 4022, 345, 2, 0.25, 'LB'),     -- Baby arugula
  (40032, 4022, 339, 3, 1.0, 'EACH'),    -- Lemon
  (40033, 4022, 344, 4, 0.50, 'OZ'),      -- Dijon mustard
  (40034, 4022, 318, 5, 0.50, 'OZ_FLUID'), -- Olive oil

  -- MN11: Braised Short Rib w/ Creamy Polenta
  (40035, 4023, 341, 1, 0.50, 'LB'),     -- Short rib (per portion)
  (40036, 4023, 326, 2, 0.20, 'LB'),     -- Polenta
  (40037, 4023, 314, 3, 0.25, 'GALLON'), -- Heavy cream (for polenta)
  (40038, 4023, 313, 4, 0.10, 'LB'),     -- Butter (finish polenta)
  (40039, 4023, 328, 5, 0.03, 'OZ'),     -- Seaweed/nori garnish (umami)

  -- MN12: Market Fish (placeholder — market price, uses salmon as base)
  (40040, 4024, 309, 1, 0.50, 'LB'),     -- Salmon (base)
  (40041, 4024, 313, 2, 0.05, 'LB'),     -- Butter
  (40042, 4024, 339, 3, 1.0, 'EACH'),    -- Lemon

  -- LIQ01: The Market Table cocktail (mezcal + aperol + grapefruit)
  (40050, 4030, 324, 1, 1.5, 'OZ_FLUID'),  -- Mezcal 1.5oz
  (40051, 4030, 334, 2, 1.0, 'OZ_FLUID'),  -- Aperol 1oz
  (40052, 4030, 335, 3, 2.0, 'OZ_FLUID'),  -- Grapefruit juice 2oz
  (40053, 4030, 359, 4, 0.25, 'OZ_FLUID'), -- Simple syrup 0.25oz

  -- LIQ02: Espresso Martini (vodka + espresso + coffee liqueur)
  (40054, 4031, 323, 1, 2.0, 'OZ_FLUID'),  -- Vodka 2oz
  (40055, 4031, 347, 2, 1.0, 'OZ'),        -- Espresso 1oz (strong)
  (40056, 4031, 348, 3, 0.5, 'OZ_FLUID'), -- Coffee liqueur 0.5oz

  -- LIQ03: Spicy Paloma (tequila + grapefruit + jalapeño + lime)
  (40057, 4032, 349, 1, 2.0, 'OZ_FLUID'),  -- Tequila 2oz
  (40058, 4032, 335, 2, 2.0, 'OZ_FLUID'),  -- Grapefruit juice 2oz
  (40059, 4032, 336, 3, 0.50, 'LB'),        -- Jalapeño slices
  (40060, 4032, 339, 4, 1.0, 'EACH'),       -- Lime
  (40061, 4032, 359, 5, 0.25, 'OZ_FLUID'), -- Simple syrup

  -- LIQ04: Frozen Rosé (wine + sugar + fruit + mint)
  (40062, 4033, 350, 1, 4.0, 'OZ_FLUID'),  -- Rosé wine 4oz
  (40063, 4033, 359, 2, 0.50, 'OZ_FLUID'), -- Simple syrup 0.5oz
  (40064, 4033, 338, 3, 0.25, 'LB'),       -- Mixed berries

  -- MCK01: Seedlip Garden (NA botanical + tonic + cucumber)
  (40065, 4040, 340, 1, 2.0, 'OZ_FLUID'),  -- Seedlip NA 2oz
  (40066, 4040, 353, 2, 3.0, 'OZ_FLUID'),  -- Tonic water 3oz
  (40067, 4040, 306, 3, 0.25, 'BUNCH'),    -- Fresh mint/cucumber garnish

  -- MCK02: Spiced Pear Spritz (NA pear + ginger + lime + soda)
  (40068, 4041, 339, 1, 1.0, 'EACH'),      -- Lime juice 1 lime
  (40069, 4041, 354, 2, 3.0, 'OZ_FLUID'),  -- Ginger beer 3oz
  (40070, 4041, 352, 3, 2.0, 'OZ_FLUID'),  -- Soda water 2oz
  (40071, 4041, 360, 4, 0.25, 'OZ_FLUID'), -- Agave nectar

  -- MCK03: Matcha Cooler (matcha + coconut + lime + soda)
  (40072, 4042, 357, 1, 0.50, 'OZ'),       -- Matcha powder 0.5oz
  (40073, 4042, 358, 2, 4.0, 'OZ_FLUID'), -- Coconut milk 4oz
  (40074, 4042, 339, 3, 1.0, 'EACH'),     -- Lime
  (40075, 4042, 360, 4, 0.25, 'OZ_FLUID'),-- Agave nectar
  (40076, 4042, 352, 5, 2.0, 'OZ_FLUID'), -- Soda water top-up

  -- MCK04: Citrus Fizz (orange + lemon + soda + bitters)
  (40077, 4043, 351, 1, 2.0, 'OZ_FLUID'),  -- Orange juice 2oz
  (40078, 4043, 339, 2, 1.0, 'EACH'),      -- Lemon 1 each
  (40079, 4043, 352, 3, 4.0, 'OZ_FLUID'), -- Soda water 4oz
  (40080, 4043, 359, 4, 0.25, 'OZ_FLUID') -- Simple syrup
ON CONFLICT DO NOTHING;

-- ═════════════════════════════════════════════════════════════════════════
-- STEP 5B: RECIPES FOR STANDALONE BEVERAGES (Wine, Beer, Coffee)
-- ═════════════════════════════════════════════════════════════════════════

-- Wine by the Glass recipes
INSERT INTO recipe
  (id, restaurant_id, menu_item_id, name, recipe_type, station, yield_quantity, yield_unit, is_active, created_at, updated_at)
VALUES
  (4050, 3, 4050, 'House Rosé — Recipe',      'PLATE', 'BAR', 1.000, 'EACH', true, '2026-04-01','2026-04-01'),
  (4051, 3, 4051, 'House White — Recipe',      'PLATE', 'BAR', 1.000, 'EACH', true, '2026-04-01','2026-04-01'),
  (4052, 3, 4052, 'House Red — Recipe',        'PLATE', 'BAR', 1.000, 'EACH', true, '2026-04-01','2026-04-01'),
  -- Craft Beer recipes
  (4060, 3, 4060, 'Draft Lager — Recipe',       'PLATE', 'BAR', 1.000, 'EACH', true, '2026-04-01','2026-04-01'),
  (4061, 3, 4061, 'Draft IPA — Recipe',         'PLATE', 'BAR', 1.000, 'EACH', true, '2026-04-01','2026-04-01'),
  (4062, 3, 4062, 'Bottled Beer — Recipe',      'PLATE', 'BAR', 1.000, 'EACH', true, '2026-04-01','2026-04-01'),
  -- Coffee & Tea recipes
  -- COF01 Espresso: recipe for V6 menu_item 3061
  (4070, 3, 3061, 'Espresso — Recipe',            'PLATE', 'BAR', 1.000, 'EACH', true, '2026-04-01','2026-04-01'),
  -- COF02 Flat White: recipe for V6 menu_item 3062
  (4071, 3, 3062, 'Flat White — Recipe',         'PLATE', 'BAR', 1.000, 'EACH', true, '2026-04-01','2026-04-01'),
  -- COF03 Matcha Latte: recipe for V6 menu_item 3063
  (4072, 3, 3063, 'Matcha Latte — Recipe',       'PLATE', 'BAR', 1.000, 'EACH', true, '2026-04-01','2026-04-01'),
  -- COF04 Fresh Orange Juice: recipe for V6 menu_item 3064
  (4073, 3, 3064, 'Fresh Orange Juice — Recipe', 'PLATE', 'BAR', 1.000, 'EACH', true, '2026-04-01','2026-04-01'),
  -- COF05: Iced Coffee (new V9 item 4074)
  (4074, 3, 4074, 'Iced Coffee — Recipe',       'PLATE', 'BAR', 1.000, 'EACH', true, '2026-04-01','2026-04-01'),
  -- TEA01: Hot Tea (new V9 item 4075)
  (4075, 3, 4075, 'Hot Tea — Recipe',           'PLATE', 'BAR', 1.000, 'EACH', true, '2026-04-01','2026-04-01'),
  -- TEA02: Iced Tea (new V9 item 4076)
  (4076, 3, 4076, 'Iced Tea — Recipe',         'PLATE', 'BAR', 1.000, 'EACH', true, '2026-04-01','2026-04-01'),
  -- TEA03: Matcha Latte Hot (new V9 item 4077)
  (4077, 3, 4077, 'Matcha Latte — Recipe',    'PLATE', 'BAR', 1.000, 'EACH', true, '2026-04-01','2026-04-01')
ON CONFLICT (restaurant_id, menu_item_id, name) DO NOTHING;

-- Recipe ingredient lines for standalone beverages
INSERT INTO recipe_ingredient_line
  (id, recipe_id, ingredient_id, line_number, quantity_ru, recipe_unit)
VALUES
  -- WNG01: House Rosé
  (40100, 4050, 350, 1, 5.0, 'OZ_FLUID'),   -- Rosé 5oz pour
  -- WNG02: House White
  (40101, 4051, 362, 1, 5.0, 'OZ_FLUID'),  -- White wine 5oz
  -- WNG03: House Red
  (40102, 4052, 361, 1, 5.0, 'OZ_FLUID'),   -- Red wine 5oz
  -- BPR01: Draft Lager
  (40110, 4060, 363, 1, 16.0, 'OZ_FLUID'), -- 16oz draft
  -- BPR02: Draft IPA
  (40111, 4061, 364, 1, 16.0, 'OZ_FLUID'), -- 16oz draft
  -- BTP01: Bottled Beer
  (40112, 4062, 365, 1, 12.0, 'OZ_FLUID'), -- 12oz bottle
  -- COF01: Espresso Single
  (40120, 4070, 347, 1, 0.50, 'OZ'),       -- 0.5oz espresso
  -- COF02: Espresso Double
  (40121, 4071, 347, 1, 1.0, 'OZ'),        -- 1oz espresso
  -- COF03: Americano (espresso + hot water)
  (40122, 4072, 347, 1, 1.0, 'OZ'),         -- 1oz espresso
  (40123, 4072, 352, 2, 6.0, 'OZ_FLUID'),   -- 6oz hot water
  -- COF04: Cappuccino (espresso + milk)
  (40124, 4073, 347, 1, 1.0, 'OZ'),         -- 1oz espresso
  (40125, 4073, 366, 2, 4.0, 'OZ_FLUID'),  -- 4oz steamed milk
  -- COF05: Iced Coffee
  (40126, 4074, 347, 1, 1.0, 'OZ'),        -- 1oz espresso
  (40127, 4074, 352, 2, 8.0, 'OZ_FLUID'),  -- 8oz cold water/ice
  -- TEA01: Hot Tea
  (40130, 4075, 355, 1, 0.25, 'OZ'),       -- 0.25oz tea leaves
  (40131, 4075, 352, 2, 8.0, 'OZ_FLUID'),  -- 8oz hot water
  -- TEA02: Iced Tea
  (40132, 4076, 355, 1, 0.25, 'OZ'),        -- 0.25oz tea leaves
  (40133, 4076, 352, 2, 12.0, 'OZ_FLUID'), -- 12oz cold water/ice
  -- TEA03: Matcha Latte
  (40134, 4077, 357, 1, 0.50, 'OZ'),        -- 0.5oz matcha
  (40135, 4077, 366, 2, 6.0, 'OZ_FLUID')   -- 6oz milk
ON CONFLICT DO NOTHING;

-- ═════════════════════════════════════════════════════════════════════════
-- STEP 6: UPDATE INGREDIENT PREFERRED SUPPLIERS FOR NEW INGREDIENTS
-- ═════════════════════════════════════════════════════════════════════════

-- Poultry → Prime Meats NYC (102)
UPDATE ingredient SET preferred_supplier_id = 102
  WHERE restaurant_id = 3 AND category = 'POULTRY' AND preferred_supplier_id IS NULL;
-- Liquor → Empire Dry Goods (105) — as a distributor
UPDATE ingredient SET preferred_supplier_id = 105
  WHERE restaurant_id = 3 AND category = 'LIQUOR' AND preferred_supplier_id IS NULL;

-- ═════════════════════════════════════════════════════════════════════════
-- STEP 7: UPDATE WEEKLY BUDGET (add liquor revenue split)
-- ═════════════════════════════════════════════════════════════════════════

UPDATE weekly_budget
SET
  liquor_sales_pct = 0.15,      -- 15% liquor (cocktails drive revenue)
  wine_sales_pct   = 0.10,      -- 10% wine (down from 15% — cocktails eat into wine)
  bottle_beer_sales_pct = 0.03, -- 3% bottled beer
  draft_beer_sales_pct = 0.04,  -- 4% draft beer
  soft_bev_sales_pct = 0.11,    -- 11% soft bev (up from 8% — mocktails + coffee)
  food_sales_pct   = 0.57,     -- 57% food (down from 62% — bar takes more share)
  updated_at = '2026-04-01'
WHERE restaurant_id = 3 AND week_start_date = '2026-01-06';

-- ═════════════════════════════════════════════════════════════════════════
-- STEP 8: ADD OPENING STOCK LEDGER ENTRIES FOR NEW INGREDIENTS
-- ═════════════════════════════════════════════════════════════════════════

INSERT INTO inventory_ingredient_ledger
  (id, restaurant_id, ingredient_id, event_type, quantity,
   unit_cost, total_value, reason_code, created_at)
SELECT
  3100 + (ing.id - 320),
  3, ing.id,
  'RECEIVING',
  ing.par_level,
  ing.purchase_unit_price,
  round(ing.par_level * ing.purchase_unit_price, 4),
  'Market-informed menu expansion — Spring 2026',
  '2026-04-01'
FROM ingredient ing
WHERE ing.restaurant_id = 3 AND ing.id >= 321
ON CONFLICT DO NOTHING;

-- ═════════════════════════════════════════════════════════════════════════
-- SUMMARY OF V9 CHANGES
-- ═════════════════════════════════════════════════════════════════════════
-- New ingredients: 47 (ING21-ING67) — chicken, rigatoni, shrimp, mezcal,
--   vodka, aperol, hot honey, seaweed, labneh, pita, olives, polenta,
--   jalapeño, grapefruit, cream cheese, berries, lemon, seedlip,
--   short rib, horseradish, cocktail sauce, dijon, arugula, flatbread,
--   smoked paprika, espresso beans, coffee liqueur, tequila, house wines,
--   orange juice, soda, tonic, ginger beer, tea, matcha, coconut milk,
--   simple syrup, agave, draft beer, bottled beer, milk, oat milk
-- New menu groups: 4 (Signature Cocktails, Mocktails, Coffee & Tea)
-- New menu items: 28 (Smash Burger, Miso Scotch Egg, Mezze Plate,
--   Shrimp Cocktail, Rotisserie Chicken, Spicy Rigatoni, Chicken Paillard,
--   Braised Short Rib, Market Fish, 4 Cocktails, 4 Mocktails,
--   3 Wine by Glass, 3 Beer, 8 Coffee & Tea)
-- Updated menu items: 1 (NY Cheesecake → Basque Cheesecake)
-- New recipes: 30
-- New recipe ingredient lines: 80
-- Updated weekly budget: liquor 15%, wine 10%, food 57%, soft bev 11%
-- Total menu items now: 57 (from 27 in V6)
-- Revenue category breakdown:
--   FOOD: 22 items
--   SOFT_BEV: 12 items (8 coffee/tea + 4 mocktails)
--   WINE: 7 items (4 cocktails + 3 by-glass)
--   BEER: 3 items
--   LIQUOR: 4 items
--   Total: 48 items
-- ═════════════════════════════════════════════════════════════════════════