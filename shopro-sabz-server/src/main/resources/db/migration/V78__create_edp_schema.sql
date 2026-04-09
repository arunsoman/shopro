-- V78: Create Event-Driven POS (EDP) Schema
-- This migration creates the append-only event store and the consumer checkpoint table.

-- 1. Create the event_store table
CREATE TABLE event_store (
    id BIGSERIAL PRIMARY KEY,
    event_id UUID NOT NULL UNIQUE,
    event_type VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    payload JSONB NOT NULL
);

-- Index for efficient event filtering and sequence tracking
CREATE INDEX idx_event_store_type ON event_store(event_type);
CREATE INDEX idx_event_store_timestamp ON event_store(timestamp);
CREATE INDEX idx_event_store_id ON event_store(id);

-- 2. Create the event_consumer_checkpoint table
-- Tracks the last processed event ID for each distinctive consumer (KDS, INV, etc.)
CREATE TABLE event_consumer_checkpoint (
    consumer_id VARCHAR(100) PRIMARY KEY,
    last_processed_event_id BIGINT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Seed initial checkpoints for known consumers to prevent full-scan on first start
-- (Optional: if we want to ignore historical events, we'd set this to the current max ID later)
INSERT INTO event_consumer_checkpoint (consumer_id, last_processed_event_id)
VALUES 
    ('WEBSOCKET_RELAY', 0),
    ('STATION_ROUTER', 0),
    ('EXPO_TRACKER', 0),
    ('INV_SYNC', 0),
    ('LOYALTY_SYNC', 0),
    ('TABLE_SYNC', 0);

COMMENT ON TABLE event_store IS 'Append-only audit ledger for all system state changes.';
COMMENT ON TABLE event_consumer_checkpoint IS 'Tracks the progress of various EDP consumers through the event stream.';
