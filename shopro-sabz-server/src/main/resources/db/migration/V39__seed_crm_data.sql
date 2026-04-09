-- V22__seed_crm_data.sql
-- Overwrites and expands seed data for Loyalty Tiers, Customer Profiles, Orders, and Feedback for realism.

-- 1. Tiers (Ensure all required tiers exist)
INSERT INTO loyalty_tier (id, name, spend_threshold, point_multiplier, version)
VALUES 
('a2000000-0000-0000-0000-000000000001', 'BRONZE', 0.00, 1.00, 0),
('a2000000-0000-0000-0000-000000000002', 'SILVER', 1000.00, 1.25, 0),
('a2000000-0000-0000-0000-000000000003', 'GOLD', 5000.00, 1.50, 0),
('a2000000-0000-0000-0000-000000000004', 'PLATINUM', 10000.00, 2.00, 0)
ON CONFLICT (name) DO NOTHING;

-- 2. Bulk Seed Customers (50 records)
-- Using a temporary table to handle references
CREATE TEMP TABLE temp_customers (
    first_name VARCHAR(50), 
    last_name VARCHAR(50), 
    phone VARCHAR(20), 
    email VARCHAR(100), 
    tier_name VARCHAR(50), 
    spend NUMERIC(12,2), 
    points INTEGER, 
    visits INTEGER, 
    last_visit INTERVAL, 
    is_churned BOOLEAN
);

INSERT INTO temp_customers VALUES
('Emma', 'Wilson', '+971501112222', 'emma.w@example.com', 'PLATINUM', 12500.00, 2500, 42, '2 days', false),
('Liam', 'Smith', '+971502223333', 'liam.s@example.com', 'GOLD', 6200.00, 800, 18, '5 days', false),
('Noah', 'Jones', '+971503334444', 'noah.j@example.com', 'SILVER', 2100.00, 350, 8, '12 days', false),
('Olivia', 'Garcia', '+971504445555', 'olivia.g@example.com', 'BRONZE', 450.00, 120, 3, '45 days', false),
('Ava', 'Miller', '+971505556666', 'ava.m@example.com', 'SILVER', 1800.00, 400, 12, '8 days', false),
('Sophia', 'Davis', '+971506667777', 'sophia.d@example.com', 'GOLD', 5800.00, 1100, 24, '1 day', false),
('Jackson', 'Rodriguez', '+971507778888', 'jackson.r@example.com', 'PLATINUM', 10500.00, 3000, 38, '3 days', false),
('Lucas', 'Martinez', '+971508889999', 'lucas.m@example.com', 'SILVER', 1200.00, 280, 5, '65 days', false),
('Isabella', 'Hernandez', '+971509990000', 'isabella.h@example.com', 'BRONZE', 150.00, 50, 1, '90 days', true),
('Mia', 'Lopez', '+971500001111', 'mia.l@example.com', 'GOLD', 7400.00, 1600, 29, '4 days', false),
('Ethan', 'Gonzalez', '+971501110000', 'ethan.g@example.com', 'SILVER', 3200.00, 750, 14, '15 days', false),
('James', 'Wilson', '+971502221111', 'james.w@example.com', 'BRONZE', 80.00, 20, 1, '120 days', true),
('Alexander', 'Anderson', '+971503332222', 'alex.a@example.com', 'GOLD', 5100.00, 950, 20, '10 days', false),
('Michael', 'Taylor', '+971504443333', 'michael.t@example.com', 'SILVER', 2800.00, 600, 11, '20 days', false),
('Benjamin', 'Thomas', '+971505554444', 'ben.t@example.com', 'BRONZE', 350.00, 90, 2, '5 days', false),
('William', 'Moore', '+971506665555', 'will.m@example.com', 'PLATINUM', 15000.00, 4500, 55, '2 days', false),
('Daniel', 'Jackson', '+971507776666', 'dan.j@example.com', 'SILVER', 4200.00, 1000, 19, '7 days', false),
('Elijah', 'White', '+971508887777', 'elijah.w@example.com', 'GOLD', 8800.00, 2200, 35, '1 day', false),
('Matthew', 'Harris', '+971509998888', 'matt.h@example.com', 'BRONZE', 120.00, 30, 1, '80 days', true),
('Aiden', 'Martin', '+971500009999', 'aiden.m@example.com', 'GOLD', 6100.00, 1300, 21, '6 days', false),
('Harper', 'Thompson', '+971501118888', 'harper.t@example.com', 'SILVER', 2600.00, 550, 9, '25 days', false),
('Evelyn', 'Garcia', '+971502227777', 'evelyn.g@example.com', 'BRONZE', 500.00, 140, 4, '18 days', false),
('Jack', 'Martinez', '+971503336666', 'jack.m@example.com', 'PLATINUM', 11200.00, 2900, 31, '3 days', false),
('Henry', 'Robinson', '+971504445556', 'henry.r@example.com', 'GOLD', 5900.00, 1150, 22, '12 days', false),
('Samuel', 'Clark', '+971505559999', 'sam.c@example.com', 'SILVER', 1500.00, 320, 6, '55 days', false),
('Sebastian', 'Rodriguez', '+971506663333', 'seb.r@example.com', 'BRONZE', 220.00, 60, 2, '30 days', false),
('Wyatt', 'Lewis', '+971507772222', 'wyatt.l@example.com', 'GOLD', 6700.00, 1500, 27, '2 days', false),
('Chloe', 'Lee', '+971501113333', 'chloe.l@example.com', 'SILVER', 2900.00, 650, 12, '14 days', false),
('Ella', 'Walker', '+971502224444', 'ella.w@example.com', 'BRONZE', 480.00, 130, 4, '40 days', false),
('Aria', 'Hall', '+971503335555', 'aria.h@example.com', 'GOLD', 7100.00, 1750, 30, '4 days', false),
('Scarlett', 'Allen', '+971504446666', 'scarlett.a@example.com', 'PLATINUM', 13400.00, 3800, 48, '1 day', false),
('Victoria', 'Young', '+971505557777', 'vicky.y@example.com', 'SILVER', 3100.00, 800, 15, '9 days', false),
('Grace', 'Hernandez', '+971506668888', 'grace.h@example.com', 'BRONZE', 95.00, 25, 1, '150 days', true),
('Lily', 'King', '+971507779999', 'lily.k@example.com', 'GOLD', 8200.00, 2000, 32, '5 days', false),
('Aubrey', 'Wright', '+971508880000', 'aubrey.w@example.com', 'SILVER', 2400.00, 500, 10, '22 days', false),
('Zoey', 'Lopez', '+971509991111', 'zoey.l@example.com', 'BRONZE', 380.00, 100, 2, '10 days', false),
('Lillian', 'Hill', '+971500002222', 'lily.h@example.com', 'GOLD', 5400.00, 1200, 19, '7 days', false),
('Addison', 'Scott', '+971501112211', 'addy.s@example.com', 'PLATINUM', 10800.00, 3200, 36, '2 days', false),
('Layla', 'Green', '+971502223322', 'layla.g@example.com', 'SILVER', 1900.00, 450, 7, '60 days', false),
('Natalie', 'Adams', '+971503334433', 'natalie.a@example.com', 'BRONZE', 120.00, 35, 1, '110 days', true),
('Camila', 'Baker', '+971504445544', 'camila.b@example.com', 'GOLD', 6900.00, 1650, 26, '1 day', false),
('Brooklyn', 'Gonzalez', '+971505556655', 'brook.g@example.com', 'SILVER', 3600.00, 900, 16, '6 days', false),
('Zoe', 'Nelson', '+971506667766', 'zoe.n@example.com', 'BRONZE', 450.00, 120, 3, '20 days', false),
('Nora', 'Carter', '+971507778877', 'nora.c@example.com', 'GOLD', 7800.00, 1900, 31, '3 days', false),
('Hazel', 'Mitchell', '+971508889988', 'hazel.m@example.com', 'PLATINUM', 14200.00, 4200, 52, '2 days', false),
('Leah', 'Perez', '+971509990099', 'leah.p@example.com', 'SILVER', 1600.00, 380, 8, '35 days', false),
('Paisley', 'Roberts', '+971500001100', 'paisley.r@example.com', 'BRONZE', 210.00, 55, 2, '42 days', false),
('Audrey', 'Turner', '+971501110011', 'audrey.t@example.com', 'GOLD', 6300.00, 1400, 23, '4 days', false),
('Savannah', 'Phillips', '+971502221122', 'sav.p@example.com', 'SILVER', 2500.00, 600, 11, '18 days', false),
('Claire', 'Campbell', '+971503332233', 'claire.c@example.com', 'PLATINUM', 11700.00, 3500, 40, '5 days', false);

INSERT INTO customer_profile (id, first_name, last_name, phone_number, email, loyalty_tier_id, lifetime_spend, available_points, visit_count, last_visit_at, is_churned, version, created_at)
SELECT 
    gen_random_uuid(), first_name, last_name, phone, email, 
    (SELECT id FROM loyalty_tier WHERE name = tier_name),
    spend, points, visits, NOW() - last_visit, is_churned, 0, NOW() - (visits || ' weeks')::interval
FROM temp_customers
ON CONFLICT (phone_number) DO NOTHING;

DROP TABLE temp_customers;

-- 3. Realistic Feedback (30 records)
INSERT INTO guest_feedback (id, customer_id, rating, comments, sentiment, source, created_at)
SELECT 
    gen_random_uuid(), id, 5, 'Absolutely fantastic! The steaks are cooked to perfection every time.', 'POSITIVE', 'APP', last_visit_at + INTERVAL '2 hours'
FROM customer_profile WHERE visit_count > 20 LIMIT 5;

INSERT INTO guest_feedback (id, customer_id, rating, comments, sentiment, source, created_at)
SELECT 
    gen_random_uuid(), id, 4, 'Great ambiance and very friendly staff. Food was solid.', 'POSITIVE', 'SMS', last_visit_at + INTERVAL '1 hour'
FROM customer_profile WHERE visit_count BETWEEN 10 AND 20 LIMIT 5;

INSERT INTO guest_feedback (id, customer_id, rating, comments, sentiment, source, created_at)
SELECT 
    gen_random_uuid(), id, 3, 'Average experience. Wait time for a table was a bit long even with reservation.', 'NEUTRAL', 'APP', last_visit_at + INTERVAL '30 minutes'
FROM customer_profile WHERE visit_count BETWEEN 3 AND 9 LIMIT 10;

INSERT INTO guest_feedback (id, customer_id, rating, comments, sentiment, source, created_at)
SELECT 
    gen_random_uuid(), id, 2, 'Disappointed today. Service was slow and my burger was cold.', 'NEGATIVE', 'EMAIL', last_visit_at + INTERVAL '1 day'
FROM customer_profile WHERE last_name IN ('Garcia', 'Martinez', 'Scott') LIMIT 5;

INSERT INTO guest_feedback (id, customer_id, rating, comments, sentiment, source, created_at)
SELECT 
    gen_random_uuid(), id, 5, 'One of my favorite spots in the city! Love the loyalty rewards.', 'POSITIVE', 'SMS', last_visit_at + INTERVAL '4 hours'
FROM customer_profile WHERE first_name IN ('Emma', 'William', 'Sophia') LIMIT 5;

-- 4. Seed Order History (Linking some customers to realistic orders)
INSERT INTO order_ticket (id, status, order_type, table_id, server_id, customer_profile_id, cover_count, subtotal, tax_amount, tip_amount, total_amount, created_at, updated_at, paid_at, version)
SELECT 
    gen_random_uuid(), 'PAID', 'DINE_IN', 
    (SELECT id FROM table_shape LIMIT 1), 
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 
    c.id, 2, 85.00, 4.25, 15.00, 104.25, 
    c.last_visit_at, c.last_visit_at, c.last_visit_at + INTERVAL '1 hour', 0
FROM customer_profile c WHERE c.visit_count > 0 LIMIT 20;

-- 5. Seed Loyalty Transactions
INSERT INTO loyalty_transaction (id, customer_profile_id, points, description, created_at, version)
SELECT 
    gen_random_uuid(), c.id, 85, 'Points earned for order', c.last_visit_at, 0
FROM customer_profile c WHERE c.visit_count > 0 LIMIT 30;

INSERT INTO loyalty_transaction (id, customer_profile_id, points, description, created_at, version)
SELECT 
    gen_random_uuid(), c.id, -100, 'Redeemed points for discount', c.last_visit_at - INTERVAL '1 month', 0
FROM customer_profile c WHERE c.available_points > 500 LIMIT 10;

-- 6. Automated Campaigns (Standard examples)
INSERT INTO automated_campaign (id, name, trigger_event, delay_hours, is_active)
VALUES 
(gen_random_uuid(), 'Birthday Gift ($10 Off)', 'BIRTHDAY', 0, true),
(gen_random_uuid(), 'We Miss You!', 'INACTIVE_30_DAYS', 24, true),
(gen_random_uuid(), 'First Visit Welcome', 'FIRST_VISIT', 1, true),
(gen_random_uuid(), 'Gold Tier Milestone', 'TIER_UPGRADE', 0, true)
ON CONFLICT DO NOTHING;
