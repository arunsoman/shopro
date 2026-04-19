#!/usr/bin/env bash
# Validate a fix by hitting an endpoint and checking the response
# Usage: ./validate-fix.sh <endpoint> <method> "<json_body>" "<expected_status>"
# Example: ./validate-fix.sh /api/users/999/profile GET "" "404"

set -euo pipefail

ENDPOINT="${1:?Usage: validate-fix.sh <endpoint> <method> <body> <expected_status>}"
METHOD="${2:-GET}"
BODY="${3:-}"
EXPECTED_STATUS="${4:-200}"
BASE_URL="http://localhost:8080"

# Check if server is up
if ! curl -s -o /dev/null -w '' "http://localhost:8080/actuator/health" 2>/dev/null; then
    echo '{"status": "server_down", "message": "Server not responding on port 8080"}'
    exit 1
fi

# Build curl command
CURL_ARGS=(-s -w '\n{"http_status": %{http_code}, "time_seconds": %{time_total}}')

if [ -n "$BODY" ]; then
    CURL_ARGS+=(-X "$METHOD" -H "Content-Type: application/json" -d "$BODY")
else
    CURL_ARGS+=(-X "$METHOD")
fi

RESPONSE=$(curl "${CURL_ARGS[@]}" "${BASE_URL}${ENDPOINT}" 2>/dev/null) || true

# Extract HTTP status from the response
HTTP_STATUS=$(echo "$RESPONSE" | tail -1 | python3 -c "import sys,json; print(json.loads(sys.stdin.readline()).get('http_status','unknown'))" 2>/dev/null || echo "parse_error")

# Check result
if [ "$HTTP_STATUS" = "$EXPECTED_STATUS" ]; then
    RESULT="pass"
else
    RESULT="fail"
fi

echo "{
  \"endpoint\": \"${ENDPOINT}\",
  \"method\": \"${METHOD}\",
  \"expected_status\": \"${EXPECTED_STATUS}\",
  \"actual_status\": \"${HTTP_STATUS}\",
  \"result\": \"${RESULT}\",
  \"response_body\": $(echo "$RESPONSE" | head -n -1 | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()[:2000]))" 2>/dev/null || echo '"parse_error"')
}"