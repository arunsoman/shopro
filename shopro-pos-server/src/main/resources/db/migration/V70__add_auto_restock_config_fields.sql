-- V70__add_auto_restock_config_fields.sql
-- Add configuration fields for automated restocking strategies

ALTER TABLE raw_ingredient 
    ADD COLUMN IF NOT EXISTS bid_closing_days INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS expected_arrival_days INTEGER NOT NULL DEFAULT 3;

-- Add comment for clarity
COMMENT ON COLUMN raw_ingredient.bid_closing_days IS 'Number of days (X) from RFQ initiation until the bid closes.';
COMMENT ON COLUMN raw_ingredient.expected_arrival_days IS 'Number of days (Y) from RFQ initiation/PO creation until expected delivery.';
