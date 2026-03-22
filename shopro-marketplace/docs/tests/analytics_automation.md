# Shopro Platform: Analytics & Automation — Manual Test Cases

This document outlines the manual test procedures for verifying marketplace revenue dashboards, AI-driven demand forecasting, and autonomous procurement controllers.

## 📊 Test Case Summary

| Total Cases | Critical | High | Medium | Low | Positive | Negative | Security |
|-------------|----------|------|--------|-----|----------|----------|----------|
| 48          | 15       | 18   | 12     | 3   | 34       | 10       | 4        |

---

## 1. REVENUE ANALYTICS
Platform-wide financial health and yield monitoring.

TC-AA-001 | Revenue Dashboard: GMV Data Accuracy
──────────────────────────────────────────────
Priority     : CRITICAL
Type         : Positive
Pre-condition: Transactions have occurred in the current billing cycle.
Steps:
  1. Navigate to /operator/analytics/revenue.
  2. Verify Total GMV matches the sum of settled orders in the same period.

Expected Result: GMV reflects real-market activity with <0.01% variance.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-AA-002 | Timeframe Filter Persistence
──────────────────────────────────────────────
Priority     : MEDIUM
Type         : Positive
Steps:
  1. Select "90d" timeframe.
  2. Refresh the browser.

Expected Result: Charts still display 90-day data; filter selection persists.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-AA-003 | Regional Performance Drill-down
──────────────────────────────────────────────
Priority     : HIGH
Type         : Positive
Steps:
  1. Locate "Dubai Marina" node in the regional matrix.
  2. Click the card to view detailed flux volume.

Expected Result: Displays regional-specific GMV and order counts.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

---

## 2. DEMAND FORECASTING (AI-DRIVE)
TC-AA-004 | Neural Calibration Trigger
──────────────────────────────────────────────
Priority     : HIGH
Type         : Positive
Steps:
  1. Navigate to /operator/analytics/forecasting.
  2. Click "Neural Calibration".
  3. Wait for the "Recalibrating..." state to complete.

Expected Result: Forecast charts update with fresh pattern data; "Last Calibrated" timestamp updates.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-AA-005 | Sector Risk Assessment: High vs Low
──────────────────────────────────────────────
Priority     : MEDIUM
Type         : Positive
Steps:
  1. Review categories (e.g. Fresh Produce vs Dry Goods).
  2. Verify "High Risk" is assigned to sectors with high volatility.

Expected Result: Risk classification correlates logically with historical fulfillment metrics.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

---

## 3. AUTO-PO ADMIN (CONTROLLER)
TC-AA-006 | Automation Rule: Status Toggle
──────────────────────────────────────────────
Priority     : CRITICAL
Type         : Positive
Steps:
  1. Navigate to /operator/automation/autopo.
  2. Toggle an "Active" rule to "Inactive".
  3. Verify status badge changes to RED.

Expected Result: Rule is disabled; no new POs will be triggered via this node.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-AA-007 | Event Stream Search by Trace ID
──────────────────────────────────────────────
Priority     : HIGH
Type         : Positive
Test Data    : Trace ID: "AUTO-NODE-881"

Steps:
  1. Enter Trace ID in the logs search bar.
  2. Press Enter.

Expected Result: List filters to show only the specific trigger event.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-AA-008 | Security: System Engine Reboot
──────────────────────────────────────────────
Priority     : HIGH
Type         : Security/Operational
Steps:
  1. Click "REBOOT ENGINE".
  2. Confirm in modal.

Expected Result: Automation services restart; health metrics temporarily grey out then return to green.
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
