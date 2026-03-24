-- V28: Add restaurant_id to bid_invitation
ALTER TABLE bid_invitation ADD COLUMN IF NOT EXISTS restaurant_id UUID;
