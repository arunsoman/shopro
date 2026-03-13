-- V21__add_fapi_audit_fields.sql
-- Adds device_jkt to order_audit_log for FAPI non-repudiation.
-- signature_hash was already added in V20.

ALTER TABLE order_audit_log ADD COLUMN device_jkt VARCHAR(512);
CREATE INDEX idx_order_audit_jkt ON order_audit_log(device_jkt);
