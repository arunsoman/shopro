## PHASE 7 — Debug Loop

Run **before** smoke tests. For each known failure apply the fix then re-check.

### Failure Registry

#### F1 — JWKS fetch fails

```
SYMPTOM:  Gateway log: "JWKS fetch error" | "certificate verify failed" | "ENOTFOUND"
DIAGNOSE:
  curl -v "{{profile.sso.jwksUri}}"
  → 404:     issuerUrl wrong — Keycloak realm mismatch?  Auth0 domain trailing slash?
  → SSL err: NODE_EXTRA_CA_CERTS needed
  → timeout: network/firewall between gateway and AS

FIX (auto-apply):
  Auth0:     issuerUrl MUST be https://<domain>/  (trailing slash)
             → update AS_ISSUER in .env, restart
  Spring AS: verify server is running at issuerUrl
             → curl "{{profile.sso.issuerUrl}}/.well-known/openid-configuration"
  SSL:       echo "NODE_EXTRA_CA_CERTS=/path/to/ca.crt" >> fapi-gateway/.env
  Network:   if Docker — verify gateway + AS on same docker network
```

#### F2 — DPoP clock skew

```
SYMPTOM:  401 "DPoP proof age invalid" | "iat too far in past/future"
DIAGNOSE:
  Gateway log shows proof iat vs server now diff > CLOCK_SKEW_SEC
  date -u  ← compare server clock
  new Date().toISOString()  ← compare browser clock

FIX (auto-apply):
  Short term:  CLOCK_SKEW_SEC=30 in fapi-gateway/.env
  Long term:
    VPS:    timedatectl set-ntp true && systemctl restart systemd-timesyncd
    Docker: add ntpd sidecar or use host clock sync
  LOG WARNING: "Clock skew mitigation applied — configure NTP for production"
```

#### F3 — CORS mismatch

```
SYMPTOM:  Browser: "CORS policy: No 'Access-Control-Allow-Origin'"
DIAGNOSE:
  1. Check ALLOWED_REDIRECT_URIS includes exact frontend origin
  2. Check request Origin header vs gateway cors allowedOrigins
  3. Check Nginx not adding conflicting CORS headers

FIX (auto-apply):
  Re-derive origins: new URL(ALLOWED_REDIRECT_URIS).origin
  Update ALLOWED_REDIRECT_URIS in .env if missing scheme/port
  Remove any Nginx `add_header Access-Control-Allow-Origin` (gateway owns CORS)
  Restart gateway
```

#### F4 — Redis unavailable

```
SYMPTOM:  Gateway startup: "Redis ECONNREFUSED" | jti operations throw
DIAGNOSE:
  redis-cli -u "${REDIS_URL}" ping  → should return PONG

FIX (auto-apply):
  Docker:   verify redis service name matches REDIS_URL hostname
  VPS:      systemctl start redis && systemctl enable redis
  URL:      verify format redis://host:port  (no trailing slash)

FALLBACK (requires user acknowledgement):
  If Redis cannot be fixed — offer in-memory LRU jti store:
  WARN: "In-memory jti store does not survive restarts.
         This opens a replay window across process restarts.
         NOT recommended for production."
  → User must type "I ACCEPT" to proceed with fallback
```

#### F5 — Spring Boot rejects internal token

```
SYMPTOM:  Spring returns 401 {"error":"invalid_gateway_token"}
DIAGNOSE:
  1. Decode internal token payload (base64 middle part):
     echo "<token>" | cut -d. -f2 | base64 -d
  2. Check: iss === INTERNAL_TOKEN_ISSUER
  3. Check: aud === INTERNAL_TOKEN_AUDIENCE === fapi.gateway.audience in Spring yml
  4. Check: FAPI_INTERNAL_SECRET === SPRING_INTERNAL_SECRET (both must match)
  5. Check: token exp — was it issued > INTERNAL_TOKEN_TTL_SEC seconds ago?

FIX (auto-apply):
  Secret mismatch:    re-generate, update both fapi-gateway/.env
                      and Spring FAPI_INTERNAL_SECRET env var
  Audience mismatch:  align INTERNAL_TOKEN_AUDIENCE with fapi.gateway.audience
  TTL too low:        increase INTERNAL_TOKEN_TTL_SEC=60 (high-latency networks)
```

#### F6 — Auth0 PAR endpoint 404 / 403

```
SYMPTOM:  POST /par to Auth0 returns 404 or {"error":"access_denied"}
DIAGNOSE:
  curl -X POST "https://{{auth0domain}}/oauth/par" → 404 = PAR not enabled
  Auth0 PAR requires Enterprise plan.

FIX:
  IF Auth0 Enterprise available:
    → Enable PAR in Auth0 Dashboard: Applications → Advanced → PAR
  IF NOT Enterprise:
    WARN: "Auth0 PAR requires Enterprise plan. Without PAR, FAPI 2.0 Baseline
           cannot be achieved. Recorded as compliance gap."
    Offer degraded mode: skip PAR, use direct /authorize
    → Document gap in handover report compliance section
    → Frontend client.ts: set parEndpoint to null, skip PAR in login()
```

#### F7 — Spring AS PAR not enabled

```
SYMPTOM:  POST to Spring AS /oauth2/par returns 404
DIAGNOSE:
  Spring AS PAR must be explicitly enabled per client.

FIX (add to handover report — requires Spring AS admin):
  In Spring AS RegisteredClientRepository:
    .clientSettings(ClientSettings.builder()
        .requireProofKey(true)                       // PKCE required
        .requireAuthorizationConsent(false)
        .build())
  In Spring AS config:
    http.oauth2AuthorizationServer(as ->
        as.pushedAuthorizationRequestEndpoint(Customizer.withDefaults()));
  In Spring AS application.yml:
    spring.security.oauth2.authorizationserver.endpoint.par-endpoint.enabled=true
```

#### F8 — Angular: double-import of old auth module

```
SYMPTOM:  Angular build error: "Module X already imported"
          OR: "NullInjectorError: No provider for Auth0Client"
DIAGNOSE:
  grep -r "Auth0Module\|OAuthModule\|auth0\|angular-oauth2-oidc" src/

FIX (auto-apply):
  Re-scan imports, remove any remaining old auth module references
  Re-run Phase 1.4 import rewrite for newly found files
  Re-run Phase 1.3 to ensure old packages uninstalled
```

#### F9 — React: blank screen after login (callback handling timing)

```
SYMPTOM:  App renders blank after redirect from AS
DIAGNOSE:
  Check browser console for FapiError in handleCallback()
  Common cause: FapiProvider bootstraps before fragment params are available

FIX (auto-apply):
  Add explicit callback route in React Router:
    <Route path="/callback" element={<FapiCallbackHandler />} />

  Generate FapiCallbackHandler component:
    export function FapiCallbackHandler() {
      const { client } = useFapi();
      useEffect(() => {
        client?.handleCallback()
          .then(() => navigate('/'))
          .catch(() => navigate('/error'));
      }, []);
      return <div>Completing authentication...</div>;
    }
```

### Pre-flight checklist

Run all checks before proceeding to Phase 8:

```bash
#!/usr/bin/env bash
set -e
echo "── FAPI Pre-flight ─────────────────────────────"

# 1. Frontend builds
echo -n "  Frontend build... "
cd "${FRONTEND_ROOT}"
if [ "${FRAMEWORK}" = "angular" ]; then
  ng build --configuration=development --no-progress 2>&1 | tail -3
else
  npm run build 2>&1 | tail -3
fi
echo "OK"

# 2. Gateway typechecks + builds
echo -n "  Gateway typecheck... "
cd fapi-gateway && npm run typecheck 2>&1 | tail -3 && echo "OK"
echo -n "  Gateway build... "
npm run build 2>&1 | tail -3 && echo "OK"

# 3. Gateway starts and is healthy
echo -n "  Gateway health... "
node dist/server.js &
GW_PID=$!; sleep 3
curl -sf http://localhost:3100/health | grep -q '"status":"ok"' && echo "OK"
kill $GW_PID 2>/dev/null

# 4. Redis
echo -n "  Redis... "
redis-cli -u "${REDIS_URL}" ping | grep -q PONG && echo "OK"

# 5. JWKS endpoint
echo -n "  JWKS endpoint... "
curl -sf "${AS_JWKS_URI}" | python3 -c \
  "import sys,json; k=json.load(sys.stdin)['keys']; print(f'OK ({len(k)} keys)')"

# 6. PAR endpoint exists (expects 400/401 — not 404)
echo -n "  PAR endpoint... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${AS_PAR_ENDPOINT}")
[[ "$STATUS" == "400" || "$STATUS" == "401" ]] && echo "OK ($STATUS)" || \
  echo "WARN: PAR returned $STATUS — check F6/F7 debug entries"

# 7. Nginx config
echo -n "  Nginx config... "
nginx -t -c "$(pwd)/nginx/fapi-gateway.conf" 2>&1 | grep -q "ok" && echo "OK"

# 8. Spring Boot compiles
echo -n "  Spring Boot compile... "
cd "${SPRING_ROOT}"
if [ "${SPRING_BUILD_TOOL}" = "maven" ]; then
  mvn compile -q 2>&1 | tail -3
else
  ./gradlew compileJava -q 2>&1 | tail -3
fi
echo "OK"

echo "── Pre-flight complete ──────────────────────────"
```

---
