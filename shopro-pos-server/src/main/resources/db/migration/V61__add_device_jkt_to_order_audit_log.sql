-- V61__add_device_jkt_to_order_audit_log.sql
-- Adds the missing device_jkt column to the order_audit_log table to support non-repudiation tracking.

ALTER TABLE order_audit_log ADD COLUMN device_jkt VARCHAR(255);
