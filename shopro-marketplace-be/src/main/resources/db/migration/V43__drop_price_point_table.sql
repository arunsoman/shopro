-- -- V43: Drop legacy price_point table as logic is now 100% dynamic
-- DROP TABLE IF EXISTS price_point CASCADE;

-- -- Also seed wapp_enabled setting (default FALSE)
-- INSERT INTO system_setting (id, setting_key, setting_value) 
-- VALUES ('00000000-0000-0000-0000-000000000002', 'wapp_enabled', 'false')
-- ON CONFLICT (setting_key) DO NOTHING;
