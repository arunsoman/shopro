
-- =============================================================================
-- COMPREHENSIVE RESTAURANT CHART OF ACCOUNTS (Based on Industry Standards)
-- =============================================================================
-- Assets (1000-1999)
INSERT INTO accounting_chart_of_accounts (account_id, restaurant_id, account_code, account_name, account_type, account_sub_type, description, is_active, allow_manual_entry, balance) VALUES
-- === CASH & BANK ACCOUNTS (1000-1099) ===
(gen_random_uuid(), 1, '1000', 'Cash - General', 'ASSET', 'Cash', 'General operating cash', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '1010', 'Cash - Payroll', 'ASSET', 'Cash', 'Dedicated payroll account', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '1020', 'Cash - Change Fund', 'ASSET', 'Cash', 'Drawer change fund', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '1030', 'Petty Cash', 'ASSET', 'Cash', 'Small cash for minor expenses', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '1040', 'Bank - Operating Account', 'ASSET', 'Bank', 'Primary business checking', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '1050', 'Bank - Savings Account', 'ASSET', 'Bank', 'Business savings', TRUE, TRUE, 0),

-- === RECEIVABLES (1100-1199) ===
(gen_random_uuid(), 1, '1100', 'Accounts Receivable', 'ASSET', 'Receivables', 'Money owed by customers', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '1110', 'Credit Card Receivable', 'ASSET', 'Receivables', 'Pending card settlements', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '1120', 'House Account Receivable', 'ASSET', 'Receivables', 'In-house charge accounts', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '1130', 'Catering Receivable', 'ASSET', 'Receivables', 'Catering invoices outstanding', TRUE, TRUE, 0),

-- === INVENTORY (1200-1299) ===
(gen_random_uuid(), 1, '1200', 'Inventory - Food', 'ASSET', 'Inventory', 'Food inventory value', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '1210', 'Inventory - Beverage', 'ASSET', 'Inventory', 'Alcoholic beverages', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '1220', 'Inventory - Non-Alcoholic', 'ASSET', 'Inventory', 'Soft drinks, juices, water', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '1230', 'Inventory - Bar Supplies', 'ASSET', 'Inventory', 'Bar consumables', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '1240', 'Inventory - Paper & Packaging', 'ASSET', 'Inventory', 'To-go containers, napkins', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '1250', 'Inventory - Cleaning Supplies', 'ASSET', 'Inventory', 'Cleaning and sanitation', TRUE, TRUE, 0),

-- === PREPAID & OTHER CURRENT ASSETS (1300-1399) ===
(gen_random_uuid(), 1, '1300', 'Prepaid Expenses', 'ASSET', 'Prepaid', 'Prepaid rent, insurance', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '1310', 'Prepaid Insurance', 'ASSET', 'Prepaid', 'Insurance premiums paid ahead', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '1320', 'Prepaid Rent', 'ASSET', 'Prepaid', 'Rent paid in advance', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '1330', 'Deposits - Utility', 'ASSET', 'Deposits', 'Utility deposits', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '1340', 'Deposits - Landlord', 'ASSET', 'Deposits', 'Security deposits', TRUE, FALSE, 0),

-- === FIXED ASSETS (1500-1699) ===
(gen_random_uuid(), 1, '1500', 'Kitchen Equipment', 'ASSET', 'Fixed Assets', 'Cooking equipment, ovens', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '1510', 'Refrigeration Equipment', 'ASSET', 'Fixed Assets', 'Walk-ins, reach-ins', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '1520', 'POS Equipment', 'ASSET', 'Fixed Assets', 'Registers, terminals', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '1530', 'Furniture & Fixtures', 'ASSET', 'Fixed Assets', 'Tables, chairs, decor', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '1540', 'Leasehold Improvements', 'ASSET', 'Fixed Assets', 'Build-out improvements', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '1550', 'Computer Equipment', 'ASSET', 'Fixed Assets', 'IT hardware', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '1560', 'Vehicles', 'ASSET', 'Fixed Assets', 'Delivery vehicles', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '1600', 'Accumulated Depreciation', 'ASSET', 'Contra Asset', 'Depreciation to date', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '1700', 'Intangible Assets', 'ASSET', 'Intangible', 'Software, licenses', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '1800', 'Other Assets', 'ASSET', 'Other', 'Misc long-term assets', TRUE, TRUE, 0)
ON CONFLICT (account_code) DO NOTHING;

-- Liabilities (2000-2999)
INSERT INTO accounting_chart_of_accounts (account_id, restaurant_id, account_code, account_name, account_type, account_sub_type, description, is_active, allow_manual_entry, balance) VALUES
-- === PAYABLES (2000-2099) ===
(gen_random_uuid(), 1, '2000', 'Accounts Payable', 'LIABILITY', 'Payables', 'Money owed to vendors', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '2010', 'Credit Card Payable', 'LIABILITY', 'Payables', 'Business credit cards', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '2020', 'Accrued Expenses', 'LIABILITY', 'Accrued', 'Accrued liabilities', TRUE, TRUE, 0),

-- === TAX LIABILITIES (2100-2299) ===
(gen_random_uuid(), 1, '2100', 'Sales Tax Payable', 'LIABILITY', 'Tax Liabilities', 'Sales tax collected', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '2110', 'Sales Tax - State', 'LIABILITY', 'Tax Liabilities', 'State sales tax', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '2120', 'Sales Tax - Local', 'LIABILITY', 'Tax Liabilities', 'Local sales tax', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '2200', 'Federal Income Tax Payable', 'LIABILITY', 'Tax Liabilities', 'Federal withholding', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '2210', 'State Income Tax Payable', 'LIABILITY', 'Tax Liabilities', 'State withholding', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '2220', 'Social Security Tax Payable', 'LIABILITY', 'Tax Liabilities', 'FICA employer+employee', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '2225', 'Medicare Tax Payable', 'LIABILITY', 'Tax Liabilities', 'Medicare withholding', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '2230', 'Federal Unemployment Tax', 'LIABILITY', 'Tax Liabilities', 'FUTA liability', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '2240', 'State Unemployment Tax', 'LIABILITY', 'Tax Liabilities', 'SUTA liability', TRUE, FALSE, 0),

-- === WAGES & BENEFITS PAYABLE (2300-2399) ===
(gen_random_uuid(), 1, '2300', 'Wages Payable', 'LIABILITY', 'Payroll Liabilities', 'Accrued wages', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '2310', 'Tips Payable', 'LIABILITY', 'Payroll Liabilities', 'Tip liability', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '2320', 'Vacation Payable', 'LIABILITY', 'Payroll Liabilities', 'Accrued vacation', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '2330', 'Health Insurance Payable', 'LIABILITY', 'Payroll Liabilities', 'Employee benefits', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '2340', '401k Payable', 'LIABILITY', 'Payroll Liabilities', 'Retirement contributions', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '2350', ' Garnishments Payable', 'LIABILITY', 'Payroll Liabilities', 'Wage garnishments', TRUE, FALSE, 0),

-- === LONG-TERM LIABILITIES (2400-2999) ===
(gen_random_uuid(), 1, '2400', 'Notes Payable - Short Term', 'LIABILITY', 'Notes', 'Due within 1 year', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '2500', 'Notes Payable - Long Term', 'LIABILITY', 'Notes', 'Due after 1 year', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '2600', 'Equipment Loans', 'LIABILITY', 'Loans', 'Equipment financing', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '2700', 'Capital Lease Obligations', 'LIABILITY', 'Leases', 'Lease financing', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '2800', 'Deferred Revenue', 'LIABILITY', 'Deferred', 'Gift cards, prepayments', TRUE, TRUE, 0)
ON CONFLICT (account_code) DO NOTHING;

-- Equity (3000-3999)
INSERT INTO accounting_chart_of_accounts (account_id, restaurant_id, account_code, account_name, account_type, account_sub_type, description, is_active, allow_manual_entry, balance) VALUES
(gen_random_uuid(), 1, '3000', 'Owner''s Equity', 'EQUITY', 'Owner Equity', 'Owner investment', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '3010', 'Common Stock', 'EQUITY', 'Capital', 'Stock issued', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '3100', 'Retained Earnings', 'EQUITY', 'Retained', 'Accumulated profits', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '3200', 'Drawing Account', 'EQUITY', 'Draws', 'Owner withdrawals', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '3300', 'Current Year Earnings', 'EQUITY', 'Income', 'YTD profit/loss', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '3400', 'Prior Year Adjustments', 'EQUITY', 'Adjustments', 'Period adjustments', TRUE, FALSE, 0)
ON CONFLICT (account_code) DO NOTHING;

-- Revenue (4000-4999)
INSERT INTO accounting_chart_of_accounts (account_id, restaurant_id, account_code, account_name, account_type, account_sub_type, description, is_active, allow_manual_entry, balance) VALUES
-- === FOOD SALES (4100-4149) ===
(gen_random_uuid(), 1, '4000', 'Sales Revenue - Total', 'REVENUE', 'Total Revenue', 'Total sales (summary)', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '4100', 'Food Sales - Dine In', 'REVENUE', 'Food Revenue', 'Dining room sales', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '4110', 'Food Sales - Takeout', 'REVENUE', 'Food Revenue', 'To-go orders', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '4120', 'Food Sales - Delivery', 'REVENUE', 'Food Revenue', 'Delivery orders', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '4130', 'Food Sales - Catering', 'REVENUE', 'Food Revenue', 'Off-premise catering', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '4140', 'Food Sales - Drive Through', 'REVENUE', 'Food Revenue', 'Drive-through sales', TRUE, FALSE, 0),

-- === BEVERAGE SALES (4200-4249) ===
(gen_random_uuid(), 1, '4200', 'Beverage Sales - Total', 'REVENUE', 'Beverage Revenue', 'Total beverages', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '4210', 'Beverage Sales - Soft Drinks', 'REVENUE', 'Beverage Revenue', 'Non-alcoholic drinks', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '4220', 'Beverage Sales - Beer', 'REVENUE', 'Beverage Revenue', 'Draft and bottled beer', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '4230', 'Beverage Sales - Wine', 'REVENUE', 'Beverage Revenue', 'Wine by glass/bottle', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '4240', 'Beverage Sales - Liquor', 'REVENUE', 'Beverage Revenue', 'Cocktails and spirits', TRUE, FALSE, 0),

-- === OTHER REVENUE (4300-4999) ===
(gen_random_uuid(), 1, '4300', 'Catering Service Fees', 'REVENUE', 'Other Revenue', 'Catering setup fees', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '4400', 'Delivery Fees', 'REVENUE', 'Other Revenue', 'Delivery charges', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '4410', 'Service Charges', 'REVENUE', 'Other Revenue', 'Gratuity/service fees', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '4500', 'Gift Card Sales', 'REVENUE', 'Other Revenue', 'Gift card redemption', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '4600', 'Vending Revenue', 'REVENUE', 'Other Revenue', 'Vending machine income', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '4700', 'Commission Income', 'REVENUE', 'Other Revenue', 'Promotional commissions', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '4800', 'Other Operating Income', 'REVENUE', 'Other Revenue', 'Miscellaneous income', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '4900', 'Interest Income', 'REVENUE', 'Non-Operating', 'Bank interest earned', TRUE, TRUE, 0)
ON CONFLICT (account_code) DO NOTHING;

-- Cost of Goods Sold (5000-5999)
INSERT INTO accounting_chart_of_accounts (account_id, restaurant_id, account_code, account_name, account_type, account_sub_type, description, is_active, allow_manual_entry, balance) VALUES
-- === FOOD COST (5100-5149) ===
(gen_random_uuid(), 1, '5000', 'Cost of Goods Sold - Total', 'EXPENSE', 'COGS', 'Total COGS (summary)', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '5100', 'Cost of Goods Sold - Food', 'EXPENSE', 'COGS', 'Food cost of sales', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '5110', 'Food Cost - Proteins', 'EXPENSE', 'COGS', 'Meats and seafood', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '5120', 'Food Cost - Produce', 'EXPENSE', 'COGS', 'Vegetables and fruits', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '5130', 'Food Cost - Dairy', 'EXPENSE', 'COGS', 'Dairy products', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '5140', 'Food Cost - Dry Goods', 'EXPENSE', 'COGS', 'Pasta, rice, grains', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '5150', 'Food Cost - Oils & Condiments', 'EXPENSE', 'COGS', 'Oils, sauces, spices', TRUE, FALSE, 0),

-- === BEVERAGE COST (5200-5249) ===
(gen_random_uuid(), 1, '5200', 'Cost of Goods Sold - Beverage', 'EXPENSE', 'COGS', 'Beverage cost of sales', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '5210', 'Beverage Cost - Beer', 'EXPENSE', 'COGS', 'Beer cost', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '5220', 'Beverage Cost - Wine', 'EXPENSE', 'COGS', 'Wine cost', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '5230', 'Beverage Cost - Liquor', 'EXPENSE', 'COGS', 'Spirits cost', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '5240', 'Beverage Cost - Non-Alcoholic', 'EXPENSE', 'COGS', 'Soft drinks cost', TRUE, FALSE, 0),

-- === OTHER COGS (5300-5999) ===
(gen_random_uuid(), 1, '5300', 'Cost of Goods Sold - Catering', 'EXPENSE', 'COGS', 'Catering food cost', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '5400', 'Cost of Goods Sold - Delivery', 'EXPENSE', 'COGS', 'Delivery packaging', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '5500', 'Paper & Packaging Cost', 'EXPENSE', 'COGS', 'To-go containers', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '5600', 'Inventory Shrinkage', 'EXPENSE', 'COGS', 'Lost/stolen inventory', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '5700', 'Comp & Voided Food', 'EXPENSE', 'COGS', 'Comps and voids', TRUE, TRUE, 0)
ON CONFLICT (account_code) DO NOTHING;

-- Expenses (6000-7999)
INSERT INTO accounting_chart_of_accounts (account_id, restaurant_id, account_code, account_name, account_type, account_sub_type, description, is_active, allow_manual_entry, balance) VALUES
(gen_random_uuid(), 1, '6000', 'Labor Expense - Total', 'EXPENSE', 'Labor', 'Total labor (summary)', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '6010', 'Wages - FOH Hourly', 'EXPENSE', 'Labor', 'Servers, hosts, bussers', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '6020', 'Wages - BOH Hourly', 'EXPENSE', 'Labor', 'Cooks, prep, dish', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '6030', 'Wages - Bartenders', 'EXPENSE', 'Labor', 'Bar staff wages', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '6040', 'Wages - Delivery', 'EXPENSE', 'Labor', 'Drivers wages', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '6050', 'Wages - Management', 'EXPENSE', 'Labor', 'Salary managers', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '6060', 'Wages - Administrative', 'EXPENSE', 'Labor', 'Office staff', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '6070', 'Overtime Wages', 'EXPENSE', 'Labor', 'OT premium pay', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '6080', 'Tips - Distributed', 'EXPENSE', 'Labor', 'Tip distribution', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '6100', 'Payroll Taxes - FICA', 'EXPENSE', 'Labor', 'Social Security', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '6110', 'Payroll Taxes - Medicare', 'EXPENSE', 'Labor', 'Medicare tax', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '6120', 'Payroll Taxes - FUTA', 'EXPENSE', 'Labor', 'Federal unemployment', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '6130', 'Payroll Taxes - SUTA', 'EXPENSE', 'Labor', 'State unemployment', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '6200', 'Employee Benefits - Health', 'EXPENSE', 'Labor', 'Health insurance', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6210', 'Employee Benefits - 401k', 'EXPENSE', 'Labor', 'Retirement matches', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6220', 'Employee Benefits - Workers Comp', 'EXPENSE', 'Labor', 'WC insurance', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6230', 'Employee Benefits - Other', 'EXPENSE', 'Labor', 'Life, disability, etc', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6240', 'Employee Meals', 'EXPENSE', 'Labor', 'Staff meals', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6250', 'Uniforms & Apparel', 'EXPENSE', 'Labor', 'Staff uniforms', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6260', 'Employee Training', 'EXPENSE', 'Labor', 'Staff development', TRUE, TRUE, 0);

INSERT INTO accounting_chart_of_accounts (account_id, restaurant_id, account_code, account_name, account_type, account_sub_type, description, is_active, allow_manual_entry, balance) VALUES
(gen_random_uuid(), 1, '6300', 'Direct Operating Expenses', 'EXPENSE', 'Operations', 'Total direct ops', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6310', 'China, Glassware, Flatware', 'EXPENSE', 'Operations', 'Dinnerware replacement', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6320', 'Kitchen Supplies', 'EXPENSE', 'Operations', 'Kitchen consumables', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6330', 'Cleaning Supplies', 'EXPENSE', 'Operations', 'Sanitation supplies', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6340', 'Guest Supplies', 'EXPENSE', 'Operations', 'Napkins, condiments', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6350', 'Linen Service', 'EXPENSE', 'Operations', 'Table linens, laundry', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6360', 'Permits & Licenses', 'EXPENSE', 'Operations', 'Business permits', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6370', 'Restaurant Supplies', 'EXPENSE', 'Operations', 'Misc dining supplies', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6600', 'Marketing Expense - Total', 'EXPENSE', 'Marketing', 'Total marketing', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6610', 'Advertising - Print', 'EXPENSE', 'Marketing', 'Newspapers, flyers', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6620', 'Advertising - Digital', 'EXPENSE', 'Marketing', 'Online advertising', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6630', 'Social Media Marketing', 'EXPENSE', 'Marketing', 'Social platforms', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6640', 'Promotions & Discounts', 'EXPENSE', 'Marketing', 'Special offers', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6650', 'Loyalty Program', 'EXPENSE', 'Marketing', 'Rewards program', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6660', 'Marketing - Other', 'EXPENSE', 'Marketing', 'Misc marketing', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6700', 'Rent Expense', 'EXPENSE', 'Facilities', 'Building rent', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6710', 'Common Area Maintenance', 'EXPENSE', 'Facilities', 'CAM charges', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6720', 'Utilities - Electric', 'EXPENSE', 'Facilities', 'Electricity', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6730', 'Utilities - Gas', 'EXPENSE', 'Facilities', 'Natural gas', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6740', 'Utilities - Water', 'EXPENSE', 'Facilities', 'Water and sewer', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6750', 'Utilities - Trash Removal', 'EXPENSE', 'Facilities', 'Waste disposal', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6760', 'Pest Control', 'EXPENSE', 'Facilities', 'Pest management', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6770', 'Security Services', 'EXPENSE', 'Facilities', 'Alarm and security', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6800', 'Repairs & Maintenance', 'EXPENSE', 'Maintenance', 'General repairs', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6810', 'Equipment Repairs', 'EXPENSE', 'Maintenance', 'Kitchen equipment', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6820', 'Building Repairs', 'EXPENSE', 'Maintenance', 'Facility repairs', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6830', 'HVAC Maintenance', 'EXPENSE', 'Maintenance', 'Climate control', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6840', 'Plumbing Maintenance', 'EXPENSE', 'Maintenance', 'Water systems', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6850', 'Landscape Maintenance', 'EXPENSE', 'Maintenance', 'Outdoor areas', TRUE, TRUE, 0);

INSERT INTO accounting_chart_of_accounts (account_id, restaurant_id, account_code, account_name, account_type, account_sub_type, description, is_active, allow_manual_entry, balance) VALUES
(gen_random_uuid(), 1, '6900', 'Insurance Expense', 'EXPENSE', 'G&A', 'Business insurance', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6910', 'General Liability Insurance', 'EXPENSE', 'G&A', 'Liability coverage', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6920', 'Property Insurance', 'EXPENSE', 'G&A', 'Building coverage', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6930', 'Workers Compensation Insurance', 'EXPENSE', 'G&A', 'WC premium', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6940', 'Professional Services', 'EXPENSE', 'G&A', 'Legal, accounting', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6950', 'Accounting & Bookkeeping', 'EXPENSE', 'G&A', 'Bookkeeper fees', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6960', 'Legal Fees', 'EXPENSE', 'G&A', 'Attorney fees', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6970', 'Office Supplies', 'EXPENSE', 'G&A', 'Office expenses', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6980', 'Software & Subscriptions', 'EXPENSE', 'G&A', 'POS, accounting software', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6990', 'Bank Fees & Charges', 'EXPENSE', 'G&A', 'Banking fees', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '6995', 'Merchant Processing Fees', 'EXPENSE', 'G&A', 'Credit card fees', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '7000', 'Depreciation Expense', 'EXPENSE', 'Depreciation', 'Asset depreciation', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '7010', 'Amortization Expense', 'EXPENSE', 'Depreciation', 'Intangible amortization', TRUE, FALSE, 0),
(gen_random_uuid(), 1, '7100', 'Telephone & Internet', 'EXPENSE', 'Communications', 'Phone, internet', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '7200', 'Travel & Entertainment', 'EXPENSE', 'Travel', 'Business travel', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '7300', 'Meals & Entertainment', 'EXPENSE', 'Meals', 'Business meals', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '7400', 'Dues & Subscriptions', 'EXPENSE', 'Dues', 'Memberships', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '7500', 'Charitable Contributions', 'EXPENSE', 'Charity', 'Donations', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '7600', 'Licenses & Fees', 'EXPENSE', 'Licenses', 'Business licenses', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '7700', 'Equipment Rental', 'EXPENSE', 'Rentals', 'Equipment leases', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '7800', 'Interest Expense', 'EXPENSE', 'Interest', 'Loan interest', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '7900', 'Bad Debt Expense', 'EXPENSE', 'Bad Debt', 'Uncollectible accounts', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '7990', 'Miscellaneous Expense', 'EXPENSE', 'Other', 'Uncategorized expenses', TRUE, TRUE, 0),
(gen_random_uuid(), 1, '7999', 'Ask My Accountant', 'EXPENSE', 'Other', 'Temp holding account', TRUE, TRUE, 0);;

-- Insert default tax configurations for US (2024 rates)
INSERT INTO accounting_tax_config (tax_config_id, restaurant_id, country_code, tax_name, tax_type, tax_rate, tax_applies_to, is_active, priority, effective_from) VALUES
(gen_random_uuid(), 1, 'US', 'Federal Income Tax (10%)', 'FEDERAL_INCOME', 0.10, 'GROSS_PAY', TRUE, 10, CURRENT_TIMESTAMP),
(gen_random_uuid(), 1, 'US', 'Federal Income Tax (12%)', 'FEDERAL_INCOME', 0.12, 'GROSS_PAY', TRUE, 11, CURRENT_TIMESTAMP),
(gen_random_uuid(), 1, 'US', 'Federal Income Tax (22%)', 'FEDERAL_INCOME', 0.22, 'GROSS_PAY', TRUE, 12, CURRENT_TIMESTAMP),
(gen_random_uuid(), 1, 'US', 'Federal Income Tax (24%)', 'FEDERAL_INCOME', 0.24, 'GROSS_PAY', TRUE, 13, CURRENT_TIMESTAMP),
(gen_random_uuid(), 1, 'US', 'State Income Tax - CA', 'STATE_INCOME', 0.093, 'STATE_WAGES', TRUE, 20, CURRENT_TIMESTAMP),
(gen_random_uuid(), 1, 'US', 'State Income Tax - NY', 'STATE_INCOME', 0.0685, 'STATE_WAGES', TRUE, 21, CURRENT_TIMESTAMP),
(gen_random_uuid(), 1, 'US', 'State Income Tax - TX', 'STATE_INCOME', 0.00, 'STATE_WAGES', TRUE, 22, CURRENT_TIMESTAMP),
(gen_random_uuid(), 1, 'US', 'State Income Tax - FL', 'STATE_INCOME', 0.00, 'STATE_WAGES', TRUE, 23, CURRENT_TIMESTAMP),
(gen_random_uuid(), 1, 'US', 'Social Security', 'SOCIAL_SECURITY', 0.062, 'ALL_WAGES', TRUE, 30, CURRENT_TIMESTAMP),
(gen_random_uuid(), 1, 'US', 'Medicare', 'MEDICARE', 0.0145, 'ALL_WAGES', TRUE, 40, CURRENT_TIMESTAMP),
(gen_random_uuid(), 1, 'US', 'Additional Medicare', 'ADDITIONAL_MEDICARE', 0.009, 'ALL_WAGES', TRUE, 41, CURRENT_TIMESTAMP),
(gen_random_uuid(), 1, 'US', 'Federal Unemployment', 'FEDERAL_UNEMPLOYMENT', 0.006, 'FEDERAL_WAGES', TRUE, 50, CURRENT_TIMESTAMP),
(gen_random_uuid(), 1, 'US', 'State Unemployment - CA', 'STATE_UNEMPLOYMENT', 0.023, 'STATE_WAGES', TRUE, 60, CURRENT_TIMESTAMP),
(gen_random_uuid(), 1, 'US', 'State Unemployment - NY', 'STATE_UNEMPLOYMENT', 0.038, 'STATE_WAGES', TRUE, 61, CURRENT_TIMESTAMP),
(gen_random_uuid(), 1, 'US', 'State Unemployment - TX', 'STATE_UNEMPLOYMENT', 0.014, 'STATE_WAGES', TRUE, 62, CURRENT_TIMESTAMP),
(gen_random_uuid(), 1, 'US', 'State Unemployment - FL', 'STATE_UNEMPLOYMENT', 0.0027, 'STATE_WAGES', TRUE, 63, CURRENT_TIMESTAMP),
(gen_random_uuid(), 1, 'US', 'Sales Tax - CA', 'SALES_TAX', 0.0725, 'SALES', TRUE, 100, CURRENT_TIMESTAMP),
(gen_random_uuid(), 1, 'US', 'Sales Tax - NY', 'SALES_TAX', 0.08, 'SALES', TRUE, 101, CURRENT_TIMESTAMP),
(gen_random_uuid(), 1, 'US', 'Sales Tax - TX', 'SALES_TAX', 0.0625, 'SALES', TRUE, 102, CURRENT_TIMESTAMP),
(gen_random_uuid(), 1, 'US', 'Sales Tax - FL', 'SALES_TAX', 0.06, 'SALES', TRUE, 103, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
