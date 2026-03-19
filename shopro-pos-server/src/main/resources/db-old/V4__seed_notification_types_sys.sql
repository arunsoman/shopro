-- V4__seed_notification_types_sys.sql
INSERT INTO notification_types (id, code, name, description, severity, is_mutable, is_active, created_at, updated_at, version)
VALUES
('10000000-0000-0000-0000-000000000001', 'SYSTEM_WARNING', 'System Warning', NULL, 'WARNING', true, true, '2026-03-13T16:54:48.245Z', '2026-03-13T16:54:48.245Z', 0),
('10000000-0000-0000-0000-000000000002', 'STOCK_CRITICAL', 'Critical Stock', NULL, 'CRITICAL', true, true, '2026-03-13T16:54:48.245Z', '2026-03-13T16:54:48.245Z', 0),
('10000000-0000-0000-0000-000000000003', 'PO_APPROVAL', 'Purchase Order Approval', NULL, 'INFO', true, true, '2026-03-13T16:54:48.245Z', '2026-03-13T16:54:48.245Z', 0),
('10000000-0000-0000-0000-000000000004', 'NEW_ORDER', 'New Online Order', NULL, 'INFO', true, true, '2026-03-13T16:54:48.245Z', '2026-03-13T16:54:48.245Z', 0),
('fa08e257-674b-44e3-9a71-8a2ef53bce4e', 'TABLE_DIRTY', 'Table Dirty', NULL, 'INFO', true, true, '2026-03-13T16:54:48.429Z', '2026-03-13T16:54:48.429Z', 0),
('38f33ae2-64da-4425-9382-5d2f65c8c9f1', 'TABLE_VACANT', 'Table Vacant', NULL, 'INFO', true, true, '2026-03-13T16:54:48.429Z', '2026-03-13T16:54:48.429Z', 0),
('34a06779-a34c-4396-8bc2-d62cd865babb', 'TABLE_OCCUPIED', 'Table Occupied', NULL, 'INFO', true, true, '2026-03-13T16:54:48.438Z', '2026-03-13T16:54:48.438Z', 0),
('bb3f8f1b-2f23-40d3-a725-9c41b9a52b36', 'PO_APPROVAL_REQUIRED', 'PO Approval Required', NULL, 'INFO', true, true, '2026-03-13T16:54:48.754Z', '2026-03-13T16:54:48.754Z', 0),
('35d62286-ad21-4ab2-ba3f-6086b76a113c', 'BID_RECEIVED', 'Vendor Bid Received', NULL, 'INFO', true, true, '2026-03-13T16:54:48.754Z', '2026-03-13T16:54:48.754Z', 0),
('37f8380b-8220-4bca-853c-f5f6f18a2333', 'ORDER_READY', 'Order Ready for Pickup', NULL, 'INFO', true, true, '2026-03-13T16:54:48.754Z', '2026-03-13T16:54:48.754Z', 0),
('646273e1-15e6-4621-b9c1-3bc70dd4bd6c', 'ITEM_REJECTED', 'Kitchen 86''d Item', NULL, 'WARNING', true, true, '2026-03-13T16:54:48.754Z', '2026-03-13T16:54:48.754Z', 0),
('fbb4910f-b96a-4137-ac45-23b3ec7c3d5e', 'ASSISTANCE_NEEDED', 'Customer Assistance Needed', NULL, 'INFO', true, true, '2026-03-13T16:54:48.754Z', '2026-03-13T16:54:48.754Z', 0),
('d5b2af87-e3b6-4f65-ab5e-3c1c650446f8', 'VOID_REQUEST', 'Void Approval Request', NULL, 'WARNING', true, true, '2026-03-13T16:54:48.754Z', '2026-03-13T16:54:48.754Z', 0),
('7fdbd7ac-e2f5-4b62-9f2a-3735ac5402dd', 'CURBSIDE_ARRIVAL', 'Curbside Arrival', NULL, 'INFO', true, true, '2026-03-13T16:54:48.754Z', '2026-03-13T16:54:48.754Z', 0),
('5608a3c1-c44a-4cbd-ba74-8adde09d85d4', 'SHRINKAGE_ALERT', 'High Variance Alert', NULL, 'WARNING', true, true, '2026-03-13T16:54:48.754Z', '2026-03-13T16:54:48.754Z', 0),
('4228be32-e993-47be-91ea-677a1e1969e1', 'OVERTIME_WARNING', 'Approaching Overtime', NULL, 'INFO', true, true, '2026-03-13T16:54:48.754Z', '2026-03-13T16:54:48.754Z', 0),
('d3400010-44b6-48d8-a903-1e0d611e0ab5', 'VIP_GUEST_SEATED', 'VIP Guest Seated', NULL, 'INFO', true, true, '2026-03-13T16:54:48.754Z', '2026-03-13T16:54:48.754Z', 0)
ON CONFLICT (code) DO NOTHING;
