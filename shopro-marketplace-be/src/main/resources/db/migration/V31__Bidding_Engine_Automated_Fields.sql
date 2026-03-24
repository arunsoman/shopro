-- V14: Bidding Engine Automated Fields & Lead Time Tracking
-- Author: Antigravity

-- Add automation and mode fields to BidInvitation
ALTER TABLE bid_invitation 
ADD COLUMN operation_mode VARCHAR(20) DEFAULT 'MANUAL',
ADD COLUMN repeat_frequency VARCHAR(20) DEFAULT 'NONE',
ADD COLUMN next_run_date TIMESTAMP;

-- Add lead time tracking to Quote
ALTER TABLE quote 
ADD COLUMN lead_time INTEGER DEFAULT 0;

-- Add lead time and offered quantity to QuoteItem
ALTER TABLE quote_item 
ADD COLUMN lead_time INTEGER DEFAULT 0,
ADD COLUMN offered_quantity DECIMAL(19,4);

-- Comment for traceability
COMMENT ON COLUMN bid_invitation.operation_mode IS 'AUTOMATIC, SEMI_AUTOMATIC, or MANUAL';
COMMENT ON COLUMN bid_invitation.repeat_frequency IS 'NONE, DAILY, WEEKLY, or MONTHLY';
