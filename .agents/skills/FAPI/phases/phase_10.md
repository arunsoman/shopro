## PHASE 9 — Handover Report

Generate `fapi-integration-report.md` populated from ProjectProfile + phase results:

```markdown
# FAPI Integration Report
**Generated:** {{timestamp}}
**Skill version:** 2.0.0

---

## System Profile
| Field | Value |
|---|---|
| Frontend | {{framework}} at {{rootDir}} |
| SSO | {{ssoType}} ({{issuerUrl}}) |
| Client ID | {{clientId}} |
| Backend | Spring Boot {{springSecurityMajor}}.x at {{apiBaseUrl}} |
| Deployment | {{deployment}} |
| Gateway port | {{gatewayPort}} |

## Architecture
```
Browser ({{framework}} + FapiClient)
  │  HTTPS · DPoP token + proof
  ▼
Nginx :443
  │  TLS termination · rate limiting · X-Fapi-* header stripping
  ▼
FAPI Gateway :{{gatewayPort}}  (Fastify / TypeScript)
  │  PAR resolution · JWT validation · DPoP proof · PKCE · JARM · brute-force
  │  Issues short-lived HS256 internal token (TTL 30s)
  ▼
Spring Boot :8080
  │  FapiGatewayFilter verifies internal token
  │  FapiAuditLogger writes structured JSON to logs/fapi-audit.log
  ▼
Database / Services
```

## Archived Files
{{list from _fapi_archive/}}

## Files Created
{{list of all generated files with paths}}

## FAPI 2.0 Compliance Status
- [x] PKCE S256 (RFC 7636) — plain method rejected
- [x] PAR (RFC 9126) — all auth requests via /par
- [x] DPoP (RFC 9449) — key-bound tokens, jti replay prevention
- [x] JARM — signed authorization responses
- [x] JWT validation — sig, iss, aud, exp, age ≤ 300s, cnf.jkt binding
- [x] Brute force protection — per-IP Redis counter
- [x] Header injection prevention — Nginx + middleware
- [x] Audit logging — structured JSON, rotated daily
- [ ] JAR (RFC 9101) — request objects (manual AS config required — see below)
- [ ] mTLS (RFC 8705) — cert provisioning (manual step — see below)
{{#if auth0-no-enterprise}}
- [ ] PAR (Auth0 PAR requires Enterprise plan — COMPLIANCE GAP)
{{/if}}

## Audit Headers on Every Spring Boot Request
| Header | Value |
|---|---|
| X-Fapi-Interaction-Id | UUID (per-request traceability) |
| X-Fapi-Subject | Verified user sub claim |
| X-Fapi-Client-Id | OAuth client_id |
| X-Fapi-Scope | Granted scopes |
| X-Fapi-Dpop-Verified | true / false |
| X-Fapi-Dpop-Key-Thumbprint | JWK thumbprint of DPoP key |
| X-Fapi-Internal-Token | HS256 internal JWT (Spring verifies) |

## Smoke Test Results
{{PASS}}/{{TOTAL}} passed

## Manual Steps Required
{{list from debug loop and compliance gaps}}

## Environment Variables to Set
| Variable | Where | Value |
|---|---|---|
| FAPI_INTERNAL_SECRET | Spring Boot env | Same value as gateway SPRING_INTERNAL_SECRET |
| {{other env vars}} | | |

## Next Steps
1. Set `FAPI_INTERNAL_SECRET` in Spring Boot deployment environment
2. Run smoke tests: `bash fapi-tests/smoke.sh`
3. Configure PAR on {{ssoType}} admin panel (see F6/F7 debug section)
4. Enable Logback rotation: already configured in logback-spring.xml
5. For JAR support: register request object signing key in {{ssoType}}
```

---

## Delivery Checklist (Claude must verify before responding "integration complete")

```
□  _fapi_archive/ exists and contains all replaced auth files
□  fapi-integration.log contains timestamps for every phase decision
□  src/lib/fapi/ — all 6 core files present, zero placeholders
□  Framework adapter generated (React OR Angular — not both unless monorepo)
□  fapi-gateway/.env — zero {{...}} placeholders
□  nginx/fapi-gateway.conf — zero {{...}} placeholders
□  Spring Boot: 5 Java files in correct package, zero placeholders
□  Pre-flight script exits 0 (or failures documented)
□  Smoke tests generated and executed (results in report)
□  fapi-integration-report.md generated
□  No file delivered with a {{...}} placeholder
□  No file references archived/removed packages
```