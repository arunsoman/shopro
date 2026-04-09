#!/bin/bash

BASE_URL="http://localhost:8080/api"
RES_ID=1
DATE=$(date +%Y-%m-%d)
# Week start (current Sunday)
WEEK_START=$(date -d "last sunday" +%Y-%m-%d)

echo "===================================================="
echo "PRIME COST MODULE VERIFICATION REPORT"
echo "Generated at: $(date)"
echo "===================================================="

echo -e "\n1. TESTING LABOR CONTROLLER"
echo "----------------------------------------------------"

echo "Action: Listing Employees for Restaurant $RES_ID..."
curl -s "$BASE_URL/labor/restaurants/$RES_ID/employees" | jq . || echo "Failed to list employees"

echo -e "\nAction: Creating a Test Employee (Hourly)..."
curl -s -X POST "$BASE_URL/labor/restaurants/$RES_ID/employees" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "John Doe",
       "employeeType": "HOURLY",
       "hourlyRate": 15.50
     }' | jq .

echo -e "\nAction: Creating a Test Employee (Management)..."
curl -s -X POST "$BASE_URL/labor/restaurants/$RES_ID/employees" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Jane Smith",
       "employeeType": "MANAGEMENT",
       "annualSalary": 52000
     }' | jq .

echo -e "\nAction: Getting Weekly Labor Summary (Week Start: $WEEK_START)..."
curl -s "$BASE_URL/labor/restaurants/$RES_ID/weekly-summary?weekStart=$WEEK_START" | jq .

echo -e "\n2. TESTING PRIME COST CONTROLLER"
echo "----------------------------------------------------"

echo "Action: Getting Live Prime Cost..."
curl -s "$BASE_URL/prime-cost/live/$RES_ID" | jq .

echo -e "\nAction: Getting Weekly Prime Cost Report (DRAFT)..."
curl -s "$BASE_URL/prime-cost/weekly/$RES_ID?weekStart=$WEEK_START" | jq .

echo -e "\nAction: Computing Theoretical COS for today..."
curl -s "$BASE_URL/prime-cost/theoretical-cos/$RES_ID?from=$DATE&to=$DATE"

echo -e "\nAction: Finalising Weekly Report..."
curl -s -X POST "$BASE_URL/prime-cost/weekly/$RES_ID/finalise?weekStart=$WEEK_START" | jq .

echo -e "\n===================================================="
echo "VERIFICATION COMPLETE"
echo "===================================================="
