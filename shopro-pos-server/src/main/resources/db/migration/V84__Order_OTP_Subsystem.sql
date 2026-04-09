-- V84: Order OTP Subsystem (Post-Payment Identity Token)
-- Purpose: Bridge the gap between digital ordering and physical fulfilment.

-- 1. Create Order OTP Table
CREATE TABLE order_otp (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL,
    hashed_otp VARCHAR(255) NOT NULL,
    expiry_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    attempt_count INTEGER DEFAULT 0,
    resend_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_otp_order FOREIGN KEY (order_id) REFERENCES order_ticket(id) ON DELETE CASCADE
);

-- 2. Indexes for Performance & TTL Cleanups
CREATE INDEX idx_order_otp_order_id ON order_otp(order_id);
CREATE INDEX idx_order_otp_expiry_at ON order_otp(expiry_at) WHERE verified_at IS NULL;

-- 3. Audit Log for Verification Attempts
CREATE TABLE order_otp_audit (
    id UUID PRIMARY KEY,
    order_otp_id UUID NOT NULL,
    staff_id UUID,
    terminal_id VARCHAR(50),
    attempt_type VARCHAR(20) NOT NULL, -- 'MANUAL', 'QR', 'RESEND'
    is_success BOOLEAN DEFAULT FALSE,
    reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_otp_audit_otp FOREIGN KEY (order_otp_id) REFERENCES order_otp(id) ON DELETE CASCADE
);

-- 4. Initial Trigger for Timestamp Updates
CREATE OR REPLACE FUNCTION update_order_otp_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER tr_update_order_otp_timestamp
    BEFORE UPDATE ON order_otp
    FOR EACH ROW
    EXECUTE FUNCTION update_order_otp_timestamp();

-- 5. Add FULFILLING status to TicketStatus if not present 
-- (Assuming it's an ENUM or table-based, adding here for consistency)
-- Note: TicketStatus is an enum in Java, so we just ensure the DB handles the transition.
