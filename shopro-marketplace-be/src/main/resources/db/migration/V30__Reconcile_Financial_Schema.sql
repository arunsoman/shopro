-- V30: Reconcile Financial Schema with modern JPA Entities

-- 1. DROP old tables if they exist with mismatching schema
DROP TABLE IF EXISTS ledger_entry CASCADE;
DROP TABLE IF EXISTS platform_holding CASCADE;

-- 2. CREATE platform_holding with account-based schema
CREATE TABLE platform_holding (
    id UUID PRIMARY KEY,
    account_name VARCHAR(255) UNIQUE NOT NULL,
    balance DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 3. CREATE ledger_entry linking to holdings
CREATE TABLE ledger_entry (
    id UUID PRIMARY KEY,
    holding_id UUID NOT NULL REFERENCES platform_holding(id),
    transaction_id UUID REFERENCES financial_transaction(id),
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(19, 4) NOT NULL,
    type VARCHAR(20) NOT NULL, -- DEBIT/CREDIT
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 4. SEED midMind essential accounts
INSERT INTO platform_holding (id, account_name, balance, currency, created_at)
VALUES (gen_random_uuid(), 'RESTAURANT_RECEIVABLE', 0.00, 'INR', NOW()),
       (gen_random_uuid(), 'SUPPLIER_PAYABLE', 0.00, 'INR', NOW()),
       (gen_random_uuid(), 'PLATFORM_REVENUE', 0.00, 'INR', NOW()),
       (gen_random_uuid(), 'TREASURY', 0.00, 'INR', NOW());

-- 5. INDEX for performance
CREATE INDEX idx_ledger_holding ON ledger_entry(holding_id);
CREATE INDEX idx_ledger_tx ON ledger_entry(transaction_id);
