# Shopro Platform: Governance & Access — Manual Test Cases

This document outlines the manual test procedures for verifying the security, access control, and user management features of the Shopro platform.

## 📊 Test Case Summary

| Total Cases | Critical | High | Medium | Low | Positive | Negative | Security |
|-------------|----------|------|--------|-----|----------|----------|----------|
| 104         | 48       | 35   | 12     | 9   | 34       | 70       | 18       |

---

## 1. OPERATOR LOGIN
Verification of authentication flows across all administrative roles.

TC-GA-001 | Successful Login for All Roles
──────────────────────────────────────────────
Priority     : CRITICAL
Type         : Positive
Pre-condition: User is on the Operator login page (http://localhost:5173/operator/login).
Test Data    : 
| Role | Email | Password |
| :--- | :--- | :--- |
| SUPER_ADMIN | root@shopro.internal | ShoproRoot@2024! |
| OPS_MANAGER | ops@shopro.internal | ShoproTest@2024! |
| PROCUREMENT_OFFICER | procurement@shopro.internal | ShoproTest@2024! |
| FINANCE_OFFICER | finance@shopro.internal | ShoproTest@2024! |
| SUPPLIER_RELATIONS | supplierrel@shopro.internal | ShoproTest@2024! |
| SUPPORT_AGENT | support@shopro.internal | ShoproTest@2024! |
| AUDITOR | auditor@shopro.internal | ShoproTest@2024! |

Steps:
  1. Navigate to http://localhost:5173/operator/login.
  2. For EACH role listed above:
     a. Enter Email and Password.
     b. Click "Login".
     c. (If MFA is triggered for root, complete it).
     d. Verify success message and redirection to `/operator/dashboard`.
     e. Logout.

Expected Result: All 7 roles can successfully log in and reach the dashboard.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-GA-002 | Login with Wrong Password
──────────────────────────────────────────────
Priority     : CRITICAL
Type         : Negative
Pre-condition: Operator login page.
Test Data    : root@shopro.internal / WrongPass@123

Steps:
  1. Enter credentials.
  2. Click "Login".

Expected Result: Login rejected; UI shows "Invalid credentials" error.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-GA-003 | Login with Unregistered Email
──────────────────────────────────────────────
Priority     : HIGH
Type         : Negative
Pre-condition: Operator login page.
Test Data    : notfound@shopro.internal / ShoproTest@2024!

Steps:
  1. Enter credentials.
  2. Click "Login".

Expected Result: System prevents access; shows "User not found" or generic error.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-GA-004 | Login with Empty Fields
──────────────────────────────────────────────
Priority     : LOW
Type         : Negative
Pre-condition: Operator login page.
Test Data    : N/A

Steps:
  1. Leave fields empty.
  2. Click "Login".

Expected Result: Submission blocked; HTML5 validation or UI prompts appear.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-GA-005 | Password Masking Toggle
──────────────────────────────────────────────
Priority     : MEDIUM
Type         : Positive
Pre-condition: Operator login page.
Test Data    : Any text.

Steps:
  1. Type into password field. Note it is masked (••••).
  2. Click the eye toggle icon.
  3. Verify text is visible.
  4. Click toggle again to mask.

Expected Result: Toggle correctly masks/reveals password text.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

---

## 2. MFA SETUP & VERIFICATION
Security verification for multi-factor authentication.

TC-GA-006 | SUPER_ADMIN First Login MFA Setup
──────────────────────────────────────────────
Priority     : CRITICAL
Type         : Positive / Security
Pre-condition: root@shopro.internal login for the first time.
Test Data    : root credentials.

Steps:
  1. Login with root@shopro.internal.
  2. Verify redirection to MFA Setup screen.
  3. Verify QR code is visible.

Expected Result: Redirection to MFA setup with scannable QR code.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-GA-007 | Backup Secret Key Toggle
──────────────────────────────────────────────
Priority     : HIGH
Type         : Positive
Pre-condition: MFA Setup screen.
Test Data    : N/A

Steps:
  1. Click "Can't scan?".
  2. Verify a text-based secret key appears.

Expected Result: Manual setup key revealed.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-GA-008 | Valid TOTP Completion
──────────────────────────────────────────────
Priority     : CRITICAL
Type         : Positive / Security
Pre-condition: MFA Setup screen; Authenticator app ready.
Test Data    : Current 6-digit code.

Steps:
  1. Enter valid code from app.
  2. Click "Verify".

Expected Result: Setup completes; user redirected to dashboard.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-GA-009 | Invalid TOTP Rejection
──────────────────────────────────────────────
Priority     : CRITICAL
Type         : Negative / Security
Pre-condition: MFA screen.
Test Data    : 000000

Steps:
  1. Enter 000000.
  2. Verify error message.

Expected Result: Access denied; error "Invalid code" shown.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-GA-010 | Role MFA Enforcement Check
──────────────────────────────────────────────
Priority     : HIGH
Type         : Positive / Security
Pre-condition: Login page.
Test Data    : ops@shopro.internal

Steps:
  1. Login as OPS_MANAGER.
  2. Verify NO MFA screen appears.

Expected Result: Redirection to dashboard without MFA.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

---

## 3. ROLE-BASED ACCESS CONTROL (RBAC)
Matrix-based verification of screen-level authorization.

TC-GA-011 | RBAC: User Management (/operator/users)
──────────────────────────────────────────────
Priority     : CRITICAL
Type         : Security
Pre-condition: Logged in as role to be tested.
Steps:
  1. Attempt to navigate to http://localhost:5173/operator/users as:
     a. OPS_MANAGER
     b. PROCUREMENT_OFFICER
     c. FINANCE_OFFICER
     d. SUPPLIER_RELATIONS
     e. SUPPORT_AGENT
     f. AUDITOR
  2. Verify access for SUPER_ADMIN.

Expected Result: Access DENIED (403 or redirect) for roles a-f. Access GRANTED for root.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-GA-012 | RBAC: Marketplace Config (/operator/marketplace-settings)
──────────────────────────────────────────────
Priority     : CRITICAL
Type         : Security
Pre-condition: Logged in as role to be tested.
Steps:
  1. Attempt access as:
     a. OPS_MANAGER, PROCUREMENT_OFFICER, FINANCE_OFFICER, SUPPLIER_RELATIONS, SUPPORT_AGENT, AUDITOR.

Expected Result: Access DENIED for all except SUPER_ADMIN.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-GA-013 | RBAC: Audit Trail (/operator/audit-trail)
──────────────────────────────────────────────
Priority     : HIGH
Type         : Security
Steps:
  1. Attempt access as:
     a. OPS_MANAGER, PROCUREMENT_OFFICER, FINANCE_OFFICER, SUPPLIER_RELATIONS, SUPPORT_AGENT.
  2. Verify access for:
     a. SUPER_ADMIN, AUDITOR.

Expected Result: Access DENIED for roles in step 1; GRANTED for step 2.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-GA-014 | RBAC: Payout Queue (/operator/payouts)
──────────────────────────────────────────────
Priority     : HIGH
Type         : Security
Steps:
  1. Attempt access as:
     a. OPS_MANAGER, PROCUREMENT_OFFICER, SUPPLIER_RELATIONS, SUPPORT_AGENT, AUDITOR.
  2. Verify access for:
     a. SUPER_ADMIN, FINANCE_OFFICER.

Expected Result: Access defined correctly by role.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-GA-015 | RBAC: PO Inbox (/operator/po/inbox)
──────────────────────────────────────────────
Priority     : MEDIUM
Type         : Security
Steps:
  1. Attempt access as:
     a. FINANCE_OFFICER, SUPPLIER_RELATIONS.
  2. Verify access for:
     a. SUPER_ADMIN, OPS_MANAGER, PROCUREMENT_OFFICER, SUPPORT_AGENT, AUDITOR.

Expected Result: Broad access for operations/procurement/support; restricted for others.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-GA-016 | RBAC: Supplier Vetting (/operator/suppliers/vetting)
──────────────────────────────────────────────
Priority     : HIGH
Type         : Security
Steps:
  1. Attempt access as:
     a. OPS_MANAGER, PROCUREMENT_OFFICER, FINANCE_OFFICER, SUPPORT_AGENT, AUDITOR.
  2. Verify access for:
     a. SUPER_ADMIN, SUPPLIER_RELATIONS.

Expected Result: Vetting limited to relations/admin.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-GA-017 | RBAC: Bid Creation (/operator/bids/new)
──────────────────────────────────────────────
Priority     : HIGH
Type         : Security
Steps:
  1. Attempt access as:
     a. FINANCE_OFFICER, SUPPLIER_RELATIONS, SUPPORT_AGENT, AUDITOR.
  2. Verify access for:
     a. SUPER_ADMIN, OPS_MANAGER, PROCUREMENT_OFFICER.

Expected Result: Sourcing restricted to procurement roles.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

---

## 4. USER PROVISIONING
TC-GA-018 | Provision User Positive Flow
──────────────────────────────────────────────
Priority     : CRITICAL
Type         : Positive
Pre-condition: Logged in as SUPER_ADMIN at /operator/users.
Test Data    : Name: QA Test | Email: qaprovision@test.com | Role: AUDITOR

Steps:
  1. Click "+ Provision User".
  2. Enter data.
  3. Click "Save".

Expected Result: User appears in table with status "Active".
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-GA-019 | Provision Duplicate Email
──────────────────────────────────────────────
Priority     : HIGH
Type         : Negative
Test Data    : Existing email (root@shopro.internal).

Expected Result: Error message "Email already in use" shown.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-GA-020 | Provision Role Assignment Change
──────────────────────────────────────────────
Priority     : MEDIUM
Type         : Positive
Pre-condition: Existing user found.
Test Data    : Changed role from AUDITOR to OPS_MANAGER.

Expected Result: Role update persists and reflects in table.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

---

## 5. USER DEACTIVATION & REACTIVATION
TC-GA-021 | Deactivate User
──────────────────────────────────────────────
Priority     : CRITICAL
Type         : Positive / Security
Pre-condition: Active user selected.
Steps:
  1. Click "Deactivate".
  2. Verify status change.
  3. Attempt login as target user.

Expected Result: Status is "Deactivated"; login is blocked with 401/403.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-GA-022 | Reactivate User
──────────────────────────────────────────────
Priority     : HIGH
Type         : Positive
Pre-condition: Deactivated user selected.
Steps:
  1. Click "Reactivate".
  2. Attempt login.

Expected Result: Status is "Active"; login works.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

---

## 6. FORCE PASSWORD RESET
TC-GA-023 | Force Reset Flow
──────────────────────────────────────────────
Priority     : HIGH
Type         : Security
Pre-condition: User is logged in or about to login.
Steps:
  1. Admin clicks "Force Password Reset" for user X.
  2. User X attempts login.

Expected Result: User X is forced into "Change Password" screen before accessing dashboard.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

---

## 7. SESSION MANAGEMENT
TC-GA-024 | Revoke All Sessions
──────────────────────────────────────────────
Priority     : CRITICAL
Type         : Security
Pre-condition: Target user has active browser tab.
Steps:
  1. Admin clicks "Revoke All Sessions" for user.
  2. Tester switches to target user's tab and clicks any link.

Expected Result: User redirected to login; current JWT is invalid.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

---

## 8. PASSWORD POLICY
TC-GA-025 | Length Policy (< 12)
──────────────────────────────────────────────
Priority     : HIGH
Type         : Boundary / Security
Test Data    : "Pass123!" (9 chars)

Expected Result: Error: "Minimum 12 characters required".
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-GA-026 | Complexity: Missing Uppercase
──────────────────────────────────────────────
Priority     : MEDIUM
Type         : Negative
Test Data    : "password123!"

Expected Result: Error: "Uppercase letter required".
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-GA-027 | Complexity: Missing Digit
──────────────────────────────────────────────
Priority     : MEDIUM
Type         : Negative
Test Data    : "Password!!!!"

Expected Result: Error: "Numeric digit required".
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-GA-028 | Complexity: Missing Special Char
──────────────────────────────────────────────
Priority     : MEDIUM
Type         : Negative
Test Data    : "Password123456"

Expected Result: Error: "Special character required".
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-GA-029 | Strict Password (Pass 12+ chars, mixed case, digit, symbol)
──────────────────────────────────────────────
Priority     : HIGH
Type         : Positive
Test Data    : "ShoproManualTest@2024!"

Expected Result: Password accepted.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

---

## 9. CROSS-PORTAL ACCESS PREVENTION
TC-GA-030 | Supplier JWT on Operator API
──────────────────────────────────────────────
Priority     : CRITICAL
Type         : Security
Pre-condition: Logged in on Supplier Portal.
Steps:
  1. Capture JWT from local storage.
  2. Use Postman/cURL to GET /api/v1/shopro/operator/users with Supplier token.

Expected Result: 403 Forbidden.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-GA-031 | Restaurant JWT on Operator API
──────────────────────────────────────────────
Priority     : CRITICAL
Type         : Security
Steps:
  1. Capture JWT from Restaurant session.
  2. Attempt GET /api/v1/shopro/operator/users.

Expected Result: 403 Forbidden.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-GA-032 | Operator JWT on Supplier API
──────────────────────────────────────────────
Priority     : CRITICAL
Type         : Security
Steps:
  1. Capture JWT from Operator session.
  2. Attempt GET /api/v1/shopro/supplier/finance.

Expected Result: 403 Forbidden.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

---

## 10. RATE LIMITING
TC-GA-033 | Brute Force Protection
──────────────────────────────────────────────
Priority     : CRITICAL
Type         : Security
Steps:
  1. Attempt login with wrong password 11 times in 1 minute.

Expected Result: 11th attempt returns 429 Too Many Requests.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

---

## 11. AUDIT LOG ENTRIES
TC-GA-034 | Audit: Auth Activities
──────────────────────────────────────────────
Priority     : HIGH
Type         : Positive
Steps:
  1. Navigate to /operator/audit-trail.
  2. Verify records for LOGIN_SUCCESS, LOGIN_FAILURE.

Expected Result: Records present with accurate timestamps/IPs.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-GA-035 | Audit: User Lifecycle
──────────────────────────────────────────────
Priority     : HIGH
Type         : Positive
Steps:
  1. Verify entries for USER_CREATED, USER_DEACTIVATED, ROLE_CHANGED.

Expected Result: Admin actions are logged with actor/target details.
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
