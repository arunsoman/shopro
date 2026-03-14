-- V60__fix_tax_audit_log_ip_type.sql
-- Fixes type mismatch between Java String and PostgreSQL INET type.
-- Changes ip_address from INET to VARCHAR(45) to accommodate IPv6 and ensure Hibernate compatibility.

ALTER TABLE tax_audit_logs 
ALTER COLUMN ip_address TYPE VARCHAR(45);
