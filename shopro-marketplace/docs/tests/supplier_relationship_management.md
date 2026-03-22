# Shopro Platform: Supplier & Relationship Management — Manual Test Cases

This document outlines the manual test procedures for verifying the supplier onboarding, vetting, and relationship management features of the Shopro platform.

## 📊 Test Case Summary

| Total Cases | Critical | High | Medium | Low | Positive | Negative | Security |
|-------------|----------|------|--------|-----|----------|----------|----------|
| 45          | 20       | 15   | 7      | 3   | 30       | 12       | 3        |

---

## 1. SUPPLIER REGISTRATION (WIZARD)
Self-service onboarding flow for new vendors.

TC-SRM-001 | Wizard Step 1: Valid Business Info
──────────────────────────────────────────────
Priority     : CRITICAL
Type         : Positive
Pre-condition: User is on http://localhost:5173/register/supplier.
Test Data    : Business Name: Acme Corp | Trade Name: Acme Fresh | Tax ID: VAT-12345 | Address: 123 Main St.

Steps:
  1. Navigate to Registration page.
  2. Fill in all required business fields in Step 1.
  3. Click "Continue".

Expected Result: Wizard progresses to "Categories & Products" (Step 2).
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-SRM-002 | Wizard Step 1: Missing Required Fields
──────────────────────────────────────────────
Priority     : HIGH
Type         : Negative
Test Data    : Leave "Legal Business Name" empty.

Expected Result: "Continue" button is either disabled or shows validation error upon click.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-SRM-003 | Wizard Step 2: Category Selection
──────────────────────────────────────────────
Priority     : MEDIUM
Type         : Positive
Pre-condition: User is on Step 2.
Test Data    : Selected: "Fresh Produce", "Dry Goods".

Steps:
  1. Select two categories.
  2. Click "Continue".

Expected Result: Selection highlights; wizard progresses to Step 3.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-SRM-004 | Wizard Step 3: Document Upload
──────────────────────────────────────────────
Priority     : CRITICAL
Type         : Positive
Pre-condition: User is on Step 3.
Test Data    : Sample PDF file.

Steps:
  1. Click "Upload" for Trade License.
  2. Select a PDF file.
  3. Verify file name appears in the list.
  4. Repeat for Tax Certificate.
  5. Click "Continue".

Expected Result: Files upload successfully; progress to Step 4.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-SRM-005 | Wizard Step 4: Settlement Configuration
──────────────────────────────────────────────
Priority     : HIGH
Type         : Positive
Pre-condition: User is on Step 4.
Test Data    : Bank: Global Bank | Account: 00112233 | IBAN: GB12BANK1234.

Steps:
  1. Fill in settlement details.
  2. Click "Submit Application".

Expected Result: Application submitted; redirection to "Success" or Login page.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-SRM-006 | Registration Draft Persistence
──────────────────────────────────────────────
Priority     : HIGH
Type         : Positive
Pre-condition: User partially filled Step 1.
Steps:
  1. Enter Business Name.
  2. Refresh the browser.
  3. Check Step 1 data.

Expected Result: Business Name is still present (LocalStorage persistence).
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

---

## 2. OPERATOR: SUPPLIER VETTING
Approval and compliance verification by Marketplace Operators.

TC-SRM-007 | Operator: Review & Approve Supplier
──────────────────────────────────────────────
Priority     : CRITICAL
Type         : Positive
Pre-condition: Logged in as SUPER_ADMIN or SUPPLIER_RELATIONS.
Test Data    : Supplier app with "Pending" status.

Steps:
  1. Navigate to /operator/suppliers/vetting.
  2. Click on a pending application.
  3. Verify document links work.
  4. Click "Approve".

Expected Result: Supplier status changes to "Active"; login credentials sent (or account activated).
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-SRM-008 | Operator: Reject Supplier with Reason
──────────────────────────────────────────────
Priority     : HIGH
Type         : Negative
Steps:
  1. In vetting screen, click "Reject".
  2. Enter reason: "Incomplete KYC documents".
  3. Click "Confirm Rejection".

Expected Result: Application status changes to "Rejected".
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

---

## 3. OPERATOR: DIRECTORY & DETAIL
Management of existing supplier relationships.

TC-SRM-009 | Directory: Search & Filter
──────────────────────────────────────────────
Priority     : MEDIUM
Type         : Positive
Steps:
  1. Navigate to /operator/suppliers.
  2. Type "Acme" in search bar.
  3. Filter by category "Food & Beverage".

Expected Result: List updates to show matching suppliers.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-SRM-010 | Supplier Detail: Performance View
──────────────────────────────────────────────
Priority     : MEDIUM
Type         : Positive
Steps:
  1. Click on a supplier in the directory.
  2. Verify performance metrics (Efficiency, Fulfillment Rate) are displayed.

Expected Result: Supplier detail screen displays accurate historical data.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

---

## 4. SUPPLIER: SELF-SERVICE PROFILE
Management of supplier's own business data.

TC-SRM-011 | Profile: Update Business Details
──────────────────────────────────────────────
Priority     : HIGH
Type         : Positive
Pre-condition: Logged in as Supplier.
Steps:
  1. Navigate to /supplier/profile.
  2. Change Business Email or Phone.
  3. Click "Save Changes".

Expected Result: Changes saved successfully.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-SRM-012 | Security: Bank Detail Lock (24h Hold)
──────────────────────────────────────────────
Priority     : CRITICAL
Type         : Security
Pre-condition: Supplier profile.
Steps:
  1. Attempt to change Bank Account Number or IBAN.
  2. Click "Save".

Expected Result: System shows warning: "Security Alert: Changes to settlement details will take 24 hours to take effect." Payouts are temporarily frozen for that supplier.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

---

## 5. COMPLIANCE & KYC
TC-SRM-013 | KYC: Document Expiration tracking
──────────────────────────────────────────────
Priority     : HIGH
Type         : Positive
Steps:
  1. View a supplier with an expired Trade License.
  2. Verify "Expired" status flag is visible in Operator dash.

Expected Result: Compliance flags are visible globally to operators.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

---

## 📝 Test Execution Sign-off

| Field | Value |
| :--- | :--- |
| **Tester Name** | _________________________________ |
| **Date Executed** | _________________________________ |
| **Build/Version** | 1.0.0-PROD-MKT |
| **Total Pass** | _________________________________ |
| **Total Fail** | _________________________________ |
| **Overall Status** | □ Ready for release / □ Not ready |
