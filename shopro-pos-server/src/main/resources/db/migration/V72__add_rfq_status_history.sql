-- V72__add_rfq_status_history.sql
-- Restore missing RFQ status history table for audit trails

CREATE TABLE rfq_status_history (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    rfq_id uuid NOT NULL,
    from_status character varying(50),
    to_status character varying(50) NOT NULL,
    actor_id uuid NOT NULL,
    reason character varying,
    PRIMARY KEY (id)
);

ALTER TABLE rfq_status_history ADD CONSTRAINT fk_rfq_status_history_rfq_id FOREIGN KEY (rfq_id) REFERENCES rfq(id);
CREATE INDEX idx_rfq_history_rfq_id ON rfq_status_history(rfq_id);
