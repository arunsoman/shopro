-- V45__Add_PO_Activity_Tracking.sql

-- Add display_status to purchase_order
ALTER TABLE purchase_order 
ADD COLUMN IF NOT EXISTS display_status VARCHAR(255);

-- Create po_activity table
CREATE TABLE IF NOT EXISTS po_activity (
    id UUID PRIMARY KEY,
    purchase_order_id UUID NOT NULL REFERENCES purchase_order(id),
    status VARCHAR(255) NOT NULL,
    description TEXT,
    activity_date TIMESTAMP NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    version BIGINT
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_po_activity_po_id ON po_activity(purchase_order_id);
