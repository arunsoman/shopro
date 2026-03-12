-- V10__seed_kds_routing_rules.sql
-- Seed default routing rules for menu categories to KDS stations.

INSERT INTO kds_routing_rule (id, station_id, target_type, target_id, created_at, updated_at, version)
VALUES
  -- Starters -> Fry Station
  (gen_random_uuid(), 'e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e33', 'CATEGORY', 'a1000000-0000-0000-0000-000000000001', NOW(), NOW(), 0),
  
  -- Burgers -> Grill Station
  (gen_random_uuid(), 'e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e22', 'CATEGORY', 'a1000000-0000-0000-0000-000000000002', NOW(), NOW(), 0),
  
  -- Mains -> Grill Station
  (gen_random_uuid(), 'e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e22', 'CATEGORY', 'a1000000-0000-0000-0000-000000000003', NOW(), NOW(), 0),
  
  -- Drinks -> Bar Station
  (gen_random_uuid(), 'e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e44', 'CATEGORY', 'a1000000-0000-0000-0000-000000000004', NOW(), NOW(), 0);
