-- V47__add_version_to_po_status_history.sql
-- Add missing JPA version column to po_status_history table

ALTER TABLE po_status_history ADD COLUMN IF NOT EXISTS version BIGINT;
UPDATE po_status_history SET version = 0 WHERE version IS NULL;
ALTER TABLE po_status_history ALTER COLUMN version SET NOT NULL;
ALTER TABLE po_status_history ALTER COLUMN version SET DEFAULT 0;
