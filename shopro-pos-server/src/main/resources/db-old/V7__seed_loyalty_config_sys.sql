-- V7__seed_loyalty_config_sys.sql
INSERT INTO loyalty_config (id, earning_rate, redemption_value, minimum_redemption_points, point_expiration_days, created_at, updated_at, version, default_sms_opt_in, default_email_opt_in, feedback_window_hours, sms_gateway_enabled, email_gateway_enabled)
VALUES
('b18b4cbb-29f5-4919-bc0c-c1bc857f1fea', 1.00, 0.0100, 100, 0, '2026-03-13T16:54:48.470Z', '2026-03-13T16:54:48.470Z', 0, true, true, 24, false, false)
ON CONFLICT (id) DO NOTHING;
