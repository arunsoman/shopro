-- V59__seed_african_tax_rules_v2.sql
-- Adds additional African jurisdictions: Morocco, Tanzania, Mauritius.
-- Refactored for UUID support.

-- ============================================================
-- COUNTRIES
-- ============================================================
INSERT INTO countries (iso_code, name, currency_code, currency_symbol, tax_model, tax_included, notes) VALUES
('MA', 'Morocco',   'MAD', 'DH',  'VAT_INCLUSIVE', TRUE,  'Reduced 10% for tourist establishments'),
('TZ', 'Tanzania',  'TZS', 'TSh', 'TAX_EXCLUSIVE', FALSE, '18% VAT + 2% Hotel Levy'),
('MU', 'Mauritius', 'MUR', 'Rs',  'VAT_INCLUSIVE', TRUE,  'Standard 15% VAT');

-- ============================================================
-- TAX RULES — Morocco
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, is_cascading, is_active, sort_order, description)
SELECT c.id, v.rule_code, v.rule_name, 'VAT', v.rate, v.rate, v.rate,
  TRUE, TRUE, NULL, NULL, FALSE, NULL, FALSE, TRUE, v.sort_order, v.description_text
FROM countries c,
(VALUES
  ('MA_VAT_TOURIST', 'Morocco VAT — Tourist Rate', 0.10, 1, 'Reduced 10% rate for licensed tourist restaurants'),
  ('MA_VAT_STANDARD', 'Morocco VAT — Standard',     0.20, 2, 'Standard 20% VAT for other services')
) AS v(rule_code,rule_name,rate,sort_order,description_text)
WHERE c.iso_code = 'MA';

-- ============================================================
-- TAX RULES — Tanzania
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, is_cascading, is_active, sort_order, description)
SELECT c.id, v.rule_code, v.rule_name, v.tax_type::VARCHAR, v.rate, v.rate, v.rate,
  TRUE, TRUE, NULL, NULL, FALSE, NULL, FALSE, TRUE, v.sort_order, v.description_text
FROM countries c,
(VALUES
  ('TZ_VAT_STANDARD', 'Tanzania VAT',         'VAT',  0.18, 1, 'Standard 18% VAT'),
  ('TZ_HOTEL_LEVY',   'Tanzania Hotel Levy',   'LEVY', 0.02, 2, '2% Hotel levy on food and beverage services')
) AS v(rule_code,rule_name,tax_type,rate,sort_order,description_text)
WHERE c.iso_code = 'TZ';

-- ============================================================
-- TAX RULES — Mauritius
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, is_cascading, is_active, sort_order, description)
SELECT c.id, v.rule_code, v.rule_name, 'VAT', v.rate, v.rate, v.rate,
  TRUE, TRUE, NULL, NULL, FALSE, NULL, FALSE, TRUE, v.sort_order, v.description_text
FROM countries c,
(VALUES
  ('MU_VAT_STANDARD', 'Mauritius VAT', 0.15, 1, 'Standard 15% VAT on restaurant services')
) AS v(rule_code,rule_name,rate,sort_order,description_text)
WHERE c.iso_code = 'MU';
