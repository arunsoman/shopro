-- V4__add_payment_table.sql
-- Adds the payment table and relevant indexes to support order finalization and MiPay.

CREATE TABLE payment (
    id UUID PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES order_ticket(id),
    method VARCHAR(20) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    processor_reference VARCHAR(128),
    decline_reason VARCHAR(256),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL
);

CREATE INDEX idx_payment_ticket ON payment (ticket_id);
CREATE INDEX idx_payment_processor ON payment (processor_reference);
