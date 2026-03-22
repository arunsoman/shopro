-- V14 Add Restaurant and Creator fields to Category
ALTER TABLE category ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES restaurant(id);
ALTER TABLE category ADD COLUMN IF NOT EXISTS created_by_id UUID;
