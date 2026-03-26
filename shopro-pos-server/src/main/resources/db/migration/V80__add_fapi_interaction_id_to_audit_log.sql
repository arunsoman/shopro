-- V80__add_fapi_interaction_id_to_audit_log.sql
ALTER TABLE order_audit_log ADD COLUMN interaction_id VARCHAR(255);
CREATE INDEX idx_order_audit_interaction ON order_audit_log(interaction_id);
