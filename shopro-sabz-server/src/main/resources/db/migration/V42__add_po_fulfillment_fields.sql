-- V42__add_po_fulfillment_fields.sql
-- Add fields for supplier fulfillment: tracking, invoicing, and shipping timestamp.

ALTER TABLE purchase_order ADD COLUMN tracking_number VARCHAR(100);
ALTER TABLE purchase_order ADD COLUMN invoice_file_id UUID;
ALTER TABLE purchase_order ADD COLUMN delivery_note_ref VARCHAR(100);
ALTER TABLE purchase_order ADD COLUMN shipped_at TIMESTAMPTZ;

COMMENT ON COLUMN purchase_order.tracking_number IS 'Carrier tracking number provided by the supplier';
COMMENT ON COLUMN purchase_order.invoice_file_id IS 'Reference to the uploaded invoice PDF in object storage';
COMMENT ON COLUMN purchase_order.delivery_note_ref IS 'Supplier internal reference number for the delivery';
COMMENT ON COLUMN purchase_order.shipped_at IS 'Timestamp when the supplier marked the PO as SHIPPED/SENT';
