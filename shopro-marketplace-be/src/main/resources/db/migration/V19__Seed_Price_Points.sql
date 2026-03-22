-- V19__Seed_Price_Points.sql
INSERT INTO price_point (food_id, price, effective_from)
SELECT 
    id, 
    (5 + random() * 45.0)::numeric(19,4), 
    CURRENT_TIMESTAMP
FROM food;
