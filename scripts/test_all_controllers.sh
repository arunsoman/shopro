#!/bin/bash

BASE_URL="http://localhost:8080/api"
RES_ID=1
DATE=$(date +%Y-%m-%d)

echo "===================================================="
echo "SHOPRO-RES ALL CONTROLLERS TEST REPORT"
echo "Generated at: $(date)"
echo "===================================================="

# Helper function to print results
test_endpoint() {
    local title=$1
    local method=$2
    local url=$3
    local data=$4

    echo -e "\n### $title"
    echo "URL: $url"
    echo "Method: $method"
    if [ ! -z "$data" ]; then
        echo "Input: $data"
        curl -s -X "$method" "$url" -H "Content-Type: application/json" -d "$data" | jq .
    else
        curl -s -X "$method" "$url" | jq .
    fi
}

echo -e "\n## 1. POS CONTROLLER"
test_endpoint "Get Tables" "GET" "$BASE_URL/pos/tables?restaurantId=$RES_ID"

echo -e "\n## 2. INVENTORY CONTROLLER"
test_endpoint "Get Ingredients" "GET" "$BASE_URL/inventory/ingredients?restaurantId=$RES_ID"
test_endpoint "Get Inventory Stats" "GET" "$BASE_URL/inventory/stats?restaurantId=$RES_ID"

echo -e "\n## 3. PURCHASING CONTROLLER"
test_endpoint "Get Suppliers" "GET" "$BASE_URL/purchasing/suppliers?restaurantId=$RES_ID"

echo -e "\n## 4. COSTING CONTROLLER"
test_endpoint "Get Recipes" "GET" "$BASE_URL/costing/recipes?restaurantId=$RES_ID"

echo -e "\n## 5. ANALYTICS CONTROLLER"
test_endpoint "Get Dashboard Metrics" "GET" "$BASE_URL/analytics/dashboard?restaurantId=$RES_ID"

echo -e "\n## 6. LABOR CONTROLLER"
test_endpoint "Create Employee" "POST" "$BASE_URL/labor/restaurants/$RES_ID/employees" '{"name":"Test User","employeeType":"HOURLY","hourlyRate":20.00}'
test_endpoint "Get Employees" "GET" "$BASE_URL/labor/restaurants/$RES_ID/employees"

echo -e "\n## 7. PRIME COST CONTROLLER"
test_endpoint "Get Live Prime Cost" "GET" "$BASE_URL/prime-cost/live/$RES_ID"
test_endpoint "Get Weekly Report" "GET" "$BASE_URL/prime-cost/weekly/$RES_ID?weekStart=$(date -d 'last sunday' +%Y-%m-%d)"

echo -e "\n===================================================="
echo "TEST COMPLETED"
echo "===================================================="
