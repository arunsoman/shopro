-- V2__add_default_course.sql
-- Add default_course to menu_category for auto-coursing logic.

ALTER TABLE menu_category ADD COLUMN default_course INTEGER NOT NULL DEFAULT 1;

-- Update existing categories based on common hospitality standards
UPDATE menu_category SET default_course = 1 WHERE name ILIKE '%Starter%' OR name ILIKE '%Appetizer%' OR name ILIKE '%Soup%' OR name ILIKE '%Salad%';
UPDATE menu_category SET default_course = 2 WHERE name ILIKE '%Main%' OR name ILIKE '%Burger%' OR name ILIKE '%Steak%' OR name ILIKE '%Pasta%';
UPDATE menu_category SET default_course = 3 WHERE name ILIKE '%Dessert%' OR name ILIKE '%Sweet%';
UPDATE menu_category SET default_course = 4 WHERE name ILIKE '%Drink%' OR name ILIKE '%Beverage%' OR name ILIKE '%Wine%' OR name ILIKE '%Cocktail%';
