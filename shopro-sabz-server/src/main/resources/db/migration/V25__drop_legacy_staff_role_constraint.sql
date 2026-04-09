-- V25__drop_legacy_staff_role_constraint.sql
-- The V20 migration introduced dynamic roles via 'role_id' and 'staff_roles' table.
-- It retained the legacy 'role' VARCHAR column for backward compatibility during rollout.
-- However, the original NOT NULL constraint from V1 was never dropped, which entirely breaks 
-- JPA inserts for new StaffMember entities since they no longer map the legacy string 'role' field.
-- This drops the NOT NULL constraint to allow new staff creation.

ALTER TABLE staff_member ALTER COLUMN role DROP NOT NULL;
