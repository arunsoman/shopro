-- Phase 0: Add idempotency key to prevent duplicate inventory depletion
-- Safety net for triple-depletion bug (issues #1, #2)

-- Add nullable column (backward compatible - existing rows get NULL)
ALTER TABLE inventory_ingredient_ledger 
ADD COLUMN fulfillment_key VARCHAR(64);

-- Add partial unique index: only enforce uniqueness on DEPLETION events with a key
-- NULL values are not indexed, so legacy rows are exempt
CREATE UNIQUE INDEX idx_ledger_fulfillment_key_unique 
ON inventory_ingredient_ledger (fulfillment_key) 
WHERE event_type = 'DEPLETION' AND fulfillment_key IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN inventory_ingredient_ledger.fulfillment_key IS 
'Idempotency key for order fulfillment: ORD:{orderId}:{orderLineId}. Prevents duplicate depletion on same order line.';
