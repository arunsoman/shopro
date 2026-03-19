-- V5__seed_channels_sys.sql
INSERT INTO channels (id, type, name, config, is_active, created_at, updated_at, version)
VALUES
('11111111-1111-1111-1111-111111111111', 'IN_APP', 'In-App Notifications', '{}', true, '2026-03-13T16:54:48.245Z', '2026-03-13T16:54:48.245Z', 0),
('22222222-2222-2222-2222-222222222222', 'EMAIL', 'Email Service', '{}', true, '2026-03-13T16:54:48.245Z', '2026-03-13T16:54:48.245Z', 0),
('33333333-3333-3333-3333-333333333333', 'SMS', 'SMS Gateway', '{}', true, '2026-03-13T16:54:48.245Z', '2026-03-13T16:54:48.245Z', 0),
('44444444-4444-4444-4444-444444444444', 'PUSH', 'Push Notifications', '{}', true, '2026-03-13T16:54:48.245Z', '2026-03-13T16:54:48.245Z', 0)
ON CONFLICT (id) DO NOTHING;
