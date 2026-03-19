-- V13__seed_kds_station_sys.sql
INSERT INTO kds_station (id, name, station_type, online, created_at, updated_at, version)
VALUES
('e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e11', 'EXPO Aggregator', 'EXPO', true, '2026-03-13T16:54:47.130Z', '2026-03-13T16:54:47.130Z', 0),
('e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e22', 'Grill Station', 'GRILL', true, '2026-03-13T16:54:47.130Z', '2026-03-13T16:54:47.130Z', 0),
('e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e33', 'Fry Station', 'FRY', true, '2026-03-13T16:54:47.130Z', '2026-03-13T16:54:47.130Z', 0),
('e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e44', 'Bar Station', 'BAR', true, '2026-03-13T16:54:47.130Z', '2026-03-13T16:54:47.130Z', 0)
ON CONFLICT (id) DO NOTHING;
