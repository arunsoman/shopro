-- V7 Add PO Metadata

ALTER TABLE purchase_order ADD COLUMN source VARCHAR(10) DEFAULT 'MANUAL';
ALTER TABLE purchase_order ALTER COLUMN status TYPE VARCHAR(50);
UPDATE purchase_order SET status = 'RAISED' WHERE status = 'PENDING';
UPDATE purchase_order SET status = 'COMPLETED' WHERE status = 'FULLY_FULFILLED';
