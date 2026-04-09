## PHASE 4 — FAPI Gateway

### 4.1 Generate gateway

Create `fapi-gateway/` with the full Fastify gateway (all files as defined in the
companion fapi-gateway project — `server.ts`, all `core/` validators, `middleware/`,
`routes/`, `spring/`, `store/`).

### 4.2 Populate `.env` — NO placeholders

```bash
# fapi-gateway/.env — generated from ProjectProfile
NODE_ENV=production
PORT={{profile.gatewayPort}}
HOST=0.0.0.0
LOG_LEVEL=info

AS_ISSUER={{profile.sso.issuerUrl}}
AS_JWKS_URI={{profile.sso.jwksUri}}
AS_PAR_ENDPOINT={{profile.sso.parEndpoint}}
AS_TOKEN_ENDPOINT={{profile.sso.tokenEndpoint}}
AS_AUTHORIZE_URI={{profile.sso.authorizeEndpoint}}

SPRING_BASE_URL={{profile.backend.apiBaseUrl}}
SPRING_INTERNAL_SECRET=$(openssl rand -hex 32)   # regenerated every run
INTERNAL_TOKEN_TTL_SEC=30
INTERNAL_TOKEN_ISSUER=fapi-gateway
INTERNAL_TOKEN_AUDIENCE={{profile.sso.clientId}}-api

REDIS_URL=redis://localhost:6379
JTI_REPLAY_TTL_SEC=300
PAR_TTL_SEC=90
PKCE_VERIFIER_TTL_SEC=600

DPOP_MAX_AGE_SEC=120
CLOCK_SKEW_SEC=5
BRUTE_FORCE_MAX=5
BRUTE_FORCE_BAN_SEC=900
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=10

ALLOWED_CLIENT_IDS={{profile.sso.clientId}}
ALLOWED_REDIRECT_URIS={{profile.sso.redirectUri}}
```

**Auth0-specific addition:**
If `sso.type === 'auth0'`, append to gateway `.env`:
```bash
# Auth0: audience required for JWT aud claim validation
EXPECTED_AUDIENCE={{profile.sso.audience}}
```

**Spring AS-specific addition:**
If `sso.type === 'spring-as'`, append:
```bash
# Spring AS: audience is the resource server identifier
EXPECTED_AUDIENCE={{profile.sso.clientId}}-api
```

### 4.3 SSO-specific PAR handling

Patch `src/core/par/par-handler.ts` based on SSO type:

**Auth0:**
```typescript
// Auth0 PAR: always include audience in PAR body
if (config.ssoType === 'auth0' && config.audience) {
  parParams.append('audience', config.audience);
}
// Auth0 PAR endpoint requires Basic Auth with client_id:client_secret
// OR private_key_jwt client assertion (FAPI Advanced)
// Flag: if no client_secret configured → warn user Auth0 PAR requires Enterprise
```

**Spring AS:**
```typescript
// Spring AS PAR: works with public clients (no secret needed for PAR)
// Ensure spring.security.oauth2.authorizationserver.endpoint.par-endpoint is enabled
// in Spring AS application.yml — add instruction to handover report
```

### PHASE 4 PASS CONDITIONS
- [ ] `fapi-gateway/.env` has zero `{{...}}` placeholders
- [ ] `cd fapi-gateway && npm install && npm run typecheck` exits 0
- [ ] `npm run build` exits 0
- [ ] `/health` endpoint returns `{"status":"ok"}` when started

---
