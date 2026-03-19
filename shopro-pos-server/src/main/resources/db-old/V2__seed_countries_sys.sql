-- V2__seed_countries_sys.sql
INSERT INTO countries (id, iso_code, name, currency_code, currency_symbol, tax_model, tax_included, notes, version, created_at, updated_at)
VALUES
('7f9d8f81-a502-42d9-9237-08329a3552af', 'GB', 'United Kingdom', 'GBP', '£', 'VAT_INCLUSIVE', true, 'VAT temperature rule applies', 0, '2026-03-15T02:56:26.929Z', '2026-03-15T02:56:26.929Z'),
('65998422-419e-4cda-9226-0dd31517a22f', 'US-CA', 'United States (California)', 'USD', '$', 'TAX_EXCLUSIVE', false, '80/80 rule may apply', 0, '2026-03-15T02:56:26.929Z', '2026-03-15T02:56:26.929Z'),
('d6f53a8a-9e2c-4b7b-9087-f9ba9f2ece7a', 'US-OH', 'United States (Ohio)', 'USD', '$', 'TAX_EXCLUSIVE', false, 'Takeaway exempt', 0, '2026-03-15T02:56:26.929Z', '2026-03-15T02:56:26.929Z'),
('0c66871c-373b-4099-8cd9-5d2f3658873f', 'US-NY', 'United States (New York)', 'USD', '$', 'TAX_EXCLUSIVE', false, 'Ready-to-eat food taxable', 0, '2026-03-15T02:56:26.929Z', '2026-03-15T02:56:26.929Z'),
('3f5b31ea-db5c-4118-8a4b-7b072aff894e', 'IN', 'India', 'INR', '₹', 'TAX_EXCLUSIVE', false, 'GST split CGST+SGST. Alcohol outside GST.', 0, '2026-03-15T02:56:26.929Z', '2026-03-15T02:56:26.929Z'),
('bd0511d5-51a1-4800-b8fb-17cdd6718191', 'AU', 'Australia', 'AUD', 'A$', 'GST', true, 'Prepared meals 10%. Basic groceries exempt.', 0, '2026-03-15T02:56:26.929Z', '2026-03-15T02:56:26.929Z'),
('302a240d-7625-4a70-a008-4df9078b2824', 'CA', 'Canada (Ontario)', 'CAD', 'C$', 'TAX_EXCLUSIVE', false, 'Ontario $4 price threshold rule', 0, '2026-03-15T02:56:26.929Z', '2026-03-15T02:56:26.929Z'),
('7480d420-78ba-4e54-b76a-b3b3c1df1b0e', 'ZA', 'South Africa', 'ZAR', 'R', 'VAT_INCLUSIVE', true, 'Standard 15% VAT', 0, '2026-03-15T02:56:26.929Z', '2026-03-15T02:56:26.929Z'),
('3264dc2a-be4c-4514-a4b1-1f843a73eea8', 'KE', 'Kenya', 'KES', 'KSh', 'TAX_EXCLUSIVE', false, 'CTL 2% for qualifying venues', 0, '2026-03-15T02:56:26.929Z', '2026-03-15T02:56:26.929Z'),
('ea7f44bd-e117-4e7d-9d0c-c3f2c0cda49b', 'NG', 'Nigeria', 'NGN', '₦', 'TAX_EXCLUSIVE', false, 'Lagos State adds 5% consumption tax', 0, '2026-03-15T02:56:26.929Z', '2026-03-15T02:56:26.929Z'),
('e97ebd1c-ee3b-472a-9d82-b865b1c80d8f', 'EG', 'Egypt', 'EGP', 'E£', 'TAX_EXCLUSIVE', false, 'Service charge is taxable revenue', 0, '2026-03-15T02:56:26.929Z', '2026-03-15T02:56:26.929Z'),
('32c494e8-db02-4792-843f-3e17be290b1d', 'GH', 'Ghana', 'GHS', 'GH₵', 'TAX_EXCLUSIVE', false, 'Multiple cascading levies', 0, '2026-03-15T02:56:26.929Z', '2026-03-15T02:56:26.929Z'),
('146c7b9b-9eff-49e5-8901-de1ab1bc65e0', 'AE', 'United Arab Emirates', 'AED', 'AED', 'TAX_EXCLUSIVE', false, 'Alcohol 30% excise. Tobacco 100% excise.', 0, '2026-03-15T02:56:26.929Z', '2026-03-15T02:56:26.929Z'),
('50da20da-6e3e-4f77-939f-e6086dd56f2f', 'SA', 'Saudi Arabia', 'SAR', '﷼', 'TAX_EXCLUSIVE', false, 'Alcohol prohibited. Tobacco 100% excise.', 0, '2026-03-15T02:56:26.929Z', '2026-03-15T02:56:26.929Z'),
('3102e105-7276-4e0d-8dc8-0c20fbfd840f', 'MA', 'Morocco', 'MAD', 'DH', 'VAT_INCLUSIVE', true, 'Reduced 10% for tourist establishments', 0, '2026-03-15T02:56:26.965Z', '2026-03-15T02:56:26.965Z'),
('758bd267-46bd-401e-9ea0-1b2da2ffd6bc', 'TZ', 'Tanzania', 'TZS', 'TSh', 'TAX_EXCLUSIVE', false, '18% VAT + 2% Hotel Levy', 0, '2026-03-15T02:56:26.965Z', '2026-03-15T02:56:26.965Z'),
('40feffcd-5b0a-4279-934f-3b5c0186ac94', 'MU', 'Mauritius', 'MUR', 'Rs', 'VAT_INCLUSIVE', true, 'Standard 15% VAT', 0, '2026-03-15T02:56:26.965Z', '2026-03-15T02:56:26.965Z')
ON CONFLICT (iso_code) DO NOTHING;
