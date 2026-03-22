-- V13 Create Master Category Table and Seed Exhaustive Food Categories

CREATE TABLE master_category (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    storage_condition VARCHAR(255),
    is_perishable BOOLEAN NOT NULL DEFAULT FALSE,
    attributes JSONB,
    parent_id UUID,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT fk_master_category_parent FOREIGN KEY (parent_id) REFERENCES master_category(id)
);

-- Seed Main Categories
INSERT INTO master_category (id, name, description, icon, storage_condition, is_perishable, attributes, parent_id, created_at, updated_at)
VALUES 
('f0000000-0000-0000-0000-000000000001', 'Fresh Produce', 'Fruits, Vegetables, and Fresh Herbs', 'leaf', 'CHILLED', TRUE, '{"tax_category": "ZERO"}', NULL, NOW(), NOW()),
('f0000000-0000-0000-0000-000000000002', 'Meat & Seafood', 'Fresh and Frozen Meat and Seafood products', 'drumstick', 'CHILLED', TRUE, '{"tax_category": "ZERO"}', NULL, NOW(), NOW()),
('f0000000-0000-0000-0000-000000000003', 'Dairy & Alternatives', 'Milk, Cheese, Yogurt, and Non-dairy alternatives', 'milk', 'CHILLED', TRUE, '{"tax_category": "STANDARD"}', NULL, NOW(), NOW()),
('f0000000-0000-0000-0000-000000000004', 'Pantry Staples', 'Grains, Pasta, Baking ingredients, and Spices', 'archive', 'AMBIENT', FALSE, '{"tax_category": "STANDARD"}', NULL, NOW(), NOW()),
('f0000000-0000-0000-0000-000000000005', 'Frozen Foods', 'Frozen meals, fruits, and desserts', 'snowflake', 'FROZEN', FALSE, '{"tax_category": "STANDARD"}', NULL, NOW(), NOW()),
('f0000000-0000-0000-0000-000000000006', 'Beverages', 'Water, Juices, Soft Drinks, Coffee, and Tea', 'coffee', 'AMBIENT', FALSE, '{"tax_category": "STANDARD"}', NULL, NOW(), NOW()),
('f0000000-0000-0000-0000-000000000007', 'Snacks & Sweets', 'Chips, Cookies, and Candy', 'cookie', 'AMBIENT', FALSE, '{"tax_category": "STANDARD"}', NULL, NOW(), NOW()),
('f0000000-0000-0000-0000-000000000008', 'Ready Meals & Deli', 'Prepared meals, Deli meats, and Sandwiches', 'clock', 'CHILLED', TRUE, '{"tax_category": "STANDARD"}', NULL, NOW(), NOW()),
('f0000000-0000-0000-0000-000000000009', 'Specialty & Dietary', 'Organic, Gluten-free, and Vegan products', 'star', 'AMBIENT', FALSE, '{"tax_category": "STANDARD"}', NULL, NOW(), NOW()),
('f0000000-0000-0000-0000-000000000010', 'Pet Food', 'Dog and Cat food and treats', 'dog', 'AMBIENT', FALSE, '{"tax_category": "STANDARD"}', NULL, NOW(), NOW());

-- Seed Sub-Categories (Fresh Produce)
INSERT INTO master_category (id, name, parent_id, storage_condition, is_perishable, created_at, updated_at) VALUES 
(gen_random_uuid(), 'Fruits', 'f0000000-0000-0000-0000-000000000001', 'CHILLED', TRUE, NOW(), NOW()),
(gen_random_uuid(), 'Vegetables', 'f0000000-0000-0000-0000-000000000001', 'CHILLED', TRUE, NOW(), NOW()),
(gen_random_uuid(), 'Herbs', 'f0000000-0000-0000-0000-000000000001', 'CHILLED', TRUE, NOW(), NOW());

-- Seed Sub-Categories (Meat & Seafood)
INSERT INTO master_category (id, name, parent_id, storage_condition, is_perishable, created_at, updated_at) VALUES 
(gen_random_uuid(), 'Beef', 'f0000000-0000-0000-0000-000000000002', 'CHILLED', TRUE, NOW(), NOW()),
(gen_random_uuid(), 'Poultry', 'f0000000-0000-0000-0000-000000000002', 'CHILLED', TRUE, NOW(), NOW()),
(gen_random_uuid(), 'Pork', 'f0000000-0000-0000-0000-000000000002', 'CHILLED', TRUE, NOW(), NOW()),
(gen_random_uuid(), 'Seafood', 'f0000000-0000-0000-0000-000000000002', 'CHILLED', TRUE, NOW(), NOW());

-- Seed Sub-Categories (Dairy)
INSERT INTO master_category (id, name, parent_id, storage_condition, is_perishable, created_at, updated_at) VALUES 
(gen_random_uuid(), 'Milk & Cream', 'f0000000-0000-0000-0000-000000000003', 'CHILLED', TRUE, NOW(), NOW()),
(gen_random_uuid(), 'Cheese', 'f0000000-0000-0000-0000-000000000003', 'CHILLED', TRUE, NOW(), NOW()),
(gen_random_uuid(), 'Yogurt', 'f0000000-0000-0000-0000-000000000003', 'CHILLED', TRUE, NOW(), NOW()),
(gen_random_uuid(), 'Eggs', 'f0000000-0000-0000-0000-000000000003', 'CHILLED', TRUE, NOW(), NOW());

-- Seed Sub-Categories (Pantry Staples)
INSERT INTO master_category (id, name, parent_id, storage_condition, is_perishable, created_at, updated_at) VALUES 
(gen_random_uuid(), 'Grains & Pasta', 'f0000000-0000-0000-0000-000000000004', 'AMBIENT', FALSE, NOW(), NOW()),
(gen_random_uuid(), 'Baking Ingredients', 'f0000000-0000-0000-0000-000000000004', 'AMBIENT', FALSE, NOW(), NOW()),
(gen_random_uuid(), 'Oils & Vinegars', 'f0000000-0000-0000-0000-000000000004', 'AMBIENT', FALSE, NOW(), NOW()),
(gen_random_uuid(), 'Spices & Seasonings', 'f0000000-0000-0000-0000-000000000004', 'AMBIENT', FALSE, NOW(), NOW());

-- Seed Sub-Categories (Beverages)
INSERT INTO master_category (id, name, parent_id, storage_condition, is_perishable, created_at, updated_at) VALUES 
(gen_random_uuid(), 'Water', 'f0000000-0000-0000-0000-000000000006', 'AMBIENT', FALSE, NOW(), NOW()),
(gen_random_uuid(), 'Juices', 'f0000000-0000-0000-0000-000000000006', 'CHILLED', TRUE, NOW(), NOW()),
(gen_random_uuid(), 'Soft Drinks', 'f0000000-0000-0000-0000-000000000006', 'AMBIENT', FALSE, NOW(), NOW()),
(gen_random_uuid(), 'Coffee & Tea', 'f0000000-0000-0000-0000-000000000006', 'AMBIENT', FALSE, NOW(), NOW());
