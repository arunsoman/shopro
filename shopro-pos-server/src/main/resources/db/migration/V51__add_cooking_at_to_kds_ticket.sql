-- Add cooking_at column to kds_ticket table
ALTER TABLE kds_ticket ADD COLUMN cooking_at TIMESTAMP WITH TIME ZONE;

-- Add index for status reporting
CREATE INDEX idx_kds_ticket_status ON kds_ticket(status, cooking_at);
