-- Add fields for bid acknowledgment flow
ALTER TABLE vendor_bid
ADD COLUMN awarded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN generated_po_id UUID;

-- Status expansion is handled by JPA (Enum as String)
-- No changes needed to the 'status' column as it's VARCHAR(20)

-- Add Foreign Key
ALTER TABLE vendor_bid
ADD CONSTRAINT fk_vendor_bid_generated_po
FOREIGN KEY (generated_po_id) REFERENCES purchase_order(id);
