-- V37: Accounting AOP Schema & Journal Entry Templates

-- 1. ADD country_iso_code to Restaurant & Supplier (for localized tax/accounting)
ALTER TABLE restaurant ADD COLUMN IF NOT EXISTS country_iso_code VARCHAR(2);
ALTER TABLE supplier ADD COLUMN IF NOT EXISTS country_iso_code VARCHAR(2);

-- 2. CREATE journal_entry_templates table
CREATE TABLE journal_entry_templates (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    country_iso_code VARCHAR(2), -- NULL = Global
    line_order INT NOT NULL,
    ledger_account_code VARCHAR(50) NOT NULL,
    ledger_account_name VARCHAR(255) NOT NULL,
    debit_expression TEXT,
    credit_expression TEXT,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- INDEX for fast fetching per event
CREATE INDEX idx_jnl_tpl_event ON journal_entry_templates(event_type, country_iso_code);

-- 3. CREATE journal_entries table (ledger)
CREATE TABLE journal_entries (
    id BIGSERIAL PRIMARY KEY,
    journal_ref VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    ledger_account_code VARCHAR(50) NOT NULL,
    ledger_account_name VARCHAR(255) NOT NULL,
    debit_amount DECIMAL(19, 4),
    credit_amount DECIMAL(19, 4),
    currency VARCHAR(10) NOT NULL,
    country_iso_code VARCHAR(2),
    tax_code VARCHAR(50),
    entity_id UUID,
    entity_type VARCHAR(50),
    entity_reference TEXT,
    venue_id UUID,
    counterparty_id UUID,
    counterparty_type VARCHAR(50),
    description TEXT,
    initiated_by VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- INDEXES for reporting and audit
CREATE INDEX idx_jnl_ref ON journal_entries(journal_ref);
CREATE INDEX idx_jnl_acc ON journal_entries(ledger_account_code, created_at);
CREATE INDEX idx_jnl_entity ON journal_entries(entity_id, entity_type);

-- 4. SEED Journal Entry Templates (Direct from User Specification)
-- [PO_RECEIVED]
INSERT INTO journal_entry_templates (event_type, country_iso_code, line_order, ledger_account_code, ledger_account_name, debit_expression, credit_expression, description)
VALUES 
('PO_RECEIVED', NULL, 1, '1100', 'Accounts Receivable — Restaurant', '#ctx.grossAmount.add(#ctx.taxAmount != null ? #ctx.taxAmount : T(java.math.BigDecimal).ZERO)', NULL, 'AR raised on restaurant PO acceptance'),
('PO_RECEIVED', NULL, 2, '2200', 'Supplier Pass-through Payable', NULL, '#ctx.supplierCost', 'Supplier portion held in liability'),
('PO_RECEIVED', NULL, 3, '4000', 'Commission Revenue', NULL, '#ctx.commissionAmount', 'Platform commission recognized'),
('PO_RECEIVED', NULL, 4, '2300', 'VAT Output Payable', NULL, '#ctx.taxAmount', 'VAT on commission');

-- [SUPPLIER_INVOICE_BOOKED]
INSERT INTO journal_entry_templates (event_type, country_iso_code, line_order, ledger_account_code, ledger_account_name, debit_expression, credit_expression, description)
VALUES 
('SUPPLIER_INVOICE_BOOKED', NULL, 1, '2200', 'Supplier Pass-through Payable', '#ctx.supplierCost', NULL, 'Clear pass-through trust on invoice'),
('SUPPLIER_INVOICE_BOOKED', NULL, 2, '1300', 'VAT Input Receivable', '#ctx.taxAmount', NULL, 'Claim input VAT'),
('SUPPLIER_INVOICE_BOOKED', NULL, 3, '2100', 'Accounts Payable — Supplier', NULL, '#ctx.grossAmount', 'Net payable to supplier');

-- [PAYMENT_RECEIVED]
INSERT INTO journal_entry_templates (event_type, country_iso_code, line_order, ledger_account_code, ledger_account_name, debit_expression, credit_expression, description)
VALUES 
('PAYMENT_RECEIVED', NULL, 1, '1000', 'Cash / Bank', '#ctx.grossAmount.subtract(#ctx.whtAmount != null ? #ctx.whtAmount : T(java.math.BigDecimal).ZERO)', NULL, 'Cash hit bank'),
('PAYMENT_RECEIVED', NULL, 2, '1310', 'WHT Receivable', '#ctx.whtAmount', NULL, 'Tax credit for deduction'),
('PAYMENT_RECEIVED', NULL, 3, '1100', 'Accounts Receivable — Restaurant', NULL, '#ctx.grossAmount', 'Clear AR');

-- [SUPPLIER_PAID]
INSERT INTO journal_entry_templates (event_type, country_iso_code, line_order, ledger_account_code, ledger_account_name, debit_expression, credit_expression, description)
VALUES 
('SUPPLIER_PAID', NULL, 1, '2100', 'Accounts Payable — Supplier', '#ctx.grossAmount', NULL, 'Clear AP'),
('SUPPLIER_PAID', NULL, 2, '1000', 'Cash / Bank', NULL, '#ctx.grossAmount', 'Cash out');

-- [BAD_DEBT_PROVISIONED]
INSERT INTO journal_entry_templates (event_type, country_iso_code, line_order, ledger_account_code, ledger_account_name, debit_expression, credit_expression, description)
VALUES 
('BAD_DEBT_PROVISIONED', NULL, 1, '6200', 'Bad Debt Expense', '#ctx.grossAmount', NULL, 'Expense for uncollectible AR'),
('BAD_DEBT_PROVISIONED', NULL, 2, '1190', 'Allowance for Doubtful Accounts', NULL, '#ctx.grossAmount', 'Contra-Asset raised');
