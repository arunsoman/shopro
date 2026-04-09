-- V20__dynamic_roles_and_fapi.sql
-- Implements dynamic role management, FAPI device binding, and enhanced audit logs.

-- 1. Permissions Table
CREATE TABLE staff_permissions (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    category VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL
);

-- 2. Roles Table
CREATE TABLE staff_roles (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    parent_role_id UUID REFERENCES staff_roles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL
);

-- 3. Role-Permission Mapping (Join Table)
CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES staff_roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES staff_permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 4. Device Bindings (DPoP)
CREATE TABLE staff_device_bindings (
    id UUID PRIMARY KEY,
    staff_id UUID NOT NULL REFERENCES staff_member(id) ON DELETE CASCADE,
    public_key_thumbprint VARCHAR(512) NOT NULL,
    device_name VARCHAR(100),
    last_active_at TIMESTAMP WITH TIME ZONE,
    revoked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL
);
CREATE INDEX idx_device_public_key ON staff_device_bindings(public_key_thumbprint);

-- 5. Audit Log Enhancements (Non-Repudiation)
ALTER TABLE order_audit_log ADD COLUMN signature_hash VARCHAR(255);

-- 6. Update Staff Member for Dynamic Roles
ALTER TABLE staff_member ADD COLUMN role_id UUID REFERENCES staff_roles(id);

-- 7. Seed Initial Permissions
INSERT INTO staff_permissions (id, name, category, description, version) VALUES
(gen_random_uuid(), 'ORDER:CREATE', 'ORDER', 'Can create new orders', 0),
(gen_random_uuid(), 'ORDER:VIEW_OWN', 'ORDER', 'Can view their own orders', 0),
(gen_random_uuid(), 'ORDER:VIEW_ALL', 'ORDER', 'Can view all orders', 0),
(gen_random_uuid(), 'ORDER:VOID_ITEM', 'ORDER', 'Can void items from an order', 0),
(gen_random_uuid(), 'PAYMENT:PROCESS', 'PAYMENT', 'Can process payments', 0),
(gen_random_uuid(), 'PAYMENT:VOID_BILL', 'PAYMENT', 'Can void entire bills', 0),
(gen_random_uuid(), 'PAYMENT:DISCOUNT', 'PAYMENT', 'Can apply discounts', 0),
(gen_random_uuid(), 'FLOOR:TABLE_ASSIGN', 'FLOOR', 'Can assign staff to tables', 0),
(gen_random_uuid(), 'ADMIN:PIN_RESET', 'ADMIN', 'Can reset staff PINs', 0),
(gen_random_uuid(), 'REPORT:FULL_FINANCIAL', 'REPORT', 'Can view full financial reports', 0);

-- 8. Seed Initial Roles (Manual UUIDs for simpler seeding/migration)
INSERT INTO staff_roles (id, name, description, version) VALUES
('00000000-0000-0000-0000-000000000001', 'OWNER', 'Full system access', 0),
('00000000-0000-0000-0000-000000000002', 'MANAGER', 'Supervisory access', 0),
('00000000-0000-0000-0000-000000000003', 'SERVER', 'Floor operations', 0);

-- 9. Map Permissions to Roles
-- Owner gets all (conceptual, for seeding)
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM staff_permissions;

-- Manager gets most
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM staff_permissions 
WHERE name NOT IN ('ADMIN:SYSTEM_SETTINGS');

-- Server gets FOH basics
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000003', id FROM staff_permissions 
WHERE name IN ('ORDER:CREATE', 'ORDER:VIEW_OWN', 'FLOOR:TABLE_ASSIGN');

-- 10. Backfill existing staff members based on their legacy role string
UPDATE staff_member SET role_id = '00000000-0000-0000-0000-000000000001' WHERE role = 'OWNER';
UPDATE staff_member SET role_id = '00000000-0000-0000-0000-000000000002' WHERE role = 'MANAGER';
UPDATE staff_member SET role_id = '00000000-0000-0000-0000-000000000003' WHERE role IN ('SERVER', 'HOST', 'CASHIER', 'BUSSER'); -- Default fallback

-- Note: We keep the old 'role' column for now to avoid breaking existing code, but role_id is the new source of truth.
