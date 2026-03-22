-- V21 Update Missing Entity Fields with Seed Data
-- We update existing records rather than modifying older seed files to avoid Flyway checksum errors.

UPDATE restaurant
SET 
    onboarding_status = 'COMPLETED',
    contact_person = 'Default Contact Person',
    alternate_phone = '+1-555-000-0000',
    kyc_vetted = true,
    vetting_date = CURRENT_TIMESTAMP,
    rating = 4.5,
    performance_metrics = '{"order_completion_rate": 98.5, "average_response_time": "2 hours"}'::jsonb
WHERE alternate_phone IS NULL;

UPDATE supplier
SET 
    organization_id = 'ORG-' || substring(id::text from 1 for 8),
    regions = 'Global',
    contact_person = 'Default Supplier Contact',
    alternate_phone = '+1-555-111-1111',
    kyc_vetted = true,
    vetting_date = CURRENT_TIMESTAMP,
    rating = 4.8,
    performance_metrics = '{"fulfillment_score": 99.1, "return_rate": 0.5}'::jsonb
WHERE alternate_phone IS NULL;
