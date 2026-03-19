-- V69__fix_rims_v1_2_missing_columns.sql
-- Add missing BaseEntity columns to tables introduced in V64

-- 1. inventory_location
ALTER TABLE inventory_location 
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- 2. inventory_batch
ALTER TABLE inventory_batch 
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- 3. demand_forecast
ALTER TABLE demand_forecast 
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
