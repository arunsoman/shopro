-- V82: Seed POS Chart of Accounts
-- Purpose: Initialize the standard accounting structure for restaurant operations.

-- 1. Assets (1xxx)
INSERT INTO finance_account (id, code, name, account_type, balance, description) VALUES
(gen_random_uuid(), '1000', 'Cash on Hand', 'ASSET', 0.0000, 'Main safe cash for daily operations.'),
(gen_random_uuid(), '1005', 'Petty Cash', 'ASSET', 0.0000, 'Cash held for small operational expenses.'),
(gen_random_uuid(), '1100', 'Bank Account', 'ASSET', 0.0000, 'Main operating bank account.'),
(gen_random_uuid(), '1200', 'Inventory Asset', 'ASSET', 0.0000, 'Value of raw materials and ingredients in stock.'),
(gen_random_uuid(), '1210', 'Staff Advance Asset', 'ASSET', 0.0000, 'Refundable advances issued to staff members.');

-- 2. Liabilities (2xxx)
INSERT INTO finance_account (id, code, name, account_type, balance, description) VALUES
(gen_random_uuid(), '2000', 'Accounts Payable', 'LIABILITY', 0.0000, 'Outstanding payments owed to suppliers.'),
(gen_random_uuid(), '2100', 'Sales Tax Payable', 'LIABILITY', 0.0000, 'Tax collected from customers to be remitted.');

-- 3. Equity (3xxx)
INSERT INTO finance_account (id, code, name, account_type, balance, description) VALUES
(gen_random_uuid(), '3000', 'Retained Earnings', 'EQUITY', 0.0000, 'Accumulated net income/loss from previous periods.');

-- 4. Revenue (4xxx)
INSERT INTO finance_account (id, code, name, account_type, balance, description) VALUES
(gen_random_uuid(), '4000', 'Sales Revenue', 'REVENUE', 0.0000, 'Gross revenue from food and beverage sales.');

-- 5. Cost of Goods Sold (5xxx)
INSERT INTO finance_account (id, code, name, account_type, balance, description) VALUES
(gen_random_uuid(), '5000', 'Inventory Cost (COGS)', 'EXPENSE', 0.0000, 'Cost of ingredients consumed for sales.');

-- 6. Expenses (6xxx)
INSERT INTO finance_account (id, code, name, account_type, balance, description) VALUES
(gen_random_uuid(), '6000', 'Operational Expenses', 'EXPENSE', 0.0000, 'General utilities, rent, and overhead.');
