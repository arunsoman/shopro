-- V10: Create Accounting Module Tables with Comprehensive Restaurant Chart of Accounts
-- Chart of Accounts
CREATE TABLE IF NOT EXISTS accounting_chart_of_accounts (
    account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id BIGINT NOT NULL,
    account_code VARCHAR(50) NOT NULL UNIQUE,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(20) NOT NULL,
    account_sub_type VARCHAR(50),
    parent_account_id UUID REFERENCES accounting_chart_of_accounts(account_id),
    description TEXT,
    default_tax_rate DECIMAL(5,2),
    is_taxable BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    allow_manual_entry BOOLEAN DEFAULT TRUE,
    balance DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Double-Entry Accounting Ledger
CREATE TABLE IF NOT EXISTS accounting_ledger (
    entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id BIGINT NOT NULL,
    transaction_date DATE NOT NULL,
    entry_type VARCHAR(30) NOT NULL,
    reference_number VARCHAR(50),
    reference_id UUID,
    reference_type VARCHAR(50),
    description TEXT,
    account_id UUID NOT NULL REFERENCES accounting_chart_of_accounts(account_id),
    account_code VARCHAR(50),
    account_name VARCHAR(255),
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    tax_rate DECIMAL(5,2),
    currency VARCHAR(3) DEFAULT 'USD',
    exchange_rate DECIMAL(10,4) DEFAULT 1,
    staff_id UUID,
    staff_name VARCHAR(255),
    category VARCHAR(50),
    notes TEXT,
    is_reconciled BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Salary Disbursement
CREATE TABLE IF NOT EXISTS accounting_salary_disbursement (
    disbursement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id BIGINT NOT NULL,
    staff_id UUID NOT NULL,
    staff_name VARCHAR(255) NOT NULL,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    pay_date DATE NOT NULL,
    hourly_rate DECIMAL(10,2),
    total_hours DECIMAL(10,2),
    gross_pay DECIMAL(15,2) NOT NULL,
    federal_tax DECIMAL(15,2) DEFAULT 0,
    state_tax DECIMAL(15,2) DEFAULT 0,
    local_tax DECIMAL(15,2) DEFAULT 0,
    social_security_tax DECIMAL(15,2) DEFAULT 0,
    medicare_tax DECIMAL(15,2) DEFAULT 0,
    other_deductions DECIMAL(15,2) DEFAULT 0,
    total_tax DECIMAL(15,2) DEFAULT 0,
    net_pay DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    status VARCHAR(20) DEFAULT 'PENDING',
    ledger_entry_id UUID,
    notes TEXT,
    approved_by VARCHAR(100),
    approved_at TIMESTAMP,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tax Configuration
CREATE TABLE IF NOT EXISTS accounting_tax_config (
    tax_config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id BIGINT,
    country_code VARCHAR(2) NOT NULL,
    state_code VARCHAR(10),
    local_code VARCHAR(20),
    tax_name VARCHAR(100) NOT NULL,
    tax_type VARCHAR(30) NOT NULL,
    tax_rate DECIMAL(5,2) NOT NULL,
    tax_applies_to VARCHAR(30) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    effective_from TIMESTAMP,
    effective_to TIMESTAMP,
    description TEXT,
    account_code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accounting Invoice
CREATE TABLE IF NOT EXISTS accounting_invoice (
    invoice_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id BIGINT NOT NULL,
    invoice_number VARCHAR(50) NOT NULL,
    supplier_id UUID,
    supplier_name VARCHAR(255),
    invoice_date DATE,
    due_date DATE,
    invoice_type VARCHAR(30) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    subtotal DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT,
    notes TEXT,
    payment_terms VARCHAR(100),
    reference_number VARCHAR(50),
    ledger_entry_id UUID,
    approved_by VARCHAR(100),
    approved_at TIMESTAMP,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ledger_restaurant_date ON accounting_ledger(restaurant_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_ledger_account ON accounting_ledger(account_id);
CREATE INDEX IF NOT EXISTS idx_ledger_staff ON accounting_ledger(staff_id);
CREATE INDEX IF NOT EXISTS idx_ledger_reference ON accounting_ledger(reference_id, reference_type);
CREATE INDEX IF NOT EXISTS idx_disbursement_restaurant ON accounting_salary_disbursement(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_disbursement_staff ON accounting_salary_disbursement(staff_id);
CREATE INDEX IF NOT EXISTS idx_disbursement_status ON accounting_salary_disbursement(status);
CREATE INDEX IF NOT EXISTS idx_invoice_restaurant ON accounting_invoice(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_invoice_supplier ON accounting_invoice(supplier_id);
