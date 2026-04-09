-- V58__seed_tax_rules.sql
-- Seeds the comprehensive global tax dataset for 14 jurisdictions.
-- Refactored to handle UUIDs for referential integrity.

-- ============================================================
-- COUNTRIES
-- ============================================================
INSERT INTO countries (iso_code, name, currency_code, currency_symbol, tax_model, tax_included, notes) VALUES
('GB',    'United Kingdom',             'GBP', '£',   'VAT_INCLUSIVE',  TRUE,  'VAT temperature rule applies'),
('US-CA', 'United States (California)', 'USD', '$',   'TAX_EXCLUSIVE',  FALSE, '80/80 rule may apply'),
('US-OH', 'United States (Ohio)',       'USD', '$',   'TAX_EXCLUSIVE',  FALSE, 'Takeaway exempt'),
('US-NY', 'United States (New York)',   'USD', '$',   'TAX_EXCLUSIVE',  FALSE, 'Ready-to-eat food taxable'),
('IN',    'India',                      'INR', '₹',   'TAX_EXCLUSIVE',  FALSE, 'GST split CGST+SGST. Alcohol outside GST.'),
('AU',    'Australia',                  'AUD', 'A$',  'GST',            TRUE,  'Prepared meals 10%. Basic groceries exempt.'),
('CA',    'Canada (Ontario)',           'CAD', 'C$',  'TAX_EXCLUSIVE',  FALSE, 'Ontario $4 price threshold rule'),
('ZA',    'South Africa',               'ZAR', 'R',   'VAT_INCLUSIVE',  TRUE,  'Standard 15% VAT'),
('KE',    'Kenya',                      'KES', 'KSh', 'TAX_EXCLUSIVE',  FALSE, 'CTL 2% for qualifying venues'),
('NG',    'Nigeria',                    'NGN', '₦',   'TAX_EXCLUSIVE',  FALSE, 'Lagos State adds 5% consumption tax'),
('EG',    'Egypt',                      'EGP', 'E£',  'TAX_EXCLUSIVE',  FALSE, 'Service charge is taxable revenue'),
('GH',    'Ghana',                      'GHS', 'GH₵', 'TAX_EXCLUSIVE',  FALSE, 'Multiple cascading levies'),
('AE',    'United Arab Emirates',       'AED', 'AED', 'TAX_EXCLUSIVE',  FALSE, 'Alcohol 30% excise. Tobacco 100% excise.'),
('SA',    'Saudi Arabia',               'SAR', '﷼',   'TAX_EXCLUSIVE',  FALSE, 'Alcohol prohibited. Tobacco 100% excise.');

-- ============================================================
-- TAX RULES — United Kingdom
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, is_cascading, is_active, sort_order, description)
SELECT c.id,
  v.rule_code, v.rule_name, v.tax_type::VARCHAR, v.default_rate, v.min_rate, v.max_rate,
  v.dine_in, v.takeaway, v.hot, v.cold, v.alcohol,
  v.category, FALSE, TRUE, v.sort_order, v.description_text
FROM countries c,
(VALUES
  ('UK_VAT_STANDARD',      'UK VAT Standard Rate',                  'VAT', 0.20, 0.20, 0.20, TRUE,  TRUE,  TRUE,  NULL,  FALSE, NULL,      1, 'Dine-in all food; hot takeaway items'),
  ('UK_VAT_DINE_IN_COLD',  'UK VAT Dine-In Cold Items',             'VAT', 0.20, 0.20, 0.20, TRUE,  FALSE, FALSE, TRUE,  FALSE, NULL,      2, 'Cold food consumed on premises'),
  ('UK_VAT_ZERO',          'UK VAT Zero Rate — Cold Takeaway',      'VAT', 0.00, 0.00, 0.00, FALSE, TRUE,  FALSE, TRUE,  FALSE, 'FOOD',    3, 'Cold sandwiches/salads as takeaway are zero-rated'),
  ('UK_VAT_ALCOHOL',       'UK VAT — Alcohol',                      'VAT', 0.20, 0.20, 0.20, TRUE,  TRUE,  NULL,  NULL,  TRUE,  'ALCOHOL', 4, 'All alcohol at 20%'),
  ('UK_VAT_SERVICE_CHARGE','UK VAT on Mandatory Service Charge',    'VAT', 0.20, 0.20, 0.20, TRUE,  FALSE, NULL,  NULL,  FALSE, NULL,      5, 'Service charge taxed as revenue')
) AS v(rule_code,rule_name,tax_type,default_rate,min_rate,max_rate,dine_in,takeaway,hot,cold,alcohol,category,sort_order,description_text)
WHERE c.iso_code = 'GB';

-- ============================================================
-- TAX RULES — USA California
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, is_cascading, is_active, sort_order, description)
SELECT c.id,
  v.rule_code, v.rule_name, 'SALES_TAX', v.default_rate, v.min_rate, v.max_rate,
  v.dine_in, v.takeaway, v.hot, v.cold, v.alcohol,
  v.category, FALSE, TRUE, v.sort_order, v.description_text
FROM countries c,
(VALUES
  ('USCA_SALES_TAX_HOT',     'CA Sales Tax — Hot Food (Dine-In & Takeaway)', 0.095, 0.0725, 0.1075, TRUE,  TRUE,  TRUE,  FALSE, FALSE, NULL,      1, 'Hot food always taxable in CA'),
  ('USCA_SALES_TAX_COLD_EX', 'CA Exempt — Cold Takeaway Food',               0.000, 0.0000, 0.0000, FALSE, TRUE,  FALSE, TRUE,  FALSE, 'FOOD',    2, 'Cold to-go exempt unless 80/80 rule applies'),
  ('USCA_SALES_TAX_ALCOHOL',  'CA Sales Tax — Alcohol',                       0.095, 0.0725, 0.1075, TRUE,  TRUE,  NULL,  NULL,  TRUE,  'ALCOHOL', 3, 'Alcohol always taxable'),
  ('USCA_SALES_TAX_SC',       'CA Sales Tax — Mandatory Service Charge',      0.095, 0.0725, 0.1075, TRUE,  FALSE, NULL,  NULL,  FALSE, NULL,      4, 'Mandatory service charge is taxable')
) AS v(rule_code,rule_name,default_rate,min_rate,max_rate,dine_in,takeaway,hot,cold,alcohol,category,sort_order,description_text)
WHERE c.iso_code = 'US-CA';

-- ============================================================
-- TAX RULES — USA Ohio
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, is_cascading, is_active, sort_order, description)
SELECT c.id,
  v.rule_code, v.rule_name, v.tax_type::VARCHAR, v.default_rate, v.min_rate, v.max_rate,
  v.dine_in, v.takeaway, NULL, NULL, v.alcohol,
  NULL, FALSE, TRUE, v.sort_order, v.description_text
FROM countries c,
(VALUES
  ('USOH_SALES_TAX_DINE_IN', 'OH Sales Tax — Dine-In',   'SALES_TAX', 0.0575, 0.0575, 0.0800, TRUE,  FALSE, FALSE, 1, 'Standard dine-in rate'),
  ('USOH_EXEMPT_TAKEAWAY',   'OH Exempt — All Takeaway',  'SALES_TAX', 0.0000, 0.0000, 0.0000, FALSE, TRUE,  FALSE, 2, 'All takeaway food exempt in Ohio'),
  ('USOH_SALES_TAX_ALCOHOL',  'OH Sales Tax — Alcohol',   'SALES_TAX', 0.0575, 0.0575, 0.0800, TRUE,  TRUE,  TRUE,  3, 'Alcohol always taxable')
) AS v(rule_code,rule_name,tax_type,default_rate,min_rate,max_rate,dine_in,takeaway,alcohol,sort_order,description_text)
WHERE c.iso_code = 'US-OH';

-- ============================================================
-- TAX RULES — USA New York
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, is_cascading, is_active, sort_order, description)
SELECT c.id, v.rule_code, v.rule_name, 'SALES_TAX', v.rate, v.rate, v.rate,
  TRUE, TRUE, NULL, NULL, v.alcohol, NULL, FALSE, TRUE, v.sort_order, v.description_text
FROM countries c,
(VALUES
  ('USNY_SALES_TAX_READY_EAT', 'NY Sales Tax — Ready-to-Eat', 0.08875, FALSE, 1, 'All ready-to-eat food taxable'),
  ('USNY_SALES_TAX_ALCOHOL',   'NY Sales Tax — Alcohol',       0.08875, TRUE,  2, 'Alcohol taxable')
) AS v(rule_code,rule_name,rate,alcohol,sort_order,description_text)
WHERE c.iso_code = 'US-NY';

-- ============================================================
-- TAX RULES — India
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, is_cascading, is_active, sort_order, description)
SELECT c.id, v.rule_code, v.rule_name, v.tax_type::VARCHAR, v.default_rate, v.min_rate, v.max_rate,
  TRUE, TRUE, NULL, NULL, v.alcohol, v.category, FALSE, TRUE, v.sort_order, v.description_text
FROM countries c,
(VALUES
  ('IN_GST_5',             'India GST — Standard Restaurants (5%)',     'GST',          0.05, 0.05, 0.05, FALSE, 'FOOD',     1, 'No ITC. Standalone restaurants.'),
  ('IN_GST_18',            'India GST — Luxury Hotel Restaurants (18%)','GST',          0.18, 0.18, 0.18, FALSE, 'FOOD',     2, 'ITC allowed. Hotel room tariff >₹7500/night.'),
  ('IN_STATE_EXCISE_ALCO', 'India State Excise — Alcohol',              'STATE_EXCISE', 0.20, 0.15, 0.35, TRUE,  'ALCOHOL',  3, 'Outside GST scope. State-level excise.')
) AS v(rule_code,rule_name,tax_type,default_rate,min_rate,max_rate,alcohol,category,sort_order,description_text)
WHERE c.iso_code = 'IN';

-- ============================================================
-- TAX RULES — Australia
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, is_cascading, is_active, sort_order, description)
SELECT c.id, v.rule_code, v.rule_name, 'GST', v.rate, v.rate, v.rate,
  TRUE, TRUE, NULL, NULL, v.alcohol, v.category, FALSE, TRUE, v.sort_order, v.description_text
FROM countries c,
(VALUES
  ('AU_GST_PREPARED',      'AU GST — Prepared Meals',         0.10, FALSE, 'FOOD',     1, 'Sushi, sandwiches, hot pies — 10%'),
  ('AU_GST_EXEMPT_BASIC',  'AU GST — Basic Groceries Exempt', 0.00, FALSE, 'FOOD',     2, 'Unprocessed fruit, veg, basic bread — 0%'),
  ('AU_GST_ALCOHOL',       'AU GST — Alcohol',                0.10, TRUE,  'ALCOHOL',  3, 'Standard 10% GST on alcohol')
) AS v(rule_code,rule_name,rate,alcohol,category,sort_order,description_text)
WHERE c.iso_code = 'AU';

-- ============================================================
-- TAX RULES — Canada (Ontario)
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, price_threshold_max, price_threshold_min,
  is_cascading, is_active, sort_order, description)
SELECT c.id, v.rule_code, v.rule_name, v.tax_type::VARCHAR, v.rate, v.min_r, v.max_r,
  v.dine_in, v.takeaway, NULL, NULL, v.alcohol, v.category, v.thresh_max, v.thresh_min,
  FALSE, TRUE, v.sort_order, v.description_text
FROM countries c,
(VALUES
  ('CA_GST_ONLY',        'Canada GST Only (<$4 Ontario Rebate)', 'SALES_TAX', 0.05, 0.05, 0.05, FALSE, TRUE,  FALSE, NULL,      4.00,     NULL,      1, 'Under $4 takeaway: 5% GST only, provincial rebated'),
  ('CA_HST_ON',          'Canada HST Ontario (≥$4)',             'SALES_TAX', 0.13, 0.13, 0.15, TRUE,  TRUE,  FALSE, NULL,      NULL,     4.00,      2, 'Standard HST for Ontario above $4 threshold'),
  ('CA_GST_COLD_EXEMPT', 'Canada GST — Cold Basic Grocery',      'SALES_TAX', 0.00, 0.00, 0.00, FALSE, TRUE,  FALSE, 'FOOD',    NULL,     NULL,      3, 'Unprocessed cold groceries zero-rated'),
  ('CA_HST_ALCOHOL',     'Canada HST — Alcohol',                 'SALES_TAX', 0.13, 0.05, 0.15, TRUE,  TRUE,  TRUE,  'ALCOHOL', NULL,     NULL,      4, 'Alcohol HST')
) AS v(rule_code,rule_name,tax_type,rate,min_r,max_r,dine_in,takeaway,alcohol,category,thresh_max,thresh_min,sort_order,description_text)
WHERE c.iso_code = 'CA';

-- ============================================================
-- TAX RULES — South Africa
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, is_cascading, is_active, sort_order, description)
SELECT c.id, v.rule_code, v.rule_name, 'VAT', v.rate, v.rate, v.rate,
  TRUE, TRUE, NULL, NULL, v.alcohol, v.category, FALSE, TRUE, v.sort_order, v.description_text
FROM countries c,
(VALUES
  ('ZA_VAT_STANDARD',   'SA VAT — Prepared Food',           0.15, FALSE, 'FOOD',     1, '15% on all prepared restaurant food'),
  ('ZA_VAT_ZERO_STAPLE','SA VAT — Unprocessed Staples Zero',0.00, FALSE, 'FOOD',     2, 'Raw veg, milk, bread — zero-rated'),
  ('ZA_VAT_ALCOHOL',    'SA VAT — Alcohol',                  0.15, TRUE,  'ALCOHOL',  3, 'Standard VAT on alcohol')
) AS v(rule_code,rule_name,rate,alcohol,category,sort_order,description_text)
WHERE c.iso_code = 'ZA';

-- ============================================================
-- TAX RULES — Kenya
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, is_cascading, is_active, sort_order, description)
SELECT c.id, v.rule_code, v.rule_name, v.tax_type::VARCHAR, v.rate, v.rate, v.rate,
  TRUE, TRUE, NULL, NULL, v.alcohol, NULL, v.cascading, TRUE, v.sort_order, v.description_text
FROM countries c,
(VALUES
  ('KE_VAT_STANDARD', 'Kenya VAT',                    'VAT',   0.16, FALSE, FALSE, 1, '16% VAT on all restaurant sales'),
  ('KE_CTL_LEVY',     'Kenya Catering Tourism Levy',  'LEVY',  0.02, TRUE,  FALSE, 2, '2% CTL for venues above revenue threshold'),
  ('KE_VAT_ALCOHOL',  'Kenya VAT — Alcohol',          'VAT',   0.16, FALSE, TRUE,  3, 'Standard 16% on alcohol')
) AS v(rule_code,rule_name,tax_type,rate,cascading,alcohol,sort_order,description_text)
WHERE c.iso_code = 'KE';

-- Set cascade target for KE_CTL_LEVY
UPDATE tax_rules
SET cascade_on_rule_id = (SELECT r1.id FROM tax_rules r1 WHERE r1.rule_code = 'KE_VAT_STANDARD')
WHERE rule_code = 'KE_CTL_LEVY';

-- ============================================================
-- TAX RULES — Nigeria
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, is_cascading, is_active, sort_order, description)
SELECT c.id, v.rule_code, v.rule_name, v.tax_type::VARCHAR, v.rate, v.rate, v.rate,
  TRUE, TRUE, NULL, NULL, v.alcohol, NULL, FALSE, TRUE, v.sort_order, v.description_text
FROM countries c,
(VALUES
  ('NG_FEDERAL_VAT',      'Nigeria Federal VAT',           'VAT',   0.075, FALSE, 1, '7.5% federal VAT'),
  ('NG_LAGOS_CONSUMPTION','Lagos State Consumption Tax',   'LEVY',  0.050, FALSE, 2, '5% additive tax in Lagos state'),
  ('NG_ALCOHOL_VAT',      'Nigeria VAT — Alcohol',         'VAT',   0.075, TRUE,  3, 'Federal VAT on alcohol')
) AS v(rule_code,rule_name,tax_type,rate,alcohol,sort_order,description_text)
WHERE c.iso_code = 'NG';

-- ============================================================
-- TAX RULES — Egypt
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, is_cascading, is_active, sort_order, description)
SELECT c.id, v.rule_code, v.rule_name, 'VAT', v.rate, v.rate, v.rate,
  TRUE, TRUE, NULL, NULL, FALSE, NULL, v.cascading, TRUE, v.sort_order, v.description_text
FROM countries c,
(VALUES
  ('EG_VAT_STANDARD',    'Egypt VAT',                         0.14, FALSE, 1, 'Standard 14% VAT'),
  ('EG_SERVICE_CHARGE',  'Egypt Mandatory Service Charge',    0.12, FALSE, 2, '12% SC added to bill as taxable revenue'),
  ('EG_VAT_ON_SC',       'Egypt VAT Applied on Service Charge',0.14, TRUE,  3, '14% VAT cascades on top of 12% SC')
) AS v(rule_code,rule_name,rate,cascading,sort_order,description_text)
WHERE c.iso_code = 'EG';

UPDATE tax_rules
SET cascade_on_rule_id = (SELECT r1.id FROM tax_rules r1 WHERE r1.rule_code = 'EG_SERVICE_CHARGE')
WHERE rule_code = 'EG_VAT_ON_SC';

-- ============================================================
-- TAX RULES — Ghana
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, is_cascading, is_active, sort_order, description)
SELECT c.id, v.rule_code, v.rule_name, v.tax_type::VARCHAR, v.rate, v.rate, v.rate,
  TRUE, TRUE, NULL, NULL, FALSE, NULL, FALSE, TRUE, v.sort_order, v.description_text
FROM countries c,
(VALUES
  ('GH_VAT',          'Ghana VAT',                          'VAT',   0.125, 1, '12.5% standard VAT'),
  ('GH_NHIL',         'National Health Insurance Levy',     'LEVY',  0.025, 2, '2.5% NHIL on base price'),
  ('GH_GETFUND',      'Ghana Education Fund Levy',          'LEVY',  0.025, 3, '2.5% GETFund on base price'),
  ('GH_COVID_LEVY',   'COVID-19 Recovery Levy',             'LEVY',  0.010, 4, '1% on base price'),
  ('GH_TOURISM_LEVY', 'Tourism Levy',                       'LEVY',  0.010, 5, '1% on base price')
) AS v(rule_code,rule_name,tax_type,rate,sort_order,description_text)
WHERE c.iso_code = 'GH';

-- ============================================================
-- TAX RULES — UAE
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, is_cascading, is_active, sort_order, description)
SELECT c.id, v.rule_code, v.rule_name, v.tax_type::VARCHAR, v.rate, v.rate, v.rate,
  TRUE, TRUE, NULL, NULL, v.alcohol, v.category, FALSE, TRUE, v.sort_order, v.description_text
FROM countries c,
(VALUES
  ('AE_VAT_STANDARD',      'UAE VAT',                          'VAT',    0.05, FALSE, NULL,      1, '5% standard VAT on food and non-alcohol'),
  ('AE_VAT_ALCOHOL',       'UAE VAT + Excise — Alcohol',       'EXCISE', 0.30, TRUE,  'ALCOHOL', 2, '30% effective rate on alcohol'),
  ('AE_EXCISE_TOBACCO',    'UAE Excise — Tobacco/Shisha',      'EXCISE', 1.00, FALSE, 'TOBACCO', 3, '100% excise on tobacco products'),
  ('AE_VAT_SERVICE_CHARGE','UAE VAT on Service Charge',        'VAT',    0.05, FALSE, NULL,      4, '5% VAT applied to service charge')
) AS v(rule_code,rule_name,tax_type,rate,alcohol,category,sort_order,description_text)
WHERE c.iso_code = 'AE';

-- ============================================================
-- TAX RULES — Saudi Arabia
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, is_cascading, is_active, sort_order, description)
SELECT c.id, v.rule_code, v.rule_name, v.tax_type::VARCHAR, v.rate, v.rate, v.rate,
  TRUE, TRUE, NULL, NULL, FALSE, v.category, FALSE, TRUE, v.sort_order, v.description_text
FROM countries c,
(VALUES
  ('SA_VAT_STANDARD',   'Saudi Arabia VAT',             'VAT',    0.15, NULL,      1, '15% standard VAT on all food and beverages'),
  ('SA_EXCISE_TOBACCO', 'KSA Excise — Tobacco/Shisha',  'EXCISE', 1.00, 'TOBACCO', 2, '100% excise on tobacco products')
) AS v(rule_code,rule_name,tax_type,rate,category,sort_order,description_text)
WHERE c.iso_code = 'SA';

-- ============================================================
-- VERIFY SEED
-- ============================================================
DO $$
DECLARE
  country_count INT;
  rule_count    INT;
BEGIN
  SELECT COUNT(*) INTO country_count FROM countries;
  SELECT COUNT(*) INTO rule_count    FROM tax_rules;
  IF country_count < 14 THEN RAISE NOTICE 'Seed partial: expected 14 countries, got %', country_count; END IF;
  RAISE NOTICE 'Seed OK: % countries, % tax rules', country_count, rule_count;
END $$;
