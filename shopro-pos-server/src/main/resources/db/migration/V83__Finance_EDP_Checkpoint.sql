-- V83: Register Financial Consumer Checkpoint
-- Purpose: Initialize the checkpoint for the Financial Ledger EDP consumer.

INSERT INTO event_consumer_checkpoint (consumer_id, last_processed_event_id)
VALUES ('FINANCE_SYNC', 0)
ON CONFLICT (consumer_id) DO NOTHING;
