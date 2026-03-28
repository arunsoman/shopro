-- V81: Core Double-Entry Accounting Schema
-- Purpose: Implement the foundational tables for the POS General Ledger.

-- 1. Chart of Accounts Table
CREATE TABLE finance_account (
    id UUID PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    account_type VARCHAR(20) NOT NULL,
    balance NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    description VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_account_code ON finance_account(code);
CREATE INDEX idx_account_type ON finance_account(account_type);

-- 2. Journal Entry Table (Headers)
CREATE TABLE finance_journal_entry (
    id UUID PRIMARY KEY,
    entry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    description VARCHAR(500),
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_journal_entry_date ON finance_journal_entry(entry_date);
CREATE INDEX idx_journal_reference_id ON finance_journal_entry(reference_id);

-- 3. Journal Line Table (Details)
CREATE TABLE finance_journal_line (
    id UUID PRIMARY KEY,
    journal_entry_id UUID NOT NULL REFERENCES finance_journal_entry(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES finance_account(id),
    debit_amount NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    credit_amount NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_journal_line_entry_id ON finance_journal_line(journal_entry_id);
CREATE INDEX idx_journal_line_account_id ON finance_journal_line(account_id);

COMMENT ON TABLE finance_account IS 'The formal Chart of Accounts for the POS system.';
COMMENT ON TABLE finance_journal_entry IS 'Balanced accounting entries that comprise the General Ledger.';
COMMENT ON TABLE finance_journal_line IS 'Granular debit and credit lines for each journal entry.';
