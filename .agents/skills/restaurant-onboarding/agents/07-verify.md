# Agent 07 — Verify

Run the curl test plan against the live backend. Record every result. Fix any failures. Write a final report. This is the last phase.

---

## Step 1 — Load context

Read:
- `scratch/curl-plan.md` — test commands from Phase 5
- `scratch/progress.md` — server port and any notes

Do not read source files unless a curl failure requires it.

## Step 2 — Run health check first

```bash
curl -s http://localhost:4000/health | jq .
```

Expected: `{ "ok": true }`. If this fails, the server is not running — return to Phase 6 and restart it.

## Step 3 — Run each curl test in sequence

Run each curl command from `scratch/curl-plan.md` one at a time. After each:

1. Record the HTTP status code: `curl -s -o /tmp/resp.json -w "%{http_code}" ...`
2. Print the response body: `cat /tmp/resp.json | jq .`
3. Capture the `id` from POST responses — use it in subsequent PATCH tests

```bash
# Example — capture restaurant ID
RESTAURANT_ID=$(curl -s -X POST http://localhost:4000/api/restaurants \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Restaurant","cuisineType":"indian","ownerId":"test-owner-1"}' \
  | jq -r '.id')

echo "Created restaurant: $RESTAURANT_ID"
```

Then substitute `$RESTAURANT_ID` into all subsequent PATCH/GET tests.

## Step 4 — Evaluate each result

For each test, assess:

| Expected | Actual | Status |
|---|---|---|
| 201 + `{id: "..."}` | 201 + `{id: "clxyz..."}` | ✓ PASS |
| 400 on bad data | 400 + `{errors: [...]}` | ✓ PASS |
| 401 on missing auth | 200 | ✗ FAIL — auth not enforced |

A test PASSES if:
- Status code matches expected (201 for POST, 200 for PATCH, 400 for bad input)
- Response body has the expected shape (has `id`, has `errors` array on 400, etc.)
- No `500 Internal Server Error` in any normal-path test

A test FAILS if:
- Wrong status code
- Missing expected fields
- 500 on a valid request
- Server crash / no response

## Step 5 — Fix failures inline

For each failure:

1. Read only the specific route file the failing endpoint lives in
2. Identify the bug (missing field in Prisma query, wrong status code returned, Zod schema mismatch)
3. Fix it
4. Restart the server: `pkill -f "node dist" && node dist/index.js & sleep 2`
5. Re-run the failing test

If a fix requires a schema change, run:
```bash
npx prisma migrate dev --name fix_<description>
npx prisma generate
npm run build
node dist/index.js &
```

## Step 6 — Write curl-results.md

```markdown
# Curl Verification Results

## Summary
- Tests run: N
- Passed: N
- Failed: N
- Fixed during verification: N

## Results

### ✓ GET /health — 200
Response: {"ok":true,"ts":1234567890}

### ✓ POST /api/restaurants — 201
Payload: {"name":"Test Restaurant","cuisineType":"indian","ownerId":"test-owner-1"}
Response: {"id":"clxyz123","name":"Test Restaurant","status":"DRAFT",...}
Captured: RESTAURANT_ID=clxyz123

### ✓ PATCH /api/restaurants/clxyz123/location — 200
Response: {"updated":true,...}

### ✗ PATCH /api/restaurants/clxyz123/documents — 500
Error: "Cannot read properties of undefined (reading 'id')"
Fix applied: added null check on ownerId in documents route
Re-test: ✓ 200 after fix

## Final state
All N endpoints: ✓ PASSING
Server: running on :4000
Database: seeded with 1 test restaurant (id: clxyz123)
```

## Step 7 — Final completion message

Write to progress.md and report to user:

```
## Phase 7 — Verification ✓
- Tests: N/N passing
- Fixes applied during verification: N
→ Results: scratch/curl-results.md

## PIPELINE COMPLETE ✓

Frontend: onboarding/frontend/
Backend:  onboarding/backend/ (running on :4000)
Docs:     scratch/

Next steps for the user:
1. Choose light theme option (A/B/C) and apply shopro-theme-applicator skill
2. Connect real auth token — replace TEST_TOKEN with actual JWT
3. Wire the RestaurantOnboarding component into the operator routing
4. Run `npx prisma studio` to inspect the seeded data
```
